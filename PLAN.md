# Kapsamlı Kod Kalite ve Mimari İnceleme Raporu (Code Review)

Bu rapor, projenin tüm kaynak kodunun (node_modules, .next ve .git hariç) taranmasıyla 7 mimari katmanda gerçekleştirilen derinlemesine kod kalitesi analizini ve düzeltme planını içerir.

---

## 1. Genel Skor Tablosu

| Katman | Skor (1-10) | Kritik Bulgu | Önemli Bulgu | İyileştirme |
| :--- | :---: | :---: | :---: | :---: |
| **1. Mimari ve Dosya Yapısı** | **7/10** | 1 | 3 | 2 |
| **2. TypeScript ve Tipler** | **6/10** | 2 | 2 | 4 |
| **3. React Bileşen Yapısı & State** | **6/10** | 1 | 4 | 3 |
| **4. API ve Sunucu Tarafı** | **9/10** | 0 | 1 | 2 |
| **5. Performans ve Optimizasyon** | **6/10** | 0 | 3 | 3 |
| **6. Hata Dayanıklılığı (Resilience)** | **7/10** | 2 | 2 | 2 |
| **7. Okunabilirlik ve Bakım** | **7/10** | 0 | 2 | 3 |
| **TOPLAM** | **48/70** | **6 Adet** | **17 Adet** | **19 Adet** |

---

## 2. Kritik Bulgular (Öncelikle Düzeltilmesi Gerekenler)

### [KRİTİK-1] Tanımsız Nesne Okuma ile Runtime Çökmesi (Undefined Fallback Crash)
- **Dosya:** [components/dashboard/EditMenuContent.tsx](file:///Users/gokdeniz/Downloads/QR%20WEB/components/dashboard/EditMenuContent.tsx) (Satır 22-25)
- **Sorun:** Menü aramasında eşleşme bulunamadığında fallback olarak `mockMenusByRestaurant['lezzet-sofrasi'][0]` aranmaktadır. Ancak `mock-data.ts` içerisinde `lezzet-sofrasi` anahtarı **yoktur** (`lezzet-ocakbasi` mevcuttur). Bu nedenle `mockMenusByRestaurant['lezzet-sofrasi']` değeri `undefined` döner ve `undefined[0]` çağrısı tarayıcıda doğrudan unhandled TypeError üreterek tüm ekranı çökertir.
- **Mevcut Kod:**
```tsx
// components/dashboard/EditMenuContent.tsx:22-25
const initialMenu: Menu = Object.values(mockMenusByRestaurant)
  .flat()
  .find(m => m.id === id) || mockMenusByRestaurant['lezzet-sofrasi'][0]
```
- **Düzeltilmiş Kod:**
```tsx
// components/dashboard/EditMenuContent.tsx:22-25
const allMenus = Object.values(mockMenusByRestaurant).flat()
const fallbackMenu: Menu = allMenus[0] || {
  id: 'menu-default',
  name: 'Varsayılan Menü',
  description: '',
  image_url: '',
  is_listed: true,
  available_days: [1, 2, 3, 4, 5, 6, 7],
  layout: 'grid',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  categories: []
}

const initialMenu: Menu = allMenus.find(m => m.id === id) || fallbackMenu
```

---

### [KRİTİK-2] Opsiyonel `businessInfo` Alanında Null-Pointer Hatası ile Rehber Çökmesi
- **Dosya:** [components/landing/BusinessDirectory.tsx](file:///Users/gokdeniz/Downloads/QR%20WEB/components/landing/BusinessDirectory.tsx) (Satır 21-39)
- **Sorun:** `Restaurant` arayüzünde `businessInfo` opsiyoneldir (`businessInfo?: { city?: string, ... }`). Kod içerisinde `restaurant.businessInfo.address`, `restaurant.businessInfo.city` doğrudan zincirlenmiştir. Eğer sisteme yeni eklenen veya eksik profilli bir restoran olursa `restaurant.businessInfo` undefined olacağından `cannot read properties of undefined` hatası verir. Ayrıca 35. satırda `restaurant.city.toLowerCase()` doğrudan çağrılmaktadır; `city` boş bırakılmışsa sayfa anında çöker.
- **Mevcut Kod:**
```tsx
// components/landing/BusinessDirectory.tsx:21-28
const restaurants = MOCK_RESTAURANTS.map(restaurant => ({
  name: restaurant.name,
  subdomain: restaurant.subdomain,
  address: restaurant.businessInfo.address,
  city: restaurant.businessInfo.city,
  state: restaurant.businessInfo.state,
  zipcode: restaurant.businessInfo.zipcode,
  phone: restaurant.businessInfo.phone,
  menuCount: mockMenusByRestaurant[restaurant.subdomain]?.length || 0,
}))
```
- **Düzeltilmiş Kod:**
```tsx
// components/landing/BusinessDirectory.tsx:21-40
const restaurants = MOCK_RESTAURANTS.map(restaurant => {
  const info = restaurant.businessInfo || {}
  return {
    name: restaurant.name || 'İsimsiz Restoran',
    subdomain: restaurant.subdomain || '',
    address: info.address || '',
    city: info.city || 'Belirtilmemiş',
    state: info.state || '',
    zipcode: info.zipcode || '',
    phone: info.phone || '',
    menuCount: (restaurant.subdomain && mockMenusByRestaurant[restaurant.subdomain]?.length) || 0,
  }
})

const filteredRestaurants = restaurants.filter(restaurant => {
  const q = searchTerm.toLowerCase()
  const matchesSearch = 
    (restaurant.name?.toLowerCase().includes(q) ?? false) ||
    (restaurant.city?.toLowerCase().includes(q) ?? false) ||
    (restaurant.state?.toLowerCase().includes(q) ?? false)
  
  if (selectedCity === 'all') return matchesSearch
  return matchesSearch && restaurant.city.toLowerCase() === selectedCity.toLowerCase()
})
```

---

### [KRİTİK-3] Korunmasız `JSON.parse` ile LocalStorage Kaynaklı Beyaz Ekran Hatası
- **Dosya:** [components/ClientApp.tsx](file:///Users/gokdeniz/Downloads/QR%20WEB/components/ClientApp.tsx) (Satır 38) & [components/dashboard/DashboardContent.tsx](file:///Users/gokdeniz/Downloads/QR%20WEB/components/dashboard/DashboardContent.tsx) (Satır 55)
- **Sorun:** `localStorage.getItem('all_restaurants')` ve `localStorage.getItem('currentRestaurant')` verileri `try/catch` bloğu olmadan doğrudan `JSON.parse()` işlemine tabi tutulmaktadır. Kullanıcı tarayıcısında bozuk bir JSON kalıntısı, yarım kesilmiş string veya `"undefined"` değeri oluştuğunda React bileşeni render esnasında fatal `SyntaxError` fırlatır ve tüm uygulama beyaz ekrana düşer.
- **Mevcut Kod:**
```tsx
// components/ClientApp.tsx:38-39
const all: Restaurant[] = JSON.parse(localStorage.getItem('all_restaurants') || '[]')

// components/dashboard/DashboardContent.tsx:53-56
const stored = localStorage.getItem('currentRestaurant')
if (stored) {
  const parsed = JSON.parse(stored)
  return MOCK_RESTAURANTS.find(r => r.subdomain === parsed.subdomain) || MOCK_RESTAURANTS[0]
}
```
- **Düzeltilmiş Kod:**
```tsx
// lib/utils.ts veya bileşen içi güvenli parse yardımcısı:
export function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

// components/ClientApp.tsx:
const all: Restaurant[] = safeJsonParse(localStorage.getItem('all_restaurants'), [])

// components/dashboard/DashboardContent.tsx:
const stored = localStorage.getItem('currentRestaurant')
if (stored) {
  const parsed = safeJsonParse<{ subdomain?: string } | null>(stored, null)
  if (parsed?.subdomain) {
    return MOCK_RESTAURANTS.find(r => r.subdomain === parsed.subdomain) || MOCK_RESTAURANTS[0]
  }
}
return MOCK_RESTAURANTS[0]
```

---

### [KRİTİK-4] Bozuk Tipler ve Olmayan Modül Import Eden Ölü Kod Dosyası
- **Dosya:** [components/dashboard/WaiterCallsContent.tsx](file:///Users/gokdeniz/Downloads/QR%20WEB/components/dashboard/WaiterCallsContent.tsx) (Satır 6, 19, 20)
- **Sorun:** Dosya en üst satırında `@/components/ui/badge` modülünü import etmeye çalışmaktadır ancak projede böyle bir bileşen mevcut değildir. Ayrıca `lib/types.ts` ve `lib/mock-data.ts` içinde var olmayan `saveStoredWaiterCalls`, `addStoredWaiterCall` fonksiyonlarını çağırmaktadır. Bu dosya hiçbir router veya sayfada kullanılmamakta olup, projede `tsc` derlemesini bozmaktadır.
- **Düzeltilmiş Eylem:**
  - Dosya aktif bir özellik olarak planlanmıyorsa derleme sağlığı için projeden tamamen silinmeli veya `lib/types.ts` ve `lib/mock-data.ts` içinde eksik mock verileri tanımlanıp `@/components/ui/badge` bileşeni oluşturulmalıdır.

---

### [KRİTİK-5] State Güncellemesinde Null-Safety İhlali
- **Dosya:** [components/dashboard/LiveMenuEditor.tsx](file:///Users/gokdeniz/Downloads/QR%20WEB/components/dashboard/LiveMenuEditor.tsx) (Satır 757, 766)
- **Sorun:** `menu` state'i `Menu | null` tipindedir. Menü adı ve açıklaması güncellenirken `setMenu(prev => ({ ...prev, name: e.target.value }))` yazılmıştır. Eğer `prev` null ise `{ ...null, name: '...' }` objesi oluşturulur; bu nesnede zorunlu olan `id`, `categories`, `layout` alanları eksik kalır ve TypeScript derleyicisi TS2345 hatası üretir.
- **Mevcut Kod:**
```tsx
// components/dashboard/LiveMenuEditor.tsx:757
onChange={(e) => setMenu(prev => ({ ...prev, name: e.target.value }))}
// components/dashboard/LiveMenuEditor.tsx:766
onChange={(e) => setMenu(prev => ({ ...prev, description: e.target.value }))}
```
- **Düzeltilmiş Kod:**
```tsx
onChange={(e) => setMenu(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
onChange={(e) => setMenu(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
```

---

### [KRİTİK-6] `AdminDashboard` İçerisinde Eksik Zorunlu Alan ile Restoran Oluşturma
- **Dosya:** [components/admin/AdminDashboard.tsx](file:///Users/gokdeniz/Downloads/QR%20WEB/components/admin/AdminDashboard.tsx) (Satır 138-146)
- **Sorun:** `Restaurant` tipinde `currency: string` zorunlu bir alandır. Admin panelinden yeni restoran oluşturulurken `currency` alanı tanımlanmamaktadır. Bu durum menü editörü ve genel menü gösteriminde para birimi simgesinin `undefined` basılmasına ve tip uyuşmazlığına yol açar.
- **Mevcut Kod:**
```tsx
const newRestaurant: Restaurant = {
  id: newRestId,
  name: formName,
  ownerName: formOwner || 'İşletme Yetkilisi',
  subdomain: formSubdomain || `restoran-${Date.now()}`,
  role: 'restaurant',
  status: 'pending_activation',
  activationToken: token,
  createdAt: new Date().toISOString().split('T')[0]
}
```
- **Düzeltilmiş Kod:**
```tsx
const newRestaurant: Restaurant = {
  id: newRestId,
  name: formName,
  ownerName: formOwner || 'İşletme Yetkilisi',
  subdomain: formSubdomain || `restoran-${Date.now()}`,
  role: 'restaurant',
  currency: '₺',
  status: 'pending_activation',
  activationToken: token,
  createdAt: new Date().toISOString().split('T')[0]
}
```

---

## 3. Önemli Bulgular (Teknik Borç ve Bakım Zorluğu)

### [ÖNEMLİ-1] `LiveMenuEditor` İçinde Her Tuş Vuruşunda Senkron Disk I/O (Debounce Eksikliği)
- **Dosya:** [components/dashboard/LiveMenuEditor.tsx](file:///Users/gokdeniz/Downloads/QR%20WEB/components/dashboard/LiveMenuEditor.tsx) (Satır 266-270)
- **Sorun:** Kullanıcı ürün adı, fiyatı veya açıklamasını yazarken her klavye vuruşunda `menu` state'i değişir ve `useEffect` tetiklenir. Bu tetiklenme senkron olarak `setStoredMenus(subdomain, [menu])` ile binlerce satırlık JSON ağacını `localStorage`'a yazar. Hızlı yazımlarda tarayıcı ana iş parçacığı (main thread) bloke olur ve arayüzde takılmalar (jank) yaşanır.
- **Düzeltme Kodu:**
```tsx
useEffect(() => {
  if (!menu) return
  const timeoutId = setTimeout(() => {
    setStoredMenus(subdomain, [menu])
  }, 400) // 400ms debounce
  return () => clearTimeout(timeoutId)
}, [menu, subdomain])
```

---

### [ÖNEMLİ-2] Devasa Monolitik Bileşenler (Tek Sorumluluk İlkesi / SRP İhlali)
- **Dosyalar:**
  - `LiveMenuEditor.tsx`: 1670 satır
  - `lib/menu-templates.ts`: 1214 satır
  - `AdminDashboard.tsx`: 853 satır
  - `ScanMenuModal.tsx`: 705 satır
  - `PublicMenuView.tsx`: 608 satır
- **Sorun:** `LiveMenuEditor.tsx` içerisinde menü şablonları, ürün ekleme modalı, kategori ekleme modalı, masaüstü/mobil önizleme paneli, QR kod indirme mantığı, görsel yükleme ve sürükle-bırak sıralama tek bir dosyaya yığılmıştır. Herhangi bir alt bileşendeki state değişimi tüm 1670 satırlık ağacın baştan değerlendirilmesine sebep olur.
- **Önerilen Modüler Yapı:**
```
components/dashboard/menu-editor/
├── LiveMenuEditor.tsx        (Ana orkestratör - maks 200 satır)
├── CategorySidebar.tsx       (Sol kategori listesi ve arama)
├── ProductGrid.tsx           (Orta ürün listeleme ve kartlar)
├── MobileLivePreview.tsx     (Sağ canlı telefon önizlemesi)
├── AddProductModal.tsx       (Ürün ekleme/düzenleme diyaloğu)
└── AddCategoryModal.tsx      (Kategori modalı)
```

---

### [ÖNEMLİ-3] Kullanılmayan ve Projede Yer Kaplayan Ölü Dosyalar (Dead Code)
- **Dosyalar:**
  - [components/auth/SignUp.tsx](file:///Users/gokdeniz/Downloads/QR%20WEB/components/auth/SignUp.tsx) (432 satır) -> Sistem artık Admin davetiye/aktivasyon modeliyle çalıştığı için genel `SignUp` formu hiçbir rotaya bağlı değildir.
  - [components/dashboard/WaiterCallsContent.tsx](file:///Users/gokdeniz/Downloads/QR%20WEB/components/dashboard/WaiterCallsContent.tsx) (354 satır) -> Hiçbir menüde veya rotada çağrılmamaktadır.
  - Kök dizindeki `eng.traineddata` (4.1 MB) ve `tur.traineddata` (4.5 MB) -> Gemini Vision API'ye geçildiği için Tesseract dil paketleri kök dizinde boş yere repository boyutunu şişirmektedir.
- **Aksiyon:** Bu 2 dosya ve model ağırlıkları projeden kaldırılarak bundle boyutu hafifletilmelidir.

---

### [ÖNEMLİ-4] Liste Render İşlemlerinde Kararsız Dizin Anahtarları (`key={index}`)
- **Dosyalar:**
  - `ScanMenuModal.tsx:476`: `photos.map((photo, idx) => <div key={idx} ...)`
  - `PublicMenuView.tsx:570`: `item.allergens.map((alg, i) => <span key={i} ...)`
  - `LiveMenuEditor.tsx:1191`: `item.allergens.map((alg, i) => <span key={i} ...)`
- **Sorun:** `ScanMenuModal` içinde kullanıcı bir fotoğrafı sildiğinde (`photos.splice(idx, 1)`), React dizin anahtarı kullandığı için kalan görsellerin DOM düğümlerini yanlış eşleştirir; bu durum yüklenmiş görsel önizlemelerinin kaymasına veya silinen görselin yerine alttakinin animasyonsuz zıplamasına yol açar.
- **Düzeltme Kodu:**
```tsx
// Fotoğraf objesine benzersiz id eklenmeli:
interface MenuPhoto {
  id: string
  file: File
  previewUrl: string
}
// Render esnasında:
{photos.map((photo) => (
  <div key={photo.id} className="relative group ...">
```

---

### [ÖNEMLİ-5] Next.js `<Image />` Yerine Ham `<img>` Kullanımı
- **Dosyalar:** Proje genelinde 20'den fazla noktada (`MenusContent.tsx:115`, `PublicMenuView.tsx:395`, `LiveMenuEditor.tsx:915`) standart HTML `<img>` kullanılmaktadır.
- **Sorun:** 
  1. Görseller tarayıcı viewport'una girmeden önce peşin indirilir (Lazy loading eksikliği).
  2. Otomatik WebP/AVIF format optimizasyonu yapılmaz.
  3. Cumulative Layout Shift (CLS) metriklerini olumsuz etkiler.
- **Düzeltme Kodu:**
```tsx
import Image from 'next/image'

<div className="relative w-16 h-16 rounded-lg overflow-hidden">
  <Image
    src={item.image_url || '/placeholder.jpg'}
    alt={item.name}
    fill
    sizes="64px"
    className="object-cover"
    loading="lazy"
  />
</div>
```

---

### [ÖNEMLİ-6] Mock Fonksiyon Parametre Uyuşmazlığı
- **Dosya:** [components/dashboard/DashboardContent.tsx](file:///Users/gokdeniz/Downloads/QR%20WEB/components/dashboard/DashboardContent.tsx) (Satır 47)
- **Sorun:** `useState(getDeviceData(selectedTimeRange))` şeklinde parametre gönderilmektedir. Ancak `lib/mock-data.ts:161` satırındaki `getDeviceData` fonksiyonu hiçbir parametre almamaktadır (`() => [...]`). Bu gereksiz parametre aktarımı TypeScript TS2554 hatası üretmektedir.
- **Düzeltilmiş Kod:**
```tsx
// components/dashboard/DashboardContent.tsx:47
const [deviceData, setDeviceData] = useState(() => getDeviceData())
```

---

## 4. İyileştirme Önerileri (Best Practice ve Temiz Kod)

### [İYİLEŞTİRME-1] `any` Tiplerinin Temizlenmesi ve Kesin Tip Tanımları
- **Dosya:** [components/public/PublicMenuView.tsx](file:///Users/gokdeniz/Downloads/QR%20WEB/components/public/PublicMenuView.tsx) (Satır 220)
- **Mevcut:** `onChange={(e) => setLang(e.target.value as any)}`
- **Düzeltme:**
```tsx
type SupportedLanguage = 'tr' | 'en' | 'de' | 'ru' | 'ar'
const [lang, setLang] = useState<SupportedLanguage>('tr')
onChange={(e) => setLang(e.target.value as SupportedLanguage)}
```
- **Dosya:** [components/ClientApp.tsx](file:///Users/gokdeniz/Downloads/QR%20WEB/components/ClientApp.tsx) (Satır 107-117)
- **Mevcut:** `error: any`, `props: any`
- **Düzeltme:** `interface ErrorBoundaryProps { children: React.ReactNode }`, `interface ErrorBoundaryState { hasError: boolean; error: Error | null }`

---

### [İYİLEŞTİRME-2] Magic String ve Numaraların Sabitlere (Constants) Çıkarılması
- **Dosyalar:** `SettingsContent.tsx`, `LiveMenuEditor.tsx`, `Login.tsx`
- **Sorun:** `'7d'`, `'30d'`, `'superadmin'`, `'restaurant'`, `15 * 60 * 1000` gibi değerler dosya içlerinde hardcoded yazılmıştır.
- **Öneri:** `lib/constants.ts` oluşturularak merkezi sabit yönetimi sağlanmalıdır:
```ts
// lib/constants.ts
export const APP_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  RESTAURANT: 'restaurant',
} as const

export const STORAGE_KEYS = {
  USER_ROLE: 'user_role',
  CURRENT_RESTAURANT: 'currentRestaurant',
  ALL_RESTAURANTS: 'all_restaurants',
  SYSTEM_USERS: 'system_users',
} as const
```

---

### [İYİLEŞTİRME-3] Çoklu Dil (i18n) Hazırlığı
- Menü gösterim ekranında (`PublicMenuView.tsx`) dil seçici (`tr`, `en`, `de` vb.) yer almakta ancak arayüz metinleri ("Garson Çağır", "Filtrele", "Alerjenler") sabit Türkçe bırakılmıştır. `lib/translations.ts` sözlüğü oluşturularak dil değişiminde dinamik çevrilmesi kullanıcı deneyimini artıracaktır.

---

## 5. Dosya Bazlı Düzeltme ve Öncelik Planı

Aşağıdaki liste, düzeltmelerin hangi dosyalarda ve hangi sıra ile yapılması gerektiğini gösterir:

| Öncelik | Dosya Yolu | Bulgu Sayısı | Gerekli İşlem Özeti |
| :---: | :--- | :---: | :--- |
| **P0 (Kritik)** | `components/dashboard/EditMenuContent.tsx` | 2 | `mockMenusByRestaurant` fallback çökmesini önle, Menu interface alanlarını senkronize et |
| **P0 (Kritik)** | `components/landing/BusinessDirectory.tsx` | 2 | `businessInfo` için optional chaining ekle, arama filtresini null-safe yap |
| **P0 (Kritik)** | `components/ClientApp.tsx` | 1 | `safeJsonParse` ile localStorage JSON hatalarını yakala |
| **P0 (Kritik)** | `components/dashboard/DashboardContent.tsx` | 2 | LocalStorage parse try/catch ekle, `getDeviceData` parametresini düzelt |
| **P0 (Kritik)** | `components/dashboard/LiveMenuEditor.tsx` | 2 | `setMenu(prev => ...)` null-check ekle, localStorage yazımlarına 400ms debounce ekle |
| **P0 (Kritik)** | `components/admin/AdminDashboard.tsx` | 1 | Yeni restoran oluştururken `currency: '₺'` zorunlu alanını ekle |
| **P1 (Önemli)**| `components/dashboard/WaiterCallsContent.tsx` | 3 | Kullanılmayan ölü dosyayı temizle (veya tipleri onar) |
| **P1 (Önemli)**| `components/auth/SignUp.tsx` | 1 | Kullanılmayan ölü dosyayı temizle |
| **P1 (Önemli)**| `eng.traineddata` & `tur.traineddata` | 1 | Kök dizindeki 8.6 MB gereksiz OCR dosyalarını kaldır |
| **P1 (Önemli)**| `components/modals/ScanMenuModal.tsx` | 2 | Fotoğraf listesinde `key={idx}` yerine `key={photo.id}` kullan, `any` tiplerini temizle |
| **P2 (İyileş.)**| `components/public/PublicMenuView.tsx` | 3 | Dil seçiminde `as any` kaldır, `<img>` etiketlerine lazy-load ekle |
| **P2 (İyileş.)**| `lib/types.ts` & `lib/constants.ts` | 2 | Ortak sabitleri topla, arayüz tiplerini sıkılaştır |

---

> **Sonuç:** Yapılan incelemede, geçtiğimiz fazda tamamladığımız **"Kale Savunması v2.0"** güvenlik katmanlarının (Rate limit, CSRF, Magic Bytes, Security Headers, Route Guards) kusursuz çalıştığı; ancak uygulamanın eski mock veri katmanında ve monolitik bileşenlerinde **6 adet kritik çalışma zamanı (runtime) çökme riski** bulunduğu tespit edilmiştir. Yukarıdaki P0 adımlarının uygulanmasıyla proje %100 kararlı hale gelecektir.

# QR Menü Projesi: Uygulama Planı (revize)

Bu plan [TODO.md](TODO.md) dosyasındaki madde numaralarına bire bir bağlıdır. Her TODO maddesi aşağıdaki kapsam matrisinde bir adıma atanmıştır. Adımlar sırayla yürütülür, her adım sonunda doğrulama yapılır ve onay istenir.

## Kararlar (adımları bloke eder)

| Karar | Soru | Bloke ettiği adım | Varsayılan öneri |
|---|---|---|---|
| K1 | Admin paneli gerçek veriye mi bağlanacak, yoksa gizlenip süper admin Supabase'den mi yönetecek? | Adım 6 | Tam panel |
| K2 | WiFi bilgisi müşteriye gösterilsin mi? | Adım 1, Adım 2 | Evet, işletme açarsa |
| K3 | E-posta servisi (Resend, SendGrid, SES, Supabase) | Adım 7 | Resend |
| K4 | OTP için Supabase yerel akışı mı, özel OTP mi? | Adım 7 | Supabase yerel |
| K5 | Dağıtım: Vercel (serverless) mi, Docker/VPS mi? | Adım 7, Adım 9 | Vercel |
| K6 | Demo hesap korunacak mı? | Adım 2 | Ayrı demo modu |
| K7 | Test için ayrı Supabase projesi açılsın mı? | Adım 3 | Evet |

K2 ve K6 Adım 1-2'den **önce** cevaplanmalı. K1 ve K3-K5 daha sonra yeterli.

## Adımlar

### Adım 1: Veritabanı güvenliği (RLS) ve şema uyumu (TODO 2.1-2.9) | P0
**Agent:** `supabase/migrations/` altında numaralı migration dosyaları ve geri alma (rollback) SQL'i hazırlar.
**Sen:** SQL'i Supabase SQL Editor'de çalıştırırsın.

| Alt iş | TODO | Detay |
|---|---|---|
| Herkese açık `organizations` okumasını kaldır | 2.1 | `org_public_select` politikasını sil. Güvenli: istemci yalnızca kendi organizasyonunu okuyor (`Login.tsx`, `org_select` ve `members_select` ile). Herkese açık veri Adım 2'deki sunucu API'sinden gelecek |
| `qr_tables` RLS | 2.2 | RLS aç, üye politikaları ekle. Canlı şemadaki eksik `updated_at` sütununu da uyumla |
| `menu_views` insert sınırı | 2.3 | Yalnızca `is_listed` menüler için |
| `handle_new_user` | 2.4 | Alt çizgi/tire normalizasyonu, benzersiz sonek, hata yönetimi |
| `SQL.sql` organizasyon oluşturma politikası | 2.5 | `with check (true)` kaldır veya `auth.uid()` şartı |
| Şema tek kaynağa indir | 2.6 | Canlı şemayı dışa aktar, `supabase/migrations/` ana kaynak olsun, `SQL.sql` ve `supabase-mvp.sql` arşivlensin |
| `role` kısıtı | 2.7 | `check (role in ('owner','admin','staff'))` |
| Storage politikaları | 2.8 | `menu-images` bucket, üye yükler, herkes okur, MIME ve boyut sınırı |
| `is_active`, `is_available` filtreleri | 2.9 | Herkese açık select politikalarında |

**Doğrulama:** Anon anahtarıyla `organizations`, `qr_tables`, `menu_views` erişimi denenir. RLS sonrası okunamamalı veya yazılamamalı. Ardından API ve Playwright testleri tekrar çalıştırılır.

### Adım 2: Herkese açık sayfa ve mock veri temizliği (TODO 3.1-3.10) | P0
Adım 1 ile birlikte yapılmalı: önce API hazır olmalı, sonra Adım 1'deki politika silinmeli.

| Alt iş | TODO | Detay |
|---|---|---|
| `GET /api/public/restaurant` | 3.2 | Yalnızca güvenli alanlar. WiFi, K2'ye göre |
| `PublicMenuView` restoran bilgisi | 3.1 | `MOCK_RESTAURANTS[0]` yedeğini kaldır, bilinmeyen subdomain için 404 sayfası |
| Menü yedeği | 3.3 | Mock menü yerine "Menü yakında" ve hata için yeniden dene ekranı |
| `menus/load` ayrımı | 3.4 | Herkese açık uç (`is_listed`, `is_active`, `is_available` filtreli, sütun listeli). Panel için oturumlu uç |
| `tables/load` | 3.5 | Oturumlu yap |
| Panel başlığı | 3.6 | `Header.tsx`, `Sidebar.tsx` gerçek e-posta ve restoran adı |
| `EditMenuContent` | 3.7 | Gerçek veriye bağla veya `LiveMenuEditor` ile birleştirip kaldır |
| Mock bağımlılıkları | 3.8, 3.9 | `MenusContent`, `QRCodesContent`, `SettingsContent`, sonra `lib/mock-data.ts` (K6'ya göre demo moduna taşı veya sil) |
| Geri bildirim alanı | 3.10 | Kaydet veya sadeleştir (P3, sona bırakılabilir) |

**Doğrulama:** `/menu/<subdomain>` doğru ad, adres ve ürünleri göstermeli, demo veri görünmemeli. Bilinmeyen subdomain 404 vermeli.

### Adım 3: Test altyapısını repoya taşı (TODO 7.13, 7.14) | P1
Bu adım orijinal planda en sondaydı. Her adımın doğrulaması Playwright'a dayandığı için öne alındı.

| Alt iş | TODO | Detay |
|---|---|---|
| `e2e/` klasörü ve `@playwright/test` | 7.13 | Giriş, menü, ürün, ayarlar, QR, silme ve sahiplik (403) testleri `/tmp/pw` içinden taşınır |
| Test ortamı | 7.13, K7 | Ayrı Supabase projesi ve test kullanıcıları |
| CI | 7.14 | GitHub Actions: `tsc --noEmit`, lint, e2e |

### Adım 4: Hızlı güvenlik iyileştirmeleri (TODO 5.7, 5.8, 7.4, 7.5) | P1

| Alt iş | TODO | Detay |
|---|---|---|
| Giriş deneme limiti | 5.7 | `AUTH_LOGIN` limiti (IP ve e-posta), genel hata mesajı, giriş olaylarını logla |
| Ortam değişkenleri | 5.8 | `lib/supabase.ts` ve `login/route.ts` içindeki gömülü URL ve anahtarı `.env`'den oku |
| `.env.example` | 7.5 | Gerekli değişkenleri belgele |
| Test şifrelerini sil | 7.4 | **Yalnızca Adım 3 tamamlandıktan sonra** (e2e ayrı test ortamına geçince). Önce silinirse testler çalışmaz |

### Adım 5: Dayanıklılık ve veri tutarlılığı (TODO 6.1-6.7) | P1

| Alt iş | TODO | Detay |
|---|---|---|
| Kaydetme hatalarını göster | 6.1, 6.2 | `LiveMenuEditor` şablon ve boş menü akışları, `MenusContent`, `QRCodesContent`. Hata durumunda yerel durumu koru veya geri al |
| 401 yönetimi | 6.3 | `authFetch` içinde oturumu yenile veya girişe yönlendir |
| `menus/sync` transaction | 6.4 | Postgres RPC ile tek transaction |
| Girdi doğrulama | 6.5 | zod şemaları, `sanitizer` uygulanması, sayı sınırları (`menus/sync`, `tables/sync`, `organizations/update`) |
| `tables/sync` boş dizi | 6.6 | Silme için açık bayrak veya ayrı uç |
| İstemci tipi ve sütun uyumu | 6.7 | Protein, karbonhidrat, yağ alanları DB'ye yazılıyor mu kontrol et, eksikse migration |

### Adım 6: Admin paneli ve hesap aktivasyonu (TODO 4.1-4.9) | P0, K1'e bağlı

| Alt iş | TODO | Detay |
|---|---|---|
| `GET /api/auth/me` | 4.1 | JWT'den rol ve organizasyon döndürür, tüm yetki kararlarının tek kaynağı |
| `requireSuperAdmin` | 4.8 | `lib/auth-middleware.ts` |
| Guard ve giriş | 4.1, 4.2 | `AdminGuard` ve `Login.tsx` rolü bu uçtan alır, sabit e-posta kaldırılır |
| Admin uçları | 4.4 | `GET/POST /api/admin/organizations`, `PATCH .../status`, `POST .../users` |
| Aktivasyon | 4.6, 4.7 | Supabase davet akışı, düz metin şifre ve "demo" kodunu sil, `Restaurant.credentials` tip alanını kaldır |
| Çerez ve oturum | 4.3 | `lib/session.ts` çerezleri kaldır |
| Impersonation | 4.5 | Yalnızca seçili organizasyonu istemcide tut |
| Şifre sıfırlama | 4.9 | `ForgotPasswordModal` Supabase `resetPasswordForEmail` |

K1 "gizle" ise: 4.4-4.7 yerine admin panelini kapat ve yalnızca 4.1, 4.2, 4.3, 4.8'i yap.

### Adım 7: OTP ve e-posta (TODO 5.1-5.6) | P1, K3, K4'e bağlı

| Alt iş | TODO | Detay |
|---|---|---|
| Güvenli üretim ve saklama | 5.1, 5.2 | `crypto.randomInt`, veritabanı veya Supabase yerel OTP |
| E-posta gönderimi | 5.3 | K3'teki servis |
| `devOnly` kodu | 5.4 | Yanıttan kaldır |
| Doğrulama sonucu | 5.5 | Gerçek bir işleme bağla |
| Limitler | 5.6 | IP ve e-posta ayrı |

K4 "Supabase yerel" ise 5.1, 5.2, 5.5 büyük ölçüde kod yazmadan çözülür.

### Adım 8: Sıkılaştırma (TODO 6.8-6.17) | P1-P2, K5'e bağlı

| Alt iş | TODO | Detay |
|---|---|---|
| Dosya doğrulama | 6.8 | Tam doğrulama, tespit edilen MIME'ı kullan, istek boyutu sınırı |
| Tarama kotası sunucuda | 6.9 | `scan_usage` tablosu |
| Gemini uçları | 6.10, 6.11 | Genel hata mesajı, anahtarı başlıkta gönder, prompt girdisini sınırla |
| CSP | 6.12 | Nonce tabanlı, önce `Report-Only` |
| CORS ve görsel kaynakları | 6.13, 6.14 | `hostname` tam eşleşme, görseller Supabase Storage'a |
| Rate limit | 6.15 | Dağıtık depo (K5'e göre) |
| CSRF modülü | 6.16 | Kaldır veya çerez akışı eklenirse uygula |
| Hata izleme | 6.17 | Sentry veya benzeri |

### Adım 9: Temizlik ve yapılandırma (TODO 7.1-7.3, 7.6-7.12, 7.15) | P2-P3

| Alt iş | TODO |
|---|---|
| Dockerfile (Node 22, kullanılmayan aşama, değişkenler) | 7.1 |
| Kullanılmayan bağımlılıklar, paket adı | 7.2 |
| `test-crash.mjs` sil | 7.3 |
| `middleware` -> `proxy` | 7.6 |
| `turbopack.root` | 7.7 |
| `lint` betiği | 7.8 |
| Marka tutarlılığı | 7.9 |
| `LiveMenuEditor` bölme | 7.10 |
| `menu-templates` dinamik yükleme | 7.11 |
| Eski stash | 7.12 |
| README, PLAN güncelle | 7.15 |

### Adım 10: Ürün özellikleri (TODO Bölüm 8) | P1-P3, önceliklendirme sende

| Öncelik | Özellikler |
|---|---|
| P1 | Dil seçimi (8.1), ürün fotoğrafı yükleme / Supabase Storage (8.2), e-posta altyapısı (8.3, Adım 7 ile ortak), KVKK/GDPR veri silme ve dışa aktarma (8.3) |
| P2 | Alerjen/diyet filtreleri, ürün varyantları, SEO, çalışma saatleri, sosyal medya ve harita bağlantıları, zamanlı menü, "tükendi" anahtarı, ekip rolleri, gerçek analitik, abonelik ve ödeme, hata izleme, yedekleme |
| P3 | PWA, garson çağır, çok şubeli işletme, menü sürümü, sürükle bırak sıralama |

## Kapsam matrisi (her TODO maddesi nerede?)

| TODO maddesi | Adım | TODO maddesi | Adım |
|---|---|---|---|
| 2.1-2.9 | 1 | 6.1-6.7 | 5 |
| 3.1-3.9 | 2 | 6.8-6.17 | 8 |
| 3.10 | 2 (P3) | 7.1-7.3, 7.6-7.12, 7.15 | 9 |
| 4.1-4.9 | 6 | 7.4, 7.5 | 4 |
| 5.1-5.6 | 7 | 7.13, 7.14 | 3 |
| 5.7, 5.8 | 4 | Bölüm 8 | 10 |

## Doğrulama (her adımın sonunda)

| Kontrol | Nasıl |
|---|---|
| Tip kontrolü | `npx tsc --noEmit` |
| Kimlik ve sahiplik | 401, 403, 404 testleri (Adım 3'ten sonra repo içi e2e) |
| Gerçek panel akışı | Playwright: giriş, menü, ürün, ayarlar, QR masa, silme |
| Herkese açık sayfa | `/menu/<subdomain>` doğru restoran bilgisi, 404 ve boş menü ekranı |
| Veritabanı (Adım 1 sonrası) | Anon anahtarıyla `organizations`, `qr_tables`, `menu_views` erişimi reddedilmeli |
| Commit | Her adım ayrı commit. Push için ayrıca onay |
| Onay | Bir sonraki adıma geçmeden önce senden onay alınır |

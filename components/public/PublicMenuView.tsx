'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Search, 
  Utensils, 
  Wifi, 
  Copy, 
  Check, 
  AlertCircle, 
  Flame, 
  Star, 
  MapPin, 
  Phone,
  Globe,
  Navigation,
  MessageCircle,
  Instagram,
  Send
} from 'lucide-react'
import { mockMenusByRestaurant, MOCK_RESTAURANTS } from '@/lib/mock-data'
import { MenuItem, Menu, Restaurant, ProductTag } from '@/lib/types'
import { PublicTermsOfServiceModal } from '@/components/modals/PublicTermsOfServiceModal'
import { PublicPrivacyPolicyModal } from '@/components/modals/PublicPrivacyPolicyModal'
import { motion, AnimatePresence } from 'framer-motion'

// ÇOKLU DİL SÖZLÜĞÜ (TR, EN, AR, RU)
const TRANSLATIONS = {
  tr: {
    searchPlaceholder: 'Yemek, içecek veya tatlı arayın...',
    all: 'Tümü',
    wifiTitle: 'Ücretsiz Wi-Fi',
    copyWifi: 'Şifreyi Kopyala',
    copied: 'Kopyalandı',
    rateUs: 'Deneyiminizi Değerlendirin',
    rateDesc: 'Lezzet ve menümüzden memnun kaldınız mı?',
    rateHighThanks: 'Harika! Bizi Google Haritalar\'da değerlendirerek destek olmak ister misiniz?',
    rateLowThanks: 'Geri bildiriminiz için teşekkürler. Deneyiminizi iyileştirmek için çalışacağız.',
    googleReviewBtn: 'Google\'da Yorum Yaz ⭐',
    sendFeedback: 'Görüşünü Gönder',
    allergens: 'Alerjenler',
    chefChoice: 'Şefin Tavsiyesi',
    table: 'Masa',
    noItemsFound: 'Aramanıza uygun ürün bulunamadı.',
    getDirections: 'Yol Tarifi Al',
    whatsappChat: 'WhatsApp',
    close: 'Kapat'
  },
  en: {
    searchPlaceholder: 'Search dishes, drinks or desserts...',
    all: 'All',
    wifiTitle: 'Free Wi-Fi',
    copyWifi: 'Copy Password',
    copied: 'Copied',
    rateUs: 'Rate Your Experience',
    rateDesc: 'How was your dining experience with us today?',
    rateHighThanks: 'Awesome! Would you like to leave us a quick review on Google Maps?',
    rateLowThanks: 'Thank you for your feedback. We will work hard to improve our service.',
    googleReviewBtn: 'Write a Review on Google ⭐',
    sendFeedback: 'Submit Feedback',
    allergens: 'Allergens',
    chefChoice: 'Chef\'s Choice',
    table: 'Table',
    noItemsFound: 'No items found matching your search.',
    getDirections: 'Get Directions',
    whatsappChat: 'WhatsApp',
    close: 'Close'
  },
  ar: {
    searchPlaceholder: 'ابحث عن أطباق، مشروبات أو حلويات...',
    all: 'الكل',
    wifiTitle: 'واي فاي مجاني',
    copyWifi: 'نسخ كلمة المرور',
    copied: 'تم النسخ',
    rateUs: 'قيم تجربتك معنا',
    rateDesc: 'هل كنت راضياً عن طعامنا وخدمتنا اليوم؟',
    rateHighThanks: 'رائع! هل تود دعمنا بترك تقييم على خرائط جوجل؟',
    rateLowThanks: 'شكراً لملاحظاتك، سنعمل على تحسين الخدمة.',
    googleReviewBtn: 'اكتب تقييماً على جوجل ⭐',
    sendFeedback: 'إرسال الملاحظات',
    allergens: 'مسببات الحساسية',
    chefChoice: 'اختيار الشيف',
    table: 'طاولة',
    noItemsFound: 'لم يتم العثور على أطباق مطابقة.',
    getDirections: 'الاتجاهات',
    whatsappChat: 'واتساب',
    close: 'إغلاق'
  },
  ru: {
    searchPlaceholder: 'Поиск блюд, напитков или десертов...',
    all: 'Все',
    wifiTitle: 'Бесплатный Wi-Fi',
    copyWifi: 'Скопировать пароль',
    copied: 'Скопировано',
    rateUs: 'Оцените наш сервис',
    rateDesc: 'Понравилось ли вам обслуживание и еда?',
    rateHighThanks: 'Отлично! Не хотите ли оставить отзыв на Google Maps?',
    rateLowThanks: 'Спасибо за отзыв. Мы будем работать над улучшением качества.',
    googleReviewBtn: 'Оставить отзыв в Google ⭐',
    sendFeedback: 'Отправить отзыв',
    allergens: 'Аллергены',
    chefChoice: 'Выбор шефа',
    table: 'Стол',
    noItemsFound: 'Блюда не найдены.',
    getDirections: 'Маршрут',
    whatsappChat: 'WhatsApp',
    close: 'Закрыть'
  }
}

const getAllergenIcon = (allergen: string) => {
  const lower = allergen.toLowerCase()
  if (lower.includes('gluten') || lower.includes('buğday')) return '🌾'
  if (lower.includes('süt') || lower.includes('laktoz')) return '🥛'
  if (lower.includes('fıstık') || lower.includes('ceviz') || lower.includes('fındık')) return '🥜'
  if (lower.includes('yumurta')) return '🥚'
  if (lower.includes('balık') || lower.includes('deniz')) return '🐟'
  if (lower.includes('soya')) return '🫘'
  return '⚠️'
}

export function PublicMenuView({ restaurantSubdomain }: { restaurantSubdomain?: string | null }) {
  const { subdomain: paramSubdomain } = useParams()
  const location = useLocation()

  const searchParams = new URLSearchParams(location.search)
  const tableName = searchParams.get('table') || searchParams.get('masa')

  const targetSubdomain = restaurantSubdomain || paramSubdomain || 'lezzet-ocakbasi'

  const [restaurant, setRestaurant] = useState<Restaurant>(() => {
    if (typeof window !== 'undefined') {
      const all: Restaurant[] = JSON.parse(localStorage.getItem('all_restaurants') || '[]')
      const found = all.find(r => r.subdomain === targetSubdomain)
      if (found) return found
    }
    return MOCK_RESTAURANTS.find(r => r.subdomain === targetSubdomain) || MOCK_RESTAURANTS[0]
  })

  // Dil Desteği (tr, en, ar, ru)
  const [lang, setLang] = useState<'tr' | 'en' | 'ar' | 'ru'>('tr')
  const t = TRANSLATIONS[lang]

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
  const [wifiCopied, setWifiCopied] = useState(false)

  // GOOGLE REVIEW & DEĞERLENDİRME STATE'LERİ
  const [ratingStars, setRatingStars] = useState<number>(0)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')

  const menus = mockMenusByRestaurant[targetSubdomain] || mockMenusByRestaurant['lezzet-ocakbasi'] || []
  const activeMenu = menus[0]

  const primaryColor = restaurant.branding?.primaryColor || '#e11d48'

  // SADECE AKTİF OLAN KATEGORİLER
  const activeCategories = (activeMenu?.categories || []).filter(c => c.is_active)
  const allActiveItems = activeCategories.flatMap(c => c.items)

  const filteredCategories = activeCategories.map(cat => {
    const items = cat.items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesTag = selectedTag === 'all' || 
        (selectedTag === 'chef' && item.is_featured) ||
        (item.tags && item.tags.includes(selectedTag as ProductTag))

      return matchesSearch && matchesTag
    })
    return { ...cat, items }
  }).filter(cat => selectedCategory === 'all' || cat.id === selectedCategory).filter(cat => cat.items.length > 0)

  const copyWifi = () => {
    if (restaurant.businessInfo?.wifi_password) {
      navigator.clipboard.writeText(restaurant.businessInfo.wifi_password)
      setWifiCopied(true)
      setTimeout(() => setWifiCopied(false), 2000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 flex flex-col justify-between pb-8"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div>
        {/* Üst Bar (Restoran & Dil Seçici) */}
        <header className="bg-white border-b sticky top-0 z-40 shadow-xs">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse min-w-0">
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                <Utensils className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h1 className="font-extrabold text-gray-900 text-sm sm:text-base leading-tight truncate">
                  {restaurant.name}
                </h1>
                {tableName ? (
                  <span className="inline-flex items-center text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    📍 {t.table}: {tableName}
                  </span>
                ) : (
                  <p className="text-[11px] text-gray-500">Qolay Dijital Menü</p>
                )}
              </div>
            </div>

            {/* DİL SEÇİCİ DROPDOWN */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <Globe className="h-3.5 w-3.5 text-gray-400" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as 'tr' | 'en' | 'ar' | 'ru')}
                className="text-xs bg-gray-100 border border-gray-300 rounded-lg px-2 py-1 font-bold text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="tr">🇹🇷 TR</option>
                <option value="en">🇬🇧 EN</option>
                <option value="ar">🇸🇦 AR</option>
                <option value="ru">🇷🇺 RU</option>
              </select>
            </div>
          </div>
        </header>

        {/* Kapak Görseli */}
        {activeMenu && (
          <div className="relative h-44 sm:h-56 w-full bg-gray-900 overflow-hidden">
            <img 
              src={restaurant.branding?.bannerUrl || activeMenu.image_url} 
              alt={restaurant.name}
              className="w-full h-full object-cover opacity-65" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
              <h2 className="text-2xl sm:text-3xl font-extrabold">{restaurant.name}</h2>
              {restaurant.businessInfo?.address && (
                <p className="text-xs text-gray-200 mt-1 flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-gray-300 shrink-0" /> {restaurant.businessInfo.address}
                </p>
              )}
            </div>
          </div>
        )}

        <main className="container mx-auto px-4 py-4 max-w-3xl space-y-4">
          
          {/* HIZLI İLETİŞİM & SOSYAL MEDYA BARİ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {restaurant.businessInfo?.googleMapsUrl && (
              <a
                href={restaurant.businessInfo.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-white border rounded-xl shadow-2xs hover:bg-gray-50 flex items-center justify-center space-x-1.5 text-gray-700 font-semibold transition-colors"
              >
                <Navigation className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{t.getDirections}</span>
              </a>
            )}

            {restaurant.businessInfo?.whatsappNumber && (
              <a
                href={`https://wa.me/${restaurant.businessInfo.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-white border rounded-xl shadow-2xs hover:bg-gray-50 flex items-center justify-center space-x-1.5 text-gray-700 font-semibold transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{t.whatsappChat}</span>
              </a>
            )}

            {restaurant.businessInfo?.instagramHandle && (
              <a
                href={`https://instagram.com/${restaurant.businessInfo.instagramHandle}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-white border rounded-xl shadow-2xs hover:bg-gray-50 flex items-center justify-center space-x-1.5 text-gray-700 font-semibold transition-colors"
              >
                <Instagram className="h-3.5 w-3.5 text-pink-600 shrink-0" />
                <span className="truncate">@{restaurant.businessInfo.instagramHandle}</span>
              </a>
            )}

            {restaurant.businessInfo?.phone && (
              <a
                href={`tel:${restaurant.businessInfo.phone}`}
                className="p-2.5 bg-white border rounded-xl shadow-2xs hover:bg-gray-50 flex items-center justify-center space-x-1.5 text-gray-700 font-semibold transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">Ara</span>
              </a>
            )}
          </div>

          {/* Wi-Fi Kolaylığı */}
          {restaurant.businessInfo?.wifi_name && (
            <div className="p-3 bg-white border rounded-xl shadow-2xs flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-gray-700 truncate mr-2">
                <Wifi className="h-4 w-4 shrink-0" style={{ color: primaryColor }} />
                <span className="truncate">
                  {t.wifiTitle}: <strong>{restaurant.businessInfo.wifi_name}</strong>
                  {restaurant.businessInfo.wifi_password && (
                    <span className="text-gray-500 ml-1">({restaurant.businessInfo.wifi_password})</span>
                  )}
                </span>
              </div>
              {restaurant.businessInfo.wifi_password && (
                <Button size="sm" variant="outline" className="h-7 text-xs px-2.5 shrink-0" onClick={copyWifi}>
                  {wifiCopied ? <Check className="h-3 w-3 mr-1 text-green-600" /> : <Copy className="h-3 w-3 mr-1" />}
                  {wifiCopied ? t.copied : t.copyWifi}
                </Button>
              )}
            </div>
          )}

          {/* Arama & Kategori Çubuğu */}
          <div className="bg-white p-3 rounded-xl border shadow-2xs space-y-3 sticky top-16 z-30">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t.searchPlaceholder}
                className="pl-9 h-9 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Kategori Sekmeleri */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                className="text-xs px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all text-white"
                style={{
                  backgroundColor: selectedCategory === 'all' ? primaryColor : '#f3f4f6',
                  color: selectedCategory === 'all' ? '#ffffff' : '#374151'
                }}
                onClick={() => setSelectedCategory('all')}
              >
                {t.all} ({allActiveItems.length})
              </button>
              {activeCategories.map(cat => (
                <button
                  key={cat.id}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all"
                  style={{
                    backgroundColor: selectedCategory === cat.id ? primaryColor : '#f3f4f6',
                    color: selectedCategory === cat.id ? '#ffffff' : '#374151'
                  }}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name} ({cat.items.length})
                </button>
              ))}
            </div>
          </div>

          {/* Menü Kategorileri & Ürün Kartları */}
          <div className="space-y-6 pt-1">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border text-gray-500 text-sm">
                {t.noItemsFound}
              </div>
            ) : (
              filteredCategories.map(category => (
                <div key={category.id} className="space-y-3">
                  <div className="border-b pb-1">
                    <h3 className="font-extrabold text-base text-gray-900">{category.name}</h3>
                    {category.description && (
                      <p className="text-xs text-gray-500">{category.description}</p>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {category.items.map(item => (
                      <Card 
                        key={item.id} 
                        className={`cursor-pointer hover:shadow-md transition-shadow overflow-hidden bg-white border ${
                          !item.is_available ? 'opacity-60 bg-gray-50' : ''
                        }`}
                        onClick={() => {
                          setSelectedItem(item)
                          setIsItemModalOpen(true)
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            {item.image_url ? (
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-gray-100 relative">
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                                {item.is_featured && (
                                  <span className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                    ★
                                  </span>
                                )}
                              </div>
                            ) : null}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                <div className="flex items-start justify-between gap-1">
                                  <h4 className="font-bold text-sm text-gray-900 leading-snug line-clamp-1">{item.name}</h4>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                              </div>
                              <div className="flex items-center justify-between mt-2 pt-1 border-t">
                                {item.price ? (
                                  <span className="font-extrabold text-base" style={{ color: primaryColor }}>
                                    {item.price}
                                  </span>
                                ) : <span />}
                                {!item.is_available ? (
                                  <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                                    Tükendi
                                  </span>
                                ) : (
                                  (item.calories || item.macros) && (
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      {item.calories && (
                                        <span className="text-[10px] text-gray-400 flex items-center bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                          <Flame className="h-2.5 w-2.5 mr-0.5 text-amber-500" />
                                          {item.calories} kcal
                                        </span>
                                      )}
                                      {item.macros && (
                                        <span className="text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded font-mono border border-gray-100 flex items-center gap-1">
                                          <span title="Protein">P:{item.macros.protein}</span> 
                                          <span title="Karbonhidrat">K:{item.macros.carbs}</span> 
                                          <span title="Yağ">Y:{item.macros.fat}</span>
                                        </span>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* AKILLI MÜŞTERİ DEĞERLENDİRMESİ & GOOGLE REVIEW BOOSTER */}
          <Card className="bg-white border rounded-2xl p-5 text-center shadow-xs space-y-3 mt-8">
            <div className="space-y-1">
              <h4 className="font-extrabold text-base text-gray-900">{t.rateUs}</h4>
              <p className="text-xs text-gray-500">{t.rateDesc}</p>
            </div>

            {/* 1 - 5 Yıldız Seçici */}
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingStars(star)}
                  className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star 
                    className={`h-7 w-7 ${
                      ratingStars >= star 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-gray-300'
                    }`} 
                  />
                </button>
              ))}
            </div>

            {/* 4 veya 5 Yıldız Verildiğinde: Google Review Yönlendiricisi */}
            {ratingStars >= 4 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <p className="text-xs font-bold text-amber-900">{t.rateHighThanks}</p>
                <Button 
                  asChild
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-8 shadow-xs"
                >
                  <a 
                    href={restaurant.businessInfo?.googleReviewUrl || restaurant.businessInfo?.googleMapsUrl || 'https://maps.google.com'} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    {t.googleReviewBtn}
                  </a>
                </Button>
              </div>
            )}

            {/* 1, 2 veya 3 Yıldız Verildiğinde: Özel İşletme İçi Geri Bildirim Formu */}
            {ratingStars > 0 && ratingStars <= 3 && (
              <div className="p-3 bg-gray-50 border rounded-xl space-y-2 text-left">
                <p className="text-xs font-semibold text-gray-700">{t.rateLowThanks}</p>
                {!feedbackSubmitted ? (
                  <div className="space-y-2">
                    <textarea 
                      placeholder="Geliştirmemizi istediğiniz bir konu var mı?"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2 rounded border bg-white focus:outline-none"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => setFeedbackSubmitted(true)}
                      className="w-full text-xs h-7 bg-gray-900 text-white"
                    >
                      <Send className="h-3 w-3 mr-1" /> {t.sendFeedback}
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 font-bold text-center py-1">
                    Geri bildiriminiz işletme yönetimine iletildi.
                  </p>
                )}
              </div>
            )}
          </Card>
        </main>
      </div>

      {/* Ürün Detay Modalı */}
      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden max-h-[90vh]">
          {selectedItem && (
            <div>
              {selectedItem.image_url ? (
                <div className="relative h-48 w-full bg-gray-100">
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedItem.is_featured && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md flex items-center">
                      <Star className="h-3 w-3 mr-1 fill-white" /> {t.chefChoice}
                    </span>
                  )}
                </div>
              ) : null}

              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedItem.name}</h3>
                  </div>
                  {selectedItem.price && (
                    <span className="text-lg font-black" style={{ color: primaryColor }}>
                      {selectedItem.price}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">{selectedItem.description}</p>

                {/* MAKRO VE KALORİ DETAYLARI */}
                {(selectedItem.calories || selectedItem.macros) && (
                  <div className="pt-2 pb-1 border-t border-gray-100">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Besin Değerleri</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedItem.calories && (
                        <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-2 text-center flex flex-col items-center justify-center shadow-xs">
                          <Flame className="h-4 w-4 text-orange-500 mb-1" />
                          <span className="text-xs font-black text-gray-800">{selectedItem.calories}</span>
                          <span className="text-[9px] text-gray-500 font-medium mt-0.5">kcal</span>
                        </div>
                      )}
                      {selectedItem.macros && (
                        <>
                          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-2 text-center flex flex-col items-center justify-center shadow-xs">
                            <span className="text-lg mb-0.5">🥩</span>
                            <span className="text-xs font-black text-gray-800">{selectedItem.macros.protein}g</span>
                            <span className="text-[9px] text-gray-500 font-medium mt-0.5">Protein</span>
                          </div>
                          <div className="bg-yellow-50/50 border border-yellow-100 rounded-lg p-2 text-center flex flex-col items-center justify-center shadow-xs">
                            <span className="text-lg mb-0.5">🥖</span>
                            <span className="text-xs font-black text-gray-800">{selectedItem.macros.carbs}g</span>
                            <span className="text-[9px] text-gray-500 font-medium mt-0.5">Karb.</span>
                          </div>
                          <div className="bg-green-50/50 border border-green-100 rounded-lg p-2 text-center flex flex-col items-center justify-center shadow-xs">
                            <span className="text-lg mb-0.5">🥑</span>
                            <span className="text-xs font-black text-gray-800">{selectedItem.macros.fat}g</span>
                            <span className="text-[9px] text-gray-500 font-medium mt-0.5">Yağ</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* ALERJENLER */}
                {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                  <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 text-xs space-y-2 mt-1">
                    <div className="flex items-center text-red-800 font-bold">
                      <AlertCircle className="h-4 w-4 mr-1.5 text-red-500 shrink-0" />
                      <span>{t.allergens}:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItem.allergens.map((a, i) => (
                        <span key={i} className="flex items-center bg-white text-red-700 px-2.5 py-1 rounded-md border border-red-200 text-xs font-semibold shadow-sm">
                          <span className="mr-1.5 text-[14px]">{getAllergenIcon(a)}</span>
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Button className="w-full text-xs h-8" variant="outline" onClick={() => setIsItemModalOpen(false)}>
                    {t.close}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-white border-t py-4 text-center text-xs text-gray-500 space-y-2 mt-auto">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} {restaurant.name} • Powered by <strong>Qolay</strong></p>
          <div className="flex justify-center space-x-4 mt-1.5 text-[11px]">
            <button onClick={() => setIsTermsOpen(true)} className="hover:underline text-gray-400">
              Kullanım Koşulları
            </button>
            <button onClick={() => setIsPrivacyOpen(true)} className="hover:underline text-gray-400">
              Gizlilik Politikası
            </button>
          </div>
        </div>
      </footer>

      <PublicTermsOfServiceModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PublicPrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </motion.div>
  )
}

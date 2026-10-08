'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  Send,
  Sparkles,
  Moon,
  Sun,
  Coffee,
  Beer,
  Wine,
  Leaf
} from 'lucide-react'
import { PublicTermsOfServiceModal } from '@/components/modals/PublicTermsOfServiceModal'
import { PublicPrivacyPolicyModal } from '@/components/modals/PublicPrivacyPolicyModal'
import { motion, AnimatePresence } from 'framer-motion'
import type { Menu, MenuItem, ProductTag } from '@/lib/types'
import { getBusinessType } from '@/lib/business-types'

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop'

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
    hours: 'Çalışma Saatleri',
    instagram: 'Instagram',
    call: 'Ara',
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
    hours: 'Opening Hours',
    instagram: 'Instagram',
    call: 'Call',
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
    hours: 'ساعات العمل',
    instagram: 'انستغرام',
    call: 'اتصال',
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
    hours: 'Часы работы',
    instagram: 'Instagram',
    call: 'Позвонить',
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

  const isPreview = searchParams.get('preview') === '1'
  const [previewMenu, setPreviewMenu] = useState<Menu | null>(null)
  const [previewPrimary, setPreviewPrimary] = useState<string | null>(null)

  const targetSubdomain = restaurantSubdomain || paramSubdomain || ''

  const [restaurant, setRestaurant] = useState<any>(null)
  const [restaurantError, setRestaurantError] = useState(false)
  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(true)

  // Dil Desteği (tr, en, ar, ru)
  const [lang, setLang] = useState<'tr' | 'en' | 'ar' | 'ru'>('tr')
  const t = TRANSLATIONS[lang]

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [activeCategory, setActiveCategory] = useState<string>('')
  
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (activeCategory && tabsContainerRef.current) {
      const container = tabsContainerRef.current
      const activeTab = container.querySelector(`[data-category="${activeCategory}"]`) as HTMLElement
      if (activeTab) {
        const scrollLeft = activeTab.offsetLeft - container.clientWidth / 2 + activeTab.clientWidth / 2
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
      }
    }
  }, [activeCategory])

  // DARK MODE LOGIC
  const [isDarkMode, setIsDarkMode] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(isDark)
    }
  }, [])
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])
  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({})
  const isManualScrollRef = useRef(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
  const [wifiCopied, setWifiCopied] = useState(false)

  // GOOGLE REVIEW & DEĞERLENDİRME STATE'LERİ
  const [ratingStars, setRatingStars] = useState<number>(0)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')

  const [menus, setMenus] = useState<Menu[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Panel içi canlı önizleme: yayınlanmamış düzenlemeler üst pencereden gelir
  useEffect(() => {
    if (!isPreview) return
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== 'qr-preview-data') return
      setPreviewMenu(e.data.menu || null)
      setPreviewPrimary(e.data.primaryColor || null)
      if (e.data.restaurant) {
        setRestaurant(e.data.restaurant)
        setRestaurantError(false)
        setIsLoadingRestaurant(false)
      }
    }
    window.addEventListener('message', onMessage)
    window.parent?.postMessage({ type: 'qr-preview-ready' }, window.location.origin)
    return () => window.removeEventListener('message', onMessage)
  }, [isPreview])

  useEffect(() => {
    if (isPreview) return // Önizlemede restoran bilgisi editörden gelir
    async function loadRestaurant() {
      try {
        const res = await fetch(`/api/public/restaurant?subdomain=${targetSubdomain}`)
        if (res.ok) {
          const data = await res.json()
          setRestaurant(data)
        } else {
          setRestaurantError(true)
        }
      } catch (err) {
        setRestaurantError(true)
      } finally {
        setIsLoadingRestaurant(false)
      }
    }
    loadRestaurant()
  }, [targetSubdomain, isPreview])

  useEffect(() => {
    async function loadMenus() {
      if (!restaurant) return;
      if (isPreview) { setIsLoading(false); return }
      try {
        const res = await fetch(`/api/public/menus?orgId=${restaurant.id}`)
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            setMenus(data)
          }
        }
      } catch (err) {
        console.error("Failed to load real menus", err)
      } finally {
        setIsLoading(false)
      }
    }
    if (restaurant && !restaurantError) {
      loadMenus()
    } else if (restaurantError) {
      setIsLoading(false)
    }
  }, [restaurant, restaurantError, isPreview])

  const activeMenu = isPreview ? (previewMenu || undefined) : menus[0]

  const primaryColor =
    (isPreview && previewPrimary) ||
    restaurant?.branding?.primaryColor ||
    restaurant?.primary_color ||
    '#e11d48'

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
  }).filter(cat => cat.items.length > 0)

  // Intersection Observer for Scroll Spy
  useEffect(() => {
    if (filteredCategories.length === 0) return
    
    // Set initial active category if none is set
    if (!activeCategory && filteredCategories.length > 0) {
      setActiveCategory(filteredCategories[0].id)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualScrollRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id)
          }
        })
      },
      { rootMargin: '-120px 0px -75% 0px', threshold: 0.1 }
    )

    Object.values(categoryRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCategories])

  const scrollToCategory = (categoryId: string) => {
    isManualScrollRef.current = true
    setActiveCategory(categoryId)
    const element = categoryRefs.current[categoryId]
    if (element) {
      const yOffset = -120 // Header ve sticky nav yüksekliği
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
      
      setTimeout(() => {
        isManualScrollRef.current = false
      }, 800)
    } else {
      isManualScrollRef.current = false
    }
  }

  const businessType = getBusinessType(restaurant?.business_type)
  const igHandle: string = restaurant?.instagram_handle || ''
  const infoLinks = [
    igHandle && { key: 'ig', href: `https://instagram.com/${igHandle}`, icon: <Instagram className="h-4 w-4" />, label: t.instagram },
    restaurant?.whatsapp_number && { key: 'wa', href: `https://wa.me/${restaurant.whatsapp_number}`, icon: <MessageCircle className="h-4 w-4" />, label: t.whatsappChat },
    (restaurant?.google_maps_url || restaurant?.address) && { key: 'map', href: restaurant?.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant?.name || ''} ${restaurant?.address || ''} ${restaurant?.city || ''}`)}`, icon: <Navigation className="h-4 w-4" />, label: t.getDirections },
    restaurant?.business_phone && { key: 'tel', href: `tel:${String(restaurant.business_phone).replace(/\s/g, '')}`, icon: <Phone className="h-4 w-4" />, label: t.call },
  ].filter(Boolean) as { key: string; href: string; icon: React.ReactNode; label: string }[]

  const copyWifi = () => {
    if (restaurant?.wifi_password) {
      navigator.clipboard.writeText(restaurant.wifi_password)
      setWifiCopied(true)
      setTimeout(() => setWifiCopied(false), 2000)
    }
  }

  if (isLoadingRestaurant || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Yükleniyor...</p>
      </div>
    )
  }

  if (restaurantError || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Restoran Bulunamadı</h2>
        <p className="text-gray-500 text-center max-w-md">Aradığınız menüye ulaşılamıyor veya böyle bir restoran sistemimizde kayıtlı değil.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-b from-white to-[#F5F5F7] dark:from-[#1c1c1e] dark:to-[#000000] flex flex-col justify-between pb-8 font-sans selection:bg-primary/20 relative"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="relative z-10">
        {/* Dergi Tarzı Minimalist Kapak */}
        {(
          <div className="relative h-72 sm:h-[450px] w-full bg-[#1c1c1e] overflow-hidden rounded-b-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
            <motion.img 
              initial={{ scale: 1.1, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              src={restaurant?.cover_url || businessType?.coverImage || FALLBACK_COVER} 
              alt={restaurant?.name}
              className="w-full h-full object-cover opacity-50" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="max-w-2xl"
              >
                {restaurant?.logo_url ? (
                  <img src={restaurant.logo_url} alt={restaurant?.name} className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-white object-contain p-1.5 shadow-xl mb-4" />
                ) : (
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-xl mb-4" style={{ backgroundColor: primaryColor }}>
                    {(restaurant?.name || '?').trim().slice(0, 2).toUpperCase()}
                  </div>
                )}
                <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-white leading-none mb-3">
                  {restaurant?.name}
                </h2>
                {businessType && (
                  <p className="text-xs sm:text-sm text-white/80 font-semibold mb-2">{businessType.icon} {businessType.label}</p>
                )}
                {restaurant?.address && (
                  <p className="text-sm sm:text-base text-white/90 font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-2" style={{ color: primaryColor }} /> {restaurant.address} {restaurant.city && `- ${restaurant.city}`}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Sağ üst şık dil seçici & Gece Modu Butonu */}
            <div className="absolute top-6 right-6 flex items-center gap-2 z-50">
              {/* Gece Modu Butonu */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex items-center justify-center w-8 h-8 bg-black/20 backdrop-blur-xl rounded-full border border-white/10 text-white/80 hover:text-white transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <div className="flex items-center bg-black/20 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10">
                <Globe className="h-4 w-4 text-white/80 mr-1.5" />
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as 'tr' | 'en' | 'ar' | 'ru')}
                  className="text-xs bg-transparent font-bold text-white focus:outline-none cursor-pointer appearance-none uppercase"
                >
                  <option value="tr" className="text-black">TR</option>
                  <option value="en" className="text-black">EN</option>
                  <option value="ar" className="text-black">AR</option>
                  <option value="ru" className="text-black">RU</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <main className="container mx-auto px-4 py-8 max-w-5xl space-y-12 mb-24">
          
          {/* Bilgi şeridi: yalnızca doldurulmuş alanlar */}
          {(infoLinks.length > 0 || restaurant?.working_hours) && (
            <div className="flex flex-col items-center gap-3">
              {infoLinks.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {infoLinks.map((l) => (
                    <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-full bg-white dark:bg-[#2c2c2e] px-4 py-2.5 text-xs font-bold text-gray-800 dark:text-zinc-100 shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-md transition-shadow">
                      <span style={{ color: primaryColor }}>{l.icon}</span>{l.label}
                    </a>
                  ))}
                </div>
              )}
              {restaurant?.working_hours && (
                <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 text-center whitespace-pre-line">
                  <span className="font-black">{t.hours}:</span> {restaurant.working_hours}
                </p>
              )}
            </div>
          )}

          {/* Wi-Fi kartı */}
          {restaurant?.wifi_name && (
            <div className="mx-auto w-full max-w-md rounded-3xl bg-white dark:bg-[#2c2c2e] p-4 shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}1a`, color: primaryColor }}>
                <Wifi className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{t.wifiTitle}</p>
                <p className="truncate text-sm font-black text-gray-900 dark:text-zinc-100">{restaurant.wifi_name}</p>
                {restaurant.wifi_password && <p className="truncate text-xs font-mono text-gray-500 dark:text-zinc-400">{restaurant.wifi_password}</p>}
              </div>
              {restaurant.wifi_password && (
                <button onClick={copyWifi} className="shrink-0 flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-white" style={{ backgroundColor: primaryColor }}>
                  {wifiCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {wifiCopied ? t.copied : t.copyWifi}
                </button>
              )}
            </div>
          )}




          {/* Arama Çubuğu */}
          <div className="relative w-full max-w-md mx-auto">
            <Search className="absolute left-5 top-4 h-5 w-5 text-gray-400 dark:text-zinc-500" />
            <input
              placeholder={t.searchPlaceholder}
              className="w-full pl-14 pr-6 h-14 text-sm bg-white dark:bg-[#2c2c2e]/60 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400 dark:text-zinc-500 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* STICKY KATEGORİ MENÜSÜ */}
          {filteredCategories.length > 0 && (
            <div className="sticky top-0 z-40 w-[calc(100%+2rem)] -mx-4 px-4 py-3 bg-[#F5F5F7]/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl sm:w-full sm:mx-0 sm:px-0 border-b border-gray-200/50 dark:border-white/5 shadow-sm">
              <div 
                ref={tabsContainerRef}
                className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 scroll-smooth"
              >
                {filteredCategories.map(cat => (
                  <button
                    key={cat.id}
                    data-category={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`
                      px-5 py-2.5 rounded-full font-bold text-[13px] whitespace-nowrap transition-all shadow-sm border
                      ${activeCategory === cat.id 
                        ? 'bg-gray-900 text-white border-transparent dark:bg-white dark:text-gray-900' 
                        : 'bg-white dark:bg-[#2c2c2e] text-gray-600 dark:text-zinc-300 border-transparent hover:bg-gray-50 dark:hover:bg-[#3a3a3c]'}
                    `}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dergi Bento Izgarası */}
          <div className="space-y-16 pt-4 pb-12">
            {!activeMenu || filteredCategories.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-[#2c2c2e] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-gray-400 dark:text-zinc-500 text-base font-medium">
                <Utensils className="h-10 w-10 mx-auto mb-3 opacity-20" />
                {!activeMenu ? "Menü çok yakında." : t.noItemsFound}
              </div>
            ) : (
              filteredCategories.map(category => (
                <section 
                  key={category.id} 
                  id={category.id}
                  ref={(el) => { categoryRefs.current[category.id] = el; }}
                  className="space-y-5 scroll-mt-36"
                >
                  <div className="mb-6 flex items-end justify-between">
                    <div>
                      <h3 className="font-black text-4xl text-gray-900 dark:text-zinc-100 tracking-tighter capitalize">{category.name}</h3>
                      {category.description && (
                        <p className="text-base text-gray-500 dark:text-zinc-500 mt-2 font-medium max-w-lg">{category.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {[...category.items].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)).map(item => (
                      <div 
                        key={item.id}
                        onClick={() => {
                          setSelectedItem(item)
                          setIsItemModalOpen(true)
                        }}
                        className={`
                          relative p-2 sm:p-3 flex gap-3 sm:gap-4 group cursor-pointer transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 border
                          rounded-[24px] overflow-hidden
                          ${item.is_featured 
                            ? 'bg-gradient-to-br from-amber-100/80 via-orange-50/50 to-yellow-100/80 border-amber-300 shadow-[0_10px_30px_rgba(245,158,11,0.15)]' 
                            : 'bg-white dark:bg-[#2c2c2e] border-transparent dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none hover:border-gray-200 dark:border-[#48484a]'}
                          ${!item.is_available ? 'opacity-50 grayscale' : ''}
                        `}
                      >
                        {/* Görsel Alanı */}
                        {item.image_url ? (
                          <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-[18px] overflow-hidden bg-gray-50 dark:bg-[#3a3a3c]/60 relative shadow-inner">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            />
                            {item.is_featured && (
                              <div className="absolute top-2 left-2 bg-white dark:bg-[#2c2c2e]/90 backdrop-blur-md text-amber-500 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                                <Star className="h-2.5 w-2.5 fill-amber-500" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-[18px] overflow-hidden bg-gray-50 dark:bg-[#3a3a3c]/60 flex items-center justify-center text-gray-300 relative shadow-inner border border-gray-100 dark:border-[#3a3a3c]/50">
                            <Utensils className="h-6 w-6" />
                          </div>
                        )}

                        {/* İçerik Alanı */}
                        <div className="flex-1 flex flex-col justify-between py-1 pr-2 min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-extrabold text-[15px] sm:text-[17px] text-gray-900 dark:text-zinc-100 leading-tight mb-1 truncate">{item.name}</h4>
                            </div>
                            <p className="text-[11px] sm:text-[12px] text-gray-500 dark:text-zinc-500 line-clamp-2 leading-relaxed font-medium">{item.description}</p>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mt-2 pt-2 sm:mt-3 sm:pt-3 border-t border-gray-900/5">
                            <span className="font-black text-lg sm:text-xl shrink-0" style={{ color: primaryColor }}>
                              {item.price}
                            </span>

                            {/* Kalori ve Alerjenler */}
                            <div className="flex flex-wrap items-center gap-1.5 justify-end">
                              {item.allergens && item.allergens.length > 0 && (
                                <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full border border-red-100 dark:border-red-900/30">
                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                  <span className="text-[9px] sm:text-[10px] font-bold text-red-600 dark:text-red-400">
                                    {item.allergens.join(', ')}
                                  </span>
                                </div>
                              )}
                              
                              {item.calories && (
                                <div className="flex items-center gap-1 bg-white dark:bg-[#2c2c2e]/80 backdrop-blur-sm px-2 py-1 rounded-full border border-gray-200 dark:border-[#48484a]/50 shadow-sm">
                                  <Flame className="h-3 w-3 text-gray-400 dark:text-zinc-500" />
                                  <span className="text-[10px] sm:text-[11px] font-extrabold text-gray-600 dark:text-zinc-400">
                                    {(item.calorie_source === 'auto' || item.calorie_source === 'detailed') ? '~' : ''}{item.calories} <span className="font-medium text-gray-400 dark:text-zinc-500">kcal</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Şefin Tavsiyesi Vurgusu - Sağ Üst */}
                        {item.is_featured && (
                          <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden rounded-tr-[24px]">
                            <div className="absolute top-[-10px] right-[-10px] w-12 h-12 bg-amber-400/20 rounded-full blur-xl"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>

          {/* Değerlendirme kartı */}
          {restaurant?.google_review_url && (
            <div className="mx-auto w-full max-w-md rounded-3xl bg-white dark:bg-[#2c2c2e] p-5 text-center shadow-sm border border-gray-100 dark:border-white/5">
              <p className="text-sm font-black text-gray-900 dark:text-zinc-100">{t.rateUs}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">{t.rateDesc}</p>
              <div className="flex justify-center gap-1.5 mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRatingStars(n)} aria-label={`${n}`}>
                    <Star className="h-8 w-8" style={{ color: '#f59e0b', fill: n <= ratingStars ? '#f59e0b' : 'transparent' }} />
                  </button>
                ))}
              </div>
              {ratingStars >= 4 && (
                <div className="space-y-3 pt-1">
                  <p className="text-xs text-gray-600 dark:text-zinc-300">{t.rateHighThanks}</p>
                  <a href={restaurant.google_review_url} target="_blank" rel="noopener noreferrer"
                    className="inline-block rounded-full px-5 py-2.5 text-xs font-bold text-white" style={{ backgroundColor: primaryColor }}>
                    {t.googleReviewBtn}
                  </a>
                </div>
              )}
              {ratingStars > 0 && ratingStars <= 3 && (
                <p className="text-xs text-gray-600 dark:text-zinc-300 pt-1">{t.rateLowThanks}</p>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Ürün Detay Modalı */}
      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden max-h-[90vh] bg-white dark:bg-[#2c2c2e] rounded-[40px] border-none shadow-[0_40px_80px_rgba(0,0,0,0.2)]">
          {selectedItem && (
            <div className="relative h-full flex flex-col">
              {/* Close Button on top of image */}
              <button 
                onClick={() => setIsItemModalOpen(false)}
                className="absolute top-4 right-4 z-50 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <span className="sr-only">Kapat</span>
                <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </button>

              {/* Dev Görsel Alanı */}
              {selectedItem.image_url ? (
                <div className="relative h-[300px] sm:h-[350px] w-full shrink-0">
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/0 to-black/20 pointer-events-none" />
                  
                  {selectedItem.is_featured && (
                    <span className="absolute bottom-6 left-6 bg-amber-500/90 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center">
                      <Star className="h-3.5 w-3.5 mr-1.5 fill-white" /> {t.chefChoice}
                    </span>
                  )}
                </div>
              ) : (
                <div className="h-24 bg-gradient-to-b from-gray-100 to-white" />
              )}

              {/* Detay Alanı */}
              <div className="flex-1 overflow-y-auto px-6 pb-8 pt-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-3xl font-black text-gray-900 dark:text-zinc-100 tracking-tight leading-tight pr-4">{selectedItem.name}</h3>
                  {selectedItem.price && (
                    <span className="text-2xl font-black shrink-0" style={{ color: primaryColor }}>
                      {selectedItem.price}
                    </span>
                  )}
                </div>

                {selectedItem.description && (
                  <p className="text-[15px] text-gray-600 dark:text-zinc-400 font-medium leading-relaxed mb-6">
                    {selectedItem.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* Kalori */}
                  {selectedItem.calories && (
                    <div className="bg-gray-50 dark:bg-[#3a3a3c]/60 rounded-2xl p-4 border border-gray-100 dark:border-[#3a3a3c] flex flex-col items-center justify-center text-center">
                      <div className="bg-white dark:bg-[#2c2c2e] p-2 rounded-full shadow-sm mb-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                      </div>
                      <span className="text-lg font-black text-gray-900 dark:text-zinc-100 leading-none">
                        {(selectedItem.calorie_source === 'auto' || selectedItem.calorie_source === 'detailed') ? '~' : ''}{selectedItem.calories}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mt-1">Kalori</span>
                      {(selectedItem.calorie_source === 'auto' || selectedItem.calorie_source === 'detailed') && (
                        <div className="flex items-center text-[9px] text-primary mt-1 font-bold">
                          <Sparkles className="h-2.5 w-2.5 mr-0.5" /> AI Tahmini
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hazırlık Süresi veya Diğer Metrik */}
                  <div className="bg-gray-50 dark:bg-[#3a3a3c]/60 rounded-2xl p-4 border border-gray-100 dark:border-[#3a3a3c] flex flex-col items-center justify-center text-center">
                    <div className="bg-white dark:bg-[#2c2c2e] p-2 rounded-full shadow-sm mb-2">
                      <Utensils className="h-5 w-5 text-blue-500" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Stok Durumu</span>
                    {selectedItem.is_available ? (
                      <span className="text-sm font-black text-emerald-600">Mevcut</span>
                    ) : (
                      <span className="text-sm font-black text-red-600">Tükendi</span>
                    )}
                  </div>
                </div>

                {/* Alerjenler */}
                {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                  <div className="mt-2 bg-rose-50/50 rounded-2xl p-4 border border-rose-100/50">
                    <h4 className="text-[11px] font-bold text-rose-800 uppercase tracking-wider mb-3 flex items-center">
                      <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                      {t.allergens}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.allergens.map((alg) => (
                        <span key={alg} className="bg-white dark:bg-[#2c2c2e] text-rose-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center border border-rose-100">
                          <span className="mr-1.5 text-sm">{getAllergenIcon(alg)}</span> {alg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#2c2c2e] border-t py-4 text-center text-xs text-gray-500 dark:text-zinc-500 space-y-2 mt-auto">
        <div className="container mx-auto px-4">
          <p className="flex items-center justify-center gap-1.5">{restaurant.logo_url && <img src={restaurant.logo_url} alt="" className="h-4 w-4 rounded object-contain" />}© {new Date().getFullYear()} {restaurant.name} • Powered by <strong>QR Chef</strong></p>
          <div className="flex justify-center space-x-4 mt-1.5 text-[11px]">
            <button onClick={() => setIsTermsOpen(true)} className="hover:underline text-gray-400 dark:text-zinc-500">
              Kullanım Koşulları
            </button>
            <button onClick={() => setIsPrivacyOpen(true)} className="hover:underline text-gray-400 dark:text-zinc-500">
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

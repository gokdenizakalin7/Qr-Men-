'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Camera,
  X,
  Loader2,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  ArrowLeft,
  ImagePlus,
  Sparkles,
  FileText
} from 'lucide-react'
import { Menu, MenuCategory } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { compressImageFile, IMAGE_PRESETS } from '@/lib/image-compression'

// ─── Tipler ────────────────────────────────────────────────────────────

interface ParsedCategory {
  name: string
  items: ParsedItem[]
}

interface ParsedItem {
  name: string
  price: string
  calories?: number
}

type Step = 'upload' | 'scanning' | 'results'

interface ScanMenuModalProps {
  isOpen: boolean
  onClose: () => void
  onMenuCreated: (menu: Partial<Menu>) => void
}

const MAX_PHOTOS = 10
const DAILY_SCAN_LIMIT = 2

export function ScanMenuModal({ isOpen, onClose, onMenuCreated }: ScanMenuModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const [photos, setPhotos] = useState<{ id: string; file: File; preview: string }[]>([])
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStatus, setScanStatus] = useState('')
  const [parsedCategories, setParsedCategories] = useState<ParsedCategory[]>([])
  const [error, setError] = useState<string | null>(null)
  const [menuName, setMenuName] = useState('Taranan Menü')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dailyScansUsed, setDailyScansUsed] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [calorieProgress, setCalorieProgress] = useState(0)
  const [isEstimatingCalories, setIsEstimatingCalories] = useState(false)
  const [calorieStatus, setCalorieStatus] = useState('')

  // Aktif kullanıcı rolünü kontrol et (Admin ve Süper Admin için tarama limiti yoktur)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('user_role')
      const isImpersonating = localStorage.getItem('is_admin_impersonating') === 'true' || localStorage.getItem('is_admin') === 'true'
      setIsAdmin(role === 'superadmin' || role === 'admin' || isImpersonating)
    }
  }, [isOpen])

  // Aktif restoran/hesap ve gün bazlı kota anahtarı
  const getQuotaKey = useCallback(() => {
    if (typeof window === 'undefined') return ''
    try {
      const stored = localStorage.getItem('currentRestaurant')
      const parsed = stored ? JSON.parse(stored) : null
      const accountId = parsed?.subdomain || parsed?.id || 'default_restaurant'
      const today = new Date().toISOString().slice(0, 10)
      return `menu_scan_quota_${accountId}_${today}`
    } catch {
      return `menu_scan_quota_default_${new Date().toISOString().slice(0, 10)}`
    }
  }, [])

  // Modal her açıldığında bugünkü kullanım miktarını yükle
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const key = getQuotaKey()
      if (key) {
        const used = parseInt(localStorage.getItem(key) || '0', 10)
        setDailyScansUsed(used)
      }
    }
  }, [isOpen, getQuotaKey])

  const remainingScans = Math.max(0, DAILY_SCAN_LIMIT - dailyScansUsed)
  // Admin için limit yok, sadece normal restoran kullanıcıları için limit geçerli
  const isLimitReached = !isAdmin && remainingScans <= 0

  const resetState = () => {
    setStep('upload')
    setPhotos([])
    setScanProgress(0)
    setScanStatus('')
    setParsedCategories([])
    setError(null)
    setMenuName('Taranan Menü')
    setCalorieProgress(0)
    setIsEstimatingCalories(false)
    setCalorieStatus('')
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  // Fotoğraf ekleme (Maksimum 10)
  const addPhotos = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(f => f.type.startsWith('image/'))
    
    setPhotos(prev => {
      const remaining = MAX_PHOTOS - prev.length
      if (remaining <= 0) return prev
      const toAdd = imageFiles.slice(0, remaining)
      
      const newEntries = toAdd.map(file => ({
        id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        preview: URL.createObjectURL(file)
      }))
      
      return [...prev, ...newEntries]
    })
  }, [])

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      addPhotos(e.dataTransfer.files)
    }
  }

  // Görseli optimize ederek base64'e dönüştür (Akıllı Sıkıştırma: 1600px max, %80 kalite JPEG)
  const resizeImageForUpload = async (file: File): Promise<{ data: string; mimeType: string }> => {
    const compressed = await compressImageFile(file, IMAGE_PRESETS.MENU_SCAN)
    return {
      data: compressed.dataUrl,
      mimeType: compressed.mimeType
    }
  }

  // Tarama Başlat
  const startScanning = async () => {
    if (photos.length === 0) return

    if (!isAdmin && isLimitReached) {
      setError('Bugünkü tarama limitinize (2/2) ulaştınız. Her hesap günde en fazla 2 kez menü taraması yapabilir.')
      return
    }

    if (photos.length > MAX_PHOTOS) {
      setError(`Tek seferde en fazla ${MAX_PHOTOS} adet fotoğraf yükleyebilirsiniz.`)
      return
    }

    setStep('scanning')
    setScanProgress(20)
    setScanStatus('Menü fotoğrafları akıllı sıkıştırma ile optimize ediliyor...')
    setError(null)

    try {
      // Görselleri sıkıştırarak hazırla
      const images = await Promise.all(photos.map(p => resizeImageForUpload(p.file)))

      setScanProgress(50)
      setScanStatus('Yapay Zeka (Gemini Vision) menüyü analiz ediyor...')

      // Sunucu rotasına gönder (API anahtarı yalnızca sunucu .env.local üzerinden okunur)
      const res = await fetch('/api/scan-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images })
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        setError(data.error || `Sunucu hatası: HTTP ${res.status}`)
        setStep('upload')
        return
      }

      const result = data

      setScanProgress(85)
      setScanStatus('Kategoriler, ürünler ve fiyatlar düzenleniyor...')

      if (!result.categories || result.categories.length === 0) {
        setError('Menüden kategori veya ürün tespit edilemedi. Lütfen fotoğrafın net olduğundan emin olun.')
        setStep('upload')
        return
      }

      // Fiyatları normalize et (null ise "") ve kalorileri aktar
      const formattedCategories = result.categories.map((c: any) => ({
        name: c.name || 'Genel',
        items: (c.items || []).map((i: any) => ({
          name: i.name || '',
          price: i.price ? String(i.price) : '',
          calories: typeof i.calories === 'number' ? i.calories : (parseInt(i.calories) || undefined)
        }))
      }))

      // Günlük kotayı düşür (admin için kota düşürülmez)
      if (!isAdmin) {
        const key = getQuotaKey()
        if (key && typeof window !== 'undefined') {
          const newUsed = dailyScansUsed + 1
          localStorage.setItem(key, String(newUsed))
          setDailyScansUsed(newUsed)
        }
      }

      setScanProgress(100)
      if (result.menuName && result.menuName !== 'Taranan Menü') {
        setMenuName(result.menuName)
      }
      setParsedCategories(formattedCategories)

      setParsedCategories(formattedCategories)
      setStep('results')
    } catch (err: any) {
      console.error('Scan Error:', err)
      setError(err?.message || 'Tarama sırasında bir hata oluştu. Lütfen tekrar deneyin.')
      setStep('upload')
    }
  }

  // Sonuçları düzenleme
  const updateCategoryName = (catIndex: number, name: string) => {
    setParsedCategories(prev => {
      const updated = [...prev]
      updated[catIndex] = { ...updated[catIndex], name }
      return updated
    })
  }

  const updateItemName = (catIndex: number, itemIndex: number, name: string) => {
    setParsedCategories(prev => {
      const updated = [...prev]
      const items = [...updated[catIndex].items]
      items[itemIndex] = { ...items[itemIndex], name }
      updated[catIndex] = { ...updated[catIndex], items }
      return updated
    })
  }

  const updateItemPrice = (catIndex: number, itemIndex: number, price: string) => {
    setParsedCategories(prev => {
      const updated = [...prev]
      const items = [...updated[catIndex].items]
      items[itemIndex] = { ...items[itemIndex], price }
      updated[catIndex] = { ...updated[catIndex], items }
      return updated
    })
  }

  const deleteItem = (catIndex: number, itemIndex: number) => {
    setParsedCategories(prev => {
      const updated = [...prev]
      const items = [...updated[catIndex].items]
      items.splice(itemIndex, 1)
      updated[catIndex] = { ...updated[catIndex], items }
      return updated
    })
  }

  const deleteCategory = (catIndex: number) => {
    setParsedCategories(prev => prev.filter((_, i) => i !== catIndex))
  }

  // Menüyü Oluştur
  const createMenu = async () => {
    let coverUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop'
    if (photos[0]?.file) {
      try {
        const compressedCover = await compressImageFile(photos[0].file, IMAGE_PRESETS.MENU_COVER)
        coverUrl = compressedCover.dataUrl
      } catch {
        coverUrl = photos[0]?.preview || coverUrl
      }
    }

    const categories: MenuCategory[] = parsedCategories
      .filter(cat => cat.items.length > 0)
      .map((cat, catIdx) => ({
        id: `cat-${Date.now()}-${catIdx}`,
        name: cat.name,
        description: '',
        display_order: catIdx + 1,
        is_active: true,
        items: cat.items.map((item, itemIdx) => ({
          id: `item-${Date.now()}-${catIdx}-${itemIdx}`,
          name: item.name,
          description: '',
          price: item.price,
          image_url: '',
          calories: item.calories || undefined,
          display_order: itemIdx + 1,
          is_available: true
        }))
      }))

    const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0)

    onMenuCreated({
      name: menuName || 'Taranan Menü',
      description: `${categories.length} kategori, ${totalItems} ürün — fotoğraftan yapay zeka ile taranarak oluşturuldu`,
      image_url: coverUrl,
      is_listed: true,
      layout: 'grid',
      categories
    })

    handleClose()
  }

  const totalParsedItems = parsedCategories.reduce((sum, c) => sum + c.items.length, 0)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[660px] max-h-[90vh] overflow-y-auto p-0">
        
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <Camera className="h-4 w-4 text-white" />
              </div>
              {step === 'upload' && 'Kendi Menünü Tara (Yapay Zeka)'}
              {step === 'scanning' && 'Menü Taranıyor...'}
              {step === 'results' && 'Tarama Sonuçları'}
            </DialogTitle>
            <DialogDescription>
              {step === 'upload' && 'Menünüzün fotoğraflarını yükleyin, yapay zeka otomatik olarak kategorileri ve ürünleri eksiksiz çıkarsın.'}
              {step === 'scanning' && 'Fotoğraflarınız yapay zeka tarafından analiz ediliyor, lütfen bekleyin...'}
              {step === 'results' && `${parsedCategories.length} kategori ve ${totalParsedItems} ürün başarıyla tespit edildi. Kontrol edip düzenleyebilirsiniz.`}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-4">
          <AnimatePresence mode="wait">

            {/* ─── ADIM 1: FOTOĞRAF YÜKLEME ─── */}
            {step === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Hata mesajı */}
                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Limit Aşıldı Uyarısı */}
                {isLimitReached && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Bugünkü Tarama Limitinize Ulaştınız (2/2)</p>
                      <p className="text-amber-800/80 mt-0.5">
                        Her hesap günde en fazla 2 kez menü taraması yapabilir. Günlük kotanız her gece 00:00'da otomatik olarak sıfırlanır.
                      </p>
                    </div>
                  </div>
                )}

                {/* Drop Zone */}
                <div
                  ref={dropZoneRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => {
                    if (!isLimitReached && photos.length < MAX_PHOTOS) {
                      fileInputRef.current?.click()
                    }
                  }}
                  className={`
                    relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer
                    transition-all duration-200 group
                    ${isDragging 
                      ? 'border-violet-500 bg-violet-50 scale-[1.01]' 
                      : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50/50'
                    }
                    ${photos.length >= MAX_PHOTOS || isLimitReached ? 'pointer-events-none opacity-60' : ''}
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={isLimitReached || photos.length >= MAX_PHOTOS}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) addPhotos(e.target.files)
                      e.target.value = ''
                    }}
                  />
                  
                  <div className="flex flex-col items-center gap-3">
                    <div className={`
                      w-14 h-14 rounded-full flex items-center justify-center transition-colors
                      ${isDragging ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-400 group-hover:bg-violet-100 group-hover:text-violet-500'}
                    `}>
                      <ImagePlus className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {isDragging ? 'Fotoğrafları bırakın...' : 'Menü fotoğraflarını sürükleyip bırakın'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        veya tıklayarak seçin • JPG, PNG, WEBP • Maks. {MAX_PHOTOS} fotoğraf
                      </p>
                    </div>
                  </div>
                </div>

                {/* Yüklenen Fotoğraflar */}
                {photos.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Yüklenen Fotoğraflar ({photos.length}/{MAX_PHOTOS})
                      </p>
                      {photos.length < MAX_PHOTOS && !isLimitReached && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-7 text-violet-600" 
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Daha Ekle
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                      {photos.map((photo, idx) => (
                        <div key={photo.id} className="relative group rounded-lg overflow-hidden border shadow-sm aspect-[3/4]">
                          <img
                            src={photo.preview}
                            alt={`Menü fotoğrafı ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                          <button
                            onClick={(e) => { e.stopPropagation(); removePhoto(idx) }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                            {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* İpuçları */}
                <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-lg p-3.5 border border-violet-100">
                  <p className="text-xs font-bold text-violet-800 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Akıllı Menü Ayrıştırma
                  </p>
                  <ul className="text-xs text-violet-700/80 space-y-1">
                    <li>• Tek seferde <strong>10 sayfaya kadar</strong> menü fotoğrafı yükleyebilirsiniz.</li>
                    <li>• Yan yana birden fazla kolon olsa bile yapay zeka doğru sırayla ayırır.</li>
                  </ul>
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={handleClose}>Vazgeç</Button>
                  <Button
                    onClick={startScanning}
                    disabled={photos.length === 0 || isLimitReached}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold shadow-md shadow-violet-200 disabled:opacity-50"
                  >
                    <ScanLine className="h-4 w-4 mr-2" />
                    {isLimitReached ? 'Günlük Limit Doldu (0/2)' : 'Menüyü Tara'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ─── ADIM 2: TARAMA İŞLEMİ ─── */}
            {step === 'scanning' && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="py-10 space-y-6"
              >
                <div className="flex flex-col items-center space-y-6">
                  {/* Animasyonlu Tarama İkonu */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                      <FileText className="h-10 w-10 text-violet-600" />
                    </div>
                    <motion.div
                      animate={{ y: [0, 60, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-x-0 top-0"
                    >
                      <div className="h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent rounded-full mx-2 shadow-sm" />
                    </motion.div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shadow-lg"
                    >
                      <Loader2 className="h-4 w-4 text-white" />
                    </motion.div>
                  </div>

                  {/* Progress */}
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-xs font-medium text-gray-600">
                      <span>{scanStatus}</span>
                      <span className="text-violet-600 font-bold">{scanProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${scanProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 text-center max-w-sm">
                    {isEstimatingCalories 
                      ? `${calorieStatus || 'Kaloriler hesaplanıyor...'}`
                      : 'Gelişmiş Vision modeli menünüzdeki tüm sütunları, kategorileri ve ürünleri analiz ediyor...'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* ─── ADIM 3: SONUÇLAR & DÜZENLEME ─── */}
            {step === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Başarı Bilgisi */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Tarama Başarıyla Tamamlandı!</p>
                    <p className="text-xs text-emerald-600">
                      {parsedCategories.length} kategori ve {totalParsedItems} ürün tespit edildi. Aşağıdan düzenleyebilirsiniz.
                    </p>
                  </div>
                </div>

                {/* Menü Adı */}
                <div className="space-y-1.5">
                  <Label htmlFor="scan-menu-name" className="text-xs font-semibold">Menü Adı</Label>
                  <Input
                    id="scan-menu-name"
                    value={menuName}
                    onChange={(e) => setMenuName(e.target.value)}
                    placeholder="Taranan Menü"
                    className="h-9"
                  />
                </div>

                {/* Kategoriler ve Ürünler */}
                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                  {parsedCategories.map((cat, catIdx) => (
                    <div key={catIdx} className="rounded-lg border bg-white shadow-sm overflow-hidden">
                      {/* Kategori Başlığı */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b">
                        <div className="w-6 h-6 rounded bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {catIdx + 1}
                        </div>
                        <Input
                          value={cat.name}
                          onChange={(e) => updateCategoryName(catIdx, e.target.value)}
                          className="h-7 text-sm font-bold border-0 bg-transparent shadow-none px-1 focus-visible:ring-1"
                        />
                        <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                          {cat.items.length} ürün
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => deleteCategory(catIdx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Ürünler */}
                      <div className="divide-y">
                        {cat.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50/50 group">
                            <span className="text-[10px] text-gray-400 font-mono w-4 shrink-0">{itemIdx + 1}</span>
                            <Input
                              value={item.name}
                              onChange={(e) => updateItemName(catIdx, itemIdx, e.target.value)}
                              className="h-7 text-sm border-0 bg-transparent shadow-none px-1 flex-1 focus-visible:ring-1"
                              placeholder="Ürün adı"
                            />
                            {item.calories ? (
                              <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 whitespace-nowrap flex items-center gap-0.5">
                                🔥 {item.calories} kcal
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 whitespace-nowrap">
                                — kcal
                              </span>
                            )}
                            <Input
                              value={item.price}
                              onChange={(e) => updateItemPrice(catIdx, itemIdx, e.target.value)}
                              className="h-7 text-sm font-semibold text-violet-700 border-0 bg-transparent shadow-none px-1 w-24 text-right focus-visible:ring-1"
                              placeholder="Fiyat (ör: 50 ₺)"
                            />
                            <button
                              onClick={() => deleteItem(catIdx, itemIdx)}
                              className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        {cat.items.length === 0 && (
                          <p className="px-3 py-3 text-xs text-gray-400 italic">Bu kategoride ürün bulunamadı</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex justify-between items-center gap-2 pt-3 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setStep('upload')
                      setError(null)
                    }}
                    className="text-gray-600"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1.5" /> Geri Dön
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleClose}>Vazgeç</Button>
                    <Button
                      onClick={createMenu}
                      disabled={parsedCategories.filter(c => c.items.length > 0).length === 0}
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Menüyü Oluştur
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

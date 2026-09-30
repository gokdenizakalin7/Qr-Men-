/**
 * Yüksek Performanslı ve Akıllı İstemci Taraflı Görsel Sıkıştırma Modülü
 * Menü tarama fotoğraflarını ve ürün fotoğraflarını kaliteyi kaybetmeden 
 * %80-%95 oranında küçülterek megabaytlarca / gigabaytlarca veri şişmesini önler.
 */

export interface CompressOptions {
  maxDimension?: number
  quality?: number
  format?: 'image/webp' | 'image/jpeg'
}

export interface CompressResult {
  dataUrl: string
  mimeType: string
  width: number
  height: number
  originalSizeKB: number
  compressedSizeKB: number
  reductionPercent: number
}

export const IMAGE_PRESETS = {
  // Ürün fotoğrafları: Menüdeki ürün kartları ve detay modalları için optimize
  PRODUCT: {
    maxDimension: 800,
    quality: 0.80,
    format: 'image/webp' as const
  },
  // Menü kapak fotoğrafları: Menü listesi ve başlık kartları için optimize
  MENU_COVER: {
    maxDimension: 1200,
    quality: 0.82,
    format: 'image/webp' as const
  },
  // Menü tarama fotoğrafları: Yapay zeka (Gemini Vision) OCR ve ayrıştırma için keskinliği korur
  MENU_SCAN: {
    maxDimension: 1600,
    quality: 0.80,
    format: 'image/jpeg' as const
  }
}

/**
 * Bir File nesnesini tarayıcı Canvas API ile yeniden boyutlandırıp sıkıştırır.
 */
export async function compressImageFile(
  file: File,
  options: CompressOptions = IMAGE_PRESETS.PRODUCT
): Promise<CompressResult> {
  const {
    maxDimension = 800,
    quality = 0.80,
    format = 'image/webp'
  } = options

  const originalSizeKB = Math.round(file.size / 1024)

  return new Promise((resolve, reject) => {
    // Görseli yükle
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      try {
        let width = img.naturalWidth || img.width
        let height = img.naturalHeight || img.height

        // En boy oranını koruyarak maksimum boyuta ölçekle
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        // Canvas oluştur
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          throw new Error('Canvas context oluşturulamadı.')
        }

        // Yüksek kaliteli çizim ayarları
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // Arka planı beyaz yap (JPEG formatında şeffaflık siyah olmasın)
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, width, height)
        }

        ctx.drawImage(img, 0, 0, width, height)

        // WebP destek kontrolü ile çıktı al
        let dataUrl = canvas.toDataURL(format, quality)
        let actualMime = format

        // Eğer tarayıcı webp desteklemiyorsa otomatik image/jpeg'e döner
        if (format === 'image/webp' && !dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality)
          actualMime = 'image/jpeg'
        }

        // Boyut hesaplama (Base64 uzunluğu / 1.37)
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1)
        const compressedSizeKB = Math.round((base64Length * 0.75) / 1024)
        const reductionPercent = originalSizeKB > 0
          ? Math.max(0, Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100))
          : 0

        resolve({
          dataUrl,
          mimeType: actualMime,
          width,
          height,
          originalSizeKB,
          compressedSizeKB,
          reductionPercent
        })
      } catch (err) {
        reject(err)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Görsel dosyası yüklenemedi veya bozuk.'))
    }

    img.src = objectUrl
  })
}

/**
 * İnsan tarafından okunabilir dosya boyutu formatlar (örn: "42 KB", "1.2 MB")
 */
export function formatFileSize(kb: number): string {
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

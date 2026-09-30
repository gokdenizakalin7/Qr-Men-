/**
 * Enterprise Dosya ve Görsel Yükleme Doğrulama Modülü
 * Sahte uzantılı zararlı dosyaları (örn: shell.php.jpg) "Magic Bytes" kontrolü ile engeller.
 */

// İzin verilen MIME türleri
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
]

// Maksimum dosya boyutu (Görsel başına 10 MB, Base64 eşdeğeri ~13.7 MB)
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export interface ValidationResult {
  isValid: boolean
  error?: string
  mimeType?: string
}

/**
 * Base64 görsel verisinin ilk baytlarını (Magic Bytes) kontrol ederek
 * gerçek bir görsel olup olmadığını doğrular.
 */
export function validateBase64Image(base64Data: string): ValidationResult {
  if (!base64Data || typeof base64Data !== 'string') {
    return { isValid: false, error: 'Görsel verisi boş veya geçersiz.' }
  }

  // data:image/...;base64, başlığını ayıkla (hızlı, hafıza dostu ve güvenli substring)
  let cleanBase64 = base64Data.trim()
  const base64Index = cleanBase64.indexOf('base64,')
  if (base64Index !== -1) {
    cleanBase64 = cleanBase64.substring(base64Index + 7).trim()
  }

  // Boyut kontrolü
  const estimatedSizeBytes = Math.round((cleanBase64.length * 3) / 4)
  if (estimatedSizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `Dosya boyutu çok yüksek (${(estimatedSizeBytes / (1024 * 1024)).toFixed(1)} MB). Maksimum izin verilen: 10 MB.`
    }
  }

  // İlk 32 byte'ı decode et
  try {
    const binaryPrefix = Buffer.from(cleanBase64.slice(0, 64), 'base64')
    if (binaryPrefix.length < 4) {
      return { isValid: false, error: 'Dosya başlığı okunamadı.' }
    }

    const hex = binaryPrefix.toString('hex').toLowerCase()

    // JPEG Magic Bytes: FF D8 FF
    if (hex.startsWith('ffd8ff')) {
      return { isValid: true, mimeType: 'image/jpeg' }
    }

    // PNG Magic Bytes: 89 50 4E 47
    if (hex.startsWith('89504e47')) {
      return { isValid: true, mimeType: 'image/png' }
    }

    // WEBP Magic Bytes: 52 49 46 46 (RIFF) ve 8-12 byte arasında 57 45 42 50 (WEBP)
    if (hex.startsWith('52494646')) {
      const ascii = binaryPrefix.toString('ascii')
      if (ascii.includes('WEBP')) {
        return { isValid: true, mimeType: 'image/webp' }
      }
    }

    return {
      isValid: false,
      error: 'Geçersiz görsel formatı. Yalnızca gerçek JPEG, PNG ve WebP dosyaları kabul edilir.'
    }
  } catch (err: any) {
    return {
      isValid: false,
      error: `Dosya doğrulanırken hata oluştu: ${err?.message || 'Bozuk dosya'}`
    }
  }
}

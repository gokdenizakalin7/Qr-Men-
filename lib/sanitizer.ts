/**
 * Enterprise Metin Sanitizasyon ve XSS / Injection Koruma Modülü
 * Kullanıcı girdilerini, menü içeriklerini ve harici URL'leri katı kurallarla temizler.
 */

/**
 * Tek satırlık metinleri temizler (ürün adı, kategori adı, başlık, kullanıcı adı)
 * HTML etiketlerini ve script kalıntılarını kaldırır, karakter sınırını zorunlu tutar.
 */
export function sanitizeText(input: unknown, maxLength = 150): string {
  if (typeof input !== 'string') {
    if (input === null || input === undefined) return ''
    input = String(input)
  }

  let text = (input as string)
    // Script ve stil bloklarını tamamen temizle
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Tüm HTML etiketlerini kaldır
    .replace(/<[^>]*>/g, '')
    // Tehlikeli inline olay işleyicilerini kaldır (onload, onerror, onclick vs.)
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    // Kontrol karakterlerini ve null byte'ları kaldır
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Fazla boşlukları tek boşluğa indir ve kırp
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length > maxLength) {
    text = text.slice(0, maxLength)
  }

  return text
}

/**
 * Çok satırlı metinleri temizler (ürün açıklaması, menü açıklaması, adres)
 * Güvenli satır sonlarını (\n) korur, zararlı HTML ve scriptleri temizler.
 */
export function sanitizeMultilineText(input: unknown, maxLength = 800): string {
  if (typeof input !== 'string') {
    if (input === null || input === undefined) return ''
    input = String(input)
  }

  let text = (input as string)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Peş peşe 3'ten fazla satır boşluğunu 2'ye indir
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (text.length > maxLength) {
    text = text.slice(0, maxLength)
  }

  return text
}

/**
 * Web URL'lerini güvenli şekilde doğrular ve temizler.
 * Yalnızca http://, https:// veya göreceli / bağlantılarına izin verir.
 * javascript:, data: ve vbscript: XSS saldırılarını engeller.
 */
export function sanitizeUrl(input: unknown, maxLength = 2048): string {
  if (typeof input !== 'string') return ''
  const trimmed = input.trim()
  if (!trimmed) return ''

  if (trimmed.length > maxLength) return ''

  // Tehlikeli protokol kontrolleri
  const lower = trimmed.toLowerCase()
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text') ||
    lower.startsWith('file:')
  ) {
    return ''
  }

  // Güvenli protokol veya relative path kontrolü
  if (
    lower.startsWith('https://') ||
    lower.startsWith('http://') ||
    lower.startsWith('//') ||
    lower.startsWith('/')
  ) {
    // Özel tırnak ve parantez karakterlerini temizle
    return trimmed.replace(/[<>"'`\s]/g, '')
  }

  // Eğer protokol yazılmamışsa ama geçerli bir web domaini ise başına https:// ekle
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
    return `https://${trimmed.replace(/[<>"'`\s]/g, '')}`
  }

  return ''
}

/**
 * Fiyat alanlarını güvenli şekilde temizler.
 * Yalnızca rakam, nokta, virgül ve geçerli para birimi sembollerine izin verir.
 */
export function sanitizePrice(input: unknown, maxLength = 20): string {
  if (typeof input !== 'string') {
    if (typeof input === 'number') return `${input} ₺`
    return ''
  }

  // Yalnızca rakam, virgül, nokta, boşluk ve para birimleri
  let cleaned = input.replace(/[^0-9.,₺$€£\sTLtl]/g, '').trim()
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength)
  }

  return cleaned
}

/**
 * Dosya adlarını Path Traversal (../../) saldırılarına karşı temizler.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') return 'unnamed_file'
  return filename
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\.\.+/g, '.')
    .replace(/[\x00-\x1f\x80-\x9f]/g, '')
    .trim()
}

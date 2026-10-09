/** Logodan menü ana rengi (primary) çıkarmak için istemci taraflı örnekleme. */

const DEFAULT_FALLBACK = '#e11d48'
const SAMPLE_SIZE = 64

function toHex(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function relativeLuminance(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function hslSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  const l = (max + min) / 2
  if (max === min) return 0
  const d = max - min
  return l > 0.5 ? d / (2 - max - min) : d / (max + min)
}

type Pixel = { r: number; g: number; b: number; a?: number }

function isUsablePixel(r: number, g: number, b: number, a: number): boolean {
  if (a < 128) return false
  const lum = relativeLuminance(r, g, b)
  if (lum < 0.04 || lum > 0.92) return false
  const spread = Math.max(r, g, b) - Math.min(r, g, b)
  if (spread < 8 && (lum < 0.15 || lum > 0.85)) return false
  return true
}

/** Canvas piksellerinden en uygun marka rengini seçer (test edilebilir). */
export function pickPrimaryBrandColorFromPixels(pixels: ReadonlyArray<Pixel>): string | null {
  const buckets = new Map<
    string,
    { count: number; r: number; g: number; b: number; satSum: number; lumSum: number }
  >()

  for (const p of pixels) {
    const a = p.a ?? 255
    if (!isUsablePixel(p.r, p.g, p.b, a)) continue
    const qr = p.r & 0xf0
    const qg = p.g & 0xf0
    const qb = p.b & 0xf0
    const key = `${qr},${qg},${qb}`
    const sat = hslSaturation(p.r, p.g, p.b)
    const lum = relativeLuminance(p.r, p.g, p.b)
    const cur = buckets.get(key)
    if (cur) {
      cur.count += 1
      cur.r += p.r
      cur.g += p.g
      cur.b += p.b
      cur.satSum += sat
      cur.lumSum += lum
    } else {
      buckets.set(key, { count: 1, r: p.r, g: p.g, b: p.b, satSum: sat, lumSum: lum })
    }
  }

  if (buckets.size === 0) {
    const muted = pixels.filter((p) => (p.a ?? 255) >= 128)
    if (muted.length === 0) return null
    let r = 0
    let g = 0
    let b = 0
    for (const p of muted) {
      r += p.r
      g += p.g
      b += p.b
    }
    const n = muted.length
    const hex = rgbToHex(r / n, g / n, b / n)
    return hex.toLowerCase() === '#ffffff' || hex.toLowerCase() === '#000000' ? null : hex
  }

  let bestScore = -1
  let best: { r: number; g: number; b: number } | null = null

  for (const b of buckets.values()) {
    const avgSat = b.satSum / b.count
    const avgLum = b.lumSum / b.count
    const lumWeight = 1 - Math.min(1, Math.abs(avgLum - 0.42) / 0.42)
    const score = b.count * (0.35 + avgSat * 1.25) * (0.5 + lumWeight)
    if (score > bestScore) {
      bestScore = score
      best = { r: b.r / b.count, g: b.g / b.count, b: b.b / b.count }
    }
  }

  return best ? rgbToHex(best.r, best.g, best.b) : null
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Görsel okunamadı'))
    img.src = dataUrl
  })
}

/** Data URL veya yüklü görselden ana marka rengini çıkarır. */
export async function extractPrimaryBrandColorFromDataUrl(dataUrl: string): Promise<string> {
  if (typeof document === 'undefined') return DEFAULT_FALLBACK
  try {
    const img = await loadImage(dataUrl)
    const w = img.naturalWidth || img.width
    const h = img.naturalHeight || img.height
    if (!w || !h) return DEFAULT_FALLBACK

    const scale = Math.min(1, SAMPLE_SIZE / Math.max(w, h))
    const cw = Math.max(1, Math.round(w * scale))
    const ch = Math.max(1, Math.round(h * scale))

    const canvas = document.createElement('canvas')
    canvas.width = cw
    canvas.height = ch
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return DEFAULT_FALLBACK

    ctx.drawImage(img, 0, 0, cw, ch)
    const { data } = ctx.getImageData(0, 0, cw, ch)
    const pixels: Pixel[] = []
    for (let i = 0; i < data.length; i += 4) {
      pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] })
    }
    const picked = pickPrimaryBrandColorFromPixels(pixels)
    return picked ?? DEFAULT_FALLBACK
  } catch {
    return DEFAULT_FALLBACK
  }
}

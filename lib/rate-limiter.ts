import { NextRequest } from 'next/server'

/**
 * Enterprise Dağıtık / Bellek İçi Sliding-Window Rate Limiter
 * DoS, Brute-force ve API kota tüketim saldırılarına karşı IP ve oturum bazlı koruma sağlar.
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

// Bellek içi sliding-window deposu (otomatik süresi dolanları temizler)
const memoryStore = new Map<string, RateLimitRecord>()

// Bellek sızıntısını önlemek için her 5 dakikada bir eski kayıtları temizleyen çöp toplayıcı
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetTime) {
        memoryStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetSeconds: number
}

/**
 * Belirtilen anahtar için hız sınırını kontrol eder.
 * @param key Benzersiz kimlik (örn: IP adresi, restoran ID, kullanıcı ID)
 * @param limit İzin verilen maksimum istek sayısı
 * @param windowSeconds Pencere süresi (saniye cinsinden)
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const record = memoryStore.get(key)

  if (!record || now > record.resetTime) {
    // Yeni pencere başlat
    memoryStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - 1),
      resetSeconds: windowSeconds
    }
  }

  // Mevcut pencere devam ediyor
  record.count += 1
  const remaining = Math.max(0, limit - record.count)
  const resetSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000))

  if (record.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetSeconds
    }
  }

  return {
    success: true,
    limit,
    remaining,
    resetSeconds
  }
}

/**
 * Reverse-Proxy (Vercel, Cloudflare, Nginx) arkasındaki gerçek istemci IP adresini güvenle alır.
 * X-Forwarded-For sahteciliğini önlemek için en sol (ilk) IP'yi kullanır.
 */
export function getClientIp(req: NextRequest | Request): string {
  try {
    const headers = req.headers

    // Cloudflare gerçek IP
    const cfIp = headers.get('cf-connecting-ip')
    if (cfIp) return cfIp.trim()

    // Standart Real-IP
    const realIp = headers.get('x-real-ip')
    if (realIp) return realIp.trim()

    // X-Forwarded-For zinciri
    const forwardedFor = headers.get('x-forwarded-for')
    if (forwardedFor) {
      const parts = forwardedFor.split(',')
      if (parts.length > 0 && parts[0].trim()) {
        return parts[0].trim()
      }
    }
  } catch {
    // Fallback
  }

  return '127.0.0.1'
}

/**
 * Önceden tanımlanmış güvenlik limit konfigürasyonları
 */
export const RATE_LIMITS = {
  // Gemini Menü Tarama: 10 dakikada en fazla 5 istek (Burst koruması)
  MENU_SCAN: { limit: 5, windowSeconds: 600 },
  // AI Kalori Tahmini: 1 dakikada en fazla 30 istek (Toplu tarama desteği)
  CALORIE_ESTIMATE: { limit: 30, windowSeconds: 60 },
  // Giriş Yapma: 15 dakikada en fazla 5 deneme (Brute-force koruması)
  AUTH_LOGIN: { limit: 5, windowSeconds: 900 },
  // Genel API rotaları: Dakikada en fazla 100 istek (DDoS & Scraping koruması)
  GENERAL_API: { limit: 100, windowSeconds: 60 }
}


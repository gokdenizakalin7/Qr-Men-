/**
 * Enterprise Güvenlik Olayları Loglama Modülü (Security Event Logger)
 * Şüpheli aktiviteleri, yetkisiz erişim denemelerini ve admin işlemlerini yapılandırılmış JSON formatında kayıt altına alır.
 * Asla şifre veya hassas veri sızdırmaz.
 */

export type SecurityEventType =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT'
  | 'IDOR_ACCESS_ATTEMPT'
  | 'SUSPICIOUS_PATH_PROBE'
  | 'ADMIN_ACTION'
  | 'INVALID_FILE_UPLOAD'

export interface SecurityEventData {
  type: SecurityEventType
  ip?: string
  userId?: string
  role?: string
  restaurantId?: string
  endpoint?: string
  details?: Record<string, any>
  timestamp?: string
}

/**
 * Hassas alanları (şifre, token vb.) loglardan güvenle maskeler
 */
function maskSensitiveData(obj: Record<string, any>): Record<string, any> {
  const SENSITIVE_KEYS = ['password', 'sifre', 'token', 'apiKey', 'secret', 'credentials', 'authorization']
  const cleaned: Record<string, any> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk))) {
      cleaned[key] = '***MASKELENDİ***'
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = maskSensitiveData(value)
    } else {
      cleaned[key] = value
    }
  }

  return cleaned
}

/**
 * Güvenlik olayını standart biçimde kaydeder
 */
export function logSecurityEvent(event: SecurityEventData): void {
  const logEntry = {
    level: event.type.includes('FAILURE') || event.type.includes('UNAUTHORIZED') || event.type.includes('IDOR') ? 'WARN' : 'INFO',
    type: event.type,
    ip: event.ip || 'unknown',
    userId: event.userId || 'anonymous',
    role: event.role || 'guest',
    restaurantId: event.restaurantId || 'none',
    endpoint: event.endpoint || 'none',
    details: event.details ? maskSensitiveData(event.details) : undefined,
    timestamp: new Date().toISOString()
  }

  // Production ortamında harici log aggregator'a (Datadog, Logtail, CloudWatch vb.) yönlendirilebilir
  const formatted = JSON.stringify(logEntry)
  
  if (logEntry.level === 'WARN') {
    console.warn(`[SECURITY ALERT] ${formatted}`)
  } else {
    console.info(`[SECURITY EVENT] ${formatted}`)
  }
}

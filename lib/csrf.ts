import { NextRequest } from 'next/server'
import crypto from 'crypto'

/**
 * Enterprise CSRF (Cross-Site Request Forgery) Koruma Modülü
 * State-changing (POST, PUT, DELETE, PATCH) istekleri doğrular.
 */

export const CSRF_COOKIE_NAME = 'qolay_csrf_token'
export const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Güvenli ve rastgele bir CSRF token üretir
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * İsteğin CSRF güvenliğini denetler
 * GET, HEAD, OPTIONS istekleri salt-okunur olduğundan otomatik onaylanır.
 */
export function verifyCsrf(req: NextRequest): boolean {
  const method = req.method.toUpperCase()
  // Güvenli (safe) HTTP metodları CSRF gerektirmez
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true
  }

  // Header veya body'den CSRF token oku
  const headerToken = req.headers.get(CSRF_HEADER_NAME)
  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value

  // İkisi de varsa ve tam olarak eşleşiyorsa güvenlidir (Double Submit Cookie Pattern)
  if (headerToken && cookieToken && headerToken === cookieToken) {
    return true
  }

  // Development ortamında veya test araçları için authorization header varsa kabul edilir
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return true
  }

  return false
}

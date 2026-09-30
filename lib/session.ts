/**
 * Enterprise Client Session and Cookie Manager
 * Senkronize localStorage ve Güvenli Çerez (Cookie) yönetimi sağlar.
 */

export function syncClientSessionCookies() {
  if (typeof window === 'undefined') return

  const role = localStorage.getItem('user_role')
  const isHttps = window.location.protocol === 'https:'
  const secureFlag = isHttps ? '; Secure' : ''

  if (role) {
    const rest = localStorage.getItem('currentRestaurant')
    let restId = ''
    if (rest) {
      try {
        restId = JSON.parse(rest)?.id || ''
      } catch {}
    }
    document.cookie = `user_role=${encodeURIComponent(role)}; Path=/; Max-Age=86400; SameSite=Lax${secureFlag}`
    if (restId) {
      document.cookie = `restaurant_id=${encodeURIComponent(restId)}; Path=/; Max-Age=86400; SameSite=Lax${secureFlag}`
    }
  }
}

export function setClientSession(params: { role: string; restaurant?: any; userId?: string }) {
  if (typeof window === 'undefined') return

  const isHttps = window.location.protocol === 'https:'
  const secureFlag = isHttps ? '; Secure' : ''

  localStorage.setItem('user_role', params.role)
  document.cookie = `user_role=${encodeURIComponent(params.role)}; Path=/; Max-Age=86400; SameSite=Lax${secureFlag}`

  if (params.restaurant) {
    localStorage.setItem('currentRestaurant', JSON.stringify(params.restaurant))
    if (params.restaurant.id) {
      document.cookie = `restaurant_id=${encodeURIComponent(params.restaurant.id)}; Path=/; Max-Age=86400; SameSite=Lax${secureFlag}`
    }
  }

  if (params.userId) {
    localStorage.setItem('user_id', params.userId)
    document.cookie = `user_id=${encodeURIComponent(params.userId)}; Path=/; Max-Age=86400; SameSite=Lax${secureFlag}`
  }
}

export function clearClientSession() {
  if (typeof window === 'undefined') return

  localStorage.removeItem('user_role')
  localStorage.removeItem('is_admin')
  localStorage.removeItem('is_admin_impersonating')
  localStorage.removeItem('currentRestaurant')
  localStorage.removeItem('user_id')

  // Cookie'leri geçersiz kıl
  document.cookie = 'user_role=; Path=/; Max-Age=0; SameSite=Lax'
  document.cookie = 'restaurant_id=; Path=/; Max-Age=0; SameSite=Lax'
  document.cookie = 'user_id=; Path=/; Max-Age=0; SameSite=Lax'
  document.cookie = 'qolay_csrf_token=; Path=/; Max-Age=0; SameSite=Lax'
}

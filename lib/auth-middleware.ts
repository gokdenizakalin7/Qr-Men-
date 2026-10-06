import { NextRequest, NextResponse } from 'next/server'
import { logSecurityEvent } from './security-logger'
import { getClientIp } from './rate-limiter'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Enterprise Sunucu Taraflı Yetkilendirme ve Çoklu Kiracı (Tenant / IDOR) Koruma Modülü
 */

export interface SessionUser {
  id: string
  role: 'superadmin' | 'admin' | 'restaurant'
  restaurantId?: string
}

export async function verifySession(req: NextRequest): Promise<SessionUser | null> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7).trim()
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return null
  }

  // user_metadata or app_metadata contains the role and organization info
  const role = (user.app_metadata?.role || user.user_metadata?.role || 'restaurant') as 'superadmin' | 'admin' | 'restaurant'
  const restaurantId = user.user_metadata?.organization_id

  return {
    id: user.id,
    role,
    restaurantId
  }
}

/**
 * İstekte geçerli bir oturum olmasını zorunlu kılar.
 * Oturum yoksa 401 Unauthorized yanıtı döner.
 */
export async function requireAuth(req: NextRequest): Promise<{ user: SessionUser } | { response: NextResponse }> {
  const user = await verifySession(req)
  if (!user) {
    logSecurityEvent({
      type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      ip: getClientIp(req),
      endpoint: req.nextUrl.pathname,
      details: { reason: 'Oturum bulunamadı veya geçersiz' }
    })

    return {
      response: NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekmektedir.', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
  }

  return { user }
}

export async function requireAdmin(req: NextRequest): Promise<{ user: SessionUser } | { response: NextResponse }> {
  const authCheck = await requireAuth(req)
  if ('response' in authCheck) return authCheck

  const user = authCheck.user
  if (user.role !== 'superadmin' && user.role !== 'admin') {
    logSecurityEvent({
      type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      ip: getClientIp(req),
      userId: user.id,
      role: user.role,
      endpoint: req.nextUrl.pathname,
      details: { reason: 'Admin yetkisi eksik' }
    })

    return {
      response: NextResponse.json(
        { error: 'Bu işlem yalnızca sistem yöneticilerine açıktır.', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }
  }

  return { user }
}

export async function requireSuperAdmin(req: NextRequest): Promise<{ user: SessionUser } | { response: NextResponse }> {
  const authCheck = await requireAuth(req)
  if ('response' in authCheck) return authCheck

  const user = authCheck.user
  if (user.role !== 'superadmin') {
    logSecurityEvent({
      type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      ip: getClientIp(req),
      userId: user.id,
      role: user.role,
      endpoint: req.nextUrl.pathname,
      details: { reason: 'Süper Admin yetkisi eksik' }
    })

    return {
      response: NextResponse.json(
        { error: 'Bu işlem yalnızca Süper Adminlere açıktır.', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }
  }

  return { user }
}

/**
 * IDOR Koruması: Restoran kullanıcısının yalnızca kendi restoranına ait verilere erişmesini sağlar.
 * Süper Admin kullanıcılar tüm restoranlara erişebilir.
 */
export async function requireOwnership(
  req: NextRequest,
  targetRestaurantId: string
): Promise<{ user: SessionUser } | { response: NextResponse }> {
  const authCheck = await requireAuth(req)
  if ('response' in authCheck) return authCheck

  const user = authCheck.user

  // SuperAdmin her restorana erişebilir
  if (user.role === 'superadmin' || user.role === 'admin') {
    return { user }
  }

  // Restoran kullanıcısı yalnızca kendi restoranına erişebilir
  if (user.restaurantId && user.restaurantId !== targetRestaurantId) {
    logSecurityEvent({
      type: 'IDOR_ACCESS_ATTEMPT',
      ip: getClientIp(req),
      userId: user.id,
      role: user.role,
      restaurantId: user.restaurantId,
      endpoint: req.nextUrl.pathname,
      details: { targetRestaurantId }
    })

    return {
      response: NextResponse.json(
        { error: 'Bu restoranın verilerine erişim yetkiniz bulunmamaktadır.', code: 'FORBIDDEN_RESOURCE' },
        { status: 403 }
      )
    }
  }

  return { user }
}

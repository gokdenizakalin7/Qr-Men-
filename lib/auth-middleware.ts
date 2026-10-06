import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from './supabase-admin'
import { logSecurityEvent } from './security-logger'
import { getClientIp } from './rate-limiter'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Sunucu taraflı kimlik doğrulama ve çoklu kiracı (IDOR) yetkilendirme modülü.
 *
 * Kimlik yalnızca Supabase tarafından imzalanmış erişim token'ından (Authorization: Bearer)
 * doğrulanır. Çerezler, localStorage veya istemcinin gönderdiği rol bilgisi ASLA güvenilmez.
 */

const SUPER_ADMIN_EMAIL = (
  process.env.SUPER_ADMIN_EMAIL || 'gokdenizakalin7@gmail.com'
).toLowerCase()

export interface AuthUser {
  id: string
  email: string
  isSuperAdmin: boolean
}

type Denied = { response: NextResponse }

function deny(status: number, error: string, code: string): Denied {
  return { response: NextResponse.json({ error, code }, { status }) }
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
 * Geçerli bir oturum zorunlu kılar. Yoksa 401 döner.
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
    return deny(401, 'Bu işlem için giriş yapmanız gerekmektedir.', 'UNAUTHORIZED')
  }
  return { user }
}

export async function requireAdmin(req: NextRequest): Promise<{ user: SessionUser } | { response: NextResponse }> {
  const authCheck = await requireAuth(req)
  if ('response' in authCheck) return authCheck

  if (user.isSuperAdmin) return { user, organizationId }

  const { data } = await supabaseAdmin
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('organization_id', organizationId)
    .maybeSingle()

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
      ip: getClientIp(req as NextRequest),
      userId: user.id,
      endpoint: new URL(req.url).pathname,
      details: { targetOrganizationId: organizationId },
    })
    return deny(
      403,
      'Bu restoranın verilerine erişim yetkiniz bulunmamaktadır.',
      'FORBIDDEN_RESOURCE'
    )
  }

  return { user, organizationId }
}

/**
 * Subdomain'den organizasyonu bulur ve erişim yetkisini doğrular.
 * Organizasyon yoksa 404 döner (otomatik oluşturma yapılmaz).
 */
export async function requireSubdomainAccess(
  req: NextRequest | Request,
  subdomain: string
): Promise<{ user: AuthUser; organizationId: string } | Denied> {
  const auth = await requireUser(req)
  if ('response' in auth) return auth

  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('subdomain', subdomain)
    .maybeSingle()

  if (!org) return deny(404, 'Organizasyon bulunamadı.', 'ORG_NOT_FOUND')

  return requireOrgAccess(req, org.id)
}

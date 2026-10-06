import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from './supabase-admin'
import { logSecurityEvent } from './security-logger'
import { getClientIp } from './rate-limiter'

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

/**
 * Bearer token'ı Supabase ile doğrular. Geçersizse null döner.
 */
async function getAuthUser(req: NextRequest | Request): Promise<AuthUser | null> {
  const header = req.headers.get('authorization')
  if (!header || !header.startsWith('Bearer ')) return null

  const token = header.slice(7).trim()
  if (!token) return null

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data?.user) return null

  const email = (data.user.email || '').toLowerCase()
  return {
    id: data.user.id,
    email,
    isSuperAdmin: email === SUPER_ADMIN_EMAIL,
  }
}

/**
 * Geçerli bir oturum zorunlu kılar. Yoksa 401 döner.
 */
export async function requireUser(
  req: NextRequest | Request
): Promise<{ user: AuthUser } | Denied> {
  const user = await getAuthUser(req)
  if (!user) {
    logSecurityEvent({
      type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      ip: getClientIp(req as NextRequest),
      endpoint: new URL(req.url).pathname,
      details: { reason: 'Geçersiz veya eksik oturum' },
    })
    return deny(401, 'Bu işlem için giriş yapmanız gerekmektedir.', 'UNAUTHORIZED')
  }
  return { user }
}

/**
 * Kullanıcının verilen organizasyonun üyesi (veya süper admin) olmasını zorunlu kılar.
 */
export async function requireOrgAccess(
  req: NextRequest | Request,
  organizationId: string
): Promise<{ user: AuthUser; organizationId: string } | Denied> {
  const auth = await requireUser(req)
  if ('response' in auth) return auth
  const { user } = auth

  if (user.isSuperAdmin) return { user, organizationId }

  const { data } = await supabaseAdmin
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('organization_id', organizationId)
    .maybeSingle()

  if (!data) {
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

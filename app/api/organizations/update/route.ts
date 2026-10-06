import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { requireOrgAccess, requireUser } from '@/lib/auth-middleware'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { subdomain, id, name, currency, businessInfo, branding } = body

    if (!subdomain && !id) {
      return NextResponse.json({ error: 'Organization ID or Subdomain is required' }, { status: 400 })
    }

    const auth = await requireUser(request)
    if ('response' in auth) return auth.response

    // Hedef organizasyonu sunucuda çöz
    let lookup = supabase.from('organizations').select('id')
    lookup = subdomain ? lookup.eq('subdomain', subdomain) : lookup.eq('id', id)
    const { data: org } = await lookup.maybeSingle()

    if (!org) {
      return NextResponse.json({ error: 'Organizasyon bulunamadı.' }, { status: 404 })
    }

    const access = await requireOrgAccess(request, org.id)
    if ('response' in access) return access.response

    // Frontend alanlarını DB sütunlarına eşle
    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name
    if (currency !== undefined) updateData.currency = currency

    if (businessInfo) {
      if (businessInfo.phone !== undefined) updateData.business_phone = businessInfo.phone
      if (businessInfo.address !== undefined) updateData.address = businessInfo.address
      if (businessInfo.city !== undefined) updateData.city = businessInfo.city
      if (businessInfo.wifi_name !== undefined) updateData.wifi_name = businessInfo.wifi_name
      if (businessInfo.wifi_password !== undefined) updateData.wifi_password = businessInfo.wifi_password
    }

    if (branding) {
      if (branding.primaryColor !== undefined) updateData.primary_color = branding.primaryColor
      if (branding.bannerUrl !== undefined) updateData.cover_url = branding.bannerUrl
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Güncellenecek alan yok.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', org.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, organization: data })
  } catch (error: any) {
    console.error('Error updating organization:', error)
    return NextResponse.json({ error: 'Ayarlar güncellenemedi.' }, { status: 500 })
  }
}

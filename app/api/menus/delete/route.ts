import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { requireOrgAccess, requireUser } from '@/lib/auth-middleware'

export async function POST(request: Request) {
  try {
    // Önce kimlik: oturumsuz isteklerde menü varlığı sızdırılmaz
    const auth = await requireUser(request)
    if ('response' in auth) return auth.response

    const { menuId } = await request.json()

    if (!menuId || typeof menuId !== 'string') {
      return NextResponse.json({ error: 'menuId gerekli' }, { status: 400 })
    }

    // Henüz veritabanına kaydedilmemiş geçici menü
    if (menuId.startsWith('menu-')) {
      return NextResponse.json({ success: true })
    }

    const { data: menu } = await supabase
      .from('menus')
      .select('organization_id')
      .eq('id', menuId)
      .maybeSingle()

    if (!menu) {
      return NextResponse.json({ error: 'Menü bulunamadı.' }, { status: 404 })
    }

    const access = await requireOrgAccess(request, menu.organization_id)
    if ('response' in access) return access.response

    const { error } = await supabase.from('menus').delete().eq('id', menuId)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Delete menu error:', err)
    return NextResponse.json({ error: 'Menü silinemedi.' }, { status: 500 })
  }
}

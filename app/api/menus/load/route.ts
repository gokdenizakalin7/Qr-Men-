import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth-middleware'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subdomain = searchParams.get('subdomain')

    // Kimlik doğrulama ve organizasyon sorgusu birbirinden bağımsız: paralel çalıştır
    const [authCheck, orgResult] = await Promise.all([
      requireAuth(request),
      subdomain
        ? supabase.from('organizations').select('id').eq('subdomain', subdomain).single()
        : Promise.resolve(null),
    ])
    if ('response' in authCheck) return authCheck.response

    if (!subdomain) {
      return NextResponse.json({ error: 'Missing subdomain' }, { status: 400 })
    }

    const orgData = orgResult?.data
    if (orgResult?.error || !orgData) {
      return NextResponse.json({ menus: [] }) // return empty, will use default template
    }

    // Menü + kategori + ürünler tek sorguda (eskiden 3 ardışık sorguydu)
    const { data: menusData, error: menusError } = await supabase
      .from('menus')
      .select(
        'id, name, description, image_url, is_listed, layout, created_at, updated_at, categories(*, items(*))'
      )
      .eq('organization_id', orgData.id)
      .order('created_at', { ascending: true })
      .order('display_order', { ascending: true, referencedTable: 'categories' })
      .order('display_order', { ascending: true, referencedTable: 'categories.items' })

    if (menusError || !menusData || menusData.length === 0) {
      return NextResponse.json({ menus: [] })
    }

    const menusWithDetails = menusData.map((menu: any) => ({
      ...menu,
      categories: (menu.categories || []).map((cat: any) => ({
        ...cat,
        items: cat.items || [],
      })),
    }))

    return NextResponse.json({ menus: menusWithDetails })
  } catch (err: any) {
    console.error("Load error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

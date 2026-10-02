import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cbezoygmckwthryftcax.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subdomain = searchParams.get('subdomain')

    if (!subdomain) {
      return NextResponse.json({ error: 'Missing subdomain' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('subdomain', subdomain)
      .single()

    if (orgError || !orgData) {
      return NextResponse.json({ menus: [] }) // return empty, will use default template
    }

    const { data: menusData, error: menusError } = await supabase
      .from('menus')
      .select('id, name, description, image_url, is_listed, layout, created_at, updated_at')
      .eq('organization_id', orgData.id)
      .limit(1)

    if (menusError || !menusData || menusData.length === 0) {
      return NextResponse.json({ menus: [] })
    }

    const menu: any = menusData[0]

    // Fetch categories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .eq('menu_id', menu.id)
      .order('display_order', { ascending: true })

    if (categoriesData && categoriesData.length > 0) {
      // Fetch items for these categories
      const categoryIds = categoriesData.map(c => c.id)
      const { data: itemsData } = await supabase
        .from('items')
        .select('*')
        .in('category_id', categoryIds)
        .order('display_order', { ascending: true })

      // Reconstruct nested JSON
      menu.categories = categoriesData.map(cat => ({
        ...cat,
        items: (itemsData || []).filter(i => i.category_id === cat.id)
      }))
    } else {
      menu.categories = []
    }

    return NextResponse.json({ menus: [menu] })
  } catch (err: any) {
    console.error("Load error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

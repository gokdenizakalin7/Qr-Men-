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
      .order('created_at', { ascending: true })

    if (menusError || !menusData || menusData.length === 0) {
      return NextResponse.json({ menus: [] })
    }

    const menuIds = menusData.map(m => m.id)

    // Fetch all categories for these menus
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .in('menu_id', menuIds)
      .order('display_order', { ascending: true })

    let allItems: any[] = []
    if (categoriesData && categoriesData.length > 0) {
      const categoryIds = categoriesData.map(c => c.id)
      const { data: itemsData } = await supabase
        .from('items')
        .select('*')
        .in('category_id', categoryIds)
        .order('display_order', { ascending: true })
      
      if (itemsData) {
        allItems = itemsData
      }
    }

    const menusWithDetails = menusData.map(menu => {
      const menuCategories = (categoriesData || []).filter(c => c.menu_id === menu.id)
      
      const categoriesWithItems = menuCategories.map(cat => ({
        ...cat,
        items: allItems.filter(i => i.category_id === cat.id)
      }))

      return {
        ...menu,
        categories: categoriesWithItems
      }
    })

    return NextResponse.json({ menus: menusWithDetails })
  } catch (err: any) {
    console.error("Load error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

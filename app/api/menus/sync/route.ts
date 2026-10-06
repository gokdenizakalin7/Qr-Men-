import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cbezoygmckwthryftcax.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
  try {
    const { subdomain, menus } = await request.json()
    
    if (!subdomain || !menus || !Array.isArray(menus)) {
      return NextResponse.json({ error: 'Missing data or menus is not an array' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Get organization id by subdomain
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('subdomain', subdomain)
      .single()

    let organizationId = orgData?.id

    if (orgError || !orgData) {
      // Auto-create organization if missing (helpful for mock subdomains)
      const { data: newOrg, error: newOrgErr } = await supabase
        .from('organizations')
        .insert({
          name: 'Restoranım',
          subdomain: subdomain
        })
        .select('id')
        .single()

      if (newOrgErr || !newOrg) {
        return NextResponse.json({ error: 'Failed to create missing organization' }, { status: 500 })
      }
      organizationId = newOrg.id
    }

    // 2. Fetch existing menus
    const { data: existingMenus } = await supabase
      .from('menus')
      .select('id')
      .eq('organization_id', organizationId)

    const existingIds = (existingMenus || []).map(m => m.id)
    const incomingIds = menus.map(m => m.id)

    // Delete menus that are not in the incoming payload (if this is a full sync)
    // Wait, if LiveMenuEditor only sends ONE menu, we SHOULD NOT delete the others!
    // So we'll only upsert the incoming menus.
    // If MenusContent wants to delete a menu, it should hit a separate delete endpoint, OR we need a flag.
    // Let's check: MenusContent sends all menus. LiveMenuEditor sends ONE menu.
    // If we only upsert, how do we delete?
    // In MenusContent, we can call a DELETE endpoint. 

    // For now, let's just UPSERT the menus provided in the payload.
    for (const menu of menus) {
      let menuId = menu.id
      const isNewMockId = menuId.startsWith('menu-')

      if (isNewMockId) {
        // Insert
        const { data: newMenu, error: newMenuErr } = await supabase.from('menus').insert({
          organization_id: organizationId,
          name: menu.name || 'Menü',
          description: menu.description || '',
          image_url: menu.image_url || '',
          is_listed: menu.is_listed !== false,
          layout: menu.layout || 'grid'
        }).select('id').single()
        
        if (newMenuErr) throw newMenuErr
        menuId = newMenu.id
      } else {
        // Update
        await supabase.from('menus').update({
          name: menu.name || 'Menü',
          description: menu.description || '',
          image_url: menu.image_url || '',
          is_listed: menu.is_listed !== false,
          layout: menu.layout || 'grid'
        }).eq('id', menuId)
      }

      // 3. Upsert Categories & Items
      // We will delete old categories for this specific menu and recreate them
      await supabase.from('categories').delete().eq('menu_id', menuId)

      for (let i = 0; i < (menu.categories || []).length; i++) {
        const cat = menu.categories[i]
        const { data: newCat, error: catErr } = await supabase.from('categories').insert({
          menu_id: menuId,
          name: cat.name,
          description: cat.description || '',
          display_order: i,
          is_active: cat.is_active !== false
        }).select('id').single()

        if (catErr) continue

        if (cat.items && cat.items.length > 0) {
          const itemsToInsert = cat.items.map((item: any, j: number) => ({
            category_id: newCat.id,
            name: item.name,
            description: item.description || '',
            price: item.price || '0',
            image_url: item.image_url || '',
            allergens: item.allergens || [],
            calories: item.calories || null,
            is_available: item.is_available !== false,
            is_featured: item.is_featured === true,
            display_order: j,
            tags: item.tags || []
          }))

          await supabase.from('items').insert(itemsToInsert)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Sync error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

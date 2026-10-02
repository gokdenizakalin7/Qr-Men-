import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cbezoygmckwthryftcax.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
  try {
    const { subdomain, menu } = await request.json()
    
    if (!subdomain || !menu) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Get organization id by subdomain
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('subdomain', subdomain)
      .single()

    let organizationId = orgData?.id

    if (orgError || !organizationId) {
      // Create organization if it doesn't exist (for migration)
      const { data: newOrg, error: insertOrgError } = await supabase
        .from('organizations')
        .insert({ subdomain, name: subdomain, role: 'restaurant', status: 'active' })
        .select('id')
        .single()
        
      if (insertOrgError) throw insertOrgError
      organizationId = newOrg.id
    }

    // 2. Upsert Menu
    // We assume the menu object from frontend has an id, but if it's 'menu-1', we might want to generate a real UUID
    // For simplicity in this migration, we'll just insert/update based on organization_id
    
    // Check if menu exists for this org
    const { data: existingMenu } = await supabase
      .from('menus')
      .select('id')
      .eq('organization_id', organizationId)
      .limit(1)

    let menuId = existingMenu?.[0]?.id

    if (menuId) {
      // Update
      await supabase.from('menus').update({
        name: menu.name || 'Menü',
        description: menu.description || '',
        image_url: menu.image_url || '',
        is_listed: menu.is_listed !== false,
        layout: menu.layout || 'grid'
      }).eq('id', menuId)
    } else {
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
    }

    // 3. Upsert Categories & Items
    // Since we are replacing the whole menu, we can delete old categories and insert new ones to avoid complex syncing.
    // (In a production app with real IDs, you'd do precise UPSERTs, but for this migration JSON drop is safest)
    
    await supabase.from('categories').delete().eq('menu_id', menuId)

    for (let i = 0; i < menu.categories.length; i++) {
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

    return NextResponse.json({ success: true, menuId })
  } catch (err: any) {
    console.error("Sync error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

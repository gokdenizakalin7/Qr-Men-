import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { requireSubdomainAccess } from '@/lib/auth-middleware'

export async function POST(request: Request) {
  try {
    const { subdomain, menus } = await request.json()

    if (!subdomain || typeof subdomain !== 'string' || !Array.isArray(menus)) {
      return NextResponse.json({ error: 'Missing data or menus is not an array' }, { status: 400 })
    }

    // Kimlik + organizasyon sahipliği (organizasyon artık otomatik oluşturulmaz)
    const access = await requireSubdomainAccess(request, subdomain)
    if ('response' in access) return access.response
    const organizationId = access.organizationId

    // Bu organizasyona ait mevcut menü kimlikleri (IDOR koruması)
    const { data: ownMenus } = await supabase
      .from('menus')
      .select('id')
      .eq('organization_id', organizationId)
    const ownMenuIds = new Set((ownMenus || []).map(m => m.id))

    // Geçici (menu-...) kimliklerin gerçek veritabanı kimliklerine karşılığı
    const idMap: Record<string, string> = {}

    // Yalnızca gelen menüleri upsert eder; silme ayrı endpoint'tedir.
    for (const menu of menus) {
      let menuId: string = menu.id
      const isNewMockId = typeof menuId !== 'string' || menuId.startsWith('menu-')

      const baseFields = {
        name: menu.name || 'Menü',
        description: menu.description || '',
        image_url: menu.image_url || '',
        is_listed: menu.is_listed !== false,
        layout: menu.layout || 'grid',
      }

      if (isNewMockId) {
        const { data: newMenu, error: newMenuErr } = await supabase
          .from('menus')
          .insert({ organization_id: organizationId, ...baseFields })
          .select('id')
          .single()
        if (newMenuErr) throw newMenuErr
        if (typeof menu.id === 'string') idMap[menu.id] = newMenu.id
        menuId = newMenu.id
      } else {
        if (!ownMenuIds.has(menuId)) {
          return NextResponse.json(
            { error: 'Bu menüyü düzenleme yetkiniz yok.', code: 'FORBIDDEN_RESOURCE' },
            { status: 403 }
          )
        }
        const { error: updErr } = await supabase
          .from('menus')
          .update(baseFields)
          .eq('id', menuId)
          .eq('organization_id', organizationId)
        if (updErr) throw updErr
      }

      // Kategorileri ve ürünleri yeniden oluştur
      await supabase.from('categories').delete().eq('menu_id', menuId)

      for (let i = 0; i < (menu.categories || []).length; i++) {
        const cat = menu.categories[i]
        const { data: newCat, error: catErr } = await supabase
          .from('categories')
          .insert({
            menu_id: menuId,
            name: cat.name,
            description: cat.description || '',
            display_order: i,
            is_active: cat.is_active !== false,
          })
          .select('id')
          .single()

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
            tags: item.tags || [],
          }))

          await supabase.from('items').insert(itemsToInsert)
        }
      }
    }

    return NextResponse.json({ success: true, idMap })
  } catch (err: any) {
    console.error('Sync error:', err)
    return NextResponse.json({ error: 'Menü kaydedilemedi.' }, { status: 500 })
  }
}

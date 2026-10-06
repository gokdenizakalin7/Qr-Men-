import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    // Yalnızca yayında olan (is_listed = true) menüleri ve aktif kategorileri/ürünleri getirir
    const { data, error } = await supabase
      .from('menus')
      .select(`
        id, name, description, image_url, layout,
        categories (
          id, name, description, display_order,
          items (
            id, name, description, price, image_url, allergens, calories, is_available, display_order, tags
          )
        )
      `)
      .eq('organization_id', orgId)
      .eq('is_listed', true)
      .eq('categories.is_active', true)
      .eq('categories.items.is_available', true);

    if (error) {
      console.error('Error fetching public menus:', error);
      return NextResponse.json({ error: 'Menus not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in public menus API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

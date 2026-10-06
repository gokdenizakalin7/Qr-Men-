import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');

    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain is required' }, { status: 400 });
    }

    // Yalnızca güvenli alanları seçiyoruz.
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, logo_url, cover_url, primary_color, currency, address, city, business_phone, wifi_name, wifi_password')
      .eq('subdomain', subdomain)
      .single();

    if (error || !data) {
      console.error('Restaurant not found for subdomain:', subdomain, error);
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching public restaurant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

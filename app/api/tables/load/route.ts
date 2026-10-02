import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subdomain = searchParams.get('subdomain')

    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain parameter is missing' }, { status: 400 })
    }

    // 1. Get organization id
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('subdomain', subdomain)
      .single()

    if (orgError || !orgData) {
      return NextResponse.json({ tables: [] }) 
    }

    // 2. Load tables
    const { data: tablesData, error: tablesError } = await supabase
      .from('qr_tables')
      .select('id, name, views')
      .eq('organization_id', orgData.id)

    if (tablesError || !tablesData) {
      return NextResponse.json({ tables: [] })
    }

    return NextResponse.json({ tables: tablesData })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

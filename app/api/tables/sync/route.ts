import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const { subdomain, tables } = await request.json()

    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain is required' }, { status: 400 })
    }

    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('subdomain', subdomain)
      .single()

    if (orgError || !orgData) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const orgId = orgData.id

    // 1. Get existing tables
    const { data: existingTables } = await supabase
      .from('qr_tables')
      .select('id')
      .eq('organization_id', orgId)

    const existingIds = (existingTables || []).map(t => t.id)
    const incomingIds = (tables || []).map((t: any) => t.id)

    // 2. Find tables to delete
    const idsToDelete = existingIds.filter(id => !incomingIds.includes(id))
    if (idsToDelete.length > 0) {
      await supabase.from('qr_tables').delete().in('id', idsToDelete)
    }

    // 3. Insert or update tables
    const upsertData = (tables || []).map((t: any) => ({
      id: t.id.startsWith('tbl-') ? undefined : t.id, // Let DB generate UUID if it's a new mock id
      organization_id: orgId,
      name: t.name,
      views: t.views || 0,
      updated_at: new Date().toISOString()
    }))

    if (upsertData.length > 0) {
      // Split new vs existing
      const newTables = upsertData.filter(t => !t.id)
      const existingToUpdate = upsertData.filter(t => t.id)

      if (newTables.length > 0) {
        await supabase.from('qr_tables').insert(newTables)
      }
      
      for (const table of existingToUpdate) {
        await supabase.from('qr_tables').update({
          name: table.name,
          views: table.views
        }).eq('id', table.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

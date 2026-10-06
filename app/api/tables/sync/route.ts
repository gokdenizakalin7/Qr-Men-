import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { requireSubdomainAccess } from '@/lib/auth-middleware'

export async function POST(request: Request) {
  try {
    const { subdomain, tables } = await request.json()

    if (!subdomain || typeof subdomain !== 'string') {
      return NextResponse.json({ error: 'Subdomain is required' }, { status: 400 })
    }
    if (!Array.isArray(tables)) {
      return NextResponse.json({ error: 'tables bir dizi olmalı' }, { status: 400 })
    }

    const access = await requireSubdomainAccess(request, subdomain)
    if ('response' in access) return access.response
    const orgId = access.organizationId

    // Mevcut masalar
    const { data: existingTables } = await supabase
      .from('qr_tables')
      .select('id')
      .eq('organization_id', orgId)

    const existingIds = new Set((existingTables || []).map(t => t.id))
    const incomingIds = new Set(tables.map((t: any) => t.id))

    // Silinecek masalar (yalnızca bu organizasyonun masaları)
    const idsToDelete = [...existingIds].filter(id => !incomingIds.has(id))
    if (idsToDelete.length > 0) {
      const { error } = await supabase
        .from('qr_tables')
        .delete()
        .eq('organization_id', orgId)
        .in('id', idsToDelete)
      if (error) throw error
    }

    const newTables = tables
      .filter((t: any) => typeof t.id !== 'string' || t.id.startsWith('tbl-'))
      .map((t: any) => ({
        organization_id: orgId,
        name: t.name,
        views: t.views || 0,
      }))

    if (newTables.length > 0) {
      const { error } = await supabase.from('qr_tables').insert(newTables)
      if (error) throw error
    }

    // Güncelleme: yalnızca bu organizasyonda var olan kimlikler
    const toUpdate = tables.filter(
      (t: any) => typeof t.id === 'string' && !t.id.startsWith('tbl-') && existingIds.has(t.id)
    )
    for (const table of toUpdate) {
      const { error } = await supabase
        .from('qr_tables')
        .update({ name: table.name, views: table.views || 0 })
        .eq('id', table.id)
        .eq('organization_id', orgId)
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Tables sync error:', error)
    return NextResponse.json({ error: 'Masalar kaydedilemedi.' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const itemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.string().optional(),
  image_url: z.string().optional(),
  allergens: z.array(z.string()).optional(),
  calories: z.number().nullable().optional(),
  is_available: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  tags: z.array(z.string()).optional()
})

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
  items: z.array(itemSchema).optional()
})

const menuSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  image_url: z.string().optional(),
  is_listed: z.boolean().optional(),
  layout: z.string().optional(),
  categories: z.array(categorySchema).optional()
})

const payloadSchema = z.object({
  subdomain: z.string().min(1),
  menus: z.array(menuSchema)
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = payloadSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Geçersiz veri formatı', details: result.error.format() }, { status: 400 })
    }

    const { subdomain, menus } = result.data
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

    // Call the RPC function to sync menus in a single transaction
    // This requires the sync_menus_transaction RPC to be defined in Supabase
    // If it's not defined, this will fail safely.
    const { data, error } = await supabase.rpc('sync_menus_transaction', {
      p_org_id: organizationId,
      p_menus: menus
    })

    if (error) {
      console.error("RPC sync error:", error)
      return NextResponse.json({ error: 'Senkronizasyon sırasında veritabanı hatası oluştu.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, idMap })
  } catch (err: any) {
    console.error('Sync error:', err)
    return NextResponse.json({ error: 'Menü kaydedilemedi.' }, { status: 500 })
  }
}

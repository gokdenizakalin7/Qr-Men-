import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Bypass RLS using service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, name, currency, businessInfo, branding } = body

    if (!id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    // Map frontend fields to DB columns
    const updateData: any = {
      name,
      currency,
    }

    if (businessInfo) {
      if (businessInfo.phone !== undefined) updateData.business_phone = businessInfo.phone
      if (businessInfo.address !== undefined) updateData.address = businessInfo.address
      if (businessInfo.city !== undefined) updateData.city = businessInfo.city
      if (businessInfo.wifi_name !== undefined) updateData.wifi_name = businessInfo.wifi_name
      if (businessInfo.wifi_password !== undefined) updateData.wifi_password = businessInfo.wifi_password
      // Note: We don't have DB columns for instagram, whatsapp, etc yet. 
      // A robust MVP might store these in a JSONB 'settings' column, but for now we'll just update what exists.
    }

    if (branding) {
      if (branding.primaryColor !== undefined) updateData.primary_color = branding.primaryColor
      if (branding.bannerUrl !== undefined) updateData.cover_url = branding.bannerUrl
    }

    const { data, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, organization: data })
  } catch (error: any) {
    console.error('Error updating organization:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

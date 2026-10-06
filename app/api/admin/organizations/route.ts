import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireSuperAdmin } from '@/lib/auth-middleware'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireSuperAdmin(request)
    if ('response' in authCheck) return authCheck.response

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('*')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ organizations: orgs })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireSuperAdmin(request)
    if ('response' in authCheck) return authCheck.response

    const body = await request.json()
    const { name, subdomain, business_phone } = body

    if (!name || !subdomain) {
      return NextResponse.json({ error: 'Name and subdomain are required' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: org, error } = await supabase
      .from('organizations')
      .insert({
        name,
        subdomain,
        business_phone
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ organization: org })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

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

    const { data: users, error } = await supabase.auth.admin.listUsers()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ users: users.users })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

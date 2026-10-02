import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cbezoygmckwthryftcax.supabase.co'
const supabaseAnonKey = 'sb_publishable_-HFFhB2J673GFikS6iowkg_E0Leq4Yr'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

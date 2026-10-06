import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let token = ''
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim()
    } else {
      token = request.cookies.get('sb-access-token')?.value || '' // or whichever cookie stores the token
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user organization
    const { data: memberData } = await supabase
      .from('organization_members')
      .select('organization_id, role, organizations(name, subdomain, business_phone)')
      .eq('user_id', user.id)
      .single()

    const responseData = {
      id: user.id,
      email: user.email,
      role: memberData?.role || 'user',
      organization: memberData ? {
        id: memberData.organization_id,
        name: (memberData.organizations as any)?.name,
        subdomain: (memberData.organizations as any)?.subdomain,
      } : null
    }

    return NextResponse.json(responseData)
  } catch (error: any) {
    console.error("Auth me error:", error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

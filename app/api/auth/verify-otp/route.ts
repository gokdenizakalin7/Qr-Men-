import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = body.email?.trim().toLowerCase()
    const code = body.code?.trim()

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: 'E-posta ve doğrulama kodu gereklidir.' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Supabase OTP Doğrulama
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email'
    })

    if (error || !data.user) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz veya süresi dolmuş kod. (Hata: ' + (error?.message || 'Bilinmiyor') + ')' },
        { status: 400 }
      )
    }

    // Başarılı
    return NextResponse.json({
      success: true,
      message: 'Doğrulama başarılı.',
      verified: true,
      session: data.session
    })
  } catch (error) {
    console.error('[2FA] OTP doğrulama hatası:', error)
    return NextResponse.json(
      { success: false, message: 'Doğrulama sırasında hata oluştu.' },
      { status: 500 }
    )
  }
}

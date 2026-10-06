import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = body.email?.trim().toLowerCase()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Geçerli bir e-posta adresi girin.' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Supabase yerel OTP akışı (Magic Link / OTP)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false // Sadece kayıtlı kullanıcılar için
      }
    })

    if (error) {
      console.error('[2FA] Supabase OTP gönderme hatası:', error)
      return NextResponse.json(
        { success: false, message: 'Doğrulama kodu gönderilemedi. Lütfen daha sonra tekrar deneyin.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Doğrulama bağlantısı/kodu e-posta adresinize gönderildi.'
    })
  } catch (error) {
    console.error('[2FA] Beklenmeyen OTP gönderme hatası:', error)
    return NextResponse.json(
      { success: false, message: 'İşlem sırasında bir hata oluştu.' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

/**
 * OTP (One-Time Password) Gönderme Endpoint'i
 * 
 * Development: Kodu response'ta döner (ekranda gösterilir)
 * Production: Gerçek e-posta servisi entegre edilir (Resend, SendGrid, vb.)
 */

// Bellekte OTP saklama (production'da Redis/DB kullanılmalı)
const otpStore = global as unknown as { __otpStore?: Map<string, { code: string; expiresAt: number; attempts: number }> }
if (!otpStore.__otpStore) {
  otpStore.__otpStore = new Map()
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

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

    // Rate limiting: Aynı email için 60 saniyede 1 OTP
    const existing = otpStore.__otpStore!.get(email)
    if (existing && existing.expiresAt > Date.now() && (existing.expiresAt - Date.now()) > 4 * 60 * 1000) {
      return NextResponse.json(
        { success: false, message: 'Doğrulama kodu zaten gönderildi. Lütfen 60 saniye bekleyin.' },
        { status: 429 }
      )
    }

    const code = generateOTP()
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5 dakika geçerli

    otpStore.__otpStore!.set(email, { code, expiresAt, attempts: 0 })

    // Eski OTP'leri temizle (bellek sızıntısı önleme)
    for (const [key, val] of otpStore.__otpStore!.entries()) {
      if (val.expiresAt < Date.now()) {
        otpStore.__otpStore!.delete(key)
      }
    }

    const isDev = process.env.NODE_ENV !== 'production'

    if (isDev) {
      // Development: Kodu response'ta geri gönder
      console.log(`[2FA-DEV] E-posta: ${email} | OTP Kodu: ${code}`)
      return NextResponse.json({
        success: true,
        message: 'Doğrulama kodu gönderildi.',
        devOnly: { code }, // Sadece development modunda
        expiresIn: 300 // saniye
      })
    } else {
      // Production: Burada gerçek e-posta gönderimi yapılır
      // Örnek: Resend, SendGrid, Nodemailer, AWS SES vb.
      // await sendEmail({ to: email, subject: 'Qolay Doğrulama Kodu', body: `Kodunuz: ${code}` })

      return NextResponse.json({
        success: true,
        message: 'Doğrulama kodu e-posta adresinize gönderildi.',
        expiresIn: 300
      })
    }
  } catch (error) {
    console.error('[2FA] OTP gönderme hatası:', error)
    return NextResponse.json(
      { success: false, message: 'Doğrulama kodu gönderilemedi. Tekrar deneyin.' },
      { status: 500 }
    )
  }
}

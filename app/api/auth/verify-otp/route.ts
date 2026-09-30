import { NextRequest, NextResponse } from 'next/server'

/**
 * OTP (One-Time Password) Doğrulama Endpoint'i
 * Kullanıcının girdiği kodu server'daki kayıtlı kod ile karşılaştırır.
 */

const otpStore = global as unknown as { __otpStore?: Map<string, { code: string; expiresAt: number; attempts: number }> }

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

    if (!otpStore.__otpStore) {
      return NextResponse.json(
        { success: false, message: 'Doğrulama kodu bulunamadı. Lütfen yeni kod talep edin.' },
        { status: 400 }
      )
    }

    const stored = otpStore.__otpStore.get(email)

    if (!stored) {
      return NextResponse.json(
        { success: false, message: 'Doğrulama kodu bulunamadı. Lütfen yeni kod talep edin.' },
        { status: 400 }
      )
    }

    // Süre kontrolü
    if (stored.expiresAt < Date.now()) {
      otpStore.__otpStore.delete(email)
      return NextResponse.json(
        { success: false, message: 'Doğrulama kodunun süresi dolmuş. Lütfen yeni kod talep edin.' },
        { status: 400 }
      )
    }

    // Deneme sayısı kontrolü (maks 5 yanlış deneme)
    if (stored.attempts >= 5) {
      otpStore.__otpStore.delete(email)
      return NextResponse.json(
        { success: false, message: '5 kez hatalı kod girildi. Lütfen yeni doğrulama kodu talep edin.' },
        { status: 429 }
      )
    }

    // Kod doğrulama
    if (stored.code !== code) {
      stored.attempts += 1
      const remaining = 5 - stored.attempts
      return NextResponse.json(
        { success: false, message: `Doğrulama kodu hatalı. (Kalan deneme: ${remaining})` },
        { status: 400 }
      )
    }

    // Başarılı — OTP'yi temizle (tek kullanımlık)
    otpStore.__otpStore.delete(email)

    return NextResponse.json({
      success: true,
      message: 'Doğrulama başarılı.',
      verified: true
    })
  } catch (error) {
    console.error('[2FA] OTP doğrulama hatası:', error)
    return NextResponse.json(
      { success: false, message: 'Doğrulama sırasında hata oluştu.' },
      { status: 500 }
    )
  }
}

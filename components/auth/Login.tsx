'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QrCode, ArrowLeft, Key, ExternalLink, ShieldCheck, Mail, Loader2, Timer, ArrowRight } from 'lucide-react'
import { MOCK_RESTAURANTS, SYSTEM_USERS } from '@/lib/mock-data'
import { Restaurant, UserAccount } from '@/lib/types'
import { ForgotPasswordModal } from '@/components/modals/ForgotPasswordModal'
import { motion, AnimatePresence } from 'framer-motion'
import { setClientSession } from '@/lib/session'
import { safeJsonParse } from '@/lib/utils'

type LoginStep = 'credentials' | 'otp'

interface MatchedCredentials {
  user?: UserAccount
  restaurant?: Restaurant
  role: string
}

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pendingActivationToken, setPendingActivationToken] = useState<string | null>(null)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [showDemoAccounts, setShowDemoAccounts] = useState(false)
  const navigate = useNavigate()

  // 2FA State
  const [loginStep, setLoginStep] = useState<LoginStep>('credentials')
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [isOtpSending, setIsOtpSending] = useState(false)
  const [isOtpVerifying, setIsOtpVerifying] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(0)
  const [matchedCredentials, setMatchedCredentials] = useState<MatchedCredentials | null>(null)
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null) // Dev mode: kodu göster
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Brute-force koruma
  const MAX_FAILED_ATTEMPTS = 5
  const LOCKOUT_MS = 15 * 60 * 1000

  const getFailedAttempts = () => {
    if (typeof window === 'undefined') return { count: 0, lockedUntil: 0 }
    try {
      const data = localStorage.getItem('login_attempt_tracker')
      return data ? JSON.parse(data) : { count: 0, lockedUntil: 0 }
    } catch {
      return { count: 0, lockedUntil: 0 }
    }
  }

  const recordFailedAttempt = () => {
    const current = getFailedAttempts()
    const newCount = current.count + 1
    let lockedUntil = 0
    if (newCount >= MAX_FAILED_ATTEMPTS) {
      lockedUntil = Date.now() + LOCKOUT_MS
    }
    localStorage.setItem('login_attempt_tracker', JSON.stringify({ count: newCount, lockedUntil }))
    return { newCount, lockedUntil }
  }

  const resetFailedAttempts = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('login_attempt_tracker')
    }
  }

  // OTP Countdown Timer
  useEffect(() => {
    if (otpCountdown <= 0) return
    const timer = setInterval(() => {
      setOtpCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [otpCountdown])

  // OTP Input handler (6 haneli)
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste desteği
      const chars = value.replace(/\D/g, '').split('').slice(0, 6)
      const newOtp = [...otpCode]
      chars.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char
      })
      setOtpCode(newOtp)
      const nextIndex = Math.min(index + chars.length, 5)
      otpInputRefs.current[nextIndex]?.focus()
      return
    }

    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otpCode]
    newOtp[index] = value
    setOtpCode(newOtp)

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  // ADIM 1: Kimlik bilgilerini doğrula ve OTP gönder
  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setPendingActivationToken(null)

    // Brute-force kontrolü
    const tracker = getFailedAttempts()
    if (tracker.lockedUntil && tracker.lockedUntil > Date.now()) {
      const remainingMin = Math.ceil((tracker.lockedUntil - Date.now()) / 60000)
      setError(`Çok fazla başarısız giriş denemesi. Hesabınız ${remainingMin} dakika kilitli.`)
      return
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanPass = password.trim()

    // 1. Sistem kullanıcıları kontrolü
    const storedUsers: UserAccount[] = safeJsonParse(localStorage.getItem('system_users'), [])
    const allUsers = [...storedUsers, ...SYSTEM_USERS]
    const matchedUser = allUsers.find(u => u.email?.toLowerCase() === cleanEmail)

    if (matchedUser) {
      if (matchedUser.status === 'pending_activation') {
        setError('Hesabınız henüz etkinleştirilmemiştir. Lütfen aktivasyon linki üzerinden şifrenizi belirleyin.')
        setPendingActivationToken(matchedUser.activationToken || '')
        return
      }

      const validPassword = matchedUser.password || 'Password123!'
      if (validPassword === cleanPass) {
        // Şifre doğru → OTP gönder
        await sendOtp(cleanEmail, { user: matchedUser, role: matchedUser.role })
        return
      }
    }

    // 2. Restoranlar listesi üzerinden kontrol
    const allRestaurants: Restaurant[] = safeJsonParse(localStorage.getItem('all_restaurants'), [])
    const combinedRestaurants = [...allRestaurants, ...MOCK_RESTAURANTS]
    const restaurant = combinedRestaurants.find(r => (r.credentials?.email || r.businessInfo?.email)?.toLowerCase() === cleanEmail)

    if (restaurant) {
      if (restaurant.status === 'pending_activation') {
        setError('Bu restoran hesabı için henüz şifre belirlenmemiştir. Lütfen aktivasyon linkini kullanın.')
        setPendingActivationToken(restaurant.activationToken || '')
        return
      }

      if (restaurant.status === 'passive') {
        setError('Bu hesap dondurulmuş durumdadır. Lütfen sistem yöneticisi ile iletişime geçin.')
        return
      }

      const restPass = restaurant.credentials?.password || 'Password123!'
      if (restPass === cleanPass) {
        const role = restaurant.role || 'restaurant'
        await sendOtp(cleanEmail, { restaurant, role })
        return
      }
    }

    // Başarısız deneme kaydı
    const { newCount, lockedUntil } = recordFailedAttempt()
    if (lockedUntil > 0) {
      setError('5 kez hatalı şifre denendi. Giriş 15 dakika boyunca kilitlendi.')
    } else {
      const remainingAttempts = MAX_FAILED_ATTEMPTS - newCount
      setError(`E-posta veya şifre hatalı. (Kalan deneme hakkı: ${remainingAttempts})`)
    }
  }

  // OTP Gönder
  const sendOtp = async (targetEmail: string, credentials: MatchedCredentials) => {
    setIsOtpSending(true)
    setError('')

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Doğrulama kodu gönderilemedi.')
        setIsOtpSending(false)
        return
      }

      setMatchedCredentials(credentials)
      setLoginStep('otp')
      setOtpCode(['', '', '', '', '', ''])
      setOtpCountdown(data.expiresIn || 300)

      // Development modunda kodu göster
      if (data.devOnly?.code) {
        setDevOtpCode(data.devOnly.code)
      }

      // İlk input'a odaklan
      setTimeout(() => otpInputRefs.current[0]?.focus(), 200)
    } catch {
      setError('Doğrulama kodu gönderilemedi. Tekrar deneyin.')
    } finally {
      setIsOtpSending(false)
    }
  }

  // ADIM 2: OTP Doğrula
  const handleOtpVerify = useCallback(async () => {
    const code = otpCode.join('')
    if (code.length !== 6) {
      setError('Lütfen 6 haneli doğrulama kodunu eksiksiz girin.')
      return
    }

    setIsOtpVerifying(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code })
      })

      const data = await res.json()

      if (!res.ok || !data.verified) {
        setError(data.message || 'Doğrulama başarısız.')
        setIsOtpVerifying(false)
        return
      }

      // OTP doğrulandı → Giriş yap
      resetFailedAttempts()

      if (matchedCredentials?.user) {
        const user = matchedCredentials.user
        if (user.role === 'superadmin') {
          setClientSession({ role: 'superadmin', userId: user.id })
          localStorage.setItem('is_admin', 'true')
          navigate('/admin')
        } else {
          localStorage.removeItem('is_admin')
          localStorage.removeItem('is_admin_impersonating')
          const allRestaurants: Restaurant[] = safeJsonParse(localStorage.getItem('all_restaurants'), [])
          const combined = [...allRestaurants, ...MOCK_RESTAURANTS]
          const rest = combined.find(r => r.id === user.restaurantId || (r.credentials?.email || r.businessInfo?.email)?.toLowerCase() === user.email?.toLowerCase()) || combined[0]
          setClientSession({ role: user.role, restaurant: rest, userId: user.id })
          navigate('/dashboard/menu-editor')
        }
      } else if (matchedCredentials?.restaurant) {
        const restaurant = matchedCredentials.restaurant
        const role = restaurant.role || 'restaurant'
        setClientSession({ role, restaurant, userId: restaurant.id })

        if (role === 'superadmin') {
          localStorage.setItem('is_admin', 'true')
          navigate('/admin')
        } else {
          localStorage.removeItem('is_admin')
          navigate('/dashboard/menu-editor')
        }
      }
    } catch {
      setError('Doğrulama sırasında hata oluştu. Tekrar deneyin.')
    } finally {
      setIsOtpVerifying(false)
    }
  }, [otpCode, email, matchedCredentials, navigate])

  // OTP 6 hane dolunca otomatik doğrula
  useEffect(() => {
    const code = otpCode.join('')
    if (code.length === 6 && loginStep === 'otp' && !isOtpVerifying) {
      handleOtpVerify()
    }
  }, [otpCode, loginStep, isOtpVerifying, handleOtpVerify])

  const fillCredentials = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail)
    setPassword(fillPass)
    setError('')
    setPendingActivationToken(null)
    setLoginStep('credentials')
    setDevOtpCode(null)
  }

  const handleBackToCredentials = () => {
    setLoginStep('credentials')
    setOtpCode(['', '', '', '', '', ''])
    setError('')
    setDevOtpCode(null)
    setMatchedCredentials(null)
  }

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center text-primary font-extrabold text-2xl mb-1">
              <QrCode className="h-7 w-7 mr-2" />
              Qolay
            </Link>
          </div>

          <Card className="w-full shadow-lg border-0 bg-white overflow-hidden">
            <AnimatePresence mode="wait">
              {loginStep === 'credentials' ? (
                <motion.div
                  key="credentials"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader className="space-y-1 text-center pb-3">
                    <CardTitle className="text-2xl font-bold">Giriş Yap</CardTitle>
                    <CardDescription>Hesabınıza erişmek için bilgilerinizi girin</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCredentialSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="email">E-posta Adresi</Label>
                        <Input
                          id="email"
                          placeholder="ad@ornek.com"
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="password">Şifre</Label>
                          <button
                            type="button"
                            onClick={() => setIsForgotPasswordOpen(true)}
                            className="text-xs text-primary hover:underline"
                          >
                            Şifremi unuttum
                          </button>
                        </div>
                        <Input
                          id="password"
                          required
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      {error && (
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-700 space-y-2">
                          <p>{error}</p>
                          {pendingActivationToken && (
                            <Button 
                              type="button" 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                              onClick={() => navigate(`/activate?token=${pendingActivationToken}`)}
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-1" /> Şifremi Şimdi Belirle (Aktivasyon)
                            </Button>
                          )}
                        </div>
                      )}

                      <Button className="w-full text-base font-semibold py-5" type="submit" disabled={isOtpSending}>
                        {isOtpSending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Doğrulama Kodu Gönderiliyor...
                          </>
                        ) : (
                          <>
                            Devam Et
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>

                    {/* Geliştirme Kolaylığı İçin Hızlı Doldurma */}
                    {process.env.NODE_ENV !== 'production' && (
                      <div className="mt-6 pt-3 border-t text-center">
                        <button
                          type="button"
                          onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                          className="text-xs text-gray-400 hover:text-gray-700 flex items-center justify-center mx-auto"
                        >
                          <Key className="h-3 w-3 mr-1" />
                          {showDemoAccounts ? 'Örnek Hesapları Gizle' : 'Örnek Hesapları Göster (Dev)'}
                        </button>

                        {showDemoAccounts && (
                          <div className="mt-3 text-left text-xs border rounded-lg p-3 bg-gray-50 space-y-2">
                            <p className="font-semibold text-gray-600">Tek tıkla formu doldurun:</p>
                            <div 
                              onClick={() => fillCredentials('gokdenizakalin7@gmail.com', 'Password123!')}
                              className="p-2 bg-white rounded border hover:border-primary cursor-pointer transition-colors"
                            >
                              <div className="font-bold text-gray-900">Sistem Yöneticisi (Admin)</div>
                              <div className="text-gray-500 font-mono text-[11px]">gokdenizakalin7@gmail.com</div>
                            </div>
                            <div 
                              onClick={() => fillCredentials('mehmet@lezzetocakbasi.com', 'Password123!')}
                              className="p-2 bg-white rounded border hover:border-primary cursor-pointer transition-colors"
                            >
                              <div className="font-bold text-gray-900">Mehmet Usta (Lezzet Ocakbaşı)</div>
                              <div className="text-gray-500 font-mono text-[11px]">mehmet@lezzetocakbasi.com</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader className="space-y-1 text-center pb-3">
                    <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-2">
                      <ShieldCheck className="h-7 w-7 text-emerald-600" />
                    </div>
                    <CardTitle className="text-xl font-bold">İki Adımlı Doğrulama</CardTitle>
                    <CardDescription className="text-sm">
                      <Mail className="inline h-3.5 w-3.5 mr-1 text-gray-400" />
                      <span className="font-medium text-gray-700">{maskedEmail}</span> adresine 6 haneli doğrulama kodu gönderildi.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Dev mode: OTP kodu göster */}
                    {devOtpCode && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                          🛠 Geliştirici Modu — Doğrulama Kodu
                        </p>
                        <p className="text-2xl font-mono font-extrabold text-amber-900 tracking-[0.3em]">
                          {devOtpCode}
                        </p>
                        <p className="text-[10px] text-amber-600 mt-1">
                          Production'da bu kod e-posta ile gönderilir
                        </p>
                      </div>
                    )}

                    {/* 6 Haneli OTP Input */}
                    <div className="flex justify-center gap-2.5">
                      {otpCode.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { otpInputRefs.current[index] = el }}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={(e) => {
                            e.preventDefault()
                            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
                            if (pasted) handleOtpChange(0, pasted)
                          }}
                          className={`w-11 h-13 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all
                            ${digit ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-white text-gray-900'}
                            focus:border-primary focus:ring-2 focus:ring-primary/20
                          `}
                          disabled={isOtpVerifying}
                        />
                      ))}
                    </div>

                    {/* Countdown */}
                    {otpCountdown > 0 && (
                      <div className="flex items-center justify-center text-xs text-gray-500">
                        <Timer className="h-3.5 w-3.5 mr-1" />
                        Kod geçerlilik süresi: <span className="font-bold ml-1 text-gray-700">{formatCountdown(otpCountdown)}</span>
                      </div>
                    )}

                    {error && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-700">
                        <p>{error}</p>
                      </div>
                    )}

                    <Button
                      className="w-full text-base font-semibold py-5"
                      onClick={handleOtpVerify}
                      disabled={otpCode.join('').length !== 6 || isOtpVerifying}
                    >
                      {isOtpVerifying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Doğrulanıyor...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Doğrula ve Giriş Yap
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={handleBackToCredentials}
                        className="text-gray-500 hover:text-gray-900 flex items-center"
                      >
                        <ArrowLeft className="h-3 w-3 mr-1" />
                        Geri Dön
                      </button>
                      <button
                        type="button"
                        onClick={() => sendOtp(email.trim().toLowerCase(), matchedCredentials!)}
                        disabled={otpCountdown > 240} // 60 sn bekleme
                        className={`flex items-center ${otpCountdown > 240 ? 'text-gray-300 cursor-not-allowed' : 'text-primary hover:underline'}`}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Kodu Tekrar Gönder
                      </button>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          <div className="text-center">
            <Link to="/" className="inline-flex items-center text-xs text-gray-500 hover:text-gray-900">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Ana Sayfaya Dön
            </Link>
          </div>
        </div>

        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
        />
      </div>
    </motion.div>
  )
}

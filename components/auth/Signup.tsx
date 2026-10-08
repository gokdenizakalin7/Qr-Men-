'use client'

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { QrCode, Loader2, ArrowRight, Lock, Mail, ChefHat, User, Store } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { clearApiCache } from '@/lib/api-client'
import { TermsOfServiceModal } from '@/components/modals/TermsOfServiceModal'
import { PrivacyPolicyModal } from '@/components/modals/PrivacyPolicyModal'

const inputCls =
  'w-full bg-black/20 border border-white/10 text-white placeholder-white/30 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all shadow-inner'
const labelCls = 'text-xs font-bold text-white/70 uppercase tracking-wider pl-1'

export function Signup() {
  const [ownerName, setOwnerName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [website, setWebsite] = useState('') // honeypot
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (password.length < 8) {
      setError('Şifreniz en az 8 karakter olmalıdır.')
      return
    }
    if (!accepted) {
      setError('Devam etmek için Kullanım Koşulları ve Gizlilik Politikası’nı onaylamalısınız.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName,
          businessName,
          email: email.trim().toLowerCase(),
          password,
          acceptTerms: true,
          website,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error || 'Kayıt tamamlanamadı.')
        return
      }
      if (data.verifyEmail) {
        setInfo('Hesabınız oluşturuldu. Lütfen e-postanıza gelen doğrulama bağlantısına tıklayın.')
        return
      }
      if (data.needsLogin || !data.session) {
        window.location.href = '/login'
        return
      }

      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })
      clearApiCache()
      window.location.href = '/onboarding'
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black font-sans py-10">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70 backdrop-blur-[2px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[460px] px-6"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center relative w-20 h-20 rounded-[24px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl mb-5">
            <QrCode className="h-10 w-10 text-white" />
            <div className="absolute -top-3 -right-3 bg-black/50 backdrop-blur-md rounded-full p-1 border border-white/10">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Ücretsiz Hesap Oluştur</h1>
          <p className="text-white/60 font-medium">Dakikalar içinde dijital menünüzü yayınlayın</p>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-7 rounded-[32px] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className={labelCls} htmlFor="ownerName">Adınız Soyadınız</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input id="ownerName" required minLength={2} maxLength={80} placeholder="Ayşe Yılmaz" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelCls} htmlFor="businessName">İşletme Adı</label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input id="businessName" required minLength={2} maxLength={100} placeholder="Örn: Köşe Kafe" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelCls} htmlFor="email">E-Posta Adresi</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input id="email" required type="email" placeholder="ad@ornek.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelCls} htmlFor="password">Şifre (en az 8 karakter)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input id="password" required type="password" minLength={8} maxLength={100} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Bot tuzağı: insanlara görünmez */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
              name="website"
            />

            <label className="flex items-start gap-3 text-xs text-white/70 leading-relaxed cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/30 accent-white"
              />
              <span>
                <button type="button" onClick={() => setIsTermsOpen(true)} className="underline text-white">Kullanım Koşulları</button>
                {' '}ve{' '}
                <button type="button" onClick={() => setIsPrivacyOpen(true)} className="underline text-white">Gizlilik Politikası</button>
                ’nı okudum, kabul ediyorum.
              </span>
            </label>

            <AnimatePresence>
              {(error || info) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className={`p-4 rounded-2xl text-sm font-medium text-center backdrop-blur-md border ${error ? 'bg-red-500/20 border-red-500/30 text-red-100' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-100'}`}>
                    {error || info}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex justify-center items-center py-4 px-4 text-base font-extrabold rounded-2xl text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-black" />
              ) : (
                <>
                  Hesabı Oluştur ve Başla
                  <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-white/60">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="font-bold text-white underline">Giriş yapın</Link>
        </p>
      </motion.div>

      <TermsOfServiceModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  )
}

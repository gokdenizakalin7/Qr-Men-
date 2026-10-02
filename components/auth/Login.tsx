'use client'

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QrCode, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { setClientSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // GOD USER (Süper Admin) e-postası
  const SUPER_ADMIN_EMAIL = 'gokdenizakalin7@gmail.com' 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // 1. Supabase'e doğrudan değil, kendi arka ucumuz (API) üzerinden bağlanıyoruz.
      // Bu, Safari/VPN/Adblocker gibi tarayıcı engellerini (Failed to fetch) %100 aşar!
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim()
        })
      })

      const responseData = await res.json()

      if (!res.ok || responseData.error) {
        setError(responseData.error || 'E-posta veya şifre hatalı.')
        setIsLoading(false)
        return
      }

      const authData = responseData.data

      if (!authData?.user) {
        setError('Kullanıcı bilgisi alınamadı.')
        setIsLoading(false)
        return
      }

      // Tarayıcıya oturumu kaydet
      await supabase.auth.setSession({
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token
      })

      const userEmail = authData.user.email?.toLowerCase()

      // 2. God User Kontrolü
      if (userEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
        setClientSession({ role: 'superadmin', userId: authData.user.id })
        localStorage.setItem('is_admin', 'true')
        window.location.href = '/admin'
        return
      }

      // 3. Normal Restoran Kullanıcısı Kontrolü
      // Hangi restorana ait olduğunu organization_members tablosundan bul
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id, role, organizations(*)')
        .eq('user_id', authData.user.id)
        .single()

      if (memberData && memberData.organizations) {
        const org = memberData.organizations
        
        // Frontend'in eski mock sistemini bozmamak için veriyi localstorage'a formatlı koyuyoruz
        localStorage.setItem('currentRestaurant', JSON.stringify({
          subdomain: org.subdomain,
          name: org.name,
          id: org.id
        }))
        localStorage.setItem('user_role', memberData.role)
        localStorage.removeItem('is_admin')
        
        setClientSession({ role: memberData.role, restaurant: org, userId: authData.user.id })
        window.location.href = '/dashboard'
      } else {
        // Kullanıcının atanmış bir restoranı yok
        setError('Hesabınıza atanmış bir restoran bulunamadı. Lütfen yönetici ile iletişime geçin.')
        await supabase.auth.signOut()
      }

    } catch (err) {
      console.error(err)
      setError('Giriş yapılırken beklenmeyen bir hata oluştu.')
    } finally {
      setIsLoading(false)
    }
  }

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
              QR Chef
            </Link>
          </div>

          <Card className="w-full shadow-lg border-0 bg-white overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                  key="credentials"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader className="space-y-1 text-center pb-3">
                    <CardTitle className="text-2xl font-bold">Giriş Yap</CardTitle>
                    <CardDescription>Yönetim paneline erişmek için bilgilerinizi girin</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
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
                        <Label htmlFor="password">Şifre</Label>
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
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full font-semibold"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Giriş Yapılıyor...
                          </>
                        ) : (
                          'Giriş Yap'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </motion.div>
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

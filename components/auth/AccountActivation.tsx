'use client'

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QrCode, CheckCircle2, Lock, ShieldCheck, ArrowRight, Store, AlertTriangle } from 'lucide-react'
import { Restaurant, UserAccount } from '@/lib/types'
import { MOCK_RESTAURANTS, SYSTEM_USERS } from '@/lib/mock-data'
import { motion } from 'framer-motion'

export function AccountActivation() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  // Token'ı URL parametresinden veya query'den al (?token=xyz...)
  const queryParams = new URLSearchParams(location.search)
  const token = params.token || queryParams.get('token') || ''

  const [targetAccount, setTargetAccount] = useState<{ restaurant?: Restaurant; user?: UserAccount } | null>(null)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    // LocalStorage veya Mock Data üzerinden token ile hesabı bul
    const storedRestaurants: Restaurant[] = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('all_restaurants') || '[]')
      : []
    const allRestaurants = [...storedRestaurants, ...MOCK_RESTAURANTS]

    const storedUsers: UserAccount[] = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('system_users') || '[]')
      : []
    const allUsers = [...storedUsers, ...SYSTEM_USERS]

    // Token ile eşleşen restoran veya kullanıcı
    const matchedRest = allRestaurants.find(r => r.activationToken === token)
    const matchedUser = allUsers.find(u => u.activationToken === token)

    if (matchedRest || matchedUser) {
      setTargetAccount({ restaurant: matchedRest, user: matchedUser })
    } else if (!token) {
      // Token yoksa ama test için demo olarak ilk bekleyen hesabı bul
      const pendingRest = allRestaurants.find(r => r.status === 'pending_activation')
      if (pendingRest) {
        setTargetAccount({ restaurant: pendingRest })
      }
    }

    setLoading(false)
  }, [token])

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Şifreniz en az 6 karakter uzunluğunda olmalıdır.')
      return
    }

    if (password !== confirmPassword) {
      setError('Girdiğiniz şifreler birbiriyle eşleşmiyor.')
      return
    }

    const rest = targetAccount?.restaurant
    const user = targetAccount?.user

    // Restoran verisini güncelle
    if (rest) {
      const storedRestaurants: Restaurant[] = JSON.parse(localStorage.getItem('all_restaurants') || '[]')
      const updatedList = storedRestaurants.map(r => {
        if (r.id === rest.id || (token && r.activationToken === token)) {
          return {
            ...r,
            status: 'active' as const,
            activationToken: undefined,
            credentials: { ...r.credentials, password }
          }
        }
        return r
      })
      localStorage.setItem('all_restaurants', JSON.stringify(updatedList))
      
      // Oturumu başlat
      const activatedRest = { ...rest, status: 'active' as const, credentials: { ...rest.credentials, password } }
      localStorage.setItem('currentRestaurant', JSON.stringify(activatedRest))
      localStorage.setItem('user_role', 'restaurant')
    }

    // Kullanıcı verisini güncelle
    if (user) {
      const storedUsers: UserAccount[] = JSON.parse(localStorage.getItem('system_users') || '[]')
      const updatedUsers = storedUsers.map(u => {
        if (u.id === user.id || (token && u.activationToken === token)) {
          return {
            ...u,
            status: 'active' as const,
            activationToken: undefined,
            password
          }
        }
        return u
      })
      localStorage.setItem('system_users', JSON.stringify(updatedUsers))
    }

    setIsSuccess(true)

    // 2 saniye sonra doğrudan Canlı Menü Editörüne yönlendir
    setTimeout(() => {
      navigate('/dashboard/menu-editor')
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!targetAccount?.restaurant && !targetAccount?.user && !isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <Card className="max-w-md w-full text-center p-6 bg-white shadow-lg">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold">Geçersiz veya Süresi Dolmuş Link</CardTitle>
          <CardDescription className="mt-2 text-sm text-gray-600">
            Aktivasyon linki bulunamadı veya hesabınız daha önce başarıyla etkinleştirilmiş olabilir.
          </CardDescription>
          <div className="mt-6">
            <Button className="w-full" asChild>
              <Link to="/login">Giriş Yap Ekranına Git</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12"
    >
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-primary font-extrabold text-2xl mb-1">
            <QrCode className="h-7 w-7 mr-2" />
            Qolay
          </Link>
        </div>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Hesabınızı Etkinleştirin</CardTitle>
            <CardDescription className="text-xs">
              {targetAccount?.restaurant ? (
                <>
                  <strong className="text-gray-900">{targetAccount.restaurant.name}</strong> restoranı için lütfen giriş şifrenizi belirleyin.
                </>
              ) : (
                'Hesabınızı kullanmaya başlamak için lütfen şifrenizi belirleyin.'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {isSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Hesabınız Başarıyla Etkinleştirildi!</h3>
                <p className="text-xs text-gray-500">
                  Şifreniz kaydedildi. Menü yönetim panelinize yönlendiriliyorsunuz...
                </p>
              </div>
            ) : (
              <form onSubmit={handleActivate} className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-xl border text-xs space-y-1">
                  <div className="text-gray-500">Kayıtlı E-posta:</div>
                  <div className="font-bold text-gray-900 font-mono">
                    {targetAccount?.restaurant?.credentials?.email || targetAccount?.user?.email}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pass">Yeni Şifreniz</Label>
                  <Input
                    id="pass"
                    type="password"
                    placeholder="En az 6 karakter"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-pass">Şifrenizi Tekrar Girin</Label>
                  <Input
                    id="confirm-pass"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">{error}</p>
                )}

                <Button className="w-full text-base font-semibold py-5" type="submit">
                  Şifremi Kaydet & Giriş Yap <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Enterprise Admin Rota Kalkanı (AdminGuard)
 * /admin/* rotalarına yalnızca 'superadmin' veya 'admin' rolündeki kullanıcıların erişmesini sağlar.
 * Restoran kullanıcıları veya yetkisiz kişiler erişmeye çalıştığında anında bloklar ve yönlendirir.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const role = localStorage.getItem('user_role')
    const isAdminFlag = localStorage.getItem('is_admin') === 'true' || localStorage.getItem('is_admin_impersonating') === 'true'
    const isAdmin = role === 'superadmin' || role === 'admin' || isAdminFlag

    if (!isAdmin) {
      setIsAuthorized(false)
      // 3 saniye sonra otomatik restoran paneline yönlendir
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            navigate(role === 'restaurant' ? '/dashboard/menu-editor' : '/login')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    } else {
      setIsAuthorized(true)
    }
  }, [navigate])

  if (isAuthorized === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Yetkisiz Erişim Ekranı (403 Forbidden Shield)
  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl space-y-5 border border-red-100">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-inner">
            <ShieldAlert className="h-9 w-9" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
              403 • Yetkisiz Erişim
            </span>
            <h2 className="text-xl font-extrabold text-gray-900">Bu Sayfaya Erişim Yetkiniz Yok</h2>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Sistem yönetimi ve kullanıcı listeleri yalnızca <strong>Süper Yöneticilere (Admin)</strong> açıktır. Restoran kullanıcıları bu alana erişemez.
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 font-medium">
            {countdown > 0 ? (
              <p>{countdown} saniye içinde restoran panelinize yönlendiriliyorsunuz...</p>
            ) : (
              <p>Yönlendiriliyor...</p>
            )}
          </div>

          <div className="pt-2">
            <Button
              onClick={() => navigate('/dashboard/menu-editor')}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-5"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Restoran Paneline Dön
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Enterprise Oturum Kalkanı (AuthGuard)
 * /dashboard/* rotalarına yalnızca giriş yapmış kullanıcıların erişmesini sağlar.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const role = localStorage.getItem('user_role')
    const currentRest = localStorage.getItem('currentRestaurant')

    if (!role && !currentRest) {
      setIsAuthenticated(false)
      navigate('/login')
    } else {
      setIsAuthenticated(true)
    }
  }, [navigate])

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-lg space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Giriş Yapmalısınız</h3>
          <p className="text-xs text-gray-500">Bu panele erişmek için lütfen önce giriş yapın.</p>
          <Button onClick={() => navigate('/login')} className="w-full">
            Giriş Sayfasına Git
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

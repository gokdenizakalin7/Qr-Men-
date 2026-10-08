'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authFetch } from '@/lib/api-client'
import type { Restaurant } from '@/lib/types'

export type ProfilePatch = Record<string, unknown>

interface RestaurantContextValue {
  restaurant: Restaurant | null
  email: string
  role: string
  isLoading: boolean
  onboardingCompleted: boolean
  refresh: () => Promise<void>
  /** Sunucuya kaydeder ve yerel durumu günceller. Hata varsa fırlatır. */
  save: (patch: ProfilePatch) => Promise<Restaurant>
  uploadAsset: (kind: 'logo' | 'cover', dataUrl: string) => Promise<string>
  removeAsset: (kind: 'logo' | 'cover') => Promise<void>
}

const Ctx = createContext<RestaurantContextValue | null>(null)

function persistLegacy(r: Restaurant | null) {
  try {
    if (r) localStorage.setItem('currentRestaurant', JSON.stringify(r))
  } catch {
    // depolama dolu / kapalı
  }
}

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('restaurant')
  const [onboardingCompleted, setOnboardingCompleted] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await authFetch('/api/auth/me')
      if (!res.ok) return
      const data = await res.json()
      setEmail(data.email || '')
      setRole(data.role || 'restaurant')
      setOnboardingCompleted(data.organization ? !!data.organization.onboardingCompleted : true)
      if (data.restaurant) {
        setRestaurant(data.restaurant)
        persistLegacy(data.restaurant)
      } else if (data.role === 'superadmin' || data.role === 'admin') {
        // Süper admin "restoran olarak görüntüle" (impersonation): seçili restoran localStorage'da
        try {
          const stored = localStorage.getItem('currentRestaurant')
          if (stored) setRestaurant(JSON.parse(stored))
        } catch {
          // bozuk kayıt
        }
      }
    } catch (err) {
      console.error('Profil yüklenemedi', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const save = useCallback(
    async (patch: ProfilePatch) => {
      if (!restaurant) throw new Error('Restoran yüklenmedi.')
      const res = await authFetch('/api/organizations/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: restaurant.id, ...patch }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Kaydedilemedi.')
      const next: Restaurant = { ...data.restaurant, businessInfo: { ...data.restaurant.businessInfo, email } }
      setRestaurant(next)
      setOnboardingCompleted(!!data.organization?.onboarding_completed_at)
      persistLegacy(next)
      return next
    },
    [restaurant, email]
  )

  const uploadAsset = useCallback(
    async (kind: 'logo' | 'cover', dataUrl: string) => {
      const res = await authFetch('/api/organizations/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, dataUrl, organizationId: restaurant?.id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Görsel yüklenemedi.')
      setRestaurant((prev) => {
        if (!prev) return prev
        const branding = {
          ...prev.branding,
          ...(kind === 'logo' ? { logoUrl: data.url } : { coverUrl: data.url, bannerUrl: data.url }),
        }
        const next = { ...prev, branding }
        persistLegacy(next)
        return next
      })
      return data.url as string
    },
    [restaurant?.id]
  )

  const removeAsset = useCallback(async (kind: 'logo' | 'cover') => {
    const res = await authFetch(`/api/organizations/assets?kind=${kind}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Görsel kaldırılamadı.')
    setRestaurant((prev) => {
      if (!prev) return prev
      const branding = {
        ...prev.branding,
        ...(kind === 'logo' ? { logoUrl: '' } : { coverUrl: '', bannerUrl: '' }),
      }
      const next = { ...prev, branding }
      persistLegacy(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ restaurant, email, role, isLoading, onboardingCompleted, refresh, save, uploadAsset, removeAsset }),
    [restaurant, email, role, isLoading, onboardingCompleted, refresh, save, uploadAsset, removeAsset]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useRestaurant() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useRestaurant, RestaurantProvider içinde kullanılmalı')
  return v
}

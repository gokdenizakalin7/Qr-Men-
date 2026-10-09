'use client'

import { useEffect, useState } from 'react'
import { authFetch } from '@/lib/api-client'
import type { CatalogTemplateSummary } from '@/lib/catalog-templates'

/**
 * menu_templates tablosundaki şablonları /api/templates üzerinden okur.
 * businessType verilirse yalnızca o işletme tipinin şablonları gelir; `null`/`undefined` → hepsi.
 */
export function useCatalogTemplates(businessType?: string | null, enabled = true) {
  const [templates, setTemplates] = useState<CatalogTemplateSummary[]>([])
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setIsLoading(true)
    setError(null)
    const qs = businessType ? `?business_type=${encodeURIComponent(businessType)}` : ''
    authFetch(`/api/templates${qs}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Şablonlar yüklenemedi.')
        const data = await res.json()
        if (!cancelled) setTemplates(data.templates ?? [])
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'Şablonlar yüklenemedi.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [businessType, enabled])

  return { templates, isLoading, error }
}

'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Menu as MenuIcon, 
  QrCode, 
  Plus,
  ArrowRight,
  Settings
} from 'lucide-react'
import { CheckCircle2, Circle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authFetch } from '@/lib/api-client'
import { useRestaurant } from '@/components/providers/RestaurantProvider'
import { buildChecklist } from '@/lib/restaurant-profile'

export function DashboardContent() {
  const { restaurant: currentRestaurant } = useRestaurant()
  const navigate = useNavigate()
  const [hasMenu, setHasMenu] = useState<boolean | null>(null)
  const [hasTables, setHasTables] = useState<boolean | null>(null)

  useEffect(() => {
    const sub = currentRestaurant?.subdomain
    if (!sub) return
    let alive = true
    ;(async () => {
      try {
        const [m, t] = await Promise.all([
          authFetch(`/api/menus/load?subdomain=${sub}`),
          authFetch(`/api/tables/load?subdomain=${sub}`),
        ])
        const md = m.ok ? await m.json() : null
        const td = t.ok ? await t.json() : null
        if (!alive) return
        setHasMenu(!!md?.menus?.length)
        setHasTables(!!td?.tables?.length)
      } catch {
        // kontrol listesi yalnızca bilgi amaçlı
      }
    })()
    return () => { alive = false }
  }, [currentRestaurant?.subdomain])

  const checklist = buildChecklist(currentRestaurant, { hasMenu: !!hasMenu, hasTables: !!hasTables })
  const doneCount = checklist.filter((c) => c.done).length
  const showChecklist = hasMenu !== null && doneCount < checklist.length
  const logoUrl = currentRestaurant?.branding?.logoUrl

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-5xl mx-auto py-4"
    >
      {/* Hoşgeldin Başlığı */}
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-14 px-4 glass-card !rounded-[32px] relative overflow-hidden">
        {/* Dekoratif Arka Plan Öğeleri */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="absolute -left-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div data-reveal className="w-24 h-24 bg-primary/10 text-foreground rounded-[28px] flex items-center justify-center mb-2 z-10 shadow-2xl border border-border/60 backdrop-blur-xl dark:border-white/20 dark:bg-white/10">
          <img src={logoUrl || "/logo.jpg"} alt="Logo" className="w-full h-full object-contain rounded-[28px]" />
        </div>
        <h1 data-reveal className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight z-10">
          Hoş Geldiniz, {currentRestaurant?.name || 'Değerli İşletmeci'}!
        </h1>
        <p data-reveal className="text-muted-foreground max-w-xl text-lg z-10 leading-relaxed">
          QR Chef ile restoranınızın dijital menüsünü saniyeler içinde oluşturabilir, masalarınıza özel QR kodları basabilirsiniz.
        </p>
        <div data-reveal className="pt-6 z-10">
          <Button size="lg" className="px-8 font-bold text-md h-12 rounded-2xl" onClick={() => navigate('menus')}>
            <Plus className="mr-2 h-5 w-5" /> Hemen Yeni Menü Ekle
          </Button>
        </div>
      </div>

      {showChecklist && (
        <Card data-reveal className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg">Kurulumu tamamla</CardTitle>
              <span className="text-xs font-bold text-muted-foreground">{doneCount} / {checklist.length}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full bg-primary transition-all" style={{ width: `${(doneCount / checklist.length) * 100}%` }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.href.replace('/dashboard/', ''))}
                  className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/50 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                >
                  {item.done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />}
                  <span className={item.done ? 'text-muted-foreground line-through' : 'font-semibold'}>{item.label}</span>
                  {!item.done && <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hızlı Erişim Kartları */}
      <div data-reveal-group className="grid gap-6 md:grid-cols-3">
        {/* Menü Listesi */}
        <Card 
          data-reveal
          className="relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-pointer group" 
          onClick={() => navigate('menus')}
        >
          <span aria-hidden className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-primary/10 text-foreground border border-border/60 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300 ease-out">
              <MenuIcon className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">Menü Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Mevcut menülerinizi düzenleyin, kategorileri yönetin ve yayına alın.</p>
            <div className="text-sm font-bold text-foreground flex items-center">
              Menüleri Yönet <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        {/* QR Kodlar */}
        <Card 
          data-reveal
          className="relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-pointer group" 
          onClick={() => navigate('qr-codes')}
        >
          <span aria-hidden className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-primary/10 text-foreground border border-border/60 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300 ease-out">
              <QrCode className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">Masa QR Kodları</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Masalarınıza özel QR kodlar oluşturun ve PDF olarak çıktı alın.</p>
            <div className="text-sm font-bold text-foreground flex items-center">
              QR Kodları Çıkar <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        {/* Ayarlar */}
        <Card 
          data-reveal
          className="relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-pointer group" 
          onClick={() => navigate('settings')}
        >
          <span aria-hidden className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-primary/10 text-foreground border border-border/60 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300 ease-out">
              <Settings className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">Restoran Ayarları</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Marka renklerinizi, logonuzu ve restoran detaylarınızı güncelleyin.</p>
            <div className="text-sm font-bold text-foreground flex items-center">
              Ayarlara Git <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

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
  Sparkles,
  Settings
} from 'lucide-react'
import { Restaurant } from '@/lib/types'
import { CreateMenuModal } from '@/components/modals/CreateMenuModal'
import { safeJsonParse } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

export function DashboardContent() {
  const [isCreateMenuModalOpen, setIsCreateMenuModalOpen] = useState(false)
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentRestaurant')
      if (stored) {
        const parsed = safeJsonParse<any>(stored, null)
        setCurrentRestaurant(parsed)
      }
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-5xl mx-auto py-4"
    >
      {/* Hoşgeldin Başlığı */}
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-12 px-4 bg-white rounded-3xl border shadow-sm relative overflow-hidden">
        {/* Dekoratif Arka Plan Öğeleri */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
        <div className="absolute -left-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2 z-10 shadow-sm border border-primary/20">
          <Sparkles className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight z-10">
          Hoş Geldiniz, {currentRestaurant?.name || 'Değerli İşletmeci'}!
        </h1>
        <p className="text-gray-500 max-w-xl text-lg z-10 leading-relaxed">
          QR Chef ile restoranınızın dijital menüsünü saniyeler içinde oluşturabilir, masalarınıza özel QR kodları basabilirsiniz.
        </p>
        <div className="pt-6 z-10">
          <Button size="lg" className="px-8 shadow-lg font-bold text-md h-12 rounded-xl" onClick={() => setIsCreateMenuModalOpen(true)}>
            <Plus className="mr-2 h-5 w-5" /> Hemen Yeni Menü Ekle
          </Button>
        </div>
      </div>

      {/* Hızlı Erişim Kartları */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Menü Listesi */}
        <Card 
          className="hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-blue-100 group" 
          onClick={() => navigate('menus')}
        >
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MenuIcon className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">Menü Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">Mevcut menülerinizi düzenleyin, kategorileri yönetin ve yayına alın.</p>
            <div className="text-sm font-bold text-blue-600 flex items-center">
              Menüleri Yönet <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        {/* QR Kodlar */}
        <Card 
          className="hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-green-100 group" 
          onClick={() => navigate('qr-codes')}
        >
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">Masa QR Kodları</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">Masalarınıza özel QR kodlar oluşturun ve PDF olarak çıktı alın.</p>
            <div className="text-sm font-bold text-green-600 flex items-center">
              QR Kodları Çıkar <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        {/* Ayarlar */}
        <Card 
          className="hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-purple-100 group" 
          onClick={() => navigate('settings')}
        >
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Settings className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">Restoran Ayarları</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">Marka renklerinizi, logonuzu ve restoran detaylarınızı güncelleyin.</p>
            <div className="text-sm font-bold text-purple-600 flex items-center">
              Ayarlara Git <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateMenuModal 
        isOpen={isCreateMenuModalOpen} 
        onClose={() => setIsCreateMenuModalOpen(false)} 
      />
    </motion.div>
  )
}

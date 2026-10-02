'use client'

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { QrCode, Search, Utensils, MapPin, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MOCK_RESTAURANTS, mockMenusByRestaurant } from '@/lib/mock-data'
import { TermsOfServiceModal } from '@/components/modals/TermsOfServiceModal'
import { PrivacyPolicyModal } from '@/components/modals/PrivacyPolicyModal'
import { motion } from 'framer-motion'

export function BusinessDirectory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)

  const restaurants = MOCK_RESTAURANTS.map(restaurant => {
    const info = restaurant.businessInfo || {} as Record<string, string>
    return {
      name: restaurant.name || 'İsimsiz Restoran',
      subdomain: restaurant.subdomain || '',
      address: info.address || '',
      city: info.city || 'Belirtilmemiş',
      state: info.state || '',
      zipcode: info.zipcode || '',
      phone: info.phone || '',
      menuCount: (restaurant.subdomain && mockMenusByRestaurant[restaurant.subdomain]?.length) || 0,
    }
  })

  const filteredRestaurants = restaurants.filter(restaurant => {
    const q = searchTerm.toLowerCase()
    const matchesSearch = 
      (restaurant.name?.toLowerCase().includes(q) ?? false) ||
      (restaurant.city?.toLowerCase().includes(q) ?? false) ||
      (restaurant.state?.toLowerCase().includes(q) ?? false)
    
    if (selectedCity === 'all') return matchesSearch
    return matchesSearch && restaurant.city.toLowerCase() === selectedCity.toLowerCase()
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white">
          <Link className="flex items-center justify-center font-bold text-lg text-primary" to="/">
            <QrCode className="h-6 w-6 mr-2 text-primary" />
            <span>QR Chef</span>
          </Link>
          <div className="ml-auto">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Ana Sayfaya Dön</Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Restoran Rehberi</h1>
              <p className="text-gray-600 max-w-xl mx-auto">
                QR Chef dijital menülerini kullanan mekanları keşfedin, gitmeden önce lezzetleri inceleyin.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border shadow-sm">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Restoran adı, ilçe veya şehir arayın..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={selectedCity}
                onValueChange={setSelectedCity}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Şehir Filtresi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Şehirler</SelectItem>
                  <SelectItem value="istanbul">İstanbul</SelectItem>
                  <SelectItem value="ankara">Ankara</SelectItem>
                  <SelectItem value="izmir">İzmir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {filteredRestaurants.map((restaurant) => (
                <Card key={restaurant.subdomain} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col justify-between h-full space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg text-gray-900 flex items-center">
                            <Utensils className="h-4 w-4 mr-2 text-primary" />
                            {restaurant.name}
                          </h3>
                          <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
                            {restaurant.menuCount} Menü
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center mb-1">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                          {restaurant.address}, {restaurant.state} / {restaurant.city}
                        </p>
                        <p className="text-xs text-gray-400">
                          Tel: {restaurant.phone}
                        </p>
                      </div>
                      <div className="pt-2 border-t flex justify-end">
                        <Button size="sm" asChild>
                          <Link to={`/dashboard/menus`}>
                            <Eye className="h-4 w-4 mr-1.5" /> Menüyü Görüntüle
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredRestaurants.length === 0 && (
                <div className="col-span-2 text-center py-12 bg-white rounded-xl border text-gray-500">
                  Arama kriterlerinize uygun restoran bulunamadı.
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
          <p className="text-xs text-gray-500">© 2024 QR Chef. Tüm hakları saklıdır.</p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <button
              className="text-xs hover:underline underline-offset-4 text-gray-500"
              onClick={() => setIsTermsOpen(true)}
            >
              Kullanım Koşulları
            </button>
            <button
              className="text-xs hover:underline underline-offset-4 text-gray-500"
              onClick={() => setIsPrivacyOpen(true)}
            >
              Gizlilik Politikası
            </button>
          </nav>
        </footer>

        <TermsOfServiceModal 
          isOpen={isTermsOpen} 
          onClose={() => setIsTermsOpen(false)} 
        />
        <PrivacyPolicyModal 
          isOpen={isPrivacyOpen} 
          onClose={() => setIsPrivacyOpen(false)} 
        />
      </div>
    </motion.div>
  )
}

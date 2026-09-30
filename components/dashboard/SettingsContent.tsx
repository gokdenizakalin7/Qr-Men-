'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Restaurant } from '@/lib/types'
import { MOCK_RESTAURANTS } from '@/lib/mock-data'
import { Check, Store, Wifi, Palette, KeyRound, Share2, Star, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { sanitizeText, sanitizeMultilineText, sanitizeUrl } from '@/lib/sanitizer'

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState<'isletme' | 'sosyal' | 'wifi' | 'marka' | 'sifre'>('isletme')
  const [saveMessage, setSaveMessage] = useState('')

  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentRestaurant')
      if (stored) return JSON.parse(stored)
    }
    return MOCK_RESTAURANTS[0]
  })

  const [businessInfo, setBusinessInfo] = useState({
    name: currentRestaurant.name,
    phone: currentRestaurant.businessInfo?.phone || '',
    address: currentRestaurant.businessInfo?.address || '',
    city: currentRestaurant.businessInfo?.city || '',
    wifi_name: currentRestaurant.businessInfo?.wifi_name || '',
    wifi_password: currentRestaurant.businessInfo?.wifi_password || '',
    instagramHandle: currentRestaurant.businessInfo?.instagramHandle || '',
    whatsappNumber: currentRestaurant.businessInfo?.whatsappNumber || '',
    googleMapsUrl: currentRestaurant.businessInfo?.googleMapsUrl || '',
    googleReviewUrl: currentRestaurant.businessInfo?.googleReviewUrl || '',
    workingHours: currentRestaurant.businessInfo?.workingHours || 'Hergün: 10:00 - 00:00'
  })

  const [branding, setBranding] = useState({
    primaryColor: currentRestaurant.branding?.primaryColor || '#e11d48',
    bannerUrl: currentRestaurant.branding?.bannerUrl || '',
    currency: currentRestaurant.currency || '₺'
  })

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSave = () => {
    const cleanBusinessInfo = {
      name: sanitizeText(businessInfo.name, 100),
      phone: sanitizeText(businessInfo.phone, 30),
      address: sanitizeMultilineText(businessInfo.address, 300),
      city: sanitizeText(businessInfo.city, 50),
      wifi_name: sanitizeText(businessInfo.wifi_name, 50),
      wifi_password: sanitizeText(businessInfo.wifi_password, 50),
      instagramHandle: sanitizeText(businessInfo.instagramHandle, 50).replace(/^@+/, ''),
      whatsappNumber: sanitizeText(businessInfo.whatsappNumber, 30),
      googleMapsUrl: sanitizeUrl(businessInfo.googleMapsUrl),
      googleReviewUrl: sanitizeUrl(businessInfo.googleReviewUrl),
      workingHours: sanitizeText(businessInfo.workingHours, 100)
    }

    const cleanBranding = {
      primaryColor: sanitizeText(branding.primaryColor, 30),
      bannerUrl: sanitizeUrl(branding.bannerUrl),
      currency: sanitizeText(branding.currency, 10)
    }

    const updatedRest: Restaurant = {
      ...currentRestaurant,
      name: cleanBusinessInfo.name,
      currency: cleanBranding.currency,
      businessInfo: {
        ...currentRestaurant.businessInfo,
        ...cleanBusinessInfo
      },
      branding: {
        ...currentRestaurant.branding,
        ...cleanBranding
      }
    }

    setCurrentRestaurant(updatedRest)
    localStorage.setItem('currentRestaurant', JSON.stringify(updatedRest))

    setSaveMessage('Ayarlar başarıyla kaydedildi!')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restoran Ayarları</h1>
          <p className="text-sm text-gray-500">İşletme detaylarınızı, sosyal medya ve Google yorum bağlantılarınızı düzenleyin</p>
        </div>
        {saveMessage && (
          <span className="text-sm bg-green-100 text-green-800 px-3 py-1.5 rounded-full font-medium flex items-center">
            <Check className="h-4 w-4 mr-1" /> {saveMessage}
          </span>
        )}
      </div>

      <div className="flex space-x-2 border-b overflow-x-auto pb-1">
        {[
          { id: 'isletme', label: 'İşletme & Adres', icon: Store },
          { id: 'sosyal', label: 'Sosyal Medya & Google Haritalar', icon: Share2 },
          { id: 'wifi', label: 'Wi-Fi & Misafir Bilgisi', icon: Wifi },
          { id: 'marka', label: 'Marka & Tema', icon: Palette },
          { id: 'sifre', label: 'Giriş Şifresi', icon: KeyRound },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-3 text-sm rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* İŞLETME BİLGİLERİ */}
      {activeTab === 'isletme' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">İşletme Bilgileri</CardTitle>
              <CardDescription>Restoranınızın genel adı, adresi ve iletişim numarası</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Restoran Adı</Label>
                  <Input 
                    value={businessInfo.name} 
                    onChange={(e) => setBusinessInfo(b => ({ ...b, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>İletişim Telefonu</Label>
                  <Input 
                    value={businessInfo.phone} 
                    onChange={(e) => setBusinessInfo(b => ({ ...b, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Açık Adres</Label>
                <Input 
                  value={businessInfo.address} 
                  onChange={(e) => setBusinessInfo(b => ({ ...b, address: e.target.value }))}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Şehir</Label>
                  <Input 
                    value={businessInfo.city} 
                    onChange={(e) => setBusinessInfo(b => ({ ...b, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Çalışma Saatleri Notu</Label>
                  <Input 
                    placeholder="Örn: Hergün 10:00 - 01:00"
                    value={businessInfo.workingHours} 
                    onChange={(e) => setBusinessInfo(b => ({ ...b, workingHours: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SOSYAL MEDYA & GOOGLE HARİTALAR (BENCHMARK ÖZELLİĞİ) */}
      {activeTab === 'sosyal' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center">
              <Share2 className="h-5 w-5 mr-2 text-primary" /> Sosyal Medya & Google Haritalar Bağlantıları
            </CardTitle>
            <CardDescription>
              Müşteriler menünüzü incelerken tek tıkla Instagram profilinizi takip edebilir, WhatsApp'tan yazabilir ve Google Maps'te işletmenize 5 yıldızlı yorum bırakabilir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="font-semibold">Instagram Kullanıcı Adı</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold">@</span>
                  <Input 
                    placeholder="lezzetocakbasi_ist"
                    className="pl-7"
                    value={businessInfo.instagramHandle} 
                    onChange={(e) => setBusinessInfo(b => ({ ...b, instagramHandle: e.target.value.replace('@', '') }))}
                  />
                </div>
                <p className="text-[11px] text-gray-400">Menü başlığında Instagram butonu olarak görünür.</p>
              </div>

              <div className="space-y-1">
                <Label className="font-semibold">WhatsApp İletişim / Sipariş Numarası</Label>
                <Input 
                  placeholder="905551234567 (Ülke kodu ile)"
                  value={businessInfo.whatsappNumber} 
                  onChange={(e) => setBusinessInfo(b => ({ ...b, whatsappNumber: e.target.value }))}
                />
                <p className="text-[11px] text-gray-400">Müşterinin doğrudan WhatsApp sohbeti başlatmasını sağlar.</p>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="font-semibold">Google Haritalar Konum Linki (Yol Tarifi)</Label>
              <Input 
                placeholder="https://maps.google.com/?q=..."
                value={businessInfo.googleMapsUrl} 
                onChange={(e) => setBusinessInfo(b => ({ ...b, googleMapsUrl: e.target.value }))}
              />
              <p className="text-[11px] text-gray-400">Müşteriler tek tıkla navigasyon başlatabilir.</p>
            </div>

            <div className="space-y-1">
              <Label className="font-semibold flex items-center text-amber-700">
                <Star className="h-4 w-4 mr-1 fill-amber-500 text-amber-500" />
                Google Yorum Yazma Linki (Google Review Booster)
              </Label>
              <Input 
                placeholder="https://search.google.com/local/writereview?placeid=..."
                value={businessInfo.googleReviewUrl} 
                onChange={(e) => setBusinessInfo(b => ({ ...b, googleReviewUrl: e.target.value }))}
              />
              <p className="text-[11px] text-gray-500">
                Menüde memnuniyet puanı 4 veya 5 veren müşteriler doğrudan bu bağlantıya yönlendirilerek Google puanınız artırılır!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* WI-FI BILGILERI */}
      {activeTab === 'wifi' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center">
              <Wifi className="h-5 w-5 mr-2 text-primary" /> Menü Wi-Fi Paylaşımı
            </CardTitle>
            <CardDescription>
              Müşterilerin menüyü açtıklarında tek tıkla Wi-Fi şifrenizi kopyalayabilmeleri için ağ bilgilerinizi girin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Wi-Fi Ağ Adı (SSID)</Label>
                <Input 
                  placeholder="Örn: Lezzet_Misafir"
                  value={businessInfo.wifi_name} 
                  onChange={(e) => setBusinessInfo(b => ({ ...b, wifi_name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Wi-Fi Şifresi</Label>
                <Input 
                  placeholder="Örn: kebap2024"
                  value={businessInfo.wifi_password} 
                  onChange={(e) => setBusinessInfo(b => ({ ...b, wifi_password: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MARKA & TEMA */}
      {activeTab === 'marka' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center">
              <Palette className="h-5 w-5 mr-2 text-primary" /> Marka & Renk Teması
            </CardTitle>
            <CardDescription>Menünüzün müşteri ekranında görünecek ana rengini belirleyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ana Tema Rengi</Label>
              <div className="flex items-center space-x-3">
                <input 
                  type="color" 
                  value={branding.primaryColor}
                  onChange={(e) => setBranding(b => ({ ...b, primaryColor: e.target.value }))}
                  className="w-12 h-12 rounded-lg border cursor-pointer p-1"
                />
                <Input 
                  value={branding.primaryColor}
                  onChange={(e) => setBranding(b => ({ ...b, primaryColor: e.target.value }))}
                  className="w-36 font-mono"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Para Birimi Simgesi</Label>
              <Input 
                value={branding.currency}
                onChange={(e) => setBranding(b => ({ ...b, currency: e.target.value }))}
                className="w-36 font-bold"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* SIFRE */}
      {activeTab === 'sifre' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Giriş Şifresi Değiştir</CardTitle>
            <CardDescription>Yönetici paneli giriş şifrenizi güncelleyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-md">
            <div className="space-y-1">
              <Label>Yeni Şifre</Label>
              <Input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Yeni Şifre (Tekrar)</Label>
              <Input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kaydet Butonu */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} className="bg-primary text-white px-8">
          <Check className="h-4 w-4 mr-2" /> Değişiklikleri Kaydet
        </Button>
      </div>
    </motion.div>
  )
}

'use client'

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { QrCode, Smartphone, Eye, Wifi, ShieldCheck, Utensils, Sparkles, ArrowRight } from 'lucide-react'
import { TermsOfServiceModal } from '@/components/modals/TermsOfServiceModal'
import { PrivacyPolicyModal } from '@/components/modals/PrivacyPolicyModal'
import { ContactModal } from '@/components/modals/ContactModal'
import { motion } from 'framer-motion'

export function LandingPage() {
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col min-h-screen">
        <header className="px-4 lg:px-6 h-14 flex items-center fixed w-full bg-white/90 backdrop-blur-md z-50 border-b">
          <Link className="flex items-center justify-center font-extrabold text-lg text-primary" to="/">
            <QrCode className="h-6 w-6 mr-2" />
            <span>Qolay</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
            <Link 
              to="/business" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Restoranlar
            </Link>
            <Button size="sm" asChild>
              <Link to="/login">
                Giriş Yap
              </Link>
            </Button>
          </nav>
        </header>

        <div className="h-14"></div>
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="w-full py-16 md:py-28 bg-gradient-to-b from-white via-primary/5 to-gray-50">
            <div className="container px-4 md:px-6 mx-auto">
              <div className="flex flex-col items-center space-y-6 text-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  <Sparkles className="h-3.5 w-3.5" /> Yeni Nesil Akıllı QR Menü Sistemi
                </div>
                <div className="space-y-3">
                  <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl max-w-4xl mx-auto text-gray-900 leading-tight">
                    Restoranlar İçin <span className="text-primary">Canlı Önizlemeli</span> ve Esnek QR Menü Yönetimi
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                    Menülerinizi, kategorilerinizi (aktif/pasif) ve masa QR kodlarınızı anlık canlı telefon simülatörüyle kolayca yönetin.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center pt-2">
                  <Button size="lg" className="px-8 shadow-md" asChild>
                    <Link to="/login">
                      Giriş Yap <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/business">Restoran Rehberi</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="w-full py-16 md:py-24 bg-white">
            <div className="container px-4 md:px-6 mx-auto">
              <div className="text-center space-y-2 mb-12">
                <h2 className="text-3xl font-bold tracking-tight">Sistemin Öne Çıkan Güçlü Özellikleri</h2>
                <p className="text-gray-500 max-w-2xl mx-auto">Restoran yönetimini kolaylaştıran modern ve kullanıcı dostu araçlar.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-6 rounded-2xl bg-gray-50/70 border hover:shadow-md transition-shadow">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl mb-4 w-fit">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Canlı Telefon Önizlemesi</h3>
                  <p className="text-gray-600 text-sm">Menünüzü ve yemeklerinizi düzenlerken yan taraftaki interaktif akıllı telefon ekranında anında nasıl göründüğünü test edin.</p>
                </Card>

                <Card className="p-6 rounded-2xl bg-gray-50/70 border hover:shadow-md transition-shadow">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl mb-4 w-fit">
                    <Eye className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Aktif / Pasif Kategori Kontrolü</h3>
                  <p className="text-gray-600 text-sm">İstediğiniz kategoriyi (örn: Alkollü İçecekler, Kahvaltı) tek tıkla açıp kapatın. Pasif yapılan kategori menüden anında gizlenir.</p>
                </Card>

                <Card className="p-6 rounded-2xl bg-gray-50/70 border hover:shadow-md transition-shadow">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl mb-4 w-fit">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Masa Bazlı Özel QR Kodlar</h3>
                  <p className="text-gray-600 text-sm">Hem genel menü QR kodu hem de masalara özel numaralandırılmış QR kodları oluşturun ve yüksek kalitede indirin.</p>
                </Card>

                <Card className="p-6 rounded-2xl bg-gray-50/70 border hover:shadow-md transition-shadow">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl mb-4 w-fit">
                    <Wifi className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Wi-Fi Şifresi Kolaylığı</h3>
                  <p className="text-gray-600 text-sm">Müşterilerinizin masada garsona sormadan doğrudan menü üzerinden Wi-Fi şifresini tek tıkla kopyalamasını sağlayın.</p>
                </Card>

                <Card className="p-6 rounded-2xl bg-gray-50/70 border hover:shadow-md transition-shadow">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl mb-4 w-fit">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">İçeriden Rol ve Yetki Yönetimi</h3>
                  <p className="text-gray-600 text-sm">Kullanıcıların rolleri sistem içerisinde belirlenir ve giriş yapıldığında yetkilerine göre yönlendirilirler.</p>
                </Card>

                <Card className="p-6 rounded-2xl bg-gray-50/70 border hover:shadow-md transition-shadow">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl mb-4 w-fit">
                    <Utensils className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Alerjen & Kalori Detayları</h3>
                  <p className="text-gray-600 text-sm">Yemeklerin içeriklerini, alerjen uyarılarını ve kalori değerlerini şık etiketlerle misafirlerinize sunun.</p>
                </Card>
              </div>
            </div>
          </section>
        </main>

        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-gray-50">
          <p className="text-xs text-gray-500">© 2024 Qolay • Özel Menü Sistemi</p>
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
        <ContactModal 
          isOpen={isContactOpen} 
          onClose={() => setIsContactOpen(false)} 
        />
      </div>
    </motion.div>
  )
}

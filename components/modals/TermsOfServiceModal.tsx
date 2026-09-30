'use client'

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function TermsOfServiceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kullanım Koşulları</DialogTitle>
          <DialogDescription>
            Son güncelleme: Mart 2024
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm leading-relaxed text-gray-700">
          <h3 className="font-semibold text-gray-900">1. Şartların Kabulü</h3>
          <p>
            Qolay platformuna erişerek ve hizmetlerimizi kullanarak bu Kullanım Koşulları ile bağlı olmayı kabul etmiş sayılırsınız. Şartları kabul etmiyorsanız lütfen hizmeti kullanmayınız.
          </p>

          <h3 className="font-semibold text-gray-900">2. Hizmet Açıklaması</h3>
          <p>
            Qolay, restoranlar, kafeler ve işletmeler için dijital menü yönetimi, QR kod üretimi ve menü analitiği hizmetleri sağlar.
          </p>

          <h3 className="font-semibold text-gray-900">3. Kullanıcı Hesapları</h3>
          <p>
            Hesap bilgilerinizin ve şifrenizin gizliliğini korumaktan siz sorumlusunuz. Hesabınız altında gerçekleşen tüm faaliyetler sizin sorumluluğunuzdadır.
          </p>

          <h3 className="font-semibold text-gray-900">4. Ödeme ve Abonelik Şartları</h3>
          <p>
            Abonelik ücretleri aylık veya yıllık olarak peşin tahsil edilir. İlgili yasaların gerektirdiği durumlar haricinde ödemeler iade edilmez.
          </p>

          <h3 className="font-semibold text-gray-900">5. Sorumluluğun Sınırlandırılması</h3>
          <p>
            Qolay, kesintisiz veya hatasız hizmet garantisi vermez; ancak sistem sürekliliğini en üst seviyede tutmak için gerekli tüm teknik önlemleri alır.
          </p>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Kapat</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

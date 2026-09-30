'use client'

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function PublicTermsOfServiceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kullanım Koşulları - Menü Görüntüleme</DialogTitle>
          <DialogDescription>
            Son güncelleme: Mart 2024
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm leading-relaxed text-gray-700">
          <h3 className="font-semibold text-gray-900">1. Şartların Kabulü</h3>
          <p>
            Bu dijital menüyü görüntüleyerek aşağıdaki şartları kabul etmiş sayılırsınız.
          </p>

          <h3 className="font-semibold text-gray-900">2. Menü Bilgileri ve Fiyatlar</h3>
          <p>
            Menüdeki fiyatlar, ürün mevcudiyeti ve içerikler anlık olarak güncellenebilir. Restoran, fiyat ve ürünlerde önceden haber vermeksizin değişiklik yapma hakkını saklı tutar.
          </p>

          <h3 className="font-semibold text-gray-900">3. Alerjen Bilgilendirmesi</h3>
          <p>
            Alerjen bilgileri rehberlik amacıyla sunulmuştur. Ciddi bir gıda alerjiniz veya özel diyet gereksiniminiz varsa lütfen sipariş vermeden önce restoran personeliyle doğrudan iletişime geçiniz.
          </p>

          <h3 className="font-semibold text-gray-900">4. Görseller</h3>
          <p>
            Menüde yer alan ürün fotoğrafları sunum amaçlıdır; porsiyon ve servis şekli farklılık gösterebilir.
          </p>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Kapat</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

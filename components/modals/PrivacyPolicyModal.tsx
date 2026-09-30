'use client'

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function PrivacyPolicyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gizlilik Politikası</DialogTitle>
          <DialogDescription>
            Son güncelleme: Mart 2024
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm leading-relaxed text-gray-700">
          <h3 className="font-semibold text-gray-900">1. Toplanan Bilgiler</h3>
          <p>
            Hesap oluştururken sağladığınız ad, e-posta adresi, telefon numarası ve işletme bilgilerinizi toplar ve güvenli şekilde saklarız.
          </p>

          <h3 className="font-semibold text-gray-900">2. Bilgilerin Kullanım Amacı</h3>
          <p>
            Toplanan veriler hizmetlerimizi sunmak, müşteri desteği sağlamak, menü analitik raporları oluşturmak ve platform güvenliğini sağlamak amacıyla kullanılır.
          </p>

          <h3 className="font-semibold text-gray-900">3. Veri Güvenliği</h3>
          <p>
            Kişisel verilerinizin korunması için sektör standardı güvenlik protokolleri ve şifreleme yöntemleri uygulanmaktadır.
          </p>

          <h3 className="font-semibold text-gray-900">4. Haklarınız (KVKK)</h3>
          <p>
            Kişisel verilerinize erişme, güncelleme veya silinmesini talep etme hakkına sahipsiniz. Bunun için destek ekibimizle dilediğiniz zaman iletişime geçebilirsiniz.
          </p>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Kapat</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

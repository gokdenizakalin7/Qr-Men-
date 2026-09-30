'use client'

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function PublicPrivacyPolicyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
          <h3 className="font-semibold text-gray-900">1. Ziyaretçi Verileri</h3>
          <p>
            Dijital menü ziyaretlerinde kişisel kimlik bilgileriniz kaydedilmez; yalnızca menü performansını artırmak amacıyla anonim görüntülenme ve cihaz türü istatistikleri toplanır.
          </p>

          <h3 className="font-semibold text-gray-900">2. Çerezler ve Analitik</h3>
          <p>
            Menü içi arama tercihleri ve dil seçimleri tarayıcınızın yerel depolama alanında deneyiminizi kolaylaştırmak için tutulabilir.
          </p>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Kapat</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

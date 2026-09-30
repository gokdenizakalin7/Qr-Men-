'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { QRCodeData } from '@/lib/types'
import { Download, Copy, Check } from 'lucide-react'

export function QRCodeModal({ 
  isOpen, 
  onClose, 
  qrCode, 
  setQrCodes 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  qrCode: QRCodeData;
  setQrCodes: React.Dispatch<React.SetStateAction<QRCodeData[]>>;
}) {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const menuSlug = qrCode.menu.name.toLowerCase().replace(/\s+/g, '-')
  const menuLink = `https://${qrCode.menu.organization.subdomain}.qolay.com/${menuSlug}`

  useEffect(() => {
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuLink)}`)
  }, [qrCode, menuLink])

  const handleDownload = async () => {
    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${menuSlug}-qr-kodu.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('QR indirme hatası:', error)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(menuLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{qrCode.menu.name} - QR Kodu</DialogTitle>
          <DialogDescription>
            Bu QR kodu masalarınıza yerleştirebilir veya dijital olarak müşterilerinizle paylaşabilirsiniz.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-2">
          <div className="p-4 bg-white border rounded-xl shadow-sm">
            <img src={qrCodeUrl} alt={`${qrCode.menu.name} QR Kodu`} className="w-56 h-56" />
          </div>
          
          <div className="w-full flex items-center justify-between p-2 bg-gray-50 border rounded-lg text-xs font-mono text-gray-600">
            <span className="truncate mr-2">{menuLink}</span>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleCopyLink}>
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>

          <div className="flex gap-2 w-full">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" /> QR Görselini İndir
            </Button>
            <Button variant="outline" onClick={onClose}>
              Kapat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

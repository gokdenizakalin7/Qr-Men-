'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function ContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    employees: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStatus('success')
      setTimeout(() => {
        onClose()
        setFormData({ name: '', email: '', company: '', employees: '', message: '' })
        setStatus('idle')
      }, 2000)
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Satış & Kurumsal İletişim</DialogTitle>
          <DialogDescription>
            Aşağıdaki formu doldurun, ekibimiz 24 saat içinde sizinle iletişime geçsin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                placeholder="Ahmet Yılmaz"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                disabled={status === 'loading' || status === 'success'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Kurumsal E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ahmet@restoran.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={status === 'loading' || status === 'success'}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">İşletme / Şirket Adı</Label>
              <Input
                id="company"
                placeholder="Lezzet Restoran Grubu"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                required
                disabled={status === 'loading' || status === 'success'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employees">Şube Sayısı</Label>
              <Select 
                value={formData.employees} 
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, employees: value }))}
                disabled={status === 'loading' || status === 'success'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Şube aralığı seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-5">1-5 Şube</SelectItem>
                  <SelectItem value="6-20">6-20 Şube</SelectItem>
                  <SelectItem value="21-50">21-50 Şube</SelectItem>
                  <SelectItem value="51+">50+ Şube (Zincir)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mesajınız</Label>
            <Textarea
              id="message"
              placeholder="İhtiyaçlarınızdan veya sormak istediklerinizden bahsedin..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="min-h-[100px]"
              required
              disabled={status === 'loading' || status === 'success'}
            />
          </div>
          {status === 'error' && (
            <p className="text-sm text-red-500">
              Bir hata oluştu. Lütfen tekrar deneyin.
            </p>
          )}
          {status === 'success' && (
            <p className="text-sm text-green-600 font-medium">
              Talebiniz başarıyla alındı! En kısa sürede sizinle iletişime geçeceğiz.
            </p>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
              disabled={status === 'loading'}
            >
              Vazgeç
            </Button>
            <Button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
            >
              {status === 'loading' ? 'Gönderiliyor...' : status === 'success' ? 'Gönderildi!' : 'Mesajı Gönder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

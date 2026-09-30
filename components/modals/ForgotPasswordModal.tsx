'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ForgotPasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStatus('success')
      setMessage('Bu e-posta adresine kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderilmiştir.')
    } catch (error) {
      setStatus('error')
      setMessage('Bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Şifremi Unuttum</DialogTitle>
          <DialogDescription>
            Kayıtlı e-posta adresinizi girin. Size şifre sıfırlama bağlantısı göndereceğiz.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">E-posta Adresi</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="ornek@restoran.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === 'loading' || status === 'success'}
            />
          </div>
          {message && (
            <p className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-green-600 font-medium'}`}>
              {message}
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
              {status === 'loading' ? 'Gönderiliyor...' : 'Bağlantı Gönder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

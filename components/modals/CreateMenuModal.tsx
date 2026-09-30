'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Loader2, Sparkles } from 'lucide-react'
import { Menu } from '@/lib/types'
import { compressImageFile, IMAGE_PRESETS } from '@/lib/image-compression'
import { sanitizeText, sanitizeMultilineText } from '@/lib/sanitizer'

export function CreateMenuModal({ 
  isOpen, 
  onClose, 
  onSubmit 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit?: (newMenu: Partial<Menu>) => void;
}) {
  const [menuName, setMenuName] = useState('')
  const [menuDescription, setMenuDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [days, setDays] = useState<Record<string, boolean>>({
    pazartesi: true,
    sali: true,
    carsamba: true,
    persembe: true,
    cuma: true,
    cumartesi: true,
    pazar: true,
  })

  const dayLabels: Record<string, string> = {
    pazartesi: 'Pazartesi',
    sali: 'Salı',
    carsamba: 'Çarşamba',
    persembe: 'Perşembe',
    cuma: 'Cuma',
    cumartesi: 'Cumartesi',
    pazar: 'Pazar',
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsCompressing(true)
        const result = await compressImageFile(file, IMAGE_PRESETS.MENU_COVER)
        setImagePreview(result.dataUrl)
      } catch (err) {
        console.error('Kapak fotoğrafı sıkıştırma hatası:', err)
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } finally {
        setIsCompressing(false)
        if (e.target) e.target.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (onSubmit) {
      onSubmit({
        name: sanitizeText(menuName, 100),
        description: sanitizeMultilineText(menuDescription, 500),
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        image_url: imagePreview || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop',
        is_listed: true,
        layout: 'grid',
        categories: []
      })
    }
    
    setMenuName('')
    setMenuDescription('')
    setStartTime('')
    setEndTime('')
    setImagePreview(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Yeni Menü Oluştur</DialogTitle>
          <DialogDescription>
            Yeni menünüzün detaylarını girin. Menüyü oluşturduktan sonra kategori ve yemekleri ekleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="menu-image">Menü Kapak Görseli</Label>
            <div className="flex flex-col items-center gap-4">
              {isCompressing && (
                <div className="w-full h-32 rounded-md bg-gray-50 border border-dashed flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Kapak görseli optimize ediliyor...
                </div>
              )}
              {imagePreview && (
                <div className="space-y-1 w-full">
                  <div className="relative w-full h-44">
                    <img
                      src={imagePreview}
                      alt="Menü önizleme"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImagePreview(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              <Input
                id="menu-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={imagePreview || isCompressing ? 'hidden' : ''}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="menu-name">Menü Başlığı</Label>
            <Input
              id="menu-name"
              placeholder="Örn: Akşam Yemeği Menüsü"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="menu-description">Açıklama</Label>
            <Textarea
              id="menu-description"
              placeholder="Menü hakkında kısa bir açıklama yazın..."
              value={menuDescription}
              onChange={(e) => setMenuDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Başlangıç Saati</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">Bitiş Saati</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Geçerli Günler</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(days).map(([day, checked]) => (
                <div key={day} className="flex items-center space-x-1.5 bg-gray-50 px-2 py-1 rounded border">
                  <Checkbox
                    id={day}
                    checked={checked}
                    onCheckedChange={(c) => setDays(prev => ({ ...prev, [day]: c as boolean }))}
                  />
                  <Label htmlFor={day} className="text-xs cursor-pointer">{dayLabels[day] || day}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>Vazgeç</Button>
            <Button type="submit">Menüyü Oluştur</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

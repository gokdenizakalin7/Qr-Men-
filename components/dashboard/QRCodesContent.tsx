'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Restaurant } from '@/lib/types'
import { MOCK_RESTAURANTS } from '@/lib/mock-data'
import { 
  QrCode, 
  Download, 
  Eye, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Printer, 
  Sparkles, 
  Wifi, 
  Layers, 
  FileText,
  ExternalLink
} from 'lucide-react'

export interface TableItem {
  id: string
  name: string
  views: number
}

export function QRCodesContent() {
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentRestaurant')
      if (stored) return JSON.parse(stored)
    }
    return MOCK_RESTAURANTS[0]
  })

  const subdomain = currentRestaurant.subdomain || 'lezzet-ocakbasi'
  const primaryColor = currentRestaurant.branding?.primaryColor || '#e11d48'
  const wifiName = currentRestaurant.businessInfo?.wifi_name || ''
  const wifiPass = currentRestaurant.businessInfo?.wifi_password || ''

  const [tables, setTables] = useState<TableItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  React.useEffect(() => {
    async function loadTables() {
      try {
        const res = await fetch(`/api/tables/load?subdomain=${subdomain}`)
        if (res.ok) {
          const data = await res.json()
          setTables(data.tables || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadTables()
  }, [subdomain])

  const syncWithSupabase = async (updatedTables: TableItem[]) => {
    try {
      await fetch('/api/tables/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain, tables: updatedTables })
      })
    } catch (err) {
      console.error(err)
    }
  }

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isAddTableOpen, setIsAddTableOpen] = useState(false)
  const [newTableName, setNewTableName] = useState('')
  
  // ŞABLON MODALI STATE'İ
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<'acrylic' | 'sticker' | 'bulk_a4'>('acrylic')
  const [activePrintTable, setActivePrintTable] = useState<TableItem | null>(null)

  const getTableLink = (tableName: string) => {
    return `${window.location.origin}/menu/${subdomain}?table=${encodeURIComponent(tableName)}`
  }

  const getQRImageUrl = (data: string, size = 300) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`
  }

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTableName) return

    const newTable: TableItem = {
      id: `tbl-${Date.now()}`,
      name: newTableName,
      views: 0
    }

    const updated = [...tables, newTable]
    setTables(updated)
    setNewTableName('')
    setIsAddTableOpen(false)
    await syncWithSupabase(updated)
  }

  const handleDeleteTable = async (id: string) => {
    const updated = tables.filter(t => t.id !== id)
    setTables(updated)
    await syncWithSupabase(updated)
  }

  const handleOpenPrintModal = (table?: TableItem, tmpl: 'acrylic' | 'sticker' | 'bulk_a4' = 'acrylic') => {
    if (table) setActivePrintTable(table)
    setSelectedTemplate(tmpl)
    setIsPrintModalOpen(true)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Üst Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <QrCode className="mr-2 h-6 w-6 text-primary" /> QR Kodlar & Masa Standı Baskı Şablonları
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Masalarınıza özel QR kodlar oluşturabilir ve matbaaya/yazıcıya hazır profesyonel akrilik standlar yazdırabilirsiniz.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleOpenPrintModal(undefined, 'bulk_a4')}
            className="text-xs border-primary/40 text-primary hover:bg-primary/5 font-semibold"
          >
            <Layers className="h-4 w-4 mr-1.5 text-primary" /> Toplu A4 Masa Baskısı
          </Button>
          <Button size="sm" onClick={() => setIsAddTableOpen(true)} className="text-xs bg-primary text-white">
            <Plus className="h-4 w-4 mr-1" /> + Yeni Masa Ekle
          </Button>
        </div>
      </div>

      {/* Ana Genel Mekan QR Kartı */}
      <Card className="bg-white border-2 border-primary/20 shadow-sm overflow-hidden">
        <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white border-2 border-gray-200 rounded-2xl shadow-xs shrink-0">
              <img 
                src={getQRImageUrl(getTableLink('Genel Menü'), 160)} 
                alt="Genel QR" 
                className="w-28 h-28 object-contain"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                Genel Mekan QR Kodu
              </span>
              <h2 className="text-lg font-extrabold text-gray-900">{currentRestaurant.name}</h2>
              <p className="text-xs text-gray-500 max-w-md">
                Sosyal medya bio'nuzda, broşürlerinizde veya restoran giriş kapısında kullanabileceğiniz genel dijital menü bağlantınızdır.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <code className="text-[11px] bg-gray-100 px-2.5 py-1 rounded border text-gray-700 font-mono">
                  {getTableLink('Genel Menü')}
                </code>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 text-xs" 
                  onClick={() => handleCopyLink(getTableLink('Genel Menü'), 'general')}
                >
                  {copiedId === 'general' ? <Check className="h-3.5 w-3.5 text-green-600 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  {copiedId === 'general' ? 'Kopyalandı' : 'Kopyala'}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs"
              onClick={() => handleOpenPrintModal({ id: 'gen', name: 'Giriş / Kapı QR', views: 0 }, 'acrylic')}
            >
              <Printer className="h-4 w-4 mr-1.5" /> Stand Olarak Yazdır
            </Button>
            <Button 
              size="sm" 
              asChild
              className="text-xs bg-gray-900 text-white hover:bg-gray-800"
            >
              <a href={`/menu/${subdomain}`} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-1.5" /> Menüyü Görüntüle
              </a>
            </Button>
          </div>
        </div>
      </Card>

      {/* Masalar Tablosu */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="py-3 px-4 bg-gray-50 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-gray-900">Masaya Özel QR Kodlar & Görüntüleme</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Masalarınız için ayrı QR kodlar; masa numarası ve Wi-Fi bilgisiyle profesyonel masa standı olarak yazdırabilirsiniz.
            </CardDescription>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-full">
            {tables.length} Masa Kayıtlı
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-16 text-xs font-bold">Masa</TableHead>
                <TableHead className="text-xs font-bold">Masa Adı / Konum</TableHead>
                <TableHead className="text-xs font-bold">QR Önizleme</TableHead>
                <TableHead className="text-xs font-bold">Okunma Sayısı</TableHead>
                <TableHead className="text-right text-xs font-bold">Baskı & İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.map((table, index) => {
                const tableUrl = getTableLink(table.name)
                return (
                  <TableRow key={table.id} className="hover:bg-gray-50/80">
                    <TableCell className="font-mono text-xs font-bold text-gray-500">
                      #{index + 1}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-sm text-gray-900">{table.name}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <img 
                          src={getQRImageUrl(tableUrl, 80)} 
                          alt={table.name} 
                          className="w-9 h-9 rounded border bg-white p-0.5" 
                        />
                        <button
                          onClick={() => handleCopyLink(tableUrl, table.id)}
                          className="text-[11px] text-gray-500 hover:text-primary flex items-center font-mono"
                        >
                          {copiedId === table.id ? <Check className="h-3 w-3 mr-1 text-green-600" /> : <Copy className="h-3 w-3 mr-1" />}
                          {copiedId === table.id ? 'Kopyalandı' : 'Linki Al'}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {table.views} kez tarandı
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/5"
                          onClick={() => handleOpenPrintModal(table, 'acrylic')}
                        >
                          <Printer className="h-3.5 w-3.5 mr-1" /> Masa Standı Bas
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 text-xs text-gray-600"
                          onClick={() => handleOpenPrintModal(table, 'sticker')}
                        >
                          Sticker
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 text-gray-400 hover:text-red-600"
                          onClick={() => handleDeleteTable(table.id)}
                          title="Masayı Sil"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* YENİ MASA EKLE MODALI */}
      <Dialog open={isAddTableOpen} onOpenChange={setIsAddTableOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Yeni Masa Ekle</DialogTitle>
            <DialogDescription>
              Masaya özel bir ad veya numara verin (Örn: Masa 12, Bahçe 3, Teras VIP).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTable} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="t-name">Masa Adı / Numarası</Label>
              <Input
                id="t-name"
                placeholder="Örn: Masa 7 veya Bahçe 2"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddTableOpen(false)}>
                Vazgeç
              </Button>
              <Button type="submit">
                Masayı Oluştur
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* BASKIYA HAZIR MASA STANDI & QR ŞABLON TASARIMCISI MODALI */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[92vh] overflow-y-auto flex flex-col p-6">
          <DialogHeader className="pb-3 border-b print:hidden">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center">
                  <Printer className="h-5 w-5 mr-2 text-primary" />
                  Baskıya Hazır Masa QR Şablonu
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Şablonu seçin ve doğrudan yazıcınızdan veya PDF olarak kaliteli çıktısını alın.
                </DialogDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={handlePrint} className="bg-primary text-white text-xs h-8">
                  <Printer className="h-3.5 w-3.5 mr-1" /> Yazdır / PDF İndir
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Şablon Seçici Butonlar (Print sırasında gizlenir) */}
          <div className="flex gap-2 py-2 print:hidden">
            <button
              onClick={() => setSelectedTemplate('acrylic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                selectedTemplate === 'acrylic' 
                  ? 'bg-primary text-white border-primary shadow-xs' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              Dikey Akrilik Masa Standı (10x15cm)
            </button>
            <button
              onClick={() => setSelectedTemplate('sticker')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                selectedTemplate === 'sticker' 
                  ? 'bg-primary text-white border-primary shadow-xs' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              Masa Çıkartması (Sticker)
            </button>
            <button
              onClick={() => setSelectedTemplate('bulk_a4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                selectedTemplate === 'bulk_a4' 
                  ? 'bg-primary text-white border-primary shadow-xs' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              Toplu A4 Masa Sayfası (Tüm Masalar)
            </button>
          </div>

          {/* BASKI ALANI (YAZICIYA GİDEN ŞABLONLAR) */}
          <div className="flex-1 flex justify-center items-center py-4 bg-gray-100 rounded-xl p-4 overflow-y-auto">
            
            {/* 1. DİKEY AKRİLİK STAND ŞABLONU (10x15cm / A6) */}
            {selectedTemplate === 'acrylic' && (
              <div 
                className="w-[320px] bg-white rounded-2xl shadow-xl border-4 p-5 flex flex-col items-center justify-between text-center space-y-4 text-gray-900 relative"
                style={{ borderColor: primaryColor }}
              >
                {/* Üst Logo & Restoran Adı */}
                <div className="space-y-1">
                  <h3 className="font-black text-base tracking-tight text-gray-900 uppercase">
                    {currentRestaurant.name}
                  </h3>
                  <div 
                    className="inline-block px-3 py-0.5 rounded-full text-white text-[11px] font-extrabold shadow-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {activePrintTable?.name}
                  </div>
                </div>

                {/* QR Kod Çerçevesi */}
                <div className="p-3 bg-white rounded-2xl border-2 border-gray-200 shadow-md">
                  <img 
                    src={getQRImageUrl(getTableLink(activePrintTable?.name || ''), 220)} 
                    alt="QR" 
                    className="w-44 h-44 object-contain"
                  />
                </div>

                {/* Okutma Yönergesi */}
                <div className="space-y-0.5">
                  <p className="font-extrabold text-xs text-gray-800">
                    Menüyü İncelemek İçin Okutun
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Telefonunuzun kamerasını QR koda tutmanız yeterlidir.
                  </p>
                </div>

                {/* Wi-Fi Bilgisi */}
                {wifiName && (
                  <div className="w-full bg-gray-50 p-2 rounded-xl border border-gray-200 text-[10px] space-y-0.5">
                    <div className="flex items-center justify-center space-x-1 font-bold text-gray-700">
                      <Wifi className="h-3 w-3" style={{ color: primaryColor }} />
                      <span>Ücretsiz Wi-Fi</span>
                    </div>
                    <p className="text-gray-500 font-mono">
                      Ağ: <strong className="text-gray-800">{wifiName}</strong> {wifiPass && `• Şifre: ${wifiPass}`}
                    </p>
                  </div>
                )}

                <span className="text-[9px] text-gray-400">Powered by QR Chef</span>
              </div>
            )}

            {/* 2. MASA STICKER ŞABLONU (Dairesel / Kare) */}
            {selectedTemplate === 'sticker' && (
              <div 
                className="w-[280px] h-[280px] bg-white rounded-3xl shadow-xl border-4 p-4 flex flex-col items-center justify-between text-center text-gray-900"
                style={{ borderColor: primaryColor }}
              >
                <div className="flex items-center justify-between w-full px-2">
                  <span className="font-extrabold text-xs truncate max-w-[150px]">{currentRestaurant.name}</span>
                  <span 
                    className="text-[10px] text-white px-2 py-0.5 rounded-full font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {activePrintTable?.name}
                  </span>
                </div>

                <div className="p-2 bg-white rounded-xl border shadow-xs">
                  <img 
                    src={getQRImageUrl(getTableLink(activePrintTable?.name || ''), 180)} 
                    alt="QR" 
                    className="w-32 h-32 object-contain"
                  />
                </div>

                <p className="font-bold text-[11px] text-gray-700">
                  📱 Kameranızı QR Koda Doğrultun
                </p>
              </div>
            )}

            {/* 3. TOPLU A4 BASKI SAYFASI (Izgara) */}
            {selectedTemplate === 'bulk_a4' && (
              <div className="w-full max-w-[700px] bg-white p-6 rounded-xl shadow-lg border text-gray-900 space-y-4">
                <div className="text-center border-b pb-2">
                  <h3 className="font-black text-lg text-gray-900">{currentRestaurant.name}</h3>
                  <p className="text-xs text-gray-500">Masa Standı & QR Kod Çıktı Tablosu (A4)</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {tables.map((tbl) => (
                    <div 
                      key={tbl.id} 
                      className="border-2 rounded-xl p-3 flex flex-col items-center text-center space-y-1.5 bg-gray-50/50"
                      style={{ borderColor: `${primaryColor}40` }}
                    >
                      <span 
                        className="text-[10px] font-extrabold text-white px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {tbl.name}
                      </span>
                      <img 
                        src={getQRImageUrl(getTableLink(tbl.name), 120)} 
                        alt={tbl.name} 
                        className="w-24 h-24 bg-white p-1 rounded border object-contain"
                      />
                      <span className="text-[9px] text-gray-600 font-bold">Menü İçin Okutun</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          <div className="pt-3 border-t flex justify-end space-x-2 print:hidden">
            <Button variant="outline" size="sm" onClick={() => setIsPrintModalOpen(false)}>
              Kapat
            </Button>
            <Button size="sm" onClick={handlePrint} className="bg-primary text-white">
              <Printer className="h-3.5 w-3.5 mr-1" /> Yazdır
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

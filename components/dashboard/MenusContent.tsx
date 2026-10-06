'use client'

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, MoreVertical, Eye, Edit3, Trash2, Globe, EyeOff, QrCode, Smartphone, Sparkles, Camera, Utensils } from 'lucide-react'
import { Menu, Restaurant } from '@/lib/types'
import { getStoredMenus, setStoredMenus } from '@/lib/mock-data'
import { CreateMenuModal } from '@/components/modals/CreateMenuModal'
import { QRCodeModal } from '@/components/modals/QRCodeModal'
import { ScanMenuModal } from '@/components/modals/ScanMenuModal'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { authFetch } from '@/lib/api-client'

export function MenusContent() {
  const [currentRestaurant] = useState<Restaurant | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentRestaurant')
      if (stored) return JSON.parse(stored)
    }
    return null
  })

  const subdomain = currentRestaurant?.subdomain || 'lezzet-ocakbasi'
  const [menus, setMenus] = useState<Menu[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadMenus = async () => {
    setIsLoading(true)
    try {
      const res = await authFetch(`/api/menus/load?subdomain=${subdomain}`)
      if (res.ok) {
        const data = await res.json()
        setMenus(data.menus || [])
      } else {
        setMenus(getStoredMenus(subdomain))
      }
    } catch (err) {
      console.error(err)
      setMenus(getStoredMenus(subdomain))
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadMenus()
  }, [subdomain])

  const [isCreateMenuModalOpen, setIsCreateMenuModalOpen] = useState(false)
  const [isScanMenuModalOpen, setIsScanMenuModalOpen] = useState(false)
  const [selectedQRMenu, setSelectedQRMenu] = useState<any>(null)
  const navigate = useNavigate()

  const syncWithSupabase = async (updatedMenus: Menu[], previousMenus: Menu[]) => {
    try {
      const res = await authFetch('/api/menus/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          menus: updatedMenus
        })
      })
      if (res.ok) {
        toast.success('Değişiklikler başarıyla kaydedildi.')
      } else {
        const err = await res.json()
        toast.error(`Senkronizasyon hatası: ${err.error || 'Bilinmeyen hata'}`)
        // Rollback
        setMenus(previousMenus)
        setStoredMenus(subdomain, previousMenus)
      }
    } catch (error: any) {
      console.error('Failed to sync menus with DB:', error)
      toast.error(`Bağlantı hatası: ${error.message}`)
      // Rollback
      setMenus(previousMenus)
      setStoredMenus(subdomain, previousMenus)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bu menüyü silmek istediğinize emin misiniz?')) {
      const previousMenus = [...menus]
      try {
        const updated = menus.filter(menu => menu.id !== id)
        setMenus(updated)
        setStoredMenus(subdomain, updated)

        const res = await authFetch('/api/menus/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ menuId: id })
        })

        if (res.ok) {
          toast.success('Menü silindi.')
        } else {
          const err = await res.json()
          toast.error(`Silme hatası: ${err.error || 'Bilinmeyen hata'}`)
          setMenus(previousMenus)
          setStoredMenus(subdomain, previousMenus)
        }
      } catch (err: any) {
        console.error('Failed to delete menu', err)
        toast.error(`Bağlantı hatası: ${err.message}`)
        setMenus(previousMenus)
        setStoredMenus(subdomain, previousMenus)
      }
    }
  }

  const handleCreateMenu = (newMenu: Partial<Menu>) => {
    const created: Menu = {
      id: `menu-${Date.now()}`,
      name: newMenu.name || 'Yeni Menü',
      description: newMenu.description || '',
      image_url: newMenu.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop',
      is_listed: true,
      layout: 'grid',
      available_days: [1, 2, 3, 4, 5, 6, 7],
      categories: [
        {
          id: `cat-${Date.now()}`,
          name: 'Başlangıçlar',
          is_active: true,
          display_order: 1,
          items: []
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const previousMenus = [...menus]
    const updated = [...menus, created]
    setMenus(updated)
    setStoredMenus(subdomain, updated)
    syncWithSupabase(updated, previousMenus)
    setIsCreateMenuModalOpen(false)
  }

  const toggleMenuListing = (id: string) => {
    const previousMenus = [...menus]
    const updated = menus.map(menu => 
      menu.id === id ? { ...menu, is_listed: !menu.is_listed } : menu
    )
    setMenus(updated)
    setStoredMenus(subdomain, updated)
    syncWithSupabase(updated, previousMenus)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menü Yönetimi</h1>
          <p className="text-sm text-gray-500">Restoranınızın dijital menülerini oluşturun ve canlı editörde düzenleyin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/menu-editor')}>
            <Smartphone className="mr-2 h-4 w-4 text-primary" /> Canlı Editöre Git
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsScanMenuModalOpen(true)}
            className="border-violet-300 text-violet-700 hover:bg-violet-50"
          >
            <Camera className="mr-2 h-4 w-4" /> Kendi Menünü Tara
          </Button>
          <Button onClick={() => setIsCreateMenuModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Yeni Menü Oluştur
          </Button>
        </div>
      </div>

      {menus.length === 0 && !isLoading ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
          <Utensils className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz Bir Menünüz Yok</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Müşterilerinize sunmak için ilk dijital menünüzü oluşturun veya fiziksel menünüzü tarayarak yapay zeka ile hemen oluşturun.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button 
              size="lg" 
              onClick={() => navigate('/dashboard/menu-editor')}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-6 text-base shadow-md w-full sm:w-auto"
            >
              <Sparkles className="h-5 w-5 mr-2" /> Hazır Menü Paketi Yükle
            </Button>

            <Button 
              size="lg" 
              onClick={() => setIsScanMenuModalOpen(true)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold px-6 py-6 text-base shadow-md w-full sm:w-auto"
            >
              <Camera className="h-5 w-5 mr-2" /> Kendi Menünü Tara
            </Button>

            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setIsCreateMenuModalOpen(true)}
              className="border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold px-6 py-6 text-base w-full sm:w-auto"
            >
              <Plus className="h-5 w-5 mr-2 text-primary" /> Sıfırdan Boş Menü Başlat
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menus.map(menu => {
            const totalItems = menu.categories?.reduce((total, cat) => total + (cat.items?.length || 0), 0) || 0
            const activeCats = menu.categories?.filter(c => c.is_active).length || 0
            
            return (
              <Card key={menu.id} className={`overflow-hidden shadow-sm hover:shadow-md transition-shadow ${!menu.is_listed ? 'opacity-80 bg-gray-50' : 'bg-white'}`}>
                <div className="relative h-48 w-full">
                  <img
                    src={menu.image_url}
                    alt={menu.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {!menu.is_listed ? (
                      <span className="bg-amber-600 text-white px-2 py-0.5 rounded text-xs font-semibold flex items-center">
                        <EyeOff className="h-3 w-3 mr-1" /> Yayında Değil
                      </span>
                    ) : (
                      <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-semibold flex items-center">
                        <Globe className="h-3 w-3 mr-1" /> Yayında
                      </span>
                    )}
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold">{menu.name}</CardTitle>
                      <CardDescription className="line-clamp-1">{menu.description || 'Açıklama bulunmuyor'}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/menu-editor?menu=${menu.id}`)}>
                          <Smartphone className="h-4 w-4 mr-2 text-primary" /> Canlı Editörde Aç
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/menu/${subdomain}`)}>
                          <Eye className="h-4 w-4 mr-2" /> Menüyü Görüntüle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedQRMenu(menu)}>
                          <QrCode className="h-4 w-4 mr-2" /> QR Kodunu Göster
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleMenuListing(menu.id)}>
                          {menu.is_listed ? <EyeOff className="h-4 w-4 mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
                          {menu.is_listed ? 'Yayından Kaldır' : 'Yayına Al'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 font-medium"
                          onClick={() => handleDelete(menu.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Menüyü Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t mt-2">
                    <span>{activeCats}/{menu.categories?.length || 0} Kategori Aktif • {totalItems} Ürün</span>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-primary font-bold"
                      onClick={() => navigate(`/dashboard/menu-editor?menu=${menu.id}`)}
                    >
                      Canlı Düzenle →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <CreateMenuModal 
        isOpen={isCreateMenuModalOpen} 
        onClose={() => setIsCreateMenuModalOpen(false)}
        onSubmit={handleCreateMenu}
      />

      <ScanMenuModal
        isOpen={isScanMenuModalOpen}
        onClose={() => setIsScanMenuModalOpen(false)}
        onMenuCreated={(scannedMenu) => {
          const created: Menu = {
            id: `menu-${Date.now()}`,
            name: scannedMenu.name || 'Taranan Menü',
            description: scannedMenu.description || '',
            image_url: scannedMenu.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop',
            is_listed: true,
            layout: 'grid',
            available_days: [1, 2, 3, 4, 5, 6, 7],
            categories: scannedMenu.categories || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          const previousMenus = [...menus]
          const updated = [...menus, created]
          setMenus(updated)
          setStoredMenus(subdomain, updated)
          syncWithSupabase(updated, previousMenus)
        }}
      />

      {selectedQRMenu && (
        <QRCodeModal
          isOpen={!!selectedQRMenu}
          onClose={() => setSelectedQRMenu(null)}
          qrCode={{
            id: selectedQRMenu.id,
            menu_id: selectedQRMenu.id,
            created_at: selectedQRMenu.created_at,
            last_regenerated_at: selectedQRMenu.updated_at,
            menu: {
              name: selectedQRMenu.name,
              organization: {
                subdomain: subdomain
              }
            },
            views: 1200
          }}
          setQrCodes={() => {}}
        />
      )}
    </motion.div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Building2, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Trash2, 
  LogIn, 
  Copy, 
  Check, 
  QrCode, 
  Utensils, 
  TrendingUp, 
  ShieldCheck,
  LogOut,
  Users,
  Layers,
  BarChart3,
  Settings as SettingsIcon,
  Eye,
  Globe,
  Smartphone,
  Mail,
  Send,
  Clock,
  Link as LinkIcon
} from 'lucide-react'
import { Restaurant, UserRole, UserAccount, Menu, AccountStatus } from '@/lib/types'
import { MOCK_RESTAURANTS, mockMenusByRestaurant, SYSTEM_USERS } from '@/lib/mock-data'
import { motion, animate } from 'framer-motion'
import { PanelThemeProvider, PanelBackground, ThemeToggle } from '@/components/theme/PanelTheme'
import { clearClientSession } from '@/lib/session'
import { authFetch } from '@/lib/api-client'

function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const controls = animate(0, value, { duration: 1, ease: 'easeOut', onUpdate: (v) => setDisplay(Math.round(v)) })
    return () => controls.stop()
  }, [value])
  return <>{display.toLocaleString()}</>
}

export function AdminDashboard() {
  return (
    <PanelThemeProvider>
      <AdminDashboardInner />
    </PanelThemeProvider>
  )
}

function AdminDashboardInner() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'kullanicilar' | 'menuler' | 'analitik' | 'ayarlar'>('kullanicilar')

  const [restaurants, setRestaurants] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [orgRes, userRes] = await Promise.all([
          authFetch('/api/admin/organizations'),
          authFetch('/api/admin/users')
        ])
        if (orgRes.ok) {
          const orgData = await orgRes.json()
          setRestaurants(orgData.organizations || [])
        }
        if (userRes.ok) {
          const userData = await userRes.json()
          setUsers(userData.users || [])
        }
      } catch (err) {
        console.error("Admin fetch error", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const [searchTerm, setSearchTerm] = useState('')
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [notification, setNotification] = useState('')

  // Aktivasyon Linki Bilgilendirme Modalı
  const [activationModalData, setActivationModalData] = useState<{
    restaurantName: string;
    email: string;
    activationLink: string;
  } | null>(null)

  // Form State (ŞİFRE ALANI KALDIRILDI)
  const [formName, setFormName] = useState('')
  const [formOwner, setFormOwner] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formCity, setFormCity] = useState('İstanbul')
  const [formSubdomain, setFormSubdomain] = useState('')
  const [formRole, setFormRole] = useState<UserRole>('restaurant')

  // Sistem Ayarları
  const [systemSettings, setSystemSettings] = useState({
    platformName: 'QR Chef',
    defaultDomain: 'qolay.com',
    defaultCurrency: '₺',
    maintenanceMode: false
  })

  // useEffect(() => {
  //   localStorage.setItem('all_restaurants', JSON.stringify(restaurants))
  //   localStorage.setItem('system_users', JSON.stringify(users))
  // }, [restaurants, users])

  const showNotify = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 3000)
  }

  const handleNameChange = (name: string) => {
    setFormName(name)
    const slug = name
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    setFormSubdomain(slug)
  }

  // YENİ KULLANICI / RESTORAN OLUŞTURMA (ŞİFREYİ KULLANICI KENDİSİ BELİRLER)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName || !formEmail) return

    try {
      if (formRole === 'restaurant') {
        const res = await authFetch('/api/admin/organizations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            subdomain: formSubdomain || `restoran-${Date.now()}`,
            business_phone: formPhone
          })
        })
        if (res.ok) {
          showNotify('Organizasyon (Restoran) başarıyla oluşturuldu.')
          // Yeniden yükle
          const orgRes = await authFetch('/api/admin/organizations')
          if (orgRes.ok) {
            const orgData = await orgRes.json()
            setRestaurants(orgData.organizations || [])
          }
        } else {
          showNotify('Hata oluştu.')
        }
      }
    } catch (e) {
      showNotify('Bağlantı hatası.')
    }

    setIsAddUserModalOpen(false)
    setFormName('')
    setFormOwner('')
    setFormEmail('')
    setFormPhone('')
    setFormCity('İstanbul')
  }

  const toggleStatus = (id: string) => {
    setRestaurants(prev => prev.map(r => {
      if (r.id === id) {
        const nextStatus: AccountStatus = r.status === 'active' ? 'passive' : 'active'
        return { ...r, status: nextStatus }
      }
      return r
    }))
  }

  const handleDeleteRestaurant = (id: string, name: string) => {
    if (confirm(`"${name}" hesabını ve tüm menülerini silmek istediğinize emin misiniz?`)) {
      setRestaurants(prev => prev.filter(r => r.id !== id))
      setUsers(prev => prev.filter(u => u.restaurantId !== id))
      showNotify('Hesap silindi.')
    }
  }

  const handleImpersonate = (restaurant: Restaurant) => {
    localStorage.setItem('currentRestaurant', JSON.stringify(restaurant))
    localStorage.setItem('user_role', 'superadmin')
    localStorage.setItem('is_admin_impersonating', 'true')
    navigate('/dashboard/menu-editor')
  }

  const handleCopyActivationLink = (token: string, id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    const link = `${origin}/activate?token=${token}`
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    showNotify('Aktivasyon linki kopyalandı!')
  }

  const handleLogout = () => {
    clearClientSession()
    navigate('/login')
  }

  const allActiveMenus: Array<{ restaurant: Restaurant; menu: Menu }> = []
  restaurants.forEach(rest => {
    const menus = mockMenusByRestaurant[rest.subdomain] || []
    menus.forEach(menu => {
      allActiveMenus.push({ restaurant: rest, menu })
    })
  })

  const filteredRestaurants = restaurants.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.ownerName || r.businessInfo?.owner_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.credentials?.email || r.businessInfo?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.subdomain?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalViews = restaurants.reduce((acc, r) => {
    return acc + (r.tables?.reduce((tAcc: number, t: { views?: number }) => tAcc + (t.views || 0), 0) || 0)
  }, 4850)

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen bg-background text-foreground flex flex-col justify-between"
    >
      <PanelBackground />
      <div className="relative z-10">
        {/* Admin Üst Bar */}
        <header className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-border/60 bg-card/60 px-4 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-black/30 sm:px-6">
          <div className="flex items-center space-x-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-primary/10 shadow-lg backdrop-blur-xl dark:border-white/20 dark:bg-white/10">
              <ShieldCheck className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold leading-tight tracking-tight text-foreground">QR Chef <span className="font-medium text-muted-foreground">• Sistem Yöneticisi</span></h1>
              <p className="hidden text-xs text-muted-foreground sm:block">Kullanıcı rolleri, e-posta aktivasyonları ve aktif menüler</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {notification && (
              <motion.span
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center rounded-full border border-green-500/30 bg-green-500/15 px-3 py-1.5 text-xs font-semibold text-green-700 backdrop-blur-md dark:text-green-300"
              >
                <Check className="mr-1 h-3 w-3" /> {notification}
              </motion.span>
            )}
            <ThemeToggle />
            <Button size="sm" className="h-9" onClick={() => setIsAddUserModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> <span className="hidden md:inline">Yeni Kullanıcı & Restoran Tanımla</span><span className="md:hidden">Yeni</span>
            </Button>
            <Button size="sm" variant="ghost" onClick={handleLogout} className="h-9 text-red-600 hover:bg-red-500/10">
              <LogOut className="h-4 w-4 mr-1.5" /> Çıkış
            </Button>
          </div>
        </header>

        <main className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
          {/* Üst Metrik Özetleri */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="group transition-all hover:-translate-y-0.5 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kayıtlı Restoranlar</CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-primary/10 text-foreground"><Building2 className="h-4 w-4" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold tracking-tight text-foreground"><CountUp value={restaurants.length} /></div>
                <p className="text-xs text-green-600 mt-1 font-medium">
                  {restaurants.filter(r => r.status === 'active').length} Aktif • {restaurants.filter(r => r.status === 'pending_activation').length} Aktivasyon Bekliyor
                </p>
              </CardContent>
            </Card>

            <Card className="group transition-all hover:-translate-y-0.5 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aktif Dijital Menüler</CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-primary/10 text-foreground"><Utensils className="h-4 w-4" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold tracking-tight text-foreground"><CountUp value={allActiveMenus.length} /></div>
                <p className="text-xs text-muted-foreground mt-1">Yayında olan menü sayısı</p>
              </CardContent>
            </Card>

            <Card className="group transition-all hover:-translate-y-0.5 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Toplam QR Okutma</CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-primary/10 text-foreground"><QrCode className="h-4 w-4" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold tracking-tight text-foreground"><CountUp value={totalViews} /></div>
                <p className="text-xs text-green-600 mt-1 font-medium">Masa ve kapı taramaları</p>
              </CardContent>
            </Card>

            <Card className="group transition-all hover:-translate-y-0.5 hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aktivasyon Mimarisi</CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-primary/10 text-foreground"><Mail className="h-4 w-4" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-base font-bold text-foreground flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" /> Link ile Şifre Belirleme
                </div>
                <p className="text-xs text-muted-foreground mt-1">Şifreyi kullanıcı kendisi belirler</p>
              </CardContent>
            </Card>
          </div>

          {/* SEKME GEZİNTİSİ */}
          <div className="flex space-x-1 overflow-x-auto rounded-2xl border border-border/60 bg-card/60 p-1.5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.07]">
            {([
              { id: 'kullanicilar', icon: Users, label: `Kullanıcılar & Restoran Hesapları (${restaurants.length})` },
              { id: 'menuler', icon: Layers, label: `Aktif Menüler (${allActiveMenus.length})` },
              { id: 'analitik', icon: BarChart3, label: 'Sistem & QR Analitiği' },
              { id: 'ayarlar', icon: SettingsIcon, label: 'Platform Ayarları' },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                  activeTab === tab.id ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="admin-tab-pill"
                    className="absolute inset-0 rounded-xl bg-primary shadow-[0_6px_20px_rgba(15,23,42,0.25)] dark:shadow-[0_0_20px_rgba(255,255,255,0.25)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <tab.icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 1. SEKME: KULLANICILAR & RESTORAN HESAPLARI */}
          {activeTab === 'kullanicilar' && (
            <Card className="shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-lg font-bold">Kullanıcı Hesapları ve Aktivasyon Durumları</CardTitle>
                  <CardDescription>Kullanıcılar e-posta aktivasyon linki üzerinden kendi şifrelerini belirler</CardDescription>
                </div>
                <div className="w-full sm:w-72 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Restoran adı, yetkili veya e-posta..."
                    className="pl-9 h-9 text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead>Restoran & Yetkili</TableHead>
                        <TableHead>E-posta</TableHead>
                        <TableHead>Hesap Durumu</TableHead>
                        <TableHead>Menü Linki</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRestaurants.map((restaurant) => (
                        <TableRow key={restaurant.id} className="hover:bg-accent/50">
                          <TableCell>
                            <div>
                              <div className="font-bold text-foreground text-sm flex items-center">
                                {restaurant.name}
                              </div>
                              <div className="text-xs text-muted-foreground">{(restaurant.ownerName || restaurant.businessInfo?.owner_name || 'Yetkili')} • {(restaurant.businessInfo?.phone || '-')}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs text-foreground font-semibold">{restaurant.credentials?.email || restaurant.businessInfo?.email || '-'}</span>
                          </TableCell>
                          <TableCell>
                            {restaurant.status === 'active' ? (
                              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Aktif
                              </span>
                            ) : restaurant.status === 'pending_activation' ? (
                              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                <Clock className="h-3 w-3 mr-1" /> Aktivasyon Bekliyor
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                                <XCircle className="h-3 w-3 mr-1" /> Pasif
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <a 
                              href={`/menu/${restaurant.subdomain}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs text-foreground font-mono underline-offset-2 hover:underline inline-flex items-center"
                            >
                              /{restaurant.subdomain} <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </TableCell>
                          <TableCell className="text-right space-x-1.5">
                            {restaurant.status === 'pending_activation' && restaurant.activationToken ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200"
                                onClick={() => handleCopyActivationLink(restaurant.activationToken!, restaurant.id)}
                                title="Aktivasyon Linkini Kopyala"
                              >
                                {copiedId === restaurant.id ? <Check className="h-3.5 w-3.5 mr-1" /> : <LinkIcon className="h-3.5 w-3.5 mr-1" />}
                                {copiedId === restaurant.id ? 'Kopyalandı' : 'Aktivasyon Linki'}
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 text-xs text-blue-600 hover:bg-blue-50"
                                onClick={() => handleImpersonate(restaurant)}
                                title="Bu kullanıcının paneline geçiş yap"
                              >
                                <LogIn className="h-3.5 w-3.5 mr-1" /> Panele Gir
                              </Button>
                            )}

                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:bg-red-50"
                              onClick={() => handleDeleteRestaurant(restaurant.id, restaurant.name)}
                              title="Hesabı Sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 2. SEKME: AKTİF MENÜLER */}
          {activeTab === 'menuler' && (
            <div className="space-y-4">
              <div className="glass-card flex items-center justify-between p-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Sistemdeki Aktif Dijital Menüler</h2>
                  <p className="text-xs text-muted-foreground">Tüm restoranların menü durumları ve canlı bağlantıları</p>
                </div>
                <div className="w-64 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Menü veya restoran ara..."
                    className="pl-9 h-9 text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allActiveMenus.map(({ restaurant, menu }) => {
                  const activeCount = menu.categories?.filter(c => c.is_active).length || 0
                  const totalItems = menu.categories?.reduce((acc, cat) => acc + (cat.items?.length || 0), 0) || 0

                  return (
                    <Card key={menu.id} className="overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl">
                      <div className="relative h-40 w-full bg-gray-100">
                        <img 
                          src={menu.image_url} 
                          alt={menu.name} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <div className="absolute top-2 left-2 bg-black/75 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                          {restaurant.name}
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                            <Globe className="h-3 w-3 mr-1" /> Canlıda
                          </span>
                        </div>
                      </div>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base font-bold">{menu.name}</CardTitle>
                        <CardDescription className="text-xs line-clamp-1">{menu.description || 'Açıklama yok'}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-3">
                        <div className="flex justify-between items-center text-xs text-muted-foreground bg-gray-50 p-2 rounded-lg border">
                          <span>{activeCount} / {menu.categories?.length || 0} Kategori Aktif</span>
                          <span className="font-bold text-foreground">{totalItems} Çeşit Yemek</span>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-xs"
                            onClick={() => handleImpersonate(restaurant)}
                          >
                            <Smartphone className="h-3.5 w-3.5 mr-1" /> Canlı Editörde Aç
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 text-xs"
                            asChild
                          >
                            <a href={`/menu/${restaurant.subdomain}`} target="_blank" rel="noreferrer">
                              <Eye className="h-3.5 w-3.5 mr-1" /> Menüyü İncele
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* 3. SEKME: ANALİTİK */}
          {activeTab === 'analitik' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">En Çok Menüsü Okutulan Restoranlar</CardTitle>
                    <CardDescription>Müşteri ilgisi ve toplam QR taramaları</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {restaurants.map((r, i) => {
                      const views = r.tables?.reduce((a: number, t: { views?: number }) => a + (t.views || 0), 0) || (1200 - i * 300)
                      return (
                        <div key={r.id} className="p-3 bg-gray-50 rounded-xl border flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="font-extrabold text-primary text-sm">#{i + 1}</span>
                            <div>
                              <div className="font-bold text-sm text-foreground">{r.name}</div>
                              <div className="text-xs text-muted-foreground">/{r.subdomain} • {r.businessInfo?.city || 'Belirtilmemiş'}</div>
                            </div>
                          </div>
                          <span className="font-extrabold text-sm text-foreground">{views.toLocaleString()} Tarama</span>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                <Card className="">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Cihaz Dağılımı</CardTitle>
                    <CardDescription>Müşterilerin menüyü açtığı cihaz türleri</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Mobil Telefonlar (iOS & Android)</span>
                        <span className="text-primary font-bold">%86</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <motion.div className="bg-primary h-3 rounded-full" initial={{ width: 0 }} animate={{ width: '86%' }} transition={{ duration: 0.9, ease: 'easeOut' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Tablet Cihazlar</span>
                        <span className="text-primary font-bold">%10</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <motion.div className="bg-primary h-3 rounded-full" initial={{ width: 0 }} animate={{ width: '10%' }} transition={{ duration: 0.9, ease: 'easeOut' }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* 4. SEKME: PLATFORM AYARLARI */}
          {activeTab === 'ayarlar' && (
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Sistem ve Platform Genel Ayarları</CardTitle>
                <CardDescription>Tüm menü sistemi için geçerli genel yapılandırmalar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Platform / Sistem Başlığı</Label>
                    <Input 
                      value={systemSettings.platformName} 
                      onChange={(e) => setSystemSettings(s => ({ ...s, platformName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Varsayılan Ana Domain</Label>
                    <Input 
                      value={systemSettings.defaultDomain} 
                      onChange={(e) => setSystemSettings(s => ({ ...s, defaultDomain: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="pt-3 border-t flex justify-end">
                  <Button onClick={() => showNotify('Sistem ayarları güncellendi')}>
                    Ayarları Kaydet
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* YENİ KULLANICI & RESTORAN MODALI (ŞİFRE ALANI KALDIRILDI) */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Yeni Restoran & Kullanıcı Tanımla</DialogTitle>
            <DialogDescription>
              Kullanıcının e-posta adresine şifresini kendisinin belirleyebileceği bir aktivasyon linki üretilecektir.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="r-name">Restoran Adı</Label>
                <Input
                  id="r-name"
                  placeholder="Örn: Boğaz Gurme"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="r-owner">Yetkili Adı Soyadı</Label>
                <Input
                  id="r-owner"
                  placeholder="Örn: Ahmet Yılmaz"
                  value={formOwner}
                  onChange={(e) => setFormOwner(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="r-email">Yetkili E-posta Adresi</Label>
              <Input
                id="r-email"
                type="email"
                placeholder="ahmet@restoran.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
              />
              <p className="text-[11px] text-muted-foreground">Aktivasyon linki bu e-posta adresi ile ilişkilendirilecektir.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="r-phone">Telefon Numarası</Label>
                <Input
                  id="r-phone"
                  placeholder="0 (555) 000 00 00"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="r-city">Şehir</Label>
                <Input
                  id="r-city"
                  placeholder="İstanbul"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1 pt-1 border-t">
              <Label htmlFor="r-slug">Menü Özel Linki (Subdomain)</Label>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-muted-foreground font-mono">qolay.com/menu/</span>
                <Input
                  id="r-slug"
                  placeholder="bogaz-gurme"
                  value={formSubdomain}
                  onChange={(e) => setFormSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  required
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3">
              <Button variant="outline" type="button" onClick={() => setIsAddUserModalOpen(false)}>
                Vazgeç
              </Button>
              <Button type="submit">
                <Send className="h-4 w-4 mr-1.5" /> Davet Et & Link Üret
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AKTİVASYON LİNKİ BİLGİLENDİRME MODALI */}
      <Dialog open={!!activationModalData} onOpenChange={() => setActivationModalData(null)}>
        <DialogContent className="sm:max-w-[460px]">
          {activationModalData && (
            <div className="space-y-4 py-2 text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <DialogHeader>
                <DialogTitle>Aktivasyon Daveti Oluşturuldu!</DialogTitle>
                <DialogDescription>
                  <strong className="text-foreground">{activationModalData.restaurantName}</strong> ({activationModalData.email}) için aktivasyon linki hazırlandı.
                </DialogDescription>
              </DialogHeader>

              <div className="p-3 bg-gray-50 border rounded-xl text-left space-y-2">
                <span className="text-xs font-semibold text-muted-foreground">Aktivasyon & Şifre Belirleme Linki:</span>
                <div className="flex items-center justify-between gap-2 p-2 bg-white rounded border font-mono text-xs">
                  <span className="truncate text-primary">{activationModalData.activationLink}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 px-2"
                    onClick={() => {
                      navigator.clipboard.writeText(activationModalData.activationLink)
                      showNotify('Link kopyalandı!')
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Bu linki müşterinize iletebilirsiniz. Müşteri linke tıkladığında kendi şifresini belirleyerek anında giriş yapacaktır.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    window.open(activationModalData.activationLink, '_blank')
                    setActivationModalData(null)
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-1.5" /> Test İçin Linki Aç
                </Button>
                <Button variant="outline" onClick={() => setActivationModalData(null)}>
                  Kapat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

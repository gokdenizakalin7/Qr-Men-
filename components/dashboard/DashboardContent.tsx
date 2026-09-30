'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Menu as MenuIcon, 
  QrCode, 
  Eye, 
  Clock, 
  TrendingUp, 
  Smartphone, 
  Users, 
  Languages, 
  FolderTree, 
  Plus, 
  Sparkles 
} from 'lucide-react'
import { Bar, Pie } from 'react-chartjs-2'
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip as ChartTooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement 
} from 'chart.js'
import { 
  MOCK_RESTAURANTS, 
  mockMenusByRestaurant, 
  getDeviceData, 
  getChartData, 
  getMostViewedItems 
} from '@/lib/mock-data'
import { Restaurant } from '@/lib/types'
import { CreateMenuModal } from '@/components/modals/CreateMenuModal'
import { safeJsonParse } from '@/lib/utils'

// Register Chart.js
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement)

export function DashboardContent() {
  const [isCreateMenuModalOpen, setIsCreateMenuModalOpen] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [deviceData, setDeviceData] = useState(() => getDeviceData())
  const [chartData, setChartData] = useState(() => getChartData())
  const [mostViewedItems, setMostViewedItems] = useState(() => getMostViewedItems(selectedTimeRange))
  
  const [currentRestaurant] = useState<Restaurant | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentRestaurant')
      if (stored) {
        const parsed = safeJsonParse<{ subdomain?: string } | null>(stored, null)
        if (parsed?.subdomain) {
          return MOCK_RESTAURANTS.find(r => r.subdomain === parsed.subdomain) || MOCK_RESTAURANTS[0]
        }
      }
    }
    return MOCK_RESTAURANTS[0]
  })

  const restaurantMenus = mockMenusByRestaurant[currentRestaurant?.subdomain || 'lezzet-sofrasi'] || []
  const enabledWidgets = ((currentRestaurant as unknown as { enabledWidgets?: string[] })?.enabledWidgets) || [] as string[]
  const isWidgetEnabled = (widgetId: string) => enabledWidgets.length === 0 || enabledWidgets.includes(widgetId)

  useEffect(() => {
    setDeviceData(getDeviceData())
    setChartData(getChartData())
    setMostViewedItems(getMostViewedItems(selectedTimeRange))
  }, [selectedTimeRange])

  const barChartConfig = {
    labels: chartData.map(d => d.name),
    datasets: [
      {
        label: 'Menü Görüntülenme Sayısı',
        data: chartData.map(d => d.views),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 6,
      }
    ]
  }

  const pieChartConfig = {
    labels: deviceData.map(d => d.name),
    datasets: [
      {
        data: deviceData.map(d => d.value),
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
        borderWidth: 1,
      }
    ]
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
          <h1 className="text-2xl font-bold text-gray-900">Kontrol Paneli & İstatistikler</h1>
          <p className="text-sm text-gray-500">Müşterilerinizin menü etkileşimlerini ve anlık verilerini takip edin</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-[170px] bg-white">
              <SelectValue placeholder="Zaman Aralığı" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Son 7 Gün</SelectItem>
              <SelectItem value="30d">Son 30 Gün</SelectItem>
              <SelectItem value="90d">Son 90 Gün</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsCreateMenuModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Yeni Menü Ekle
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isWidgetEnabled('total-menus') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-600">Toplam Menü</CardTitle>
              <MenuIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{restaurantMenus.length} Menü</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <Sparkles className="h-3 w-3 mr-1" /> Tümü yayında ve aktif
              </p>
            </CardContent>
          </Card>
        )}

        {isWidgetEnabled('active-qr-codes') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-600">Aktif QR Kodlar</CardTitle>
              <QrCode className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{restaurantMenus.length} Adet</div>
              <p className="text-xs text-muted-foreground mt-1">Her menü için dinamik kod</p>
            </CardContent>
          </Card>
        )}

        {isWidgetEnabled('total-views') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-600">Toplam Görüntülenme</CardTitle>
              <Eye className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {selectedTimeRange === '7d' ? '4.690' : selectedTimeRange === '30d' ? '18.420' : '54.200'}
              </div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" /> Geçen döneme göre +%18 artış
              </p>
            </CardContent>
          </Card>
        )}

        {isWidgetEnabled('avg-time') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-600">Ortalama İnceleme</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">2 dk 45 sn</div>
              <p className="text-xs text-muted-foreground mt-1">Müşteri başına ortalama süre</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isWidgetEnabled('peak-hours') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-600">En Yoğun Saatler</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12:30 - 14:00 & 19:30 - 21:30</div>
              <p className="text-xs text-muted-foreground mt-1">Öğle ve akşam servisi pik noktaları</p>
            </CardContent>
          </Card>
        )}

        {isWidgetEnabled('return-visitors') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-600">Müdavim Müşteri Oranı</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">%42</div>
              <p className="text-xs text-muted-foreground mt-1">Menüyü tekrar açan ziyaretçiler</p>
            </CardContent>
          </Card>
        )}

        {isWidgetEnabled('language-preferences') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-600">Tercih Edilen Diller</CardTitle>
              <Languages className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">%86 Türkçe</div>
              <p className="text-xs text-muted-foreground mt-1">%11 İngilizce, %3 Arapça</p>
            </CardContent>
          </Card>
        )}

        {isWidgetEnabled('menu-categories') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-600">Popüler Kategori</CardTitle>
              <FolderTree className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ana Yemekler</div>
              <p className="text-xs text-muted-foreground mt-1">Görüntülenmelerin %48'i</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Zaman Bazlı Görüntülenme Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <Bar 
                data={barChartConfig} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: { beginAtZero: true }
                  }
                }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Cihaz Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full flex items-center justify-center">
              <Pie 
                data={pieChartConfig} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }} 
              />
            </div>
            <div className="mt-4 flex justify-around text-xs text-gray-600">
              {deviceData.map((d, i) => (
                <div key={d.name} className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'][i] }}></span>
                  <span>{d.name}: %{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Viewed Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">En Çok İncelenen Menü Ürünleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">Ürün Adı</th>
                  <th className="px-4 py-3">Görüntülenme Sayısı</th>
                  <th className="px-4 py-3">Toplam İncelenme Süresi</th>
                  <th className="px-4 py-3">İlgi Oranı</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mostViewedItems.map((item, idx) => (
                  <tr key={item.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900 flex items-center">
                      <span className="w-5 text-gray-400 font-bold text-xs">#{idx + 1}</span>
                      {item.name}
                    </td>
                    <td className="px-4 py-3 font-medium">{item.views.toLocaleString()} kez</td>
                    <td className="px-4 py-3 text-gray-600">{item.totalTime}</td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-gray-200 rounded-full h-2 max-w-[120px]">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${Math.max(20, 100 - idx * 18)}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <CreateMenuModal 
        isOpen={isCreateMenuModalOpen} 
        onClose={() => setIsCreateMenuModalOpen(false)} 
      />
    </motion.div>
  )
}

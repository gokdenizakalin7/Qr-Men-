'use client'

import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { QrCode, Menu as MenuIcon, LayoutDashboard, Settings, X, LogOut, Store, Smartphone, ShieldCheck } from 'lucide-react'
import { clearClientSession } from '@/lib/session'

export function Sidebar({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  userInfo,
  userRole
}: { 
  isSidebarOpen: boolean; 
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>; 
  userInfo: { name: string; email: string };
  userRole?: string;
}) {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string): boolean => {
    if (path === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/dashboard/'
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    clearClientSession()
    navigate('/login')
  }

  return (
    <motion.aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:relative border-r flex flex-col justify-between ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
      initial={false}
      animate={{ 
        x: isSidebarOpen ? 0 : '-100%'
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div>
        <div className="flex h-16 items-center justify-between px-5 border-b">
          <Link to="/dashboard" className="flex items-center space-x-2 font-bold text-xl text-primary">
            <QrCode className="h-6 w-6 text-primary" />
            <span>Qolay</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
            <span className="sr-only">Kapat</span>
          </Button>
        </div>

        <nav className="p-3 space-y-1.5">
          <Button 
            variant={isActive('/dashboard') && !isActive('/dashboard/menu-editor') && !isActive('/dashboard/menus') && !isActive('/dashboard/qr-codes') && !isActive('/dashboard/settings') ? 'secondary' : 'ghost'} 
            className="w-full justify-start font-medium" 
            asChild
          >
            <Link to="/dashboard">
              <LayoutDashboard className="mr-3 h-4 w-4" />
              Kontrol Paneli
            </Link>
          </Button>

          {/* CANLI MENÜ EDİTÖRÜ (ÖNE ÇIKAN BUTON) */}
          <Button 
            variant={isActive('/dashboard/menu-editor') ? 'secondary' : 'ghost'} 
            className="w-full justify-start font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20" 
            asChild
          >
            <Link to="/dashboard/menu-editor">
              <Smartphone className="mr-3 h-4 w-4 text-primary" />
              Canlı Menü Editörü
            </Link>
          </Button>

          <Button 
            variant={isActive('/dashboard/menus') ? 'secondary' : 'ghost'} 
            className="w-full justify-start font-medium" 
            asChild
          >
            <Link to="/dashboard/menus">
              <MenuIcon className="mr-3 h-4 w-4" />
              Menü Listesi
            </Link>
          </Button>

          <Button 
            variant={isActive('/dashboard/qr-codes') ? 'secondary' : 'ghost'} 
            className="w-full justify-start font-medium" 
            asChild
          >
            <Link to="/dashboard/qr-codes">
              <QrCode className="mr-3 h-4 w-4" />
              QR Kodlar & Masalar
            </Link>
          </Button>

          <Button 
            variant={isActive('/dashboard/settings') ? 'secondary' : 'ghost'} 
            className="w-full justify-start font-medium" 
            asChild
          >
            <Link to="/dashboard/settings">
              <Settings className="mr-3 h-4 w-4" />
              Restoran Ayarları
            </Link>
          </Button>

          {userRole === 'superadmin' && (
            <div className="pt-2 border-t mt-2">
              <Button 
                variant="outline" 
                className="w-full justify-start text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200" 
                asChild
              >
                <Link to="/admin">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Süper Admin Paneli
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </div>

      <div className="p-3 border-t bg-gray-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto hover:bg-white">
              <Avatar className="h-9 w-9 mr-3 border">
                <AvatarImage src="" alt={userInfo.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {userInfo.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start truncate text-left">
                <span className="text-sm font-semibold text-gray-900 leading-tight truncate">{userInfo.name}</span>
                <span className="text-xs text-muted-foreground truncate">{userInfo.email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
              <Settings className="h-4 w-4 mr-2" /> Restoran Ayarları
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/business')}>
              <Store className="h-4 w-4 mr-2" /> Restoran Rehberi
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" /> Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.aside>
  )
}

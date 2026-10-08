'use client'

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu as MenuIcon, Settings, LogOut, ExternalLink, QrCode } from 'lucide-react'
import { clearClientSession } from '@/lib/session'
import { ThemeToggle } from '@/components/theme/PanelTheme'

export function Header({ 
  setIsSidebarOpen, 
  restaurantName,
  subdomain 
}: { 
  setIsSidebarOpen: (open: boolean) => void;
  restaurantName?: string;
  subdomain?: string;
}) {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearClientSession()
    navigate('/')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/60 bg-card/60 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-black/30 lg:px-6">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
          <MenuIcon className="h-6 w-6" />
          <span className="sr-only">Menüyü Aç</span>
        </Button>
        <div className="flex items-center space-x-2">
          <span className="font-extrabold tracking-tight text-foreground text-lg">{restaurantName || 'Restoran Paneli'}</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <ThemeToggle />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/dashboard/qr-codes')}
          className="hidden sm:flex"
        >
          <QrCode className="h-4 w-4 mr-1.5" /> Hızlı QR Görüntüle
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border">
                <AvatarImage src="" alt="Kullanıcı Avatarı" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {(restaurantName || 'RP').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{restaurantName || 'Yönetici'}</p>
                <p className="text-xs leading-none text-muted-foreground">Panel Kullanıcısı</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
              <Settings className="h-4 w-4 mr-2" /> Ayarlar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/business')}>
              <ExternalLink className="h-4 w-4 mr-2" /> Restoran Rehberi
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" /> Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

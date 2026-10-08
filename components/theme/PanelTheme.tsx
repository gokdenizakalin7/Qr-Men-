'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'qrchef-panel-theme'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'dark',
  toggle: () => {},
})

export const usePanelTheme = () => useContext(ThemeContext)

/**
 * Yalnızca admin / restoran panellerinde kullanılır. `dark` sınıfını panel açıkken
 * <html> üzerine ekler (Radix portalları da temayı alsın diye) ve panelden çıkınca kaldırır.
 */
export function PanelThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === 'light' || stored === 'dark') setTheme(stored)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.classList.add('panel-active')
    return () => {
      root.classList.remove('dark')
      root.classList.remove('panel-active')
    }
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next: Theme = t === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = usePanelTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
      title={theme === 'dark' ? 'Açık tema' : 'Koyu tema'}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/60 text-foreground backdrop-blur-md transition-all hover:bg-card active:scale-95',
        className
      )}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

/** Login ekranındaki arka plan görseli + overlay; panel kabuklarının en altına konur. */
export function PanelBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop")',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/95 via-slate-100/90 to-white/95 dark:from-black/75 dark:via-black/60 dark:to-black/85" />
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl dark:bg-white/5" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl dark:bg-white/5" />
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COMMON_ALLERGENS } from './types'

interface Props {
  allergens: string[]
  onChange: (allergens: string[]) => void
}

export function ChipAllergenInput({ allergens, onChange }: Props) {
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)

  const has = (a: string) => allergens.some((x) => x.toLocaleLowerCase('tr-TR') === a.toLocaleLowerCase('tr-TR'))

  const add = (raw: string) => {
    const v = raw.trim()
    if (!v || has(v)) {
      setText('')
      return
    }
    onChange([...allergens, v])
    setText('')
  }

  const suggestions = COMMON_ALLERGENS.filter(
    (a) => !has(a) && a.toLocaleLowerCase('tr-TR').includes(text.trim().toLocaleLowerCase('tr-TR'))
  ).slice(0, 6)

  return (
    <div className="relative">
      <div
        className={cn(
          'flex min-h-9 flex-wrap items-center gap-1 rounded-xl border border-input bg-background/40 px-2 py-1',
          focused && 'ring-1 ring-ring'
        )}
      >
        {allergens.length === 0 && !focused && !text && (
          <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-amber-500/70" />
        )}
        {allergens.map((a) => (
          <span
            key={a}
            className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400"
          >
            {a}
            <button
              type="button"
              onClick={() => onChange(allergens.filter((x) => x !== a))}
              className="rounded hover:text-destructive"
              aria-label={`${a} alerjenini kaldır`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={text}
          onChange={(e) => {
            const v = e.target.value
            if (v.includes(',')) {
              v.split(',').forEach((p, i, arr) => i < arr.length - 1 && add(p))
              setText(v.split(',').pop() || '')
            } else setText(v)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add(text)
            } else if (e.key === 'Backspace' && !text && allergens.length) {
              onChange(allergens.slice(0, -1))
            }
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            if (text.trim()) add(text)
          }}
          placeholder={allergens.length ? '' : 'Alerjen ekle'}
          className="min-w-[60px] flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
        />
      </div>
      {focused && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 flex flex-wrap gap-1 rounded-xl border border-border bg-popover p-1.5 shadow-lg">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                add(s)
              }}
              className="rounded-md bg-muted px-2 py-1 text-[11px] hover:bg-amber-500/20"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

import { test, expect } from '@playwright/test'
import { pickPrimaryBrandColorFromPixels, rgbToHex } from '../lib/extract-brand-color'

test.describe('rgbToHex', () => {
  test('hex biçimi', () => {
    expect(rgbToHex(225, 29, 72)).toBe('#e11d48')
  })
})

test.describe('pickPrimaryBrandColorFromPixels', () => {
  test('kırmızı logo tonunu seçer', () => {
    const pixels = Array.from({ length: 200 }, () => ({ r: 220, g: 30, b: 40, a: 255 }))
    const hex = pickPrimaryBrandColorFromPixels(pixels)
    expect(hex).toBeTruthy()
    expect(hex!.toLowerCase()).toMatch(/^#[0-9a-f]{6}$/)
    expect(parseInt(hex!.slice(1, 3), 16)).toBeGreaterThan(parseInt(hex!.slice(3, 5), 16))
  })

  test('şeffaf ve beyaz pikselleri yok sayar', () => {
    const pixels = [
      ...Array.from({ length: 80 }, () => ({ r: 255, g: 255, b: 255, a: 0 })),
      ...Array.from({ length: 120 }, () => ({ r: 15, g: 118, b: 110, a: 255 })),
    ]
    expect(pickPrimaryBrandColorFromPixels(pixels)).toBe('#0f766e')
  })
})

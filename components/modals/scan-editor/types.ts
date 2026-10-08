export interface ParsedItem {
  name: string
  price: string
  calories?: number
  description?: string
  allergens?: string[]
  image_url?: string
}

export interface ParsedCategory {
  name: string
  items: ParsedItem[]
}

/** Editör içinde kararlı kimlik taşıyan ürün */
export interface EditorItem extends ParsedItem {
  id: string
}

export interface EditorCategory {
  id: string
  name: string
  items: EditorItem[]
}

export interface EditorState {
  menuName: string
  categories: EditorCategory[]
}

export type ItemIssue = 'noName' | 'noPrice' | 'duplicate'

export const COMMON_ALLERGENS = [
  'Gluten',
  'Süt',
  'Yumurta',
  'Fıstık',
  'Fındık',
  'Ceviz',
  'Soya',
  'Balık',
  'Kabuklu deniz ürünü',
  'Susam',
  'Hardal',
  'Kereviz',
]

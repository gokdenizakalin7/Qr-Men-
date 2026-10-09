/** menu_templates tablosundan okunan şablon özeti (istemci ve sunucu ortak tipi). */
export interface CatalogTemplateSummary {
  slug: string
  businessType: string | null
  name: string
  tagline: string
  venueType: string
  icon: string
  color: string
  coverImage: string
  description: string
  itemCount: number
  /** Menüde ana başlık olacak (seviye 2) kategoriler: ad + ürün sayısı */
  categories: { name: string; itemCount: number }[]
}

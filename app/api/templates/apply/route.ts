import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin as db } from '@/lib/supabase-admin'
import { requireSubdomainAccess } from '@/lib/auth-middleware'

const payloadSchema = z.object({
  subdomain: z.string().min(1),
  templateSlug: z.string().min(1),
  /** Verilirse bu menünün içeriği şablonla değiştirilir; yoksa yeni menü açılır. */
  menuId: z.string().uuid().nullable().optional(),
})

/** POST /api/templates/apply — katalog şablonunu işletme menüsüne kopyalar (apply_catalog_template RPC). */
export async function POST(request: Request) {
  try {
    const parsed = payloadSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Geçersiz veri formatı' }, { status: 400 })
    }
    const { subdomain, templateSlug, menuId } = parsed.data

    const access = await requireSubdomainAccess(request, subdomain)
    if ('response' in access) return access.response

    const { data, error } = await db.rpc('apply_catalog_template', {
      p_org_id: access.organizationId,
      p_template_slug: templateSlug,
      p_menu_id: menuId ?? null,
    })

    if (error) {
      console.error('apply_catalog_template error:', error)
      if (error.code === 'P0002') return NextResponse.json({ error: 'Şablon bulunamadı.' }, { status: 404 })
      if (error.code === '42501') return NextResponse.json({ error: 'Bu menüyü düzenleme yetkiniz yok.' }, { status: 403 })
      return NextResponse.json({ error: 'Şablon uygulanamadı.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, ...(data as object) })
  } catch (err) {
    console.error('Template apply error:', err)
    return NextResponse.json({ error: 'Şablon uygulanamadı.' }, { status: 500 })
  }
}

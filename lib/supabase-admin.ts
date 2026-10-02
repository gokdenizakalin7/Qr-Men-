import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client — Server Only
 * 
 * Bu client SADECE sunucu tarafında (API Routes, Server Components) kullanılır.
 * Service Role Key ile RLS'yi bypass eder — tarayıcıya kesinlikle gönderilmemelidir.
 * 
 * Kullanım:
 *   import { supabaseAdmin } from '@/lib/supabase-admin'
 *   const { data } = await supabaseAdmin.from('organizations').select('*')
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    '⚠️ Supabase admin bağlantı bilgileri eksik. .env.local dosyasına SUPABASE_SERVICE_ROLE_KEY ekleyin.'
  )
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

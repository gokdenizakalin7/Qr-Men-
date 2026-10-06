import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Client — Browser (Public)
 * 
 * Bu client tarayıcıda çalışır ve sadece anon key kullanır.
 * Row Level Security (RLS) politikaları ile korunur.
 * 
 * Kullanım:
 *   import { supabase } from '@/lib/supabase'
 *   const { data } = await supabase.from('organizations').select('*')
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase bağlantı bilgileri eksik. .env.local dosyasına NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY ekleyin.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

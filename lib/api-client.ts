import { supabase } from './supabase'

/**
 * Korumalı API çağrıları için fetch sarmalayıcısı.
 * Geçerli Supabase erişim token'ını Authorization başlığına ekler.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)

  return fetch(input, { ...init, headers })
}

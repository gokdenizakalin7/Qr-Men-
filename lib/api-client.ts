export async function authFetch(url: string, options: RequestInit = {}) {
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('sb-access-token') || '';
  }
  
  const headers = {
    ...options.headers,
    'Authorization': token ? `Bearer ${token}` : '',
  };
  
  const res = await fetch(url, { ...options, headers });
  
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      // Sadece sb-access-token değil, her şeyi temizle ve giriş sayfasına at
      localStorage.clear();
      window.location.href = '/login';
    }
  }
  
  return res;
}

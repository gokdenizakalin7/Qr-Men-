import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // Yerel ağdaki cihazlardan (telefon vb.) dev sunucuya erişim için
  allowedDevOrigins: ['192.168.1.*', '192.168.0.*', '172.20.10.*', '10.0.0.*'],
  typescript: {
    ignoreBuildErrors: false,
  },
  turbopack: {}, // Silence Next.js 16 Turbopack warning
};

export default nextConfig;

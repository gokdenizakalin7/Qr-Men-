import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  turbopack: {}, // Silence Next.js 16 Turbopack warning
};

export default nextConfig;

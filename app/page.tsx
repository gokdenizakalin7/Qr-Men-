'use client'

import dynamic from 'next/dynamic'

const ClientApp = dynamic(
  () => import('@/components/ClientApp').then((mod) => mod.ClientApp),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }
)

export default function Page() {
  return <ClientApp />
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GamesRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to Italian games page
    router.replace('/giochi/')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-onde-ocean/60">Redirecting to games...</p>
    </div>
  )
}

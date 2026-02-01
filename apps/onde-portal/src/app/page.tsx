'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPreferredLocale } from '@/i18n/config'

// Root page - redirects to locale-specific page
export default function RootPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Get preferred locale from localStorage or browser
    const preferredLocale = getPreferredLocale()
    router.replace(`/${preferredLocale}/`)
  }, [router])
  
  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#E8F4F8] to-[#A8D8E0]">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🌊</div>
        <h1 className="text-2xl font-display font-bold text-teal-800">Onde</h1>
        <p className="text-teal-600 mt-2">Loading...</p>
      </div>
    </div>
  )
}

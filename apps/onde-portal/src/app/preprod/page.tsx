'use client'

// PRE-PRODUCTION environment
// Simula onde.la per testing
// Redirect to main portal with special flag to bypass surf selector

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PreprodPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Set a flag in sessionStorage to indicate we want the portal, not surf selector
    sessionStorage.setItem('showPortal', 'true')
    // Redirect to home which will now show the portal
    window.location.href = '/?mode=preprod'
  }, [router])
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading ONDE.LA Pre-Production...</p>
      </div>
    </div>
  )
}

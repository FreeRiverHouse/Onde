'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Global loading indicator that shows during route transitions.
 * Add to layout.tsx to enable site-wide loading feedback.
 */
export function GlobalLoadingIndicator() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Start loading on route change
    setIsLoading(true)
    setProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 100)

    // Complete after a short delay (Next.js handles actual loading)
    const completeTimeout = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 200)
    }, 300)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(completeTimeout)
    }
  }, [pathname, searchParams])

  if (!isLoading) return null

  return (
    <>
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-onde-coral via-pink-500 to-onde-coral transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Optional: Subtle overlay for longer loads */}
      {progress > 50 && progress < 100 && (
        <div className="fixed inset-0 z-[9998] bg-black/5 pointer-events-none transition-opacity duration-300" />
      )}
    </>
  )
}

/**
 * Suspense-compatible loading indicator for specific sections.
 */
export function SectionLoadingIndicator({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-3 text-onde-ocean/60">
        <div className="w-5 h-5 border-2 border-onde-coral border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  )
}

export default GlobalLoadingIndicator

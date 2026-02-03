'use client'

import { useState, useEffect } from 'react'

interface ScrollToTopProps {
  threshold?: number
  className?: string
}

/**
 * Floating scroll-to-top button that appears after scrolling down.
 */
export function ScrollToTop({ threshold = 400, className = '' }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial position

    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-6 right-6 z-40
        w-12 h-12 rounded-full
        bg-onde-coral shadow-lg shadow-onde-coral/30
        text-white
        flex items-center justify-center
        hover:bg-onde-coral/90 hover:scale-110
        active:scale-95
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-onde-coral focus:ring-offset-2
        ${className}
      `}
      aria-label="Scroll to top"
      title="Back to top"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2.5} 
          d="M5 15l7-7 7 7" 
        />
      </svg>
    </button>
  )
}

export default ScrollToTop

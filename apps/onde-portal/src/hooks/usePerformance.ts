'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook to detect reduced motion preference
 * Respects user's accessibility settings
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])
  
  return prefersReducedMotion
}

/**
 * Hook to detect if device is likely mobile
 * Based on viewport width and touch support
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isNarrow = window.innerWidth < breakpoint
      setIsMobile(hasTouch || isNarrow)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [breakpoint])
  
  return isMobile
}

/**
 * Hook for intersection observer based lazy loading
 * Only loads content when visible in viewport
 */
export function useInView(options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false)
  const [hasBeenInView, setHasBeenInView] = useState(false)
  const ref = useRef<HTMLElement>(null)
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting)
      if (entry.isIntersecting) {
        setHasBeenInView(true)
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options,
    })
    
    observer.observe(element)
    return () => observer.disconnect()
  }, [options])
  
  return { ref, isInView, hasBeenInView }
}

/**
 * Hook to defer expensive operations until after paint
 * Useful for non-critical UI updates
 */
export function useDeferredValue<T>(value: T, delay = 0) {
  const [deferredValue, setDeferredValue] = useState(value)
  
  useEffect(() => {
    if (delay === 0) {
      requestIdleCallback?.(() => setDeferredValue(value)) 
        ?? setTimeout(() => setDeferredValue(value), 0)
    } else {
      const timeout = setTimeout(() => setDeferredValue(value), delay)
      return () => clearTimeout(timeout)
    }
  }, [value, delay])
  
  return deferredValue
}

/**
 * Hook to detect network connection quality
 * Returns true if on slow connection (2G, 3G, or saveData enabled)
 */
export function useSlowConnection() {
  const [isSlow, setIsSlow] = useState(false)
  
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection
    if (!connection) return
    
    const checkConnection = () => {
      const slowTypes = ['slow-2g', '2g', '3g']
      const isSaveData = connection.saveData === true
      const isSlowType = slowTypes.includes(connection.effectiveType || '')
      setIsSlow(isSaveData || isSlowType)
    }
    
    checkConnection()
    connection.addEventListener?.('change', checkConnection)
    return () => connection.removeEventListener?.('change', checkConnection)
  }, [])
  
  return isSlow
}

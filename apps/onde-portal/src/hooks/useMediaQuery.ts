import { useState, useEffect } from 'react'

/**
 * Hook for responsive design with media queries.
 * SSR-safe with sensible defaults.
 * 
 * Usage:
 * const isMobile = useMediaQuery('(max-width: 768px)')
 * const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
 */
export function useMediaQuery(query: string, defaultValue: boolean = false): boolean {
  const [matches, setMatches] = useState(defaultValue)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    
    // Set initial value
    setMatches(mediaQuery.matches)

    // Handler for changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
    
    // Legacy browsers
    mediaQuery.addListener(handler)
    return () => mediaQuery.removeListener(handler)
  }, [query])

  return matches
}

// Preset breakpoints matching Tailwind
export function useIsMobile() {
  return useMediaQuery('(max-width: 639px)')
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 640px) and (max-width: 1023px)')
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)')
}

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

export function usePrefersDarkMode() {
  return useMediaQuery('(prefers-color-scheme: dark)')
}

export default useMediaQuery

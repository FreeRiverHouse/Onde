import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook to trap focus within a container (for modals, dialogs, etc.)
 * 
 * Usage:
 * const { containerRef } = useFocusTrap(isOpen)
 * <div ref={containerRef}>...modal content...</div>
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter(el => el.offsetParent !== null) // Only visible elements
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || event.key !== 'Tab') return

    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey) {
      // Shift + Tab: go backwards
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab: go forwards
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }, [isActive, getFocusableElements])

  useEffect(() => {
    if (isActive) {
      // Store current active element
      previousActiveElement.current = document.activeElement as HTMLElement

      // Focus first focusable element in container
      const focusableElements = getFocusableElements()
      if (focusableElements.length > 0) {
        // Small delay to ensure DOM is ready
        setTimeout(() => focusableElements[0].focus(), 10)
      }

      // Add event listener
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      
      // Restore focus when trap is deactivated
      if (!isActive && previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isActive, handleKeyDown, getFocusableElements])

  return { containerRef }
}

export default useFocusTrap

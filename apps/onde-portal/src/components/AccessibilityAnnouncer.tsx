'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface AnnouncerContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void
}

const AnnouncerContext = createContext<AnnouncerContextType | null>(null)

export function useAnnouncer() {
  const context = useContext(AnnouncerContext)
  if (!context) {
    // Return no-op if not within provider (graceful degradation)
    return { announce: () => {} }
  }
  return context
}

interface AccessibilityAnnouncerProps {
  children: ReactNode
}

/**
 * Provides screen reader announcements for dynamic content.
 * 
 * Usage:
 * 1. Wrap your app with <AccessibilityAnnouncer>
 * 2. Use the useAnnouncer() hook to announce changes
 * 
 * Example:
 * const { announce } = useAnnouncer()
 * announce('Book downloaded successfully')
 * announce('Error: Connection failed', 'assertive')
 */
export function AccessibilityAnnouncer({ children }: AccessibilityAnnouncerProps) {
  const [politeMessage, setPoliteMessage] = useState('')
  const [assertiveMessage, setAssertiveMessage] = useState('')

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      // Clear first to ensure re-announcement of same message
      setAssertiveMessage('')
      setTimeout(() => setAssertiveMessage(message), 50)
    } else {
      setPoliteMessage('')
      setTimeout(() => setPoliteMessage(message), 50)
    }

    // Clear after announcement
    setTimeout(() => {
      if (priority === 'assertive') {
        setAssertiveMessage('')
      } else {
        setPoliteMessage('')
      }
    }, 1000)
  }, [])

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      
      {/* Screen reader only live regions */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  )
}

export default AccessibilityAnnouncer

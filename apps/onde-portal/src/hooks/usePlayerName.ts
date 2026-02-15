'use client'

import { useState, useEffect, useCallback } from 'react'
import { trackPlayerRegister } from '@/hooks/useAnalytics'

const STORAGE_KEY = 'onde-player-name'

/**
 * Global player name hook.
 * Stores name once, available everywhere across all games.
 */
export function usePlayerName() {
  const [name, setNameState] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setNameState(stored)
    } catch {
      // SSR or storage not available
    }
    setMounted(true)
  }, [])

  const setName = useCallback((newName: string) => {
    const trimmed = newName.trim().substring(0, 20)
    const hadName = !!name
    setNameState(trimmed)
    try {
      if (trimmed) {
        localStorage.setItem(STORAGE_KEY, trimmed)
        // Track first-time registration only
        if (!hadName) {
          trackPlayerRegister()
        }
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // Storage not available
    }
  }, [name])

  return {
    name,
    setName,
    mounted,
    hasName: mounted && name.length > 0,
  }
}

export default usePlayerName

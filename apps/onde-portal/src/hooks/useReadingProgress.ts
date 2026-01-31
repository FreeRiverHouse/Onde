'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'onde-reading-progress'

interface BookProgress {
  bookId: string
  startedAt: string
  progress: number // 0-100 percentage
  lastReadAt: string
}

interface ReadingProgressState {
  books: Record<string, BookProgress>
}

export function useReadingProgress() {
  const [progressState, setProgressState] = useState<ReadingProgressState>({ books: {} })
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ReadingProgressState
        setProgressState(parsed)
      }
    } catch (e) {
      console.error('Failed to load reading progress:', e)
    }
  }, [])

  // Save to localStorage when state changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressState))
      } catch (e) {
        console.error('Failed to save reading progress:', e)
      }
    }
  }, [progressState, mounted])

  const markAsStarted = useCallback((bookId: string) => {
    setProgressState(prev => {
      // Don't overwrite if already exists
      if (prev.books[bookId]) {
        return {
          books: {
            ...prev.books,
            [bookId]: {
              ...prev.books[bookId],
              lastReadAt: new Date().toISOString()
            }
          }
        }
      }
      
      return {
        books: {
          ...prev.books,
          [bookId]: {
            bookId,
            startedAt: new Date().toISOString(),
            progress: 0,
            lastReadAt: new Date().toISOString()
          }
        }
      }
    })
  }, [])

  const updateProgress = useCallback((bookId: string, progress: number) => {
    setProgressState(prev => {
      const existing = prev.books[bookId]
      const now = new Date().toISOString()
      
      return {
        books: {
          ...prev.books,
          [bookId]: {
            bookId,
            startedAt: existing?.startedAt || now,
            progress: Math.min(100, Math.max(0, progress)),
            lastReadAt: now
          }
        }
      }
    })
  }, [])

  const isStarted = useCallback((bookId: string): boolean => {
    return !!progressState.books[bookId]
  }, [progressState.books])

  const getProgress = useCallback((bookId: string): number => {
    return progressState.books[bookId]?.progress || 0
  }, [progressState.books])

  const getBookProgress = useCallback((bookId: string): BookProgress | null => {
    return progressState.books[bookId] || null
  }, [progressState.books])

  const getStartedCount = useCallback((): number => {
    return Object.keys(progressState.books).length
  }, [progressState.books])

  const getStartedBookIds = useCallback((): string[] => {
    return Object.keys(progressState.books)
  }, [progressState.books])

  const clearProgress = useCallback((bookId?: string) => {
    if (bookId) {
      setProgressState(prev => {
        const { [bookId]: _, ...rest } = prev.books
        return { books: rest }
      })
    } else {
      setProgressState({ books: {} })
    }
  }, [])

  return {
    markAsStarted,
    updateProgress,
    isStarted,
    getProgress,
    getBookProgress,
    getStartedCount,
    getStartedBookIds,
    clearProgress,
    mounted
  }
}

'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'onde-recently-viewed'
const MAX_ITEMS = 5

interface RecentlyViewedItem {
  bookId: string
  viewedAt: string
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[]
}

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedState>({ items: [] })
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as RecentlyViewedState
        setRecentlyViewed(parsed)
      }
    } catch (e) {
      console.error('Failed to load recently viewed:', e)
    }
  }, [])

  // Save to localStorage when list changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed))
      } catch (e) {
        console.error('Failed to save recently viewed:', e)
      }
    }
  }, [recentlyViewed, mounted])

  const addToRecentlyViewed = useCallback((bookId: string) => {
    setRecentlyViewed(prev => {
      // Remove existing entry for this book (if any)
      const filtered = prev.items.filter(item => item.bookId !== bookId)
      
      // Add to front
      const newItems = [
        { bookId, viewedAt: new Date().toISOString() },
        ...filtered
      ].slice(0, MAX_ITEMS) // Keep only last 5
      
      return { items: newItems }
    })
  }, [])

  const getRecentlyViewed = useCallback((): RecentlyViewedItem[] => {
    return recentlyViewed.items
  }, [recentlyViewed.items])

  const getRecentlyViewedIds = useCallback((): string[] => {
    return recentlyViewed.items.map(item => item.bookId)
  }, [recentlyViewed.items])

  const getRecentlyViewedCount = useCallback((): number => {
    return recentlyViewed.items.length
  }, [recentlyViewed.items])

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed({ items: [] })
  }, [])

  const isRecentlyViewed = useCallback((bookId: string): boolean => {
    return recentlyViewed.items.some(item => item.bookId === bookId)
  }, [recentlyViewed.items])

  return {
    addToRecentlyViewed,
    getRecentlyViewed,
    getRecentlyViewedIds,
    getRecentlyViewedCount,
    clearRecentlyViewed,
    isRecentlyViewed,
    mounted
  }
}

'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'onde-book-favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setFavorites(parsed)
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
    setMounted(true)
  }, [])

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
      } catch (error) {
        console.error('Error saving favorites:', error)
      }
    }
  }, [favorites, mounted])

  const toggleFavorite = useCallback((bookId: string) => {
    setFavorites(prev => {
      if (prev.includes(bookId)) {
        return prev.filter(id => id !== bookId)
      }
      return [...prev, bookId]
    })
  }, [])

  const isFavorite = useCallback((bookId: string) => {
    return favorites.includes(bookId)
  }, [favorites])

  const getFavoritesCount = useCallback(() => {
    return favorites.length
  }, [favorites])

  const getFavoriteIds = useCallback(() => {
    return favorites
  }, [favorites])

  return {
    toggleFavorite,
    isFavorite,
    getFavoritesCount,
    getFavoriteIds,
    mounted,
  }
}

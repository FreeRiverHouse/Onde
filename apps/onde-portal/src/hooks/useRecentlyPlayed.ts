'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'onde-recently-played'
const MAX_GAMES = 8

export interface RecentlyPlayedGame {
  id: string
  title: string
  emoji: string
  href: string
  lastPlayed: number // timestamp
}

export function useRecentlyPlayed() {
  const [recentGames, setRecentGames] = useState<RecentlyPlayedGame[]>([])
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount (SSR-safe)
  useEffect(() => {
    setMounted(true)
    if (typeof window === 'undefined') return

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as RecentlyPlayedGame[]
        // Sort by most recent first
        setRecentGames(parsed.sort((a, b) => b.lastPlayed - a.lastPlayed))
      }
    } catch (e) {
      console.error('Failed to load recently played:', e)
    }
  }, [])

  // Persist to localStorage whenever games list changes
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recentGames))
    } catch (e) {
      console.error('Failed to save recently played:', e)
    }
  }, [recentGames, mounted])

  const addGame = useCallback((game: Omit<RecentlyPlayedGame, 'lastPlayed'>) => {
    setRecentGames(prev => {
      // Remove existing entry for this game
      const filtered = prev.filter(g => g.id !== game.id)

      // Add at front with current timestamp
      const updated = [
        { ...game, lastPlayed: Date.now() },
        ...filtered,
      ].slice(0, MAX_GAMES)

      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    setRecentGames([])
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  return {
    recentGames,
    addGame,
    clearHistory,
    mounted,
  }
}

export default useRecentlyPlayed

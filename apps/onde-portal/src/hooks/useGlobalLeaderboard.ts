'use client'

import { useState, useEffect, useCallback } from 'react'

export interface LeaderboardEntry {
  id: string
  name: string
  score: number
  game: string
  gameEmoji: string
  timestamp: number
}

interface UseGlobalLeaderboardReturn {
  entries: LeaderboardEntry[]
  topPlayers: LeaderboardEntry[]
  thisWeekEntries: LeaderboardEntry[]
  addScore: (name: string, score: number, game: string, gameEmoji?: string) => void
  getGameLeaderboard: (game: string) => LeaderboardEntry[]
  clearLeaderboard: () => void
  getPlayerBestScore: (name: string, game?: string) => LeaderboardEntry | null
}

const STORAGE_KEY = 'onde-global-leaderboard'
const MAX_ENTRIES = 100 // Keep top 100 entries total
const TOP_PLAYERS_COUNT = 10

// Game name to emoji mapping
const GAME_EMOJIS: Record<string, string> = {
  'simon': '🔴',
  'memory': '🧠',
  'typing': '⌨️',
  'reaction': '⚡',
  'puzzle': '🧩',
  'quiz': '❓',
  'matching': '🃏',
  'counting': '🔢',
  'spot-difference': '👀',
  'word-puzzle': '📝',
  'arcade': '🕹️',
  'moonlight': '🐱',
  'chef': '👨‍🍳',
  'fortune': '🥠',
  'draw': '🎨',
  'music': '🎵',
  'coloring': '🖍️',
  'skin-creator': '🎨',
}

function getGameEmoji(game: string): string {
  return GAME_EMOJIS[game.toLowerCase()] || '🎮'
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getWeekStart(): number {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  const weekStart = new Date(now.setDate(diff))
  weekStart.setHours(0, 0, 0, 0)
  return weekStart.getTime()
}

export function useGlobalLeaderboard(): UseGlobalLeaderboardReturn {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as LeaderboardEntry[]
        // Sort by score descending
        setEntries(parsed.sort((a, b) => b.score - a.score))
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    }
  }, [])

  // Save to localStorage whenever entries change
  const saveEntries = useCallback((newEntries: LeaderboardEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries))
    } catch (error) {
      console.error('Failed to save leaderboard:', error)
    }
  }, [])

  // Add a new score
  const addScore = useCallback((name: string, score: number, game: string, gameEmoji?: string) => {
    if (!name.trim() || score <= 0) return

    const newEntry: LeaderboardEntry = {
      id: generateId(),
      name: name.trim().substring(0, 20), // Limit name length
      score,
      game,
      gameEmoji: gameEmoji || getGameEmoji(game),
      timestamp: Date.now(),
    }

    setEntries(prev => {
      // Add new entry and sort by score
      const updated = [...prev, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_ENTRIES) // Keep only top entries
      
      saveEntries(updated)
      return updated
    })
  }, [saveEntries])

  // Get top players (unique names, best score per player)
  const topPlayers = (() => {
    const playerBest = new Map<string, LeaderboardEntry>()
    
    for (const entry of entries) {
      const existing = playerBest.get(entry.name)
      if (!existing || entry.score > existing.score) {
        playerBest.set(entry.name, entry)
      }
    }
    
    return Array.from(playerBest.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_PLAYERS_COUNT)
  })()

  // Get this week's entries
  const thisWeekEntries = (() => {
    const weekStart = getWeekStart()
    return entries
      .filter(e => e.timestamp >= weekStart)
      .sort((a, b) => b.score - a.score)
  })()

  // Get leaderboard for a specific game
  const getGameLeaderboard = useCallback((game: string): LeaderboardEntry[] => {
    return entries
      .filter(e => e.game.toLowerCase() === game.toLowerCase())
      .sort((a, b) => b.score - a.score)
  }, [entries])

  // Get a player's best score (optionally for a specific game)
  const getPlayerBestScore = useCallback((name: string, game?: string): LeaderboardEntry | null => {
    const playerEntries = entries.filter(e => 
      e.name.toLowerCase() === name.toLowerCase() &&
      (!game || e.game.toLowerCase() === game.toLowerCase())
    )
    
    if (playerEntries.length === 0) return null
    return playerEntries.reduce((best, current) => 
      current.score > best.score ? current : best
    )
  }, [entries])

  // Clear all entries
  const clearLeaderboard = useCallback(() => {
    setEntries([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    entries,
    topPlayers,
    thisWeekEntries,
    addScore,
    getGameLeaderboard,
    clearLeaderboard,
    getPlayerBestScore,
  }
}

// Helper to format score with commas
export function formatScore(score: number): string {
  return score.toLocaleString()
}

// Helper to format timestamp
export function formatTimestamp(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  
  return new Date(timestamp).toLocaleDateString()
}

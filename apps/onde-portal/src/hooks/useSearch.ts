'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { books, Book } from '@/data/books'

// Games data extracted from games page
export interface Game {
  id: string
  href: string
  title: string
  desc: string
  emoji: string
}

export const games: Game[] = [
  { id: 'moonlight', href: '/games/moonlight-magic-house', title: 'Moonlight', desc: 'Pet House', emoji: '🐱' },
  { id: 'skin', href: '/games/skin-creator', title: 'Skin Studio', desc: 'Minecraft Skins', emoji: '🎨' },
  { id: 'chef', href: '/games/kids-chef-studio', title: 'Kids Chef', desc: 'Cooking', emoji: '👨‍🍳' },
  { id: 'fortune', href: '/games/fortune-cookie', title: 'Fortune', desc: 'Cookie', emoji: '🥠' },
]

export type SearchResultType = 'book' | 'game'

export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  subtitle: string
  href: string
  emoji?: string
  coverImage?: string
  score: number
}

const RECENT_SEARCHES_KEY = 'onde-recent-searches'
const MAX_RECENT_SEARCHES = 5

// Fuzzy matching algorithm
function fuzzyMatch(pattern: string, str: string): number {
  pattern = pattern.toLowerCase()
  str = str.toLowerCase()
  
  // Exact match gets highest score
  if (str === pattern) return 100
  
  // Starts with pattern
  if (str.startsWith(pattern)) return 90
  
  // Contains pattern as substring
  if (str.includes(pattern)) return 80
  
  // Fuzzy character matching
  let patternIdx = 0
  let score = 0
  let consecutiveBonus = 0
  
  for (let i = 0; i < str.length && patternIdx < pattern.length; i++) {
    if (str[i] === pattern[patternIdx]) {
      score += 10 + consecutiveBonus
      consecutiveBonus += 5
      patternIdx++
    } else {
      consecutiveBonus = 0
    }
  }
  
  // All pattern characters must be found
  if (patternIdx < pattern.length) return 0
  
  // Normalize score based on pattern length
  return Math.min(70, (score / pattern.length) * 2)
}

function searchBooks(query: string): SearchResult[] {
  if (!query.trim()) return []
  
  return books
    .map((book: Book) => {
      const titleScore = fuzzyMatch(query, book.title)
      const authorScore = fuzzyMatch(query, book.author) * 0.8 // Slightly lower weight for author
      const bestScore = Math.max(titleScore, authorScore)
      
      return {
        id: book.id,
        type: 'book' as SearchResultType,
        title: book.title,
        subtitle: book.author,
        href: `/reader/?book=${book.id}`,
        coverImage: book.coverImage,
        score: bestScore,
      }
    })
    .filter(result => result.score > 0)
}

function searchGames(query: string): SearchResult[] {
  if (!query.trim()) return []
  
  return games
    .map((game: Game) => {
      const titleScore = fuzzyMatch(query, game.title)
      const descScore = fuzzyMatch(query, game.desc) * 0.6
      const bestScore = Math.max(titleScore, descScore)
      
      return {
        id: game.id,
        type: 'game' as SearchResultType,
        title: game.title,
        subtitle: game.desc,
        href: game.href,
        emoji: game.emoji,
        score: bestScore,
      }
    })
    .filter(result => result.score > 0)
}

export interface RecentSearch {
  query: string
  timestamp: number
}

export function useSearch() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [mounted, setMounted] = useState(false)

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed)
        }
      }
    } catch (error) {
      console.error('Error loading recent searches:', error)
    }
    setMounted(true)
  }, [])

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    setRecentSearches(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(s => s.query.toLowerCase() !== searchQuery.toLowerCase())
      // Add new search at the beginning
      const updated = [
        { query: searchQuery, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENT_SEARCHES)
      
      // Persist to localStorage
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error('Error saving recent searches:', error)
      }
      
      return updated
    })
  }, [])

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY)
    } catch (error) {
      console.error('Error clearing recent searches:', error)
    }
  }, [])

  // Memoized search results
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return []
    
    const bookResults = searchBooks(query)
    const gameResults = searchGames(query)
    
    // Combine and sort by score
    return [...bookResults, ...gameResults]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Limit to 10 results
  }, [query])

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Keyboard navigation within search results
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        saveRecentSearch(query)
        return results[selectedIndex]
      }
    }
    return null
  }, [results, selectedIndex, query, saveRecentSearch])

  const open = useCallback(() => {
    setIsOpen(true)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  return {
    // State
    query,
    setQuery,
    isOpen,
    setIsOpen,
    selectedIndex,
    setSelectedIndex,
    results,
    recentSearches,
    mounted,
    
    // Actions
    open,
    close,
    handleKeyDown,
    saveRecentSearch,
    clearRecentSearches,
  }
}

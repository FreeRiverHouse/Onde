'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// Achievement rarity levels with styling
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: AchievementRarity
  category: 'reading' | 'gaming' | 'exploration' | 'social' | 'collection' | 'special'
  maxProgress?: number // For progressive achievements
  secret?: boolean // Hidden until unlocked
}

export interface UnlockedAchievement {
  achievementId: string
  unlockedAt: string
  progress: number
  notified: boolean
}

export interface AchievementProgress {
  [achievementId: string]: {
    progress: number
    unlockedAt?: string
    notified: boolean
  }
}

export interface AchievementState {
  unlocked: AchievementProgress
  stats: {
    booksStarted: number
    booksCompleted: number
    totalReadingTime: number // minutes
    gamesPlayed: number
    gamesWon: number
    pagesVisited: string[]
    favoritesAdded: number
    recipesViewed: number
    vrExperiences: number
    playlistsListened: number
    surfSpots: number
    nightOwlSessions: number
    earlyBirdSessions: number
    streakDays: number
    lastActiveDate: string
  }
}

// Rarity colors and styling
export const RARITY_CONFIG = {
  common: {
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    glow: '',
    label: 'Common',
    points: 10
  },
  rare: {
    color: 'text-onde-ocean',
    bg: 'bg-onde-ocean/10',
    border: 'border-onde-ocean/30',
    glow: 'shadow-lg shadow-onde-ocean/20',
    label: 'Rare',
    points: 25
  },
  epic: {
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    glow: 'shadow-xl shadow-purple-500/30',
    label: 'Epic',
    points: 50
  },
  legendary: {
    color: 'text-onde-gold',
    bg: 'bg-gradient-to-br from-onde-gold/20 to-amber-200/30',
    border: 'border-onde-gold',
    glow: 'shadow-2xl shadow-onde-gold/40 animate-pulse',
    label: 'Legendary',
    points: 100
  }
}

// All achievements defined
export const ACHIEVEMENTS: Achievement[] = [
  // Reading achievements
  {
    id: 'first_book',
    name: 'First Chapter',
    description: 'Start reading your first book',
    icon: '📖',
    rarity: 'common',
    category: 'reading'
  },
  {
    id: 'bookworm',
    name: 'Bookworm',
    description: 'Start reading 5 different books',
    icon: '🐛',
    rarity: 'rare',
    category: 'reading',
    maxProgress: 5
  },
  {
    id: 'speed_reader',
    name: 'Speed Reader',
    description: 'Complete a book in under an hour',
    icon: '⚡',
    rarity: 'epic',
    category: 'reading'
  },
  {
    id: 'library_master',
    name: 'Library Master',
    description: 'Complete 10 books',
    icon: '📚',
    rarity: 'legendary',
    category: 'reading',
    maxProgress: 10
  },
  {
    id: 'page_turner',
    name: 'Page Turner',
    description: 'Read for 60 minutes total',
    icon: '📄',
    rarity: 'common',
    category: 'reading',
    maxProgress: 60
  },
  {
    id: 'marathon_reader',
    name: 'Marathon Reader',
    description: 'Read for 10 hours total',
    icon: '🏃',
    rarity: 'epic',
    category: 'reading',
    maxProgress: 600
  },

  // Gaming achievements
  {
    id: 'first_game',
    name: 'Player One',
    description: 'Play your first game',
    icon: '🎮',
    rarity: 'common',
    category: 'gaming'
  },
  {
    id: 'winner',
    name: 'First Victory',
    description: 'Win your first game',
    icon: '🏆',
    rarity: 'common',
    category: 'gaming'
  },
  {
    id: 'game_master',
    name: 'Game Master',
    description: 'Win 10 games',
    icon: '👑',
    rarity: 'rare',
    category: 'gaming',
    maxProgress: 10
  },
  {
    id: 'arcade_legend',
    name: 'Arcade Legend',
    description: 'Play 50 games',
    icon: '🕹️',
    rarity: 'epic',
    category: 'gaming',
    maxProgress: 50
  },
  {
    id: 'undefeated',
    name: 'Undefeated',
    description: 'Win 5 games in a row',
    icon: '🔥',
    rarity: 'legendary',
    category: 'gaming',
    maxProgress: 5
  },

  // Exploration achievements
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Visit 10 different pages',
    icon: '🧭',
    rarity: 'common',
    category: 'exploration',
    maxProgress: 10
  },
  {
    id: 'globe_trotter',
    name: 'Globe Trotter',
    description: 'Explore all main sections',
    icon: '🌍',
    rarity: 'rare',
    category: 'exploration'
  },
  {
    id: 'vr_pioneer',
    name: 'VR Pioneer',
    description: 'Experience VR content',
    icon: '🥽',
    rarity: 'rare',
    category: 'exploration'
  },
  {
    id: 'surf_spotter',
    name: 'Surf Spotter',
    description: 'Check out 5 surf spots',
    icon: '🏄',
    rarity: 'rare',
    category: 'exploration',
    maxProgress: 5
  },
  {
    id: 'wave_hunter',
    name: 'Wave Hunter',
    description: 'Check all surf spots',
    icon: '🌊',
    rarity: 'epic',
    category: 'exploration'
  },

  // Collection achievements
  {
    id: 'first_favorite',
    name: 'Heart Giver',
    description: 'Add your first favorite',
    icon: '❤️',
    rarity: 'common',
    category: 'collection'
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Add 10 items to favorites',
    icon: '💎',
    rarity: 'rare',
    category: 'collection',
    maxProgress: 10
  },
  {
    id: 'chef_curious',
    name: 'Chef Curious',
    description: 'View 5 recipes',
    icon: '👨‍🍳',
    rarity: 'common',
    category: 'collection',
    maxProgress: 5
  },
  {
    id: 'chef_master',
    name: 'Chef Master',
    description: 'View 20 recipes',
    icon: '🍽️',
    rarity: 'rare',
    category: 'collection',
    maxProgress: 20
  },
  {
    id: 'music_lover',
    name: 'Music Lover',
    description: 'Listen to 5 playlists',
    icon: '🎵',
    rarity: 'common',
    category: 'collection',
    maxProgress: 5
  },
  {
    id: 'dj_master',
    name: 'DJ Master',
    description: 'Listen to 20 playlists',
    icon: '🎧',
    rarity: 'epic',
    category: 'collection',
    maxProgress: 20
  },

  // Social achievements
  {
    id: 'family_first',
    name: 'Family First',
    description: 'Visit the family section',
    icon: '👨‍👩‍👧‍👦',
    rarity: 'common',
    category: 'social'
  },
  {
    id: 'about_us',
    name: 'Getting to Know Us',
    description: 'Read the about page',
    icon: '📝',
    rarity: 'common',
    category: 'social'
  },

  // Special/Time-based achievements
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Browse between midnight and 4 AM',
    icon: '🦉',
    rarity: 'rare',
    category: 'special'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Browse between 5 AM and 7 AM',
    icon: '🐦',
    rarity: 'rare',
    category: 'special'
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Visit 7 days in a row',
    icon: '📅',
    rarity: 'epic',
    category: 'special',
    maxProgress: 7
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Visit 30 days in a row',
    icon: '🎖️',
    rarity: 'legendary',
    category: 'special',
    maxProgress: 30
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Unlock 10 achievements',
    icon: '🏅',
    rarity: 'rare',
    category: 'special',
    maxProgress: 10
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Unlock all achievements',
    icon: '✨',
    rarity: 'legendary',
    category: 'special',
    secret: true
  }
]

const STORAGE_KEY = 'onde-achievements'

const DEFAULT_STATE: AchievementState = {
  unlocked: {},
  stats: {
    booksStarted: 0,
    booksCompleted: 0,
    totalReadingTime: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    pagesVisited: [],
    favoritesAdded: 0,
    recipesViewed: 0,
    vrExperiences: 0,
    playlistsListened: 0,
    surfSpots: 0,
    nightOwlSessions: 0,
    earlyBirdSessions: 0,
    streakDays: 0,
    lastActiveDate: ''
  }
}

export function useAchievements() {
  const [state, setState] = useState<AchievementState>(DEFAULT_STATE)
  const [mounted, setMounted] = useState(false)
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([])
  const [toastQueue, setToastQueue] = useState<Achievement[]>([])

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as AchievementState
        setState(parsed)
      }
    } catch (e) {
      console.error('Failed to load achievements:', e)
    }
    setMounted(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (e) {
        console.error('Failed to save achievements:', e)
      }
    }
  }, [state, mounted])

  // Check time-based achievements on mount
  useEffect(() => {
    if (!mounted) return
    
    const hour = new Date().getHours()
    
    // Night owl: midnight to 4 AM
    if (hour >= 0 && hour < 4) {
      trackStat('nightOwlSessions', 1)
    }
    
    // Early bird: 5 AM to 7 AM
    if (hour >= 5 && hour < 7) {
      trackStat('earlyBirdSessions', 1)
    }

    // Track daily streak
    const today = new Date().toDateString()
    if (state.stats.lastActiveDate !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (state.stats.lastActiveDate === yesterday.toDateString()) {
        // Consecutive day
        trackStat('streakDays', state.stats.streakDays + 1)
      } else if (state.stats.lastActiveDate !== today) {
        // Streak broken or first visit
        trackStat('streakDays', 1)
      }
      
      setState(prev => ({
        ...prev,
        stats: { ...prev.stats, lastActiveDate: today }
      }))
    }
  }, [mounted])

  // Check achievements after stat updates
  const checkAchievements = useCallback((currentState: AchievementState) => {
    const newUnlocks: Achievement[] = []
    const { stats, unlocked } = currentState

    // Helper to check and unlock
    const tryUnlock = (id: string, condition: boolean, progress: number = 1) => {
      const achievement = ACHIEVEMENTS.find(a => a.id === id)
      if (!achievement) return

      const current = unlocked[id]
      const maxProgress = achievement.maxProgress || 1
      const newProgress = Math.min(progress, maxProgress)

      if (current?.unlockedAt) return // Already unlocked

      if (condition && newProgress >= maxProgress) {
        newUnlocks.push(achievement)
        setState(prev => ({
          ...prev,
          unlocked: {
            ...prev.unlocked,
            [id]: {
              progress: maxProgress,
              unlockedAt: new Date().toISOString(),
              notified: false
            }
          }
        }))
      } else if (newProgress > (current?.progress || 0)) {
        // Update progress only
        setState(prev => ({
          ...prev,
          unlocked: {
            ...prev.unlocked,
            [id]: {
              progress: newProgress,
              notified: current?.notified || false
            }
          }
        }))
      }
    }

    // Reading achievements
    tryUnlock('first_book', stats.booksStarted >= 1)
    tryUnlock('bookworm', stats.booksStarted >= 5, stats.booksStarted)
    tryUnlock('library_master', stats.booksCompleted >= 10, stats.booksCompleted)
    tryUnlock('page_turner', stats.totalReadingTime >= 60, stats.totalReadingTime)
    tryUnlock('marathon_reader', stats.totalReadingTime >= 600, stats.totalReadingTime)

    // Gaming achievements
    tryUnlock('first_game', stats.gamesPlayed >= 1)
    tryUnlock('winner', stats.gamesWon >= 1)
    tryUnlock('game_master', stats.gamesWon >= 10, stats.gamesWon)
    tryUnlock('arcade_legend', stats.gamesPlayed >= 50, stats.gamesPlayed)

    // Exploration achievements
    tryUnlock('explorer', stats.pagesVisited.length >= 10, stats.pagesVisited.length)
    tryUnlock('vr_pioneer', stats.vrExperiences >= 1)
    tryUnlock('surf_spotter', stats.surfSpots >= 5, stats.surfSpots)

    // Collection achievements
    tryUnlock('first_favorite', stats.favoritesAdded >= 1)
    tryUnlock('collector', stats.favoritesAdded >= 10, stats.favoritesAdded)
    tryUnlock('chef_curious', stats.recipesViewed >= 5, stats.recipesViewed)
    tryUnlock('chef_master', stats.recipesViewed >= 20, stats.recipesViewed)
    tryUnlock('music_lover', stats.playlistsListened >= 5, stats.playlistsListened)
    tryUnlock('dj_master', stats.playlistsListened >= 20, stats.playlistsListened)

    // Special achievements
    tryUnlock('night_owl', stats.nightOwlSessions >= 1)
    tryUnlock('early_bird', stats.earlyBirdSessions >= 1)
    tryUnlock('dedicated', stats.streakDays >= 7, stats.streakDays)
    tryUnlock('veteran', stats.streakDays >= 30, stats.streakDays)

    // Meta achievements
    const unlockedCount = Object.values(unlocked).filter(u => u.unlockedAt).length + newUnlocks.length
    tryUnlock('centurion', unlockedCount >= 10, unlockedCount)
    tryUnlock('completionist', unlockedCount >= ACHIEVEMENTS.length - 1) // -1 for completionist itself

    if (newUnlocks.length > 0) {
      setNewlyUnlocked(prev => [...prev, ...newUnlocks])
      setToastQueue(prev => [...prev, ...newUnlocks])
    }

    return newUnlocks
  }, [])

  // Track a stat and check achievements
  const trackStat = useCallback(<K extends keyof AchievementState['stats']>(
    stat: K,
    value: AchievementState['stats'][K]
  ) => {
    setState(prev => {
      const newState = {
        ...prev,
        stats: {
          ...prev.stats,
          [stat]: value
        }
      }
      // Check achievements with new state
      setTimeout(() => checkAchievements(newState), 0)
      return newState
    })
  }, [checkAchievements])

  // Increment a numeric stat
  const incrementStat = useCallback((stat: keyof AchievementState['stats'], amount: number = 1) => {
    setState(prev => {
      const currentValue = prev.stats[stat]
      if (typeof currentValue !== 'number') return prev
      
      const newState = {
        ...prev,
        stats: {
          ...prev.stats,
          [stat]: currentValue + amount
        }
      }
      setTimeout(() => checkAchievements(newState), 0)
      return newState
    })
  }, [checkAchievements])

  // Track page visit
  const trackPageVisit = useCallback((pagePath: string) => {
    setState(prev => {
      if (prev.stats.pagesVisited.includes(pagePath)) return prev
      
      const newState = {
        ...prev,
        stats: {
          ...prev.stats,
          pagesVisited: [...prev.stats.pagesVisited, pagePath]
        }
      }
      
      // Check for specific page achievements
      if (pagePath.includes('/famiglia') || pagePath.includes('/family')) {
        setTimeout(() => unlockAchievement('family_first'), 0)
      }
      if (pagePath.includes('/about')) {
        setTimeout(() => unlockAchievement('about_us'), 0)
      }
      if (pagePath.includes('/vr')) {
        incrementStat('vrExperiences')
      }
      if (pagePath.includes('/surf')) {
        incrementStat('surfSpots')
      }
      
      setTimeout(() => checkAchievements(newState), 0)
      return newState
    })
  }, [checkAchievements])

  // Manually unlock an achievement
  const unlockAchievement = useCallback((achievementId: string) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
    if (!achievement) return false

    setState(prev => {
      if (prev.unlocked[achievementId]?.unlockedAt) return prev

      setNewlyUnlocked(p => [...p, achievement])
      setToastQueue(p => [...p, achievement])

      return {
        ...prev,
        unlocked: {
          ...prev.unlocked,
          [achievementId]: {
            progress: achievement.maxProgress || 1,
            unlockedAt: new Date().toISOString(),
            notified: false
          }
        }
      }
    })
    return true
  }, [])

  // Mark achievement toast as shown
  const markNotified = useCallback((achievementId: string) => {
    setState(prev => ({
      ...prev,
      unlocked: {
        ...prev.unlocked,
        [achievementId]: {
          ...prev.unlocked[achievementId],
          notified: true
        }
      }
    }))
  }, [])

  // Pop next achievement from toast queue
  const popToastQueue = useCallback(() => {
    const next = toastQueue[0]
    if (next) {
      setToastQueue(prev => prev.slice(1))
      markNotified(next.id)
    }
    return next
  }, [toastQueue, markNotified])

  // Get achievement by ID
  const getAchievement = useCallback((id: string): Achievement | undefined => {
    return ACHIEVEMENTS.find(a => a.id === id)
  }, [])

  // Check if achievement is unlocked
  const isUnlocked = useCallback((id: string): boolean => {
    return !!state.unlocked[id]?.unlockedAt
  }, [state.unlocked])

  // Get progress for an achievement
  const getProgress = useCallback((id: string): { current: number; max: number; percentage: number } => {
    const achievement = ACHIEVEMENTS.find(a => a.id === id)
    if (!achievement) return { current: 0, max: 1, percentage: 0 }

    const max = achievement.maxProgress || 1
    const current = state.unlocked[id]?.progress || 0
    const percentage = Math.min(100, (current / max) * 100)

    return { current, max, percentage }
  }, [state.unlocked])

  // Get all achievements with status
  const getAllAchievements = useMemo(() => {
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: !!state.unlocked[achievement.id]?.unlockedAt,
      unlockedAt: state.unlocked[achievement.id]?.unlockedAt,
      progress: state.unlocked[achievement.id]?.progress || 0
    }))
  }, [state.unlocked])

  // Get achievements by category
  const getByCategory = useCallback((category: Achievement['category']) => {
    return getAllAchievements.filter(a => a.category === category)
  }, [getAllAchievements])

  // Get achievements by rarity
  const getByRarity = useCallback((rarity: AchievementRarity) => {
    return getAllAchievements.filter(a => a.rarity === rarity)
  }, [getAllAchievements])

  // Calculate total points
  const totalPoints = useMemo(() => {
    return Object.entries(state.unlocked)
      .filter(([_, data]) => data.unlockedAt)
      .reduce((sum, [id]) => {
        const achievement = ACHIEVEMENTS.find(a => a.id === id)
        if (!achievement) return sum
        return sum + RARITY_CONFIG[achievement.rarity].points
      }, 0)
  }, [state.unlocked])

  // Stats summary
  const stats = useMemo(() => {
    const unlocked = Object.values(state.unlocked).filter(u => u.unlockedAt).length
    const total = ACHIEVEMENTS.filter(a => !a.secret).length
    const secretsUnlocked = getAllAchievements.filter(a => a.secret && a.unlocked).length
    
    return {
      unlocked,
      total,
      percentage: Math.round((unlocked / total) * 100),
      secretsUnlocked,
      points: totalPoints,
      byRarity: {
        common: getAllAchievements.filter(a => a.rarity === 'common' && a.unlocked).length,
        rare: getAllAchievements.filter(a => a.rarity === 'rare' && a.unlocked).length,
        epic: getAllAchievements.filter(a => a.rarity === 'epic' && a.unlocked).length,
        legendary: getAllAchievements.filter(a => a.rarity === 'legendary' && a.unlocked).length
      }
    }
  }, [state.unlocked, getAllAchievements, totalPoints])

  // Clear a specific newly unlocked achievement
  const clearNewlyUnlocked = useCallback((id?: string) => {
    if (id) {
      setNewlyUnlocked(prev => prev.filter(a => a.id !== id))
    } else {
      setNewlyUnlocked([])
    }
  }, [])

  // Reset all achievements (for testing)
  const resetAchievements = useCallback(() => {
    setState(DEFAULT_STATE)
    setNewlyUnlocked([])
    setToastQueue([])
  }, [])

  return {
    // State
    mounted,
    stats,
    newlyUnlocked,
    toastQueue,
    totalPoints,
    
    // Getters
    getAllAchievements,
    getAchievement,
    getProgress,
    getByCategory,
    getByRarity,
    isUnlocked,
    
    // Tracking
    trackStat,
    incrementStat,
    trackPageVisit,
    unlockAchievement,
    
    // Toast management
    popToastQueue,
    markNotified,
    clearNewlyUnlocked,
    
    // Testing
    resetAchievements,
    
    // Raw state access
    rawStats: state.stats
  }
}

// Export types for external use
export type UseAchievementsReturn = ReturnType<typeof useAchievements>

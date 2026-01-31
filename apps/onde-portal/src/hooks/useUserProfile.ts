'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'onde-user-profile'

// Available avatar emojis for selection
export const AVATAR_EMOJIS = [
  '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐵',
  '🐰', '🐶', '🐱', '🦄', '🐲', '🦋', '🐢', '🦉',
  '🌟', '🌈', '🚀', '🎨', '📚', '🎮', '🎵', '✨',
  '🌸', '🌺', '🍀', '🌻', '🍎', '🍪', '🧁', '🎂',
]

// Achievement definitions
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: string
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_book', name: 'Bookworm Begin', description: 'Started reading your first book', icon: '📖' },
  { id: 'five_books', name: 'Library Explorer', description: 'Started 5 books', icon: '📚' },
  { id: 'first_complete', name: 'The Finisher', description: 'Completed your first book', icon: '🏆' },
  { id: 'first_game', name: 'Game On!', description: 'Played your first game', icon: '🎮' },
  { id: 'five_games', name: 'Pro Gamer', description: 'Played 5 different games', icon: '👾' },
  { id: 'first_favorite', name: 'Heart Collector', description: 'Added your first favorite', icon: '❤️' },
  { id: 'five_favorites', name: 'Super Fan', description: 'Added 5 favorites', icon: '💝' },
  { id: 'profile_setup', name: 'Identity Created', description: 'Set up your profile', icon: '🎭' },
  { id: 'week_streak', name: 'Weekly Warrior', description: 'Visited 7 days in a row', icon: '🔥' },
  { id: 'night_owl', name: 'Night Owl', description: 'Read after midnight', icon: '🦉' },
]

export interface UserProfile {
  username: string
  avatar: string
  createdAt: string
  lastVisit: string
  visitStreak: number
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'it'
  stats: {
    booksStarted: number
    booksCompleted: number
    gamesPlayed: string[] // game IDs
    totalReadingTime: number // minutes
    favoriteBooks: number
  }
  achievements: string[] // achievement IDs that are unlocked
}

const DEFAULT_PROFILE: UserProfile = {
  username: '',
  avatar: '🦊',
  createdAt: new Date().toISOString(),
  lastVisit: new Date().toISOString(),
  visitStreak: 1,
  theme: 'system',
  language: 'en',
  stats: {
    booksStarted: 0,
    booksCompleted: 0,
    gamesPlayed: [],
    totalReadingTime: 0,
    favoriteBooks: 0,
  },
  achievements: [],
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [mounted, setMounted] = useState(false)

  // Load profile from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile
        
        // Check visit streak
        const lastVisit = new Date(parsed.lastVisit)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
        
        let newStreak = parsed.visitStreak
        if (daysDiff === 1) {
          // Consecutive day - increment streak
          newStreak = parsed.visitStreak + 1
        } else if (daysDiff > 1) {
          // Missed days - reset streak
          newStreak = 1
        }
        // If same day, keep streak the same
        
        setProfile({
          ...parsed,
          lastVisit: now.toISOString(),
          visitStreak: newStreak,
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
    setMounted(true)
  }, [])

  // Save to localStorage whenever profile changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
      } catch (error) {
        console.error('Error saving profile:', error)
      }
    }
  }, [profile, mounted])

  // Update username
  const setUsername = useCallback((username: string) => {
    setProfile(prev => ({ ...prev, username }))
  }, [])

  // Update avatar
  const setAvatar = useCallback((avatar: string) => {
    setProfile(prev => ({ ...prev, avatar }))
  }, [])

  // Update theme
  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    setProfile(prev => ({ ...prev, theme }))
  }, [])

  // Update language
  const setLanguage = useCallback((language: 'en' | 'it') => {
    setProfile(prev => ({ ...prev, language }))
  }, [])

  // Increment books started
  const incrementBooksStarted = useCallback(() => {
    setProfile(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        booksStarted: prev.stats.booksStarted + 1,
      },
    }))
  }, [])

  // Increment books completed
  const incrementBooksCompleted = useCallback(() => {
    setProfile(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        booksCompleted: prev.stats.booksCompleted + 1,
      },
    }))
  }, [])

  // Record game played
  const recordGamePlayed = useCallback((gameId: string) => {
    setProfile(prev => {
      if (prev.stats.gamesPlayed.includes(gameId)) {
        return prev // Already played this game
      }
      return {
        ...prev,
        stats: {
          ...prev.stats,
          gamesPlayed: [...prev.stats.gamesPlayed, gameId],
        },
      }
    })
  }, [])

  // Add reading time
  const addReadingTime = useCallback((minutes: number) => {
    setProfile(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        totalReadingTime: prev.stats.totalReadingTime + minutes,
      },
    }))
  }, [])

  // Update favorites count
  const updateFavoritesCount = useCallback((count: number) => {
    setProfile(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        favoriteBooks: count,
      },
    }))
  }, [])

  // Unlock an achievement
  const unlockAchievement = useCallback((achievementId: string) => {
    setProfile(prev => {
      if (prev.achievements.includes(achievementId)) {
        return prev // Already unlocked
      }
      return {
        ...prev,
        achievements: [...prev.achievements, achievementId],
      }
    })
  }, [])

  // Check if achievement is unlocked
  const isAchievementUnlocked = useCallback((achievementId: string) => {
    return profile.achievements.includes(achievementId)
  }, [profile.achievements])

  // Get all unlocked achievements with details
  const getUnlockedAchievements = useCallback(() => {
    return ACHIEVEMENTS.filter(a => profile.achievements.includes(a.id))
  }, [profile.achievements])

  // Get locked achievements
  const getLockedAchievements = useCallback(() => {
    return ACHIEVEMENTS.filter(a => !profile.achievements.includes(a.id))
  }, [profile.achievements])

  // Check if profile is set up (has username)
  const isProfileSetup = useCallback(() => {
    return profile.username.trim().length > 0
  }, [profile.username])

  // Export all user data
  const exportData = useCallback(() => {
    // Gather all localStorage data related to Onde
    const allData: Record<string, unknown> = {
      profile,
      exportedAt: new Date().toISOString(),
    }
    
    // Try to get other Onde-related localStorage items
    const ondeKeys = [
      'onde-book-favorites',
      'onde-reading-progress',
      'onde-recently-viewed',
      'onde-download-tracker',
    ]
    
    ondeKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key)
        if (value) {
          allData[key] = JSON.parse(value)
        }
      } catch (e) {
        // Skip if can't parse
      }
    })
    
    return allData
  }, [profile])

  // Reset profile
  const resetProfile = useCallback(() => {
    setProfile({
      ...DEFAULT_PROFILE,
      createdAt: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
    })
  }, [])

  // Sync stats from other hooks (call this from the profile page)
  const syncStats = useCallback((stats: {
    booksStarted?: number
    booksCompleted?: number
    favoriteBooks?: number
  }) => {
    setProfile(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        ...stats,
      },
    }))
  }, [])

  return {
    profile,
    mounted,
    setUsername,
    setAvatar,
    setTheme,
    setLanguage,
    incrementBooksStarted,
    incrementBooksCompleted,
    recordGamePlayed,
    addReadingTime,
    updateFavoritesCount,
    unlockAchievement,
    isAchievementUnlocked,
    getUnlockedAchievements,
    getLockedAchievements,
    isProfileSetup,
    exportData,
    resetProfile,
    syncStats,
  }
}

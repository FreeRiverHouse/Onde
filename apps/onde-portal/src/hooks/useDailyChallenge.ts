'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

const STORAGE_KEY = 'onde-daily-challenges'
const LEADERBOARD_KEY = 'onde-daily-leaderboard'

// Challenge types
export type ChallengeType = 'reading' | 'games' | 'explore' | 'social' | 'creative'

export interface Challenge {
  id: string
  date: string // YYYY-MM-DD
  type: ChallengeType
  title: string
  description: string
  icon: string
  target: number
  unit: string
  xpReward: number
  badgeReward?: string
}

export interface ChallengeProgress {
  challengeId: string
  date: string
  progress: number
  completed: boolean
  completedAt?: string
  claimed: boolean
}

export interface DailyChallengeState {
  currentStreak: number
  longestStreak: number
  totalXP: number
  totalCompleted: number
  badges: string[]
  history: ChallengeProgress[]
  lastCompletedDate?: string
}

export interface LeaderboardEntry {
  username: string
  avatar: string
  streak: number
  totalXP: number
  rank: number
}

// Challenge templates pool
const CHALLENGE_TEMPLATES: Omit<Challenge, 'id' | 'date'>[] = [
  // Reading challenges
  { type: 'reading', title: 'Bookworm Sprint', description: 'Read 10 pages of any book', icon: '📖', target: 10, unit: 'pages', xpReward: 50 },
  { type: 'reading', title: 'Deep Reader', description: 'Read for 15 minutes', icon: '📚', target: 15, unit: 'minutes', xpReward: 60 },
  { type: 'reading', title: 'Library Explorer', description: 'Browse 5 different books', icon: '🔍', target: 5, unit: 'books', xpReward: 40 },
  { type: 'reading', title: 'Story Time', description: 'Start a new book', icon: '✨', target: 1, unit: 'book', xpReward: 75, badgeReward: '📘' },
  { type: 'reading', title: 'Page Turner', description: 'Read 20 pages', icon: '📄', target: 20, unit: 'pages', xpReward: 80 },
  
  // Game challenges
  { type: 'games', title: 'Game On!', description: 'Play 2 different games', icon: '🎮', target: 2, unit: 'games', xpReward: 50 },
  { type: 'games', title: 'Arcade Master', description: 'Play 3 games', icon: '👾', target: 3, unit: 'games', xpReward: 70 },
  { type: 'games', title: 'Pet Caretaker', description: 'Visit Moonlight House', icon: '🐱', target: 1, unit: 'visit', xpReward: 40 },
  { type: 'games', title: 'Creative Chef', description: 'Play Kids Chef Studio', icon: '👨‍🍳', target: 1, unit: 'session', xpReward: 45 },
  { type: 'games', title: 'Fortune Seeker', description: 'Open 3 fortune cookies', icon: '🥠', target: 3, unit: 'cookies', xpReward: 35 },
  
  // Exploration challenges
  { type: 'explore', title: 'Curious Explorer', description: 'Visit 3 different sections', icon: '🗺️', target: 3, unit: 'sections', xpReward: 45 },
  { type: 'explore', title: 'Island Hopper', description: 'Visit Gaming Island', icon: '🏝️', target: 1, unit: 'visit', xpReward: 30 },
  { type: 'explore', title: 'VR Pioneer', description: 'Try a VR experience', icon: '🥽', target: 1, unit: 'experience', xpReward: 60, badgeReward: '🌟' },
  { type: 'explore', title: 'Library Card', description: 'Browse the book catalog', icon: '📋', target: 1, unit: 'visit', xpReward: 25 },
  
  // Social challenges
  { type: 'social', title: 'Sharing is Caring', description: 'Share a book with someone', icon: '💝', target: 1, unit: 'share', xpReward: 55, badgeReward: '🤝' },
  { type: 'social', title: 'Favorite Finder', description: 'Add 2 books to favorites', icon: '❤️', target: 2, unit: 'favorites', xpReward: 40 },
  
  // Creative challenges
  { type: 'creative', title: 'Skin Designer', description: 'Create a Minecraft skin', icon: '🎨', target: 1, unit: 'skin', xpReward: 65, badgeReward: '🖌️' },
  { type: 'creative', title: 'Profile Perfectionist', description: 'Customize your profile', icon: '🎭', target: 1, unit: 'update', xpReward: 35 },
]

// Streak badges
export const STREAK_BADGES: Record<number, { emoji: string; name: string }> = {
  3: { emoji: '🔥', name: '3-Day Streak' },
  7: { emoji: '⚡', name: 'Week Warrior' },
  14: { emoji: '💫', name: 'Two Week Champion' },
  30: { emoji: '🏆', name: 'Monthly Master' },
  50: { emoji: '👑', name: 'Streak Royalty' },
  100: { emoji: '🌟', name: 'Century Legend' },
}

// XP level thresholds
export const XP_LEVELS: { level: number; xp: number; title: string }[] = [
  { level: 1, xp: 0, title: 'Newcomer' },
  { level: 2, xp: 100, title: 'Apprentice' },
  { level: 3, xp: 300, title: 'Explorer' },
  { level: 4, xp: 600, title: 'Adventurer' },
  { level: 5, xp: 1000, title: 'Champion' },
  { level: 6, xp: 1500, title: 'Hero' },
  { level: 7, xp: 2500, title: 'Legend' },
  { level: 8, xp: 4000, title: 'Master' },
  { level: 9, xp: 6000, title: 'Grand Master' },
  { level: 10, xp: 10000, title: 'Ultimate Reader' },
]

const DEFAULT_STATE: DailyChallengeState = {
  currentStreak: 0,
  longestStreak: 0,
  totalXP: 0,
  totalCompleted: 0,
  badges: [],
  history: [],
}

// Generate deterministic challenge based on date
function generateDailyChallenge(dateStr: string): Challenge {
  // Use date string to generate a consistent seed
  const seed = dateStr.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0) * 
    parseInt(dateStr.replace(/-/g, ''), 10)
  
  // Seeded random function
  const seededRandom = (max: number) => {
    const x = Math.sin(seed) * 10000
    return Math.floor((x - Math.floor(x)) * max)
  }
  
  const templateIndex = seededRandom(CHALLENGE_TEMPLATES.length)
  const template = CHALLENGE_TEMPLATES[templateIndex]
  
  return {
    ...template,
    id: `challenge-${dateStr}`,
    date: dateStr,
  }
}

// Get today's date string
function getTodayString(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

// Check if date is yesterday
function isYesterday(dateStr: string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0] === dateStr
}

export function useDailyChallenge() {
  const [state, setState] = useState<DailyChallengeState>(DEFAULT_STATE)
  const [mounted, setMounted] = useState(false)

  // Today's challenge
  const today = getTodayString()
  const todayChallenge = useMemo(() => generateDailyChallenge(today), [today])

  // Get today's progress
  const todayProgress = useMemo(() => {
    return state.history.find(h => h.date === today) || {
      challengeId: todayChallenge.id,
      date: today,
      progress: 0,
      completed: false,
      claimed: false,
    }
  }, [state.history, today, todayChallenge.id])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as DailyChallengeState
        
        // Check streak continuity
        let newStreak = parsed.currentStreak
        if (parsed.lastCompletedDate) {
          if (!isYesterday(parsed.lastCompletedDate) && parsed.lastCompletedDate !== today) {
            // Streak broken - not yesterday and not today
            newStreak = 0
          }
        }
        
        setState({
          ...parsed,
          currentStreak: newStreak,
        })
      }
    } catch (error) {
      console.error('Error loading daily challenge state:', error)
    }
    setMounted(true)
  }, [today])

  // Save to localStorage when state changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (error) {
        console.error('Error saving daily challenge state:', error)
      }
    }
  }, [state, mounted])

  // Update progress
  const updateProgress = useCallback((amount: number) => {
    setState(prev => {
      const existingIndex = prev.history.findIndex(h => h.date === today)
      const existing = existingIndex >= 0 ? prev.history[existingIndex] : null
      
      const newProgress = Math.min(
        (existing?.progress || 0) + amount,
        todayChallenge.target
      )
      const isCompleted = newProgress >= todayChallenge.target
      
      const updatedProgress: ChallengeProgress = {
        challengeId: todayChallenge.id,
        date: today,
        progress: newProgress,
        completed: isCompleted,
        completedAt: isCompleted && !existing?.completed ? new Date().toISOString() : existing?.completedAt,
        claimed: existing?.claimed || false,
      }
      
      const newHistory = existing
        ? prev.history.map((h, i) => i === existingIndex ? updatedProgress : h)
        : [...prev.history, updatedProgress]
      
      return {
        ...prev,
        history: newHistory,
      }
    })
  }, [today, todayChallenge.id, todayChallenge.target])

  // Set progress directly (for manual tracking)
  const setProgress = useCallback((amount: number) => {
    setState(prev => {
      const existingIndex = prev.history.findIndex(h => h.date === today)
      const existing = existingIndex >= 0 ? prev.history[existingIndex] : null
      
      const newProgress = Math.min(amount, todayChallenge.target)
      const isCompleted = newProgress >= todayChallenge.target
      
      const updatedProgress: ChallengeProgress = {
        challengeId: todayChallenge.id,
        date: today,
        progress: newProgress,
        completed: isCompleted,
        completedAt: isCompleted && !existing?.completed ? new Date().toISOString() : existing?.completedAt,
        claimed: existing?.claimed || false,
      }
      
      const newHistory = existing
        ? prev.history.map((h, i) => i === existingIndex ? updatedProgress : h)
        : [...prev.history, updatedProgress]
      
      return {
        ...prev,
        history: newHistory,
      }
    })
  }, [today, todayChallenge.id, todayChallenge.target])

  // Claim reward
  const claimReward = useCallback(() => {
    if (!todayProgress.completed || todayProgress.claimed) return null
    
    let reward = {
      xp: todayChallenge.xpReward,
      badge: todayChallenge.badgeReward,
      streakBadge: null as string | null,
    }
    
    setState(prev => {
      const existingIndex = prev.history.findIndex(h => h.date === today)
      if (existingIndex < 0) return prev
      
      // Update history to mark as claimed
      const newHistory = prev.history.map((h, i) => 
        i === existingIndex ? { ...h, claimed: true } : h
      )
      
      // Calculate new streak
      const wasStreakActive = prev.lastCompletedDate && (
        isYesterday(prev.lastCompletedDate) || prev.lastCompletedDate === today
      )
      const newStreak = wasStreakActive ? prev.currentStreak + 1 : 1
      const newLongestStreak = Math.max(newStreak, prev.longestStreak)
      
      // Check for streak badge
      const streakBadge = STREAK_BADGES[newStreak]
      if (streakBadge && !prev.badges.includes(streakBadge.emoji)) {
        reward.streakBadge = streakBadge.emoji
      }
      
      // Collect new badges
      const newBadges = [...prev.badges]
      if (todayChallenge.badgeReward && !newBadges.includes(todayChallenge.badgeReward)) {
        newBadges.push(todayChallenge.badgeReward)
      }
      if (reward.streakBadge && !newBadges.includes(reward.streakBadge)) {
        newBadges.push(reward.streakBadge)
      }
      
      return {
        ...prev,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        totalXP: prev.totalXP + todayChallenge.xpReward,
        totalCompleted: prev.totalCompleted + 1,
        badges: newBadges,
        history: newHistory,
        lastCompletedDate: today,
      }
    })
    
    return reward
  }, [today, todayProgress, todayChallenge])

  // Get user level based on XP
  const getLevel = useCallback(() => {
    const level = XP_LEVELS.slice().reverse().find(l => state.totalXP >= l.xp) || XP_LEVELS[0]
    const nextLevel = XP_LEVELS.find(l => l.xp > state.totalXP)
    const xpToNext = nextLevel ? nextLevel.xp - state.totalXP : 0
    const xpInLevel = nextLevel ? state.totalXP - level.xp : state.totalXP
    const xpForLevel = nextLevel ? nextLevel.xp - level.xp : 1
    
    return {
      ...level,
      nextLevel,
      xpToNext,
      xpInLevel,
      xpForLevel,
      progress: Math.min((xpInLevel / xpForLevel) * 100, 100),
    }
  }, [state.totalXP])

  // Get challenge history (last N days)
  const getHistory = useCallback((days: number = 7) => {
    const result: { date: string; challenge: Challenge; progress: ChallengeProgress | null }[] = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const challenge = generateDailyChallenge(dateStr)
      const progress = state.history.find(h => h.date === dateStr) || null
      
      result.push({ date: dateStr, challenge, progress })
    }
    
    return result
  }, [state.history])

  // Get mock leaderboard (in production, this would be from a server)
  const getLeaderboard = useCallback((): LeaderboardEntry[] => {
    // Generate mock leaderboard with user included
    const mockUsers = [
      { username: 'StarReader', avatar: '⭐', streak: 15, totalXP: 2500 },
      { username: 'BookDragon', avatar: '🐉', streak: 12, totalXP: 1800 },
      { username: 'PageTurner', avatar: '📖', streak: 10, totalXP: 1500 },
      { username: 'StorySeeker', avatar: '🔮', streak: 8, totalXP: 1200 },
      { username: 'AdventureKid', avatar: '🚀', streak: 7, totalXP: 1000 },
    ]
    
    // Add current user if they have progress
    if (state.totalCompleted > 0) {
      const userProfile = localStorage.getItem('onde-user-profile')
      const profile = userProfile ? JSON.parse(userProfile) : { username: 'You', avatar: '🦊' }
      
      mockUsers.push({
        username: profile.username || 'You',
        avatar: profile.avatar || '🦊',
        streak: state.currentStreak,
        totalXP: state.totalXP,
      })
    }
    
    // Sort by XP and add ranks
    return mockUsers
      .sort((a, b) => b.totalXP - a.totalXP)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }))
  }, [state.currentStreak, state.totalXP, state.totalCompleted])

  // Generate share text
  const generateShareText = useCallback(() => {
    if (!todayProgress.completed) return null
    
    const streakText = state.currentStreak > 1 
      ? `🔥 ${state.currentStreak} day streak!` 
      : ''
    
    return `I completed today's Onde challenge: ${todayChallenge.title} ${todayChallenge.icon}\n${streakText}\nEarned ${todayChallenge.xpReward} XP! ✨\n\n#OndeChallenge #DailyReading`
  }, [todayProgress.completed, todayChallenge, state.currentStreak])

  // Share completion
  const shareCompletion = useCallback(async () => {
    const text = generateShareText()
    if (!text) return false
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Onde Daily Challenge',
          text,
          url: window.location.origin + '/daily',
        })
        return true
      } catch {
        // Fall back to clipboard
      }
    }
    
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }, [generateShareText])

  // Reset state (for testing)
  const resetState = useCallback(() => {
    setState(DEFAULT_STATE)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    // State
    state,
    mounted,
    
    // Today's challenge
    todayChallenge,
    todayProgress,
    
    // Actions
    updateProgress,
    setProgress,
    claimReward,
    
    // Computed
    getLevel,
    getHistory,
    getLeaderboard,
    
    // Sharing
    generateShareText,
    shareCompletion,
    
    // Debug
    resetState,
  }
}

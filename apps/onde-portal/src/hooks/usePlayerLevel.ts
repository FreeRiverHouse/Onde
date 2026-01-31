'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================
// XP System Constants
// ============================================

// XP earned from different activities
export const XP_REWARDS = {
  // Reading activities
  book_started: 25,
  book_completed: 100,
  reading_session: 15, // per session
  reading_streak_bonus: 50, // bonus for daily streak
  
  // Gaming activities
  game_played: 20,
  game_won: 40,
  perfect_game: 75, // flawless victory
  
  // Achievements
  achievement_common: 30,
  achievement_rare: 60,
  achievement_epic: 120,
  achievement_legendary: 250,
  
  // Exploration & Social
  page_visited: 5,
  favorite_added: 10,
  recipe_viewed: 10,
  playlist_listened: 15,
  vr_experience: 30,
  daily_login: 20,
  
  // Special bonuses
  first_of_day: 25, // bonus for first activity of the day
  streak_multiplier: 0.1, // 10% bonus per streak day (max 7)
} as const

// Level titles that evolve as players progress
export const LEVEL_TITLES: { maxLevel: number; title: string; emoji: string }[] = [
  { maxLevel: 5, title: 'Newcomer', emoji: '🌱' },
  { maxLevel: 10, title: 'Explorer', emoji: '🧭' },
  { maxLevel: 15, title: 'Adventurer', emoji: '🎒' },
  { maxLevel: 20, title: 'Apprentice', emoji: '📚' },
  { maxLevel: 25, title: 'Scholar', emoji: '🎓' },
  { maxLevel: 30, title: 'Pathfinder', emoji: '🗺️' },
  { maxLevel: 35, title: 'Trailblazer', emoji: '⚡' },
  { maxLevel: 40, title: 'Voyager', emoji: '🚀' },
  { maxLevel: 45, title: 'Pioneer', emoji: '🌟' },
  { maxLevel: 50, title: 'Champion', emoji: '🏆' },
  { maxLevel: 55, title: 'Hero', emoji: '🦸' },
  { maxLevel: 60, title: 'Master', emoji: '👑' },
  { maxLevel: 65, title: 'Grandmaster', emoji: '💎' },
  { maxLevel: 70, title: 'Elite', emoji: '🔥' },
  { maxLevel: 75, title: 'Virtuoso', emoji: '✨' },
  { maxLevel: 80, title: 'Sage', emoji: '🧙' },
  { maxLevel: 85, title: 'Guardian', emoji: '🛡️' },
  { maxLevel: 90, title: 'Titan', emoji: '⚔️' },
  { maxLevel: 95, title: 'Mythic', emoji: '🐉' },
  { maxLevel: 100, title: 'Legend', emoji: '🌈' },
]

// Milestone rewards at specific levels
export interface MilestoneReward {
  level: number
  title: string
  description: string
  icon: string
  type: 'badge' | 'title' | 'feature' | 'cosmetic'
  unlockId: string
}

export const MILESTONE_REWARDS: MilestoneReward[] = [
  { level: 5, title: 'First Steps', description: 'You\'ve begun your journey!', icon: '🎉', type: 'badge', unlockId: 'badge_first_steps' },
  { level: 10, title: 'Explorer Badge', description: 'Unlocked the Explorer title', icon: '🧭', type: 'title', unlockId: 'title_explorer' },
  { level: 15, title: 'Adventure Pack', description: 'Access to bonus game modes', icon: '🎮', type: 'feature', unlockId: 'feature_bonus_games' },
  { level: 20, title: 'Scholar\'s Seal', description: 'Special reading badge', icon: '📜', type: 'badge', unlockId: 'badge_scholar' },
  { level: 25, title: 'Golden Frame', description: 'Fancy profile frame', icon: '🖼️', type: 'cosmetic', unlockId: 'frame_gold' },
  { level: 30, title: 'Trailblazer Trail', description: 'Special particle effects', icon: '✨', type: 'cosmetic', unlockId: 'effect_trail' },
  { level: 40, title: 'Voyager\'s Compass', description: 'Exclusive navigation badge', icon: '🧭', type: 'badge', unlockId: 'badge_voyager' },
  { level: 50, title: 'Champion\'s Crown', description: 'The prestigious halfway mark!', icon: '👑', type: 'badge', unlockId: 'badge_champion' },
  { level: 60, title: 'Master\'s Library', description: 'Access to special content', icon: '📚', type: 'feature', unlockId: 'feature_master_content' },
  { level: 75, title: 'Virtuoso Aura', description: 'Glowing profile aura', icon: '💫', type: 'cosmetic', unlockId: 'aura_virtuoso' },
  { level: 90, title: 'Titan\'s Might', description: 'Ultimate achievement badge', icon: '⚔️', type: 'badge', unlockId: 'badge_titan' },
  { level: 100, title: 'Legendary Status', description: 'You\'ve reached the pinnacle!', icon: '🌈', type: 'title', unlockId: 'title_legend' },
]

// Badge styles for different level ranges
export const LEVEL_BADGE_STYLES: { maxLevel: number; colors: string; gradient: string; glow: string }[] = [
  { maxLevel: 10, colors: 'text-gray-700 bg-gray-100', gradient: 'from-gray-200 to-gray-300', glow: '' },
  { maxLevel: 20, colors: 'text-green-700 bg-green-100', gradient: 'from-green-300 to-emerald-400', glow: 'shadow-green-500/20' },
  { maxLevel: 30, colors: 'text-blue-700 bg-blue-100', gradient: 'from-blue-400 to-cyan-400', glow: 'shadow-blue-500/30' },
  { maxLevel: 40, colors: 'text-purple-700 bg-purple-100', gradient: 'from-purple-400 to-violet-500', glow: 'shadow-purple-500/40' },
  { maxLevel: 50, colors: 'text-orange-700 bg-orange-100', gradient: 'from-orange-400 to-amber-500', glow: 'shadow-orange-500/40' },
  { maxLevel: 60, colors: 'text-pink-700 bg-pink-100', gradient: 'from-pink-400 to-rose-500', glow: 'shadow-pink-500/50' },
  { maxLevel: 70, colors: 'text-red-700 bg-red-100', gradient: 'from-red-500 to-orange-500', glow: 'shadow-red-500/50 animate-pulse' },
  { maxLevel: 80, colors: 'text-indigo-700 bg-indigo-100', gradient: 'from-indigo-500 to-purple-600', glow: 'shadow-indigo-500/60' },
  { maxLevel: 90, colors: 'text-amber-700 bg-amber-100', gradient: 'from-amber-400 to-yellow-500', glow: 'shadow-amber-500/70 animate-pulse' },
  { maxLevel: 100, colors: 'text-onde-gold bg-gradient-to-r from-amber-200 to-yellow-300', gradient: 'from-onde-gold via-amber-400 to-yellow-500', glow: 'shadow-2xl shadow-onde-gold/80 animate-pulse' },
]

// ============================================
// XP Calculation Functions
// ============================================

/**
 * Calculate XP required for a given level using exponential curve
 * XP = base * (level ^ exponent)
 * This creates a gentle exponential curve where early levels are fast
 */
const BASE_XP = 100
const XP_EXPONENT = 1.5

export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(BASE_XP * Math.pow(level - 1, XP_EXPONENT))
}

/**
 * Calculate total XP needed from level 1 to reach a specific level
 */
export function totalXpForLevel(level: number): number {
  let total = 0
  for (let l = 2; l <= level; l++) {
    total += xpForLevel(l)
  }
  return total
}

/**
 * Calculate level from total XP
 */
export function levelFromXp(totalXp: number): number {
  let level = 1
  let xpAccum = 0
  
  while (level < 100) {
    const xpNeeded = xpForLevel(level + 1)
    if (xpAccum + xpNeeded > totalXp) break
    xpAccum += xpNeeded
    level++
  }
  
  return level
}

/**
 * Get XP progress within current level
 */
export function xpProgress(totalXp: number): { current: number; required: number; percentage: number } {
  const level = levelFromXp(totalXp)
  if (level >= 100) {
    return { current: 0, required: 0, percentage: 100 }
  }
  
  const xpAtCurrentLevel = totalXpForLevel(level)
  const xpForNextLevel = xpForLevel(level + 1)
  const currentProgress = totalXp - xpAtCurrentLevel
  const percentage = Math.min(100, Math.floor((currentProgress / xpForNextLevel) * 100))
  
  return {
    current: currentProgress,
    required: xpForNextLevel,
    percentage
  }
}

// ============================================
// Types
// ============================================

export interface XPEvent {
  id: string
  type: keyof typeof XP_REWARDS
  xp: number
  timestamp: string
  description?: string
  metadata?: Record<string, unknown>
}

export interface LevelUpEvent {
  fromLevel: number
  toLevel: number
  timestamp: string
  rewards: MilestoneReward[]
}

export interface PlayerLevelState {
  totalXp: number
  level: number
  xpEvents: XPEvent[]
  levelUpHistory: LevelUpEvent[]
  unlockedRewards: string[] // unlockIds
  lastActivityDate: string
  streakDays: number
}

// ============================================
// Storage
// ============================================

const STORAGE_KEY = 'onde-player-level'

const DEFAULT_STATE: PlayerLevelState = {
  totalXp: 0,
  level: 1,
  xpEvents: [],
  levelUpHistory: [],
  unlockedRewards: [],
  lastActivityDate: '',
  streakDays: 0
}

// ============================================
// Hook
// ============================================

export function usePlayerLevel() {
  const [state, setState] = useState<PlayerLevelState>(DEFAULT_STATE)
  const [mounted, setMounted] = useState(false)
  const [pendingLevelUp, setPendingLevelUp] = useState<LevelUpEvent | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as PlayerLevelState
        setState(parsed)
      }
    } catch (e) {
      console.error('Failed to load player level:', e)
    }
    setMounted(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (e) {
        console.error('Failed to save player level:', e)
      }
    }
  }, [state, mounted])

  // Check and update streak on mount
  useEffect(() => {
    if (!mounted) return
    
    const today = new Date().toDateString()
    if (state.lastActivityDate === today) return

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (state.lastActivityDate === yesterday.toDateString()) {
      // Continue streak
      setState(prev => ({
        ...prev,
        streakDays: Math.min(prev.streakDays + 1, 7), // Max 7 for bonus
        lastActivityDate: today
      }))
    } else if (state.lastActivityDate !== today) {
      // Streak broken or first visit
      setState(prev => ({
        ...prev,
        streakDays: 1,
        lastActivityDate: today
      }))
    }
  }, [mounted, state.lastActivityDate])

  /**
   * Award XP for an activity
   */
  const awardXP = useCallback((
    type: keyof typeof XP_REWARDS,
    options?: {
      description?: string
      metadata?: Record<string, unknown>
      multiplier?: number
    }
  ): number => {
    const baseXP = XP_REWARDS[type]
    let finalXP: number = baseXP
    
    // Apply streak bonus (up to 70% at 7 days)
    const streakBonus = Math.min(state.streakDays, 7) * XP_REWARDS.streak_multiplier
    finalXP = Math.floor(finalXP * (1 + streakBonus))
    
    // Apply custom multiplier
    if (options?.multiplier) {
      finalXP = Math.floor(finalXP * options.multiplier)
    }
    
    const xpEvent: XPEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      xp: finalXP,
      timestamp: new Date().toISOString(),
      description: options?.description,
      metadata: options?.metadata
    }

    setState(prev => {
      const newTotalXp = prev.totalXp + finalXP
      const oldLevel = prev.level
      const newLevel = levelFromXp(newTotalXp)
      
      // Check for level up
      if (newLevel > oldLevel) {
        // Collect milestone rewards for all levels passed
        const newRewards: MilestoneReward[] = []
        for (let l = oldLevel + 1; l <= newLevel; l++) {
          const reward = MILESTONE_REWARDS.find(r => r.level === l)
          if (reward && !prev.unlockedRewards.includes(reward.unlockId)) {
            newRewards.push(reward)
          }
        }
        
        const levelUpEvent: LevelUpEvent = {
          fromLevel: oldLevel,
          toLevel: newLevel,
          timestamp: new Date().toISOString(),
          rewards: newRewards
        }
        
        // Trigger level up celebration
        setTimeout(() => {
          setPendingLevelUp(levelUpEvent)
          setShowConfetti(true)
        }, 100)
        
        return {
          ...prev,
          totalXp: newTotalXp,
          level: newLevel,
          xpEvents: [xpEvent, ...prev.xpEvents.slice(0, 99)], // Keep last 100 events
          levelUpHistory: [levelUpEvent, ...prev.levelUpHistory],
          unlockedRewards: [...prev.unlockedRewards, ...newRewards.map(r => r.unlockId)]
        }
      }
      
      return {
        ...prev,
        totalXp: newTotalXp,
        xpEvents: [xpEvent, ...prev.xpEvents.slice(0, 99)]
      }
    })

    return finalXP
  }, [state.streakDays])

  /**
   * Clear level up notification
   */
  const clearLevelUp = useCallback(() => {
    setPendingLevelUp(null)
    setShowConfetti(false)
  }, [])

  /**
   * Get current level info
   */
  const levelInfo = useMemo(() => {
    const progress = xpProgress(state.totalXp)
    const titleInfo = LEVEL_TITLES.find(t => state.level <= t.maxLevel) || LEVEL_TITLES[LEVEL_TITLES.length - 1]
    const badgeStyle = LEVEL_BADGE_STYLES.find(b => state.level <= b.maxLevel) || LEVEL_BADGE_STYLES[LEVEL_BADGE_STYLES.length - 1]
    
    return {
      level: state.level,
      title: titleInfo.title,
      emoji: titleInfo.emoji,
      xpCurrent: progress.current,
      xpRequired: progress.required,
      xpPercentage: progress.percentage,
      totalXp: state.totalXp,
      badgeColors: badgeStyle.colors,
      badgeGradient: badgeStyle.gradient,
      badgeGlow: badgeStyle.glow
    }
  }, [state.level, state.totalXp])

  /**
   * Get next milestone reward
   */
  const nextMilestone = useMemo(() => {
    return MILESTONE_REWARDS.find(r => r.level > state.level)
  }, [state.level])

  /**
   * Get unlocked milestone rewards
   */
  const unlockedMilestones = useMemo(() => {
    return MILESTONE_REWARDS.filter(r => state.unlockedRewards.includes(r.unlockId))
  }, [state.unlockedRewards])

  /**
   * Check if a reward is unlocked
   */
  const hasReward = useCallback((unlockId: string) => {
    return state.unlockedRewards.includes(unlockId)
  }, [state.unlockedRewards])

  /**
   * Get recent XP events
   */
  const recentXPEvents = useMemo(() => {
    return state.xpEvents.slice(0, 10)
  }, [state.xpEvents])

  /**
   * Get XP earned today
   */
  const xpToday = useMemo(() => {
    const today = new Date().toDateString()
    return state.xpEvents
      .filter(e => new Date(e.timestamp).toDateString() === today)
      .reduce((sum, e) => sum + e.xp, 0)
  }, [state.xpEvents])

  /**
   * Get XP earned this week
   */
  const xpThisWeek = useMemo(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    return state.xpEvents
      .filter(e => new Date(e.timestamp) >= startOfWeek)
      .reduce((sum, e) => sum + e.xp, 0)
  }, [state.xpEvents])

  /**
   * Reset player level (for testing)
   */
  const resetLevel = useCallback(() => {
    setState(DEFAULT_STATE)
    setPendingLevelUp(null)
    setShowConfetti(false)
  }, [])

  /**
   * Manually set level (for testing/admin)
   */
  const setLevel = useCallback((level: number) => {
    const targetLevel = Math.max(1, Math.min(100, level))
    const targetXp = totalXpForLevel(targetLevel)
    
    // Collect all milestone rewards up to this level
    const rewards = MILESTONE_REWARDS
      .filter(r => r.level <= targetLevel)
      .map(r => r.unlockId)
    
    setState(prev => ({
      ...prev,
      level: targetLevel,
      totalXp: targetXp,
      unlockedRewards: rewards
    }))
  }, [])

  return {
    // State
    mounted,
    level: state.level,
    totalXp: state.totalXp,
    streakDays: state.streakDays,
    
    // Level info
    levelInfo,
    nextMilestone,
    unlockedMilestones,
    
    // XP tracking
    recentXPEvents,
    xpToday,
    xpThisWeek,
    
    // Actions
    awardXP,
    hasReward,
    
    // Level up celebration
    pendingLevelUp,
    showConfetti,
    clearLevelUp,
    
    // Utilities
    xpForLevel,
    totalXpForLevel,
    levelFromXp,
    xpProgress,
    
    // Testing
    resetLevel,
    setLevel,
    
    // Constants
    XP_REWARDS,
    LEVEL_TITLES,
    MILESTONE_REWARDS,
    LEVEL_BADGE_STYLES
  }
}

// Export types
export type UsePlayerLevelReturn = ReturnType<typeof usePlayerLevel>

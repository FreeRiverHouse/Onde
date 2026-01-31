'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================
// Badge Rarity System
// ============================================

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'

export type BadgeCategory = 'games' | 'reading' | 'social' | 'explorer' | 'collector' | 'special'

// Rarity configuration with colors, animations, and points
export const BADGE_RARITY_CONFIG: Record<BadgeRarity, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  glowColor: string
  shadowClass: string
  animation: string
  points: number
  dropRate: number // Percentage for random badge drops
}> = {
  common: {
    label: 'Common',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    glowColor: 'rgba(100, 116, 139, 0.3)',
    shadowClass: '',
    animation: '',
    points: 10,
    dropRate: 50
  },
  rare: {
    label: 'Rare',
    color: 'text-onde-ocean',
    bgColor: 'bg-onde-ocean/10',
    borderColor: 'border-onde-ocean/40',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    shadowClass: 'shadow-md shadow-onde-ocean/20',
    animation: 'animate-pulse-slow',
    points: 25,
    dropRate: 30
  },
  epic: {
    label: 'Epic',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-400',
    glowColor: 'rgba(147, 51, 234, 0.5)',
    shadowClass: 'shadow-lg shadow-purple-500/30',
    animation: 'animate-shimmer',
    points: 50,
    dropRate: 15
  },
  legendary: {
    label: 'Legendary',
    color: 'text-onde-gold',
    bgColor: 'bg-gradient-to-br from-onde-gold/20 to-amber-200/30',
    borderColor: 'border-onde-gold',
    glowColor: 'rgba(255, 193, 7, 0.6)',
    shadowClass: 'shadow-xl shadow-onde-gold/40',
    animation: 'animate-legendary-glow',
    points: 100,
    dropRate: 4
  },
  mythic: {
    label: 'Mythic',
    color: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-pink-100 via-purple-100 to-cyan-100',
    borderColor: 'border-transparent',
    glowColor: 'rgba(168, 85, 247, 0.7)',
    shadowClass: 'shadow-2xl shadow-purple-500/50 ring-2 ring-purple-400/50',
    animation: 'animate-mythic-rainbow',
    points: 250,
    dropRate: 1
  }
}

// Category configuration
export const BADGE_CATEGORY_CONFIG: Record<BadgeCategory, {
  label: string
  icon: string
  color: string
  bgColor: string
}> = {
  games: {
    label: 'Games',
    icon: '🎮',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100'
  },
  reading: {
    label: 'Reading',
    icon: '📚',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  social: {
    label: 'Social',
    icon: '👥',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  explorer: {
    label: 'Explorer',
    icon: '🧭',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  collector: {
    label: 'Collector',
    icon: '💎',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  special: {
    label: 'Special',
    icon: '⭐',
    color: 'text-onde-gold',
    bgColor: 'bg-amber-100'
  }
}

// ============================================
// Badge Definition
// ============================================

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: BadgeRarity
  category: BadgeCategory
  requirement?: string // How to unlock (for display)
  secret?: boolean // Hidden until unlocked
  seasonal?: string // e.g., 'winter', 'summer', 'halloween'
  limited?: boolean // One-time event badge
  series?: string // Badge series/collection
  tier?: number // For tiered badges (1, 2, 3...)
}

export interface UnlockedBadge {
  badgeId: string
  unlockedAt: string
  showcased: boolean // Displayed on profile
  seen: boolean // User has viewed the unlock
  animationPlayed: boolean
}

export interface BadgeProgress {
  badgeId: string
  current: number
  required: number
  lastUpdated: string
}

export interface BadgeState {
  unlocked: Record<string, UnlockedBadge>
  progress: Record<string, BadgeProgress>
  showcased: string[] // Badge IDs to display on profile (max 5)
  favorites: string[] // Favorited badges
  stats: {
    totalBadges: number
    byRarity: Record<BadgeRarity, number>
    byCategory: Record<BadgeCategory, number>
    totalPoints: number
    lastUnlock: string | null
    longestStreak: number
    currentStreak: number
  }
}

// ============================================
// All 35+ Badges Defined
// ============================================

export const ALL_BADGES: Badge[] = [
  // ============================================
  // GAMES CATEGORY (8 badges)
  // ============================================
  {
    id: 'game_rookie',
    name: 'Game Rookie',
    description: 'Play your very first game',
    icon: '🎮',
    rarity: 'common',
    category: 'games',
    requirement: 'Play 1 game'
  },
  {
    id: 'game_enthusiast',
    name: 'Game Enthusiast',
    description: 'Play 10 different games',
    icon: '🕹️',
    rarity: 'rare',
    category: 'games',
    requirement: 'Play 10 games',
    tier: 1
  },
  {
    id: 'game_champion',
    name: 'Game Champion',
    description: 'Win 25 games across all game types',
    icon: '🏆',
    rarity: 'epic',
    category: 'games',
    requirement: 'Win 25 games',
    tier: 2
  },
  {
    id: 'arcade_master',
    name: 'Arcade Master',
    description: 'Play 100 games total - true dedication!',
    icon: '👾',
    rarity: 'legendary',
    category: 'games',
    requirement: 'Play 100 games',
    tier: 3
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Achieve a perfect game with no mistakes',
    icon: '💯',
    rarity: 'epic',
    category: 'games',
    requirement: 'Complete a game perfectly'
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a game in record time',
    icon: '⚡',
    rarity: 'rare',
    category: 'games',
    requirement: 'Beat a game under the time limit'
  },
  {
    id: 'puzzle_solver',
    name: 'Puzzle Solver',
    description: 'Complete 20 puzzle games',
    icon: '🧩',
    rarity: 'rare',
    category: 'games',
    requirement: 'Solve 20 puzzles'
  },
  {
    id: 'unbeatable',
    name: 'Unbeatable',
    description: 'Win 10 games in a row without losing',
    icon: '🔥',
    rarity: 'legendary',
    category: 'games',
    requirement: '10 consecutive wins',
    secret: true
  },

  // ============================================
  // READING CATEGORY (8 badges)
  // ============================================
  {
    id: 'first_page',
    name: 'First Page',
    description: 'Start your reading journey',
    icon: '📖',
    rarity: 'common',
    category: 'reading',
    requirement: 'Open your first book'
  },
  {
    id: 'bookworm',
    name: 'Bookworm',
    description: 'Read 5 different books',
    icon: '🐛',
    rarity: 'rare',
    category: 'reading',
    requirement: 'Read 5 books',
    tier: 1
  },
  {
    id: 'library_legend',
    name: 'Library Legend',
    description: 'Complete 15 books from start to finish',
    icon: '📚',
    rarity: 'epic',
    category: 'reading',
    requirement: 'Complete 15 books',
    tier: 2
  },
  {
    id: 'book_dragon',
    name: 'Book Dragon',
    description: 'Hoard 50 books in your reading list',
    icon: '🐉',
    rarity: 'legendary',
    category: 'reading',
    requirement: 'Collect 50 books',
    tier: 3
  },
  {
    id: 'marathon_reader',
    name: 'Marathon Reader',
    description: 'Read for 10 hours total',
    icon: '🏃',
    rarity: 'epic',
    category: 'reading',
    requirement: '10 hours of reading'
  },
  {
    id: 'night_reader',
    name: 'Night Reader',
    description: 'Read a book after midnight',
    icon: '🌙',
    rarity: 'rare',
    category: 'reading',
    requirement: 'Read after midnight'
  },
  {
    id: 'speed_reader',
    name: 'Speed Reader',
    description: 'Finish a book in one sitting',
    icon: '💨',
    rarity: 'rare',
    category: 'reading',
    requirement: 'Complete a book in under 1 hour'
  },
  {
    id: 'genre_explorer',
    name: 'Genre Explorer',
    description: 'Read books from 5 different genres',
    icon: '🌍',
    rarity: 'epic',
    category: 'reading',
    requirement: 'Explore 5 genres'
  },

  // ============================================
  // SOCIAL CATEGORY (7 badges)
  // ============================================
  {
    id: 'friendly_wave',
    name: 'Friendly Wave',
    description: 'Visit the family section',
    icon: '👋',
    rarity: 'common',
    category: 'social',
    requirement: 'Visit family page'
  },
  {
    id: 'helper',
    name: 'Helper',
    description: 'Complete a collaborative activity',
    icon: '🤝',
    rarity: 'rare',
    category: 'social',
    requirement: 'Help with an activity'
  },
  {
    id: 'storyteller',
    name: 'Storyteller',
    description: 'Share your reading progress 5 times',
    icon: '📢',
    rarity: 'rare',
    category: 'social',
    requirement: 'Share progress 5 times'
  },
  {
    id: 'team_player',
    name: 'Team Player',
    description: 'Participate in 10 group activities',
    icon: '⚽',
    rarity: 'epic',
    category: 'social',
    requirement: 'Join 10 group activities'
  },
  {
    id: 'community_star',
    name: 'Community Star',
    description: 'Be an active member for 30 days',
    icon: '⭐',
    rarity: 'legendary',
    category: 'social',
    requirement: 'Active for 30 days'
  },
  {
    id: 'cheerleader',
    name: 'Cheerleader',
    description: 'Celebrate 20 achievements by others',
    icon: '📣',
    rarity: 'rare',
    category: 'social',
    requirement: 'Celebrate 20 achievements'
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Help someone complete their first book',
    icon: '🎓',
    rarity: 'epic',
    category: 'social',
    requirement: 'Mentor a new reader',
    secret: true
  },

  // ============================================
  // EXPLORER CATEGORY (7 badges)
  // ============================================
  {
    id: 'curious_cat',
    name: 'Curious Cat',
    description: 'Visit 10 different pages',
    icon: '🐱',
    rarity: 'common',
    category: 'explorer',
    requirement: 'Visit 10 pages'
  },
  {
    id: 'globe_trotter',
    name: 'Globe Trotter',
    description: 'Explore all main sections of the portal',
    icon: '🌍',
    rarity: 'rare',
    category: 'explorer',
    requirement: 'Visit all sections'
  },
  {
    id: 'treasure_hunter',
    name: 'Treasure Hunter',
    description: 'Find 5 hidden Easter eggs',
    icon: '🗺️',
    rarity: 'epic',
    category: 'explorer',
    requirement: 'Discover 5 secrets'
  },
  {
    id: 'wave_rider',
    name: 'Wave Rider',
    description: 'Check out all surf spots',
    icon: '🏄',
    rarity: 'rare',
    category: 'explorer',
    requirement: 'Visit all surf pages'
  },
  {
    id: 'vr_pioneer',
    name: 'VR Pioneer',
    description: 'Experience virtual reality content',
    icon: '🥽',
    rarity: 'epic',
    category: 'explorer',
    requirement: 'Try VR experiences'
  },
  {
    id: 'recipe_master',
    name: 'Recipe Master',
    description: 'View 30 different recipes',
    icon: '👨‍🍳',
    rarity: 'rare',
    category: 'explorer',
    requirement: 'Browse 30 recipes'
  },
  {
    id: 'world_wanderer',
    name: 'World Wanderer',
    description: 'Explore content in multiple languages',
    icon: '🌐',
    rarity: 'epic',
    category: 'explorer',
    requirement: 'Use 2+ languages'
  },

  // ============================================
  // COLLECTOR CATEGORY (6 badges)
  // ============================================
  {
    id: 'first_favorite',
    name: 'First Favorite',
    description: 'Add your first favorite',
    icon: '❤️',
    rarity: 'common',
    category: 'collector',
    requirement: 'Favorite 1 item'
  },
  {
    id: 'avid_collector',
    name: 'Avid Collector',
    description: 'Collect 25 favorites',
    icon: '💝',
    rarity: 'rare',
    category: 'collector',
    requirement: 'Favorite 25 items',
    tier: 1
  },
  {
    id: 'treasure_keeper',
    name: 'Treasure Keeper',
    description: 'Maintain 50 favorites',
    icon: '💎',
    rarity: 'epic',
    category: 'collector',
    requirement: 'Favorite 50 items',
    tier: 2
  },
  {
    id: 'music_maven',
    name: 'Music Maven',
    description: 'Listen to 20 different playlists',
    icon: '🎵',
    rarity: 'rare',
    category: 'collector',
    requirement: 'Listen to 20 playlists'
  },
  {
    id: 'pet_parent',
    name: 'Pet Parent',
    description: 'Adopt your first virtual pet',
    icon: '🐾',
    rarity: 'rare',
    category: 'collector',
    requirement: 'Adopt a pet'
  },
  {
    id: 'achievement_hunter',
    name: 'Achievement Hunter',
    description: 'Unlock 20 achievements',
    icon: '🎯',
    rarity: 'legendary',
    category: 'collector',
    requirement: 'Unlock 20 achievements'
  },

  // ============================================
  // SPECIAL CATEGORY (7 badges)
  // ============================================
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Active between 5 AM and 7 AM',
    icon: '🐦',
    rarity: 'rare',
    category: 'special',
    requirement: 'Login before 7 AM'
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Active between midnight and 4 AM',
    icon: '🦉',
    rarity: 'rare',
    category: 'special',
    requirement: 'Active after midnight'
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 7-day activity streak',
    icon: '🔥',
    rarity: 'epic',
    category: 'special',
    requirement: '7-day streak'
  },
  {
    id: 'dedication',
    name: 'Dedication',
    description: '30 consecutive days of activity',
    icon: '💪',
    rarity: 'legendary',
    category: 'special',
    requirement: '30-day streak'
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Unlock every single badge',
    icon: '✨',
    rarity: 'mythic',
    category: 'special',
    requirement: 'Collect all badges',
    secret: true
  },
  {
    id: 'birthday_star',
    name: 'Birthday Star',
    description: 'Visit on your birthday',
    icon: '🎂',
    rarity: 'legendary',
    category: 'special',
    requirement: 'Login on your birthday',
    limited: true
  },
  {
    id: 'founding_member',
    name: 'Founding Member',
    description: 'One of the first to join Onde',
    icon: '🏅',
    rarity: 'mythic',
    category: 'special',
    requirement: 'Early adopter',
    limited: true
  }
]

// ============================================
// Badge Storage & State Management
// ============================================

const STORAGE_KEY = 'onde-badges'

const DEFAULT_STATE: BadgeState = {
  unlocked: {},
  progress: {},
  showcased: [],
  favorites: [],
  stats: {
    totalBadges: 0,
    byRarity: { common: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 },
    byCategory: { games: 0, reading: 0, social: 0, explorer: 0, collector: 0, special: 0 },
    totalPoints: 0,
    lastUnlock: null,
    longestStreak: 0,
    currentStreak: 0
  }
}

// ============================================
// Unlock Animation Types
// ============================================

export type BadgeUnlockAnimation = 
  | 'fade-in'
  | 'scale-bounce'
  | 'spin-reveal'
  | 'shimmer-burst'
  | 'rainbow-explosion'
  | 'legendary-fanfare'
  | 'mythic-ascension'

export const RARITY_ANIMATIONS: Record<BadgeRarity, BadgeUnlockAnimation> = {
  common: 'fade-in',
  rare: 'scale-bounce',
  epic: 'shimmer-burst',
  legendary: 'legendary-fanfare',
  mythic: 'mythic-ascension'
}

// CSS Keyframes for animations (to be added to global styles)
export const BADGE_ANIMATION_KEYFRAMES = `
  @keyframes badge-fade-in {
    0% { opacity: 0; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  @keyframes badge-scale-bounce {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    75% { transform: scale(0.9); }
    100% { transform: scale(1); }
  }
  
  @keyframes badge-spin-reveal {
    0% { transform: rotate(-180deg) scale(0); opacity: 0; }
    100% { transform: rotate(0deg) scale(1); opacity: 1; }
  }
  
  @keyframes badge-shimmer-burst {
    0% { transform: scale(0); filter: brightness(2); }
    50% { transform: scale(1.3); filter: brightness(1.5); }
    100% { transform: scale(1); filter: brightness(1); }
  }
  
  @keyframes badge-rainbow-explosion {
    0% { transform: scale(0) rotate(-180deg); filter: hue-rotate(0deg) brightness(2); }
    50% { transform: scale(1.5) rotate(0deg); filter: hue-rotate(180deg) brightness(1.5); }
    100% { transform: scale(1) rotate(0deg); filter: hue-rotate(360deg) brightness(1); }
  }
  
  @keyframes badge-legendary-fanfare {
    0% { transform: scale(0) translateY(50px); opacity: 0; filter: brightness(3); }
    30% { transform: scale(1.4) translateY(-20px); opacity: 1; }
    60% { transform: scale(0.9) translateY(10px); }
    100% { transform: scale(1) translateY(0); filter: brightness(1); }
  }
  
  @keyframes badge-mythic-ascension {
    0% { 
      transform: scale(0) rotate(-360deg); 
      opacity: 0; 
      filter: brightness(3) saturate(2);
      box-shadow: 0 0 0 0 rgba(168, 85, 247, 0);
    }
    25% { transform: scale(1.8) rotate(-90deg); opacity: 1; }
    50% { 
      transform: scale(0.8) rotate(90deg); 
      box-shadow: 0 0 60px 30px rgba(168, 85, 247, 0.6);
    }
    75% { transform: scale(1.2) rotate(360deg); }
    100% { 
      transform: scale(1) rotate(360deg); 
      filter: brightness(1) saturate(1);
      box-shadow: 0 0 20px 10px rgba(168, 85, 247, 0.3);
    }
  }
  
  @keyframes legendary-glow {
    0%, 100% { box-shadow: 0 0 20px 5px rgba(255, 193, 7, 0.4); }
    50% { box-shadow: 0 0 40px 15px rgba(255, 193, 7, 0.6); }
  }
  
  @keyframes mythic-rainbow {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }
  
  @keyframes pulse-slow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
`

// ============================================
// Main Hook
// ============================================

export function useBadges() {
  const [state, setState] = useState<BadgeState>(DEFAULT_STATE)
  const [mounted, setMounted] = useState(false)
  const [newlyUnlocked, setNewlyUnlocked] = useState<Badge[]>([])
  const [toastQueue, setToastQueue] = useState<Badge[]>([])
  const [activeAnimation, setActiveAnimation] = useState<{
    badge: Badge
    animation: BadgeUnlockAnimation
  } | null>(null)

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as BadgeState
        setState(parsed)
      }
    } catch (e) {
      console.error('Failed to load badges:', e)
    }
    setMounted(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (e) {
        console.error('Failed to save badges:', e)
      }
    }
  }, [state, mounted])

  // ============================================
  // Badge Unlock Functions
  // ============================================

  // Unlock a badge by ID
  const unlockBadge = useCallback((badgeId: string, skipAnimation = false): boolean => {
    const badge = ALL_BADGES.find(b => b.id === badgeId)
    if (!badge) {
      console.warn(`Badge not found: ${badgeId}`)
      return false
    }

    // Check if already unlocked
    if (state.unlocked[badgeId]) {
      return false
    }

    const now = new Date().toISOString()
    const rarityConfig = BADGE_RARITY_CONFIG[badge.rarity]

    setState(prev => {
      const newUnlocked = {
        ...prev.unlocked,
        [badgeId]: {
          badgeId,
          unlockedAt: now,
          showcased: false,
          seen: false,
          animationPlayed: skipAnimation
        }
      }

      // Update stats
      const newStats = {
        ...prev.stats,
        totalBadges: prev.stats.totalBadges + 1,
        byRarity: {
          ...prev.stats.byRarity,
          [badge.rarity]: prev.stats.byRarity[badge.rarity] + 1
        },
        byCategory: {
          ...prev.stats.byCategory,
          [badge.category]: prev.stats.byCategory[badge.category] + 1
        },
        totalPoints: prev.stats.totalPoints + rarityConfig.points,
        lastUnlock: now
      }

      return {
        ...prev,
        unlocked: newUnlocked,
        stats: newStats
      }
    })

    // Add to queues
    setNewlyUnlocked(prev => [...prev, badge])
    setToastQueue(prev => [...prev, badge])

    // Trigger animation
    if (!skipAnimation) {
      setActiveAnimation({
        badge,
        animation: RARITY_ANIMATIONS[badge.rarity]
      })
    }

    // Check for completionist badge
    const currentUnlockedCount = Object.keys(state.unlocked).length + 1
    const totalBadges = ALL_BADGES.filter(b => !b.secret && b.id !== 'completionist').length
    if (currentUnlockedCount >= totalBadges && badgeId !== 'completionist') {
      // Unlock completionist!
      setTimeout(() => unlockBadge('completionist'), 2000)
    }

    return true
  }, [state.unlocked])

  // Update progress toward a badge
  const updateProgress = useCallback((badgeId: string, current: number, required: number) => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        [badgeId]: {
          badgeId,
          current: Math.min(current, required),
          required,
          lastUpdated: new Date().toISOString()
        }
      }
    }))

    // Check if badge should be unlocked
    if (current >= required && !state.unlocked[badgeId]) {
      unlockBadge(badgeId)
    }
  }, [state.unlocked, unlockBadge])

  // ============================================
  // Showcase Functions
  // ============================================

  // Toggle badge in showcase (max 5)
  const toggleShowcase = useCallback((badgeId: string): boolean => {
    if (!state.unlocked[badgeId]) return false

    setState(prev => {
      const isShowcased = prev.showcased.includes(badgeId)
      
      if (isShowcased) {
        // Remove from showcase
        return {
          ...prev,
          showcased: prev.showcased.filter(id => id !== badgeId),
          unlocked: {
            ...prev.unlocked,
            [badgeId]: { ...prev.unlocked[badgeId], showcased: false }
          }
        }
      } else if (prev.showcased.length < 5) {
        // Add to showcase (max 5)
        return {
          ...prev,
          showcased: [...prev.showcased, badgeId],
          unlocked: {
            ...prev.unlocked,
            [badgeId]: { ...prev.unlocked[badgeId], showcased: true }
          }
        }
      }
      
      return prev
    })

    return true
  }, [state.unlocked])

  // Set showcased badges (replaces all)
  const setShowcased = useCallback((badgeIds: string[]) => {
    const validIds = badgeIds.filter(id => state.unlocked[id]).slice(0, 5)
    
    setState(prev => {
      const newUnlocked = { ...prev.unlocked }
      
      // Reset all showcased flags
      Object.keys(newUnlocked).forEach(id => {
        newUnlocked[id] = { ...newUnlocked[id], showcased: validIds.includes(id) }
      })

      return {
        ...prev,
        showcased: validIds,
        unlocked: newUnlocked
      }
    })
  }, [state.unlocked])

  // ============================================
  // Favorite Functions
  // ============================================

  const toggleFavorite = useCallback((badgeId: string) => {
    setState(prev => {
      const isFavorite = prev.favorites.includes(badgeId)
      return {
        ...prev,
        favorites: isFavorite
          ? prev.favorites.filter(id => id !== badgeId)
          : [...prev.favorites, badgeId]
      }
    })
  }, [])

  // ============================================
  // Query Functions
  // ============================================

  // Get a single badge by ID
  const getBadge = useCallback((badgeId: string): Badge | undefined => {
    return ALL_BADGES.find(b => b.id === badgeId)
  }, [])

  // Check if badge is unlocked
  const isUnlocked = useCallback((badgeId: string): boolean => {
    return !!state.unlocked[badgeId]
  }, [state.unlocked])

  // Get unlock info
  const getUnlockInfo = useCallback((badgeId: string): UnlockedBadge | undefined => {
    return state.unlocked[badgeId]
  }, [state.unlocked])

  // Get progress for a badge
  const getProgress = useCallback((badgeId: string): BadgeProgress | undefined => {
    return state.progress[badgeId]
  }, [state.progress])

  // Get badges by category
  const getByCategory = useCallback((category: BadgeCategory) => {
    return ALL_BADGES.filter(b => b.category === category).map(badge => ({
      ...badge,
      unlocked: !!state.unlocked[badge.id],
      unlockedAt: state.unlocked[badge.id]?.unlockedAt,
      progress: state.progress[badge.id]
    }))
  }, [state.unlocked, state.progress])

  // Get badges by rarity
  const getByRarity = useCallback((rarity: BadgeRarity) => {
    return ALL_BADGES.filter(b => b.rarity === rarity).map(badge => ({
      ...badge,
      unlocked: !!state.unlocked[badge.id],
      unlockedAt: state.unlocked[badge.id]?.unlockedAt,
      progress: state.progress[badge.id]
    }))
  }, [state.unlocked, state.progress])

  // Get all badges with status
  const allBadgesWithStatus = useMemo(() => {
    return ALL_BADGES.map(badge => ({
      ...badge,
      unlocked: !!state.unlocked[badge.id],
      unlockedAt: state.unlocked[badge.id]?.unlockedAt,
      showcased: state.unlocked[badge.id]?.showcased || false,
      favorite: state.favorites.includes(badge.id),
      progress: state.progress[badge.id]
    }))
  }, [state.unlocked, state.progress, state.favorites])

  // Get showcased badges for profile display
  const showcasedBadges = useMemo(() => {
    return state.showcased
      .map(id => ALL_BADGES.find(b => b.id === id))
      .filter((b): b is Badge => !!b)
  }, [state.showcased])

  // Get recent unlocks
  const recentUnlocks = useMemo(() => {
    return Object.entries(state.unlocked)
      .sort(([, a], [, b]) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
      .slice(0, 10)
      .map(([id]) => ALL_BADGES.find(b => b.id === id))
      .filter((b): b is Badge => !!b)
  }, [state.unlocked])

  // ============================================
  // Toast & Animation Management
  // ============================================

  // Pop next badge from toast queue
  const popToastQueue = useCallback(() => {
    const next = toastQueue[0]
    if (next) {
      setToastQueue(prev => prev.slice(1))
      // Mark as seen
      setState(prev => ({
        ...prev,
        unlocked: {
          ...prev.unlocked,
          [next.id]: { ...prev.unlocked[next.id], seen: true }
        }
      }))
    }
    return next
  }, [toastQueue])

  // Clear animation
  const clearAnimation = useCallback(() => {
    if (activeAnimation) {
      setState(prev => ({
        ...prev,
        unlocked: {
          ...prev.unlocked,
          [activeAnimation.badge.id]: {
            ...prev.unlocked[activeAnimation.badge.id],
            animationPlayed: true
          }
        }
      }))
    }
    setActiveAnimation(null)
  }, [activeAnimation])

  // Clear newly unlocked
  const clearNewlyUnlocked = useCallback((badgeId?: string) => {
    if (badgeId) {
      setNewlyUnlocked(prev => prev.filter(b => b.id !== badgeId))
    } else {
      setNewlyUnlocked([])
    }
  }, [])

  // ============================================
  // Statistics
  // ============================================

  const statistics = useMemo(() => {
    const unlockedCount = Object.keys(state.unlocked).length
    const visibleTotal = ALL_BADGES.filter(b => !b.secret).length
    
    return {
      ...state.stats,
      unlockedCount,
      totalAvailable: visibleTotal,
      percentage: Math.round((unlockedCount / visibleTotal) * 100),
      secretsFound: ALL_BADGES.filter(b => b.secret && state.unlocked[b.id]).length,
      totalSecrets: ALL_BADGES.filter(b => b.secret).length,
      nextRarityMilestone: getNextRarityMilestone()
    }
    
    function getNextRarityMilestone() {
      const { byRarity } = state.stats
      if (byRarity.mythic === 0) return { rarity: 'mythic' as BadgeRarity, have: 0, need: 1 }
      if (byRarity.legendary < 3) return { rarity: 'legendary' as BadgeRarity, have: byRarity.legendary, need: 3 }
      if (byRarity.epic < 5) return { rarity: 'epic' as BadgeRarity, have: byRarity.epic, need: 5 }
      if (byRarity.rare < 10) return { rarity: 'rare' as BadgeRarity, have: byRarity.rare, need: 10 }
      return { rarity: 'common' as BadgeRarity, have: byRarity.common, need: 15 }
    }
  }, [state.stats, state.unlocked])

  // ============================================
  // Testing & Reset
  // ============================================

  const resetBadges = useCallback(() => {
    setState(DEFAULT_STATE)
    setNewlyUnlocked([])
    setToastQueue([])
    setActiveAnimation(null)
  }, [])

  // Unlock random badge (for testing/rewards)
  const unlockRandomBadge = useCallback((rarity?: BadgeRarity): Badge | null => {
    const candidates = ALL_BADGES.filter(b => 
      !state.unlocked[b.id] && 
      !b.limited &&
      (rarity ? b.rarity === rarity : true)
    )
    
    if (candidates.length === 0) return null
    
    const badge = candidates[Math.floor(Math.random() * candidates.length)]
    unlockBadge(badge.id)
    return badge
  }, [state.unlocked, unlockBadge])

  // ============================================
  // Return
  // ============================================

  return {
    // State
    mounted,
    statistics,
    newlyUnlocked,
    toastQueue,
    activeAnimation,
    showcasedBadges,
    recentUnlocks,

    // All badges data
    allBadges: ALL_BADGES,
    allBadgesWithStatus,

    // Badge operations
    unlockBadge,
    updateProgress,
    getBadge,
    isUnlocked,
    getUnlockInfo,
    getProgress,
    getByCategory,
    getByRarity,

    // Showcase
    toggleShowcase,
    setShowcased,
    canAddToShowcase: state.showcased.length < 5,

    // Favorites
    toggleFavorite,
    isFavorite: (id: string) => state.favorites.includes(id),

    // Toast/Animation
    popToastQueue,
    clearAnimation,
    clearNewlyUnlocked,

    // Config
    rarityConfig: BADGE_RARITY_CONFIG,
    categoryConfig: BADGE_CATEGORY_CONFIG,
    animationKeyframes: BADGE_ANIMATION_KEYFRAMES,

    // Testing
    resetBadges,
    unlockRandomBadge
  }
}

// ============================================
// Export Types
// ============================================

export type UseBadgesReturn = ReturnType<typeof useBadges>

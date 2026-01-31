'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

const STORAGE_KEY = 'onde-treasure-hunt'

// Reward types
export type RewardType = 'coins' | 'badge' | 'pet' | 'avatar' | 'theme' | 'powerup'

export interface TreasureReward {
  type: RewardType
  id: string
  name: string
  description: string
  icon: string
  value?: number // For coins
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface TreasureChest {
  id: string
  name: string
  description: string
  location: string // Page/route where chest is hidden
  hint: string
  reward: TreasureReward
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme'
  isSecret?: boolean // Hidden from map until found nearby
  coordinates?: { x: number; y: number } // For visual map
  triggerType: 'click' | 'scroll' | 'time' | 'hover' | 'sequence'
  triggerData?: {
    scrollPercentage?: number
    timeSeconds?: number
    hoverCount?: number
    sequence?: string[]
  }
}

export interface FoundChest {
  chestId: string
  foundAt: string
  rewardClaimed: boolean
}

export interface TreasureHuntState {
  foundChests: FoundChest[]
  totalCoins: number
  unlockedPets: string[]
  unlockedBadges: string[]
  unlockedAvatars: string[]
  unlockedThemes: string[]
  powerups: { [id: string]: number }
  lastHintUsed?: string
  hintsUsed: number
}

// All treasure chests in the game
export const TREASURE_CHESTS: TreasureChest[] = [
  // === EASY CHESTS (5) ===
  {
    id: 'home_welcome',
    name: 'Welcome Chest',
    description: 'A glowing chest welcomes new explorers',
    location: '/',
    hint: 'Right where your journey begins...',
    difficulty: 'easy',
    triggerType: 'scroll',
    triggerData: { scrollPercentage: 80 },
    coordinates: { x: 50, y: 20 },
    reward: {
      type: 'coins',
      id: 'coins_50',
      name: '50 Gold Coins',
      description: 'A pouch of shiny gold coins',
      icon: '💰',
      value: 50,
      rarity: 'common'
    }
  },
  {
    id: 'library_scroll',
    name: 'Scholar\'s Cache',
    description: 'Hidden among ancient scrolls',
    location: '/library',
    hint: 'Scroll deep into the library of knowledge',
    difficulty: 'easy',
    triggerType: 'scroll',
    triggerData: { scrollPercentage: 60 },
    coordinates: { x: 30, y: 40 },
    reward: {
      type: 'badge',
      id: 'badge_scholar',
      name: 'Scholar Badge',
      description: 'Awarded to dedicated readers',
      icon: '📜',
      rarity: 'common'
    }
  },
  {
    id: 'games_click',
    name: 'Gamer\'s Surprise',
    description: 'Click the hidden button',
    location: '/games',
    hint: 'Every game has a secret button...',
    difficulty: 'easy',
    triggerType: 'click',
    coordinates: { x: 70, y: 35 },
    reward: {
      type: 'coins',
      id: 'coins_75',
      name: '75 Gold Coins',
      description: 'A treasure from the arcade',
      icon: '🎮',
      value: 75,
      rarity: 'common'
    }
  },
  {
    id: 'catalog_browse',
    name: 'Collector\'s Find',
    description: 'Browse the collection carefully',
    location: '/catalogo',
    hint: 'Some treasures hide in plain sight',
    difficulty: 'easy',
    triggerType: 'hover',
    triggerData: { hoverCount: 5 },
    coordinates: { x: 45, y: 55 },
    reward: {
      type: 'pet',
      id: 'pet_bunny',
      name: 'Cotton the Bunny',
      description: 'A fluffy companion who loves books',
      icon: '🐰',
      rarity: 'rare'
    }
  },
  {
    id: 'profile_visit',
    name: 'Self Discovery',
    description: 'Know thyself, find treasure',
    location: '/profile',
    hint: 'Your profile holds more than you think',
    difficulty: 'easy',
    triggerType: 'time',
    triggerData: { timeSeconds: 10 },
    coordinates: { x: 85, y: 25 },
    reward: {
      type: 'avatar',
      id: 'avatar_crown',
      name: 'Royal Crown',
      description: 'A majestic crown avatar',
      icon: '👑',
      rarity: 'rare'
    }
  },

  // === MEDIUM CHESTS (4) ===
  {
    id: 'vr_explorer',
    name: 'Virtual Vault',
    description: 'Hidden in virtual reality',
    location: '/vr',
    hint: 'Explore the virtual worlds to find real treasure',
    difficulty: 'medium',
    triggerType: 'scroll',
    triggerData: { scrollPercentage: 70 },
    coordinates: { x: 15, y: 70 },
    reward: {
      type: 'pet',
      id: 'pet_robot',
      name: 'Pixel the Robot',
      description: 'A digital companion from the VR realm',
      icon: '🤖',
      rarity: 'epic'
    }
  },
  {
    id: 'surf_wave',
    name: 'Wave Rider\'s Bounty',
    description: 'Catch the perfect wave',
    location: '/surf-selector',
    hint: 'Only the best surfers find this one',
    difficulty: 'medium',
    triggerType: 'hover',
    triggerData: { hoverCount: 3 },
    coordinates: { x: 60, y: 80 },
    reward: {
      type: 'badge',
      id: 'badge_surfer',
      name: 'Wave Master',
      description: 'Rode the legendary wave',
      icon: '🏄',
      rarity: 'rare'
    }
  },
  {
    id: 'playlist_melody',
    name: 'Musical Mystery',
    description: 'Hidden in the harmony',
    location: '/playlist',
    hint: 'Listen closely to the music',
    difficulty: 'medium',
    triggerType: 'time',
    triggerData: { timeSeconds: 30 },
    coordinates: { x: 25, y: 50 },
    reward: {
      type: 'theme',
      id: 'theme_neon',
      name: 'Neon Dreams',
      description: 'A vibrant neon color theme',
      icon: '🌈',
      rarity: 'epic'
    }
  },
  {
    id: 'explore_adventure',
    name: 'Explorer\'s Cache',
    description: 'For those who venture far',
    location: '/explore',
    hint: 'True explorers scroll beyond the horizon',
    difficulty: 'medium',
    triggerType: 'scroll',
    triggerData: { scrollPercentage: 90 },
    coordinates: { x: 75, y: 60 },
    reward: {
      type: 'coins',
      id: 'coins_150',
      name: '150 Gold Coins',
      description: 'A heavy treasure chest',
      icon: '💎',
      value: 150,
      rarity: 'rare'
    }
  },

  // === HARD CHESTS (3) ===
  {
    id: 'settings_secret',
    name: 'Configuration Cryptex',
    description: 'Hidden in the gears of settings',
    location: '/settings',
    hint: 'Not everything in settings is what it seems',
    difficulty: 'hard',
    isSecret: true,
    triggerType: 'sequence',
    triggerData: { sequence: ['up', 'up', 'down', 'down'] },
    coordinates: { x: 90, y: 15 },
    reward: {
      type: 'pet',
      id: 'pet_dragon',
      name: 'Sparky the Dragon',
      description: 'A tiny dragon with a big heart',
      icon: '🐉',
      rarity: 'epic'
    }
  },
  {
    id: 'about_founder',
    name: 'Founder\'s Chest',
    description: 'Left by the creators themselves',
    location: '/about',
    hint: 'The story of creation holds secrets',
    difficulty: 'hard',
    isSecret: true,
    triggerType: 'click',
    coordinates: { x: 40, y: 85 },
    reward: {
      type: 'badge',
      id: 'badge_founder',
      name: 'Founder\'s Mark',
      description: 'Discovered the origin story',
      icon: '⚡',
      rarity: 'epic'
    }
  },
  {
    id: 'health_wellness',
    name: 'Wellness Treasure',
    description: 'A healthy mind finds treasure',
    location: '/health',
    hint: 'Take care of yourself to unlock rewards',
    difficulty: 'hard',
    triggerType: 'time',
    triggerData: { timeSeconds: 60 },
    coordinates: { x: 55, y: 45 },
    reward: {
      type: 'powerup',
      id: 'powerup_xp_boost',
      name: 'XP Boost',
      description: 'Double XP for your next 5 books!',
      icon: '⚡',
      rarity: 'epic'
    }
  },

  // === EXTREME/LEGENDARY CHESTS (2) ===
  {
    id: 'konami_master',
    name: 'Konami\'s Legacy',
    description: 'The legendary code unlocks this',
    location: '/',
    hint: '↑↑↓↓←→←→BA - The code lives on',
    difficulty: 'extreme',
    isSecret: true,
    triggerType: 'sequence',
    triggerData: { sequence: ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'] },
    coordinates: { x: 50, y: 50 },
    reward: {
      type: 'pet',
      id: 'pet_phoenix',
      name: 'Aurora the Phoenix',
      description: 'A legendary phoenix companion that rises from the ashes',
      icon: '🦅',
      rarity: 'legendary'
    }
  },
  {
    id: 'daily_dedication',
    name: 'Dedication Vault',
    description: 'Only the most dedicated find this',
    location: '/daily',
    hint: 'Visit daily for a whole week...',
    difficulty: 'extreme',
    isSecret: true,
    triggerType: 'time',
    triggerData: { timeSeconds: 120 },
    coordinates: { x: 10, y: 90 },
    reward: {
      type: 'coins',
      id: 'coins_500',
      name: '500 Gold Coins',
      description: 'The legendary golden hoard',
      icon: '👑',
      value: 500,
      rarity: 'legendary'
    }
  }
]

// Difficulty configuration
export const DIFFICULTY_CONFIG = {
  easy: {
    color: 'text-green-600',
    bg: 'bg-green-100',
    border: 'border-green-300',
    label: 'Easy',
    points: 10
  },
  medium: {
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    label: 'Medium',
    points: 25
  },
  hard: {
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    label: 'Hard',
    points: 50
  },
  extreme: {
    color: 'text-onde-gold',
    bg: 'bg-amber-100',
    border: 'border-onde-gold',
    label: 'Extreme',
    points: 100
  }
}

// Rarity configuration
export const RARITY_CONFIG = {
  common: {
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    glow: '',
    label: 'Common'
  },
  rare: {
    color: 'text-onde-ocean',
    bg: 'bg-onde-ocean/10',
    border: 'border-onde-ocean/30',
    glow: 'shadow-lg shadow-onde-ocean/20',
    label: 'Rare'
  },
  epic: {
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    glow: 'shadow-xl shadow-purple-500/30',
    label: 'Epic'
  },
  legendary: {
    color: 'text-onde-gold',
    bg: 'bg-gradient-to-br from-onde-gold/20 to-amber-200/30',
    border: 'border-onde-gold',
    glow: 'shadow-2xl shadow-onde-gold/40',
    label: 'Legendary'
  }
}

const DEFAULT_STATE: TreasureHuntState = {
  foundChests: [],
  totalCoins: 0,
  unlockedPets: [],
  unlockedBadges: [],
  unlockedAvatars: [],
  unlockedThemes: [],
  powerups: {},
  hintsUsed: 0
}

export function useTreasureHunt() {
  const [state, setState] = useState<TreasureHuntState>(DEFAULT_STATE)
  const [mounted, setMounted] = useState(false)
  const [newlyFoundChest, setNewlyFoundChest] = useState<TreasureChest | null>(null)

  // Load state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setState(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading treasure hunt state:', error)
    }
    setMounted(true)
  }, [])

  // Save state to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state, mounted])

  // Check if a chest is found
  const isChestFound = useCallback((chestId: string) => {
    return state.foundChests.some(fc => fc.chestId === chestId)
  }, [state.foundChests])

  // Get chest by ID
  const getChest = useCallback((chestId: string) => {
    return TREASURE_CHESTS.find(c => c.id === chestId)
  }, [])

  // Find a chest (claim reward)
  const findChest = useCallback((chestId: string) => {
    if (isChestFound(chestId)) return false

    const chest = getChest(chestId)
    if (!chest) return false

    // Add to found chests
    const foundChest: FoundChest = {
      chestId,
      foundAt: new Date().toISOString(),
      rewardClaimed: true
    }

    // Apply reward
    setState(prev => {
      const newState = { ...prev }
      newState.foundChests = [...prev.foundChests, foundChest]

      switch (chest.reward.type) {
        case 'coins':
          newState.totalCoins = prev.totalCoins + (chest.reward.value || 0)
          break
        case 'pet':
          if (!prev.unlockedPets.includes(chest.reward.id)) {
            newState.unlockedPets = [...prev.unlockedPets, chest.reward.id]
          }
          break
        case 'badge':
          if (!prev.unlockedBadges.includes(chest.reward.id)) {
            newState.unlockedBadges = [...prev.unlockedBadges, chest.reward.id]
          }
          break
        case 'avatar':
          if (!prev.unlockedAvatars.includes(chest.reward.id)) {
            newState.unlockedAvatars = [...prev.unlockedAvatars, chest.reward.id]
          }
          break
        case 'theme':
          if (!prev.unlockedThemes.includes(chest.reward.id)) {
            newState.unlockedThemes = [...prev.unlockedThemes, chest.reward.id]
          }
          break
        case 'powerup':
          newState.powerups = {
            ...prev.powerups,
            [chest.reward.id]: (prev.powerups[chest.reward.id] || 0) + 1
          }
          break
      }

      return newState
    })

    setNewlyFoundChest(chest)
    return true
  }, [isChestFound, getChest])

  // Clear newly found chest notification
  const clearNewlyFound = useCallback(() => {
    setNewlyFoundChest(null)
  }, [])

  // Get chests for a specific location
  const getChestsForLocation = useCallback((location: string) => {
    return TREASURE_CHESTS.filter(c => c.location === location)
  }, [])

  // Get found chests for a location
  const getFoundChestsForLocation = useCallback((location: string) => {
    const locationChests = getChestsForLocation(location)
    return locationChests.filter(c => isChestFound(c.id))
  }, [getChestsForLocation, isChestFound])

  // Get unfound chests for a location (excluding secrets)
  const getUnfoundChestsForLocation = useCallback((location: string) => {
    const locationChests = getChestsForLocation(location)
    return locationChests.filter(c => !isChestFound(c.id) && !c.isSecret)
  }, [getChestsForLocation, isChestFound])

  // Use a hint
  const useHint = useCallback((chestId: string) => {
    if (state.hintsUsed >= 5) return null // Limit hints

    const chest = getChest(chestId)
    if (!chest || isChestFound(chestId)) return null

    setState(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1,
      lastHintUsed: new Date().toISOString()
    }))

    return chest.hint
  }, [state.hintsUsed, getChest, isChestFound])

  // Statistics
  const stats = useMemo(() => {
    const totalChests = TREASURE_CHESTS.length
    const foundCount = state.foundChests.length
    const secretsFound = TREASURE_CHESTS.filter(c => c.isSecret && isChestFound(c.id)).length
    const totalSecrets = TREASURE_CHESTS.filter(c => c.isSecret).length

    // Calculate points based on difficulty
    const totalPoints = state.foundChests.reduce((sum, fc) => {
      const chest = getChest(fc.chestId)
      if (chest) {
        return sum + DIFFICULTY_CONFIG[chest.difficulty].points
      }
      return sum
    }, 0)

    // By difficulty
    const byDifficulty = {
      easy: {
        found: TREASURE_CHESTS.filter(c => c.difficulty === 'easy' && isChestFound(c.id)).length,
        total: TREASURE_CHESTS.filter(c => c.difficulty === 'easy').length
      },
      medium: {
        found: TREASURE_CHESTS.filter(c => c.difficulty === 'medium' && isChestFound(c.id)).length,
        total: TREASURE_CHESTS.filter(c => c.difficulty === 'medium').length
      },
      hard: {
        found: TREASURE_CHESTS.filter(c => c.difficulty === 'hard' && isChestFound(c.id)).length,
        total: TREASURE_CHESTS.filter(c => c.difficulty === 'hard').length
      },
      extreme: {
        found: TREASURE_CHESTS.filter(c => c.difficulty === 'extreme' && isChestFound(c.id)).length,
        total: TREASURE_CHESTS.filter(c => c.difficulty === 'extreme').length
      }
    }

    return {
      totalChests,
      foundCount,
      percentage: Math.round((foundCount / totalChests) * 100),
      secretsFound,
      totalSecrets,
      totalPoints,
      byDifficulty,
      totalCoins: state.totalCoins,
      petsCount: state.unlockedPets.length,
      badgesCount: state.unlockedBadges.length,
      hintsRemaining: 5 - state.hintsUsed
    }
  }, [state, isChestFound, getChest])

  // Get all unlocked rewards
  const rewards = useMemo(() => ({
    coins: state.totalCoins,
    pets: state.unlockedPets,
    badges: state.unlockedBadges,
    avatars: state.unlockedAvatars,
    themes: state.unlockedThemes,
    powerups: state.powerups
  }), [state])

  // Leaderboard data (simulated for demo)
  const leaderboard = useMemo(() => {
    // In a real app, this would fetch from a backend
    const mockPlayers = [
      { username: 'TreasureKing', avatar: '👑', chestsFound: 14, points: 450, rank: 1 },
      { username: 'AdventureSeeker', avatar: '🗺️', chestsFound: 12, points: 380, rank: 2 },
      { username: 'GoldHunter', avatar: '💰', chestsFound: 10, points: 320, rank: 3 },
      { username: 'SecretFinder', avatar: '🔮', chestsFound: 9, points: 290, rank: 4 },
      { username: 'ExplorerPro', avatar: '🧭', chestsFound: 8, points: 250, rank: 5 },
    ]

    // Insert current player
    const currentPlayer = {
      username: 'You',
      avatar: '⭐',
      chestsFound: stats.foundCount,
      points: stats.totalPoints,
      rank: 0, // Will be calculated
      isCurrentUser: true
    }

    // Calculate rank
    const allPlayers = [...mockPlayers, currentPlayer].sort((a, b) => b.points - a.points)
    allPlayers.forEach((p, i) => p.rank = i + 1)

    return allPlayers
  }, [stats])

  // Reset progress (for testing)
  const resetProgress = useCallback(() => {
    setState(DEFAULT_STATE)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    // State
    state,
    mounted,
    newlyFoundChest,

    // Actions
    findChest,
    clearNewlyFound,
    isChestFound,
    getChest,
    getChestsForLocation,
    getFoundChestsForLocation,
    getUnfoundChestsForLocation,
    useHint,
    resetProgress,

    // Data
    stats,
    rewards,
    leaderboard,
    allChests: TREASURE_CHESTS,

    // Config
    DIFFICULTY_CONFIG,
    RARITY_CONFIG
  }
}

// Export chest data for use in other components
export { TREASURE_CHESTS as treasureChests }

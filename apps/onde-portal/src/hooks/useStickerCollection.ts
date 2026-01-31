'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================
// TYPES
// ============================================

export type StickerRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface StickerDefinition {
  id: string
  name: string
  emoji: string
  description: string
  setId: string
  rarity: StickerRarity
  number: number // Position in set
}

export interface StickerSet {
  id: string
  name: string
  description: string
  icon: string
  gradient: string
  totalStickers: number
  reward: {
    type: 'coins' | 'pet' | 'badge' | 'sticker'
    amount?: number
    itemId?: string
    name: string
  }
}

export interface OwnedSticker {
  stickerId: string
  count: number
  obtainedAt: string
  isNew: boolean
}

export interface StickerPackDefinition {
  id: string
  name: string
  description: string
  icon: string
  gradient: string
  price: number // In coins
  stickersCount: number
  guaranteedRarity?: StickerRarity
  setIds: string[] // Which sets can come from this pack
}

export interface StickerState {
  ownedStickers: OwnedSticker[]
  completedSets: string[]
  totalStickersCollected: number
  packsOpened: number
  tradesCompleted: number
  pendingPack: StickerPackDefinition | null
  revealedStickers: StickerDefinition[]
}

// ============================================
// STICKER SETS DEFINITIONS
// ============================================

export const STICKER_SETS: StickerSet[] = [
  {
    id: 'ocean-friends',
    name: 'Ocean Friends',
    description: 'Collect all the friendly sea creatures!',
    icon: '🐠',
    gradient: 'from-cyan-400 to-blue-500',
    totalStickers: 12,
    reward: { type: 'coins', amount: 500, name: '500 Coins' }
  },
  {
    id: 'forest-animals',
    name: 'Forest Animals',
    description: 'Woodland creatures await!',
    icon: '🦊',
    gradient: 'from-green-400 to-emerald-600',
    totalStickers: 12,
    reward: { type: 'pet', itemId: 'forest-fox', name: 'Forest Fox Pet' }
  },
  {
    id: 'space-explorers',
    name: 'Space Explorers',
    description: 'Reach for the stars!',
    icon: '🚀',
    gradient: 'from-purple-500 to-indigo-600',
    totalStickers: 10,
    reward: { type: 'badge', itemId: 'astronaut', name: 'Astronaut Badge' }
  },
  {
    id: 'magical-creatures',
    name: 'Magical Creatures',
    description: 'Mythical beings from enchanted lands',
    icon: '🦄',
    gradient: 'from-pink-400 to-purple-500',
    totalStickers: 8,
    reward: { type: 'coins', amount: 1000, name: '1000 Coins' }
  },
  {
    id: 'food-fiesta',
    name: 'Food Fiesta',
    description: 'Delicious treats and snacks!',
    icon: '🍕',
    gradient: 'from-amber-400 to-orange-500',
    totalStickers: 15,
    reward: { type: 'coins', amount: 300, name: '300 Coins' }
  },
  {
    id: 'sports-stars',
    name: 'Sports Stars',
    description: 'Champions of every game!',
    icon: '⚽',
    gradient: 'from-red-400 to-rose-600',
    totalStickers: 10,
    reward: { type: 'badge', itemId: 'champion', name: 'Champion Badge' }
  }
]

// ============================================
// STICKER DEFINITIONS
// ============================================

export const ALL_STICKERS: StickerDefinition[] = [
  // Ocean Friends (12)
  { id: 'ocean-1', name: 'Happy Fish', emoji: '🐟', description: 'A cheerful little fish', setId: 'ocean-friends', rarity: 'common', number: 1 },
  { id: 'ocean-2', name: 'Tropical Fish', emoji: '🐠', description: 'Colorful and bright', setId: 'ocean-friends', rarity: 'common', number: 2 },
  { id: 'ocean-3', name: 'Blowfish', emoji: '🐡', description: 'Puffy when surprised', setId: 'ocean-friends', rarity: 'common', number: 3 },
  { id: 'ocean-4', name: 'Friendly Shark', emoji: '🦈', description: 'Not as scary as you think!', setId: 'ocean-friends', rarity: 'uncommon', number: 4 },
  { id: 'ocean-5', name: 'Octopus', emoji: '🐙', description: 'Eight arms to hug with', setId: 'ocean-friends', rarity: 'uncommon', number: 5 },
  { id: 'ocean-6', name: 'Squid', emoji: '🦑', description: 'Master of ink', setId: 'ocean-friends', rarity: 'uncommon', number: 6 },
  { id: 'ocean-7', name: 'Crab', emoji: '🦀', description: 'Pinchy friend', setId: 'ocean-friends', rarity: 'common', number: 7 },
  { id: 'ocean-8', name: 'Lobster', emoji: '🦞', description: 'Fancy sea dweller', setId: 'ocean-friends', rarity: 'rare', number: 8 },
  { id: 'ocean-9', name: 'Shrimp', emoji: '🦐', description: 'Tiny but mighty', setId: 'ocean-friends', rarity: 'common', number: 9 },
  { id: 'ocean-10', name: 'Dolphin', emoji: '🐬', description: 'Playful and smart', setId: 'ocean-friends', rarity: 'rare', number: 10 },
  { id: 'ocean-11', name: 'Whale', emoji: '🐋', description: 'Gentle giant of the sea', setId: 'ocean-friends', rarity: 'epic', number: 11 },
  { id: 'ocean-12', name: 'Mermaid', emoji: '🧜‍♀️', description: 'Legendary sea princess', setId: 'ocean-friends', rarity: 'legendary', number: 12 },

  // Forest Animals (12)
  { id: 'forest-1', name: 'Red Fox', emoji: '🦊', description: 'Clever and quick', setId: 'forest-animals', rarity: 'common', number: 1 },
  { id: 'forest-2', name: 'Brown Bear', emoji: '🐻', description: 'Loves honey', setId: 'forest-animals', rarity: 'uncommon', number: 2 },
  { id: 'forest-3', name: 'Bunny', emoji: '🐰', description: 'Fluffy and fast', setId: 'forest-animals', rarity: 'common', number: 3 },
  { id: 'forest-4', name: 'Deer', emoji: '🦌', description: 'Graceful forest spirit', setId: 'forest-animals', rarity: 'uncommon', number: 4 },
  { id: 'forest-5', name: 'Squirrel', emoji: '🐿️', description: 'Acorn collector', setId: 'forest-animals', rarity: 'common', number: 5 },
  { id: 'forest-6', name: 'Hedgehog', emoji: '🦔', description: 'Prickly pal', setId: 'forest-animals', rarity: 'common', number: 6 },
  { id: 'forest-7', name: 'Owl', emoji: '🦉', description: 'Wise night watcher', setId: 'forest-animals', rarity: 'rare', number: 7 },
  { id: 'forest-8', name: 'Beaver', emoji: '🦫', description: 'Builder extraordinaire', setId: 'forest-animals', rarity: 'uncommon', number: 8 },
  { id: 'forest-9', name: 'Badger', emoji: '🦡', description: 'Tough little one', setId: 'forest-animals', rarity: 'rare', number: 9 },
  { id: 'forest-10', name: 'Raccoon', emoji: '🦝', description: 'Masked adventurer', setId: 'forest-animals', rarity: 'uncommon', number: 10 },
  { id: 'forest-11', name: 'Wolf', emoji: '🐺', description: 'Leader of the pack', setId: 'forest-animals', rarity: 'epic', number: 11 },
  { id: 'forest-12', name: 'Forest Spirit', emoji: '🌳', description: 'Ancient guardian', setId: 'forest-animals', rarity: 'legendary', number: 12 },

  // Space Explorers (10)
  { id: 'space-1', name: 'Rocket', emoji: '🚀', description: 'Ready for launch!', setId: 'space-explorers', rarity: 'common', number: 1 },
  { id: 'space-2', name: 'Moon', emoji: '🌙', description: 'Lighting the night', setId: 'space-explorers', rarity: 'common', number: 2 },
  { id: 'space-3', name: 'Star', emoji: '⭐', description: 'Shining bright', setId: 'space-explorers', rarity: 'common', number: 3 },
  { id: 'space-4', name: 'Planet', emoji: '🪐', description: 'Saturn\'s rings', setId: 'space-explorers', rarity: 'uncommon', number: 4 },
  { id: 'space-5', name: 'Astronaut', emoji: '👨‍🚀', description: 'Space explorer', setId: 'space-explorers', rarity: 'uncommon', number: 5 },
  { id: 'space-6', name: 'Satellite', emoji: '🛸', description: 'Orbiting friend', setId: 'space-explorers', rarity: 'rare', number: 6 },
  { id: 'space-7', name: 'Meteor', emoji: '☄️', description: 'Shooting star', setId: 'space-explorers', rarity: 'rare', number: 7 },
  { id: 'space-8', name: 'Alien', emoji: '👽', description: 'Friendly visitor', setId: 'space-explorers', rarity: 'epic', number: 8 },
  { id: 'space-9', name: 'Nebula', emoji: '🌌', description: 'Cosmic wonder', setId: 'space-explorers', rarity: 'epic', number: 9 },
  { id: 'space-10', name: 'Black Hole', emoji: '🕳️', description: 'Mystery of space', setId: 'space-explorers', rarity: 'legendary', number: 10 },

  // Magical Creatures (8)
  { id: 'magic-1', name: 'Unicorn', emoji: '🦄', description: 'Rainbow magic', setId: 'magical-creatures', rarity: 'common', number: 1 },
  { id: 'magic-2', name: 'Fairy', emoji: '🧚', description: 'Sprinkles magic dust', setId: 'magical-creatures', rarity: 'uncommon', number: 2 },
  { id: 'magic-3', name: 'Mage', emoji: '🧙‍♂️', description: 'Master of spells', setId: 'magical-creatures', rarity: 'uncommon', number: 3 },
  { id: 'magic-4', name: 'Genie', emoji: '🧞', description: 'Grants wishes', setId: 'magical-creatures', rarity: 'rare', number: 4 },
  { id: 'magic-5', name: 'Elf', emoji: '🧝', description: 'Woodland magic', setId: 'magical-creatures', rarity: 'rare', number: 5 },
  { id: 'magic-6', name: 'Dragon', emoji: '🐉', description: 'Fire breather', setId: 'magical-creatures', rarity: 'epic', number: 6 },
  { id: 'magic-7', name: 'Phoenix', emoji: '🔥', description: 'Rises from ashes', setId: 'magical-creatures', rarity: 'epic', number: 7 },
  { id: 'magic-8', name: 'Celestial', emoji: '✨', description: 'Made of stardust', setId: 'magical-creatures', rarity: 'legendary', number: 8 },

  // Food Fiesta (15)
  { id: 'food-1', name: 'Pizza', emoji: '🍕', description: 'Cheesy goodness', setId: 'food-fiesta', rarity: 'common', number: 1 },
  { id: 'food-2', name: 'Burger', emoji: '🍔', description: 'Stacked high', setId: 'food-fiesta', rarity: 'common', number: 2 },
  { id: 'food-3', name: 'Taco', emoji: '🌮', description: 'Crunchy delight', setId: 'food-fiesta', rarity: 'common', number: 3 },
  { id: 'food-4', name: 'Sushi', emoji: '🍣', description: 'Fresh and tasty', setId: 'food-fiesta', rarity: 'uncommon', number: 4 },
  { id: 'food-5', name: 'Ice Cream', emoji: '🍦', description: 'Sweet treat', setId: 'food-fiesta', rarity: 'common', number: 5 },
  { id: 'food-6', name: 'Cake', emoji: '🎂', description: 'Celebration time!', setId: 'food-fiesta', rarity: 'uncommon', number: 6 },
  { id: 'food-7', name: 'Donut', emoji: '🍩', description: 'Sprinkles included', setId: 'food-fiesta', rarity: 'common', number: 7 },
  { id: 'food-8', name: 'Cookie', emoji: '🍪', description: 'Fresh from oven', setId: 'food-fiesta', rarity: 'common', number: 8 },
  { id: 'food-9', name: 'Cupcake', emoji: '🧁', description: 'Mini cake magic', setId: 'food-fiesta', rarity: 'uncommon', number: 9 },
  { id: 'food-10', name: 'Candy', emoji: '🍬', description: 'Sweet wrapper', setId: 'food-fiesta', rarity: 'common', number: 10 },
  { id: 'food-11', name: 'Popcorn', emoji: '🍿', description: 'Movie time!', setId: 'food-fiesta', rarity: 'common', number: 11 },
  { id: 'food-12', name: 'Ramen', emoji: '🍜', description: 'Noodle soup', setId: 'food-fiesta', rarity: 'rare', number: 12 },
  { id: 'food-13', name: 'Pancakes', emoji: '🥞', description: 'Breakfast stack', setId: 'food-fiesta', rarity: 'rare', number: 13 },
  { id: 'food-14', name: 'Bento', emoji: '🍱', description: 'Perfectly packed', setId: 'food-fiesta', rarity: 'epic', number: 14 },
  { id: 'food-15', name: 'Golden Apple', emoji: '🍎', description: 'Legendary fruit', setId: 'food-fiesta', rarity: 'legendary', number: 15 },

  // Sports Stars (10)
  { id: 'sports-1', name: 'Soccer Ball', emoji: '⚽', description: 'The beautiful game', setId: 'sports-stars', rarity: 'common', number: 1 },
  { id: 'sports-2', name: 'Basketball', emoji: '🏀', description: 'Slam dunk!', setId: 'sports-stars', rarity: 'common', number: 2 },
  { id: 'sports-3', name: 'Football', emoji: '🏈', description: 'Touchdown!', setId: 'sports-stars', rarity: 'common', number: 3 },
  { id: 'sports-4', name: 'Tennis', emoji: '🎾', description: 'Perfect serve', setId: 'sports-stars', rarity: 'uncommon', number: 4 },
  { id: 'sports-5', name: 'Baseball', emoji: '⚾', description: 'Home run!', setId: 'sports-stars', rarity: 'uncommon', number: 5 },
  { id: 'sports-6', name: 'Volleyball', emoji: '🏐', description: 'Spike it!', setId: 'sports-stars', rarity: 'uncommon', number: 6 },
  { id: 'sports-7', name: 'Bowling', emoji: '🎳', description: 'Strike!', setId: 'sports-stars', rarity: 'rare', number: 7 },
  { id: 'sports-8', name: 'Skateboard', emoji: '🛹', description: 'Rad moves', setId: 'sports-stars', rarity: 'rare', number: 8 },
  { id: 'sports-9', name: 'Trophy', emoji: '🏆', description: 'Victory!', setId: 'sports-stars', rarity: 'epic', number: 9 },
  { id: 'sports-10', name: 'Gold Medal', emoji: '🥇', description: 'Number one!', setId: 'sports-stars', rarity: 'legendary', number: 10 },
]

// ============================================
// STICKER PACKS
// ============================================

export const STICKER_PACKS: StickerPackDefinition[] = [
  {
    id: 'starter-pack',
    name: 'Starter Pack',
    description: '5 random stickers to begin your collection',
    icon: '📦',
    gradient: 'from-blue-400 to-cyan-500',
    price: 50,
    stickersCount: 5,
    setIds: ['ocean-friends', 'forest-animals', 'food-fiesta']
  },
  {
    id: 'ocean-pack',
    name: 'Ocean Pack',
    description: '3 stickers from the ocean!',
    icon: '🌊',
    gradient: 'from-cyan-400 to-blue-600',
    price: 75,
    stickersCount: 3,
    setIds: ['ocean-friends']
  },
  {
    id: 'forest-pack',
    name: 'Forest Pack',
    description: '3 stickers from the forest!',
    icon: '🌲',
    gradient: 'from-green-400 to-emerald-600',
    price: 75,
    stickersCount: 3,
    setIds: ['forest-animals']
  },
  {
    id: 'space-pack',
    name: 'Space Pack',
    description: '3 stickers from outer space!',
    icon: '🌌',
    gradient: 'from-purple-500 to-indigo-600',
    price: 100,
    stickersCount: 3,
    setIds: ['space-explorers']
  },
  {
    id: 'magic-pack',
    name: 'Magic Pack',
    description: '3 magical creature stickers!',
    icon: '✨',
    gradient: 'from-pink-400 to-purple-500',
    price: 100,
    stickersCount: 3,
    setIds: ['magical-creatures']
  },
  {
    id: 'premium-pack',
    name: 'Premium Pack',
    description: '5 stickers with 1 guaranteed rare or better!',
    icon: '💎',
    gradient: 'from-amber-400 to-orange-500',
    price: 200,
    stickersCount: 5,
    guaranteedRarity: 'rare',
    setIds: ['ocean-friends', 'forest-animals', 'space-explorers', 'magical-creatures', 'food-fiesta', 'sports-stars']
  },
  {
    id: 'legendary-pack',
    name: 'Legendary Pack',
    description: '3 stickers with 1 guaranteed epic or better!',
    icon: '👑',
    gradient: 'from-purple-600 to-pink-600',
    price: 500,
    stickersCount: 3,
    guaranteedRarity: 'epic',
    setIds: ['ocean-friends', 'forest-animals', 'space-explorers', 'magical-creatures', 'food-fiesta', 'sports-stars']
  }
]

// ============================================
// RARITY CONFIG
// ============================================

export const RARITY_CONFIG: Record<StickerRarity, { label: string; color: string; bgColor: string; borderColor: string; gradient: string; dropRate: number }> = {
  common: {
    label: 'Common',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    gradient: 'from-gray-200 to-gray-300',
    dropRate: 0.50
  },
  uncommon: {
    label: 'Uncommon',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-400',
    gradient: 'from-green-200 to-green-400',
    dropRate: 0.30
  },
  rare: {
    label: 'Rare',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
    gradient: 'from-blue-300 to-blue-500',
    dropRate: 0.13
  },
  epic: {
    label: 'Epic',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-500',
    gradient: 'from-purple-400 to-purple-600',
    dropRate: 0.05
  },
  legendary: {
    label: 'Legendary',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-500',
    gradient: 'from-amber-400 to-orange-500',
    dropRate: 0.02
  }
}

// ============================================
// STORAGE
// ============================================

const STORAGE_KEY = 'onde-sticker-collection'

const defaultState: StickerState = {
  ownedStickers: [],
  completedSets: [],
  totalStickersCollected: 0,
  packsOpened: 0,
  tradesCompleted: 0,
  pendingPack: null,
  revealedStickers: []
}

// ============================================
// HOOK
// ============================================

export function useStickerCollection() {
  const [state, setState] = useState<StickerState>(defaultState)
  const [mounted, setMounted] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setState({ ...defaultState, ...parsed })
      } catch {
        setState(defaultState)
      }
    }
    setMounted(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state, mounted])

  // Get sticker definition
  const getStickerDefinition = useCallback((stickerId: string): StickerDefinition | undefined => {
    return ALL_STICKERS.find(s => s.id === stickerId)
  }, [])

  // Get set definition
  const getSetDefinition = useCallback((setId: string): StickerSet | undefined => {
    return STICKER_SETS.find(s => s.id === setId)
  }, [])

  // Check if user owns a sticker
  const ownsSticker = useCallback((stickerId: string): boolean => {
    return state.ownedStickers.some(s => s.stickerId === stickerId)
  }, [state.ownedStickers])

  // Get owned sticker data
  const getOwnedSticker = useCallback((stickerId: string): OwnedSticker | undefined => {
    return state.ownedStickers.find(s => s.stickerId === stickerId)
  }, [state.ownedStickers])

  // Get duplicate count for a sticker
  const getDuplicateCount = useCallback((stickerId: string): number => {
    const owned = state.ownedStickers.find(s => s.stickerId === stickerId)
    return owned ? Math.max(0, owned.count - 1) : 0
  }, [state.ownedStickers])

  // Get total duplicates
  const getTotalDuplicates = useMemo(() => {
    return state.ownedStickers.reduce((total, s) => total + Math.max(0, s.count - 1), 0)
  }, [state.ownedStickers])

  // Get set progress
  const getSetProgress = useCallback((setId: string) => {
    const setStickers = ALL_STICKERS.filter(s => s.setId === setId)
    const ownedInSet = setStickers.filter(s => ownsSticker(s.id))
    return {
      owned: ownedInSet.length,
      total: setStickers.length,
      percentage: Math.round((ownedInSet.length / setStickers.length) * 100),
      isComplete: ownedInSet.length === setStickers.length,
      stickers: setStickers.map(s => ({
        ...s,
        owned: ownsSticker(s.id),
        count: getOwnedSticker(s.id)?.count || 0
      }))
    }
  }, [ownsSticker, getOwnedSticker])

  // Random sticker selection based on rarity
  const selectRandomSticker = useCallback((setIds: string[], guaranteedRarity?: StickerRarity): StickerDefinition => {
    const availableStickers = ALL_STICKERS.filter(s => setIds.includes(s.setId))
    
    if (guaranteedRarity) {
      const rarityOrder: StickerRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']
      const minIndex = rarityOrder.indexOf(guaranteedRarity)
      const eligibleStickers = availableStickers.filter(s => 
        rarityOrder.indexOf(s.rarity) >= minIndex
      )
      if (eligibleStickers.length > 0) {
        return eligibleStickers[Math.floor(Math.random() * eligibleStickers.length)]
      }
    }

    // Weight by rarity
    const random = Math.random()
    let cumulative = 0
    let selectedRarity: StickerRarity = 'common'

    for (const [rarity, config] of Object.entries(RARITY_CONFIG)) {
      cumulative += config.dropRate
      if (random <= cumulative) {
        selectedRarity = rarity as StickerRarity
        break
      }
    }

    const stickersOfRarity = availableStickers.filter(s => s.rarity === selectedRarity)
    if (stickersOfRarity.length === 0) {
      // Fallback to any sticker
      return availableStickers[Math.floor(Math.random() * availableStickers.length)]
    }

    return stickersOfRarity[Math.floor(Math.random() * stickersOfRarity.length)]
  }, [])

  // Open a sticker pack
  const openPack = useCallback((pack: StickerPackDefinition): StickerDefinition[] => {
    const stickers: StickerDefinition[] = []
    
    // Generate stickers
    for (let i = 0; i < pack.stickersCount; i++) {
      // Last sticker gets the guaranteed rarity if specified
      const guaranteed = (i === pack.stickersCount - 1) ? pack.guaranteedRarity : undefined
      stickers.push(selectRandomSticker(pack.setIds, guaranteed))
    }

    // Update state with pending pack for animation
    setState(prev => ({
      ...prev,
      pendingPack: pack,
      revealedStickers: stickers
    }))

    return stickers
  }, [selectRandomSticker])

  // Confirm pack opening (after animation)
  const confirmPackOpening = useCallback(() => {
    setState(prev => {
      const newOwned = [...prev.ownedStickers]
      
      prev.revealedStickers.forEach(sticker => {
        const existingIndex = newOwned.findIndex(s => s.stickerId === sticker.id)
        if (existingIndex >= 0) {
          newOwned[existingIndex] = {
            ...newOwned[existingIndex],
            count: newOwned[existingIndex].count + 1
          }
        } else {
          newOwned.push({
            stickerId: sticker.id,
            count: 1,
            obtainedAt: new Date().toISOString(),
            isNew: true
          })
        }
      })

      // Check for newly completed sets
      const newCompletedSets = [...prev.completedSets]
      STICKER_SETS.forEach(set => {
        if (!newCompletedSets.includes(set.id)) {
          const setStickers = ALL_STICKERS.filter(s => s.setId === set.id)
          const allOwned = setStickers.every(s => newOwned.some(o => o.stickerId === s.id))
          if (allOwned) {
            newCompletedSets.push(set.id)
          }
        }
      })

      return {
        ...prev,
        ownedStickers: newOwned,
        completedSets: newCompletedSets,
        totalStickersCollected: prev.totalStickersCollected + prev.revealedStickers.length,
        packsOpened: prev.packsOpened + 1,
        pendingPack: null,
        revealedStickers: []
      }
    })
  }, [])

  // Award a single sticker
  const awardSticker = useCallback((stickerId: string) => {
    const sticker = getStickerDefinition(stickerId)
    if (!sticker) return

    setState(prev => {
      const newOwned = [...prev.ownedStickers]
      const existingIndex = newOwned.findIndex(s => s.stickerId === stickerId)
      
      if (existingIndex >= 0) {
        newOwned[existingIndex] = {
          ...newOwned[existingIndex],
          count: newOwned[existingIndex].count + 1
        }
      } else {
        newOwned.push({
          stickerId,
          count: 1,
          obtainedAt: new Date().toISOString(),
          isNew: true
        })
      }

      // Check for newly completed sets
      const newCompletedSets = [...prev.completedSets]
      const stickerSet = STICKER_SETS.find(s => s.id === sticker.setId)
      if (stickerSet && !newCompletedSets.includes(stickerSet.id)) {
        const setStickers = ALL_STICKERS.filter(s => s.setId === stickerSet.id)
        const allOwned = setStickers.every(s => newOwned.some(o => o.stickerId === s.id))
        if (allOwned) {
          newCompletedSets.push(stickerSet.id)
        }
      }

      return {
        ...prev,
        ownedStickers: newOwned,
        completedSets: newCompletedSets,
        totalStickersCollected: prev.totalStickersCollected + 1
      }
    })
  }, [getStickerDefinition])

  // Clear "new" status from stickers
  const markAllSeen = useCallback(() => {
    setState(prev => ({
      ...prev,
      ownedStickers: prev.ownedStickers.map(s => ({ ...s, isNew: false }))
    }))
  }, [])

  // Trade duplicates (mock for now - could connect to social features)
  const tradeDuplicates = useCallback((stickerId: string, quantity: number): boolean => {
    const owned = state.ownedStickers.find(s => s.stickerId === stickerId)
    if (!owned || owned.count <= quantity) return false

    setState(prev => ({
      ...prev,
      ownedStickers: prev.ownedStickers.map(s => 
        s.stickerId === stickerId 
          ? { ...s, count: s.count - quantity }
          : s
      ),
      tradesCompleted: prev.tradesCompleted + 1
    }))

    return true
  }, [state.ownedStickers])

  // Stats
  const collectionStats = useMemo(() => {
    const totalStickers = ALL_STICKERS.length
    const ownedUnique = state.ownedStickers.length
    
    const byRarity: Record<StickerRarity, { owned: number; total: number }> = {
      common: { owned: 0, total: 0 },
      uncommon: { owned: 0, total: 0 },
      rare: { owned: 0, total: 0 },
      epic: { owned: 0, total: 0 },
      legendary: { owned: 0, total: 0 }
    }

    ALL_STICKERS.forEach(sticker => {
      byRarity[sticker.rarity].total++
      if (ownsSticker(sticker.id)) {
        byRarity[sticker.rarity].owned++
      }
    })

    return {
      totalStickers,
      ownedUnique,
      percentage: Math.round((ownedUnique / totalStickers) * 100),
      completedSets: state.completedSets.length,
      totalSets: STICKER_SETS.length,
      totalDuplicates: getTotalDuplicates,
      byRarity
    }
  }, [state.ownedStickers, state.completedSets, ownsSticker, getTotalDuplicates])

  return {
    mounted,
    state,
    collectionStats,
    allStickers: ALL_STICKERS,
    allSets: STICKER_SETS,
    allPacks: STICKER_PACKS,
    rarityConfig: RARITY_CONFIG,
    getStickerDefinition,
    getSetDefinition,
    getSetProgress,
    ownsSticker,
    getOwnedSticker,
    getDuplicateCount,
    getTotalDuplicates,
    openPack,
    confirmPackOpening,
    awardSticker,
    markAllSeen,
    tradeDuplicates
  }
}

'use client'

import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react'

// ============================================
// TYPES
// ============================================

export type CoinSourceType = 
  | 'game_win'
  | 'game_play'
  | 'achievement'
  | 'daily_login'
  | 'streak_bonus'
  | 'challenge_complete'
  | 'reading_milestone'
  | 'collection_complete'
  | 'referral'
  | 'event_bonus'
  | 'purchase'
  | 'admin_grant'

export type CosmeticType = 'theme' | 'pet' | 'frame' | 'badge' | 'effect' | 'sticker'

export interface CoinTransaction {
  id: string
  amount: number
  source: CoinSourceType
  description: string
  timestamp: string
  multiplier?: number
}

export interface Cosmetic {
  id: string
  name: string
  description: string
  type: CosmeticType
  price: number
  icon: string
  preview?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockRequirement?: string // Achievement or level requirement
}

export interface Pet {
  id: string
  name: string
  description: string
  icon: string
  animations: string[]
  price: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface ProfileFrame {
  id: string
  name: string
  description: string
  borderStyle: string
  glowColor?: string
  animation?: string
  price: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface CoinMultiplierEvent {
  id: string
  name: string
  description: string
  multiplier: number
  startTime: string
  endTime: string
  sources?: CoinSourceType[] // If empty, applies to all
  icon: string
}

export interface CoinState {
  balance: number
  lifetimeEarned: number
  lifetimeSpent: number
  ownedCosmetics: string[]
  equippedCosmetics: {
    theme?: string
    pet?: string
    frame?: string
    badge?: string
    effect?: string
  }
  transactions: CoinTransaction[]
  lastDailyLogin?: string
  loginStreak: number
  pendingAnimations: Array<{
    id: string
    amount: number
    source: CoinSourceType
  }>
}

// ============================================
// COIN REWARDS CONFIG
// ============================================

export const COIN_REWARDS: Record<CoinSourceType, number> = {
  game_win: 25,
  game_play: 5,
  achievement: 50, // Base, multiplied by rarity
  daily_login: 10,
  streak_bonus: 5, // Per day of streak
  challenge_complete: 100,
  reading_milestone: 15,
  collection_complete: 75,
  referral: 200,
  event_bonus: 0,
  purchase: 0,
  admin_grant: 0
}

export const ACHIEVEMENT_RARITY_MULTIPLIER = {
  common: 1,
  rare: 2,
  epic: 4,
  legendary: 10
}

// ============================================
// SHOP ITEMS
// ============================================

export const THEMES: Cosmetic[] = [
  {
    id: 'theme_sunset',
    name: 'Tramonto Marino',
    description: 'Warm orange and coral sunset colors',
    type: 'theme',
    price: 250,
    icon: '🌅',
    rarity: 'common'
  },
  {
    id: 'theme_deep_ocean',
    name: 'Oceano Profondo',
    description: 'Deep blue and mysterious underwater vibes',
    type: 'theme',
    price: 400,
    icon: '🌊',
    rarity: 'rare'
  },
  {
    id: 'theme_tropical',
    name: 'Paradiso Tropicale',
    description: 'Vibrant tropical greens and blues',
    type: 'theme',
    price: 600,
    icon: '🌴',
    rarity: 'epic'
  },
  {
    id: 'theme_northern_lights',
    name: 'Aurora Boreale',
    description: 'Mesmerizing northern lights palette',
    type: 'theme',
    price: 1000,
    icon: '✨',
    rarity: 'legendary'
  },
  {
    id: 'theme_coral_reef',
    name: 'Barriera Corallina',
    description: 'Colorful coral reef inspired theme',
    type: 'theme',
    price: 350,
    icon: '🐠',
    rarity: 'rare'
  }
]

export const PETS: Pet[] = [
  {
    id: 'pet_fish',
    name: 'Pesciolino',
    description: 'A friendly little fish that follows you around',
    icon: '🐟',
    animations: ['swim', 'bubble', 'jump'],
    price: 150,
    rarity: 'common'
  },
  {
    id: 'pet_crab',
    name: 'Granchietto',
    description: 'A cute crab with clicky claws',
    icon: '🦀',
    animations: ['walk', 'pinch', 'hide'],
    price: 200,
    rarity: 'common'
  },
  {
    id: 'pet_turtle',
    name: 'Tartaruga',
    description: 'A wise sea turtle companion',
    icon: '🐢',
    animations: ['swim', 'sleep', 'wink'],
    price: 300,
    rarity: 'rare'
  },
  {
    id: 'pet_dolphin',
    name: 'Delfino',
    description: 'An energetic dolphin friend',
    icon: '🐬',
    animations: ['flip', 'splash', 'sing'],
    price: 500,
    rarity: 'rare'
  },
  {
    id: 'pet_octopus',
    name: 'Polpetto',
    description: 'A clever octopus with eight helpful tentacles',
    icon: '🐙',
    animations: ['wave', 'ink', 'squeeze'],
    price: 750,
    rarity: 'epic'
  },
  {
    id: 'pet_whale',
    name: 'Balena',
    description: 'A majestic whale that sings ocean songs',
    icon: '🐋',
    animations: ['spray', 'dive', 'sing'],
    price: 1000,
    rarity: 'epic'
  },
  {
    id: 'pet_mermaid',
    name: 'Sirenetta',
    description: 'A magical mermaid companion',
    icon: '🧜‍♀️',
    animations: ['swim', 'wave', 'sparkle'],
    price: 2000,
    rarity: 'legendary'
  },
  {
    id: 'pet_kraken',
    name: 'Kraken',
    description: 'The legendary sea creature',
    icon: '🦑',
    animations: ['tentacle', 'roar', 'emerge'],
    price: 5000,
    rarity: 'legendary'
  }
]

export const PROFILE_FRAMES: ProfileFrame[] = [
  {
    id: 'frame_wave',
    name: 'Onde',
    description: 'A gentle wave border',
    borderStyle: 'border-2 border-onde-ocean rounded-full',
    price: 100,
    rarity: 'common'
  },
  {
    id: 'frame_bubbles',
    name: 'Bolle',
    description: 'Floating bubble decorations',
    borderStyle: 'border-3 border-cyan-400 rounded-full',
    glowColor: 'rgba(34, 211, 238, 0.3)',
    price: 200,
    rarity: 'common'
  },
  {
    id: 'frame_coral',
    name: 'Corallo',
    description: 'Beautiful coral reef frame',
    borderStyle: 'border-4 border-onde-coral rounded-full',
    glowColor: 'rgba(255, 127, 127, 0.4)',
    price: 350,
    rarity: 'rare'
  },
  {
    id: 'frame_golden',
    name: 'Tesoro',
    description: 'Shimmering golden treasure frame',
    borderStyle: 'border-4 border-onde-gold rounded-full',
    glowColor: 'rgba(212, 175, 55, 0.5)',
    animation: 'animate-pulse',
    price: 600,
    rarity: 'epic'
  },
  {
    id: 'frame_rainbow',
    name: 'Arcobaleno',
    description: 'Magical rainbow-shifting border',
    borderStyle: 'border-4 rounded-full',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    animation: 'animate-gradient-shift',
    price: 1500,
    rarity: 'legendary'
  }
]

export const BADGES: Cosmetic[] = [
  {
    id: 'badge_explorer',
    name: 'Esploratore',
    description: 'Show off your adventurous spirit',
    type: 'badge',
    price: 75,
    icon: '🧭',
    rarity: 'common'
  },
  {
    id: 'badge_reader',
    name: 'Lettore',
    description: 'A true bookworm badge',
    type: 'badge',
    price: 75,
    icon: '📚',
    rarity: 'common'
  },
  {
    id: 'badge_gamer',
    name: 'Giocatore',
    description: 'For dedicated gamers',
    type: 'badge',
    price: 75,
    icon: '🎮',
    rarity: 'common'
  },
  {
    id: 'badge_champion',
    name: 'Campione',
    description: 'Achieved greatness',
    type: 'badge',
    price: 300,
    icon: '🏆',
    rarity: 'rare'
  },
  {
    id: 'badge_pirate',
    name: 'Pirata',
    description: 'Arr! A fearsome sea dog',
    type: 'badge',
    price: 500,
    icon: '🏴‍☠️',
    rarity: 'epic'
  },
  {
    id: 'badge_trident',
    name: 'Tritone',
    description: 'Blessed by the sea gods',
    type: 'badge',
    price: 1000,
    icon: '🔱',
    rarity: 'legendary'
  }
]

export const EFFECTS: Cosmetic[] = [
  {
    id: 'effect_bubbles',
    name: 'Bolle Galleggianti',
    description: 'Bubbles float around your cursor',
    type: 'effect',
    price: 200,
    icon: '🫧',
    rarity: 'common'
  },
  {
    id: 'effect_sparkles',
    name: 'Scintille',
    description: 'Sparkles follow your movements',
    type: 'effect',
    price: 350,
    icon: '✨',
    rarity: 'rare'
  },
  {
    id: 'effect_waves',
    name: 'Onde di Luce',
    description: 'Light waves ripple from clicks',
    type: 'effect',
    price: 500,
    icon: '🌟',
    rarity: 'epic'
  },
  {
    id: 'effect_rainbow',
    name: 'Scia Arcobaleno',
    description: 'Leave a rainbow trail',
    type: 'effect',
    price: 1200,
    icon: '🌈',
    rarity: 'legendary'
  }
]

// ============================================
// MULTIPLIER EVENTS (sample data)
// ============================================

export const SAMPLE_EVENTS: CoinMultiplierEvent[] = [
  {
    id: 'weekend_bonus',
    name: 'Weekend Bonus',
    description: 'Earn 2x coins all weekend!',
    multiplier: 2,
    startTime: '', // Set dynamically
    endTime: '',
    icon: '🎉'
  },
  {
    id: 'reading_week',
    name: 'Settimana della Lettura',
    description: '3x coins from reading milestones',
    multiplier: 3,
    startTime: '',
    endTime: '',
    sources: ['reading_milestone'],
    icon: '📖'
  },
  {
    id: 'game_fest',
    name: 'Festival dei Giochi',
    description: 'Double coins from all games!',
    multiplier: 2,
    startTime: '',
    endTime: '',
    sources: ['game_win', 'game_play'],
    icon: '🎮'
  }
]

// ============================================
// DEFAULT STATE
// ============================================

const DEFAULT_STATE: CoinState = {
  balance: 0,
  lifetimeEarned: 0,
  lifetimeSpent: 0,
  ownedCosmetics: [],
  equippedCosmetics: {},
  transactions: [],
  loginStreak: 0,
  pendingAnimations: []
}

const STORAGE_KEY = 'onde-coins'

// ============================================
// CONTEXT
// ============================================

export interface CoinContextType {
  // State
  balance: number
  lifetimeEarned: number
  lifetimeSpent: number
  ownedCosmetics: string[]
  equippedCosmetics: CoinState['equippedCosmetics']
  loginStreak: number
  pendingAnimations: CoinState['pendingAnimations']
  mounted: boolean
  
  // Active multipliers
  activeMultipliers: CoinMultiplierEvent[]
  getCurrentMultiplier: (source: CoinSourceType) => number
  
  // Earning coins
  earnCoins: (source: CoinSourceType, customAmount?: number, description?: string) => number
  earnFromAchievement: (rarity: 'common' | 'rare' | 'epic' | 'legendary', achievementName: string) => number
  claimDailyLogin: () => { earned: number; streak: number } | null
  
  // Spending coins
  spendCoins: (amount: number, description: string) => boolean
  purchaseCosmetic: (cosmeticId: string) => boolean
  canAfford: (price: number) => boolean
  
  // Cosmetics
  ownsCosmetic: (cosmeticId: string) => boolean
  equipCosmetic: (cosmeticId: string, type: CosmeticType) => void
  unequipCosmetic: (type: CosmeticType) => void
  getEquipped: (type: CosmeticType) => string | undefined
  
  // Shop data
  getAllCosmetics: () => Cosmetic[]
  getCosmeticById: (id: string) => Cosmetic | Pet | ProfileFrame | undefined
  getCosmeticsByType: (type: CosmeticType) => (Cosmetic | Pet | ProfileFrame)[]
  
  // Animations
  popPendingAnimation: () => CoinState['pendingAnimations'][0] | undefined
  clearPendingAnimations: () => void
  
  // History
  getRecentTransactions: (limit?: number) => CoinTransaction[]
  
  // Events
  getActiveEvents: () => CoinMultiplierEvent[]
  
  // Testing/Admin
  resetCoins: () => void
  grantCoins: (amount: number, description?: string) => void
}

export const CoinContext = createContext<CoinContextType | null>(null)

// ============================================
// HOOK
// ============================================

export function useCoins(): CoinContextType {
  const context = useContext(CoinContext)
  
  if (context) {
    return context
  }
  
  // If not in provider, return standalone hook
  return useCoinsStandalone()
}

// Standalone version for cases without provider
function useCoinsStandalone(): CoinContextType {
  const [state, setState] = useState<CoinState>(DEFAULT_STATE)
  const [mounted, setMounted] = useState(false)
  const [activeEvents, setActiveEvents] = useState<CoinMultiplierEvent[]>([])

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setState({ ...DEFAULT_STATE, ...parsed })
      } catch (e) {
        console.error('Failed to parse coin state:', e)
      }
    }
    setMounted(true)
    
    // Check for weekend bonus (example)
    const now = new Date()
    const day = now.getDay()
    if (day === 0 || day === 6) {
      setActiveEvents([{
        ...SAMPLE_EVENTS[0],
        startTime: new Date(now.setHours(0, 0, 0, 0)).toISOString(),
        endTime: new Date(now.setHours(23, 59, 59, 999)).toISOString()
      }])
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state, mounted])

  // Get current multiplier for a source
  const getCurrentMultiplier = useCallback((source: CoinSourceType): number => {
    const now = new Date()
    let multiplier = 1
    
    for (const event of activeEvents) {
      const start = new Date(event.startTime)
      const end = new Date(event.endTime)
      
      if (now >= start && now <= end) {
        if (!event.sources || event.sources.includes(source)) {
          multiplier = Math.max(multiplier, event.multiplier)
        }
      }
    }
    
    return multiplier
  }, [activeEvents])

  // Earn coins
  const earnCoins = useCallback((
    source: CoinSourceType,
    customAmount?: number,
    description?: string
  ): number => {
    const baseAmount = customAmount ?? COIN_REWARDS[source]
    const multiplier = getCurrentMultiplier(source)
    const finalAmount = Math.floor(baseAmount * multiplier)
    
    if (finalAmount <= 0) return 0
    
    const transaction: CoinTransaction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amount: finalAmount,
      source,
      description: description || `Earned from ${source.replace(/_/g, ' ')}`,
      timestamp: new Date().toISOString(),
      multiplier: multiplier > 1 ? multiplier : undefined
    }
    
    setState(prev => ({
      ...prev,
      balance: prev.balance + finalAmount,
      lifetimeEarned: prev.lifetimeEarned + finalAmount,
      transactions: [transaction, ...prev.transactions].slice(0, 100),
      pendingAnimations: [...prev.pendingAnimations, {
        id: transaction.id,
        amount: finalAmount,
        source
      }]
    }))
    
    return finalAmount
  }, [getCurrentMultiplier])

  // Earn from achievement unlock
  const earnFromAchievement = useCallback((
    rarity: 'common' | 'rare' | 'epic' | 'legendary',
    achievementName: string
  ): number => {
    const baseAmount = COIN_REWARDS.achievement
    const rarityMultiplier = ACHIEVEMENT_RARITY_MULTIPLIER[rarity]
    const eventMultiplier = getCurrentMultiplier('achievement')
    const finalAmount = Math.floor(baseAmount * rarityMultiplier * eventMultiplier)
    
    const transaction: CoinTransaction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amount: finalAmount,
      source: 'achievement',
      description: `Achievement: ${achievementName} (${rarity})`,
      timestamp: new Date().toISOString(),
      multiplier: eventMultiplier > 1 ? eventMultiplier : undefined
    }
    
    setState(prev => ({
      ...prev,
      balance: prev.balance + finalAmount,
      lifetimeEarned: prev.lifetimeEarned + finalAmount,
      transactions: [transaction, ...prev.transactions].slice(0, 100),
      pendingAnimations: [...prev.pendingAnimations, {
        id: transaction.id,
        amount: finalAmount,
        source: 'achievement'
      }]
    }))
    
    return finalAmount
  }, [getCurrentMultiplier])

  // Claim daily login
  const claimDailyLogin = useCallback((): { earned: number; streak: number } | null => {
    const today = new Date().toDateString()
    
    if (state.lastDailyLogin === today) {
      return null // Already claimed today
    }
    
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const wasYesterday = state.lastDailyLogin === yesterday.toDateString()
    
    const newStreak = wasYesterday ? state.loginStreak + 1 : 1
    const streakBonus = Math.min(newStreak, 7) * COIN_REWARDS.streak_bonus
    const dailyAmount = COIN_REWARDS.daily_login
    const totalAmount = dailyAmount + streakBonus
    
    const transaction: CoinTransaction = {
      id: `${Date.now()}-daily`,
      amount: totalAmount,
      source: 'daily_login',
      description: `Daily login (Day ${newStreak} streak)`,
      timestamp: new Date().toISOString()
    }
    
    setState(prev => ({
      ...prev,
      balance: prev.balance + totalAmount,
      lifetimeEarned: prev.lifetimeEarned + totalAmount,
      lastDailyLogin: today,
      loginStreak: newStreak,
      transactions: [transaction, ...prev.transactions].slice(0, 100),
      pendingAnimations: [...prev.pendingAnimations, {
        id: transaction.id,
        amount: totalAmount,
        source: 'daily_login'
      }]
    }))
    
    return { earned: totalAmount, streak: newStreak }
  }, [state.lastDailyLogin, state.loginStreak])

  // Spend coins
  const spendCoins = useCallback((amount: number, description: string): boolean => {
    if (state.balance < amount) return false
    
    const transaction: CoinTransaction = {
      id: `${Date.now()}-spend`,
      amount: -amount,
      source: 'purchase',
      description,
      timestamp: new Date().toISOString()
    }
    
    setState(prev => ({
      ...prev,
      balance: prev.balance - amount,
      lifetimeSpent: prev.lifetimeSpent + amount,
      transactions: [transaction, ...prev.transactions].slice(0, 100)
    }))
    
    return true
  }, [state.balance])

  // Get cosmetic by ID
  const getCosmeticById = useCallback((id: string): Cosmetic | Pet | ProfileFrame | undefined => {
    return [...THEMES, ...BADGES, ...EFFECTS].find(c => c.id === id) ||
           PETS.find(p => p.id === id) ||
           PROFILE_FRAMES.find(f => f.id === id)
  }, [])

  // Purchase cosmetic
  const purchaseCosmetic = useCallback((cosmeticId: string): boolean => {
    if (state.ownedCosmetics.includes(cosmeticId)) return false
    
    const cosmetic = getCosmeticById(cosmeticId)
    if (!cosmetic) return false
    
    if (state.balance < cosmetic.price) return false
    
    const transaction: CoinTransaction = {
      id: `${Date.now()}-purchase`,
      amount: -cosmetic.price,
      source: 'purchase',
      description: `Purchased: ${cosmetic.name}`,
      timestamp: new Date().toISOString()
    }
    
    setState(prev => ({
      ...prev,
      balance: prev.balance - cosmetic.price,
      lifetimeSpent: prev.lifetimeSpent + cosmetic.price,
      ownedCosmetics: [...prev.ownedCosmetics, cosmeticId],
      transactions: [transaction, ...prev.transactions].slice(0, 100)
    }))
    
    return true
  }, [state.balance, state.ownedCosmetics, getCosmeticById])

  // Check if can afford
  const canAfford = useCallback((price: number): boolean => {
    return state.balance >= price
  }, [state.balance])

  // Check if owns cosmetic
  const ownsCosmetic = useCallback((cosmeticId: string): boolean => {
    return state.ownedCosmetics.includes(cosmeticId)
  }, [state.ownedCosmetics])

  // Equip cosmetic
  const equipCosmetic = useCallback((cosmeticId: string, type: CosmeticType): void => {
    if (!state.ownedCosmetics.includes(cosmeticId)) return
    
    setState(prev => ({
      ...prev,
      equippedCosmetics: {
        ...prev.equippedCosmetics,
        [type]: cosmeticId
      }
    }))
  }, [state.ownedCosmetics])

  // Unequip cosmetic
  const unequipCosmetic = useCallback((type: CosmeticType): void => {
    setState(prev => ({
      ...prev,
      equippedCosmetics: {
        ...prev.equippedCosmetics,
        [type]: undefined
      }
    }))
  }, [])

  // Get equipped cosmetic
  const getEquipped = useCallback((type: CosmeticType): string | undefined => {
    return state.equippedCosmetics[type]
  }, [state.equippedCosmetics])

  // Get all cosmetics
  const getAllCosmetics = useCallback((): Cosmetic[] => {
    return [...THEMES, ...BADGES, ...EFFECTS]
  }, [])

  // Get cosmetics by type
  const getCosmeticsByType = useCallback((type: CosmeticType): (Cosmetic | Pet | ProfileFrame)[] => {
    switch (type) {
      case 'theme': return THEMES
      case 'pet': return PETS
      case 'frame': return PROFILE_FRAMES
      case 'badge': return BADGES
      case 'effect': return EFFECTS
      default: return []
    }
  }, [])

  // Pop pending animation
  const popPendingAnimation = useCallback(() => {
    const next = state.pendingAnimations[0]
    if (next) {
      setState(prev => ({
        ...prev,
        pendingAnimations: prev.pendingAnimations.slice(1)
      }))
    }
    return next
  }, [state.pendingAnimations])

  // Clear pending animations
  const clearPendingAnimations = useCallback(() => {
    setState(prev => ({
      ...prev,
      pendingAnimations: []
    }))
  }, [])

  // Get recent transactions
  const getRecentTransactions = useCallback((limit: number = 20) => {
    return state.transactions.slice(0, limit)
  }, [state.transactions])

  // Get active events
  const getActiveEvents = useCallback(() => {
    const now = new Date()
    return activeEvents.filter(event => {
      const start = new Date(event.startTime)
      const end = new Date(event.endTime)
      return now >= start && now <= end
    })
  }, [activeEvents])

  // Reset coins (testing)
  const resetCoins = useCallback(() => {
    setState(DEFAULT_STATE)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Grant coins (admin)
  const grantCoins = useCallback((amount: number, description?: string) => {
    const transaction: CoinTransaction = {
      id: `${Date.now()}-grant`,
      amount,
      source: 'admin_grant',
      description: description || 'Admin grant',
      timestamp: new Date().toISOString()
    }
    
    setState(prev => ({
      ...prev,
      balance: prev.balance + amount,
      lifetimeEarned: prev.lifetimeEarned + amount,
      transactions: [transaction, ...prev.transactions].slice(0, 100),
      pendingAnimations: [...prev.pendingAnimations, {
        id: transaction.id,
        amount,
        source: 'admin_grant'
      }]
    }))
  }, [])

  return {
    // State
    balance: state.balance,
    lifetimeEarned: state.lifetimeEarned,
    lifetimeSpent: state.lifetimeSpent,
    ownedCosmetics: state.ownedCosmetics,
    equippedCosmetics: state.equippedCosmetics,
    loginStreak: state.loginStreak,
    pendingAnimations: state.pendingAnimations,
    mounted,
    
    // Multipliers
    activeMultipliers: activeEvents,
    getCurrentMultiplier,
    
    // Earning
    earnCoins,
    earnFromAchievement,
    claimDailyLogin,
    
    // Spending
    spendCoins,
    purchaseCosmetic,
    canAfford,
    
    // Cosmetics
    ownsCosmetic,
    equipCosmetic,
    unequipCosmetic,
    getEquipped,
    
    // Shop
    getAllCosmetics,
    getCosmeticById,
    getCosmeticsByType,
    
    // Animations
    popPendingAnimation,
    clearPendingAnimations,
    
    // History
    getRecentTransactions,
    
    // Events
    getActiveEvents,
    
    // Testing
    resetCoins,
    grantCoins
  }
}

// ============================================
// PROVIDER COMPONENT
// ============================================

export function CoinProvider({ children }: { children: React.ReactNode }) {
  const coins = useCoinsStandalone()
  
  return (
    <CoinContext.Provider value={coins}>
      {children}
    </CoinContext.Provider>
  )
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function formatCoinAmount(amount: number): string {
  if (amount >= 10000) {
    return `${(amount / 1000).toFixed(1)}k`
  }
  return amount.toLocaleString()
}

export function getRarityColor(rarity: 'common' | 'rare' | 'epic' | 'legendary'): string {
  switch (rarity) {
    case 'common': return 'text-gray-600 bg-gray-100'
    case 'rare': return 'text-blue-600 bg-blue-100'
    case 'epic': return 'text-purple-600 bg-purple-100'
    case 'legendary': return 'text-amber-600 bg-gradient-to-r from-amber-100 to-yellow-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

export function getRarityGlow(rarity: 'common' | 'rare' | 'epic' | 'legendary'): string {
  switch (rarity) {
    case 'common': return ''
    case 'rare': return 'shadow-lg shadow-blue-500/20'
    case 'epic': return 'shadow-xl shadow-purple-500/30'
    case 'legendary': return 'shadow-2xl shadow-amber-500/40 animate-pulse'
    default: return ''
  }
}

export default useCoins

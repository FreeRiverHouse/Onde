'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// Pet species with their characteristics
export type PetSpecies = 'cat' | 'dog' | 'dragon' | 'unicorn' | 'bunny' | 'fox' | 'owl' | 'phoenix'

export type PetRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface PetDefinition {
  id: string
  species: PetSpecies
  name: string
  emoji: string
  rarity: PetRarity
  description: string
  unlockMethod: 'game' | 'achievement' | 'special' | 'daily' | 'reading'
  unlockRequirement?: string
}

export interface OwnedPet {
  petId: string
  nickname: string
  level: number
  xp: number
  happiness: number  // 0-100
  lastFed: string
  lastPlayed: string
  obtainedAt: string
  isCompanion: boolean
}

export interface PetCollectionState {
  pets: OwnedPet[]
  companionId: string | null
  totalPetsCollected: number
  stats: {
    totalPlaySessions: number
    totalFeedings: number
    highestLevel: number
  }
}

// Pet rarity configuration
export const RARITY_CONFIG = {
  common: {
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    gradient: 'from-gray-200 to-gray-300',
    label: 'Common',
    xpMultiplier: 1,
    dropChance: 0.40
  },
  uncommon: {
    color: 'text-green-600',
    bg: 'bg-green-100',
    border: 'border-green-300',
    gradient: 'from-green-200 to-emerald-300',
    label: 'Uncommon',
    xpMultiplier: 1.2,
    dropChance: 0.30
  },
  rare: {
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    gradient: 'from-blue-200 to-cyan-300',
    label: 'Rare',
    xpMultiplier: 1.5,
    dropChance: 0.20
  },
  epic: {
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    gradient: 'from-purple-200 to-violet-300',
    label: 'Epic',
    xpMultiplier: 2,
    dropChance: 0.08
  },
  legendary: {
    color: 'text-amber-600',
    bg: 'bg-gradient-to-br from-amber-100 to-yellow-200',
    border: 'border-amber-400',
    gradient: 'from-amber-300 via-yellow-300 to-orange-300',
    label: 'Legendary',
    xpMultiplier: 3,
    dropChance: 0.02
  }
}

// All available pets in the game
export const ALL_PETS: PetDefinition[] = [
  // Common pets (40%)
  {
    id: 'cat_tabby',
    species: 'cat',
    name: 'Tabby Cat',
    emoji: '🐱',
    rarity: 'common',
    description: 'A friendly tabby cat who loves to nap.',
    unlockMethod: 'game',
    unlockRequirement: 'Play any game'
  },
  {
    id: 'dog_golden',
    species: 'dog',
    name: 'Golden Pup',
    emoji: '🐕',
    rarity: 'common',
    description: 'A loyal and playful golden retriever.',
    unlockMethod: 'game',
    unlockRequirement: 'Play any game'
  },
  {
    id: 'bunny_white',
    species: 'bunny',
    name: 'Snow Bunny',
    emoji: '🐰',
    rarity: 'common',
    description: 'A fluffy white bunny who loves carrots.',
    unlockMethod: 'game',
    unlockRequirement: 'Play any game'
  },
  {
    id: 'cat_orange',
    species: 'cat',
    name: 'Ginger Cat',
    emoji: '🐈',
    rarity: 'common',
    description: 'An adventurous orange cat.',
    unlockMethod: 'reading',
    unlockRequirement: 'Read a book'
  },
  
  // Uncommon pets (30%)
  {
    id: 'fox_red',
    species: 'fox',
    name: 'Forest Fox',
    emoji: '🦊',
    rarity: 'uncommon',
    description: 'A clever fox from the enchanted forest.',
    unlockMethod: 'game',
    unlockRequirement: 'Win 3 games'
  },
  {
    id: 'owl_barn',
    species: 'owl',
    name: 'Wise Owl',
    emoji: '🦉',
    rarity: 'uncommon',
    description: 'A knowledgeable owl who loves books.',
    unlockMethod: 'reading',
    unlockRequirement: 'Complete a book'
  },
  {
    id: 'dog_husky',
    species: 'dog',
    name: 'Arctic Husky',
    emoji: '🐺',
    rarity: 'uncommon',
    description: 'A majestic husky from the frozen north.',
    unlockMethod: 'game',
    unlockRequirement: 'Score over 100 in a game'
  },
  {
    id: 'cat_black',
    species: 'cat',
    name: 'Shadow Cat',
    emoji: '🐈‍⬛',
    rarity: 'uncommon',
    description: 'A mysterious black cat with magical eyes.',
    unlockMethod: 'special',
    unlockRequirement: 'Visit at night'
  },
  
  // Rare pets (20%)
  {
    id: 'dragon_baby',
    species: 'dragon',
    name: 'Baby Dragon',
    emoji: '🐉',
    rarity: 'rare',
    description: 'A tiny dragon who breathes sparkles.',
    unlockMethod: 'achievement',
    unlockRequirement: 'Unlock 5 achievements'
  },
  {
    id: 'unicorn_baby',
    species: 'unicorn',
    name: 'Sparkle Pony',
    emoji: '🦄',
    rarity: 'rare',
    description: 'A young unicorn learning magic.',
    unlockMethod: 'game',
    unlockRequirement: 'Win 10 games'
  },
  {
    id: 'phoenix_young',
    species: 'phoenix',
    name: 'Ember Bird',
    emoji: '🔥',
    rarity: 'rare',
    description: 'A phoenix chick with warm feathers.',
    unlockMethod: 'daily',
    unlockRequirement: '7 day streak'
  },
  
  // Epic pets (8%)
  {
    id: 'dragon_fire',
    species: 'dragon',
    name: 'Fire Drake',
    emoji: '🔥🐲',
    rarity: 'epic',
    description: 'A fierce dragon with flames of gold.',
    unlockMethod: 'achievement',
    unlockRequirement: 'Earn 10 achievements'
  },
  {
    id: 'unicorn_rainbow',
    species: 'unicorn',
    name: 'Rainbow Unicorn',
    emoji: '🌈🦄',
    rarity: 'epic',
    description: 'A magical unicorn with a rainbow mane.',
    unlockMethod: 'special',
    unlockRequirement: 'Collect 10 different pets'
  },
  {
    id: 'owl_cosmic',
    species: 'owl',
    name: 'Cosmic Owl',
    emoji: '✨🦉',
    rarity: 'epic',
    description: 'An owl blessed by starlight.',
    unlockMethod: 'reading',
    unlockRequirement: 'Read 10 books'
  },
  
  // Legendary pets (2%)
  {
    id: 'phoenix_eternal',
    species: 'phoenix',
    name: 'Eternal Phoenix',
    emoji: '🌟🔥',
    rarity: 'legendary',
    description: 'The immortal phoenix, master of rebirth.',
    unlockMethod: 'achievement',
    unlockRequirement: 'Earn all achievements'
  },
  {
    id: 'dragon_celestial',
    species: 'dragon',
    name: 'Celestial Dragon',
    emoji: '✨🐲✨',
    rarity: 'legendary',
    description: 'A divine dragon from the heavens.',
    unlockMethod: 'special',
    unlockRequirement: 'Collect 20 pets'
  }
]

const STORAGE_KEY = 'onde-pet-collection'

const DEFAULT_STATE: PetCollectionState = {
  pets: [],
  companionId: null,
  totalPetsCollected: 0,
  stats: {
    totalPlaySessions: 0,
    totalFeedings: 0,
    highestLevel: 1
  }
}

// XP needed for each level (exponential growth)
export function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// Calculate happiness decay (loses 5% per hour, minimum 10)
function calculateHappiness(lastInteraction: string, currentHappiness: number): number {
  const hoursSince = (Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60)
  const decay = Math.floor(hoursSince * 5)
  return Math.max(10, currentHappiness - decay)
}

export function usePetCollection() {
  const [state, setState] = useState<PetCollectionState>(DEFAULT_STATE)
  const [mounted, setMounted] = useState(false)
  const [newlyObtained, setNewlyObtained] = useState<PetDefinition | null>(null)

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as PetCollectionState
        setState(parsed)
      }
    } catch (e) {
      console.error('Failed to load pet collection:', e)
    }
    setMounted(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (e) {
        console.error('Failed to save pet collection:', e)
      }
    }
  }, [state, mounted])

  // Get a pet definition by ID
  const getPetDefinition = useCallback((petId: string): PetDefinition | undefined => {
    return ALL_PETS.find(p => p.id === petId)
  }, [])

  // Check if player owns a specific pet
  const ownsPet = useCallback((petId: string): boolean => {
    return state.pets.some(p => p.petId === petId)
  }, [state.pets])

  // Get owned pet by ID
  const getOwnedPet = useCallback((petId: string): OwnedPet | undefined => {
    return state.pets.find(p => p.petId === petId)
  }, [state.pets])

  // Add a new pet to collection
  const addPet = useCallback((petId: string, nickname?: string): boolean => {
    const definition = getPetDefinition(petId)
    if (!definition || ownsPet(petId)) return false

    const newPet: OwnedPet = {
      petId,
      nickname: nickname || definition.name,
      level: 1,
      xp: 0,
      happiness: 100,
      lastFed: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      obtainedAt: new Date().toISOString(),
      isCompanion: false
    }

    setState(prev => ({
      ...prev,
      pets: [...prev.pets, newPet],
      totalPetsCollected: prev.totalPetsCollected + 1
    }))

    setNewlyObtained(definition)
    return true
  }, [getPetDefinition, ownsPet])

  // Award a random pet based on rarity weights
  const awardRandomPet = useCallback((source: 'game' | 'reading' | 'daily'): PetDefinition | null => {
    // Filter pets that can be obtained and aren't already owned
    const availablePets = ALL_PETS.filter(p => 
      !ownsPet(p.id) && 
      (p.unlockMethod === source || p.unlockMethod === 'game')
    )

    if (availablePets.length === 0) return null

    // Calculate total weight
    const totalWeight = availablePets.reduce((sum, pet) => {
      return sum + RARITY_CONFIG[pet.rarity].dropChance
    }, 0)

    // Random selection based on weights
    let random = Math.random() * totalWeight
    for (const pet of availablePets) {
      random -= RARITY_CONFIG[pet.rarity].dropChance
      if (random <= 0) {
        addPet(pet.id)
        return pet
      }
    }

    // Fallback to first available
    const fallbackPet = availablePets[0]
    addPet(fallbackPet.id)
    return fallbackPet
  }, [ownsPet, addPet])

  // Feed a pet (increases happiness and gives XP)
  const feedPet = useCallback((petId: string): { success: boolean; xpGained: number; leveledUp: boolean } => {
    const pet = getOwnedPet(petId)
    const definition = getPetDefinition(petId)
    if (!pet || !definition) return { success: false, xpGained: 0, leveledUp: false }

    // Can only feed once every 30 minutes
    const lastFed = new Date(pet.lastFed)
    const now = new Date()
    const minutesSinceFed = (now.getTime() - lastFed.getTime()) / (1000 * 60)
    if (minutesSinceFed < 30) return { success: false, xpGained: 0, leveledUp: false }

    const xpGained = Math.floor(20 * RARITY_CONFIG[definition.rarity].xpMultiplier)
    const newXp = pet.xp + xpGained
    const xpNeeded = getXpForLevel(pet.level)
    const leveledUp = newXp >= xpNeeded

    setState(prev => {
      const updatedPets = prev.pets.map(p => {
        if (p.petId !== petId) return p
        
        const finalXp = leveledUp ? newXp - xpNeeded : newXp
        const finalLevel = leveledUp ? p.level + 1 : p.level
        
        return {
          ...p,
          xp: finalXp,
          level: finalLevel,
          happiness: Math.min(100, p.happiness + 15),
          lastFed: now.toISOString()
        }
      })

      return {
        ...prev,
        pets: updatedPets,
        stats: {
          ...prev.stats,
          totalFeedings: prev.stats.totalFeedings + 1,
          highestLevel: Math.max(prev.stats.highestLevel, leveledUp ? pet.level + 1 : pet.level)
        }
      }
    })

    return { success: true, xpGained, leveledUp }
  }, [getOwnedPet, getPetDefinition])

  // Play with a pet (increases happiness and gives XP)
  const playWithPet = useCallback((petId: string): { success: boolean; xpGained: number; leveledUp: boolean } => {
    const pet = getOwnedPet(petId)
    const definition = getPetDefinition(petId)
    if (!pet || !definition) return { success: false, xpGained: 0, leveledUp: false }

    // Can only play once every 15 minutes
    const lastPlayed = new Date(pet.lastPlayed)
    const now = new Date()
    const minutesSincePlayed = (now.getTime() - lastPlayed.getTime()) / (1000 * 60)
    if (minutesSincePlayed < 15) return { success: false, xpGained: 0, leveledUp: false }

    const xpGained = Math.floor(15 * RARITY_CONFIG[definition.rarity].xpMultiplier)
    const newXp = pet.xp + xpGained
    const xpNeeded = getXpForLevel(pet.level)
    const leveledUp = newXp >= xpNeeded

    setState(prev => {
      const updatedPets = prev.pets.map(p => {
        if (p.petId !== petId) return p
        
        const finalXp = leveledUp ? newXp - xpNeeded : newXp
        const finalLevel = leveledUp ? p.level + 1 : p.level
        
        return {
          ...p,
          xp: finalXp,
          level: finalLevel,
          happiness: Math.min(100, p.happiness + 10),
          lastPlayed: now.toISOString()
        }
      })

      return {
        ...prev,
        pets: updatedPets,
        stats: {
          ...prev.stats,
          totalPlaySessions: prev.stats.totalPlaySessions + 1,
          highestLevel: Math.max(prev.stats.highestLevel, leveledUp ? pet.level + 1 : pet.level)
        }
      }
    })

    return { success: true, xpGained, leveledUp }
  }, [getOwnedPet, getPetDefinition])

  // Set a pet as companion (follows you on site)
  const setCompanion = useCallback((petId: string | null) => {
    setState(prev => {
      const updatedPets = prev.pets.map(p => ({
        ...p,
        isCompanion: p.petId === petId
      }))

      return {
        ...prev,
        pets: updatedPets,
        companionId: petId
      }
    })
  }, [])

  // Rename a pet
  const renamePet = useCallback((petId: string, newNickname: string) => {
    setState(prev => ({
      ...prev,
      pets: prev.pets.map(p => 
        p.petId === petId 
          ? { ...p, nickname: newNickname.trim() || getPetDefinition(petId)?.name || 'Pet' }
          : p
      )
    }))
  }, [getPetDefinition])

  // Get all owned pets with current happiness
  const getAllPetsWithStatus = useMemo(() => {
    return state.pets.map(pet => {
      const currentHappiness = calculateHappiness(
        Math.max(new Date(pet.lastFed).getTime(), new Date(pet.lastPlayed).getTime()) > 0 
          ? (new Date(pet.lastFed) > new Date(pet.lastPlayed) ? pet.lastFed : pet.lastPlayed)
          : pet.obtainedAt,
        pet.happiness
      )
      
      const definition = getPetDefinition(pet.petId)
      
      return {
        ...pet,
        currentHappiness,
        definition,
        xpToNextLevel: getXpForLevel(pet.level),
        xpProgress: Math.round((pet.xp / getXpForLevel(pet.level)) * 100)
      }
    })
  }, [state.pets, getPetDefinition])

  // Get companion pet
  const companion = useMemo(() => {
    if (!state.companionId) return null
    return getAllPetsWithStatus.find(p => p.petId === state.companionId) || null
  }, [state.companionId, getAllPetsWithStatus])

  // Get collection stats
  const collectionStats = useMemo(() => {
    const totalPossible = ALL_PETS.length
    const owned = state.pets.length
    const byRarity = {
      common: state.pets.filter(p => getPetDefinition(p.petId)?.rarity === 'common').length,
      uncommon: state.pets.filter(p => getPetDefinition(p.petId)?.rarity === 'uncommon').length,
      rare: state.pets.filter(p => getPetDefinition(p.petId)?.rarity === 'rare').length,
      epic: state.pets.filter(p => getPetDefinition(p.petId)?.rarity === 'epic').length,
      legendary: state.pets.filter(p => getPetDefinition(p.petId)?.rarity === 'legendary').length
    }
    const bySpecies = {
      cat: state.pets.filter(p => getPetDefinition(p.petId)?.species === 'cat').length,
      dog: state.pets.filter(p => getPetDefinition(p.petId)?.species === 'dog').length,
      dragon: state.pets.filter(p => getPetDefinition(p.petId)?.species === 'dragon').length,
      unicorn: state.pets.filter(p => getPetDefinition(p.petId)?.species === 'unicorn').length,
      bunny: state.pets.filter(p => getPetDefinition(p.petId)?.species === 'bunny').length,
      fox: state.pets.filter(p => getPetDefinition(p.petId)?.species === 'fox').length,
      owl: state.pets.filter(p => getPetDefinition(p.petId)?.species === 'owl').length,
      phoenix: state.pets.filter(p => getPetDefinition(p.petId)?.species === 'phoenix').length
    }
    
    return {
      owned,
      totalPossible,
      percentage: Math.round((owned / totalPossible) * 100),
      byRarity,
      bySpecies,
      totalLevels: state.pets.reduce((sum, p) => sum + p.level, 0),
      highestLevel: state.stats.highestLevel
    }
  }, [state.pets, state.stats, getPetDefinition])

  // Clear newly obtained pet notification
  const clearNewlyObtained = useCallback(() => {
    setNewlyObtained(null)
  }, [])

  // Reset collection (for testing)
  const resetCollection = useCallback(() => {
    setState(DEFAULT_STATE)
    setNewlyObtained(null)
  }, [])

  return {
    // State
    mounted,
    pets: getAllPetsWithStatus,
    companion,
    newlyObtained,
    stats: state.stats,
    collectionStats,
    
    // Pet management
    getPetDefinition,
    getOwnedPet,
    ownsPet,
    addPet,
    awardRandomPet,
    renamePet,
    
    // Pet interactions
    feedPet,
    playWithPet,
    setCompanion,
    
    // Utilities
    clearNewlyObtained,
    resetCollection,
    
    // Constants
    allPets: ALL_PETS,
    rarityConfig: RARITY_CONFIG
  }
}

export type UsePetCollectionReturn = ReturnType<typeof usePetCollection>

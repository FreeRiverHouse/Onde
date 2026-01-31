'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'onde-user-collections'

export type CollectionItemType = 'book' | 'game'

export interface CollectionItem {
  id: string
  type: CollectionItemType
  addedAt: string
  // Cached data for display
  title: string
  emoji?: string
  coverImage?: string
}

export interface Collection {
  id: string
  name: string
  description?: string
  emoji?: string
  color: string
  items: CollectionItem[]
  createdAt: string
  updatedAt: string
  isPublic: boolean
  shareId?: string
}

interface CollectionsState {
  collections: Collection[]
  version: number
}

const PRESET_COLORS = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-red-500',
  'from-amber-500 to-yellow-500',
  'from-indigo-500 to-purple-500',
  'from-rose-500 to-pink-500',
  'from-teal-500 to-green-500',
]

const PRESET_EMOJIS = ['📚', '⭐', '❤️', '🎮', '🌟', '📖', '🎯', '💎', '🔥', '✨', '🏆', '🎨']

function generateId(): string {
  return `col_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function generateShareId(): string {
  return Math.random().toString(36).substring(2, 10)
}

export function useCollections() {
  const [state, setState] = useState<CollectionsState>({ collections: [], version: 1 })
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as CollectionsState
        setState(parsed)
      }
    } catch (e) {
      console.error('Failed to load collections:', e)
    }
  }, [])

  // Save to localStorage when state changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (e) {
        console.error('Failed to save collections:', e)
      }
    }
  }, [state, mounted])

  // Create a new collection
  const createCollection = useCallback((
    name: string,
    options?: { description?: string; emoji?: string; color?: string }
  ): Collection => {
    const now = new Date().toISOString()
    const newCollection: Collection = {
      id: generateId(),
      name,
      description: options?.description,
      emoji: options?.emoji || PRESET_EMOJIS[Math.floor(Math.random() * PRESET_EMOJIS.length)],
      color: options?.color || PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
      items: [],
      createdAt: now,
      updatedAt: now,
      isPublic: false,
    }

    setState(prev => ({
      ...prev,
      collections: [...prev.collections, newCollection]
    }))

    return newCollection
  }, [])

  // Delete a collection
  const deleteCollection = useCallback((collectionId: string) => {
    setState(prev => ({
      ...prev,
      collections: prev.collections.filter(c => c.id !== collectionId)
    }))
  }, [])

  // Rename a collection
  const renameCollection = useCallback((collectionId: string, newName: string) => {
    setState(prev => ({
      ...prev,
      collections: prev.collections.map(c =>
        c.id === collectionId
          ? { ...c, name: newName, updatedAt: new Date().toISOString() }
          : c
      )
    }))
  }, [])

  // Update collection properties
  const updateCollection = useCallback((
    collectionId: string,
    updates: Partial<Pick<Collection, 'name' | 'description' | 'emoji' | 'color'>>
  ) => {
    setState(prev => ({
      ...prev,
      collections: prev.collections.map(c =>
        c.id === collectionId
          ? { ...c, ...updates, updatedAt: new Date().toISOString() }
          : c
      )
    }))
  }, [])

  // Add item to collection
  const addToCollection = useCallback((
    collectionId: string,
    item: { id: string; type: CollectionItemType; title: string; emoji?: string; coverImage?: string }
  ) => {
    setState(prev => ({
      ...prev,
      collections: prev.collections.map(c => {
        if (c.id !== collectionId) return c
        // Don't add duplicates
        if (c.items.some(i => i.id === item.id && i.type === item.type)) return c
        return {
          ...c,
          items: [...c.items, { ...item, addedAt: new Date().toISOString() }],
          updatedAt: new Date().toISOString()
        }
      })
    }))
  }, [])

  // Remove item from collection
  const removeFromCollection = useCallback((collectionId: string, itemId: string, itemType: CollectionItemType) => {
    setState(prev => ({
      ...prev,
      collections: prev.collections.map(c => {
        if (c.id !== collectionId) return c
        return {
          ...c,
          items: c.items.filter(i => !(i.id === itemId && i.type === itemType)),
          updatedAt: new Date().toISOString()
        }
      })
    }))
  }, [])

  // Reorder items in collection (drag-drop)
  const reorderItems = useCallback((collectionId: string, fromIndex: number, toIndex: number) => {
    setState(prev => ({
      ...prev,
      collections: prev.collections.map(c => {
        if (c.id !== collectionId) return c
        const newItems = [...c.items]
        const [removed] = newItems.splice(fromIndex, 1)
        newItems.splice(toIndex, 0, removed)
        return {
          ...c,
          items: newItems,
          updatedAt: new Date().toISOString()
        }
      })
    }))
  }, [])

  // Generate share link for collection
  const shareCollection = useCallback((collectionId: string): string | null => {
    let shareId: string | null = null
    
    setState(prev => {
      const collection = prev.collections.find(c => c.id === collectionId)
      if (!collection) return prev

      shareId = collection.shareId || generateShareId()
      
      return {
        ...prev,
        collections: prev.collections.map(c =>
          c.id === collectionId
            ? { ...c, isPublic: true, shareId, updatedAt: new Date().toISOString() }
            : c
        )
      }
    })

    if (typeof window !== 'undefined' && shareId) {
      return `${window.location.origin}/collections/shared/${shareId}`
    }
    return null
  }, [])

  // Unshare collection
  const unshareCollection = useCallback((collectionId: string) => {
    setState(prev => ({
      ...prev,
      collections: prev.collections.map(c =>
        c.id === collectionId
          ? { ...c, isPublic: false, updatedAt: new Date().toISOString() }
          : c
      )
    }))
  }, [])

  // Check if item is in any collection
  const isInCollection = useCallback((itemId: string, itemType: CollectionItemType, collectionId?: string): boolean => {
    if (collectionId) {
      const collection = state.collections.find(c => c.id === collectionId)
      return collection?.items.some(i => i.id === itemId && i.type === itemType) ?? false
    }
    return state.collections.some(c => c.items.some(i => i.id === itemId && i.type === itemType))
  }, [state.collections])

  // Get collections containing a specific item
  const getCollectionsForItem = useCallback((itemId: string, itemType: CollectionItemType): Collection[] => {
    return state.collections.filter(c => c.items.some(i => i.id === itemId && i.type === itemType))
  }, [state.collections])

  // Get collection by ID
  const getCollection = useCallback((collectionId: string): Collection | undefined => {
    return state.collections.find(c => c.id === collectionId)
  }, [state.collections])

  // Get collection by share ID
  const getSharedCollection = useCallback((shareId: string): Collection | undefined => {
    return state.collections.find(c => c.shareId === shareId && c.isPublic)
  }, [state.collections])

  // Get cover images for collection (first 4 items)
  const getCollectionCovers = useCallback((collectionId: string): (string | undefined)[] => {
    const collection = state.collections.find(c => c.id === collectionId)
    if (!collection) return []
    return collection.items.slice(0, 4).map(item => item.coverImage || item.emoji)
  }, [state.collections])

  // Duplicate a collection
  const duplicateCollection = useCallback((collectionId: string): Collection | null => {
    const source = state.collections.find(c => c.id === collectionId)
    if (!source) return null

    const now = new Date().toISOString()
    const newCollection: Collection = {
      ...source,
      id: generateId(),
      name: `${source.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
      isPublic: false,
      shareId: undefined,
    }

    setState(prev => ({
      ...prev,
      collections: [...prev.collections, newCollection]
    }))

    return newCollection
  }, [state.collections])

  // Import collection from shared data
  const importCollection = useCallback((collectionData: Omit<Collection, 'id' | 'createdAt' | 'updatedAt' | 'isPublic' | 'shareId'>): Collection => {
    const now = new Date().toISOString()
    const newCollection: Collection = {
      ...collectionData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      isPublic: false,
    }

    setState(prev => ({
      ...prev,
      collections: [...prev.collections, newCollection]
    }))

    return newCollection
  }, [])

  return {
    collections: state.collections,
    mounted,
    // CRUD
    createCollection,
    deleteCollection,
    renameCollection,
    updateCollection,
    duplicateCollection,
    // Items
    addToCollection,
    removeFromCollection,
    reorderItems,
    // Sharing
    shareCollection,
    unshareCollection,
    getSharedCollection,
    importCollection,
    // Queries
    isInCollection,
    getCollectionsForItem,
    getCollection,
    getCollectionCovers,
    // Constants
    PRESET_COLORS,
    PRESET_EMOJIS,
  }
}

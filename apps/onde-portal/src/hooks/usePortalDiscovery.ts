'use client'

import { useState, useEffect, useCallback } from 'react'

// Portal types and destinations
export type PortalType = 'book' | 'game' | 'secret' | 'easter-egg'
export type WorldType = 'gaming-island' | 'library' | 'secret-realm' | 'void'

export interface Portal {
  id: string
  name: string
  type: PortalType
  from: WorldType
  to: WorldType
  description: string
  isSecret: boolean
  discoveredAt?: number
  useCount: number
}

export interface PortalDiscoveryState {
  discoveredPortals: Record<string, Portal>
  totalUses: number
  lastUsedPortal: string | null
  secretsFound: number
  achievementUnlocked: boolean
}

const STORAGE_KEY = 'onde-portal-discovery'

const PREDEFINED_PORTALS: Record<string, Omit<Portal, 'discoveredAt' | 'useCount'>> = {
  'gaming-to-library': {
    id: 'gaming-to-library',
    name: 'The Book Portal',
    type: 'book',
    from: 'gaming-island',
    to: 'library',
    description: 'A shimmering portal adorned with floating books and golden letters',
    isSecret: false,
  },
  'library-to-gaming': {
    id: 'library-to-gaming',
    name: 'The Game Portal',
    type: 'game',
    from: 'library',
    to: 'gaming-island',
    description: 'A vibrant portal crackling with pixelated energy and game sprites',
    isSecret: false,
  },
  'game-hopper': {
    id: 'game-hopper',
    name: 'Dimension Hopper',
    type: 'game',
    from: 'gaming-island',
    to: 'gaming-island',
    description: 'A chaotic portal that teleports you to a random game',
    isSecret: false,
  },
  'moonlight-secret': {
    id: 'moonlight-secret',
    name: 'Moonlit Passage',
    type: 'easter-egg',
    from: 'gaming-island',
    to: 'secret-realm',
    description: 'A hidden portal that only appears under the moonlight...',
    isSecret: true,
  },
  'void-gateway': {
    id: 'void-gateway',
    name: 'The Void Gate',
    type: 'secret',
    from: 'library',
    to: 'void',
    description: 'A mysterious dark portal hidden between the bookshelves',
    isSecret: true,
  },
  'rainbow-bridge': {
    id: 'rainbow-bridge',
    name: 'Rainbow Bridge',
    type: 'easter-egg',
    from: 'gaming-island',
    to: 'library',
    description: 'A colorful portal that appears when you collect all colors',
    isSecret: true,
  },
}

const getDefaultState = (): PortalDiscoveryState => ({
  discoveredPortals: {},
  totalUses: 0,
  lastUsedPortal: null,
  secretsFound: 0,
  achievementUnlocked: false,
})

export function usePortalDiscovery() {
  const [state, setState] = useState<PortalDiscoveryState>(getDefaultState())
  const [mounted, setMounted] = useState(false)

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setState(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load portal discovery state:', error)
    }
    setMounted(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (error) {
        console.error('Failed to save portal discovery state:', error)
      }
    }
  }, [state, mounted])

  // Discover a new portal
  const discoverPortal = useCallback((portalId: string) => {
    const portalDef = PREDEFINED_PORTALS[portalId]
    if (!portalDef) return null

    setState((prev) => {
      if (prev.discoveredPortals[portalId]) {
        return prev
      }

      const portal: Portal = {
        ...portalDef,
        discoveredAt: Date.now(),
        useCount: 0,
      }

      const newSecrets = portalDef.isSecret ? prev.secretsFound + 1 : prev.secretsFound
      const allSecretsFound = newSecrets >= 3 // 3 secret portals

      return {
        ...prev,
        discoveredPortals: {
          ...prev.discoveredPortals,
          [portalId]: portal,
        },
        secretsFound: newSecrets,
        achievementUnlocked: prev.achievementUnlocked || allSecretsFound,
      }
    })

    return portalDef
  }, [])

  // Use a portal (track usage)
  const usePortal = useCallback((portalId: string) => {
    setState((prev) => {
      const portal = prev.discoveredPortals[portalId]
      if (!portal) {
        // Auto-discover if not found
        const portalDef = PREDEFINED_PORTALS[portalId]
        if (!portalDef) return prev

        return {
          ...prev,
          discoveredPortals: {
            ...prev.discoveredPortals,
            [portalId]: {
              ...portalDef,
              discoveredAt: Date.now(),
              useCount: 1,
            },
          },
          totalUses: prev.totalUses + 1,
          lastUsedPortal: portalId,
          secretsFound: portalDef.isSecret ? prev.secretsFound + 1 : prev.secretsFound,
        }
      }

      return {
        ...prev,
        discoveredPortals: {
          ...prev.discoveredPortals,
          [portalId]: {
            ...portal,
            useCount: portal.useCount + 1,
          },
        },
        totalUses: prev.totalUses + 1,
        lastUsedPortal: portalId,
      }
    })
  }, [])

  // Check if portal is discovered
  const isPortalDiscovered = useCallback(
    (portalId: string) => {
      return !!state.discoveredPortals[portalId]
    },
    [state.discoveredPortals]
  )

  // Get portal info
  const getPortal = useCallback(
    (portalId: string): Portal | null => {
      return state.discoveredPortals[portalId] || null
    },
    [state.discoveredPortals]
  )

  // Get all discovered portals
  const getDiscoveredPortals = useCallback(() => {
    return Object.values(state.discoveredPortals)
  }, [state.discoveredPortals])

  // Get discovery stats
  const getStats = useCallback(() => {
    const total = Object.keys(PREDEFINED_PORTALS).length
    const discovered = Object.keys(state.discoveredPortals).length
    const secrets = state.secretsFound
    const totalSecrets = Object.values(PREDEFINED_PORTALS).filter((p) => p.isSecret).length

    return {
      discovered,
      total,
      percentage: Math.round((discovered / total) * 100),
      secrets,
      totalSecrets,
      totalUses: state.totalUses,
      achievementUnlocked: state.achievementUnlocked,
    }
  }, [state])

  // Get random undiscovered portal hint
  const getHint = useCallback(() => {
    const undiscovered = Object.values(PREDEFINED_PORTALS).filter(
      (p) => !state.discoveredPortals[p.id] && !p.isSecret
    )
    if (undiscovered.length === 0) return null
    return undiscovered[Math.floor(Math.random() * undiscovered.length)]
  }, [state.discoveredPortals])

  // Reset all progress
  const reset = useCallback(() => {
    setState(getDefaultState())
  }, [])

  return {
    mounted,
    discoveredPortals: state.discoveredPortals,
    discoverPortal,
    usePortal,
    isPortalDiscovered,
    getPortal,
    getDiscoveredPortals,
    getStats,
    getHint,
    reset,
    lastUsedPortal: state.lastUsedPortal,
    achievementUnlocked: state.achievementUnlocked,
  }
}

export { PREDEFINED_PORTALS }

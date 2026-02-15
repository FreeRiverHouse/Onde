'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ============================================
// Config
// ============================================

const STORAGE_KEY_NICKNAME = 'onde-player-nickname'
const STORAGE_KEY_PLAYER_ID = 'onde-player-id'
const LEGACY_STORAGE_KEY = 'onde-player-name'  // Old key for migration

const API_BASE = 'https://onde.surf/api/players'

// Sync interval: 5 minutes
const SYNC_INTERVAL_MS = 5 * 60 * 1000

// ============================================
// Types
// ============================================

interface RegisterResponse {
  ok: boolean
  playerId?: string
  nickname?: string
  error?: string
}

interface SyncResponse {
  ok: boolean
  player?: {
    nickname: string
    xp: number
    level: number
    coins: number
    gamesPlayed: number
    lastSyncAt: string
  }
  error?: string
}

// ============================================
// Hook
// ============================================

/**
 * Global player name hook with server registration.
 * 
 * - Stores nickname + playerId in localStorage
 * - Registers nickname on onde.surf for uniqueness
 * - Periodically syncs local progress to server
 * - Migrates from old 'onde-player-name' key
 */
export function usePlayerName() {
  const [name, setNameState] = useState<string>('')
  const [playerId, setPlayerIdState] = useState<string>('')
  const [mounted, setMounted] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerError, setRegisterError] = useState<string>('')
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load from localStorage (with legacy migration)
  useEffect(() => {
    try {
      let storedNickname = localStorage.getItem(STORAGE_KEY_NICKNAME)
      const storedPlayerId = localStorage.getItem(STORAGE_KEY_PLAYER_ID)

      // Migrate from old key if needed
      if (!storedNickname) {
        const legacyName = localStorage.getItem(LEGACY_STORAGE_KEY)
        if (legacyName) {
          storedNickname = legacyName
          localStorage.setItem(STORAGE_KEY_NICKNAME, legacyName)
          // Don't remove legacy key — other hooks may still read it
        }
      }

      if (storedNickname) setNameState(storedNickname)
      if (storedPlayerId) setPlayerIdState(storedPlayerId)
    } catch {
      // SSR or storage not available
    }
    setMounted(true)
  }, [])

  // Setup periodic sync
  useEffect(() => {
    if (!mounted || !name || !playerId) return

    // Initial sync on mount
    syncToServer(name)

    // Periodic sync
    syncTimerRef.current = setInterval(() => {
      syncToServer(name)
    }, SYNC_INTERVAL_MS)

    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, name, playerId])

  /**
   * Sync local progress to server
   */
  const syncToServer = useCallback(async (nickname: string) => {
    if (!nickname) return

    try {
      // Read current local state
      const levelData = localStorage.getItem('onde-player-level')
      const coinData = localStorage.getItem('onde-coins')

      let xp = 0, level = 1, coins = 0, gamesPlayed = 0

      if (levelData) {
        const parsed = JSON.parse(levelData)
        xp = parsed.totalXp || 0
        level = parsed.level || 1
      }

      if (coinData) {
        const parsed = JSON.parse(coinData)
        coins = parsed.balance || 0
      }

      // Count games played from leaderboard
      const leaderboardData = localStorage.getItem('onde-global-leaderboard')
      if (leaderboardData) {
        const entries = JSON.parse(leaderboardData)
        gamesPlayed = Array.isArray(entries) ? entries.length : 0
      }

      await fetch(`${API_BASE}/${encodeURIComponent(nickname)}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp, coins, level, gamesPlayed }),
      })
    } catch {
      // Silent fail — sync is best-effort
    }
  }, [])

  /**
   * Set name locally only (backwards compatible)
   */
  const setName = useCallback((newName: string) => {
    const trimmed = newName.trim().substring(0, 20)
    setNameState(trimmed)
    try {
      if (trimmed) {
        localStorage.setItem(STORAGE_KEY_NICKNAME, trimmed)
        // Also write to legacy key for backwards compat
        localStorage.setItem(LEGACY_STORAGE_KEY, trimmed)
      } else {
        localStorage.removeItem(STORAGE_KEY_NICKNAME)
        localStorage.removeItem(LEGACY_STORAGE_KEY)
        localStorage.removeItem(STORAGE_KEY_PLAYER_ID)
        setPlayerIdState('')
      }
    } catch {
      // Storage not available
    }
  }, [])

  /**
   * Register nickname on server for uniqueness
   * Returns true if successful, false if taken or error
   */
  const register = useCallback(async (nickname: string): Promise<boolean> => {
    const trimmed = nickname.trim()
    if (!trimmed || trimmed.length < 3 || trimmed.length > 20) {
      setRegisterError('Nickname must be 3-20 characters')
      return false
    }

    // Basic local validation
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setRegisterError('Only letters, numbers, underscore and dash allowed')
      return false
    }

    setIsRegistering(true)
    setRegisterError('')

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: trimmed }),
      })

      const data: RegisterResponse = await res.json()

      if (data.ok && data.playerId && data.nickname) {
        // Save to localStorage
        setNameState(data.nickname)
        setPlayerIdState(data.playerId)
        localStorage.setItem(STORAGE_KEY_NICKNAME, data.nickname)
        localStorage.setItem(STORAGE_KEY_PLAYER_ID, data.playerId)
        // Also write to legacy key for backwards compat
        localStorage.setItem(LEGACY_STORAGE_KEY, data.nickname)
        setIsRegistering(false)
        return true
      } else {
        setRegisterError(data.error || 'Registration failed')
        setIsRegistering(false)
        return false
      }
    } catch {
      setRegisterError('Network error — try again')
      setIsRegistering(false)
      return false
    }
  }, [])

  /**
   * Force sync now
   */
  const sync = useCallback(() => {
    if (name) syncToServer(name)
  }, [name, syncToServer])

  return {
    // State
    name,
    playerId,
    mounted,
    hasName: mounted && name.length > 0,
    isRegistered: mounted && name.length > 0 && playerId.length > 0,

    // Registration
    register,
    isRegistering,
    registerError,

    // Legacy compatibility
    setName,

    // Sync
    sync,
  }
}

export default usePlayerName

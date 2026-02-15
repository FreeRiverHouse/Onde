'use client'

import { useCallback, useRef } from 'react'
import { usePlayerLevel } from './usePlayerLevel'
import { useCoins } from './useCoins'
import { useRecentlyPlayed } from './useRecentlyPlayed'
import { trackGameWin as analyticsTrackWin } from './useAnalytics'

/**
 * Unified game rewards hook.
 * Combines XP (usePlayerLevel), Coins (useCoins), and recently-played tracking.
 *
 * Usage:
 *   const rewards = useGameRewards({ gameId: 'quiz', title: 'Quiz', emoji: '❓' })
 *   rewards.trackPlay()     // Call on game start → 20 XP + 5 coins
 *   rewards.trackWin()      // Call on win → 40 XP + 25 coins
 *   rewards.trackPerfect()  // Call on perfect game → 75 XP + 50 coins
 */

export interface GameRewardsConfig {
  gameId: string
  title: string
  emoji: string
}

export function useGameRewards({ gameId, title, emoji }: GameRewardsConfig) {
  const { awardXP, levelInfo, pendingLevelUp, showConfetti, clearLevelUp, streakDays } = usePlayerLevel()
  const { earnCoins, balance } = useCoins()
  const { addGame } = useRecentlyPlayed()
  const trackedPlay = useRef(false)

  /** Track game play (call once per session). Awards 20 XP + 5 coins. */
  const trackPlay = useCallback(() => {
    if (trackedPlay.current) return
    trackedPlay.current = true
    addGame({ id: gameId, title, emoji, href: `/games/${gameId}/` })
    awardXP('game_played', { description: `Played ${title}`, metadata: { gameId } })
    earnCoins('game_play', undefined, `Played ${title}`)
  }, [gameId, title, emoji, addGame, awardXP, earnCoins])

  /** Track game win. Awards 40 XP + 25 coins. */
  const trackWin = useCallback(() => {
    awardXP('game_won', { description: `Won ${title}`, metadata: { gameId } })
    earnCoins('game_win', undefined, `Won ${title}`)
    analyticsTrackWin(title)
  }, [gameId, title, awardXP, earnCoins])

  /** Track perfect game. Awards 75 XP + 50 coins. */
  const trackPerfect = useCallback(() => {
    awardXP('perfect_game', { description: `Perfect game in ${title}!`, metadata: { gameId } })
    earnCoins('game_win', 50, `Perfect ${title}!`)
  }, [gameId, title, awardXP, earnCoins])

  return {
    // Actions
    trackPlay,
    trackWin,
    trackPerfect,

    // XP State (for display)
    levelInfo,
    pendingLevelUp,
    showConfetti,
    clearLevelUp,
    streakDays,

    // Coin state
    coinBalance: balance,
  }
}

export type UseGameRewardsReturn = ReturnType<typeof useGameRewards>
export default useGameRewards

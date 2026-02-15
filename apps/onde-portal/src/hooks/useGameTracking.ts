'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

// ── Types ──────────────────────────────────────────────────────

interface GameTrackingOptions {
  gameId: string;
  gameName: string;
}

interface PlayerStats {
  gamesPlayed: number;
  firstVisit: string; // ISO date
  lastVisit: string; // ISO date
  gameHistory: Record<string, number>; // gameId → play count
}

interface UseGameTrackingReturn {
  /** Call when a game round ends (win/loss/completion) */
  trackGameEnd: (result: 'win' | 'loss' | 'complete', score?: number) => void;
  /** Call when a meaningful score event occurs */
  trackScore: (score: number, metadata?: Record<string, string | number>) => void;
  /** Player stats from localStorage */
  playerStats: PlayerStats | null;
  /** Session duration in seconds (updated on end) */
  sessionDuration: number;
  /** Whether this is a returning player */
  isReturningPlayer: boolean;
}

// ── Helpers ────────────────────────────────────────────────────

const STORAGE_KEY = 'onde-player-stats';

function getPlayerStats(): PlayerStats | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PlayerStats;
  } catch {
    return null;
  }
}

function savePlayerStats(stats: PlayerStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

function fireGtagEvent(
  eventName: string,
  params: Record<string, string | number>
): void {
  try {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', eventName, params);
    }
  } catch {
    // Never break the app for analytics
  }
}

// ── Hook ───────────────────────────────────────────────────────

/**
 * Game-specific analytics tracking hook.
 *
 * Fires gtag events (game_start, game_end, game_score) and
 * maintains player stats in localStorage for return-visit tracking.
 *
 * Usage:
 * ```tsx
 * const { trackGameEnd, trackScore, playerStats, isReturningPlayer } = useGameTracking({
 *   gameId: 'wordle',
 *   gameName: 'Wordle',
 * });
 * ```
 */
export function useGameTracking({
  gameId,
  gameName,
}: GameTrackingOptions): UseGameTrackingReturn {
  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedStart = useRef(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [isReturningPlayer, setIsReturningPlayer] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  // ── On mount: update localStorage + fire game_start ──
  useEffect(() => {
    if (hasTrackedStart.current) return;
    hasTrackedStart.current = true;
    startTimeRef.current = Date.now();

    const now = new Date().toISOString();
    const existing = getPlayerStats();

    const updated: PlayerStats = existing
      ? {
          ...existing,
          gamesPlayed: existing.gamesPlayed + 1,
          lastVisit: now,
          gameHistory: {
            ...existing.gameHistory,
            [gameId]: (existing.gameHistory[gameId] || 0) + 1,
          },
        }
      : {
          gamesPlayed: 1,
          firstVisit: now,
          lastVisit: now,
          gameHistory: { [gameId]: 1 },
        };

    savePlayerStats(updated);
    setPlayerStats(updated);
    setIsReturningPlayer(!!existing && existing.gamesPlayed > 0);

    // Fire gtag event
    fireGtagEvent('game_start', {
      game_id: gameId,
      game_name: gameName,
      games_played_total: updated.gamesPlayed,
      game_play_count: updated.gameHistory[gameId] || 1,
      is_returning: existing ? 'yes' : 'no',
    });

    // Track session duration on page leave
    const handleUnload = () => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      fireGtagEvent('game_session_duration', {
        game_id: gameId,
        game_name: gameName,
        duration_seconds: duration,
      });
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      handleUnload();
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [gameId, gameName]);

  // ── trackGameEnd ──
  const trackGameEnd = useCallback(
    (result: 'win' | 'loss' | 'complete', score?: number) => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      setSessionDuration(duration);

      fireGtagEvent('game_end', {
        game_id: gameId,
        game_name: gameName,
        result,
        duration_seconds: duration,
        ...(score !== undefined ? { score } : {}),
      });
    },
    [gameId, gameName]
  );

  // ── trackScore ──
  const trackScore = useCallback(
    (score: number, metadata?: Record<string, string | number>) => {
      fireGtagEvent('game_score', {
        game_id: gameId,
        game_name: gameName,
        score,
        ...(metadata || {}),
      });
    },
    [gameId, gameName]
  );

  return {
    trackGameEnd,
    trackScore,
    playerStats,
    sessionDuration,
    isReturningPlayer,
  };
}

export default useGameTracking;

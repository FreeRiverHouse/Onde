'use client';

import { ReactNode, Suspense, createContext, useContext, useEffect, useState } from 'react';
import { GameErrorBoundary } from '@/components/ErrorBoundary';
import { useGameRewards, type UseGameRewardsReturn } from '@/hooks/useGameRewards';
import { trackGamePlay, trackGameWin } from '@/hooks/useAnalytics';
import { useGameTracking } from '@/hooks/useGameTracking';
import XPNotification from './XPNotification';

// ── Extended context with game tracking ────────────────────────

interface GameContextValue extends UseGameRewardsReturn {
  /** Fire a game_end event with result and optional score */
  trackGameEnd: (result: 'win' | 'loss' | 'complete', score?: number) => void;
  /** Fire a game_score event */
  trackScore: (score: number, metadata?: Record<string, string | number>) => void;
}

const GameRewardsContext = createContext<GameContextValue | null>(null);

/**
 * Access game rewards + tracking from any child inside GameWrapper.
 *
 * ```tsx
 * const { trackWin, trackPerfect, trackGameEnd, trackScore } = useGameContext();
 * ```
 */
export function useGameContext(): GameContextValue {
  const ctx = useContext(GameRewardsContext);
  if (!ctx) throw new Error('useGameContext must be used inside GameWrapper');
  return ctx;
}

interface GameWrapperProps {
  children: ReactNode;
  gameName: string;
  gameId: string;
  emoji?: string;
  loading?: ReactNode;
  /** Set false to skip auto-awarding "game_played" XP on mount (default true) */
  autoTrackPlay?: boolean;
}

/**
 * GameWrapper provides:
 * - Error boundary + Suspense loading
 * - Automatic XP + Coin tracking on mount (game_played)
 * - Game analytics tracking (gtag events + localStorage stats)
 * - "Welcome back" banner for returning players
 * - XP notification overlay
 * - Context for child components to call trackWin / trackPerfect / trackGameEnd / trackScore
 */
export default function GameWrapper({
  children,
  gameName,
  gameId,
  emoji = '🎮',
  loading,
  autoTrackPlay = true,
}: GameWrapperProps) {
  const rewards = useGameRewards({ gameId, title: gameName, emoji });
  const tracking = useGameTracking({ gameId, gameName });

  // Merge rewards + tracking into one context value
  const contextValue: GameContextValue = {
    ...rewards,
    trackGameEnd: tracking.trackGameEnd,
    trackScore: tracking.trackScore,
  };

  const defaultLoading = (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="text-center">
        <div className="text-6xl animate-bounce mb-4">{emoji}</div>
        <p className="text-white text-xl font-bold animate-pulse">
          Loading {gameName}...
        </p>
        <div className="mt-4 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <GameErrorBoundary gameName={gameName}>
      <Suspense fallback={loading || defaultLoading}>
        <GameRewardsContext.Provider value={contextValue}>
          {autoTrackPlay && <AutoTrackPlay rewards={rewards} gameName={gameName} />}
          <WelcomeBackBanner
            isReturning={tracking.isReturningPlayer}
            gamesPlayed={tracking.playerStats?.gamesPlayed ?? 0}
            emoji={emoji}
          />
          <XPNotification rewards={rewards} />
          {children}
        </GameRewardsContext.Provider>
      </Suspense>
    </GameErrorBoundary>
  );
}

/** Small helper that fires trackPlay + analytics event once on mount */
function AutoTrackPlay({ rewards, gameName }: { rewards: UseGameRewardsReturn; gameName: string }) {
  useEffect(() => {
    rewards.trackPlay();
    trackGamePlay(gameName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/** Dismissable welcome-back banner for returning players */
function WelcomeBackBanner({
  isReturning,
  gamesPlayed,
  emoji,
}: {
  isReturning: boolean;
  gamesPlayed: number;
  emoji: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isReturning && gamesPlayed > 1) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isReturning, gamesPlayed]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-slide-down"
      style={{ animation: 'slideDown 0.4s ease-out, fadeOut 0.4s ease-in 4.5s forwards' }}
    >
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium backdrop-blur-sm border border-white/20">
        <span className="text-lg">{emoji}</span>
        <span>
          Welcome back! You&apos;ve played{' '}
          <strong className="text-yellow-300">{gamesPlayed}</strong> games 🎉
        </span>
        <button
          onClick={() => setVisible(false)}
          className="ml-2 text-white/70 hover:text-white transition-colors text-xs"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; visibility: hidden; }
        }
      `}</style>
    </div>
  );
}

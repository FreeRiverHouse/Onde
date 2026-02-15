'use client';

import { ReactNode, Suspense, createContext, useContext, useEffect } from 'react';
import { GameErrorBoundary } from '@/components/ErrorBoundary';
import { useGameRewards, type UseGameRewardsReturn } from '@/hooks/useGameRewards';
import XPNotification from './XPNotification';

// Context so child components can call trackWin / trackPerfect
const GameRewardsContext = createContext<UseGameRewardsReturn | null>(null);

/**
 * Access game rewards from any child inside GameWrapper.
 *
 * ```tsx
 * const { trackWin, trackPerfect } = useGameContext();
 * ```
 */
export function useGameContext(): UseGameRewardsReturn {
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
 * - XP notification overlay
 * - Context for child components to call trackWin / trackPerfect
 *
 * Usage:
 * ```tsx
 * export default function MyGamePage() {
 *   return (
 *     <GameWrapper gameName="My Game" gameId="my-game" emoji="🎮">
 *       <MyGameComponent />
 *     </GameWrapper>
 *   );
 * }
 * ```
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
        <GameRewardsContext.Provider value={rewards}>
          {autoTrackPlay && <AutoTrackPlay rewards={rewards} />}
          <XPNotification rewards={rewards} />
          {children}
        </GameRewardsContext.Provider>
      </Suspense>
    </GameErrorBoundary>
  );
}

/** Small helper that fires trackPlay once on mount */
function AutoTrackPlay({ rewards }: { rewards: UseGameRewardsReturn }) {
  useEffect(() => {
    rewards.trackPlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

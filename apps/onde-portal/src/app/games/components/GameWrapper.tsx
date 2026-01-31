'use client';

import { ReactNode, Suspense } from 'react';
import { GameErrorBoundary } from '@/components/ErrorBoundary';

interface GameWrapperProps {
  children: ReactNode;
  gameName: string;
  loading?: ReactNode;
}

/**
 * GameWrapper provides error boundaries and loading states for game pages.
 * Wrap your game component with this to prevent white screen crashes.
 * 
 * Usage:
 * ```tsx
 * export default function MyGamePage() {
 *   return (
 *     <GameWrapper gameName="My Game">
 *       <MyGameComponent />
 *     </GameWrapper>
 *   );
 * }
 * ```
 */
export default function GameWrapper({ children, gameName, loading }: GameWrapperProps) {
  const defaultLoading = (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="text-center">
        <div className="text-6xl animate-bounce mb-4">🎮</div>
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
        {children}
      </Suspense>
    </GameErrorBoundary>
  );
}

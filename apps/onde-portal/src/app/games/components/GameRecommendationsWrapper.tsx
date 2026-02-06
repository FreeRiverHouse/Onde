'use client';

import { usePathname } from 'next/navigation';
import GameRecommendations from './GameRecommendations';

/**
 * Auto-detects the current game from the URL and shows recommendations.
 * Only renders on individual game pages (not /games or /games/leaderboard).
 */
export default function GameRecommendationsWrapper() {
  const pathname = usePathname();
  
  // Extract game slug from /games/<slug>
  const match = pathname.match(/^\/games\/([^/]+)\/?$/);
  if (!match) return null;
  
  const slug = match[1];
  
  // Skip non-game pages
  const skipPages = ['leaderboard', 'arcade'];
  if (skipPages.includes(slug)) return null;

  return <GameRecommendations currentGame={slug} />;
}

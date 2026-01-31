'use client';

import { useState, useEffect } from 'react';

// =============================================================================
// ⭐ SKIN RATING COMPONENT
// A beautiful star rating system for community skins
// =============================================================================

interface SkinRatingProps {
  skinId: string;
  initialRating?: number;
  totalRatings?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  readOnly?: boolean;
  onRate?: (rating: number) => void;
}

// Get user's rating from localStorage
function getUserRating(skinId: string): number | null {
  if (typeof window === 'undefined') return null;
  const ratings = localStorage.getItem('onde-skin-ratings');
  if (!ratings) return null;
  try {
    const parsed = JSON.parse(ratings);
    return parsed[skinId] ?? null;
  } catch {
    return null;
  }
}

// Save user's rating to localStorage
function saveUserRating(skinId: string, rating: number): void {
  if (typeof window === 'undefined') return;
  const ratings = localStorage.getItem('onde-skin-ratings');
  let parsed: Record<string, number> = {};
  if (ratings) {
    try {
      parsed = JSON.parse(ratings);
    } catch {
      parsed = {};
    }
  }
  parsed[skinId] = rating;
  localStorage.setItem('onde-skin-ratings', JSON.stringify(parsed));
}

// Get all ratings for skins (for average calculation)
function getAllRatings(): Record<string, { total: number; count: number }> {
  if (typeof window === 'undefined') return {};
  const ratings = localStorage.getItem('onde-skin-ratings-aggregate');
  if (!ratings) return {};
  try {
    return JSON.parse(ratings);
  } catch {
    return {};
  }
}

// Update aggregate ratings
function updateAggregateRating(skinId: string, newRating: number, previousRating: number | null): void {
  if (typeof window === 'undefined') return;
  const aggregates = getAllRatings();
  
  if (!aggregates[skinId]) {
    aggregates[skinId] = { total: 0, count: 0 };
  }
  
  if (previousRating !== null) {
    // Update existing rating
    aggregates[skinId].total = aggregates[skinId].total - previousRating + newRating;
  } else {
    // New rating
    aggregates[skinId].total += newRating;
    aggregates[skinId].count += 1;
  }
  
  localStorage.setItem('onde-skin-ratings-aggregate', JSON.stringify(aggregates));
}

export function getSkinAverageRating(skinId: string): { average: number; count: number } {
  const aggregates = getAllRatings();
  const data = aggregates[skinId];
  if (!data || data.count === 0) {
    return { average: 0, count: 0 };
  }
  return {
    average: Math.round((data.total / data.count) * 10) / 10,
    count: data.count,
  };
}

export default function SkinRating({
  skinId,
  initialRating = 0,
  totalRatings = 0,
  size = 'md',
  showCount = true,
  readOnly = false,
  onRate,
}: SkinRatingProps) {
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number>(initialRating);
  const [ratingCount, setRatingCount] = useState<number>(totalRatings);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Load user's rating on mount
  useEffect(() => {
    const savedRating = getUserRating(skinId);
    setUserRating(savedRating);
    
    // Get aggregate rating
    const { average, count } = getSkinAverageRating(skinId);
    if (count > 0) {
      setAverageRating(average);
      setRatingCount(count);
    }
  }, [skinId]);

  const handleClick = (rating: number) => {
    if (readOnly) return;
    
    const previousRating = userRating;
    setUserRating(rating);
    saveUserRating(skinId, rating);
    updateAggregateRating(skinId, rating, previousRating);
    
    // Update local state
    const { average, count } = getSkinAverageRating(skinId);
    setAverageRating(average);
    setRatingCount(count);
    
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    
    if (onRate) {
      onRate(rating);
    }
  };

  const displayRating = hoverRating || userRating || averageRating;

  // Size classes
  const sizeClasses = {
    sm: 'text-lg gap-0.5',
    md: 'text-2xl gap-1',
    lg: 'text-3xl gap-1.5',
  };

  const starSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Stars */}
      <div 
        className={`flex items-center ${sizeClasses[size]} ${isAnimating ? 'animate-pulse' : ''}`}
        onMouseLeave={() => !readOnly && setHoverRating(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          const isHalfFilled = star - 0.5 <= displayRating && star > displayRating;
          
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => handleClick(star)}
              onMouseEnter={() => !readOnly && setHoverRating(star)}
              className={`
                ${starSizeClasses[size]}
                transition-all duration-150
                ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-125'}
                ${userRating === star ? 'scale-110' : ''}
                focus:outline-none
              `}
              title={readOnly ? `${averageRating} stars` : `Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <svg
                viewBox="0 0 24 24"
                className={`
                  w-full h-full
                  transition-colors duration-150
                  ${isFilled || isHalfFilled 
                    ? 'text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]' 
                    : 'text-gray-300'
                  }
                `}
                fill={isFilled ? 'currentColor' : isHalfFilled ? 'url(#half)' : 'none'}
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <defs>
                  <linearGradient id="half">
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            </button>
          );
        })}
      </div>

      {/* Rating info */}
      {showCount && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {averageRating > 0 && (
            <span className="font-semibold text-yellow-600">
              {averageRating.toFixed(1)}
            </span>
          )}
          {ratingCount > 0 && (
            <span>
              ({ratingCount} {ratingCount === 1 ? 'vote' : 'votes'})
            </span>
          )}
          {userRating && (
            <span className="text-purple-500 font-medium">
              • You: {userRating}⭐
            </span>
          )}
        </div>
      )}

      {/* Interactive hint */}
      {!readOnly && !userRating && (
        <p className="text-xs text-gray-400 animate-pulse">
          Click to rate!
        </p>
      )}
    </div>
  );
}

// =============================================================================
// 🏆 TOP RATED BADGE COMPONENT
// Shows a badge for highly rated skins
// =============================================================================

interface TopRatedBadgeProps {
  rating: number;
  className?: string;
}

export function TopRatedBadge({ rating, className = '' }: TopRatedBadgeProps) {
  if (rating < 4) return null;
  
  const badge = rating >= 4.5 
    ? { emoji: '🏆', text: 'Top Rated', color: 'from-yellow-400 to-amber-500' }
    : { emoji: '⭐', text: 'Popular', color: 'from-purple-400 to-pink-500' };
  
  return (
    <span 
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 
        text-xs font-bold text-white rounded-full
        bg-gradient-to-r ${badge.color}
        shadow-lg animate-pulse
        ${className}
      `}
    >
      {badge.emoji} {badge.text}
    </span>
  );
}

// =============================================================================
// 📊 RATING STATS COMPONENT
// Shows rating distribution
// =============================================================================

interface RatingStatsProps {
  skinId: string;
}

export function RatingStats({ skinId }: RatingStatsProps) {
  const { average, count } = getSkinAverageRating(skinId);
  
  if (count === 0) {
    return (
      <div className="text-center py-4 text-gray-400">
        <span className="text-2xl">⭐</span>
        <p className="text-sm mt-1">No ratings yet</p>
        <p className="text-xs">Be the first to rate!</p>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
      <div className="text-center">
        <div className="text-3xl font-bold text-yellow-600">{average.toFixed(1)}</div>
        <div className="flex items-center justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <span 
              key={star}
              className={`text-sm ${star <= average ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </span>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {count} {count === 1 ? 'rating' : 'ratings'}
        </div>
      </div>
    </div>
  );
}

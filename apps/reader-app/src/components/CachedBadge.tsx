'use client';

interface CachedBadgeProps {
  isCached: boolean | null;
  isDemoBook: boolean;
  className?: string;
}

/**
 * Badge showing whether a book is cached for offline reading
 * - Demo books show "Sample" badge
 * - Cached books show checkmark
 * - Non-cached books show nothing (or cloud icon if explicitly requested)
 */
export function CachedBadge({ isCached, isDemoBook, className = '' }: CachedBadgeProps) {
  // Still checking cache status
  if (isCached === null) {
    return null;
  }

  // Demo books show special badge
  if (isDemoBook) {
    return (
      <div 
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/80 text-white ${className}`}
        title="Sample book - always available"
      >
        <span>📖</span>
        <span className="hidden sm:inline">Sample</span>
      </div>
    );
  }

  // Cached books show downloaded badge
  if (isCached) {
    return (
      <div 
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/80 text-white ${className}`}
        title="Downloaded for offline reading"
      >
        <span>✓</span>
        <span className="hidden sm:inline">Saved</span>
      </div>
    );
  }

  // Not cached - show cloud icon to indicate needs download
  return (
    <div 
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/60 text-white ${className}`}
      title="Not downloaded - requires internet"
    >
      <span>☁️</span>
    </div>
  );
}

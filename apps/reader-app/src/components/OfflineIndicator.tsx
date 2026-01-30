'use client';

/**
 * Offline Status Indicator
 * 
 * Shows when the user is offline with a subtle visual indicator.
 * Also shows a brief "Back online" message when connectivity is restored.
 */

import { useOnlineStatus } from '@/lib/useOnlineStatus';

interface OfflineIndicatorProps {
  className?: string;
  compact?: boolean;
}

export function OfflineIndicator({ className = '', compact = false }: OfflineIndicatorProps) {
  const { isOnline, wasOffline } = useOnlineStatus();
  
  // Don't render anything if online and not recently reconnected
  if (isOnline && !wasOffline) {
    return null;
  }
  
  if (!isOnline) {
    return (
      <div 
        className={`flex items-center gap-1.5 ${
          compact ? 'text-xs' : 'text-sm'
        } ${className}`}
        title="You're offline. Books you've opened will still work."
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
        </span>
        {!compact && (
          <span className="text-yellow-600 dark:text-yellow-400">
            Offline
          </span>
        )}
      </div>
    );
  }
  
  // Just came back online
  if (wasOffline) {
    return (
      <div 
        className={`flex items-center gap-1.5 ${
          compact ? 'text-xs' : 'text-sm'
        } text-green-600 dark:text-green-400 ${className}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        {!compact && <span>Back online</span>}
      </div>
    );
  }
  
  return null;
}

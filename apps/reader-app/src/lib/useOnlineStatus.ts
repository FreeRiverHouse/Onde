/**
 * Hook for tracking online/offline status
 * 
 * Uses Navigator.onLine API with event listeners for changes.
 * Also provides visual indicator state for smooth transitions.
 */

import { useState, useEffect, useCallback } from 'react';

export interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean; // True if recently came back online (for visual feedback)
  checkConnectivity: () => Promise<boolean>;
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  
  // Check actual connectivity (not just network interface)
  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      // Try to fetch a small resource
      const response = await fetch('/manifest.json', {
        method: 'HEAD',
        cache: 'no-store',
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);
  
  useEffect(() => {
    // Initialize with current status
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }
    
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      // Clear the "just came online" indicator after 3 seconds
      setTimeout(() => setWasOffline(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return { isOnline, wasOffline, checkConnectivity };
}

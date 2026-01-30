// Hook to track which books are cached in IndexedDB for offline reading
'use client';

import { useState, useEffect, useCallback } from 'react';
import { hasEpubFile } from './epubStorage';

// Demo books that are always available (loaded from URLs)
const DEMO_BOOK_IDS = [
  'pride-and-prejudice',
  'moby-dick', 
  'frankenstein'
];

export function useCachedBooks(bookIds: string[]) {
  const [cachedMap, setCachedMap] = useState<Map<string, boolean>>(new Map());
  const [isChecking, setIsChecking] = useState(true);

  const checkCacheStatus = useCallback(async () => {
    setIsChecking(true);
    const newMap = new Map<string, boolean>();
    
    for (const bookId of bookIds) {
      // Demo books are always "cached" (available via URL)
      if (DEMO_BOOK_IDS.includes(bookId)) {
        newMap.set(bookId, true);
      } else {
        try {
          const isCached = await hasEpubFile(bookId);
          newMap.set(bookId, isCached);
        } catch (error) {
          console.warn(`Failed to check cache for ${bookId}:`, error);
          newMap.set(bookId, false);
        }
      }
    }
    
    setCachedMap(newMap);
    setIsChecking(false);
  }, [bookIds]);

  useEffect(() => {
    if (bookIds.length > 0) {
      checkCacheStatus();
    } else {
      setIsChecking(false);
    }
  }, [checkCacheStatus, bookIds.length]);

  const isCached = useCallback((bookId: string): boolean | null => {
    if (isChecking) return null;
    return cachedMap.get(bookId) ?? false;
  }, [cachedMap, isChecking]);

  const isDemoBook = useCallback((bookId: string): boolean => {
    return DEMO_BOOK_IDS.includes(bookId);
  }, []);

  const refresh = useCallback(() => {
    checkCacheStatus();
  }, [checkCacheStatus]);

  return {
    isCached,
    isDemoBook,
    isChecking,
    refresh,
    cachedCount: Array.from(cachedMap.values()).filter(Boolean).length
  };
}

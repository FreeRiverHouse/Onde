/**
 * React hook for cloud sync integration
 * 
 * Connects the sync service to the Zustand store.
 * Provides auto-sync on changes and manual sync trigger.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useReaderStore } from '../store/readerStore';
import {
  enableSync,
  joinSync,
  disableSync,
  syncNow,
  getSyncStatus,
  type SyncStatus,
} from './syncService';

interface UseSyncReturn {
  // Status
  status: SyncStatus;
  
  // Actions
  enable: () => Promise<{ success: boolean; syncCode?: string; error?: string }>;
  join: (code: string) => Promise<{ success: boolean; error?: string }>;
  disable: () => void;
  sync: () => Promise<{ success: boolean; error?: string }>;
  
  // State
  isEnabled: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  syncCode: string | null;
  error: string | null;
}

export function useSync(): UseSyncReturn {
  const [status, setStatus] = useState<SyncStatus>(() => getSyncStatus());
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get store state
  const books = useReaderStore((s) => s.books);
  const highlights = useReaderStore((s) => s.highlights);
  const bookmarks = useReaderStore((s) => s.bookmarks);
  const vocabulary = useReaderStore((s) => s.vocabulary);
  const settings = useReaderStore((s) => s.settings);
  const ttsSettings = useReaderStore((s) => s.ttsSettings);
  
  // Get store actions for updating state
  const addBook = useReaderStore((s) => s.addBook);
  const removeBook = useReaderStore((s) => s.removeBook);
  const addHighlight = useReaderStore((s) => s.addHighlight);
  const removeHighlight = useReaderStore((s) => s.removeHighlight);
  const addBookmark = useReaderStore((s) => s.addBookmark);
  const removeBookmark = useReaderStore((s) => s.removeBookmark);
  const addVocabularyWord = useReaderStore((s) => s.addVocabularyWord);
  const updateSettings = useReaderStore((s) => s.updateSettings);
  const updateTtsSettings = useReaderStore((s) => s.updateTtsSettings);
  
  // Refresh status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getSyncStatus());
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Get current data snapshot
  const getLocalData = useCallback(() => ({
    books,
    highlights,
    bookmarks,
    vocabulary,
    settings,
    ttsSettings,
  }), [books, highlights, bookmarks, vocabulary, settings, ttsSettings]);
  
  // Apply merged data to store
  const applyMergedData = useCallback((data: ReturnType<typeof getLocalData>) => {
    // Clear and rebuild books
    // Note: We're updating via direct state manipulation here
    // In practice, you'd want more granular updates
    
    // For books, we need to handle adds/updates carefully
    const currentBookIds = new Set(books.map(b => b.id));
    const newBookIds = new Set(data.books.map(b => b.id));
    
    // Remove books that don't exist in merged data
    for (const book of books) {
      if (!newBookIds.has(book.id)) {
        removeBook(book.id);
      }
    }
    
    // Add/update books from merged data
    for (const book of data.books) {
      if (!currentBookIds.has(book.id)) {
        addBook(book);
      }
      // Updates happen via updateBookProgress which is already in store
    }
    
    // Similarly handle annotations
    const currentHighlightIds = new Set(highlights.map(h => h.id));
    const newHighlightIds = new Set(data.highlights.map(h => h.id));
    
    for (const highlight of highlights) {
      if (!newHighlightIds.has(highlight.id)) {
        removeHighlight(highlight.id);
      }
    }
    
    for (const highlight of data.highlights) {
      if (!currentHighlightIds.has(highlight.id)) {
        addHighlight(highlight);
      }
    }
    
    const currentBookmarkIds = new Set(bookmarks.map(b => b.id));
    const newBookmarkIds = new Set(data.bookmarks.map(b => b.id));
    
    for (const bookmark of bookmarks) {
      if (!newBookmarkIds.has(bookmark.id)) {
        removeBookmark(bookmark.id);
      }
    }
    
    for (const bookmark of data.bookmarks) {
      if (!currentBookmarkIds.has(bookmark.id)) {
        addBookmark(bookmark);
      }
    }
    
    // Vocabulary
    for (const word of data.vocabulary) {
      addVocabularyWord(word);
    }
    
    // Don't override settings (keep local preference)
  }, [
    books, highlights, bookmarks,
    addBook, removeBook,
    addHighlight, removeHighlight,
    addBookmark, removeBookmark,
    addVocabularyWord,
    updateSettings, updateTtsSettings,
  ]);
  
  // Sync function
  const sync = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!status.enabled) {
      return { success: false, error: 'Sync not enabled' };
    }
    
    setStatus(prev => ({ ...prev, isSyncing: true }));
    
    const result = await syncNow(getLocalData());
    
    if (result.success && result.mergedData) {
      applyMergedData(result.mergedData);
    }
    
    setStatus(getSyncStatus());
    return { success: result.success, error: result.error };
  }, [status.enabled, getLocalData, applyMergedData]);
  
  // Auto-sync on data changes (debounced)
  useEffect(() => {
    if (!status.enabled) return;
    
    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    // Debounce sync by 5 seconds
    syncTimeoutRef.current = setTimeout(() => {
      sync();
    }, 5000);
    
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [
    status.enabled,
    books, highlights, bookmarks, vocabulary,
    // Don't include sync in deps to avoid infinite loop
  ]);
  
  // Enable sync
  const enable = useCallback(async () => {
    const result = await enableSync();
    setStatus(getSyncStatus());
    if (result.success) {
      // Do initial sync
      await sync();
    }
    return result;
  }, [sync]);
  
  // Join sync
  const join = useCallback(async (code: string) => {
    const result = await joinSync(code);
    setStatus(getSyncStatus());
    if (result.success) {
      // Pull remote data
      await sync();
    }
    return result;
  }, [sync]);
  
  // Disable sync
  const disable = useCallback(() => {
    disableSync();
    setStatus(getSyncStatus());
  }, []);
  
  return {
    status,
    enable,
    join,
    disable,
    sync,
    isEnabled: status.enabled,
    isSyncing: status.isSyncing,
    lastSyncedAt: status.lastSyncedAt,
    syncCode: status.syncCode,
    error: status.error,
  };
}

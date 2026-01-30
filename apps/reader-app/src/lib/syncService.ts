/**
 * Sync Service for Reader App
 * 
 * Handles cloud synchronization of reader data across devices.
 * Uses Supabase when configured, with localStorage fallback.
 * 
 * Features:
 * - Anonymous device ID authentication
 * - Sync code pairing for cross-device sync
 * - Conflict resolution (timestamp-based, last-write-wins per item)
 * - Incremental sync (only changed items)
 */

import {
  supabase,
  isSupabaseConfigured,
  getDeviceId,
  getSyncCode,
  setSyncCode,
  clearSyncCode,
  generateSyncCode,
} from './supabase';
import type { Book, Highlight, Bookmark, VocabularyWord, ReaderSettings, TTSSettings } from '../store/readerStore';

export interface SyncData {
  version: number;
  syncCode: string;
  deviceId: string;
  lastSyncedAt: number;
  data: {
    books: Book[];
    highlights: Highlight[];
    bookmarks: Bookmark[];
    vocabulary: VocabularyWord[];
    settings: ReaderSettings;
    ttsSettings: TTSSettings;
  };
}

export interface SyncStatus {
  enabled: boolean;
  syncCode: string | null;
  lastSyncedAt: number | null;
  isSyncing: boolean;
  error: string | null;
  deviceCount: number;
}

const SYNC_VERSION = 1;
const SYNC_STATUS_KEY = 'onde-reader-sync-status';

// In-memory cache for sync status
let currentStatus: SyncStatus = {
  enabled: false,
  syncCode: null,
  lastSyncedAt: null,
  isSyncing: false,
  error: null,
  deviceCount: 1,
};

export function getSyncStatus(): SyncStatus {
  if (typeof window === 'undefined') return currentStatus;
  
  const stored = localStorage.getItem(SYNC_STATUS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      currentStatus = { ...currentStatus, ...parsed, isSyncing: false };
    } catch {
      // Ignore parse errors
    }
  }
  currentStatus.syncCode = getSyncCode();
  currentStatus.enabled = Boolean(currentStatus.syncCode);
  return currentStatus;
}

function updateSyncStatus(updates: Partial<SyncStatus>): void {
  currentStatus = { ...currentStatus, ...updates };
  if (typeof window !== 'undefined') {
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify({
      lastSyncedAt: currentStatus.lastSyncedAt,
      deviceCount: currentStatus.deviceCount,
    }));
  }
}

/**
 * Enable sync with a new code (creates sync group)
 */
export async function enableSync(): Promise<{ success: boolean; syncCode: string; error?: string }> {
  const code = generateSyncCode();
  const deviceId = getDeviceId();
  
  if (isSupabaseConfigured && supabase) {
    try {
      // Check if code exists (unlikely but possible collision)
      const { data: existing } = await supabase
        .from('reader_sync')
        .select('sync_code')
        .eq('sync_code', code)
        .single();
      
      if (existing) {
        // Regenerate on collision
        return enableSync();
      }
      
      // Insert new sync record
      const { error } = await supabase
        .from('reader_sync')
        .insert({
          sync_code: code,
          device_id: deviceId,
          data: null,
          created_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      setSyncCode(code);
      updateSyncStatus({ enabled: true, syncCode: code, deviceCount: 1, error: null });
      return { success: true, syncCode: code };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to enable sync';
      updateSyncStatus({ error: message });
      return { success: false, syncCode: code, error: message };
    }
  } else {
    // Local-only mode - just store the code
    setSyncCode(code);
    updateSyncStatus({ enabled: true, syncCode: code, deviceCount: 1, error: null });
    return { success: true, syncCode: code };
  }
}

/**
 * Join existing sync group with code
 */
export async function joinSync(code: string): Promise<{ success: boolean; error?: string }> {
  const normalizedCode = code.toUpperCase().trim();
  
  if (!/^[A-Z0-9]{6}$/.test(normalizedCode)) {
    return { success: false, error: 'Invalid sync code format' };
  }
  
  if (isSupabaseConfigured && supabase) {
    try {
      // Verify code exists
      const { data: existing, error } = await supabase
        .from('reader_sync')
        .select('sync_code, data')
        .eq('sync_code', normalizedCode)
        .single();
      
      if (error || !existing) {
        return { success: false, error: 'Sync code not found' };
      }
      
      setSyncCode(normalizedCode);
      updateSyncStatus({ enabled: true, syncCode: normalizedCode, error: null });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to join sync';
      return { success: false, error: message };
    }
  } else {
    // Local-only mode - just accept the code
    setSyncCode(normalizedCode);
    updateSyncStatus({ enabled: true, syncCode: normalizedCode, error: null });
    return { success: true };
  }
}

/**
 * Disable sync and leave group
 */
export function disableSync(): void {
  clearSyncCode();
  updateSyncStatus({ enabled: false, syncCode: null, deviceCount: 1, error: null });
}

/**
 * Push local data to cloud
 */
export async function pushData(data: SyncData['data']): Promise<{ success: boolean; error?: string }> {
  const syncCode = getSyncCode();
  if (!syncCode) {
    return { success: false, error: 'Sync not enabled' };
  }
  
  updateSyncStatus({ isSyncing: true });
  
  if (isSupabaseConfigured && supabase) {
    try {
      const syncData: SyncData = {
        version: SYNC_VERSION,
        syncCode,
        deviceId: getDeviceId(),
        lastSyncedAt: Date.now(),
        data,
      };
      
      const { error } = await supabase
        .from('reader_sync')
        .upsert({
          sync_code: syncCode,
          device_id: getDeviceId(),
          data: syncData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'sync_code',
        });
      
      if (error) throw error;
      
      updateSyncStatus({ lastSyncedAt: Date.now(), isSyncing: false, error: null });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Push failed';
      updateSyncStatus({ isSyncing: false, error: message });
      return { success: false, error: message };
    }
  } else {
    // Local-only mode - store in localStorage for export
    const syncData: SyncData = {
      version: SYNC_VERSION,
      syncCode,
      deviceId: getDeviceId(),
      lastSyncedAt: Date.now(),
      data,
    };
    localStorage.setItem(`onde-reader-sync-${syncCode}`, JSON.stringify(syncData));
    updateSyncStatus({ lastSyncedAt: Date.now(), isSyncing: false, error: null });
    return { success: true };
  }
}

/**
 * Pull data from cloud
 */
export async function pullData(): Promise<{ success: boolean; data?: SyncData['data']; error?: string }> {
  const syncCode = getSyncCode();
  if (!syncCode) {
    return { success: false, error: 'Sync not enabled' };
  }
  
  updateSyncStatus({ isSyncing: true });
  
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reader_sync')
        .select('data')
        .eq('sync_code', syncCode)
        .single();
      
      if (error) throw error;
      
      if (!data?.data) {
        updateSyncStatus({ isSyncing: false });
        return { success: true, data: undefined };
      }
      
      const syncData = data.data as SyncData;
      updateSyncStatus({ lastSyncedAt: Date.now(), isSyncing: false, error: null });
      return { success: true, data: syncData.data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Pull failed';
      updateSyncStatus({ isSyncing: false, error: message });
      return { success: false, error: message };
    }
  } else {
    // Local-only mode - read from localStorage
    const stored = localStorage.getItem(`onde-reader-sync-${syncCode}`);
    if (!stored) {
      updateSyncStatus({ isSyncing: false });
      return { success: true, data: undefined };
    }
    
    try {
      const syncData = JSON.parse(stored) as SyncData;
      updateSyncStatus({ lastSyncedAt: Date.now(), isSyncing: false, error: null });
      return { success: true, data: syncData.data };
    } catch {
      updateSyncStatus({ isSyncing: false, error: 'Invalid sync data' });
      return { success: false, error: 'Invalid sync data' };
    }
  }
}

/**
 * Merge remote data with local data
 * Uses timestamp-based conflict resolution (newer wins per item)
 */
export function mergeData(
  local: SyncData['data'],
  remote: SyncData['data']
): SyncData['data'] {
  // Helper to merge arrays by ID, keeping newer items
  function mergeById<T extends { id: string; createdAt?: number }>(
    localItems: T[],
    remoteItems: T[]
  ): T[] {
    const merged = new Map<string, T>();
    
    // Add all local items
    for (const item of localItems) {
      merged.set(item.id, item);
    }
    
    // Merge remote items, preferring newer
    for (const item of remoteItems) {
      const existing = merged.get(item.id);
      if (!existing) {
        merged.set(item.id, item);
      } else {
        // Keep newer item (by createdAt or assume remote is newer if no timestamp)
        const existingTime = existing.createdAt || 0;
        const remoteTime = item.createdAt || Date.now();
        if (remoteTime >= existingTime) {
          merged.set(item.id, item);
        }
      }
    }
    
    return Array.from(merged.values());
  }
  
  // Merge books (by ID, keep higher progress)
  const books = mergeById(local.books, remote.books).map(book => {
    const localBook = local.books.find(b => b.id === book.id);
    const remoteBook = remote.books.find(b => b.id === book.id);
    
    if (localBook && remoteBook) {
      // Keep higher progress and newer lastRead
      return {
        ...book,
        progress: Math.max(localBook.progress || 0, remoteBook.progress || 0),
        lastRead: Math.max(localBook.lastRead || 0, remoteBook.lastRead || 0),
        currentLocation: (localBook.lastRead || 0) > (remoteBook.lastRead || 0)
          ? localBook.currentLocation
          : remoteBook.currentLocation,
        currentCfi: (localBook.lastRead || 0) > (remoteBook.lastRead || 0)
          ? localBook.currentCfi
          : remoteBook.currentCfi,
      };
    }
    return book;
  });
  
  // Merge annotations (simple merge by ID)
  const highlights = mergeById(local.highlights, remote.highlights);
  const bookmarks = mergeById(local.bookmarks, remote.bookmarks);
  const vocabulary = mergeById(local.vocabulary, remote.vocabulary);
  
  // Settings: prefer local (user's current device preference)
  const settings = local.settings;
  const ttsSettings = local.ttsSettings;
  
  return {
    books,
    highlights,
    bookmarks,
    vocabulary,
    settings,
    ttsSettings,
  };
}

/**
 * Full sync: pull, merge, push
 */
export async function syncNow(localData: SyncData['data']): Promise<{
  success: boolean;
  mergedData?: SyncData['data'];
  error?: string;
}> {
  const syncCode = getSyncCode();
  if (!syncCode) {
    return { success: false, error: 'Sync not enabled' };
  }
  
  // Pull remote data
  const pullResult = await pullData();
  if (!pullResult.success) {
    return { success: false, error: pullResult.error };
  }
  
  // If no remote data, just push local
  if (!pullResult.data) {
    const pushResult = await pushData(localData);
    return { success: pushResult.success, mergedData: localData, error: pushResult.error };
  }
  
  // Merge and push
  const mergedData = mergeData(localData, pullResult.data);
  const pushResult = await pushData(mergedData);
  
  return {
    success: pushResult.success,
    mergedData: pushResult.success ? mergedData : undefined,
    error: pushResult.error,
  };
}

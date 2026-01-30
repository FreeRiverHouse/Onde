'use client';

/**
 * Cloud Sync Panel Component
 * 
 * Provides UI for managing cross-device sync:
 * - Enable/disable sync
 * - Display sync code for sharing
 * - Join existing sync group
 * - Manual sync trigger
 * - Sync status display
 */

import { useState, useCallback } from 'react';
import { useSync } from '../lib/useSync';
import { isSupabaseConfigured } from '../lib/supabase';

interface SyncPanelProps {
  className?: string;
}

export function SyncPanel({ className = '' }: SyncPanelProps) {
  const {
    isEnabled,
    isSyncing,
    lastSyncedAt,
    syncCode,
    error,
    enable,
    join,
    disable,
    sync,
  } = useSync();
  
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleEnable = useCallback(async () => {
    setIsLoading(true);
    setActionError(null);
    const result = await enable();
    if (!result.success) {
      setActionError(result.error || 'Failed to enable sync');
    }
    setIsLoading(false);
  }, [enable]);
  
  const handleJoin = useCallback(async () => {
    if (!joinCode.trim()) return;
    setIsLoading(true);
    setActionError(null);
    const result = await join(joinCode.trim());
    if (result.success) {
      setJoinCode('');
      setShowJoinInput(false);
    } else {
      setActionError(result.error || 'Failed to join sync');
    }
    setIsLoading(false);
  }, [join, joinCode]);
  
  const handleCopyCode = useCallback(async () => {
    if (!syncCode) return;
    try {
      await navigator.clipboard.writeText(syncCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = syncCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [syncCode]);
  
  const handleSync = useCallback(async () => {
    setIsLoading(true);
    setActionError(null);
    const result = await sync();
    if (!result.success) {
      setActionError(result.error || 'Sync failed');
    }
    setIsLoading(false);
  }, [sync]);
  
  const formatLastSync = (timestamp: number | null): string => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };
  
  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          ☁️ Cloud Sync
          {!isSupabaseConfigured && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
              Local Only
            </span>
          )}
        </h3>
        {isEnabled && (
          <span className={`text-sm ${isSyncing ? 'text-blue-500' : 'text-green-500'}`}>
            {isSyncing ? '⟳ Syncing...' : '✓ Connected'}
          </span>
        )}
      </div>
      
      {!isSupabaseConfigured && (
        <p className="text-sm text-gray-500 mb-4">
          Cloud sync is not configured. You can still use sync codes to manually export/import data between devices using the Backup & Restore feature.
        </p>
      )}
      
      {(error || actionError) && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
          {actionError || error}
        </div>
      )}
      
      {!isEnabled ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enable sync to keep your reading progress, highlights, and bookmarks in sync across all your devices.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleEnable}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Enabling...' : 'Enable Sync'}
            </button>
            <button
              onClick={() => setShowJoinInput(!showJoinInput)}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Join
            </button>
          </div>
          
          {showJoinInput && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-letter code"
                maxLength={6}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono text-center text-lg tracking-widest uppercase"
              />
              <button
                onClick={handleJoin}
                disabled={isLoading || joinCode.length !== 6}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? '...' : '→'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Sync Code Display */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your Sync Code</p>
              <p className="font-mono text-2xl tracking-widest">{syncCode}</p>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          
          <p className="text-sm text-gray-500">
            Share this code with your other devices to sync your library.
          </p>
          
          {/* Sync Status */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Last synced: {formatLastSync(lastSyncedAt)}
            </span>
            <button
              onClick={handleSync}
              disabled={isLoading || isSyncing}
              className="px-3 py-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50"
            >
              {isSyncing ? '⟳ Syncing...' : '⟳ Sync Now'}
            </button>
          </div>
          
          {/* Disable */}
          <button
            onClick={disable}
            className="w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Disable Sync
          </button>
        </div>
      )}
    </div>
  );
}

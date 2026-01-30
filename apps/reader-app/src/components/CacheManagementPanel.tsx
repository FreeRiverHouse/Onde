'use client';

import { useState, useEffect, useCallback } from 'react';
import { useReaderStore } from '@/store/readerStore';
import {
  getAllCachedBooks,
  getTotalCacheSize,
  clearAllCache,
  deleteEpubFile,
  storeEpubFile,
  getStorageQuota,
  CachedBookInfo
} from '@/lib/epubStorage';

interface CacheManagementPanelProps {
  className?: string;
}

// Demo books that are loaded from URLs
const DEMO_BOOK_IDS = ['pride-and-prejudice', 'moby-dick', 'frankenstein'];

// Demo book URLs for downloading
const DEMO_BOOK_URLS: Record<string, string> = {
  'pride-and-prejudice': 'https://www.gutenberg.org/ebooks/1342.epub.images',
  'moby-dick': 'https://www.gutenberg.org/ebooks/2701.epub.images',
  'frankenstein': 'https://www.gutenberg.org/ebooks/84.epub.images'
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function CacheManagementPanel({ className = '' }: CacheManagementPanelProps) {
  const { books, settings } = useReaderStore();
  const [cachedBooks, setCachedBooks] = useState<CachedBookInfo[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [storageQuota, setStorageQuota] = useState<{ used: number; total: number } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCacheInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cached, size, quota] = await Promise.all([
        getAllCachedBooks(),
        getTotalCacheSize(),
        getStorageQuota()
      ]);
      setCachedBooks(cached);
      setTotalSize(size);
      setStorageQuota(quota);
    } catch (error) {
      console.error('Failed to load cache info:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isExpanded) {
      loadCacheInfo();
    }
  }, [isExpanded, loadCacheInfo]);

  const handleDeleteBook = async (bookId: string) => {
    setDeletingId(bookId);
    try {
      await deleteEpubFile(bookId);
      await loadCacheInfo();
    } catch (error) {
      console.error('Failed to delete book from cache:', error);
    }
    setDeletingId(null);
  };

  const handleClearAll = async () => {
    try {
      await clearAllCache();
      setShowClearConfirm(false);
      await loadCacheInfo();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const handleDownloadAll = async () => {
    // Get all library books that aren't cached yet (excluding demo books which are URL-based)
    const cachedIds = new Set(cachedBooks.map(b => b.id));
    const booksToDownload = books.filter(book => 
      !cachedIds.has(book.id) && 
      !DEMO_BOOK_IDS.includes(book.id) &&
      DEMO_BOOK_URLS[book.id] // Only download if we have a URL
    );

    // Also check demo books that aren't in local cache
    const demoToDownload = DEMO_BOOK_IDS.filter(id => !cachedIds.has(id));

    const allToDownload = [
      ...booksToDownload.map(b => b.id),
      ...demoToDownload
    ];

    if (allToDownload.length === 0) {
      setDownloadProgress('All books are already cached!');
      setTimeout(() => setDownloadProgress(null), 2000);
      return;
    }

    for (let i = 0; i < allToDownload.length; i++) {
      const bookId = allToDownload[i];
      const url = DEMO_BOOK_URLS[bookId];
      if (!url) continue;

      setDownloadProgress(`Downloading ${i + 1}/${allToDownload.length}...`);
      
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Download failed');
        const arrayBuffer = await response.arrayBuffer();
        await storeEpubFile(bookId, arrayBuffer);
      } catch (error) {
        console.error(`Failed to download ${bookId}:`, error);
      }
    }

    setDownloadProgress('Done!');
    setTimeout(() => setDownloadProgress(null), 2000);
    await loadCacheInfo();
  };

  // Get book info from library by ID
  const getBookInfo = (bookId: string): { title: string; author: string } => {
    const book = books.find(b => b.id === bookId);
    if (book) return { title: book.title, author: book.author };
    
    // Demo book fallbacks
    const demoInfo: Record<string, { title: string; author: string }> = {
      'pride-and-prejudice': { title: 'Pride and Prejudice', author: 'Jane Austen' },
      'moby-dick': { title: 'Moby Dick', author: 'Herman Melville' },
      'frankenstein': { title: 'Frankenstein', author: 'Mary Shelley' }
    };
    return demoInfo[bookId] || { title: bookId, author: 'Unknown' };
  };

  // Theme-aware styles
  const bgClass = settings.theme === 'dark' 
    ? 'bg-gray-700' 
    : settings.theme === 'sepia' 
      ? 'bg-sepia-300' 
      : 'bg-gray-100';

  const hoverBgClass = settings.theme === 'dark'
    ? 'hover:bg-gray-600'
    : settings.theme === 'sepia'
      ? 'hover:bg-sepia-400'
      : 'hover:bg-gray-200';

  const quotaPercentage = storageQuota 
    ? Math.round((storageQuota.used / storageQuota.total) * 100) 
    : 0;

  return (
    <div className={`${className}`}>
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 rounded-xl ${bgClass} ${hoverBgClass} transition-colors`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">💾</span>
          <div className="text-left">
            <div className="font-medium">Offline Storage</div>
            <div className="text-sm opacity-70">
              {isLoading ? 'Loading...' : `${cachedBooks.length} books • ${formatBytes(totalSize)}`}
            </div>
          </div>
        </div>
        <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className={`mt-2 p-4 rounded-xl ${bgClass}`}>
          {/* Storage quota */}
          {storageQuota && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="opacity-70">Storage Used</span>
                <span>{formatBytes(storageQuota.used)} / {formatBytes(storageQuota.total)}</span>
              </div>
              <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    quotaPercentage > 90 ? 'bg-red-500' :
                    quotaPercentage > 70 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${quotaPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleDownloadAll}
              disabled={!!downloadProgress}
              className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {downloadProgress || '⬇️ Download All'}
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={cachedBooks.length === 0}
              className="py-2 px-3 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              🗑️ Clear
            </button>
          </div>

          {/* Clear confirmation modal */}
          {showClearConfirm && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700">
              <p className="text-sm mb-3">
                Delete all {cachedBooks.length} cached books? ({formatBytes(totalSize)})
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700"
                >
                  Yes, Clear All
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-1.5 bg-gray-400 text-white rounded text-sm font-medium hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Cached books list */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {cachedBooks.length === 0 ? (
              <p className="text-sm opacity-70 text-center py-4">
                No books cached for offline reading
              </p>
            ) : (
              cachedBooks.map((cached) => {
                const bookInfo = getBookInfo(cached.id);
                return (
                  <div
                    key={cached.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      settings.theme === 'dark' ? 'bg-gray-600' :
                      settings.theme === 'sepia' ? 'bg-sepia-200' :
                      'bg-white'
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="font-medium text-sm truncate">{bookInfo.title}</div>
                      <div className="text-xs opacity-70">{bookInfo.author} • {formatBytes(cached.size)}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteBook(cached.id)}
                      disabled={deletingId === cached.id}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                      title="Remove from cache"
                    >
                      {deletingId === cached.id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Info text */}
          <p className="text-xs opacity-50 mt-4 text-center">
            Cached books are available offline. Demo books are loaded from the internet.
          </p>
        </div>
      )}
    </div>
  );
}

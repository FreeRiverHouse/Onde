'use client';

import { useState } from 'react';
import { storeEpubFile } from '@/lib/epubStorage';

// Demo book URLs for downloading
const DEMO_BOOK_URLS: Record<string, string> = {
  'pride-and-prejudice': 'https://www.gutenberg.org/ebooks/1342.epub.images',
  'moby-dick': 'https://www.gutenberg.org/ebooks/2701.epub.images',
  'frankenstein': 'https://www.gutenberg.org/ebooks/84.epub.images'
};

interface DownloadButtonProps {
  bookId: string;
  sourceUrl?: string;
  isCached: boolean | null;
  isDemoBook: boolean;
  onDownloadComplete?: () => void;
  className?: string;
  compact?: boolean;
}

export function DownloadButton({ 
  bookId, 
  sourceUrl, 
  isCached, 
  isDemoBook,
  onDownloadComplete,
  className = '',
  compact = false
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Determine the download URL
  const downloadUrl = sourceUrl || (isDemoBook ? DEMO_BOOK_URLS[bookId] : null);

  // Don't show if already cached or no download URL available
  if (isCached || !downloadUrl) {
    return null;
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering book click
    
    if (isDownloading) return;
    
    setIsDownloading(true);
    setError(null);
    setProgress(10);

    try {
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      // Get content length for progress tracking
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      // Read the response as a stream if possible
      if (response.body && total > 0) {
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;
        let done = false;

        while (!done) {
          const result = await reader.read();
          done = result.done;
          
          if (result.value) {
            chunks.push(result.value);
            received += result.value.length;
            
            // Update progress (10-90% for download)
            const downloadProgress = Math.round((received / total) * 80) + 10;
            setProgress(downloadProgress);
          }
        }

        // Combine chunks into single ArrayBuffer
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const combined = new Uint8Array(totalLength);
        let position = 0;
        for (const chunk of chunks) {
          combined.set(chunk, position);
          position += chunk.length;
        }

        setProgress(95);
        await storeEpubFile(bookId, combined.buffer);
      } else {
        // Fallback for browsers that don't support streaming
        setProgress(50);
        const arrayBuffer = await response.arrayBuffer();
        setProgress(90);
        await storeEpubFile(bookId, arrayBuffer);
      }

      setProgress(100);
      onDownloadComplete?.();
      
      // Reset after a short delay
      setTimeout(() => {
        setIsDownloading(false);
        setProgress(0);
      }, 1000);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Download failed');
      setIsDownloading(false);
      setProgress(0);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`p-1.5 rounded-full transition-all ${
          isDownloading 
            ? 'bg-blue-500 text-white' 
            : error
              ? 'bg-red-500/80 text-white'
              : 'bg-white/90 hover:bg-white text-gray-700 shadow-sm hover:shadow'
        } ${className}`}
        title={error || (isDownloading ? `Downloading ${progress}%` : 'Download for offline')}
      >
        {isDownloading ? (
          <span className="text-xs font-bold">{progress}%</span>
        ) : error ? (
          <span>❌</span>
        ) : (
          <span>⬇️</span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
        isDownloading 
          ? 'bg-blue-500 text-white' 
          : error
            ? 'bg-red-500 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
      } ${className}`}
      title={error || (isDownloading ? 'Downloading...' : 'Download for offline reading')}
    >
      {isDownloading ? (
        <>
          <span className="animate-pulse">⏳</span>
          <span className="text-sm">{progress}%</span>
        </>
      ) : error ? (
        <>
          <span>❌</span>
          <span className="text-sm">Retry</span>
        </>
      ) : (
        <>
          <span>⬇️</span>
          <span className="text-sm">Download</span>
        </>
      )}
    </button>
  );
}

'use client'

import { useCallback, useEffect, useState } from 'react'

interface DownloadStats {
  [bookId: string]: {
    count: number
    lastDownload: string
    formats: {
      pdf: number
      epub: number
    }
  }
}

const STORAGE_KEY = 'onde-download-stats'

// Get download stats from localStorage
function getStats(): DownloadStats {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// Save stats to localStorage
function saveStats(stats: DownloadStats): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // localStorage might be full or disabled
  }
}

// Hook for tracking downloads
export function useDownloadTracker() {
  const [stats, setStats] = useState<DownloadStats>({})

  useEffect(() => {
    setStats(getStats())
  }, [])

  const trackDownload = useCallback((bookId: string, format: 'pdf' | 'epub') => {
    const currentStats = getStats()
    const bookStats = currentStats[bookId] || {
      count: 0,
      lastDownload: '',
      formats: { pdf: 0, epub: 0 }
    }

    bookStats.count += 1
    bookStats.lastDownload = new Date().toISOString()
    bookStats.formats[format] += 1

    currentStats[bookId] = bookStats
    saveStats(currentStats)
    setStats(currentStats)

    // Send to Cloudflare Analytics if available (using navigator.sendBeacon)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        // Cloudflare Web Analytics automatically tracks custom events
        // This creates a trackable event
        const event = {
          event: 'download',
          bookId,
          format,
          timestamp: new Date().toISOString()
        }
        // Use a simple beacon that CF Analytics can pick up
        const blob = new Blob([JSON.stringify(event)], { type: 'application/json' })
        navigator.sendBeacon('/api/analytics/track', blob)
      } catch {
        // Silently fail - analytics is optional
      }
    }

    return bookStats.count
  }, [])

  const getBookStats = useCallback((bookId: string) => {
    return stats[bookId] || { count: 0, lastDownload: '', formats: { pdf: 0, epub: 0 } }
  }, [stats])

  const getPopularBooks = useCallback((limit = 5): Array<{ bookId: string; count: number }> => {
    return Object.entries(stats)
      .map(([bookId, data]) => ({ bookId, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }, [stats])

  const getTotalDownloads = useCallback(() => {
    return Object.values(stats).reduce((sum, book) => sum + book.count, 0)
  }, [stats])

  return {
    trackDownload,
    getBookStats,
    getPopularBooks,
    getTotalDownloads,
    stats
  }
}

// Component wrapper for download links with tracking
export function TrackedDownloadLink({
  href,
  bookId,
  format,
  children,
  className,
  onDownload
}: {
  href: string
  bookId: string
  format: 'pdf' | 'epub'
  children: React.ReactNode
  className?: string
  onDownload?: (count: number) => void
}) {
  const { trackDownload } = useDownloadTracker()

  const handleClick = () => {
    const count = trackDownload(bookId, format)
    onDownload?.(count)
  }

  return (
    <a
      href={href}
      download
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  )
}

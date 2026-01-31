'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

// Sound preference types
type SoundType = 'none' | 'subtle' | 'chime' | 'alert'

interface SoundPreferences {
  enabled: boolean
  type: SoundType
  volume: number // 0-1
}

const DEFAULT_SOUND_PREFS: SoundPreferences = {
  enabled: true,
  type: 'subtle',
  volume: 0.5,
}

const SOUND_LABELS: Record<SoundType, string> = {
  none: '🔇 None',
  subtle: '🔔 Subtle',
  chime: '🎵 Chime',
  alert: '🚨 Alert',
}

// Sound generation using Web Audio API
function playNotificationSound(type: SoundType, volume: number): void {
  if (type === 'none' || typeof window === 'undefined') return

  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    gainNode.gain.value = volume * 0.3 // Scale down for comfort

    const now = audioContext.currentTime

    switch (type) {
      case 'subtle':
        // Soft ping - single high note fading out
        oscillator.frequency.setValueAtTime(880, now)
        oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.1)
        gainNode.gain.setValueAtTime(volume * 0.2, now)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
        oscillator.start(now)
        oscillator.stop(now + 0.15)
        break

      case 'chime':
        // Pleasant two-tone chime
        oscillator.frequency.setValueAtTime(523.25, now) // C5
        oscillator.frequency.setValueAtTime(659.25, now + 0.1) // E5
        gainNode.gain.setValueAtTime(volume * 0.25, now)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
        oscillator.start(now)
        oscillator.stop(now + 0.25)
        break

      case 'alert':
        // Attention-grabbing double beep
        oscillator.frequency.setValueAtTime(1046.5, now) // C6
        gainNode.gain.setValueAtTime(volume * 0.3, now)
        gainNode.gain.setValueAtTime(0.01, now + 0.08)
        gainNode.gain.setValueAtTime(volume * 0.3, now + 0.12)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
        oscillator.start(now)
        oscillator.stop(now + 0.2)
        break
    }

    // Cleanup
    setTimeout(() => {
      audioContext.close()
    }, 500)
  } catch (err) {
    console.warn('Failed to play notification sound:', err)
  }
}

// Notification persistence storage keys
const STORAGE_KEYS = {
  dismissed: 'notification-dismissed-ids',
  read: 'notification-read-ids',
  lastCleanup: 'notification-last-cleanup',
}

// Max age for persisted data (7 days)
const MAX_PERSIST_AGE_MS = 7 * 24 * 60 * 60 * 1000

// Hook for notification persistence (dismissed + read status)
function useNotificationPersistence() {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      // Check if cleanup is needed (once per day)
      const lastCleanup = localStorage.getItem(STORAGE_KEYS.lastCleanup)
      const needsCleanup = !lastCleanup || Date.now() - parseInt(lastCleanup) > 24 * 60 * 60 * 1000
      
      const dismissedRaw = localStorage.getItem(STORAGE_KEYS.dismissed)
      const readRaw = localStorage.getItem(STORAGE_KEYS.read)

      if (dismissedRaw) {
        const parsed: { ids: string[], timestamp: number } = JSON.parse(dismissedRaw)
        // Only use if not too old
        if (Date.now() - parsed.timestamp < MAX_PERSIST_AGE_MS) {
          setDismissedIds(new Set(parsed.ids))
        } else if (needsCleanup) {
          localStorage.removeItem(STORAGE_KEYS.dismissed)
        }
      }

      if (readRaw) {
        const parsed: { ids: string[], timestamp: number } = JSON.parse(readRaw)
        if (Date.now() - parsed.timestamp < MAX_PERSIST_AGE_MS) {
          setReadIds(new Set(parsed.ids))
        } else if (needsCleanup) {
          localStorage.removeItem(STORAGE_KEYS.read)
        }
      }

      if (needsCleanup) {
        localStorage.setItem(STORAGE_KEYS.lastCleanup, String(Date.now()))
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  // Save dismissed IDs
  const saveDismissed = useCallback((ids: Set<string>) => {
    try {
      // Limit to most recent 100 entries to prevent unbounded growth
      const idsArray = [...ids].slice(-100)
      localStorage.setItem(STORAGE_KEYS.dismissed, JSON.stringify({
        ids: idsArray,
        timestamp: Date.now(),
      }))
    } catch {
      // Ignore storage errors
    }
  }, [])

  // Save read IDs
  const saveRead = useCallback((ids: Set<string>) => {
    try {
      const idsArray = [...ids].slice(-200)
      localStorage.setItem(STORAGE_KEYS.read, JSON.stringify({
        ids: idsArray,
        timestamp: Date.now(),
      }))
    } catch {
      // Ignore storage errors
    }
  }, [])

  const markDismissed = useCallback((id: string) => {
    setDismissedIds(prev => {
      const next = new Set(prev).add(id)
      saveDismissed(next)
      return next
    })
  }, [saveDismissed])

  const markRead = useCallback((id: string) => {
    setReadIds(prev => {
      const next = new Set(prev).add(id)
      saveRead(next)
      return next
    })
  }, [saveRead])

  const markAllRead = useCallback((ids: string[]) => {
    setReadIds(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.add(id))
      saveRead(next)
      return next
    })
  }, [saveRead])

  const isDismissed = useCallback((id: string) => dismissedIds.has(id), [dismissedIds])
  const isRead = useCallback((id: string) => readIds.has(id), [readIds])

  const clearAll = useCallback(() => {
    setDismissedIds(new Set())
    setReadIds(new Set())
    try {
      localStorage.removeItem(STORAGE_KEYS.dismissed)
      localStorage.removeItem(STORAGE_KEYS.read)
    } catch {
      // Ignore
    }
  }, [])

  return { 
    isDismissed, 
    isRead, 
    markDismissed, 
    markRead, 
    markAllRead,
    clearAll,
    dismissedCount: dismissedIds.size,
    readCount: readIds.size,
  }
}

// Hook for managing sound preferences
function useSoundPreferences() {
  const [prefs, setPrefs] = useState<SoundPreferences>(DEFAULT_SOUND_PREFS)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = localStorage.getItem('notification-sound-prefs')
      if (stored) {
        setPrefs({ ...DEFAULT_SOUND_PREFS, ...JSON.parse(stored) })
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  const updatePrefs = useCallback((updates: Partial<SoundPreferences>) => {
    setPrefs(prev => {
      const next = { ...prev, ...updates }
      try {
        localStorage.setItem('notification-sound-prefs', JSON.stringify(next))
      } catch {
        // Ignore storage errors
      }
      return next
    })
  }, [])

  const playSound = useCallback(() => {
    if (prefs.enabled && prefs.type !== 'none') {
      playNotificationSound(prefs.type, prefs.volume)
    }
  }, [prefs])

  const testSound = useCallback(() => {
    playNotificationSound(prefs.type, prefs.volume)
  }, [prefs])

  return { prefs, updatePrefs, playSound, testSound }
}

interface Notification {
  id: string
  type: 'alert' | 'event' | 'info' | 'success' | 'warning' | 'agent' | 'activity'
  title: string
  message: string
  timestamp: string
  read: boolean
  source?: string
  actionUrl?: string
  metadata?: Record<string, unknown>
}

interface NotificationsData {
  notifications: Notification[]
  unreadCount: number
}

const TYPE_CONFIG = {
  alert: {
    icon: '🚨',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
  warning: {
    icon: '⚠️',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  event: {
    icon: '📅',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  info: {
    icon: '💡',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  success: {
    icon: '✅',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  agent: {
    icon: '🤖',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
  },
  activity: {
    icon: '⚡',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
  },
}

function formatTimeAgo(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then

  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

function NotificationItem({ 
  notification, 
  onMarkRead,
  onDismiss 
}: { 
  notification: Notification
  onMarkRead: (id: string) => void
  onDismiss: (id: string) => void
}) {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info

  return (
    <div
      className={`
        relative flex items-start gap-3 p-3 rounded-xl
        ${config.bg} ${config.border} border
        ${!notification.read ? 'ring-1 ring-white/20' : 'opacity-80'}
        hover:opacity-100 transition-all duration-200 group
      `}
      onClick={() => !notification.read && onMarkRead(notification.id)}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
      )}

      {/* Icon */}
      <div className="text-lg flex-shrink-0 mt-0.5">
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <div className={`text-sm font-medium ${config.color} truncate`}>
          {notification.title}
        </div>
        <div className="text-xs text-white/60 mt-0.5 line-clamp-2">
          {notification.message}
        </div>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-white/40">
          <span>{formatTimeAgo(notification.timestamp)}</span>
          {notification.source && (
            <>
              <span>•</span>
              <span className="text-white/30">{notification.source}</span>
            </>
          )}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDismiss(notification.id)
        }}
        className="absolute top-2 right-2 p-1 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function NotificationSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="p-3 rounded-xl bg-white/5 border border-white/10 animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-8">
      <div className="text-4xl mb-3">🔔</div>
      <div className="text-white/60 text-sm">All caught up!</div>
      <div className="text-white/40 text-xs mt-1">No new notifications</div>
    </div>
  )
}

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<NotificationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'agents'>('all')
  const [showSoundSettings, setShowSoundSettings] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const prevUnreadCountRef = useRef<number>(0)
  const { prefs: soundPrefs, updatePrefs: updateSoundPrefs, playSound, testSound } = useSoundPreferences()
  const persistence = useNotificationPersistence()

  // Fetch notifications (combine alerts + events + agents + activity)
  const fetchNotifications = useCallback(async () => {
    try {
      // Fetch from multiple sources
      const [alertsRes, eventsRes, agentsRes, activityRes] = await Promise.allSettled([
        fetch('/api/health/alerts-history?limit=10&days=7'),
        fetch('/api/events?limit=10'),
        fetch('/api/agents'),
        fetch('/api/activity?limit=10'),
      ])

      const notifications: Notification[] = []

      // Parse alerts
      if (alertsRes.status === 'fulfilled' && alertsRes.value.ok) {
        const alertsData = await alertsRes.value.json()
        if (alertsData.alerts) {
          alertsData.alerts.forEach((alert: {
            id: string
            timestamp: string
            status: 'critical' | 'degraded' | 'healthy'
            message: string
            affectedServices?: string[]
            resolvedAt?: string
          }) => {
            notifications.push({
              id: `alert-${alert.id}`,
              type: alert.status === 'critical' ? 'alert' : alert.status === 'degraded' ? 'warning' : 'success',
              title: alert.status === 'critical' ? 'Critical Alert' : alert.status === 'degraded' ? 'Warning' : 'Resolved',
              message: alert.message,
              timestamp: alert.timestamp,
              read: !!alert.resolvedAt,
              source: alert.affectedServices?.join(', ') || 'System',
            })
          })
        }
      }

      // Parse events if available
      if (eventsRes.status === 'fulfilled' && eventsRes.value.ok) {
        const eventsData = await eventsRes.value.json()
        if (eventsData.events) {
          eventsData.events.forEach((event: {
            id: string
            timestamp: string
            type: string
            title: string
            description?: string
          }) => {
            notifications.push({
              id: `event-${event.id}`,
              type: 'event',
              title: event.title || event.type,
              message: event.description || '',
              timestamp: event.timestamp,
              read: true,
              source: 'Events',
            })
          })
        }
      }

      // Parse agent status
      if (agentsRes.status === 'fulfilled' && agentsRes.value.ok) {
        const agentsData = await agentsRes.value.json()
        if (agentsData.agents) {
          agentsData.agents.forEach((agent: {
            id: string
            status: 'running' | 'completed' | 'error'
            description: string
            startTime: string
            lastActivity: string
            tokensUsed?: number
            toolsUsed?: number
          }) => {
            const statusEmoji = agent.status === 'running' ? '🟢' : agent.status === 'completed' ? '✅' : '❌'
            const isRecent = Date.now() - new Date(agent.lastActivity).getTime() < 3600000 // 1 hour
            notifications.push({
              id: `agent-${agent.id}`,
              type: 'agent',
              title: `${statusEmoji} Agent ${agent.status}`,
              message: `${agent.description}${agent.tokensUsed ? ` • ${agent.tokensUsed.toLocaleString()} tokens` : ''}`,
              timestamp: agent.lastActivity,
              read: agent.status === 'completed' && !isRecent,
              source: agent.id,
              metadata: { tokensUsed: agent.tokensUsed, toolsUsed: agent.toolsUsed },
            })
          })
        }
      }

      // Parse activity feed
      if (activityRes.status === 'fulfilled' && activityRes.value.ok) {
        const activityData = await activityRes.value.json()
        if (activityData.activities) {
          activityData.activities.forEach((activity: {
            id: number | string
            type: string
            title: string
            description?: string
            actor?: string
            created_at: string
          }) => {
            // Map activity types to notification types
            const activityTypeMap: Record<string, 'activity' | 'agent' | 'success'> = {
              'deploy': 'success',
              'agent_action': 'agent',
              'post_approved': 'activity',
              'image_generated': 'activity',
              'book_updated': 'activity',
            }
            notifications.push({
              id: `activity-${activity.id}`,
              type: activityTypeMap[activity.type] || 'activity',
              title: activity.title,
              message: activity.description || '',
              timestamp: activity.created_at,
              read: true,
              source: activity.actor || 'System',
            })
          })
        }
      }

      // Sort by timestamp (newest first)
      notifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      // Apply persistence: filter dismissed and apply read status
      const persistedNotifications = notifications
        .filter(n => !persistence.isDismissed(n.id))
        .map(n => ({
          ...n,
          read: n.read || persistence.isRead(n.id),
        }))

      const unreadCount = persistedNotifications.filter(n => !n.read).length

      // Check if new notifications arrived and play sound
      const prevUnread = prevUnreadCountRef.current
      if (unreadCount > prevUnread && prevUnread !== 0) {
        playSound()
      }
      prevUnreadCountRef.current = unreadCount

      setData({ notifications: persistedNotifications, unreadCount })
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [playSound, persistence])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Auto-refresh every 30 seconds when open
  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [isOpen, fetchNotifications])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setShowSoundSettings(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close sound settings when panel closes
  useEffect(() => {
    if (!isOpen) {
      setShowSoundSettings(false)
    }
  }, [isOpen])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // N to toggle notification center (when not in input)
      if (
        event.key === 'n' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)
      ) {
        setIsOpen(prev => !prev)
        event.preventDefault()
      }
      // Escape to close
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
        event.preventDefault()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleMarkRead = useCallback((id: string) => {
    // Persist to localStorage
    persistence.markRead(id)
    
    setData(prev => {
      if (!prev) return prev
      const updated = prev.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
      return {
        notifications: updated,
        unreadCount: updated.filter(n => !n.read).length,
      }
    })
  }, [persistence])

  const handleDismiss = useCallback((id: string) => {
    // Persist dismissal to localStorage
    persistence.markDismissed(id)
    
    setData(prev => {
      if (!prev) return prev
      const updated = prev.notifications.filter(n => n.id !== id)
      return {
        notifications: updated,
        unreadCount: updated.filter(n => !n.read).length,
      }
    })
  }, [persistence])

  const handleMarkAllRead = useCallback(() => {
    // Persist all as read to localStorage
    if (data?.notifications) {
      persistence.markAllRead(data.notifications.map(n => n.id))
    }
    
    setData(prev => {
      if (!prev) return prev
      return {
        notifications: prev.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }
    })
  }, [persistence, data?.notifications])

  const filteredNotifications = data?.notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    if (filter === 'agents') return n.type === 'agent' || n.type === 'activity'
    return true
  }) || []

  const agentCount = data?.notifications.filter(n => 
    n.type === 'agent' || n.type === 'activity'
  ).length || 0

  const unreadCount = data?.unreadCount || 0

  return (
    <div className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-1.5 rounded-lg text-xs transition-colors
          ${isOpen
            ? 'bg-cyan-500/20 text-cyan-400'
            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
          }
        `}
        title="Notifications (N)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px] font-bold rounded-full bg-red-500 text-white flex items-center justify-center animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[70vh] rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>🔔</span> Notifications
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-cyan-500/20 text-cyan-400">
                  {unreadCount} new
                </span>
              )}
            </h3>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-white/50 hover:text-white/80 transition-colors"
                >
                  Mark all read
                </button>
              )}
              {/* Sound settings toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowSoundSettings(!showSoundSettings)}
                  className={`p-1 rounded-lg transition-colors ${
                    showSoundSettings 
                      ? 'bg-white/10 text-white/80' 
                      : 'text-white/40 hover:text-white/60 hover:bg-white/10'
                  }`}
                  title="Sound settings"
                >
                  {soundPrefs.enabled && soundPrefs.type !== 'none' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  )}
                </button>
                
                {/* Sound settings dropdown */}
                {showSoundSettings && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-xl p-3 z-10 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="text-xs font-medium text-white/70 mb-2">Sound Preferences</div>
                    
                    {/* Enable/disable toggle */}
                    <label className="flex items-center justify-between py-1.5 cursor-pointer group">
                      <span className="text-xs text-white/60 group-hover:text-white/80">Enable sounds</span>
                      <button
                        onClick={() => updateSoundPrefs({ enabled: !soundPrefs.enabled })}
                        className={`w-8 h-4 rounded-full transition-colors ${
                          soundPrefs.enabled ? 'bg-cyan-500' : 'bg-white/20'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full bg-white shadow transition-transform ${
                          soundPrefs.enabled ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </label>
                    
                    {/* Sound type selector */}
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Sound Type</div>
                      <div className="space-y-0.5">
                        {(Object.keys(SOUND_LABELS) as SoundType[]).map((type) => (
                          <button
                            key={type}
                            onClick={() => updateSoundPrefs({ type })}
                            className={`w-full text-left px-2 py-1 rounded-lg text-xs transition-colors ${
                              soundPrefs.type === type 
                                ? 'bg-cyan-500/20 text-cyan-400' 
                                : 'text-white/60 hover:bg-white/10 hover:text-white/80'
                            }`}
                          >
                            {SOUND_LABELS[type]}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Volume slider */}
                    {soundPrefs.type !== 'none' && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-white/40 uppercase tracking-wider">Volume</span>
                          <span className="text-[10px] text-white/50">{Math.round(soundPrefs.volume * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={soundPrefs.volume}
                          onChange={(e) => updateSoundPrefs({ volume: parseFloat(e.target.value) })}
                          className="w-full h-1.5 rounded-full appearance-none bg-white/20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400"
                        />
                      </div>
                    )}
                    
                    {/* Test sound button */}
                    {soundPrefs.type !== 'none' && (
                      <button
                        onClick={testSound}
                        className="w-full mt-2 px-2 py-1.5 rounded-lg text-xs text-white/60 hover:text-white/80 hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                        Test sound
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 py-2 border-b border-white/5 flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setFilter('agents')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors flex items-center gap-1 ${
                filter === 'agents'
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              <span>🤖</span> Agents {agentCount > 0 && `(${agentCount})`}
            </button>
          </div>

          {/* Content */}
          <div className="p-3 overflow-y-auto max-h-[50vh] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {loading ? (
              <NotificationSkeleton />
            ) : filteredNotifications.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-xs text-white/30">
            <span>Press N to toggle</span>
            <button
              onClick={fetchNotifications}
              className="text-white/50 hover:text-white/80 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Standalone bell icon for use in headers
export function NotificationBell({ className = '' }: { className?: string }) {
  return <NotificationCenter className={className} />
}

export default NotificationCenter

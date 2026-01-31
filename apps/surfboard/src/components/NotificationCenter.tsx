'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

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
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

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

      const unreadCount = notifications.filter(n => !n.read).length

      setData({ notifications, unreadCount })
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [])

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
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
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
  }, [])

  const handleDismiss = useCallback((id: string) => {
    setData(prev => {
      if (!prev) return prev
      const updated = prev.notifications.filter(n => n.id !== id)
      return {
        notifications: updated,
        unreadCount: updated.filter(n => !n.read).length,
      }
    })
  }, [])

  const handleMarkAllRead = useCallback(() => {
    setData(prev => {
      if (!prev) return prev
      return {
        notifications: prev.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }
    })
  }, [])

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

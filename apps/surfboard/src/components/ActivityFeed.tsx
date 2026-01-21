"use client"

import { useState, useEffect, useCallback } from 'react'

// Activity types with their icons and colors
const activityTypes = {
  post_approved: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20'
  },
  post_rejected: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20'
  },
  post_created: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20'
  },
  post_posted: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
      </svg>
    ),
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20'
  },
  image_generated: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20'
  },
  deploy: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20'
  },
  book_updated: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20'
  },
  agent_action: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20'
  }
}

type ActivityType = keyof typeof activityTypes

interface Activity {
  id: string | number
  type: ActivityType
  title: string
  description?: string
  created_at: string
  actor?: string
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

interface ActivityFeedProps {
  maxItems?: number
  showHeader?: boolean
  className?: string
}

export function ActivityFeed({ maxItems = 8, showHeader = true, className = '' }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLive, setIsLive] = useState(true)
  const [newActivityCount, setNewActivityCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch(`/api/activity?limit=${maxItems}`)
      if (res.ok) {
        const data = await res.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setIsLoading(false)
    }
  }, [maxItems])

  // Initial fetch
  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  // Periodic refresh when live
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      fetchActivities()
      setNewActivityCount(prev => prev + 1)
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [isLive, fetchActivities])

  if (isLoading) {
    return (
      <div className={`bg-white/5 rounded-xl border border-white/10 overflow-hidden ${className}`}>
        {showHeader && (
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-medium text-white">Activity Feed</span>
          </div>
        )}
        <div className="p-4 flex justify-center">
          <div className="w-5 h-5 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white/5 rounded-xl border border-white/10 overflow-hidden ${className}`}>
      {showHeader && (
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-medium text-white">Activity Feed</span>
            {newActivityCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-cyan-400/20 text-cyan-400 rounded-full">
                {newActivityCount} new
              </span>
            )}
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all ${
              isLive
                ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                : 'bg-white/5 text-white/40 border border-white/10'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-white/40'}`} />
            {isLive ? 'Live' : 'Paused'}
          </button>
        </div>
      )}

      <div className="divide-y divide-white/5">
        {activities.length === 0 ? (
          <div className="px-4 py-8 text-center text-white/40 text-sm">
            No activity yet
          </div>
        ) : (
          activities.map((activity, index) => {
            const config = activityTypes[activity.type] || activityTypes.agent_action
            return (
              <div
                key={activity.id}
                className="px-4 py-3 hover:bg-white/5 transition-colors group"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: index === 0 && newActivityCount > 0 ? 'slideIn 0.3s ease-out' : undefined
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg ${config.bg} ${config.color} ${config.border} border`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-white font-medium truncate">{activity.title}</span>
                      <span className="text-xs text-white/30 flex-shrink-0">{formatTimeAgo(activity.created_at)}</span>
                    </div>
                    {activity.description && (
                      <p className="text-xs text-white/50 mt-0.5 truncate">{activity.description}</p>
                    )}
                    {activity.actor && (
                      <span className="text-xs text-white/30 mt-1 inline-flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        {activity.actor}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="px-4 py-2 border-t border-white/5">
        <button
          onClick={() => {
            setNewActivityCount(0)
            fetchActivities()
          }}
          className="text-xs text-white/40 hover:text-white/60 transition-colors w-full text-center"
        >
          Refresh activity
        </button>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}

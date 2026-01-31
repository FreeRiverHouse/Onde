'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// Activity types
export type ActivityType = 
  | 'book_opened'
  | 'book_completed'
  | 'game_played'
  | 'game_won'
  | 'achievement_earned'
  | 'favorite_added'
  | 'favorite_removed'
  | 'playlist_listened'
  | 'recipe_viewed'
  | 'page_visited'
  | 'vr_experience'
  | 'reading_session'

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description?: string
  metadata?: Record<string, unknown>
  timestamp: string
  duration?: number // in minutes
}

export interface ActivityStats {
  totalBooks: number
  totalGames: number
  totalTimeSpent: number // in minutes
  achievementsEarned: number
  favoritesAdded: number
  sessionsToday: number
  sessionsThisWeek: number
  mostActiveDay: string
  longestStreak: number
  currentStreak: number
}

export interface ActivityFilters {
  type?: ActivityType | 'all'
  timeRange: 'today' | 'week' | 'month' | 'all'
}

const STORAGE_KEY = 'onde-activity-log'
const STATS_KEY = 'onde-activity-stats'

// Activity type configurations
export const ACTIVITY_CONFIG: Record<ActivityType, { 
  icon: string
  color: string
  bgColor: string
  label: string
}> = {
  book_opened: {
    icon: '📖',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Book Opened'
  },
  book_completed: {
    icon: '📚',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Book Completed'
  },
  game_played: {
    icon: '🎮',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Game Played'
  },
  game_won: {
    icon: '🏆',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Game Won'
  },
  achievement_earned: {
    icon: '⭐',
    color: 'text-onde-gold',
    bgColor: 'bg-onde-gold/20',
    label: 'Achievement Earned'
  },
  favorite_added: {
    icon: '❤️',
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    label: 'Added to Favorites'
  },
  favorite_removed: {
    icon: '💔',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    label: 'Removed from Favorites'
  },
  playlist_listened: {
    icon: '🎵',
    color: 'text-spotify-green',
    bgColor: 'bg-spotify-green/20',
    label: 'Playlist Listened'
  },
  recipe_viewed: {
    icon: '🍳',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'Recipe Viewed'
  },
  page_visited: {
    icon: '🧭',
    color: 'text-onde-teal',
    bgColor: 'bg-onde-teal/20',
    label: 'Page Visited'
  },
  vr_experience: {
    icon: '🥽',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    label: 'VR Experience'
  },
  reading_session: {
    icon: '⏱️',
    color: 'text-onde-ocean',
    bgColor: 'bg-onde-ocean/20',
    label: 'Reading Session'
  }
}

// Utility functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function isThisWeek(date: Date): boolean {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  return date >= startOfWeek
}

function isThisMonth(date: Date): boolean {
  const now = new Date()
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

function calculateStreak(activities: Activity[]): { current: number; longest: number } {
  if (activities.length === 0) return { current: 0, longest: 0 }

  const uniqueDays = new Set<string>()
  activities.forEach(a => {
    uniqueDays.add(new Date(a.timestamp).toDateString())
  })

  const sortedDays = Array.from(uniqueDays).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 1

  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  // Check if active today or yesterday for current streak
  if (sortedDays[0] === today || sortedDays[0] === yesterday) {
    currentStreak = 1
    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = new Date(sortedDays[i - 1])
      const currDate = new Date(sortedDays[i])
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000)
      
      if (diffDays === 1) {
        currentStreak++
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = new Date(sortedDays[i - 1])
    const currDate = new Date(sortedDays[i])
    const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000)
    
    if (diffDays === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

  return { current: currentStreak, longest: longestStreak }
}

function getMostActiveDay(activities: Activity[]): string {
  const dayCounts: Record<string, number> = {}
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  activities.forEach(a => {
    const day = dayNames[new Date(a.timestamp).getDay()]
    dayCounts[day] = (dayCounts[day] || 0) + 1
  })

  let maxDay = 'Monday'
  let maxCount = 0
  Object.entries(dayCounts).forEach(([day, count]) => {
    if (count > maxCount) {
      maxCount = count
      maxDay = day
    }
  })

  return maxDay
}

export function useActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setActivities(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load activities:', error)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities))
    } catch (error) {
      console.error('Failed to save activities:', error)
    }
  }, [activities, isLoaded])

  // Log a new activity
  const logActivity = useCallback((
    type: ActivityType,
    title: string,
    options?: {
      description?: string
      metadata?: Record<string, unknown>
      duration?: number
    }
  ) => {
    const activity: Activity = {
      id: generateId(),
      type,
      title,
      description: options?.description,
      metadata: options?.metadata,
      duration: options?.duration,
      timestamp: new Date().toISOString()
    }

    setActivities(prev => [activity, ...prev])
    return activity
  }, [])

  // Remove an activity
  const removeActivity = useCallback((id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id))
  }, [])

  // Clear all activities
  const clearActivities = useCallback(() => {
    setActivities([])
  }, [])

  // Filter activities by time range and type
  const getFilteredActivities = useCallback((filters: ActivityFilters): Activity[] => {
    return activities.filter(activity => {
      // Type filter
      if (filters.type && filters.type !== 'all' && activity.type !== filters.type) {
        return false
      }

      // Time range filter
      const date = new Date(activity.timestamp)
      switch (filters.timeRange) {
        case 'today':
          return isToday(date)
        case 'week':
          return isThisWeek(date)
        case 'month':
          return isThisMonth(date)
        default:
          return true
      }
    })
  }, [activities])

  // Calculate stats
  const stats = useMemo((): ActivityStats => {
    const streaks = calculateStreak(activities)
    const todayActivities = activities.filter(a => isToday(new Date(a.timestamp)))
    const weekActivities = activities.filter(a => isThisWeek(new Date(a.timestamp)))

    return {
      totalBooks: activities.filter(a => 
        a.type === 'book_opened' || a.type === 'book_completed'
      ).length,
      totalGames: activities.filter(a => 
        a.type === 'game_played' || a.type === 'game_won'
      ).length,
      totalTimeSpent: activities.reduce((sum, a) => sum + (a.duration || 0), 0),
      achievementsEarned: activities.filter(a => a.type === 'achievement_earned').length,
      favoritesAdded: activities.filter(a => a.type === 'favorite_added').length,
      sessionsToday: todayActivities.length,
      sessionsThisWeek: weekActivities.length,
      mostActiveDay: getMostActiveDay(activities),
      longestStreak: streaks.longest,
      currentStreak: streaks.current
    }
  }, [activities])

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, Activity[]> = {}
    
    activities.forEach(activity => {
      const date = new Date(activity.timestamp)
      let key: string
      
      if (isToday(date)) {
        key = 'Today'
      } else {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        if (date.toDateString() === yesterday.toDateString()) {
          key = 'Yesterday'
        } else if (isThisWeek(date)) {
          key = 'This Week'
        } else if (isThisMonth(date)) {
          key = 'This Month'
        } else {
          key = 'Earlier'
        }
      }
      
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(activity)
    })

    return groups
  }, [activities])

  // Export activities as JSON
  const exportAsJSON = useCallback(() => {
    const data = {
      exportedAt: new Date().toISOString(),
      stats,
      activities
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `onde-activity-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [activities, stats])

  // Import activities from JSON
  const importFromJSON = useCallback((jsonData: string) => {
    try {
      const data = JSON.parse(jsonData)
      if (data.activities && Array.isArray(data.activities)) {
        setActivities(prev => {
          const existingIds = new Set(prev.map(a => a.id))
          const newActivities = data.activities.filter((a: Activity) => !existingIds.has(a.id))
          return [...newActivities, ...prev].sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        })
        return true
      }
      return false
    } catch {
      console.error('Failed to import activities')
      return false
    }
  }, [])

  return {
    activities,
    isLoaded,
    stats,
    groupedActivities,
    logActivity,
    removeActivity,
    clearActivities,
    getFilteredActivities,
    exportAsJSON,
    importFromJSON,
    formatRelativeTime,
    ACTIVITY_CONFIG
  }
}

// Export utility for other hooks to use
export { formatRelativeTime }

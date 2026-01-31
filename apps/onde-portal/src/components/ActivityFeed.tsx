'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  useActivity, 
  ActivityType, 
  Activity,
  ACTIVITY_CONFIG 
} from '@/hooks/useActivity'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

type TimeRange = 'today' | 'week' | 'month' | 'all'
type TypeFilter = ActivityType | 'all'

interface ActivityFeedProps {
  showStats?: boolean
  showFilters?: boolean
  showExport?: boolean
  maxItems?: number
  compact?: boolean
}

// Format duration in minutes to human readable
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

// Activity item component
function ActivityItem({ 
  activity, 
  compact = false,
  onRemove
}: { 
  activity: Activity
  compact?: boolean
  onRemove?: (id: string) => void
}) {
  const config = ACTIVITY_CONFIG[activity.type]
  const { formatRelativeTime } = useActivity()
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex gap-4 ${compact ? 'py-2' : 'py-3'}`}>
        {/* Timeline dot and line */}
        <div className="flex flex-col items-center">
          <motion.div 
            className={`
              ${compact ? 'w-8 h-8 text-base' : 'w-10 h-10 text-lg'}
              ${config.bgColor} ${config.color}
              rounded-full flex items-center justify-center
              ring-2 ring-white shadow-sm
            `}
            whileHover={{ scale: 1.1 }}
          >
            {config.icon}
          </motion.div>
          <div className="w-px h-full bg-gradient-to-b from-gray-200 to-transparent mt-2" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium text-onde-ocean truncate ${compact ? 'text-sm' : ''}`}>
                {activity.title}
              </h4>
              {activity.description && !compact && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                  {activity.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
                  {config.label}
                </span>
                {activity.duration && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    ⏱️ {formatDuration(activity.duration)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatRelativeTime(activity.timestamp)}
              </span>
              {onRemove && showActions && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => onRemove(activity.id)}
                  aria-label="Remove activity"
                >
                  ✕
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Stats card component
function StatsCard({ 
  icon, 
  label, 
  value, 
  subValue,
  gradient
}: { 
  icon: string
  label: string
  value: string | number
  subValue?: string
  gradient?: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`
        p-4 rounded-2xl text-center
        ${gradient || 'bg-white/60 backdrop-blur-sm border border-onde-coral/10'}
        shadow-sm hover:shadow-md transition-all
      `}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-onde-ocean">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
      {subValue && (
        <div className="text-xs text-onde-teal mt-1">{subValue}</div>
      )}
    </motion.div>
  )
}

export function ActivityFeed({
  showStats = true,
  showFilters = true,
  showExport = true,
  maxItems,
  compact = false
}: ActivityFeedProps) {
  const { 
    activities,
    stats,
    groupedActivities,
    getFilteredActivities,
    removeActivity,
    exportAsJSON,
    clearActivities,
    isLoaded
  } = useActivity()

  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Get filtered activities
  const filteredActivities = useMemo(() => {
    let filtered = getFilteredActivities({ type: typeFilter, timeRange })
    if (maxItems) {
      filtered = filtered.slice(0, maxItems)
    }
    return filtered
  }, [getFilteredActivities, typeFilter, timeRange, maxItems])

  // Group filtered activities
  const filteredGrouped = useMemo(() => {
    const groups: Record<string, Activity[]> = {}
    
    filteredActivities.forEach(activity => {
      const date = new Date(activity.timestamp)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      let key: string
      if (date.toDateString() === today.toDateString()) {
        key = 'Today'
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Yesterday'
      } else {
        const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays < 7) {
          key = 'This Week'
        } else if (diffDays < 30) {
          key = 'This Month'
        } else {
          key = 'Earlier'
        }
      }
      
      if (!groups[key]) groups[key] = []
      groups[key].push(activity)
    })

    return groups
  }, [filteredActivities])

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: 'today', label: '📅 Today' },
    { value: 'week', label: '📆 This Week' },
    { value: 'month', label: '🗓️ This Month' },
    { value: 'all', label: '🌟 All Time' }
  ]

  const typeFilters: { value: TypeFilter; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '🔮' },
    { value: 'book_opened', label: 'Books', icon: '📖' },
    { value: 'game_played', label: 'Games', icon: '🎮' },
    { value: 'achievement_earned', label: 'Achievements', icon: '⭐' },
    { value: 'favorite_added', label: 'Favorites', icon: '❤️' },
    { value: 'reading_session', label: 'Sessions', icon: '⏱️' }
  ]

  if (!isLoaded) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatsCard
            icon="📚"
            label="Total Books"
            value={stats.totalBooks}
            gradient="bg-gradient-to-br from-blue-100 to-blue-50"
          />
          <StatsCard
            icon="🎮"
            label="Games Played"
            value={stats.totalGames}
            gradient="bg-gradient-to-br from-purple-100 to-purple-50"
          />
          <StatsCard
            icon="⏱️"
            label="Time Spent"
            value={formatDuration(stats.totalTimeSpent)}
            gradient="bg-gradient-to-br from-onde-teal/20 to-onde-ocean/10"
          />
          <StatsCard
            icon="⭐"
            label="Achievements"
            value={stats.achievementsEarned}
            gradient="bg-gradient-to-br from-onde-gold/20 to-amber-100"
          />
          <StatsCard
            icon="🔥"
            label="Current Streak"
            value={`${stats.currentStreak} days`}
            subValue={`Best: ${stats.longestStreak} days`}
            gradient="bg-gradient-to-br from-onde-coral/20 to-orange-100"
          />
          <StatsCard
            icon="📊"
            label="This Week"
            value={stats.sessionsThisWeek}
            subValue={`Most active: ${stats.mostActiveDay}`}
            gradient="bg-gradient-to-br from-green-100 to-emerald-50"
          />
        </div>
      )}

      {/* Filters and Actions */}
      {(showFilters || showExport) && (
        <Card variant="gradient">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {showFilters && (
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  {/* Time Range Tabs */}
                  <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-xl">
                    {timeRanges.map(range => (
                      <button
                        key={range.value}
                        onClick={() => setTimeRange(range.value)}
                        className={`
                          px-3 py-1.5 text-sm rounded-lg transition-all
                          ${timeRange === range.value 
                            ? 'bg-white text-onde-ocean shadow-sm font-medium' 
                            : 'text-gray-600 hover:text-onde-ocean'
                          }
                        `}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>

                  {/* Type Filter */}
                  <div className="flex flex-wrap gap-1">
                    {typeFilters.map(filter => (
                      <button
                        key={filter.value}
                        onClick={() => setTypeFilter(filter.value)}
                        className={`
                          px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1
                          ${typeFilter === filter.value 
                            ? 'bg-onde-ocean text-white shadow-sm' 
                            : 'bg-white/60 text-gray-600 hover:bg-white hover:text-onde-ocean border border-gray-200'
                          }
                        `}
                      >
                        <span>{filter.icon}</span>
                        <span className="hidden sm:inline">{filter.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showExport && (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={exportAsJSON}
                    disabled={activities.length === 0}
                    className="
                      px-4 py-2 text-sm rounded-xl
                      bg-onde-ocean text-white
                      disabled:opacity-50 disabled:cursor-not-allowed
                      hover:bg-onde-ocean/90 transition-colors
                      flex items-center gap-2
                    "
                  >
                    📥 Export
                  </motion.button>
                  {activities.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowClearConfirm(true)}
                      className="
                        px-4 py-2 text-sm rounded-xl
                        bg-red-100 text-red-600
                        hover:bg-red-200 transition-colors
                      "
                    >
                      🗑️
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-onde-ocean mb-2">Clear All Activity?</h3>
                <p className="text-gray-600 mb-6">
                  This will permanently delete all {activities.length} activities. This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      clearActivities()
                      setShowClearConfirm(false)
                    }}
                    className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Delete All
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              📋 Activity Timeline
              <span className="text-sm font-normal text-gray-500">
                ({filteredActivities.length} activities)
              </span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🌊</div>
              <h3 className="text-xl font-semibold text-onde-ocean mb-2">No Activity Yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {timeRange !== 'all' 
                  ? `No activities found for the selected time range. Try "All Time" to see everything.`
                  : 'Start exploring books, games, and more to see your activity here!'
                }
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {Object.entries(filteredGrouped).map(([group, items]) => (
                  <motion.div
                    key={group}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm py-2 mb-2">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                        {group}
                      </h3>
                    </div>
                    <div className="space-y-0">
                      <AnimatePresence mode="popLayout">
                        {items.map(activity => (
                          <ActivityItem
                            key={activity.id}
                            activity={activity}
                            compact={compact}
                            onRemove={removeActivity}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ActivityFeed

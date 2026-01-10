'use client'

interface TimelineItem {
  id: string
  title: string
  status: string
  timestamp: string
  category: string
}

interface TimelineProps {
  items: TimelineItem[]
}

export default function Timeline({ items }: TimelineProps) {
  // Format timestamp to relative time
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Get badge color based on category
  const getCategoryBadge = (category: string): string => {
    const badges: Record<string, string> = {
      publishing: 'badge-green',
      multimedia: 'badge-blue',
      apps: 'badge-purple',
      pr: 'badge-yellow',
      branding: 'bg-pink-500/20 text-pink-400',
      tools: 'bg-cyan-500/20 text-cyan-400',
      'video-factory': 'badge-blue',
    }
    return badges[category.toLowerCase()] || 'bg-gray-500/20 text-gray-400'
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    if (status === 'completed') {
      return (
        <svg className="w-4 h-4 text-onde-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
    if (status === 'in_progress') {
      return (
        <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    }
    return null
  }

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <span className="text-sm opacity-40">{items.length} events</span>
      </div>

      <div className="space-y-0 max-h-[500px] overflow-y-auto pr-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="timeline-item group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="timeline-dot group-hover:scale-125 transition-transform flex items-center justify-center">
              {item.status === 'completed' && (
                <div className="w-2 h-2 bg-onde-dark rounded-full"></div>
              )}
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(item.status)}
                  <span className={`badge ${getCategoryBadge(item.category)}`}>
                    {item.category}
                  </span>
                </div>
                <p className="font-medium truncate group-hover:text-onde-gold transition-colors">
                  {item.title}
                </p>
                <p className="text-sm opacity-40">
                  {item.id}
                </p>
              </div>
              <span className="text-sm opacity-40 whitespace-nowrap">
                {formatTime(item.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 opacity-40">
          <p>No recent activity</p>
        </div>
      )}
    </div>
  )
}

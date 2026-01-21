// Types
export interface Task {
  id: string
  title: string
  description: string
  category: string
  priority: number
  status: string
  dependencies: string[]
  estimated_effort: string
  files_involved: string[]
  claimed_by: string | null
  claimed_at: string | null
  completed_at?: string
  created_at?: string
}

export interface DashboardStats {
  tasks: {
    total: number
    completed: number
    inProgress: number
    available: number
    blocked: number
    completionRate: number
  }
  categories: {
    name: string
    completed: number
    total: number
  }[]
  recentActivity: {
    id: string
    title: string
    status: string
    timestamp: string
    category: string
  }[]
  publishing: {
    booksPublished: number
    audiobooks: number
    podcasts: number
    videos: number
  }
  social: {
    xFollowers: number
    igFollowers: number
    tiktokFollowers: number
    postsThisWeek: number
  }
  revenue: {
    kdpEarnings: string
    spotifyPlays: string
    youtubeViews: string
  }
  activeWorkers: number
  lastUpdated: string
}

// Main data fetching function - returns dashboard stats
export async function getDashboardStats(): Promise<DashboardStats> {
  // In production, this could fetch from an API
  // For now, return static data
  return {
    tasks: {
      total: 158,
      completed: 98,
      inProgress: 18,
      available: 22,
      blocked: 20,
      completionRate: 62
    },
    categories: [
      { name: 'multimedia', completed: 25, total: 35 },
      { name: 'apps', completed: 20, total: 28 },
      { name: 'publishing', completed: 12, total: 15 },
      { name: 'pr', completed: 18, total: 22 },
      { name: 'branding', completed: 8, total: 10 },
      { name: 'tools', completed: 15, total: 20 }
    ],
    recentActivity: [
      { id: 'kdp-004', title: 'Pubblicare Piccole Rime', status: 'completed', timestamp: '2026-01-09T09:06:41.726Z', category: 'publishing' },
      { id: 'youtube-001', title: 'Creare canale YouTube Onde Lounge', status: 'completed', timestamp: '2026-01-09T09:02:03.049Z', category: 'multimedia' },
      { id: 'podcast-001', title: 'Ep.02 Pioggerellina di Marzo', status: 'completed', timestamp: '2026-01-09T09:01:43.506Z', category: 'multimedia' }
    ],
    publishing: {
      booksPublished: 8,
      audiobooks: 2,
      podcasts: 5,
      videos: 12
    },
    social: {
      xFollowers: 156,
      igFollowers: 42,
      tiktokFollowers: 28,
      postsThisWeek: 12
    },
    revenue: {
      kdpEarnings: 'Coming Soon',
      spotifyPlays: 'Coming Soon',
      youtubeViews: 'Coming Soon'
    },
    activeWorkers: 8,
    lastUpdated: new Date().toISOString()
  }
}

import fs from 'fs'
import path from 'path'

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

export interface TasksData {
  version: string
  last_updated: string
  total_tasks: number
  tasks: Task[]
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

// Helper function to count tasks by status
function countByStatus(tasks: Task[], status: string): number {
  return tasks.filter(t => t.status === status).length
}

// Helper function to get category stats
function getCategoryStats(tasks: Task[]): { name: string; completed: number; total: number }[] {
  const categories = new Map<string, { completed: number; total: number }>()

  tasks.forEach(task => {
    const cat = task.category.toLowerCase()
    const current = categories.get(cat) || { completed: 0, total: 0 }
    current.total++
    if (task.status === 'completed') current.completed++
    categories.set(cat, current)
  })

  return Array.from(categories.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8) // Top 8 categories
}

// Helper function to get recent activity
function getRecentActivity(tasks: Task[]): DashboardStats['recentActivity'] {
  return tasks
    .filter(t => t.completed_at || t.claimed_at)
    .map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      timestamp: t.completed_at || t.claimed_at || '',
      category: t.category.toLowerCase()
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15)
}

// Count published items based on completed tasks
function countPublishing(tasks: Task[]): DashboardStats['publishing'] {
  const completed = tasks.filter(t => t.status === 'completed')

  return {
    booksPublished: completed.filter(t =>
      t.id.startsWith('kdp-') ||
      t.id.startsWith('slant-')
    ).length,
    audiobooks: completed.filter(t => t.id.startsWith('audiobook-')).length,
    podcasts: completed.filter(t => t.id.startsWith('podcast-')).length,
    videos: completed.filter(t =>
      t.id.startsWith('video-') ||
      t.category.toLowerCase() === 'multimedia'
    ).length
  }
}

// Count active workers
function countActiveWorkers(tasks: Task[]): number {
  const activeClaimers = new Set<string>()
  tasks
    .filter(t => t.status === 'in_progress' && t.claimed_by)
    .forEach(t => activeClaimers.add(t.claimed_by!))
  return activeClaimers.size
}

// Main data fetching function
export async function getDashboardStats(): Promise<DashboardStats> {
  const tasksPath = path.join(process.cwd(), '..', '..', '.claude-workers', 'TASKS.json')

  let tasksData: TasksData

  try {
    const fileContent = fs.readFileSync(tasksPath, 'utf-8')
    tasksData = JSON.parse(fileContent)
  } catch (error) {
    // Return mock data if file not found
    return getMockStats()
  }

  const tasks = tasksData.tasks
  const completed = countByStatus(tasks, 'completed')
  const inProgress = countByStatus(tasks, 'in_progress')
  const available = countByStatus(tasks, 'available')
  const blocked = tasks.filter(t =>
    t.status === 'available' &&
    t.dependencies.length > 0 &&
    t.dependencies.some(dep => {
      const depTask = tasks.find(dt => dt.id === dep)
      return depTask && depTask.status !== 'completed'
    })
  ).length

  return {
    tasks: {
      total: tasksData.total_tasks,
      completed,
      inProgress,
      available: available - blocked,
      blocked,
      completionRate: Math.round((completed / tasksData.total_tasks) * 100)
    },
    categories: getCategoryStats(tasks),
    recentActivity: getRecentActivity(tasks),
    publishing: countPublishing(tasks),
    social: {
      // Placeholder values - would come from API integrations
      xFollowers: 156,
      igFollowers: 42,
      tiktokFollowers: 28,
      postsThisWeek: 12
    },
    revenue: {
      // Placeholder values - would come from KDP, Spotify APIs
      kdpEarnings: 'Coming Soon',
      spotifyPlays: 'Coming Soon',
      youtubeViews: 'Coming Soon'
    },
    activeWorkers: countActiveWorkers(tasks),
    lastUpdated: tasksData.last_updated
  }
}

// Mock data for development/fallback
function getMockStats(): DashboardStats {
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

// Get completion history for chart (last 7 days)
export function getCompletionHistory(tasks: Task[]): { day: string; completed: number }[] {
  const history: { day: string; completed: number }[] = []
  const now = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dayStr = date.toISOString().split('T')[0]
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' })

    const completedOnDay = tasks.filter(t => {
      if (!t.completed_at) return false
      return t.completed_at.startsWith(dayStr)
    }).length

    history.push({ day: dayLabel, completed: completedOnDay })
  }

  return history
}

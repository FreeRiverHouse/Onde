"use client"

import { StatsCard } from './StatsCard'

interface EnhancedStatsProps {
  stats: {
    publishing: { booksPublished: number }
    tasks: { completionRate: number; inProgress: number }
    activeWorkers: number
    social: { postsThisWeek: number }
  }
}

// Generate mock sparkline data for visualization
function generateSparklineData(base: number, variance: number = 0.3, points: number = 10): number[] {
  const data: number[] = []
  let current = base * (1 - variance)
  for (let i = 0; i < points; i++) {
    // Trending upward with some randomness
    const trend = (i / points) * (base * variance * 2)
    const random = (Math.random() - 0.3) * (base * variance * 0.5)
    current = Math.max(0, base * (1 - variance) + trend + random)
    data.push(current)
  }
  // Ensure last point is close to actual value
  data[data.length - 1] = base
  return data
}

export function EnhancedStats({ stats }: EnhancedStatsProps) {
  const booksData = generateSparklineData(stats.publishing.booksPublished, 0.4, 8)
  const completionData = generateSparklineData(stats.tasks.completionRate, 0.2, 10)
  const inProgressData = generateSparklineData(stats.tasks.inProgress, 0.5, 8)
  const agentsData = generateSparklineData(stats.activeWorkers, 0.3, 8)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      <StatsCard
        title="Books Published"
        value={stats.publishing.booksPublished}
        sparklineData={booksData}
        chartType="bars"
        color="cyan"
        trend="up"
        trendValue="+2 this month"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }
      />

      <StatsCard
        title="Task Completion"
        value={stats.tasks.completionRate}
        suffix="%"
        sparklineData={completionData}
        chartType="sparkline"
        color="emerald"
        trend="up"
        trendValue="+5% vs last week"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      <StatsCard
        title="In Progress"
        value={stats.tasks.inProgress}
        sparklineData={inProgressData}
        chartType="sparkline"
        color="amber"
        trend="neutral"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      <StatsCard
        title="Active Agents"
        value={stats.activeWorkers}
        sparklineData={agentsData}
        chartType="bars"
        color="purple"
        trend="up"
        trendValue="All online"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
      />
    </div>
  )
}

// Weekly comparison stats
interface WeeklyComparisonProps {
  stats: {
    tasks: { completed: number; total: number }
    social: { postsThisWeek: number }
    publishing: { booksPublished: number }
  }
}

export function WeeklyComparison({ stats }: WeeklyComparisonProps) {
  // Mock last week data
  const lastWeek = {
    tasksCompleted: stats.tasks.completed - 12,
    posts: stats.social.postsThisWeek - 3,
    books: stats.publishing.booksPublished - 1
  }

  const tasksDiff = stats.tasks.completed - lastWeek.tasksCompleted
  const postsDiff = stats.social.postsThisWeek - lastWeek.posts

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">Weekly Progress</h3>
        <span className="text-xs text-white/40">vs last week</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Tasks Completed</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{stats.tasks.completed}</span>
            <span className={`text-xs ${tasksDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {tasksDiff >= 0 ? '+' : ''}{tasksDiff}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Posts Published</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{stats.social.postsThisWeek}</span>
            <span className={`text-xs ${postsDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {postsDiff >= 0 ? '+' : ''}{postsDiff}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Books Published</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{stats.publishing.booksPublished}</span>
            <span className="text-xs text-emerald-400">+1</span>
          </div>
        </div>
      </div>

      {/* Mini progress bar */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-white/40">Weekly goal progress</span>
          <span className="text-cyan-400">78%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-1000"
            style={{ width: '78%' }}
          />
        </div>
      </div>
    </div>
  )
}

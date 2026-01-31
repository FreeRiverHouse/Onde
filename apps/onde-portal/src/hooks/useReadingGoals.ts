'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

const STORAGE_KEY = 'onde-reading-goals'

export type GoalPeriod = 'weekly' | 'monthly'
export type GoalType = 'pages' | 'books'

export interface ReadingGoal {
  id: string
  period: GoalPeriod
  type: GoalType
  target: number
  progress: number
  startDate: string
  endDate: string
  milestones: {
    25: boolean
    50: boolean
    75: boolean
    100: boolean
  }
  completedAt?: string
  shared?: boolean
}

export interface GoalHistory {
  id: string
  period: GoalPeriod
  type: GoalType
  target: number
  achieved: number
  startDate: string
  endDate: string
  completed: boolean
  percentage: number
}

export interface StreakData {
  current: number
  longest: number
  lastCompletedDate: string
  weeklyCompletions: number
  monthlyCompletions: number
}

export interface ReadingGoalsState {
  activeGoal: ReadingGoal | null
  history: GoalHistory[]
  streak: StreakData
  totalPagesRead: number
  totalBooksCompleted: number
}

const DEFAULT_STATE: ReadingGoalsState = {
  activeGoal: null,
  history: [],
  streak: {
    current: 0,
    longest: 0,
    lastCompletedDate: '',
    weeklyCompletions: 0,
    monthlyCompletions: 0
  },
  totalPagesRead: 0,
  totalBooksCompleted: 0
}

// Helper to get week boundaries (Sunday to Saturday)
function getWeekBounds(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date)
  start.setDate(date.getDate() - date.getDay())
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

// Helper to get month boundaries
function getMonthBounds(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

// Generate unique ID
function generateId(): string {
  return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function useReadingGoals() {
  const [state, setState] = useState<ReadingGoalsState>(DEFAULT_STATE)
  const [mounted, setMounted] = useState(false)
  const [celebratingMilestone, setCelebratingMilestone] = useState<number | null>(null)
  const [justCompleted, setJustCompleted] = useState(false)

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ReadingGoalsState
        setState(parsed)
      }
    } catch (e) {
      console.error('Failed to load reading goals:', e)
    }
    setMounted(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (e) {
        console.error('Failed to save reading goals:', e)
      }
    }
  }, [state, mounted])

  // Check if active goal has expired and archive it
  useEffect(() => {
    if (!mounted || !state.activeGoal) return

    const now = new Date()
    const endDate = new Date(state.activeGoal.endDate)

    if (now > endDate) {
      // Archive the expired goal
      archiveGoal()
    }
  }, [mounted, state.activeGoal])

  // Create a new goal
  const createGoal = useCallback((
    period: GoalPeriod,
    type: GoalType,
    target: number
  ): ReadingGoal => {
    const now = new Date()
    const bounds = period === 'weekly' ? getWeekBounds(now) : getMonthBounds(now)

    const newGoal: ReadingGoal = {
      id: generateId(),
      period,
      type,
      target,
      progress: 0,
      startDate: bounds.start.toISOString(),
      endDate: bounds.end.toISOString(),
      milestones: {
        25: false,
        50: false,
        75: false,
        100: false
      }
    }

    setState(prev => {
      // If there's an active goal, archive it first
      const history = prev.activeGoal ? [
        ...prev.history,
        {
          id: prev.activeGoal.id,
          period: prev.activeGoal.period,
          type: prev.activeGoal.type,
          target: prev.activeGoal.target,
          achieved: prev.activeGoal.progress,
          startDate: prev.activeGoal.startDate,
          endDate: prev.activeGoal.endDate,
          completed: prev.activeGoal.completedAt !== undefined,
          percentage: Math.min(100, Math.round((prev.activeGoal.progress / prev.activeGoal.target) * 100))
        }
      ] : prev.history

      return {
        ...prev,
        activeGoal: newGoal,
        history
      }
    })

    return newGoal
  }, [])

  // Update goal progress
  const updateProgress = useCallback((amount: number, isAbsolute: boolean = false) => {
    setState(prev => {
      if (!prev.activeGoal) return prev

      const newProgress = isAbsolute ? amount : prev.activeGoal.progress + amount
      const clampedProgress = Math.max(0, newProgress)
      const percentage = (clampedProgress / prev.activeGoal.target) * 100

      // Check for new milestones
      const newMilestones = { ...prev.activeGoal.milestones }
      let newMilestoneReached: number | null = null

      const milestoneThresholds = [25, 50, 75, 100] as const
      for (const threshold of milestoneThresholds) {
        if (percentage >= threshold && !newMilestones[threshold]) {
          newMilestones[threshold] = true
          newMilestoneReached = threshold
        }
      }

      // Trigger milestone celebration
      if (newMilestoneReached !== null) {
        setCelebratingMilestone(newMilestoneReached)
        setTimeout(() => setCelebratingMilestone(null), 3000)
      }

      // Check if goal completed
      const isNowCompleted = clampedProgress >= prev.activeGoal.target && !prev.activeGoal.completedAt
      if (isNowCompleted) {
        setJustCompleted(true)
        setTimeout(() => setJustCompleted(false), 5000)
      }

      // Update streak if just completed
      let newStreak = { ...prev.streak }
      if (isNowCompleted) {
        const today = new Date().toDateString()
        const lastCompleted = prev.streak.lastCompletedDate
        const lastDate = lastCompleted ? new Date(lastCompleted).toDateString() : ''

        if (lastDate === today) {
          // Already counted today
        } else {
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          
          if (lastDate === yesterday.toDateString()) {
            // Consecutive completion
            newStreak.current += 1
          } else {
            // Streak broken or first completion
            newStreak.current = 1
          }

          newStreak.longest = Math.max(newStreak.longest, newStreak.current)
          newStreak.lastCompletedDate = today

          if (prev.activeGoal.period === 'weekly') {
            newStreak.weeklyCompletions += 1
          } else {
            newStreak.monthlyCompletions += 1
          }
        }
      }

      // Update totals based on goal type
      const progressDelta = clampedProgress - prev.activeGoal.progress
      const newTotalPages = prev.activeGoal.type === 'pages' 
        ? prev.totalPagesRead + Math.max(0, progressDelta)
        : prev.totalPagesRead
      const newTotalBooks = prev.activeGoal.type === 'books'
        ? prev.totalBooksCompleted + Math.max(0, progressDelta)
        : prev.totalBooksCompleted

      return {
        ...prev,
        activeGoal: {
          ...prev.activeGoal,
          progress: clampedProgress,
          milestones: newMilestones,
          completedAt: isNowCompleted ? new Date().toISOString() : prev.activeGoal.completedAt
        },
        streak: newStreak,
        totalPagesRead: newTotalPages,
        totalBooksCompleted: newTotalBooks
      }
    })
  }, [])

  // Add pages read
  const addPagesRead = useCallback((pages: number) => {
    if (state.activeGoal?.type === 'pages') {
      updateProgress(pages)
    } else {
      // Just track total pages even if current goal is books
      setState(prev => ({
        ...prev,
        totalPagesRead: prev.totalPagesRead + pages
      }))
    }
  }, [state.activeGoal?.type, updateProgress])

  // Add books completed
  const addBooksCompleted = useCallback((books: number = 1) => {
    if (state.activeGoal?.type === 'books') {
      updateProgress(books)
    } else {
      // Just track total books even if current goal is pages
      setState(prev => ({
        ...prev,
        totalBooksCompleted: prev.totalBooksCompleted + books
      }))
    }
  }, [state.activeGoal?.type, updateProgress])

  // Archive current goal to history
  const archiveGoal = useCallback(() => {
    setState(prev => {
      if (!prev.activeGoal) return prev

      const historyEntry: GoalHistory = {
        id: prev.activeGoal.id,
        period: prev.activeGoal.period,
        type: prev.activeGoal.type,
        target: prev.activeGoal.target,
        achieved: prev.activeGoal.progress,
        startDate: prev.activeGoal.startDate,
        endDate: prev.activeGoal.endDate,
        completed: prev.activeGoal.completedAt !== undefined,
        percentage: Math.min(100, Math.round((prev.activeGoal.progress / prev.activeGoal.target) * 100))
      }

      return {
        ...prev,
        activeGoal: null,
        history: [...prev.history, historyEntry]
      }
    })
  }, [])

  // Delete current goal without archiving
  const deleteGoal = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeGoal: null
    }))
  }, [])

  // Clear history
  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      history: []
    }))
  }, [])

  // Mark goal as shared
  const markAsShared = useCallback(() => {
    setState(prev => {
      if (!prev.activeGoal) return prev
      return {
        ...prev,
        activeGoal: {
          ...prev.activeGoal,
          shared: true
        }
      }
    })
  }, [])

  // Generate share text
  const generateShareText = useCallback((): string => {
    if (!state.activeGoal) return ''

    const { type, target, progress, period, milestones } = state.activeGoal
    const percentage = Math.min(100, Math.round((progress / target) * 100))
    const unit = type === 'pages' ? 'pages' : 'books'
    const periodLabel = period === 'weekly' ? 'this week' : 'this month'

    if (milestones[100]) {
      return `🎉 I completed my reading goal! Read ${target} ${unit} ${periodLabel} on Onde! 📚 #ReadingGoals #Onde`
    }

    const latestMilestone = milestones[75] ? 75 : milestones[50] ? 50 : milestones[25] ? 25 : 0
    
    if (latestMilestone > 0) {
      return `📖 ${latestMilestone}% of my reading goal done! ${progress}/${target} ${unit} ${periodLabel} on Onde! 🔥 #ReadingGoals #Onde`
    }

    return `📚 Working on my reading goal: ${progress}/${target} ${unit} ${periodLabel} on Onde! #ReadingGoals #Onde`
  }, [state.activeGoal])

  // Get goal percentage
  const getPercentage = useMemo((): number => {
    if (!state.activeGoal) return 0
    return Math.min(100, Math.round((state.activeGoal.progress / state.activeGoal.target) * 100))
  }, [state.activeGoal])

  // Get days remaining
  const getDaysRemaining = useMemo((): number => {
    if (!state.activeGoal) return 0
    const now = new Date()
    const end = new Date(state.activeGoal.endDate)
    const diff = end.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [state.activeGoal])

  // Get recent history (last 10)
  const recentHistory = useMemo((): GoalHistory[] => {
    return [...state.history].reverse().slice(0, 10)
  }, [state.history])

  // Get stats summary
  const stats = useMemo(() => {
    const totalGoals = state.history.length + (state.activeGoal ? 1 : 0)
    const completedGoals = state.history.filter(g => g.completed).length
    const successRate = totalGoals > 0 ? Math.round((completedGoals / state.history.length) * 100) : 0

    return {
      totalGoals,
      completedGoals,
      successRate,
      totalPagesRead: state.totalPagesRead,
      totalBooksCompleted: state.totalBooksCompleted,
      currentStreak: state.streak.current,
      longestStreak: state.streak.longest,
      weeklyCompletions: state.streak.weeklyCompletions,
      monthlyCompletions: state.streak.monthlyCompletions
    }
  }, [state])

  // Reset all data
  const resetAll = useCallback(() => {
    setState(DEFAULT_STATE)
  }, [])

  return {
    // State
    mounted,
    activeGoal: state.activeGoal,
    history: state.history,
    recentHistory,
    streak: state.streak,
    stats,

    // Computed
    percentage: getPercentage,
    daysRemaining: getDaysRemaining,

    // Celebration states
    celebratingMilestone,
    justCompleted,

    // Actions
    createGoal,
    updateProgress,
    addPagesRead,
    addBooksCompleted,
    archiveGoal,
    deleteGoal,
    clearHistory,
    markAsShared,
    generateShareText,
    resetAll
  }
}

export type UseReadingGoalsReturn = ReturnType<typeof useReadingGoals>

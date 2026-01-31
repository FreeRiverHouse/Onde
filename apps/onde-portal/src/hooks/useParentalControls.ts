'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'onde-parental-controls'
const ACTIVITY_LOG_KEY = 'onde-activity-log'
const PIN_VERIFIED_SESSION_KEY = 'onde-pin-verified'

// ============================================
// Types
// ============================================

export interface TimeLimit {
  enabled: boolean
  dailyMinutes: number // 0 = unlimited
  weekdayMinutes: number // Mon-Fri limit
  weekendMinutes: number // Sat-Sun limit
  bedtimeStart: string // e.g., "21:00"
  bedtimeEnd: string // e.g., "07:00"
  bedtimeEnabled: boolean
}

export interface ContentFilter {
  enabled: boolean
  maxAgeRating: number // 0-18
  hideViolent: boolean
  hideScary: boolean
  safeSearchEnabled: boolean
}

export interface ActivityLogEntry {
  id: string
  type: 'book_opened' | 'book_completed' | 'game_played' | 'session_start' | 'session_end'
  contentId?: string
  contentTitle?: string
  timestamp: string
  durationMinutes?: number
}

export interface ParentalControls {
  pinHash: string | null // SHA-256 hash of 4-digit PIN
  kidsMode: boolean
  timeLimit: TimeLimit
  contentFilter: ContentFilter
  restrictedContent: string[] // IDs of blocked books/games
  allowedContent: string[] // IDs of explicitly allowed content (whitelist mode)
  useWhitelist: boolean // if true, only allowed content is accessible
  lastPinChange: string | null
  setupComplete: boolean
}

export interface DailyUsage {
  date: string
  minutes: number
  sessions: { start: string; end: string }[]
}

const DEFAULT_TIME_LIMIT: TimeLimit = {
  enabled: false,
  dailyMinutes: 120, // 2 hours
  weekdayMinutes: 60, // 1 hour on school days
  weekendMinutes: 180, // 3 hours on weekends
  bedtimeStart: '21:00',
  bedtimeEnd: '07:00',
  bedtimeEnabled: false,
}

const DEFAULT_CONTENT_FILTER: ContentFilter = {
  enabled: false,
  maxAgeRating: 12,
  hideViolent: true,
  hideScary: false,
  safeSearchEnabled: true,
}

const DEFAULT_PARENTAL_CONTROLS: ParentalControls = {
  pinHash: null,
  kidsMode: false,
  timeLimit: DEFAULT_TIME_LIMIT,
  contentFilter: DEFAULT_CONTENT_FILTER,
  restrictedContent: [],
  allowedContent: [],
  useWhitelist: false,
  lastPinChange: null,
  setupComplete: false,
}

// ============================================
// Utility Functions
// ============================================

// Simple SHA-256 hash using Web Crypto API
async function hashPin(pin: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(pin + 'onde-salt-2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Verify PIN against stored hash
async function verifyPin(pin: string, hash: string): Promise<boolean> {
  const inputHash = await hashPin(pin)
  return inputHash === hash
}

// Get today's date as YYYY-MM-DD
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

// Check if it's a weekend
function isWeekend(): boolean {
  const day = new Date().getDay()
  return day === 0 || day === 6
}

// Check if current time is within bedtime
function isInBedtime(start: string, end: string): boolean {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)
  
  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM
  
  // Handle overnight bedtime (e.g., 21:00 to 07:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes
  }
  
  return currentMinutes >= startMinutes && currentMinutes < endMinutes
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================
// Hook
// ============================================

export function useParentalControls() {
  const [controls, setControls] = useState<ParentalControls>(DEFAULT_PARENTAL_CONTROLS)
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([])
  const [dailyUsage, setDailyUsage] = useState<Record<string, DailyUsage>>({})
  const [isPinVerified, setIsPinVerified] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      // Load controls
      const storedControls = localStorage.getItem(STORAGE_KEY)
      if (storedControls) {
        const parsed = JSON.parse(storedControls) as ParentalControls
        setControls({
          ...DEFAULT_PARENTAL_CONTROLS,
          ...parsed,
          timeLimit: { ...DEFAULT_TIME_LIMIT, ...parsed.timeLimit },
          contentFilter: { ...DEFAULT_CONTENT_FILTER, ...parsed.contentFilter },
        })
      }

      // Load activity log
      const storedActivity = localStorage.getItem(ACTIVITY_LOG_KEY)
      if (storedActivity) {
        const parsed = JSON.parse(storedActivity)
        setActivityLog(parsed.log || [])
        setDailyUsage(parsed.usage || {})
      }

      // Check session PIN verification
      const sessionVerified = sessionStorage.getItem(PIN_VERIFIED_SESSION_KEY)
      if (sessionVerified === 'true') {
        setIsPinVerified(true)
      }
    } catch (error) {
      console.error('Error loading parental controls:', error)
    }
    setMounted(true)
  }, [])

  // Save controls to localStorage
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(controls))
      } catch (error) {
        console.error('Error saving parental controls:', error)
      }
    }
  }, [controls, mounted])

  // Save activity log
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify({
          log: activityLog.slice(-500), // Keep last 500 entries
          usage: dailyUsage,
        }))
      } catch (error) {
        console.error('Error saving activity log:', error)
      }
    }
  }, [activityLog, dailyUsage, mounted])

  // Track session time
  useEffect(() => {
    if (mounted && controls.kidsMode && controls.timeLimit.enabled) {
      setSessionStartTime(new Date())
      
      // Log session start
      logActivity({
        type: 'session_start',
        timestamp: new Date().toISOString(),
      })

      return () => {
        // Log session end on unmount
        if (sessionStartTime) {
          const duration = Math.floor((Date.now() - sessionStartTime.getTime()) / 60000)
          logActivity({
            type: 'session_end',
            timestamp: new Date().toISOString(),
            durationMinutes: duration,
          })
        }
      }
    }
  }, [mounted, controls.kidsMode, controls.timeLimit.enabled])

  // ============================================
  // PIN Management
  // ============================================

  const setPin = useCallback(async (pin: string): Promise<boolean> => {
    if (!/^\d{4}$/.test(pin)) {
      return false // Must be exactly 4 digits
    }
    
    const hash = await hashPin(pin)
    setControls(prev => ({
      ...prev,
      pinHash: hash,
      lastPinChange: new Date().toISOString(),
      setupComplete: true,
    }))
    setIsPinVerified(true)
    sessionStorage.setItem(PIN_VERIFIED_SESSION_KEY, 'true')
    return true
  }, [])

  const verifyPinCode = useCallback(async (pin: string): Promise<boolean> => {
    if (!controls.pinHash) return false
    
    const isValid = await verifyPin(pin, controls.pinHash)
    if (isValid) {
      setIsPinVerified(true)
      sessionStorage.setItem(PIN_VERIFIED_SESSION_KEY, 'true')
    }
    return isValid
  }, [controls.pinHash])

  const lockParentalControls = useCallback(() => {
    setIsPinVerified(false)
    sessionStorage.removeItem(PIN_VERIFIED_SESSION_KEY)
  }, [])

  const removePin = useCallback(() => {
    setControls(prev => ({
      ...prev,
      pinHash: null,
      lastPinChange: null,
    }))
  }, [])

  const hasPin = controls.pinHash !== null

  // ============================================
  // Kids Mode
  // ============================================

  const enableKidsMode = useCallback(() => {
    setControls(prev => ({ ...prev, kidsMode: true }))
  }, [])

  const disableKidsMode = useCallback(() => {
    // Requires PIN verification
    if (!isPinVerified && hasPin) return false
    setControls(prev => ({ ...prev, kidsMode: false }))
    return true
  }, [isPinVerified, hasPin])

  const toggleKidsMode = useCallback(() => {
    if (controls.kidsMode) {
      return disableKidsMode()
    } else {
      enableKidsMode()
      return true
    }
  }, [controls.kidsMode, enableKidsMode, disableKidsMode])

  // ============================================
  // Time Limits
  // ============================================

  const updateTimeLimit = useCallback((updates: Partial<TimeLimit>) => {
    setControls(prev => ({
      ...prev,
      timeLimit: { ...prev.timeLimit, ...updates },
    }))
  }, [])

  const getTodayUsage = useCallback((): number => {
    const today = getTodayKey()
    return dailyUsage[today]?.minutes || 0
  }, [dailyUsage])

  const getRemainingTime = useCallback((): number => {
    if (!controls.timeLimit.enabled) return Infinity
    
    const limit = isWeekend() 
      ? controls.timeLimit.weekendMinutes 
      : controls.timeLimit.weekdayMinutes
    
    return Math.max(0, limit - getTodayUsage())
  }, [controls.timeLimit, getTodayUsage])

  const isTimeLimitExceeded = useCallback((): boolean => {
    return getRemainingTime() <= 0
  }, [getRemainingTime])

  const isBedtime = useCallback((): boolean => {
    if (!controls.timeLimit.bedtimeEnabled) return false
    return isInBedtime(controls.timeLimit.bedtimeStart, controls.timeLimit.bedtimeEnd)
  }, [controls.timeLimit])

  const canUseApp = useCallback((): { allowed: boolean; reason?: string } => {
    if (!controls.kidsMode) return { allowed: true }
    
    if (controls.timeLimit.enabled) {
      if (isTimeLimitExceeded()) {
        return { allowed: false, reason: 'time_limit' }
      }
      if (isBedtime()) {
        return { allowed: false, reason: 'bedtime' }
      }
    }
    
    return { allowed: true }
  }, [controls.kidsMode, controls.timeLimit.enabled, isTimeLimitExceeded, isBedtime])

  const addUsageTime = useCallback((minutes: number) => {
    const today = getTodayKey()
    setDailyUsage(prev => ({
      ...prev,
      [today]: {
        date: today,
        minutes: (prev[today]?.minutes || 0) + minutes,
        sessions: prev[today]?.sessions || [],
      },
    }))
  }, [])

  // ============================================
  // Content Filtering
  // ============================================

  const updateContentFilter = useCallback((updates: Partial<ContentFilter>) => {
    setControls(prev => ({
      ...prev,
      contentFilter: { ...prev.contentFilter, ...updates },
    }))
  }, [])

  const isContentAllowed = useCallback((contentId: string, ageRating?: number): boolean => {
    if (!controls.kidsMode) return true
    
    // Check explicit restrictions
    if (controls.restrictedContent.includes(contentId)) {
      return false
    }
    
    // Check whitelist mode
    if (controls.useWhitelist && controls.allowedContent.length > 0) {
      return controls.allowedContent.includes(contentId)
    }
    
    // Check age rating
    if (controls.contentFilter.enabled && ageRating !== undefined) {
      if (ageRating > controls.contentFilter.maxAgeRating) {
        return false
      }
    }
    
    return true
  }, [controls])

  const restrictContent = useCallback((contentId: string) => {
    setControls(prev => ({
      ...prev,
      restrictedContent: [...new Set([...prev.restrictedContent, contentId])],
    }))
  }, [])

  const unrestrictContent = useCallback((contentId: string) => {
    setControls(prev => ({
      ...prev,
      restrictedContent: prev.restrictedContent.filter(id => id !== contentId),
    }))
  }, [])

  const allowContent = useCallback((contentId: string) => {
    setControls(prev => ({
      ...prev,
      allowedContent: [...new Set([...prev.allowedContent, contentId])],
    }))
  }, [])

  const disallowContent = useCallback((contentId: string) => {
    setControls(prev => ({
      ...prev,
      allowedContent: prev.allowedContent.filter(id => id !== contentId),
    }))
  }, [])

  const setWhitelistMode = useCallback((enabled: boolean) => {
    setControls(prev => ({ ...prev, useWhitelist: enabled }))
  }, [])

  // ============================================
  // Activity Logging & Reports
  // ============================================

  const logActivity = useCallback((entry: Omit<ActivityLogEntry, 'id'>) => {
    const newEntry: ActivityLogEntry = {
      ...entry,
      id: generateId(),
    }
    setActivityLog(prev => [...prev, newEntry])
  }, [])

  const logBookOpened = useCallback((contentId: string, title: string) => {
    logActivity({
      type: 'book_opened',
      contentId,
      contentTitle: title,
      timestamp: new Date().toISOString(),
    })
  }, [logActivity])

  const logBookCompleted = useCallback((contentId: string, title: string) => {
    logActivity({
      type: 'book_completed',
      contentId,
      contentTitle: title,
      timestamp: new Date().toISOString(),
    })
  }, [logActivity])

  const logGamePlayed = useCallback((contentId: string, title: string, durationMinutes?: number) => {
    logActivity({
      type: 'game_played',
      contentId,
      contentTitle: title,
      timestamp: new Date().toISOString(),
      durationMinutes,
    })
  }, [logActivity])

  const getActivityReport = useCallback((days: number = 7): {
    totalMinutes: number
    bookOpened: number
    booksCompleted: number
    gamesPlayed: number
    dailyBreakdown: { date: string; minutes: number }[]
    recentActivity: ActivityLogEntry[]
  } => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    
    const recentLogs = activityLog.filter(
      entry => new Date(entry.timestamp) >= cutoff
    )
    
    const dailyBreakdown: { date: string; minutes: number }[] = []
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const key = date.toISOString().split('T')[0]
      dailyBreakdown.push({
        date: key,
        minutes: dailyUsage[key]?.minutes || 0,
      })
    }
    
    return {
      totalMinutes: dailyBreakdown.reduce((sum, d) => sum + d.minutes, 0),
      bookOpened: recentLogs.filter(e => e.type === 'book_opened').length,
      booksCompleted: recentLogs.filter(e => e.type === 'book_completed').length,
      gamesPlayed: recentLogs.filter(e => e.type === 'game_played').length,
      dailyBreakdown: dailyBreakdown.reverse(),
      recentActivity: recentLogs.slice(-20).reverse(),
    }
  }, [activityLog, dailyUsage])

  const clearActivityLog = useCallback(() => {
    setActivityLog([])
    setDailyUsage({})
  }, [])

  // ============================================
  // Reset & Export
  // ============================================

  const resetAllControls = useCallback(() => {
    setControls(DEFAULT_PARENTAL_CONTROLS)
    setActivityLog([])
    setDailyUsage({})
    setIsPinVerified(false)
    sessionStorage.removeItem(PIN_VERIFIED_SESSION_KEY)
  }, [])

  const exportParentalData = useCallback(() => {
    return {
      controls,
      activityLog,
      dailyUsage,
      exportedAt: new Date().toISOString(),
    }
  }, [controls, activityLog, dailyUsage])

  return {
    // State
    controls,
    mounted,
    isPinVerified,
    hasPin,

    // PIN Management
    setPin,
    verifyPinCode,
    lockParentalControls,
    removePin,

    // Kids Mode
    enableKidsMode,
    disableKidsMode,
    toggleKidsMode,

    // Time Limits
    updateTimeLimit,
    getTodayUsage,
    getRemainingTime,
    isTimeLimitExceeded,
    isBedtime,
    canUseApp,
    addUsageTime,

    // Content Filtering
    updateContentFilter,
    isContentAllowed,
    restrictContent,
    unrestrictContent,
    allowContent,
    disallowContent,
    setWhitelistMode,

    // Activity Logging
    logBookOpened,
    logBookCompleted,
    logGamePlayed,
    getActivityReport,
    clearActivityLog,

    // Reset & Export
    resetAllControls,
    exportParentalData,
  }
}

// Age rating presets
export const AGE_PRESETS = [
  { value: 3, label: '3+', description: 'Toddlers' },
  { value: 6, label: '6+', description: 'Early readers' },
  { value: 9, label: '9+', description: 'Kids' },
  { value: 12, label: '12+', description: 'Pre-teens' },
  { value: 16, label: '16+', description: 'Teens' },
  { value: 18, label: '18+', description: 'Adults only' },
]

// Time presets in minutes
export const TIME_PRESETS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
  { value: 240, label: '4 hours' },
]

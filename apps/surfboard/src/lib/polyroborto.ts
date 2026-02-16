// PolyRoborto trading bot data management
// In-memory storage for MVP - connects to actual bot via API later

export interface TradingStatus {
  isRunning: boolean
  balance: number
  openPositions: number
  todayPnL: number
  weeklyPnL: number
  lastUpdate: string
}

export interface TechFeedback {
  id: string
  feedback: string
  createdAt: string
  status: 'pending' | 'processed'
}

// Trading status — no live data available
// PolyRoborto panel now uses Gist data (PolyRobortoPanel.tsx)
// This module is kept for tech feedback only
let tradingStatus: TradingStatus = {
  isRunning: false,
  balance: 0,
  openPositions: 0,
  todayPnL: 0,
  weeklyPnL: 0,
  lastUpdate: new Date().toISOString()
}

// Store feedback for tech support agent
const feedbackQueue: TechFeedback[] = []

export function getTradingStatus(): TradingStatus {
  // No live trading data — returns zeros
  // Real data comes from Gist via PolyRobortoPanel component
  return {
    ...tradingStatus,
    lastUpdate: new Date().toISOString()
  }
}

export function addTechFeedback(feedback: string): TechFeedback {
  const newFeedback: TechFeedback = {
    id: Date.now().toString(),
    feedback,
    createdAt: new Date().toISOString(),
    status: 'pending'
  }
  feedbackQueue.push(newFeedback)
  return newFeedback
}

export function getPendingFeedback(): TechFeedback[] {
  return feedbackQueue.filter(f => f.status === 'pending')
}

export function markFeedbackProcessed(id: string): boolean {
  const feedback = feedbackQueue.find(f => f.id === id)
  if (feedback) {
    feedback.status = 'processed'
    return true
  }
  return false
}

export function updateTradingStatus(status: Partial<TradingStatus>): void {
  tradingStatus = { ...tradingStatus, ...status, lastUpdate: new Date().toISOString() }
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DailyStats {
  date: string; // YYYY-MM-DD format
  readingTimeMs: number;
  pagesRead: number;
  sessionsCount: number;
}

export interface ReadingStats {
  // Lifetime totals
  totalReadingTimeMs: number;
  totalPagesRead: number;
  totalSessions: number;
  booksCompleted: number;
  
  // Streaks
  currentStreak: number; // consecutive days reading
  longestStreak: number;
  lastReadDate: string | null; // YYYY-MM-DD
  
  // Daily breakdown (last 30 days)
  dailyStats: DailyStats[];
  
  // Current session tracking
  sessionStartTime: number | null;
  sessionStartPages: number;
}

interface ReadingStatsState extends ReadingStats {
  // Actions
  startSession: () => void;
  endSession: (pagesRead: number) => void;
  recordPageTurn: () => void;
  recordBookCompleted: () => void;
  
  // Getters
  getTodayStats: () => DailyStats | undefined;
  getWeekStats: () => DailyStats[];
  getAverageReadingTime: () => number; // avg per day in ms
  getAveragePagesPerSession: () => number;
}

const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

const isYesterday = (dateStr: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === getDateString(yesterday);
};

const isToday = (dateStr: string): boolean => {
  return dateStr === getDateString();
};

const defaultStats: ReadingStats = {
  totalReadingTimeMs: 0,
  totalPagesRead: 0,
  totalSessions: 0,
  booksCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastReadDate: null,
  dailyStats: [],
  sessionStartTime: null,
  sessionStartPages: 0,
};

export const useReadingStatsStore = create<ReadingStatsState>()(
  persist(
    (set, get) => ({
      ...defaultStats,
      
      startSession: () => {
        const state = get();
        // Don't start a new session if one is already active
        if (state.sessionStartTime) return;
        
        set({
          sessionStartTime: Date.now(),
          sessionStartPages: state.totalPagesRead,
        });
      },
      
      endSession: (pagesRead: number) => {
        const state = get();
        if (!state.sessionStartTime) return;
        
        const sessionDuration = Date.now() - state.sessionStartTime;
        const today = getDateString();
        
        // Update streak
        let newStreak = state.currentStreak;
        if (state.lastReadDate) {
          if (isToday(state.lastReadDate)) {
            // Already read today, streak unchanged
          } else if (isYesterday(state.lastReadDate)) {
            // Read yesterday, streak continues
            newStreak += 1;
          } else {
            // Streak broken, start fresh
            newStreak = 1;
          }
        } else {
          // First time reading
          newStreak = 1;
        }
        
        // Update daily stats
        const existingDailyStats = [...state.dailyStats];
        const todayIndex = existingDailyStats.findIndex(d => d.date === today);
        
        if (todayIndex >= 0) {
          existingDailyStats[todayIndex] = {
            ...existingDailyStats[todayIndex],
            readingTimeMs: existingDailyStats[todayIndex].readingTimeMs + sessionDuration,
            pagesRead: existingDailyStats[todayIndex].pagesRead + pagesRead,
            sessionsCount: existingDailyStats[todayIndex].sessionsCount + 1,
          };
        } else {
          existingDailyStats.push({
            date: today,
            readingTimeMs: sessionDuration,
            pagesRead: pagesRead,
            sessionsCount: 1,
          });
        }
        
        // Keep only last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = getDateString(thirtyDaysAgo);
        const filteredStats = existingDailyStats.filter(d => d.date >= thirtyDaysAgoStr);
        
        set({
          totalReadingTimeMs: state.totalReadingTimeMs + sessionDuration,
          totalPagesRead: state.totalPagesRead + pagesRead,
          totalSessions: state.totalSessions + 1,
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, state.longestStreak),
          lastReadDate: today,
          dailyStats: filteredStats,
          sessionStartTime: null,
          sessionStartPages: 0,
        });
      },
      
      recordPageTurn: () => {
        // Called when user turns a page - useful for more granular tracking
        // For now, we track pages at session end
      },
      
      recordBookCompleted: () => {
        set((state) => ({
          booksCompleted: state.booksCompleted + 1,
        }));
      },
      
      getTodayStats: () => {
        const today = getDateString();
        return get().dailyStats.find(d => d.date === today);
      },
      
      getWeekStats: () => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = getDateString(weekAgo);
        return get().dailyStats.filter(d => d.date >= weekAgoStr);
      },
      
      getAverageReadingTime: () => {
        const stats = get().dailyStats;
        if (stats.length === 0) return 0;
        const total = stats.reduce((sum, d) => sum + d.readingTimeMs, 0);
        return total / stats.length;
      },
      
      getAveragePagesPerSession: () => {
        const state = get();
        if (state.totalSessions === 0) return 0;
        return state.totalPagesRead / state.totalSessions;
      },
    }),
    {
      name: 'onde-reader-stats',
      partialize: (state) => ({
        totalReadingTimeMs: state.totalReadingTimeMs,
        totalPagesRead: state.totalPagesRead,
        totalSessions: state.totalSessions,
        booksCompleted: state.booksCompleted,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastReadDate: state.lastReadDate,
        dailyStats: state.dailyStats,
      }),
    }
  )
);

// Helper to format time duration
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
};

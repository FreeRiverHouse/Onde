import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DailyStats {
  date: string; // YYYY-MM-DD format
  readingTimeMs: number;
  pagesRead: number;
  sessionsCount: number;
}

export interface ReadingGoal {
  type: 'pages' | 'minutes';
  target: number; // pages per day or minutes per day
  enabled: boolean;
  reminderEnabled: boolean;
  reminderTime: string; // HH:MM format
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null; // ISO date string or null if not unlocked
}

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_page', name: 'First Steps', description: 'Read your first page', icon: '📖', unlockedAt: null },
  { id: 'first_book', name: 'Bookworm', description: 'Complete your first book', icon: '🎉', unlockedAt: null },
  { id: 'streak_3', name: 'Getting Started', description: '3-day reading streak', icon: '🌱', unlockedAt: null },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day reading streak', icon: '🔥', unlockedAt: null },
  { id: 'streak_14', name: 'Dedicated Reader', description: '14-day reading streak', icon: '💪', unlockedAt: null },
  { id: 'streak_30', name: 'Reading Master', description: '30-day reading streak', icon: '🏆', unlockedAt: null },
  { id: 'pages_100', name: 'Century', description: 'Read 100 pages total', icon: '💯', unlockedAt: null },
  { id: 'pages_500', name: 'Page Turner', description: 'Read 500 pages total', icon: '📚', unlockedAt: null },
  { id: 'pages_1000', name: 'Bibliophile', description: 'Read 1000 pages total', icon: '🌟', unlockedAt: null },
  { id: 'hours_10', name: 'Time Well Spent', description: '10 hours of reading', icon: '⏰', unlockedAt: null },
  { id: 'hours_50', name: 'Avid Reader', description: '50 hours of reading', icon: '📕', unlockedAt: null },
  { id: 'books_5', name: 'Five Down', description: 'Complete 5 books', icon: '✨', unlockedAt: null },
  { id: 'goal_streak_7', name: 'Goal Getter', description: 'Meet daily goal 7 days in a row', icon: '🎯', unlockedAt: null },
];

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
  
  // Goal streaks
  goalStreak: number; // consecutive days meeting daily goal
  longestGoalStreak: number;
  
  // Daily breakdown (last 30 days)
  dailyStats: DailyStats[];
  
  // Current session tracking
  sessionStartTime: number | null;
  sessionStartPages: number;
  
  // Goals
  goal: ReadingGoal;
  
  // Achievements
  achievements: Achievement[];
  newAchievements: string[]; // IDs of newly unlocked achievements to show
}

interface ReadingStatsState extends ReadingStats {
  // Actions
  startSession: () => void;
  endSession: (pagesRead: number) => void;
  recordPageTurn: () => void;
  recordBookCompleted: () => void;
  
  // Goal actions
  setGoal: (goal: Partial<ReadingGoal>) => void;
  checkAchievements: () => void;
  dismissNewAchievements: () => void;
  
  // Getters
  getTodayStats: () => DailyStats | undefined;
  getWeekStats: () => DailyStats[];
  getAverageReadingTime: () => number; // avg per day in ms
  getAveragePagesPerSession: () => number;
  getTodayGoalProgress: () => { current: number; target: number; percentage: number; met: boolean };
  getUnlockedAchievements: () => Achievement[];
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
  goalStreak: 0,
  longestGoalStreak: 0,
  dailyStats: [],
  sessionStartTime: null,
  sessionStartPages: 0,
  goal: {
    type: 'pages',
    target: 20, // default: 20 pages per day
    enabled: false,
    reminderEnabled: false,
    reminderTime: '20:00', // default: 8 PM reminder
  },
  achievements: [...DEFAULT_ACHIEVEMENTS],
  newAchievements: [],
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
        
        // Check if goal was met today
        const todayStatsAfter = filteredStats.find(d => d.date === today);
        let newGoalStreak = state.goalStreak;
        
        if (state.goal.enabled && todayStatsAfter) {
          const goalMet = state.goal.type === 'pages'
            ? todayStatsAfter.pagesRead >= state.goal.target
            : todayStatsAfter.readingTimeMs >= state.goal.target * 60000;
          
          if (goalMet) {
            // Check if we already counted goal streak today
            const lastReadWasToday = state.lastReadDate === today;
            const previousGoalMet = state.goal.type === 'pages'
              ? (todayStatsAfter.pagesRead - pagesRead) >= state.goal.target
              : (todayStatsAfter.readingTimeMs - sessionDuration) >= state.goal.target * 60000;
            
            // Only increment if goal was just met (not already met before this session)
            if (!previousGoalMet) {
              if (lastReadWasToday || isYesterday(state.lastReadDate || '')) {
                newGoalStreak = state.goalStreak + 1;
              } else {
                newGoalStreak = 1;
              }
            }
          }
        }
        
        set({
          totalReadingTimeMs: state.totalReadingTimeMs + sessionDuration,
          totalPagesRead: state.totalPagesRead + pagesRead,
          totalSessions: state.totalSessions + 1,
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, state.longestStreak),
          goalStreak: newGoalStreak,
          longestGoalStreak: Math.max(newGoalStreak, state.longestGoalStreak),
          lastReadDate: today,
          dailyStats: filteredStats,
          sessionStartTime: null,
          sessionStartPages: 0,
        });
        
        // Check achievements after updating stats
        get().checkAchievements();
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
      
      getTodayGoalProgress: () => {
        const state = get();
        const todayStats = state.dailyStats.find(d => d.date === getDateString());
        
        if (!state.goal.enabled) {
          return { current: 0, target: 0, percentage: 0, met: false };
        }
        
        const current = state.goal.type === 'pages'
          ? (todayStats?.pagesRead || 0)
          : Math.floor((todayStats?.readingTimeMs || 0) / 60000); // convert to minutes
        
        const percentage = Math.min(100, Math.round((current / state.goal.target) * 100));
        const met = current >= state.goal.target;
        
        return { current, target: state.goal.target, percentage, met };
      },
      
      setGoal: (goalUpdate: Partial<ReadingGoal>) => {
        set((state) => ({
          goal: { ...state.goal, ...goalUpdate },
        }));
      },
      
      checkAchievements: () => {
        const state = get();
        const newlyUnlocked: string[] = [];
        const now = new Date().toISOString();
        
        const updatedAchievements = state.achievements.map(achievement => {
          if (achievement.unlockedAt) return achievement; // Already unlocked
          
          let unlocked = false;
          
          switch (achievement.id) {
            case 'first_page':
              unlocked = state.totalPagesRead >= 1;
              break;
            case 'first_book':
              unlocked = state.booksCompleted >= 1;
              break;
            case 'streak_3':
              unlocked = state.currentStreak >= 3;
              break;
            case 'streak_7':
              unlocked = state.currentStreak >= 7;
              break;
            case 'streak_14':
              unlocked = state.currentStreak >= 14;
              break;
            case 'streak_30':
              unlocked = state.currentStreak >= 30;
              break;
            case 'pages_100':
              unlocked = state.totalPagesRead >= 100;
              break;
            case 'pages_500':
              unlocked = state.totalPagesRead >= 500;
              break;
            case 'pages_1000':
              unlocked = state.totalPagesRead >= 1000;
              break;
            case 'hours_10':
              unlocked = state.totalReadingTimeMs >= 10 * 60 * 60 * 1000;
              break;
            case 'hours_50':
              unlocked = state.totalReadingTimeMs >= 50 * 60 * 60 * 1000;
              break;
            case 'books_5':
              unlocked = state.booksCompleted >= 5;
              break;
            case 'goal_streak_7':
              unlocked = state.goalStreak >= 7;
              break;
          }
          
          if (unlocked) {
            newlyUnlocked.push(achievement.id);
            return { ...achievement, unlockedAt: now };
          }
          
          return achievement;
        });
        
        if (newlyUnlocked.length > 0) {
          set({
            achievements: updatedAchievements,
            newAchievements: [...state.newAchievements, ...newlyUnlocked],
          });
        }
      },
      
      dismissNewAchievements: () => {
        set({ newAchievements: [] });
      },
      
      getUnlockedAchievements: () => {
        return get().achievements.filter(a => a.unlockedAt !== null);
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
        goalStreak: state.goalStreak,
        longestGoalStreak: state.longestGoalStreak,
        dailyStats: state.dailyStats,
        goal: state.goal,
        achievements: state.achievements,
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

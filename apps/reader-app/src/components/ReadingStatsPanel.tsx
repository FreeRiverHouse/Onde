'use client';

import { useReadingStatsStore, formatDuration } from '@/store/readingStatsStore';

interface ReadingStatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReadingStatsPanel({ isOpen, onClose }: ReadingStatsPanelProps) {
  const {
    totalReadingTimeMs,
    totalPagesRead,
    totalSessions,
    booksCompleted,
    currentStreak,
    longestStreak,
    dailyStats,
    getTodayStats,
    getWeekStats,
    getAverageReadingTime,
  } = useReadingStatsStore();
  
  const todayStats = getTodayStats();
  const weekStats = getWeekStats();
  const avgReadingTime = getAverageReadingTime();
  
  // Calculate week totals
  const weekTotalTime = weekStats.reduce((sum, d) => sum + d.readingTimeMs, 0);
  const weekTotalPages = weekStats.reduce((sum, d) => sum + d.pagesRead, 0);
  
  // Get last 7 days for the mini chart
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayStats = dailyStats.find(d => d.date === dateStr);
    last7Days.push({
      date: dateStr,
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      time: dayStats?.readingTimeMs || 0,
      pages: dayStats?.pagesRead || 0,
    });
  }
  
  // Max time for scaling the chart
  const maxTime = Math.max(...last7Days.map(d => d.time), 1);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h3 className="font-semibold">Reading Statistics</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Streak Banner */}
        <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-b border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentStreak > 0 ? '🔥' : '❄️'}</span>
              <div>
                <p className="font-bold text-lg text-amber-800 dark:text-amber-200">
                  {currentStreak} day{currentStreak !== 1 ? 's' : ''} streak
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Best: {longestStreak} days
                </p>
              </div>
            </div>
            {currentStreak >= 7 && (
              <span className="px-3 py-1 bg-amber-200 dark:bg-amber-700 rounded-full text-amber-800 dark:text-amber-200 text-sm font-medium">
                📚 Bookworm!
              </span>
            )}
          </div>
        </div>
        
        {/* Today's Progress */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Today</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {todayStats ? formatDuration(todayStats.readingTimeMs) : '0m'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Reading time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {todayStats?.pagesRead || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pages</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {todayStats?.sessionsCount || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sessions</p>
            </div>
          </div>
        </div>
        
        {/* 7-Day Chart */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Last 7 Days</h4>
          <div className="flex items-end justify-between h-24 gap-1">
            {last7Days.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-purple-500 dark:bg-purple-400 rounded-t transition-all"
                  style={{ 
                    height: `${Math.max((day.time / maxTime) * 80, day.time > 0 ? 8 : 0)}px`,
                    opacity: day.time > 0 ? 1 : 0.2,
                  }}
                  title={`${formatDuration(day.time)} - ${day.pages} pages`}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Week total: <span className="font-medium text-gray-700 dark:text-gray-300">{formatDuration(weekTotalTime)}</span>
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">{weekTotalPages}</span> pages
            </span>
          </div>
        </div>
        
        {/* All-Time Stats */}
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">All Time</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {formatDuration(totalReadingTimeMs)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total reading time</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {totalPagesRead.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pages read</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {totalSessions}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Reading sessions</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {booksCompleted}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Books completed</p>
            </div>
          </div>
          
          {/* Averages */}
          {totalSessions > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                📈 Average: <span className="font-medium">{formatDuration(avgReadingTime)}</span> per day
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                📖 Average: <span className="font-medium">{Math.round(totalPagesRead / totalSessions)}</span> pages per session
              </p>
            </div>
          )}
        </div>
        
        {/* Encouragement */}
        {totalSessions === 0 && (
          <div className="px-4 pb-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center">
              <p className="text-blue-800 dark:text-blue-200">
                📖 Start reading to track your progress!
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Your stats will appear here as you read.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useReadingStatsStore } from '@/store/readingStatsStore';
import { useState } from 'react';
import { ReadingGoalsPanel } from './ReadingGoalsPanel';

interface GoalProgressWidgetProps {
  compact?: boolean;
}

export function GoalProgressWidget({ compact = false }: GoalProgressWidgetProps) {
  const { goal, currentStreak, getTodayGoalProgress, newAchievements } = useReadingStatsStore();
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const progress = getTodayGoalProgress();
  
  // Don't show if goals are disabled
  if (!goal.enabled) {
    return (
      <>
        <button
          onClick={() => setIsGoalsOpen(true)}
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-600 dark:text-gray-400"
        >
          🎯 Set a reading goal
        </button>
        <ReadingGoalsPanel isOpen={isGoalsOpen} onClose={() => setIsGoalsOpen(false)} />
      </>
    );
  }
  
  if (compact) {
    return (
      <>
        <button
          onClick={() => setIsGoalsOpen(true)}
          className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200 dark:border-emerald-700 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/50 dark:hover:to-teal-900/50 transition-all"
        >
          {/* Progress ring */}
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                className="stroke-emerald-200 dark:stroke-emerald-800"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                className={progress.met ? 'stroke-emerald-500' : 'stroke-blue-500'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(progress.percentage / 100) * 88} 88`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {progress.met ? '✓' : `${progress.percentage}%`}
            </span>
          </div>
          
          <div className="text-left">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              {progress.current}/{progress.target} {goal.type === 'pages' ? 'pages' : 'min'}
            </p>
            {currentStreak > 0 && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                🔥 {currentStreak}d streak
              </p>
            )}
          </div>
          
          {/* New achievement badge */}
          {newAchievements.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[10px] text-white animate-pulse">
              !
            </span>
          )}
        </button>
        <ReadingGoalsPanel isOpen={isGoalsOpen} onClose={() => setIsGoalsOpen(false)} />
      </>
    );
  }
  
  // Full-size widget
  return (
    <>
      <button
        onClick={() => setIsGoalsOpen(true)}
        className="relative w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200 dark:border-emerald-700 hover:shadow-lg transition-all group"
      >
        <div className="flex items-center gap-4">
          {/* Progress ring */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                className="stroke-emerald-200 dark:stroke-emerald-800"
                strokeWidth="2.5"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                className={progress.met ? 'stroke-emerald-500' : 'stroke-blue-500'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${(progress.percentage / 100) * 88} 88`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center">
              {progress.met ? (
                <span className="text-xl">✅</span>
              ) : (
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {progress.percentage}%
                </span>
              )}
            </span>
          </div>
          
          {/* Progress details */}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">
                Today&apos;s Goal
              </h3>
              {progress.met && (
                <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                  Complete!
                </span>
              )}
            </div>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {progress.current} / {progress.target} {goal.type === 'pages' ? 'pages' : 'minutes'}
            </p>
            {currentStreak > 0 && (
              <p className="text-xs text-emerald-500 dark:text-emerald-500 mt-1">
                🔥 {currentStreak} day streak
              </p>
            )}
          </div>
          
          {/* Arrow indicator */}
          <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">
            →
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              progress.met
                ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
            }`}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        
        {/* New achievement badge */}
        {newAchievements.length > 0 && (
          <span className="absolute -top-2 -right-2 px-2 py-1 bg-amber-500 text-white text-xs rounded-full animate-bounce">
            🏆 New!
          </span>
        )}
      </button>
      <ReadingGoalsPanel isOpen={isGoalsOpen} onClose={() => setIsGoalsOpen(false)} />
    </>
  );
}

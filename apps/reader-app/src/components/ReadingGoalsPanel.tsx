'use client';

import { useState } from 'react';
import { useReadingStatsStore } from '@/store/readingStatsStore';

interface ReadingGoalsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReadingGoalsPanel({ isOpen, onClose }: ReadingGoalsPanelProps) {
  const {
    goal,
    goalStreak,
    longestGoalStreak,
    achievements,
    newAchievements,
    setGoal,
    getTodayGoalProgress,
    dismissNewAchievements,
    getUnlockedAchievements,
  } = useReadingStatsStore();
  
  const [showAchievements, setShowAchievements] = useState(false);
  const progress = getTodayGoalProgress();
  const unlockedAchievements = getUnlockedAchievements();
  
  // Handle reminder permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setGoal({ reminderEnabled: true });
      }
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h3 className="font-semibold">Reading Goals</h3>
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
        
        {/* New Achievements Toast */}
        {newAchievements.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-b border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl animate-bounce">🏆</span>
                <div>
                  <p className="font-bold text-yellow-800 dark:text-yellow-200">
                    Achievement Unlocked!
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    {achievements.find(a => a.id === newAchievements[0])?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={dismissNewAchievements}
                className="px-3 py-1 bg-yellow-200 dark:bg-yellow-700 rounded-full text-yellow-800 dark:text-yellow-200 text-sm hover:bg-yellow-300 dark:hover:bg-yellow-600 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        {/* Goal Progress */}
        {goal.enabled && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Today&apos;s Progress</h4>
              {progress.met && (
                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
                  ✓ Goal Met!
                </span>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-500 rounded-full ${
                  progress.met
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                }`}
                style={{ width: `${progress.percentage}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                <span className={progress.percentage > 50 ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>
                  {progress.current} / {progress.target} {goal.type === 'pages' ? 'pages' : 'min'}
                </span>
              </div>
            </div>
            
            {/* Goal Streak */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{goalStreak > 0 ? '🎯' : '⭕'}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {goalStreak} day{goalStreak !== 1 ? 's' : ''} streak
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                Best: {longestGoalStreak}
              </div>
            </div>
          </div>
        )}
        
        {/* Goal Settings */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Goal Settings</h4>
          
          {/* Enable Toggle */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700 dark:text-gray-300">Enable daily goal</span>
            <button
              onClick={() => setGoal({ enabled: !goal.enabled })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                goal.enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  goal.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {goal.enabled && (
            <>
              {/* Goal Type */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Goal type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGoal({ type: 'pages' })}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                      goal.type === 'pages'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    📄 Pages
                  </button>
                  <button
                    onClick={() => setGoal({ type: 'minutes' })}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                      goal.type === 'minutes'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    ⏱️ Minutes
                  </button>
                </div>
              </div>
              
              {/* Goal Target */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Daily target ({goal.type === 'pages' ? 'pages' : 'minutes'})
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={goal.type === 'pages' ? 5 : 10}
                    max={goal.type === 'pages' ? 100 : 120}
                    step={goal.type === 'pages' ? 5 : 5}
                    value={goal.target}
                    onChange={(e) => setGoal({ target: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="w-16 text-right text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {goal.target}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <span>{goal.type === 'pages' ? '5' : '10'}</span>
                  <span>{goal.type === 'pages' ? '100' : '120'}</span>
                </div>
              </div>
              
              {/* Quick Presets */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Quick presets</label>
                <div className="flex gap-2 flex-wrap">
                  {goal.type === 'pages' ? (
                    <>
                      <PresetButton label="Light (10)" onClick={() => setGoal({ target: 10 })} active={goal.target === 10} />
                      <PresetButton label="Standard (20)" onClick={() => setGoal({ target: 20 })} active={goal.target === 20} />
                      <PresetButton label="Ambitious (50)" onClick={() => setGoal({ target: 50 })} active={goal.target === 50} />
                    </>
                  ) : (
                    <>
                      <PresetButton label="Light (15m)" onClick={() => setGoal({ target: 15 })} active={goal.target === 15} />
                      <PresetButton label="Standard (30m)" onClick={() => setGoal({ target: 30 })} active={goal.target === 30} />
                      <PresetButton label="Ambitious (60m)" onClick={() => setGoal({ target: 60 })} active={goal.target === 60} />
                    </>
                  )}
                </div>
              </div>
              
              {/* Reminder Settings */}
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    🔔 Daily reminder
                  </span>
                  <button
                    onClick={() => {
                      if (!goal.reminderEnabled && 'Notification' in window && Notification.permission !== 'granted') {
                        requestNotificationPermission();
                      } else {
                        setGoal({ reminderEnabled: !goal.reminderEnabled });
                      }
                    }}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      goal.reminderEnabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        goal.reminderEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {goal.reminderEnabled && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Remind at:</label>
                    <input
                      type="time"
                      value={goal.reminderTime}
                      onChange={(e) => setGoal({ reminderTime: e.target.value })}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    />
                  </div>
                )}
                
                {'Notification' in window && Notification.permission === 'denied' && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    ⚠️ Notifications blocked. Enable in browser settings.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Achievements Section */}
        <div className="p-4">
          <button
            onClick={() => setShowAchievements(!showAchievements)}
            className="w-full flex items-center justify-between py-2"
          >
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              🏆 Achievements
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-xs">
                {unlockedAchievements.length}/{achievements.length}
              </span>
            </h4>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${showAchievements ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showAchievements && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg text-center transition-all ${
                    achievement.unlockedAt
                      ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-200 dark:border-amber-700'
                      : 'bg-gray-100 dark:bg-gray-900 opacity-50'
                  }`}
                  title={achievement.description}
                >
                  <span className={`text-2xl ${achievement.unlockedAt ? '' : 'grayscale'}`}>
                    {achievement.icon}
                  </span>
                  <p className={`text-xs mt-1 font-medium ${
                    achievement.unlockedAt
                      ? 'text-amber-700 dark:text-amber-300'
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {achievement.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Tips */}
        <div className="px-4 pb-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Tip:</strong> Start with a small goal and build up. Consistency beats intensity!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PresetButton({ label, onClick, active }: { label: string; onClick: () => void; active: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm transition-colors ${
        active
          ? 'bg-emerald-500 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
}

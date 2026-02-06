'use client';

import type { Achievement } from './types';

interface AchievementPopupProps {
  achievement: { id: string; name: string; emoji: string } | null;
}

export function AchievementPopup({ achievement }: AchievementPopupProps) {
  if (!achievement) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-bounce">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
        <span className="text-4xl">{achievement.emoji}</span>
        <div>
          <p className="text-xs opacity-75">Achievement Unlocked!</p>
          <p className="font-bold text-lg">{achievement.name}</p>
        </div>
      </div>
    </div>
  );
}

interface AchievementGalleryProps {
  show: boolean;
  onClose: () => void;
  achievements: Record<string, boolean>;
  achievementDefs: Record<string, Achievement>;
}

export function AchievementGallery({ show, onClose, achievements, achievementDefs }: AchievementGalleryProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">🏆 Achievements</h2>
          <span className="text-sm text-gray-500">
            {Object.values(achievements).filter(Boolean).length}/{Object.keys(achievementDefs).length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-auto">
          {Object.entries(achievementDefs).map(([id, ach]) => (
            <div
              key={id}
              className={`p-3 rounded-xl text-center transition-all ${
                achievements[id]
                  ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-400'
                  : 'bg-gray-100 opacity-50'
              }`}
            >
              <div className={`text-3xl mb-1 ${achievements[id] ? '' : 'grayscale'}`}>
                {ach.emoji}
              </div>
              <p className="font-bold text-sm">{ach.name}</p>
              {!achievements[id] && <p className="text-xs text-gray-400 mt-1">🔒 Locked</p>}
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl"
        >
          Close
        </button>
      </div>
    </div>
  );
}

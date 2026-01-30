// Gamification utilities for Free River House agents

export const XP_PER_TASK = 10;
export const XP_PER_LEVEL = 100;

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

export interface AgentStats {
  xp: number;
  level: number;
  totalTasksDone: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  xpToNextLevel: number;
  levelProgress: number; // 0-100 percentage
}

// Calculate level from XP
export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

// Calculate XP needed for next level
export function xpToNextLevel(xp: number): number {
  const currentLevel = calculateLevel(xp);
  const xpForNextLevel = currentLevel * XP_PER_LEVEL;
  return xpForNextLevel - xp;
}

// Calculate progress percentage to next level (0-100)
export function levelProgress(xp: number): number {
  const xpInCurrentLevel = xp % XP_PER_LEVEL;
  return Math.round((xpInCurrentLevel / XP_PER_LEVEL) * 100);
}

// Get display name for level
export function getLevelTitle(level: number): string {
  if (level >= 50) return 'Legendary';
  if (level >= 25) return 'Master';
  if (level >= 15) return 'Expert';
  if (level >= 10) return 'Veteran';
  if (level >= 5) return 'Skilled';
  if (level >= 3) return 'Apprentice';
  return 'Rookie';
}

// Get level color
export function getLevelColor(level: number): string {
  if (level >= 50) return '#FFD700'; // Gold
  if (level >= 25) return '#E040FB'; // Purple
  if (level >= 15) return '#00BCD4'; // Cyan
  if (level >= 10) return '#4CAF50'; // Green
  if (level >= 5) return '#2196F3'; // Blue
  if (level >= 3) return '#FF9800'; // Orange
  return '#9E9E9E'; // Gray
}

// Format XP display
export function formatXP(xp: number): string {
  if (xp >= 10000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toString();
}

// Check which badges an agent should have based on stats
export function checkBadgeEligibility(stats: {
  totalTasksDone: number;
  level: number;
  currentStreak: number;
  tasksLastHour?: number;
  lastTaskHour?: number;
}): string[] {
  const eligible: string[] = [];

  // Task count badges
  if (stats.totalTasksDone >= 1) eligible.push('first-task');
  if (stats.totalTasksDone >= 10) eligible.push('task-10');
  if (stats.totalTasksDone >= 50) eligible.push('task-50');
  if (stats.totalTasksDone >= 100) eligible.push('task-100');
  if (stats.totalTasksDone >= 500) eligible.push('task-500');

  // Level badges
  if (stats.level >= 5) eligible.push('level-5');
  if (stats.level >= 10) eligible.push('level-10');
  if (stats.level >= 25) eligible.push('level-25');

  // Streak badges
  if (stats.currentStreak >= 7) eligible.push('streak-7');
  if (stats.currentStreak >= 30) eligible.push('streak-30');

  // Time-based badges
  if (stats.tasksLastHour && stats.tasksLastHour >= 5) eligible.push('speed-demon');
  if (stats.lastTaskHour !== undefined) {
    if (stats.lastTaskHour >= 0 && stats.lastTaskHour < 6) eligible.push('early-bird');
    if (stats.lastTaskHour >= 0 && stats.lastTaskHour < 5) eligible.push('night-owl');
  }

  return eligible;
}

// Badge definitions for display
export const BADGE_INFO: Record<string, { name: string; icon: string; description: string }> = {
  'first-task': { name: 'First Steps', icon: '🎯', description: 'Completed first task' },
  'task-10': { name: 'Warming Up', icon: '🔥', description: 'Completed 10 tasks' },
  'task-50': { name: 'Seasoned', icon: '⭐', description: 'Completed 50 tasks' },
  'task-100': { name: 'Centurion', icon: '💯', description: 'Completed 100 tasks' },
  'task-500': { name: 'Legend', icon: '🏆', description: 'Completed 500 tasks' },
  'level-5': { name: 'Rising Star', icon: '🌟', description: 'Reached level 5' },
  'level-10': { name: 'Expert', icon: '💎', description: 'Reached level 10' },
  'level-25': { name: 'Master', icon: '👑', description: 'Reached level 25' },
  'streak-7': { name: 'Week Warrior', icon: '🔗', description: '7 day task streak' },
  'streak-30': { name: 'Monthly Master', icon: '⛓️', description: '30 day task streak' },
  'speed-demon': { name: 'Speed Demon', icon: '⚡', description: 'Completed 5 tasks in 1 hour' },
  'night-owl': { name: 'Night Owl', icon: '🦉', description: 'Completed task after midnight' },
  'early-bird': { name: 'Early Bird', icon: '🐦', description: 'Completed task before 6 AM' },
};

// Game configuration constants

export const MEMORY_GAME = {
  // Grid sizes for different difficulty levels
  EASY: { rows: 2, cols: 3 },      // 6 cards (3 pairs)
  MEDIUM: { rows: 3, cols: 4 },    // 12 cards (6 pairs)
  HARD: { rows: 4, cols: 4 },      // 16 cards (8 pairs)

  // Timing
  FLIP_DELAY: 1000,         // ms before unmatched cards flip back
  MATCH_DELAY: 500,         // ms to show matched animation

  // Scoring
  MATCH_POINTS: 100,
  TIME_BONUS_MULTIPLIER: 10,
  COMBO_MULTIPLIER: 1.5,
};

export const MATCHING_GAME = {
  EASY: 4,      // 4 items to match
  MEDIUM: 6,    // 6 items to match
  HARD: 8,      // 8 items to match

  MATCH_POINTS: 50,
  WRONG_PENALTY: -10,
};

export const SLIDING_PUZZLE = {
  EASY: 3,      // 3x3 grid (8 tiles)
  MEDIUM: 4,    // 4x4 grid (15 tiles)
  HARD: 5,      // 5x5 grid (24 tiles)

  MOVE_POINTS: -1,    // Lose points per move
  WIN_BONUS: 500,
};

// Memory game emoji pairs (night/space theme)
export const MEMORY_EMOJIS = [
  { id: 1, emoji: '🌙', name: 'moon' },
  { id: 2, emoji: '⭐', name: 'star' },
  { id: 3, emoji: '🌟', name: 'glowing-star' },
  { id: 4, emoji: '✨', name: 'sparkles' },
  { id: 5, emoji: '🌠', name: 'shooting-star' },
  { id: 6, emoji: '🌌', name: 'galaxy' },
  { id: 7, emoji: '🪐', name: 'planet' },
  { id: 8, emoji: '🚀', name: 'rocket' },
  { id: 9, emoji: '🛸', name: 'ufo' },
  { id: 10, emoji: '👽', name: 'alien' },
  { id: 11, emoji: '🌕', name: 'full-moon' },
  { id: 12, emoji: '🌑', name: 'new-moon' },
  { id: 13, emoji: '🦉', name: 'owl' },
  { id: 14, emoji: '🦇', name: 'bat' },
  { id: 15, emoji: '🌃', name: 'night-city' },
  { id: 16, emoji: '🏰', name: 'castle' },
];

// Matching game pairs (night creatures and their homes)
export const MATCHING_PAIRS = [
  { item: '🦉', match: '🌲', name: 'owl-tree' },
  { item: '🦇', match: '🦇', name: 'bat-cave' },
  { item: '🐺', match: '🌙', name: 'wolf-moon' },
  { item: '⭐', match: '🌌', name: 'star-galaxy' },
  { item: '🚀', match: '🪐', name: 'rocket-planet' },
  { item: '👽', match: '🛸', name: 'alien-ufo' },
  { item: '🌙', match: '💤', name: 'moon-sleep' },
  { item: '🌠', match: '✨', name: 'shooting-sparkle' },
];

export default {
  MEMORY_GAME,
  MATCHING_GAME,
  SLIDING_PUZZLE,
  MEMORY_EMOJIS,
  MATCHING_PAIRS,
};

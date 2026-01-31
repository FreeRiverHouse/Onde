// =============================================================================
// 🌟 FEATURED SKINS OF THE DAY
// A curated collection of amazing skins that rotate daily
// =============================================================================

export interface FeaturedSkin {
  id: string;
  name: string;
  author: string;
  description: string;
  tags: string[];
  category: 'fantasy' | 'sci-fi' | 'cute' | 'spooky' | 'gaming' | 'character' | 'meme' | 'nature';
  difficulty: 'easy' | 'medium' | 'hard';
  // Color palette for procedural generation
  palette: {
    skin: string;
    hair: string;
    primary: string;
    secondary: string;
    accent: string;
    eyes: string;
  };
  // Special features
  hasGlow?: boolean;
  hasPattern?: 'stripes' | 'dots' | 'gradient' | 'camo';
  featured?: boolean;
}

// Curated collection of featured skins
export const FEATURED_SKINS: FeaturedSkin[] = [
  // 🔥 FANTASY
  {
    id: 'dragon-warrior',
    name: 'Dragon Warrior',
    author: 'Onde Team',
    description: 'A fierce warrior with dragon-scale armor! Perfect for adventure.',
    tags: ['dragon', 'warrior', 'fire', 'epic'],
    category: 'fantasy',
    difficulty: 'medium',
    palette: {
      skin: '#d4a76a',
      hair: '#2c1810',
      primary: '#dc143c',
      secondary: '#ffd700',
      accent: '#ff4500',
      eyes: '#ffff00',
    },
    hasGlow: true,
  },
  {
    id: 'ice-queen',
    name: 'Ice Queen',
    author: 'Onde Team',
    description: 'Regal and powerful, the Ice Queen commands the frozen realm.',
    tags: ['ice', 'queen', 'frozen', 'royal'],
    category: 'fantasy',
    difficulty: 'hard',
    palette: {
      skin: '#e8e8ff',
      hair: '#b0e0e6',
      primary: '#4169e1',
      secondary: '#87ceeb',
      accent: '#ffffff',
      eyes: '#00ffff',
    },
    hasGlow: true,
    hasPattern: 'gradient',
  },
  {
    id: 'forest-elf',
    name: 'Forest Elf',
    author: 'Onde Team',
    description: 'A mystical elf from the enchanted forest.',
    tags: ['elf', 'forest', 'nature', 'magic'],
    category: 'fantasy',
    difficulty: 'medium',
    palette: {
      skin: '#f5deb3',
      hair: '#228b22',
      primary: '#006400',
      secondary: '#8b4513',
      accent: '#ffd700',
      eyes: '#32cd32',
    },
  },
  {
    id: 'dark-wizard',
    name: 'Dark Wizard',
    author: 'Onde Team',
    description: 'Master of dark arts and ancient spells.',
    tags: ['wizard', 'dark', 'magic', 'mysterious'],
    category: 'fantasy',
    difficulty: 'hard',
    palette: {
      skin: '#c4a57b',
      hair: '#1a1a1a',
      primary: '#4b0082',
      secondary: '#8b008b',
      accent: '#9400d3',
      eyes: '#ff00ff',
    },
    hasGlow: true,
  },

  // 🚀 SCI-FI
  {
    id: 'cyber-ninja',
    name: 'Cyber Ninja',
    author: 'Onde Team',
    description: 'A futuristic ninja with neon enhancements!',
    tags: ['cyber', 'ninja', 'neon', 'futuristic'],
    category: 'sci-fi',
    difficulty: 'hard',
    palette: {
      skin: '#d4a76a',
      hair: '#1a1a1a',
      primary: '#00ffff',
      secondary: '#ff00ff',
      accent: '#00ff00',
      eyes: '#00ffff',
    },
    hasGlow: true,
  },
  {
    id: 'space-explorer',
    name: 'Space Explorer',
    author: 'Onde Team',
    description: 'Ready to discover new galaxies and planets!',
    tags: ['space', 'astronaut', 'NASA', 'stars'],
    category: 'sci-fi',
    difficulty: 'easy',
    palette: {
      skin: '#ffdfc4',
      hair: '#3d2314',
      primary: '#ffffff',
      secondary: '#ff6b35',
      accent: '#4169e1',
      eyes: '#ffffff',
    },
  },
  {
    id: 'robot-android',
    name: 'Android X-7',
    author: 'Onde Team',
    description: 'Advanced AI robot with glowing circuits.',
    tags: ['robot', 'android', 'AI', 'tech'],
    category: 'sci-fi',
    difficulty: 'medium',
    palette: {
      skin: '#c0c0c0',
      hair: '#4a4a4a',
      primary: '#3498db',
      secondary: '#2c3e50',
      accent: '#00ff00',
      eyes: '#00ff00',
    },
    hasGlow: true,
    hasPattern: 'stripes',
  },

  // 🐱 CUTE
  {
    id: 'rainbow-cat',
    name: 'Rainbow Cat',
    author: 'Onde Team',
    description: 'The most colorful kitty in the world! Meow!',
    tags: ['cat', 'rainbow', 'cute', 'kawaii'],
    category: 'cute',
    difficulty: 'easy',
    palette: {
      skin: '#ffb6c1',
      hair: '#ff69b4',
      primary: '#ffd700',
      secondary: '#87ceeb',
      accent: '#98fb98',
      eyes: '#000000',
    },
    hasPattern: 'gradient',
  },
  {
    id: 'bunny-hero',
    name: 'Bunny Hero',
    author: 'Onde Team',
    description: 'A brave little bunny ready for adventure!',
    tags: ['bunny', 'hero', 'cute', 'fluffy'],
    category: 'cute',
    difficulty: 'easy',
    palette: {
      skin: '#ffe4e1',
      hair: '#ffb6c1',
      primary: '#ff69b4',
      secondary: '#ffffff',
      accent: '#ffc0cb',
      eyes: '#ff1493',
    },
  },
  {
    id: 'pixel-panda',
    name: 'Pixel Panda',
    author: 'Onde Team',
    description: 'Adorable panda loves bamboo and video games!',
    tags: ['panda', 'pixel', 'cute', 'bamboo'],
    category: 'cute',
    difficulty: 'easy',
    palette: {
      skin: '#ffffff',
      hair: '#1a1a1a',
      primary: '#1a1a1a',
      secondary: '#ffffff',
      accent: '#32cd32',
      eyes: '#1a1a1a',
    },
  },

  // 👻 SPOOKY
  {
    id: 'ghost-pirate',
    name: 'Ghost Pirate',
    author: 'Onde Team',
    description: 'Arr! The phantom of the seven seas!',
    tags: ['ghost', 'pirate', 'spooky', 'haunted'],
    category: 'spooky',
    difficulty: 'medium',
    palette: {
      skin: '#b8b8b8',
      hair: '#2c2c2c',
      primary: '#8b0000',
      secondary: '#1a1a1a',
      accent: '#ffd700',
      eyes: '#00ffff',
    },
    hasGlow: true,
  },
  {
    id: 'vampire-lord',
    name: 'Vampire Lord',
    author: 'Onde Team',
    description: 'An ancient vampire awakens from his coffin.',
    tags: ['vampire', 'dark', 'halloween', 'undead'],
    category: 'spooky',
    difficulty: 'hard',
    palette: {
      skin: '#d3d3d3',
      hair: '#1a1a1a',
      primary: '#8b0000',
      secondary: '#2c2c2c',
      accent: '#dc143c',
      eyes: '#ff0000',
    },
    hasGlow: true,
  },
  {
    id: 'zombie-gamer',
    name: 'Zombie Gamer',
    author: 'Onde Team',
    description: 'Even zombies need to level up their skills!',
    tags: ['zombie', 'gamer', 'undead', 'funny'],
    category: 'spooky',
    difficulty: 'easy',
    palette: {
      skin: '#5a8f5a',
      hair: '#2d4a2d',
      primary: '#3d5a3d',
      secondary: '#2d4a2d',
      accent: '#ff0000',
      eyes: '#ffff00',
    },
  },

  // 🎮 GAMING
  {
    id: 'pro-gamer',
    name: 'Pro Gamer',
    author: 'Onde Team',
    description: 'Champion of eSports with RGB everything!',
    tags: ['gamer', 'esports', 'RGB', 'champion'],
    category: 'gaming',
    difficulty: 'medium',
    palette: {
      skin: '#d4a76a',
      hair: '#2c1810',
      primary: '#9146ff',
      secondary: '#1a1a1a',
      accent: '#00ff00',
      eyes: '#ffffff',
    },
    hasGlow: true,
    hasPattern: 'stripes',
  },
  {
    id: 'retro-player',
    name: 'Retro Player',
    author: 'Onde Team',
    description: '8-bit nostalgia with a modern twist.',
    tags: ['retro', '8bit', 'pixel', 'classic'],
    category: 'gaming',
    difficulty: 'easy',
    palette: {
      skin: '#f0c8a8',
      hair: '#8b4513',
      primary: '#ff0000',
      secondary: '#0000ff',
      accent: '#ffff00',
      eyes: '#000000',
    },
  },

  // 👤 CHARACTER
  {
    id: 'ninja-master',
    name: 'Ninja Master',
    author: 'Onde Team',
    description: 'Stealth and speed are your greatest weapons.',
    tags: ['ninja', 'stealth', 'japan', 'warrior'],
    category: 'character',
    difficulty: 'medium',
    palette: {
      skin: '#d4a76a',
      hair: '#1a1a1a',
      primary: '#1a1a1a',
      secondary: '#2c2c2c',
      accent: '#dc143c',
      eyes: '#ffffff',
    },
  },
  {
    id: 'royal-knight',
    name: 'Royal Knight',
    author: 'Onde Team',
    description: 'Defender of the kingdom in shining armor.',
    tags: ['knight', 'armor', 'royal', 'warrior'],
    category: 'character',
    difficulty: 'hard',
    palette: {
      skin: '#d4a76a',
      hair: '#3d2314',
      primary: '#c0c0c0',
      secondary: '#808080',
      accent: '#ffd700',
      eyes: '#4169e1',
    },
    hasGlow: true,
  },
  {
    id: 'pirate-captain',
    name: 'Pirate Captain',
    author: 'Onde Team',
    description: 'Set sail for treasure and adventure!',
    tags: ['pirate', 'captain', 'treasure', 'adventure'],
    category: 'character',
    difficulty: 'medium',
    palette: {
      skin: '#c4956a',
      hair: '#2c1810',
      primary: '#8b0000',
      secondary: '#1a1a1a',
      accent: '#ffd700',
      eyes: '#ffffff',
    },
  },

  // 😂 MEME
  {
    id: 'doge-skin',
    name: 'Much Doge',
    author: 'Onde Team',
    description: 'Such wow. Very skin. Much pixel.',
    tags: ['doge', 'meme', 'shiba', 'wow'],
    category: 'meme',
    difficulty: 'easy',
    palette: {
      skin: '#f4d03f',
      hair: '#e67e22',
      primary: '#f39c12',
      secondary: '#d35400',
      accent: '#ffffff',
      eyes: '#2c3e50',
    },
  },
  {
    id: 'banana-man',
    name: 'Banana Man',
    author: 'Onde Team',
    description: 'This skin is absolutely bananas!',
    tags: ['banana', 'fruit', 'funny', 'yellow'],
    category: 'meme',
    difficulty: 'easy',
    palette: {
      skin: '#ffe135',
      hair: '#8b4513',
      primary: '#ffd700',
      secondary: '#f4d03f',
      accent: '#654321',
      eyes: '#000000',
    },
  },

  // 🌿 NATURE
  {
    id: 'flower-fairy',
    name: 'Flower Fairy',
    author: 'Onde Team',
    description: 'A magical fairy from the enchanted garden.',
    tags: ['fairy', 'flower', 'nature', 'magic'],
    category: 'nature',
    difficulty: 'medium',
    palette: {
      skin: '#ffebcd',
      hair: '#ff69b4',
      primary: '#ff1493',
      secondary: '#98fb98',
      accent: '#ffd700',
      eyes: '#00ff00',
    },
    hasGlow: true,
  },
  {
    id: 'ocean-mermaid',
    name: 'Ocean Mermaid',
    author: 'Onde Team',
    description: 'Princess of the deep blue sea.',
    tags: ['mermaid', 'ocean', 'sea', 'magical'],
    category: 'nature',
    difficulty: 'hard',
    palette: {
      skin: '#a8e6cf',
      hair: '#40e0d0',
      primary: '#20b2aa',
      secondary: '#00ced1',
      accent: '#9370db',
      eyes: '#00ffff',
    },
    hasGlow: true,
    hasPattern: 'gradient',
  },
];

// =============================================================================
// SKIN OF THE DAY SELECTION LOGIC
// =============================================================================

/**
 * Gets the "Skin of the Day" based on the current date.
 * Uses a deterministic algorithm so all users see the same skin on the same day.
 */
export function getSkinOfTheDay(): FeaturedSkin {
  const today = new Date();
  // Create a date string that changes daily: YYYYMMDD
  const dateKey = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // Use the date as a seed to pick a skin
  const index = dateKey % FEATURED_SKINS.length;
  return FEATURED_SKINS[index];
}

/**
 * Gets the next skin that will be featured (tomorrow's skin).
 */
export function getNextSkinOfTheDay(): FeaturedSkin {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateKey = tomorrow.getFullYear() * 10000 + (tomorrow.getMonth() + 1) * 100 + tomorrow.getDate();
  const index = dateKey % FEATURED_SKINS.length;
  return FEATURED_SKINS[index];
}

/**
 * Gets the time remaining until the next skin of the day.
 */
export function getTimeUntilNextSkin(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const diff = tomorrow.getTime() - now.getTime();
  
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

/**
 * Gets a collection of recent featured skins (past week).
 */
export function getRecentFeaturedSkins(): FeaturedSkin[] {
  const result: FeaturedSkin[] = [];
  const today = new Date();
  
  for (let i = 1; i <= 7; i++) {
    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - i);
    const dateKey = pastDate.getFullYear() * 10000 + (pastDate.getMonth() + 1) * 100 + pastDate.getDate();
    const index = dateKey % FEATURED_SKINS.length;
    const skin = FEATURED_SKINS[index];
    // Avoid duplicates
    if (!result.find(s => s.id === skin.id)) {
      result.push(skin);
    }
  }
  
  return result.slice(0, 5);
}

/**
 * Gets a random selection of featured skins for "You might also like" section.
 */
export function getRandomFeaturedSkins(exclude?: string, count = 4): FeaturedSkin[] {
  const filtered = exclude 
    ? FEATURED_SKINS.filter(s => s.id !== exclude)
    : FEATURED_SKINS;
  
  // Fisher-Yates shuffle with seed from current timestamp (changes every hour)
  const seed = Math.floor(Date.now() / (1000 * 60 * 60));
  const shuffled = [...filtered];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = ((seed * (i + 1)) % shuffled.length);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, count);
}

/**
 * Gets skins by category.
 */
export function getSkinsByCategory(category: FeaturedSkin['category']): FeaturedSkin[] {
  return FEATURED_SKINS.filter(s => s.category === category);
}

/**
 * Generates a skin preview image from the palette (procedural generation).
 */
export function generateSkinPreviewFromPalette(skin: FeaturedSkin): string {
  if (typeof window === 'undefined') return '';
  
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  const { palette, hasGlow, hasPattern } = skin;
  
  // === HEAD ===
  // Front face (8-15, 8-15)
  ctx.fillStyle = palette.skin;
  ctx.fillRect(8, 8, 8, 8);
  
  // Hair on top
  ctx.fillStyle = palette.hair;
  ctx.fillRect(8, 0, 8, 8);
  ctx.fillRect(8, 8, 8, 2); // bangs
  
  // Side faces
  ctx.fillStyle = palette.skin;
  ctx.fillRect(0, 8, 8, 8);
  ctx.fillRect(16, 8, 8, 8);
  ctx.fillRect(24, 8, 8, 8);
  
  // Hair on sides
  ctx.fillStyle = palette.hair;
  ctx.fillRect(0, 8, 8, 3);
  ctx.fillRect(16, 8, 8, 3);
  ctx.fillRect(24, 8, 8, 4);
  
  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(10, 12, 2, 2);
  ctx.fillRect(14, 12, 2, 2);
  ctx.fillStyle = palette.eyes === '#ffffff' ? '#1a1a1a' : palette.eyes;
  ctx.fillRect(10, 12, 1, 1);
  ctx.fillRect(14, 12, 1, 1);
  
  // Nose
  ctx.fillStyle = palette.skin;
  ctx.fillRect(12, 14, 2, 1);
  
  // Mouth
  ctx.fillStyle = '#c4a57b';
  ctx.fillRect(11, 15, 4, 1);
  
  // === BODY ===
  ctx.fillStyle = palette.primary;
  ctx.fillRect(20, 20, 8, 12);
  ctx.fillRect(32, 20, 8, 12);
  ctx.fillRect(16, 20, 4, 12);
  ctx.fillRect(28, 20, 4, 12);
  ctx.fillRect(20, 16, 8, 4);
  
  // Body accent/detail
  ctx.fillStyle = palette.accent;
  ctx.fillRect(22, 22, 4, 2);
  if (hasPattern === 'stripes') {
    ctx.fillRect(20, 24, 8, 1);
    ctx.fillRect(20, 28, 8, 1);
  }
  
  // === ARMS ===
  ctx.fillStyle = palette.primary;
  ctx.fillRect(44, 20, 4, 8);
  ctx.fillRect(48, 20, 4, 8);
  ctx.fillRect(40, 20, 4, 8);
  ctx.fillRect(52, 20, 4, 8);
  
  // Hands
  ctx.fillStyle = palette.skin;
  ctx.fillRect(44, 28, 4, 4);
  ctx.fillRect(40, 28, 4, 4);
  
  // Left arm (second layer)
  ctx.fillStyle = palette.primary;
  ctx.fillRect(36, 52, 4, 8);
  ctx.fillRect(44, 52, 4, 8);
  ctx.fillRect(32, 52, 4, 8);
  ctx.fillRect(48, 52, 4, 8);
  
  ctx.fillStyle = palette.skin;
  ctx.fillRect(36, 60, 4, 4);
  ctx.fillRect(32, 60, 4, 4);
  
  // === LEGS ===
  ctx.fillStyle = palette.secondary;
  ctx.fillRect(4, 20, 4, 8);
  ctx.fillRect(8, 20, 4, 8);
  ctx.fillRect(0, 20, 4, 8);
  ctx.fillRect(12, 20, 4, 8);
  
  // Shoes
  ctx.fillStyle = palette.accent;
  ctx.fillRect(4, 28, 4, 4);
  ctx.fillRect(0, 28, 4, 4);
  
  // Left leg (second layer)
  ctx.fillStyle = palette.secondary;
  ctx.fillRect(20, 52, 4, 8);
  ctx.fillRect(24, 52, 4, 8);
  ctx.fillRect(16, 52, 4, 8);
  ctx.fillRect(28, 52, 4, 8);
  
  ctx.fillStyle = palette.accent;
  ctx.fillRect(20, 60, 4, 4);
  ctx.fillRect(16, 60, 4, 4);
  
  // === GLOW EFFECT ===
  if (hasGlow) {
    ctx.fillStyle = palette.accent + '40'; // Semi-transparent
    ctx.fillRect(10, 11, 1, 3);
    ctx.fillRect(14, 11, 1, 3);
  }
  
  return canvas.toDataURL('image/png');
}

// Export category info for UI
export const SKIN_CATEGORIES = [
  { id: 'fantasy', name: 'Fantasy', emoji: '🧙' },
  { id: 'sci-fi', name: 'Sci-Fi', emoji: '🚀' },
  { id: 'cute', name: 'Cute', emoji: '🐱' },
  { id: 'spooky', name: 'Spooky', emoji: '👻' },
  { id: 'gaming', name: 'Gaming', emoji: '🎮' },
  { id: 'character', name: 'Character', emoji: '👤' },
  { id: 'meme', name: 'Meme', emoji: '😂' },
  { id: 'nature', name: 'Nature', emoji: '🌿' },
];

export const DIFFICULTY_INFO = {
  easy: { label: 'Easy', emoji: '⭐', color: 'text-green-500' },
  medium: { label: 'Medium', emoji: '⭐⭐', color: 'text-yellow-500' },
  hard: { label: 'Hard', emoji: '⭐⭐⭐', color: 'text-red-500' },
};

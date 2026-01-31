'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================
// SEASONAL TYPES
// ============================================

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type Holiday = 
  | 'christmas'
  | 'halloween'
  | 'easter'
  | 'valentine'
  | 'stPatrick'
  | 'newYear'
  | 'thanksgiving'
  | 'independence'
  | 'none';

export type SeasonalEvent = Season | Holiday;

export interface SeasonalDecoration {
  id: string;
  type: 'particle' | 'overlay' | 'border' | 'accent' | 'cursor' | 'icon';
  element: string; // emoji, CSS class, or SVG path
  quantity?: number;
  animation?: string;
  position?: 'random' | 'top' | 'bottom' | 'corner' | 'cursor';
  opacity?: number;
  size?: 'small' | 'medium' | 'large';
  layer?: 'background' | 'foreground';
}

export interface SeasonalThemeConfig {
  id: SeasonalEvent;
  name: string;
  nameIt: string;
  emoji: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    gradient: string;
  };
  decorations: SeasonalDecoration[];
  sounds?: {
    ambient?: string;
    interaction?: string;
  };
  achievements: string[]; // Achievement IDs that can be unlocked
  dateRange?: {
    start: { month: number; day: number };
    end: { month: number; day: number };
  };
}

export interface SeasonalAchievement {
  id: string;
  name: string;
  nameIt: string;
  description: string;
  descriptionIt: string;
  icon: string;
  event: SeasonalEvent;
  unlockCondition: 'login' | 'activity' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface SeasonalState {
  currentSeason: Season;
  currentHoliday: Holiday;
  activeTheme: SeasonalThemeConfig;
  decorationsEnabled: boolean;
  particlesEnabled: boolean;
  unlockedAchievements: string[];
  lastEventLogin: Record<string, string>; // event -> ISO date
}

// ============================================
// HOLIDAY DATE RANGES
// ============================================

const HOLIDAY_DATES: Record<Holiday, { start: { month: number; day: number }; end: { month: number; day: number } } | null> = {
  christmas: { start: { month: 12, day: 1 }, end: { month: 12, day: 31 } },
  halloween: { start: { month: 10, day: 15 }, end: { month: 11, day: 1 } },
  easter: { start: { month: 3, day: 20 }, end: { month: 4, day: 25 } }, // Approximate
  valentine: { start: { month: 2, day: 7 }, end: { month: 2, day: 15 } },
  stPatrick: { start: { month: 3, day: 15 }, end: { month: 3, day: 18 } },
  newYear: { start: { month: 12, day: 31 }, end: { month: 1, day: 2 } },
  thanksgiving: { start: { month: 11, day: 20 }, end: { month: 11, day: 28 } },
  independence: { start: { month: 7, day: 1 }, end: { month: 7, day: 5 } },
  none: null,
};

// ============================================
// SEASONAL THEME CONFIGURATIONS
// ============================================

export const SEASONAL_THEMES: Record<SeasonalEvent, SeasonalThemeConfig> = {
  // === SEASONS ===
  spring: {
    id: 'spring',
    name: 'Spring Bloom',
    nameIt: 'Primavera Fiorita',
    emoji: '🌸',
    description: 'Fresh blossoms and new beginnings',
    colors: {
      primary: '#FFB7C5',
      secondary: '#98D8C8',
      accent: '#F7DC6F',
      glow: 'rgba(255, 183, 197, 0.4)',
      gradient: 'linear-gradient(135deg, #FFB7C5 0%, #98D8C8 50%, #F7DC6F 100%)',
    },
    decorations: [
      { id: 'cherry-blossom', type: 'particle', element: '🌸', quantity: 15, animation: 'fall-gentle', position: 'top', size: 'small', layer: 'foreground' },
      { id: 'butterfly', type: 'particle', element: '🦋', quantity: 5, animation: 'flutter', position: 'random', size: 'medium', layer: 'foreground' },
      { id: 'flower-accent', type: 'accent', element: '🌷', position: 'corner', opacity: 0.3 },
    ],
    achievements: ['spring_awakening', 'flower_collector'],
  },
  
  summer: {
    id: 'summer',
    name: 'Summer Vibes',
    nameIt: 'Vibrazioni Estive',
    emoji: '☀️',
    description: 'Sunny days and beach adventures',
    colors: {
      primary: '#FFD93D',
      secondary: '#6BCB77',
      accent: '#4FC3F7',
      glow: 'rgba(255, 217, 61, 0.4)',
      gradient: 'linear-gradient(135deg, #FFD93D 0%, #4FC3F7 50%, #6BCB77 100%)',
    },
    decorations: [
      { id: 'sun-ray', type: 'overlay', element: 'sun-rays', animation: 'pulse-slow', position: 'top', opacity: 0.15, layer: 'background' },
      { id: 'beach-ball', type: 'particle', element: '🏖️', quantity: 3, animation: 'float', position: 'corner', size: 'large', layer: 'foreground' },
      { id: 'wave', type: 'border', element: 'wave-pattern', animation: 'wave', position: 'bottom' },
      { id: 'palm', type: 'accent', element: '🌴', position: 'corner', opacity: 0.4 },
    ],
    achievements: ['summer_surfer', 'beach_reader'],
  },
  
  autumn: {
    id: 'autumn',
    name: 'Autumn Harvest',
    nameIt: 'Raccolto Autunnale',
    emoji: '🍂',
    description: 'Golden leaves and cozy vibes',
    colors: {
      primary: '#D2691E',
      secondary: '#CD853F',
      accent: '#8B4513',
      glow: 'rgba(210, 105, 30, 0.4)',
      gradient: 'linear-gradient(135deg, #D2691E 0%, #CD853F 50%, #8B4513 100%)',
    },
    decorations: [
      { id: 'falling-leaf', type: 'particle', element: '🍂', quantity: 20, animation: 'fall-spiral', position: 'top', size: 'medium', layer: 'foreground' },
      { id: 'maple-leaf', type: 'particle', element: '🍁', quantity: 10, animation: 'fall-gentle', position: 'top', size: 'small', layer: 'foreground' },
      { id: 'pumpkin', type: 'accent', element: '🎃', position: 'corner', opacity: 0.3 },
    ],
    achievements: ['autumn_reader', 'cozy_vibes'],
  },
  
  winter: {
    id: 'winter',
    name: 'Winter Wonderland',
    nameIt: 'Paese delle Meraviglie Invernale',
    emoji: '❄️',
    description: 'Snowy landscapes and warm stories',
    colors: {
      primary: '#B0E0E6',
      secondary: '#E0FFFF',
      accent: '#ADD8E6',
      glow: 'rgba(176, 224, 230, 0.4)',
      gradient: 'linear-gradient(135deg, #B0E0E6 0%, #FFFFFF 50%, #E0FFFF 100%)',
    },
    decorations: [
      { id: 'snowflake', type: 'particle', element: '❄️', quantity: 25, animation: 'fall-gentle', position: 'top', size: 'small', layer: 'foreground' },
      { id: 'snow-pile', type: 'border', element: 'snow-pile', position: 'bottom', opacity: 0.6 },
    ],
    achievements: ['winter_explorer', 'snow_reader'],
  },
  
  // === HOLIDAYS ===
  christmas: {
    id: 'christmas',
    name: 'Christmas Magic',
    nameIt: 'Magia di Natale',
    emoji: '🎄',
    description: 'Ho ho ho! Festive decorations everywhere',
    colors: {
      primary: '#C41E3A',
      secondary: '#228B22',
      accent: '#FFD700',
      glow: 'rgba(196, 30, 58, 0.4)',
      gradient: 'linear-gradient(135deg, #C41E3A 0%, #228B22 50%, #FFD700 100%)',
    },
    decorations: [
      { id: 'snowflake-xmas', type: 'particle', element: '❄️', quantity: 30, animation: 'fall-gentle', position: 'top', size: 'small', layer: 'background' },
      { id: 'ornament', type: 'particle', element: '🎄', quantity: 5, animation: 'float', position: 'corner', size: 'large', layer: 'foreground' },
      { id: 'star', type: 'accent', element: '⭐', position: 'top', opacity: 0.8, animation: 'twinkle' },
      { id: 'gift', type: 'particle', element: '🎁', quantity: 8, animation: 'bounce', position: 'bottom', size: 'medium', layer: 'foreground' },
      { id: 'santa', type: 'icon', element: '🎅', position: 'corner', size: 'large' },
      { id: 'lights', type: 'border', element: 'christmas-lights', animation: 'blink', position: 'top' },
    ],
    achievements: ['christmas_spirit', 'gift_unwrapper', 'santa_helper'],
    dateRange: HOLIDAY_DATES.christmas!,
  },
  
  halloween: {
    id: 'halloween',
    name: 'Spooky Halloween',
    nameIt: 'Halloween Spaventoso',
    emoji: '🎃',
    description: 'Trick or treat! Spooky season is here',
    colors: {
      primary: '#FF6600',
      secondary: '#4B0082',
      accent: '#00FF00',
      glow: 'rgba(255, 102, 0, 0.4)',
      gradient: 'linear-gradient(135deg, #FF6600 0%, #4B0082 50%, #1a1a2e 100%)',
    },
    decorations: [
      { id: 'pumpkin', type: 'particle', element: '🎃', quantity: 10, animation: 'float', position: 'random', size: 'medium', layer: 'foreground' },
      { id: 'ghost', type: 'particle', element: '👻', quantity: 8, animation: 'float-spooky', position: 'random', size: 'medium', layer: 'foreground' },
      { id: 'bat', type: 'particle', element: '🦇', quantity: 12, animation: 'flutter', position: 'top', size: 'small', layer: 'foreground' },
      { id: 'spider', type: 'accent', element: '🕷️', position: 'corner', size: 'small' },
      { id: 'cobweb', type: 'overlay', element: 'cobweb', position: 'corner', opacity: 0.3, layer: 'foreground' },
      { id: 'skull', type: 'particle', element: '💀', quantity: 5, animation: 'float', position: 'random', size: 'small', layer: 'foreground' },
    ],
    achievements: ['trick_or_treat', 'spooky_reader', 'pumpkin_king'],
    dateRange: HOLIDAY_DATES.halloween!,
  },
  
  easter: {
    id: 'easter',
    name: 'Easter Celebration',
    nameIt: 'Celebrazione di Pasqua',
    emoji: '🐰',
    description: 'Hop hop! Easter eggs and bunnies',
    colors: {
      primary: '#FFB6C1',
      secondary: '#87CEEB',
      accent: '#98FB98',
      glow: 'rgba(255, 182, 193, 0.4)',
      gradient: 'linear-gradient(135deg, #FFB6C1 0%, #87CEEB 50%, #98FB98 100%)',
    },
    decorations: [
      { id: 'bunny', type: 'particle', element: '🐰', quantity: 8, animation: 'hop', position: 'bottom', size: 'medium', layer: 'foreground' },
      { id: 'egg-pink', type: 'particle', element: '🥚', quantity: 10, animation: 'float', position: 'random', size: 'small', layer: 'foreground' },
      { id: 'chick', type: 'particle', element: '🐣', quantity: 6, animation: 'bounce', position: 'bottom', size: 'small', layer: 'foreground' },
      { id: 'carrot', type: 'accent', element: '🥕', position: 'corner', opacity: 0.4 },
      { id: 'basket', type: 'icon', element: '🧺', position: 'corner', size: 'large' },
    ],
    achievements: ['egg_hunter', 'bunny_friend', 'easter_basket'],
    dateRange: HOLIDAY_DATES.easter!,
  },
  
  valentine: {
    id: 'valentine',
    name: "Valentine's Day",
    nameIt: 'San Valentino',
    emoji: '💕',
    description: 'Love is in the air!',
    colors: {
      primary: '#FF69B4',
      secondary: '#FF1493',
      accent: '#FFB6C1',
      glow: 'rgba(255, 105, 180, 0.4)',
      gradient: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 50%, #FFB6C1 100%)',
    },
    decorations: [
      { id: 'heart', type: 'particle', element: '❤️', quantity: 20, animation: 'float-up', position: 'bottom', size: 'medium', layer: 'foreground' },
      { id: 'pink-heart', type: 'particle', element: '💕', quantity: 15, animation: 'float-up', position: 'bottom', size: 'small', layer: 'foreground' },
      { id: 'cupid', type: 'icon', element: '💘', position: 'corner', size: 'large' },
      { id: 'rose', type: 'accent', element: '🌹', position: 'corner', opacity: 0.5 },
      { id: 'sparkle', type: 'particle', element: '✨', quantity: 10, animation: 'twinkle', position: 'random', size: 'small', layer: 'foreground' },
    ],
    achievements: ['love_reader', 'heart_collector', 'cupid_arrow'],
    dateRange: HOLIDAY_DATES.valentine!,
  },
  
  stPatrick: {
    id: 'stPatrick',
    name: "St. Patrick's Day",
    nameIt: 'San Patrizio',
    emoji: '☘️',
    description: 'Luck of the Irish!',
    colors: {
      primary: '#00A86B',
      secondary: '#228B22',
      accent: '#FFD700',
      glow: 'rgba(0, 168, 107, 0.4)',
      gradient: 'linear-gradient(135deg, #00A86B 0%, #228B22 50%, #FFD700 100%)',
    },
    decorations: [
      { id: 'clover', type: 'particle', element: '☘️', quantity: 20, animation: 'fall-gentle', position: 'top', size: 'small', layer: 'foreground' },
      { id: 'four-leaf', type: 'particle', element: '🍀', quantity: 5, animation: 'float', position: 'random', size: 'medium', layer: 'foreground' },
      { id: 'pot-gold', type: 'icon', element: '🪙', position: 'corner', size: 'large' },
      { id: 'rainbow', type: 'overlay', element: 'rainbow', position: 'top', opacity: 0.2, layer: 'background' },
      { id: 'leprechaun', type: 'accent', element: '🧙', position: 'corner', opacity: 0.6 },
    ],
    achievements: ['lucky_reader', 'gold_finder', 'irish_blessing'],
    dateRange: HOLIDAY_DATES.stPatrick!,
  },
  
  newYear: {
    id: 'newYear',
    name: 'New Year Celebration',
    nameIt: 'Capodanno',
    emoji: '🎆',
    description: 'Happy New Year! New beginnings await',
    colors: {
      primary: '#FFD700',
      secondary: '#C0C0C0',
      accent: '#4169E1',
      glow: 'rgba(255, 215, 0, 0.4)',
      gradient: 'linear-gradient(135deg, #FFD700 0%, #1a1a2e 50%, #C0C0C0 100%)',
    },
    decorations: [
      { id: 'firework', type: 'particle', element: '🎆', quantity: 10, animation: 'explode', position: 'top', size: 'large', layer: 'foreground' },
      { id: 'confetti', type: 'particle', element: '🎊', quantity: 25, animation: 'fall-spiral', position: 'top', size: 'small', layer: 'foreground' },
      { id: 'champagne', type: 'icon', element: '🍾', position: 'corner', size: 'large' },
      { id: 'star', type: 'particle', element: '⭐', quantity: 15, animation: 'twinkle', position: 'random', size: 'small', layer: 'background' },
      { id: 'party', type: 'accent', element: '🥳', position: 'corner', opacity: 0.6 },
    ],
    achievements: ['first_of_year', 'resolution_maker', 'party_reader'],
    dateRange: HOLIDAY_DATES.newYear!,
  },
  
  thanksgiving: {
    id: 'thanksgiving',
    name: 'Thanksgiving',
    nameIt: 'Giorno del Ringraziamento',
    emoji: '🦃',
    description: 'Grateful for books and stories!',
    colors: {
      primary: '#8B4513',
      secondary: '#D2691E',
      accent: '#FFD700',
      glow: 'rgba(139, 69, 19, 0.4)',
      gradient: 'linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #FFD700 100%)',
    },
    decorations: [
      { id: 'turkey', type: 'icon', element: '🦃', position: 'corner', size: 'large' },
      { id: 'corn', type: 'particle', element: '🌽', quantity: 8, animation: 'float', position: 'random', size: 'medium', layer: 'foreground' },
      { id: 'pie', type: 'accent', element: '🥧', position: 'corner', opacity: 0.5 },
      { id: 'autumn-leaf', type: 'particle', element: '🍂', quantity: 15, animation: 'fall-spiral', position: 'top', size: 'small', layer: 'foreground' },
    ],
    achievements: ['grateful_reader', 'feast_of_stories', 'thankful_heart'],
    dateRange: HOLIDAY_DATES.thanksgiving!,
  },
  
  independence: {
    id: 'independence',
    name: 'Independence Day',
    nameIt: 'Giorno dell\'Indipendenza',
    emoji: '🇺🇸',
    description: 'Celebrate freedom!',
    colors: {
      primary: '#B22234',
      secondary: '#3C3B6E',
      accent: '#FFFFFF',
      glow: 'rgba(178, 34, 52, 0.4)',
      gradient: 'linear-gradient(135deg, #B22234 0%, #FFFFFF 50%, #3C3B6E 100%)',
    },
    decorations: [
      { id: 'firework-usa', type: 'particle', element: '🎆', quantity: 12, animation: 'explode', position: 'top', size: 'large', layer: 'foreground' },
      { id: 'flag', type: 'icon', element: '🇺🇸', position: 'corner', size: 'large' },
      { id: 'star-usa', type: 'particle', element: '⭐', quantity: 20, animation: 'twinkle', position: 'random', size: 'small', layer: 'background' },
      { id: 'liberty', type: 'accent', element: '🗽', position: 'corner', opacity: 0.4 },
    ],
    achievements: ['freedom_reader', 'patriot_star', 'liberty_seeker'],
    dateRange: HOLIDAY_DATES.independence!,
  },
  
  none: {
    id: 'none',
    name: 'Default',
    nameIt: 'Predefinito',
    emoji: '📚',
    description: 'Regular theme',
    colors: {
      primary: '#D4AF37',
      secondary: '#5B9AA0',
      accent: '#E07A5F',
      glow: 'rgba(212, 175, 55, 0.4)',
      gradient: 'linear-gradient(135deg, #0B1929 0%, #1A3A52 100%)',
    },
    decorations: [],
    achievements: [],
  },
};

// ============================================
// SEASONAL ACHIEVEMENTS
// ============================================

export const SEASONAL_ACHIEVEMENTS: SeasonalAchievement[] = [
  // Christmas
  { id: 'christmas_spirit', name: 'Christmas Spirit', nameIt: 'Spirito Natalizio', description: 'Visit during Christmas season', descriptionIt: 'Visita durante il periodo natalizio', icon: '🎄', event: 'christmas', unlockCondition: 'login', rarity: 'common' },
  { id: 'gift_unwrapper', name: 'Gift Unwrapper', nameIt: 'Scarta Regali', description: 'Read 5 books during Christmas', descriptionIt: 'Leggi 5 libri durante Natale', icon: '🎁', event: 'christmas', unlockCondition: 'activity', rarity: 'rare' },
  { id: 'santa_helper', name: "Santa's Helper", nameIt: 'Aiutante di Babbo Natale', description: 'Complete all Christmas activities', descriptionIt: 'Completa tutte le attività natalizie', icon: '🎅', event: 'christmas', unlockCondition: 'special', rarity: 'legendary' },
  
  // Halloween
  { id: 'trick_or_treat', name: 'Trick or Treat', nameIt: 'Dolcetto o Scherzetto', description: 'Visit during Halloween', descriptionIt: 'Visita durante Halloween', icon: '🎃', event: 'halloween', unlockCondition: 'login', rarity: 'common' },
  { id: 'spooky_reader', name: 'Spooky Reader', nameIt: 'Lettore Spaventoso', description: 'Read 3 spooky stories', descriptionIt: 'Leggi 3 storie spaventose', icon: '👻', event: 'halloween', unlockCondition: 'activity', rarity: 'rare' },
  { id: 'pumpkin_king', name: 'Pumpkin King', nameIt: 'Re delle Zucche', description: 'Master of Halloween activities', descriptionIt: 'Maestro delle attività di Halloween', icon: '🦇', event: 'halloween', unlockCondition: 'special', rarity: 'epic' },
  
  // Easter
  { id: 'egg_hunter', name: 'Egg Hunter', nameIt: 'Cacciatore di Uova', description: 'Visit during Easter', descriptionIt: 'Visita durante Pasqua', icon: '🥚', event: 'easter', unlockCondition: 'login', rarity: 'common' },
  { id: 'bunny_friend', name: 'Bunny Friend', nameIt: 'Amico del Coniglietto', description: 'Find all hidden Easter eggs', descriptionIt: 'Trova tutte le uova nascoste', icon: '🐰', event: 'easter', unlockCondition: 'activity', rarity: 'rare' },
  { id: 'easter_basket', name: 'Easter Basket', nameIt: 'Cestino Pasquale', description: 'Complete Easter collection', descriptionIt: 'Completa la collezione pasquale', icon: '🧺', event: 'easter', unlockCondition: 'special', rarity: 'epic' },
  
  // Valentine's
  { id: 'love_reader', name: 'Love Reader', nameIt: 'Lettore Innamorato', description: "Visit on Valentine's Day", descriptionIt: 'Visita a San Valentino', icon: '❤️', event: 'valentine', unlockCondition: 'login', rarity: 'common' },
  { id: 'heart_collector', name: 'Heart Collector', nameIt: 'Collezionista di Cuori', description: 'Collect all heart decorations', descriptionIt: 'Colleziona tutte le decorazioni a cuore', icon: '💕', event: 'valentine', unlockCondition: 'activity', rarity: 'rare' },
  { id: 'cupid_arrow', name: "Cupid's Arrow", nameIt: 'Freccia di Cupido', description: 'Share a book with a friend', descriptionIt: 'Condividi un libro con un amico', icon: '💘', event: 'valentine', unlockCondition: 'special', rarity: 'epic' },
  
  // Summer
  { id: 'summer_surfer', name: 'Summer Surfer', nameIt: 'Surfista Estivo', description: 'Visit during summer months', descriptionIt: 'Visita durante i mesi estivi', icon: '🏄', event: 'summer', unlockCondition: 'login', rarity: 'common' },
  { id: 'beach_reader', name: 'Beach Reader', nameIt: 'Lettore da Spiaggia', description: 'Read 10 books in summer', descriptionIt: 'Leggi 10 libri in estate', icon: '🏖️', event: 'summer', unlockCondition: 'activity', rarity: 'rare' },
  
  // Spring
  { id: 'spring_awakening', name: 'Spring Awakening', nameIt: 'Risveglio Primaverile', description: 'Visit during spring', descriptionIt: 'Visita durante la primavera', icon: '🌸', event: 'spring', unlockCondition: 'login', rarity: 'common' },
  { id: 'flower_collector', name: 'Flower Collector', nameIt: 'Collezionista di Fiori', description: 'Discover spring themed books', descriptionIt: 'Scopri libri a tema primaverile', icon: '🌷', event: 'spring', unlockCondition: 'activity', rarity: 'rare' },
  
  // Autumn
  { id: 'autumn_reader', name: 'Autumn Reader', nameIt: 'Lettore Autunnale', description: 'Visit during autumn', descriptionIt: 'Visita durante l\'autunno', icon: '🍂', event: 'autumn', unlockCondition: 'login', rarity: 'common' },
  { id: 'cozy_vibes', name: 'Cozy Vibes', nameIt: 'Atmosfera Accogliente', description: 'Read by the fireplace', descriptionIt: 'Leggi accanto al camino', icon: '🍁', event: 'autumn', unlockCondition: 'activity', rarity: 'rare' },
  
  // Winter
  { id: 'winter_explorer', name: 'Winter Explorer', nameIt: 'Esploratore Invernale', description: 'Visit during winter', descriptionIt: 'Visita durante l\'inverno', icon: '❄️', event: 'winter', unlockCondition: 'login', rarity: 'common' },
  { id: 'snow_reader', name: 'Snow Reader', nameIt: 'Lettore della Neve', description: 'Read during a snowy day', descriptionIt: 'Leggi durante una giornata nevosa', icon: '☃️', event: 'winter', unlockCondition: 'activity', rarity: 'rare' },
  
  // New Year
  { id: 'first_of_year', name: 'First of the Year', nameIt: 'Primo dell\'Anno', description: 'Visit on New Year', descriptionIt: 'Visita a Capodanno', icon: '🎆', event: 'newYear', unlockCondition: 'login', rarity: 'common' },
  { id: 'resolution_maker', name: 'Resolution Maker', nameIt: 'Creatore di Propositi', description: 'Set a reading goal for the year', descriptionIt: 'Imposta un obiettivo di lettura per l\'anno', icon: '🎊', event: 'newYear', unlockCondition: 'activity', rarity: 'rare' },
  { id: 'party_reader', name: 'Party Reader', nameIt: 'Lettore Festaiolo', description: 'Read at midnight on New Year', descriptionIt: 'Leggi a mezzanotte a Capodanno', icon: '🥳', event: 'newYear', unlockCondition: 'special', rarity: 'legendary' },
  
  // St. Patrick's
  { id: 'lucky_reader', name: 'Lucky Reader', nameIt: 'Lettore Fortunato', description: "Visit on St. Patrick's Day", descriptionIt: 'Visita a San Patrizio', icon: '☘️', event: 'stPatrick', unlockCondition: 'login', rarity: 'common' },
  { id: 'gold_finder', name: 'Gold Finder', nameIt: 'Cercatore d\'Oro', description: 'Find the pot of gold', descriptionIt: 'Trova la pentola d\'oro', icon: '🪙', event: 'stPatrick', unlockCondition: 'activity', rarity: 'rare' },
  { id: 'irish_blessing', name: 'Irish Blessing', nameIt: 'Benedizione Irlandese', description: 'Complete St. Patrick\'s quest', descriptionIt: 'Completa la missione di San Patrizio', icon: '🍀', event: 'stPatrick', unlockCondition: 'special', rarity: 'epic' },
  
  // Thanksgiving
  { id: 'grateful_reader', name: 'Grateful Reader', nameIt: 'Lettore Grato', description: 'Visit on Thanksgiving', descriptionIt: 'Visita nel Giorno del Ringraziamento', icon: '🦃', event: 'thanksgiving', unlockCondition: 'login', rarity: 'common' },
  { id: 'feast_of_stories', name: 'Feast of Stories', nameIt: 'Banchetto di Storie', description: 'Read with family', descriptionIt: 'Leggi in famiglia', icon: '🥧', event: 'thanksgiving', unlockCondition: 'activity', rarity: 'rare' },
  { id: 'thankful_heart', name: 'Thankful Heart', nameIt: 'Cuore Grato', description: 'Share gratitude', descriptionIt: 'Condividi gratitudine', icon: '🧡', event: 'thanksgiving', unlockCondition: 'special', rarity: 'epic' },
  
  // Independence Day
  { id: 'freedom_reader', name: 'Freedom Reader', nameIt: 'Lettore della Libertà', description: 'Visit on Independence Day', descriptionIt: 'Visita nel Giorno dell\'Indipendenza', icon: '🇺🇸', event: 'independence', unlockCondition: 'login', rarity: 'common' },
  { id: 'patriot_star', name: 'Patriot Star', nameIt: 'Stella Patriottica', description: 'Read a historical story', descriptionIt: 'Leggi una storia storica', icon: '⭐', event: 'independence', unlockCondition: 'activity', rarity: 'rare' },
  { id: 'liberty_seeker', name: 'Liberty Seeker', nameIt: 'Cercatore di Libertà', description: 'Complete freedom quest', descriptionIt: 'Completa la missione della libertà', icon: '🗽', event: 'independence', unlockCondition: 'special', rarity: 'epic' },
];

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEY = 'onde-seasonal-state';

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get current season based on date (Northern Hemisphere)
 */
export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  
  // Spring: March 20 - June 20
  if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day < 21)) {
    return 'spring';
  }
  // Summer: June 21 - September 22
  if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day < 23)) {
    return 'summer';
  }
  // Autumn: September 23 - December 20
  if ((month === 9 && day >= 23) || month === 10 || month === 11 || (month === 12 && day < 21)) {
    return 'autumn';
  }
  // Winter: December 21 - March 19
  return 'winter';
}

/**
 * Check if a date falls within a holiday range
 */
function isDateInRange(
  date: Date,
  range: { start: { month: number; day: number }; end: { month: number; day: number } }
): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const { start, end } = range;
  
  // Handle ranges that span year boundary (e.g., New Year: Dec 31 - Jan 2)
  if (start.month > end.month) {
    return (
      (month === start.month && day >= start.day) ||
      (month > start.month) ||
      (month < end.month) ||
      (month === end.month && day <= end.day)
    );
  }
  
  // Normal range within same year
  if (month < start.month || month > end.month) return false;
  if (month === start.month && day < start.day) return false;
  if (month === end.month && day > end.day) return false;
  
  return true;
}

/**
 * Get current holiday (if any)
 */
export function getCurrentHoliday(date: Date = new Date()): Holiday {
  // Check holidays in priority order
  const holidayPriority: Holiday[] = [
    'christmas',
    'halloween',
    'easter',
    'valentine',
    'newYear',
    'stPatrick',
    'thanksgiving',
    'independence',
  ];
  
  for (const holiday of holidayPriority) {
    const range = HOLIDAY_DATES[holiday];
    if (range && isDateInRange(date, range)) {
      return holiday;
    }
  }
  
  return 'none';
}

/**
 * Get days until next holiday
 */
export function getDaysUntilHoliday(holiday: Holiday, fromDate: Date = new Date()): number {
  const range = HOLIDAY_DATES[holiday];
  if (!range) return Infinity;
  
  const year = fromDate.getFullYear();
  let holidayStart = new Date(year, range.start.month - 1, range.start.day);
  
  // If holiday already passed this year, check next year
  if (holidayStart < fromDate) {
    holidayStart = new Date(year + 1, range.start.month - 1, range.start.day);
  }
  
  const diffTime = holidayStart.getTime() - fromDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get all upcoming holidays within N days
 */
export function getUpcomingHolidays(days: number = 30, fromDate: Date = new Date()): Array<{ holiday: Holiday; daysUntil: number }> {
  const holidays: Holiday[] = ['christmas', 'halloween', 'easter', 'valentine', 'newYear', 'stPatrick', 'thanksgiving', 'independence'];
  
  return holidays
    .map(holiday => ({
      holiday,
      daysUntil: getDaysUntilHoliday(holiday, fromDate),
    }))
    .filter(h => h.daysUntil <= days)
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

// ============================================
// CSS GENERATION
// ============================================

/**
 * Generate CSS variables for seasonal theme
 */
export function generateSeasonalCSS(theme: SeasonalThemeConfig): Record<string, string> {
  return {
    '--seasonal-primary': theme.colors.primary,
    '--seasonal-secondary': theme.colors.secondary,
    '--seasonal-accent': theme.colors.accent,
    '--seasonal-glow': theme.colors.glow,
    '--seasonal-gradient': theme.colors.gradient,
  };
}

/**
 * Generate CSS keyframes for decorations
 */
export function generateDecorationKeyframes(): string {
  return `
    @keyframes seasonal-fall-gentle {
      0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
    }
    
    @keyframes seasonal-fall-spiral {
      0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
      10% { opacity: 1; }
      50% { transform: translateY(50vh) translateX(30px) rotate(180deg); }
      90% { opacity: 1; }
      100% { transform: translateY(110vh) translateX(-30px) rotate(360deg); opacity: 0; }
    }
    
    @keyframes seasonal-float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25% { transform: translateY(-15px) rotate(5deg); }
      50% { transform: translateY(-25px) rotate(0deg); }
      75% { transform: translateY(-15px) rotate(-5deg); }
    }
    
    @keyframes seasonal-float-up {
      0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
    }
    
    @keyframes seasonal-float-spooky {
      0%, 100% { transform: translateY(0) translateX(0) scale(1); }
      25% { transform: translateY(-20px) translateX(10px) scale(1.05); }
      50% { transform: translateY(-10px) translateX(-15px) scale(0.95); }
      75% { transform: translateY(-25px) translateX(5px) scale(1.02); }
    }
    
    @keyframes seasonal-flutter {
      0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
      25% { transform: translateY(-30px) translateX(20px) rotate(15deg); }
      50% { transform: translateY(-10px) translateX(-25px) rotate(-10deg); }
      75% { transform: translateY(-40px) translateX(15px) rotate(5deg); }
    }
    
    @keyframes seasonal-bounce {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-20px) scale(1.1); }
    }
    
    @keyframes seasonal-hop {
      0%, 100% { transform: translateY(0) translateX(0); }
      25% { transform: translateY(-30px) translateX(15px); }
      50% { transform: translateY(0) translateX(30px); }
      75% { transform: translateY(-20px) translateX(45px); }
    }
    
    @keyframes seasonal-twinkle {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.3; transform: scale(0.8); }
    }
    
    @keyframes seasonal-explode {
      0% { transform: scale(0) translateY(50vh); opacity: 0; }
      20% { transform: scale(0.5) translateY(20vh); opacity: 1; }
      40% { transform: scale(1.5) translateY(0); opacity: 1; }
      100% { transform: scale(2) translateY(-20vh); opacity: 0; }
    }
    
    @keyframes seasonal-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    
    @keyframes seasonal-wave {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(-10px); }
    }
    
    @keyframes seasonal-pulse-slow {
      0%, 100% { opacity: 0.15; transform: scale(1); }
      50% { opacity: 0.25; transform: scale(1.05); }
    }
  `;
}

// ============================================
// MAIN HOOK
// ============================================

const DEFAULT_STATE: SeasonalState = {
  currentSeason: 'winter',
  currentHoliday: 'none',
  activeTheme: SEASONAL_THEMES.none,
  decorationsEnabled: true,
  particlesEnabled: true,
  unlockedAchievements: [],
  lastEventLogin: {},
};

export function useSeasonalTheme() {
  const [state, setState] = useState<SeasonalState>(DEFAULT_STATE);
  const [mounted, setMounted] = useState(false);
  
  // Load state from localStorage
  useEffect(() => {
    setMounted(true);
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(prev => ({
          ...prev,
          decorationsEnabled: parsed.decorationsEnabled ?? true,
          particlesEnabled: parsed.particlesEnabled ?? true,
          unlockedAchievements: parsed.unlockedAchievements ?? [],
          lastEventLogin: parsed.lastEventLogin ?? {},
        }));
      }
    } catch (e) {
      console.error('Failed to load seasonal state:', e);
    }
  }, []);
  
  // Detect current season and holiday
  useEffect(() => {
    if (!mounted) return;
    
    const now = new Date();
    const season = getCurrentSeason(now);
    const holiday = getCurrentHoliday(now);
    
    // Holiday takes priority over season
    const activeEvent = holiday !== 'none' ? holiday : season;
    const activeTheme = SEASONAL_THEMES[activeEvent];
    
    setState(prev => ({
      ...prev,
      currentSeason: season,
      currentHoliday: holiday,
      activeTheme,
    }));
  }, [mounted]);
  
  // Save state changes
  useEffect(() => {
    if (!mounted) return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        decorationsEnabled: state.decorationsEnabled,
        particlesEnabled: state.particlesEnabled,
        unlockedAchievements: state.unlockedAchievements,
        lastEventLogin: state.lastEventLogin,
      }));
    } catch (e) {
      console.error('Failed to save seasonal state:', e);
    }
  }, [mounted, state.decorationsEnabled, state.particlesEnabled, state.unlockedAchievements, state.lastEventLogin]);
  
  // Check and unlock login achievements
  useEffect(() => {
    if (!mounted) return;
    
    const activeEvent = state.currentHoliday !== 'none' ? state.currentHoliday : state.currentSeason;
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = state.lastEventLogin[activeEvent];
    
    // If we haven't logged in during this event today
    if (lastLogin !== today) {
      // Find login achievement for this event
      const loginAchievement = SEASONAL_ACHIEVEMENTS.find(
        a => a.event === activeEvent && a.unlockCondition === 'login'
      );
      
      if (loginAchievement && !state.unlockedAchievements.includes(loginAchievement.id)) {
        // Unlock the achievement
        setState(prev => ({
          ...prev,
          unlockedAchievements: [...prev.unlockedAchievements, loginAchievement.id],
          lastEventLogin: { ...prev.lastEventLogin, [activeEvent]: today },
        }));
      } else {
        // Just update last login
        setState(prev => ({
          ...prev,
          lastEventLogin: { ...prev.lastEventLogin, [activeEvent]: today },
        }));
      }
    }
  }, [mounted, state.currentSeason, state.currentHoliday]);
  
  // Toggle decorations
  const toggleDecorations = useCallback(() => {
    setState(prev => ({ ...prev, decorationsEnabled: !prev.decorationsEnabled }));
  }, []);
  
  // Toggle particles
  const toggleParticles = useCallback(() => {
    setState(prev => ({ ...prev, particlesEnabled: !prev.particlesEnabled }));
  }, []);
  
  // Manually unlock an achievement
  const unlockAchievement = useCallback((achievementId: string) => {
    setState(prev => {
      if (prev.unlockedAchievements.includes(achievementId)) {
        return prev;
      }
      return {
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, achievementId],
      };
    });
  }, []);
  
  // Check if an achievement is unlocked
  const isAchievementUnlocked = useCallback((achievementId: string) => {
    return state.unlockedAchievements.includes(achievementId);
  }, [state.unlockedAchievements]);
  
  // Get achievements for current event
  const currentEventAchievements = useMemo(() => {
    const event = state.currentHoliday !== 'none' ? state.currentHoliday : state.currentSeason;
    return SEASONAL_ACHIEVEMENTS.filter(a => a.event === event);
  }, [state.currentSeason, state.currentHoliday]);
  
  // Get all unlocked seasonal achievements with details
  const unlockedAchievementsDetails = useMemo(() => {
    return SEASONAL_ACHIEVEMENTS.filter(a => state.unlockedAchievements.includes(a.id));
  }, [state.unlockedAchievements]);
  
  // Get CSS variables for current theme
  const cssVariables = useMemo(() => {
    return generateSeasonalCSS(state.activeTheme);
  }, [state.activeTheme]);
  
  // Get particles for rendering (if enabled)
  const activeParticles = useMemo(() => {
    if (!state.decorationsEnabled || !state.particlesEnabled) {
      return [];
    }
    return state.activeTheme.decorations.filter(d => d.type === 'particle');
  }, [state.decorationsEnabled, state.particlesEnabled, state.activeTheme]);
  
  // Get other decorations (non-particles)
  const activeDecorations = useMemo(() => {
    if (!state.decorationsEnabled) {
      return [];
    }
    return state.activeTheme.decorations.filter(d => d.type !== 'particle');
  }, [state.decorationsEnabled, state.activeTheme]);
  
  // Preview a theme (for settings)
  const previewTheme = useCallback((event: SeasonalEvent): SeasonalThemeConfig => {
    return SEASONAL_THEMES[event];
  }, []);
  
  // Get upcoming holidays
  const upcomingHolidays = useMemo(() => {
    return getUpcomingHolidays(60);
  }, []);
  
  // Get countdown to next holiday
  const nextHolidayCountdown = useMemo(() => {
    const upcoming = getUpcomingHolidays(365);
    if (upcoming.length === 0) return null;
    return {
      holiday: upcoming[0].holiday,
      theme: SEASONAL_THEMES[upcoming[0].holiday],
      daysUntil: upcoming[0].daysUntil,
    };
  }, []);
  
  return {
    // Current state
    currentSeason: state.currentSeason,
    currentHoliday: state.currentHoliday,
    activeTheme: state.activeTheme,
    isHolidayActive: state.currentHoliday !== 'none',
    
    // Settings
    decorationsEnabled: state.decorationsEnabled,
    particlesEnabled: state.particlesEnabled,
    toggleDecorations,
    toggleParticles,
    
    // Decorations
    activeParticles,
    activeDecorations,
    cssVariables,
    
    // Achievements
    currentEventAchievements,
    unlockedAchievements: state.unlockedAchievements,
    unlockedAchievementsDetails,
    unlockAchievement,
    isAchievementUnlocked,
    
    // Upcoming
    upcomingHolidays,
    nextHolidayCountdown,
    
    // Utilities
    previewTheme,
    allThemes: SEASONAL_THEMES,
    allAchievements: SEASONAL_ACHIEVEMENTS,
    getKeyframes: generateDecorationKeyframes,
  };
}

export default useSeasonalTheme;

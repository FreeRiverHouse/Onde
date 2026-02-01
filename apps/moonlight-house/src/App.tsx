import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import useSoundManager from './useSoundManager';
import useAmbientSoundscapes from './components/AmbientSoundscapes';
import useWeather, { type WeatherData, type WeatherCondition } from './hooks/useWeather';
import GameHub from './games/GameHub';
import { PuzzleGame, DrawingPad, MemoryGame, BubbleGame, SimonGame, CatchGame, GardeningGame, CookingGame, QuizGame } from './games';
import InteractiveObjects from './components/InteractiveObjects';
import MovementParticles from './components/MovementParticles';
import FootstepDustPuffs from './components/FootstepDustPuffs';
import LibraryBooks from './components/LibraryBooks';
import TailWagging from './components/TailWagging';

// Animation variants for room transitions
const pageTransition = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.05 },
  transition: { duration: 0.3, ease: "easeInOut" }
};

// ==================== HAPTIC FEEDBACK UTILITY (T1158) ====================
// Provides tactile feedback on mobile devices for button presses
const haptic = {
  // Light tap - for UI toggles, navigation
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  // Medium tap - for action buttons, confirmations
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  },
  // Heavy tap - for important actions, achievements
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  },
  // Success pattern - for level up, achievements
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 50, 30]);
    }
  },
  // Double tap - for special interactions like petting
  double: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([15, 30, 15]);
    }
  },
  // Error/warning - for insufficient coins, etc.
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]);
    }
  },
};

// Base path for assets
const BASE_URL = import.meta.env.BASE_URL || '/';

// ==================== TYPES ====================
type Language = 'it' | 'en';
type RoomKey = 'bedroom' | 'kitchen' | 'garden' | 'living' | 'bathroom' | 'garage' | 'shop' | 'supermarket' | 'attic' | 'basement' | 'library';
type MoodType = 'happy' | 'hungry' | 'sleepy' | 'playful';
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

// ==================== PET PERSONALITY SYSTEM (T1329) ====================
// Each pet has a unique personality that affects gameplay!
type PersonalityTrait = 'shy' | 'playful' | 'lazy';

interface PersonalityInfo {
  trait: PersonalityTrait;
  emoji: string;
  label: { it: string; en: string };
  description: { it: string; en: string };
  // Gameplay modifiers
  happinessMultiplier: number; // Affects happiness gains
  energyMultiplier: number; // Affects energy costs
  socialBonus: number; // Bonus happiness from petting/interaction
  specialBehavior: string; // Unique behavior description
}

const PERSONALITIES: Record<PersonalityTrait, PersonalityInfo> = {
  shy: {
    trait: 'shy',
    emoji: '🙈',
    label: { it: 'Timido', en: 'Shy' },
    description: { 
      it: 'Luna è un po\' timida, ma quando si apre è dolcissima!', 
      en: 'Luna is a bit shy, but super sweet once she opens up!' 
    },
    happinessMultiplier: 0.8, // Gets happy slower
    energyMultiplier: 0.9, // Uses less energy (cautious)
    socialBonus: 1.5, // Big bonus when petted (loves trust)
    specialBehavior: 'hides_sometimes',
  },
  playful: {
    trait: 'playful',
    emoji: '🎉',
    label: { it: 'Giocherellone', en: 'Playful' },
    description: { 
      it: 'Luna adora giocare e fare birichinate!', 
      en: 'Luna loves to play and cause mischief!' 
    },
    happinessMultiplier: 1.3, // Gets happy faster
    energyMultiplier: 1.2, // Uses more energy (hyper)
    socialBonus: 1.0, // Normal petting bonus
    specialBehavior: 'bounces_around',
  },
  lazy: {
    trait: 'lazy',
    emoji: '😴',
    label: { it: 'Pigrotto', en: 'Lazy' },
    description: { 
      it: 'Luna ama dormire e rilassarsi tutto il giorno!', 
      en: 'Luna loves to sleep and relax all day!' 
    },
    happinessMultiplier: 1.0, // Normal happiness
    energyMultiplier: 0.7, // Uses much less energy
    socialBonus: 1.2, // Loves cuddles
    specialBehavior: 'sleeps_more',
  },
};

// Random personality assignment for new pets
const getRandomPersonality = (): PersonalityTrait => {
  const traits: PersonalityTrait[] = ['shy', 'playful', 'lazy'];
  return traits[Math.floor(Math.random() * traits.length)];
};

// Get personality-specific idle messages
const getPersonalityIdleMessage = (personality: PersonalityTrait, lang: Language): string => {
  const messages: Record<PersonalityTrait, { it: string[]; en: string[] }> = {
    shy: {
      it: ['*si nasconde un po\'*', '*occhiate timide*', '*miagolio sommesso*'],
      en: ['*hides a little*', '*shy glances*', '*quiet meow*'],
    },
    playful: {
      it: ['*salta qua e là*', '*insegue la coda*', '*occhi birichini*'],
      en: ['*bouncing around*', '*chasing tail*', '*mischievous eyes*'],
    },
    lazy: {
      it: ['*sbadiglio enorme*', '*stiracchiamento*', '*sonnecchia*'],
      en: ['*big yawn*', '*stretching*', '*dozing off*'],
    },
  };
  const options = messages[personality][lang];
  return options[Math.floor(Math.random() * options.length)];
};

interface PetStats {
  health: number;
  hunger: number;
  energy: number;
  happiness: number;
  coins: number;
  level: number;
  xp: number;
  weight: number; // T1338: Pet weight tracking (0-100, >80 is overfed)
}

interface Achievement {
  id: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

interface GameState {
  dayCount: number;
  totalActions: number;
  roomsVisited: Set<RoomKey>;
  lastDailyReward: string | null;
  streak: number;
  totalPlayMinutes: number; // T1346: Total playtime tracking
}

// ==================== TOY BOX SYSTEM (T1175) ====================
interface Toy {
  id: string;
  name: { it: string; en: string };
  icon: string;
  description: { it: string; en: string };
  happinessBoost: number;
  energyCost: number;
  animation: 'bounce' | 'spin' | 'wiggle' | 'chase' | 'sparkle' | 'crazy';
  rarity: 'common' | 'rare' | 'legendary';
  unlockMethod: 'default' | 'level' | 'shop' | 'achievement' | 'event';
  unlockLevel?: number;
  price?: number;
}

const TOYS: Toy[] = [
  // Default toys (available from start)
  { id: 'ball', name: { it: 'Pallina', en: 'Ball' }, icon: '⚽', 
    description: { it: 'Una pallina colorata da rincorrere!', en: 'A colorful ball to chase!' },
    happinessBoost: 15, energyCost: 10, animation: 'bounce', rarity: 'common', unlockMethod: 'default' },
  { id: 'yarn', name: { it: 'Gomitolo', en: 'Yarn Ball' }, icon: '🧶',
    description: { it: 'Un morbido gomitolo di lana', en: 'A soft yarn ball' },
    happinessBoost: 12, energyCost: 8, animation: 'spin', rarity: 'common', unlockMethod: 'default' },
  { id: 'feather', name: { it: 'Piuma', en: 'Feather' }, icon: '🪶',
    description: { it: 'Una piuma leggera che danza nell\'aria', en: 'A light feather dancing in the air' },
    happinessBoost: 10, energyCost: 5, animation: 'wiggle', rarity: 'common', unlockMethod: 'default' },
  
  // Level unlock toys
  { id: 'mouse', name: { it: 'Topolino', en: 'Toy Mouse' }, icon: '🐭',
    description: { it: 'Un topolino giocattolo che scappa!', en: 'A toy mouse that runs away!' },
    happinessBoost: 20, energyCost: 15, animation: 'chase', rarity: 'rare', unlockMethod: 'level', unlockLevel: 2 },
  { id: 'laser', name: { it: 'Laser', en: 'Laser Pointer' }, icon: '🔴',
    description: { it: 'Un puntino rosso misterioso!', en: 'A mysterious red dot!' },
    happinessBoost: 25, energyCost: 12, animation: 'chase', rarity: 'rare', unlockMethod: 'level', unlockLevel: 3 },
  { id: 'fish', name: { it: 'Pesciolino', en: 'Fish Toy' }, icon: '🐟',
    description: { it: 'Un pesciolino che si muove!', en: 'A wiggly fish toy!' },
    happinessBoost: 18, energyCost: 10, animation: 'wiggle', rarity: 'rare', unlockMethod: 'level', unlockLevel: 4 },
  
  // Shop toys
  { id: 'butterfly', name: { it: 'Farfalla', en: 'Butterfly' }, icon: '🦋',
    description: { it: 'Una farfalla colorata da inseguire', en: 'A colorful butterfly to chase' },
    happinessBoost: 22, energyCost: 14, animation: 'wiggle', rarity: 'rare', unlockMethod: 'shop', price: 50 },
  { id: 'bell', name: { it: 'Campanellino', en: 'Bell' }, icon: '🔔',
    description: { it: 'Un campanellino che tintinna!', en: 'A jingling little bell!' },
    happinessBoost: 16, energyCost: 8, animation: 'bounce', rarity: 'common', unlockMethod: 'shop', price: 30 },
  { id: 'robot', name: { it: 'Robottino', en: 'Robot' }, icon: '🤖',
    description: { it: 'Un robottino interattivo!', en: 'An interactive little robot!' },
    happinessBoost: 28, energyCost: 18, animation: 'spin', rarity: 'rare', unlockMethod: 'shop', price: 80 },
  
  // Legendary toys
  { id: 'unicorn', name: { it: 'Unicorno', en: 'Unicorn' }, icon: '🦄',
    description: { it: 'Un magico unicorno peluche!', en: 'A magical unicorn plushie!' },
    happinessBoost: 35, energyCost: 20, animation: 'sparkle', rarity: 'legendary', unlockMethod: 'level', unlockLevel: 5 },
  { id: 'dragon', name: { it: 'Draghetto', en: 'Dragon' }, icon: '🐉',
    description: { it: 'Un draghetto che sputa stelle!', en: 'A dragon that breathes stars!' },
    happinessBoost: 40, energyCost: 25, animation: 'sparkle', rarity: 'legendary', unlockMethod: 'shop', price: 150 },
  { id: 'rainbow', name: { it: 'Arcobaleno', en: 'Rainbow' }, icon: '🌈',
    description: { it: 'Un arcobaleno magico!', en: 'A magical rainbow!' },
    happinessBoost: 50, energyCost: 30, animation: 'sparkle', rarity: 'legendary', unlockMethod: 'level', unlockLevel: 7 },
  
  // T1324: Catnip - triggers CRAZY MODE! 🌿😸
  { id: 'catnip', name: { it: 'Erba Gatta', en: 'Catnip' }, icon: '🌿',
    description: { it: 'Luna diventa PAZZA! 😸🌀', en: 'Luna goes CRAZY! 😸🌀' },
    happinessBoost: 60, energyCost: 5, animation: 'crazy', rarity: 'legendary', unlockMethod: 'shop', price: 75 },
];

interface ToyBoxState {
  unlockedToys: string[];
  favoriteToy: string | null;
}

// ==================== PET TREATS SHOP SYSTEM (T1349) ====================
// Delicious treats to feed Luna! Affects hunger, happiness, and weight.
interface Treat {
  id: string;
  name: { it: string; en: string };
  icon: string;
  description: { it: string; en: string };
  price: number;
  hungerRestore: number; // How much hunger this restores (0-100)
  happinessBoost: number; // How much happiness this gives
  weightGain: number; // How much weight this adds (higher = less healthy)
  rarity: 'common' | 'rare' | 'premium';
  unlockLevel?: number;
  special?: boolean; // Special effects
  quantity?: number; // How many owned
}

const TREATS: Treat[] = [
  // Common treats (affordable, basic effects)
  { id: 'kibble', name: { it: 'Croccantini', en: 'Kibble' }, icon: '🥣',
    description: { it: 'Croccantini classici, buoni e sani!', en: 'Classic kibble, tasty and healthy!' },
    price: 5, hungerRestore: 20, happinessBoost: 5, weightGain: 1, rarity: 'common' },
  { id: 'milk', name: { it: 'Latte', en: 'Milk' }, icon: '🥛',
    description: { it: 'Latte fresco e nutriente', en: 'Fresh and nutritious milk' },
    price: 8, hungerRestore: 15, happinessBoost: 8, weightGain: 2, rarity: 'common' },
  { id: 'cookie', name: { it: 'Biscottino', en: 'Cookie' }, icon: '🍪',
    description: { it: 'Un dolce biscottino per premiare Luna!', en: 'A sweet cookie to reward Luna!' },
    price: 10, hungerRestore: 10, happinessBoost: 15, weightGain: 3, rarity: 'common' },
  { id: 'apple', name: { it: 'Mela', en: 'Apple' }, icon: '🍎',
    description: { it: 'Una mela croccante e sana', en: 'A crunchy, healthy apple' },
    price: 6, hungerRestore: 12, happinessBoost: 6, weightGain: 0, rarity: 'common' },
  { id: 'carrot', name: { it: 'Carota', en: 'Carrot' }, icon: '🥕',
    description: { it: 'Una carota fresca - buona per la vista!', en: 'A fresh carrot - good for eyesight!' },
    price: 5, hungerRestore: 10, happinessBoost: 5, weightGain: 0, rarity: 'common' },
  
  // Rare treats (better effects, unlockable)
  { id: 'fish', name: { it: 'Pesciolino', en: 'Fish' }, icon: '🐟',
    description: { it: 'Pesce fresco - il preferito di Luna!', en: 'Fresh fish - Luna\'s favorite!' },
    price: 20, hungerRestore: 30, happinessBoost: 20, weightGain: 2, rarity: 'rare', unlockLevel: 2 },
  { id: 'chicken', name: { it: 'Pollo', en: 'Chicken' }, icon: '🍗',
    description: { it: 'Pollo arrosto delizioso!', en: 'Delicious roasted chicken!' },
    price: 25, hungerRestore: 35, happinessBoost: 18, weightGain: 3, rarity: 'rare', unlockLevel: 2 },
  { id: 'cheese', name: { it: 'Formaggio', en: 'Cheese' }, icon: '🧀',
    description: { it: 'Formaggio saporito!', en: 'Tasty cheese!' },
    price: 18, hungerRestore: 18, happinessBoost: 22, weightGain: 4, rarity: 'rare', unlockLevel: 3 },
  { id: 'shrimp', name: { it: 'Gamberetto', en: 'Shrimp' }, icon: '🦐',
    description: { it: 'Gamberetti freschi dal mare!', en: 'Fresh shrimp from the sea!' },
    price: 30, hungerRestore: 25, happinessBoost: 25, weightGain: 1, rarity: 'rare', unlockLevel: 3 },
  { id: 'icecream', name: { it: 'Gelato', en: 'Ice Cream' }, icon: '🍨',
    description: { it: 'Gelato speciale - solo ogni tanto!', en: 'Special ice cream - only sometimes!' },
    price: 22, hungerRestore: 8, happinessBoost: 30, weightGain: 5, rarity: 'rare', unlockLevel: 2 },
  
  // Premium treats (best effects, high level/price)
  { id: 'sushi', name: { it: 'Sushi', en: 'Sushi' }, icon: '🍣',
    description: { it: 'Sushi premium per gatti raffinati!', en: 'Premium sushi for refined cats!' },
    price: 50, hungerRestore: 40, happinessBoost: 35, weightGain: 2, rarity: 'premium', unlockLevel: 4 },
  { id: 'steak', name: { it: 'Bistecca', en: 'Steak' }, icon: '🥩',
    description: { it: 'Bistecca succulenta di prima qualità!', en: 'Succulent first-quality steak!' },
    price: 60, hungerRestore: 50, happinessBoost: 30, weightGain: 4, rarity: 'premium', unlockLevel: 5 },
  { id: 'cake', name: { it: 'Torta', en: 'Cake' }, icon: '🎂',
    description: { it: 'Torta per occasioni speciali!', en: 'Cake for special occasions!' },
    price: 45, hungerRestore: 15, happinessBoost: 50, weightGain: 6, rarity: 'premium', unlockLevel: 4, special: true },
  { id: 'salmon', name: { it: 'Salmone', en: 'Salmon' }, icon: '🍣',
    description: { it: 'Salmone fresco dell\'Alaska!', en: 'Fresh Alaskan salmon!' },
    price: 55, hungerRestore: 45, happinessBoost: 40, weightGain: 2, rarity: 'premium', unlockLevel: 5 },
  { id: 'tuna', name: { it: 'Tonno', en: 'Tuna' }, icon: '🐟',
    description: { it: 'Tonno di alta qualità!', en: 'High-quality tuna!' },
    price: 40, hungerRestore: 40, happinessBoost: 35, weightGain: 1, rarity: 'premium', unlockLevel: 4 },
  
  // Super special treats
  { id: 'rainbow-fish', name: { it: 'Pesce Arcobaleno', en: 'Rainbow Fish' }, icon: '🌈',
    description: { it: 'Pesce magico che fa brillare Luna!', en: 'Magic fish that makes Luna glow!' },
    price: 100, hungerRestore: 60, happinessBoost: 60, weightGain: 0, rarity: 'premium', unlockLevel: 7, special: true },
  { id: 'star-treat', name: { it: 'Bocconcino Stellare', en: 'Star Treat' }, icon: '⭐',
    description: { it: 'Un bocconcino che brilla come una stella!', en: 'A treat that shines like a star!' },
    price: 80, hungerRestore: 50, happinessBoost: 50, weightGain: 0, rarity: 'premium', unlockLevel: 6, special: true },
];

interface TreatShopState {
  unlockedTreats: string[]; // IDs of treats that can be purchased
  inventory: Record<string, number>; // treatId -> quantity owned
  totalFed: number; // Total treats fed to Luna
}

// ==================== MOOD JOURNAL SYSTEM (T1179) ====================
interface MoodJournalEntry {
  id: string;
  date: string; // ISO date string
  mood: MoodType;
  note: string;
  petName: string;
  stats: { happiness: number; energy: number; hunger: number };
  starRating?: number; // T1449: Rate your day 1-5 stars
}

interface MoodJournalState {
  entries: MoodJournalEntry[];
  lastEntryDate: string | null; // Track if already logged today
}

// ==================== PET ACTIVITY LOG SYSTEM (T1339) ====================
// Track what Luna did today! Shows a timeline of activities.
type ActivityType = 'sleep' | 'eat' | 'play' | 'bath' | 'explore' | 'shop' | 'pet' | 'brush' | 'toy' | 'train' | 'game' | 'treasure' | 'read';

interface ActivityLogEntry {
  id: string;
  timestamp: number; // Unix timestamp
  type: ActivityType;
  room: RoomKey;
  description: { it: string; en: string };
  emoji: string;
  stats?: { happiness?: number; energy?: number; hunger?: number; coins?: number };
}

interface ActivityLogState {
  entries: ActivityLogEntry[];
  lastResetDate: string; // ISO date string YYYY-MM-DD - resets daily
}

// ==================== PET FAVORITE ROOM TRACKER (T1345) ====================
// Track which rooms Luna visits most and her favorite room!
interface FavoriteRoomState {
  visitCounts: Record<RoomKey, number>; // Count visits per room
  favoriteRoom: RoomKey | null; // Current favorite room
  lastUpdated: string; // ISO date string
}

// ==================== PET VACCINATION RECORD SYSTEM (T1357) ====================
// Track Luna's vaccinations - keep her healthy!
interface VaccinationRecord {
  id: string;
  name: { it: string; en: string };
  emoji: string;
  date: string; // ISO date string when administered
  nextDue: string; // ISO date string when next dose is due
  description: { it: string; en: string };
}

interface VaccinationState {
  records: VaccinationRecord[];
  lastCheckDate: string | null; // Last time user viewed vaccination records
}

// Available vaccinations for pets
const AVAILABLE_VACCINATIONS: Array<{
  id: string;
  name: { it: string; en: string };
  emoji: string;
  description: { it: string; en: string };
  intervalDays: number; // Days between doses
}> = [
  { 
    id: 'rabies', 
    name: { it: 'Antirabbica', en: 'Rabies' }, 
    emoji: '💉',
    description: { it: 'Protegge dalla rabbia', en: 'Protects against rabies' },
    intervalDays: 365, // Yearly
  },
  { 
    id: 'distemper', 
    name: { it: 'Cimurro', en: 'Distemper' }, 
    emoji: '🛡️',
    description: { it: 'Protezione dal cimurro felino', en: 'Protection from feline distemper' },
    intervalDays: 365,
  },
  { 
    id: 'fvrcp', 
    name: { it: 'Trivalente FVRCP', en: 'FVRCP' }, 
    emoji: '🏥',
    description: { it: 'Vaccino combinato 3-in-1', en: 'Combined 3-in-1 vaccine' },
    intervalDays: 365,
  },
  { 
    id: 'leukemia', 
    name: { it: 'Leucemia Felina', en: 'Feline Leukemia' }, 
    emoji: '❤️‍🩹',
    description: { it: 'Protegge dalla leucemia', en: 'Protects against leukemia' },
    intervalDays: 365,
  },
  { 
    id: 'deworming', 
    name: { it: 'Sverminazione', en: 'Deworming' }, 
    emoji: '🐛',
    description: { it: 'Trattamento antiparassitario', en: 'Anti-parasite treatment' },
    intervalDays: 90, // Every 3 months
  },
  { 
    id: 'flea', 
    name: { it: 'Antipulci', en: 'Flea Treatment' }, 
    emoji: '🪲',
    description: { it: 'Protezione da pulci e zecche', en: 'Protection from fleas and ticks' },
    intervalDays: 30, // Monthly
  },
];

// ==================== PET SLEEP SCHEDULE SYSTEM (T1356) ====================
// Set bedtime reminders to help kids establish healthy sleep routines!
interface SleepScheduleState {
  enabled: boolean; // Whether sleep schedule is active
  bedtime: string; // Bedtime in HH:MM format (24h)
  wakeTime: string; // Wake time in HH:MM format (24h)
  reminderMinutes: number; // Minutes before bedtime to show reminder
  lastReminderDate: string | null; // ISO date string of last reminder shown (YYYY-MM-DD)
}

// Default sleep schedule (8pm bedtime, 7am wake)
const DEFAULT_SLEEP_SCHEDULE: SleepScheduleState = {
  enabled: false,
  bedtime: '20:00',
  wakeTime: '07:00',
  reminderMinutes: 15,
  lastReminderDate: null,
};

// Activity type info for display
const ACTIVITY_TYPES: Record<ActivityType, { emoji: string; label: { it: string; en: string } }> = {
  sleep: { emoji: '😴', label: { it: 'Riposo', en: 'Rest' } },
  eat: { emoji: '🍪', label: { it: 'Mangiato', en: 'Ate' } },
  play: { emoji: '⭐', label: { it: 'Giocato', en: 'Played' } },
  bath: { emoji: '🛁', label: { it: 'Bagno', en: 'Bath' } },
  explore: { emoji: '🗺️', label: { it: 'Esplorato', en: 'Explored' } },
  shop: { emoji: '🛍️', label: { it: 'Shopping', en: 'Shopping' } },
  pet: { emoji: '💕', label: { it: 'Coccole', en: 'Cuddles' } },
  brush: { emoji: '🪮', label: { it: 'Spazzolata', en: 'Brushed' } },
  toy: { emoji: '🧸', label: { it: 'Giocattolo', en: 'Toy' } },
  train: { emoji: '🎓', label: { it: 'Allenamento', en: 'Training' } },
  game: { emoji: '🎮', label: { it: 'Mini-gioco', en: 'Mini-game' } },
  treasure: { emoji: '🗝️', label: { it: 'Tesoro', en: 'Treasure' } },
  read: { emoji: '📖', label: { it: 'Lettura', en: 'Reading' } },
};

// ==================== PET TRAINING SYSTEM (T1202) ====================
// Teach Luna tricks for XP rewards!
interface Trick {
  id: string;
  name: { it: string; en: string };
  emoji: string;
  description: { it: string; en: string };
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  unlockLevel: number;
  sequence: string[]; // Button sequence to learn the trick
}

const TRICKS: Trick[] = [
  // Easy tricks (Level 1)
  { id: 'sit', name: { it: 'Seduto', en: 'Sit' }, emoji: '🪑',
    description: { it: 'Luna si siede a comando!', en: 'Luna sits on command!' },
    difficulty: 'easy', xpReward: 25, unlockLevel: 1, sequence: ['⬇️'] },
  { id: 'paw', name: { it: 'Zampa', en: 'Paw' }, emoji: '🐾',
    description: { it: 'Luna dà la zampa!', en: 'Luna gives her paw!' },
    difficulty: 'easy', xpReward: 25, unlockLevel: 1, sequence: ['➡️'] },
  { id: 'meow', name: { it: 'Miao', en: 'Meow' }, emoji: '😺',
    description: { it: 'Luna miagola su richiesta!', en: 'Luna meows on request!' },
    difficulty: 'easy', xpReward: 30, unlockLevel: 1, sequence: ['⬆️'] },
  
  // Medium tricks (Level 2-3)
  { id: 'spin', name: { it: 'Gira', en: 'Spin' }, emoji: '🔄',
    description: { it: 'Luna gira su se stessa!', en: 'Luna spins around!' },
    difficulty: 'medium', xpReward: 50, unlockLevel: 2, sequence: ['➡️', '⬇️', '⬅️', '⬆️'] },
  { id: 'jump', name: { it: 'Salta', en: 'Jump' }, emoji: '🦘',
    description: { it: 'Luna salta in alto!', en: 'Luna jumps high!' },
    difficulty: 'medium', xpReward: 50, unlockLevel: 2, sequence: ['⬆️', '⬆️'] },
  { id: 'wave', name: { it: 'Saluta', en: 'Wave' }, emoji: '👋',
    description: { it: 'Luna saluta con la zampa!', en: 'Luna waves hello!' },
    difficulty: 'medium', xpReward: 55, unlockLevel: 3, sequence: ['⬆️', '➡️', '⬅️'] },
  { id: 'roll', name: { it: 'Rotola', en: 'Roll Over' }, emoji: '🌀',
    description: { it: 'Luna fa una capriola!', en: 'Luna rolls over!' },
    difficulty: 'medium', xpReward: 60, unlockLevel: 3, sequence: ['⬇️', '➡️', '➡️', '⬆️'] },
  
  // Hard tricks (Level 4+)
  { id: 'playdead', name: { it: 'Fai il Morto', en: 'Play Dead' }, emoji: '💀',
    description: { it: 'Luna si finge addormentata!', en: 'Luna pretends to sleep!' },
    difficulty: 'hard', xpReward: 80, unlockLevel: 4, sequence: ['⬇️', '⬅️', '⬇️', '⬇️'] },
  { id: 'dance', name: { it: 'Balla', en: 'Dance' }, emoji: '💃',
    description: { it: 'Luna balla felice!', en: 'Luna dances happily!' },
    difficulty: 'hard', xpReward: 100, unlockLevel: 5, sequence: ['⬆️', '➡️', '⬇️', '⬅️', '⬆️'] },
  { id: 'backflip', name: { it: 'Salto Mortale', en: 'Backflip' }, emoji: '🤸',
    description: { it: 'Luna fa un salto mortale!', en: 'Luna does a backflip!' },
    difficulty: 'hard', xpReward: 120, unlockLevel: 6, sequence: ['⬆️', '⬆️', '⬇️', '⬇️', '⬆️'] },
  { id: 'magic', name: { it: 'Magia', en: 'Magic Trick' }, emoji: '✨',
    description: { it: 'Luna fa apparire scintille!', en: 'Luna makes sparkles appear!' },
    difficulty: 'hard', xpReward: 150, unlockLevel: 7, sequence: ['⬆️', '➡️', '⬇️', '⬅️', '⬆️', '⬆️'] },
];

interface PetTrainingState {
  learnedTricks: string[]; // Array of trick IDs Luna has mastered
  practiceCount: Record<string, number>; // How many times each trick practiced
  lastTrainingDate: string | null; // For tracking daily training
}

// ==================== PET ALBUM SYSTEM (T1197) ====================
// Collection catalog of pets/creatures seen in the game
interface CollectiblePet {
  id: string;
  name: { it: string; en: string };
  emoji: string;
  description: { it: string; en: string };
  rarity: 'common' | 'rare' | 'legendary' | 'mythic';
  unlockCondition: 'start' | 'level' | 'room' | 'random' | 'secret';
  unlockLevel?: number;
  unlockRoom?: RoomKey;
  unlockChance?: number; // For random encounters (0-1)
}

const COLLECTIBLE_PETS: CollectiblePet[] = [
  // Starter pets (available from start)
  { id: 'luna', name: { it: 'Luna', en: 'Luna' }, emoji: '🐱',
    description: { it: 'La tua amica gattina magica! Vive nella Moonlight House.', en: 'Your magical kitten friend! Lives in the Moonlight House.' },
    rarity: 'legendary', unlockCondition: 'start' },
  { id: 'pip', name: { it: 'Pip', en: 'Pip' }, emoji: '🐦',
    description: { it: 'Un uccellino curioso che visita il giardino.', en: 'A curious little bird that visits the garden.' },
    rarity: 'common', unlockCondition: 'room', unlockRoom: 'garden' },
  { id: 'whiskers', name: { it: 'Baffi', en: 'Whiskers' }, emoji: '🐹',
    description: { it: 'Un cricetino peloso che ama le coccole.', en: 'A fluffy hamster who loves cuddles.' },
    rarity: 'common', unlockCondition: 'level', unlockLevel: 2 },
  
  // Common pets
  { id: 'goldie', name: { it: 'Dorina', en: 'Goldie' }, emoji: '🐠',
    description: { it: 'Un pesciolino dorato che nuota in tondo.', en: 'A golden fish that swims in circles.' },
    rarity: 'common', unlockCondition: 'room', unlockRoom: 'bathroom' },
  { id: 'buzzy', name: { it: 'Ronzino', en: 'Buzzy' }, emoji: '🐝',
    description: { it: 'Un\'ape operosa dal giardino.', en: 'A busy bee from the garden.' },
    rarity: 'common', unlockCondition: 'room', unlockRoom: 'garden' },
  { id: 'spots', name: { it: 'Macchie', en: 'Spots' }, emoji: '🐞',
    description: { it: 'Una coccinella portafortuna!', en: 'A lucky ladybug!' },
    rarity: 'common', unlockCondition: 'random', unlockChance: 0.1 },
  { id: 'nibbles', name: { it: 'Rosetta', en: 'Nibbles' }, emoji: '🐰',
    description: { it: 'Un coniglietto che salta qua e là.', en: 'A bunny that hops around.' },
    rarity: 'common', unlockCondition: 'level', unlockLevel: 3 },
  
  // Rare pets
  { id: 'hooty', name: { it: 'Gufetto', en: 'Hooty' }, emoji: '🦉',
    description: { it: 'Un gufo saggio che appare di notte.', en: 'A wise owl that appears at night.' },
    rarity: 'rare', unlockCondition: 'room', unlockRoom: 'attic' },
  { id: 'flutter', name: { it: 'Farfallina', en: 'Flutter' }, emoji: '🦋',
    description: { it: 'Una farfalla magica dai colori brillanti.', en: 'A magical butterfly with brilliant colors.' },
    rarity: 'rare', unlockCondition: 'level', unlockLevel: 4 },
  { id: 'sheldon', name: { it: 'Tartino', en: 'Sheldon' }, emoji: '🐢',
    description: { it: 'Una tartaruga saggia e paziente.', en: 'A wise and patient turtle.' },
    rarity: 'rare', unlockCondition: 'level', unlockLevel: 5 },
  { id: 'sparkle', name: { it: 'Scintilla', en: 'Sparkle' }, emoji: '🦎',
    description: { it: 'Un camaleonte che cambia colore!', en: 'A chameleon that changes colors!' },
    rarity: 'rare', unlockCondition: 'random', unlockChance: 0.05 },
  { id: 'paws', name: { it: 'Zampette', en: 'Paws' }, emoji: '🐕',
    description: { it: 'Un cagnolino fedele e giocherellone.', en: 'A loyal and playful puppy.' },
    rarity: 'rare', unlockCondition: 'room', unlockRoom: 'living' },
  
  // Legendary pets
  { id: 'phoenix', name: { it: 'Fiamma', en: 'Phoenix' }, emoji: '🦅',
    description: { it: 'Un uccello di fuoco leggendario!', en: 'A legendary fire bird!' },
    rarity: 'legendary', unlockCondition: 'level', unlockLevel: 7 },
  { id: 'shadow', name: { it: 'Ombra', en: 'Shadow' }, emoji: '🐈‍⬛',
    description: { it: 'Un misterioso gatto nero con poteri magici.', en: 'A mysterious black cat with magic powers.' },
    rarity: 'legendary', unlockCondition: 'random', unlockChance: 0.02 },
  { id: 'coral', name: { it: 'Corallo', en: 'Coral' }, emoji: '🐙',
    description: { it: 'Un polpo intelligentissimo!', en: 'A super smart octopus!' },
    rarity: 'legendary', unlockCondition: 'level', unlockLevel: 8 },
  
  // Mythic pets (super rare!)
  { id: 'starlight', name: { it: 'Stellina', en: 'Starlight' }, emoji: '🦄',
    description: { it: 'Un unicorno magico che brilla nella notte!', en: 'A magical unicorn that glows at night!' },
    rarity: 'mythic', unlockCondition: 'level', unlockLevel: 10 },
  { id: 'draco', name: { it: 'Draghino', en: 'Draco' }, emoji: '🐲',
    description: { it: 'Un draghetto amichevole che sputa scintille!', en: 'A friendly dragon that breathes sparkles!' },
    rarity: 'mythic', unlockCondition: 'secret' },
  { id: 'aurora', name: { it: 'Aurora', en: 'Aurora' }, emoji: '🦚',
    description: { it: 'Un pavone dai colori dell\'arcobaleno.', en: 'A peacock with rainbow colors.' },
    rarity: 'mythic', unlockCondition: 'random', unlockChance: 0.01 },
];

interface PetAlbumState {
  discoveredPets: string[]; // Array of pet IDs
  lastDiscovery: string | null; // ISO date of last discovery
  totalDiscovered: number;
}

// ==================== FRIEND CODE SYSTEM (T1191) ====================
// Generate and share unique friend codes for pets
interface FriendCodeState {
  code: string;
  createdAt: string;
}

// Generate a unique 8-character alphanumeric code
const generateFriendCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing chars (0/O, 1/I/L)
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Format: XXXX-XXXX for readability
  return `${code.slice(0, 4)}-${code.slice(4)}`;
};

// ==================== GIFT SENDING SYSTEM (T1192) ====================
// Send virtual gifts to friends using their friend codes
interface Gift {
  id: string;
  name: { it: string; en: string };
  icon: string;
  description: { it: string; en: string };
  cost: number;
  rarity: 'common' | 'rare' | 'legendary';
  animation: 'float' | 'spin' | 'bounce' | 'sparkle' | 'hearts';
}

const GIFTS: Gift[] = [
  // Common gifts
  { id: 'flower', name: { it: 'Fiore', en: 'Flower' }, icon: '🌸',
    description: { it: 'Un bel fiore profumato!', en: 'A lovely fragrant flower!' },
    cost: 10, rarity: 'common', animation: 'float' },
  { id: 'heart', name: { it: 'Cuoricino', en: 'Little Heart' }, icon: '💕',
    description: { it: 'Un cuore pieno d\'amore', en: 'A heart full of love' },
    cost: 10, rarity: 'common', animation: 'hearts' },
  { id: 'cookie', name: { it: 'Biscottino', en: 'Cookie' }, icon: '🍪',
    description: { it: 'Un dolce biscotto!', en: 'A sweet cookie!' },
    cost: 15, rarity: 'common', animation: 'bounce' },
  { id: 'balloon', name: { it: 'Palloncino', en: 'Balloon' }, icon: '🎈',
    description: { it: 'Un palloncino colorato!', en: 'A colorful balloon!' },
    cost: 15, rarity: 'common', animation: 'float' },
  { id: 'star', name: { it: 'Stellina', en: 'Little Star' }, icon: '⭐',
    description: { it: 'Una stella brillante', en: 'A shining star' },
    cost: 20, rarity: 'common', animation: 'spin' },
  
  // Rare gifts
  { id: 'teddy', name: { it: 'Orsetto', en: 'Teddy Bear' }, icon: '🧸',
    description: { it: 'Un orsetto morbidoso!', en: 'A cuddly teddy bear!' },
    cost: 35, rarity: 'rare', animation: 'bounce' },
  { id: 'butterfly', name: { it: 'Farfalla', en: 'Butterfly' }, icon: '🦋',
    description: { it: 'Una farfalla magica!', en: 'A magical butterfly!' },
    cost: 40, rarity: 'rare', animation: 'float' },
  { id: 'cake', name: { it: 'Tortina', en: 'Cupcake' }, icon: '🧁',
    description: { it: 'Una tortina deliziosa!', en: 'A delicious cupcake!' },
    cost: 45, rarity: 'rare', animation: 'sparkle' },
  { id: 'fish', name: { it: 'Pesciolino', en: 'Fish' }, icon: '🐟',
    description: { it: 'Un pesciolino fresco!', en: 'A fresh little fish!' },
    cost: 50, rarity: 'rare', animation: 'bounce' },
  
  // Legendary gifts
  { id: 'rainbow', name: { it: 'Arcobaleno', en: 'Rainbow' }, icon: '🌈',
    description: { it: 'Un arcobaleno magico!', en: 'A magical rainbow!' },
    cost: 80, rarity: 'legendary', animation: 'sparkle' },
  { id: 'unicorn', name: { it: 'Unicorno', en: 'Unicorn' }, icon: '🦄',
    description: { it: 'Un unicorno leggendario!', en: 'A legendary unicorn!' },
    cost: 100, rarity: 'legendary', animation: 'sparkle' },
  { id: 'crown', name: { it: 'Corona', en: 'Crown' }, icon: '👑',
    description: { it: 'Una corona regale!', en: 'A royal crown!' },
    cost: 120, rarity: 'legendary', animation: 'spin' },
];

interface GiftHistoryEntry {
  id: string;
  giftId: string;
  toCode: string;
  sentAt: string;
}

interface GiftState {
  sentGifts: GiftHistoryEntry[];
  totalSent: number;
}

// ==================== DAILY QUEST SYSTEM (T1185) ====================
type QuestType = 'feed' | 'sleep' | 'play' | 'visit' | 'pet' | 'game' | 'bath' | 'shop' | 'treasure' | 'toy';

interface Quest {
  id: string;
  type: QuestType;
  icon: string;
  name: { it: string; en: string };
  description: { it: string; en: string };
  target: number;
  reward: { coins: number; xp: number };
}

interface ActiveQuest extends Quest {
  progress: number;
  completed: boolean;
  claimed: boolean;
}

interface DailyQuestState {
  quests: ActiveQuest[];
  lastRefreshDate: string; // ISO date string YYYY-MM-DD
  completedToday: number;
}

// Quest templates - 3 are randomly selected each day
const QUEST_TEMPLATES: Quest[] = [
  { id: 'feed-3', type: 'feed', icon: '🍽️', 
    name: { it: 'Pappa Pronta', en: 'Meal Time' },
    description: { it: 'Dai da mangiare 3 volte', en: 'Feed 3 times' },
    target: 3, reward: { coins: 30, xp: 25 } },
  { id: 'sleep-2', type: 'sleep', icon: '😴',
    name: { it: 'Sogni d\'Oro', en: 'Sweet Dreams' },
    description: { it: 'Dormi 2 volte', en: 'Sleep 2 times' },
    target: 2, reward: { coins: 25, xp: 20 } },
  { id: 'play-3', type: 'play', icon: '⭐',
    name: { it: 'Tempo di Gioco', en: 'Playtime' },
    description: { it: 'Gioca nel giardino 3 volte', en: 'Play in the garden 3 times' },
    target: 3, reward: { coins: 35, xp: 30 } },
  { id: 'visit-5', type: 'visit', icon: '🗺️',
    name: { it: 'Esploratore', en: 'Explorer' },
    description: { it: 'Visita 5 stanze diverse', en: 'Visit 5 different rooms' },
    target: 5, reward: { coins: 40, xp: 35 } },
  { id: 'pet-5', type: 'pet', icon: '❤️',
    name: { it: 'Coccole', en: 'Cuddles' },
    description: { it: 'Accarezza Luna 5 volte', en: 'Pet Luna 5 times' },
    target: 5, reward: { coins: 25, xp: 20 } },
  { id: 'game-1', type: 'game', icon: '🎮',
    name: { it: 'Campione', en: 'Champion' },
    description: { it: 'Completa un mini-gioco', en: 'Complete a mini-game' },
    target: 1, reward: { coins: 50, xp: 40 } },
  { id: 'bath-2', type: 'bath', icon: '🛁',
    name: { it: 'Pulito Pulito', en: 'Squeaky Clean' },
    description: { it: 'Fai il bagno 2 volte', en: 'Take a bath 2 times' },
    target: 2, reward: { coins: 25, xp: 20 } },
  { id: 'shop-2', type: 'shop', icon: '🛍️',
    name: { it: 'Shopping', en: 'Shopping Spree' },
    description: { it: 'Compra qualcosa 2 volte', en: 'Buy something 2 times' },
    target: 2, reward: { coins: 30, xp: 25 } },
  { id: 'treasure-1', type: 'treasure', icon: '🏚️',
    name: { it: 'Caccia al Tesoro', en: 'Treasure Hunt' },
    description: { it: 'Cerca tesori in soffitta', en: 'Hunt for treasure in the attic' },
    target: 1, reward: { coins: 35, xp: 30 } },
  { id: 'toy-2', type: 'toy', icon: '🧸',
    name: { it: 'Giocattoli', en: 'Toy Time' },
    description: { it: 'Gioca con 2 giocattoli', en: 'Play with 2 toys' },
    target: 2, reward: { coins: 30, xp: 25 } },
];

// Generate 3 random quests for the day
const generateDailyQuests = (): ActiveQuest[] => {
  const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(quest => ({
    ...quest,
    progress: 0,
    completed: false,
    claimed: false,
  }));
};

// ==================== COSTUME SYSTEM ====================
type CostumeCategory = 'hat' | 'accessory' | 'outfit' | 'collar';
type WardrobeTab = CostumeCategory | 'eyes'; // T1333: Added eyes tab (not a costume category)

interface Costume {
  id: string;
  name: { it: string; en: string };
  category: CostumeCategory;
  icon: string;
  price: number;
  unlockLevel?: number; // Optional level requirement
  special?: boolean; // Special/rare item
  offset?: { x: number; y: number }; // Position offset for rendering
}

const COSTUMES: Costume[] = [
  // Hats
  { id: 'hat-crown', name: { it: 'Corona', en: 'Crown' }, category: 'hat', icon: '👑', price: 50, offset: { x: 0, y: -25 } },
  { id: 'hat-party', name: { it: 'Cappello Festa', en: 'Party Hat' }, category: 'hat', icon: '🎉', price: 30, offset: { x: 0, y: -22 } },
  { id: 'hat-wizard', name: { it: 'Cappello Mago', en: 'Wizard Hat' }, category: 'hat', icon: '🧙', price: 75, unlockLevel: 3, offset: { x: 0, y: -28 } },
  { id: 'hat-cowboy', name: { it: 'Cappello Cowboy', en: 'Cowboy Hat' }, category: 'hat', icon: '🤠', price: 45, offset: { x: 0, y: -24 } },
  { id: 'hat-chef', name: { it: 'Cappello Chef', en: 'Chef Hat' }, category: 'hat', icon: '👨‍🍳', price: 40, offset: { x: 0, y: -26 } },
  { id: 'hat-pirate', name: { it: 'Cappello Pirata', en: 'Pirate Hat' }, category: 'hat', icon: '🏴‍☠️', price: 60, unlockLevel: 2, offset: { x: 0, y: -24 } },
  { id: 'hat-flower', name: { it: 'Corona di Fiori', en: 'Flower Crown' }, category: 'hat', icon: '💐', price: 35, offset: { x: 0, y: -20 } },
  { id: 'hat-santa', name: { it: 'Cappello Babbo Natale', en: 'Santa Hat' }, category: 'hat', icon: '🎅', price: 55, special: true, offset: { x: 0, y: -24 } },
  
  // Accessories
  { id: 'acc-bow', name: { it: 'Fiocco', en: 'Bow' }, category: 'accessory', icon: '🎀', price: 20, offset: { x: 15, y: -10 } },
  { id: 'acc-glasses', name: { it: 'Occhiali', en: 'Glasses' }, category: 'accessory', icon: '👓', price: 25, offset: { x: 0, y: 5 } },
  { id: 'acc-sunglasses', name: { it: 'Occhiali da Sole', en: 'Sunglasses' }, category: 'accessory', icon: '🕶️', price: 35, offset: { x: 0, y: 5 } },
  { id: 'acc-pet-sunglasses', name: { it: 'Occhialoni Cool', en: 'Cool Pet Shades' }, category: 'accessory', icon: '😎', price: 45, offset: { x: 0, y: 3 }, special: true },
  { id: 'acc-monocle', name: { it: 'Monocolo', en: 'Monocle' }, category: 'accessory', icon: '🧐', price: 50, unlockLevel: 2, offset: { x: 8, y: 3 } },
  { id: 'acc-star', name: { it: 'Stellina', en: 'Star' }, category: 'accessory', icon: '⭐', price: 15, offset: { x: -15, y: -8 } },
  { id: 'acc-heart', name: { it: 'Cuoricino', en: 'Heart' }, category: 'accessory', icon: '💖', price: 15, offset: { x: 18, y: -5 } },
  { id: 'acc-sparkle', name: { it: 'Brillantini', en: 'Sparkles' }, category: 'accessory', icon: '✨', price: 40, offset: { x: 0, y: -15 } },
  { id: 'acc-ribbon-bow', name: { it: 'Fiocco a Nastro', en: 'Ribbon Bow' }, category: 'accessory', icon: '🎀', price: 35, offset: { x: 0, y: -18 }, special: true },
  { id: 'acc-wizard-hat', name: { it: 'Cappellino Magico', en: 'Mini Wizard Hat' }, category: 'accessory', icon: '🔮', price: 55, unlockLevel: 2, offset: { x: 12, y: -15 }, special: true },
  // T1454: Royal pet crown accessory 👑
  { id: 'acc-pet-crown', name: { it: 'Corona Regale', en: 'Royal Pet Crown' }, category: 'accessory', icon: '👑', price: 75, unlockLevel: 3, offset: { x: 0, y: -22 }, special: true },
  { id: 'acc-tiara', name: { it: 'Tiara', en: 'Tiara' }, category: 'accessory', icon: '👸', price: 55, unlockLevel: 2, offset: { x: 0, y: -20 } },
  // T1460: Pet pirate hat accessory 🏴‍☠️
  { id: 'acc-pirate-hat', name: { it: 'Cappellino Pirata', en: 'Pirate Hat' }, category: 'accessory', icon: '🏴‍☠️', price: 65, unlockLevel: 3, offset: { x: 0, y: -22 }, special: true },
  // T1461: Pet flower crown accessory 🌸
  { id: 'acc-flower-crown', name: { it: 'Corona di Fiori', en: 'Flower Crown' }, category: 'accessory', icon: '🌸', price: 45, unlockLevel: 2, offset: { x: 0, y: -20 }, special: true },
  // T1462: Pet bandana accessory 🧣
  { id: 'acc-bandana', name: { it: 'Bandana', en: 'Bandana' }, category: 'accessory', icon: '🧣', price: 30, offset: { x: 0, y: 10 } },
  { id: 'acc-bandana-red', name: { it: 'Bandana Rossa', en: 'Red Bandana' }, category: 'accessory', icon: '🔴', price: 40, offset: { x: 0, y: 10 } },
  { id: 'acc-bandana-pirate', name: { it: 'Bandana Pirata', en: 'Pirate Bandana' }, category: 'accessory', icon: '☠️', price: 55, unlockLevel: 2, offset: { x: 0, y: 10 }, special: true },
  // T1466: Pet detective hat accessory 🕵️
  { id: 'acc-detective-hat', name: { it: 'Cappello Detective', en: 'Detective Hat' }, category: 'accessory', icon: '🕵️', price: 70, unlockLevel: 3, offset: { x: 0, y: -22 }, special: true },
  // T1467: Pet bunny ears accessory 🐰
  { id: 'acc-bunny-ears', name: { it: 'Orecchie da Coniglio', en: 'Bunny Ears' }, category: 'accessory', icon: '🐰', price: 50, unlockLevel: 2, offset: { x: 0, y: -24 }, special: true },
  // T1468: Pet devil horns accessory 😈
  { id: 'acc-devil-horns', name: { it: 'Corna da Diavoletto', en: 'Devil Horns' }, category: 'accessory', icon: '😈', price: 55, unlockLevel: 2, offset: { x: 0, y: -24 }, special: true },
  // T1471: Pet angel halo accessory 😇
  { id: 'acc-angel-halo', name: { it: 'Aureola Angelica', en: 'Angel Halo' }, category: 'accessory', icon: '😇', price: 55, unlockLevel: 2, offset: { x: 0, y: -26 }, special: true },
  // T1472: Pet ninja mask accessory 🥷
  { id: 'acc-ninja-mask', name: { it: 'Maschera Ninja', en: 'Ninja Mask' }, category: 'accessory', icon: '🥷', price: 60, unlockLevel: 3, offset: { x: 0, y: 5 }, special: true },
  // T1473: Pet chef hat accessory 👨‍🍳
  { id: 'acc-chef-hat', name: { it: 'Cappello da Chef', en: 'Chef Hat' }, category: 'accessory', icon: '👨‍🍳', price: 60, unlockLevel: 2, offset: { x: 0, y: -24 }, special: true },
  // T1478: Pet superhero mask accessory 🦸
  { id: 'acc-superhero-mask', name: { it: 'Maschera da Supereroe', en: 'Superhero Mask' }, category: 'accessory', icon: '🦸', price: 65, unlockLevel: 3, offset: { x: 0, y: 5 }, special: true },
  // T1477: Pet cowboy hat accessory 🤠
  { id: 'acc-cowboy-hat', name: { it: 'Cappello Cowboy', en: 'Cowboy Hat' }, category: 'accessory', icon: '🤠', price: 50, unlockLevel: 2, offset: { x: 0, y: -24 }, special: true },
  // T1479: Pet monocle accessory 🧐
  { id: 'acc-pet-monocle', name: { it: 'Monocolo Distinto', en: 'Distinguished Monocle' }, category: 'accessory', icon: '🧐', price: 55, unlockLevel: 2, offset: { x: 10, y: 2 }, special: true },
  // T1482: Pet top hat accessory 🎩
  { id: 'acc-top-hat', name: { it: 'Cilindro Elegante', en: 'Top Hat' }, category: 'accessory', icon: '🎩', price: 70, unlockLevel: 3, offset: { x: 0, y: -26 }, special: true },
  // T1483: Pet party hat accessory 🎊
  { id: 'acc-party-hat', name: { it: 'Cappellino da Festa', en: 'Party Hat' }, category: 'accessory', icon: '🥳', price: 40, offset: { x: 0, y: -24 }, special: true },
  // T1484: Pet propeller hat accessory 🚁
  { id: 'acc-propeller-hat', name: { it: 'Cappellino con Elica', en: 'Propeller Hat' }, category: 'accessory', icon: '🚁', price: 65, unlockLevel: 2, offset: { x: 0, y: -28 }, special: true },
  // T1488: Pet viking helmet accessory ⚔️
  { id: 'acc-viking-helmet', name: { it: 'Elmo Vichingo', en: 'Viking Helmet' }, category: 'accessory', icon: '⚔️', price: 70, unlockLevel: 3, offset: { x: 0, y: -24 }, special: true },
  // T1489: Pet astronaut helmet accessory 🚀
  { id: 'acc-astronaut-helmet', name: { it: 'Casco da Astronauta', en: 'Astronaut Helmet' }, category: 'accessory', icon: '🚀', price: 80, unlockLevel: 4, offset: { x: 0, y: -26 }, special: true },
  // T1510: Pet butterfly wings accessory 🦋
  { id: 'acc-butterfly-wings', name: { it: 'Ali di Farfalla', en: 'Butterfly Wings' }, category: 'accessory', icon: '🦋', price: 60, unlockLevel: 2, offset: { x: 0, y: -8 }, special: true },
  
  // Outfits (shown as body overlay)
  { id: 'outfit-cape', name: { it: 'Mantello', en: 'Cape' }, category: 'outfit', icon: '🦸', price: 80, unlockLevel: 3, offset: { x: 0, y: 20 } },
  { id: 'outfit-scarf', name: { it: 'Sciarpa', en: 'Scarf' }, category: 'outfit', icon: '🧣', price: 30, offset: { x: 0, y: 15 } },
  { id: 'outfit-bowtie', name: { it: 'Papillon', en: 'Bowtie' }, category: 'outfit', icon: '🎩', price: 25, offset: { x: 0, y: 18 } },
  { id: 'outfit-wings', name: { it: 'Ali Magiche', en: 'Magic Wings' }, category: 'outfit', icon: '🦋', price: 100, unlockLevel: 5, special: true, offset: { x: 0, y: 10 } },
  
  // Collars (T1334: Pet collar accessory shop)
  { id: 'collar-basic', name: { it: 'Collare Semplice', en: 'Basic Collar' }, category: 'collar', icon: '⭕', price: 15, offset: { x: 0, y: 12 } },
  { id: 'collar-bell', name: { it: 'Collare con Campanella', en: 'Bell Collar' }, category: 'collar', icon: '🔔', price: 25, offset: { x: 0, y: 12 } },
  { id: 'collar-bow', name: { it: 'Collare con Fiocco', en: 'Bow Collar' }, category: 'collar', icon: '🎀', price: 30, offset: { x: 0, y: 12 } },
  { id: 'collar-heart', name: { it: 'Collare Cuoricino', en: 'Heart Collar' }, category: 'collar', icon: '💖', price: 35, offset: { x: 0, y: 12 } },
  { id: 'collar-star', name: { it: 'Collare Stellato', en: 'Star Collar' }, category: 'collar', icon: '⭐', price: 40, unlockLevel: 2, offset: { x: 0, y: 12 } },
  { id: 'collar-diamond', name: { it: 'Collare Diamante', en: 'Diamond Collar' }, category: 'collar', icon: '💎', price: 60, unlockLevel: 3, offset: { x: 0, y: 12 } },
  { id: 'collar-royal', name: { it: 'Collare Regale', en: 'Royal Collar' }, category: 'collar', icon: '👑', price: 80, unlockLevel: 4, special: true, offset: { x: 0, y: 12 } },
  { id: 'collar-rainbow', name: { it: 'Collare Arcobaleno', en: 'Rainbow Collar' }, category: 'collar', icon: '🌈', price: 100, unlockLevel: 5, special: true, offset: { x: 0, y: 12 } },
  { id: 'collar-magic', name: { it: 'Collare Magico', en: 'Magic Collar' }, category: 'collar', icon: '✨', price: 150, unlockLevel: 7, special: true, offset: { x: 0, y: 12 } },
];

interface CostumeState {
  unlocked: string[];
  equipped: {
    hat: string | null;
    accessory: string | null;
    outfit: string | null;
    collar: string | null; // T1334: Pet collar accessory
  };
  eyeColor?: string; // T1333: Pet eye color customization
  unlockedEyeColors?: string[]; // T1333: Unlocked eye colors
}

// ==================== EYE COLOR SYSTEM (T1333) ====================
// Customize Luna's eye color!
interface EyeColor {
  id: string;
  name: { it: string; en: string };
  color: string; // CSS color
  glowColor: string; // Glow effect color
  icon: string;
  price: number;
  unlockLevel?: number;
  special?: boolean;
}

const EYE_COLORS: EyeColor[] = [
  // Default (free)
  { id: 'amber', name: { it: 'Ambra', en: 'Amber' }, color: '#FFBF00', glowColor: 'rgba(255, 191, 0, 0.6)', icon: '🟡', price: 0 },
  // Basic colors
  { id: 'blue', name: { it: 'Blu', en: 'Blue' }, color: '#4FC3F7', glowColor: 'rgba(79, 195, 247, 0.6)', icon: '🔵', price: 15 },
  { id: 'green', name: { it: 'Verde', en: 'Green' }, color: '#81C784', glowColor: 'rgba(129, 199, 132, 0.6)', icon: '🟢', price: 15 },
  { id: 'brown', name: { it: 'Marrone', en: 'Brown' }, color: '#A1887F', glowColor: 'rgba(161, 136, 127, 0.6)', icon: '🟤', price: 15 },
  // Rare colors
  { id: 'violet', name: { it: 'Viola', en: 'Violet' }, color: '#BA68C8', glowColor: 'rgba(186, 104, 200, 0.6)', icon: '🟣', price: 35, unlockLevel: 2 },
  { id: 'turquoise', name: { it: 'Turchese', en: 'Turquoise' }, color: '#4DD0E1', glowColor: 'rgba(77, 208, 225, 0.6)', icon: '💎', price: 35, unlockLevel: 2 },
  { id: 'gold', name: { it: 'Oro', en: 'Gold' }, color: '#FFD700', glowColor: 'rgba(255, 215, 0, 0.7)', icon: '⭐', price: 45, unlockLevel: 3 },
  // Legendary colors
  { id: 'ruby', name: { it: 'Rubino', en: 'Ruby' }, color: '#EF5350', glowColor: 'rgba(239, 83, 80, 0.6)', icon: '❤️', price: 60, unlockLevel: 4, special: true },
  { id: 'emerald', name: { it: 'Smeraldo', en: 'Emerald' }, color: '#00E676', glowColor: 'rgba(0, 230, 118, 0.7)', icon: '💚', price: 60, unlockLevel: 4, special: true },
  { id: 'sapphire', name: { it: 'Zaffiro', en: 'Sapphire' }, color: '#2979FF', glowColor: 'rgba(41, 121, 255, 0.7)', icon: '💙', price: 60, unlockLevel: 4, special: true },
  // Mythic colors
  { id: 'rainbow', name: { it: 'Arcobaleno', en: 'Rainbow' }, color: 'linear-gradient(90deg, #FF0080, #FF8C00, #FFD700, #00FF00, #00BFFF, #8A2BE2)', glowColor: 'rgba(255, 255, 255, 0.8)', icon: '🌈', price: 100, unlockLevel: 6, special: true },
  { id: 'starlight', name: { it: 'Luce Stellare', en: 'Starlight' }, color: '#E1F5FE', glowColor: 'rgba(225, 245, 254, 0.9)', icon: '✨', price: 120, unlockLevel: 7, special: true },
  { id: 'moonlight', name: { it: 'Luce Lunare', en: 'Moonlight' }, color: '#B388FF', glowColor: 'rgba(179, 136, 255, 0.8)', icon: '🌙', price: 150, unlockLevel: 8, special: true },
];

// ==================== FUR COLOR SYSTEM (T1332) ====================
// Customize Luna's fur color! 🐱🎨
type FurColorId = 'orange' | 'gray' | 'black' | 'white' | 'brown' | 'cream' | 'tabby' | 'calico' | 'siamese' | 'rainbow';

interface FurColor {
  id: FurColorId;
  name: { it: string; en: string };
  emoji: string;
  cssFilter: string; // CSS filter to apply to the image
  price: number;
  unlockLevel?: number;
  special?: boolean;
}

const FUR_COLORS: FurColor[] = [
  // Default fur (no filter)
  { id: 'orange', name: { it: 'Arancione', en: 'Orange' }, emoji: '🧡', 
    cssFilter: 'none', price: 0 },
  // Gray cat
  { id: 'gray', name: { it: 'Grigio', en: 'Gray' }, emoji: '🩶', 
    cssFilter: 'saturate(0.3) brightness(1.1)', price: 25 },
  // Black cat
  { id: 'black', name: { it: 'Nero', en: 'Black' }, emoji: '🖤', 
    cssFilter: 'saturate(0.2) brightness(0.6) contrast(1.2)', price: 30 },
  // White cat
  { id: 'white', name: { it: 'Bianco', en: 'White' }, emoji: '🤍', 
    cssFilter: 'saturate(0.1) brightness(1.4) contrast(0.9)', price: 30 },
  // Brown cat
  { id: 'brown', name: { it: 'Marrone', en: 'Brown' }, emoji: '🤎', 
    cssFilter: 'sepia(0.4) saturate(1.2) hue-rotate(-10deg)', price: 35 },
  // Cream colored cat
  { id: 'cream', name: { it: 'Crema', en: 'Cream' }, emoji: '🍦', 
    cssFilter: 'sepia(0.3) saturate(0.8) brightness(1.15)', price: 40, unlockLevel: 2 },
  // Tabby pattern effect
  { id: 'tabby', name: { it: 'Tigrato', en: 'Tabby' }, emoji: '🐯', 
    cssFilter: 'saturate(1.3) contrast(1.1) hue-rotate(10deg)', price: 50, unlockLevel: 3 },
  // Calico (warm multi-color effect)
  { id: 'calico', name: { it: 'Calico', en: 'Calico' }, emoji: '🎨', 
    cssFilter: 'saturate(1.4) contrast(1.05) brightness(1.05)', price: 60, unlockLevel: 4 },
  // Siamese (blue-point effect)
  { id: 'siamese', name: { it: 'Siamese', en: 'Siamese' }, emoji: '🐱', 
    cssFilter: 'sepia(0.2) saturate(0.7) hue-rotate(180deg) brightness(1.1)', price: 80, unlockLevel: 5, special: true },
  // Rainbow - magical legendary color!
  { id: 'rainbow', name: { it: 'Arcobaleno', en: 'Rainbow' }, emoji: '🌈', 
    cssFilter: 'saturate(2) brightness(1.1) hue-rotate(0deg)', price: 150, unlockLevel: 7, special: true },
];

// ==================== TRANSLATIONS ====================
const translations = {
  it: {
    title: 'Moonlight Magic House',
    rooms: {
      bedroom: 'Camera', kitchen: 'Cucina', garden: 'Giardino', living: 'Salotto',
      bathroom: 'Bagno', garage: 'Garage', shop: 'Negozio', supermarket: 'Supermercato',
      attic: 'Soffitta', basement: 'Cantina', library: 'Biblioteca',
    },
    actions: {
      bedroom: { primary: 'Dormi', secondary: 'Leggi' },
      kitchen: { primary: 'Mangia', secondary: 'Cucina' },
      garden: { primary: 'Gioca', secondary: 'Innaffia' },
      living: { primary: 'Guarda TV', secondary: 'Rilassati' },
      bathroom: { primary: 'Bagno', secondary: 'Lavati' },
      garage: { primary: 'Guida', secondary: 'Ripara' },
      shop: { primary: 'Compra vestiti', secondary: 'Prova' },
      supermarket: { primary: 'Compra cibo', secondary: 'Esplora' },
      attic: { primary: 'Cerca tesori', secondary: 'Esplora' },
      basement: { primary: 'Costruisci', secondary: 'Organizza' },
      library: { primary: 'Leggi', secondary: 'Sfoglia' },
    },
    stats: { health: 'Salute', hunger: 'Fame', energy: 'Energia', happiness: 'Felicità', comfort: 'Comfort', weight: 'Peso' },
    weight: {
      healthy: 'Peso perfetto! 🎯',
      gaining: 'Sta ingrassando un po\'... 🍪',
      overfed: 'Troppo paffutello! 🐷 Fallo giocare!',
      exercising: 'Sta dimagrendo! 🏃‍♀️',
      warning: 'Luna ha bisogno di esercizio!',
    },
    messages: {
      sleeping: 'Zzz... 💤', eating: 'Gnam gnam... 🍪', playing: 'Weee! ⭐',
      watching: 'Che bello! 📺', bathing: 'Splash! 🛁', driving: 'Brum brum! 🚗',
      shopping: 'Bellissimo! 👗', buying: 'Comprato! 🛒', notEnoughCoins: 'Servono più monete!',
      levelUp: '🎉 Livello {level}!', achievementUnlocked: '🏆 Obiettivo sbloccato!',
      dailyReward: '🎁 Bonus giornaliero: +{coins} monete!',
      eventVisitor: '👋 Un amico viene a trovarti! +20 felicità',
      eventGift: '🎁 Hai trovato un regalo! +15 monete',
      eventRain: '🌧️ Piove! Moonlight si diverte!',
      treasureHunt: 'Che scoperta! 🗝️',
      building: 'Fatto! 🔨',
      reading: 'Che bella storia! 📖',
      browsing: 'Tanti libri! 📚',
    },
    moods: { happy: 'Felice!', hungry: 'Affamato', sleepy: 'Assonnato', playful: 'Giocherellone!' },
    // T1343: Nap timer translations
    napTimer: {
      sleeping: 'Sto dormendo...',
      duration: 'da {time}',
      seconds: '{n}s',
      minutes: '{n}m {s}s',
    },
    petNaming: {
      title: 'Dai un nome al tuo animaletto!',
      placeholder: 'Nome del tuo amico...',
      confirm: 'Conferma',
      skip: 'Salta (userò Pip)',
    },
    petRename: {
      title: 'Rinomina il tuo amico! ✏️',
      subtitle: 'Come vuoi chiamare il tuo animaletto?',
      placeholder: 'Nuovo nome...',
      confirm: 'Salva',
      cancel: 'Annulla',
      success: 'Nome cambiato! ✨',
      clickToRename: 'Tocca per cambiare nome',
    },
    // T1329: Pet personality translations
    personality: {
      title: 'Personalità',
      shy: 'Timido 🙈',
      playful: 'Giocherellone 🎉',
      lazy: 'Pigrotto 😴',
      shyDesc: 'Luna è un po\' timida, ma quando si apre è dolcissima!',
      playfulDesc: 'Luna adora giocare e fare birichinate!',
      lazyDesc: 'Luna ama dormire e rilassarsi tutto il giorno!',
      bonus: 'Bonus personalità',
    },
    timeOfDay: { morning: '🌅 Mattina', afternoon: '☀️ Pomeriggio', evening: '🌆 Sera', night: '🌙 Notte' },
    achievements: {
      explorer: 'Esploratore', firstMeal: 'Primo pasto', sleepyHead: 'Dormiglione',
      socialite: 'Socievole', shopper: 'Shopaholic', wealthy: 'Ricco', healthy: 'In salute',
      bookworm: 'Topo di biblioteca',
    },
    explore: 'Esplora la casa!',
    footer: 'Onde Kids ✨',
    miniGame: 'Mini-gioco!',
    tapToPlay: 'Tocca le stelle!',
    score: 'Punti',
    wardrobe: {
      title: 'Guardaroba',
      hats: 'Cappelli',
      accessories: 'Accessori',
      outfits: 'Vestiti',
      collars: 'Collari', // T1334: Pet collar shop
      eyes: 'Occhi', // T1333: Eye color tab
      unlock: 'Sblocca',
      equip: 'Indossa',
      unequip: 'Togli',
      locked: 'Bloccato',
      levelRequired: 'Livello {level} richiesto',
      notEnoughCoins: 'Servono più monete!',
      unlocked: 'Sbloccato! ✨',
      special: 'Speciale!',
    },
    // T1333: Eye color customization translations
    eyeColor: {
      title: 'Colore Occhi 👁️',
      subtitle: 'Cambia il colore degli occhi di Luna!',
      current: 'Attuale',
      select: 'Seleziona',
      selected: 'Selezionato ✓',
      unlock: 'Sblocca',
      locked: 'Bloccato',
      levelRequired: 'Livello {level} richiesto',
      notEnoughCoins: 'Servono più monete!',
      unlocked: 'Sbloccato! ✨',
      special: 'Speciale!',
      free: 'Gratis!',
    },
    // T1332: Fur color customization translations
    furColor: {
      title: 'Colore Pelo 🎨',
      subtitle: 'Cambia il colore di Luna!',
      current: 'Attuale',
      select: 'Seleziona',
      selected: 'Selezionato ✓',
      unlock: 'Sblocca',
      locked: 'Bloccato',
      levelRequired: 'Livello {level} richiesto',
      notEnoughCoins: 'Servono più monete!',
      unlocked: 'Sbloccato! ✨',
      special: 'Speciale!',
      preview: 'Anteprima',
    },
    photoMode: {
      title: 'Modalità Foto 📸',
      filters: 'Filtri',
      frames: 'Cornici',
      none: 'Nessuno',
      capture: 'Scatta! 📷',
      saving: 'Salvataggio...',
      saved: 'Foto salvata! ✨',
      download: 'Scarica',
      share: 'Condividi',
      close: 'Chiudi',
      filterNormal: 'Normale',
      filterSepia: 'Seppia',
      filterGrayscale: 'B/N',
      filterVintage: 'Vintage',
      filterDreamy: 'Sognante',
      filterSunset: 'Tramonto',
      filterNight: 'Notte',
      filterSparkle: 'Brillante',
      frameNone: 'Nessuna',
      frameHearts: 'Cuori',
      frameStars: 'Stelle',
      frameFlowers: 'Fiori',
      framePolaroid: 'Polaroid',
      frameRainbow: 'Arcobaleno',
      frameGold: 'Oro',
      frameMagic: 'Magica',
    },
    toyBox: {
      title: 'Scatola dei Giochi 🧸',
      play: 'Gioca!',
      unlock: 'Sblocca',
      locked: 'Bloccato',
      favorite: 'Preferito',
      setFavorite: 'Imposta preferito',
      levelRequired: 'Livello {level} richiesto',
      notEnoughCoins: 'Servono più monete!',
      notEnoughEnergy: 'Luna è troppo stanca!',
      unlocked: 'Sbloccato! ✨',
      playing: 'Che divertimento! 🎉',
      common: 'Comune',
      rare: 'Raro',
      legendary: 'Leggendario',
      happiness: '+{amount} Felicità',
      energy: '-{amount} Energia',
      // T1324: Catnip crazy mode translations
      catnipActive: '😸 MODALITÀ PAZZA! 🌀',
      catnipEnded: 'Uff... che corsa! 😅',
    },
    // T1356: Pet Sleep Schedule translations
    sleepSchedule: {
      title: 'Orario della Nanna 🌙',
      subtitle: 'Aiuta Luna ad andare a dormire in orario!',
      enabled: 'Promemoria attivo',
      disabled: 'Promemoria disattivo',
      bedtime: 'Ora della nanna',
      wakeTime: 'Ora sveglia',
      reminderBefore: 'Avvisa {minutes} min prima',
      save: 'Salva',
      cancel: 'Annulla',
      saved: 'Salvato! 🌟',
      bedtimeReminder: '🌙 È quasi ora della nanna!',
      bedtimeNow: '😴 Luna ha sonno... è ora di dormire!',
      goodnight: 'Sogni d\'oro, Luna! 💤',
      sleepyLuna: 'Luna sbadiglia... 🥱',
      minutesUntilBed: '{minutes} minuti alla nanna',
      timeForBed: 'È ora di andare a letto!',
      toggle: 'On/Off',
    },
    // T1349: Pet Treats Shop translations
    treatShop: {
      title: 'Negozio Dolcetti 🍪',
      subtitle: 'Dai da mangiare a Luna!',
      buy: 'Compra',
      feed: 'Dai a Luna!',
      owned: 'Possiedi: {count}',
      notOwned: 'Non ne hai!',
      unlock: 'Sblocca',
      locked: 'Bloccato',
      levelRequired: 'Livello {level} richiesto',
      notEnoughCoins: 'Servono più monete!',
      purchased: 'Acquistato! 🛒',
      feeding: 'Gnam gnam! 😋',
      yummy: 'Che buono! 😻',
      tooFull: 'Luna è troppo sazia!',
      common: 'Comune',
      rare: 'Raro',
      premium: 'Premium',
      stats: {
        hunger: '+{amount} Fame',
        happiness: '+{amount} Felicità',
        weight: '+{amount} Peso',
        healthy: 'Sano! 💚',
      },
      inventory: 'Inventario',
      shop: 'Negozio',
      totalFed: 'Bocconcini dati: {count}',
      special: 'Speciale! ✨',
    },
    grooming: {
      brush: 'Spazzola',
      brushing: 'Che morbido! ✨',
      cooldown: 'Luna ha bisogno di una pausa!',
      happinessBoost: '+{amount} Felicità',
    },
    // T1348: Pet cuddle mode translations 🤗💕
    cuddle: {
      holding: 'Ti voglio bene! 🤗💕',
      release: 'Che belle coccole! ✨',
      hint: 'Tieni premuto per abbracciarla!',
      happinessBoost: '+{amount} Felicità',
    },
    birthday: {
      title: 'Buon Compleanno! 🎂',
      message: 'Oggi è il compleanno di {name}!',
      age: '{name} compie {age}!',
      ageYears: '{years} anno',
      ageYearsPlural: '{years} anni',
      ageMonths: '{months} mese',
      ageMonthsPlural: '{months} mesi',
      firstBirthday: 'È il primo compleanno!',
      reward: 'Regalo di compleanno: +{coins} monete!',
      celebrate: 'Festeggia! 🎉',
    },
    moodJournal: {
      title: 'Diario dell\'Umore 📔',
      subtitle: 'Come si sente {name} oggi?',
      todayMood: 'Umore di oggi',
      addNote: 'Aggiungi una nota...',
      saveEntry: 'Salva nel diario',
      history: 'Pagine Precedenti',
      noEntries: 'Il diario è vuoto. Scrivi il primo pensiero!',
      saved: 'Salvato! ✨',
      alreadyLogged: 'Hai già scritto oggi!',
      moodHappy: 'Felice',
      moodHungry: 'Affamato',
      moodSleepy: 'Assonnato',
      moodPlayful: 'Giocherellone',
      today: 'Oggi',
      yesterday: 'Ieri',
      daysAgo: '{days} giorni fa',
      viewAll: 'Vedi tutto',
      close: 'Chiudi',
      // T1449: Star rating translations
      rateYourDay: 'Vota la tua giornata',
      stars: 'stelle',
      star: 'stella',
    },
    dailyQuests: {
      title: 'Missioni del Giorno 📋',
      subtitle: 'Completa le missioni per bonus!',
      progress: '{current}/{target}',
      completed: 'Completata!',
      claimed: 'Ritirato!',
      claim: 'Ritira Premio',
      reward: '+{coins} 💰 +{xp} ⭐',
      allComplete: 'Tutte completate! Torna domani! 🌟',
      newQuests: 'Nuove missioni disponibili!',
    },
    friendCode: {
      title: 'Codice Amico 🤝',
      subtitle: 'Condividi il tuo codice con gli amici!',
      yourCode: 'Il tuo codice:',
      copy: 'Copia',
      copied: 'Copiato! ✨',
      share: 'Condividi',
      shareText: 'Ecco il mio codice amico di Moonlight: {code}! Vieni a giocare con {name}! 🌙✨',
      info: 'I tuoi amici potranno trovarti con questo codice!',
    },
    giftSending: {
      title: 'Invia Regalo 🎁',
      subtitle: 'Manda un regalo a un amico!',
      selectGift: 'Scegli un regalo',
      friendCode: 'Codice amico',
      friendCodePlaceholder: 'XXXX-XXXX',
      send: 'Invia! 💝',
      sending: 'Invio...',
      sent: 'Regalo inviato! ✨',
      notEnoughCoins: 'Servono più monete!',
      invalidCode: 'Codice non valido!',
      cost: 'Costo',
      common: 'Comune',
      rare: 'Raro',
      legendary: 'Leggendario',
      history: 'Regali inviati',
      noHistory: 'Non hai ancora inviato regali!',
      totalSent: 'Totale inviati: {count}',
      giftFor: 'Regalo per {code}',
    },
    petAlbum: {
      title: 'Album dei Cuccioli 🐾',
      subtitle: 'Colleziona tutti gli amici!',
      discovered: 'Scoperto!',
      notDiscovered: '???',
      progress: '{count}/{total} scoperto',
      rarity: {
        common: 'Comune',
        rare: 'Raro',
        legendary: 'Leggendario',
        mythic: 'Mitico',
      },
      newDiscovery: 'Nuovo amico scoperto! 🎉',
      hint: 'Continua a esplorare per trovare nuovi amici!',
      unlockHint: {
        level: 'Raggiungi il livello {level}',
        room: 'Visita {room}',
        random: 'Incontro casuale!',
        secret: 'Segreto...',
      },
    },
    petTraining: {
      title: 'Addestramento 🎓',
      subtitle: 'Insegna a Luna nuovi trucchi!',
      selectTrick: 'Scegli un trucco',
      practice: 'Pratica',
      learned: 'Imparato!',
      locked: 'Bloccato',
      levelRequired: 'Livello {level} richiesto',
      difficulty: {
        easy: 'Facile',
        medium: 'Medio',
        hard: 'Difficile',
      },
      xpReward: '+{xp} XP',
      instructions: 'Premi i tasti nell\'ordine giusto!',
      success: 'Bravissima Luna! 🌟',
      fail: 'Riprova! Luna sta imparando...',
      perfect: 'Perfetto! Trucco imparato! 🎉',
      progress: 'Progresso: {current}/{total}',
      tricksLearned: 'Trucchi imparati: {count}',
      noTricks: 'Nessun trucco ancora imparato!',
      startTraining: 'Inizia!',
      showOff: 'Esibisciti!',
      close: 'Chiudi',
    },
    // T1330: Pet Health Checkup System 🏥
    healthCheckup: {
      title: 'Visita Veterinaria 🏥',
      subtitle: 'Controllo di salute per {name}',
      overallHealth: 'Salute Generale',
      excellent: 'Eccellente! ⭐',
      good: 'Buona 😊',
      fair: 'Così così 😐',
      poor: 'Ha bisogno di cure 😟',
      critical: 'Attenzione! 🚨',
      categories: {
        energy: 'Energia',
        hunger: 'Alimentazione',
        happiness: 'Felicità',
        health: 'Salute Fisica',
      },
      tips: {
        energy: {
          low: 'Luna è stanca! Portala a dormire nella camera da letto.',
          medium: 'Luna ha un po\' di energia. Un riposino potrebbe aiutare!',
          high: 'Luna è piena di energia! Perfetto per giocare!',
        },
        hunger: {
          low: 'Luna ha fame! Corri in cucina a darle da mangiare.',
          medium: 'Luna potrebbe fare uno spuntino presto.',
          high: 'Luna è sazia e felice! 😋',
        },
        happiness: {
          low: 'Luna è triste... Gioca con lei o accarezzala!',
          medium: 'Luna è serena. Qualche coccola in più?',
          high: 'Luna è felicissima! Ottimo lavoro! 🎉',
        },
        health: {
          low: 'Luna non sta bene. Falle fare un bagno e dagli da mangiare!',
          medium: 'Luna sta abbastanza bene. Continua così!',
          high: 'Luna è in ottima salute! 💪',
        },
      },
      checkupBonus: 'Bonus visita: +{coins} ✨ +{xp} XP',
      lastCheckup: 'Ultima visita: {time}',
      neverChecked: 'Prima visita!',
      doctorSays: 'Il dottore dice:',
      close: 'Chiudi',
      checkNow: 'Fai la Visita! 🩺',
    },
    // T1357: Pet Vaccination Record System 💉
    vaccination: {
      title: 'Libretto Vaccinazioni 💉',
      subtitle: 'Le vaccinazioni di {name}',
      tabCheckup: 'Visita',
      tabVaccines: 'Vaccini',
      noRecords: 'Nessun vaccino registrato',
      addVaccine: 'Aggiungi Vaccino',
      vaccineAdded: 'Vaccino registrato! ✨',
      nextDue: 'Prossima dose: {date}',
      overdue: 'Scaduto! ⚠️',
      upToDate: 'In regola ✓',
      dueIn: 'Scade tra {days} giorni',
      dueSoon: 'Scade presto!',
      administered: 'Somministrato: {date}',
      selectVaccine: 'Scegli un vaccino da registrare',
      confirmAdd: 'Registra Vaccino',
      cancel: 'Annulla',
      healthBonus: '+{health} Salute 💪',
      allUpToDate: 'Tutti i vaccini sono in regola! 🎉',
      needsAttention: '{count} vaccini da fare',
      viewAll: 'Vedi tutti',
      delete: 'Elimina',
      deleteConfirm: 'Eliminare questo vaccino?',
    },
    // T1339: Pet Activity Log translations
    activityLog: {
      title: 'Diario di Luna 📓',
      subtitle: 'Cosa ha fatto oggi {name}?',
      today: 'Oggi',
      noActivities: 'Luna non ha ancora fatto nulla oggi!\nComincia a giocare! 🎮',
      activitiesCount: '{count} attività',
      timeline: 'Timeline',
      summary: 'Riassunto',
      morning: 'Mattina',
      afternoon: 'Pomeriggio',
      evening: 'Sera',
      night: 'Notte',
      categories: {
        rest: 'Riposo & Relax',
        food: 'Cibo & Snack',
        play: 'Giochi & Divertimento',
        care: 'Cura & Igiene',
        explore: 'Esplorazione',
        social: 'Coccole & Affetto',
      },
      stats: {
        happiness: 'Felicità guadagnata',
        energy: 'Energia usata',
        coins: 'Monete raccolte',
        playtime: 'Tempo totale giocato', // T1346: Pet playtime stats
      },
      close: 'Chiudi',
      activities: {
        sleep: 'Ha dormito nella camera',
        eat: 'Ha mangiato in cucina',
        play: 'Ha giocato in giardino',
        bath: 'Ha fatto il bagno',
        explore: 'Ha esplorato',
        shop: 'Ha fatto shopping',
        pet: 'Ha ricevuto coccole',
        brush: 'È stata spazzolata',
        toy: 'Ha giocato con un giocattolo',
        train: 'Si è allenata',
        game: 'Ha completato un mini-gioco',
        treasure: 'Ha cercato tesori',
        read: 'Ha letto un libro',
      },
    },
    // T1345: Pet Favorite Room Tracker
    favoriteRoom: {
      title: 'Stanza Preferita 🏠',
      subtitle: 'Dove ama stare di più {name}?',
      favorite: 'Stanza preferita',
      noFavorite: 'Esplora di più!',
      visits: '{count} visite',
      topRooms: 'Stanze più visitate',
      justStarted: 'Luna sta esplorando...',
      loves: '{name} adora stare qui!',
      tip: 'Visita più stanze per scoprire la preferita!',
    },
    // T1352: Pet Mood Ring Indicator
    moodRing: {
      title: 'Anello dell\'Umore 💍',
      subtitle: 'Come si sente {name}?',
      tap: 'Tocca per vedere l\'umore!',
      moods: {
        happy: 'Serena',
        playful: 'Energica',
        hungry: 'Affamata',
        sleepy: 'Assonnata',
      },
      colors: {
        purple: 'Viola = Felice 😊',
        green: 'Verde = Giocherellona 🎉',
        orange: 'Arancione = Ha fame 🍪',
        blue: 'Blu = Ha sonno 😴',
      },
    },
    // T1353: Pet Fortune Telling Feature 🔮
    fortune: {
      title: 'Oracolo di Luna 🔮',
      subtitle: 'Scopri cosa ti riserva il futuro!',
      crystalBall: 'Sfera di Cristallo',
      askFortune: 'Chiedi la Fortuna!',
      thinking: 'Luna sta guardando nel futuro...',
      revealed: 'Il tuo destino è rivelato!',
      categories: {
        luck: '🍀 Fortuna',
        love: '💕 Amicizia',
        adventure: '🗺️ Avventura',
        play: '🎮 Gioco',
        magic: '✨ Magia',
      },
      fortunes: {
        luck: [
          'Oggi troverai qualcosa di speciale! 🌟',
          'La fortuna ti sorride! Prova un mini-gioco! 🎰',
          'Un tesoro ti aspetta in soffitta! 🗝️',
          'Le stelle sono dalla tua parte! ⭐',
          'Qualcosa di meraviglioso sta per succedere! 🌈',
        ],
        love: [
          'Un nuovo amico peloso ti aspetta! 🐾',
          'Luna ti vuole tantissimo bene! 💕',
          'Le coccole di oggi saranno extra speciali! 🤗',
          'L\'amicizia brilla più delle stelle! ✨',
          'Qualcuno pensa a te proprio ora! 💭',
        ],
        adventure: [
          'Un\'avventura ti aspetta in giardino! 🌻',
          'Esplora una nuova stanza oggi! 🚪',
          'Il mondo è pieno di meraviglie da scoprire! 🗺️',
          'Oggi è il giorno perfetto per esplorare! 🧭',
          'Grandi scoperte ti attendono! 🔍',
        ],
        play: [
          'È il momento perfetto per giocare! 🎮',
          'Prova un nuovo giocattolo oggi! 🧸',
          'Divertimento assicurato nei prossimi minuti! 🎉',
          'Un mini-gioco ti porterà fortuna! 🎯',
          'Luna vuole giocare con te! ⭐',
        ],
        magic: [
          'La magia ti circonda oggi! ✨',
          'Cose magiche stanno per accadere! 🪄',
          'Luna sente energie positive! 🌙',
          'Il tuo spirito brilla di luce propria! 💫',
          'Sei destinato a cose straordinarie! 🦄',
        ],
      },
      dailyLimit: 'Torna domani per un\'altra fortuna!',
      fortunesLeft: '{count} fortune rimaste oggi',
      reward: '+{coins} monete ✨',
      close: 'Chiudi',
      newFortune: 'Nuova Fortuna',
    },
    // T1450: Pet Fun Facts Popup 🐱📚
    funFacts: {
      title: 'Lo Sapevi? 🐱',
      subtitle: 'Fatti curiosi sui gatti!',
      nextFact: 'Altro Fatto!',
      close: 'Chiudi',
      category: {
        behavior: '🎭 Comportamento',
        body: '🦴 Corpo',
        history: '📜 Storia',
        senses: '👁️ Sensi',
        sleep: '😴 Sonno',
        communication: '🗣️ Comunicazione',
      },
      facts: [
        { text: 'I gatti passano il 70% della loro vita dormendo!', category: 'sleep', emoji: '😴' },
        { text: 'I gatti possono ruotare le orecchie di 180 gradi!', category: 'body', emoji: '👂' },
        { text: 'Un gatto ha 230 ossa nel corpo, più di un umano!', category: 'body', emoji: '🦴' },
        { text: 'I gatti non sentono il gusto dolce!', category: 'senses', emoji: '👅' },
        { text: 'Il naso di ogni gatto è unico come un\'impronta digitale!', category: 'body', emoji: '👃' },
        { text: 'I gatti possono saltare fino a 6 volte la loro lunghezza!', category: 'body', emoji: '🦘' },
        { text: 'Le fusa dei gatti hanno effetti curativi!', category: 'communication', emoji: '💕' },
        { text: 'I gatti vedono benissimo al buio!', category: 'senses', emoji: '🌙' },
        { text: 'Un gatto adulto ha 30 denti!', category: 'body', emoji: '😸' },
        { text: 'I gatti passano il 30% del tempo a pulirsi!', category: 'behavior', emoji: '🛁' },
        { text: 'I gatti domestici esistono da oltre 10.000 anni!', category: 'history', emoji: '🏛️' },
        { text: 'I baffi dei gatti li aiutano a misurare gli spazi!', category: 'senses', emoji: '✨' },
        { text: 'I gatti possono correre fino a 48 km/h!', category: 'body', emoji: '💨' },
        { text: 'Il cuore di un gatto batte 2-3 volte più veloce di quello umano!', category: 'body', emoji: '❤️' },
        { text: 'I gatti possono fare oltre 100 suoni diversi!', category: 'communication', emoji: '🎵' },
        { text: 'I gatti arancioni sono spesso maschi!', category: 'body', emoji: '🧡' },
        { text: 'I gatti sognano proprio come gli umani!', category: 'sleep', emoji: '💭' },
        { text: 'Nell\'antico Egitto i gatti erano considerati sacri!', category: 'history', emoji: '👑' },
        { text: 'I gatti possono riconoscere la voce del loro padrone!', category: 'senses', emoji: '🎤' },
        { text: 'Il primo gatto nello spazio era francese e si chiamava Félicette!', category: 'history', emoji: '🚀' },
      ],
      learned: 'Hai imparato {count} fatti!',
      newFact: 'Nuovo fatto sbloccato! 🌟',
    },
  },
  en: {
    title: 'Moonlight Magic House',
    rooms: {
      bedroom: 'Bedroom', kitchen: 'Kitchen', garden: 'Garden', living: 'Living Room',
      bathroom: 'Bathroom', garage: 'Garage', shop: 'Boutique', supermarket: 'Supermarket',
      attic: 'Attic', basement: 'Basement', library: 'Library',
    },
    actions: {
      bedroom: { primary: 'Sleep', secondary: 'Read' },
      kitchen: { primary: 'Eat', secondary: 'Cook' },
      garden: { primary: 'Play', secondary: 'Water' },
      living: { primary: 'Watch TV', secondary: 'Relax' },
      bathroom: { primary: 'Bath', secondary: 'Wash' },
      garage: { primary: 'Drive', secondary: 'Fix' },
      shop: { primary: 'Buy clothes', secondary: 'Try on' },
      supermarket: { primary: 'Buy food', secondary: 'Explore' },
      attic: { primary: 'Treasure hunt', secondary: 'Explore' },
      basement: { primary: 'Build', secondary: 'Organize' },
      library: { primary: 'Read', secondary: 'Browse' },
    },
    stats: { health: 'Health', hunger: 'Hunger', energy: 'Energy', happiness: 'Happiness', comfort: 'Comfort', weight: 'Weight' },
    weight: {
      healthy: 'Perfect weight! 🎯',
      gaining: 'Getting a bit chubby... 🍪',
      overfed: 'Too chubby! 🐷 Time to play!',
      exercising: 'Losing weight! 🏃‍♀️',
      warning: 'Luna needs some exercise!',
    },
    messages: {
      sleeping: 'Zzz... 💤', eating: 'Yum yum... 🍪', playing: 'Weee! ⭐',
      watching: 'So cool! 📺', bathing: 'Splash! 🛁', driving: 'Vroom vroom! 🚗',
      shopping: 'Beautiful! 👗', buying: 'Bought! 🛒', notEnoughCoins: 'Need more coins!',
      levelUp: '🎉 Level {level}!', achievementUnlocked: '🏆 Achievement unlocked!',
      dailyReward: '🎁 Daily bonus: +{coins} coins!',
      eventVisitor: '👋 A friend visits! +20 happiness',
      eventGift: '🎁 You found a gift! +15 coins',
      eventRain: '🌧️ It\'s raining! Moonlight loves it!',
      treasureHunt: 'What a find! 🗝️',
      building: 'Done! 🔨',
      reading: 'What a great story! 📖',
      browsing: 'So many books! 📚',
    },
    moods: { happy: 'Happy!', hungry: 'Hungry', sleepy: 'Sleepy', playful: 'Playful!' },
    // T1343: Nap timer translations
    napTimer: {
      sleeping: 'Sleeping...',
      duration: 'for {time}',
      seconds: '{n}s',
      minutes: '{n}m {s}s',
    },
    petNaming: {
      title: 'Name your pet!',
      placeholder: 'Your friend\'s name...',
      confirm: 'Confirm',
      skip: 'Skip (I\'ll use Pip)',
    },
    petRename: {
      title: 'Rename your friend! ✏️',
      subtitle: 'What do you want to call your pet?',
      placeholder: 'New name...',
      confirm: 'Save',
      cancel: 'Cancel',
      success: 'Name changed! ✨',
      clickToRename: 'Tap to change name',
    },
    // T1329: Pet personality translations
    personality: {
      title: 'Personality',
      shy: 'Shy 🙈',
      playful: 'Playful 🎉',
      lazy: 'Lazy 😴',
      shyDesc: 'Luna is a bit shy, but super sweet once she opens up!',
      playfulDesc: 'Luna loves to play and cause mischief!',
      lazyDesc: 'Luna loves to sleep and relax all day!',
      bonus: 'Personality bonus',
    },
    timeOfDay: { morning: '🌅 Morning', afternoon: '☀️ Afternoon', evening: '🌆 Evening', night: '🌙 Night' },
    achievements: {
      explorer: 'Explorer', firstMeal: 'First meal', sleepyHead: 'Sleepy head',
      socialite: 'Socialite', shopper: 'Shopaholic', wealthy: 'Wealthy', healthy: 'Healthy',
      bookworm: 'Bookworm',
    },
    explore: 'Explore the house!',
    footer: 'Onde Kids ✨',
    miniGame: 'Mini-game!',
    tapToPlay: 'Tap the stars!',
    score: 'Score',
    wardrobe: {
      title: 'Wardrobe',
      hats: 'Hats',
      accessories: 'Accessories',
      outfits: 'Outfits',
      collars: 'Collars', // T1334: Pet collar shop
      eyes: 'Eyes', // T1333: Eye color tab
      unlock: 'Unlock',
      equip: 'Wear',
      unequip: 'Remove',
      locked: 'Locked',
      levelRequired: 'Level {level} required',
      notEnoughCoins: 'Need more coins!',
      unlocked: 'Unlocked! ✨',
      special: 'Special!',
    },
    // T1333: Eye color customization translations
    eyeColor: {
      title: 'Eye Color 👁️',
      subtitle: "Change Luna's eye color!",
      current: 'Current',
      select: 'Select',
      selected: 'Selected ✓',
      unlock: 'Unlock',
      locked: 'Locked',
      levelRequired: 'Level {level} required',
      notEnoughCoins: 'Need more coins!',
      unlocked: 'Unlocked! ✨',
      special: 'Special!',
      free: 'Free!',
    },
    // T1332: Fur color customization translations
    furColor: {
      title: 'Fur Color 🎨',
      subtitle: "Change Luna's fur color!",
      current: 'Current',
      select: 'Select',
      selected: 'Selected ✓',
      unlock: 'Unlock',
      locked: 'Locked',
      levelRequired: 'Level {level} required',
      notEnoughCoins: 'Need more coins!',
      unlocked: 'Unlocked! ✨',
      special: 'Special!',
      preview: 'Preview',
    },
    photoMode: {
      title: 'Photo Mode 📸',
      filters: 'Filters',
      frames: 'Frames',
      none: 'None',
      capture: 'Capture! 📷',
      saving: 'Saving...',
      saved: 'Photo saved! ✨',
      download: 'Download',
      share: 'Share',
      close: 'Close',
      filterNormal: 'Normal',
      filterSepia: 'Sepia',
      filterGrayscale: 'B&W',
      filterVintage: 'Vintage',
      filterDreamy: 'Dreamy',
      filterSunset: 'Sunset',
      filterNight: 'Night',
      filterSparkle: 'Sparkle',
      frameNone: 'None',
      frameHearts: 'Hearts',
      frameStars: 'Stars',
      frameFlowers: 'Flowers',
      framePolaroid: 'Polaroid',
      frameRainbow: 'Rainbow',
      frameGold: 'Gold',
      frameMagic: 'Magic',
    },
    toyBox: {
      title: 'Toy Box 🧸',
      play: 'Play!',
      unlock: 'Unlock',
      locked: 'Locked',
      favorite: 'Favorite',
      setFavorite: 'Set as favorite',
      levelRequired: 'Level {level} required',
      notEnoughCoins: 'Need more coins!',
      notEnoughEnergy: 'Luna is too tired!',
      unlocked: 'Unlocked! ✨',
      playing: 'So much fun! 🎉',
      common: 'Common',
      rare: 'Rare',
      legendary: 'Legendary',
      happiness: '+{amount} Happiness',
      energy: '-{amount} Energy',
      // T1324: Catnip crazy mode translations
      catnipActive: '😸 CRAZY MODE! 🌀',
      catnipEnded: 'Phew... what a rush! 😅',
    },
    // T1356: Pet Sleep Schedule translations
    sleepSchedule: {
      title: 'Bedtime Schedule 🌙',
      subtitle: 'Help Luna go to sleep on time!',
      enabled: 'Reminder on',
      disabled: 'Reminder off',
      bedtime: 'Bedtime',
      wakeTime: 'Wake time',
      reminderBefore: 'Alert {minutes} min before',
      save: 'Save',
      cancel: 'Cancel',
      saved: 'Saved! 🌟',
      bedtimeReminder: '🌙 It\'s almost bedtime!',
      bedtimeNow: '😴 Luna is sleepy... time for bed!',
      goodnight: 'Sweet dreams, Luna! 💤',
      sleepyLuna: 'Luna is yawning... 🥱',
      minutesUntilBed: '{minutes} minutes until bedtime',
      timeForBed: 'Time for bed!',
      toggle: 'On/Off',
    },
    // T1349: Pet Treats Shop translations
    treatShop: {
      title: 'Treat Shop 🍪',
      subtitle: 'Feed Luna some treats!',
      buy: 'Buy',
      feed: 'Feed Luna!',
      owned: 'Owned: {count}',
      notOwned: "You don't have any!",
      unlock: 'Unlock',
      locked: 'Locked',
      levelRequired: 'Level {level} required',
      notEnoughCoins: 'Need more coins!',
      purchased: 'Purchased! 🛒',
      feeding: 'Yum yum! 😋',
      yummy: 'So tasty! 😻',
      tooFull: 'Luna is too full!',
      common: 'Common',
      rare: 'Rare',
      premium: 'Premium',
      stats: {
        hunger: '+{amount} Hunger',
        happiness: '+{amount} Happiness',
        weight: '+{amount} Weight',
        healthy: 'Healthy! 💚',
      },
      inventory: 'Inventory',
      shop: 'Shop',
      totalFed: 'Treats fed: {count}',
      special: 'Special! ✨',
    },
    grooming: {
      brush: 'Brush',
      brushing: 'So fluffy! ✨',
      cooldown: 'Luna needs a break!',
      happinessBoost: '+{amount} Happiness',
    },
    // T1348: Pet cuddle mode translations 🤗💕
    cuddle: {
      holding: 'I love you! 🤗💕',
      release: 'Such lovely cuddles! ✨',
      hint: 'Hold to cuddle her!',
      happinessBoost: '+{amount} Happiness',
    },
    birthday: {
      title: 'Happy Birthday! 🎂',
      message: "It's {name}'s birthday today!",
      age: '{name} is turning {age}!',
      ageYears: '{years} year',
      ageYearsPlural: '{years} years',
      ageMonths: '{months} month',
      ageMonthsPlural: '{months} months',
      firstBirthday: "It's the first birthday!",
      reward: 'Birthday gift: +{coins} coins!',
      celebrate: 'Celebrate! 🎉',
    },
    moodJournal: {
      title: 'Mood Journal 📔',
      subtitle: "How is {name} feeling today?",
      todayMood: "Today's mood",
      addNote: 'Add a note...',
      saveEntry: 'Save to journal',
      history: 'Previous Pages',
      noEntries: 'Journal is empty. Write the first thought!',
      saved: 'Saved! ✨',
      alreadyLogged: 'Already logged today!',
      moodHappy: 'Happy',
      moodHungry: 'Hungry',
      moodSleepy: 'Sleepy',
      moodPlayful: 'Playful',
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: '{days} days ago',
      viewAll: 'View all',
      close: 'Close',
      // T1449: Star rating translations
      rateYourDay: 'Rate your day',
      stars: 'stars',
      star: 'star',
    },
    dailyQuests: {
      title: 'Daily Quests 📋',
      subtitle: 'Complete quests for bonuses!',
      progress: '{current}/{target}',
      completed: 'Completed!',
      claimed: 'Claimed!',
      claim: 'Claim Reward',
      reward: '+{coins} 💰 +{xp} ⭐',
      allComplete: 'All done! Come back tomorrow! 🌟',
      newQuests: 'New quests available!',
    },
    friendCode: {
      title: 'Friend Code 🤝',
      subtitle: 'Share your code with friends!',
      yourCode: 'Your code:',
      copy: 'Copy',
      copied: 'Copied! ✨',
      share: 'Share',
      shareText: "Here's my Moonlight friend code: {code}! Come play with {name}! 🌙✨",
      info: 'Your friends can find you with this code!',
    },
    giftSending: {
      title: 'Send Gift 🎁',
      subtitle: 'Send a gift to a friend!',
      selectGift: 'Choose a gift',
      friendCode: 'Friend code',
      friendCodePlaceholder: 'XXXX-XXXX',
      send: 'Send! 💝',
      sending: 'Sending...',
      sent: 'Gift sent! ✨',
      notEnoughCoins: 'Need more coins!',
      invalidCode: 'Invalid code!',
      cost: 'Cost',
      common: 'Common',
      rare: 'Rare',
      legendary: 'Legendary',
      history: 'Gifts sent',
      noHistory: "You haven't sent any gifts yet!",
      totalSent: 'Total sent: {count}',
      giftFor: 'Gift for {code}',
    },
    petAlbum: {
      title: 'Pet Album 🐾',
      subtitle: 'Collect all the friends!',
      discovered: 'Discovered!',
      notDiscovered: '???',
      progress: '{count}/{total} discovered',
      rarity: {
        common: 'Common',
        rare: 'Rare',
        legendary: 'Legendary',
        mythic: 'Mythic',
      },
      newDiscovery: 'New friend discovered! 🎉',
      hint: 'Keep exploring to find new friends!',
      unlockHint: {
        level: 'Reach level {level}',
        room: 'Visit {room}',
        random: 'Random encounter!',
        secret: 'Secret...',
      },
    },
    petTraining: {
      title: 'Training 🎓',
      subtitle: 'Teach Luna new tricks!',
      selectTrick: 'Choose a trick',
      practice: 'Practice',
      learned: 'Learned!',
      locked: 'Locked',
      levelRequired: 'Level {level} required',
      difficulty: {
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard',
      },
      xpReward: '+{xp} XP',
      instructions: 'Press the buttons in the right order!',
      success: 'Good job Luna! 🌟',
      fail: 'Try again! Luna is learning...',
      perfect: 'Perfect! Trick learned! 🎉',
      progress: 'Progress: {current}/{total}',
      tricksLearned: 'Tricks learned: {count}',
      noTricks: 'No tricks learned yet!',
      startTraining: 'Start!',
      showOff: 'Show off!',
      close: 'Close',
    },
    // T1330: Pet Health Checkup System 🏥
    healthCheckup: {
      title: 'Vet Visit 🏥',
      subtitle: 'Health checkup for {name}',
      overallHealth: 'Overall Health',
      excellent: 'Excellent! ⭐',
      good: 'Good 😊',
      fair: 'Fair 😐',
      poor: 'Needs care 😟',
      critical: 'Warning! 🚨',
      categories: {
        energy: 'Energy',
        hunger: 'Nutrition',
        happiness: 'Happiness',
        health: 'Physical Health',
      },
      tips: {
        energy: {
          low: 'Luna is tired! Take her to the bedroom for a nap.',
          medium: 'Luna has some energy. A little rest might help!',
          high: 'Luna is full of energy! Perfect for playtime!',
        },
        hunger: {
          low: 'Luna is hungry! Run to the kitchen to feed her.',
          medium: 'Luna could use a snack soon.',
          high: 'Luna is well-fed and happy! 😋',
        },
        happiness: {
          low: 'Luna is sad... Play with her or give her cuddles!',
          medium: 'Luna is okay. Maybe some extra pets?',
          high: 'Luna is super happy! Great job! 🎉',
        },
        health: {
          low: 'Luna is not feeling well. Give her a bath and food!',
          medium: 'Luna is doing okay. Keep it up!',
          high: 'Luna is in great health! 💪',
        },
      },
      checkupBonus: 'Checkup bonus: +{coins} ✨ +{xp} XP',
      lastCheckup: 'Last visit: {time}',
      neverChecked: 'First visit!',
      doctorSays: 'The doctor says:',
      close: 'Close',
      checkNow: 'Do Checkup! 🩺',
    },
    // T1357: Pet Vaccination Record System 💉
    vaccination: {
      title: 'Vaccination Record 💉',
      subtitle: "{name}'s vaccinations",
      tabCheckup: 'Checkup',
      tabVaccines: 'Vaccines',
      noRecords: 'No vaccines recorded',
      addVaccine: 'Add Vaccine',
      vaccineAdded: 'Vaccine recorded! ✨',
      nextDue: 'Next due: {date}',
      overdue: 'Overdue! ⚠️',
      upToDate: 'Up to date ✓',
      dueIn: 'Due in {days} days',
      dueSoon: 'Due soon!',
      administered: 'Administered: {date}',
      selectVaccine: 'Select a vaccine to record',
      confirmAdd: 'Record Vaccine',
      cancel: 'Cancel',
      healthBonus: '+{health} Health 💪',
      allUpToDate: 'All vaccines are up to date! 🎉',
      needsAttention: '{count} vaccines needed',
      viewAll: 'View all',
      delete: 'Delete',
      deleteConfirm: 'Delete this vaccine record?',
    },
    // T1339: Pet Activity Log translations
    activityLog: {
      title: "Luna's Diary 📓",
      subtitle: 'What did {name} do today?',
      today: 'Today',
      noActivities: "Luna hasn't done anything yet today!\nStart playing! 🎮",
      activitiesCount: '{count} activities',
      timeline: 'Timeline',
      summary: 'Summary',
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      night: 'Night',
      categories: {
        rest: 'Rest & Relax',
        food: 'Food & Snacks',
        play: 'Play & Fun',
        care: 'Care & Hygiene',
        explore: 'Exploration',
        social: 'Cuddles & Love',
      },
      stats: {
        happiness: 'Happiness gained',
        energy: 'Energy used',
        coins: 'Coins collected',
        playtime: 'Total playtime', // T1346: Pet playtime stats
      },
      close: 'Close',
      activities: {
        sleep: 'Slept in the bedroom',
        eat: 'Ate in the kitchen',
        play: 'Played in the garden',
        bath: 'Took a bath',
        explore: 'Explored',
        shop: 'Went shopping',
        pet: 'Got cuddles',
        brush: 'Got brushed',
        toy: 'Played with a toy',
        train: 'Did some training',
        game: 'Completed a mini-game',
        treasure: 'Hunted for treasure',
        read: 'Read a book',
      },
    },
    // T1345: Pet Favorite Room Tracker
    favoriteRoom: {
      title: 'Favorite Room 🏠',
      subtitle: 'Where does {name} love to be?',
      favorite: 'Favorite room',
      noFavorite: 'Keep exploring!',
      visits: '{count} visits',
      topRooms: 'Most visited rooms',
      justStarted: 'Luna is exploring...',
      loves: '{name} loves being here!',
      tip: 'Visit more rooms to find the favorite!',
    },
    // T1352: Pet Mood Ring Indicator
    moodRing: {
      title: 'Mood Ring 💍',
      subtitle: "How is {name} feeling?",
      tap: 'Tap to see the mood!',
      moods: {
        happy: 'Calm',
        playful: 'Energetic',
        hungry: 'Hungry',
        sleepy: 'Drowsy',
      },
      colors: {
        purple: 'Purple = Happy 😊',
        green: 'Green = Playful 🎉',
        orange: 'Orange = Hungry 🍪',
        blue: 'Blue = Sleepy 😴',
      },
    },
    // T1353: Pet Fortune Telling Feature 🔮
    fortune: {
      title: "Luna's Oracle 🔮",
      subtitle: 'Discover what the future holds!',
      crystalBall: 'Crystal Ball',
      askFortune: 'Ask for Fortune!',
      thinking: 'Luna is gazing into the future...',
      revealed: 'Your destiny is revealed!',
      categories: {
        luck: '🍀 Luck',
        love: '💕 Friendship',
        adventure: '🗺️ Adventure',
        play: '🎮 Play',
        magic: '✨ Magic',
      },
      fortunes: {
        luck: [
          "You'll find something special today! 🌟",
          'Luck is smiling at you! Try a mini-game! 🎰',
          'A treasure awaits you in the attic! 🗝️',
          'The stars are on your side! ⭐',
          'Something wonderful is about to happen! 🌈',
        ],
        love: [
          'A new furry friend awaits you! 🐾',
          'Luna loves you so much! 💕',
          "Today's cuddles will be extra special! 🤗",
          'Friendship shines brighter than stars! ✨',
          'Someone is thinking of you right now! 💭',
        ],
        adventure: [
          'An adventure awaits you in the garden! 🌻',
          'Explore a new room today! 🚪',
          'The world is full of wonders to discover! 🗺️',
          "Today is the perfect day to explore! 🧭",
          'Great discoveries await you! 🔍',
        ],
        play: [
          "It's the perfect time to play! 🎮",
          'Try a new toy today! 🧸',
          'Fun is guaranteed in the next few minutes! 🎉',
          'A mini-game will bring you luck! 🎯',
          'Luna wants to play with you! ⭐',
        ],
        magic: [
          'Magic surrounds you today! ✨',
          'Magical things are about to happen! 🪄',
          'Luna senses positive energy! 🌙',
          'Your spirit shines with its own light! 💫',
          "You're destined for extraordinary things! 🦄",
        ],
      },
      dailyLimit: 'Come back tomorrow for another fortune!',
      fortunesLeft: '{count} fortunes left today',
      reward: '+{coins} coins ✨',
      close: 'Close',
      newFortune: 'New Fortune',
    },
    // T1450: Pet Fun Facts Popup 🐱📚
    funFacts: {
      title: 'Did You Know? 🐱',
      subtitle: 'Fun facts about cats!',
      nextFact: 'Next Fact!',
      close: 'Close',
      category: {
        behavior: '🎭 Behavior',
        body: '🦴 Body',
        history: '📜 History',
        senses: '👁️ Senses',
        sleep: '😴 Sleep',
        communication: '🗣️ Communication',
      },
      facts: [
        { text: 'Cats spend 70% of their lives sleeping!', category: 'sleep', emoji: '😴' },
        { text: 'Cats can rotate their ears 180 degrees!', category: 'body', emoji: '👂' },
        { text: 'A cat has 230 bones - more than a human!', category: 'body', emoji: '🦴' },
        { text: "Cats can't taste sweetness!", category: 'senses', emoji: '👅' },
        { text: "Each cat's nose print is unique like a fingerprint!", category: 'body', emoji: '👃' },
        { text: 'Cats can jump up to 6 times their length!', category: 'body', emoji: '🦘' },
        { text: 'Cat purrs have healing effects!', category: 'communication', emoji: '💕' },
        { text: 'Cats can see very well in the dark!', category: 'senses', emoji: '🌙' },
        { text: 'An adult cat has 30 teeth!', category: 'body', emoji: '😸' },
        { text: 'Cats spend 30% of their time grooming!', category: 'behavior', emoji: '🛁' },
        { text: 'Domestic cats have existed for over 10,000 years!', category: 'history', emoji: '🏛️' },
        { text: 'Cat whiskers help them measure spaces!', category: 'senses', emoji: '✨' },
        { text: 'Cats can run up to 30 mph!', category: 'body', emoji: '💨' },
        { text: 'A cat\'s heart beats 2-3 times faster than a human\'s!', category: 'body', emoji: '❤️' },
        { text: 'Cats can make over 100 different sounds!', category: 'communication', emoji: '🎵' },
        { text: 'Orange cats are often male!', category: 'body', emoji: '🧡' },
        { text: 'Cats dream just like humans do!', category: 'sleep', emoji: '💭' },
        { text: 'In ancient Egypt, cats were considered sacred!', category: 'history', emoji: '👑' },
        { text: "Cats can recognize their owner's voice!", category: 'senses', emoji: '🎤' },
        { text: 'The first cat in space was a French cat named Félicette!', category: 'history', emoji: '🚀' },
      ],
      learned: "You've learned {count} facts!",
      newFact: 'New fact unlocked! 🌟',
    },
  },
};

// ==================== ROOM DATA ====================
const roomData: {
  key: RoomKey; icon: string; bg: string; category: 'home' | 'outside';
  hotspot: { x: number; y: number; width: number; height: number };
  lunaPos: { x: number; y: number };
}[] = [
  { key: 'bedroom', icon: '🛏️', bg: `${BASE_URL}assets/backgrounds/room-bedroom.jpg`, category: 'home',
    hotspot: { x: 32, y: 18, width: 22, height: 28 }, lunaPos: { x: 43, y: 32 } },
  { key: 'kitchen', icon: '🍳', bg: `${BASE_URL}assets/backgrounds/room-kitchen.jpg`, category: 'home',
    hotspot: { x: 32, y: 52, width: 18, height: 30 }, lunaPos: { x: 41, y: 67 } },
  { key: 'living', icon: '🛋️', bg: `${BASE_URL}assets/backgrounds/room-living.jpg`, category: 'home',
    hotspot: { x: 50, y: 52, width: 20, height: 30 }, lunaPos: { x: 60, y: 67 } },
  { key: 'bathroom', icon: '🛁', bg: `${BASE_URL}assets/backgrounds/room-bathroom.jpg`, category: 'home',
    hotspot: { x: 58, y: 18, width: 18, height: 28 }, lunaPos: { x: 67, y: 32 } },
  { key: 'garden', icon: '🌙', bg: `${BASE_URL}assets/backgrounds/room-garden.jpg`, category: 'home',
    hotspot: { x: 5, y: 45, width: 22, height: 40 }, lunaPos: { x: 16, y: 65 } },
  { key: 'garage', icon: '🚗', bg: `${BASE_URL}assets/backgrounds/room-garage.jpg`, category: 'home',
    hotspot: { x: 70, y: 52, width: 22, height: 30 }, lunaPos: { x: 81, y: 67 } },
  { key: 'shop', icon: '👗', bg: `${BASE_URL}assets/backgrounds/room-shop.jpg`, category: 'outside',
    hotspot: { x: 0, y: 0, width: 0, height: 0 }, lunaPos: { x: 50, y: 60 } },
  { key: 'supermarket', icon: '🛒', bg: `${BASE_URL}assets/backgrounds/room-supermarket.jpg`, category: 'outside',
    hotspot: { x: 0, y: 0, width: 0, height: 0 }, lunaPos: { x: 50, y: 60 } },
  // Library - where Luna reads Onde Books!
  { key: 'library', icon: '📚', bg: `${BASE_URL}assets/backgrounds/room-library.jpg`, category: 'home',
    hotspot: { x: 76, y: 18, width: 18, height: 28 }, lunaPos: { x: 85, y: 32 } },
  // New explorable areas
  { key: 'attic', icon: '🏚️', bg: `${BASE_URL}assets/backgrounds/room-attic.jpg`, category: 'home',
    hotspot: { x: 40, y: 2, width: 20, height: 15 }, lunaPos: { x: 50, y: 55 } },
  { key: 'basement', icon: '🔧', bg: `${BASE_URL}assets/backgrounds/room-basement.jpg`, category: 'home',
    hotspot: { x: 40, y: 85, width: 20, height: 13 }, lunaPos: { x: 50, y: 60 } },
];

// ==================== ACHIEVEMENTS ====================
const defaultAchievements: Achievement[] = [
  { id: 'explorer', icon: '🗺️', unlocked: false, progress: 0, target: 8 },
  { id: 'firstMeal', icon: '🍽️', unlocked: false, progress: 0, target: 1 },
  { id: 'sleepyHead', icon: '😴', unlocked: false, progress: 0, target: 5 },
  { id: 'socialite', icon: '🎉', unlocked: false, progress: 0, target: 10 },
  { id: 'shopper', icon: '🛍️', unlocked: false, progress: 0, target: 10 },
  { id: 'wealthy', icon: '💰', unlocked: false, progress: 0, target: 500 },
  { id: 'healthy', icon: '💪', unlocked: false, progress: 0, target: 100 },
  { id: 'bookworm', icon: '📚', unlocked: false, progress: 0, target: 3 },
];

// ==================== HELPER FUNCTIONS ====================
const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
};

const getMood = (stats: PetStats): MoodType => {
  // Priority: hunger and energy are more urgent needs
  if (stats.hunger < 30) return 'hungry';
  if (stats.energy < 30) return 'sleepy';
  // Playful when high energy and happiness
  if (stats.happiness > 70 && stats.energy > 60) return 'playful';
  // Default to happy
  return 'happy';
};

const getMoodEmoji = (mood: MoodType): string => {
  const emojis: Record<MoodType, string> = {
    happy: '😊', hungry: '😋', sleepy: '😴', playful: '🎉'
  };
  return emojis[mood];
};

// Get mood-specific interaction messages
const getMoodInteractionMessage = (mood: MoodType, action: string, lang: 'it' | 'en'): string | null => {
  const messages: Record<MoodType, Record<string, { it: string; en: string }>> = {
    hungry: {
      play: { it: 'Ho troppa fame per giocare... 😋', en: "I'm too hungry to play... 😋" },
      sleep: { it: 'La pancia brontola... 😋', en: 'My tummy is rumbling... 😋' },
      default: { it: 'Mmm, ho fame! 😋', en: 'Mmm, I\'m hungry! 😋' },
    },
    sleepy: {
      play: { it: '*sbadiglio* Sono stanco... 😴', en: '*yawn* I\'m tired... 😴' },
      eat: { it: 'Forse dopo un sonnellino... 😴', en: 'Maybe after a nap... 😴' },
      default: { it: 'Zzz... 😴', en: 'Zzz... 😴' },
    },
    playful: {
      sleep: { it: 'Ma ho voglia di giocare! 🎉', en: 'But I wanna play! 🎉' },
      eat: { it: 'Ok, ma poi giochiamo! 🎉', en: 'Ok, but let\'s play after! 🎉' },
      default: { it: 'Evviva! Giochiamo! 🎉', en: 'Yay! Let\'s play! 🎉' },
    },
    happy: {
      default: { it: 'Sono felice! 😊', en: 'I\'m happy! 😊' },
    },
  };
  
  const moodMessages = messages[mood];
  const actionMsg = moodMessages[action] || moodMessages.default;
  return actionMsg?.[lang] || null;
};

const getXpForLevel = (level: number): number => level * 100;

// ==================== PET COMFORT LEVEL SYSTEM (T1325) ====================
// Calculate overall comfort level from all stats
type ComfortLevel = 'blissful' | 'happy' | 'okay' | 'uncomfortable' | 'distressed';

interface ComfortInfo {
  level: ComfortLevel;
  score: number; // 0-100
  emoji: string;
  color: string;
  label: { it: string; en: string };
}

const calculateComfortLevel = (stats: PetStats): ComfortInfo => {
  // Weighted average of all stats (hunger and happiness weighted more)
  const score = Math.round(
    (stats.hunger * 0.3) + 
    (stats.happiness * 0.3) + 
    (stats.energy * 0.2) + 
    (stats.health * 0.2)
  );
  
  if (score >= 80) {
    return {
      level: 'blissful',
      score,
      emoji: '😻',
      color: '#4ade80', // bright green
      label: { it: 'Beato!', en: 'Blissful!' },
    };
  } else if (score >= 60) {
    return {
      level: 'happy',
      score,
      emoji: '😊',
      color: '#a3e635', // lime
      label: { it: 'Felice', en: 'Happy' },
    };
  } else if (score >= 40) {
    return {
      level: 'okay',
      score,
      emoji: '😐',
      color: '#fbbf24', // amber
      label: { it: 'Ok', en: 'Okay' },
    };
  } else if (score >= 20) {
    return {
      level: 'uncomfortable',
      score,
      emoji: '😟',
      color: '#fb923c', // orange
      label: { it: 'A disagio', en: 'Uncomfortable' },
    };
  } else {
    return {
      level: 'distressed',
      score,
      emoji: '😿',
      color: '#f87171', // red
      label: { it: 'In difficoltà', en: 'Distressed' },
    };
  }
};

// ==================== PET MOOD RING SYSTEM (T1352) ====================
// Visual mood ring that changes color based on pet's current emotional state!
// Like a real mood ring - color reflects feelings! 💍✨

interface MoodRingInfo {
  color: string;
  glowColor: string;
  pulseSpeed: number; // seconds for pulse animation
  label: { it: string; en: string };
  description: { it: string; en: string };
}

// Mood ring colors based on classic mood ring interpretations
const getMoodRingInfo = (mood: MoodType, stats: PetStats): MoodRingInfo => {
  // Calculate intensity based on stat levels (affects glow strength)
  const intensity = Math.max(stats.happiness, stats.energy) / 100;
  
  switch (mood) {
    case 'happy':
      return {
        color: '#9333ea', // Purple/violet - calm and content
        glowColor: `rgba(147, 51, 234, ${0.4 + intensity * 0.3})`,
        pulseSpeed: 2.5,
        label: { it: 'Sereno', en: 'Calm' },
        description: { it: 'Luna è felice e rilassata!', en: 'Luna is happy and relaxed!' },
      };
    case 'playful':
      return {
        color: '#22c55e', // Green - energetic and excited
        glowColor: `rgba(34, 197, 94, ${0.5 + intensity * 0.3})`,
        pulseSpeed: 1.2, // Faster pulse for playful
        label: { it: 'Energica', en: 'Energetic' },
        description: { it: 'Luna vuole giocare!', en: 'Luna wants to play!' },
      };
    case 'hungry':
      return {
        color: '#f97316', // Orange/amber - needs attention
        glowColor: `rgba(249, 115, 22, ${0.5 + intensity * 0.2})`,
        pulseSpeed: 1.5,
        label: { it: 'Affamata', en: 'Hungry' },
        description: { it: 'Luna ha fame!', en: 'Luna is hungry!' },
      };
    case 'sleepy':
      return {
        color: '#3b82f6', // Deep blue - drowsy and peaceful
        glowColor: `rgba(59, 130, 246, ${0.3 + intensity * 0.2})`,
        pulseSpeed: 3.5, // Slower pulse for sleepy
        label: { it: 'Assonnata', en: 'Drowsy' },
        description: { it: 'Luna ha sonno...', en: 'Luna is sleepy...' },
      };
    default:
      return {
        color: '#9333ea',
        glowColor: 'rgba(147, 51, 234, 0.4)',
        pulseSpeed: 2.5,
        label: { it: 'Sereno', en: 'Calm' },
        description: { it: 'Luna sta bene!', en: 'Luna is doing well!' },
      };
  }
};

// ==================== PET EVOLUTION SYSTEM (T1173) ====================
// Pet evolves visually based on level: baby → kitten → adult cat
type EvolutionStage = 'baby' | 'kitten' | 'adult';

interface EvolutionInfo {
  stage: EvolutionStage;
  emoji: string;
  label: { it: string; en: string };
  scale: number;
  glowColor: string;
  nextLevel: number | null; // Level needed for next evolution
}

const getEvolutionStage = (level: number): EvolutionInfo => {
  if (level <= 2) {
    return {
      stage: 'baby',
      emoji: '🍼',
      label: { it: 'Cucciolo', en: 'Baby' },
      scale: 0.75,
      glowColor: 'rgba(255, 182, 193, 0.6)', // Soft pink
      nextLevel: 3,
    };
  } else if (level <= 5) {
    return {
      stage: 'kitten',
      emoji: '🐱',
      label: { it: 'Gattino', en: 'Kitten' },
      scale: 0.9,
      glowColor: 'rgba(255, 215, 0, 0.5)', // Golden
      nextLevel: 6,
    };
  } else {
    return {
      stage: 'adult',
      emoji: '🦁',
      label: { it: 'Gatto Adulto', en: 'Adult Cat' },
      scale: 1.0,
      glowColor: 'rgba(147, 112, 219, 0.6)', // Majestic purple
      nextLevel: null,
    };
  }
};

// ==================== SAVE GAME SYSTEM ====================
const SAVE_KEY = 'moonlight-house-save';

interface SaveData {
  stats: PetStats;
  achievements: Achievement[];
  gameState: {
    dayCount: number;
    totalActions: number;
    roomsVisited: RoomKey[];
    lastDailyReward: string | null;
    streak: number;
    totalPlayMinutes?: number; // T1346: Total playtime tracking
  };
  savedAt: string;
  lastVisit: number; // timestamp for pet persistence
  totalVisits: number;
  petName?: string; // custom pet name
  costumes?: CostumeState; // unlocked and equipped costumes
  toyBox?: ToyBoxState; // T1175: Toy box inventory
  createdAt?: string; // T1169: Pet creation date for birthday tracking (ISO string)
  lastBirthdayCelebrated?: string; // T1169: Track when we last celebrated (YYYY format)
  moodJournal?: MoodJournalState; // T1179: Pet mood journal entries
  playHistory?: string[]; // T1180: Array of played dates (YYYY-MM-DD format)
  dailyQuests?: DailyQuestState; // T1185: Daily quest system
  friendCode?: FriendCodeState; // T1191: Unique friend code for sharing
  petAlbum?: PetAlbumState; // T1197: Collection album of pets seen
  personality?: PersonalityTrait; // T1329: Pet personality trait (shy, playful, lazy)
  furColor?: FurColorId; // T1332: Pet fur color customization
  unlockedFurColors?: FurColorId[]; // T1332: Unlocked fur colors
  activityLog?: ActivityLogState; // T1339: Pet activity log (what Luna did today)
  favoriteRoomState?: FavoriteRoomState; // T1345: Pet favorite room tracker
  sleepSchedule?: SleepScheduleState; // T1356: Pet sleep schedule for bedtime reminders
  vaccinationState?: VaccinationState; // T1357: Pet vaccination records
}

// Time-away stat adjustment - pet gets hungry/lonely when you're gone
const adjustStatsForTimeAway = (stats: PetStats, lastVisit: number): { stats: PetStats; hoursAway: number } => {
  const now = Date.now();
  const hoursAway = (now - lastVisit) / (1000 * 60 * 60);
  
  if (hoursAway < 0.1) return { stats, hoursAway: 0 }; // Less than 6 minutes - no change
  
  // Decay rates per hour away
  const hungerDecay = Math.min(hoursAway * 3, 60); // Max 60 decay
  const happinessDecay = Math.min(hoursAway * 2, 50); // Max 50 decay
  const energyRecovery = Math.min(hoursAway * 5, 40); // Actually recovers energy (rested!)
  // T1338: Weight naturally decreases while away (metabolism)
  const weightDecay = Math.min(hoursAway * 1, 20); // Max 20 decay, slow metabolism
  
  return {
    stats: {
      ...stats,
      hunger: Math.max(0, stats.hunger - hungerDecay),
      happiness: Math.max(0, stats.happiness - happinessDecay),
      energy: Math.min(100, stats.energy + energyRecovery), // Rested while away
      health: stats.hunger - hungerDecay < 20 ? Math.max(0, stats.health - hoursAway * 2) : stats.health,
      weight: Math.max(30, (stats.weight ?? 50) - weightDecay), // T1338: Min weight is 30 (healthy minimum)
    },
    hoursAway,
  };
};

// Welcome back message based on time away
const getWelcomeMessage = (hoursAway: number, lang: 'it' | 'en'): { message: string; emoji: string } | null => {
  if (hoursAway < 0.1) return null; // Just returned, no message
  
  if (lang === 'it') {
    if (hoursAway < 1) return { message: 'Bentornato!', emoji: '👋' };
    if (hoursAway < 24) return { message: 'Luna ti ha pensato!', emoji: '💕' };
    return { message: 'Luna si sentiva così sola senza di te! 😿', emoji: '😿' };
  } else {
    if (hoursAway < 1) return { message: 'Welcome back!', emoji: '👋' };
    if (hoursAway < 24) return { message: 'Luna missed you!', emoji: '💕' };
    return { message: 'Luna was so lonely without you! 😿', emoji: '😿' };
  }
};

const loadSaveData = (): SaveData | null => {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return null;
    const data = JSON.parse(saved) as SaveData;
    // Ensure backwards compatibility for saves without lastVisit/totalVisits/createdAt/friendCode/personality/furColor
    return {
      ...data,
      lastVisit: data.lastVisit || Date.parse(data.savedAt) || Date.now(),
      totalVisits: data.totalVisits || 1,
      createdAt: data.createdAt || data.savedAt || new Date().toISOString(), // T1169: Fallback to savedAt for existing pets
      lastBirthdayCelebrated: data.lastBirthdayCelebrated,
      friendCode: data.friendCode, // T1191: Load friend code if exists
      personality: data.personality, // T1329: Load personality trait
      furColor: data.furColor || 'orange', // T1332: Load fur color, default to orange
      unlockedFurColors: data.unlockedFurColors || ['orange'], // T1332: Load unlocked colors
    };
  } catch {
    return null;
  }
};

// T1169: Check if today is the pet's birthday (same month and day as creation)
const isPetBirthday = (createdAt: string): boolean => {
  const created = new Date(createdAt);
  const today = new Date();
  return created.getMonth() === today.getMonth() && created.getDate() === today.getDate();
};

// T1169: Calculate pet age in months and years
const getPetAge = (createdAt: string): { years: number; months: number; days: number } => {
  const created = new Date(createdAt);
  const today = new Date();
  
  let years = today.getFullYear() - created.getFullYear();
  let months = today.getMonth() - created.getMonth();
  let days = today.getDate() - created.getDate();
  
  if (days < 0) {
    months--;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  
  return { years, months, days };
};

const saveSaveData = (stats: PetStats, achievements: Achievement[], gameState: GameState, totalVisits: number, petName?: string, costumes?: CostumeState, toyBox?: ToyBoxState, createdAt?: string, lastBirthdayCelebrated?: string, moodJournal?: MoodJournalState, playHistory?: string[], dailyQuests?: DailyQuestState, friendCode?: FriendCodeState, petAlbum?: PetAlbumState, personality?: PersonalityTrait, furColor?: FurColorId, unlockedFurColors?: FurColorId[], activityLog?: ActivityLogState, favoriteRoomState?: FavoriteRoomState, sleepSchedule?: SleepScheduleState, vaccinationState?: VaccinationState): void => {
  try {
    const data: SaveData = {
      stats,
      achievements,
      gameState: {
        ...gameState,
        roomsVisited: Array.from(gameState.roomsVisited),
      },
      savedAt: new Date().toISOString(),
      lastVisit: Date.now(),
      totalVisits,
      petName,
      costumes,
      toyBox, // T1175: Save toy box state
      createdAt: createdAt || new Date().toISOString(), // T1169: Set creation date on first save
      lastBirthdayCelebrated,
      moodJournal, // T1179: Save mood journal
      playHistory, // T1180: Save play history
      dailyQuests, // T1185: Save daily quests
      friendCode, // T1191: Save friend code
      petAlbum, // T1197: Save pet album
      personality, // T1329: Save personality trait
      furColor: furColor || 'orange', // T1332: Save fur color
      unlockedFurColors: unlockedFurColors || ['orange'], // T1332: Save unlocked fur colors
      activityLog, // T1339: Save activity log
      favoriteRoomState, // T1345: Save favorite room tracker
      sleepSchedule, // T1356: Save sleep schedule
      vaccinationState, // T1357: Save vaccination records
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    console.warn('Failed to save game');
  }
};

// ==================== MINI-GAME COMPONENT ====================
function StarCatchMiniGame({ onComplete, lang }: { onComplete: (score: number) => void; lang: Language }) {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; caught: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameActive, setGameActive] = useState(true);
  const t = translations[lang];

  useEffect(() => {
    if (!gameActive) return;
    
    const starInterval = setInterval(() => {
      setStars(prev => [
        ...prev.filter(s => !s.caught),
        { id: Date.now(), x: Math.random() * 80 + 10, y: Math.random() * 60 + 20, caught: false }
      ].slice(-8));
    }, 800);

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameActive(false);
          clearInterval(starInterval);
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => { clearInterval(starInterval); clearInterval(timer); };
  }, [gameActive]);

  useEffect(() => {
    if (!gameActive && timeLeft === 0) {
      setTimeout(() => onComplete(score), 1500);
    }
  }, [gameActive, timeLeft, score, onComplete]);

  const catchStar = (id: number) => {
    setStars(prev => prev.map(s => s.id === id ? { ...s, caught: true } : s));
    setScore(s => s + 10);
  };

  return (
    <div className="mini-game-overlay">
      <div className="mini-game-container glass-card">
        <div className="mini-game-header">
          <span className="mini-game-title">⭐ {t.miniGame}</span>
          <span className="mini-game-timer">⏱️ {timeLeft}s</span>
          <span className="mini-game-score">{t.score}: {score}</span>
        </div>
        <div className="mini-game-area">
          {gameActive && <p className="tap-hint">{t.tapToPlay}</p>}
          {stars.map(star => !star.caught && (
            <button
              key={star.id}
              className="star-target"
              style={{ left: `${star.x}%`, top: `${star.y}%` }}
              onClick={() => catchStar(star.id)}
            >
              ⭐
            </button>
          ))}
          {!gameActive && (
            <div className="mini-game-result">
              <span className="result-emoji">🎉</span>
              <span className="result-score">{score} {t.score}!</span>
              <span className="result-coins">+{Math.floor(score / 2)} ✨</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== FISH TANK MINI-GAME (T1208) ====================
// Interactive fish tank: feed fish, collect coins, watch them swim!
interface FishTankFish {
  id: number;
  x: number;
  y: number;
  emoji: string;
  speed: number;
  direction: number; // angle in radians
  size: number;
  hasCoins: boolean;
  hunger: number; // 0-100
}

interface FishTankState {
  fish: FishTankFish[];
  coins: Array<{ id: number; x: number; y: number }>;
  food: Array<{ id: number; x: number; y: number }>;
  totalCoinsCollected: number;
  feedCount: number;
}

function FishTankMiniGame({ 
  lang, 
  onCollectCoins, 
  onFeedFish,
  onClose 
}: { 
  lang: Language;
  onCollectCoins: (coins: number) => void;
  onFeedFish: () => void;
  onClose: () => void;
}) {
  const FISH_TYPES = ['🐠', '🐟', '🐡', '🦈', '🐙', '🦑', '🦐', '🦀'];
  const TANK_DECORATIONS = ['🪸', '🌿', '🪨', '🐚', '⚓'];
  
  const [tankState, setTankState] = useState<FishTankState>(() => {
    // Initialize with 4-6 random fish
    const numFish = 4 + Math.floor(Math.random() * 3);
    const fish: FishTankFish[] = Array.from({ length: numFish }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 20 + Math.random() * 50,
      emoji: FISH_TYPES[Math.floor(Math.random() * 5)], // Common fish only initially
      speed: 0.3 + Math.random() * 0.4,
      direction: Math.random() * Math.PI * 2,
      size: 0.8 + Math.random() * 0.4,
      hasCoins: Math.random() < 0.3, // 30% chance to have coins ready
      hunger: 50 + Math.random() * 50,
    }));
    return { fish, coins: [], food: [], totalCoinsCollected: 0, feedCount: 0 };
  });
  
  const [feedCooldown, setFeedCooldown] = useState(false);
  const [showMessage, setShowMessage] = useState<string | null>(null);
  
  // Translations for fish tank
  const texts = {
    title: lang === 'it' ? 'Acquario 🐠' : 'Fish Tank 🐠',
    feed: lang === 'it' ? '🍞 Dai da Mangiare' : '🍞 Feed Fish',
    collect: lang === 'it' ? 'Tocca i pesci per le monete!' : 'Tap fish for coins!',
    coinsCollected: lang === 'it' ? 'Monete raccolte' : 'Coins collected',
    feeding: lang === 'it' ? 'Gnam gnam! 🐟' : 'Yum yum! 🐟',
    cooldown: lang === 'it' ? 'Aspetta un po\'...' : 'Wait a bit...',
    coinGet: lang === 'it' ? '+1 ✨' : '+1 ✨',
    close: lang === 'it' ? 'Chiudi' : 'Close',
    fishHappy: lang === 'it' ? 'I pesci sono felici!' : 'Fish are happy!',
  };

  // Animate fish swimming
  useEffect(() => {
    const interval = setInterval(() => {
      setTankState(prev => {
        const newFish = prev.fish.map(fish => {
          // Occasionally change direction
          let newDirection = fish.direction;
          if (Math.random() < 0.02) {
            newDirection = fish.direction + (Math.random() - 0.5) * Math.PI / 2;
          }
          
          // Move fish
          let newX = fish.x + Math.cos(newDirection) * fish.speed;
          let newY = fish.y + Math.sin(newDirection) * fish.speed;
          
          // Bounce off walls
          if (newX < 5 || newX > 95) {
            newDirection = Math.PI - newDirection;
            newX = Math.max(5, Math.min(95, newX));
          }
          if (newY < 15 || newY > 75) {
            newDirection = -newDirection;
            newY = Math.max(15, Math.min(75, newY));
          }
          
          // Random coin generation (happy fed fish produce coins)
          const producesCoins = fish.hunger > 70 && Math.random() < 0.005;
          
          return {
            ...fish,
            x: newX,
            y: newY,
            direction: newDirection,
            hasCoins: fish.hasCoins || producesCoins,
            hunger: Math.max(0, fish.hunger - 0.05), // Slowly get hungry
          };
        });
        
        // Animate food falling
        const newFood = prev.food
          .map(f => ({ ...f, y: f.y + 0.5 }))
          .filter(f => f.y < 80);
        
        // Fish eat nearby food
        let updatedFish = newFish;
        let remainingFood = newFood;
        
        newFood.forEach(food => {
          const nearbyFish = updatedFish.find(fish => 
            Math.abs(fish.x - food.x) < 8 && Math.abs(fish.y - food.y) < 8
          );
          if (nearbyFish) {
            updatedFish = updatedFish.map(f => 
              f.id === nearbyFish.id 
                ? { ...f, hunger: Math.min(100, f.hunger + 20), hasCoins: true }
                : f
            );
            remainingFood = remainingFood.filter(f => f.id !== food.id);
          }
        });
        
        // Animate coins floating up
        const newCoins = prev.coins
          .map(c => ({ ...c, y: c.y - 0.3 }))
          .filter(c => c.y > 5);
        
        return { ...prev, fish: updatedFish, food: remainingFood, coins: newCoins };
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  // Handle feeding fish
  const handleFeed = () => {
    if (feedCooldown) {
      setShowMessage(texts.cooldown);
      setTimeout(() => setShowMessage(null), 1000);
      return;
    }
    
    // Drop food from top
    const newFood = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: 20 + Math.random() * 60,
      y: 10,
    }));
    
    setTankState(prev => ({ 
      ...prev, 
      food: [...prev.food, ...newFood],
      feedCount: prev.feedCount + 1,
    }));
    
    setShowMessage(texts.feeding);
    setTimeout(() => setShowMessage(null), 1500);
    
    setFeedCooldown(true);
    setTimeout(() => setFeedCooldown(false), 3000);
    
    onFeedFish();
  };

  // Handle collecting coins from fish
  const handleFishClick = (fishId: number) => {
    setTankState(prev => {
      const fish = prev.fish.find(f => f.id === fishId);
      if (!fish?.hasCoins) return prev;
      
      // Spawn coin animation
      const newCoin = { id: Date.now(), x: fish.x, y: fish.y };
      
      return {
        ...prev,
        fish: prev.fish.map(f => 
          f.id === fishId ? { ...f, hasCoins: false } : f
        ),
        coins: [...prev.coins, newCoin],
        totalCoinsCollected: prev.totalCoinsCollected + 1,
      };
    });
    
    setShowMessage(texts.coinGet);
    setTimeout(() => setShowMessage(null), 800);
    onCollectCoins(1);
  };

  // Calculate average fish happiness
  const avgHappiness = tankState.fish.reduce((sum, f) => sum + f.hunger, 0) / tankState.fish.length;

  return (
    <motion.div 
      className="fish-tank-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="fish-tank-modal glass-card"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="fish-tank-header">
          <h2 className="fish-tank-title">{texts.title}</h2>
          <div className="fish-tank-stats">
            <span className="fish-tank-coins">✨ {tankState.totalCoinsCollected}</span>
            <span className="fish-tank-happiness" title={texts.fishHappy}>
              {avgHappiness > 70 ? '😊' : avgHappiness > 40 ? '😐' : '😢'}
            </span>
          </div>
          <button className="fish-tank-close" onClick={onClose}>✕</button>
        </div>
        
        {/* Message popup */}
        <AnimatePresence>
          {showMessage && (
            <motion.div 
              className="fish-tank-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {showMessage}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* The tank itself */}
        <div className="fish-tank-container">
          {/* Water effect */}
          <div className="fish-tank-water">
            <div className="fish-tank-bubbles">
              {[...Array(8)].map((_, i) => (
                <motion.span
                  key={i}
                  className="bubble"
                  initial={{ y: 100, x: 10 + Math.random() * 80, opacity: 0.6 }}
                  animate={{ 
                    y: -20, 
                    opacity: [0.6, 0.8, 0],
                    x: 10 + Math.random() * 80 + (Math.random() - 0.5) * 20,
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 2, 
                    repeat: Infinity, 
                    delay: i * 0.5,
                    ease: 'easeOut',
                  }}
                >
                  ○
                </motion.span>
              ))}
            </div>
            
            {/* Tank decorations */}
            <div className="fish-tank-decorations">
              {TANK_DECORATIONS.map((deco, i) => (
                <span 
                  key={i} 
                  className="tank-decoration"
                  style={{ 
                    left: `${10 + i * 20}%`, 
                    bottom: '5%',
                    fontSize: '1.5rem',
                  }}
                >
                  {deco}
                </span>
              ))}
            </div>
            
            {/* Food particles */}
            {tankState.food.map(food => (
              <motion.span
                key={food.id}
                className="fish-food"
                style={{ left: `${food.x}%`, top: `${food.y}%` }}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
              >
                🍞
              </motion.span>
            ))}
            
            {/* Coins floating up */}
            {tankState.coins.map(coin => (
              <motion.span
                key={coin.id}
                className="fish-coin"
                style={{ left: `${coin.x}%`, top: `${coin.y}%` }}
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                ✨
              </motion.span>
            ))}
            
            {/* The fish! */}
            {tankState.fish.map(fish => (
              <motion.button
                key={fish.id}
                className={`tank-fish ${fish.hasCoins ? 'has-coins' : ''}`}
                style={{ 
                  left: `${fish.x}%`, 
                  top: `${fish.y}%`,
                  fontSize: `${fish.size * 2}rem`,
                  transform: `scaleX(${Math.cos(fish.direction) < 0 ? -1 : 1})`,
                }}
                onClick={() => handleFishClick(fish.id)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                {fish.emoji}
                {fish.hasCoins && (
                  <motion.span 
                    className="fish-coin-indicator"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ✨
                  </motion.span>
                )}
              </motion.button>
            ))}
          </div>
          
          {/* Tank frame */}
          <div className="fish-tank-frame" />
        </div>
        
        {/* Hint text */}
        <p className="fish-tank-hint">{texts.collect}</p>
        
        {/* Feed button */}
        <motion.button 
          className={`fish-tank-feed-btn ${feedCooldown ? 'cooldown' : ''}`}
          onClick={handleFeed}
          whileHover={!feedCooldown ? { scale: 1.05 } : {}}
          whileTap={!feedCooldown ? { scale: 0.95 } : {}}
        >
          {texts.feed}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ==================== ACHIEVEMENT POPUP ====================
function AchievementPopup({ achievement, lang, onClose }: { achievement: Achievement; lang: Language; onClose: () => void }) {
  const t = translations[lang];
  
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="achievement-popup glass-card" onClick={onClose}>
      <span className="achievement-icon">{achievement.icon}</span>
      <div className="achievement-info">
        <span className="achievement-title">{t.messages.achievementUnlocked}</span>
        <span className="achievement-name">{t.achievements[achievement.id as keyof typeof t.achievements]}</span>
      </div>
    </div>
  );
}

// ==================== EVOLUTION POPUP (T1173) ====================
function EvolutionPopup({ 
  evolution, 
  petName, 
  lang, 
  onClose 
}: { 
  evolution: EvolutionInfo; 
  petName: string;
  lang: Language; 
  onClose: () => void 
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const evolutionText = {
    baby: { it: 'è nato!', en: 'is born!' },
    kitten: { it: 'è cresciuto!', en: 'has grown!' },
    adult: { it: 'è diventato adulto!', en: 'is now an adult!' },
  };

  return (
    <motion.div 
      className="evolution-popup-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="evolution-popup glass-card"
        initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
        animate={{ 
          scale: [0.3, 1.2, 1], 
          opacity: 1, 
          rotate: [-10, 5, 0] 
        }}
        transition={{ 
          type: 'spring', 
          damping: 12, 
          stiffness: 200,
          duration: 0.6 
        }}
        onClick={e => e.stopPropagation()}
      >
        <motion.div 
          className="evolution-sparkles"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          {['✨', '⭐', '🌟', '💫'].map((s, i) => (
            <motion.span 
              key={i} 
              className="evolution-sparkle"
              style={{ 
                position: 'absolute',
                left: `${50 + 40 * Math.cos(i * Math.PI / 2)}%`,
                top: `${50 + 40 * Math.sin(i * Math.PI / 2)}%`,
              }}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.3 
              }}
            >
              {s}
            </motion.span>
          ))}
        </motion.div>
        
        <motion.span 
          className="evolution-emoji"
          animate={{ 
            scale: [1, 1.3, 1],
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 0.8, 
            repeat: Infinity, 
            repeatType: 'reverse' 
          }}
        >
          {evolution.emoji}
        </motion.span>
        
        <h2 className="evolution-title">
          🎉 {lang === 'it' ? 'Evoluzione!' : 'Evolution!'} 🎉
        </h2>
        
        <p className="evolution-message">
          {petName} {evolutionText[evolution.stage][lang]}
        </p>
        
        <p className="evolution-stage-name">
          {evolution.label[lang]}
        </p>
        
        <motion.button 
          className="evolution-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
        >
          {lang === 'it' ? 'Fantastico!' : 'Awesome!'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ==================== ROOM UNLOCK POPUP (T1168) ====================
function RoomUnlockPopup({ roomKey, roomIcon, lang, onClose }: { 
  roomKey: RoomKey; 
  roomIcon: string; 
  lang: Language; 
  onClose: () => void 
}) {
  const t = translations[lang];
  
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const roomName = t.rooms[roomKey];
  const unlockText = lang === 'it' ? 'Nuova stanza sbloccata!' : 'New room unlocked!';

  return (
    <motion.div 
      className="room-unlock-popup glass-card"
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', damping: 15, stiffness: 300 }}
      onClick={onClose}
    >
      <motion.span 
        className="room-unlock-icon"
        initial={{ rotate: -15, scale: 0.5 }}
        animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {roomIcon}
      </motion.span>
      <div className="room-unlock-info">
        <span className="room-unlock-title">✨ {unlockText}</span>
        <span className="room-unlock-name">{roomName}</span>
      </div>
      <motion.div 
        className="room-unlock-sparkles"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className="sparkle s1">✦</span>
        <span className="sparkle s2">⭐</span>
        <span className="sparkle s3">✧</span>
      </motion.div>
    </motion.div>
  );
}

// ==================== WELCOME BACK POPUP ====================
function WelcomeBackPopup({ message, emoji, hoursAway, totalVisits, lang, onClose }: { 
  message: string; 
  emoji: string; 
  hoursAway: number;
  totalVisits: number;
  lang: Language; 
  onClose: () => void 
}) {
  const formatTimeAway = () => {
    if (hoursAway < 1) {
      const minutes = Math.round(hoursAway * 60);
      return lang === 'it' ? `${minutes} minuti` : `${minutes} minutes`;
    }
    if (hoursAway < 24) {
      const hours = Math.round(hoursAway);
      return lang === 'it' ? `${hours} ore` : `${hours} hours`;
    }
    const days = Math.round(hoursAway / 24);
    return lang === 'it' ? `${days} giorni` : `${days} days`;
  };

  return (
    <motion.div 
      className="welcome-back-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="welcome-back-popup glass-card"
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={e => e.stopPropagation()}
      >
        <span className="welcome-emoji">{emoji}</span>
        <h2 className="welcome-title">{message}</h2>
        <p className="welcome-time">
          {lang === 'it' ? `Eri via da ${formatTimeAway()}` : `You were away for ${formatTimeAway()}`}
        </p>
        <p className="welcome-visits">
          {lang === 'it' ? `Visita #${totalVisits}` : `Visit #${totalVisits}`} 
          <span className="visit-star">⭐</span>
        </p>
        {hoursAway >= 24 && (
          <p className="welcome-warning">
            {lang === 'it' 
              ? '⚠️ Luna aveva fame e si sentiva sola!' 
              : '⚠️ Luna was hungry and lonely!'}
          </p>
        )}
        <button className="welcome-btn" onClick={onClose}>
          {lang === 'it' ? '🐱 Ciao Luna!' : '🐱 Hi Luna!'}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ==================== PET NAMING MODAL ====================
function PetNamingModal({ lang, onConfirm }: { lang: Language; onConfirm: (name: string) => void }) {
  const [name, setName] = useState('');
  const t = translations[lang];
  
  const handleConfirm = () => {
    const finalName = name.trim() || 'Pip';
    onConfirm(finalName);
  };
  
  const handleSkip = () => {
    onConfirm('Pip');
  };
  
  return (
    <motion.div 
      className="pet-naming-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="pet-naming-modal glass-card"
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <span className="pet-naming-emoji">🐱✨</span>
        <h2 className="pet-naming-title">{t.petNaming.title}</h2>
        <input
          type="text"
          className="pet-naming-input"
          placeholder={t.petNaming.placeholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
        />
        <div className="pet-naming-buttons">
          <button className="pet-naming-btn confirm" onClick={handleConfirm}>
            {t.petNaming.confirm}
          </button>
          <button className="pet-naming-btn skip" onClick={handleSkip}>
            {t.petNaming.skip}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== PET RENAME MODAL (T1207) ====================
// Allows users to rename their pet after initial naming
function PetRenameModal({ 
  lang, 
  currentName, 
  onConfirm, 
  onCancel 
}: { 
  lang: Language; 
  currentName: string; 
  onConfirm: (name: string) => void; 
  onCancel: () => void;
}) {
  const [name, setName] = useState(currentName);
  const t = translations[lang];
  
  const handleConfirm = () => {
    const finalName = name.trim() || currentName;
    if (finalName !== currentName) {
      onConfirm(finalName);
    } else {
      onCancel();
    }
  };
  
  return (
    <motion.div 
      className="pet-naming-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <motion.div 
        className="pet-naming-modal glass-card"
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <span className="pet-naming-emoji">✏️🐱</span>
        <h2 className="pet-naming-title">{t.petRename.title}</h2>
        <p className="pet-rename-subtitle">{t.petRename.subtitle}</p>
        <input
          type="text"
          className="pet-naming-input"
          placeholder={t.petRename.placeholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm();
            if (e.key === 'Escape') onCancel();
          }}
        />
        <div className="pet-naming-buttons">
          <button className="pet-naming-btn confirm" onClick={handleConfirm}>
            {t.petRename.confirm}
          </button>
          <button className="pet-naming-btn skip" onClick={onCancel}>
            {t.petRename.cancel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== DAILY REWARD POPUP ====================
function DailyRewardPopup({ coins, streak, lang, onClose }: { coins: number; streak: number; lang: Language; onClose: () => void }) {
  const t = translations[lang];
  
  return (
    <div className="daily-reward-overlay" onClick={onClose}>
      <div className="daily-reward-popup glass-card">
        <span className="reward-icon">🎁</span>
        <span className="reward-title">{t.messages.dailyReward.replace('{coins}', String(coins))}</span>
        <span className="reward-streak">🔥 {streak} {lang === 'it' ? 'giorni di fila!' : 'day streak!'}</span>
        <button className="reward-claim-btn">
          {lang === 'it' ? 'Riscuoti!' : 'Claim!'}
        </button>
      </div>
    </div>
  );
}

// ==================== WEATHER WIDGET (T1203) ====================
// Shows real weather for immersive gameplay
// Types imported from useWeather hook at top of file

function WeatherWidget({ 
  weather, 
  isLoading, 
  lang,
  compact = false 
}: { 
  weather: WeatherData; 
  isLoading: boolean;
  lang: Language;
  compact?: boolean;
}) {
  // Weather-specific backgrounds and effects
  const getWeatherGradient = (condition: WeatherCondition): string => {
    const gradients: Record<WeatherCondition, string> = {
      clear: 'linear-gradient(135deg, #87CEEB 0%, #FFD700 100%)',
      cloudy: 'linear-gradient(135deg, #a8b4c4 0%, #d4dbe6 100%)',
      rain: 'linear-gradient(135deg, #4a6b8a 0%, #7a9bb8 100%)',
      storm: 'linear-gradient(135deg, #2c3e50 0%, #4a5568 100%)',
      snow: 'linear-gradient(135deg, #e8f4fc 0%, #cde5f5 100%)',
      hot: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
      windy: 'linear-gradient(135deg, #89CFF0 0%, #a8e6cf 100%)',
    };
    return gradients[condition];
  };

  const getWeatherAnimation = (condition: WeatherCondition): string => {
    const animations: Record<WeatherCondition, string> = {
      clear: 'weather-sunny',
      cloudy: 'weather-cloudy',
      rain: 'weather-rain',
      storm: 'weather-storm',
      snow: 'weather-snow',
      hot: 'weather-hot',
      windy: 'weather-windy',
    };
    return animations[condition];
  };

  const getWeatherEmoji = (condition: WeatherCondition): string => {
    const emojis: Record<WeatherCondition, string> = {
      clear: '☀️',
      cloudy: '☁️',
      rain: '🌧️',
      storm: '⛈️',
      snow: '❄️',
      hot: '🔥',
      windy: '💨',
    };
    return emojis[condition];
  };

  const getWeatherLabel = (condition: WeatherCondition, lang: Language): string => {
    const labels: Record<WeatherCondition, { it: string; en: string }> = {
      clear: { it: 'Sereno', en: 'Clear' },
      cloudy: { it: 'Nuvoloso', en: 'Cloudy' },
      rain: { it: 'Pioggia', en: 'Rain' },
      storm: { it: 'Temporale', en: 'Storm' },
      snow: { it: 'Neve', en: 'Snow' },
      hot: { it: 'Caldo', en: 'Hot' },
      windy: { it: 'Ventoso', en: 'Windy' },
    };
    return labels[condition][lang];
  };

  // Compact version for headers
  if (compact) {
    return (
      <motion.div 
        className="weather-widget-compact glass-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        title={`${getWeatherLabel(weather.condition, lang)} ${weather.temperature}°C`}
      >
        <span className={`weather-icon-compact ${getWeatherAnimation(weather.condition)}`}>
          {getWeatherEmoji(weather.condition)}
        </span>
        <span className="weather-temp-compact">{weather.temperature}°</span>
      </motion.div>
    );
  }

  // Full weather widget
  return (
    <motion.div 
      className={`weather-widget glass-card ${getWeatherAnimation(weather.condition)}`}
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, type: 'spring', damping: 15 }}
      style={{ background: getWeatherGradient(weather.condition) }}
    >
      {/* Weather effects overlay */}
      <div className="weather-effects">
        {weather.condition === 'rain' && (
          <>
            {[...Array(15)].map((_, i) => (
              <motion.span
                key={i}
                className="rain-drop"
                initial={{ y: -20, x: Math.random() * 100, opacity: 0.7 }}
                animate={{ y: 100, opacity: 0 }}
                transition={{
                  duration: 0.8 + Math.random() * 0.4,
                  repeat: Infinity,
                  delay: Math.random() * 1,
                  ease: 'linear',
                }}
                style={{ left: `${Math.random() * 100}%` }}
              >
                💧
              </motion.span>
            ))}
          </>
        )}
        {weather.condition === 'snow' && (
          <>
            {[...Array(12)].map((_, i) => (
              <motion.span
                key={i}
                className="snow-flake"
                initial={{ y: -20, x: Math.random() * 100, opacity: 0.9 }}
                animate={{ 
                  y: 100, 
                  x: `${Math.random() * 100}%`,
                  rotate: 360,
                  opacity: 0 
                }}
                transition={{
                  duration: 2 + Math.random() * 1.5,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'linear',
                }}
                style={{ left: `${Math.random() * 100}%` }}
              >
                ❄️
              </motion.span>
            ))}
          </>
        )}
        {weather.condition === 'storm' && (
          <motion.span
            className="lightning"
            animate={{ 
              opacity: [0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          >
            ⚡
          </motion.span>
        )}
      </div>

      {/* Main weather display */}
      <div className="weather-main">
        <motion.span 
          className="weather-icon"
          animate={
            weather.condition === 'clear' ? { rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] } :
            weather.condition === 'windy' ? { x: [-5, 5, -5], rotate: [-10, 10, -10] } :
            weather.condition === 'hot' ? { scale: [1, 1.15, 1], filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'] } :
            {}
          }
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {getWeatherEmoji(weather.condition)}
        </motion.span>
        <div className="weather-info">
          <span className="weather-temp">{weather.temperature}°C</span>
          <span className="weather-label">{getWeatherLabel(weather.condition, lang)}</span>
        </div>
      </div>

      {/* Weather details */}
      <div className="weather-details">
        <span className="weather-detail" title={lang === 'it' ? 'Umidità' : 'Humidity'}>
          💧 {Math.round(weather.humidity)}%
        </span>
        <span className="weather-detail" title={lang === 'it' ? 'Vento' : 'Wind'}>
          💨 {Math.round(weather.windSpeed)} km/h
        </span>
      </div>

      {/* Real vs story weather indicator */}
      <div className="weather-source">
        {weather.isRealWeather ? (
          <span className="weather-real">📍 {lang === 'it' ? 'Meteo reale' : 'Real weather'}</span>
        ) : (
          <span className="weather-story">✨ {lang === 'it' ? 'Meteo magico' : 'Magic weather'}</span>
        )}
        {isLoading && <span className="weather-loading">...</span>}
      </div>
    </motion.div>
  );
}

// ==================== WINDOW VIEW COMPONENT (T1209) ====================
// Decorative window showing day/night sky in rooms
function WindowView({ timeOfDay, room }: { timeOfDay: TimeOfDay; room: RoomKey }) {
  // Only show window in certain rooms (interior rooms with windows)
  const roomsWithWindows: RoomKey[] = ['bedroom', 'living', 'kitchen', 'library', 'attic'];
  if (!roomsWithWindows.includes(room)) return null;

  // Sky gradients for different times of day
  const getSkyGradient = () => {
    switch (timeOfDay) {
      case 'morning':
        return 'linear-gradient(180deg, #87CEEB 0%, #FFE4B5 50%, #FFDAB9 100%)';
      case 'afternoon':
        return 'linear-gradient(180deg, #1E90FF 0%, #87CEEB 50%, #B0E0E6 100%)';
      case 'evening':
        return 'linear-gradient(180deg, #FF6B6B 0%, #FF8C42 30%, #FFD93D 60%, #6BCB77 100%)';
      case 'night':
        return 'linear-gradient(180deg, #0D1B2A 0%, #1B263B 40%, #415A77 100%)';
    }
  };

  // Get sun/moon position based on time
  const getCelestialBody = () => {
    switch (timeOfDay) {
      case 'morning':
        return { icon: '🌅', position: { bottom: '15%', left: '20%' }, size: '2rem' };
      case 'afternoon':
        return { icon: '☀️', position: { top: '20%', left: '50%' }, size: '2.5rem' };
      case 'evening':
        return { icon: '🌇', position: { bottom: '10%', right: '25%' }, size: '2rem' };
      case 'night':
        return { icon: '🌙', position: { top: '15%', right: '25%' }, size: '2rem' };
    }
  };

  const celestial = getCelestialBody();

  // Window frame position varies by room
  const getWindowPosition = () => {
    switch (room) {
      case 'bedroom':
        return { top: '8%', right: '8%' };
      case 'living':
        return { top: '10%', left: '15%' };
      case 'kitchen':
        return { top: '12%', right: '12%' };
      case 'library':
        return { top: '15%', left: '8%' };
      case 'attic':
        return { top: '5%', left: '50%', transform: 'translateX(-50%)' };
      default:
        return { top: '10%', right: '10%' };
    }
  };

  const windowPos = getWindowPosition();

  return (
    <motion.div
      className="window-view-container"
      style={{
        position: 'absolute',
        ...windowPos,
        width: room === 'attic' ? '100px' : '120px',
        height: room === 'attic' ? '80px' : '140px',
        borderRadius: room === 'attic' ? '50px 50px 0 0' : '8px',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3), 0 4px 15px rgba(0,0,0,0.2)',
        border: '6px solid #8B4513',
        zIndex: 5,
        pointerEvents: 'none',
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Sky background */}
      <div
        className="window-sky"
        style={{
          position: 'absolute',
          inset: 0,
          background: getSkyGradient(),
          transition: 'background 2s ease',
        }}
      />

      {/* Stars (visible at night and evening) */}
      {(timeOfDay === 'night' || timeOfDay === 'evening') && (
        <div className="window-stars" style={{ position: 'absolute', inset: 0 }}>
          {[...Array(timeOfDay === 'night' ? 12 : 5)].map((_, i) => (
            <motion.span
              key={i}
              style={{
                position: 'absolute',
                left: `${10 + Math.random() * 80}%`,
                top: `${5 + Math.random() * 50}%`,
                fontSize: `${0.3 + Math.random() * 0.4}rem`,
                color: 'white',
                textShadow: '0 0 4px white',
              }}
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 1.5 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              ✦
            </motion.span>
          ))}
        </div>
      )}

      {/* Celestial body (sun/moon) */}
      <motion.span
        style={{
          position: 'absolute',
          ...celestial.position,
          fontSize: celestial.size,
          filter: timeOfDay === 'afternoon' ? 'drop-shadow(0 0 10px rgba(255,200,0,0.8))' : 'drop-shadow(0 0 8px rgba(255,255,200,0.6))',
        }}
        animate={
          timeOfDay === 'afternoon'
            ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
            : timeOfDay === 'night'
            ? { y: [0, -3, 0] }
            : {}
        }
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {celestial.icon}
      </motion.span>

      {/* Floating clouds (daytime only) */}
      {(timeOfDay === 'morning' || timeOfDay === 'afternoon') && (
        <>
          <motion.span
            style={{
              position: 'absolute',
              top: '20%',
              fontSize: '1.2rem',
              opacity: 0.9,
            }}
            animate={{ x: ['-20%', '120%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            ☁️
          </motion.span>
          <motion.span
            style={{
              position: 'absolute',
              top: '40%',
              fontSize: '0.9rem',
              opacity: 0.7,
            }}
            animate={{ x: ['120%', '-20%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear', delay: 5 }}
          >
            ☁️
          </motion.span>
        </>
      )}

      {/* Evening/night clouds (darker) */}
      {timeOfDay === 'evening' && (
        <motion.span
          style={{
            position: 'absolute',
            bottom: '30%',
            fontSize: '1rem',
            opacity: 0.6,
            filter: 'brightness(0.7) hue-rotate(-20deg)',
          }}
          animate={{ x: ['-10%', '110%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          ☁️
        </motion.span>
      )}

      {/* Window frame cross */}
      {room !== 'attic' && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              width: '4px',
              height: '100%',
              background: '#8B4513',
              transform: 'translateX(-50%)',
              boxShadow: 'inset 0 0 3px rgba(0,0,0,0.3)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: '100%',
              height: '4px',
              background: '#8B4513',
              transform: 'translateY(-50%)',
              boxShadow: 'inset 0 0 3px rgba(0,0,0,0.3)',
            }}
          />
        </>
      )}

      {/* Window glass reflection */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Curtain hints on sides */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '8px',
          background: 'linear-gradient(90deg, rgba(139,90,43,0.4), transparent)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '8px',
          background: 'linear-gradient(-90deg, rgba(139,90,43,0.4), transparent)',
        }}
      />
    </motion.div>
  );
}

// ==================== BIRTHDAY POPUP (T1169) ====================
function BirthdayPopup({ 
  petName, 
  age, 
  lang, 
  onClose 
}: { 
  petName: string; 
  age: { years: number; months: number; days: number }; 
  lang: Language; 
  onClose: (coins: number) => void 
}) {
  const t = translations[lang];
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);
  
  // Generate confetti on mount
  useEffect(() => {
    const colors = ['🎈', '🎊', '🎉', '⭐', '✨', '🌟', '💫', '🎀', '🎁', '🧁'];
    const newConfetti = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setConfetti(newConfetti);
  }, []);
  
  // Calculate birthday bonus (more for older pets!)
  const birthdayBonus = 50 + (age.years * 25) + (age.months * 5);
  
  // Format age string
  const formatAge = () => {
    if (age.years === 0 && age.months === 0) {
      return t.birthday.firstBirthday;
    }
    
    const parts: string[] = [];
    if (age.years > 0) {
      parts.push(age.years === 1 
        ? t.birthday.ageYears.replace('{years}', '1')
        : t.birthday.ageYearsPlural.replace('{years}', String(age.years))
      );
    }
    if (age.months > 0 && age.years < 2) {
      parts.push(age.months === 1 
        ? t.birthday.ageMonths.replace('{months}', '1')
        : t.birthday.ageMonthsPlural.replace('{months}', String(age.months))
      );
    }
    
    return t.birthday.age
      .replace('{name}', petName)
      .replace('{age}', parts.join(lang === 'it' ? ' e ' : ' and '));
  };

  return (
    <motion.div 
      className="birthday-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Confetti rain */}
      {confetti.map(c => (
        <motion.span
          key={c.id}
          className="birthday-confetti"
          initial={{ y: -50, x: `${c.x}%`, opacity: 1, rotate: 0 }}
          animate={{ 
            y: '110vh', 
            opacity: [1, 1, 0.8, 0],
            rotate: [0, 180, 360, 540],
          }}
          transition={{ 
            duration: 4 + Math.random() * 2, 
            delay: c.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'fixed',
            top: 0,
            fontSize: '1.5rem',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          {c.color}
        </motion.span>
      ))}
      
      <motion.div 
        className="birthday-popup glass-card"
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
      >
        {/* Birthday cake with candles */}
        <motion.div 
          className="birthday-cake"
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: 'easeInOut',
          }}
        >
          🎂
        </motion.div>
        
        {/* Floating balloons */}
        <div className="birthday-balloons">
          {['🎈', '🎈', '🎈'].map((balloon, i) => (
            <motion.span
              key={i}
              animate={{ 
                y: [0, -10, 0],
                x: [0, i === 1 ? 5 : -5, 0],
              }}
              transition={{ 
                duration: 2 + i * 0.3, 
                repeat: Infinity, 
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
              style={{ 
                display: 'inline-block',
                fontSize: '2rem',
                filter: i === 0 ? 'hue-rotate(0deg)' : i === 1 ? 'hue-rotate(120deg)' : 'hue-rotate(240deg)',
              }}
            >
              {balloon}
            </motion.span>
          ))}
        </div>
        
        <h2 className="birthday-title">{t.birthday.title}</h2>
        
        <motion.div 
          className="birthday-pet"
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        >
          🐱
          <span className="birthday-hat">🎉</span>
        </motion.div>
        
        <p className="birthday-message">
          {t.birthday.message.replace('{name}', petName)}
        </p>
        
        <p className="birthday-age">{formatAge()}</p>
        
        <div className="birthday-reward">
          <span className="reward-sparkle">✨</span>
          <span>{t.birthday.reward.replace('{coins}', String(birthdayBonus))}</span>
          <span className="reward-sparkle">✨</span>
        </div>
        
        <motion.button 
          className="birthday-btn"
          onClick={() => onClose(birthdayBonus)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t.birthday.celebrate}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ==================== WARDROBE COMPONENT ====================
function WardrobeModal({ 
  lang, 
  costumes: costumeState, 
  playerLevel, 
  playerCoins,
  onUnlock, 
  onEquip,
  onUnlockEyeColor, // T1333: Eye color unlock callback
  onSelectEyeColor, // T1333: Eye color select callback
  onClose 
}: { 
  lang: Language; 
  costumes: CostumeState;
  playerLevel: number;
  playerCoins: number;
  onUnlock: (costumeId: string, cost: number) => void;
  onEquip: (costumeId: string, category: CostumeCategory) => void;
  onUnlockEyeColor: (eyeColorId: string, cost: number) => void; // T1333
  onSelectEyeColor: (eyeColorId: string) => void; // T1333
  onClose: () => void;
}) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<WardrobeTab>('hat'); // T1333: Use WardrobeTab to include eyes
  const [message, setMessage] = useState<string | null>(null);
  
  // T1333: Get current eye color info
  const currentEyeColor = EYE_COLORS.find(e => e.id === costumeState.eyeColor) || EYE_COLORS[0];

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  };

  // T1333: Only filter costumes when not on eyes tab
  const filteredCostumes = activeTab !== 'eyes' ? COSTUMES.filter(c => c.category === activeTab) : [];

  const handleCostumeClick = (costume: Costume) => {
    const isUnlocked = costumeState.unlocked.includes(costume.id);
    const isEquipped = costumeState.equipped[costume.category] === costume.id;
    const canAfford = playerCoins >= costume.price;
    const meetsLevel = !costume.unlockLevel || playerLevel >= costume.unlockLevel;

    if (isEquipped) {
      // Unequip
      onEquip('', costume.category);
    } else if (isUnlocked) {
      // Equip
      onEquip(costume.id, costume.category);
    } else if (!meetsLevel) {
      // Level locked
      showMessage(t.wardrobe.levelRequired.replace('{level}', String(costume.unlockLevel)));
    } else if (!canAfford) {
      // Not enough coins
      showMessage(t.wardrobe.notEnoughCoins);
    } else {
      // Unlock
      onUnlock(costume.id, costume.price);
      showMessage(t.wardrobe.unlocked);
    }
  };

  // T1333: Handle eye color click
  const handleEyeColorClick = (eyeColor: EyeColor) => {
    const isUnlocked = costumeState.unlockedEyeColors?.includes(eyeColor.id) || eyeColor.price === 0;
    const isSelected = costumeState.eyeColor === eyeColor.id;
    const canAfford = playerCoins >= eyeColor.price;
    const meetsLevel = !eyeColor.unlockLevel || playerLevel >= eyeColor.unlockLevel;

    if (isSelected) {
      // Already selected - show confirmation
      showMessage(t.eyeColor.selected);
    } else if (isUnlocked) {
      // Select this eye color
      onSelectEyeColor(eyeColor.id);
      showMessage(t.eyeColor.selected);
    } else if (!meetsLevel) {
      // Level locked
      showMessage(t.eyeColor.levelRequired.replace('{level}', String(eyeColor.unlockLevel)));
    } else if (!canAfford) {
      // Not enough coins
      showMessage(t.eyeColor.notEnoughCoins);
    } else {
      // Unlock and select
      onUnlockEyeColor(eyeColor.id, eyeColor.price);
      showMessage(t.eyeColor.unlocked);
    }
  };

  return (
    <motion.div 
      className="wardrobe-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="wardrobe-modal glass-card"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="wardrobe-header">
          <h2 className="wardrobe-title">👗 {t.wardrobe.title}</h2>
          <button className="wardrobe-close" onClick={onClose}>✕</button>
        </div>

        <div className="wardrobe-tabs">
          <button 
            className={`wardrobe-tab ${activeTab === 'hat' ? 'active' : ''}`}
            onClick={() => setActiveTab('hat')}
          >
            🎩 {t.wardrobe.hats}
          </button>
          <button 
            className={`wardrobe-tab ${activeTab === 'accessory' ? 'active' : ''}`}
            onClick={() => setActiveTab('accessory')}
          >
            🎀 {t.wardrobe.accessories}
          </button>
          <button 
            className={`wardrobe-tab ${activeTab === 'outfit' ? 'active' : ''}`}
            onClick={() => setActiveTab('outfit')}
          >
            👔 {t.wardrobe.outfits}
          </button>
          <button 
            className={`wardrobe-tab ${activeTab === 'collar' ? 'active' : ''}`}
            onClick={() => setActiveTab('collar')}
          >
            🎀 {t.wardrobe.collars}
          </button>
          {/* T1333: Eye color tab */}
          <button 
            className={`wardrobe-tab ${activeTab === 'eyes' ? 'active' : ''}`}
            onClick={() => setActiveTab('eyes')}
          >
            👁️ {t.wardrobe.eyes}
          </button>
        </div>

        <div className="wardrobe-coins">
          <span className="coin-icon">✨</span>
          <span>{playerCoins}</span>
        </div>

        {message && (
          <motion.div 
            className="wardrobe-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {message}
          </motion.div>
        )}

        {/* T1333: Eye color grid (when eyes tab selected) */}
        {activeTab === 'eyes' ? (
          <div className="wardrobe-grid eye-color-grid">
            {EYE_COLORS.map(eyeColor => {
              const isUnlocked = costumeState.unlockedEyeColors?.includes(eyeColor.id) || eyeColor.price === 0;
              const isSelected = costumeState.eyeColor === eyeColor.id;
              const meetsLevel = !eyeColor.unlockLevel || playerLevel >= eyeColor.unlockLevel;

              return (
                <button
                  key={eyeColor.id}
                  className={`costume-item eye-color-item ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'equipped' : ''} ${eyeColor.special ? 'special' : ''}`}
                  onClick={() => handleEyeColorClick(eyeColor)}
                >
                  <span 
                    className="costume-icon eye-color-preview"
                    style={{
                      background: eyeColor.id === 'rainbow' ? eyeColor.color : eyeColor.color,
                      boxShadow: `0 0 12px ${eyeColor.glowColor}`,
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isSelected ? '3px solid #fff' : '2px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    {eyeColor.icon}
                  </span>
                  <span className="costume-name">{eyeColor.name[lang]}</span>
                  {!isUnlocked && (
                    <span className="costume-price">
                      {!meetsLevel ? `🔒 Lv.${eyeColor.unlockLevel}` : eyeColor.price === 0 ? t.eyeColor.free : `${eyeColor.price} ✨`}
                    </span>
                  )}
                  {isSelected && <span className="equipped-badge">✓</span>}
                  {eyeColor.special && !isUnlocked && <span className="special-badge">⭐</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="wardrobe-grid">
            {filteredCostumes.map(costume => {
              const isUnlocked = costumeState.unlocked.includes(costume.id);
              const isEquipped = costumeState.equipped[costume.category] === costume.id;
              const meetsLevel = !costume.unlockLevel || playerLevel >= costume.unlockLevel;

              return (
                <button
                  key={costume.id}
                  className={`costume-item ${isUnlocked ? 'unlocked' : 'locked'} ${isEquipped ? 'equipped' : ''} ${costume.special ? 'special' : ''}`}
                  onClick={() => handleCostumeClick(costume)}
                >
                  <span className="costume-icon">{costume.icon}</span>
                  <span className="costume-name">{costume.name[lang]}</span>
                  {!isUnlocked && (
                    <span className="costume-price">
                      {!meetsLevel ? `🔒 Lv.${costume.unlockLevel}` : `${costume.price} ✨`}
                    </span>
                  )}
                  {isEquipped && <span className="equipped-badge">✓</span>}
                  {costume.special && !isUnlocked && <span className="special-badge">⭐</span>}
                </button>
              );
            })}
          </div>
        )}

        <div className="wardrobe-preview">
          <span className="preview-label">{lang === 'it' ? 'Anteprima:' : 'Preview:'}</span>
          <div className="preview-pet" style={{ position: 'relative' }}>
            🐱
            {/* T1333: Eye color glow on preview */}
            <span 
              className="preview-eye-glow"
              style={{
                position: 'absolute',
                top: '35%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '24px',
                height: '10px',
                background: currentEyeColor.id === 'rainbow' ? currentEyeColor.color : currentEyeColor.color,
                borderRadius: '50%',
                boxShadow: `0 0 8px ${currentEyeColor.glowColor}, 0 0 16px ${currentEyeColor.glowColor}`,
                opacity: 0.9,
                pointerEvents: 'none',
              }}
            />
            {costumeState.equipped.hat && (
              <span className="preview-hat">
                {COSTUMES.find(c => c.id === costumeState.equipped.hat)?.icon}
              </span>
            )}
            {costumeState.equipped.accessory && (
              <span className="preview-accessory">
                {COSTUMES.find(c => c.id === costumeState.equipped.accessory)?.icon}
              </span>
            )}
            {costumeState.equipped.outfit && (
              <span className="preview-outfit">
                {COSTUMES.find(c => c.id === costumeState.equipped.outfit)?.icon}
              </span>
            )}
            {costumeState.equipped.collar && (
              <span className="preview-collar">
                {COSTUMES.find(c => c.id === costumeState.equipped.collar)?.icon}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== FUR COLOR PICKER MODAL (T1332) ====================
function FurColorPickerModal({
  lang,
  currentColor,
  unlockedColors,
  playerLevel,
  playerCoins,
  onUnlock,
  onSelect,
  onClose
}: {
  lang: Language;
  currentColor: FurColorId;
  unlockedColors: FurColorId[];
  playerLevel: number;
  playerCoins: number;
  onUnlock: (colorId: FurColorId, cost: number) => void;
  onSelect: (colorId: FurColorId) => void;
  onClose: () => void;
}) {
  const t = translations[lang];
  const [message, setMessage] = useState<string | null>(null);
  const [previewColor, setPreviewColor] = useState<FurColorId>(currentColor);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  };

  const handleColorClick = (color: FurColor) => {
    const isUnlocked = unlockedColors.includes(color.id);
    const canAfford = playerCoins >= color.price;
    const meetsLevel = !color.unlockLevel || playerLevel >= color.unlockLevel;

    if (isUnlocked) {
      // Select the color
      onSelect(color.id);
      showMessage(t.furColor.selected);
    } else if (!meetsLevel) {
      // Level locked
      showMessage(t.furColor.levelRequired.replace('{level}', String(color.unlockLevel)));
    } else if (!canAfford) {
      // Not enough coins
      showMessage(t.furColor.notEnoughCoins);
    } else {
      // Unlock
      onUnlock(color.id, color.price);
      showMessage(t.furColor.unlocked);
    }
  };

  return (
    <motion.div
      className="wardrobe-overlay fur-color-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="wardrobe-modal fur-color-modal glass-card"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="wardrobe-header">
          <h2 className="wardrobe-title">{t.furColor.title}</h2>
          <button className="wardrobe-close" onClick={onClose}>✕</button>
        </div>

        <p className="fur-color-subtitle">{t.furColor.subtitle}</p>

        <div className="wardrobe-coins">
          <span className="coin-icon">✨</span>
          <span>{playerCoins}</span>
        </div>

        {message && (
          <motion.div
            className="wardrobe-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {message}
          </motion.div>
        )}

        <div className="fur-color-grid">
          {FUR_COLORS.map(color => {
            const isUnlocked = unlockedColors.includes(color.id);
            const isSelected = currentColor === color.id;
            const meetsLevel = !color.unlockLevel || playerLevel >= color.unlockLevel;

            return (
              <button
                key={color.id}
                className={`fur-color-item ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''} ${color.special ? 'special' : ''}`}
                onClick={() => handleColorClick(color)}
                onMouseEnter={() => setPreviewColor(color.id)}
                onMouseLeave={() => setPreviewColor(currentColor)}
              >
                <span className="fur-color-emoji">{color.emoji}</span>
                <span className="fur-color-name">{color.name[lang]}</span>
                {!isUnlocked && (
                  <span className="fur-color-price">
                    {!meetsLevel ? `🔒 Lv.${color.unlockLevel}` : color.price > 0 ? `${color.price} ✨` : t.furColor.select}
                  </span>
                )}
                {isSelected && <span className="selected-badge">✓</span>}
                {color.special && !isUnlocked && <span className="special-badge">⭐</span>}
              </button>
            );
          })}
        </div>

        <div className="fur-color-preview">
          <span className="preview-label">{t.furColor.preview}:</span>
          <div className="preview-pet-fur">
            <span 
              className="preview-cat-emoji"
              style={{ 
                filter: FUR_COLORS.find(c => c.id === previewColor)?.cssFilter || 'none',
                fontSize: '3rem',
              }}
            >
              🐱
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== TOY BOX MODAL (T1175) ====================
function ToyBoxModal({ 
  lang, 
  toyBox, 
  playerLevel, 
  playerCoins,
  playerEnergy,
  onUnlock, 
  onPlay,
  onSetFavorite,
  onClose 
}: { 
  lang: Language; 
  toyBox: ToyBoxState;
  playerLevel: number;
  playerCoins: number;
  playerEnergy: number;
  onUnlock: (toyId: string, cost: number) => void;
  onPlay: (toy: Toy) => void;
  onSetFavorite: (toyId: string | null) => void;
  onClose: () => void;
}) {
  const t = translations[lang];
  const [message, setMessage] = useState<string | null>(null);
  const [playingToy, setPlayingToy] = useState<string | null>(null);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  };

  const getRarityColor = (rarity: Toy['rarity']) => {
    switch (rarity) {
      case 'common': return '#8bc34a';
      case 'rare': return '#2196f3';
      case 'legendary': return '#ff9800';
    }
  };

  const handleToyClick = (toy: Toy) => {
    const isUnlocked = toyBox.unlockedToys.includes(toy.id);
    const canAfford = toy.price ? playerCoins >= toy.price : true;
    const meetsLevel = !toy.unlockLevel || playerLevel >= toy.unlockLevel;
    const hasEnergy = playerEnergy >= toy.energyCost;

    if (isUnlocked) {
      if (!hasEnergy) {
        showMessage(t.toyBox.notEnoughEnergy);
        return;
      }
      // Play with toy!
      setPlayingToy(toy.id);
      setTimeout(() => {
        setPlayingToy(null);
        onPlay(toy);
      }, 1000);
    } else if (!meetsLevel) {
      showMessage(t.toyBox.levelRequired.replace('{level}', String(toy.unlockLevel)));
    } else if (toy.unlockMethod === 'shop') {
      if (!canAfford) {
        showMessage(t.toyBox.notEnoughCoins);
      } else {
        onUnlock(toy.id, toy.price || 0);
        showMessage(t.toyBox.unlocked);
      }
    }
  };

  // Group toys by unlock status
  const unlockedToys = TOYS.filter(t => toyBox.unlockedToys.includes(t.id));
  const lockedToys = TOYS.filter(t => !toyBox.unlockedToys.includes(t.id));

  return (
    <motion.div 
      className="toybox-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="toybox-modal glass-card"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="toybox-header">
          <h2 className="toybox-title">{t.toyBox.title}</h2>
          <button className="toybox-close" onClick={onClose}>✕</button>
        </div>

        <div className="toybox-stats">
          <span className="toybox-stat">✨ {playerCoins}</span>
          <span className="toybox-stat">⚡ {Math.round(playerEnergy)}</span>
        </div>

        {message && (
          <motion.div 
            className="toybox-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {message}
          </motion.div>
        )}

        <div className="toybox-grid">
          {/* Unlocked toys first */}
          {unlockedToys.map(toy => {
            const isFavorite = toyBox.favoriteToy === toy.id;
            const isPlaying = playingToy === toy.id;
            const hasEnergy = playerEnergy >= toy.energyCost;

            return (
              <motion.button
                key={toy.id}
                className={`toy-item unlocked ${isFavorite ? 'favorite' : ''} ${isPlaying ? 'playing' : ''} ${!hasEnergy ? 'tired' : ''}`}
                onClick={() => handleToyClick(toy)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isPlaying ? {
                  rotate: toy.animation === 'spin' ? [0, 360] : 
                          toy.animation === 'wiggle' ? [-10, 10, -10] :
                          toy.animation === 'bounce' ? [0, -20, 0] : 0,
                  scale: toy.animation === 'sparkle' ? [1, 1.3, 1] : 1,
                } : {}}
                transition={isPlaying ? { duration: 0.5, repeat: 1 } : {}}
              >
                <span className="toy-icon" style={{ fontSize: '2.5rem' }}>{toy.icon}</span>
                <span className="toy-name">{toy.name[lang]}</span>
                <span className="toy-rarity" style={{ color: getRarityColor(toy.rarity) }}>
                  {t.toyBox[toy.rarity]}
                </span>
                <div className="toy-stats">
                  <span className="toy-happiness">💖 +{toy.happinessBoost}</span>
                  <span className="toy-energy">⚡ -{toy.energyCost}</span>
                </div>
                {isFavorite && <span className="favorite-badge">⭐</span>}
                <button 
                  className="favorite-btn"
                  onClick={(e) => { e.stopPropagation(); onSetFavorite(isFavorite ? null : toy.id); }}
                  title={t.toyBox.setFavorite}
                >
                  {isFavorite ? '⭐' : '☆'}
                </button>
              </motion.button>
            );
          })}

          {/* Locked toys */}
          {lockedToys.map(toy => {
            const meetsLevel = !toy.unlockLevel || playerLevel >= toy.unlockLevel;
            const canAfford = toy.price ? playerCoins >= toy.price : true;
            const canUnlock = toy.unlockMethod === 'shop' && meetsLevel && canAfford;
            const isLevelLocked = toy.unlockLevel && playerLevel < toy.unlockLevel;

            return (
              <motion.button
                key={toy.id}
                className={`toy-item locked ${canUnlock ? 'can-unlock' : ''}`}
                onClick={() => handleToyClick(toy)}
                whileHover={canUnlock ? { scale: 1.05 } : {}}
                whileTap={canUnlock ? { scale: 0.95 } : {}}
              >
                <span className="toy-icon locked-icon" style={{ fontSize: '2rem', opacity: 0.5 }}>
                  {toy.icon}
                </span>
                <span className="toy-name">{toy.name[lang]}</span>
                <span className="toy-rarity" style={{ color: getRarityColor(toy.rarity) }}>
                  {t.toyBox[toy.rarity]}
                </span>
                {isLevelLocked ? (
                  <span className="toy-lock">🔒 Lv.{toy.unlockLevel}</span>
                ) : toy.unlockMethod === 'shop' ? (
                  <span className={`toy-price ${canAfford ? '' : 'expensive'}`}>
                    {toy.price} ✨
                  </span>
                ) : (
                  <span className="toy-lock">🔒</span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Favorite toy quick play */}
        {toyBox.favoriteToy && (
          <div className="toybox-favorite-section">
            <span className="favorite-label">⭐ {t.toyBox.favorite}:</span>
            <button 
              className="favorite-play-btn"
              onClick={() => {
                const fav = TOYS.find(t => t.id === toyBox.favoriteToy);
                if (fav) handleToyClick(fav);
              }}
            >
              {TOYS.find(t => t.id === toyBox.favoriteToy)?.icon} {t.toyBox.play}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ==================== PET TREATS SHOP MODAL (T1349) ====================
function TreatShopModal({ 
  lang, 
  treatShop,
  playerLevel, 
  playerCoins,
  petHunger,
  onBuy,
  onFeed,
  onClose 
}: { 
  lang: Language; 
  treatShop: TreatShopState;
  playerLevel: number;
  playerCoins: number;
  petHunger: number;
  onBuy: (treatId: string, cost: number) => void;
  onFeed: (treat: Treat) => void;
  onClose: () => void;
}) {
  const t = translations[lang];
  const [message, setMessage] = useState<string | null>(null);
  const [feedingTreat, setFeedingTreat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  };

  const getRarityColor = (rarity: Treat['rarity']) => {
    switch (rarity) {
      case 'common': return '#8bc34a';
      case 'rare': return '#2196f3';
      case 'premium': return '#ff9800';
    }
  };

  const handleBuyTreat = (treat: Treat) => {
    const isUnlocked = treatShop.unlockedTreats.includes(treat.id) || (!treat.unlockLevel || playerLevel >= treat.unlockLevel);
    const canAfford = playerCoins >= treat.price;

    if (!isUnlocked) {
      showMessage(t.treatShop.levelRequired.replace('{level}', String(treat.unlockLevel)));
      return;
    }
    if (!canAfford) {
      showMessage(t.treatShop.notEnoughCoins);
      return;
    }
    
    onBuy(treat.id, treat.price);
    showMessage(t.treatShop.purchased);
  };

  const handleFeedTreat = (treat: Treat) => {
    const owned = treatShop.inventory[treat.id] || 0;
    if (owned <= 0) {
      showMessage(t.treatShop.notOwned);
      return;
    }
    if (petHunger >= 95) {
      showMessage(t.treatShop.tooFull);
      return;
    }

    setFeedingTreat(treat.id);
    setTimeout(() => {
      setFeedingTreat(null);
      onFeed(treat);
      showMessage(t.treatShop.yummy);
    }, 800);
  };

  // Group treats by rarity for shop view
  const treatsByRarity = {
    common: TREATS.filter(t => t.rarity === 'common'),
    rare: TREATS.filter(t => t.rarity === 'rare'),
    premium: TREATS.filter(t => t.rarity === 'premium'),
  };

  // Get treats in inventory
  const inventoryTreats = TREATS.filter(t => (treatShop.inventory[t.id] || 0) > 0);

  return (
    <motion.div 
      className="treatshop-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <motion.div 
        className="treatshop-modal glass-card"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(255,248,240,0.95), rgba(255,235,220,0.95))',
          borderRadius: '24px',
          padding: '20px',
          maxWidth: '420px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(255,150,50,0.3)',
          border: '3px solid rgba(255,180,100,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#d97706' }}>{t.treatShop.title}</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(0,0,0,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '1.2rem',
            }}
          >✕</button>
        </div>

        {/* Stats Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.5)',
          borderRadius: '12px',
          marginBottom: '12px',
          fontSize: '0.9rem',
        }}>
          <span>✨ {playerCoins}</span>
          <span>🍽️ {Math.round(petHunger)}%</span>
          <span>🍪 {t.treatShop.totalFed.replace('{count}', String(treatShop.totalFed))}</span>
        </div>

        {/* Message */}
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              borderRadius: '12px',
              padding: '10px',
              textAlign: 'center',
              marginBottom: '12px',
              fontWeight: '600',
              color: '#92400e',
            }}
          >
            {message}
          </motion.div>
        )}

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('shop')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '12px',
              background: activeTab === 'shop' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(0,0,0,0.1)',
              color: activeTab === 'shop' ? 'white' : '#666',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🛒 {t.treatShop.shop}
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '12px',
              background: activeTab === 'inventory' ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(0,0,0,0.1)',
              color: activeTab === 'inventory' ? 'white' : '#666',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            📦 {t.treatShop.inventory}
            {inventoryTreats.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {inventoryTreats.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
          {activeTab === 'shop' ? (
            // Shop View
            <div>
              {Object.entries(treatsByRarity).map(([rarity, treats]) => (
                <div key={rarity} style={{ marginBottom: '16px' }}>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: '600', 
                    color: getRarityColor(rarity as Treat['rarity']),
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}>
                    {rarity === 'common' ? t.treatShop.common : rarity === 'rare' ? t.treatShop.rare : t.treatShop.premium}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {treats.map(treat => {
                      const isLocked = treat.unlockLevel && playerLevel < treat.unlockLevel;
                      const canAfford = playerCoins >= treat.price;
                      const owned = treatShop.inventory[treat.id] || 0;

                      return (
                        <motion.button
                          key={treat.id}
                          onClick={() => !isLocked && handleBuyTreat(treat)}
                          whileHover={!isLocked ? { scale: 1.02 } : {}}
                          whileTap={!isLocked ? { scale: 0.98 } : {}}
                          style={{
                            background: isLocked 
                              ? 'rgba(0,0,0,0.1)' 
                              : 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6))',
                            border: `2px solid ${isLocked ? '#ccc' : getRarityColor(treat.rarity)}`,
                            borderRadius: '12px',
                            padding: '10px',
                            cursor: isLocked ? 'not-allowed' : 'pointer',
                            opacity: isLocked ? 0.6 : 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span style={{ fontSize: '2rem' }}>{treat.icon}</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#333' }}>
                            {treat.name[lang]}
                          </span>
                          {isLocked ? (
                            <span style={{ fontSize: '0.7rem', color: '#999' }}>🔒 Lv.{treat.unlockLevel}</span>
                          ) : (
                            <span style={{ 
                              fontSize: '0.75rem', 
                              color: canAfford ? '#059669' : '#dc2626',
                              fontWeight: '600',
                            }}>
                              {treat.price} ✨
                            </span>
                          )}
                          {owned > 0 && (
                            <span style={{ fontSize: '0.65rem', color: '#666', background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: '8px' }}>
                              📦 {owned}
                            </span>
                          )}
                          {treat.special && <span style={{ fontSize: '0.7rem' }}>✨</span>}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Inventory View
            <div>
              {inventoryTreats.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  color: '#888',
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📦</div>
                  <div>{t.treatShop.notOwned}</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {inventoryTreats.map(treat => {
                    const owned = treatShop.inventory[treat.id] || 0;
                    const isFeeding = feedingTreat === treat.id;
                    const isFull = petHunger >= 95;

                    return (
                      <motion.div
                        key={treat.id}
                        animate={isFeeding ? { scale: [1, 1.05, 1], rotate: [0, -5, 5, 0] } : {}}
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                          border: `2px solid ${getRarityColor(treat.rarity)}`,
                          borderRadius: '16px',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <span style={{ fontSize: '2.5rem' }}>{treat.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: '#333' }}>{treat.name[lang]}</div>
                          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                            {treat.description[lang]}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '0.7rem' }}>
                            <span style={{ color: '#059669' }}>🍽️+{treat.hungerRestore}</span>
                            <span style={{ color: '#ec4899' }}>💖+{treat.happinessBoost}</span>
                            {treat.weightGain > 0 ? (
                              <span style={{ color: '#f59e0b' }}>⚖️+{treat.weightGain}</span>
                            ) : (
                              <span style={{ color: '#10b981' }}>💚</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#666' }}>×{owned}</span>
                          <motion.button
                            onClick={() => handleFeedTreat(treat)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isFull}
                            style={{
                              background: isFull 
                                ? 'rgba(0,0,0,0.1)' 
                                : 'linear-gradient(135deg, #10b981, #059669)',
                              color: isFull ? '#999' : 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: isFull ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {isFeeding ? '😋' : t.treatShop.feed}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== PHOTO MODE COMPONENT (T1174) ====================
type PhotoFilter = 'normal' | 'sepia' | 'grayscale' | 'vintage' | 'dreamy' | 'sunset' | 'night' | 'sparkle';
type PhotoFrame = 'none' | 'hearts' | 'stars' | 'flowers' | 'polaroid' | 'rainbow' | 'gold' | 'magic';

const PHOTO_FILTERS: { id: PhotoFilter; css: string; icon: string }[] = [
  { id: 'normal', css: 'none', icon: '🎨' },
  { id: 'sepia', css: 'sepia(80%)', icon: '🏛️' },
  { id: 'grayscale', css: 'grayscale(100%)', icon: '🖤' },
  { id: 'vintage', css: 'sepia(30%) contrast(90%) brightness(95%)', icon: '📷' },
  { id: 'dreamy', css: 'blur(1px) brightness(110%) saturate(120%)', icon: '✨' },
  { id: 'sunset', css: 'hue-rotate(20deg) saturate(140%) brightness(95%)', icon: '🌅' },
  { id: 'night', css: 'brightness(70%) saturate(80%) hue-rotate(200deg)', icon: '🌙' },
  { id: 'sparkle', css: 'contrast(110%) saturate(130%) brightness(105%)', icon: '💫' },
];

const PHOTO_FRAMES: { id: PhotoFrame; emoji: string; borderStyle: string; cornerEmojis?: string[] }[] = [
  { id: 'none', emoji: '⬜', borderStyle: 'none', cornerEmojis: [] },
  { id: 'hearts', emoji: '💕', borderStyle: '4px solid #ff69b4', cornerEmojis: ['❤️', '💕', '💖', '💗'] },
  { id: 'stars', emoji: '⭐', borderStyle: '4px solid #ffd700', cornerEmojis: ['⭐', '✨', '🌟', '💫'] },
  { id: 'flowers', emoji: '🌸', borderStyle: '4px solid #ffb6c1', cornerEmojis: ['🌸', '🌺', '🌷', '🌻'] },
  { id: 'polaroid', emoji: '📸', borderStyle: '12px solid white', cornerEmojis: [] },
  { id: 'rainbow', emoji: '🌈', borderStyle: '4px solid transparent', cornerEmojis: ['🌈', '☀️', '🌈', '⛅'] },
  { id: 'gold', emoji: '👑', borderStyle: '6px solid #daa520', cornerEmojis: ['👑', '✨', '💎', '⚜️'] },
  { id: 'magic', emoji: '🪄', borderStyle: '4px solid #9370db', cornerEmojis: ['🪄', '⭐', '🔮', '✨'] },
];

function PhotoModeModal({ 
  lang,
  petName,
  mood,
  costumeState,
  roomBg,
  roomKey,
  playSound,
  onClose 
}: { 
  lang: Language;
  petName: string;
  mood: MoodType;
  costumeState: CostumeState;
  roomBg: string;
  roomKey: RoomKey;
  playSound: (effect: 'ui-click' | 'ui-success' | 'achievement' | 'coin-collect') => void;
  onClose: () => void;
}) {
  const t = translations[lang];
  const [selectedFilter, setSelectedFilter] = useState<PhotoFilter>('normal');
  const [selectedFrame, setSelectedFrame] = useState<PhotoFrame>('none');
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const photoRef = useRef<HTMLDivElement>(null);
  
  const filterInfo = PHOTO_FILTERS.find(f => f.id === selectedFilter) || PHOTO_FILTERS[0];
  const frameInfo = PHOTO_FRAMES.find(f => f.id === selectedFrame) || PHOTO_FRAMES[0];

  // Use html2canvas-like approach with canvas API
  const capturePhoto = async () => {
    if (!photoRef.current) return;
    
    setIsCapturing(true);
    playSound('ui-click');
    
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No canvas context');
      
      // Set dimensions
      const width = 400;
      const height = 400;
      canvas.width = width;
      canvas.height = height;
      
      // Draw background
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        bgImg.onload = () => resolve();
        bgImg.onerror = () => reject();
        bgImg.src = roomBg;
      }).catch(() => {
        // Fallback gradient background if image fails
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#e8e0f0');
        gradient.addColorStop(1, '#c0d0e8');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });
      
      if (bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.drawImage(bgImg, 0, 0, width, height);
      }
      
      // Apply filter effect
      if (filterInfo.css !== 'none') {
        ctx.filter = filterInfo.css;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
      }
      
      // Draw Luna
      const lunaImg = new Image();
      lunaImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        lunaImg.onload = () => resolve();
        lunaImg.onerror = () => resolve();
        lunaImg.src = `${BASE_URL}assets/character/luna-happy.jpg`;
      });
      
      if (lunaImg.complete && lunaImg.naturalWidth > 0) {
        const lunaSize = 150;
        const lunaX = (width - lunaSize) / 2;
        const lunaY = (height - lunaSize) / 2 + 30;
        
        // Apply filter to Luna too
        if (filterInfo.css !== 'none') {
          ctx.filter = filterInfo.css;
        }
        
        // Draw with rounded corners
        ctx.save();
        ctx.beginPath();
        ctx.arc(lunaX + lunaSize/2, lunaY + lunaSize/2, lunaSize/2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(lunaImg, lunaX, lunaY, lunaSize, lunaSize);
        ctx.restore();
        ctx.filter = 'none';
        
        // Draw glow effect
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(lunaX + lunaSize/2, lunaY + lunaSize/2, lunaSize/2 + 5, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }
      
      // Draw costumes as emoji text
      ctx.font = '40px serif';
      ctx.textAlign = 'center';
      
      if (costumeState.equipped.hat) {
        const hatEmoji = COSTUMES.find(c => c.id === costumeState.equipped.hat)?.icon || '';
        ctx.fillText(hatEmoji, width/2, height/2 - 40);
      }
      
      if (costumeState.equipped.accessory) {
        const accEmoji = COSTUMES.find(c => c.id === costumeState.equipped.accessory)?.icon || '';
        ctx.fillText(accEmoji, width/2 + 40, height/2 + 20);
      }
      
      if (costumeState.equipped.outfit) {
        const outfitEmoji = COSTUMES.find(c => c.id === costumeState.equipped.outfit)?.icon || '';
        ctx.fillText(outfitEmoji, width/2, height/2 + 90);
      }
      
      // T1334: Draw collar
      if (costumeState.equipped.collar) {
        const collarEmoji = COSTUMES.find(c => c.id === costumeState.equipped.collar)?.icon || '';
        ctx.fillText(collarEmoji, width/2, height/2 + 50);
      }
      
      // Draw mood emoji
      ctx.font = '30px serif';
      ctx.fillText(getMoodEmoji(mood), width/2 + 60, height/2);
      
      // Draw frame corners
      if (frameInfo.cornerEmojis && frameInfo.cornerEmojis.length > 0) {
        ctx.font = '36px serif';
        const margin = 30;
        ctx.fillText(frameInfo.cornerEmojis[0], margin, margin + 30);
        ctx.fillText(frameInfo.cornerEmojis[1], width - margin, margin + 30);
        ctx.fillText(frameInfo.cornerEmojis[2], margin, height - margin);
        ctx.fillText(frameInfo.cornerEmojis[3], width - margin, height - margin);
      }
      
      // Draw frame border
      if (selectedFrame === 'polaroid') {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, 20);
        ctx.fillRect(0, 0, 20, height);
        ctx.fillRect(width - 20, 0, 20, height);
        ctx.fillRect(0, height - 60, width, 60);
        
        // Polaroid text area
        ctx.fillStyle = '#333';
        ctx.font = '20px cursive, sans-serif';
        ctx.fillText(`${petName} ${getMoodEmoji(mood)}`, width/2, height - 25);
      } else if (selectedFrame === 'rainbow') {
        // Rainbow gradient border
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.17, '#ff8000');
        gradient.addColorStop(0.33, '#ffff00');
        gradient.addColorStop(0.5, '#00ff00');
        gradient.addColorStop(0.67, '#0080ff');
        gradient.addColorStop(0.83, '#8000ff');
        gradient.addColorStop(1, '#ff0080');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, width - 8, height - 8);
      } else if (frameInfo.borderStyle !== 'none') {
        // Extract color from border style
        const colorMatch = frameInfo.borderStyle.match(/#[a-fA-F0-9]+|white|gold/);
        if (colorMatch) {
          ctx.strokeStyle = colorMatch[0];
          ctx.lineWidth = 6;
          ctx.strokeRect(3, 3, width - 6, height - 6);
        }
      }
      
      // Draw pet name watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`🌙 ${petName}`, 15, height - 15);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);
      playSound('achievement');
      haptic.success();
      
    } catch (error) {
      console.error('Photo capture failed:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const downloadPhoto = () => {
    if (!capturedImage) return;
    
    playSound('ui-success');
    haptic.medium();
    
    const link = document.createElement('a');
    link.download = `${petName}-moonlight-${Date.now()}.png`;
    link.href = capturedImage;
    link.click();
    
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const sharePhoto = async () => {
    if (!capturedImage) return;
    
    playSound('ui-click');
    
    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], `${petName}-moonlight.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${petName} - Moonlight Magic House`,
          text: lang === 'it' ? `Guarda ${petName}! 🌙✨` : `Look at ${petName}! 🌙✨`,
          files: [file],
        });
        haptic.success();
      } else {
        // Fallback to download
        downloadPhoto();
      }
    } catch (error) {
      // User cancelled or share failed, fallback to download
      downloadPhoto();
    }
  };

  return (
    <motion.div 
      className="photo-mode-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="photo-mode-modal glass-card"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="photo-mode-header">
          <h2 className="photo-mode-title">{t.photoMode.title}</h2>
          <button className="photo-mode-close" onClick={onClose}>✕</button>
        </div>

        {/* Photo Preview Area */}
        <div 
          className="photo-preview-container"
          ref={photoRef}
          style={{
            filter: filterInfo.css !== 'none' ? filterInfo.css : undefined,
            border: frameInfo.borderStyle,
            background: selectedFrame === 'rainbow' 
              ? 'linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #00ff00, #0080ff, #8000ff)'
              : undefined,
            padding: selectedFrame === 'rainbow' ? '4px' : undefined,
          }}
        >
          {/* Background */}
          <div 
            className="photo-bg"
            style={{ backgroundImage: `url(${roomBg})` }}
          />
          
          {/* Frame Corner Decorations */}
          {frameInfo.cornerEmojis && frameInfo.cornerEmojis.length > 0 && (
            <>
              <span className="frame-corner tl">{frameInfo.cornerEmojis[0]}</span>
              <span className="frame-corner tr">{frameInfo.cornerEmojis[1]}</span>
              <span className="frame-corner bl">{frameInfo.cornerEmojis[2]}</span>
              <span className="frame-corner br">{frameInfo.cornerEmojis[3]}</span>
            </>
          )}
          
          {/* Luna with costumes */}
          <div className="photo-luna">
            <img 
              src={`${BASE_URL}assets/character/luna-happy.jpg`} 
              alt={petName}
              className="photo-luna-img"
            />
            <div className="photo-luna-glow" />
            
            {/* Costumes */}
            {costumeState.equipped.hat && (
              <span className="photo-costume hat">
                {COSTUMES.find(c => c.id === costumeState.equipped.hat)?.icon}
              </span>
            )}
            {costumeState.equipped.accessory && (
              <span className="photo-costume accessory">
                {COSTUMES.find(c => c.id === costumeState.equipped.accessory)?.icon}
              </span>
            )}
            {costumeState.equipped.outfit && (
              <span className="photo-costume outfit">
                {COSTUMES.find(c => c.id === costumeState.equipped.outfit)?.icon}
              </span>
            )}
            {/* T1334: Pet collar */}
            {costumeState.equipped.collar && (
              <span className="photo-costume collar">
                {COSTUMES.find(c => c.id === costumeState.equipped.collar)?.icon}
              </span>
            )}
            
            {/* Mood */}
            <span className="photo-mood">{getMoodEmoji(mood)}</span>
          </div>
          
          {/* Pet Name Watermark */}
          <div className="photo-watermark">
            🌙 {petName}
          </div>
          
          {/* Polaroid caption area */}
          {selectedFrame === 'polaroid' && (
            <div className="polaroid-caption">
              {petName} {getMoodEmoji(mood)}
            </div>
          )}
        </div>

        {/* Filter Selection */}
        <div className="photo-section">
          <h3 className="photo-section-title">{t.photoMode.filters}</h3>
          <div className="photo-options-row">
            {PHOTO_FILTERS.map(filter => (
              <button
                key={filter.id}
                className={`photo-option-btn ${selectedFilter === filter.id ? 'active' : ''}`}
                onClick={() => { setSelectedFilter(filter.id); playSound('ui-click'); haptic.light(); }}
                title={t.photoMode[`filter${filter.id.charAt(0).toUpperCase() + filter.id.slice(1)}` as keyof typeof t.photoMode] as string}
              >
                <span className="option-icon">{filter.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Frame Selection */}
        <div className="photo-section">
          <h3 className="photo-section-title">{t.photoMode.frames}</h3>
          <div className="photo-options-row">
            {PHOTO_FRAMES.map(frame => (
              <button
                key={frame.id}
                className={`photo-option-btn ${selectedFrame === frame.id ? 'active' : ''}`}
                onClick={() => { setSelectedFrame(frame.id); playSound('ui-click'); haptic.light(); }}
                title={t.photoMode[`frame${frame.id.charAt(0).toUpperCase() + frame.id.slice(1)}` as keyof typeof t.photoMode] as string}
              >
                <span className="option-icon">{frame.emoji}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Capture/Download Buttons */}
        <div className="photo-actions">
          {!capturedImage ? (
            <motion.button
              className="photo-capture-btn"
              onClick={capturePhoto}
              disabled={isCapturing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isCapturing ? (
                <span className="capture-loading">⏳ {t.photoMode.saving}</span>
              ) : (
                <span>{t.photoMode.capture}</span>
              )}
            </motion.button>
          ) : (
            <div className="photo-result-actions">
              <motion.button
                className="photo-download-btn"
                onClick={downloadPhoto}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📥 {t.photoMode.download}
              </motion.button>
              <motion.button
                className="photo-share-btn"
                onClick={sharePhoto}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📤 {t.photoMode.share}
              </motion.button>
              <button
                className="photo-retake-btn"
                onClick={() => setCapturedImage(null)}
              >
                🔄
              </button>
            </div>
          )}
        </div>

        {/* Saved Toast */}
        <AnimatePresence>
          {showSaved && (
            <motion.div
              className="photo-saved-toast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {t.photoMode.saved}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ==================== MOOD JOURNAL MODAL (T1179) ====================
function MoodJournalModal({ 
  lang,
  petName,
  currentMood,
  currentStats,
  journalState,
  onSaveEntry,
  onClose,
  playSound
}: { 
  lang: Language;
  petName: string;
  currentMood: MoodType;
  currentStats: { happiness: number; energy: number; hunger: number };
  journalState: MoodJournalState;
  onSaveEntry: (entry: MoodJournalEntry) => void;
  onClose: () => void;
  playSound: (sound: string) => void;
}) {
  const t = translations[lang];
  const [note, setNote] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType>(currentMood);
  const [showSaved, setShowSaved] = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [starRating, setStarRating] = useState<number>(0); // T1449: Star rating 0-5 (0 = no rating)
  const [hoveredStar, setHoveredStar] = useState<number>(0); // T1449: For hover effect
  
  // Check if already logged today
  const today = new Date().toDateString();
  const alreadyLoggedToday = journalState.lastEntryDate === today;
  
  // Mood options with emojis and colors
  const moodOptions: { mood: MoodType; emoji: string; color: string }[] = [
    { mood: 'happy', emoji: '😊', color: '#ffd700' },
    { mood: 'playful', emoji: '🎉', color: '#ff69b4' },
    { mood: 'hungry', emoji: '😋', color: '#ff8c00' },
    { mood: 'sleepy', emoji: '😴', color: '#9370db' },
  ];
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const entryDate = new Date(dateString);
    const todayDate = new Date();
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    
    if (entryDate.toDateString() === todayDate.toDateString()) {
      return t.moodJournal.today;
    }
    if (entryDate.toDateString() === yesterdayDate.toDateString()) {
      return t.moodJournal.yesterday;
    }
    
    const daysAgo = Math.floor((todayDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    return t.moodJournal.daysAgo.replace('{days}', String(daysAgo));
  };
  
  // Get mood label
  const getMoodLabel = (mood: MoodType): string => {
    const labels: Record<MoodType, string> = {
      happy: t.moodJournal.moodHappy,
      hungry: t.moodJournal.moodHungry,
      sleepy: t.moodJournal.moodSleepy,
      playful: t.moodJournal.moodPlayful,
    };
    return labels[mood];
  };
  
  const handleSave = () => {
    if (alreadyLoggedToday) {
      playSound('ui-error');
      haptic.error();
      return;
    }
    
    const newEntry: MoodJournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood: selectedMood,
      note: note.trim(),
      petName,
      stats: currentStats,
      starRating: starRating > 0 ? starRating : undefined, // T1449: Include star rating if set
    };
    
    onSaveEntry(newEntry);
    playSound('ui-success');
    playSound('sparkle');
    haptic.success();
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
    setNote('');
  };
  
  // Get recent entries (last 5, or all if showAllEntries)
  const displayedEntries = showAllEntries 
    ? [...journalState.entries].reverse() 
    : [...journalState.entries].reverse().slice(0, 5);

  return (
    <motion.div 
      className="mood-journal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="mood-journal-modal glass-card"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mood-journal-header">
          <h2 className="mood-journal-title">{t.moodJournal.title}</h2>
          <button className="mood-journal-close" onClick={onClose}>✕</button>
        </div>
        
        {/* Subtitle with pet name */}
        <p className="mood-journal-subtitle">
          {t.moodJournal.subtitle.replace('{name}', petName)}
        </p>
        
        {/* Current mood selector */}
        <div className="mood-journal-section">
          <h3 className="mood-journal-section-title">{t.moodJournal.todayMood}</h3>
          <div className="mood-selector">
            {moodOptions.map(({ mood, emoji, color }) => (
              <motion.button
                key={mood}
                className={`mood-option ${selectedMood === mood ? 'selected' : ''}`}
                style={{ 
                  borderColor: selectedMood === mood ? color : 'transparent',
                  backgroundColor: selectedMood === mood ? `${color}20` : 'transparent'
                }}
                onClick={() => { 
                  setSelectedMood(mood); 
                  playSound('ui-click'); 
                  haptic.light(); 
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mood-emoji">{emoji}</span>
                <span className="mood-label">{getMoodLabel(mood)}</span>
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* T1449: Star rating selector - Rate your day! */}
        <div className="mood-journal-section">
          <h3 className="mood-journal-section-title">{t.moodJournal.rateYourDay} ⭐</h3>
          <div className="star-rating-selector">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                className={`star-btn ${star <= (hoveredStar || starRating) ? 'filled' : 'empty'}`}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => { 
                  setStarRating(star === starRating ? 0 : star); // Toggle off if same star clicked
                  playSound('ui-click'); 
                  haptic.light(); 
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`${star} ${star === 1 ? t.moodJournal.star : t.moodJournal.stars}`}
              >
                <span className="star-icon">{star <= (hoveredStar || starRating) ? '⭐' : '☆'}</span>
              </motion.button>
            ))}
          </div>
          {starRating > 0 && (
            <motion.p 
              className="star-rating-label"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {starRating} {starRating === 1 ? t.moodJournal.star : t.moodJournal.stars}! {starRating >= 4 ? '🌟' : starRating >= 2 ? '✨' : ''}
            </motion.p>
          )}
        </div>
        
        {/* Note input */}
        <div className="mood-journal-section">
          <textarea
            className="mood-journal-note"
            placeholder={t.moodJournal.addNote}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            rows={3}
          />
        </div>
        
        {/* Save button */}
        <motion.button
          className={`mood-journal-save-btn ${alreadyLoggedToday ? 'disabled' : ''}`}
          onClick={handleSave}
          disabled={alreadyLoggedToday}
          whileHover={{ scale: alreadyLoggedToday ? 1 : 1.03 }}
          whileTap={{ scale: alreadyLoggedToday ? 1 : 0.97 }}
        >
          {alreadyLoggedToday ? t.moodJournal.alreadyLogged : t.moodJournal.saveEntry}
        </motion.button>
        
        {/* Saved toast */}
        <AnimatePresence>
          {showSaved && (
            <motion.div
              className="mood-journal-saved-toast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {t.moodJournal.saved}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* History section */}
        <div className="mood-journal-section mood-journal-history">
          <h3 className="mood-journal-section-title">{t.moodJournal.history}</h3>
          
          {journalState.entries.length === 0 ? (
            <p className="mood-journal-empty">{t.moodJournal.noEntries}</p>
          ) : (
            <>
              <div className="mood-journal-entries">
                {displayedEntries.map(entry => (
                  <motion.div
                    key={entry.id}
                    className="mood-journal-entry"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="entry-header">
                      <span className="entry-mood">{getMoodEmoji(entry.mood)}</span>
                      <span className="entry-date">{formatDate(entry.date)}</span>
                      {/* T1449: Show star rating in history */}
                      {entry.starRating && entry.starRating > 0 && (
                        <span className="entry-stars" title={`${entry.starRating} ${entry.starRating === 1 ? t.moodJournal.star : t.moodJournal.stars}`}>
                          {'⭐'.repeat(entry.starRating)}
                        </span>
                      )}
                    </div>
                    {entry.note && <p className="entry-note">{entry.note}</p>}
                    <div className="entry-stats">
                      <span>💖 {entry.stats.happiness}%</span>
                      <span>⚡ {entry.stats.energy}%</span>
                      <span>🍪 {entry.stats.hunger}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {journalState.entries.length > 5 && !showAllEntries && (
                <button 
                  className="mood-journal-view-all"
                  onClick={() => setShowAllEntries(true)}
                >
                  {t.moodJournal.viewAll} ({journalState.entries.length})
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== DAILY QUEST PANEL (T1185) ====================
function DailyQuestPanel({
  lang,
  questState,
  onClaimReward,
  onClose,
  playSound,
}: {
  lang: Language;
  questState: DailyQuestState;
  onClaimReward: (questId: string) => void;
  onClose: () => void;
  playSound: (sound: string) => void;
}) {
  const t = translations[lang];
  
  const allCompleted = questState.quests.every(q => q.claimed);
  
  return (
    <motion.div 
      className="quest-panel-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="quest-panel-modal glass-card"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="quest-panel-header">
          <h2 className="quest-panel-title">{t.dailyQuests.title}</h2>
          <button className="quest-panel-close" onClick={onClose}>✕</button>
        </div>
        
        <p className="quest-panel-subtitle">{t.dailyQuests.subtitle}</p>
        
        {/* Quest List */}
        <div className="quest-list">
          {questState.quests.map((quest) => (
            <motion.div 
              key={quest.id}
              className={`quest-item ${quest.completed ? 'completed' : ''} ${quest.claimed ? 'claimed' : ''}`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="quest-icon">{quest.icon}</div>
              <div className="quest-info">
                <span className="quest-name">{quest.name[lang]}</span>
                <span className="quest-description">{quest.description[lang]}</span>
                <div className="quest-progress-bar">
                  <motion.div 
                    className="quest-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="quest-progress-text">
                  {t.dailyQuests.progress
                    .replace('{current}', String(Math.min(quest.progress, quest.target)))
                    .replace('{target}', String(quest.target))}
                </span>
              </div>
              <div className="quest-reward">
                {quest.claimed ? (
                  <span className="quest-claimed-badge">✓ {t.dailyQuests.claimed}</span>
                ) : quest.completed ? (
                  <motion.button
                    className="quest-claim-btn"
                    onClick={() => {
                      onClaimReward(quest.id);
                      playSound('coin-collect');
                      playSound('ui-success');
                      haptic.success();
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t.dailyQuests.claim}
                    <span className="quest-reward-preview">
                      {t.dailyQuests.reward
                        .replace('{coins}', String(quest.reward.coins))
                        .replace('{xp}', String(quest.reward.xp))}
                    </span>
                  </motion.button>
                ) : (
                  <span className="quest-reward-preview">
                    {t.dailyQuests.reward
                      .replace('{coins}', String(quest.reward.coins))
                      .replace('{xp}', String(quest.reward.xp))}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* All Complete Message */}
        {allCompleted && (
          <motion.div 
            className="quest-all-complete"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
          >
            <span className="quest-complete-emoji">🎉</span>
            <span>{t.dailyQuests.allComplete}</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ==================== FRIEND CODE MODAL (T1191) ====================
// Modal to view and share unique friend code
function FriendCodeModal({
  lang,
  petName,
  friendCode,
  onClose,
  playSound,
}: {
  lang: Language;
  petName: string;
  friendCode: string;
  onClose: () => void;
  playSound: (sound: string) => void;
}) {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(friendCode);
      setCopied(true);
      playSound('ui-success');
      haptic.success();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = friendCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      playSound('ui-success');
      haptic.success();
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleShare = async () => {
    const shareText = t.friendCode.shareText
      .replace('{code}', friendCode)
      .replace('{name}', petName);
    
    playSound('ui-click');
    haptic.medium();
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${petName} - Moonlight Magic House`,
          text: shareText,
        });
        haptic.success();
      } else {
        // Fallback to copy
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled or share failed
      handleCopy();
    }
  };

  return (
    <motion.div 
      className="friend-code-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="friend-code-modal glass-card"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="friend-code-header">
          <h2 className="friend-code-title">{t.friendCode.title}</h2>
          <button className="friend-code-close" onClick={onClose}>✕</button>
        </div>
        
        {/* Subtitle */}
        <p className="friend-code-subtitle">{t.friendCode.subtitle}</p>
        
        {/* Pet avatar */}
        <motion.div 
          className="friend-code-avatar"
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [-2, 2, -2],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="avatar-emoji">🐱</span>
          <span className="avatar-name">{petName}</span>
        </motion.div>
        
        {/* Code display */}
        <div className="friend-code-display">
          <span className="code-label">{t.friendCode.yourCode}</span>
          <motion.div 
            className="code-value"
            animate={{ 
              boxShadow: ['0 0 20px rgba(255, 215, 0, 0.3)', '0 0 30px rgba(255, 215, 0, 0.5)', '0 0 20px rgba(255, 215, 0, 0.3)'],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="code-text">{friendCode}</span>
          </motion.div>
        </div>
        
        {/* Action buttons */}
        <div className="friend-code-actions">
          <motion.button
            className={`friend-code-btn copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? (
              <>✓ {t.friendCode.copied}</>
            ) : (
              <>📋 {t.friendCode.copy}</>
            )}
          </motion.button>
          
          <motion.button
            className="friend-code-btn share-btn"
            onClick={handleShare}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📤 {t.friendCode.share}
          </motion.button>
        </div>
        
        {/* Info text */}
        <p className="friend-code-info">
          <span className="info-icon">💡</span>
          {t.friendCode.info}
        </p>
        
        {/* Decorative elements */}
        <div className="friend-code-sparkles">
          {['✨', '⭐', '🌟', '💫'].map((emoji, i) => (
            <motion.span
              key={i}
              className="sparkle-decoration"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.3,
                repeat: Infinity,
              }}
              style={{
                position: 'absolute',
                left: `${15 + i * 25}%`,
                bottom: '10%',
                fontSize: '1.2rem',
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== GIFT SENDING MODAL (T1192) ====================
// Send virtual gifts to friends using their friend codes
function GiftSendingModal({
  lang,
  petName,
  playerCoins,
  giftState,
  onSendGift,
  onClose,
  playSound,
}: {
  lang: Language;
  petName: string;
  playerCoins: number;
  giftState: GiftState;
  onSendGift: (gift: Gift, friendCode: string) => boolean;
  onClose: () => void;
  playSound: (sound: string) => void;
}) {
  const t = translations[lang];
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [friendCode, setFriendCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSent, setShowSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentGiftAnimation, setSentGiftAnimation] = useState<Gift | null>(null);
  
  // Format friend code input (auto add dash)
  const handleCodeChange = (value: string) => {
    // Remove non-alphanumeric characters except dash
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    // Auto-add dash after 4 characters
    if (cleaned.length === 4 && !cleaned.includes('-')) {
      setFriendCode(cleaned + '-');
    } else if (cleaned.length <= 9) {
      setFriendCode(cleaned);
    }
    setError(null);
  };
  
  // Validate friend code format
  const isValidCode = (code: string): boolean => {
    return /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code);
  };
  
  // Get rarity color
  const getRarityColor = (rarity: Gift['rarity']): string => {
    switch (rarity) {
      case 'common': return '#8bc34a';
      case 'rare': return '#2196f3';
      case 'legendary': return '#ff9800';
    }
  };
  
  // Handle send gift
  const handleSend = () => {
    if (!selectedGift) return;
    
    // Validate code
    if (!isValidCode(friendCode)) {
      setError(t.giftSending.invalidCode);
      playSound('ui-error');
      haptic.error();
      return;
    }
    
    // Check coins
    if (playerCoins < selectedGift.cost) {
      setError(t.giftSending.notEnoughCoins);
      playSound('ui-error');
      haptic.error();
      return;
    }
    
    setIsSending(true);
    playSound('ui-click');
    
    // Simulate sending (in real app this would be a network call)
    setTimeout(() => {
      const success = onSendGift(selectedGift, friendCode);
      
      if (success) {
        setIsSending(false);
        setShowSent(true);
        setSentGiftAnimation(selectedGift);
        playSound('achievement');
        playSound('sparkle');
        haptic.success();
        
        // Reset after animation
        setTimeout(() => {
          setShowSent(false);
          setSentGiftAnimation(null);
          setSelectedGift(null);
          setFriendCode('');
        }, 2500);
      } else {
        setIsSending(false);
        setError(t.giftSending.notEnoughCoins);
        haptic.error();
      }
    }, 800);
  };
  
  return (
    <motion.div 
      className="gift-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="gift-modal glass-card"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="gift-modal-header">
          <h2 className="gift-modal-title">{t.giftSending.title}</h2>
          <button className="gift-modal-close" onClick={onClose}>✕</button>
        </div>
        
        <p className="gift-modal-subtitle">{t.giftSending.subtitle}</p>
        
        {/* Coins display */}
        <div className="gift-coins-display">
          <span className="coin-icon">✨</span>
          <span className="coin-amount">{playerCoins}</span>
        </div>
        
        {/* Sent Animation Overlay */}
        <AnimatePresence>
          {sentGiftAnimation && (
            <motion.div 
              className="gift-sent-animation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="gift-flying"
                initial={{ scale: 0.5, y: 0 }}
                animate={{ 
                  scale: [0.5, 1.5, 1, 1.5, 0.5],
                  y: [0, -50, -100, -150, -200],
                  opacity: [1, 1, 1, 0.8, 0],
                  rotate: sentGiftAnimation.animation === 'spin' ? [0, 360, 720] : 0,
                }}
                transition={{ duration: 2, ease: 'easeOut' }}
              >
                <span className="gift-emoji">{sentGiftAnimation.icon}</span>
                {/* Sparkles around gift */}
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <motion.span
                    key={i}
                    className="gift-sparkle"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.cos(i * Math.PI / 3) * 40,
                      y: Math.sin(i * Math.PI / 3) * 40,
                    }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
                    style={{ position: 'absolute', fontSize: '1rem' }}
                  >
                    ✨
                  </motion.span>
                ))}
              </motion.div>
              <motion.p
                className="gift-sent-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {t.giftSending.sent}
              </motion.p>
              {/* Hearts animation for heart gifts */}
              {sentGiftAnimation.animation === 'hearts' && (
                [...Array(8)].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.3, 1, 0.5],
                      x: (Math.random() - 0.5) * 100,
                      y: -100 - Math.random() * 100,
                    }}
                    transition={{ delay: i * 0.1, duration: 1.5 }}
                    style={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%',
                      fontSize: '1.5rem',
                    }}
                  >
                    {['💕', '💖', '💗', '❤️'][i % 4]}
                  </motion.span>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Gift Selection Grid */}
        <div className="gift-section">
          <h3 className="gift-section-title">{t.giftSending.selectGift}</h3>
          <div className="gift-grid">
            {GIFTS.map(gift => {
              const canAfford = playerCoins >= gift.cost;
              const isSelected = selectedGift?.id === gift.id;
              
              return (
                <motion.button
                  key={gift.id}
                  className={`gift-item ${isSelected ? 'selected' : ''} ${!canAfford ? 'expensive' : ''}`}
                  onClick={() => { 
                    setSelectedGift(gift); 
                    playSound('ui-click'); 
                    haptic.light();
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ borderColor: isSelected ? getRarityColor(gift.rarity) : 'transparent' }}
                >
                  <span className="gift-icon">{gift.icon}</span>
                  <span className="gift-name">{gift.name[lang]}</span>
                  <span 
                    className="gift-rarity"
                    style={{ color: getRarityColor(gift.rarity) }}
                  >
                    {t.giftSending[gift.rarity]}
                  </span>
                  <span className={`gift-cost ${!canAfford ? 'expensive' : ''}`}>
                    {gift.cost} ✨
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
        
        {/* Selected gift preview */}
        {selectedGift && (
          <motion.div 
            className="gift-selected-preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="preview-icon">{selectedGift.icon}</span>
            <div className="preview-info">
              <span className="preview-name">{selectedGift.name[lang]}</span>
              <span className="preview-desc">{selectedGift.description[lang]}</span>
            </div>
          </motion.div>
        )}
        
        {/* Friend Code Input */}
        <div className="gift-section">
          <h3 className="gift-section-title">{t.giftSending.friendCode}</h3>
          <input
            type="text"
            className="gift-code-input"
            placeholder={t.giftSending.friendCodePlaceholder}
            value={friendCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            maxLength={9}
          />
        </div>
        
        {/* Error message */}
        {error && (
          <motion.div 
            className="gift-error"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            ⚠️ {error}
          </motion.div>
        )}
        
        {/* Send Button */}
        <motion.button
          className={`gift-send-btn ${(!selectedGift || !isValidCode(friendCode) || isSending) ? 'disabled' : ''}`}
          onClick={handleSend}
          disabled={!selectedGift || !isValidCode(friendCode) || isSending}
          whileHover={{ scale: (!selectedGift || !isValidCode(friendCode) || isSending) ? 1 : 1.05 }}
          whileTap={{ scale: (!selectedGift || !isValidCode(friendCode) || isSending) ? 1 : 0.95 }}
        >
          {isSending ? t.giftSending.sending : t.giftSending.send}
        </motion.button>
        
        {/* Gift History */}
        {giftState.sentGifts.length > 0 && (
          <div className="gift-history">
            <h3 className="gift-section-title">
              {t.giftSending.history} 
              <span className="history-count">
                ({t.giftSending.totalSent.replace('{count}', String(giftState.totalSent))})
              </span>
            </h3>
            <div className="gift-history-list">
              {giftState.sentGifts.slice(-5).reverse().map(entry => {
                const gift = GIFTS.find(g => g.id === entry.giftId);
                if (!gift) return null;
                return (
                  <div key={entry.id} className="gift-history-item">
                    <span className="history-icon">{gift.icon}</span>
                    <span className="history-code">
                      {t.giftSending.giftFor.replace('{code}', entry.toCode)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ==================== PET ALBUM MODAL (T1197) ====================
// Display collection of discovered pets/creatures
function PetAlbumModal({
  lang,
  albumState,
  playerLevel,
  onClose,
  playSound,
}: {
  lang: Language;
  albumState: PetAlbumState;
  playerLevel: number;
  onClose: () => void;
  playSound: (sound: string) => void;
}) {
  const t = translations[lang];
  const [selectedPet, setSelectedPet] = useState<CollectiblePet | null>(null);
  
  // Get rarity color and glow
  const getRarityStyle = (rarity: CollectiblePet['rarity']) => {
    switch (rarity) {
      case 'common': return { color: '#8bc34a', glow: 'rgba(139, 195, 74, 0.3)' };
      case 'rare': return { color: '#2196f3', glow: 'rgba(33, 150, 243, 0.4)' };
      case 'legendary': return { color: '#ff9800', glow: 'rgba(255, 152, 0, 0.5)' };
      case 'mythic': return { color: '#e91e63', glow: 'rgba(233, 30, 99, 0.6)' };
    }
  };
  
  // Get unlock hint for undiscovered pets
  const getUnlockHint = (pet: CollectiblePet): string => {
    switch (pet.unlockCondition) {
      case 'level':
        return t.petAlbum.unlockHint.level.replace('{level}', String(pet.unlockLevel));
      case 'room':
        const roomName = t.rooms[pet.unlockRoom as RoomKey] || pet.unlockRoom || '';
        return t.petAlbum.unlockHint.room.replace('{room}', roomName);
      case 'random':
        return t.petAlbum.unlockHint.random;
      case 'secret':
        return t.petAlbum.unlockHint.secret;
      default:
        return '';
    }
  };
  
  // Sort pets: discovered first, then by rarity
  const rarityOrder = { mythic: 0, legendary: 1, rare: 2, common: 3 };
  const sortedPets = [...COLLECTIBLE_PETS].sort((a, b) => {
    const aDiscovered = albumState.discoveredPets.includes(a.id);
    const bDiscovered = albumState.discoveredPets.includes(b.id);
    if (aDiscovered !== bDiscovered) return aDiscovered ? -1 : 1;
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });
  
  const discoveredCount = albumState.discoveredPets.length;
  const totalCount = COLLECTIBLE_PETS.length;
  const progressPercent = Math.round((discoveredCount / totalCount) * 100);

  return (
    <motion.div 
      className="pet-album-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="pet-album-modal glass-card"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pet-album-header">
          <h2 className="pet-album-title">{t.petAlbum.title}</h2>
          <button className="pet-album-close" onClick={onClose}>✕</button>
        </div>
        
        <p className="pet-album-subtitle">{t.petAlbum.subtitle}</p>
        
        {/* Progress bar */}
        <div className="pet-album-progress">
          <div className="progress-text">
            {t.petAlbum.progress.replace('{count}', String(discoveredCount)).replace('{total}', String(totalCount))}
          </div>
          <div className="progress-bar-track">
            <motion.div 
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <span className="progress-percent">{progressPercent}%</span>
        </div>
        
        {/* Pet Grid */}
        <div className="pet-album-grid">
          {sortedPets.map(pet => {
            const isDiscovered = albumState.discoveredPets.includes(pet.id);
            const rarityStyle = getRarityStyle(pet.rarity);
            
            return (
              <motion.button
                key={pet.id}
                className={`pet-album-item ${isDiscovered ? 'discovered' : 'locked'}`}
                onClick={() => {
                  if (isDiscovered) {
                    setSelectedPet(pet);
                    playSound('ui-click');
                    haptic.light();
                  } else {
                    playSound('ui-error');
                    haptic.error();
                  }
                }}
                whileHover={{ scale: isDiscovered ? 1.05 : 1.02 }}
                whileTap={{ scale: isDiscovered ? 0.95 : 1 }}
                style={{
                  borderColor: isDiscovered ? rarityStyle.color : 'rgba(255,255,255,0.2)',
                  boxShadow: isDiscovered ? `0 0 15px ${rarityStyle.glow}` : 'none',
                }}
              >
                {isDiscovered ? (
                  <>
                    <span className="pet-emoji">{pet.emoji}</span>
                    <span className="pet-name">{pet.name[lang]}</span>
                    <span 
                      className="pet-rarity"
                      style={{ color: rarityStyle.color }}
                    >
                      {t.petAlbum.rarity[pet.rarity]}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="pet-emoji locked">❓</span>
                    <span className="pet-name">{t.petAlbum.notDiscovered}</span>
                    <span className="pet-hint">{getUnlockHint(pet)}</span>
                  </>
                )}
              </motion.button>
            );
          })}
        </div>
        
        {/* Selected Pet Detail Modal */}
        <AnimatePresence>
          {selectedPet && (
            <motion.div
              className="pet-detail-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPet(null)}
            >
              <motion.div
                className="pet-detail-card glass-card"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                onClick={e => e.stopPropagation()}
              >
                <motion.span 
                  className="pet-detail-emoji"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [-5, 5, -5],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: 'easeInOut' 
                  }}
                >
                  {selectedPet.emoji}
                </motion.span>
                <h3 className="pet-detail-name">{selectedPet.name[lang]}</h3>
                <span 
                  className="pet-detail-rarity"
                  style={{ color: getRarityStyle(selectedPet.rarity).color }}
                >
                  ✨ {t.petAlbum.rarity[selectedPet.rarity]} ✨
                </span>
                <p className="pet-detail-description">{selectedPet.description[lang]}</p>
                <button 
                  className="pet-detail-close"
                  onClick={() => setSelectedPet(null)}
                >
                  {lang === 'it' ? 'Chiudi' : 'Close'}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Hint at bottom */}
        <p className="pet-album-hint">
          💡 {t.petAlbum.hint}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ==================== PET DISCOVERY POPUP (T1197) ====================
// Shows when a new pet is discovered
function PetDiscoveryPopup({
  pet,
  lang,
  onClose,
}: {
  pet: CollectiblePet;
  lang: Language;
  onClose: () => void;
}) {
  const t = translations[lang];
  
  // Get rarity color
  const getRarityColor = (rarity: CollectiblePet['rarity']) => {
    switch (rarity) {
      case 'common': return '#8bc34a';
      case 'rare': return '#2196f3';
      case 'legendary': return '#ff9800';
      case 'mythic': return '#e91e63';
    }
  };
  
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      className="pet-discovery-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="pet-discovery-popup glass-card"
        initial={{ scale: 0.3, opacity: 0, y: 50 }}
        animate={{ 
          scale: [0.3, 1.1, 1], 
          opacity: 1, 
          y: 0 
        }}
        transition={{ 
          type: 'spring', 
          damping: 12, 
          stiffness: 200 
        }}
        onClick={e => e.stopPropagation()}
        style={{
          borderColor: getRarityColor(pet.rarity),
          boxShadow: `0 0 30px ${getRarityColor(pet.rarity)}40`,
        }}
      >
        {/* Sparkles */}
        <motion.div 
          className="discovery-sparkles"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          {['✨', '⭐', '🌟', '💫', '✨', '⭐'].map((s, i) => (
            <motion.span 
              key={i} 
              className="discovery-sparkle"
              style={{ 
                position: 'absolute',
                left: `${50 + 45 * Math.cos(i * Math.PI / 3)}%`,
                top: `${50 + 45 * Math.sin(i * Math.PI / 3)}%`,
              }}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
            >
              {s}
            </motion.span>
          ))}
        </motion.div>
        
        <h2 className="discovery-title">{t.petAlbum.newDiscovery}</h2>
        
        <motion.span 
          className="discovery-pet-emoji"
          animate={{ 
            scale: [1, 1.3, 1],
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 0.8, 
            repeat: Infinity, 
            repeatType: 'reverse' 
          }}
        >
          {pet.emoji}
        </motion.span>
        
        <h3 className="discovery-pet-name">{pet.name[lang]}</h3>
        
        <span 
          className="discovery-rarity"
          style={{ color: getRarityColor(pet.rarity) }}
        >
          {t.petAlbum.rarity[pet.rarity]}
        </span>
        
        <p className="discovery-description">{pet.description[lang]}</p>
      </motion.div>
    </motion.div>
  );
}

// ==================== FOOD BOWL ANIMATION (T1181) ====================
// Animated food bowl with eating particles for the kitchen
function FoodBowlAnimation({ isEating, lang }: { isEating: boolean; lang: Language }) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; emoji: string; delay: number }>>([]);
  
  // Generate eating particles when eating starts
  useEffect(() => {
    if (!isEating) {
      setParticles([]);
      return;
    }
    
    // Create particles with random positions and emojis
    const foodEmojis = ['🍖', '🐟', '🍗', '🥩', '💕', '✨', '⭐', '😋'];
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: 35 + Math.random() * 30, // Random x position around bowl
      emoji: foodEmojis[Math.floor(Math.random() * foodEmojis.length)],
      delay: i * 0.15,
    }));
    setParticles(newParticles);
    
    // Clean up particles after animation
    const timer = setTimeout(() => {
      setParticles([]);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [isEating]);

  return (
    <div className="food-bowl-container" style={{
      position: 'absolute',
      left: '30%',
      bottom: '18%',
      zIndex: 15,
      pointerEvents: 'none',
    }}>
      {/* Food Bowl */}
      <motion.div 
        className="food-bowl"
        animate={isEating ? {
          scale: [1, 1.1, 1, 1.1, 1],
          rotate: [0, -3, 0, 3, 0],
        } : { scale: 1, rotate: 0 }}
        transition={isEating ? { 
          duration: 0.5, 
          repeat: 3,
          ease: 'easeInOut' 
        } : {}}
        style={{
          fontSize: '3rem',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Bowl with food */}
        <span style={{ fontSize: '2.5rem' }}>🥣</span>
        {/* Label */}
        <motion.span
          animate={isEating ? { opacity: [0.7, 1, 0.7] } : { opacity: 0.7 }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{
            fontSize: '0.6rem',
            background: 'rgba(255,255,255,0.8)',
            padding: '2px 6px',
            borderRadius: '8px',
            marginTop: '2px',
            fontWeight: 'bold',
            color: '#8b4513',
          }}
        >
          {lang === 'it' ? 'Luna' : 'Luna'}
        </motion.span>
      </motion.div>
      
      {/* Eating Particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.span
            key={particle.id}
            initial={{ 
              opacity: 0, 
              scale: 0.3, 
              x: particle.x - 35, 
              y: 0,
            }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              scale: [0.3, 1.2, 1, 0.5],
              y: -80 - Math.random() * 40,
              x: (particle.x - 35) + (Math.random() - 0.5) * 60,
              rotate: [0, 180, 360],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: 1.8 + Math.random() * 0.5, 
              delay: particle.delay,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              fontSize: '1.5rem',
              pointerEvents: 'none',
              zIndex: 20,
            }}
          >
            {particle.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
      
      {/* Eating sparkle ring */}
      {isEating && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: [0.5, 1.5, 2],
            opacity: [0, 0.6, 0],
          }}
          transition={{ 
            duration: 1, 
            repeat: 2,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '3px solid #ffd700',
            pointerEvents: 'none',
          }}
        />
      )}
      
      {/* Yummy text popup */}
      <AnimatePresence>
        {isEating && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: -50, scale: 1 }}
            exit={{ opacity: 0, y: -70, scale: 0.8 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              position: 'absolute',
              top: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(255,107,107,0.4)',
            }}
          >
            {lang === 'it' ? 'Gnam! 😋' : 'Yummy! 😋'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== PET MOOD RING COMPONENT (T1352) ====================
// Visual mood ring that glows and changes color based on pet's emotional state!
// Like a real mood ring - kids tap to see how Luna is feeling! 💍✨
function MoodRingIndicator({ 
  mood, 
  stats, 
  lang,
  isExpanded,
  onToggle,
  petName,
}: { 
  mood: MoodType;
  stats: PetStats;
  lang: Language;
  isExpanded: boolean;
  onToggle: () => void;
  petName: string;
}) {
  const t = translations[lang];
  const moodRingInfo = getMoodRingInfo(mood, stats);
  
  return (
    <motion.div 
      className="mood-ring-container"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {/* The mood ring itself */}
      <motion.button
        className="mood-ring-button"
        onClick={() => { onToggle(); haptic.light(); }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: `3px solid ${moodRingInfo.color}`,
          background: `radial-gradient(circle at 30% 30%, ${moodRingInfo.color}40, ${moodRingInfo.color}80)`,
          boxShadow: `0 0 12px ${moodRingInfo.glowColor}, 0 0 24px ${moodRingInfo.glowColor}, inset 0 0 8px ${moodRingInfo.glowColor}`,
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        }}
        animate={{
          boxShadow: [
            `0 0 12px ${moodRingInfo.glowColor}, 0 0 24px ${moodRingInfo.glowColor}, inset 0 0 8px ${moodRingInfo.glowColor}`,
            `0 0 20px ${moodRingInfo.glowColor}, 0 0 35px ${moodRingInfo.glowColor}, inset 0 0 12px ${moodRingInfo.glowColor}`,
            `0 0 12px ${moodRingInfo.glowColor}, 0 0 24px ${moodRingInfo.glowColor}, inset 0 0 8px ${moodRingInfo.glowColor}`,
          ],
        }}
        transition={{
          duration: moodRingInfo.pulseSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        title={t.moodRing?.tap || 'Tap to see mood!'}
      >
        {/* Inner ring highlight */}
        <motion.div
          style={{
            position: 'absolute',
            width: '70%',
            height: '70%',
            borderRadius: '50%',
            border: `2px solid ${moodRingInfo.color}`,
            opacity: 0.7,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{
            duration: moodRingInfo.pulseSpeed * 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Center gem/crystal */}
        <span style={{ fontSize: '1.1rem', zIndex: 2 }}>💎</span>
      </motion.button>
      
      {/* Small label beneath */}
      <span style={{
        fontSize: '0.6rem',
        color: moodRingInfo.color,
        fontWeight: 'bold',
        textShadow: `0 0 4px ${moodRingInfo.glowColor}`,
        opacity: 0.9,
      }}>
        💍
      </span>
      
      {/* Expanded info popup */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="mood-ring-popup glass-card"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(30, 30, 50, 0.95)',
              border: `2px solid ${moodRingInfo.color}`,
              boxShadow: `0 4px 20px ${moodRingInfo.glowColor}`,
              minWidth: '160px',
              zIndex: 200,
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 'bold',
              color: '#fff',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}>
              💍 {t.moodRing?.title || 'Mood Ring'}
            </div>
            
            {/* Current mood display */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}>
              <motion.div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: moodRingInfo.color,
                  boxShadow: `0 0 15px ${moodRingInfo.glowColor}`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 15px ${moodRingInfo.glowColor}`,
                    `0 0 25px ${moodRingInfo.glowColor}`,
                    `0 0 15px ${moodRingInfo.glowColor}`,
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div style={{ textAlign: 'left' }}>
                <div style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 'bold',
                  color: moodRingInfo.color,
                }}>
                  {moodRingInfo.label[lang]}
                </div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: 'rgba(255,255,255,0.7)',
                }}>
                  {getMoodEmoji(mood)} {t.moodRing?.moods?.[mood] || mood}
                </div>
              </div>
            </div>
            
            {/* Mood description */}
            <div style={{
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.8)',
              fontStyle: 'italic',
              marginBottom: '8px',
            }}>
              {moodRingInfo.description[lang]}
            </div>
            
            {/* Color legend */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px',
              fontSize: '0.6rem',
              color: 'rgba(255,255,255,0.6)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9333ea' }} />
                <span>{lang === 'it' ? 'Felice' : 'Happy'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                <span>{lang === 'it' ? 'Gioco' : 'Play'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }} />
                <span>{lang === 'it' ? 'Fame' : 'Hungry'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
                <span>{lang === 'it' ? 'Sonno' : 'Sleepy'}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ==================== SLEEP DREAMS VISUALIZATION (T1190) ====================
// Animated thought bubbles showing Luna's dreams when sleeping 💤
// T1343: Added nap timer to show how long pet has been sleeping
function SleepDreams({ isSleeping, lunaX, lunaY, lang, napStartTime }: { 
  isSleeping: boolean; 
  lunaX: number; 
  lunaY: number;
  lang: Language;
  napStartTime: number | null;
}) {
  // Dream icons - things cats dream about!
  const dreamIcons = ['🐟', '🧶', '🦋', '🐭', '🍖', '🌙', '⭐', '🌸', '☁️', '🐦', '🥛', '🧀', '🎀', '🌈', '🦐'];
  
  // Generate random dream sequence
  const [dreams, setDreams] = useState<Array<{ id: number; icon: string; delay: number }>>([]);
  
  // T1343: Nap timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // T1343: Update timer every second while sleeping
  useEffect(() => {
    if (!isSleeping || !napStartTime) {
      setElapsedTime(0);
      return;
    }
    
    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - napStartTime) / 1000);
      setElapsedTime(elapsed);
    };
    
    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [isSleeping, napStartTime]);
  
  // T1343: Format elapsed time for display
  const formatNapTime = (seconds: number): string => {
    if (seconds < 60) {
      return lang === 'it' ? `${seconds}s` : `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return lang === 'it' ? `${mins}m ${secs}s` : `${mins}m ${secs}s`;
  };
  
  useEffect(() => {
    if (!isSleeping) {
      setDreams([]);
      return;
    }
    
    // Generate initial dreams
    const generateDreams = () => {
      const newDreams = Array.from({ length: 3 }, (_, i) => ({
        id: Date.now() + i,
        icon: dreamIcons[Math.floor(Math.random() * dreamIcons.length)],
        delay: i * 0.8,
      }));
      setDreams(newDreams);
    };
    
    generateDreams();
    
    // Keep generating new dreams every 3 seconds while sleeping
    const interval = setInterval(generateDreams, 3000);
    
    return () => clearInterval(interval);
  }, [isSleeping]);
  
  if (!isSleeping || dreams.length === 0) return null;

  return (
    <div 
      className="sleep-dreams-container"
      style={{
        position: 'absolute',
        left: `${lunaX}%`,
        top: `${lunaY - 20}%`,
        transform: 'translateX(-50%)',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {/* Main thought bubble */}
      <motion.div
        className="thought-bubble-main"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '50%',
          padding: '15px 20px',
          minWidth: '70px',
          minHeight: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15), inset 0 -2px 5px rgba(0, 0, 0, 0.05)',
          border: '2px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        {/* Dreaming icons inside bubble */}
        <AnimatePresence mode="wait">
          {dreams.map((dream, index) => (
            <motion.span
              key={dream.id}
              initial={{ opacity: 0, scale: 0.3, y: 10 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                scale: [0.3, 1.2, 1, 0.8],
                y: [10, -5, -5, -15],
                rotate: [0, 5, -5, 0],
              }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{ 
                duration: 2.5, 
                delay: dream.delay,
                ease: 'easeInOut',
              }}
              style={{
                position: index === 0 ? 'relative' : 'absolute',
                fontSize: '1.8rem',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
              }}
            >
              {dream.icon}
            </motion.span>
          ))}
        </AnimatePresence>
        
        {/* Zzz floating effect */}
        <motion.span
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-5px',
            fontSize: '1rem',
            color: '#9c88ff',
          }}
          animate={{
            y: [0, -8, 0],
            opacity: [0.7, 1, 0.7],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          💤
        </motion.span>
      </motion.div>
      
      {/* Small connector bubbles */}
      <motion.div
        className="thought-bubble-connector"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          position: 'absolute',
          bottom: '-12px',
          left: '30%',
          width: '18px',
          height: '18px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      />
      <motion.div
        className="thought-bubble-connector-small"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          position: 'absolute',
          bottom: '-22px',
          left: '20%',
          width: '10px',
          height: '10px',
          background: 'rgba(255, 255, 255, 0.85)',
          borderRadius: '50%',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        }}
      />
      
      {/* Floating stars around the dream bubble */}
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={{
            position: 'absolute',
            fontSize: '0.8rem',
            left: `${-10 + i * 45}%`,
            top: `${-20 + (i % 2) * 10}%`,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
        >
          {i === 0 ? '✨' : i === 1 ? '⭐' : '💫'}
        </motion.span>
      ))}
      
      {/* T1343: Nap Timer Display 💤⏱️ */}
      {napStartTime && (
        <motion.div
          className="nap-timer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          style={{
            position: 'absolute',
            top: '110%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(156, 136, 255, 0.95), rgba(130, 100, 220, 0.95))',
            borderRadius: '20px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(156, 136, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            whiteSpace: 'nowrap',
          }}
        >
          <motion.span
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ fontSize: '1rem' }}
          >
            😴
          </motion.span>
          <span style={{
            color: 'white',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
          }}>
            {formatNapTime(elapsedTime)}
          </span>
          <motion.span
            animate={{ 
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ fontSize: '0.9rem' }}
          >
            💤
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}

// ==================== PLAY HISTORY CALENDAR (T1180) ====================
// Mini calendar showing which days the user played
function PlayHistoryCalendar({ 
  lang, 
  playedDates,
  petName,
  streak,
}: { 
  lang: Language; 
  playedDates: string[]; 
  petName: string;
  streak: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Convert played dates to Set for fast lookup
  const playedSet = new Set(playedDates);
  
  // Check if a specific date was played
  const wasPlayed = (day: number): boolean => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return playedSet.has(dateStr);
  };
  
  // Count played days this month
  const playedThisMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .filter(day => wasPlayed(day)).length;
  
  // Get month name
  const monthNames = lang === 'it' 
    ? ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayAbbrevs = lang === 'it'
    ? ['D', 'L', 'M', 'M', 'G', 'V', 'S']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <motion.div 
      className={`play-calendar glass-card ${isExpanded ? 'expanded' : 'collapsed'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Collapsed view - just streak and icon */}
      <button 
        className="calendar-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="calendar-icon">📅</span>
        {!isExpanded && (
          <div className="calendar-mini-info">
            <span className="calendar-streak">🔥 {streak}</span>
            <span className="calendar-played">{playedThisMonth}/{daysInMonth}</span>
          </div>
        )}
        <span className="calendar-chevron">{isExpanded ? '▲' : '▼'}</span>
      </button>
      
      {/* Expanded view - full calendar */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="calendar-expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="calendar-header">
              <span className="calendar-month">{monthNames[currentMonth]} {currentYear}</span>
              <span className="calendar-subtitle">
                {lang === 'it' ? `${petName} giocato` : `${petName} played`}: {playedThisMonth} {lang === 'it' ? 'giorni' : 'days'}
              </span>
            </div>
            
            {/* Day abbreviations row */}
            <div className="calendar-days-header">
              {dayAbbrevs.map((day, i) => (
                <span key={i} className="calendar-day-abbrev">{day}</span>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="calendar-grid">
              {/* Empty cells for days before first of month */}
              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <span key={`empty-${i}`} className="calendar-day empty" />
              ))}
              
              {/* Actual days */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const isToday = day === today.getDate();
                const played = wasPlayed(day);
                const isFuture = day > today.getDate();
                
                return (
                  <span 
                    key={day} 
                    className={`calendar-day ${played ? 'played' : ''} ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''}`}
                  >
                    <span className="day-number">{day}</span>
                    {played && <span className="played-dot">🐱</span>}
                  </span>
                );
              })}
            </div>
            
            {/* Streak display */}
            <div className="calendar-footer">
              <span className="streak-badge">
                🔥 {streak} {lang === 'it' ? 'giorni di fila!' : 'day streak!'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ==================== LOADING SPINNER (T1156) ====================
function LoadingSpinner({ lang }: { lang: Language }) {
  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner-container">
        {/* Animated moon */}
        <motion.div
          className="loading-moon"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 360],
          }}
          transition={{
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
          }}
        >
          🌙
        </motion.div>
        
        {/* Orbiting stars */}
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="loading-star"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.3,
            }}
            style={{
              position: 'absolute',
              transformOrigin: '0 60px',
            }}
          >
            <motion.span
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              style={{ display: 'block', fontSize: `${1.2 - i * 0.2}rem` }}
            >
              ✨
            </motion.span>
          </motion.span>
        ))}
        
        {/* Loading text */}
        <motion.p
          className="loading-text"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {lang === 'it' ? 'Caricamento...' : 'Loading...'}
        </motion.p>
        
        {/* Animated dots */}
        <div className="loading-dots">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="loading-dot"
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            >
              ⭐
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== PET TRAINING MODAL (T1202) ====================
// Mini-game to teach Luna new tricks for XP rewards!
function PetTrainingModal({
  lang,
  petName,
  playerLevel,
  trainingState,
  onLearnTrick,
  onPractice,
  onClose,
  playSound,
}: {
  lang: Language;
  petName: string;
  playerLevel: number;
  trainingState: PetTrainingState;
  onLearnTrick: (trickId: string, xpReward: number) => void;
  onPractice: (trickId: string) => void;
  onClose: () => void;
  playSound: (sound: string) => void;
}) {
  const t = translations[lang];
  const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [inputSequence, setInputSequence] = useState<string[]>([]);
  const [showSequence, setShowSequence] = useState(false);
  const [currentShowIndex, setCurrentShowIndex] = useState(0);
  const [result, setResult] = useState<'success' | 'fail' | 'perfect' | null>(null);
  const [showingOff, setShowingOff] = useState<string | null>(null);
  const [practiceProgress, setPracticeProgress] = useState(0);
  
  // Arrow buttons for input
  const arrows = ['⬆️', '⬇️', '⬅️', '➡️'];
  
  // Get difficulty color
  const getDifficultyColor = (difficulty: Trick['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
    }
  };
  
  // Check if trick is unlocked (level requirement met)
  const isTrickUnlocked = (trick: Trick) => playerLevel >= trick.unlockLevel;
  
  // Check if trick is learned
  const isTrickLearned = (trickId: string) => trainingState.learnedTricks.includes(trickId);
  
  // Start training sequence
  const startTraining = (trick: Trick) => {
    setSelectedTrick(trick);
    setIsTraining(false);
    setInputSequence([]);
    setResult(null);
    setShowSequence(true);
    setCurrentShowIndex(0);
    setPracticeProgress(trainingState.practiceCount[trick.id] || 0);
    
    playSound('ui-click');
    haptic.medium();
    
    // Show the sequence one by one
    let index = 0;
    const interval = setInterval(() => {
      setCurrentShowIndex(index);
      playSound('ui-click');
      haptic.light();
      index++;
      
      if (index >= trick.sequence.length) {
        clearInterval(interval);
        // After showing sequence, let player input
        setTimeout(() => {
          setShowSequence(false);
          setIsTraining(true);
        }, 800);
      }
    }, 600);
  };
  
  // Handle arrow button press
  const handleArrowPress = (arrow: string) => {
    if (!isTraining || !selectedTrick) return;
    
    playSound('ui-click');
    haptic.light();
    
    const newSequence = [...inputSequence, arrow];
    setInputSequence(newSequence);
    
    // Check if sequence matches so far
    const expectedIndex = newSequence.length - 1;
    if (selectedTrick.sequence[expectedIndex] !== arrow) {
      // Wrong input!
      setResult('fail');
      setIsTraining(false);
      playSound('ui-error');
      haptic.error();
      
      // Reset after showing fail
      setTimeout(() => {
        setResult(null);
        setInputSequence([]);
      }, 1500);
      return;
    }
    
    // Check if sequence is complete
    if (newSequence.length === selectedTrick.sequence.length) {
      // Correct sequence!
      setIsTraining(false);
      
      const isAlreadyLearned = isTrickLearned(selectedTrick.id);
      
      if (isAlreadyLearned) {
        // Just practicing - give partial XP
        setResult('success');
        playSound('ui-success');
        haptic.success();
        onPractice(selectedTrick.id);
        setPracticeProgress(prev => prev + 1);
      } else {
        // Need to practice a few times to learn (easy: 2, medium: 3, hard: 4)
        const requiredPractice = selectedTrick.difficulty === 'easy' ? 2 : 
                                  selectedTrick.difficulty === 'medium' ? 3 : 4;
        const currentPractice = (trainingState.practiceCount[selectedTrick.id] || 0) + 1;
        
        if (currentPractice >= requiredPractice) {
          // Trick learned!
          setResult('perfect');
          playSound('achievement');
          playSound('sparkle');
          haptic.success();
          onLearnTrick(selectedTrick.id, selectedTrick.xpReward);
        } else {
          // Getting closer!
          setResult('success');
          playSound('ui-success');
          haptic.success();
          onPractice(selectedTrick.id);
          setPracticeProgress(currentPractice);
        }
      }
      
      // Reset after showing result
      setTimeout(() => {
        setResult(null);
        setInputSequence([]);
        if (result === 'perfect') {
          setSelectedTrick(null);
        }
      }, 2000);
    }
  };
  
  // Show off a learned trick
  const showOffTrick = (trick: Trick) => {
    setShowingOff(trick.id);
    playSound('action-play');
    haptic.success();
    
    setTimeout(() => {
      setShowingOff(null);
    }, 2000);
  };
  
  // Get practice progress for a trick
  const getPracticeProgress = (trick: Trick) => {
    const current = trainingState.practiceCount[trick.id] || 0;
    const required = trick.difficulty === 'easy' ? 2 : 
                     trick.difficulty === 'medium' ? 3 : 4;
    return { current, required };
  };
  
  // Group tricks by difficulty
  const easyTricks = TRICKS.filter(t => t.difficulty === 'easy');
  const mediumTricks = TRICKS.filter(t => t.difficulty === 'medium');
  const hardTricks = TRICKS.filter(t => t.difficulty === 'hard');

  return (
    <motion.div 
      className="pet-training-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="pet-training-modal glass-card"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="training-header">
          <h2 className="training-title">{t.petTraining.title}</h2>
          <button className="training-close" onClick={onClose}>✕</button>
        </div>
        
        <p className="training-subtitle">{t.petTraining.subtitle}</p>
        
        {/* Stats display */}
        <div className="training-stats">
          <span className="training-stat">
            🎓 {t.petTraining.tricksLearned.replace('{count}', String(trainingState.learnedTricks.length))}
          </span>
          <span className="training-stat level">
            Lv.{playerLevel}
          </span>
        </div>
        
        {/* Selected trick training view */}
        {selectedTrick && (
          <motion.div 
            className="training-active"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Trick being trained */}
            <div className="training-trick-display">
              <motion.span 
                className="trick-emoji-large"
                animate={showingOff === selectedTrick.id ? {
                  scale: [1, 1.3, 1],
                  rotate: selectedTrick.id === 'spin' ? [0, 360] : 
                          selectedTrick.id === 'jump' ? [0, 0] : [-5, 5, -5],
                  y: selectedTrick.id === 'jump' ? [0, -30, 0] : 0,
                } : { scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                {selectedTrick.emoji}
              </motion.span>
              <span className="trick-name-large">{selectedTrick.name[lang]}</span>
              
              {/* Progress bar for learning */}
              {!isTrickLearned(selectedTrick.id) && (
                <div className="trick-progress">
                  <span className="progress-label">
                    {t.petTraining.progress
                      .replace('{current}', String(getPracticeProgress(selectedTrick).current))
                      .replace('{total}', String(getPracticeProgress(selectedTrick).required))}
                  </span>
                  <div className="progress-bar">
                    <motion.div 
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${(getPracticeProgress(selectedTrick).current / getPracticeProgress(selectedTrick).required) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Sequence display (showing the pattern) */}
            {showSequence && (
              <div className="sequence-display">
                <p className="sequence-instruction">{t.petTraining.instructions}</p>
                <div className="sequence-arrows">
                  {selectedTrick.sequence.map((arrow, i) => (
                    <motion.span
                      key={i}
                      className={`sequence-arrow ${i <= currentShowIndex ? 'visible' : ''}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={i <= currentShowIndex ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', damping: 12 }}
                    >
                      {arrow}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Input area */}
            {isTraining && (
              <div className="training-input">
                <p className="input-instruction">{t.petTraining.instructions}</p>
                
                {/* Show what user has input so far */}
                <div className="input-sequence">
                  {selectedTrick.sequence.map((_, i) => (
                    <span 
                      key={i} 
                      className={`input-slot ${inputSequence[i] ? 'filled' : ''}`}
                    >
                      {inputSequence[i] || '?'}
                    </span>
                  ))}
                </div>
                
                {/* Arrow buttons */}
                <div className="arrow-buttons">
                  <div className="arrow-row">
                    <button 
                      className="arrow-btn"
                      onClick={() => handleArrowPress('⬆️')}
                    >
                      ⬆️
                    </button>
                  </div>
                  <div className="arrow-row">
                    <button 
                      className="arrow-btn"
                      onClick={() => handleArrowPress('⬅️')}
                    >
                      ⬅️
                    </button>
                    <button 
                      className="arrow-btn"
                      onClick={() => handleArrowPress('⬇️')}
                    >
                      ⬇️
                    </button>
                    <button 
                      className="arrow-btn"
                      onClick={() => handleArrowPress('➡️')}
                    >
                      ➡️
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Result display */}
            <AnimatePresence>
              {result && (
                <motion.div
                  className={`training-result ${result}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  {result === 'perfect' && (
                    <>
                      <span className="result-emoji">🎉</span>
                      <span className="result-text">{t.petTraining.perfect}</span>
                      <span className="result-xp">{t.petTraining.xpReward.replace('{xp}', String(selectedTrick.xpReward))}</span>
                    </>
                  )}
                  {result === 'success' && (
                    <>
                      <span className="result-emoji">🌟</span>
                      <span className="result-text">{t.petTraining.success}</span>
                    </>
                  )}
                  {result === 'fail' && (
                    <>
                      <span className="result-emoji">😅</span>
                      <span className="result-text">{t.petTraining.fail}</span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Back button */}
            <button 
              className="training-back-btn"
              onClick={() => setSelectedTrick(null)}
            >
              ← {t.petTraining.selectTrick}
            </button>
          </motion.div>
        )}
        
        {/* Trick selection grid (when no trick selected) */}
        {!selectedTrick && (
          <div className="tricks-list">
            {/* Easy tricks */}
            <div className="tricks-section">
              <h3 className="section-title" style={{ color: getDifficultyColor('easy') }}>
                🌱 {t.petTraining.difficulty.easy}
              </h3>
              <div className="tricks-grid">
                {easyTricks.map(trick => {
                  const unlocked = isTrickUnlocked(trick);
                  const learned = isTrickLearned(trick.id);
                  const progress = getPracticeProgress(trick);
                  
                  return (
                    <motion.button
                      key={trick.id}
                      className={`trick-item ${!unlocked ? 'locked' : ''} ${learned ? 'learned' : ''}`}
                      onClick={() => unlocked && startTraining(trick)}
                      whileHover={unlocked ? { scale: 1.05 } : {}}
                      whileTap={unlocked ? { scale: 0.95 } : {}}
                      disabled={!unlocked}
                    >
                      <span className="trick-emoji">{trick.emoji}</span>
                      <span className="trick-name">{trick.name[lang]}</span>
                      {!unlocked && (
                        <span className="trick-lock">
                          🔒 Lv.{trick.unlockLevel}
                        </span>
                      )}
                      {unlocked && learned && (
                        <span className="trick-learned-badge">✓</span>
                      )}
                      {unlocked && !learned && progress.current > 0 && (
                        <span className="trick-progress-mini">
                          {progress.current}/{progress.required}
                        </span>
                      )}
                      {learned && (
                        <button
                          className="show-off-btn"
                          onClick={(e) => { e.stopPropagation(); showOffTrick(trick); }}
                        >
                          {t.petTraining.showOff}
                        </button>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            
            {/* Medium tricks */}
            <div className="tricks-section">
              <h3 className="section-title" style={{ color: getDifficultyColor('medium') }}>
                🌿 {t.petTraining.difficulty.medium}
              </h3>
              <div className="tricks-grid">
                {mediumTricks.map(trick => {
                  const unlocked = isTrickUnlocked(trick);
                  const learned = isTrickLearned(trick.id);
                  const progress = getPracticeProgress(trick);
                  
                  return (
                    <motion.button
                      key={trick.id}
                      className={`trick-item ${!unlocked ? 'locked' : ''} ${learned ? 'learned' : ''}`}
                      onClick={() => unlocked && startTraining(trick)}
                      whileHover={unlocked ? { scale: 1.05 } : {}}
                      whileTap={unlocked ? { scale: 0.95 } : {}}
                      disabled={!unlocked}
                    >
                      <span className="trick-emoji">{trick.emoji}</span>
                      <span className="trick-name">{trick.name[lang]}</span>
                      {!unlocked && (
                        <span className="trick-lock">
                          🔒 Lv.{trick.unlockLevel}
                        </span>
                      )}
                      {unlocked && learned && (
                        <span className="trick-learned-badge">✓</span>
                      )}
                      {unlocked && !learned && progress.current > 0 && (
                        <span className="trick-progress-mini">
                          {progress.current}/{progress.required}
                        </span>
                      )}
                      {learned && (
                        <button
                          className="show-off-btn"
                          onClick={(e) => { e.stopPropagation(); showOffTrick(trick); }}
                        >
                          {t.petTraining.showOff}
                        </button>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            
            {/* Hard tricks */}
            <div className="tricks-section">
              <h3 className="section-title" style={{ color: getDifficultyColor('hard') }}>
                🌳 {t.petTraining.difficulty.hard}
              </h3>
              <div className="tricks-grid">
                {hardTricks.map(trick => {
                  const unlocked = isTrickUnlocked(trick);
                  const learned = isTrickLearned(trick.id);
                  const progress = getPracticeProgress(trick);
                  
                  return (
                    <motion.button
                      key={trick.id}
                      className={`trick-item ${!unlocked ? 'locked' : ''} ${learned ? 'learned' : ''}`}
                      onClick={() => unlocked && startTraining(trick)}
                      whileHover={unlocked ? { scale: 1.05 } : {}}
                      whileTap={unlocked ? { scale: 0.95 } : {}}
                      disabled={!unlocked}
                    >
                      <span className="trick-emoji">{trick.emoji}</span>
                      <span className="trick-name">{trick.name[lang]}</span>
                      {!unlocked && (
                        <span className="trick-lock">
                          🔒 Lv.{trick.unlockLevel}
                        </span>
                      )}
                      {unlocked && learned && (
                        <span className="trick-learned-badge">✓</span>
                      )}
                      {unlocked && !learned && progress.current > 0 && (
                        <span className="trick-progress-mini">
                          {progress.current}/{progress.required}
                        </span>
                      )}
                      {learned && (
                        <button
                          className="show-off-btn"
                          onClick={(e) => { e.stopPropagation(); showOffTrick(trick); }}
                        >
                          {t.petTraining.showOff}
                        </button>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Luna animation area */}
        <motion.div 
          className="training-luna"
          animate={showingOff ? {
            scale: [1, 1.2, 1],
            rotate: showingOff === 'spin' ? [0, 360] : 
                    showingOff === 'roll' ? [0, 360] : [-5, 5, -5],
            y: showingOff === 'jump' || showingOff === 'backflip' ? [0, -30, 0] : 0,
          } : { scale: 1 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          <span className="luna-emoji">🐱</span>
          {showingOff && (
            <motion.div
              className="show-off-sparkles"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {['✨', '⭐', '🌟', '💫'].map((s, i) => (
                <motion.span
                  key={i}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.2,
                    repeat: 1,
                  }}
                  style={{
                    position: 'absolute',
                    left: `${20 + i * 20}%`,
                    top: '-20px',
                  }}
                >
                  {s}
                </motion.span>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ==================== PET HEALTH CHECKUP MODAL (T1330) ====================
// Vet visit feature - shows pet health analysis and tips! 🏥
function HealthCheckupModal({
  lang,
  petName,
  stats,
  lastCheckup,
  onCheckup,
  onClose,
  playSound,
  vaccinationState,
  onUpdateVaccination,
}: {
  lang: Language;
  petName: string;
  stats: PetStats;
  lastCheckup: number;
  onCheckup: (coins: number, xp: number) => void;
  onClose: () => void;
  playSound: (sound: string) => void;
  vaccinationState: VaccinationState;
  onUpdateVaccination: (state: VaccinationState) => void;
}) {
  const t = translations[lang];
  const [hasCheckedThisSession, setHasCheckedThisSession] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'checkup' | 'vaccines'>('checkup');
  const [showAddVaccine, setShowAddVaccine] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState<string | null>(null);
  
  // Calculate overall health score (0-100)
  const overallScore = Math.round(
    (stats.health * 0.35) + 
    (stats.hunger * 0.25) + 
    (stats.happiness * 0.25) + 
    (stats.energy * 0.15)
  );
  
  // Get health rating
  const getHealthRating = () => {
    if (overallScore >= 80) return { text: t.healthCheckup.excellent, color: '#4ade80', emoji: '🌟' };
    if (overallScore >= 60) return { text: t.healthCheckup.good, color: '#a3e635', emoji: '😊' };
    if (overallScore >= 40) return { text: t.healthCheckup.fair, color: '#fbbf24', emoji: '😐' };
    if (overallScore >= 20) return { text: t.healthCheckup.poor, color: '#fb923c', emoji: '😟' };
    return { text: t.healthCheckup.critical, color: '#f87171', emoji: '🚨' };
  };
  
  // Get stat level for tips
  const getStatLevel = (value: number): 'low' | 'medium' | 'high' => {
    if (value < 35) return 'low';
    if (value < 70) return 'medium';
    return 'high';
  };
  
  // Get the most urgent tip
  const getMainTip = () => {
    const stats_arr = [
      { key: 'hunger' as const, value: stats.hunger },
      { key: 'energy' as const, value: stats.energy },
      { key: 'health' as const, value: stats.health },
      { key: 'happiness' as const, value: stats.happiness },
    ];
    
    // Find the lowest stat
    const lowest = stats_arr.reduce((min, stat) => 
      stat.value < min.value ? stat : min
    );
    
    return t.healthCheckup.tips[lowest.key][getStatLevel(lowest.value)];
  };
  
  // Format last checkup time
  const formatLastCheckup = () => {
    if (!lastCheckup) return t.healthCheckup.neverChecked;
    
    const diff = Date.now() - lastCheckup;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return t.healthCheckup.lastCheckup.replace('{time}', 
      lang === 'it' ? `${days} giorni fa` : `${days} days ago`);
    if (hours > 0) return t.healthCheckup.lastCheckup.replace('{time}',
      lang === 'it' ? `${hours} ore fa` : `${hours} hours ago`);
    if (minutes > 0) return t.healthCheckup.lastCheckup.replace('{time}',
      lang === 'it' ? `${minutes} minuti fa` : `${minutes} minutes ago`);
    return t.healthCheckup.lastCheckup.replace('{time}',
      lang === 'it' ? 'poco fa' : 'just now');
  };
  
  // Handle checkup - give bonus if not checked recently (1 hour cooldown)
  const handleCheckup = () => {
    playSound('ui-click');
    haptic.medium();
    setShowResults(true);
    
    // Only give bonus if not checked in the last hour
    const oneHour = 3600000;
    const canGetBonus = Date.now() - lastCheckup > oneHour;
    
    if (canGetBonus && !hasCheckedThisSession) {
      const bonusCoins = 10;
      const bonusXp = 15;
      onCheckup(bonusCoins, bonusXp);
      setHasCheckedThisSession(true);
      playSound('coin-collect');
      playSound('ui-success');
      haptic.success();
    } else {
      playSound('ui-success');
    }
  };
  
  const rating = getHealthRating();
  const canGetBonus = Date.now() - lastCheckup > 3600000 && !hasCheckedThisSession;

  return (
    <motion.div 
      className="health-checkup-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <motion.div 
        className="health-checkup-modal glass-card"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,248,255,0.95))',
          borderRadius: '24px',
          padding: '24px',
          maxWidth: '400px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(100,200,255,0.2)',
          border: '3px solid #87ceeb',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#2c3e50' }}>
            {t.healthCheckup.title}
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(0,0,0,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '1.2rem',
            }}
          >
            ✕
          </button>
        </div>
        
        <p style={{ margin: '0 0 20px', color: '#666', fontSize: '0.95rem' }}>
          {t.healthCheckup.subtitle.replace('{name}', petName)}
        </p>
        
        {/* Doctor character */}
        <motion.div 
          style={{ textAlign: 'center', marginBottom: '16px' }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span style={{ fontSize: '4rem' }}>👨‍⚕️</span>
        </motion.div>
        
        {!showResults ? (
          /* Pre-checkup view */
          <>
            <div style={{ 
              background: 'rgba(135, 206, 235, 0.2)', 
              padding: '16px', 
              borderRadius: '16px',
              textAlign: 'center',
              marginBottom: '16px',
            }}>
              <p style={{ margin: '0 0 8px', color: '#555' }}>
                {formatLastCheckup()}
              </p>
              {canGetBonus && (
                <motion.p 
                  style={{ margin: 0, color: '#4ade80', fontWeight: 'bold' }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {t.healthCheckup.checkupBonus.replace('{coins}', '10').replace('{xp}', '15')}
                </motion.p>
              )}
            </div>
            
            <motion.button
              onClick={handleCheckup}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
              }}
            >
              {t.healthCheckup.checkNow}
            </motion.button>
          </>
        ) : (
          /* Results view */
          <>
            {/* Overall score */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              style={{
                background: `linear-gradient(135deg, ${rating.color}22, ${rating.color}11)`,
                border: `2px solid ${rating.color}`,
                borderRadius: '20px',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#666' }}>
                {t.healthCheckup.overallHealth}
              </p>
              <motion.div 
                style={{ fontSize: '3rem', marginBottom: '8px' }}
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                {rating.emoji}
              </motion.div>
              <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', color: rating.color }}>
                {rating.text}
              </p>
              <p style={{ margin: '8px 0 0', fontSize: '2rem', fontWeight: 'bold', color: rating.color }}>
                {overallScore}%
              </p>
            </motion.div>
            
            {/* Individual stats */}
            <div style={{ marginBottom: '20px' }}>
              {[
                { key: 'health', value: stats.health, emoji: '❤️', color: '#ef4444' },
                { key: 'hunger', value: stats.hunger, emoji: '🍪', color: '#f59e0b' },
                { key: 'happiness', value: stats.happiness, emoji: '💖', color: '#ec4899' },
                { key: 'energy', value: stats.energy, emoji: '⚡', color: '#3b82f6' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.key}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.5)',
                    borderRadius: '12px',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{stat.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#555' }}>
                        {t.healthCheckup.categories[stat.key as keyof typeof t.healthCheckup.categories]}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: stat.color }}>
                        {stat.value}%
                      </span>
                    </div>
                    <div style={{ 
                      height: '8px', 
                      background: 'rgba(0,0,0,0.1)', 
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        style={{
                          height: '100%',
                          background: `linear-gradient(90deg, ${stat.color}, ${stat.color}aa)`,
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Doctor's advice */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                background: 'linear-gradient(135deg, #e0f2fe, #dbeafe)',
                padding: '16px',
                borderRadius: '16px',
                marginBottom: '16px',
              }}
            >
              <p style={{ margin: '0 0 8px', fontWeight: 'bold', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>💬</span> {t.healthCheckup.doctorSays}
              </p>
              <p style={{ margin: 0, color: '#1e3a5f', fontSize: '0.95rem', lineHeight: 1.5 }}>
                {getMainTip()}
              </p>
            </motion.div>
            
            {/* Bonus notification */}
            {hasCheckedThisSession && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                  padding: '12px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  marginBottom: '16px',
                }}
              >
                <p style={{ margin: 0, color: '#166534', fontWeight: 'bold' }}>
                  🎉 {t.healthCheckup.checkupBonus.replace('{coins}', '10').replace('{xp}', '15')}
                </p>
              </motion.div>
            )}
            
            {/* Close button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
              }}
            >
              {t.healthCheckup.close}
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ==================== PET ACTIVITY LOG MODAL (T1339) ====================
// Shows what Luna did today in a timeline format
function ActivityLogModal({
  lang,
  petName,
  activityLog,
  totalPlayMinutes,
  onClose,
}: {
  lang: Language;
  petName: string;
  activityLog: ActivityLogState;
  totalPlayMinutes: number; // T1346: Total playtime in minutes
  onClose: () => void;
}) {
  const t = translations[lang];
  
  // Group activities by time of day
  const getTimeOfDayForTimestamp = (timestamp: number): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date(timestamp).getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };
  
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(lang === 'it' ? 'it-IT' : 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: lang === 'en',
    });
  };
  
  // T1346: Format total playtime as hours/minutes
  const formatPlaytime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };
  
  // Get today's activities sorted by time (most recent first)
  const todayActivities = [...activityLog.entries].sort((a, b) => b.timestamp - a.timestamp);
  
  // Calculate summary stats
  const summaryStats = todayActivities.reduce(
    (acc, entry) => ({
      happinessGained: acc.happinessGained + (entry.stats?.happiness || 0),
      energyUsed: acc.energyUsed + Math.abs(entry.stats?.energy || 0),
      coinsCollected: acc.coinsCollected + (entry.stats?.coins || 0),
    }),
    { happinessGained: 0, energyUsed: 0, coinsCollected: 0 }
  );
  
  // Group by time of day
  const groupedActivities = {
    morning: todayActivities.filter(a => getTimeOfDayForTimestamp(a.timestamp) === 'morning'),
    afternoon: todayActivities.filter(a => getTimeOfDayForTimestamp(a.timestamp) === 'afternoon'),
    evening: todayActivities.filter(a => getTimeOfDayForTimestamp(a.timestamp) === 'evening'),
    night: todayActivities.filter(a => getTimeOfDayForTimestamp(a.timestamp) === 'night'),
  };
  
  const timeLabels: Record<string, { emoji: string; label: string }> = {
    morning: { emoji: '🌅', label: t.activityLog.morning },
    afternoon: { emoji: '☀️', label: t.activityLog.afternoon },
    evening: { emoji: '🌆', label: t.activityLog.evening },
    night: { emoji: '🌙', label: t.activityLog.night },
  };

  return (
    <motion.div
      className="activity-log-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <motion.div
        className="activity-log-modal glass-card"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(245,245,255,0.95))',
          borderRadius: '24px',
          padding: '24px',
          maxWidth: '420px',
          width: '100%',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: '3rem', marginBottom: '8px' }}
          >
            📓
          </motion.div>
          <h2 style={{ margin: '0 0 4px', color: '#4a4a6a', fontSize: '1.4rem' }}>
            {t.activityLog.title}
          </h2>
          <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>
            {t.activityLog.subtitle.replace('{name}', petName)}
          </p>
          <div style={{ 
            display: 'inline-block',
            background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            marginTop: '8px',
          }}>
            {t.activityLog.today} • {t.activityLog.activitiesCount.replace('{count}', String(todayActivities.length))}
          </div>
        </div>
        
        {/* Summary Stats */}
        {todayActivities.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            justifyContent: 'center',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              padding: '8px 12px',
              borderRadius: '12px',
              textAlign: 'center',
              flex: 1,
            }}>
              <div style={{ fontSize: '1.2rem' }}>💖</div>
              <div style={{ fontSize: '0.75rem', color: '#92400e' }}>+{summaryStats.happinessGained}</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
              padding: '8px 12px',
              borderRadius: '12px',
              textAlign: 'center',
              flex: 1,
            }}>
              <div style={{ fontSize: '1.2rem' }}>⚡</div>
              <div style={{ fontSize: '0.75rem', color: '#065f46' }}>-{summaryStats.energyUsed}</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
              padding: '8px 12px',
              borderRadius: '12px',
              textAlign: 'center',
              flex: 1,
            }}>
              <div style={{ fontSize: '1.2rem' }}>✨</div>
              <div style={{ fontSize: '0.75rem', color: '#5b21b6' }}>+{summaryStats.coinsCollected}</div>
            </div>
          </div>
        )}
        
        {/* T1346: Total Playtime Stats */}
        <div style={{
          background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
          padding: '12px 16px',
          borderRadius: '14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(236, 72, 153, 0.15)',
        }}>
          <div style={{ fontSize: '1.8rem' }}>⏱️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: '#9d174d', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t.activityLog.stats.playtime}
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#831843' }}>
              {formatPlaytime(totalPlayMinutes)}
            </div>
          </div>
          <div style={{ fontSize: '1.5rem' }}>🎮</div>
        </div>
        
        {/* Timeline */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '8px',
          marginBottom: '16px',
        }}>
          {todayActivities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                padding: '32px 16px',
                color: '#888',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😴</div>
              <p style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {t.activityLog.noActivities}
              </p>
            </motion.div>
          ) : (
            Object.entries(groupedActivities).map(([timeKey, activities]) => {
              if (activities.length === 0) return null;
              const timeInfo = timeLabels[timeKey];
              
              return (
                <div key={timeKey} style={{ marginBottom: '16px' }}>
                  {/* Time period header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    padding: '4px 8px',
                    background: 'rgba(0,0,0,0.03)',
                    borderRadius: '8px',
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>{timeInfo.emoji}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#666' }}>
                      {timeInfo.label}
                    </span>
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: '0.7rem',
                      background: '#e5e7eb',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      color: '#555',
                    }}>
                      {activities.length}
                    </span>
                  </div>
                  
                  {/* Activity items */}
                  {activities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        marginBottom: '6px',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        borderLeft: '4px solid #a78bfa',
                      }}
                    >
                      {/* Activity emoji */}
                      <div style={{
                        fontSize: '1.5rem',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
                        borderRadius: '10px',
                      }}>
                        {activity.emoji}
                      </div>
                      
                      {/* Activity info */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '2px',
                        }}>
                          {activity.description[lang]}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#9ca3af',
                        }}>
                          {formatTime(activity.timestamp)}
                        </div>
                      </div>
                      
                      {/* Stat badges */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                        {activity.stats?.happiness && activity.stats.happiness > 0 && (
                          <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>
                            +{activity.stats.happiness} 💖
                          </span>
                        )}
                        {activity.stats?.coins && activity.stats.coins > 0 && (
                          <span style={{ fontSize: '0.7rem', color: '#8b5cf6' }}>
                            +{activity.stats.coins} ✨
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })
          )}
        </div>
        
        {/* Close button */}
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
          }}
        >
          {t.activityLog.close}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ==================== PET FAVORITE ROOM MODAL (T1345) ====================
// Shows Luna's favorite room and room visit statistics
function FavoriteRoomModal({
  lang,
  petName,
  favoriteRoomState,
  onClose,
}: {
  lang: Language;
  petName: string;
  favoriteRoomState: FavoriteRoomState;
  onClose: () => void;
}) {
  const t = translations[lang];
  
  // Get room emoji by key
  const getRoomEmoji = (roomKey: RoomKey): string => {
    const emojis: Record<RoomKey, string> = {
      bedroom: '🛏️', kitchen: '🍳', garden: '🌻', living: '🛋️',
      bathroom: '🛁', garage: '🚗', shop: '👗', supermarket: '🛒',
      attic: '📦', basement: '🔧', library: '📚',
    };
    return emojis[roomKey] || '🏠';
  };
  
  // Sort rooms by visit count (descending)
  const sortedRooms = Object.entries(favoriteRoomState.visitCounts)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0);
  
  const totalVisits = sortedRooms.reduce((sum, [, count]) => sum + count, 0);
  const favoriteRoom = favoriteRoomState.favoriteRoom;
  const favoriteCount = favoriteRoom ? favoriteRoomState.visitCounts[favoriteRoom] : 0;

  return (
    <motion.div
      className="favorite-room-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <motion.div
        className="favorite-room-modal glass-card"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #fff9e6, #fff5f8, #f5f0ff)',
          borderRadius: '24px',
          padding: '24px',
          maxWidth: '380px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: '3rem', marginBottom: '8px' }}
          >
            🏠
          </motion.div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#7c3aed' }}>
            {t.favoriteRoom.title}
          </h2>
          <p style={{ margin: '8px 0 0', color: '#666', fontSize: '0.9rem' }}>
            {t.favoriteRoom.subtitle.replace('{name}', petName)}
          </p>
        </div>
        
        {/* Favorite Room Display */}
        {favoriteRoom && totalVisits >= 5 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '20px',
              border: '3px solid #fbbf24',
              boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)',
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>
              {getRoomEmoji(favoriteRoom)}
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#92400e', marginBottom: '4px' }}>
              {t.rooms[favoriteRoom]}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#78350f' }}>
              {t.favoriteRoom.visits.replace('{count}', String(favoriteCount))} ⭐
            </div>
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ marginTop: '8px', fontSize: '0.8rem', color: '#b45309' }}
            >
              {t.favoriteRoom.loves.replace('{name}', petName)}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '20px',
              border: '2px dashed #a78bfa',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔍</div>
            <div style={{ fontSize: '1rem', color: '#7c3aed', fontWeight: '600' }}>
              {t.favoriteRoom.justStarted}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '8px' }}>
              {t.favoriteRoom.tip}
            </div>
          </motion.div>
        )}
        
        {/* Room Stats List */}
        {sortedRooms.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#666',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              📊 {t.favoriteRoom.topRooms}
            </div>
            
            {sortedRooms.slice(0, 5).map(([roomKey, count], index) => {
              const percentage = totalVisits > 0 ? (count / totalVisits) * 100 : 0;
              const isFavorite = roomKey === favoriteRoom;
              
              return (
                <motion.div
                  key={roomKey}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    marginBottom: '8px',
                    background: isFavorite ? 'linear-gradient(135deg, #fef9c3, #fef08a)' : 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: isFavorite ? '2px solid #fbbf24' : '1px solid #e5e7eb',
                  }}
                >
                  {/* Medal/Rank */}
                  <div style={{
                    fontSize: '1.2rem',
                    width: '28px',
                    textAlign: 'center',
                  }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </div>
                  
                  {/* Room emoji */}
                  <div style={{
                    fontSize: '1.5rem',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
                    borderRadius: '10px',
                  }}>
                    {getRoomEmoji(roomKey as RoomKey)}
                  </div>
                  
                  {/* Room info */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '4px',
                    }}>
                      {t.rooms[roomKey as RoomKey]}
                    </div>
                    {/* Progress bar */}
                    <div style={{
                      height: '6px',
                      background: '#e5e7eb',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        style={{
                          height: '100%',
                          background: isFavorite 
                            ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' 
                            : 'linear-gradient(90deg, #a78bfa, #818cf8)',
                          borderRadius: '3px',
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Visit count */}
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: isFavorite ? '#b45309' : '#8b5cf6',
                    minWidth: '50px',
                    textAlign: 'right',
                  }}>
                    {count}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* Empty state */}
        {sortedRooms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '20px',
              color: '#888',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🗺️</div>
            <p>{t.favoriteRoom.noFavorite}</p>
          </motion.div>
        )}
        
        {/* Close button */}
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
          }}
        >
          {t.activityLog.close}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ==================== PET SLEEP SCHEDULE MODAL (T1356) ====================
// Configure bedtime reminders to help kids establish healthy sleep routines!
function SleepScheduleModal({
  lang,
  petName,
  sleepSchedule,
  onSave,
  onClose,
}: {
  lang: Language;
  petName: string;
  sleepSchedule: SleepScheduleState;
  onSave: (schedule: SleepScheduleState) => void;
  onClose: () => void;
}) {
  const t = translations[lang];
  const [localSchedule, setLocalSchedule] = useState<SleepScheduleState>(sleepSchedule);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    onSave(localSchedule);
    setShowSaved(true);
    haptic.success();
    setTimeout(() => {
      setShowSaved(false);
      onClose();
    }, 1000);
  };

  const reminderOptions = [5, 10, 15, 30, 45, 60];

  return (
    <motion.div
      className="sleep-schedule-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 30, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <motion.div
        className="sleep-schedule-modal glass-card"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81, #1e1b4b)',
          borderRadius: '24px',
          padding: '24px',
          maxWidth: '380px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(139, 92, 246, 0.3)',
          border: '2px solid rgba(139, 92, 246, 0.3)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ fontSize: '3.5rem', marginBottom: '12px' }}
          >
            🌙
          </motion.div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#e0e7ff' }}>
            {t.sleepSchedule.title}
          </h2>
          <p style={{ margin: '8px 0 0', color: '#a5b4fc', fontSize: '0.9rem' }}>
            {t.sleepSchedule.subtitle.replace('{name}', petName)}
          </p>
        </div>

        {/* Enable/Disable Toggle */}
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: localSchedule.enabled 
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(74, 222, 128, 0.2))'
              : 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            marginBottom: '20px',
            border: localSchedule.enabled 
              ? '2px solid rgba(34, 197, 94, 0.5)'
              : '2px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>
              {localSchedule.enabled ? '✅' : '💤'}
            </span>
            <span style={{ color: '#e0e7ff', fontWeight: '600' }}>
              {localSchedule.enabled ? t.sleepSchedule.enabled : t.sleepSchedule.disabled}
            </span>
          </div>
          <motion.button
            onClick={() => {
              setLocalSchedule(prev => ({ ...prev, enabled: !prev.enabled }));
              haptic.light();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '8px 16px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              background: localSchedule.enabled 
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            {t.sleepSchedule.toggle}
          </motion.button>
        </motion.div>

        {/* Bedtime Setting */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            color: '#c7d2fe', 
            marginBottom: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
          }}>
            🛏️ {t.sleepSchedule.bedtime}
          </label>
          <input
            type="time"
            value={localSchedule.bedtime}
            onChange={(e) => setLocalSchedule(prev => ({ ...prev, bedtime: e.target.value }))}
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: '1.2rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              color: '#e0e7ff',
              outline: 'none',
            }}
          />
        </div>

        {/* Wake Time Setting */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            color: '#c7d2fe', 
            marginBottom: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
          }}>
            ☀️ {t.sleepSchedule.wakeTime}
          </label>
          <input
            type="time"
            value={localSchedule.wakeTime}
            onChange={(e) => setLocalSchedule(prev => ({ ...prev, wakeTime: e.target.value }))}
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: '1.2rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              color: '#e0e7ff',
              outline: 'none',
            }}
          />
        </div>

        {/* Reminder Minutes */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            color: '#c7d2fe', 
            marginBottom: '12px',
            fontSize: '0.9rem',
            fontWeight: '600',
          }}>
            ⏰ {t.sleepSchedule.reminderBefore.replace('{minutes}', String(localSchedule.reminderMinutes))}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {reminderOptions.map(minutes => (
              <motion.button
                key={minutes}
                onClick={() => {
                  setLocalSchedule(prev => ({ ...prev, reminderMinutes: minutes }));
                  haptic.light();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '10px 16px',
                  fontSize: '0.9rem',
                  fontWeight: localSchedule.reminderMinutes === minutes ? 'bold' : '500',
                  background: localSchedule.reminderMinutes === minutes 
                    ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: localSchedule.reminderMinutes === minutes ? 'white' : '#c7d2fe',
                  border: localSchedule.reminderMinutes === minutes 
                    ? '2px solid #a78bfa'
                    : '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                {minutes} min
              </motion.button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {localSchedule.enabled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '16px',
              background: 'rgba(139, 92, 246, 0.15)',
              borderRadius: '16px',
              marginBottom: '24px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              color: '#e0e7ff',
              fontSize: '0.9rem',
            }}>
              <span style={{ fontSize: '1.3rem' }}>💡</span>
              <span>
                {petName} {lang === 'it' ? 'riceverà un promemoria alle' : 'will get a reminder at'}{' '}
                <strong>
                  {(() => {
                    const [hours, minutes] = localSchedule.bedtime.split(':').map(Number);
                    const reminderTime = new Date();
                    reminderTime.setHours(hours, minutes - localSchedule.reminderMinutes, 0, 0);
                    return reminderTime.toLocaleTimeString(lang === 'it' ? 'it-IT' : 'en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: lang === 'en',
                    });
                  })()}
                </strong>
              </span>
            </div>
          </motion.div>
        )}

        {/* Saved Message */}
        <AnimatePresence>
          {showSaved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '20px 40px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                borderRadius: '16px',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                boxShadow: '0 10px 40px rgba(34, 197, 94, 0.5)',
                zIndex: 10,
              }}
            >
              {t.sleepSchedule.saved}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              flex: 1,
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 'bold',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#c7d2fe',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '14px',
              cursor: 'pointer',
            }}
          >
            {t.sleepSchedule.cancel}
          </motion.button>
          <motion.button
            onClick={handleSave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              flex: 1,
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
            }}
          >
            {t.sleepSchedule.save}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== BEDTIME REMINDER POPUP (T1356) ====================
// Shows a gentle reminder when it's almost bedtime
function BedtimeReminderPopup({
  lang,
  petName,
  minutesUntilBed,
  onDismiss,
  onGoToBed,
}: {
  lang: Language;
  petName: string;
  minutesUntilBed: number;
  onDismiss: () => void;
  onGoToBed: () => void;
}) {
  const t = translations[lang];

  return (
    <motion.div
      className="bedtime-reminder-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 30, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '20px',
      }}
    >
      <motion.div
        className="bedtime-reminder-popup"
        initial={{ scale: 0.5, opacity: 0, y: 100 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          borderRadius: '28px',
          padding: '32px',
          maxWidth: '340px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 60px rgba(139, 92, 246, 0.4)',
          border: '2px solid rgba(139, 92, 246, 0.4)',
        }}
      >
        {/* Animated Moon */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0],
            y: [0, -10, 0],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: '5rem', marginBottom: '16px' }}
        >
          🌙
        </motion.div>

        {/* Stars animation */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          pointerEvents: 'none',
          overflow: 'hidden',
          borderRadius: '28px',
        }}>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: i * 0.3,
              }}
              style={{
                position: 'absolute',
                left: `${10 + (i * 12)}%`,
                top: `${10 + (i % 3) * 20}%`,
                fontSize: '1rem',
              }}
            >
              ⭐
            </motion.div>
          ))}
        </div>

        {/* Message */}
        <h2 style={{ 
          margin: '0 0 12px', 
          fontSize: '1.6rem', 
          color: '#e0e7ff',
          fontWeight: 'bold',
        }}>
          {minutesUntilBed > 0 
            ? t.sleepSchedule.bedtimeReminder 
            : t.sleepSchedule.bedtimeNow}
        </h2>

        <p style={{ 
          margin: '0 0 8px', 
          color: '#a5b4fc', 
          fontSize: '1rem',
        }}>
          {minutesUntilBed > 0 
            ? t.sleepSchedule.minutesUntilBed.replace('{minutes}', String(minutesUntilBed))
            : t.sleepSchedule.timeForBed}
        </p>

        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ 
            margin: '0 0 24px', 
            color: '#fbbf24', 
            fontSize: '1.1rem',
          }}
        >
          {t.sleepSchedule.sleepyLuna.replace('{name}', petName)}
        </motion.p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <motion.button
            onClick={onDismiss}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              flex: 1,
              padding: '14px 20px',
              fontSize: '1rem',
              fontWeight: '600',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#c7d2fe',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '14px',
              cursor: 'pointer',
            }}
          >
            OK 👍
          </motion.button>
          <motion.button
            onClick={onGoToBed}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              flex: 1,
              padding: '14px 20px',
              fontSize: '1rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5)',
            }}
          >
            {t.sleepSchedule.goodnight}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== MAIN APP ====================
function App() {
  const [lang, setLang] = useState<Language>('it');
  const t = translations[lang];
  
  // Game initialization state (T1156)
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Sound manager for effects and ambient music
  const { playSound, playAmbient, stopAmbient, toggleMute, isMuted, volume } = useSoundManager();
  
  // Separate ambient soundscape volume (0-1)
  const [ambientVolume, setAmbientVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('moonlight-ambient-volume');
      return saved ? parseFloat(saved) : 0.5;
    } catch {
      return 0.5;
    }
  });
  
  // Persist ambient volume
  const handleAmbientVolumeChange = (newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setAmbientVolume(clamped);
    try {
      localStorage.setItem('moonlight-ambient-volume', String(clamped));
    } catch {}
  };

  // Real weather integration (T667)
  const [useRealWeather, setUseRealWeather] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('moonlight-use-real-weather');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  
  // Toggle real weather and persist
  const toggleRealWeather = () => {
    const newValue = !useRealWeather;
    setUseRealWeather(newValue);
    try {
      localStorage.setItem('moonlight-use-real-weather', String(newValue));
    } catch {}
  };

  // Pet persistence - track visits and time away
  const [totalVisits, setTotalVisits] = useState<number>(() => {
    const saved = loadSaveData();
    return (saved?.totalVisits ?? 0) + 1; // Increment on each session start
  });
  
  // Pet name - saved with pet state
  const [petName, setPetName] = useState<string | null>(() => {
    const saved = loadSaveData();
    return saved?.petName ?? null; // null means first visit, needs naming
  });
  
  // T1329: Pet personality trait state
  const [petPersonality, setPetPersonality] = useState<PersonalityTrait>(() => {
    const saved = loadSaveData();
    // Assign random personality for new pets, or load existing
    return saved?.personality ?? getRandomPersonality();
  });
  
  const [showNamingModal, setShowNamingModal] = useState<boolean>(() => {
    const saved = loadSaveData();
    return !saved?.petName; // Show modal on first visit
  });
  
  // T1207: Pet rename modal state
  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
  
  const [welcomeMessage, setWelcomeMessage] = useState<{ message: string; emoji: string; hoursAway: number } | null>(null);
  
  // T1169: Pet birthday celebration state
  const [petCreatedAt, setPetCreatedAt] = useState<string>(() => {
    const saved = loadSaveData();
    return saved?.createdAt || new Date().toISOString();
  });
  
  const [lastBirthdayCelebrated, setLastBirthdayCelebrated] = useState<string | undefined>(() => {
    const saved = loadSaveData();
    return saved?.lastBirthdayCelebrated;
  });
  
  const [showBirthdayPopup, setShowBirthdayPopup] = useState<boolean>(false);
  
  // T1180: Play history - track which days the user played
  const [playHistory, setPlayHistory] = useState<string[]>(() => {
    const saved = loadSaveData();
    const existingHistory = saved?.playHistory || [];
    // Add today's date if not already present
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    if (!existingHistory.includes(today)) {
      return [...existingHistory, today];
    }
    return existingHistory;
  });
  
  // Core state (restored from save or defaults, with time-away adjustment)
  const [stats, setStats] = useState<PetStats>(() => {
    const saved = loadSaveData();
    if (!saved) {
      return { health: 80, hunger: 60, energy: 90, happiness: 75, coins: 100, level: 1, xp: 0, weight: 50 };
    }
    
    // Apply time-away stat adjustments
    const { stats: adjustedStats, hoursAway } = adjustStatsForTimeAway(saved.stats, saved.lastVisit);
    
    // Set welcome message if applicable (will be shown after mount)
    const welcome = getWelcomeMessage(hoursAway, 'it'); // Default to Italian, will update in effect
    if (welcome && hoursAway >= 0.1) {
      // Use setTimeout to set after initial render
      setTimeout(() => {
        setWelcomeMessage({ ...welcome, hoursAway });
      }, 500);
    }
    
    return adjustedStats;
  });
  const [currentRoom, setCurrentRoom] = useState(0);
  const [isActing, setIsActing] = useState(false);
  const [actionBubble, setActionBubble] = useState('');
  const [showMap, setShowMap] = useState(true);
  const [lunaPosition, setLunaPosition] = useState({ x: 50, y: 50 });
  const [floatPhase, setFloatPhase] = useState(0);

  // Enhanced state (restored from save or defaults)
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay());
  
  // Weather hook for ambient sound variations (T667)
  const { weather, isLoading: weatherLoading } = useWeather({
    enabled: useRealWeather,
    timeOfDay,
  });
  
  const [mood, setMood] = useState<MoodType>('happy');
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = loadSaveData();
    return saved?.achievements ?? defaultAchievements;
  });
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = loadSaveData();
    return saved ? {
      ...saved.gameState,
      roomsVisited: new Set(saved.gameState.roomsVisited),
      totalPlayMinutes: saved.gameState.totalPlayMinutes ?? 0, // T1346: Ensure playtime is loaded
    } : {
      dayCount: 1, totalActions: 0, roomsVisited: new Set(), lastDailyReward: null, streak: 0, totalPlayMinutes: 0,
    };
  });
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [dailyRewardAmount, setDailyRewardAmount] = useState(0);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [activeGame, setActiveGame] = useState<string | null>(null); // 'hub' | 'puzzle' | 'drawing' | 'memory' | 'stars' | 'bubbles' | 'simon' | 'catch' | 'gardening' | 'library' | 'petmemory' | null
  const [eventMessage, setEventMessage] = useState('');
  
  // Room unlock popup state (T1168)
  const [roomUnlockPopup, setRoomUnlockPopup] = useState<{ roomKey: RoomKey; roomIcon: string } | null>(null);
  
  // Pet evolution state (T1173)
  const [showEvolutionPopup, setShowEvolutionPopup] = useState<EvolutionInfo | null>(null);
  const [lastEvolutionStage, setLastEvolutionStage] = useState<EvolutionStage>(() => {
    const saved = loadSaveData();
    return getEvolutionStage(saved?.stats.level ?? 1).stage;
  });
  
  // Library books state
  const [unlockedBooks, setUnlockedBooks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('moonlight-unlocked-books');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Costume/Wardrobe state (T1165)
  const [costumeState, setCostumeState] = useState<CostumeState>(() => {
    const saved = loadSaveData();
    return saved?.costumes ?? {
      unlocked: [],
      equipped: { hat: null, accessory: null, outfit: null, collar: null },
      eyeColor: 'amber', // T1333: Default amber eye color (free)
      unlockedEyeColors: ['amber'], // T1333: Amber is free by default
    };
  });
  const [showWardrobe, setShowWardrobe] = useState(false);
  
  // T1332: Fur Color state
  const [furColor, setFurColor] = useState<FurColorId>(() => {
    const saved = loadSaveData();
    return saved?.furColor ?? 'orange';
  });
  const [unlockedFurColors, setUnlockedFurColors] = useState<FurColorId[]>(() => {
    const saved = loadSaveData();
    return saved?.unlockedFurColors ?? ['orange'];
  });
  const [showFurColorPicker, setShowFurColorPicker] = useState(false);
  
  // Toy Box state (T1175)
  const [toyBoxState, setToyBoxState] = useState<ToyBoxState>(() => {
    const saved = loadSaveData();
    // Default toys are unlocked from start
    const defaultToys = TOYS.filter(t => t.unlockMethod === 'default').map(t => t.id);
    return saved?.toyBox ?? {
      unlockedToys: defaultToys,
      favoriteToy: null,
    };
  });
  const [showToyBox, setShowToyBox] = useState(false);
  const [toyPlayAnimation, setToyPlayAnimation] = useState<{ toy: Toy; x: number; y: number } | null>(null);
  
  // T1349: Pet Treats Shop state 🍪
  const [treatShopState, setTreatShopState] = useState<TreatShopState>(() => {
    try {
      const saved = localStorage.getItem('moonlight-treat-shop');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default: common treats are unlocked from start
    const defaultTreats = TREATS.filter(t => t.rarity === 'common' && !t.unlockLevel).map(t => t.id);
    return {
      unlockedTreats: defaultTreats,
      inventory: {},
      totalFed: 0,
    };
  });
  const [showTreatShop, setShowTreatShop] = useState(false);
  
  // T1208: Fish Tank mini-game state
  const [showFishTank, setShowFishTank] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [storyText, setStoryText] = useState('');
  const [showPhotoMode, setShowPhotoMode] = useState(false); // T1174: Photo mode state
  
  // T1206: Night Vision mode - see in dark rooms!
  const [nightVision, setNightVision] = useState(false);
  
  // T1179: Mood Journal state
  const [moodJournalState, setMoodJournalState] = useState<MoodJournalState>(() => {
    const saved = loadSaveData();
    return saved?.moodJournal ?? { entries: [], lastEntryDate: null };
  });
  const [showMoodJournal, setShowMoodJournal] = useState(false);
  
  // T1185: Daily Quest state
  const [dailyQuestState, setDailyQuestState] = useState<DailyQuestState>(() => {
    const saved = loadSaveData();
    const today = new Date().toISOString().split('T')[0];
    // If saved quests exist and are from today, use them; otherwise generate new ones
    if (saved?.dailyQuests && saved.dailyQuests.lastRefreshDate === today) {
      return saved.dailyQuests;
    }
    return {
      quests: generateDailyQuests(),
      lastRefreshDate: today,
      completedToday: 0,
    };
  });
  const [showQuestPanel, setShowQuestPanel] = useState(false);
  
  // T1192: Gift Sending state
  const [giftState, setGiftState] = useState<GiftState>(() => {
    try {
      const saved = localStorage.getItem('moonlight-gift-state');
      return saved ? JSON.parse(saved) : { sentGifts: [], totalSent: 0 };
    } catch {
      return { sentGifts: [], totalSent: 0 };
    }
  });
  const [showGiftSending, setShowGiftSending] = useState(false);
  
  // T1197: Pet Album state
  const [petAlbumState, setPetAlbumState] = useState<PetAlbumState>(() => {
    const saved = loadSaveData();
    // Luna is always discovered from the start
    const defaultDiscovered = ['luna'];
    if (saved?.petAlbum) {
      // Ensure Luna is always in the list
      const discovered = saved.petAlbum.discoveredPets.includes('luna') 
        ? saved.petAlbum.discoveredPets 
        : [...saved.petAlbum.discoveredPets, 'luna'];
      return { ...saved.petAlbum, discoveredPets: discovered };
    }
    return {
      discoveredPets: defaultDiscovered,
      lastDiscovery: null,
      totalDiscovered: 1,
    };
  });
  const [showPetAlbum, setShowPetAlbum] = useState(false);
  const [newlyDiscoveredPet, setNewlyDiscoveredPet] = useState<CollectiblePet | null>(null);
  
  // T1191: Friend Code state
  const [friendCodeState] = useState<FriendCodeState>(() => {
    const saved = loadSaveData();
    if (saved?.friendCode) return saved.friendCode;
    return {
      code: generateFriendCode(),
      createdAt: new Date().toISOString(),
    };
  });
  const [showFriendCode, setShowFriendCode] = useState(false);
  
  // T1202: Pet Training state - teach Luna tricks for XP!
  const [petTrainingState, setPetTrainingState] = useState<PetTrainingState>(() => {
    try {
      const saved = localStorage.getItem('moonlight-pet-training');
      return saved ? JSON.parse(saved) : { learnedTricks: [], practiceCount: {}, lastTrainingDate: null };
    } catch {
      return { learnedTricks: [], practiceCount: {}, lastTrainingDate: null };
    }
  });
  const [showPetTraining, setShowPetTraining] = useState(false);
  
  // T1330: Pet Health Checkup state 🏥
  const [showHealthCheckup, setShowHealthCheckup] = useState(false);
  const [lastHealthCheckup, setLastHealthCheckup] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('moonlight-last-health-checkup');
      return saved ? parseInt(saved) : 0;
    } catch {
      return 0;
    }
  });
  
  // T1339: Pet Activity Log state 📓
  const [activityLogState, setActivityLogState] = useState<ActivityLogState>(() => {
    const saved = loadSaveData();
    const today = new Date().toISOString().split('T')[0];
    // Reset entries if it's a new day
    if (saved?.activityLog && saved.activityLog.lastResetDate === today) {
      return saved.activityLog;
    }
    return { entries: [], lastResetDate: today };
  });
  const [showActivityLog, setShowActivityLog] = useState(false);
  
  // T1345: Pet Favorite Room Tracker state 🏠
  const [favoriteRoomState, setFavoriteRoomState] = useState<FavoriteRoomState>(() => {
    const saved = loadSaveData();
    if (saved?.favoriteRoomState) {
      return saved.favoriteRoomState;
    }
    // Initialize with empty visit counts
    const initialCounts: Record<RoomKey, number> = {
      bedroom: 0, kitchen: 0, garden: 0, living: 0, bathroom: 0,
      garage: 0, shop: 0, supermarket: 0, attic: 0, basement: 0, library: 0,
    };
    return { visitCounts: initialCounts, favoriteRoom: null, lastUpdated: new Date().toISOString() };
  });
  const [showFavoriteRoom, setShowFavoriteRoom] = useState(false);
  
  // T1357: Pet Vaccination Records state 💉
  const [vaccinationState, setVaccinationState] = useState<VaccinationState>(() => {
    const saved = loadSaveData();
    if (saved?.vaccinationState) {
      return saved.vaccinationState;
    }
    return { records: [], lastCheckDate: null };
  });
  
  // T1352: Pet Mood Ring expanded state 💍
  const [moodRingExpanded, setMoodRingExpanded] = useState(false);
  
  // T1353: Pet Fortune Telling Feature 🔮
  const [showFortune, setShowFortune] = useState(false);
  const [fortuneState, setFortuneState] = useState<{
    lastFortuneDate: string | null;
    fortunesToday: number;
    lastFortune: { category: string; text: string } | null;
  }>(() => {
    try {
      const saved = localStorage.getItem('moonlight-fortune-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Reset if it's a new day
        const today = new Date().toISOString().split('T')[0];
        if (parsed.lastFortuneDate !== today) {
          return { lastFortuneDate: null, fortunesToday: 0, lastFortune: null };
        }
        return parsed;
      }
    } catch {}
    return { lastFortuneDate: null, fortunesToday: 0, lastFortune: null };
  });
  
  // T1450: Pet Fun Facts Popup 🐱📚
  const [showFunFacts, setShowFunFacts] = useState(false);
  const [seenFactIndices, setSeenFactIndices] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('moonlight-seen-facts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [currentFactIndex, setCurrentFactIndex] = useState<number | null>(null);
  
  const [showObjectsHint, setShowObjectsHint] = useState(true);
  const [showMovementHint, setShowMovementHint] = useState(() => {
    // Only show movement hint if user hasn't seen it
    try {
      return !localStorage.getItem('moonlight-movement-hint-seen');
    } catch {
      return true;
    }
  });

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [mapContainerRef, setMapContainerRef] = useState<HTMLDivElement | null>(null);

  // Movement state
  const [isWalking, setIsWalking] = useState(false);
  const [facingDirection, setFacingDirection] = useState<'left' | 'right'>('right');
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Idle state for tail wagging (T876)
  const [isIdle, setIsIdle] = useState(false);
  const [lastActionTime, setLastActionTime] = useState(Date.now());
  
  // Pet interaction state (MM-002, T878) 🐱
  const [petHearts, setPetHearts] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [lastPetTime, setLastPetTime] = useState(0);
  const [isPurring, setIsPurring] = useState(false);
  
  // Sleep dreams state (T1190) 💤
  const [isSleeping, setIsSleeping] = useState(false);
  // T1343: Nap timer - track when pet started sleeping
  const [napStartTime, setNapStartTime] = useState<number | null>(null);
  
  // Pet grooming state (T1186) 🪮
  const [lastBrushTime, setLastBrushTime] = useState(0);
  const [isBrushing, setIsBrushing] = useState(false);
  const [brushSparkles, setBrushSparkles] = useState<Array<{ id: number; x: number; y: number; angle: number }>>([]);
  
  // T1324: Catnip Crazy Mode state 🌿😸
  const [isCatnipMode, setIsCatnipMode] = useState(false);
  const [catnipTimeLeft, setCatnipTimeLeft] = useState(0);
  const [catnipSparkles, setCatnipSparkles] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);
  
  // T1342: Pet bathing animation state 🛁✨
  const [isBathing, setIsBathing] = useState(false);
  const [bathBubbles, setBathBubbles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);
  
  // T1348: Pet cuddle mode state 🤗💕 (hold Luna animation)
  const [isCuddling, setIsCuddling] = useState(false);
  const [cuddleHearts, setCuddleHearts] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);
  const cuddleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cuddleStartRef = useRef<number | null>(null);
  
  const roomContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) node.focus();
  }, []);

  // Ambient soundscapes - procedural audio per room
  // Gets current room key from roomData array
  const currentRoomKey = roomData[currentRoom]?.key ?? 'bedroom';
  useAmbientSoundscapes({
    currentRoom: currentRoomKey,
    timeOfDay,
    isMuted,
    volume: ambientVolume,
    weatherCondition: weather.condition,
  });

  // Float animation
  useEffect(() => {
    const interval = setInterval(() => setFloatPhase(p => (p + 1) % 360), 50);
    return () => clearInterval(interval);
  }, []);

  // Game initialization (T1156) - preload assets and show loading spinner
  useEffect(() => {
    const preloadAssets = async () => {
      const imagesToPreload = [
        `${BASE_URL}assets/backgrounds/house-map.jpg`,
        `${BASE_URL}assets/character/luna-happy.jpg`,
        `${BASE_URL}assets/backgrounds/room-bedroom.jpg`,
        `${BASE_URL}assets/backgrounds/room-kitchen.jpg`,
        `${BASE_URL}assets/backgrounds/room-garden.jpg`,
      ];
      
      // Preload images
      const imagePromises = imagesToPreload.map((src) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Don't fail on error, just continue
          img.src = src;
        });
      });
      
      // Wait for all images with a minimum loading time for smooth UX
      await Promise.all([
        Promise.all(imagePromises),
        new Promise(resolve => setTimeout(resolve, 800)), // Minimum 800ms for smooth transition
      ]);
      
      setIsInitializing(false);
    };
    
    preloadAssets();
  }, []);

  // Idle detection for tail wagging (T876)
  useEffect(() => {
    const checkIdle = setInterval(() => {
      const timeSinceAction = Date.now() - lastActionTime;
      setIsIdle(timeSinceAction > 3000 && !isWalking && !isActing);
    }, 500);
    return () => clearInterval(checkIdle);
  }, [lastActionTime, isWalking, isActing]);
  
  // Reset idle timer on any action
  useEffect(() => {
    if (isWalking || isActing) {
      setLastActionTime(Date.now());
      setIsIdle(false);
    }
  }, [isWalking, isActing]);

  // Keyboard movement (WASD/Arrows) - only in room view
  // Hide movement hint callback - defined here so keyboard and tap handlers can use it
  const hideMovementHint = useCallback(() => {
    if (showMovementHint) {
      setShowMovementHint(false);
      try { localStorage.setItem('moonlight-movement-hint-seen', 'true'); } catch {}
    }
  }, [showMovementHint]);

  useEffect(() => {
    if (showMap) return;
    
    const MOVE_SPEED = 3; // % of screen per keypress
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      
      let dx = 0, dy = 0;
      switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': dy = -MOVE_SPEED; break;
        case 's': case 'arrowdown': dy = MOVE_SPEED; break;
        case 'a': case 'arrowleft': dx = -MOVE_SPEED; setFacingDirection('left'); break;
        case 'd': case 'arrowright': dx = MOVE_SPEED; setFacingDirection('right'); break;
        default: return;
      }
      
      e.preventDefault();
      setIsWalking(true);
      setLunaPosition(prev => ({
        x: Math.max(10, Math.min(90, prev.x + dx)),
        y: Math.max(30, Math.min(85, prev.y + dy)),
      }));
      
      // Hide movement hint on first keyboard movement
      hideMovementHint();
      
      // Stop walking animation after a short delay
      setTimeout(() => setIsWalking(false), 150);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMap, hideMovementHint]);

  // Tap-to-move animation (smooth movement to target)
  useEffect(() => {
    if (!targetPosition) return;
    
    const animationFrame = () => {
      setLunaPosition(prev => {
        const dx = targetPosition.x - prev.x;
        const dy = targetPosition.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Arrived at destination
        if (distance < 2) {
          setIsWalking(false);
          setTargetPosition(null);
          return prev;
        }
        
        // Move towards target
        const speed = Math.min(3, distance * 0.15);
        const newX = prev.x + (dx / distance) * speed;
        const newY = prev.y + (dy / distance) * speed;
        
        // Update facing direction
        if (Math.abs(dx) > 0.5) {
          setFacingDirection(dx > 0 ? 'right' : 'left');
        }
        
        return { x: newX, y: newY };
      });
    };
    
    const interval = setInterval(animationFrame, 16); // ~60fps
    return () => clearInterval(interval);
  }, [targetPosition]);

  // Handle tap-to-move in room view
  const handleRoomClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Ignore clicks on interactive elements
    if ((e.target as HTMLElement).closest('.action-btn, .header, .mini-stats, .interactive-object, .luna-container')) {
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Clamp to walkable area
    const clampedX = Math.max(10, Math.min(90, x));
    const clampedY = Math.max(30, Math.min(85, y));
    
    setTargetPosition({ x: clampedX, y: clampedY });
    setIsWalking(true);
    playSound('ui-click');
    
    // Hide movement hint after first movement
    if (showMovementHint) {
      setShowMovementHint(false);
      try { localStorage.setItem('moonlight-movement-hint-seen', 'true'); } catch {}
    }
  };

  // Time of day update
  useEffect(() => {
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Mood update
  useEffect(() => {
    setMood(getMood(stats));
  }, [stats]);

  // T1346: Track playtime - increment every minute
  useEffect(() => {
    const playtimeInterval = setInterval(() => {
      setGameState(g => ({
        ...g,
        totalPlayMinutes: g.totalPlayMinutes + 1,
      }));
    }, 60000); // Every 60 seconds
    
    return () => clearInterval(playtimeInterval);
  }, []);

  // Auto-save game state
  useEffect(() => {
    saveSaveData(stats, achievements, gameState, totalVisits, petName ?? undefined, costumeState, toyBoxState, petCreatedAt, lastBirthdayCelebrated, moodJournalState, playHistory, dailyQuestState, friendCodeState, petAlbumState, petPersonality, furColor, unlockedFurColors, activityLogState, favoriteRoomState, undefined, vaccinationState);
  }, [stats, achievements, gameState, totalVisits, petName, costumeState, toyBoxState, petCreatedAt, lastBirthdayCelebrated, moodJournalState, playHistory, dailyQuestState, friendCodeState, petAlbumState, furColor, unlockedFurColors, activityLogState, favoriteRoomState, vaccinationState]);
  
  // T1185: Check for daily quest refresh
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (dailyQuestState.lastRefreshDate !== today) {
      setDailyQuestState({
        quests: generateDailyQuests(),
        lastRefreshDate: today,
        completedToday: 0,
      });
    }
  }, [dailyQuestState.lastRefreshDate]);

  // T1169: Check for pet birthday on mount
  useEffect(() => {
    // Only check once per year
    const currentYear = new Date().getFullYear().toString();
    if (lastBirthdayCelebrated === currentYear) return; // Already celebrated this year
    
    // Check if today is the pet's birthday
    if (petName && isPetBirthday(petCreatedAt)) {
      // Delay to show after other popups
      const timer = setTimeout(() => {
        setShowBirthdayPopup(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [petCreatedAt, petName, lastBirthdayCelebrated]);

  // Ambient music based on room
  useEffect(() => {
    if (showMap) {
      playAmbient('home');
      return;
    }
    const room = roomData[currentRoom];
    if (room.category === 'outside') {
      playAmbient('shop');
    } else if (room.key === 'garden') {
      playAmbient('garden');
    } else {
      playAmbient('home');
    }
  }, [currentRoom, showMap, playAmbient]);

  // Stat decay
  useEffect(() => {
    const decayRate = timeOfDay === 'night' ? 0.5 : 1;
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        hunger: Math.max(0, prev.hunger - 1 * decayRate),
        energy: Math.max(0, prev.energy - 0.5 * decayRate),
        happiness: Math.max(0, prev.happiness - 0.3 * decayRate),
        health: prev.hunger < 20 ? Math.max(0, prev.health - 1) : prev.health,
        // T1338: Very slow weight decay (metabolism) - min 30 is healthy weight
        weight: Math.max(30, (prev.weight ?? 50) - 0.1 * decayRate),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [timeOfDay]);

  // Random events
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        const events = [
          { message: t.messages.eventVisitor, effect: () => setStats(s => ({ ...s, happiness: Math.min(100, s.happiness + 20) })) },
          { message: t.messages.eventGift, effect: () => setStats(s => ({ ...s, coins: s.coins + 15 })) },
          { message: t.messages.eventRain, effect: () => setStats(s => ({ ...s, happiness: Math.min(100, s.happiness + 10) })) },
        ];
        const event = events[Math.floor(Math.random() * events.length)];
        setEventMessage(event.message);
        event.effect();
        setTimeout(() => setEventMessage(''), 3000);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [t.messages]);

  // Check daily reward
  useEffect(() => {
    const today = new Date().toDateString();
    if (gameState.lastDailyReward !== today) {
      const bonus = 20 + (gameState.streak * 5);
      setDailyRewardAmount(bonus);
      setShowDailyReward(true);
    }
  }, [gameState.lastDailyReward, gameState.streak]);

  // Achievement checker
  const checkAchievements = useCallback(() => {
    setAchievements(prev => prev.map(ach => {
      if (ach.unlocked) return ach;
      
      let progress = ach.progress;
      switch (ach.id) {
        case 'explorer': progress = gameState.roomsVisited.size; break;
        case 'wealthy': progress = stats.coins; break;
        case 'healthy': progress = stats.health; break;
      }
      
      const unlocked = progress >= ach.target;
      if (unlocked && !ach.unlocked) {
        setShowAchievement({ ...ach, unlocked: true, progress });
        setStats(s => ({ ...s, coins: s.coins + 25, xp: s.xp + 50 }));
        playSound('achievement');
        haptic.success(); // T1158: Haptic feedback for achievement unlock
      }
      
      return { ...ach, progress, unlocked };
    }));
  }, [gameState.roomsVisited, stats.coins, stats.health]);

  useEffect(() => { checkAchievements(); }, [checkAchievements]);

  // Level up check
  useEffect(() => {
    const xpNeeded = getXpForLevel(stats.level);
    if (stats.xp >= xpNeeded) {
      const newLevel = stats.level + 1;
      setStats(s => ({
        ...s,
        level: newLevel,
        xp: s.xp - xpNeeded,
        coins: s.coins + 50,
      }));
      showBubble(t.messages.levelUp.replace('{level}', String(newLevel)));
      playSound('level-up');
      playSound('coin-collect');
      haptic.heavy(); // T1158: Strong haptic feedback for level up!
      
      // T1173: Check for evolution on level up
      const newEvolution = getEvolutionStage(newLevel);
      if (newEvolution.stage !== lastEvolutionStage) {
        // Pet has evolved! Show the evolution popup after a short delay
        setTimeout(() => {
          setShowEvolutionPopup(newEvolution);
          setLastEvolutionStage(newEvolution.stage);
          playSound('achievement');
          haptic.success();
        }, 1500); // Delay to let level up message show first
      }
    }
  }, [stats.xp, stats.level, t.messages.levelUp, playSound, lastEvolutionStage]);

  const showBubble = (text: string) => {
    setActionBubble(text);
    setTimeout(() => setActionBubble(''), 2000);
  };

  // T1185: Update quest progress (moved before handlePetLuna to fix reference)
  const updateQuestProgress = useCallback((questType: QuestType, amount: number = 1) => {
    setDailyQuestState(prev => ({
      ...prev,
      quests: prev.quests.map(quest => {
        if (quest.type !== questType || quest.completed) return quest;
        const newProgress = quest.progress + amount;
        const completed = newProgress >= quest.target;
        return { ...quest, progress: newProgress, completed };
      }),
    }));
  }, []);

  // T1339: Log pet activity
  const logActivity = useCallback((
    type: ActivityType,
    room: RoomKey,
    statsChange?: { happiness?: number; energy?: number; hunger?: number; coins?: number }
  ) => {
    const activityDescriptions: Record<ActivityType, { it: string; en: string }> = {
      sleep: { it: 'Ha dormito nella camera', en: 'Slept in the bedroom' },
      eat: { it: 'Ha mangiato in cucina', en: 'Ate in the kitchen' },
      play: { it: 'Ha giocato in giardino', en: 'Played in the garden' },
      bath: { it: 'Ha fatto il bagno', en: 'Took a bath' },
      explore: { it: `Ha esplorato ${translations.it.rooms[room]}`, en: `Explored the ${translations.en.rooms[room]}` },
      shop: { it: 'Ha fatto shopping', en: 'Went shopping' },
      pet: { it: 'Ha ricevuto coccole', en: 'Got cuddles' },
      brush: { it: 'È stata spazzolata', en: 'Got brushed' },
      toy: { it: 'Ha giocato con un giocattolo', en: 'Played with a toy' },
      train: { it: 'Si è allenata', en: 'Did some training' },
      game: { it: 'Ha completato un mini-gioco', en: 'Completed a mini-game' },
      treasure: { it: 'Ha cercato tesori', en: 'Hunted for treasure' },
      read: { it: 'Ha letto un libro', en: 'Read a book' },
    };
    
    const newEntry: ActivityLogEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type,
      room,
      description: activityDescriptions[type],
      emoji: ACTIVITY_TYPES[type].emoji,
      stats: statsChange,
    };
    
    setActivityLogState(prev => ({
      ...prev,
      entries: [...prev.entries, newEntry],
    }));
  }, []);

  // T1197: Discover a new pet and show popup
  const discoverPet = useCallback((petId: string) => {
    // Check if already discovered
    if (petAlbumState.discoveredPets.includes(petId)) return;
    
    const pet = COLLECTIBLE_PETS.find(p => p.id === petId);
    if (!pet) return;
    
    // Add to discovered pets
    setPetAlbumState(prev => ({
      ...prev,
      discoveredPets: [...prev.discoveredPets, petId],
      lastDiscovery: new Date().toISOString(),
      totalDiscovered: prev.totalDiscovered + 1,
    }));
    
    // Show discovery popup
    setNewlyDiscoveredPet(pet);
    playSound('achievement');
    haptic.success();
    
    // Give bonus coins based on rarity
    const bonusCoins = pet.rarity === 'mythic' ? 50 : pet.rarity === 'legendary' ? 30 : pet.rarity === 'rare' ? 15 : 5;
    setStats(prev => ({ ...prev, coins: prev.coins + bonusCoins }));
  }, [petAlbumState.discoveredPets, playSound]);

  // T1197: Check for pet discoveries on room visit
  const checkRoomPetDiscovery = useCallback((roomKey: RoomKey) => {
    // Find pets that can be discovered in this room
    const roomPets = COLLECTIBLE_PETS.filter(
      pet => pet.unlockCondition === 'room' && pet.unlockRoom === roomKey
    );
    
    for (const pet of roomPets) {
      if (!petAlbumState.discoveredPets.includes(pet.id)) {
        // Discover room-based pet!
        discoverPet(pet.id);
        break; // Only discover one pet per room visit
      }
    }
    
    // Check for random encounter pets
    const randomPets = COLLECTIBLE_PETS.filter(
      pet => pet.unlockCondition === 'random' && pet.unlockChance && !petAlbumState.discoveredPets.includes(pet.id)
    );
    
    for (const pet of randomPets) {
      if (Math.random() < (pet.unlockChance || 0)) {
        discoverPet(pet.id);
        break; // Only one random discovery at a time
      }
    }
  }, [petAlbumState.discoveredPets, discoverPet]);

  // T1197: Check for level-based pet discoveries
  useEffect(() => {
    const levelPets = COLLECTIBLE_PETS.filter(
      pet => pet.unlockCondition === 'level' && 
             pet.unlockLevel && 
             pet.unlockLevel <= stats.level && 
             !petAlbumState.discoveredPets.includes(pet.id)
    );
    
    if (levelPets.length > 0) {
      // Discover the first eligible pet
      discoverPet(levelPets[0].id);
    }
  }, [stats.level, petAlbumState.discoveredPets, discoverPet]);

  // Pet Luna handler (MM-002, T878) 🐱
  const handlePetLuna = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger room movement
    
    const now = Date.now();
    if (now - lastPetTime < 300) return; // Debounce rapid clicks
    setLastPetTime(now);
    
    // T1158: Haptic feedback for petting Luna - gentle double tap
    haptic.double();
    
    // Trigger purr animation (T878) - subtle body shake 🐱
    setIsPurring(true);
    setTimeout(() => setIsPurring(false), 500);
    
    // Play cute sounds
    const soundChoice = Math.random();
    if (soundChoice < 0.5) {
      playSound('cat-meow');
    } else if (soundChoice < 0.8) {
      playSound('cat-happy');
    } else {
      playSound('cat-purr');
    }
    playSound('heart-pop');
    playSound('sparkle');
    
    // Add floating hearts at Luna's position
    const heartId = now;
    const newHearts = Array.from({ length: 3 + Math.floor(Math.random() * 3) }, (_, i) => ({
      id: heartId + i,
      x: lunaPosition.x + (Math.random() - 0.5) * 15,
      y: lunaPosition.y - 10 - Math.random() * 10,
    }));
    setPetHearts(prev => [...prev, ...newHearts]);
    
    // Clean up hearts after animation
    setTimeout(() => {
      setPetHearts(prev => prev.filter(h => !newHearts.some(nh => nh.id === h.id)));
    }, 1500);
    
    // T1329: Apply personality social bonus for petting
    const personalityInfo = PERSONALITIES[petPersonality];
    const pettingBoost = Math.round(2 * personalityInfo.socialBonus);
    
    // Boost happiness slightly (with personality modifier)
    setStats(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + pettingBoost),
    }));
    
    // Update last action time (helps with idle detection)
    setLastActionTime(now);
    
    // Show affection bubble
    const affectionEmojis = ['❤️', '💕', '💖', '🥰', '😻', '✨'];
    showBubble(affectionEmojis[Math.floor(Math.random() * affectionEmojis.length)]);
    
    // T1339: Log petting activity
    logActivity('pet', roomData[currentRoom]?.key || 'living', { happiness: pettingBoost });
    
    // T1185: Quest progress for petting
    updateQuestProgress('pet');
  }, [lastPetTime, lunaPosition, playSound, updateQuestProgress, logActivity, currentRoom]);

  // Brush Luna handler (T1186) 🪮 - grooming feature
  const handleBrushLuna = useCallback(() => {
    const now = Date.now();
    const BRUSH_COOLDOWN = 10000; // 10 second cooldown between brushes
    const HAPPINESS_BOOST = 8; // Bigger boost than petting
    
    // Check cooldown
    if (now - lastBrushTime < BRUSH_COOLDOWN) {
      playSound('ui-error');
      haptic.error();
      showBubble(t.grooming.cooldown);
      return;
    }
    
    setLastBrushTime(now);
    
    // T1158: Haptic feedback for brushing - satisfying pattern
    haptic.success();
    
    // Trigger brushing animation
    setIsBrushing(true);
    setTimeout(() => setIsBrushing(false), 1200);
    
    // Play grooming sounds
    playSound('sparkle');
    playSound('ui-success');
    
    // Add sparkle particles at Luna's position (fur particles flying!)
    const sparkleId = now;
    const newSparkles = Array.from({ length: 12 }, (_, i) => ({
      id: sparkleId + i,
      x: lunaPosition.x + (Math.random() - 0.5) * 20,
      y: lunaPosition.y - 5 - Math.random() * 15,
      angle: (i / 12) * 360 + Math.random() * 30,
    }));
    setBrushSparkles(prev => [...prev, ...newSparkles]);
    
    // Clean up sparkles after animation
    setTimeout(() => {
      setBrushSparkles(prev => prev.filter(s => !newSparkles.some(ns => ns.id === s.id)));
    }, 2000);
    
    // Boost happiness significantly
    setStats(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + HAPPINESS_BOOST),
      health: Math.min(100, prev.health + 2), // Small health boost too (grooming is healthy!)
    }));
    
    // Update last action time
    setLastActionTime(now);
    
    // T1339: Log brushing activity
    logActivity('brush', roomData[currentRoom]?.key || 'living', { happiness: HAPPINESS_BOOST });
    
    // Show happy grooming bubble
    showBubble(t.grooming.brushing);
  }, [lastBrushTime, lunaPosition, playSound, t.grooming, logActivity, currentRoom]);

  // T1348: Cuddle Luna handlers 🤗💕 (hold Luna animation)
  // Start cuddle mode on long press/hold
  const handleCuddleStart = useCallback(() => {
    // Don't start cuddle if already cuddling or in another animation
    if (isCuddling || isCatnipMode || isBathing) return;
    
    cuddleStartRef.current = Date.now();
    
    // Start cuddle after 500ms hold
    cuddleTimeoutRef.current = setTimeout(() => {
      setIsCuddling(true);
      
      // T1158: Haptic feedback for cuddling - warm pattern
      haptic.success();
      
      // Play cuddle sounds
      playSound('cat-purr');
      playSound('sparkle');
      
      // Show cuddle bubble
      showBubble(t.cuddle.holding);
      
      // Spawn continuous hearts while cuddling
      const spawnCuddleHearts = () => {
        if (!cuddleStartRef.current) return;
        
        const now = Date.now();
        const heartEmojis = ['💕', '💖', '💗', '💓', '🤗', '🥰', '😻', '✨'];
        const newHearts = Array.from({ length: 2 }, (_, i) => ({
          id: now + i,
          x: lunaPosition.x + (Math.random() - 0.5) * 30,
          y: lunaPosition.y - 15 - Math.random() * 20,
          emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
        }));
        
        setCuddleHearts(prev => [...prev, ...newHearts]);
        
        // Clean up old hearts
        setTimeout(() => {
          setCuddleHearts(prev => prev.filter(h => !newHearts.some(nh => nh.id === h.id)));
        }, 1500);
      };
      
      // Spawn hearts immediately and every 400ms while cuddling
      spawnCuddleHearts();
      const heartInterval = setInterval(() => {
        if (cuddleStartRef.current) {
          spawnCuddleHearts();
        } else {
          clearInterval(heartInterval);
        }
      }, 400);
      
      // Store interval for cleanup
      (cuddleTimeoutRef as any).heartInterval = heartInterval;
      
    }, 500); // 500ms hold to trigger cuddle
  }, [isCuddling, isCatnipMode, isBathing, playSound, t.cuddle, lunaPosition]);
  
  // End cuddle mode on release
  const handleCuddleEnd = useCallback(() => {
    // Clear the timeout if cuddle didn't start yet
    if (cuddleTimeoutRef.current) {
      clearTimeout(cuddleTimeoutRef.current);
      if ((cuddleTimeoutRef as any).heartInterval) {
        clearInterval((cuddleTimeoutRef as any).heartInterval);
      }
    }
    
    // Calculate cuddle duration
    const cuddleDuration = cuddleStartRef.current ? Date.now() - cuddleStartRef.current : 0;
    cuddleStartRef.current = null;
    
    if (isCuddling) {
      setIsCuddling(false);
      
      // T1158: Haptic feedback on release
      haptic.light();
      
      // Play release sound
      playSound('sparkle');
      playSound('cat-happy');
      
      // Calculate happiness boost based on cuddle duration (max 15)
      const personalityInfo = PERSONALITIES[petPersonality];
      const baseCuddleBoost = Math.min(15, Math.floor(cuddleDuration / 1000) * 3 + 5);
      const cuddleBoost = Math.round(baseCuddleBoost * personalityInfo.socialBonus);
      
      // Boost happiness
      setStats(prev => ({
        ...prev,
        happiness: Math.min(100, prev.happiness + cuddleBoost),
      }));
      
      // Show release bubble
      showBubble(t.cuddle.release);
      
      // T1339: Log cuddle activity
      logActivity('pet', roomData[currentRoom]?.key || 'living', { happiness: cuddleBoost });
      
      // T1185: Quest progress for petting (cuddles count!)
      updateQuestProgress('pet');
      
      // Update last action time
      setLastActionTime(Date.now());
    }
  }, [isCuddling, playSound, t.cuddle, petPersonality, logActivity, currentRoom, updateQuestProgress]);
  
  // Clean up cuddle state on unmount
  useEffect(() => {
    return () => {
      if (cuddleTimeoutRef.current) {
        clearTimeout(cuddleTimeoutRef.current);
        if ((cuddleTimeoutRef as any).heartInterval) {
          clearInterval((cuddleTimeoutRef as any).heartInterval);
        }
      }
    };
  }, []);

  const claimDailyReward = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = gameState.lastDailyReward === yesterday ? gameState.streak + 1 : 1;
    
    setStats(s => ({ ...s, coins: s.coins + dailyRewardAmount }));
    setGameState(g => ({ ...g, lastDailyReward: today, streak: newStreak }));
    setShowDailyReward(false);
    playSound('coin-collect');
    playSound('ui-success');
    haptic.success(); // T1158: Haptic feedback for claiming daily reward
  };

  // T1185: Claim quest reward
  const claimQuestReward = useCallback((questId: string) => {
    setDailyQuestState(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (!quest || !quest.completed || quest.claimed) return prev;
      
      // Grant rewards
      setStats(s => ({
        ...s,
        coins: s.coins + quest.reward.coins,
        xp: s.xp + quest.reward.xp,
      }));
      
      return {
        ...prev,
        quests: prev.quests.map(q => 
          q.id === questId ? { ...q, claimed: true } : q
        ),
        completedToday: prev.completedToday + 1,
      };
    });
  }, []);

  // T1185: Track rooms visited for quest
  const [visitedRoomsToday, setVisitedRoomsToday] = useState<Set<RoomKey>>(new Set());

  const handleMiniGameComplete = (score: number) => {
    const coinsEarned = Math.floor(score / 2);
    setStats(s => ({ ...s, coins: s.coins + coinsEarned, happiness: Math.min(100, s.happiness + 15), xp: s.xp + score }));
    haptic.success(); // T1158: Haptic feedback for mini-game completion
    setShowMiniGame(false);
    // T1339: Log mini-game activity
    logActivity('game', 'garden', { happiness: 15, coins: coinsEarned });
    updateQuestProgress('game'); // T1185: Quest progress for mini-game
  };

  const doAction = (duration: number, callback: () => void) => {
    if (isActing) return;
    setIsActing(true);
    callback();
    setGameState(g => ({ ...g, totalActions: g.totalActions + 1 }));
    setTimeout(() => setIsActing(false), duration);
  };

  const handleRoomAction = (actionType: 'primary' | 'secondary') => {
    const room = roomData[currentRoom];
    const cost = actionType === 'primary' ? 5 : 3;
    let xpGain = actionType === 'primary' ? 15 : 10;
    
    // T1329: Get personality modifiers
    const personalityInfo = PERSONALITIES[petPersonality];
    
    // Mood-based action modifiers
    let moodBonus = 1.0;
    let moodMessage: string | null = null;
    
    // Determine action type for mood interaction
    const actionCategory = room.key === 'bedroom' ? 'sleep' : 
                          room.key === 'kitchen' || room.key === 'supermarket' ? 'eat' :
                          room.key === 'garden' ? 'play' : 'default';
    
    // Apply mood-based effects
    if (mood === 'hungry') {
      // Hungry pets are less enthusiastic about non-food activities
      if (actionCategory !== 'eat') {
        moodBonus = 0.5;
        moodMessage = getMoodInteractionMessage('hungry', actionCategory, lang);
      } else {
        moodBonus = 1.5; // Extra happy to eat!
      }
    } else if (mood === 'sleepy') {
      // Sleepy pets prefer rest
      if (actionCategory === 'sleep') {
        moodBonus = 1.5; // Love sleeping when tired
      } else if (actionCategory === 'play') {
        moodBonus = 0.3; // Too tired to play
        moodMessage = getMoodInteractionMessage('sleepy', actionCategory, lang);
      }
    } else if (mood === 'playful') {
      // Playful pets want to play!
      if (actionCategory === 'play') {
        moodBonus = 2.0; // Double the fun!
        moodMessage = getMoodInteractionMessage('playful', 'default', lang);
      } else if (actionCategory === 'sleep') {
        moodBonus = 0.5; // Don't wanna sleep!
        moodMessage = getMoodInteractionMessage('playful', actionCategory, lang);
      }
    }
    
    // Apply mood bonus to XP
    xpGain = Math.round(xpGain * moodBonus);

    if ((room.key === 'shop' || room.key === 'supermarket') && stats.coins < cost) {
      playSound('ui-error');
      haptic.error(); // T1158: Haptic feedback for error
      showBubble(t.messages.notEnoughCoins);
      return;
    }
    
    // Play UI click
    playSound('ui-click');
    haptic.medium(); // T1158: Haptic feedback for action buttons

    // 20% chance for mini-game in garden (higher if playful!)
    const miniGameChance = mood === 'playful' ? 0.4 : 0.2;
    if (room.key === 'garden' && actionType === 'primary' && Math.random() < miniGameChance) {
      setShowMiniGame(true);
      return;
    }

    doAction(2000, () => {
      let message = '';
      let statChanges: Partial<PetStats> = { xp: stats.xp + xpGain };

      switch (room.key) {
        case 'bedroom':
          message = t.messages.sleeping;
          statChanges = { ...statChanges, energy: Math.min(100, stats.energy + 40), health: Math.min(100, stats.health + 10) };
          setAchievements(a => a.map(ach => ach.id === 'sleepyHead' ? { ...ach, progress: ach.progress + 1 } : ach));
          playSound('action-sleep');
          // T1190: Start sleep dreams visualization
          setIsSleeping(true);
          // T1343: Start nap timer
          setNapStartTime(Date.now());
          setTimeout(() => {
            setIsSleeping(false);
            setNapStartTime(null); // T1343: Reset nap timer when waking
          }, 4000); // Dreams last a bit longer than the action
          updateQuestProgress('sleep'); // T1185: Quest progress
          break;
        case 'kitchen':
          message = t.messages.eating;
          // T1338: Weight tracking - eating increases weight
          const newWeight = Math.min(100, (stats.weight ?? 50) + 8);
          statChanges = { ...statChanges, hunger: Math.min(100, stats.hunger + 30), health: Math.min(100, stats.health + 5), weight: newWeight };
          // T1338: Show overfed warning if weight too high
          if (newWeight > 80) {
            setEventMessage(t.weight?.overfed || '🐷 Too chubby! Time to play!');
          }
          setAchievements(a => a.map(ach => ach.id === 'firstMeal' ? { ...ach, progress: 1 } : ach));
          playSound('action-eat');
          updateQuestProgress('feed'); // T1185: Quest progress
          break;
        case 'garden':
          message = t.messages.playing;
          // T1338: Weight tracking - playing/exercise reduces weight
          const exerciseWeight = Math.max(0, (stats.weight ?? 50) - 5);
          statChanges = { ...statChanges, happiness: Math.min(100, stats.happiness + 25), energy: Math.max(0, stats.energy - 10), coins: stats.coins + 10, weight: exerciseWeight };
          setAchievements(a => a.map(ach => ach.id === 'socialite' ? { ...ach, progress: ach.progress + 1 } : ach));
          playSound('action-play');
          playSound('coin-collect');
          updateQuestProgress('play'); // T1185: Quest progress
          break;
        case 'living':
          message = t.messages.watching;
          statChanges = { ...statChanges, happiness: Math.min(100, stats.happiness + 15), energy: Math.min(100, stats.energy + 5) };
          playSound('ui-success');
          break;
        case 'bathroom':
          message = t.messages.bathing;
          statChanges = { ...statChanges, health: Math.min(100, stats.health + 15), happiness: Math.min(100, stats.happiness + 10) };
          playSound('action-bath');
          updateQuestProgress('bath'); // T1185: Quest progress
          // T1342: Trigger bathing animation 🛁✨
          setIsBathing(true);
          // Generate bath bubbles around Luna
          const newBubbles = Array.from({ length: 12 }, (_, i) => ({
            id: Date.now() + i,
            x: lunaPosition.x + (Math.random() - 0.5) * 30,
            y: lunaPosition.y + (Math.random() - 0.5) * 25,
            size: 8 + Math.random() * 16,
            delay: Math.random() * 0.5,
          }));
          setBathBubbles(newBubbles);
          // End bathing animation after 2.5 seconds
          setTimeout(() => {
            setIsBathing(false);
            setBathBubbles([]);
          }, 2500);
          break;
        case 'garage':
          message = t.messages.driving;
          statChanges = { ...statChanges, happiness: Math.min(100, stats.happiness + 20), energy: Math.max(0, stats.energy - 5) };
          playSound('action-drive');
          break;
        case 'shop':
          message = t.messages.shopping;
          statChanges = { ...statChanges, happiness: Math.min(100, stats.happiness + 30), coins: stats.coins - cost };
          setAchievements(a => a.map(ach => ach.id === 'shopper' ? { ...ach, progress: ach.progress + 1 } : ach));
          playSound('action-shop');
          updateQuestProgress('shop'); // T1185: Quest progress
          break;
        case 'supermarket':
          message = t.messages.buying;
          // T1338: Weight tracking - buying food increases weight
          const foodWeight = Math.min(100, (stats.weight ?? 50) + 6);
          statChanges = { ...statChanges, hunger: Math.min(100, stats.hunger + 25), coins: stats.coins - cost, weight: foodWeight };
          // T1338: Show overfed warning if weight too high
          if (foodWeight > 80) {
            setEventMessage(t.weight?.overfed || '🐷 Too chubby! Time to play!');
          }
          playSound('action-shop');
          updateQuestProgress('feed'); // T1185: Quest progress (buying food counts as feeding)
          break;
        case 'attic':
          message = t.messages.treasureHunt;
          // 30% chance of finding treasure!
          if (Math.random() < 0.3) {
            statChanges = { ...statChanges, happiness: Math.min(100, stats.happiness + 20), coins: stats.coins + 25 };
            playSound('coin-collect');
          } else {
            statChanges = { ...statChanges, happiness: Math.min(100, stats.happiness + 10), xp: stats.xp + 10 };
          }
          playSound('ui-success');
          updateQuestProgress('treasure'); // T1185: Quest progress
          break;
        case 'basement':
          message = t.messages.building;
          statChanges = { ...statChanges, happiness: Math.min(100, stats.happiness + 15), energy: Math.max(0, stats.energy - 10), xp: stats.xp + 15 };
          playSound('ui-success');
          break;
        case 'library':
          message = t.messages.reading;
          // Reading is great for happiness and health!
          statChanges = { ...statChanges, happiness: Math.min(100, stats.happiness + 25), health: Math.min(100, stats.health + 10), xp: stats.xp + 20 };
          playSound('ui-success');
          break;
      }

      // Show mood-specific message if applicable, otherwise show default message
      if (moodMessage && moodBonus < 1.0) {
        // Show mood reaction first, then the action
        showBubble(moodMessage);
        setTimeout(() => showBubble(message), 1500);
      } else if (moodMessage && moodBonus >= 1.0) {
        // Positive mood - show excited message
        showBubble(`${message} ${getMoodEmoji(mood)}`);
      } else {
        showBubble(message);
      }
      
      // Apply mood bonus to happiness gains
      if (statChanges.happiness && typeof statChanges.happiness === 'number') {
        const happinessGain = statChanges.happiness - stats.happiness;
        if (happinessGain > 0) {
          statChanges.happiness = Math.min(100, stats.happiness + Math.round(happinessGain * moodBonus));
        }
      }
      
      // T1329: Apply personality multipliers to stat changes
      if (statChanges.happiness && typeof statChanges.happiness === 'number') {
        const happinessGain = statChanges.happiness - stats.happiness;
        if (happinessGain > 0) {
          statChanges.happiness = Math.min(100, stats.happiness + Math.round(happinessGain * personalityInfo.happinessMultiplier));
        }
      }
      if (statChanges.energy && typeof statChanges.energy === 'number') {
        const energyChange = statChanges.energy - stats.energy;
        if (energyChange < 0) {
          // Energy cost - apply multiplier
          statChanges.energy = Math.max(0, stats.energy + Math.round(energyChange * personalityInfo.energyMultiplier));
        }
      }
      
      // T1339: Log the activity
      const activityTypeMap: Record<RoomKey, ActivityType> = {
        bedroom: 'sleep',
        kitchen: 'eat',
        garden: 'play',
        living: 'play',
        bathroom: 'bath',
        garage: 'play',
        shop: 'shop',
        supermarket: 'eat',
        attic: 'treasure',
        basement: 'explore',
        library: 'read',
      };
      const activityStats = {
        happiness: statChanges.happiness && typeof statChanges.happiness === 'number' 
          ? Math.max(0, statChanges.happiness - stats.happiness) : 0,
        energy: statChanges.energy && typeof statChanges.energy === 'number' 
          ? statChanges.energy - stats.energy : 0,
        coins: statChanges.coins && typeof statChanges.coins === 'number' 
          ? statChanges.coins - stats.coins : 0,
      };
      logActivity(activityTypeMap[room.key], room.key, activityStats);
      
      setStats(prev => ({ ...prev, ...statChanges }));
    });
  };

  const navigateToRoom = (index: number) => {
    const room = roomData[index];
    const roomKey = room.key;
    const isNewRoom = !gameState.roomsVisited.has(roomKey);
    
    setGameState(g => ({ ...g, roomsVisited: new Set([...g.roomsVisited, roomKey]) }));
    setCurrentRoom(index);
    setShowMap(false);
    setLunaPosition({ x: 50, y: 60 });
    playSound('ui-click');
    haptic.medium(); // T1158: Haptic feedback for room navigation
    
    // T1345: Track room visits for favorite room tracker 🏠
    setFavoriteRoomState(prev => {
      const newCounts = { ...prev.visitCounts };
      newCounts[roomKey] = (newCounts[roomKey] || 0) + 1;
      
      // Determine the new favorite room (the one with most visits)
      let maxVisits = 0;
      let newFavorite: RoomKey | null = null;
      for (const [key, count] of Object.entries(newCounts)) {
        if (count > maxVisits) {
          maxVisits = count;
          newFavorite = key as RoomKey;
        }
      }
      
      return {
        visitCounts: newCounts,
        favoriteRoom: newFavorite,
        lastUpdated: new Date().toISOString(),
      };
    });
    
    // T1185: Track room visits for daily quest
    setVisitedRoomsToday(prev => {
      const newSet = new Set(prev);
      if (!newSet.has(roomKey)) {
        newSet.add(roomKey);
        updateQuestProgress('visit');
      }
      return newSet;
    });
    
    // Show room unlock popup for first-time visits (T1168)
    if (isNewRoom) {
      setRoomUnlockPopup({ roomKey, roomIcon: room.icon });
      playSound('achievement');
      haptic.success();
    }
    
    // T1197: Check for pet discoveries when entering a room
    setTimeout(() => checkRoomPetDiscovery(roomKey), 1500); // Delay to let room animations finish
  };

  const toggleLanguage = () => {
    setLang(lang === 'it' ? 'en' : 'it');
    haptic.light(); // T1158: Haptic feedback for language toggle
  };
  const floatY = Math.sin(floatPhase * Math.PI / 180) * 8;

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragPosition({ x: clientX, y: clientY });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragPosition({ x: clientX, y: clientY });
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !mapContainerRef) { setIsDragging(false); return; }
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;
    const rect = mapContainerRef.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * 100;
    const relY = ((clientY - rect.top) / rect.height) * 100;
    const droppedRoom = houseRooms.find(room => {
      const h = room.hotspot;
      return relX >= h.x && relX <= h.x + h.width && relY >= h.y && relY <= h.y + h.height;
    });
    if (droppedRoom) navigateToRoom(roomData.findIndex(r => r.key === droppedRoom.key));
    setIsDragging(false);
  };

  const currentRoomData = roomData[currentRoom];
  const roomActions = t.actions[currentRoomData.key as keyof typeof t.actions];
  const houseRooms = roomData.filter(r => r.hotspot.width > 0);
  const outsideRooms = roomData.filter(r => r.category === 'outside');
  const timeClass = `time-${timeOfDay}`;

  // Game completion handler for new games
  const handleGameComplete = (score: number) => {
    const coinsEarned = Math.floor(score / 2);
    setStats(s => ({ ...s, coins: s.coins + coinsEarned, happiness: Math.min(100, s.happiness + 15), xp: s.xp + score }));
    setActiveGame(null);
    playSound('coin-collect');
    haptic.success(); // T1158: Haptic feedback for game completion
    // T1339: Log game activity
    logActivity('game', 'living', { happiness: 15, coins: coinsEarned });
  };

  const handleSelectGame = (game: string) => {
    if (game === 'stars') {
      setShowMiniGame(true);
      setActiveGame(null);
    } else {
      setActiveGame(game);
    }
  };

  // Interactive objects handlers
  const handleObjectGameStart = (gameType: string) => {
    setShowObjectsHint(false); // Hide hint after first interaction
    haptic.medium(); // T1158: Haptic feedback for starting game
    if (gameType === 'stars') {
      setShowMiniGame(true);
    } else if (gameType === 'quiz') {
      setActiveGame('quiz');
    } else {
      setActiveGame(gameType);
    }
  };

  const handleObjectReward = (reward: { coins?: number; xp?: number; happiness?: number; health?: number }) => {
    setShowObjectsHint(false);
    haptic.light(); // T1158: Haptic feedback for object rewards
    setStats(prev => ({
      ...prev,
      coins: prev.coins + (reward.coins || 0),
      xp: prev.xp + (reward.xp || 0),
      happiness: Math.min(100, prev.happiness + (reward.happiness || 0)),
      health: Math.min(100, prev.health + (reward.health || 0)),
    }));
  };

  const handleObjectStory = (story: string) => {
    setShowObjectsHint(false);
    setStoryText(story);
    setShowStory(true);
  };

  // Handle pet naming
  const handlePetNaming = (name: string) => {
    setPetName(name);
    setShowNamingModal(false);
  };

  // T1207: Handle pet renaming
  const handlePetRename = (name: string) => {
    setPetName(name);
    setShowRenameModal(false);
    // Show success feedback
    setActionBubble(t.petRename.success);
    playSound('ui-success');
    haptic.success();
    setTimeout(() => setActionBubble(''), 2000);
  };

  // Costume handlers (T1165)
  const handleUnlockCostume = (costumeId: string, cost: number) => {
    if (stats.coins >= cost) {
      setStats(prev => ({ ...prev, coins: prev.coins - cost }));
      setCostumeState(prev => ({
        ...prev,
        unlocked: [...prev.unlocked, costumeId],
      }));
      playSound('coin-collect');
      playSound('ui-success');
    }
  };

  const handleEquipCostume = (costumeId: string, category: CostumeCategory) => {
    setCostumeState(prev => ({
      ...prev,
      equipped: {
        ...prev.equipped,
        [category]: costumeId || null,
      },
    }));
    playSound('ui-click');
  };

  // T1332: Fur Color handlers
  const handleUnlockFurColor = (colorId: FurColorId, cost: number) => {
    if (stats.coins >= cost) {
      setStats(prev => ({ ...prev, coins: prev.coins - cost }));
      setUnlockedFurColors(prev => [...prev, colorId]);
      // Auto-select the newly unlocked color
      setFurColor(colorId);
      playSound('coin-collect');
      playSound('ui-success');
      haptic.success();
    }
  };

  const handleSelectFurColor = (colorId: FurColorId) => {
    setFurColor(colorId);
    playSound('ui-click');
    haptic.light();
  };

  // T1333: Eye Color handlers
  const handleUnlockEyeColor = (eyeColorId: string, cost: number) => {
    if (stats.coins >= cost) {
      setStats(prev => ({ ...prev, coins: prev.coins - cost }));
      setCostumeState(prev => ({
        ...prev,
        unlockedEyeColors: [...(prev.unlockedEyeColors || ['amber']), eyeColorId],
        eyeColor: eyeColorId, // Auto-select the newly unlocked color
      }));
      playSound('coin-collect');
      playSound('ui-success');
      haptic.success();
    }
  };

  const handleSelectEyeColor = (eyeColorId: string) => {
    setCostumeState(prev => ({
      ...prev,
      eyeColor: eyeColorId,
    }));
    playSound('ui-click');
    haptic.light();
  };

  // Toy Box handlers (T1175)
  const handleUnlockToy = (toyId: string, cost: number) => {
    if (stats.coins >= cost) {
      setStats(prev => ({ ...prev, coins: prev.coins - cost }));
      setToyBoxState(prev => ({
        ...prev,
        unlockedToys: [...prev.unlockedToys, toyId],
      }));
      playSound('coin-collect');
      playSound('ui-success');
      haptic.success();
    }
  };

  const handlePlayWithToy = (toy: Toy) => {
    // T1329: Apply personality energy multiplier
    const personalityInfo = PERSONALITIES[petPersonality];
    const adjustedEnergyCost = Math.round(toy.energyCost * personalityInfo.energyMultiplier);
    
    if (stats.energy < adjustedEnergyCost) return;
    
    // Play sounds and haptic
    playSound('action-play');
    haptic.medium();
    
    // T1329: Apply personality happiness multiplier
    const adjustedHappinessBoost = Math.round(toy.happinessBoost * personalityInfo.happinessMultiplier);
    
    // Update stats - T1338: Playing with toys also burns calories (reduces weight)
    const weightLoss = Math.max(0, Math.floor(adjustedEnergyCost / 3)); // More energy spent = more weight lost
    setStats(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + adjustedHappinessBoost),
      energy: Math.max(0, prev.energy - adjustedEnergyCost),
      xp: prev.xp + Math.floor(adjustedHappinessBoost / 2),
      weight: Math.max(30, (prev.weight ?? 50) - weightLoss), // T1338: Min weight is 30
    }));
    
    // T1324: Special handling for CATNIP - triggers crazy mode! 🌿😸
    if (toy.id === 'catnip') {
      activateCatnipMode();
    } else {
      // Show toy animation at Luna's position (regular toys)
      setToyPlayAnimation({ toy, x: lunaPosition.x, y: lunaPosition.y });
      setTimeout(() => setToyPlayAnimation(null), 2000);
      
      // Show happy bubble
      const playMessages = lang === 'it' 
        ? ['Che bello! 🎉', 'Evviva! ✨', 'Adoro questo gioco! 💖', 'Ancora, ancora! 🌟']
        : ['So fun! 🎉', 'Yay! ✨', 'I love this toy! 💖', 'More, more! 🌟'];
      showBubble(playMessages[Math.floor(Math.random() * playMessages.length)]);
    }
    
    // T1339: Log toy play activity
    logActivity('toy', roomData[currentRoom]?.key || 'living', { happiness: adjustedHappinessBoost, energy: -adjustedEnergyCost });
    
    // T1185: Quest progress for toy play
    updateQuestProgress('toy');
    
    // Close toy box after playing
    setShowToyBox(false);
  };
  
  // T1349: Pet Treats Shop handlers 🍪
  const handleBuyTreat = (treatId: string, cost: number) => {
    if (stats.coins >= cost) {
      setStats(prev => ({ ...prev, coins: prev.coins - cost }));
      setTreatShopState(prev => {
        const newState = {
          ...prev,
          inventory: {
            ...prev.inventory,
            [treatId]: (prev.inventory[treatId] || 0) + 1,
          },
        };
        // Persist to localStorage
        try {
          localStorage.setItem('moonlight-treat-shop', JSON.stringify(newState));
        } catch {}
        return newState;
      });
      playSound('coin-collect');
      haptic.medium();
      
      // T1185: Quest progress for shop purchases
      updateQuestProgress('shop');
    }
  };

  const handleFeedTreat = (treat: Treat) => {
    const owned = treatShopState.inventory[treat.id] || 0;
    if (owned <= 0 || stats.hunger >= 100) return;
    
    // Play sounds and haptic
    playSound('action-eat');
    haptic.success();
    
    // Update treat inventory
    setTreatShopState(prev => {
      const newState = {
        ...prev,
        inventory: {
          ...prev.inventory,
          [treat.id]: Math.max(0, (prev.inventory[treat.id] || 0) - 1),
        },
        totalFed: prev.totalFed + 1,
      };
      // Persist to localStorage
      try {
        localStorage.setItem('moonlight-treat-shop', JSON.stringify(newState));
      } catch {}
      return newState;
    });
    
    // Update pet stats
    setStats(prev => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + treat.hungerRestore),
      happiness: Math.min(100, prev.happiness + treat.happinessBoost),
      weight: Math.min(100, (prev.weight ?? 50) + treat.weightGain), // T1338: Weight tracking
      xp: prev.xp + Math.floor(treat.happinessBoost / 2),
    }));
    
    // Show happy bubble
    const feedMessages = lang === 'it' 
      ? ['Gnam gnam! 😋', 'Che buono! 😻', 'Delizioso! 💖', 'Ancora! 🍪']
      : ['Yum yum! 😋', 'So tasty! 😻', 'Delicious! 💖', 'More! 🍪'];
    showBubble(feedMessages[Math.floor(Math.random() * feedMessages.length)]);
    
    // T1339: Log feeding activity
    logActivity('eat', roomData[currentRoom]?.key || 'kitchen', { 
      hunger: treat.hungerRestore, 
      happiness: treat.happinessBoost 
    });
    
    // T1185: Quest progress for feeding
    updateQuestProgress('feed');
  };
  
  // T1324: Catnip Crazy Mode handler 🌿😸
  const activateCatnipMode = useCallback(() => {
    const CATNIP_DURATION = 8000; // 8 seconds of crazy!
    
    // Activate crazy mode
    setIsCatnipMode(true);
    setCatnipTimeLeft(CATNIP_DURATION);
    
    // Show crazy mode bubble
    const crazyMessages = lang === 'it'
      ? ['MIAOOO!! 😸🌀', 'SONO PAZZAAA! 🌿✨', 'WHEEE!! 🎉😹', 'ZOOM ZOOM! 💨😸']
      : ['MEOWWW!! 😸🌀', "I'M CRAZYYY! 🌿✨", 'WHEEE!! 🎉😹', 'ZOOM ZOOM! 💨😸'];
    showBubble(crazyMessages[Math.floor(Math.random() * crazyMessages.length)]);
    
    // Trigger heavy haptic for intense experience
    haptic.heavy();
    playSound('sparkle');
    
    // Spawn initial crazy sparkles
    spawnCatnipSparkles();
    
    // Start crazy movement loop
    const moveInterval = setInterval(() => {
      // Random chaotic movement
      const randomX = 20 + Math.random() * 60;
      const randomY = 30 + Math.random() * 40;
      setLunaPosition({ x: randomX, y: randomY });
      setFacingDirection(Math.random() > 0.5 ? 'left' : 'right');
      spawnCatnipSparkles();
      haptic.light();
    }, 400);
    
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCatnipTimeLeft(prev => {
        if (prev <= 100) {
          return 0;
        }
        return prev - 100;
      });
    }, 100);
    
    // End crazy mode after duration
    setTimeout(() => {
      clearInterval(moveInterval);
      clearInterval(countdownInterval);
      setIsCatnipMode(false);
      setCatnipTimeLeft(0);
      setCatnipSparkles([]);
      
      // Return to center and show exhausted message
      setLunaPosition({ x: 50, y: 50 });
      showBubble(t.toyBox.catnipEnded);
      playSound('ui-success');
      haptic.success();
    }, CATNIP_DURATION);
  }, [lang, playSound, showBubble, t.toyBox.catnipEnded]);
  
  // T1324: Spawn crazy sparkle effects
  const spawnCatnipSparkles = useCallback(() => {
    const crazyEmojis = ['🌀', '💫', '⭐', '✨', '🌿', '😸', '💨', '🎉', '🔥', '⚡'];
    const newSparkles = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: lunaPosition.x + (Math.random() - 0.5) * 40,
      y: lunaPosition.y + (Math.random() - 0.5) * 30,
      emoji: crazyEmojis[Math.floor(Math.random() * crazyEmojis.length)],
    }));
    
    setCatnipSparkles(prev => [...prev, ...newSparkles].slice(-30)); // Keep max 30 sparkles
    
    // Auto-remove sparkles after animation
    setTimeout(() => {
      setCatnipSparkles(prev => prev.filter(s => !newSparkles.some(ns => ns.id === s.id)));
    }, 1000);
  }, [lunaPosition]);

  const handleSetFavoriteToy = (toyId: string | null) => {
    setToyBoxState(prev => ({
      ...prev,
      favoriteToy: toyId,
    }));
    playSound('ui-click');
    haptic.light();
  };

  // T1179: Mood Journal handler
  const handleSaveJournalEntry = (entry: MoodJournalEntry) => {
    setMoodJournalState(prev => ({
      entries: [...prev.entries, entry],
      lastEntryDate: new Date().toDateString(),
    }));
  };

  // T1192: Gift Sending handler
  const handleSendGift = useCallback((gift: Gift, toCode: string): boolean => {
    if (stats.coins < gift.cost) return false;
    
    // Deduct coins
    setStats(prev => ({ ...prev, coins: prev.coins - gift.cost }));
    
    // Add to gift history
    const newEntry: GiftHistoryEntry = {
      id: Date.now().toString(),
      giftId: gift.id,
      toCode,
      sentAt: new Date().toISOString(),
    };
    
    setGiftState(prev => {
      const newState = {
        sentGifts: [...prev.sentGifts, newEntry],
        totalSent: prev.totalSent + 1,
      };
      // Persist to localStorage
      try {
        localStorage.setItem('moonlight-gift-state', JSON.stringify(newState));
      } catch {}
      return newState;
    });
    
    return true;
  }, [stats.coins]);

  // T1202: Pet Training handlers - teach Luna tricks for XP!
  const handleLearnTrick = useCallback((trickId: string, xpReward: number) => {
    setPetTrainingState(prev => {
      const newState = {
        ...prev,
        learnedTricks: [...prev.learnedTricks, trickId],
        practiceCount: { ...prev.practiceCount, [trickId]: 0 }, // Reset practice count after learning
        lastTrainingDate: new Date().toISOString(),
      };
      // Persist to localStorage
      try {
        localStorage.setItem('moonlight-pet-training', JSON.stringify(newState));
      } catch {}
      return newState;
    });
    
    // Award XP for learning the trick
    setStats(prev => ({
      ...prev,
      xp: prev.xp + xpReward,
      happiness: Math.min(100, prev.happiness + 10), // Luna is happy she learned something!
    }));
    
    // T1339: Log training activity
    logActivity('train', 'living', { happiness: 10 });
  }, [logActivity]);

  const handlePracticeTrick = useCallback((trickId: string) => {
    setPetTrainingState(prev => {
      const newState = {
        ...prev,
        practiceCount: {
          ...prev.practiceCount,
          [trickId]: (prev.practiceCount[trickId] || 0) + 1,
        },
        lastTrainingDate: new Date().toISOString(),
      };
      // Persist to localStorage
      try {
        localStorage.setItem('moonlight-pet-training', JSON.stringify(newState));
      } catch {}
      return newState;
    });
    
    // Small XP boost for practice
    setStats(prev => ({
      ...prev,
      xp: prev.xp + 5, // Small XP for practicing
    }));
  }, []);

  // Loading spinner during initialization (T1156)
  if (isInitializing) {
    return <LoadingSpinner lang={lang} />;
  }

  // Popups - Pet naming modal first (for first-time users)
  if (showNamingModal) {
    return <PetNamingModal lang={lang} onConfirm={handlePetNaming} />;
  }
  
  if (welcomeMessage) {
    return (
      <WelcomeBackPopup 
        message={welcomeMessage.message} 
        emoji={welcomeMessage.emoji}
        hoursAway={welcomeMessage.hoursAway}
        totalVisits={totalVisits}
        lang={lang} 
        onClose={() => setWelcomeMessage(null)} 
      />
    );
  }
  
  if (showDailyReward) {
    return <DailyRewardPopup coins={dailyRewardAmount} streak={gameState.streak} lang={lang} onClose={claimDailyReward} />;
  }

  // T1169: Birthday celebration popup
  if (showBirthdayPopup && petName) {
    const petAge = getPetAge(petCreatedAt);
    return (
      <BirthdayPopup
        petName={petName}
        age={petAge}
        lang={lang}
        onClose={(coins) => {
          setStats(prev => ({ ...prev, coins: prev.coins + coins, happiness: 100 }));
          setLastBirthdayCelebrated(new Date().getFullYear().toString());
          setShowBirthdayPopup(false);
          playSound('achievement');
          playSound('coin-collect');
          haptic.success();
        }}
      />
    );
  }

  // Evolution Popup (T1173)
  if (showEvolutionPopup) {
    return (
      <EvolutionPopup
        evolution={showEvolutionPopup}
        petName={petName || 'Luna'}
        lang={lang}
        onClose={() => setShowEvolutionPopup(null)}
      />
    );
  }

  // Wardrobe Modal (T1165)
  if (showWardrobe) {
    return (
      <WardrobeModal
        lang={lang}
        costumes={costumeState}
        playerLevel={stats.level}
        playerCoins={stats.coins}
        onUnlock={handleUnlockCostume}
        onEquip={handleEquipCostume}
        onUnlockEyeColor={handleUnlockEyeColor}
        onSelectEyeColor={handleSelectEyeColor}
        onClose={() => setShowWardrobe(false)}
      />
    );
  }

  // T1332: Fur Color Picker Modal
  if (showFurColorPicker) {
    return (
      <FurColorPickerModal
        lang={lang}
        currentColor={furColor}
        unlockedColors={unlockedFurColors}
        playerLevel={stats.level}
        playerCoins={stats.coins}
        onUnlock={handleUnlockFurColor}
        onSelect={handleSelectFurColor}
        onClose={() => setShowFurColorPicker(false)}
      />
    );
  }

  // Toy Box Modal (T1175)
  if (showToyBox) {
    return (
      <ToyBoxModal
        lang={lang}
        toyBox={toyBoxState}
        playerLevel={stats.level}
        playerCoins={stats.coins}
        playerEnergy={stats.energy}
        onUnlock={handleUnlockToy}
        onPlay={handlePlayWithToy}
        onSetFavorite={handleSetFavoriteToy}
        onClose={() => setShowToyBox(false)}
      />
    );
  }

  // T1349: Treat Shop Modal 🍪
  if (showTreatShop) {
    return (
      <TreatShopModal
        lang={lang}
        treatShop={treatShopState}
        playerLevel={stats.level}
        playerCoins={stats.coins}
        petHunger={stats.hunger}
        onBuy={handleBuyTreat}
        onFeed={handleFeedTreat}
        onClose={() => setShowTreatShop(false)}
      />
    );
  }

  // Fish Tank Mini-Game (T1208)
  if (showFishTank) {
    return (
      <FishTankMiniGame
        lang={lang}
        onCollectCoins={(coins) => {
          setStats(s => ({ ...s, coins: s.coins + coins }));
          playSound('coin-collect');
          haptic.light();
        }}
        onFeedFish={() => {
          setStats(s => ({ ...s, happiness: Math.min(100, s.happiness + 5) }));
          playSound('ui-success');
          haptic.medium();
        }}
        onClose={() => setShowFishTank(false)}
      />
    );
  }

  // Photo Mode Modal (T1174)
  if (showPhotoMode) {
    return (
      <PhotoModeModal
        lang={lang}
        petName={petName || 'Pip'}
        mood={mood}
        costumeState={costumeState}
        roomBg={currentRoomData.bg}
        roomKey={currentRoomData.key}
        playSound={playSound as (sound: string) => void}
        onClose={() => setShowPhotoMode(false)}
      />
    );
  }

  // T1179: Mood Journal Modal
  if (showMoodJournal) {
    return (
      <MoodJournalModal
        lang={lang}
        petName={petName || 'Pip'}
        currentMood={mood}
        currentStats={{ happiness: stats.happiness, energy: stats.energy, hunger: stats.hunger }}
        journalState={moodJournalState}
        onSaveEntry={handleSaveJournalEntry}
        onClose={() => setShowMoodJournal(false)}
        playSound={playSound as (sound: string) => void}
      />
    );
  }

  // T1185: Daily Quest Panel
  if (showQuestPanel) {
    return (
      <DailyQuestPanel
        lang={lang}
        questState={dailyQuestState}
        onClaimReward={claimQuestReward}
        onClose={() => setShowQuestPanel(false)}
        playSound={playSound as (sound: string) => void}
      />
    );
  }

  // T1191: Friend Code Modal
  if (showFriendCode) {
    return (
      <FriendCodeModal
        lang={lang}
        petName={petName || 'Pip'}
        friendCode={friendCodeState.code}
        onClose={() => setShowFriendCode(false)}
        playSound={playSound as (sound: string) => void}
      />
    );
  }

  // T1192: Gift Sending Modal
  if (showGiftSending) {
    return (
      <GiftSendingModal
        lang={lang}
        petName={petName || 'Pip'}
        playerCoins={stats.coins}
        giftState={giftState}
        onSendGift={handleSendGift}
        onClose={() => setShowGiftSending(false)}
        playSound={playSound as (sound: string) => void}
      />
    );
  }

  // T1202: Pet Training Modal
  if (showPetTraining) {
    return (
      <PetTrainingModal
        lang={lang}
        petName={petName || 'Luna'}
        playerLevel={stats.level}
        trainingState={petTrainingState}
        onLearnTrick={handleLearnTrick}
        onPractice={handlePracticeTrick}
        onClose={() => setShowPetTraining(false)}
        playSound={playSound as (sound: string) => void}
      />
    );
  }

  // T1197: Pet Album Modal
  if (showPetAlbum) {
    return (
      <PetAlbumModal
        lang={lang}
        albumState={petAlbumState}
        playerLevel={stats.level}
        onClose={() => setShowPetAlbum(false)}
        playSound={playSound as (sound: string) => void}
      />
    );
  }

  // T1330: Health Checkup Modal 🏥
  if (showHealthCheckup) {
    return (
      <HealthCheckupModal
        lang={lang}
        petName={petName || 'Luna'}
        stats={stats}
        lastCheckup={lastHealthCheckup}
        onCheckup={(coins, xp) => {
          setStats(prev => ({
            ...prev,
            coins: prev.coins + coins,
            xp: prev.xp + xp,
          }));
          setLastHealthCheckup(Date.now());
          try {
            localStorage.setItem('moonlight-last-health-checkup', Date.now().toString());
          } catch {}
        }}
        onClose={() => setShowHealthCheckup(false)}
        playSound={playSound as (sound: string) => void}
        vaccinationState={vaccinationState}
        onUpdateVaccination={setVaccinationState}
      />
    );
  }

  // T1339: Activity Log Modal 📓
  if (showActivityLog) {
    return (
      <ActivityLogModal
        lang={lang}
        petName={petName || 'Luna'}
        activityLog={activityLogState}
        totalPlayMinutes={gameState.totalPlayMinutes} // T1346: Pass total playtime
        onClose={() => setShowActivityLog(false)}
      />
    );
  }

  // T1353: Fortune Telling Modal 🔮
  if (showFortune) {
    const fortuneT = t.fortune;
    const categories = ['luck', 'love', 'adventure', 'play', 'magic'] as const;
    const today = new Date().toISOString().split('T')[0];
    const canGetFortune = fortuneState.lastFortuneDate !== today || fortuneState.fortunesToday < 3;
    const fortunesLeft = fortuneState.lastFortuneDate === today ? 3 - fortuneState.fortunesToday : 3;
    
    const getFortune = () => {
      if (!canGetFortune) return;
      
      // Pick random category and fortune
      const category = categories[Math.floor(Math.random() * categories.length)];
      const fortunes = fortuneT.fortunes[category] as string[];
      const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
      const coins = Math.floor(Math.random() * 10) + 5; // 5-15 coins
      
      // Update state
      const newState = {
        lastFortuneDate: today,
        fortunesToday: (fortuneState.lastFortuneDate === today ? fortuneState.fortunesToday : 0) + 1,
        lastFortune: { category, text: fortune },
      };
      setFortuneState(newState);
      try {
        localStorage.setItem('moonlight-fortune-state', JSON.stringify(newState));
      } catch {}
      
      // Give coins reward
      setStats(prev => ({ ...prev, coins: prev.coins + coins }));
      playSound('ui-success');
      haptic.success();
    };
    
    return (
      <div className="modal-overlay fortune-modal">
        <motion.div 
          className="modal-content glass-card"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          style={{
            maxWidth: '380px',
            width: '90%',
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.95), rgba(126, 34, 206, 0.9))',
            borderRadius: '24px',
            border: '3px solid rgba(233, 213, 255, 0.5)',
            boxShadow: '0 0 40px rgba(168, 85, 247, 0.4), inset 0 0 30px rgba(233, 213, 255, 0.1)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ fontSize: '4rem', marginBottom: '8px' }}
            >
              🔮
            </motion.div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: '#e9d5ff', 
              marginBottom: '4px',
              textShadow: '0 0 10px rgba(168, 85, 247, 0.8)',
            }}>
              {fortuneT.title}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#c4b5fd', opacity: 0.9 }}>
              {fortuneT.subtitle}
            </p>
          </div>
          
          {/* Crystal Ball Animation */}
          <motion.div
            style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, rgba(233, 213, 255, 0.4), rgba(168, 85, 247, 0.2), rgba(88, 28, 135, 0.6))',
              border: '4px solid rgba(233, 213, 255, 0.3)',
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.5), inset 0 0 20px rgba(233, 213, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
            animate={{
              boxShadow: [
                '0 0 30px rgba(168, 85, 247, 0.5), inset 0 0 20px rgba(233, 213, 255, 0.2)',
                '0 0 50px rgba(168, 85, 247, 0.7), inset 0 0 30px rgba(233, 213, 255, 0.4)',
                '0 0 30px rgba(168, 85, 247, 0.5), inset 0 0 20px rgba(233, 213, 255, 0.2)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Mystical swirls inside */}
            <motion.div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: 'conic-gradient(from 0deg, transparent, rgba(233, 213, 255, 0.3), transparent, rgba(168, 85, 247, 0.3), transparent)',
                borderRadius: '50%',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            {fortuneState.lastFortune ? (
              <span style={{ fontSize: '2.5rem', zIndex: 1 }}>
                {fortuneT.categories[fortuneState.lastFortune.category as keyof typeof fortuneT.categories]?.split(' ')[0] || '✨'}
              </span>
            ) : (
              <motion.span 
                style={{ fontSize: '2rem', zIndex: 1 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.span>
            )}
          </motion.div>
          
          {/* Fortune Display */}
          {fortuneState.lastFortune && fortuneState.lastFortuneDate === today && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(233, 213, 255, 0.15)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '16px',
                textAlign: 'center',
                border: '2px solid rgba(233, 213, 255, 0.3)',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: '#c4b5fd', marginBottom: '8px' }}>
                {fortuneT.categories[fortuneState.lastFortune.category as keyof typeof fortuneT.categories]}
              </div>
              <div style={{ 
                fontSize: '1.1rem', 
                color: '#f3e8ff', 
                fontStyle: 'italic',
                lineHeight: 1.4,
              }}>
                "{fortuneState.lastFortune.text}"
              </div>
            </motion.div>
          )}
          
          {/* Fortunes Left Indicator */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
          }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: i < fortunesLeft 
                    ? 'linear-gradient(135deg, #a855f7, #7c3aed)' 
                    : 'rgba(100, 100, 100, 0.3)',
                  border: '2px solid rgba(233, 213, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                }}
                animate={i < fortunesLeft ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              >
                {i < fortunesLeft ? '✨' : ''}
              </motion.div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#c4b5fd', marginBottom: '16px' }}>
            {fortuneT.fortunesLeft.replace('{count}', String(fortunesLeft))}
          </p>
          
          {/* Action Button */}
          <motion.button
            onClick={getFortune}
            disabled={!canGetFortune}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '16px',
              border: 'none',
              background: canGetFortune 
                ? 'linear-gradient(135deg, #a855f7, #7c3aed)' 
                : 'rgba(100, 100, 100, 0.4)',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: canGetFortune ? 'pointer' : 'not-allowed',
              marginBottom: '12px',
              boxShadow: canGetFortune ? '0 4px 15px rgba(168, 85, 247, 0.4)' : 'none',
            }}
            whileHover={canGetFortune ? { scale: 1.02 } : {}}
            whileTap={canGetFortune ? { scale: 0.98 } : {}}
          >
            {canGetFortune 
              ? (fortuneState.lastFortune && fortuneState.lastFortuneDate === today 
                  ? fortuneT.newFortune + ' 🔮' 
                  : fortuneT.askFortune)
              : fortuneT.dailyLimit
            }
          </motion.button>
          
          {/* Close Button */}
          <button
            onClick={() => setShowFortune(false)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: '2px solid rgba(233, 213, 255, 0.3)',
              background: 'transparent',
              color: '#e9d5ff',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            {fortuneT.close}
          </button>
        </motion.div>
      </div>
    );
  }

  // T1450: Pet Fun Facts Popup 🐱📚
  if (showFunFacts) {
    const factsT = t.funFacts;
    const allFacts = factsT.facts as Array<{ text: string; category: string; emoji: string }>;
    
    // Get a random fact that hasn't been seen, or any random if all seen
    const getNewFactIndex = () => {
      const unseenIndices = allFacts.map((_, i) => i).filter(i => !seenFactIndices.includes(i));
      if (unseenIndices.length > 0) {
        return unseenIndices[Math.floor(Math.random() * unseenIndices.length)];
      }
      // All facts seen, show random one
      return Math.floor(Math.random() * allFacts.length);
    };
    
    // Initialize current fact if null
    if (currentFactIndex === null) {
      const newIndex = getNewFactIndex();
      setCurrentFactIndex(newIndex);
      if (!seenFactIndices.includes(newIndex)) {
        const newSeen = [...seenFactIndices, newIndex];
        setSeenFactIndices(newSeen);
        try {
          localStorage.setItem('moonlight-seen-facts', JSON.stringify(newSeen));
        } catch {}
      }
    }
    
    const currentFact = currentFactIndex !== null ? allFacts[currentFactIndex] : allFacts[0];
    const categoryLabel = factsT.category[currentFact.category as keyof typeof factsT.category] || currentFact.category;
    
    const handleNextFact = () => {
      const newIndex = getNewFactIndex();
      setCurrentFactIndex(newIndex);
      if (!seenFactIndices.includes(newIndex)) {
        const newSeen = [...seenFactIndices, newIndex];
        setSeenFactIndices(newSeen);
        try {
          localStorage.setItem('moonlight-seen-facts', JSON.stringify(newSeen));
        } catch {}
      }
      playSound('ui-click');
      haptic.light();
    };
    
    return (
      <div className="modal-overlay fun-facts-modal">
        <motion.div 
          className="modal-content glass-card"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          style={{
            maxWidth: '380px',
            width: '90%',
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.9))',
            borderRadius: '24px',
            border: '3px solid rgba(191, 219, 254, 0.5)',
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.4), inset 0 0 30px rgba(191, 219, 254, 0.1)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: '3.5rem', marginBottom: '8px' }}
            >
              🐱
            </motion.div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: '#e0f2fe', 
              marginBottom: '4px',
              textShadow: '0 0 10px rgba(59, 130, 246, 0.8)',
            }}>
              {factsT.title}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#bfdbfe', opacity: 0.9 }}>
              {factsT.subtitle}
            </p>
          </div>
          
          {/* Category Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.85rem',
              color: '#e0f2fe',
              marginBottom: '16px',
              textAlign: 'center',
              width: '100%',
            }}
          >
            {categoryLabel}
          </motion.div>
          
          {/* Fact Card */}
          <motion.div
            key={currentFactIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', damping: 20 }}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '20px',
              textAlign: 'center',
              border: '2px solid rgba(191, 219, 254, 0.3)',
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ fontSize: '2.5rem', marginBottom: '12px' }}
            >
              {currentFact.emoji}
            </motion.span>
            <p style={{ 
              fontSize: '1.1rem', 
              color: 'white', 
              lineHeight: '1.5',
              fontWeight: '500',
            }}>
              {currentFact.text}
            </p>
          </motion.div>
          
          {/* Progress */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '16px',
            color: '#bfdbfe',
            fontSize: '0.85rem',
          }}>
            {factsT.learned.replace('{count}', String(seenFactIndices.length))} ({seenFactIndices.length}/{allFacts.length})
          </div>
          
          {/* Progress Bar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            height: '8px',
            marginBottom: '20px',
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(seenFactIndices.length / allFacts.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                borderRadius: '10px',
              }}
            />
          </div>
          
          {/* Next Fact Button */}
          <motion.button
            onClick={handleNextFact}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '12px',
              boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {factsT.nextFact} ✨
          </motion.button>
          
          {/* Close Button */}
          <button
            onClick={() => { setShowFunFacts(false); setCurrentFactIndex(null); }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: '2px solid rgba(191, 219, 254, 0.3)',
              background: 'transparent',
              color: '#e0f2fe',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            {factsT.close}
          </button>
          
          {/* Decorative sparkles */}
          {['✨', '⭐', '🌟', '💫'].map((emoji, i) => (
            <motion.span
              key={i}
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.3,
                repeat: Infinity,
              }}
              style={{
                position: 'absolute',
                left: `${15 + i * 25}%`,
                bottom: '10%',
                fontSize: '1.2rem',
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>
      </div>
    );
  }

  // T1345: Favorite Room Modal 🏠
  if (showFavoriteRoom) {
    return (
      <FavoriteRoomModal
        lang={lang}
        petName={petName || 'Luna'}
        favoriteRoomState={favoriteRoomState}
        onClose={() => setShowFavoriteRoom(false)}
      />
    );
  }

  // T1197: Pet Discovery Popup (shown as overlay, not blocking)
  // This will be rendered with AnimatePresence in the main view

  if (showMiniGame) {
    return <StarCatchMiniGame onComplete={handleMiniGameComplete} lang={lang} />;
  }

  // Game Hub
  if (activeGame === 'hub') {
    return <GameHub lang={lang} onSelectGame={handleSelectGame} onBack={() => setActiveGame(null)} />;
  }

  // Individual Games
  if (activeGame === 'puzzle') {
    return <PuzzleGame lang={lang} onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'drawing') {
    return <DrawingPad lang={lang} onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'memory') {
    return <MemoryGame lang={lang} onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'bubbles') {
    return <BubbleGame lang={lang} onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'simon') {
    return <SimonGame lang={lang} onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'catch') {
    return <CatchGame lang={lang} onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'gardening') {
    return <GardeningGame onClose={() => setActiveGame(null)} onReward={(coins) => {
      setStats(prev => ({ ...prev, coins: prev.coins + coins }));
    }} />;
  }

  if (activeGame === 'cooking') {
    return <CookingGame lang={lang} onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === 'quiz') {
    return <QuizGame lang={lang} onComplete={handleGameComplete} onBack={() => setActiveGame(null)} />;
  }

  // Library Books
  if (activeGame === 'library') {
    return (
      <LibraryBooks
        lang={lang}
        coins={stats.coins}
        onUnlockBook={(bookId, cost) => {
          setStats(prev => ({ ...prev, coins: prev.coins - cost }));
          setUnlockedBooks(prev => [...prev, bookId]);
        }}
        onBack={() => setActiveGame(null)}
        unlockedBooks={unlockedBooks}
        onReward={(reward) => {
          handleObjectReward(reward);
          // Track bookworm achievement progress when finishing a book
          setAchievements(a => a.map(ach => 
            ach.id === 'bookworm' ? { ...ach, progress: ach.progress + 1 } : ach
          ));
        }}
      />
    );
  }

  // Map View
  if (showMap) {
    return (
      <motion.div 
        key="map-view"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`full-page-bg map-view ${timeClass} ${nightVision ? 'night-vision' : ''}`}>
        {showAchievement && <AchievementPopup achievement={showAchievement} lang={lang} onClose={() => setShowAchievement(null)} />}
        {eventMessage && <div className="event-toast glass-card">{eventMessage}</div>}
        
        {/* Room Unlock Popup (T1168) */}
        <AnimatePresence>
          {roomUnlockPopup && (
            <RoomUnlockPopup 
              roomKey={roomUnlockPopup.roomKey} 
              roomIcon={roomUnlockPopup.roomIcon} 
              lang={lang} 
              onClose={() => setRoomUnlockPopup(null)} 
            />
          )}
        </AnimatePresence>
        
        {/* T1197: Pet Discovery Popup */}
        <AnimatePresence>
          {newlyDiscoveredPet && (
            <PetDiscoveryPopup
              pet={newlyDiscoveredPet}
              lang={lang}
              onClose={() => setNewlyDiscoveredPet(null)}
            />
          )}
        </AnimatePresence>
        
        <div className="house-map-container" ref={setMapContainerRef}
          onMouseMove={handleDragMove} onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}
          onTouchMove={handleDragMove} onTouchEnd={handleDragEnd}>
          <img src={`${BASE_URL}assets/backgrounds/house-map.jpg`} alt="Moonlight House" className="house-map-image" />
          
          {houseRooms.map((room) => (
            <button key={room.key} className={`room-hotspot ${isDragging ? 'drag-target' : ''}`}
              onClick={() => !isDragging && navigateToRoom(roomData.findIndex(r => r.key === room.key))}
              style={{ left: `${room.hotspot.x}%`, top: `${room.hotspot.y}%`, width: `${room.hotspot.width}%`, height: `${room.hotspot.height}%` }}
              title={t.rooms[room.key]}>
              <span className="hotspot-label glass-card">{room.icon} {t.rooms[room.key]}</span>
            </button>
          ))}

          {/* Luna on Map with Evolution Stage (T1173) */}
          {(() => {
            const evolution = getEvolutionStage(stats.level);
            return (
              <div className={`luna-map ${isDragging ? 'dragging' : ''} evolution-${evolution.stage}`}
                style={isDragging && mapContainerRef ? {
                  position: 'fixed', left: `${dragPosition.x}px`, top: `${dragPosition.y}px`,
                  transform: 'translate(-50%, -50%) scale(1.2)', zIndex: 100,
                } : {
                  left: `${roomData[currentRoom].lunaPos.x}%`, top: `${roomData[currentRoom].lunaPos.y}%`,
                  transform: `translate(-50%, -50%) translateY(${floatY}px) scale(${evolution.scale})`
                }}
                onMouseDown={handleDragStart} onTouchStart={handleDragStart}>
                <img 
                  src={`${BASE_URL}assets/character/luna-happy.jpg`} 
                  alt={petName || 'Pip'} 
                  className={`luna-map-img mood-${mood} ${furColor === 'rainbow' ? 'fur-rainbow' : ''}`}
                  style={furColor !== 'rainbow' ? { filter: FUR_COLORS.find(c => c.id === furColor)?.cssFilter || 'none' } : {}}
                />
                {/* Map view costumes (T1165) */}
                {costumeState.equipped.hat && (
                  <span className="luna-map-costume hat" style={{ top: '-15%' }}>
                    {COSTUMES.find(c => c.id === costumeState.equipped.hat)?.icon}
                  </span>
                )}
                {costumeState.equipped.accessory && (
                  <span className="luna-map-costume accessory">
                    {COSTUMES.find(c => c.id === costumeState.equipped.accessory)?.icon}
                  </span>
                )}
                {/* T1334: Collar on map */}
                {costumeState.equipped.collar && (
                  <span className="luna-map-costume collar" style={{ top: '25%' }}>
                    {COSTUMES.find(c => c.id === costumeState.equipped.collar)?.icon}
                  </span>
                )}
                {/* T1333: Eye color glow on map */}
                {(() => {
                  const eyeColorInfo = EYE_COLORS.find(e => e.id === costumeState.eyeColor) || EYE_COLORS[0];
                  return (
                    <div
                      className="luna-map-eye-glow"
                      style={{
                        position: 'absolute',
                        top: '38%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '20px',
                        height: '8px',
                        background: eyeColorInfo.color,
                        borderRadius: '50%',
                        boxShadow: `0 0 8px ${eyeColorInfo.glowColor}, 0 0 16px ${eyeColorInfo.glowColor}`,
                        zIndex: 5,
                        pointerEvents: 'none',
                      }}
                    />
                  );
                })()}
                {/* Evolution glow (T1173) */}
                <div className="luna-map-glow" style={{ boxShadow: `0 0 20px ${evolution.glowColor}` }} />
                {/* Evolution stage indicator (T1173) */}
                <span className="luna-evolution-badge">{evolution.emoji}</span>
                <span className="luna-mood-indicator">{getMoodEmoji(mood)}</span>
                {petName && <span className="luna-name-label">{petName} {getMoodEmoji(mood)}</span>}
              </div>
            );
          })()}

          {!isDragging && <div className="drag-hint">{lang === 'it' ? '👆 Trascina Moonlight!' : '👆 Drag Moonlight!'}</div>}
        </div>

        <div className="map-header">
          <div className="header glass-card">
            <h1 className="title">{t.title}</h1>
            {petName && (
              <button 
                className="pet-name-badge clickable" 
                onClick={() => { setShowRenameModal(true); playSound('ui-click'); haptic.light(); }}
                title={t.petRename.clickToRename}
              >
                🐱 {petName} {getMoodEmoji(mood)} ✏️
              </button>
            )}
            {/* Simplified header for kids (T1101) - only essential controls */}
            <div className="header-right simple">
              <span className="time-indicator">{t.timeOfDay[timeOfDay]}</span>
              <button className="wardrobe-btn" onClick={() => setShowWardrobe(true)} title={t.wardrobe.title}>
                👗
              </button>
              {/* T1332: Fur Color Button */}
              <button className="fur-color-btn" onClick={() => { setShowFurColorPicker(true); haptic.light(); }} title={t.furColor.title}>
                🎨
              </button>
              <button className="toybox-btn" onClick={() => { setShowToyBox(true); haptic.light(); }} title={t.toyBox.title}>
                🧸
              </button>
              {/* T1349: Treat Shop Button 🍪 */}
              <button 
                className="treatshop-btn" 
                onClick={() => { setShowTreatShop(true); playSound('ui-click'); haptic.light(); }} 
                title={t.treatShop.title}
                style={{
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.3), rgba(245,158,11,0.2))',
                  border: '2px solid #f59e0b',
                  borderRadius: '10px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                🍪
              </button>
              <button className="training-btn" onClick={() => { setShowPetTraining(true); playSound('ui-click'); haptic.medium(); }} title={t.petTraining.title}>
                🎓
              </button>
              <button className="quest-btn" onClick={() => { setShowQuestPanel(true); haptic.light(); }} title={t.dailyQuests.title}>
                📋
                {dailyQuestState.quests.some(q => q.completed && !q.claimed) && <span className="quest-notification">!</span>}
              </button>
              <button className="pet-album-btn" onClick={() => { setShowPetAlbum(true); playSound('ui-click'); haptic.light(); }} title={t.petAlbum.title}>
                🐾
              </button>
              <button className="friend-code-btn" onClick={() => { setShowFriendCode(true); playSound('ui-click'); haptic.light(); }} title={t.friendCode.title}>
                🤝
              </button>
              {/* T1330: Health Checkup Button (Map View) 🏥 */}
              <button 
                className="health-checkup-btn" 
                onClick={() => { setShowHealthCheckup(true); playSound('ui-click'); haptic.medium(); }}
                title={t.healthCheckup.title}
                style={{
                  background: stats.health < 40 || stats.hunger < 30 
                    ? 'linear-gradient(135deg, rgba(248,113,113,0.4), rgba(239,68,68,0.3))'
                    : 'linear-gradient(135deg, rgba(135,206,235,0.3), rgba(100,200,255,0.2))',
                  border: stats.health < 40 || stats.hunger < 30 
                    ? '2px solid #ef4444'
                    : '2px solid #87ceeb',
                  borderRadius: '10px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  animation: stats.health < 40 || stats.hunger < 30 ? 'pulse 1.5s infinite' : 'none',
                }}
              >
                🏥
              </button>
              {/* T1339: Activity Log Button 📓 */}
              <button 
                className="activity-log-btn" 
                onClick={() => { setShowActivityLog(true); playSound('ui-click'); haptic.medium(); }}
                title={t.activityLog.title}
                style={{
                  background: activityLogState.entries.length > 0 
                    ? 'linear-gradient(135deg, rgba(167,139,250,0.3), rgba(129,140,248,0.2))'
                    : 'linear-gradient(135deg, rgba(200,200,200,0.3), rgba(180,180,180,0.2))',
                  border: activityLogState.entries.length > 0 
                    ? '2px solid #a78bfa'
                    : '2px solid #ccc',
                  borderRadius: '10px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  position: 'relative',
                }}
              >
                📓
                {activityLogState.entries.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#a78bfa',
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                  }}>
                    {activityLogState.entries.length > 9 ? '9+' : activityLogState.entries.length}
                  </span>
                )}
              </button>
              {/* T1345: Favorite Room Button 🏠 */}
              <button 
                className="favorite-room-btn" 
                onClick={() => { setShowFavoriteRoom(true); playSound('ui-click'); haptic.medium(); }}
                title={t.favoriteRoom.title}
                style={{
                  background: favoriteRoomState.favoriteRoom 
                    ? 'linear-gradient(135deg, rgba(251,191,36,0.3), rgba(245,158,11,0.2))'
                    : 'linear-gradient(135deg, rgba(200,200,200,0.3), rgba(180,180,180,0.2))',
                  border: favoriteRoomState.favoriteRoom 
                    ? '2px solid #fbbf24'
                    : '2px solid #ccc',
                  borderRadius: '10px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  position: 'relative',
                }}
              >
                🏠
                {favoriteRoomState.favoriteRoom && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#fbbf24',
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                  }}>
                    ⭐
                  </span>
                )}
              </button>
              {/* T1353: Fortune Telling Button 🔮 */}
              <button 
                className="fortune-btn" 
                onClick={() => { setShowFortune(true); playSound('ui-click'); haptic.medium(); }}
                title={t.fortune.title}
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(126,34,206,0.3))',
                  border: '2px solid #a855f7',
                  borderRadius: '10px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  position: 'relative',
                  boxShadow: '0 0 10px rgba(168,85,247,0.3)',
                }}
              >
                🔮
                {(() => {
                  const today = new Date().toISOString().split('T')[0];
                  const fortunesLeft = fortuneState.lastFortuneDate === today ? 3 - fortuneState.fortunesToday : 3;
                  return fortunesLeft > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#a855f7',
                      color: 'white',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      fontSize: '0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                    }}>
                      {fortunesLeft}
                    </span>
                  );
                })()}
              </button>
              {/* T1450: Pet Fun Facts Button 🐱📚 */}
              <button 
                className="fun-facts-btn" 
                onClick={() => { setShowFunFacts(true); playSound('ui-click'); haptic.medium(); }}
                title={t.funFacts.title}
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.4), rgba(37,99,235,0.3))',
                  border: '2px solid #3b82f6',
                  borderRadius: '10px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  position: 'relative',
                  boxShadow: '0 0 10px rgba(59,130,246,0.3)',
                }}
              >
                📚
                {seenFactIndices.length < (t.funFacts.facts as Array<unknown>).length && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#3b82f6',
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                  }}>
                    !
                  </span>
                )}
              </button>
              <button 
                className={`night-vision-toggle ${nightVision ? 'active' : ''}`} 
                onClick={() => { setNightVision(!nightVision); playSound('ui-click'); haptic.medium(); }} 
                title={nightVision ? (lang === 'it' ? 'Visione notturna ON' : 'Night Vision ON') : (lang === 'it' ? 'Visione notturna OFF' : 'Night Vision OFF')}
              >
                {nightVision ? '🌙' : '👁️'}
              </button>
              <button className="sound-toggle" onClick={() => { toggleMute(); playSound('ui-click'); haptic.light(); }} title={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted ? '🔇' : '🔊'}
              </button>
              <button className="lang-toggle" onClick={toggleLanguage}>{lang === 'it' ? '🇮🇹' : '🇬🇧'}</button>
              <div className="coin-container"><span className="coin-icon">✨</span><span className="coin-text">{stats.coins}</span></div>
            </div>
          </div>

          {/* Simplified stats for kids (T1101) - just emoji + visual indicator */}
          <div className="mini-stats glass-card simple">
            <span className="mood-display big">{getMoodEmoji(mood)}</span>
            <span className={stats.hunger < 30 ? 'low pulse' : ''}>🍪</span>
            <span className={stats.happiness < 30 ? 'low pulse' : ''}>💖</span>
          </div>
          
          {/* T1329: Pet personality badge */}
          <div className="personality-badge glass-card simple" title={PERSONALITIES[petPersonality].description[lang]}>
            <span className="personality-emoji">{PERSONALITIES[petPersonality].emoji}</span>
            <span className="personality-label">{t.personality[petPersonality]}</span>
          </div>
          
          {/* T1352: Pet Mood Ring Indicator 💍 */}
          <MoodRingIndicator
            mood={mood}
            stats={stats}
            lang={lang}
            isExpanded={moodRingExpanded}
            onToggle={() => setMoodRingExpanded(!moodRingExpanded)}
            petName={petName || 'Luna'}
          />
          
          {/* T1203: Weather Widget for immersion */}
          <WeatherWidget
            weather={weather}
            isLoading={weatherLoading}
            lang={lang}
          />
          
          {/* T1180: Play History Calendar */}
          <PlayHistoryCalendar 
            lang={lang}
            playedDates={playHistory}
            petName={petName || 'Luna'}
            streak={gameState.streak}
          />
        </div>

        <div className="outside-bar glass-card">
          <span className="outside-label">🚶 {lang === 'it' ? 'Esci' : 'Go out'}:</span>
          {outsideRooms.map((room) => (
            <button key={room.key} className="outside-btn"
              onClick={() => navigateToRoom(roomData.findIndex(r => r.key === room.key))}>
              {room.icon} {t.rooms[room.key]}
            </button>
          ))}
          <button className="outside-btn games-btn" onClick={() => { setActiveGame('hub'); haptic.medium(); }}>
            🎮 {lang === 'it' ? 'Giochi' : 'Games'}
          </button>
        </div>

        <p className="footer map-footer">{t.footer}</p>
      </motion.div>
    );
  }

  // Room View
  return (
    <motion.div 
      key={`room-${currentRoom}`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`full-page-bg room-view ${timeClass} room-${currentRoomData.key} ${nightVision ? 'night-vision' : ''}`} 
      style={{ backgroundImage: `url(${currentRoomData.bg})` }}
      onClick={handleRoomClick}
      ref={roomContainerRef}
      tabIndex={0}>
      <div className="overlay" />
      
      {/* Enhanced Room Ambiance Effects */}
      <div className="room-vignette" />
      <div className="room-depth-shadow" />
      
      {/* Dust particles - visible in daylight */}
      <div className="dust-particles">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="dust-mote" />
        ))}
      </div>
      
      {/* Room-specific ambient effects */}
      {currentRoomData.key === 'bedroom' && <div className="room-ambient room-bedroom" />}
      {currentRoomData.key === 'kitchen' && (
        <>
          <div className="room-ambient room-kitchen" />
          <div className="steam-effect" />
          {/* T1181: Food Bowl Animation with eating particles */}
          <FoodBowlAnimation isEating={isActing} lang={lang} />
        </>
      )}
      {currentRoomData.key === 'garden' && (
        <div className="fireflies room-garden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="firefly" />
          ))}
        </div>
      )}
      {currentRoomData.key === 'bathroom' && <div className="steam-overlay room-bathroom" />}
      {currentRoomData.key === 'living' && <div className="tv-glow room-living" />}
      {currentRoomData.key === 'garage' && <div className="industrial-light room-garage" />}
      {currentRoomData.key === 'shop' && <div className="spotlights room-shop" />}
      {currentRoomData.key === 'supermarket' && <div className="fluorescent room-supermarket" />}
      {currentRoomData.key === 'attic' && (
        <>
          <div className="attic-ambiance room-attic" />
          <div className="cobweb-effect room-attic" />
        </>
      )}
      {currentRoomData.key === 'basement' && (
        <>
          <div className="basement-ambiance room-basement" />
          <div className="workshop-light room-basement" />
          <div className="pipes-ambiance room-basement" />
        </>
      )}
      
      {/* Window reflection for daytime */}
      <div className="window-reflection" />
      
      {/* T1209: Window View with day/night sky */}
      <WindowView timeOfDay={timeOfDay} room={currentRoomData.key} />
      
      {showAchievement && <AchievementPopup achievement={showAchievement} lang={lang} onClose={() => setShowAchievement(null)} />}
      {eventMessage && <div className="event-toast glass-card">{eventMessage}</div>}
      
      {/* Room Unlock Popup (T1168) */}
      <AnimatePresence>
        {roomUnlockPopup && (
          <RoomUnlockPopup 
            roomKey={roomUnlockPopup.roomKey} 
            roomIcon={roomUnlockPopup.roomIcon} 
            lang={lang} 
            onClose={() => setRoomUnlockPopup(null)} 
          />
        )}
      </AnimatePresence>
      
      {/* Interactive Objects */}
      <InteractiveObjects
        room={currentRoomData.key}
        lang={lang}
        stats={{ level: stats.level, coins: stats.coins }}
        onGameStart={handleObjectGameStart}
        onReward={handleObjectReward}
        onStory={handleObjectStory}
        playSound={playSound}
      />
      
      {/* Story Modal */}
      <AnimatePresence>
        {showStory && (
          <motion.div
            className="story-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStory(false)}
          >
            <motion.div
              className="story-modal"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="story-text">{storyText}</p>
              <button className="story-close-btn" onClick={() => setShowStory(false)}>
                {lang === 'it' ? 'Continua' : 'Continue'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Objects Hint */}
      {showObjectsHint && (
        <div className="objects-hint">
          <span className="objects-hint-icon">👆</span>
          {lang === 'it' ? 'Tocca gli oggetti!' : 'Tap the objects!'}
        </div>
      )}

      {/* Movement Hint */}
      {showMovementHint && !showMap && (
        <div className="movement-hint">
          {lang === 'it' ? (
            <>Muovi Luna: <kbd>WASD</kbd> o tocca!</>
          ) : (
            <>Move Luna: <kbd>WASD</kbd> or tap!</>
          )}
        </div>
      )}

      <div className="particles">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="particle" style={{ left: `${10 + (i * 12)}%`, animationDelay: `${i * 0.5}s`, animationDuration: `${3 + (i % 3)}s` }} />
        ))}
      </div>

      <div className="header glass-card">
        <button className="back-btn" onClick={() => { setShowMap(true); haptic.light(); }}>← 🏠</button>
        <h1 className="title room-title">{currentRoomData.icon} {t.rooms[currentRoomData.key]}</h1>
        <div className="header-right">
          {petName && (
            <button 
              className="pet-name-badge small clickable" 
              onClick={() => { setShowRenameModal(true); playSound('ui-click'); haptic.light(); }}
              title={t.petRename.clickToRename}
            >
              🐱 {petName} {getMoodEmoji(mood)} ✏️
            </button>
          )}
          {/* T1174: Photo Mode Button */}
          <button 
            className="photo-mode-btn" 
            onClick={() => { setShowPhotoMode(true); playSound('ui-click'); haptic.medium(); }}
            title={lang === 'it' ? 'Modalità Foto' : 'Photo Mode'}
          >
            📸
          </button>
          {/* T1179: Mood Journal Button */}
          <button 
            className="mood-journal-btn" 
            onClick={() => { setShowMoodJournal(true); playSound('ui-click'); haptic.medium(); }}
            title={lang === 'it' ? 'Diario dell\'Umore' : 'Mood Journal'}
          >
            📔
          </button>
          {/* T1197: Pet Album Button */}
          <button 
            className="pet-album-btn" 
            onClick={() => { setShowPetAlbum(true); playSound('ui-click'); haptic.medium(); }}
            title={t.petAlbum.title}
          >
            🐾
          </button>
          {/* T1191: Friend Code Button */}
          <button 
            className="friend-code-btn" 
            onClick={() => { setShowFriendCode(true); playSound('ui-click'); haptic.medium(); }}
            title={t.friendCode.title}
          >
            🤝
          </button>
          {/* T1192: Gift Sending Button */}
          <button 
            className="gift-btn" 
            onClick={() => { setShowGiftSending(true); playSound('ui-click'); haptic.medium(); }}
            title={t.giftSending.title}
          >
            🎁
          </button>
          {/* T1330: Health Checkup Button 🏥 */}
          <button 
            className="health-checkup-btn" 
            onClick={() => { setShowHealthCheckup(true); playSound('ui-click'); haptic.medium(); }}
            title={t.healthCheckup.title}
            style={{
              background: 'linear-gradient(135deg, rgba(135,206,235,0.3), rgba(100,200,255,0.2))',
              border: '2px solid #87ceeb',
              borderRadius: '12px',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              transition: 'all 0.2s ease',
            }}
          >
            🏥
          </button>
          {/* T1339: Activity Log Button 📓 */}
          <button 
            className="activity-log-btn" 
            onClick={() => { setShowActivityLog(true); playSound('ui-click'); haptic.medium(); }}
            title={t.activityLog.title}
            style={{
              background: activityLogState.entries.length > 0 
                ? 'linear-gradient(135deg, rgba(167,139,250,0.3), rgba(129,140,248,0.2))'
                : 'linear-gradient(135deg, rgba(200,200,200,0.3), rgba(180,180,180,0.2))',
              border: activityLogState.entries.length > 0 
                ? '2px solid #a78bfa'
                : '2px solid #ccc',
              borderRadius: '12px',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
          >
            📓
            {activityLogState.entries.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#a78bfa',
                color: 'white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}>
                {activityLogState.entries.length > 9 ? '9+' : activityLogState.entries.length}
              </span>
            )}
          </button>
          {/* T1345: Favorite Room Button 🏠 */}
          <button 
            className="favorite-room-btn" 
            onClick={() => { setShowFavoriteRoom(true); playSound('ui-click'); haptic.medium(); }}
            title={t.favoriteRoom.title}
            style={{
              background: favoriteRoomState.favoriteRoom 
                ? 'linear-gradient(135deg, rgba(251,191,36,0.3), rgba(245,158,11,0.2))'
                : 'linear-gradient(135deg, rgba(200,200,200,0.3), rgba(180,180,180,0.2))',
              border: favoriteRoomState.favoriteRoom 
                ? '2px solid #fbbf24'
                : '2px solid #ccc',
              borderRadius: '12px',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
          >
            🏠
            {favoriteRoomState.favoriteRoom && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#fbbf24',
                color: 'white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}>
                ⭐
              </span>
            )}
          </button>
          {/* T1450: Pet Fun Facts Button (Room View) 🐱📚 */}
          <button 
            className="fun-facts-btn" 
            onClick={() => { setShowFunFacts(true); playSound('ui-click'); haptic.medium(); }}
            title={t.funFacts.title}
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(37,99,235,0.2))',
              border: '2px solid #3b82f6',
              borderRadius: '12px',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
          >
            📚
            {seenFactIndices.length < (t.funFacts.facts as Array<unknown>).length && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}>
                !
              </span>
            )}
          </button>
          <div className="level-badge glass-card">Lv.{stats.level}</div>
          <div className="coin-container"><span className="coin-icon">✨</span><span className="coin-text">{stats.coins}</span></div>
        </div>
      </div>

      {/* Simplified Stat Bars for Kids (T1101) - Only 2 main stats, no numbers */}
      <div className="stat-bars glass-card simple">
        <div className="stat-bar-item">
          <span className="stat-bar-icon" title={t.stats.hunger}>🍪</span>
          <div className="stat-bar-track">
            <div 
              className={`stat-bar-fill hunger ${stats.hunger < 30 ? 'low pulse' : ''}`}
              style={{ width: `${stats.hunger}%` }}
            />
          </div>
        </div>
        <div className="stat-bar-item">
          <span className="stat-bar-icon" title={t.stats.happiness}>💖</span>
          <div className="stat-bar-track">
            <div 
              className={`stat-bar-fill happiness ${stats.happiness < 30 ? 'low pulse' : ''}`}
              style={{ width: `${stats.happiness}%` }}
            />
          </div>
        </div>
        {/* T1338: Weight Indicator - shows if pet is overfed */}
        <div className="stat-bar-item" title={t.stats.weight + ': ' + ((stats.weight ?? 50) > 80 ? t.weight.overfed : (stats.weight ?? 50) > 60 ? t.weight.gaining : t.weight.healthy)}>
          <span className="stat-bar-icon" style={{ filter: (stats.weight ?? 50) > 80 ? 'none' : 'grayscale(0.3)' }}>
            {(stats.weight ?? 50) > 80 ? '🐷' : (stats.weight ?? 50) > 60 ? '🍪' : '🎯'}
          </span>
          <div className="stat-bar-track">
            <div 
              className={`stat-bar-fill weight ${(stats.weight ?? 50) > 80 ? 'high pulse' : ''}`}
              style={{ 
                width: `${stats.weight ?? 50}%`,
                background: (stats.weight ?? 50) > 80 
                  ? 'linear-gradient(90deg, #f59e0b, #ef4444)' 
                  : (stats.weight ?? 50) > 60 
                    ? 'linear-gradient(90deg, #84cc16, #f59e0b)' 
                    : 'linear-gradient(90deg, #22c55e, #84cc16)',
              }}
            />
          </div>
        </div>
        {/* T1203: Compact Weather Widget in Room View */}
        <WeatherWidget
          weather={weather}
          isLoading={weatherLoading}
          lang={lang}
          compact={true}
        />
        <div className="mood-display">
          {getMoodEmoji(mood)}
        </div>
        {/* T1352: Pet Mood Ring Indicator (Room View) 💍 */}
        <MoodRingIndicator
          mood={mood}
          stats={stats}
          lang={lang}
          isExpanded={moodRingExpanded}
          onToggle={() => setMoodRingExpanded(!moodRingExpanded)}
          petName={petName || 'Luna'}
        />
        {/* T1325: Pet Comfort Level Indicator */}
        {(() => {
          const comfort = calculateComfortLevel(stats);
          return (
            <motion.div 
              className={`comfort-indicator comfort-${comfort.level}`}
              title={`${t.stats.comfort}: ${comfort.label[lang]} (${comfort.score}%)`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <motion.span 
                className="comfort-emoji"
                animate={comfort.level === 'blissful' ? { 
                  scale: [1, 1.15, 1],
                  rotate: [0, -5, 5, 0],
                } : comfort.level === 'distressed' ? {
                  y: [0, -2, 0],
                  opacity: [1, 0.7, 1],
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                {comfort.emoji}
              </motion.span>
              <div className="comfort-bar-track">
                <motion.div 
                  className="comfort-bar-fill"
                  style={{ backgroundColor: comfort.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${comfort.score}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          );
        })()}
      </div>

      {/* Movement Particles - magical sparkles when Luna walks */}
      <MovementParticles 
        isMoving={isWalking} 
        x={lunaPosition.x} 
        y={lunaPosition.y} 
        facingDirection={facingDirection} 
      />
      
      {/* Paw print trail when Luna walks (T1196) 🐾 */}
      {/* Footstep dust puffs - different effects per surface (T877) */}
      <FootstepDustPuffs
        isMoving={isWalking}
        x={lunaPosition.x}
        y={lunaPosition.y}
        facingDirection={facingDirection}
        surfaceType={currentRoomKey === 'garden' ? 'grass' : currentRoomKey === 'bathroom' ? 'water' : (currentRoomKey === 'basement' || currentRoomKey === 'garage') ? 'stone' : 'floor'}
      />
      
      {/* Luna in Room with Evolution Stage (T1173) */}
      {(() => {
        const evolution = getEvolutionStage(stats.level);
        return (
      <motion.div 
        className={`luna-container ${isWalking ? 'walking' : ''} ${facingDirection === 'left' ? 'facing-left' : ''} ${isSleeping ? 'sleeping' : ''} ${isCatnipMode ? 'catnip-crazy' : ''} ${isBathing ? 'bathing' : ''} ${isCuddling ? 'cuddling' : ''} evolution-${evolution.stage}`}
        style={{ 
          left: `${lunaPosition.x}%`, 
          top: `${lunaPosition.y}%`, 
          transform: `translate(-50%, -50%) translateY(${isWalking ? 0 : floatY}px) scale(${evolution.scale})`,
          transition: isCatnipMode ? 'left 0.2s ease-out, top 0.2s ease-out' : isWalking ? 'none' : 'transform 0.3s ease-out',
          cursor: 'pointer'
        }}
        onClick={handlePetLuna}
        // T1348: Long press for cuddle mode 🤗💕
        onMouseDown={handleCuddleStart}
        onMouseUp={handleCuddleEnd}
        onMouseLeave={handleCuddleEnd}
        onTouchStart={handleCuddleStart}
        onTouchEnd={handleCuddleEnd}
        title={lang === 'it' ? 'Accarezza Luna! (Tieni premuto per abbracciarla)' : 'Pet Luna! (Hold to cuddle her)'}
        // Purr animation (T878), Brush animation (T1186), Catnip Crazy Mode (T1324) 🐱🪮🌿
        animate={isCatnipMode ? {
          // T1324: CRAZY MODE animation! 😸🌀
          scale: [evolution.scale, evolution.scale * 1.3, evolution.scale * 0.9, evolution.scale * 1.2, evolution.scale],
          rotate: [-15, 15, -20, 20, -10, 10, 0],
          y: [0, -20, 5, -15, 0],
          transition: {
            duration: 0.4,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'mirror',
          },
        } : isPurring ? {
          scale: [evolution.scale, evolution.scale * 1.03, evolution.scale, evolution.scale * 1.03, evolution.scale],
          rotate: [0, -1.5, 0, 1.5, 0],
          transition: {
            duration: 0.4,
            ease: 'easeInOut',
            times: [0, 0.25, 0.5, 0.75, 1],
          },
        } : isBrushing ? {
          // Brushing animation - happy wiggle
          scale: [evolution.scale, evolution.scale * 1.05, evolution.scale, evolution.scale * 1.05, evolution.scale],
          rotate: [0, -3, 0, 3, 0, -2, 0, 2, 0],
          y: [0, -5, 0, -3, 0],
          transition: {
            duration: 1.0,
            ease: 'easeInOut',
          },
        } : isBathing ? {
          // T1342: Bathing animation - splashy happy bounce! 🛁✨
          scale: [evolution.scale, evolution.scale * 0.92, evolution.scale * 1.08, evolution.scale * 0.95, evolution.scale * 1.05, evolution.scale],
          rotate: [0, -5, 5, -4, 4, 0],
          y: [0, 8, -12, 5, -8, 0],
          transition: {
            duration: 0.6,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'mirror' as const,
          },
        } : isCuddling ? {
          // T1348: Cuddling animation - held close, gentle sway 🤗💕
          scale: [evolution.scale * 1.15, evolution.scale * 1.18, evolution.scale * 1.15],
          rotate: [-3, 3, -3],
          y: [-20, -25, -20],
          transition: {
            duration: 1.2,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'mirror' as const,
          },
        } : { scale: evolution.scale, rotate: 0 }}
      >
        {actionBubble && <div className="bubble glass-card"><span className="bubble-text">{actionBubble}</span></div>}
        <img 
          src={`${BASE_URL}assets/character/luna-happy.jpg`} 
          alt="Moonlight" 
          className={`luna-img mood-${mood} ${isActing ? 'acting' : ''} ${isWalking ? 'walking' : ''} ${furColor === 'rainbow' ? 'fur-rainbow' : ''}`}
          style={furColor !== 'rainbow' ? { filter: FUR_COLORS.find(c => c.id === furColor)?.cssFilter || 'none' } : {}}
        />
        
        {/* T1333: Eye color glow overlay */}
        {(() => {
          const eyeColorInfo = EYE_COLORS.find(e => e.id === costumeState.eyeColor) || EYE_COLORS[0];
          return (
            <motion.div
              className="luna-eye-glow"
              animate={{
                opacity: [0.7, 1, 0.7],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                top: '35%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '30px',
                height: '12px',
                background: eyeColorInfo.id === 'rainbow' ? eyeColorInfo.color : eyeColorInfo.color,
                borderRadius: '50%',
                boxShadow: `0 0 10px ${eyeColorInfo.glowColor}, 0 0 20px ${eyeColorInfo.glowColor}, 0 0 30px ${eyeColorInfo.glowColor}`,
                zIndex: 5,
                pointerEvents: 'none',
              }}
            />
          );
        })()}
        
        {/* Equipped Costumes (T1165) */}
        {costumeState.equipped.outfit && (
          <span 
            className="costume-overlay costume-outfit"
            style={{
              position: 'absolute',
              left: '50%',
              top: `${50 + (COSTUMES.find(c => c.id === costumeState.equipped.outfit)?.offset?.y ?? 20)}%`,
              transform: 'translateX(-50%)',
              fontSize: '1.8rem',
              zIndex: 2,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              pointerEvents: 'none',
            }}
          >
            {COSTUMES.find(c => c.id === costumeState.equipped.outfit)?.icon}
          </span>
        )}
        {costumeState.equipped.hat && (
          <span 
            className="costume-overlay costume-hat"
            style={{
              position: 'absolute',
              left: `${50 + (COSTUMES.find(c => c.id === costumeState.equipped.hat)?.offset?.x ?? 0)}%`,
              top: `${(COSTUMES.find(c => c.id === costumeState.equipped.hat)?.offset?.y ?? -25)}%`,
              transform: 'translateX(-50%)',
              fontSize: '2rem',
              zIndex: 10,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              pointerEvents: 'none',
            }}
          >
            {COSTUMES.find(c => c.id === costumeState.equipped.hat)?.icon}
          </span>
        )}
        {costumeState.equipped.accessory && (
          <span 
            className="costume-overlay costume-accessory"
            style={{
              position: 'absolute',
              left: `${50 + (COSTUMES.find(c => c.id === costumeState.equipped.accessory)?.offset?.x ?? 0)}%`,
              top: `${50 + (COSTUMES.find(c => c.id === costumeState.equipped.accessory)?.offset?.y ?? 0)}%`,
              transform: 'translateX(-50%)',
              fontSize: '1.5rem',
              zIndex: 9,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              pointerEvents: 'none',
            }}
          >
            {COSTUMES.find(c => c.id === costumeState.equipped.accessory)?.icon}
          </span>
        )}
        {/* T1334: Pet collar accessory */}
        {costumeState.equipped.collar && (
          <span 
            className="costume-overlay costume-collar"
            style={{
              position: 'absolute',
              left: `${50 + (COSTUMES.find(c => c.id === costumeState.equipped.collar)?.offset?.x ?? 0)}%`,
              top: `${50 + (COSTUMES.find(c => c.id === costumeState.equipped.collar)?.offset?.y ?? 12)}%`,
              transform: 'translateX(-50%)',
              fontSize: '1.3rem',
              zIndex: 8,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              pointerEvents: 'none',
            }}
          >
            {COSTUMES.find(c => c.id === costumeState.equipped.collar)?.icon}
          </span>
        )}
        
        {/* Evolution glow (T1173) */}
        <div className="luna-glow" style={{ boxShadow: `0 0 30px ${evolution.glowColor}` }} />
        {/* Evolution stage badge (T1173) */}
        <span className="luna-evolution-badge room-badge">{evolution.emoji}</span>
        <span className="luna-mood-badge">{getMoodEmoji(mood)}</span>
        
        {/* Purr reaction indicator (T878) 😻 */}
        <AnimatePresence>
          {isPurring && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: -25 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: '-5%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '1.5rem',
                zIndex: 101,
                pointerEvents: 'none',
              }}
            >
              😻
            </motion.span>
          )}
        </AnimatePresence>
        
        {/* Brushing reaction indicator (T1186) 🪮 */}
        <AnimatePresence>
          {isBrushing && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5, y: -10 }}
              animate={{ opacity: 1, scale: 1.2, y: -30 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                top: '-10%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '1.8rem',
                zIndex: 101,
                pointerEvents: 'none',
              }}
            >
              🪮✨
            </motion.span>
          )}
        </AnimatePresence>
        
        {/* T1348: Cuddling reaction indicator 🤗💕 */}
        <AnimatePresence>
          {isCuddling && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: 1, 
                scale: [1, 1.1, 1],
                y: [-35, -40, -35],
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                top: '-15%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '2rem',
                zIndex: 101,
                pointerEvents: 'none',
                display: 'flex',
                gap: '2px',
              }}
            >
              🤗💕
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Tail wagging animation (T876) */}
        <TailWagging 
          isHappy={mood === 'happy' || mood === 'playful'} 
          isIdle={isIdle}
          onWagComplete={() => setLastActionTime(Date.now())}
        />
        {isWalking && <div className="walk-dust" />}
      </motion.div>
        );
      })()}

      {/* Sleep Dreams Visualization (T1190) 💤 */}
      <AnimatePresence>
        {isSleeping && currentRoomData.key === 'bedroom' && (
          <SleepDreams 
            isSleeping={isSleeping} 
            lunaX={lunaPosition.x} 
            lunaY={lunaPosition.y} 
            lang={lang}
            napStartTime={napStartTime}
          />
        )}
      </AnimatePresence>

      {/* T1197: Pet Discovery Popup */}
      <AnimatePresence>
        {newlyDiscoveredPet && (
          <PetDiscoveryPopup
            pet={newlyDiscoveredPet}
            lang={lang}
            onClose={() => setNewlyDiscoveredPet(null)}
          />
        )}
      </AnimatePresence>

      {/* Floating hearts when petting Luna (MM-002) 💕 */}
      <AnimatePresence>
        {petHearts.map(heart => (
          <motion.div
            key={heart.id}
            className="pet-heart"
            initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
            animate={{ 
              opacity: 0, 
              scale: 1.5, 
              y: -60,
              x: (Math.random() - 0.5) * 40 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: `${heart.x}%`,
              top: `${heart.y}%`,
              fontSize: '2rem',
              pointerEvents: 'none',
              zIndex: 100,
            }}
          >
            {['❤️', '💕', '💖', '💗', '✨'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* T1348: Floating cuddle hearts when holding Luna 🤗💕 */}
      <AnimatePresence>
        {cuddleHearts.map(heart => (
          <motion.div
            key={heart.id}
            className="cuddle-heart"
            initial={{ opacity: 1, scale: 0.3, y: 0 }}
            animate={{ 
              opacity: 0, 
              scale: 1.8, 
              y: -80,
              x: (Math.random() - 0.5) * 60,
              rotate: (Math.random() - 0.5) * 30,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: `${heart.x}%`,
              top: `${heart.y}%`,
              fontSize: '2.2rem',
              pointerEvents: 'none',
              zIndex: 100,
            }}
          >
            {heart.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Brushing sparkles animation (T1186) 🪮✨ */}
      <AnimatePresence>
        {brushSparkles.map(sparkle => (
          <motion.div
            key={sparkle.id}
            className="brush-sparkle"
            initial={{ opacity: 1, scale: 0.3 }}
            animate={{ 
              opacity: 0, 
              scale: 1.2,
              x: Math.cos(sparkle.angle * Math.PI / 180) * 60,
              y: Math.sin(sparkle.angle * Math.PI / 180) * 40 - 30,
              rotate: sparkle.angle,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              fontSize: '1.5rem',
              pointerEvents: 'none',
              zIndex: 100,
            }}
          >
            {['✨', '⭐', '💫', '🌟', '✦'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* T1324: Catnip Crazy Mode sparkles 🌿😸🌀 */}
      <AnimatePresence>
        {catnipSparkles.map(sparkle => (
          <motion.div
            key={sparkle.id}
            className="catnip-sparkle"
            initial={{ opacity: 1, scale: 0.5, rotate: 0 }}
            animate={{ 
              opacity: 0, 
              scale: [0.5, 2, 1.5],
              x: (Math.random() - 0.5) * 100,
              y: (Math.random() - 0.5) * 80 - 20,
              rotate: Math.random() * 720 - 360,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              fontSize: '2rem',
              pointerEvents: 'none',
              zIndex: 100,
              filter: 'drop-shadow(0 0 8px rgba(147, 255, 147, 0.8))',
            }}
          >
            {sparkle.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* T1324: Catnip Crazy Mode indicator overlay 🌿 */}
      <AnimatePresence>
        {isCatnipMode && (
          <motion.div
            className="catnip-mode-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <motion.div
              className="catnip-banner glass-card"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [-2, 2, -2],
              }}
              transition={{ duration: 0.3, repeat: Infinity }}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #90EE90, #32CD32)',
                color: '#1a5c1a',
                fontWeight: 'bold',
                fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(50, 205, 50, 0.5)',
                border: '2px solid #228B22',
              }}
            >
              {t.toyBox.catnipActive}
            </motion.div>
            <motion.div
              className="catnip-timer"
              style={{
                width: '120px',
                height: '6px',
                borderRadius: '3px',
                background: 'rgba(255,255,255,0.3)',
                overflow: 'hidden',
              }}
            >
              <motion.div
                style={{
                  width: `${(catnipTimeLeft / 8000) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #90EE90, #32CD32)',
                  borderRadius: '3px',
                }}
                transition={{ duration: 0.1 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* T1342: Bath Bubbles Animation 🛁✨ */}
      <AnimatePresence>
        {bathBubbles.map(bubble => (
          <motion.div
            key={bubble.id}
            className="bath-bubble"
            initial={{ opacity: 0, scale: 0.3, y: 0 }}
            animate={{ 
              opacity: [0, 0.9, 0.9, 0], 
              scale: [0.3, 1, 1.1, 0.8],
              y: [-10, -40, -70, -100],
              x: (Math.random() - 0.5) * 30,
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 2.5, 
              ease: 'easeOut',
              delay: bubble.delay,
            }}
            style={{
              position: 'absolute',
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(135,206,250,0.6), rgba(100,149,237,0.3))',
              border: '1px solid rgba(255,255,255,0.5)',
              boxShadow: '0 0 8px rgba(135,206,250,0.6), inset 0 0 10px rgba(255,255,255,0.3)',
              pointerEvents: 'none',
              zIndex: 150,
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* T1342: Water splash drops during bathing 💧 */}
      <AnimatePresence>
        {isBathing && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`splash-${i}`}
                className="bath-splash"
                initial={{ opacity: 0, scale: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0.2, 0.8, 0.6, 0.3],
                  y: [0, -20 - Math.random() * 30, -10, 20],
                  x: (Math.random() - 0.5) * 60,
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.15,
                  repeat: Infinity,
                  repeatDelay: 0.3,
                }}
                style={{
                  position: 'absolute',
                  left: `${lunaPosition.x + (Math.random() - 0.5) * 20}%`,
                  top: `${lunaPosition.y + 5}%`,
                  fontSize: '1rem',
                  pointerEvents: 'none',
                  zIndex: 145,
                  filter: 'drop-shadow(0 0 4px rgba(135,206,250,0.8))',
                }}
              >
                💧
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
      
      {/* T1342: Bathing mode soap suds indicator 🧼 */}
      <AnimatePresence>
        {isBathing && (
          <motion.div
            className="bathing-indicator"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute',
              top: '15%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '25px',
              background: 'linear-gradient(135deg, rgba(135,206,250,0.9), rgba(100,149,237,0.8))',
              boxShadow: '0 4px 20px rgba(100,149,237,0.5)',
              border: '2px solid rgba(255,255,255,0.5)',
            }}
          >
            <motion.span
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{ fontSize: '1.5rem' }}
            >
              🛁
            </motion.span>
            <span style={{ 
              fontWeight: 'bold', 
              color: '#1e3a5f',
              fontSize: '1rem',
            }}>
              {lang === 'it' ? 'Bagnetto! ✨' : 'Bath time! ✨'}
            </span>
            <motion.span
              animate={{ rotate: [0, 15, -15, 0], y: [0, -3, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
              style={{ fontSize: '1.3rem' }}
            >
              🧼
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toy Play Animation (T1175) 🧸 */}
      <AnimatePresence>
        {toyPlayAnimation && (
          <motion.div
            className="toy-play-animation"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.5, 1.5, 0.5],
              y: [0, -40, -60, -80],
              rotate: toyPlayAnimation.toy.animation === 'spin' ? [0, 360, 720, 1080] :
                      toyPlayAnimation.toy.animation === 'wiggle' ? [0, -15, 15, -15, 15, 0] :
                      toyPlayAnimation.toy.animation === 'bounce' ? [0, -30, 0, -20, 0] : 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: `${toyPlayAnimation.x}%`,
              top: `${toyPlayAnimation.y - 15}%`,
              fontSize: '3rem',
              pointerEvents: 'none',
              zIndex: 150,
              textShadow: toyPlayAnimation.toy.rarity === 'legendary' 
                ? '0 0 20px gold, 0 0 40px orange' 
                : toyPlayAnimation.toy.rarity === 'rare'
                ? '0 0 15px #2196f3'
                : 'none',
            }}
          >
            {toyPlayAnimation.toy.icon}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkles for legendary toy play */}
      <AnimatePresence>
        {toyPlayAnimation?.toy.animation === 'sparkle' && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: Math.cos(i * Math.PI / 4) * 50,
                  y: Math.sin(i * Math.PI / 4) * 50 - 30,
                }}
                transition={{ duration: 1.5, delay: i * 0.1 }}
                style={{
                  position: 'absolute',
                  left: `${toyPlayAnimation.x}%`,
                  top: `${toyPlayAnimation.y - 10}%`,
                  fontSize: '1.5rem',
                  pointerEvents: 'none',
                  zIndex: 149,
                }}
              >
                ✨
              </motion.span>
            ))}
          </>
        )}
      </AnimatePresence>

      <div className="room-actions">
        <button className={`action-btn glass-card ${isActing ? 'disabled' : ''}`} onClick={() => handleRoomAction('primary')} disabled={isActing}>
          <span className="action-label">{roomActions.primary}</span>
          {(currentRoomData.key === 'shop' || currentRoomData.key === 'supermarket') && <span className="action-cost">-5 ✨</span>}
          {currentRoomData.key === 'garden' && <span className="action-bonus">🎮?</span>}
        </button>
        <button className={`action-btn secondary glass-card ${isActing ? 'disabled' : ''}`} onClick={() => handleRoomAction('secondary')} disabled={isActing}>
          <span className="action-label">{roomActions.secondary}</span>
        </button>
        {/* Pet Grooming Button (T1186) 🪮 */}
        <button 
          className={`action-btn brush-btn glass-card ${isBrushing ? 'brushing' : ''}`}
          onClick={handleBrushLuna}
          title={t.grooming.brush}
        >
          <span className="action-label">🪮 {t.grooming.brush}</span>
        </button>
        {/* Favorite toy quick-play button (T1175) */}
        {toyBoxState.favoriteToy && (
          <button 
            className={`action-btn toy-btn glass-card ${stats.energy < (TOYS.find(t => t.id === toyBoxState.favoriteToy)?.energyCost || 0) ? 'disabled' : ''}`}
            onClick={() => {
              const favToy = TOYS.find(t => t.id === toyBoxState.favoriteToy);
              if (favToy) handlePlayWithToy(favToy);
            }}
            disabled={stats.energy < (TOYS.find(t => t.id === toyBoxState.favoriteToy)?.energyCost || 0)}
            title={t.toyBox.play}
          >
            <span className="action-label">{TOYS.find(t => t.id === toyBoxState.favoriteToy)?.icon}</span>
          </button>
        )}
        {/* T1202: Pet Training button - teach Luna tricks! */}
        <button 
          className="action-btn training-btn glass-card"
          onClick={() => { setShowPetTraining(true); playSound('ui-click'); haptic.medium(); }}
          title={t.petTraining.title}
        >
          <span className="action-label">🎓</span>
        </button>
        {/* Open toy box button */}
        <button 
          className="action-btn toybox-open glass-card"
          onClick={() => { setShowToyBox(true); haptic.light(); }}
          title={t.toyBox.title}
        >
          <span className="action-label">🧸</span>
        </button>
        {/* T1208: Fish Tank button - only in living room */}
        {currentRoomData.key === 'living' && (
          <button 
            className="action-btn fish-tank-btn glass-card"
            onClick={() => { setShowFishTank(true); playSound('ui-click'); haptic.medium(); }}
            title={lang === 'it' ? 'Acquario' : 'Fish Tank'}
          >
            <span className="action-label">🐠</span>
          </button>
        )}
      </div>

      <p className="footer">{t.footer}</p>
    </motion.div>
  );
}

export default App;

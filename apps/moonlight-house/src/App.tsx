import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import useSoundManager from './useSoundManager';
import useAmbientSoundscapes from './components/AmbientSoundscapes';
import useWeather from './hooks/useWeather';
import GameHub from './games/GameHub';
import { PuzzleGame, DrawingPad, MemoryGame } from './games';
import InteractiveObjects from './components/InteractiveObjects';
import MovementParticles from './components/MovementParticles';

// Animation variants for room transitions
const pageTransition = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.05 },
  transition: { duration: 0.3, ease: "easeInOut" }
};

// Base path for assets
const BASE_URL = import.meta.env.BASE_URL || '/';

// ==================== TYPES ====================
type Language = 'it' | 'en';
type RoomKey = 'bedroom' | 'kitchen' | 'garden' | 'living' | 'bathroom' | 'garage' | 'shop' | 'supermarket' | 'attic' | 'basement' | 'library';
type MoodType = 'happy' | 'neutral' | 'sad' | 'sleepy' | 'hungry' | 'excited';
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface PetStats {
  health: number;
  hunger: number;
  energy: number;
  happiness: number;
  coins: number;
  level: number;
  xp: number;
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
}

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
    stats: { health: 'Salute', hunger: 'Fame', energy: 'Energia', happiness: 'Felicità' },
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
    moods: { happy: 'Felice!', neutral: 'Tranquillo', sad: 'Triste...', sleepy: 'Assonnato', hungry: 'Affamato', excited: 'Eccitato!' },
    timeOfDay: { morning: '🌅 Mattina', afternoon: '☀️ Pomeriggio', evening: '🌆 Sera', night: '🌙 Notte' },
    achievements: {
      explorer: 'Esploratore', firstMeal: 'Primo pasto', sleepyHead: 'Dormiglione',
      socialite: 'Socievole', shopper: 'Shopaholic', wealthy: 'Ricco', healthy: 'In salute',
    },
    explore: 'Esplora la casa!',
    footer: 'Onde Kids ✨',
    miniGame: 'Mini-gioco!',
    tapToPlay: 'Tocca le stelle!',
    score: 'Punti',
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
    stats: { health: 'Health', hunger: 'Hunger', energy: 'Energy', happiness: 'Happiness' },
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
    moods: { happy: 'Happy!', neutral: 'Calm', sad: 'Sad...', sleepy: 'Sleepy', hungry: 'Hungry', excited: 'Excited!' },
    timeOfDay: { morning: '🌅 Morning', afternoon: '☀️ Afternoon', evening: '🌆 Evening', night: '🌙 Night' },
    achievements: {
      explorer: 'Explorer', firstMeal: 'First meal', sleepyHead: 'Sleepy head',
      socialite: 'Socialite', shopper: 'Shopaholic', wealthy: 'Wealthy', healthy: 'Healthy',
    },
    explore: 'Explore the house!',
    footer: 'Onde Kids ✨',
    miniGame: 'Mini-game!',
    tapToPlay: 'Tap the stars!',
    score: 'Score',
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
  if (stats.happiness > 80 && stats.energy > 60) return 'excited';
  if (stats.happiness > 60) return 'happy';
  if (stats.energy < 30) return 'sleepy';
  if (stats.hunger < 30) return 'hungry';
  if (stats.happiness < 30) return 'sad';
  return 'neutral';
};

const getMoodEmoji = (mood: MoodType): string => {
  const emojis: Record<MoodType, string> = {
    happy: '😊', neutral: '😐', sad: '😢', sleepy: '😴', hungry: '🤤', excited: '🤩'
  };
  return emojis[mood];
};

const getXpForLevel = (level: number): number => level * 100;

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
  };
  savedAt: string;
}

const loadSaveData = (): SaveData | null => {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return null;
    const data = JSON.parse(saved) as SaveData;
    return data;
  } catch {
    return null;
  }
};

const saveSaveData = (stats: PetStats, achievements: Achievement[], gameState: GameState): void => {
  try {
    const data: SaveData = {
      stats,
      achievements,
      gameState: {
        ...gameState,
        roomsVisited: Array.from(gameState.roomsVisited),
      },
      savedAt: new Date().toISOString(),
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

// ==================== MAIN APP ====================
function App() {
  const [lang, setLang] = useState<Language>('it');
  const t = translations[lang];
  
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

  // Core state (restored from save or defaults)
  const [stats, setStats] = useState<PetStats>(() => {
    const saved = loadSaveData();
    return saved?.stats ?? { health: 80, hunger: 60, energy: 90, happiness: 75, coins: 100, level: 1, xp: 0 };
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
    } : {
      dayCount: 1, totalActions: 0, roomsVisited: new Set(), lastDailyReward: null, streak: 0,
    };
  });
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [dailyRewardAmount, setDailyRewardAmount] = useState(0);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [activeGame, setActiveGame] = useState<string | null>(null); // 'hub' | 'puzzle' | 'drawing' | 'memory' | 'stars' | null
  const [eventMessage, setEventMessage] = useState('');
  const [showStory, setShowStory] = useState(false);
  const [storyText, setStoryText] = useState('');
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

  // Auto-save game state
  useEffect(() => {
    saveSaveData(stats, achievements, gameState);
  }, [stats, achievements, gameState]);

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
      }
      
      return { ...ach, progress, unlocked };
    }));
  }, [gameState.roomsVisited, stats.coins, stats.health]);

  useEffect(() => { checkAchievements(); }, [checkAchievements]);

  // Level up check
  useEffect(() => {
    const xpNeeded = getXpForLevel(stats.level);
    if (stats.xp >= xpNeeded) {
      setStats(s => ({
        ...s,
        level: s.level + 1,
        xp: s.xp - xpNeeded,
        coins: s.coins + 50,
      }));
      showBubble(t.messages.levelUp.replace('{level}', String(stats.level + 1)));
      playSound('level-up');
      playSound('coin-collect');
    }
  }, [stats.xp, stats.level, t.messages.levelUp, playSound]);

  const showBubble = (text: string) => {
    setActionBubble(text);
    setTimeout(() => setActionBubble(''), 2000);
  };

  const claimDailyReward = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = gameState.lastDailyReward === yesterday ? gameState.streak + 1 : 1;
    
    setStats(s => ({ ...s, coins: s.coins + dailyRewardAmount }));
    setGameState(g => ({ ...g, lastDailyReward: today, streak: newStreak }));
    setShowDailyReward(false);
    playSound('coin-collect');
    playSound('ui-success');
  };

  const handleMiniGameComplete = (score: number) => {
    const coinsEarned = Math.floor(score / 2);
    setStats(s => ({ ...s, coins: s.coins + coinsEarned, happiness: Math.min(100, s.happiness + 15), xp: s.xp + score }));
    setShowMiniGame(false);
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
    const xpGain = actionType === 'primary' ? 15 : 10;

    if ((room.key === 'shop' || room.key === 'supermarket') && stats.coins < cost) {
      playSound('ui-error');
      showBubble(t.messages.notEnoughCoins);
      return;
    }
    
    // Play UI click
    playSound('ui-click');

    // 20% chance for mini-game in garden
    if (room.key === 'garden' && actionType === 'primary' && Math.random() < 0.2) {
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
          break;
        case 'kitchen':
          message = t.messages.eating;
          statChanges = { ...statChanges, hunger: Math.min(100, stats.hunger + 30), health: Math.min(100, stats.health + 5) };
          setAchievements(a => a.map(ach => ach.id === 'firstMeal' ? { ...ach, progress: 1 } : ach));
          playSound('action-eat');
          break;
        case 'garden':
          message = t.messages.playing;
          statChanges = { ...statChanges, happiness: Math.min(100, stats.happiness + 25), energy: Math.max(0, stats.energy - 10), coins: stats.coins + 10 };
          setAchievements(a => a.map(ach => ach.id === 'socialite' ? { ...ach, progress: ach.progress + 1 } : ach));
          playSound('action-play');
          playSound('coin-collect');
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
          break;
        case 'supermarket':
          message = t.messages.buying;
          statChanges = { ...statChanges, hunger: Math.min(100, stats.hunger + 25), coins: stats.coins - cost };
          playSound('action-shop');
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

      showBubble(message);
      setStats(prev => ({ ...prev, ...statChanges }));
    });
  };

  const navigateToRoom = (index: number) => {
    const roomKey = roomData[index].key;
    setGameState(g => ({ ...g, roomsVisited: new Set([...g.roomsVisited, roomKey]) }));
    setCurrentRoom(index);
    setShowMap(false);
    setLunaPosition({ x: 50, y: 60 });
    playSound('ui-click');
  };

  const toggleLanguage = () => setLang(lang === 'it' ? 'en' : 'it');
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
    if (gameType === 'stars') {
      setShowMiniGame(true);
    } else if (gameType === 'quiz') {
      // Quiz = memory game for now
      setActiveGame('memory');
    } else {
      setActiveGame(gameType);
    }
  };

  const handleObjectReward = (reward: { coins?: number; xp?: number; happiness?: number }) => {
    setShowObjectsHint(false);
    setStats(prev => ({
      ...prev,
      coins: prev.coins + (reward.coins || 0),
      xp: prev.xp + (reward.xp || 0),
      happiness: Math.min(100, prev.happiness + (reward.happiness || 0)),
    }));
  };

  const handleObjectStory = (story: string) => {
    setShowObjectsHint(false);
    setStoryText(story);
    setShowStory(true);
  };

  // Popups
  if (showDailyReward) {
    return <DailyRewardPopup coins={dailyRewardAmount} streak={gameState.streak} lang={lang} onClose={claimDailyReward} />;
  }

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

  // Map View
  if (showMap) {
    return (
      <motion.div 
        key="map-view"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`full-page-bg map-view ${timeClass}`}>
        {showAchievement && <AchievementPopup achievement={showAchievement} lang={lang} onClose={() => setShowAchievement(null)} />}
        {eventMessage && <div className="event-toast glass-card">{eventMessage}</div>}
        
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

          <div className={`luna-map ${isDragging ? 'dragging' : ''}`}
            style={isDragging && mapContainerRef ? {
              position: 'fixed', left: `${dragPosition.x}px`, top: `${dragPosition.y}px`,
              transform: 'translate(-50%, -50%) scale(1.2)', zIndex: 100,
            } : {
              left: `${roomData[currentRoom].lunaPos.x}%`, top: `${roomData[currentRoom].lunaPos.y}%`,
              transform: `translate(-50%, -50%) translateY(${floatY}px)`
            }}
            onMouseDown={handleDragStart} onTouchStart={handleDragStart}>
            <img src={`${BASE_URL}assets/character/luna-happy.jpg`} alt="Moonlight" className={`luna-map-img mood-${mood}`} />
            <div className="luna-map-glow" />
            <span className="luna-mood-indicator">{getMoodEmoji(mood)}</span>
          </div>

          {!isDragging && <div className="drag-hint">{lang === 'it' ? '👆 Trascina Moonlight!' : '👆 Drag Moonlight!'}</div>}
        </div>

        <div className="map-header">
          <div className="header glass-card">
            <h1 className="title">{t.title}</h1>
            <div className="header-right">
              <span className="time-indicator">{t.timeOfDay[timeOfDay]}</span>
              <button className="sound-toggle" onClick={() => { toggleMute(); playSound('ui-click'); }} title={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted ? '🔇' : '🔊'}
              </button>
              <div className="ambient-volume-control" title={lang === 'it' ? 'Volume ambiente' : 'Ambient volume'}>
                <span className="ambient-icon">🎵</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(ambientVolume * 100)}
                  onChange={(e) => handleAmbientVolumeChange(parseInt(e.target.value) / 100)}
                  className="ambient-slider"
                  disabled={isMuted}
                />
              </div>
              <button 
                className={`weather-toggle ${useRealWeather ? 'active' : ''}`} 
                onClick={() => { toggleRealWeather(); playSound('ui-click'); }}
                title={useRealWeather 
                  ? (lang === 'it' ? `Meteo reale: ${weather.icon} ${weather.temperature}°C` : `Real weather: ${weather.icon} ${weather.temperature}°C`)
                  : (lang === 'it' ? 'Meteo storia' : 'Story weather')
                }
              >
                {weatherLoading ? '⏳' : weather.icon}
                {useRealWeather && <span className="weather-badge">LIVE</span>}
              </button>
              <button className="lang-toggle" onClick={toggleLanguage}>{lang === 'it' ? '🇮🇹' : '🇬🇧'}</button>
              <div className="level-badge glass-card">Lv.{stats.level}</div>
              <div className="coin-container"><span className="coin-icon">✨</span><span className="coin-text">{stats.coins}</span></div>
            </div>
          </div>

          <div className="mini-stats glass-card">
            <span className="mood-display">{getMoodEmoji(mood)} {t.moods[mood]}</span>
            <span>💚 {Math.round(stats.health)}</span>
            <span>🍪 {Math.round(stats.hunger)}</span>
            <span>⚡ {Math.round(stats.energy)}</span>
            <span>💖 {Math.round(stats.happiness)}</span>
          </div>
          
          <div className="xp-bar-container">
            <div className="xp-bar" style={{ width: `${(stats.xp / getXpForLevel(stats.level)) * 100}%` }} />
            <span className="xp-text">{stats.xp}/{getXpForLevel(stats.level)} XP</span>
          </div>
        </div>

        <div className="outside-bar glass-card">
          <span className="outside-label">🚶 {lang === 'it' ? 'Esci' : 'Go out'}:</span>
          {outsideRooms.map((room) => (
            <button key={room.key} className="outside-btn"
              onClick={() => navigateToRoom(roomData.findIndex(r => r.key === room.key))}>
              {room.icon} {t.rooms[room.key]}
            </button>
          ))}
          <button className="outside-btn games-btn" onClick={() => setActiveGame('hub')}>
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
      className={`full-page-bg room-view ${timeClass} room-${currentRoomData.key}`} 
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
      
      {showAchievement && <AchievementPopup achievement={showAchievement} lang={lang} onClose={() => setShowAchievement(null)} />}
      {eventMessage && <div className="event-toast glass-card">{eventMessage}</div>}
      
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
        <button className="back-btn" onClick={() => setShowMap(true)}>← 🏠</button>
        <h1 className="title room-title">{currentRoomData.icon} {t.rooms[currentRoomData.key]}</h1>
        <div className="header-right">
          <div className="level-badge glass-card">Lv.{stats.level}</div>
          <div className="coin-container"><span className="coin-icon">✨</span><span className="coin-text">{stats.coins}</span></div>
        </div>
      </div>

      <div className="mini-stats glass-card">
        <span className="mood-display">{getMoodEmoji(mood)} {t.moods[mood]}</span>
        <span>💚 {Math.round(stats.health)}</span>
        <span>🍪 {Math.round(stats.hunger)}</span>
        <span>⚡ {Math.round(stats.energy)}</span>
        <span>💖 {Math.round(stats.happiness)}</span>
      </div>

      {/* Movement Particles - magical sparkles when Luna walks */}
      <MovementParticles 
        isMoving={isWalking} 
        x={lunaPosition.x} 
        y={lunaPosition.y} 
        facingDirection={facingDirection} 
      />
      
      <div 
        className={`luna-container ${isWalking ? 'walking' : ''} ${facingDirection === 'left' ? 'facing-left' : ''}`}
        style={{ 
          left: `${lunaPosition.x}%`, 
          top: `${lunaPosition.y}%`, 
          transform: `translate(-50%, -50%) translateY(${isWalking ? 0 : floatY}px)`,
          transition: isWalking ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {actionBubble && <div className="bubble glass-card"><span className="bubble-text">{actionBubble}</span></div>}
        <img src={`${BASE_URL}assets/character/luna-happy.jpg`} alt="Moonlight" className={`luna-img mood-${mood} ${isActing ? 'acting' : ''} ${isWalking ? 'walking' : ''}`} />
        <div className="luna-glow" />
        <span className="luna-mood-badge">{getMoodEmoji(mood)}</span>
        {isWalking && <div className="walk-dust" />}
      </div>

      <div className="room-actions">
        <button className={`action-btn glass-card ${isActing ? 'disabled' : ''}`} onClick={() => handleRoomAction('primary')} disabled={isActing}>
          <span className="action-label">{roomActions.primary}</span>
          {(currentRoomData.key === 'shop' || currentRoomData.key === 'supermarket') && <span className="action-cost">-5 ✨</span>}
          {currentRoomData.key === 'garden' && <span className="action-bonus">🎮?</span>}
        </button>
        <button className={`action-btn secondary glass-card ${isActing ? 'disabled' : ''}`} onClick={() => handleRoomAction('secondary')} disabled={isActing}>
          <span className="action-label">{roomActions.secondary}</span>
        </button>
      </div>

      <p className="footer">{t.footer}</p>
    </motion.div>
  );
}

export default App;

'use client';

import { useCallback, useEffect, useMemo, useRef, useState, createContext, useContext, ReactNode } from 'react';

// ============================================
// TYPES
// ============================================

export type SoundCategory = 'music' | 'effects' | 'ui' | 'ambient';

export interface SoundConfig {
  src: string;
  category: SoundCategory;
  volume?: number; // 0-1, relative to category volume
  loop?: boolean;
  preload?: boolean;
  fadeIn?: number; // ms
  fadeOut?: number; // ms
}

export interface SoundInstance {
  id: string;
  audio: HTMLAudioElement;
  config: SoundConfig;
  gainNode?: GainNode;
  pannerNode?: PannerNode;
}

export interface VolumeSettings {
  master: number;
  music: number;
  effects: number;
  ui: number;
  ambient: number;
}

export interface SoundManagerState {
  isInitialized: boolean;
  isMuted: boolean;
  volumes: VolumeSettings;
  currentMusic: string | null;
  loadedSounds: Set<string>;
  activeSounds: Map<string, SoundInstance>;
}

export interface SpatialPosition {
  x: number;
  y: number;
  z: number;
}

export interface PlayOptions {
  volume?: number;
  loop?: boolean;
  fadeIn?: number;
  onEnd?: () => void;
  spatial?: SpatialPosition;
}

// ============================================
// CONSTANTS
// ============================================

export const STORAGE_KEY = 'onde-sound-settings';

export const DEFAULT_VOLUMES: VolumeSettings = {
  master: 0.8,
  music: 0.6,
  effects: 0.8,
  ui: 0.7,
  ambient: 0.5,
};

// Pre-defined sounds for the portal
export const SOUNDS: Record<string, SoundConfig> = {
  // UI Sounds
  'ui.click': {
    src: '/sounds/ui/click.mp3',
    category: 'ui',
    volume: 0.5,
    preload: true,
  },
  'ui.hover': {
    src: '/sounds/ui/hover.mp3',
    category: 'ui',
    volume: 0.3,
    preload: true,
  },
  'ui.success': {
    src: '/sounds/ui/success.mp3',
    category: 'ui',
    volume: 0.6,
    preload: true,
  },
  'ui.error': {
    src: '/sounds/ui/error.mp3',
    category: 'ui',
    volume: 0.5,
    preload: true,
  },
  'ui.notification': {
    src: '/sounds/ui/notification.mp3',
    category: 'ui',
    volume: 0.6,
    preload: true,
  },
  'ui.toggle': {
    src: '/sounds/ui/toggle.mp3',
    category: 'ui',
    volume: 0.4,
  },
  'ui.page-turn': {
    src: '/sounds/ui/page-turn.mp3',
    category: 'ui',
    volume: 0.5,
  },
  
  // Transition Sounds
  'transition.whoosh': {
    src: '/sounds/transitions/whoosh.mp3',
    category: 'effects',
    volume: 0.4,
    preload: true,
  },
  'transition.wave': {
    src: '/sounds/transitions/wave.mp3',
    category: 'effects',
    volume: 0.5,
  },
  'transition.bubble': {
    src: '/sounds/transitions/bubble.mp3',
    category: 'effects',
    volume: 0.4,
  },
  
  // Achievement/Reward Sounds
  'reward.achievement': {
    src: '/sounds/rewards/achievement.mp3',
    category: 'effects',
    volume: 0.7,
  },
  'reward.level-up': {
    src: '/sounds/rewards/level-up.mp3',
    category: 'effects',
    volume: 0.7,
  },
  'reward.star': {
    src: '/sounds/rewards/star.mp3',
    category: 'effects',
    volume: 0.5,
  },
  'reward.coins': {
    src: '/sounds/rewards/coins.mp3',
    category: 'effects',
    volume: 0.5,
  },
  
  // Background Music
  'music.home': {
    src: '/sounds/music/home-theme.mp3',
    category: 'music',
    loop: true,
    fadeIn: 2000,
    fadeOut: 1500,
    volume: 0.8,
  },
  'music.explore': {
    src: '/sounds/music/explore-theme.mp3',
    category: 'music',
    loop: true,
    fadeIn: 2000,
    fadeOut: 1500,
    volume: 0.8,
  },
  'music.reading': {
    src: '/sounds/music/reading-theme.mp3',
    category: 'music',
    loop: true,
    fadeIn: 3000,
    fadeOut: 2000,
    volume: 0.5,
  },
  'music.games': {
    src: '/sounds/music/games-theme.mp3',
    category: 'music',
    loop: true,
    fadeIn: 1500,
    fadeOut: 1000,
    volume: 0.7,
  },
  'music.underwater': {
    src: '/sounds/music/underwater-theme.mp3',
    category: 'music',
    loop: true,
    fadeIn: 2500,
    fadeOut: 2000,
    volume: 0.6,
  },
  
  // Ambient Sounds
  'ambient.ocean': {
    src: '/sounds/ambient/ocean-waves.mp3',
    category: 'ambient',
    loop: true,
    volume: 0.4,
  },
  'ambient.bubbles': {
    src: '/sounds/ambient/underwater-bubbles.mp3',
    category: 'ambient',
    loop: true,
    volume: 0.3,
  },
  'ambient.seagulls': {
    src: '/sounds/ambient/seagulls.mp3',
    category: 'ambient',
    loop: true,
    volume: 0.2,
  },
  
  // Game Sounds
  'game.correct': {
    src: '/sounds/games/correct.mp3',
    category: 'effects',
    volume: 0.6,
  },
  'game.wrong': {
    src: '/sounds/games/wrong.mp3',
    category: 'effects',
    volume: 0.5,
  },
  'game.combo': {
    src: '/sounds/games/combo.mp3',
    category: 'effects',
    volume: 0.7,
  },
  'game.splash': {
    src: '/sounds/games/splash.mp3',
    category: 'effects',
    volume: 0.6,
  },
};

// Section to music mapping
export const SECTION_MUSIC: Record<string, string> = {
  home: 'music.home',
  explore: 'music.explore',
  library: 'music.reading',
  reading: 'music.reading',
  games: 'music.games',
  underwater: 'music.underwater',
  profile: 'music.home',
};

// ============================================
// AUDIO CONTEXT SINGLETON
// ============================================

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext && typeof window !== 'undefined') {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext!;
}

// ============================================
// SOUND MANAGER CONTEXT
// ============================================

interface SoundManagerContextType {
  // State
  isInitialized: boolean;
  isMuted: boolean;
  volumes: VolumeSettings;
  currentMusic: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  play: (soundId: string, options?: PlayOptions) => string | null;
  stop: (instanceId: string, fadeOut?: number) => void;
  stopAll: (category?: SoundCategory) => void;
  pause: (instanceId: string) => void;
  resume: (instanceId: string) => void;
  
  // Music
  playMusic: (soundId: string, crossfade?: boolean) => void;
  stopMusic: (fadeOut?: number) => void;
  setMusicForSection: (section: string) => void;
  
  // Volume
  setVolume: (category: keyof VolumeSettings, value: number) => void;
  setMasterVolume: (value: number) => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  
  // Preloading
  preload: (soundIds: string[]) => Promise<void>;
  preloadAll: () => Promise<void>;
  
  // Spatial Audio
  setListenerPosition: (position: SpatialPosition) => void;
  setSoundPosition: (instanceId: string, position: SpatialPosition) => void;
  
  // Utilities
  isPlaying: (instanceId: string) => boolean;
  getSoundDuration: (soundId: string) => number | null;
}

const SoundManagerContext = createContext<SoundManagerContextType | null>(null);

// ============================================
// SOUND MANAGER PROVIDER
// ============================================

interface SoundManagerProviderProps {
  children: ReactNode;
  autoInitialize?: boolean;
  enableSpatialAudio?: boolean;
}

export function SoundManagerProvider({
  children,
  autoInitialize = false,
  enableSpatialAudio = false,
}: SoundManagerProviderProps) {
  const [state, setState] = useState<SoundManagerState>({
    isInitialized: false,
    isMuted: false,
    volumes: DEFAULT_VOLUMES,
    currentMusic: null,
    loadedSounds: new Set(),
    activeSounds: new Map(),
  });
  
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());
  const fadeIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const instanceCounter = useRef(0);
  const listenerPosition = useRef<SpatialPosition>({ x: 0, y: 0, z: 0 });
  
  // ----------------------------------------
  // Persistence
  // ----------------------------------------
  
  // Load settings from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState(prev => ({
          ...prev,
          isMuted: parsed.isMuted ?? prev.isMuted,
          volumes: { ...prev.volumes, ...parsed.volumes },
        }));
      }
    } catch (error) {
      console.warn('Failed to load sound settings:', error);
    }
  }, []);
  
  // Save settings to localStorage
  const saveSettings = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        isMuted: state.isMuted,
        volumes: state.volumes,
      }));
    } catch (error) {
      console.warn('Failed to save sound settings:', error);
    }
  }, [state.isMuted, state.volumes]);
  
  useEffect(() => {
    saveSettings();
  }, [saveSettings]);
  
  // ----------------------------------------
  // Initialization
  // ----------------------------------------
  
  const initialize = useCallback(async () => {
    if (state.isInitialized || typeof window === 'undefined') return;
    
    try {
      // Initialize Web Audio API context
      const ctx = getAudioContext();
      
      // Resume if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      setState(prev => ({ ...prev, isInitialized: true }));
      console.log('🔊 Sound Manager initialized');
    } catch (error) {
      console.error('Failed to initialize Sound Manager:', error);
    }
  }, [state.isInitialized]);
  
  // Auto-initialize on user interaction
  useEffect(() => {
    if (!autoInitialize || state.isInitialized || typeof window === 'undefined') return;
    
    const handleInteraction = () => {
      initialize();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
    
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [autoInitialize, state.isInitialized, initialize]);
  
  // ----------------------------------------
  // Volume Calculations
  // ----------------------------------------
  
  const calculateVolume = useCallback((config: SoundConfig, optionVolume?: number): number => {
    if (state.isMuted) return 0;
    
    const categoryVolume = state.volumes[config.category];
    const soundVolume = optionVolume ?? config.volume ?? 1;
    
    return state.volumes.master * categoryVolume * soundVolume;
  }, [state.isMuted, state.volumes]);
  
  // ----------------------------------------
  // Sound Loading
  // ----------------------------------------
  
  const loadSound = useCallback(async (soundId: string): Promise<HTMLAudioElement | null> => {
    const config = SOUNDS[soundId];
    if (!config) {
      console.warn(`Sound not found: ${soundId}`);
      return null;
    }
    
    // Check cache
    if (audioCache.current.has(soundId)) {
      return audioCache.current.get(soundId)!;
    }
    
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = config.src;
      audio.preload = 'auto';
      
      audio.addEventListener('canplaythrough', () => {
        audioCache.current.set(soundId, audio);
        setState(prev => ({
          ...prev,
          loadedSounds: new Set([...prev.loadedSounds, soundId]),
        }));
        resolve(audio);
      }, { once: true });
      
      audio.addEventListener('error', (e) => {
        console.warn(`Failed to load sound: ${soundId}`, e);
        resolve(null);
      }, { once: true });
      
      audio.load();
    });
  }, []);
  
  // ----------------------------------------
  // Preloading
  // ----------------------------------------
  
  const preload = useCallback(async (soundIds: string[]) => {
    await Promise.all(soundIds.map(id => loadSound(id)));
  }, [loadSound]);
  
  const preloadAll = useCallback(async () => {
    const toPreload = Object.entries(SOUNDS)
      .filter(([, config]) => config.preload)
      .map(([id]) => id);
    await preload(toPreload);
  }, [preload]);
  
  // ----------------------------------------
  // Fade Utilities
  // ----------------------------------------
  
  const fadeVolume = useCallback((
    audio: HTMLAudioElement,
    instanceId: string,
    from: number,
    to: number,
    duration: number,
    onComplete?: () => void
  ) => {
    // Clear existing fade
    const existingInterval = fadeIntervals.current.get(instanceId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }
    
    const steps = Math.max(duration / 50, 1);
    const stepSize = (to - from) / steps;
    let currentStep = 0;
    
    audio.volume = from;
    
    const interval = setInterval(() => {
      currentStep++;
      const newVolume = from + (stepSize * currentStep);
      audio.volume = Math.max(0, Math.min(1, newVolume));
      
      if (currentStep >= steps) {
        clearInterval(interval);
        fadeIntervals.current.delete(instanceId);
        audio.volume = to;
        onComplete?.();
      }
    }, 50);
    
    fadeIntervals.current.set(instanceId, interval);
  }, []);
  
  // ----------------------------------------
  // Playback
  // ----------------------------------------
  
  const play = useCallback((soundId: string, options?: PlayOptions): string | null => {
    if (!state.isInitialized) {
      // Try to initialize on play
      initialize();
    }
    
    const config = SOUNDS[soundId];
    if (!config) {
      console.warn(`Sound not found: ${soundId}`);
      return null;
    }
    
    // Create instance ID
    const instanceId = `${soundId}-${++instanceCounter.current}`;
    
    // Clone or create audio
    let audio: HTMLAudioElement;
    const cached = audioCache.current.get(soundId);
    if (cached) {
      audio = cached.cloneNode(true) as HTMLAudioElement;
    } else {
      audio = new Audio(config.src);
    }
    
    // Configure audio
    audio.loop = options?.loop ?? config.loop ?? false;
    
    const targetVolume = calculateVolume(config, options?.volume);
    const fadeIn = options?.fadeIn ?? config.fadeIn;
    
    if (fadeIn && fadeIn > 0) {
      audio.volume = 0;
    } else {
      audio.volume = targetVolume;
    }
    
    // Spatial audio setup
    if (enableSpatialAudio && options?.spatial) {
      try {
        const ctx = getAudioContext();
        const source = ctx.createMediaElementSource(audio);
        const panner = ctx.createPanner();
        
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 100;
        panner.rolloffFactor = 1;
        
        panner.setPosition(options.spatial.x, options.spatial.y, options.spatial.z);
        
        source.connect(panner);
        panner.connect(ctx.destination);
      } catch (error) {
        console.warn('Spatial audio setup failed:', error);
      }
    }
    
    // Store instance
    const instance: SoundInstance = {
      id: instanceId,
      audio,
      config,
    };
    
    setState(prev => ({
      ...prev,
      activeSounds: new Map(prev.activeSounds).set(instanceId, instance),
    }));
    
    // Event handlers
    audio.addEventListener('ended', () => {
      if (!audio.loop) {
        options?.onEnd?.();
        setState(prev => {
          const newActive = new Map(prev.activeSounds);
          newActive.delete(instanceId);
          return { ...prev, activeSounds: newActive };
        });
      }
    });
    
    // Play
    audio.play().then(() => {
      if (fadeIn && fadeIn > 0) {
        fadeVolume(audio, instanceId, 0, targetVolume, fadeIn);
      }
    }).catch(error => {
      console.warn(`Failed to play sound: ${soundId}`, error);
    });
    
    return instanceId;
  }, [state.isInitialized, initialize, calculateVolume, enableSpatialAudio, fadeVolume]);
  
  // ----------------------------------------
  // Stop
  // ----------------------------------------
  
  const stop = useCallback((instanceId: string, fadeOut?: number) => {
    const instance = state.activeSounds.get(instanceId);
    if (!instance) return;
    
    const { audio, config } = instance;
    const fadeOutDuration = fadeOut ?? config.fadeOut ?? 0;
    
    if (fadeOutDuration > 0) {
      fadeVolume(audio, instanceId, audio.volume, 0, fadeOutDuration, () => {
        audio.pause();
        audio.currentTime = 0;
        setState(prev => {
          const newActive = new Map(prev.activeSounds);
          newActive.delete(instanceId);
          return { ...prev, activeSounds: newActive };
        });
      });
    } else {
      audio.pause();
      audio.currentTime = 0;
      setState(prev => {
        const newActive = new Map(prev.activeSounds);
        newActive.delete(instanceId);
        return { ...prev, activeSounds: newActive };
      });
    }
  }, [state.activeSounds, fadeVolume]);
  
  const stopAll = useCallback((category?: SoundCategory) => {
    state.activeSounds.forEach((instance, id) => {
      if (!category || instance.config.category === category) {
        stop(id);
      }
    });
  }, [state.activeSounds, stop]);
  
  // ----------------------------------------
  // Pause/Resume
  // ----------------------------------------
  
  const pause = useCallback((instanceId: string) => {
    const instance = state.activeSounds.get(instanceId);
    if (instance) {
      instance.audio.pause();
    }
  }, [state.activeSounds]);
  
  const resume = useCallback((instanceId: string) => {
    const instance = state.activeSounds.get(instanceId);
    if (instance) {
      instance.audio.play().catch(console.warn);
    }
  }, [state.activeSounds]);
  
  // ----------------------------------------
  // Music Control
  // ----------------------------------------
  
  const musicInstanceRef = useRef<string | null>(null);
  
  const playMusic = useCallback((soundId: string, crossfade = true) => {
    // Stop current music
    if (musicInstanceRef.current) {
      if (crossfade) {
        stop(musicInstanceRef.current, SOUNDS[soundId]?.fadeOut ?? 1500);
      } else {
        stop(musicInstanceRef.current);
      }
    }
    
    // Play new music
    const instanceId = play(soundId, { loop: true });
    musicInstanceRef.current = instanceId;
    
    setState(prev => ({ ...prev, currentMusic: soundId }));
  }, [play, stop]);
  
  const stopMusic = useCallback((fadeOut = 1500) => {
    if (musicInstanceRef.current) {
      stop(musicInstanceRef.current, fadeOut);
      musicInstanceRef.current = null;
      setState(prev => ({ ...prev, currentMusic: null }));
    }
  }, [stop]);
  
  const setMusicForSection = useCallback((section: string) => {
    const musicId = SECTION_MUSIC[section];
    if (musicId && musicId !== state.currentMusic) {
      playMusic(musicId, true);
    }
  }, [playMusic, state.currentMusic]);
  
  // ----------------------------------------
  // Volume Control
  // ----------------------------------------
  
  const setVolume = useCallback((category: keyof VolumeSettings, value: number) => {
    const clampedValue = Math.max(0, Math.min(1, value));
    setState(prev => ({
      ...prev,
      volumes: { ...prev.volumes, [category]: clampedValue },
    }));
    
    // Update active sounds
    state.activeSounds.forEach((instance) => {
      if (instance.config.category === category || category === 'master') {
        const newVolume = calculateVolume(instance.config);
        instance.audio.volume = newVolume;
      }
    });
  }, [state.activeSounds, calculateVolume]);
  
  const setMasterVolume = useCallback((value: number) => {
    setVolume('master', value);
  }, [setVolume]);
  
  const toggleMute = useCallback(() => {
    setState(prev => {
      const newMuted = !prev.isMuted;
      
      // Update all active sounds
      prev.activeSounds.forEach((instance) => {
        instance.audio.volume = newMuted ? 0 : calculateVolume(instance.config);
      });
      
      return { ...prev, isMuted: newMuted };
    });
  }, [calculateVolume]);
  
  const setMuted = useCallback((muted: boolean) => {
    setState(prev => {
      if (prev.isMuted === muted) return prev;
      
      prev.activeSounds.forEach((instance) => {
        instance.audio.volume = muted ? 0 : calculateVolume(instance.config);
      });
      
      return { ...prev, isMuted: muted };
    });
  }, [calculateVolume]);
  
  // ----------------------------------------
  // Spatial Audio
  // ----------------------------------------
  
  const setListenerPosition = useCallback((position: SpatialPosition) => {
    listenerPosition.current = position;
    
    if (enableSpatialAudio) {
      const ctx = getAudioContext();
      if (ctx.listener.positionX) {
        ctx.listener.positionX.value = position.x;
        ctx.listener.positionY.value = position.y;
        ctx.listener.positionZ.value = position.z;
      } else {
        ctx.listener.setPosition(position.x, position.y, position.z);
      }
    }
  }, [enableSpatialAudio]);
  
  const setSoundPosition = useCallback((instanceId: string, position: SpatialPosition) => {
    const instance = state.activeSounds.get(instanceId);
    if (instance?.pannerNode) {
      instance.pannerNode.setPosition(position.x, position.y, position.z);
    }
  }, [state.activeSounds]);
  
  // ----------------------------------------
  // Utilities
  // ----------------------------------------
  
  const isPlaying = useCallback((instanceId: string): boolean => {
    const instance = state.activeSounds.get(instanceId);
    return instance ? !instance.audio.paused : false;
  }, [state.activeSounds]);
  
  const getSoundDuration = useCallback((soundId: string): number | null => {
    const audio = audioCache.current.get(soundId);
    return audio ? audio.duration : null;
  }, []);
  
  // ----------------------------------------
  // Cleanup
  // ----------------------------------------
  
  useEffect(() => {
    return () => {
      // Stop all sounds on unmount
      state.activeSounds.forEach((instance) => {
        instance.audio.pause();
      });
      
      // Clear fade intervals
      fadeIntervals.current.forEach((interval) => {
        clearInterval(interval);
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // ----------------------------------------
  // Context Value
  // ----------------------------------------
  
  const contextValue = useMemo<SoundManagerContextType>(() => ({
    // State
    isInitialized: state.isInitialized,
    isMuted: state.isMuted,
    volumes: state.volumes,
    currentMusic: state.currentMusic,
    
    // Actions
    initialize,
    play,
    stop,
    stopAll,
    pause,
    resume,
    
    // Music
    playMusic,
    stopMusic,
    setMusicForSection,
    
    // Volume
    setVolume,
    setMasterVolume,
    toggleMute,
    setMuted,
    
    // Preloading
    preload,
    preloadAll,
    
    // Spatial Audio
    setListenerPosition,
    setSoundPosition,
    
    // Utilities
    isPlaying,
    getSoundDuration,
  }), [
    state.isInitialized,
    state.isMuted,
    state.volumes,
    state.currentMusic,
    initialize,
    play,
    stop,
    stopAll,
    pause,
    resume,
    playMusic,
    stopMusic,
    setMusicForSection,
    setVolume,
    setMasterVolume,
    toggleMute,
    setMuted,
    preload,
    preloadAll,
    setListenerPosition,
    setSoundPosition,
    isPlaying,
    getSoundDuration,
  ]);
  
  return (
    <SoundManagerContext.Provider value={contextValue}>
      {children}
    </SoundManagerContext.Provider>
  );
}

// ============================================
// HOOKS
// ============================================

/**
 * Main hook to access the sound manager
 */
export function useSoundManager(): SoundManagerContextType {
  const context = useContext(SoundManagerContext);
  
  if (!context) {
    throw new Error('useSoundManager must be used within a SoundManagerProvider');
  }
  
  return context;
}

/**
 * Hook for UI sound shortcuts
 */
export function useUISound() {
  const { play, isInitialized } = useSoundManager();
  
  return useMemo(() => ({
    click: () => isInitialized && play('ui.click'),
    hover: () => isInitialized && play('ui.hover'),
    success: () => isInitialized && play('ui.success'),
    error: () => isInitialized && play('ui.error'),
    notification: () => isInitialized && play('ui.notification'),
    toggle: () => isInitialized && play('ui.toggle'),
    pageTurn: () => isInitialized && play('ui.page-turn'),
    transition: () => isInitialized && play('transition.whoosh'),
  }), [play, isInitialized]);
}

/**
 * Hook for game sounds
 */
export function useGameSounds() {
  const { play, isInitialized } = useSoundManager();
  
  return useMemo(() => ({
    correct: () => isInitialized && play('game.correct'),
    wrong: () => isInitialized && play('game.wrong'),
    combo: () => isInitialized && play('game.combo'),
    splash: () => isInitialized && play('game.splash'),
    achievement: () => isInitialized && play('reward.achievement'),
    levelUp: () => isInitialized && play('reward.level-up'),
    star: () => isInitialized && play('reward.star'),
    coins: () => isInitialized && play('reward.coins'),
  }), [play, isInitialized]);
}

/**
 * Hook for volume control
 */
export function useVolumeControl() {
  const {
    volumes,
    isMuted,
    setVolume,
    setMasterVolume,
    toggleMute,
    setMuted,
  } = useSoundManager();
  
  return {
    volumes,
    isMuted,
    setVolume,
    setMasterVolume,
    toggleMute,
    setMuted,
  };
}

/**
 * Hook for music control
 */
export function useMusicControl() {
  const {
    currentMusic,
    playMusic,
    stopMusic,
    setMusicForSection,
    volumes,
    setVolume,
  } = useSoundManager();
  
  return {
    currentMusic,
    playMusic,
    stopMusic,
    setMusicForSection,
    musicVolume: volumes.music,
    setMusicVolume: (v: number) => setVolume('music', v),
  };
}

/**
 * Hook to automatically set music based on route/section
 */
export function useSectionMusic(section: string) {
  const { setMusicForSection, isInitialized } = useSoundManager();
  
  useEffect(() => {
    if (isInitialized && section) {
      setMusicForSection(section);
    }
  }, [section, isInitialized, setMusicForSection]);
}

/**
 * Hook for ambient sounds
 */
export function useAmbientSound(soundId: string, enabled = true) {
  const { play, stop, isInitialized } = useSoundManager();
  const instanceRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (!isInitialized) return;
    
    if (enabled && !instanceRef.current) {
      instanceRef.current = play(soundId, { loop: true });
    } else if (!enabled && instanceRef.current) {
      stop(instanceRef.current, 1000);
      instanceRef.current = null;
    }
    
    return () => {
      if (instanceRef.current) {
        stop(instanceRef.current, 500);
        instanceRef.current = null;
      }
    };
  }, [enabled, soundId, play, stop, isInitialized]);
}

export default useSoundManager;

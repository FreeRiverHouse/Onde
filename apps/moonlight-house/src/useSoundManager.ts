/**
 * Sound Manager Hook for Moonlight House
 * Handles ambient music and sound effects
 * 
 * Sound assets needed (place in public/assets/sounds/):
 * - ui-click.mp3 - button click
 * - ui-success.mp3 - achievement, level up
 * - action-eat.mp3 - eating sound
 * - action-sleep.mp3 - zzz/snoring
 * - action-play.mp3 - happy playing
 * - action-bath.mp3 - water splash
 * - action-shop.mp3 - cash register
 * - action-drive.mp3 - car engine
 * - coin-collect.mp3 - coin pickup
 * - ambient-home.mp3 - cozy home ambiance (looping)
 * - ambient-garden.mp3 - outdoor nature (looping)
 * - ambient-shop.mp3 - mall ambiance (looping)
 * 
 * Free CC0 sounds available at:
 * - freesound.org
 * - pixabay.com/sound-effects
 * - mixkit.co/free-sound-effects
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// Base path for assets
const BASE_URL = import.meta.env.BASE_URL || '/';

export type SoundEffect = 
  | 'ui-click'
  | 'ui-success'
  | 'ui-error'
  | 'action-eat'
  | 'action-sleep'
  | 'action-play'
  | 'action-bath'
  | 'action-shop'
  | 'action-drive'
  | 'coin-collect'
  | 'level-up'
  | 'achievement';

export type AmbientTrack = 'home' | 'garden' | 'shop' | 'none';

interface SoundManagerState {
  isMuted: boolean;
  volume: number;
  currentAmbient: AmbientTrack;
}

interface SoundManager {
  playSound: (effect: SoundEffect) => void;
  playAmbient: (track: AmbientTrack) => void;
  stopAmbient: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  volume: number;
}

// Simple oscillator-based sound generator for fallback
const createOscillatorSound = (
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
): void => {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

// Sound effect configurations (frequency, duration, type)
const SOUND_CONFIGS: Record<SoundEffect, { freq: number; duration: number; type: OscillatorType }> = {
  'ui-click': { freq: 800, duration: 0.1, type: 'square' },
  'ui-success': { freq: 523, duration: 0.3, type: 'sine' },
  'ui-error': { freq: 200, duration: 0.3, type: 'sawtooth' },
  'action-eat': { freq: 440, duration: 0.2, type: 'triangle' },
  'action-sleep': { freq: 200, duration: 0.5, type: 'sine' },
  'action-play': { freq: 659, duration: 0.15, type: 'square' },
  'action-bath': { freq: 350, duration: 0.3, type: 'sine' },
  'action-shop': { freq: 880, duration: 0.2, type: 'square' },
  'action-drive': { freq: 150, duration: 0.4, type: 'sawtooth' },
  'coin-collect': { freq: 987, duration: 0.15, type: 'sine' },
  'level-up': { freq: 784, duration: 0.4, type: 'sine' },
  'achievement': { freq: 880, duration: 0.5, type: 'triangle' },
};

// Play a multi-note melody for special effects
const playMelody = (ctx: AudioContext, notes: number[], duration: number, volume: number): void => {
  notes.forEach((freq, i) => {
    setTimeout(() => {
      createOscillatorSound(ctx, freq, duration, 'sine', volume);
    }, i * (duration * 1000 * 0.7));
  });
};

const STORAGE_KEY = 'moonlight-sound-settings';

export function useSoundManager(): SoundManager {
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const soundCacheRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  
  const [state, setState] = useState<SoundManagerState>(() => {
    // Load saved settings
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return { isMuted: false, volume: 0.5, currentAmbient: 'none' };
  });

  // Save settings on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  // Initialize AudioContext on first interaction
  const getAudioContext = useCallback((): AudioContext => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Try to load audio file, fallback to oscillator
  const playSound = useCallback((effect: SoundEffect): void => {
    if (state.isMuted) return;

    const audioPath = `${BASE_URL}assets/sounds/${effect}.mp3`;
    
    // Try cached audio first
    let audio = soundCacheRef.current.get(effect);
    
    if (audio) {
      audio.currentTime = 0;
      audio.volume = state.volume;
      audio.play().catch(() => {});
      return;
    }

    // Try to load audio file
    audio = new Audio(audioPath);
    audio.volume = state.volume;
    
    audio.play()
      .then(() => {
        // Cache successful audio
        soundCacheRef.current.set(effect, audio!);
      })
      .catch(() => {
        // Fallback to oscillator sound
        try {
          const ctx = getAudioContext();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
          
          const config = SOUND_CONFIGS[effect];
          
          // Special melodies for level-up and achievement
          if (effect === 'level-up') {
            playMelody(ctx, [523, 659, 784, 1047], 0.2, state.volume);
          } else if (effect === 'achievement') {
            playMelody(ctx, [659, 784, 880, 1047, 1319], 0.15, state.volume);
          } else if (effect === 'coin-collect') {
            playMelody(ctx, [880, 1047], 0.1, state.volume);
          } else {
            createOscillatorSound(ctx, config.freq, config.duration, config.type, state.volume);
          }
        } catch (e) {
          console.warn('Sound playback failed:', e);
        }
      });
  }, [state.isMuted, state.volume, getAudioContext]);

  // Ambient music control
  const playAmbient = useCallback((track: AmbientTrack): void => {
    if (track === 'none') {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current = null;
      }
      setState(s => ({ ...s, currentAmbient: 'none' }));
      return;
    }

    const audioPath = `${BASE_URL}assets/sounds/ambient-${track}.mp3`;
    
    // Stop current ambient
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
    }

    const audio = new Audio(audioPath);
    audio.loop = true;
    audio.volume = state.volume * 0.3; // Ambient is quieter
    
    audio.play()
      .then(() => {
        ambientAudioRef.current = audio;
        setState(s => ({ ...s, currentAmbient: track }));
      })
      .catch(() => {
        // Ambient music is optional, fail silently
        console.debug('Ambient music not available:', track);
      });
  }, [state.volume]);

  const stopAmbient = useCallback((): void => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current = null;
    }
    setState(s => ({ ...s, currentAmbient: 'none' }));
  }, []);

  const toggleMute = useCallback((): void => {
    setState(s => {
      const newMuted = !s.isMuted;
      if (ambientAudioRef.current) {
        ambientAudioRef.current.muted = newMuted;
      }
      return { ...s, isMuted: newMuted };
    });
  }, []);

  const setVolume = useCallback((volume: number): void => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setState(s => ({ ...s, volume: clampedVolume }));
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = clampedVolume * 0.3;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playSound,
    playAmbient,
    stopAmbient,
    toggleMute,
    setVolume,
    isMuted: state.isMuted,
    volume: state.volume,
  };
}

export default useSoundManager;

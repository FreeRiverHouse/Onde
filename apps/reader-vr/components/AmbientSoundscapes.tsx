/**
 * AmbientSoundscapes - Procedural library ambient soundscapes using Web Audio API
 * 
 * Creates an immersive audio atmosphere for the VR reading experience:
 * - Crackling fireplace
 * - Grandfather clock ticking
 * - Page rustling sounds on page turns
 * - Time-of-day variations (birds in morning, crickets at night through windows)
 * - Soft ambient library drone
 * 
 * All generated procedurally with Web Audio API - no audio files needed!
 * Based on Moonlight House implementation.
 */

import { useEffect, useRef, useCallback } from 'react';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface AmbientSoundscapesProps {
  timeOfDay: TimeOfDay;
  isMuted: boolean;
  volume: number; // 0-1
}

// Accent sound configuration
interface AccentConfig {
  freq: number;
  duration: number;
  type: OscillatorType;
  interval: [number, number]; // min/max ms between plays
  volume: number;
  detune?: number;
  filterFreq?: number;
  filterQ?: number;
}

// Library soundscape configuration
interface SoundscapeConfig {
  // Base drone frequencies (Hz)
  droneFreqs: number[];
  droneVolume: number;
  droneType: OscillatorType;
  // Accent sounds
  accents: AccentConfig[];
  // LFO modulation
  lfoRate?: number;
  lfoDepth?: number;
  // Filter settings
  filterFreq?: number;
  filterQ?: number;
  filterType?: BiquadFilterType;
  // Reverb
  useReverb?: boolean;
  reverbTime?: number;
}

// Base library soundscape (common to all times)
const BASE_LIBRARY_CONFIG: SoundscapeConfig = {
  // Warm, cozy drone
  droneFreqs: [82, 123, 165],
  droneVolume: 0.02,
  droneType: 'sine',
  accents: [
    // Grandfather clock tick (slow, resonant)
    { freq: 800, duration: 0.04, type: 'square', interval: [2000, 2000], volume: 0.015 },
    // Fire crackling base (low pops)
    { freq: 200, duration: 0.08, type: 'sawtooth', interval: [300, 800], volume: 0.015 },
    // Fire crackling high (snaps)
    { freq: 2500, duration: 0.03, type: 'sawtooth', interval: [400, 1200], volume: 0.008 },
    // Fire crackling mid
    { freq: 600, duration: 0.05, type: 'triangle', interval: [600, 1500], volume: 0.01 },
    // Wood settling/creaking
    { freq: 150, duration: 0.3, type: 'triangle', interval: [8000, 20000], volume: 0.012 },
  ],
  lfoRate: 0.08,
  lfoDepth: 4,
  filterFreq: 400,
  filterQ: 0.8,
  filterType: 'lowpass',
  useReverb: true,
  reverbTime: 2.5,
};

// Time-of-day specific accents (window sounds)
const TIME_SPECIFIC_ACCENTS: Record<TimeOfDay, AccentConfig[]> = {
  morning: [
    // Birds chirping through windows
    { freq: 2200, duration: 0.12, type: 'sine', interval: [2000, 4000], volume: 0.008, detune: 200 },
    { freq: 2800, duration: 0.08, type: 'sine', interval: [3000, 6000], volume: 0.006, detune: 300 },
    { freq: 1800, duration: 0.15, type: 'sine', interval: [2500, 5000], volume: 0.005 },
    // Distant morning breeze
    { freq: 400, duration: 0.8, type: 'sawtooth', interval: [5000, 10000], volume: 0.004, filterFreq: 300 },
  ],
  afternoon: [
    // Fewer birds, soft wind
    { freq: 2400, duration: 0.1, type: 'sine', interval: [4000, 8000], volume: 0.005, detune: 150 },
    // Distant traffic/life hum
    { freq: 120, duration: 1.5, type: 'sine', interval: [6000, 12000], volume: 0.006 },
    // Occasional wind gust
    { freq: 500, duration: 0.6, type: 'sawtooth', interval: [8000, 15000], volume: 0.004 },
  ],
  evening: [
    // Crickets starting
    { freq: 4200, duration: 0.04, type: 'sine', interval: [600, 1200], volume: 0.005 },
    // Last birds
    { freq: 2000, duration: 0.15, type: 'sine', interval: [5000, 10000], volume: 0.004, detune: 100 },
    // Evening breeze
    { freq: 350, duration: 0.5, type: 'sawtooth', interval: [6000, 12000], volume: 0.004 },
  ],
  night: [
    // Full cricket choir (distant, through windows)
    { freq: 4500, duration: 0.03, type: 'sine', interval: [400, 900], volume: 0.006 },
    { freq: 4000, duration: 0.04, type: 'sine', interval: [500, 1100], volume: 0.005 },
    // Distant owl hoot
    { freq: 280, duration: 0.7, type: 'sine', interval: [15000, 30000], volume: 0.008 },
    // Night wind through gaps
    { freq: 250, duration: 1.2, type: 'sawtooth', interval: [10000, 20000], volume: 0.003 },
  ],
};

export function useAmbientSoundscapes({
  timeOfDay,
  isMuted,
  volume,
}: AmbientSoundscapesProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const droneNodesRef = useRef<{
    oscillators: OscillatorNode[];
    gainNode: GainNode | null;
    filterNode: BiquadFilterNode | null;
    lfoOsc: OscillatorNode | null;
    lfoGain: GainNode | null;
  }>({ oscillators: [], gainNode: null, filterNode: null, lfoOsc: null, lfoGain: null });
  const accentTimersRef = useRef<number[]>([]);
  const masterGainRef = useRef<GainNode | null>(null);

  // Initialize AudioContext
  const getAudioContext = useCallback((): AudioContext | null => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch {
        console.warn('Web Audio API not supported');
        return null;
      }
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Create a simple convolver reverb
  const createReverbImpulse = useCallback((ctx: AudioContext, duration: number): AudioBuffer => {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // More natural decay curve
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    return impulse;
  }, []);

  // Play an accent sound
  const playAccent = useCallback((
    ctx: AudioContext,
    masterGain: GainNode,
    accent: AccentConfig,
    baseVolume: number
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = accent.type;
    osc.frequency.setValueAtTime(accent.freq, ctx.currentTime);
    if (accent.detune) {
      osc.detune.setValueAtTime(
        (Math.random() - 0.5) * accent.detune,
        ctx.currentTime
      );
    }
    
    // Optional filter for accent
    let filterNode: BiquadFilterNode | null = null;
    if (accent.filterFreq) {
      filterNode = ctx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(accent.filterFreq, ctx.currentTime);
      filterNode.Q.setValueAtTime(accent.filterQ || 1, ctx.currentTime);
    }
    
    const vol = accent.volume * baseVolume;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + accent.duration);
    
    osc.connect(filterNode || gain);
    if (filterNode) {
      filterNode.connect(gain);
    }
    gain.connect(masterGain);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + accent.duration + 0.05);
  }, []);

  // Schedule accent sounds
  const scheduleAccents = useCallback((
    ctx: AudioContext,
    masterGain: GainNode,
    accents: AccentConfig[],
    baseVolume: number
  ) => {
    // Clear existing timers
    accentTimersRef.current.forEach(t => clearTimeout(t));
    accentTimersRef.current = [];

    accents.forEach(accent => {
      const scheduleNext = () => {
        const delay = accent.interval[0] + Math.random() * (accent.interval[1] - accent.interval[0]);
        const timer = window.setTimeout(() => {
          if (ctx.state === 'running') {
            playAccent(ctx, masterGain, accent, baseVolume);
          }
          scheduleNext();
        }, delay);
        accentTimersRef.current.push(timer);
      };
      // Start with random delay
      const initialDelay = Math.random() * accent.interval[0];
      const timer = window.setTimeout(scheduleNext, initialDelay);
      accentTimersRef.current.push(timer);
    });
  }, [playAccent]);

  // Stop all sounds
  const stopAllSounds = useCallback(() => {
    // Stop accent timers
    accentTimersRef.current.forEach(t => clearTimeout(t));
    accentTimersRef.current = [];

    // Stop drone
    const { oscillators, gainNode, lfoOsc } = droneNodesRef.current;
    
    if (gainNode && audioContextRef.current) {
      gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.5);
    }
    
    setTimeout(() => {
      oscillators.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch {}
      });
      if (lfoOsc) {
        try { lfoOsc.stop(); lfoOsc.disconnect(); } catch {}
      }
      droneNodesRef.current = { oscillators: [], gainNode: null, filterNode: null, lfoOsc: null, lfoGain: null };
    }, 600);
  }, []);

  // Play page turn sound
  const playPageTurn = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || isMuted) return;
    
    const masterGain = masterGainRef.current;
    if (!masterGain) return;
    
    // Page rustling - multiple quick bursts of filtered noise-like sound
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2000 + Math.random() * 1000, ctx.currentTime);
      
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3000 + Math.random() * 1000, ctx.currentTime);
      filter.Q.setValueAtTime(2, ctx.currentTime);
      
      const startTime = ctx.currentTime + i * 0.05;
      const dur = 0.08 + Math.random() * 0.05;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.02 * volume, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      
      osc.start(startTime);
      osc.stop(startTime + dur + 0.05);
    }
  }, [getAudioContext, isMuted, volume]);

  // Start soundscape
  const startSoundscape = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || isMuted) return;

    // Stop existing sounds first
    stopAllSounds();

    // Build config with time-specific accents
    const config = {
      ...BASE_LIBRARY_CONFIG,
      accents: [
        ...BASE_LIBRARY_CONFIG.accents,
        ...TIME_SPECIFIC_ACCENTS[timeOfDay],
      ],
    };

    // Create master gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
    masterGainRef.current = masterGain;

    // Create filter
    let filterNode: BiquadFilterNode | null = null;
    if (config.filterFreq) {
      filterNode = ctx.createBiquadFilter();
      filterNode.type = config.filterType || 'lowpass';
      filterNode.frequency.setValueAtTime(config.filterFreq, ctx.currentTime);
      filterNode.Q.setValueAtTime(config.filterQ || 1, ctx.currentTime);
    }

    // Create reverb
    let reverbNode: ConvolverNode | null = null;
    let reverbGain: GainNode | null = null;
    if (config.useReverb) {
      reverbNode = ctx.createConvolver();
      reverbNode.buffer = createReverbImpulse(ctx, config.reverbTime || 2);
      reverbGain = ctx.createGain();
      reverbGain.gain.setValueAtTime(0.35, ctx.currentTime);
    }

    // Create drone gain with fade-in
    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0, ctx.currentTime);
    droneGain.gain.linearRampToValueAtTime(config.droneVolume, ctx.currentTime + 2);

    // Create LFO for subtle modulation
    let lfoOsc: OscillatorNode | null = null;
    let lfoGain: GainNode | null = null;
    if (config.lfoRate) {
      lfoOsc = ctx.createOscillator();
      lfoGain = ctx.createGain();
      lfoOsc.type = 'sine';
      lfoOsc.frequency.setValueAtTime(config.lfoRate, ctx.currentTime);
      lfoGain.gain.setValueAtTime(config.lfoDepth || 5, ctx.currentTime);
      lfoOsc.connect(lfoGain);
      lfoOsc.start();
    }

    // Create drone oscillators
    const oscillators: OscillatorNode[] = [];
    config.droneFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = config.droneType;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.detune.setValueAtTime((i - 1) * 3, ctx.currentTime);
      
      if (lfoGain) {
        lfoGain.connect(osc.frequency);
      }
      
      osc.connect(droneGain);
      osc.start();
      oscillators.push(osc);
    });

    // Build audio routing chain
    let lastNode: AudioNode = droneGain;
    
    if (filterNode) {
      lastNode.connect(filterNode);
      lastNode = filterNode;
    }

    // Dry path
    lastNode.connect(masterGain);
    
    // Wet (reverb) path
    if (reverbNode && reverbGain) {
      lastNode.connect(reverbNode);
      reverbNode.connect(reverbGain);
      reverbGain.connect(masterGain);
    }

    masterGain.connect(ctx.destination);

    // Save references
    droneNodesRef.current = {
      oscillators,
      gainNode: droneGain,
      filterNode,
      lfoOsc,
      lfoGain,
    };

    // Schedule accent sounds
    scheduleAccents(ctx, masterGain, config.accents, volume);
  }, [timeOfDay, isMuted, volume, getAudioContext, stopAllSounds, createReverbImpulse, scheduleAccents]);

  // Update volume
  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(
        isMuted ? 0 : volume * 0.5,
        audioContextRef.current.currentTime + 0.1
      );
    }
  }, [volume, isMuted]);

  // Start/restart soundscape when time changes
  useEffect(() => {
    if (isMuted) {
      stopAllSounds();
      return;
    }
    
    // Small delay to allow previous sounds to fade
    const timer = setTimeout(startSoundscape, 100);
    
    return () => {
      clearTimeout(timer);
      stopAllSounds();
    };
  }, [timeOfDay, isMuted, startSoundscape, stopAllSounds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllSounds();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAllSounds]);

  return {
    restart: startSoundscape,
    stop: stopAllSounds,
    playPageTurn,
  };
}

// React component wrapper for easy integration
export function AmbientSoundscapesProvider({
  timeOfDay,
  isMuted,
  volume,
  onPageTurn,
}: AmbientSoundscapesProps & { onPageTurn?: (callback: () => void) => void }) {
  const { playPageTurn } = useAmbientSoundscapes({
    timeOfDay,
    isMuted,
    volume,
  });
  
  // Register page turn callback
  useEffect(() => {
    if (onPageTurn) {
      onPageTurn(playPageTurn);
    }
  }, [onPageTurn, playPageTurn]);
  
  return null;
}

export default useAmbientSoundscapes;

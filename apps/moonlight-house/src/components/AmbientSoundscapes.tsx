/**
 * AmbientSoundscapes - Procedural room-specific soundscapes using Web Audio API
 * 
 * Each room has a unique audio atmosphere:
 * - Bedroom: Soft music box, gentle night sounds, clock ticking
 * - Kitchen: Sizzling, bubbling pots, fridge hum
 * - Garden: Birds (day), crickets (night), wind rustling
 * - Living Room: TV murmur, clock ticking, ambient hum
 * - Bathroom: Water dripping, steam hiss, echoey ambiance
 * - Garage: Tool sounds, mechanical hum, car engine idle
 * - Shop: Soft jazz/lounge music, glamour sparkle
 * - Supermarket: Checkout beeps, cart sounds, PA announcements
 * 
 * All generated procedurally with Web Audio API - no audio files needed!
 */

import { useEffect, useRef, useCallback } from 'react';

type RoomKey = 'bedroom' | 'kitchen' | 'garden' | 'living' | 'bathroom' | 'garage' | 'shop' | 'supermarket' | 'attic' | 'basement';
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface AmbientSoundscapesProps {
  currentRoom: RoomKey;
  timeOfDay: TimeOfDay;
  isMuted: boolean;
  volume: number; // 0-1
}

// Soundscape configuration per room
interface SoundscapeConfig {
  // Base drone frequencies (Hz)
  droneFreqs: number[];
  droneVolume: number;
  droneType: OscillatorType;
  // Accent sounds (random pings/effects)
  accents: {
    freq: number;
    duration: number;
    type: OscillatorType;
    interval: [number, number]; // min/max ms between plays
    volume: number;
    detune?: number;
  }[];
  // LFO modulation for the drone
  lfoRate?: number;
  lfoDepth?: number;
  // Filter settings
  filterFreq?: number;
  filterQ?: number;
  filterType?: BiquadFilterType;
  // Room-specific effects
  useReverb?: boolean;
  reverbTime?: number;
}

const SOUNDSCAPE_CONFIGS: Record<RoomKey, SoundscapeConfig> = {
  bedroom: {
    // Soft, cozy, sleep-inducing
    droneFreqs: [110, 165, 220],
    droneVolume: 0.03,
    droneType: 'sine',
    accents: [
      // Music box tinkle
      { freq: 880, duration: 0.3, type: 'sine', interval: [3000, 8000], volume: 0.02, detune: 50 },
      { freq: 1047, duration: 0.2, type: 'sine', interval: [4000, 10000], volume: 0.015 },
      // Clock tick
      { freq: 2000, duration: 0.02, type: 'square', interval: [1000, 1000], volume: 0.008 },
    ],
    lfoRate: 0.1,
    lfoDepth: 5,
    filterFreq: 400,
    filterQ: 1,
    filterType: 'lowpass',
    useReverb: true,
    reverbTime: 2,
  },
  kitchen: {
    // Warm, active, cooking sounds
    droneFreqs: [55, 110, 82],
    droneVolume: 0.02,
    droneType: 'triangle',
    accents: [
      // Sizzling (noise-like high freq bursts)
      { freq: 4000, duration: 0.05, type: 'sawtooth', interval: [200, 800], volume: 0.01 },
      // Bubbling (low pops)
      { freq: 150, duration: 0.08, type: 'sine', interval: [500, 1500], volume: 0.02 },
      // Fridge compressor hum cycle
      { freq: 60, duration: 2, type: 'sine', interval: [8000, 15000], volume: 0.015 },
    ],
    filterFreq: 800,
    filterQ: 0.5,
    filterType: 'lowpass',
  },
  garden: {
    // Nature sounds - changes with time of day
    droneFreqs: [196, 294, 392],
    droneVolume: 0.015,
    droneType: 'sine',
    accents: [
      // Wind rustling
      { freq: 800, duration: 0.5, type: 'sawtooth', interval: [2000, 5000], volume: 0.008 },
      // Leaves
      { freq: 2500, duration: 0.1, type: 'sawtooth', interval: [1000, 3000], volume: 0.005 },
    ],
    lfoRate: 0.3,
    lfoDepth: 20,
    filterFreq: 600,
    filterQ: 2,
    filterType: 'bandpass',
    useReverb: true,
    reverbTime: 3,
  },
  living: {
    // Cozy, TV ambiance, comfortable
    droneFreqs: [100, 150, 200],
    droneVolume: 0.02,
    droneType: 'sine',
    accents: [
      // TV static/murmur (filtered noise)
      { freq: 1000, duration: 0.3, type: 'sawtooth', interval: [500, 2000], volume: 0.005 },
      // Clock tick (slower than bedroom)
      { freq: 1500, duration: 0.03, type: 'square', interval: [2000, 2000], volume: 0.01 },
    ],
    filterFreq: 500,
    filterQ: 1,
    filterType: 'lowpass',
  },
  bathroom: {
    // Echoey, water drips, steam
    droneFreqs: [220, 330, 440],
    droneVolume: 0.015,
    droneType: 'sine',
    accents: [
      // Water drip
      { freq: 1200, duration: 0.15, type: 'sine', interval: [2000, 6000], volume: 0.025, detune: 100 },
      { freq: 800, duration: 0.1, type: 'sine', interval: [3000, 8000], volume: 0.02 },
      // Steam hiss
      { freq: 3000, duration: 0.8, type: 'sawtooth', interval: [5000, 12000], volume: 0.005 },
    ],
    lfoRate: 0.5,
    lfoDepth: 10,
    filterFreq: 1500,
    filterQ: 3,
    filterType: 'bandpass',
    useReverb: true,
    reverbTime: 4,
  },
  garage: {
    // Industrial, mechanical, echoey
    droneFreqs: [55, 82, 110],
    droneVolume: 0.025,
    droneType: 'sawtooth',
    accents: [
      // Tool clank
      { freq: 400, duration: 0.05, type: 'square', interval: [4000, 10000], volume: 0.02 },
      // Mechanical whir
      { freq: 200, duration: 0.5, type: 'triangle', interval: [3000, 7000], volume: 0.01 },
      // Distant engine idle
      { freq: 80, duration: 1.5, type: 'sawtooth', interval: [6000, 12000], volume: 0.015 },
    ],
    filterFreq: 400,
    filterQ: 0.7,
    filterType: 'lowpass',
    useReverb: true,
    reverbTime: 2.5,
  },
  shop: {
    // Glamorous, soft jazz, sparkle
    droneFreqs: [220, 277, 330, 440],
    droneVolume: 0.02,
    droneType: 'sine',
    accents: [
      // Sparkle/chime
      { freq: 2093, duration: 0.4, type: 'sine', interval: [2000, 5000], volume: 0.015 },
      { freq: 1568, duration: 0.3, type: 'sine', interval: [3000, 6000], volume: 0.012 },
      // Soft piano note
      { freq: 523, duration: 0.8, type: 'triangle', interval: [4000, 8000], volume: 0.015 },
    ],
    lfoRate: 0.2,
    lfoDepth: 8,
    filterFreq: 2000,
    filterQ: 0.5,
    filterType: 'lowpass',
  },
  supermarket: {
    // Busy, checkout beeps, PA echo
    droneFreqs: [100, 120, 150],
    droneVolume: 0.015,
    droneType: 'sine',
    accents: [
      // Checkout beep
      { freq: 1000, duration: 0.1, type: 'square', interval: [1500, 4000], volume: 0.02 },
      // Cart wheel squeak
      { freq: 3000, duration: 0.05, type: 'sawtooth', interval: [3000, 8000], volume: 0.008 },
      // Distant PA chime
      { freq: 880, duration: 0.5, type: 'sine', interval: [8000, 15000], volume: 0.01 },
    ],
    filterFreq: 600,
    filterQ: 0.5,
    filterType: 'lowpass',
    useReverb: true,
    reverbTime: 1.5,
  },
  // New explorable areas
  attic: {
    // Spooky/cozy, creaky floors, wind through rafters, dusty mystery
    droneFreqs: [82, 123, 165],
    droneVolume: 0.02,
    droneType: 'sine',
    accents: [
      // Floor creak
      { freq: 200, duration: 0.3, type: 'sawtooth', interval: [4000, 10000], volume: 0.015 },
      // Wind through cracks
      { freq: 600, duration: 1.2, type: 'sawtooth', interval: [3000, 7000], volume: 0.01 },
      // Mysterious chime (music box)
      { freq: 1047, duration: 0.5, type: 'sine', interval: [6000, 12000], volume: 0.012, detune: 30 },
      // Settling dust/wood
      { freq: 150, duration: 0.08, type: 'square', interval: [5000, 15000], volume: 0.008 },
      // Distant scratching (spooky!)
      { freq: 3500, duration: 0.02, type: 'sawtooth', interval: [8000, 20000], volume: 0.005 },
    ],
    lfoRate: 0.15,
    lfoDepth: 8,
    filterFreq: 500,
    filterQ: 1.5,
    filterType: 'lowpass',
    useReverb: true,
    reverbTime: 3.5,
  },
  basement: {
    // Industrial workshop, pipes, mechanical, slightly echoey
    droneFreqs: [41, 62, 82],
    droneVolume: 0.025,
    droneType: 'sawtooth',
    accents: [
      // Pipe clank
      { freq: 300, duration: 0.1, type: 'square', interval: [5000, 12000], volume: 0.02 },
      // Furnace rumble
      { freq: 50, duration: 2, type: 'sawtooth', interval: [8000, 18000], volume: 0.015 },
      // Dripping water
      { freq: 1000, duration: 0.12, type: 'sine', interval: [3000, 7000], volume: 0.018, detune: 80 },
      // Electrical hum
      { freq: 60, duration: 0.5, type: 'sine', interval: [2000, 4000], volume: 0.01 },
      // Tool rattle
      { freq: 500, duration: 0.05, type: 'square', interval: [6000, 15000], volume: 0.012 },
    ],
    filterFreq: 350,
    filterQ: 0.8,
    filterType: 'lowpass',
    useReverb: true,
    reverbTime: 2.8,
  },
};

// Time-of-day modifiers for garden (bird/cricket swap)
const GARDEN_TIME_ACCENTS: Record<TimeOfDay, typeof SOUNDSCAPE_CONFIGS.garden.accents> = {
  morning: [
    // Bird chirps
    { freq: 2000, duration: 0.15, type: 'sine', interval: [1000, 3000], volume: 0.015, detune: 200 },
    { freq: 2500, duration: 0.1, type: 'sine', interval: [1500, 4000], volume: 0.012, detune: 300 },
    { freq: 1800, duration: 0.2, type: 'sine', interval: [2000, 5000], volume: 0.01 },
    // Wind
    { freq: 800, duration: 0.5, type: 'sawtooth', interval: [2000, 5000], volume: 0.008 },
  ],
  afternoon: [
    // Fewer birds, more wind
    { freq: 2200, duration: 0.12, type: 'sine', interval: [3000, 6000], volume: 0.01, detune: 150 },
    { freq: 900, duration: 0.6, type: 'sawtooth', interval: [1500, 4000], volume: 0.01 },
    { freq: 2800, duration: 0.08, type: 'sawtooth', interval: [1000, 3000], volume: 0.006 },
  ],
  evening: [
    // Crickets starting, last birds
    { freq: 4000, duration: 0.05, type: 'sine', interval: [500, 1500], volume: 0.008 },
    { freq: 2000, duration: 0.15, type: 'sine', interval: [4000, 8000], volume: 0.008, detune: 100 },
    { freq: 700, duration: 0.4, type: 'sawtooth', interval: [3000, 6000], volume: 0.008 },
  ],
  night: [
    // Full cricket choir, owl hoot
    { freq: 4500, duration: 0.03, type: 'sine', interval: [300, 800], volume: 0.01 },
    { freq: 4200, duration: 0.04, type: 'sine', interval: [400, 1000], volume: 0.008 },
    { freq: 300, duration: 0.8, type: 'sine', interval: [8000, 15000], volume: 0.015 }, // Owl
    { freq: 600, duration: 0.3, type: 'sawtooth', interval: [4000, 8000], volume: 0.006 }, // Wind
  ],
};

export function useAmbientSoundscapes({
  currentRoom,
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
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    return impulse;
  }, []);

  // Play an accent sound
  const playAccent = useCallback((
    ctx: AudioContext,
    masterGain: GainNode,
    accent: SoundscapeConfig['accents'][0],
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
    
    const vol = accent.volume * baseVolume;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + accent.duration);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + accent.duration + 0.05);
  }, []);

  // Schedule accent sounds
  const scheduleAccents = useCallback((
    ctx: AudioContext,
    masterGain: GainNode,
    accents: SoundscapeConfig['accents'],
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
    
    if (gainNode) {
      gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current?.currentTime || 0 + 0.5);
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

  // Start soundscape for current room
  const startSoundscape = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || isMuted) return;

    // Stop existing sounds
    stopAllSounds();

    // Get config for room
    let config = SOUNDSCAPE_CONFIGS[currentRoom];
    
    // Special handling for garden - swap accents based on time of day
    if (currentRoom === 'garden') {
      config = {
        ...config,
        accents: GARDEN_TIME_ACCENTS[timeOfDay],
      };
    }

    // Create master gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.5, ctx.currentTime); // Scale down for comfort
    masterGainRef.current = masterGain;

    // Create filter if specified
    let filterNode: BiquadFilterNode | null = null;
    if (config.filterFreq) {
      filterNode = ctx.createBiquadFilter();
      filterNode.type = config.filterType || 'lowpass';
      filterNode.frequency.setValueAtTime(config.filterFreq, ctx.currentTime);
      filterNode.Q.setValueAtTime(config.filterQ || 1, ctx.currentTime);
    }

    // Create reverb if specified
    let reverbNode: ConvolverNode | null = null;
    let reverbGain: GainNode | null = null;
    if (config.useReverb) {
      reverbNode = ctx.createConvolver();
      reverbNode.buffer = createReverbImpulse(ctx, config.reverbTime || 2);
      reverbGain = ctx.createGain();
      reverbGain.gain.setValueAtTime(0.3, ctx.currentTime);
    }

    // Create drone gain
    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0, ctx.currentTime);
    droneGain.gain.linearRampToValueAtTime(config.droneVolume, ctx.currentTime + 2); // Fade in

    // Create LFO for modulation
    let lfoOsc: OscillatorNode | null = null;
    let lfoGain: GainNode | null = null;
    if (config.lfoRate) {
      lfoOsc = ctx.createOscillator();
      lfoGain = ctx.createGain();
      lfoOsc.type = 'sine';
      lfoOsc.frequency.setValueAtTime(config.lfoRate, ctx.currentTime);
      lfoGain.gain.setValueAtTime(config.lfoDepth || 10, ctx.currentTime);
      lfoOsc.connect(lfoGain);
      lfoOsc.start();
    }

    // Create drone oscillators
    const oscillators: OscillatorNode[] = [];
    config.droneFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = config.droneType;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Add slight detuning for richness
      osc.detune.setValueAtTime((i - 1) * 5, ctx.currentTime);
      
      // Connect LFO to frequency for modulation
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
  }, [currentRoom, timeOfDay, isMuted, volume, getAudioContext, stopAllSounds, createReverbImpulse, scheduleAccents]);

  // Update volume
  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(
        isMuted ? 0 : volume * 0.5,
        audioContextRef.current.currentTime + 0.1
      );
    }
  }, [volume, isMuted]);

  // Start/restart soundscape when room or time changes
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
  }, [currentRoom, timeOfDay, isMuted, startSoundscape, stopAllSounds]);

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
  };
}

export default useAmbientSoundscapes;

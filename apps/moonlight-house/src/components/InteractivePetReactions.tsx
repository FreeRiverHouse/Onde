import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeartBubble {
  id: number;
  x: number;
  y: number;
  emoji: string;
  size: number;
  angle: number;
}

interface InteractivePetReactionsProps {
  onPet: () => void;           // Callback when Luna is petted (to trigger tail wag, etc.)
  onHappinessBoost?: () => void; // Callback for boosting happiness stat
  isEnabled?: boolean;          // Whether petting is currently allowed
  soundEnabled?: boolean;       // Whether to play sounds
  children: React.ReactNode;    // Luna sprite to wrap
}

// Heart emoji variations
const HEART_EMOJIS = ['❤️', '💕', '💖', '💗', '💓', '💞', '🩷', '✨'];

// Pet sound frequencies for Web Audio purr
const PURR_FREQUENCIES = [85, 90, 95, 100, 105]; // Low rumble sounds

/**
 * Interactive pet reactions for Luna!
 * Wrap Luna with this component to add tap-to-pet functionality.
 * 
 * Task T878 - Moonlight Magic House Evolution
 * Heart bubbles, purr animation, and happy sounds when tapped!
 */
export default function InteractivePetReactions({
  onPet,
  onHappinessBoost,
  isEnabled = true,
  soundEnabled = true,
  children,
}: InteractivePetReactionsProps) {
  const [hearts, setHearts] = useState<HeartBubble[]>([]);
  const [isPurring, setIsPurring] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Initialize audio context on first interaction
  const initAudio = useCallback(() => {
    if (!audioContext && typeof window !== 'undefined') {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      return ctx;
    }
    return audioContext;
  }, [audioContext]);

  // Play purring sound using Web Audio API
  const playPurrSound = useCallback((ctx: AudioContext) => {
    if (!soundEnabled) return;
    
    const now = ctx.currentTime;
    const duration = 0.3;
    
    // Create a low rumbling purr
    PURR_FREQUENCIES.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + Math.random() * 10, now);
      osc.frequency.linearRampToValueAtTime(freq - 5 + Math.random() * 10, now + duration);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 0.05);
      gain.gain.linearRampToValueAtTime(0.02, now + duration * 0.7);
      gain.gain.linearRampToValueAtTime(0, now + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + i * 0.02);
      osc.stop(now + duration + i * 0.02);
    });
    
    // Add a soft "mew" at the end
    setTimeout(() => {
      if (Math.random() > 0.5) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(350, ctx.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.03);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    }, 200);
  }, [soundEnabled]);

  // Spawn heart bubbles around tap location
  const spawnHearts = useCallback((clickX: number, clickY: number) => {
    const numHearts = 3 + Math.floor(Math.random() * 3); // 3-5 hearts
    const newHearts: HeartBubble[] = [];
    
    for (let i = 0; i < numHearts; i++) {
      newHearts.push({
        id: Date.now() + i + Math.random(),
        x: clickX + (Math.random() - 0.5) * 40,
        y: clickY + (Math.random() - 0.5) * 30,
        emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
        size: 0.8 + Math.random() * 0.6,
        angle: (Math.random() - 0.5) * 30,
      });
    }
    
    setHearts(prev => [...prev, ...newHearts].slice(-20)); // Max 20 hearts
  }, []);

  // Handle tap/click on Luna
  const handlePet = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!isEnabled) return;
    
    event.stopPropagation();
    
    // Get tap position relative to the container
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    // Spawn hearts
    spawnHearts(x, y);
    
    // Trigger purr animation
    setIsPurring(true);
    setTimeout(() => setIsPurring(false), 500);
    
    // Play sound
    const ctx = initAudio();
    if (ctx) {
      playPurrSound(ctx);
    }
    
    // Count taps for happiness boost
    setTapCount(prev => prev + 1);
    
    // Notify parent
    onPet();
  }, [isEnabled, spawnHearts, initAudio, playPurrSound, onPet]);

  // Boost happiness every 3 taps
  useEffect(() => {
    if (tapCount > 0 && tapCount % 3 === 0) {
      onHappinessBoost?.();
    }
  }, [tapCount, onHappinessBoost]);

  // Cleanup old hearts
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setHearts(prev => prev.filter(h => now - h.id < 1500));
    }, 500);
    return () => clearInterval(cleanup);
  }, []);

  // Purr animation variants (subtle body shake)
  const purrVariants = {
    idle: {
      scale: 1,
      rotate: 0,
    },
    purring: {
      scale: [1, 1.02, 1, 1.02, 1],
      rotate: [0, -1, 0, 1, 0],
      transition: {
        duration: 0.4,
        ease: 'easeInOut' as const,
        times: [0, 0.25, 0.5, 0.75, 1],
      },
    },
  };

  return (
    <div 
      className="interactive-pet-container"
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor: isEnabled ? 'pointer' : 'default',
        touchAction: 'manipulation',
      }}
      onClick={handlePet}
      onTouchStart={handlePet}
    >
      {/* Luna with purr animation */}
      <motion.div
        variants={purrVariants}
        animate={isPurring ? 'purring' : 'idle'}
        style={{ transformOrigin: 'center bottom' }}
      >
        {children}
      </motion.div>

      {/* Heart bubbles */}
      <AnimatePresence>
        {hearts.map(heart => (
          <motion.div
            key={heart.id}
            className="heart-bubble"
            initial={{
              opacity: 0,
              scale: 0.3,
              y: 0,
              rotate: heart.angle,
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.3, heart.size, heart.size * 1.1, heart.size * 0.8],
              y: -60 - Math.random() * 40,
              x: (Math.random() - 0.5) * 30,
              rotate: heart.angle + (Math.random() - 0.5) * 20,
            }}
            exit={{
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: 1.2 + Math.random() * 0.3,
              ease: 'easeOut',
              times: [0, 0.2, 0.6, 1],
            }}
            style={{
              position: 'absolute',
              left: `${heart.x}%`,
              top: `${heart.y}%`,
              fontSize: `${16 + heart.size * 12}px`,
              pointerEvents: 'none',
              zIndex: 100,
              filter: 'drop-shadow(0 2px 4px rgba(255, 100, 150, 0.4))',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {heart.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Tap indicator when purring */}
      <AnimatePresence>
        {isPurring && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '-10%',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '1.2rem',
              pointerEvents: 'none',
              zIndex: 101,
            }}
          >
            😻
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DustPuff {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  type: 'dust' | 'grass' | 'sparkle';
}

type SurfaceType = 'floor' | 'grass' | 'stone' | 'water';

interface FootstepDustPuffsProps {
  isMoving: boolean;
  x: number;            // Luna's X position (%)
  y: number;            // Luna's Y position (%)
  facingDirection: 'left' | 'right';
  surfaceType?: SurfaceType;
}

// Surface-specific particle configs
const SURFACE_CONFIG: Record<SurfaceType, { colors: string[]; emoji: string[]; type: DustPuff['type'] }> = {
  floor: {
    colors: ['rgba(139, 119, 101, 0.6)', 'rgba(169, 149, 131, 0.5)', 'rgba(189, 169, 151, 0.4)'],
    emoji: ['💨', '☁️'],
    type: 'dust',
  },
  grass: {
    colors: ['rgba(76, 175, 80, 0.5)', 'rgba(102, 187, 106, 0.4)', 'rgba(129, 199, 132, 0.3)'],
    emoji: ['🌿', '🍃', '✨'],
    type: 'grass',
  },
  stone: {
    colors: ['rgba(158, 158, 158, 0.5)', 'rgba(189, 189, 189, 0.4)', 'rgba(117, 117, 117, 0.5)'],
    emoji: ['💨', '✨'],
    type: 'dust',
  },
  water: {
    colors: ['rgba(100, 181, 246, 0.5)', 'rgba(129, 212, 250, 0.4)', 'rgba(79, 195, 247, 0.3)'],
    emoji: ['💧', '💦', '✨'],
    type: 'sparkle',
  },
};

const MAX_PUFFS = 8;
const SPAWN_THROTTLE_MS = 150; // One puff per 150ms

/**
 * Footstep dust puffs for Luna when walking!
 * Different effects based on surface type.
 * Task T877 - Moonlight Magic House Evolution
 */
export default function FootstepDustPuffs({ 
  isMoving, 
  x, 
  y, 
  facingDirection,
  surfaceType = 'floor' 
}: FootstepDustPuffsProps) {
  const [puffs, setPuffs] = useState<DustPuff[]>([]);
  const [lastSpawnTime, setLastSpawnTime] = useState(0);
  
  const config = SURFACE_CONFIG[surfaceType];

  const spawnPuff = useCallback(() => {
    const now = Date.now();
    if (now - lastSpawnTime < SPAWN_THROTTLE_MS) return;
    setLastSpawnTime(now);
    
    // Spawn at Luna's feet (slightly behind based on direction)
    const offsetX = facingDirection === 'right' ? -3 : 3;
    const feetY = y + 8; // Position at feet level
    
    const newPuff: DustPuff = {
      id: now + Math.random(),
      x: x + offsetX + (Math.random() - 0.5) * 4,
      y: feetY + Math.random() * 2,
      size: 0.5 + Math.random() * 0.5,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      opacity: 0.5 + Math.random() * 0.3,
      type: config.type,
    };
    
    setPuffs(prev => {
      const updated = [...prev, newPuff];
      return updated.slice(-MAX_PUFFS);
    });
  }, [x, y, facingDirection, lastSpawnTime, config]);

  // Spawn puffs while moving
  useEffect(() => {
    if (!isMoving) return;
    
    spawnPuff();
    const interval = setInterval(spawnPuff, SPAWN_THROTTLE_MS);
    return () => clearInterval(interval);
  }, [isMoving, spawnPuff]);

  // Cleanup old puffs
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setPuffs(prev => prev.filter(p => now - p.id < 800));
    }, 300);
    return () => clearInterval(cleanup);
  }, []);

  // Get emoji for occasional particle
  const getEmoji = () => {
    if (Math.random() > 0.3) return null;
    return config.emoji[Math.floor(Math.random() * config.emoji.length)];
  };

  return (
    <div className="footstep-dust-puffs" style={{ pointerEvents: 'none' }}>
      <AnimatePresence>
        {puffs.map(puff => {
          const emoji = getEmoji();
          
          return (
            <motion.div
              key={puff.id}
              className="dust-puff"
              initial={{
                opacity: puff.opacity,
                scale: 0.3,
                x: 0,
                y: 0,
              }}
              animate={{
                opacity: 0,
                scale: puff.size * 1.8,
                y: puff.type === 'grass' ? -15 : -8,
                x: (Math.random() - 0.5) * 15,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 0.4 + Math.random() * 0.2,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                left: `${puff.x}%`,
                top: `${puff.y}%`,
                zIndex: 45,
              }}
            >
              {/* Dust cloud circle */}
              <div
                style={{
                  width: `${20 + puff.size * 15}px`,
                  height: `${15 + puff.size * 10}px`,
                  borderRadius: '50%',
                  backgroundColor: puff.color,
                  filter: `blur(${2 + puff.size * 2}px)`,
                }}
              />
              
              {/* Occasional emoji particle */}
              {emoji && (
                <motion.span
                  initial={{ opacity: 0.8, scale: 0.6, y: 0 }}
                  animate={{ opacity: 0, scale: 1, y: -20 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px',
                  }}
                >
                  {emoji}
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

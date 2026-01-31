import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  scale: number;
  duration: number;
}

interface MovementParticlesProps {
  isMoving: boolean;
  x: number;
  y: number;
  facingDirection: 'left' | 'right';
}

const PARTICLE_EMOJIS = ['✨', '⭐', '💫', '🌟'];
const MAX_PARTICLES = 12;

export default function MovementParticles({ isMoving, x, y, facingDirection }: MovementParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [lastSpawnTime, setLastSpawnTime] = useState(0);

  const spawnParticle = useCallback(() => {
    const now = Date.now();
    // Throttle: spawn max every 80ms
    if (now - lastSpawnTime < 80) return;
    setLastSpawnTime(now);

    const offsetX = facingDirection === 'right' ? -8 : 8; // Behind Luna
    const newParticle: Particle = {
      id: now + Math.random(),
      x: x + offsetX + (Math.random() - 0.5) * 10,
      y: y + 5 + Math.random() * 5,
      emoji: PARTICLE_EMOJIS[Math.floor(Math.random() * PARTICLE_EMOJIS.length)],
      scale: 0.6 + Math.random() * 0.6,
      duration: 0.6 + Math.random() * 0.4,
    };

    setParticles(prev => {
      const updated = [...prev, newParticle];
      // Keep only last MAX_PARTICLES
      return updated.slice(-MAX_PARTICLES);
    });
  }, [x, y, facingDirection, lastSpawnTime]);

  // Spawn particles when moving
  useEffect(() => {
    if (!isMoving) return;
    
    spawnParticle();
    const interval = setInterval(spawnParticle, 100);
    return () => clearInterval(interval);
  }, [isMoving, spawnParticle]);

  // Cleanup old particles
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setParticles(prev => prev.filter(p => now - p.id < 1500));
    }, 500);
    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="movement-particles" style={{ pointerEvents: 'none' }}>
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="movement-particle"
            initial={{ 
              opacity: 1, 
              scale: particle.scale,
              x: 0,
              y: 0,
            }}
            animate={{ 
              opacity: 0, 
              scale: 0,
              y: -30,
              x: (Math.random() - 0.5) * 20,
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: particle.duration,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              fontSize: `${12 + particle.scale * 8}px`,
              filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))',
              zIndex: 50,
            }}
          >
            {particle.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

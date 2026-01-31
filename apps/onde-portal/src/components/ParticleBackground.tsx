'use client';

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';

// ============================================
// TYPES
// ============================================

export type ParticleTheme = 
  | 'ocean'     // Floating bubbles, soft blue/teal
  | 'stars'     // Twinkling stars, white/gold
  | 'fireflies' // Glowing orbs, warm gold/green
  | 'aurora'    // Flowing northern lights, multicolor
  | 'snow'      // Gentle falling snow
  | 'cosmic';   // Deep space with nebula colors

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  twinklePhase: number;
  twinkleSpeed: number;
  life: number;
  maxLife: number;
}

interface ParticleBackgroundProps {
  theme?: ParticleTheme;
  particleCount?: number;
  interactive?: boolean;
  speed?: number;
  opacity?: number;
  className?: string;
  respectReduceMotion?: boolean;
}

// ============================================
// THEME CONFIGURATIONS
// ============================================

interface ThemeConfig {
  colors: string[];
  sizeRange: [number, number];
  opacityRange: [number, number];
  speedRange: [number, number];
  twinkle: boolean;
  glow: boolean;
  glowIntensity: number;
  drift: 'up' | 'down' | 'float' | 'random';
  connectionLines: boolean;
  connectionDistance: number;
  connectionOpacity: number;
}

const THEME_CONFIGS: Record<ParticleTheme, ThemeConfig> = {
  ocean: {
    colors: ['#5B9AA0', '#7EB8C4', '#26619C', '#4A7C9B', '#A5D4DC'],
    sizeRange: [2, 6],
    opacityRange: [0.3, 0.7],
    speedRange: [0.2, 0.8],
    twinkle: true,
    glow: true,
    glowIntensity: 10,
    drift: 'up',
    connectionLines: false,
    connectionDistance: 0,
    connectionOpacity: 0,
  },
  stars: {
    colors: ['#FFFFFF', '#FFE5B4', '#D4AF37', '#E5C158', '#FFF8DC'],
    sizeRange: [1, 3],
    opacityRange: [0.4, 1.0],
    speedRange: [0.05, 0.2],
    twinkle: true,
    glow: true,
    glowIntensity: 15,
    drift: 'float',
    connectionLines: true,
    connectionDistance: 120,
    connectionOpacity: 0.15,
  },
  fireflies: {
    colors: ['#D4AF37', '#90EE90', '#FFD700', '#ADFF2F', '#F0E68C'],
    sizeRange: [2, 5],
    opacityRange: [0.2, 0.9],
    speedRange: [0.3, 1.0],
    twinkle: true,
    glow: true,
    glowIntensity: 20,
    drift: 'random',
    connectionLines: false,
    connectionDistance: 0,
    connectionOpacity: 0,
  },
  aurora: {
    colors: ['#00FF88', '#00BFFF', '#8A2BE2', '#FF69B4', '#00CED1'],
    sizeRange: [3, 8],
    opacityRange: [0.15, 0.4],
    speedRange: [0.1, 0.4],
    twinkle: false,
    glow: true,
    glowIntensity: 30,
    drift: 'float',
    connectionLines: true,
    connectionDistance: 200,
    connectionOpacity: 0.1,
  },
  snow: {
    colors: ['#FFFFFF', '#F0F8FF', '#E6E6FA', '#F5F5F5'],
    sizeRange: [2, 5],
    opacityRange: [0.5, 0.9],
    speedRange: [0.5, 1.5],
    twinkle: false,
    glow: false,
    glowIntensity: 0,
    drift: 'down',
    connectionLines: false,
    connectionDistance: 0,
    connectionOpacity: 0,
  },
  cosmic: {
    colors: ['#4A7C9B', '#26619C', '#8B5CF6', '#D946EF', '#0EA5E9'],
    sizeRange: [1, 4],
    opacityRange: [0.3, 0.8],
    speedRange: [0.1, 0.5],
    twinkle: true,
    glow: true,
    glowIntensity: 12,
    drift: 'float',
    connectionLines: true,
    connectionDistance: 150,
    connectionOpacity: 0.12,
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 255, b: 255 };
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// ============================================
// PARTICLE CREATION
// ============================================

function createParticle(
  width: number,
  height: number,
  config: ThemeConfig,
  speedMultiplier: number
): Particle {
  const size = randomInRange(config.sizeRange[0], config.sizeRange[1]);
  const speed = randomInRange(config.speedRange[0], config.speedRange[1]) * speedMultiplier;
  
  let vx = 0;
  let vy = 0;
  
  switch (config.drift) {
    case 'up':
      vx = randomInRange(-0.2, 0.2) * speed;
      vy = -randomInRange(0.3, 1) * speed;
      break;
    case 'down':
      vx = randomInRange(-0.3, 0.3) * speed;
      vy = randomInRange(0.5, 1) * speed;
      break;
    case 'float':
      vx = randomInRange(-0.5, 0.5) * speed;
      vy = randomInRange(-0.5, 0.5) * speed;
      break;
    case 'random':
      const angle = Math.random() * Math.PI * 2;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
      break;
  }
  
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx,
    vy,
    size,
    opacity: randomInRange(config.opacityRange[0], config.opacityRange[1]),
    color: randomFromArray(config.colors),
    twinklePhase: Math.random() * Math.PI * 2,
    twinkleSpeed: randomInRange(0.02, 0.05),
    life: 0,
    maxLife: randomInRange(200, 500),
  };
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ParticleBackground({
  theme = 'ocean',
  particleCount = 50,
  interactive = true,
  speed = 1,
  opacity = 1,
  className = '',
  respectReduceMotion = true,
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [reduceMotion, setReduceMotion] = useState(false);

  const config = useMemo(() => THEME_CONFIGS[theme], [theme]);

  // Check for reduce motion preference
  useEffect(() => {
    if (!respectReduceMotion) return;

    const checkMotion = () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      const bodyHasReduceMotion = document.body.classList.contains('reduce-motion');
      setReduceMotion(prefersReducedMotion || bodyHasReduceMotion);
    };

    checkMotion();

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', checkMotion);

    // Watch for class changes on body
    const observer = new MutationObserver(checkMotion);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      mediaQuery.removeEventListener('change', checkMotion);
      observer.disconnect();
    };
  }, [respectReduceMotion]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize particles
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    particlesRef.current = Array.from({ length: particleCount }, () =>
      createParticle(dimensions.width, dimensions.height, config, speed)
    );
  }, [dimensions, particleCount, config, speed]);

  // Mouse handlers
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!interactive || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    },
    [interactive]
  );

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.active = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  // Animation loop
  useEffect(() => {
    if (reduceMotion || dimensions.width === 0 || dimensions.height === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Set canvas resolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    let frameCount = 0;

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      frameCount++;

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Draw connection lines first (behind particles)
      if (config.connectionLines) {
        ctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dist = distance(
              particles[i].x,
              particles[i].y,
              particles[j].x,
              particles[j].y
            );
            if (dist < config.connectionDistance) {
              const lineOpacity =
                (1 - dist / config.connectionDistance) *
                config.connectionOpacity *
                opacity *
                Math.min(particles[i].opacity, particles[j].opacity);
              ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
            }
          }
        }
        ctx.stroke();
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update life
        p.life++;

        // Twinkle effect
        if (config.twinkle) {
          p.twinklePhase += p.twinkleSpeed;
          const twinkleFactor = 0.5 + 0.5 * Math.sin(p.twinklePhase);
          p.opacity =
            config.opacityRange[0] +
            twinkleFactor * (config.opacityRange[1] - config.opacityRange[0]);
        }

        // Mouse interaction - particles move away from cursor
        if (mouse.active && interactive) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 100;

          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 2;
            p.vx += (dx / dist) * force * 0.1;
            p.vy += (dy / dist) * force * 0.1;
          }
        }

        // Apply velocity with damping
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Gradually restore original velocity for drift
        const targetSpeed = randomInRange(config.speedRange[0], config.speedRange[1]) * speed * 0.01;
        switch (config.drift) {
          case 'up':
            p.vy = p.vy * 0.99 + (-targetSpeed) * 0.01;
            break;
          case 'down':
            p.vy = p.vy * 0.99 + targetSpeed * 0.01;
            break;
          case 'float':
            // Add subtle oscillation
            p.vx += Math.sin(frameCount * 0.01 + i) * 0.002;
            p.vy += Math.cos(frameCount * 0.01 + i) * 0.002;
            break;
        }

        // Wrap around edges
        if (p.x < -10) p.x = dimensions.width + 10;
        if (p.x > dimensions.width + 10) p.x = -10;
        if (p.y < -10) p.y = dimensions.height + 10;
        if (p.y > dimensions.height + 10) p.y = -10;

        // Draw particle
        const { r, g, b } = hexToRgb(p.color);
        const particleOpacity = p.opacity * opacity;

        // Glow effect
        if (config.glow && config.glowIntensity > 0) {
          const gradient = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.size * 3 + config.glowIntensity
          );
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${particleOpacity * 0.4})`);
          gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${particleOpacity * 0.1})`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          ctx.beginPath();
          ctx.fillStyle = gradient;
          ctx.arc(p.x, p.y, p.size * 3 + config.glowIntensity, 0, Math.PI * 2);
          ctx.fill();
        }

        // Core particle
        ctx.beginPath();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particleOpacity})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, config, speed, opacity, interactive, reduceMotion]);

  // Static fallback for reduce motion
  if (reduceMotion) {
    return (
      <div
        className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
        aria-hidden="true"
      >
        {/* Static subtle gradient instead of particles */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, ${config.colors[0]}15 0%, transparent 50%),
                        radial-gradient(ellipse at 70% 80%, ${config.colors[1]}10 0%, transparent 50%),
                        radial-gradient(ellipse at 50% 50%, ${config.colors[2]}08 0%, transparent 60%)`,
            opacity: opacity,
          }}
        />
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        width: '100%',
        height: '100%',
      }}
      aria-hidden="true"
    />
  );
}

// ============================================
// PRESET COMPONENTS FOR CONVENIENCE
// ============================================

export function OceanParticles(props: Omit<ParticleBackgroundProps, 'theme'>) {
  return <ParticleBackground theme="ocean" {...props} />;
}

export function StarParticles(props: Omit<ParticleBackgroundProps, 'theme'>) {
  return <ParticleBackground theme="stars" {...props} />;
}

export function FireflyParticles(props: Omit<ParticleBackgroundProps, 'theme'>) {
  return <ParticleBackground theme="fireflies" {...props} />;
}

export function AuroraParticles(props: Omit<ParticleBackgroundProps, 'theme'>) {
  return <ParticleBackground theme="aurora" particleCount={30} {...props} />;
}

export function SnowParticles(props: Omit<ParticleBackgroundProps, 'theme'>) {
  return <ParticleBackground theme="snow" {...props} />;
}

export function CosmicParticles(props: Omit<ParticleBackgroundProps, 'theme'>) {
  return <ParticleBackground theme="cosmic" {...props} />;
}

// ============================================
// PAGE-SPECIFIC BACKGROUNDS
// ============================================

/**
 * Use these for different sections of the portal:
 * - HomeBackground: Ocean bubbles rising gently
 * - GamesBackground: Stars twinkling in space
 * - ShopBackground: Fireflies in a forest
 * - ProfileBackground: Aurora for personalization
 * - ClassicsBackground: Snow for elegant feel
 */

export function HomeBackground() {
  return (
    <ParticleBackground
      theme="ocean"
      particleCount={40}
      speed={0.8}
      opacity={0.7}
      interactive
    />
  );
}

export function GamesBackground() {
  return (
    <ParticleBackground
      theme="stars"
      particleCount={60}
      speed={0.5}
      opacity={0.8}
      interactive
    />
  );
}

export function ShopBackground() {
  return (
    <ParticleBackground
      theme="fireflies"
      particleCount={35}
      speed={0.7}
      opacity={0.6}
      interactive
    />
  );
}

export function ProfileBackground() {
  return (
    <ParticleBackground
      theme="aurora"
      particleCount={25}
      speed={0.4}
      opacity={0.5}
      interactive
    />
  );
}

export function ClassicsBackground() {
  return (
    <ParticleBackground
      theme="snow"
      particleCount={45}
      speed={0.6}
      opacity={0.4}
      interactive={false}
    />
  );
}

export default ParticleBackground;

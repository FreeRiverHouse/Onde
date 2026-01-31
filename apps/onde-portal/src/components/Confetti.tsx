'use client';

import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';

// ============================================
// TYPES
// ============================================

export type ConfettiType = 'paper' | 'stars' | 'emojis' | 'mixed';

export type ColorTheme =
  | 'rainbow'      // Classic multicolor
  | 'gold'         // Celebration gold/yellow
  | 'party'        // Vibrant party colors
  | 'ocean'        // Blue/teal tones
  | 'sunset'       // Warm orange/pink
  | 'neon'         // Bright neon colors
  | 'pastel'       // Soft pastel colors
  | 'monochrome'   // Single color variants
  | 'custom';      // User-defined colors

export type ExplosionPattern =
  | 'burst'        // Central explosion outward
  | 'cannon'       // Shoots from bottom
  | 'rain'         // Falls from top
  | 'fireworks'    // Multiple burst points
  | 'sides'        // Shoots from both sides
  | 'fountain';    // Continuous upward spray

export interface ConfettiOptions {
  type?: ConfettiType;
  colorTheme?: ColorTheme;
  customColors?: string[];
  pattern?: ExplosionPattern;
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  duration?: number;
  origin?: { x: number; y: number };
  emojis?: string[];
  scalar?: number;
  shapes?: ('square' | 'circle' | 'star')[];
}

export interface ConfettiRef {
  fire: (options?: Partial<ConfettiOptions>) => void;
  burst: (x?: number, y?: number) => void;
  cannon: () => void;
  rain: () => void;
  fireworks: () => void;
  stop: () => void;
  reset: () => void;
}

interface ConfettiProps {
  /** Auto-fire on mount */
  autoFire?: boolean;
  /** Default options for all confetti */
  defaultOptions?: Partial<ConfettiOptions>;
  /** Z-index for the canvas */
  zIndex?: number;
  /** Respect user's reduce motion preference */
  respectReduceMotion?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Custom class name */
  className?: string;
}

// ============================================
// COLOR THEMES
// ============================================

const COLOR_THEMES: Record<Exclude<ColorTheme, 'custom'>, string[]> = {
  rainbow: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'],
  gold: ['#FFD700', '#FFC107', '#FFAB00', '#FF8F00', '#FFE082', '#FFD54F'],
  party: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'],
  ocean: ['#0077B6', '#00B4D8', '#48CAE4', '#90E0EF', '#ADE8F4', '#CAF0F8'],
  sunset: ['#FF6B6B', '#FF8E53', '#FFC93C', '#FF5E78', '#FF9A8B', '#FECFEF'],
  neon: ['#FF00FF', '#00FFFF', '#FF00AA', '#00FF00', '#FFFF00', '#FF6600'],
  pastel: ['#FFB5E8', '#B5DEFF', '#E7FFAC', '#FFF5BA', '#DCD3FF', '#AFF8DB'],
  monochrome: ['#2D3436', '#636E72', '#B2BEC3', '#DFE6E9', '#FFFFFF'],
};

const DEFAULT_EMOJIS = ['🎉', '✨', '🎊', '⭐', '🌟', '💫', '🎈', '🎁', '🥳', '🎯'];

// ============================================
// CONFETTI PARTICLE
// ============================================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  shape: 'square' | 'circle' | 'star' | 'emoji';
  emoji?: string;
  opacity: number;
  gravity: number;
  decay: number;
  drift: number;
  wobble: number;
  wobbleSpeed: number;
  life: number;
  scalar: number;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
): void {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }

  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

// ============================================
// MAIN COMPONENT
// ============================================

const Confetti = forwardRef<ConfettiRef, ConfettiProps>(
  (
    {
      autoFire = false,
      defaultOptions = {},
      zIndex = 9999,
      respectReduceMotion = true,
      onComplete,
      className,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const isRunningRef = useRef(false);
    const [isActive, setIsActive] = useState(false);

    // Check for reduced motion preference
    const prefersReducedMotion = useMemo(() => {
      if (typeof window === 'undefined') return false;
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }, []);

    const shouldAnimate = !respectReduceMotion || !prefersReducedMotion;

    // Merge options with defaults
    const mergeOptions = useCallback(
      (options?: Partial<ConfettiOptions>): Required<ConfettiOptions> => {
        return {
          type: options?.type ?? defaultOptions.type ?? 'paper',
          colorTheme: options?.colorTheme ?? defaultOptions.colorTheme ?? 'rainbow',
          customColors: options?.customColors ?? defaultOptions.customColors ?? [],
          pattern: options?.pattern ?? defaultOptions.pattern ?? 'burst',
          particleCount: options?.particleCount ?? defaultOptions.particleCount ?? 100,
          spread: options?.spread ?? defaultOptions.spread ?? 70,
          startVelocity: options?.startVelocity ?? defaultOptions.startVelocity ?? 30,
          decay: options?.decay ?? defaultOptions.decay ?? 0.95,
          gravity: options?.gravity ?? defaultOptions.gravity ?? 1,
          drift: options?.drift ?? defaultOptions.drift ?? 0,
          duration: options?.duration ?? defaultOptions.duration ?? 3000,
          origin: options?.origin ?? defaultOptions.origin ?? { x: 0.5, y: 0.5 },
          emojis: options?.emojis ?? defaultOptions.emojis ?? DEFAULT_EMOJIS,
          scalar: options?.scalar ?? defaultOptions.scalar ?? 1,
          shapes: options?.shapes ?? defaultOptions.shapes ?? ['square', 'circle'],
        };
      },
      [defaultOptions]
    );

    // Get colors based on theme
    const getColors = useCallback(
      (theme: ColorTheme, customColors: string[]): string[] => {
        if (theme === 'custom' && customColors.length > 0) {
          return customColors;
        }
        return COLOR_THEMES[theme as Exclude<ColorTheme, 'custom'>] || COLOR_THEMES.rainbow;
      },
      []
    );

    // Create a single particle
    const createParticle = useCallback(
      (
        x: number,
        y: number,
        angle: number,
        velocity: number,
        options: Required<ConfettiOptions>
      ): Particle => {
        const colors = getColors(options.colorTheme, options.customColors);
        const color = randomChoice(colors);
        
        // Determine shape based on type
        let shape: 'square' | 'circle' | 'star' | 'emoji';
        let emoji: string | undefined;
        
        if (options.type === 'emojis') {
          shape = 'emoji';
          emoji = randomChoice(options.emojis);
        } else if (options.type === 'stars') {
          shape = 'star';
        } else if (options.type === 'mixed') {
          const allShapes: ('square' | 'circle' | 'star' | 'emoji')[] = [
            ...options.shapes,
            'star',
            'emoji',
          ];
          shape = randomChoice(allShapes);
          if (shape === 'emoji') {
            emoji = randomChoice(options.emojis);
          }
        } else {
          shape = randomChoice(options.shapes);
        }

        const size = randomInRange(8, 14) * options.scalar;
        const angleRad = (angle * Math.PI) / 180;

        return {
          x,
          y,
          vx: Math.cos(angleRad) * velocity * randomInRange(0.5, 1),
          vy: Math.sin(angleRad) * velocity * randomInRange(0.5, 1),
          width: shape === 'circle' ? size : randomInRange(size * 0.5, size),
          height: shape === 'circle' ? size : randomInRange(size * 0.8, size * 1.2),
          rotation: randomInRange(0, 360),
          rotationSpeed: randomInRange(-15, 15),
          color,
          shape,
          emoji,
          opacity: 1,
          gravity: options.gravity * 0.1,
          decay: options.decay,
          drift: options.drift * randomInRange(-1, 1),
          wobble: randomInRange(0, 10),
          wobbleSpeed: randomInRange(0.1, 0.3),
          life: 1,
          scalar: options.scalar,
        };
      },
      [getColors]
    );

    // Create particles for different patterns
    const createParticles = useCallback(
      (options: Required<ConfettiOptions>): Particle[] => {
        const canvas = canvasRef.current;
        if (!canvas) return [];

        const particles: Particle[] = [];
        const { pattern, particleCount, spread, startVelocity, origin } = options;

        const originX = canvas.width * origin.x;
        const originY = canvas.height * origin.y;

        switch (pattern) {
          case 'burst': {
            for (let i = 0; i < particleCount; i++) {
              const angle = randomInRange(-90 - spread / 2, -90 + spread / 2);
              particles.push(
                createParticle(originX, originY, angle, startVelocity, options)
              );
            }
            break;
          }

          case 'cannon': {
            const cannonX = canvas.width * origin.x;
            const cannonY = canvas.height;
            for (let i = 0; i < particleCount; i++) {
              const angle = randomInRange(-90 - spread / 2, -90 + spread / 2);
              particles.push(
                createParticle(cannonX, cannonY, angle, startVelocity * 1.5, options)
              );
            }
            break;
          }

          case 'rain': {
            for (let i = 0; i < particleCount; i++) {
              const x = randomInRange(0, canvas.width);
              const y = randomInRange(-50, -10);
              const angle = randomInRange(85, 95);
              particles.push(createParticle(x, y, angle, startVelocity * 0.3, options));
            }
            break;
          }

          case 'fireworks': {
            const burstPoints = 5;
            const perBurst = Math.floor(particleCount / burstPoints);
            for (let b = 0; b < burstPoints; b++) {
              const bx = randomInRange(canvas.width * 0.2, canvas.width * 0.8);
              const by = randomInRange(canvas.height * 0.2, canvas.height * 0.5);
              for (let i = 0; i < perBurst; i++) {
                const angle = randomInRange(0, 360);
                particles.push(
                  createParticle(bx, by, angle, startVelocity * 0.8, options)
                );
              }
            }
            break;
          }

          case 'sides': {
            const half = Math.floor(particleCount / 2);
            // Left side
            for (let i = 0; i < half; i++) {
              const angle = randomInRange(-45, 45);
              particles.push(
                createParticle(0, canvas.height * 0.5, angle, startVelocity, options)
              );
            }
            // Right side
            for (let i = 0; i < half; i++) {
              const angle = randomInRange(135, 225);
              particles.push(
                createParticle(
                  canvas.width,
                  canvas.height * 0.5,
                  angle,
                  startVelocity,
                  options
                )
              );
            }
            break;
          }

          case 'fountain': {
            const centerX = canvas.width * origin.x;
            const bottomY = canvas.height;
            for (let i = 0; i < particleCount; i++) {
              const angle = randomInRange(-120, -60);
              const x = centerX + randomInRange(-30, 30);
              particles.push(
                createParticle(x, bottomY, angle, startVelocity * 1.2, options)
              );
            }
            break;
          }

          default:
            break;
        }

        return particles;
      },
      [createParticle]
    );

    // Draw a single particle
    const drawParticle = useCallback(
      (ctx: CanvasRenderingContext2D, particle: Particle) => {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.globalAlpha = particle.opacity * particle.life;

        const halfW = particle.width / 2;
        const halfH = particle.height / 2;

        switch (particle.shape) {
          case 'square':
            ctx.fillStyle = particle.color;
            ctx.fillRect(-halfW, -halfH, particle.width, particle.height);
            break;

          case 'circle':
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, halfW, halfH, 0, 0, Math.PI * 2);
            ctx.fill();
            break;

          case 'star':
            ctx.fillStyle = particle.color;
            drawStar(ctx, 0, 0, 5, halfW, halfW * 0.4);
            ctx.fill();
            break;

          case 'emoji':
            if (particle.emoji) {
              ctx.font = `${particle.width * 1.5}px Arial`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(particle.emoji, 0, 0);
            }
            break;
        }

        ctx.restore();
      },
      []
    );

    // Update particle physics
    const updateParticle = useCallback((particle: Particle, deltaTime: number) => {
      const dt = deltaTime / 16.67; // Normalize to 60fps

      // Apply velocity
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      // Apply gravity
      particle.vy += particle.gravity * dt;

      // Apply drift/wind
      particle.vx += particle.drift * 0.01 * dt;

      // Apply decay
      particle.vx *= particle.decay;
      particle.vy *= particle.decay;

      // Wobble effect
      particle.wobble += particle.wobbleSpeed * dt;
      particle.x += Math.sin(particle.wobble) * 0.5;

      // Rotation
      particle.rotation += particle.rotationSpeed * dt;

      // Life decay
      particle.life -= 0.005 * dt;

      return particle.life > 0;
    }, []);

    // Main animation loop
    const animate = useCallback(
      (lastTime: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !isRunningRef.current) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particlesRef.current = particlesRef.current.filter((particle) => {
          const alive = updateParticle(particle, deltaTime);
          if (alive) {
            drawParticle(ctx, particle);
          }
          return alive;
        });

        // Continue animation if particles exist
        if (particlesRef.current.length > 0) {
          animationRef.current = requestAnimationFrame(() => animate(currentTime));
        } else {
          isRunningRef.current = false;
          setIsActive(false);
          onComplete?.();
        }
      },
      [updateParticle, drawParticle, onComplete]
    );

    // Fire confetti
    const fire = useCallback(
      (options?: Partial<ConfettiOptions>) => {
        if (!shouldAnimate) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const mergedOptions = mergeOptions(options);
        const newParticles = createParticles(mergedOptions);

        particlesRef.current = [...particlesRef.current, ...newParticles];

        if (!isRunningRef.current) {
          isRunningRef.current = true;
          setIsActive(true);
          animationRef.current = requestAnimationFrame(() =>
            animate(performance.now())
          );
        }
      },
      [shouldAnimate, mergeOptions, createParticles, animate]
    );

    // Convenience methods
    const burst = useCallback(
      (x?: number, y?: number) => {
        fire({
          pattern: 'burst',
          origin: { x: x ?? 0.5, y: y ?? 0.5 },
        });
      },
      [fire]
    );

    const cannon = useCallback(() => {
      fire({ pattern: 'cannon' });
    }, [fire]);

    const rain = useCallback(() => {
      fire({ pattern: 'rain', particleCount: 150 });
    }, [fire]);

    const fireworks = useCallback(() => {
      fire({ pattern: 'fireworks', particleCount: 200 });
    }, [fire]);

    const stop = useCallback(() => {
      isRunningRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }, []);

    const reset = useCallback(() => {
      stop();
      particlesRef.current = [];
      setIsActive(false);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }, [stop]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        fire,
        burst,
        cannon,
        rain,
        fireworks,
        stop,
        reset,
      }),
      [fire, burst, cannon, rain, fireworks, stop, reset]
    );

    // Handle canvas resize
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const handleResize = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    // Auto-fire on mount
    useEffect(() => {
      if (autoFire && shouldAnimate) {
        const timer = setTimeout(() => fire(), 100);
        return () => clearTimeout(timer);
      }
    }, [autoFire, shouldAnimate, fire]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex,
          opacity: isActive ? 1 : 0,
          transition: 'opacity 0.3s ease-out',
        }}
        aria-hidden="true"
      />
    );
  }
);

Confetti.displayName = 'Confetti';

// ============================================
// HOOK FOR EASY ACCESS
// ============================================

export function useConfetti() {
  const confettiRef = useRef<ConfettiRef>(null);

  const fire = useCallback((options?: Partial<ConfettiOptions>) => {
    confettiRef.current?.fire(options);
  }, []);

  const burst = useCallback((x?: number, y?: number) => {
    confettiRef.current?.burst(x, y);
  }, []);

  const cannon = useCallback(() => {
    confettiRef.current?.cannon();
  }, []);

  const rain = useCallback(() => {
    confettiRef.current?.rain();
  }, []);

  const fireworks = useCallback(() => {
    confettiRef.current?.fireworks();
  }, []);

  const stop = useCallback(() => {
    confettiRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    confettiRef.current?.reset();
  }, []);

  const ConfettiComponent = useCallback(
    (props: Omit<ConfettiProps, 'ref'>) => <Confetti ref={confettiRef} {...props} />,
    []
  );

  return {
    Confetti: ConfettiComponent,
    ref: confettiRef,
    fire,
    burst,
    cannon,
    rain,
    fireworks,
    stop,
    reset,
  };
}

// ============================================
// PRESET CONFIGURATIONS
// ============================================

export const ConfettiPresets = {
  celebration: {
    type: 'mixed' as const,
    colorTheme: 'rainbow' as const,
    pattern: 'burst' as const,
    particleCount: 150,
    spread: 90,
    startVelocity: 35,
  },
  achievement: {
    type: 'stars' as const,
    colorTheme: 'gold' as const,
    pattern: 'fireworks' as const,
    particleCount: 200,
    spread: 360,
    startVelocity: 25,
  },
  party: {
    type: 'paper' as const,
    colorTheme: 'party' as const,
    pattern: 'sides' as const,
    particleCount: 100,
    spread: 60,
    startVelocity: 40,
  },
  gentle: {
    type: 'paper' as const,
    colorTheme: 'pastel' as const,
    pattern: 'rain' as const,
    particleCount: 80,
    gravity: 0.5,
    startVelocity: 10,
  },
  epic: {
    type: 'mixed' as const,
    colorTheme: 'neon' as const,
    pattern: 'fireworks' as const,
    particleCount: 300,
    spread: 360,
    startVelocity: 40,
  },
  emoji: {
    type: 'emojis' as const,
    pattern: 'fountain' as const,
    particleCount: 50,
    emojis: ['🎉', '🎊', '✨', '🌟', '🎈', '🥳'],
    startVelocity: 35,
    scalar: 1.2,
  },
};

export default Confetti;

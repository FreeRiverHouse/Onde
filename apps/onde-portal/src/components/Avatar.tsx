'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

// ============================================
// Avatar Configuration Types
// ============================================

interface AvatarConfig {
  bodyShape: string
  skinTone: string
  faceShape: string
  expression: string
  eyeStyle: string
  eyeColor: string
  hairStyle: string
  hairColor: string
  outfit: string
  outfitColor: string
  outfitSecondary: string
  accessory: string
  accessoryColor: string
  background: string
  backgroundSecondary: string
}

const DEFAULT_AVATAR: AvatarConfig = {
  bodyShape: 'round',
  skinTone: '#ffdfc4',
  faceShape: 'circle',
  expression: 'happy',
  eyeStyle: 'round',
  eyeColor: '#4a3728',
  hairStyle: 'short',
  hairColor: '#4a3728',
  outfit: 'tshirt',
  outfitColor: '#4dabf7',
  outfitSecondary: '#ffffff',
  accessory: 'none',
  accessoryColor: '#1a1a1a',
  background: 'gradient',
  backgroundSecondary: '#667eea',
}

const STORAGE_KEY = 'onde-avatar-config'

// Helper to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// ============================================
// Avatar SVG Component
// ============================================

function AvatarSVG({ config, size = 48 }: { config: AvatarConfig; size: number }) {
  // Background renderer
  const renderBackground = () => {
    switch (config.background) {
      case 'gradient':
        return (
          <defs>
            <linearGradient id={`bg-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.backgroundSecondary} />
              <stop offset="100%" stopColor={adjustColor(config.backgroundSecondary, -30)} />
            </linearGradient>
          </defs>
        )
      case 'stars':
        return (
          <>
            <defs>
              <linearGradient id={`bg-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a1a2e" />
                <stop offset="100%" stopColor="#16213e" />
              </linearGradient>
            </defs>
            {size > 32 && [...Array(6)].map((_, i) => (
              <circle
                key={i}
                cx={20 + (i * 30) % 160}
                cy={15 + (i * 25) % 170}
                r={1 + (i % 2)}
                fill="#ffd700"
                opacity={0.6}
              />
            ))}
          </>
        )
      case 'space':
        return (
          <>
            <defs>
              <radialGradient id={`bg-${size}`} cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="#1a1a2e" />
                <stop offset="100%" stopColor="#0f0f1a" />
              </radialGradient>
            </defs>
            {size > 32 && [...Array(8)].map((_, i) => (
              <circle
                key={i}
                cx={10 + (i * 25) % 180}
                cy={8 + (i * 20) % 185}
                r={0.5 + (i % 2) * 0.5}
                fill="#ffffff"
                opacity={0.5}
              />
            ))}
          </>
        )
      case 'rainbow':
        return (
          <defs>
            <linearGradient id={`bg-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="25%" stopColor="#ffd43b" />
              <stop offset="50%" stopColor="#69db7c" />
              <stop offset="75%" stopColor="#4dabf7" />
              <stop offset="100%" stopColor="#da77f2" />
            </linearGradient>
          </defs>
        )
      default:
        return (
          <defs>
            <linearGradient id={`bg-${size}`} x1="0%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={config.backgroundSecondary} />
            </linearGradient>
          </defs>
        )
    }
  }

  // Body shape path
  const getBodyPath = () => {
    switch (config.bodyShape) {
      case 'square':
        return 'M60,100 L60,160 Q60,180 80,180 L120,180 Q140,180 140,160 L140,100 Z'
      case 'tall':
        return 'M70,95 L65,165 Q65,185 85,185 L115,185 Q135,185 135,165 L130,95 Z'
      case 'wide':
        return 'M50,100 L45,155 Q45,180 75,180 L125,180 Q155,180 155,155 L150,100 Z'
      case 'blob':
        return 'M55,105 Q40,140 55,170 Q70,190 100,190 Q130,190 145,170 Q160,140 145,105 Z'
      default:
        return 'M65,100 Q55,150 70,175 Q85,195 100,195 Q115,195 130,175 Q145,150 135,100 Z'
    }
  }

  // Face shape
  const getFaceShape = () => {
    const cx = 100, cy = 70, r = 45
    switch (config.faceShape) {
      case 'oval':
        return <ellipse cx={cx} cy={cy} rx={r} ry={r * 1.15} fill={config.skinTone} />
      case 'square':
        return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx="10" fill={config.skinTone} />
      case 'heart':
        return (
          <path
            d={`M${cx},${cy + r * 0.9} 
                Q${cx - r},${cy + r * 0.3} ${cx - r * 0.8},${cy - r * 0.3}
                Q${cx - r * 0.6},${cy - r * 0.9} ${cx},${cy - r * 0.5}
                Q${cx + r * 0.6},${cy - r * 0.9} ${cx + r * 0.8},${cy - r * 0.3}
                Q${cx + r},${cy + r * 0.3} ${cx},${cy + r * 0.9}`}
            fill={config.skinTone}
          />
        )
      default:
        return <circle cx={cx} cy={cy} r={r} fill={config.skinTone} />
    }
  }

  // Simple eyes (optimized for small sizes)
  const renderEyes = () => {
    if (config.eyeStyle === 'heart') {
      return size > 32 ? (
        <>
          <text x="76" y="70" fontSize="14">💕</text>
          <text x="112" y="70" fontSize="14">💕</text>
        </>
      ) : null
    }
    
    return (
      <>
        <circle cx={82} cy={65} r={size > 32 ? 7 : 5} fill="white" />
        <circle cx={82} cy={65} r={size > 32 ? 4 : 3} fill={config.eyeColor} />
        <circle cx={118} cy={65} r={size > 32 ? 7 : 5} fill="white" />
        <circle cx={118} cy={65} r={size > 32 ? 4 : 3} fill={config.eyeColor} />
      </>
    )
  }

  // Simple mouth
  const renderMouth = () => {
    switch (config.expression) {
      case 'surprised':
        return <ellipse cx={100} cy={93} rx="6" ry="8" fill="#333" />
      case 'cool':
      case 'wink':
        return <path d="M88,90 Q100,95 112,90" stroke="#333" strokeWidth="2" fill="none" />
      default:
        return <path d="M88,90 Q100,102 112,90" stroke="#333" strokeWidth="2.5" fill="none" />
    }
  }

  // Hair (simplified for small sizes)
  const renderHair = () => {
    const color = config.hairColor
    switch (config.hairStyle) {
      case 'short':
        return <path d="M55,55 Q55,25 100,20 Q145,25 145,55 Q140,35 100,30 Q60,35 55,55" fill={color} />
      case 'medium':
      case 'long':
        return <path d="M50,70 Q45,30 100,18 Q155,30 150,70 Q145,40 100,28 Q55,40 50,70" fill={color} />
      case 'curly':
        return (
          <>
            <circle cx="60" cy="40" r="15" fill={color} />
            <circle cx="100" cy="28" r="14" fill={color} />
            <circle cx="140" cy="40" r="15" fill={color} />
          </>
        )
      case 'spiky':
        return <path d="M55,60 L65,20 L80,50 L100,10 L120,50 L135,20 L145,60 Q100,40 55,60" fill={color} />
      case 'afro':
        return <ellipse cx="100" cy="45" rx="55" ry="45" fill={color} />
      default:
        return null
    }
  }

  // Outfit (simplified)
  const renderOutfit = () => {
    const primary = config.outfitColor
    return <path d={getBodyPath()} fill={primary} />
  }

  // Accessory (simplified for small sizes)
  const renderAccessory = () => {
    if (size < 48) return null
    
    switch (config.accessory) {
      case 'glasses':
        return (
          <>
            <rect x="72" y="58" width="22" height="16" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="2" />
            <rect x="106" y="58" width="22" height="16" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="2" />
            <line x1="94" y1="66" x2="106" y2="66" stroke="#1a1a1a" strokeWidth="2" />
          </>
        )
      case 'crown':
        return <path d="M60,35 L70,10 L85,30 L100,5 L115,30 L130,10 L140,35 Z" fill="#ffd700" />
      case 'halo':
        return <ellipse cx="100" cy="15" rx="35" ry="8" fill="none" stroke="#ffd700" strokeWidth="4" opacity="0.8" />
      case 'hat':
        return (
          <>
            <ellipse cx="100" cy="30" rx="45" ry="8" fill={config.accessoryColor} />
            <path d="M55,30 Q55,5 100,0 Q145,5 145,30" fill={config.accessoryColor} />
          </>
        )
      default:
        return null
    }
  }

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ borderRadius: '50%', overflow: 'hidden' }}>
      {renderBackground()}
      <rect width="200" height="200" fill={`url(#bg-${size})`} />
      {renderOutfit()}
      {getFaceShape()}
      {renderEyes()}
      {renderMouth()}
      {renderHair()}
      {renderAccessory()}
    </svg>
  )
}

// ============================================
// Exported Avatar Component
// ============================================

interface AvatarProps {
  size?: number
  showLink?: boolean
  className?: string
}

export function Avatar({ size = 48, showLink = false, className = '' }: AvatarProps) {
  const [config, setConfig] = useState<AvatarConfig | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setConfig(JSON.parse(saved))
      } else {
        setConfig(DEFAULT_AVATAR)
      }
    } catch {
      setConfig(DEFAULT_AVATAR)
    }
    setMounted(true)
  }, [])

  if (!mounted || !config) {
    return (
      <div
        className={`rounded-full bg-gradient-to-br from-onde-teal to-cyan-500 animate-pulse ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  const avatar = <AvatarSVG config={config} size={size} />

  if (showLink) {
    return (
      <Link href="/avatar" className={`block hover:opacity-90 transition-opacity ${className}`}>
        {avatar}
      </Link>
    )
  }

  return <div className={className}>{avatar}</div>
}

// Hook to get avatar config
export function useAvatar() {
  const [config, setConfig] = useState<AvatarConfig | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const loadConfig = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          setConfig(JSON.parse(saved))
        } else {
          setConfig(DEFAULT_AVATAR)
        }
      } catch {
        setConfig(DEFAULT_AVATAR)
      }
    }

    loadConfig()
    setMounted(true)

    // Listen for storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadConfig()
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return { config, mounted }
}

export default Avatar

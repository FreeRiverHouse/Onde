'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

interface UnlockableItem {
  id: string
  name: string
  category: 'body' | 'face' | 'hair' | 'outfit' | 'accessory' | 'background'
  unlockType: 'free' | 'coins' | 'achievement'
  unlockCost?: number
  unlockAchievement?: string
  emoji: string
}

// ============================================
// Avatar Options Data
// ============================================

const BODY_SHAPES = [
  { id: 'round', name: 'Round', emoji: '🟢', free: true },
  { id: 'square', name: 'Square', emoji: '🟦', free: true },
  { id: 'tall', name: 'Tall', emoji: '📏', free: true },
  { id: 'wide', name: 'Wide', emoji: '↔️', free: false, cost: 50 },
  { id: 'blob', name: 'Blob', emoji: '🫠', free: false, cost: 100 },
]

const SKIN_TONES = [
  '#ffdfc4', '#f0c8a8', '#d4a76a', '#c4a57b', '#8d6e4c', '#5c4033',
  '#ffb6c1', '#98fb98', '#87ceeb', '#dda0dd', '#f0e68c', '#e6e6fa'
]

const FACE_SHAPES = [
  { id: 'circle', name: 'Circle', emoji: '⭕', free: true },
  { id: 'oval', name: 'Oval', emoji: '🥚', free: true },
  { id: 'square', name: 'Square', emoji: '⬜', free: true },
  { id: 'heart', name: 'Heart', emoji: '💜', free: false, cost: 75 },
  { id: 'star', name: 'Star', emoji: '⭐', free: false, achievement: 'five_books' },
]

const EXPRESSIONS = [
  { id: 'happy', name: 'Happy', emoji: '😊', free: true },
  { id: 'cool', name: 'Cool', emoji: '😎', free: true },
  { id: 'wink', name: 'Wink', emoji: '😉', free: true },
  { id: 'surprised', name: 'Surprised', emoji: '😮', free: true },
  { id: 'sleepy', name: 'Sleepy', emoji: '😴', free: false, cost: 25 },
  { id: 'love', name: 'Love', emoji: '😍', free: false, cost: 50 },
  { id: 'party', name: 'Party', emoji: '🥳', free: false, achievement: 'week_streak' },
  { id: 'nerd', name: 'Nerd', emoji: '🤓', free: false, achievement: 'first_book' },
]

const EYE_STYLES = [
  { id: 'round', name: 'Round', emoji: '👀', free: true },
  { id: 'almond', name: 'Almond', emoji: '👁️', free: true },
  { id: 'big', name: 'Big', emoji: '🔵', free: true },
  { id: 'sparkle', name: 'Sparkle', emoji: '✨', free: false, cost: 40 },
  { id: 'heart', name: 'Heart Eyes', emoji: '💕', free: false, cost: 60 },
  { id: 'star', name: 'Star Eyes', emoji: '🌟', free: false, achievement: 'five_favorites' },
]

const EYE_COLORS = [
  '#4a3728', '#2c1810', '#000000', '#1e90ff', '#32cd32', 
  '#9370db', '#ff69b4', '#ffd700', '#ff4500', '#00ced1'
]

const HAIR_STYLES = [
  { id: 'none', name: 'None', emoji: '🥚', free: true },
  { id: 'short', name: 'Short', emoji: '👦', free: true },
  { id: 'medium', name: 'Medium', emoji: '🧑', free: true },
  { id: 'long', name: 'Long', emoji: '👩', free: true },
  { id: 'curly', name: 'Curly', emoji: '🌀', free: true },
  { id: 'spiky', name: 'Spiky', emoji: '⚡', free: false, cost: 30 },
  { id: 'ponytail', name: 'Ponytail', emoji: '🎀', free: false, cost: 30 },
  { id: 'mohawk', name: 'Mohawk', emoji: '🦔', free: false, cost: 75 },
  { id: 'afro', name: 'Afro', emoji: '🌳', free: false, cost: 50 },
  { id: 'pigtails', name: 'Pigtails', emoji: '🎗️', free: false, cost: 40 },
]

const HAIR_COLORS = [
  '#1a1a1a', '#4a3728', '#8b4513', '#daa520', '#ffd700',
  '#ff6347', '#ff69b4', '#9370db', '#00ced1', '#32cd32'
]

const OUTFITS = [
  { id: 'tshirt', name: 'T-Shirt', emoji: '👕', free: true },
  { id: 'hoodie', name: 'Hoodie', emoji: '🧥', free: true },
  { id: 'dress', name: 'Dress', emoji: '👗', free: true },
  { id: 'suit', name: 'Suit', emoji: '🤵', free: false, cost: 100 },
  { id: 'superhero', name: 'Superhero', emoji: '🦸', free: false, cost: 150 },
  { id: 'wizard', name: 'Wizard', emoji: '🧙', free: false, achievement: 'first_complete' },
  { id: 'pirate', name: 'Pirate', emoji: '🏴‍☠️', free: false, cost: 120 },
  { id: 'astronaut', name: 'Astronaut', emoji: '👨‍🚀', free: false, achievement: 'five_games' },
  { id: 'knight', name: 'Knight', emoji: '⚔️', free: false, cost: 200 },
]

const OUTFIT_COLORS = [
  '#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#38d9a9',
  '#4dabf7', '#748ffc', '#da77f2', '#f783ac', '#ffffff',
  '#868e96', '#212529'
]

const ACCESSORIES = [
  { id: 'none', name: 'None', emoji: '❌', free: true },
  { id: 'glasses', name: 'Glasses', emoji: '👓', free: true },
  { id: 'sunglasses', name: 'Sunglasses', emoji: '🕶️', free: true },
  { id: 'hat', name: 'Cap', emoji: '🧢', free: true },
  { id: 'crown', name: 'Crown', emoji: '👑', free: false, cost: 200 },
  { id: 'halo', name: 'Halo', emoji: '😇', free: false, cost: 150 },
  { id: 'horns', name: 'Horns', emoji: '😈', free: false, cost: 100 },
  { id: 'headphones', name: 'Headphones', emoji: '🎧', free: false, cost: 80 },
  { id: 'bow', name: 'Bow', emoji: '🎀', free: false, cost: 50 },
  { id: 'wizard_hat', name: 'Wizard Hat', emoji: '🧙‍♂️', free: false, achievement: 'profile_setup' },
  { id: 'party_hat', name: 'Party Hat', emoji: '🥳', free: false, achievement: 'first_favorite' },
]

const BACKGROUNDS = [
  { id: 'solid', name: 'Solid', emoji: '⬜', free: true },
  { id: 'gradient', name: 'Gradient', emoji: '🌈', free: true },
  { id: 'stars', name: 'Stars', emoji: '⭐', free: true },
  { id: 'hearts', name: 'Hearts', emoji: '💕', free: false, cost: 50 },
  { id: 'sparkle', name: 'Sparkle', emoji: '✨', free: false, cost: 75 },
  { id: 'nature', name: 'Nature', emoji: '🌿', free: false, cost: 60 },
  { id: 'space', name: 'Space', emoji: '🌌', free: false, cost: 100 },
  { id: 'rainbow', name: 'Rainbow', emoji: '🌈', free: false, achievement: 'night_owl' },
]

const BACKGROUND_COLORS = [
  '#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a',
  '#fee140', '#30cfd0', '#a8edea', '#ffecd2', '#fcb69f'
]

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
const COINS_KEY = 'onde-coins'
const UNLOCKS_KEY = 'onde-avatar-unlocks'

// ============================================
// Avatar SVG Renderer Component
// ============================================

function AvatarPreview({ config, size = 200 }: { config: AvatarConfig; size?: number }) {
  const scale = size / 200

  // Background renderer
  const renderBackground = () => {
    switch (config.background) {
      case 'gradient':
        return (
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.backgroundSecondary} />
              <stop offset="100%" stopColor={adjustColor(config.backgroundSecondary, -30)} />
            </linearGradient>
          </defs>
        )
      case 'stars':
        return (
          <>
            <defs>
              <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a1a2e" />
                <stop offset="100%" stopColor="#16213e" />
              </linearGradient>
            </defs>
            {[...Array(12)].map((_, i) => (
              <circle
                key={i}
                cx={20 + (i * 17) % 160}
                cy={15 + (i * 23) % 170}
                r={1 + (i % 3)}
                fill="#ffd700"
                opacity={0.6 + (i % 4) * 0.1}
              />
            ))}
          </>
        )
      case 'hearts':
        return (
          <>
            <defs>
              <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffb6c1" />
                <stop offset="100%" stopColor="#ff69b4" />
              </linearGradient>
            </defs>
            {[...Array(8)].map((_, i) => (
              <text
                key={i}
                x={15 + (i * 25) % 170}
                y={20 + (i * 27) % 175}
                fontSize="12"
                opacity={0.3}
              >
                ❤️
              </text>
            ))}
          </>
        )
      case 'sparkle':
        return (
          <>
            <defs>
              <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffecd2" />
                <stop offset="100%" stopColor="#fcb69f" />
              </linearGradient>
            </defs>
            {[...Array(10)].map((_, i) => (
              <text
                key={i}
                x={10 + (i * 21) % 175}
                y={15 + (i * 19) % 180}
                fontSize="10"
                opacity={0.4}
              >
                ✨
              </text>
            ))}
          </>
        )
      case 'nature':
        return (
          <>
            <defs>
              <linearGradient id="bgGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#56ab2f" />
                <stop offset="100%" stopColor="#a8e063" />
              </linearGradient>
            </defs>
            {[...Array(6)].map((_, i) => (
              <text
                key={i}
                x={5 + i * 35}
                y={185}
                fontSize="16"
                opacity={0.5}
              >
                🌿
              </text>
            ))}
          </>
        )
      case 'space':
        return (
          <>
            <defs>
              <radialGradient id="bgGradient" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="#1a1a2e" />
                <stop offset="100%" stopColor="#0f0f1a" />
              </radialGradient>
            </defs>
            {[...Array(20)].map((_, i) => (
              <circle
                key={i}
                cx={10 + (i * 11) % 180}
                cy={8 + (i * 13) % 185}
                r={0.5 + (i % 2)}
                fill="#ffffff"
                opacity={0.4 + (i % 3) * 0.2}
              />
            ))}
            <circle cx="160" cy="30" r="15" fill="#ffd700" opacity="0.3" />
          </>
        )
      case 'rainbow':
        return (
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="20%" stopColor="#ffa94d" />
              <stop offset="40%" stopColor="#ffd43b" />
              <stop offset="60%" stopColor="#69db7c" />
              <stop offset="80%" stopColor="#4dabf7" />
              <stop offset="100%" stopColor="#da77f2" />
            </linearGradient>
          </defs>
        )
      default:
        return (
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="0%">
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
      default: // round
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
      case 'star':
        const points = 5
        const outerR = r
        const innerR = r * 0.5
        let path = ''
        for (let i = 0; i < points * 2; i++) {
          const radius = i % 2 === 0 ? outerR : innerR
          const angle = (i * Math.PI) / points - Math.PI / 2
          const x = cx + radius * Math.cos(angle)
          const y = cy + radius * Math.sin(angle)
          path += i === 0 ? `M${x},${y}` : `L${x},${y}`
        }
        path += 'Z'
        return <path d={path} fill={config.skinTone} />
      default: // circle
        return <circle cx={cx} cy={cy} r={r} fill={config.skinTone} />
    }
  }

  // Eyes renderer
  const renderEyes = () => {
    const eyeY = 65
    const leftX = 82, rightX = 118
    const eyeSize = config.eyeStyle === 'big' ? 10 : 7

    const renderEye = (x: number) => {
      switch (config.eyeStyle) {
        case 'almond':
          return (
            <g key={x}>
              <ellipse cx={x} cy={eyeY} rx={eyeSize} ry={eyeSize * 0.6} fill="white" />
              <circle cx={x} cy={eyeY} r={3} fill={config.eyeColor} />
              <circle cx={x + 1} cy={eyeY - 1} r={1} fill="white" />
            </g>
          )
        case 'big':
          return (
            <g key={x}>
              <circle cx={x} cy={eyeY} r={eyeSize} fill="white" />
              <circle cx={x} cy={eyeY + 1} r={5} fill={config.eyeColor} />
              <circle cx={x + 2} cy={eyeY - 2} r={2} fill="white" />
            </g>
          )
        case 'sparkle':
          return (
            <g key={x}>
              <circle cx={x} cy={eyeY} r={eyeSize} fill="white" />
              <circle cx={x} cy={eyeY} r={4} fill={config.eyeColor} />
              <text x={x - 3} y={eyeY - 4} fontSize="8">✨</text>
            </g>
          )
        case 'heart':
          return (
            <g key={x}>
              <text x={x - 6} y={eyeY + 5} fontSize="14">💕</text>
            </g>
          )
        case 'star':
          return (
            <g key={x}>
              <text x={x - 6} y={eyeY + 5} fontSize="14">⭐</text>
            </g>
          )
        default: // round
          return (
            <g key={x}>
              <circle cx={x} cy={eyeY} r={eyeSize} fill="white" />
              <circle cx={x} cy={eyeY} r={4} fill={config.eyeColor} />
              <circle cx={x + 1} cy={eyeY - 1} r={1.5} fill="white" />
            </g>
          )
      }
    }

    return (
      <>
        {renderEye(leftX)}
        {renderEye(rightX)}
      </>
    )
  }

  // Expression (mouth) renderer
  const renderMouth = () => {
    const mouthY = 90
    const cx = 100

    switch (config.expression) {
      case 'cool':
        return <path d={`M${cx - 12},${mouthY} Q${cx},${mouthY + 5} ${cx + 12},${mouthY}`} stroke="#333" strokeWidth="2" fill="none" />
      case 'wink':
        return (
          <>
            <path d={`M${cx - 10},${mouthY} Q${cx},${mouthY + 8} ${cx + 10},${mouthY}`} stroke="#333" strokeWidth="2" fill="none" />
            <line x1="115" y1="62" x2="122" y2="68" stroke="#333" strokeWidth="2" />
          </>
        )
      case 'surprised':
        return <ellipse cx={cx} cy={mouthY + 3} rx="8" ry="10" fill="#333" />
      case 'sleepy':
        return (
          <>
            <path d={`M${cx - 8},${mouthY + 2} Q${cx},${mouthY - 2} ${cx + 8},${mouthY + 2}`} stroke="#333" strokeWidth="2" fill="none" />
            <text x={cx + 20} y={mouthY - 15} fontSize="12">💤</text>
          </>
        )
      case 'love':
        return (
          <>
            <path d={`M${cx - 10},${mouthY} Q${cx},${mouthY + 10} ${cx + 10},${mouthY}`} stroke="#e91e63" strokeWidth="2.5" fill="none" />
            <text x={cx - 35} y="55" fontSize="10">💕</text>
            <text x={cx + 25} y="55" fontSize="10">💕</text>
          </>
        )
      case 'party':
        return (
          <>
            <path d={`M${cx - 12},${mouthY - 2} Q${cx},${mouthY + 12} ${cx + 12},${mouthY - 2}`} stroke="#333" strokeWidth="2" fill="#ff69b4" />
            <text x={cx - 40} y="50" fontSize="8">🎉</text>
            <text x={cx + 30} y="50" fontSize="8">🎊</text>
          </>
        )
      case 'nerd':
        return (
          <>
            <path d={`M${cx - 6},${mouthY + 2} L${cx + 6},${mouthY + 2}`} stroke="#333" strokeWidth="2" fill="none" />
            <rect x="72" y="58" width="20" height="14" rx="2" fill="none" stroke="#333" strokeWidth="1.5" />
            <rect x="108" y="58" width="20" height="14" rx="2" fill="none" stroke="#333" strokeWidth="1.5" />
            <line x1="92" y1="65" x2="108" y2="65" stroke="#333" strokeWidth="1.5" />
          </>
        )
      default: // happy
        return <path d={`M${cx - 12},${mouthY} Q${cx},${mouthY + 12} ${cx + 12},${mouthY}`} stroke="#333" strokeWidth="2.5" fill="none" />
    }
  }

  // Hair renderer
  const renderHair = () => {
    const color = config.hairColor

    switch (config.hairStyle) {
      case 'short':
        return (
          <path
            d="M55,55 Q55,25 100,20 Q145,25 145,55 Q140,35 100,30 Q60,35 55,55"
            fill={color}
          />
        )
      case 'medium':
        return (
          <path
            d="M50,70 Q45,30 100,18 Q155,30 150,70 Q145,40 100,28 Q55,40 50,70"
            fill={color}
          />
        )
      case 'long':
        return (
          <>
            <path
              d="M45,75 Q40,30 100,15 Q160,30 155,75 Q150,35 100,22 Q50,35 45,75"
              fill={color}
            />
            <path d="M45,75 Q42,120 55,160" stroke={color} strokeWidth="15" fill="none" strokeLinecap="round" />
            <path d="M155,75 Q158,120 145,160" stroke={color} strokeWidth="15" fill="none" strokeLinecap="round" />
          </>
        )
      case 'curly':
        return (
          <>
            <circle cx="60" cy="40" r="15" fill={color} />
            <circle cx="85" cy="28" r="14" fill={color} />
            <circle cx="115" cy="28" r="14" fill={color} />
            <circle cx="140" cy="40" r="15" fill={color} />
            <circle cx="50" cy="60" r="12" fill={color} />
            <circle cx="150" cy="60" r="12" fill={color} />
          </>
        )
      case 'spiky':
        return (
          <path
            d="M55,60 L65,20 L80,50 L100,10 L120,50 L135,20 L145,60 Q100,40 55,60"
            fill={color}
          />
        )
      case 'ponytail':
        return (
          <>
            <path
              d="M55,55 Q55,25 100,20 Q145,25 145,55 Q140,35 100,30 Q60,35 55,55"
              fill={color}
            />
            <ellipse cx="100" cy="15" rx="20" ry="8" fill={color} />
            <path d="M100,20 Q120,10 115,45 Q110,55 100,50" fill={color} />
          </>
        )
      case 'mohawk':
        return (
          <path
            d="M85,60 L90,15 L100,5 L110,15 L115,60 Q100,50 85,60"
            fill={color}
          />
        )
      case 'afro':
        return (
          <ellipse cx="100" cy="45" rx="55" ry="45" fill={color} />
        )
      case 'pigtails':
        return (
          <>
            <path
              d="M55,55 Q55,30 100,22 Q145,30 145,55 Q140,38 100,32 Q60,38 55,55"
              fill={color}
            />
            <circle cx="45" cy="55" r="18" fill={color} />
            <circle cx="155" cy="55" r="18" fill={color} />
            <ellipse cx="45" cy="75" rx="10" ry="20" fill={color} />
            <ellipse cx="155" cy="75" rx="10" ry="20" fill={color} />
          </>
        )
      default:
        return null
    }
  }

  // Outfit renderer
  const renderOutfit = () => {
    const primary = config.outfitColor
    const secondary = config.outfitSecondary

    switch (config.outfit) {
      case 'hoodie':
        return (
          <>
            <path d={getBodyPath()} fill={primary} />
            <path d="M75,100 Q100,115 125,100 L130,130 Q100,145 70,130 Z" fill={adjustColor(primary, -20)} />
            <ellipse cx="100" cy="120" rx="15" ry="20" fill={adjustColor(primary, -30)} />
          </>
        )
      case 'dress':
        return (
          <>
            <path d="M70,100 L60,180 Q100,195 140,180 L130,100 Z" fill={primary} />
            <path d="M75,100 L85,130 L100,135 L115,130 L125,100" fill={secondary} />
          </>
        )
      case 'suit':
        return (
          <>
            <path d={getBodyPath()} fill="#1a1a1a" />
            <path d="M80,100 L100,180 L120,100 Z" fill={secondary} />
            <circle cx="100" cy="130" r="3" fill={primary} />
            <circle cx="100" cy="145" r="3" fill={primary} />
            <path d="M80,100 L90,115 L100,100 L110,115 L120,100" fill={primary} stroke={primary} strokeWidth="2" />
          </>
        )
      case 'superhero':
        return (
          <>
            <path d={getBodyPath()} fill={primary} />
            <path d="M80,120 L100,110 L120,120 L100,150 Z" fill={secondary} />
            <path d="M55,100 Q30,120 40,160 L60,140 Z" fill={primary} />
            <path d="M145,100 Q170,120 160,160 L140,140 Z" fill={primary} />
          </>
        )
      case 'wizard':
        return (
          <>
            <path d="M60,100 L50,185 Q100,200 150,185 L140,100 Z" fill="#4a148c" />
            <path d="M60,100 L70,120 L100,130 L130,120 L140,100" fill="#7b1fa2" />
            {[...Array(5)].map((_, i) => (
              <text key={i} x={60 + i * 20} y={160 + (i % 2) * 15} fontSize="10" opacity="0.7">⭐</text>
            ))}
          </>
        )
      case 'pirate':
        return (
          <>
            <path d={getBodyPath()} fill="#8b0000" />
            <path d="M70,100 L65,130 L100,140 L135,130 L130,100" fill={secondary} />
            <ellipse cx="100" cy="155" rx="8" ry="5" fill="#ffd700" />
          </>
        )
      case 'astronaut':
        return (
          <>
            <path d={getBodyPath()} fill="#e0e0e0" />
            <rect x="80" y="120" width="40" height="30" rx="5" fill="#424242" />
            <rect x="85" y="125" width="10" height="8" rx="2" fill="#4caf50" />
            <rect x="100" y="125" width="10" height="8" rx="2" fill="#f44336" />
            <circle cx="75" cy="140" r="8" fill="#90a4ae" />
            <circle cx="125" cy="140" r="8" fill="#90a4ae" />
          </>
        )
      case 'knight':
        return (
          <>
            <path d={getBodyPath()} fill="#78909c" />
            <path d="M70,100 L65,150 L100,160 L135,150 L130,100" fill="#546e7a" />
            <path d="M90,120 L100,110 L110,120 L100,140 Z" fill="#ffd700" />
          </>
        )
      default: // tshirt
        return (
          <>
            <path d={getBodyPath()} fill={primary} />
            <path d="M75,100 Q100,110 125,100" stroke={secondary} strokeWidth="3" fill="none" />
          </>
        )
    }
  }

  // Accessory renderer
  const renderAccessory = () => {
    switch (config.accessory) {
      case 'glasses':
        return (
          <>
            <rect x="72" y="58" width="22" height="16" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="2" />
            <rect x="106" y="58" width="22" height="16" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="2" />
            <line x1="94" y1="66" x2="106" y2="66" stroke="#1a1a1a" strokeWidth="2" />
          </>
        )
      case 'sunglasses':
        return (
          <>
            <rect x="70" y="56" width="26" height="18" rx="4" fill="#1a1a1a" />
            <rect x="104" y="56" width="26" height="18" rx="4" fill="#1a1a1a" />
            <line x1="96" y1="65" x2="104" y2="65" stroke="#1a1a1a" strokeWidth="3" />
            <rect x="72" y="58" width="22" height="14" rx="3" fill="#3d5a80" opacity="0.7" />
            <rect x="106" y="58" width="22" height="14" rx="3" fill="#3d5a80" opacity="0.7" />
          </>
        )
      case 'hat':
        return (
          <>
            <ellipse cx="100" cy="30" rx="45" ry="8" fill={config.accessoryColor} />
            <path d="M55,30 Q55,5 100,0 Q145,5 145,30" fill={config.accessoryColor} />
            <rect x="60" y="25" width="80" height="8" fill={adjustColor(config.accessoryColor, -30)} />
          </>
        )
      case 'crown':
        return (
          <path
            d="M60,35 L70,10 L85,30 L100,5 L115,30 L130,10 L140,35 Z"
            fill="#ffd700"
            stroke="#ffb300"
            strokeWidth="2"
          />
        )
      case 'halo':
        return (
          <ellipse cx="100" cy="15" rx="35" ry="8" fill="none" stroke="#ffd700" strokeWidth="4" opacity="0.8" />
        )
      case 'horns':
        return (
          <>
            <path d="M55,50 Q45,20 60,10 Q70,25 65,50" fill="#8b0000" />
            <path d="M145,50 Q155,20 140,10 Q130,25 135,50" fill="#8b0000" />
          </>
        )
      case 'headphones':
        return (
          <>
            <path d="M50,65 Q50,30 100,25 Q150,30 150,65" fill="none" stroke="#1a1a1a" strokeWidth="6" />
            <ellipse cx="50" cy="70" rx="10" ry="15" fill="#1a1a1a" />
            <ellipse cx="150" cy="70" rx="10" ry="15" fill="#1a1a1a" />
            <ellipse cx="50" cy="70" rx="6" ry="10" fill="#333" />
            <ellipse cx="150" cy="70" rx="6" ry="10" fill="#333" />
          </>
        )
      case 'bow':
        return (
          <>
            <circle cx="100" cy="20" r="8" fill={config.accessoryColor} />
            <ellipse cx="80" cy="20" rx="15" ry="10" fill={config.accessoryColor} />
            <ellipse cx="120" cy="20" rx="15" ry="10" fill={config.accessoryColor} />
          </>
        )
      case 'wizard_hat':
        return (
          <path
            d="M55,55 L100,-15 L145,55 Q100,45 55,55"
            fill="#4a148c"
          />
        )
      case 'party_hat':
        return (
          <>
            <path d="M65,50 L100,-5 L135,50 Z" fill="#ff69b4" />
            <circle cx="100" cy="-5" r="8" fill="#ffd700" />
            <line x1="75" y1="35" x2="125" y2="35" stroke="#ffd700" strokeWidth="3" />
            <line x1="80" y1="20" x2="120" y2="20" stroke="#4dabf7" strokeWidth="3" />
          </>
        )
      default:
        return null
    }
  }

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ borderRadius: '50%', overflow: 'hidden' }}>
      {/* Background */}
      {renderBackground()}
      <rect width="200" height="200" fill="url(#bgGradient)" />

      {/* Body/Outfit */}
      {renderOutfit()}

      {/* Face */}
      {getFaceShape()}

      {/* Eyes */}
      {renderEyes()}

      {/* Mouth/Expression */}
      {renderMouth()}

      {/* Hair */}
      {renderHair()}

      {/* Accessory */}
      {renderAccessory()}
    </svg>
  )
}

// Helper to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// ============================================
// Customization Components
// ============================================

function CategoryTab({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: string
  label: string
  active: boolean
  onClick: () => void 
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
        active 
          ? 'bg-gradient-to-br from-onde-teal to-cyan-500 text-white shadow-lg' 
          : 'bg-white/80 text-gray-700 hover:bg-white'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </motion.button>
  )
}

function OptionButton({
  option,
  selected,
  unlocked,
  onSelect,
  onUnlock,
  coins
}: {
  option: { id: string; name: string; emoji: string; free?: boolean; cost?: number; achievement?: string }
  selected: boolean
  unlocked: boolean
  onSelect: () => void
  onUnlock: () => void
  coins: number
}) {
  const canAfford = option.cost ? coins >= option.cost : true
  const isLocked = !option.free && !unlocked

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={isLocked ? (canAfford && option.cost ? onUnlock : undefined) : onSelect}
      disabled={isLocked && !canAfford && !option.achievement}
      className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
        selected
          ? 'border-onde-teal bg-onde-teal/10 shadow-lg'
          : isLocked
          ? 'border-gray-300 bg-gray-100 opacity-60'
          : 'border-white/50 bg-white/80 hover:border-onde-teal/50'
      } ${isLocked && !canAfford && !option.achievement ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`text-2xl ${isLocked ? 'grayscale' : ''}`}>{option.emoji}</span>
      <span className="text-xs font-medium text-gray-700">{option.name}</span>
      
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
          {option.cost ? (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${canAfford ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-400 text-white'}`}>
              🪙 {option.cost}
            </span>
          ) : option.achievement ? (
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-400 text-white">
              🏆
            </span>
          ) : (
            <span className="text-lg">🔒</span>
          )}
        </div>
      )}
    </motion.button>
  )
}

function ColorPicker({
  colors,
  selected,
  onSelect,
  label
}: {
  colors: string[]
  selected: string
  onSelect: (color: string) => void
  label: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-2">
        {colors.map(color => (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              selected === color ? 'border-onde-teal scale-110 shadow-lg' : 'border-white/50'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================
// Main Page Component
// ============================================

type Category = 'body' | 'face' | 'hair' | 'outfit' | 'accessory' | 'background'

export default function AvatarPage() {
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR)
  const [activeCategory, setActiveCategory] = useState<Category>('body')
  const [coins, setCoins] = useState(0)
  const [unlocks, setUnlocks] = useState<string[]>([])
  const [achievements, setAchievements] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [showUnlockSuccess, setShowUnlockSuccess] = useState<string | null>(null)

  // Load from localStorage
  useEffect(() => {
    try {
      const savedAvatar = localStorage.getItem(STORAGE_KEY)
      if (savedAvatar) setAvatar(JSON.parse(savedAvatar))
      
      const savedCoins = localStorage.getItem(COINS_KEY)
      if (savedCoins) setCoins(parseInt(savedCoins, 10))
      
      const savedUnlocks = localStorage.getItem(UNLOCKS_KEY)
      if (savedUnlocks) setUnlocks(JSON.parse(savedUnlocks))
      
      const savedAchievements = localStorage.getItem('onde-user-profile')
      if (savedAchievements) {
        const profile = JSON.parse(savedAchievements)
        setAchievements(profile.achievements || [])
      }
    } catch (e) {
      console.error('Error loading avatar:', e)
    }
    setMounted(true)
  }, [])

  // Save avatar whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(avatar))
    }
  }, [avatar, mounted])

  // Save unlocks
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(UNLOCKS_KEY, JSON.stringify(unlocks))
    }
  }, [unlocks, mounted])

  const updateAvatar = useCallback(<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) => {
    setAvatar(prev => ({ ...prev, [key]: value }))
  }, [])

  const isUnlocked = useCallback((option: { free?: boolean; cost?: number; achievement?: string }) => {
    if (option.free) return true
    if (option.cost && unlocks.includes(`cost-${option.cost}`)) return true
    if (option.achievement && achievements.includes(option.achievement)) return true
    return unlocks.includes(JSON.stringify(option))
  }, [unlocks, achievements])

  const unlockItem = useCallback((option: { cost?: number; id: string }) => {
    if (!option.cost || coins < option.cost) return
    setCoins(prev => {
      const newCoins = prev - option.cost!
      localStorage.setItem(COINS_KEY, newCoins.toString())
      return newCoins
    })
    setUnlocks(prev => [...prev, JSON.stringify(option)])
    setShowUnlockSuccess(option.id)
    setTimeout(() => setShowUnlockSuccess(null), 2000)
  }, [coins])

  const saveAvatar = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(avatar))
    setShowSaveSuccess(true)
    setTimeout(() => setShowSaveSuccess(false), 2000)
  }, [avatar])

  const randomize = useCallback(() => {
    const random = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
    const freeOnly = <T extends { free?: boolean }>(arr: T[]): T[] => arr.filter(i => i.free)
    
    setAvatar({
      bodyShape: random(freeOnly(BODY_SHAPES)).id,
      skinTone: random(SKIN_TONES),
      faceShape: random(freeOnly(FACE_SHAPES)).id,
      expression: random(freeOnly(EXPRESSIONS)).id,
      eyeStyle: random(freeOnly(EYE_STYLES)).id,
      eyeColor: random(EYE_COLORS),
      hairStyle: random(freeOnly(HAIR_STYLES)).id,
      hairColor: random(HAIR_COLORS),
      outfit: random(freeOnly(OUTFITS)).id,
      outfitColor: random(OUTFIT_COLORS),
      outfitSecondary: random(OUTFIT_COLORS),
      accessory: random(freeOnly(ACCESSORIES)).id,
      accessoryColor: random(OUTFIT_COLORS),
      background: random(freeOnly(BACKGROUNDS)).id,
      backgroundSecondary: random(BACKGROUND_COLORS),
    })
  }, [])

  const categories: { id: Category; icon: string; label: string }[] = [
    { id: 'body', icon: '🧍', label: 'Body' },
    { id: 'face', icon: '😊', label: 'Face' },
    { id: 'hair', icon: '💇', label: 'Hair' },
    { id: 'outfit', icon: '👕', label: 'Outfit' },
    { id: 'accessory', icon: '🎩', label: 'Extras' },
    { id: 'background', icon: '🖼️', label: 'Background' },
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-onde-teal/20 to-purple-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-4xl"
        >
          🎨
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-6 px-4 bg-gradient-to-br from-onde-teal/10 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-teal-600 hover:text-teal-800 transition-colors"
          >
            <span>←</span>
            <span>Back to Profile</span>
          </Link>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full">
            <span className="text-xl">🪙</span>
            <span className="font-bold text-yellow-800">{coins}</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎨 Avatar Studio
          </h1>
          <p className="text-gray-600">Create your unique look!</p>
        </motion.div>

        {/* Success Messages */}
        <AnimatePresence>
          {showSaveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg"
            >
              ✅ Avatar saved!
            </motion.div>
          )}
          {showUnlockSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-purple-500 text-white rounded-lg shadow-lg"
            >
              🎉 Unlocked: {showUnlockSuccess}!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border-2 border-white/50">
              <motion.div
                key={JSON.stringify(avatar)}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <AvatarPreview config={avatar} size={250} />
              </motion.div>
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={randomize}
                className="px-6 py-3 bg-white/80 text-gray-700 font-semibold rounded-xl hover:bg-white transition-all flex items-center gap-2 shadow-lg"
              >
                <span>🎲</span> Random
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveAvatar}
                className="px-6 py-3 bg-gradient-to-r from-onde-teal to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span>💾</span> Save
              </motion.button>
            </div>
          </motion.div>

          {/* Customization Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border-2 border-white/50"
          >
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(cat => (
                <CategoryTab
                  key={cat.id}
                  icon={cat.icon}
                  label={cat.label}
                  active={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                />
              ))}
            </div>

            {/* Category Content */}
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
              {activeCategory === 'body' && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Body Shape</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {BODY_SHAPES.map(opt => (
                        <OptionButton
                          key={opt.id}
                          option={opt}
                          selected={avatar.bodyShape === opt.id}
                          unlocked={isUnlocked(opt)}
                          onSelect={() => updateAvatar('bodyShape', opt.id)}
                          onUnlock={() => unlockItem(opt)}
                          coins={coins}
                        />
                      ))}
                    </div>
                  </div>
                  <ColorPicker
                    label="Skin Tone"
                    colors={SKIN_TONES}
                    selected={avatar.skinTone}
                    onSelect={(c) => updateAvatar('skinTone', c)}
                  />
                </>
              )}

              {activeCategory === 'face' && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Face Shape</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {FACE_SHAPES.map(opt => (
                        <OptionButton
                          key={opt.id}
                          option={opt}
                          selected={avatar.faceShape === opt.id}
                          unlocked={isUnlocked(opt)}
                          onSelect={() => updateAvatar('faceShape', opt.id)}
                          onUnlock={() => unlockItem(opt)}
                          coins={coins}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Expression</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {EXPRESSIONS.map(opt => (
                        <OptionButton
                          key={opt.id}
                          option={opt}
                          selected={avatar.expression === opt.id}
                          unlocked={isUnlocked(opt)}
                          onSelect={() => updateAvatar('expression', opt.id)}
                          onUnlock={() => unlockItem(opt)}
                          coins={coins}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Eye Style</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {EYE_STYLES.map(opt => (
                        <OptionButton
                          key={opt.id}
                          option={opt}
                          selected={avatar.eyeStyle === opt.id}
                          unlocked={isUnlocked(opt)}
                          onSelect={() => updateAvatar('eyeStyle', opt.id)}
                          onUnlock={() => unlockItem(opt)}
                          coins={coins}
                        />
                      ))}
                    </div>
                  </div>
                  <ColorPicker
                    label="Eye Color"
                    colors={EYE_COLORS}
                    selected={avatar.eyeColor}
                    onSelect={(c) => updateAvatar('eyeColor', c)}
                  />
                </>
              )}

              {activeCategory === 'hair' && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Hair Style</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {HAIR_STYLES.map(opt => (
                        <OptionButton
                          key={opt.id}
                          option={opt}
                          selected={avatar.hairStyle === opt.id}
                          unlocked={isUnlocked(opt)}
                          onSelect={() => updateAvatar('hairStyle', opt.id)}
                          onUnlock={() => unlockItem(opt)}
                          coins={coins}
                        />
                      ))}
                    </div>
                  </div>
                  <ColorPicker
                    label="Hair Color"
                    colors={HAIR_COLORS}
                    selected={avatar.hairColor}
                    onSelect={(c) => updateAvatar('hairColor', c)}
                  />
                </>
              )}

              {activeCategory === 'outfit' && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Outfit</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {OUTFITS.map(opt => (
                        <OptionButton
                          key={opt.id}
                          option={opt}
                          selected={avatar.outfit === opt.id}
                          unlocked={isUnlocked(opt)}
                          onSelect={() => updateAvatar('outfit', opt.id)}
                          onUnlock={() => unlockItem(opt)}
                          coins={coins}
                        />
                      ))}
                    </div>
                  </div>
                  <ColorPicker
                    label="Primary Color"
                    colors={OUTFIT_COLORS}
                    selected={avatar.outfitColor}
                    onSelect={(c) => updateAvatar('outfitColor', c)}
                  />
                  <ColorPicker
                    label="Secondary Color"
                    colors={OUTFIT_COLORS}
                    selected={avatar.outfitSecondary}
                    onSelect={(c) => updateAvatar('outfitSecondary', c)}
                  />
                </>
              )}

              {activeCategory === 'accessory' && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Accessory</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {ACCESSORIES.map(opt => (
                        <OptionButton
                          key={opt.id}
                          option={opt}
                          selected={avatar.accessory === opt.id}
                          unlocked={isUnlocked(opt)}
                          onSelect={() => updateAvatar('accessory', opt.id)}
                          onUnlock={() => unlockItem(opt)}
                          coins={coins}
                        />
                      ))}
                    </div>
                  </div>
                  <ColorPicker
                    label="Accessory Color"
                    colors={OUTFIT_COLORS}
                    selected={avatar.accessoryColor}
                    onSelect={(c) => updateAvatar('accessoryColor', c)}
                  />
                </>
              )}

              {activeCategory === 'background' && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Background Style</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {BACKGROUNDS.map(opt => (
                        <OptionButton
                          key={opt.id}
                          option={opt}
                          selected={avatar.background === opt.id}
                          unlocked={isUnlocked(opt)}
                          onSelect={() => updateAvatar('background', opt.id)}
                          onUnlock={() => unlockItem(opt)}
                          coins={coins}
                        />
                      ))}
                    </div>
                  </div>
                  <ColorPicker
                    label="Background Color"
                    colors={BACKGROUND_COLORS}
                    selected={avatar.backgroundSecondary}
                    onSelect={(c) => updateAvatar('backgroundSecondary', c)}
                  />
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50"
        >
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>💡</span> How to Unlock More Items
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-lg">🪙</span>
              <div>
                <p className="font-medium text-gray-700">Earn Coins</p>
                <p>Read books and complete activities to earn coins!</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🏆</span>
              <div>
                <p className="font-medium text-gray-700">Achievements</p>
                <p>Some items unlock when you earn achievements!</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🔓</span>
              <div>
                <p className="font-medium text-gray-700">Keep Exploring</p>
                <p>Visit daily to discover new items and rewards!</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-8">
          <p className="flex items-center justify-center gap-2">
            <span>🌊</span>
            Onde - Crafted by Code, Touched by Soul
            <span>☀️</span>
          </p>
        </div>
      </div>
    </div>
  )
}

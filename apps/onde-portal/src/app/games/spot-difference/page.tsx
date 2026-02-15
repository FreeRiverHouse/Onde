'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
interface Difference {
  id: string
  x: number // percentage position
  y: number
  radius: number // click radius in percentage
  found: boolean
}

interface Scene {
  id: string
  name: string
  emoji: string
  background: string
  differences: Difference[]
  renderLeft: () => React.ReactNode
  renderRight: () => React.ReactNode
}

// Sound effects using Web Audio API
const playSound = (type: 'found' | 'wrong' | 'win' | 'hint') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'found':
        osc.frequency.value = 523.25
        gain.gain.value = 0.06
        osc.start()
        setTimeout(() => {
          osc.frequency.value = 659.25
        }, 100)
        setTimeout(() => {
          osc.frequency.value = 783.99
        }, 200)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.4)
        osc.stop(audio.currentTime + 0.4)
        break
      case 'wrong':
        osc.frequency.value = 200
        osc.type = 'sawtooth'
        gain.gain.value = 0.1
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
      case 'hint':
        osc.frequency.value = 440
        gain.gain.value = 0.05
        osc.start()
        setTimeout(() => {
          osc.frequency.value = 550
        }, 100)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.25)
        osc.stop(audio.currentTime + 0.25)
        break
      case 'win':
        const notes = [523.25, 659.25, 783.99, 1046.50]
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.frequency.value = freq
            gain2.gain.value = 0.06
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
            osc2.stop(audio.currentTime + 0.3)
          }, i * 150)
        })
        osc.stop(0)
        break
    }
  } catch {
    // Audio not supported
  }
}

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3', '#a8d8ea']
  const confetti = Array.from({ length: 150 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    size: 8 + Math.random() * 8,
    shape: Math.random() > 0.5 ? 'square' : 'circle',
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className={`absolute animate-confetti ${piece.shape === 'circle' ? 'rounded-full' : ''}`}
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}

// Scene definitions with SVG-based artwork
const createScenes = (): Scene[] => [
  {
    id: 'park',
    name: 'Sunny Park',
    emoji: '🌳',
    background: 'from-sky-300 via-sky-400 to-green-400',
    differences: [
      { id: 'sun', x: 85, y: 12, radius: 8, found: false },
      { id: 'bird', x: 25, y: 20, radius: 6, found: false },
      { id: 'flower1', x: 15, y: 75, radius: 6, found: false },
      { id: 'butterfly', x: 70, y: 35, radius: 5, found: false },
      { id: 'cloud', x: 45, y: 15, radius: 8, found: false },
      { id: 'bench-color', x: 50, y: 65, radius: 10, found: false },
    ],
    renderLeft: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Sky gradient background */}
        <defs>
          <linearGradient id="sky-left" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="60%" stopColor="#98D8C8" />
            <stop offset="100%" stopColor="#7CB342" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#sky-left)" />
        
        {/* Sun - YELLOW */}
        <circle cx="85" cy="12" r="8" fill="#FFD700" />
        <g stroke="#FFD700" strokeWidth="1">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1={85 + Math.cos(angle * Math.PI / 180) * 10}
              y1={12 + Math.sin(angle * Math.PI / 180) * 10}
              x2={85 + Math.cos(angle * Math.PI / 180) * 13}
              y2={12 + Math.sin(angle * Math.PI / 180) * 13}
            />
          ))}
        </g>
        
        {/* Cloud - PRESENT */}
        <g fill="white">
          <ellipse cx="45" cy="15" rx="8" ry="5" />
          <ellipse cx="40" cy="17" rx="6" ry="4" />
          <ellipse cx="50" cy="17" rx="6" ry="4" />
        </g>
        
        {/* Bird - PRESENT */}
        <path d="M22 20 Q25 17 28 20 M25 20 Q28 17 31 20" stroke="#333" strokeWidth="1.5" fill="none" />
        
        {/* Tree */}
        <rect x="75" y="50" width="6" height="25" fill="#8B4513" />
        <circle cx="78" cy="42" r="15" fill="#228B22" />
        <circle cx="70" cy="48" r="10" fill="#2E8B57" />
        <circle cx="86" cy="48" r="10" fill="#2E8B57" />
        
        {/* Grass */}
        <rect x="0" y="75" width="100" height="25" fill="#7CB342" />
        
        {/* Flowers - RED */}
        <circle cx="15" cy="78" r="3" fill="#FF5733" />
        <circle cx="15" cy="82" r="1" fill="#228B22" />
        
        <circle cx="30" cy="80" r="2.5" fill="#FF69B4" />
        <circle cx="30" cy="83" r="1" fill="#228B22" />
        
        {/* Butterfly - PRESENT */}
        <g transform="translate(70, 35)">
          <ellipse cx="0" cy="0" rx="3" ry="2" fill="#9B59B6" />
          <ellipse cx="-3" cy="-1" rx="2" ry="3" fill="#E74C3C" />
          <ellipse cx="3" cy="-1" rx="2" ry="3" fill="#E74C3C" />
        </g>
        
        {/* Park bench - BROWN */}
        <rect x="40" y="62" width="20" height="2" fill="#8B4513" rx="1" />
        <rect x="40" y="65" width="20" height="6" fill="#8B4513" rx="1" />
        <rect x="42" y="71" width="2" height="6" fill="#5D4037" />
        <rect x="56" y="71" width="2" height="6" fill="#5D4037" />
        
        {/* Path */}
        <ellipse cx="50" cy="90" rx="25" ry="8" fill="#D4A574" />
      </svg>
    ),
    renderRight: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="sky-right" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="60%" stopColor="#98D8C8" />
            <stop offset="100%" stopColor="#7CB342" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#sky-right)" />
        
        {/* Sun - DIFFERENCE: ORANGE instead of yellow */}
        <circle cx="85" cy="12" r="8" fill="#FF6B35" />
        <g stroke="#FF6B35" strokeWidth="1">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1={85 + Math.cos(angle * Math.PI / 180) * 10}
              y1={12 + Math.sin(angle * Math.PI / 180) * 10}
              x2={85 + Math.cos(angle * Math.PI / 180) * 13}
              y2={12 + Math.sin(angle * Math.PI / 180) * 13}
            />
          ))}
        </g>
        
        {/* Cloud - DIFFERENCE: MISSING */}
        
        {/* Bird - DIFFERENCE: MISSING */}
        
        {/* Tree */}
        <rect x="75" y="50" width="6" height="25" fill="#8B4513" />
        <circle cx="78" cy="42" r="15" fill="#228B22" />
        <circle cx="70" cy="48" r="10" fill="#2E8B57" />
        <circle cx="86" cy="48" r="10" fill="#2E8B57" />
        
        {/* Grass */}
        <rect x="0" y="75" width="100" height="25" fill="#7CB342" />
        
        {/* Flowers - DIFFERENCE: YELLOW instead of red */}
        <circle cx="15" cy="78" r="3" fill="#FFD700" />
        <circle cx="15" cy="82" r="1" fill="#228B22" />
        
        <circle cx="30" cy="80" r="2.5" fill="#FF69B4" />
        <circle cx="30" cy="83" r="1" fill="#228B22" />
        
        {/* Butterfly - DIFFERENCE: MISSING */}
        
        {/* Park bench - DIFFERENCE: BLUE instead of brown */}
        <rect x="40" y="62" width="20" height="2" fill="#3498DB" rx="1" />
        <rect x="40" y="65" width="20" height="6" fill="#3498DB" rx="1" />
        <rect x="42" y="71" width="2" height="6" fill="#2980B9" />
        <rect x="56" y="71" width="2" height="6" fill="#2980B9" />
        
        {/* Path */}
        <ellipse cx="50" cy="90" rx="25" ry="8" fill="#D4A574" />
      </svg>
    ),
  },
  {
    id: 'beach',
    name: 'Beach Day',
    emoji: '🏖️',
    background: 'from-cyan-300 via-blue-400 to-yellow-200',
    differences: [
      { id: 'umbrella', x: 25, y: 55, radius: 10, found: false },
      { id: 'crab', x: 75, y: 80, radius: 6, found: false },
      { id: 'seagull', x: 60, y: 15, radius: 6, found: false },
      { id: 'sandcastle', x: 45, y: 75, radius: 8, found: false },
      { id: 'boat', x: 80, y: 35, radius: 8, found: false },
      { id: 'starfish', x: 20, y: 85, radius: 5, found: false },
      { id: 'sun', x: 15, y: 12, radius: 7, found: false },
    ],
    renderLeft: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="beach-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="50%" stopColor="#00CED1" />
            <stop offset="100%" stopColor="#F0E68C" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#beach-sky)" />
        
        {/* Sun - YELLOW */}
        <circle cx="15" cy="12" r="7" fill="#FFD700" />
        
        {/* Ocean */}
        <rect x="0" y="45" width="100" height="20" fill="#1E90FF" />
        <path d="M0 50 Q10 48 20 50 Q30 52 40 50 Q50 48 60 50 Q70 52 80 50 Q90 48 100 50 L100 45 L0 45 Z" fill="#00BFFF" />
        
        {/* Seagull - PRESENT */}
        <path d="M57 15 Q60 12 63 15 M60 15 Q63 12 66 15" stroke="white" strokeWidth="1.5" fill="none" />
        
        {/* Boat - RED */}
        <path d="M72 35 L88 35 L85 42 L75 42 Z" fill="#E74C3C" />
        <rect x="80" y="25" width="1" height="10" fill="#8B4513" />
        <path d="M81 26 L81 33 L87 33 Z" fill="white" />
        
        {/* Beach/Sand */}
        <rect x="0" y="65" width="100" height="35" fill="#F4D03F" />
        
        {/* Beach umbrella - RED/WHITE */}
        <rect x="25" y="55" width="2" height="20" fill="#8B4513" />
        <path d="M15 55 Q26 45 37 55 Z" fill="#E74C3C" />
        <path d="M18 54 Q26 47 34 54 Z" fill="white" />
        
        {/* Sandcastle - TALL FLAG */}
        <rect x="40" y="70" width="12" height="10" fill="#DEB887" />
        <polygon points="46,60 42,70 50,70" fill="#DEB887" />
        <rect x="45" y="56" width="1" height="5" fill="#8B4513" />
        <polygon points="46,56 46,59 49,57.5" fill="#E74C3C" />
        
        {/* Crab - PRESENT */}
        <g transform="translate(75, 80)">
          <ellipse cx="0" cy="0" rx="4" ry="3" fill="#E74C3C" />
          <circle cx="-2" cy="-2" r="0.8" fill="#333" />
          <circle cx="2" cy="-2" r="0.8" fill="#333" />
          <path d="M-4 0 L-7 -2 L-8 0" stroke="#E74C3C" strokeWidth="1" fill="none" />
          <path d="M4 0 L7 -2 L8 0" stroke="#E74C3C" strokeWidth="1" fill="none" />
        </g>
        
        {/* Starfish - ORANGE */}
        <g transform="translate(20, 85)">
          <polygon points="0,-4 1,-1 4,-1 2,1 3,4 0,2 -3,4 -2,1 -4,-1 -1,-1" fill="#FF8C00" />
        </g>
        
        {/* Shells */}
        <ellipse cx="55" cy="88" rx="2" ry="1.5" fill="#FFF8DC" />
        <ellipse cx="85" cy="92" rx="1.5" ry="1" fill="#FFE4C4" />
      </svg>
    ),
    renderRight: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="beach-sky-r" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="50%" stopColor="#00CED1" />
            <stop offset="100%" stopColor="#F0E68C" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#beach-sky-r)" />
        
        {/* Sun - DIFFERENCE: ORANGE */}
        <circle cx="15" cy="12" r="7" fill="#FF6B35" />
        
        {/* Ocean */}
        <rect x="0" y="45" width="100" height="20" fill="#1E90FF" />
        <path d="M0 50 Q10 48 20 50 Q30 52 40 50 Q50 48 60 50 Q70 52 80 50 Q90 48 100 50 L100 45 L0 45 Z" fill="#00BFFF" />
        
        {/* Seagull - DIFFERENCE: MISSING */}
        
        {/* Boat - DIFFERENCE: BLUE */}
        <path d="M72 35 L88 35 L85 42 L75 42 Z" fill="#3498DB" />
        <rect x="80" y="25" width="1" height="10" fill="#8B4513" />
        <path d="M81 26 L81 33 L87 33 Z" fill="white" />
        
        {/* Beach/Sand */}
        <rect x="0" y="65" width="100" height="35" fill="#F4D03F" />
        
        {/* Beach umbrella - DIFFERENCE: BLUE/WHITE */}
        <rect x="25" y="55" width="2" height="20" fill="#8B4513" />
        <path d="M15 55 Q26 45 37 55 Z" fill="#3498DB" />
        <path d="M18 54 Q26 47 34 54 Z" fill="white" />
        
        {/* Sandcastle - DIFFERENCE: NO FLAG */}
        <rect x="40" y="70" width="12" height="10" fill="#DEB887" />
        <polygon points="46,60 42,70 50,70" fill="#DEB887" />
        
        {/* Crab - DIFFERENCE: MISSING */}
        
        {/* Starfish - DIFFERENCE: PURPLE */}
        <g transform="translate(20, 85)">
          <polygon points="0,-4 1,-1 4,-1 2,1 3,4 0,2 -3,4 -2,1 -4,-1 -1,-1" fill="#9B59B6" />
        </g>
        
        {/* Shells */}
        <ellipse cx="55" cy="88" rx="2" ry="1.5" fill="#FFF8DC" />
        <ellipse cx="85" cy="92" rx="1.5" ry="1" fill="#FFE4C4" />
      </svg>
    ),
  },
  {
    id: 'space',
    name: 'Space Adventure',
    emoji: '🚀',
    background: 'from-indigo-900 via-purple-800 to-black',
    differences: [
      { id: 'rocket-window', x: 30, y: 45, radius: 8, found: false },
      { id: 'planet-rings', x: 75, y: 30, radius: 10, found: false },
      { id: 'star-big', x: 15, y: 20, radius: 5, found: false },
      { id: 'ufo', x: 85, y: 70, radius: 8, found: false },
      { id: 'moon-crater', x: 55, y: 75, radius: 8, found: false },
      { id: 'comet', x: 50, y: 15, radius: 7, found: false },
    ],
    renderLeft: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="space-bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0D1B2A" />
            <stop offset="50%" stopColor="#1B263B" />
            <stop offset="100%" stopColor="#0D1B2A" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#space-bg)" />
        
        {/* Stars background */}
        {[...Array(30)].map((_, i) => (
          <circle
            key={i}
            cx={(i * 17) % 100}
            cy={(i * 23) % 100}
            r={0.3 + (i % 3) * 0.2}
            fill="white"
            opacity={0.5 + (i % 5) * 0.1}
          />
        ))}
        
        {/* Big star - YELLOW */}
        <polygon points="15,16 16,19 19,19 17,21 18,24 15,22 12,24 13,21 11,19 14,19" fill="#FFD700" />
        
        {/* Comet - PRESENT */}
        <g transform="translate(50, 15)">
          <ellipse cx="0" cy="0" rx="3" ry="2" fill="#FFF" />
          <path d="M-3 0 L-15 3 L-12 0 L-15 -3 Z" fill="rgba(255,255,255,0.5)" />
        </g>
        
        {/* Planet with rings - HAS RINGS */}
        <circle cx="75" cy="30" r="10" fill="#E74C3C" />
        <ellipse cx="75" cy="30" rx="18" ry="5" fill="none" stroke="#FFD700" strokeWidth="2" transform="rotate(-20, 75, 30)" />
        
        {/* Rocket */}
        <g transform="translate(30, 50)">
          {/* Body */}
          <path d="M0,-20 L-8,10 L8,10 Z" fill="#E8E8E8" />
          {/* Window - BLUE */}
          <circle cx="0" cy="-5" r="4" fill="#3498DB" />
          {/* Fins */}
          <path d="M-8,5 L-15,15 L-8,10 Z" fill="#E74C3C" />
          <path d="M8,5 L15,15 L8,10 Z" fill="#E74C3C" />
          {/* Flame */}
          <path d="M-5,10 L0,25 L5,10 Z" fill="#FF6B35" />
          <path d="M-3,10 L0,20 L3,10 Z" fill="#FFD700" />
        </g>
        
        {/* Moon - 3 CRATERS */}
        <circle cx="55" cy="75" r="12" fill="#BDC3C7" />
        <circle cx="52" cy="72" r="2" fill="#95A5A6" />
        <circle cx="58" cy="78" r="2.5" fill="#95A5A6" />
        <circle cx="50" cy="80" r="1.5" fill="#95A5A6" />
        
        {/* UFO - GREEN */}
        <g transform="translate(85, 70)">
          <ellipse cx="0" cy="0" rx="8" ry="3" fill="#95A5A6" />
          <ellipse cx="0" cy="-2" rx="4" ry="3" fill="#2ECC71" />
          <circle cx="-4" cy="1" r="1" fill="#FFD700" />
          <circle cx="0" cy="1" r="1" fill="#FFD700" />
          <circle cx="4" cy="1" r="1" fill="#FFD700" />
        </g>
      </svg>
    ),
    renderRight: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="space-bg-r" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0D1B2A" />
            <stop offset="50%" stopColor="#1B263B" />
            <stop offset="100%" stopColor="#0D1B2A" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#space-bg-r)" />
        
        {/* Stars background */}
        {[...Array(30)].map((_, i) => (
          <circle
            key={i}
            cx={(i * 17) % 100}
            cy={(i * 23) % 100}
            r={0.3 + (i % 3) * 0.2}
            fill="white"
            opacity={0.5 + (i % 5) * 0.1}
          />
        ))}
        
        {/* Big star - DIFFERENCE: WHITE */}
        <polygon points="15,16 16,19 19,19 17,21 18,24 15,22 12,24 13,21 11,19 14,19" fill="#FFFFFF" />
        
        {/* Comet - DIFFERENCE: MISSING */}
        
        {/* Planet with rings - DIFFERENCE: NO RINGS */}
        <circle cx="75" cy="30" r="10" fill="#E74C3C" />
        
        {/* Rocket */}
        <g transform="translate(30, 50)">
          {/* Body */}
          <path d="M0,-20 L-8,10 L8,10 Z" fill="#E8E8E8" />
          {/* Window - DIFFERENCE: PURPLE */}
          <circle cx="0" cy="-5" r="4" fill="#9B59B6" />
          {/* Fins */}
          <path d="M-8,5 L-15,15 L-8,10 Z" fill="#E74C3C" />
          <path d="M8,5 L15,15 L8,10 Z" fill="#E74C3C" />
          {/* Flame */}
          <path d="M-5,10 L0,25 L5,10 Z" fill="#FF6B35" />
          <path d="M-3,10 L0,20 L3,10 Z" fill="#FFD700" />
        </g>
        
        {/* Moon - DIFFERENCE: 2 CRATERS */}
        <circle cx="55" cy="75" r="12" fill="#BDC3C7" />
        <circle cx="52" cy="72" r="2" fill="#95A5A6" />
        <circle cx="58" cy="78" r="2.5" fill="#95A5A6" />
        
        {/* UFO - DIFFERENCE: PINK */}
        <g transform="translate(85, 70)">
          <ellipse cx="0" cy="0" rx="8" ry="3" fill="#95A5A6" />
          <ellipse cx="0" cy="-2" rx="4" ry="3" fill="#E91E63" />
          <circle cx="-4" cy="1" r="1" fill="#FFD700" />
          <circle cx="0" cy="1" r="1" fill="#FFD700" />
          <circle cx="4" cy="1" r="1" fill="#FFD700" />
        </g>
      </svg>
    ),
  },
  {
    id: 'farm',
    name: 'Happy Farm',
    emoji: '🐄',
    background: 'from-blue-300 via-green-300 to-yellow-200',
    differences: [
      { id: 'barn-door', x: 25, y: 55, radius: 8, found: false },
      { id: 'cow-spots', x: 65, y: 70, radius: 8, found: false },
      { id: 'windmill', x: 85, y: 35, radius: 8, found: false },
      { id: 'chicken', x: 45, y: 82, radius: 6, found: false },
      { id: 'tractor', x: 75, y: 85, radius: 8, found: false },
      { id: 'hay', x: 15, y: 80, radius: 7, found: false },
    ],
    renderLeft: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="farm-bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="40%" stopColor="#87CEEB" />
            <stop offset="40%" stopColor="#90EE90" />
            <stop offset="100%" stopColor="#7CB342" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#farm-bg)" />
        
        {/* Sun */}
        <circle cx="12" cy="12" r="8" fill="#FFD700" />
        
        {/* Clouds */}
        <g fill="white">
          <ellipse cx="40" cy="15" rx="8" ry="4" />
          <ellipse cx="35" cy="17" rx="5" ry="3" />
          <ellipse cx="45" cy="17" rx="5" ry="3" />
        </g>
        
        {/* Barn */}
        <rect x="15" y="45" width="25" height="25" fill="#C0392B" />
        <polygon points="15,45 27.5,30 40,45" fill="#922B21" />
        {/* Barn door - RED */}
        <rect x="23" y="55" width="10" height="15" fill="#922B21" />
        <circle cx="31" cy="62" r="1" fill="#FFD700" />
        {/* Barn X */}
        <line x1="17" y1="47" x2="38" y2="68" stroke="white" strokeWidth="1" />
        <line x1="38" y1="47" x2="17" y2="68" stroke="white" strokeWidth="1" />
        
        {/* Windmill - 4 BLADES */}
        <rect x="82" y="40" width="6" height="30" fill="#DEB887" />
        <g transform="translate(85, 38)">
          <circle cx="0" cy="0" r="2" fill="#8B4513" />
          <rect x="-2" y="-15" width="4" height="15" fill="#8B4513" rx="1" />
          <rect x="-2" y="0" width="4" height="15" fill="#8B4513" rx="1" />
          <rect x="-15" y="-2" width="15" height="4" fill="#8B4513" rx="1" />
          <rect x="0" y="-2" width="15" height="4" fill="#8B4513" rx="1" />
        </g>
        
        {/* Fence */}
        {[50, 58, 66, 74, 82, 90].map((x) => (
          <g key={x}>
            <rect x={x} y="62" width="2" height="10" fill="#DEB887" />
          </g>
        ))}
        <rect x="50" y="65" width="42" height="2" fill="#DEB887" />
        
        {/* Cow - WITH SPOTS */}
        <g transform="translate(65, 72)">
          <ellipse cx="0" cy="0" rx="8" ry="5" fill="white" />
          <circle cx="-6" cy="-3" r="3" fill="white" />
          <circle cx="-7" cy="-4" r="1" fill="#333" />
          <ellipse cx="-8" cy="-2" rx="1.5" ry="1" fill="#FFB6C1" />
          {/* Spots */}
          <circle cx="2" cy="-1" r="2" fill="#333" />
          <circle cx="-2" cy="2" r="1.5" fill="#333" />
          <rect x="-6" y="3" width="1.5" height="4" fill="white" />
          <rect x="-2" y="3" width="1.5" height="4" fill="white" />
          <rect x="2" y="3" width="1.5" height="4" fill="white" />
          <rect x="6" y="3" width="1.5" height="4" fill="white" />
        </g>
        
        {/* Chicken - PRESENT */}
        <g transform="translate(45, 82)">
          <ellipse cx="0" cy="0" rx="3" ry="2.5" fill="white" />
          <circle cx="-2" cy="-1.5" r="1.5" fill="white" />
          <circle cx="-2.5" cy="-1.5" r="0.5" fill="#333" />
          <polygon points="-3.5,-1.5 -5,-1.5 -3.5,-1" fill="#FF6B35" />
          <polygon points="-2,-3 -1.5,-2 -2.5,-2" fill="#E74C3C" />
          <rect x="-1" y="1.5" width="0.8" height="2" fill="#FF6B35" />
          <rect x="1" y="1.5" width="0.8" height="2" fill="#FF6B35" />
        </g>
        
        {/* Hay bales - 3 BALES */}
        <g transform="translate(15, 78)">
          <ellipse cx="0" cy="0" rx="5" ry="4" fill="#DAA520" />
          <ellipse cx="6" cy="2" rx="4" ry="3" fill="#DAA520" />
          <ellipse cx="2" cy="-4" rx="4" ry="3" fill="#DAA520" />
        </g>
        
        {/* Tractor - RED */}
        <g transform="translate(75, 85)">
          <rect x="-8" y="-8" width="12" height="8" fill="#E74C3C" />
          <rect x="-10" y="-5" width="4" height="5" fill="#E74C3C" />
          <circle cx="-8" cy="2" r="4" fill="#333" />
          <circle cx="2" cy="0" r="3" fill="#333" />
          <circle cx="-8" cy="2" r="2" fill="#666" />
          <circle cx="2" cy="0" r="1.5" fill="#666" />
        </g>
      </svg>
    ),
    renderRight: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="farm-bg-r" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="40%" stopColor="#87CEEB" />
            <stop offset="40%" stopColor="#90EE90" />
            <stop offset="100%" stopColor="#7CB342" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#farm-bg-r)" />
        
        {/* Sun */}
        <circle cx="12" cy="12" r="8" fill="#FFD700" />
        
        {/* Clouds */}
        <g fill="white">
          <ellipse cx="40" cy="15" rx="8" ry="4" />
          <ellipse cx="35" cy="17" rx="5" ry="3" />
          <ellipse cx="45" cy="17" rx="5" ry="3" />
        </g>
        
        {/* Barn */}
        <rect x="15" y="45" width="25" height="25" fill="#C0392B" />
        <polygon points="15,45 27.5,30 40,45" fill="#922B21" />
        {/* Barn door - DIFFERENCE: GREEN */}
        <rect x="23" y="55" width="10" height="15" fill="#27AE60" />
        <circle cx="31" cy="62" r="1" fill="#FFD700" />
        {/* Barn X */}
        <line x1="17" y1="47" x2="38" y2="68" stroke="white" strokeWidth="1" />
        <line x1="38" y1="47" x2="17" y2="68" stroke="white" strokeWidth="1" />
        
        {/* Windmill - DIFFERENCE: 3 BLADES */}
        <rect x="82" y="40" width="6" height="30" fill="#DEB887" />
        <g transform="translate(85, 38)">
          <circle cx="0" cy="0" r="2" fill="#8B4513" />
          <rect x="-2" y="-15" width="4" height="15" fill="#8B4513" rx="1" />
          <rect x="-15" y="-2" width="15" height="4" fill="#8B4513" rx="1" transform="rotate(60, 0, 0)" />
          <rect x="-15" y="-2" width="15" height="4" fill="#8B4513" rx="1" transform="rotate(-60, 0, 0)" />
        </g>
        
        {/* Fence */}
        {[50, 58, 66, 74, 82, 90].map((x) => (
          <g key={x}>
            <rect x={x} y="62" width="2" height="10" fill="#DEB887" />
          </g>
        ))}
        <rect x="50" y="65" width="42" height="2" fill="#DEB887" />
        
        {/* Cow - DIFFERENCE: NO SPOTS */}
        <g transform="translate(65, 72)">
          <ellipse cx="0" cy="0" rx="8" ry="5" fill="white" />
          <circle cx="-6" cy="-3" r="3" fill="white" />
          <circle cx="-7" cy="-4" r="1" fill="#333" />
          <ellipse cx="-8" cy="-2" rx="1.5" ry="1" fill="#FFB6C1" />
          {/* No spots */}
          <rect x="-6" y="3" width="1.5" height="4" fill="white" />
          <rect x="-2" y="3" width="1.5" height="4" fill="white" />
          <rect x="2" y="3" width="1.5" height="4" fill="white" />
          <rect x="6" y="3" width="1.5" height="4" fill="white" />
        </g>
        
        {/* Chicken - DIFFERENCE: MISSING */}
        
        {/* Hay bales - DIFFERENCE: 2 BALES */}
        <g transform="translate(15, 78)">
          <ellipse cx="0" cy="0" rx="5" ry="4" fill="#DAA520" />
          <ellipse cx="6" cy="2" rx="4" ry="3" fill="#DAA520" />
        </g>
        
        {/* Tractor - DIFFERENCE: BLUE */}
        <g transform="translate(75, 85)">
          <rect x="-8" y="-8" width="12" height="8" fill="#3498DB" />
          <rect x="-10" y="-5" width="4" height="5" fill="#3498DB" />
          <circle cx="-8" cy="2" r="4" fill="#333" />
          <circle cx="2" cy="0" r="3" fill="#333" />
          <circle cx="-8" cy="2" r="2" fill="#666" />
          <circle cx="2" cy="0" r="1.5" fill="#666" />
        </g>
      </svg>
    ),
  },
]

// Main game component
function SpotDifferenceGameInner() {
  const rewards = useGameContext()
  const [scenes] = useState<Scene[]>(createScenes)
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [differences, setDifferences] = useState<Difference[]>([])
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [hintsRemaining, setHintsRemaining] = useState(3)
  const [showHint, setShowHint] = useState<Difference | null>(null)
  const [wrongClick, setWrongClick] = useState<{ x: number; y: number } | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [timerMode, setTimerMode] = useState(false)
  const [completedScenes, setCompletedScenes] = useState<Set<string>>(new Set())
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const leftPanelRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)

  const currentScene = scenes[currentSceneIndex]

  // Initialize scene
  const initializeScene = useCallback(() => {
    const scene = scenes[currentSceneIndex]
    setDifferences(scene.differences.map(d => ({ ...d, found: false })))
    setTime(timerMode ? 60 : 0)
    setIsPlaying(false)
    setGameOver(false)
    setShowConfetti(false)
    setShowHint(null)
    setWrongClick(null)
    setHintsRemaining(3)
    setHintsUsed(0)
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [currentSceneIndex, scenes, timerMode])

  useEffect(() => {
    initializeScene()
  }, [initializeScene])

  // Timer
  useEffect(() => {
    if (isPlaying && !gameOver) {
      timerRef.current = setInterval(() => {
        setTime((t) => {
          if (timerMode) {
            if (t <= 1) {
              // Time's up!
              setGameOver(true)
              rewards.trackWin()
              setIsPlaying(false)
              return 0
            }
            return t - 1
          }
          return t + 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying, gameOver, timerMode])

  // Check for win
  useEffect(() => {
    if (differences.length > 0 && differences.every(d => d.found)) {
      setGameOver(true)
      setIsPlaying(false)
      setShowConfetti(true)
      setCompletedScenes(prev => new Set([...prev, currentScene.id]))
      
      if (soundEnabled) {
        playSound('win')
      }
    }
  }, [differences, currentScene.id, soundEnabled])

  // Handle click on image
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>, isRightPanel: boolean) => {
    if (gameOver) return
    
    if (!isPlaying) {
      setIsPlaying(true)
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // Check if click is on a difference
    const foundDiff = differences.find(d => {
      if (d.found) return false
      const distance = Math.sqrt(Math.pow(x - d.x, 2) + Math.pow(y - d.y, 2))
      return distance <= d.radius
    })

    if (foundDiff) {
      if (soundEnabled) playSound('found')
      setDifferences(prev => prev.map(d => 
        d.id === foundDiff.id ? { ...d, found: true } : d
      ))
      setShowHint(null)
    } else {
      if (soundEnabled) playSound('wrong')
      setWrongClick({ x, y })
      setTimeout(() => setWrongClick(null), 500)
    }
  }

  // Use hint
  const useHint = () => {
    if (hintsRemaining <= 0 || gameOver) return
    
    const unfound = differences.filter(d => !d.found)
    if (unfound.length === 0) return

    if (soundEnabled) playSound('hint')
    
    const randomDiff = unfound[Math.floor(Math.random() * unfound.length)]
    setShowHint(randomDiff)
    setHintsRemaining(prev => prev - 1)
    setHintsUsed(prev => prev + 1)
    
    // Hide hint after 3 seconds
    setTimeout(() => setShowHint(null), 3000)
  }

  // Go to next scene
  const nextScene = () => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1)
    } else {
      setCurrentSceneIndex(0) // Loop back
    }
  }

  // Previous scene
  const prevScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(prev => prev - 1)
    } else {
      setCurrentSceneIndex(scenes.length - 1)
    }
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const foundCount = differences.filter(d => d.found).length
  const totalDifferences = differences.length

  return (
    <div className={`min-h-screen bg-gradient-to-b ${currentScene.background} flex flex-col items-center p-4`}>

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation"><span className="text-lg">←</span><span className="font-mono text-sm">Arcade</span></Link>
      <Confetti active={showConfetti} />

      {/* Header */}
      <Link
        href="/games/arcade/"
        className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg hover:scale-105 transition-all z-10"
      >
        ← Games
      </Link>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-4 right-4 bg-white/90 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all z-10"
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Title */}
      <h1 className="text-2xl md:text-4xl font-black text-white mb-2 mt-12 text-center drop-shadow-lg">
        🔍 Spot the Difference
      </h1>
      
      {/* Scene name */}
      <p className="text-white/90 mb-2 text-center font-bold">
        {currentScene.emoji} {currentScene.name}
      </p>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-2 mb-3 justify-center">
        <div className={`px-4 py-2 rounded-full font-bold shadow-lg ${
          timerMode && time <= 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/90 text-purple-700'
        }`}>
          ⏱️ {formatTime(time)}
        </div>
        <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg">
          ✨ {foundCount}/{totalDifferences}
        </div>
        <button
          onClick={useHint}
          disabled={hintsRemaining <= 0 || gameOver}
          className={`px-4 py-2 rounded-full font-bold shadow-lg transition-all ${
            hintsRemaining > 0 && !gameOver
              ? 'bg-yellow-400 text-yellow-900 hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          💡 Hints: {hintsRemaining}
        </button>
      </div>

      {/* Timer mode toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => {
            setTimerMode(false)
            initializeScene()
          }}
          className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
            !timerMode ? 'bg-white text-purple-700 shadow' : 'bg-white/30 text-white hover:bg-white/40'
          }`}
        >
          🎮 Relaxed
        </button>
        <button
          onClick={() => {
            setTimerMode(true)
            initializeScene()
          }}
          className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
            timerMode ? 'bg-white text-purple-700 shadow' : 'bg-white/30 text-white hover:bg-white/40'
          }`}
        >
          ⚡ Challenge (60s)
        </button>
      </div>

      {/* Game area - two images side by side */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full max-w-4xl">
        {/* Left image */}
        <div 
          ref={leftPanelRef}
          className="relative flex-1 aspect-square md:aspect-[4/3] bg-white/20 rounded-2xl overflow-hidden shadow-2xl cursor-crosshair"
          onClick={(e) => handleImageClick(e, false)}
        >
          <div className="absolute inset-0">
            {currentScene.renderLeft()}
          </div>
          
          {/* Found markers on left */}
          {differences.filter(d => d.found).map(d => (
            <div
              key={`left-${d.id}`}
              className="absolute pointer-events-none animate-found"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-green-400 rounded-full bg-green-400/20 flex items-center justify-center">
                <span className="text-lg md:text-2xl">✓</span>
              </div>
            </div>
          ))}
          
          {/* Hint circle on left */}
          {showHint && (
            <div
              className="absolute pointer-events-none animate-hint"
              style={{
                left: `${showHint.x}%`,
                top: `${showHint.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-yellow-400 rounded-full bg-yellow-400/20 animate-pulse" />
            </div>
          )}
          
          {/* Wrong click indicator */}
          {wrongClick && (
            <div
              className="absolute pointer-events-none animate-wrong"
              style={{
                left: `${wrongClick.x}%`,
                top: `${wrongClick.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="w-6 h-6 md:w-8 md:h-8 text-xl md:text-2xl text-red-500">✗</div>
            </div>
          )}
          
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm font-bold">
            Original
          </div>
        </div>

        {/* Right image */}
        <div 
          ref={rightPanelRef}
          className="relative flex-1 aspect-square md:aspect-[4/3] bg-white/20 rounded-2xl overflow-hidden shadow-2xl cursor-crosshair"
          onClick={(e) => handleImageClick(e, true)}
        >
          <div className="absolute inset-0">
            {currentScene.renderRight()}
          </div>
          
          {/* Found markers on right */}
          {differences.filter(d => d.found).map(d => (
            <div
              key={`right-${d.id}`}
              className="absolute pointer-events-none animate-found"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-green-400 rounded-full bg-green-400/20 flex items-center justify-center">
                <span className="text-lg md:text-2xl">✓</span>
              </div>
            </div>
          ))}
          
          {/* Hint circle on right */}
          {showHint && (
            <div
              className="absolute pointer-events-none animate-hint"
              style={{
                left: `${showHint.x}%`,
                top: `${showHint.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-yellow-400 rounded-full bg-yellow-400/20 animate-pulse" />
            </div>
          )}
          
          {/* Wrong click indicator */}
          {wrongClick && (
            <div
              className="absolute pointer-events-none animate-wrong"
              style={{
                left: `${wrongClick.x}%`,
                top: `${wrongClick.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="w-6 h-6 md:w-8 md:h-8 text-xl md:text-2xl text-red-500">✗</div>
            </div>
          )}
          
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm font-bold">
            Different
          </div>
        </div>
      </div>

      {/* Scene navigation */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={prevScene}
          className="px-4 py-2 bg-white/80 rounded-full font-bold text-purple-700 shadow-lg hover:scale-105 transition-all"
        >
          ← Prev
        </button>
        
        <div className="flex gap-2 items-center">
          {scenes.map((scene, idx) => (
            <button
              key={scene.id}
              onClick={() => setCurrentSceneIndex(idx)}
              className={`w-8 h-8 rounded-full font-bold shadow transition-all flex items-center justify-center ${
                idx === currentSceneIndex
                  ? 'bg-white text-purple-700 scale-110'
                  : completedScenes.has(scene.id)
                  ? 'bg-green-400 text-white'
                  : 'bg-white/50 text-purple-700 hover:bg-white/70'
              }`}
            >
              {completedScenes.has(scene.id) ? '✓' : scene.emoji}
            </button>
          ))}
        </div>
        
        <button
          onClick={nextScene}
          className="px-4 py-2 bg-white/80 rounded-full font-bold text-purple-700 shadow-lg hover:scale-105 transition-all"
        >
          Next →
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={initializeScene}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
        >
          🔄 Restart
        </button>
      </div>

      {/* Win/Lose modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-bounceIn">
            {foundCount === totalDifferences ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-black text-purple-700 mb-4">You Found Them All!</h2>
                <div className="flex justify-center gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500">{formatTime(time)}</div>
                    <div className="text-sm text-gray-500">Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-pink-500">{hintsUsed}</div>
                    <div className="text-sm text-gray-500">Hints Used</div>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setShowConfetti(false)
                      nextScene()
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all"
                  >
                    Next Level 🎮
                  </button>
                  <button
                    onClick={() => {
                      setShowConfetti(false)
                      initializeScene()
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all"
                  >
                    Play Again 🔄
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">⏰</div>
                <h2 className="text-3xl font-black text-red-600 mb-4">Time&apos;s Up!</h2>
                <p className="text-gray-600 mb-4">
                  You found {foundCount} of {totalDifferences} differences
                </p>
                <button
                  onClick={() => {
                    initializeScene()
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
                >
                  Try Again 🔄
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-white/80 text-center text-sm max-w-md">
        <p>👆 Tap on differences in either image to find them!</p>
        <p>💡 Use hints if you get stuck (3 per level)</p>
      </div>

      {/* Decorative elements */}
      <div className="fixed bottom-8 left-8 text-4xl animate-bounce opacity-60">🔍</div>
      <div className="fixed bottom-12 right-8 text-3xl animate-bounce opacity-60" style={{ animationDelay: '0.3s' }}>✨</div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti ease-out forwards;
        }
        @keyframes bounceIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out;
        }
        @keyframes found {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        .animate-found {
          animation: found 0.4s ease-out;
        }
        @keyframes hint {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
        }
        .animate-hint {
          animation: hint 0.8s ease-in-out infinite;
        }
        @keyframes wrong {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
          }
        }
        .animate-wrong {
          animation: wrong 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}


// ============================================
// Game Wrapper with XP + Coins tracking
// ============================================
export default function SpotDifferenceGame() {
  return (
    <GameWrapper gameName="Spot Difference" gameId="spot-difference" emoji={"🔍"}>
      <SpotDifferenceGameInner />
    </GameWrapper>
  )
}

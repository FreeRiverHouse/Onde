'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// Types
interface ColorAction {
  pathId: string
  previousColor: string
  newColor: string
}

interface SavedArtwork {
  id: string
  templateId: string
  templateName: string
  colors: Record<string, string>
  savedAt: string
  thumbnail?: string
}

interface Template {
  id: string
  name: string
  category: 'animals' | 'nature' | 'fantasy'
  emoji: string
  paths: TemplatePath[]
  viewBox: string
}

interface TemplatePath {
  id: string
  d: string
  defaultFill: string
  stroke?: string
  strokeWidth?: number
}

// Color palette - 16 kid-friendly colors
const COLOR_PALETTE = [
  { name: 'Red', color: '#FF6B6B' },
  { name: 'Orange', color: '#FFA94D' },
  { name: 'Yellow', color: '#FFE066' },
  { name: 'Lime', color: '#A9E34B' },
  { name: 'Green', color: '#51CF66' },
  { name: 'Teal', color: '#38D9A9' },
  { name: 'Cyan', color: '#66D9E8' },
  { name: 'Sky', color: '#74C0FC' },
  { name: 'Blue', color: '#5C7CFA' },
  { name: 'Purple', color: '#9775FA' },
  { name: 'Pink', color: '#F783AC' },
  { name: 'Brown', color: '#CD853F' },
  { name: 'Tan', color: '#DEB887' },
  { name: 'Gray', color: '#ADB5BD' },
  { name: 'White', color: '#FFFFFF' },
  { name: 'Black', color: '#495057' },
]

// SVG Templates
const TEMPLATES: Template[] = [
  // Animals
  {
    id: 'butterfly',
    name: 'Butterfly',
    category: 'animals',
    emoji: '🦋',
    viewBox: '0 0 200 200',
    paths: [
      { id: 'wing-tl', d: 'M100 100 Q60 40 30 60 Q10 80 30 100 Q50 120 100 100', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'wing-tr', d: 'M100 100 Q140 40 170 60 Q190 80 170 100 Q150 120 100 100', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'wing-bl', d: 'M100 100 Q60 160 40 150 Q20 140 30 120 Q40 100 100 100', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'wing-br', d: 'M100 100 Q140 160 160 150 Q180 140 170 120 Q160 100 100 100', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'wing-spot-1', d: 'M55 70 Q65 60 75 70 Q65 80 55 70', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 1 },
      { id: 'wing-spot-2', d: 'M125 70 Q135 60 145 70 Q135 80 125 70', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 1 },
      { id: 'wing-spot-3', d: 'M50 130 Q60 120 70 130 Q60 140 50 130', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 1 },
      { id: 'wing-spot-4', d: 'M130 130 Q140 120 150 130 Q140 140 130 130', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 1 },
      { id: 'body', d: 'M95 60 L105 60 L108 100 L110 150 L100 160 L90 150 L92 100 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'head', d: 'M100 60 Q115 50 100 35 Q85 50 100 60', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'antenna-l', d: 'M95 40 Q80 20 75 15', defaultFill: 'none', stroke: '#333', strokeWidth: 2 },
      { id: 'antenna-r', d: 'M105 40 Q120 20 125 15', defaultFill: 'none', stroke: '#333', strokeWidth: 2 },
    ],
  },
  {
    id: 'fish',
    name: 'Fish',
    category: 'animals',
    emoji: '🐟',
    viewBox: '0 0 200 150',
    paths: [
      { id: 'body', d: 'M30 75 Q80 20 150 75 Q80 130 30 75', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'tail', d: 'M150 75 L180 50 L175 75 L180 100 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'fin-top', d: 'M90 50 Q100 25 110 50', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'fin-bottom', d: 'M90 100 Q100 125 110 100', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'fin-side', d: 'M70 75 Q55 90 70 105 Q80 90 70 75', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'scale-1', d: 'M85 65 Q95 55 105 65 Q95 75 85 65', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 1 },
      { id: 'scale-2', d: 'M100 75 Q110 65 120 75 Q110 85 100 75', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 1 },
      { id: 'scale-3', d: 'M85 85 Q95 75 105 85 Q95 95 85 85', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 1 },
      { id: 'eye', d: 'M55 70 A8 8 0 1 1 55 70.1', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'mouth', d: 'M35 80 Q42 85 35 90', defaultFill: 'none', stroke: '#333', strokeWidth: 2 },
    ],
  },
  {
    id: 'cat',
    name: 'Kitty',
    category: 'animals',
    emoji: '🐱',
    viewBox: '0 0 200 200',
    paths: [
      { id: 'head', d: 'M40 120 Q40 50 100 50 Q160 50 160 120 Q160 160 100 170 Q40 160 40 120', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'ear-l', d: 'M45 70 L30 30 L70 55 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'ear-r', d: 'M155 70 L170 30 L130 55 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'ear-l-inner', d: 'M50 65 L42 40 L65 57 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 1 },
      { id: 'ear-r-inner', d: 'M150 65 L158 40 L135 57 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 1 },
      { id: 'eye-l', d: 'M70 100 Q85 85 100 100 Q85 105 70 100', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'eye-r', d: 'M100 100 Q115 85 130 100 Q115 105 100 100', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'nose', d: 'M95 125 L100 135 L105 125 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'mouth-l', d: 'M100 135 Q85 145 75 140', defaultFill: 'none', stroke: '#333', strokeWidth: 2 },
      { id: 'mouth-r', d: 'M100 135 Q115 145 125 140', defaultFill: 'none', stroke: '#333', strokeWidth: 2 },
      { id: 'whisker-1', d: 'M30 115 L65 120', defaultFill: 'none', stroke: '#333', strokeWidth: 1 },
      { id: 'whisker-2', d: 'M30 130 L65 130', defaultFill: 'none', stroke: '#333', strokeWidth: 1 },
      { id: 'whisker-3', d: 'M170 115 L135 120', defaultFill: 'none', stroke: '#333', strokeWidth: 1 },
      { id: 'whisker-4', d: 'M170 130 L135 130', defaultFill: 'none', stroke: '#333', strokeWidth: 1 },
    ],
  },
  // Nature
  {
    id: 'flower',
    name: 'Flower',
    category: 'nature',
    emoji: '🌸',
    viewBox: '0 0 200 200',
    paths: [
      { id: 'petal-1', d: 'M100 100 Q80 60 100 30 Q120 60 100 100', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'petal-2', d: 'M100 100 Q140 80 165 95 Q140 115 100 100', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'petal-3', d: 'M100 100 Q130 130 125 160 Q105 140 100 100', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'petal-4', d: 'M100 100 Q70 130 75 160 Q95 140 100 100', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'petal-5', d: 'M100 100 Q60 80 35 95 Q60 115 100 100', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'center', d: 'M100 100 A20 20 0 1 1 100 100.1', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'stem', d: 'M98 120 L95 190 L105 190 L102 120', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'leaf-l', d: 'M95 155 Q60 145 50 160 Q70 175 95 165', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'leaf-r', d: 'M105 145 Q140 135 150 150 Q130 165 105 155', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
    ],
  },
  {
    id: 'tree',
    name: 'Tree',
    category: 'nature',
    emoji: '🌳',
    viewBox: '0 0 200 200',
    paths: [
      { id: 'trunk', d: 'M85 130 L80 190 L120 190 L115 130', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'foliage-bottom', d: 'M30 140 Q100 100 170 140 Q140 145 100 145 Q60 145 30 140', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'foliage-middle', d: 'M40 105 Q100 60 160 105 Q130 115 100 115 Q70 115 40 105', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'foliage-top', d: 'M55 70 Q100 25 145 70 Q120 85 100 85 Q80 85 55 70', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'apple-1', d: 'M70 100 A8 8 0 1 1 70 100.1', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 1 },
      { id: 'apple-2', d: 'M130 95 A8 8 0 1 1 130 95.1', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 1 },
      { id: 'apple-3', d: 'M100 125 A8 8 0 1 1 100 125.1', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 1 },
    ],
  },
  {
    id: 'sun',
    name: 'Sun',
    category: 'nature',
    emoji: '☀️',
    viewBox: '0 0 200 200',
    paths: [
      { id: 'center', d: 'M100 100 A40 40 0 1 1 100 100.1', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'ray-1', d: 'M100 55 L95 20 L105 20 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'ray-2', d: 'M132 68 L155 40 L162 50 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'ray-3', d: 'M145 100 L180 95 L180 105 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'ray-4', d: 'M132 132 L162 150 L155 160 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'ray-5', d: 'M100 145 L105 180 L95 180 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'ray-6', d: 'M68 132 L38 150 L45 160 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'ray-7', d: 'M55 100 L20 95 L20 105 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'ray-8', d: 'M68 68 L38 50 L45 40 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'face-eye-l', d: 'M85 90 A5 5 0 1 1 85 90.1', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'face-eye-r', d: 'M115 90 A5 5 0 1 1 115 90.1', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'face-smile', d: 'M80 110 Q100 125 120 110', defaultFill: 'none', stroke: '#333', strokeWidth: 2 },
    ],
  },
  // Fantasy
  {
    id: 'unicorn',
    name: 'Unicorn',
    category: 'fantasy',
    emoji: '🦄',
    viewBox: '0 0 200 200',
    paths: [
      { id: 'body', d: 'M40 110 Q30 90 50 80 Q100 70 140 90 Q160 100 150 120 Q140 140 100 145 Q60 145 40 130 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'head', d: 'M140 90 Q160 70 170 75 Q185 85 175 100 Q165 115 140 110', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'horn', d: 'M165 70 L175 30 L180 75', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'horn-stripe-1', d: 'M168 65 L176 45', defaultFill: 'none', stroke: '#333', strokeWidth: 1 },
      { id: 'horn-stripe-2', d: 'M170 55 L177 38', defaultFill: 'none', stroke: '#333', strokeWidth: 1 },
      { id: 'mane-1', d: 'M140 85 Q120 70 130 55 Q145 65 140 85', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'mane-2', d: 'M125 80 Q105 60 115 45 Q135 55 125 80', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'mane-3', d: 'M110 80 Q90 55 100 40 Q120 50 110 80', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'ear', d: 'M160 68 L155 50 L168 62', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'eye', d: 'M160 90 A4 4 0 1 1 160 90.1', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'leg-fl', d: 'M70 140 L65 175 L75 175 L80 140', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'leg-fr', d: 'M110 140 L105 175 L115 175 L120 140', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'leg-bl', d: 'M50 125 L45 175 L55 175 L60 125', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'leg-br', d: 'M130 130 L125 175 L135 175 L140 130', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'tail', d: 'M40 115 Q20 100 15 115 Q10 135 25 145 Q40 140 40 125', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
    ],
  },
  {
    id: 'star',
    name: 'Magic Star',
    category: 'fantasy',
    emoji: '⭐',
    viewBox: '0 0 200 200',
    paths: [
      { id: 'point-1', d: 'M100 100 L100 20 L115 70 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'point-2', d: 'M100 100 L100 20 L85 70 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'point-3', d: 'M100 100 L176 62 L135 95 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'point-4', d: 'M100 100 L176 62 L125 75 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'point-5', d: 'M100 100 L147 176 L125 125 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'point-6', d: 'M100 100 L147 176 L108 130 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'point-7', d: 'M100 100 L53 176 L92 130 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'point-8', d: 'M100 100 L53 176 L75 125 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'point-9', d: 'M100 100 L24 62 L75 75 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'point-10', d: 'M100 100 L24 62 L65 95 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'center', d: 'M100 100 A15 15 0 1 1 100 100.1', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'eye-l', d: 'M93 95 A3 3 0 1 1 93 95.1', defaultFill: '#333', stroke: '#333', strokeWidth: 1 },
      { id: 'eye-r', d: 'M107 95 A3 3 0 1 1 107 95.1', defaultFill: '#333', stroke: '#333', strokeWidth: 1 },
      { id: 'smile', d: 'M93 105 Q100 112 107 105', defaultFill: 'none', stroke: '#333', strokeWidth: 2 },
    ],
  },
  {
    id: 'castle',
    name: 'Castle',
    category: 'fantasy',
    emoji: '🏰',
    viewBox: '0 0 200 200',
    paths: [
      { id: 'wall', d: 'M30 180 L30 100 L170 100 L170 180 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'tower-l', d: 'M20 180 L20 70 L50 70 L50 180', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'tower-r', d: 'M150 180 L150 70 L180 70 L180 180', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'tower-c', d: 'M80 100 L80 50 L120 50 L120 100', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'roof-l', d: 'M15 70 L35 40 L55 70 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'roof-r', d: 'M145 70 L165 40 L185 70 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'roof-c', d: 'M75 50 L100 20 L125 50 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'door', d: 'M85 180 L85 130 Q100 120 115 130 L115 180 Z', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'window-1', d: 'M40 120 L40 100 L60 100 L60 120 Q50 125 40 120', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'window-2', d: 'M140 120 L140 100 L160 100 L160 120 Q150 125 140 120', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'window-3', d: 'M90 80 A10 10 0 1 1 110 80 A10 10 0 1 1 90 80', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'flag-l', d: 'M35 40 L35 15 L55 25 L35 35', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'flag-r', d: 'M165 40 L165 15 L185 25 L165 35', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
      { id: 'flag-c', d: 'M100 20 L100 -5 L120 5 L100 15', defaultFill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
    ],
  },
]

// Sound effects
const playSound = (type: 'fill' | 'undo' | 'save' | 'select') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'fill':
        osc.frequency.value = 800
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(1200, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'undo':
        osc.frequency.value = 500
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(300, audio.currentTime + 0.15)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
        osc.stop(audio.currentTime + 0.15)
        break
      case 'save':
        const notes = [523.25, 659.25, 783.99]
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const o = audio.createOscillator()
            const g = audio.createGain()
            o.connect(g)
            g.connect(audio.destination)
            o.frequency.value = freq
            g.gain.value = 0.15
            o.start()
            g.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
            o.stop(audio.currentTime + 0.2)
          }, i * 100)
        })
        osc.stop(0)
        break
      case 'select':
        osc.frequency.value = 600
        gain.gain.value = 0.1
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.08)
        osc.stop(audio.currentTime + 0.08)
        break
    }
  } catch {
    // Audio not supported
  }
}

// Confetti component for save celebration
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#FF6B6B', '#FFA94D', '#FFE066', '#51CF66', '#74C0FC', '#9775FA', '#F783AC']
  const confetti = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 1.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 6,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti rounded-full"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

// Template selection screen
const TemplateSelector = ({
  onSelect,
  category,
  onCategoryChange,
}: {
  onSelect: (template: Template) => void
  category: 'all' | 'animals' | 'nature' | 'fantasy'
  onCategoryChange: (cat: 'all' | 'animals' | 'nature' | 'fantasy') => void
}) => {
  const categories = [
    { id: 'all', label: 'All', emoji: '🎨' },
    { id: 'animals', label: 'Animals', emoji: '🐾' },
    { id: 'nature', label: 'Nature', emoji: '🌿' },
    { id: 'fantasy', label: 'Fantasy', emoji: '✨' },
  ] as const

  const filtered = category === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.category === category)

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Category tabs */}
      <div className="flex justify-center gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
              category === cat.id
                ? 'bg-white text-purple-700 shadow-lg scale-105'
                : 'bg-white/30 text-white hover:bg-white/50'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {filtered.map((template) => (
          <button
            key={template.id}
            onClick={() => {
              playSound('select')
              onSelect(template)
            }}
            className="bg-white rounded-2xl p-4 shadow-lg hover:scale-105 hover:shadow-xl transition-all group"
          >
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
              <svg viewBox={template.viewBox} className="w-full h-full p-2">
                {template.paths.map((path) => (
                  <path
                    key={path.id}
                    d={path.d}
                    fill={path.defaultFill}
                    stroke={path.stroke || '#333'}
                    strokeWidth={path.strokeWidth || 2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
              </svg>
            </div>
            <div className="text-center">
              <span className="text-2xl mb-1 block">{template.emoji}</span>
              <span className="font-bold text-purple-700">{template.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Gallery component
const Gallery = ({
  artworks,
  onSelect,
  onDelete,
  onClose,
}: {
  artworks: SavedArtwork[]
  onSelect: (artwork: SavedArtwork) => void
  onDelete: (id: string) => void
  onClose: () => void
}) => {
  if (artworks.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center" onClick={(e) => e.stopPropagation()}>
          <div className="text-6xl mb-4">🖼️</div>
          <h2 className="text-2xl font-black text-purple-700 mb-4">Gallery Empty</h2>
          <p className="text-gray-500 mb-6">Color some pictures and save them to see them here!</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full"
          >
            Start Coloring!
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-black text-purple-700">🖼️ My Gallery</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl">×</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {artworks.map((artwork) => {
            const template = TEMPLATES.find((t) => t.id === artwork.templateId)
            if (!template) return null

            return (
              <div key={artwork.id} className="relative group">
                <button
                  onClick={() => onSelect(artwork)}
                  className="w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-2 shadow hover:shadow-lg transition-all"
                >
                  <div className="aspect-square">
                    <svg viewBox={template.viewBox} className="w-full h-full">
                      {template.paths.map((path) => (
                        <path
                          key={path.id}
                          d={path.d}
                          fill={artwork.colors[path.id] || path.defaultFill}
                          stroke={path.stroke || '#333'}
                          strokeWidth={path.strokeWidth || 2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ))}
                    </svg>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">{artwork.templateName}</div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(artwork.id)
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Main coloring page
export default function ColoringBook() {
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null)
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0].color)
  const [colors, setColors] = useState<Record<string, string>>({})
  const [history, setHistory] = useState<ColorAction[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showGallery, setShowGallery] = useState(false)
  const [savedArtworks, setSavedArtworks] = useState<SavedArtwork[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [category, setCategory] = useState<'all' | 'animals' | 'nature' | 'fantasy'>('all')
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)

  const svgRef = useRef<SVGSVGElement>(null)

  // Load saved artworks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('coloring-book-gallery')
    if (saved) {
      try {
        setSavedArtworks(JSON.parse(saved))
      } catch {
        // Invalid data
      }
    }
  }, [])

  // Handle path click to fill color
  const handlePathClick = useCallback((pathId: string, currentFill: string) => {
    if (currentFill === 'none') return // Don't fill strokes

    const action: ColorAction = {
      pathId,
      previousColor: colors[pathId] || currentFill,
      newColor: selectedColor,
    }

    setHistory((prev) => [...prev, action])
    setColors((prev) => ({ ...prev, [pathId]: selectedColor }))

    if (soundEnabled) {
      playSound('fill')
    }
  }, [selectedColor, colors, soundEnabled])

  // Undo last action
  const handleUndo = useCallback(() => {
    if (history.length === 0) return

    const lastAction = history[history.length - 1]
    setColors((prev) => {
      const newColors = { ...prev }
      if (lastAction.previousColor === TEMPLATES.find((t) => t.paths.some((p) => p.id === lastAction.pathId))?.paths.find((p) => p.id === lastAction.pathId)?.defaultFill) {
        delete newColors[lastAction.pathId]
      } else {
        newColors[lastAction.pathId] = lastAction.previousColor
      }
      return newColors
    })
    setHistory((prev) => prev.slice(0, -1))

    if (soundEnabled) {
      playSound('undo')
    }
  }, [history, soundEnabled])

  // Clear all colors
  const handleClear = useCallback(() => {
    setColors({})
    setHistory([])
  }, [])

  // Save artwork
  const handleSave = useCallback(() => {
    if (!currentTemplate) return

    const artwork: SavedArtwork = {
      id: Date.now().toString(),
      templateId: currentTemplate.id,
      templateName: currentTemplate.name,
      colors: { ...colors },
      savedAt: new Date().toISOString(),
    }

    const newArtworks = [artwork, ...savedArtworks].slice(0, 20) // Keep max 20
    setSavedArtworks(newArtworks)
    localStorage.setItem('coloring-book-gallery', JSON.stringify(newArtworks))

    if (soundEnabled) {
      playSound('save')
    }

    setShowConfetti(true)
    setShowSaveSuccess(true)
    setTimeout(() => {
      setShowConfetti(false)
      setShowSaveSuccess(false)
    }, 2500)
  }, [currentTemplate, colors, savedArtworks, soundEnabled])

  // Download as PNG
  const handleDownload = useCallback(() => {
    if (!svgRef.current || !currentTemplate) return

    const svgElement = svgRef.current
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 800
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, 800, 800)
        ctx.drawImage(img, 0, 0, 800, 800)

        const link = document.createElement('a')
        link.download = `${currentTemplate.name.toLowerCase()}-coloring.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      }
      URL.revokeObjectURL(svgUrl)
    }
    img.src = svgUrl
  }, [currentTemplate])

  // Load artwork from gallery
  const handleLoadArtwork = useCallback((artwork: SavedArtwork) => {
    const template = TEMPLATES.find((t) => t.id === artwork.templateId)
    if (template) {
      setCurrentTemplate(template)
      setColors(artwork.colors)
      setHistory([])
      setShowGallery(false)
    }
  }, [])

  // Delete artwork
  const handleDeleteArtwork = useCallback((id: string) => {
    const newArtworks = savedArtworks.filter((a) => a.id !== id)
    setSavedArtworks(newArtworks)
    localStorage.setItem('coloring-book-gallery', JSON.stringify(newArtworks))
  }, [savedArtworks])

  // Select new template
  const handleSelectTemplate = useCallback((template: Template) => {
    setCurrentTemplate(template)
    setColors({})
    setHistory([])
  }, [])

  // Go back to template selection
  const handleBack = useCallback(() => {
    setCurrentTemplate(null)
    setColors({})
    setHistory([])
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-400 via-purple-400 to-pink-400 flex flex-col items-center p-4">
      <Confetti active={showConfetti} />

      {/* Header */}
      <Link
        href="/games"
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
      <h1 className="text-3xl md:text-5xl font-black text-white mb-2 mt-12 text-center drop-shadow-lg">
        🎨 Coloring Book
      </h1>
      <p className="text-white/90 mb-4 text-center">
        {currentTemplate ? `Tap to color ${currentTemplate.emoji}` : 'Pick a picture to color!'}
      </p>

      {!currentTemplate ? (
        // Template selection screen
        <>
          <button
            onClick={() => setShowGallery(true)}
            className="mb-4 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
          >
            🖼️ My Gallery ({savedArtworks.length})
          </button>
          <TemplateSelector
            onSelect={handleSelectTemplate}
            category={category}
            onCategoryChange={setCategory}
          />
        </>
      ) : (
        // Coloring interface
        <div className="w-full max-w-lg mx-auto flex flex-col items-center">
          {/* Canvas area */}
          <div className="bg-white rounded-3xl p-4 shadow-2xl w-full mb-4">
            <svg
              ref={svgRef}
              viewBox={currentTemplate.viewBox}
              className="w-full aspect-square"
              style={{ touchAction: 'manipulation' }}
            >
              {/* Background */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              
              {/* Paths */}
              {currentTemplate.paths.map((path) => (
                <path
                  key={path.id}
                  d={path.d}
                  fill={colors[path.id] || path.defaultFill}
                  stroke={path.stroke || '#333'}
                  strokeWidth={path.strokeWidth || 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  onClick={() => handlePathClick(path.id, path.defaultFill)}
                  className={path.defaultFill !== 'none' ? 'cursor-pointer hover:brightness-95 transition-all' : ''}
                  style={{ pointerEvents: path.defaultFill === 'none' ? 'none' : 'auto' }}
                />
              ))}
            </svg>
          </div>

          {/* Color palette */}
          <div className="bg-white/90 rounded-2xl p-3 shadow-lg w-full mb-4">
            <div className="grid grid-cols-8 gap-2">
              {COLOR_PALETTE.map((item) => (
                <button
                  key={item.color}
                  onClick={() => {
                    setSelectedColor(item.color)
                    if (soundEnabled) playSound('select')
                  }}
                  className={`w-full aspect-square rounded-xl transition-all ${
                    selectedColor === item.color
                      ? 'scale-110 ring-4 ring-purple-500 ring-offset-2'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: item.color }}
                  title={item.name}
                >
                  {selectedColor === item.color && (
                    <span className={`text-xs ${item.color === '#FFFFFF' || item.color === '#FFE066' ? 'text-gray-800' : 'text-white'}`}>
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-white/90 text-purple-700 font-bold rounded-full shadow-lg hover:scale-105 transition-all"
            >
              ← Templates
            </button>
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className={`px-4 py-2 bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-bold rounded-full shadow-lg transition-all ${
                history.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
            >
              ↩️ Undo
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gradient-to-r from-red-400 to-pink-400 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
            >
              🗑️ Clear
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
            >
              💾 Save
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-gradient-to-r from-blue-400 to-indigo-400 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
            >
              📥 Download
            </button>
            <button
              onClick={() => setShowGallery(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
            >
              🖼️ Gallery
            </button>
          </div>
        </div>
      )}

      {/* Save success toast */}
      {showSaveSuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-lg animate-bounce z-50">
          ✅ Saved to Gallery!
        </div>
      )}

      {/* Gallery modal */}
      {showGallery && (
        <Gallery
          artworks={savedArtworks}
          onSelect={handleLoadArtwork}
          onDelete={handleDeleteArtwork}
          onClose={() => setShowGallery(false)}
        />
      )}

      {/* Decorative elements */}
      <div className="fixed bottom-8 left-8 text-4xl animate-bounce opacity-60 pointer-events-none">🖌️</div>
      <div className="fixed bottom-12 right-8 text-3xl animate-bounce opacity-60 pointer-events-none" style={{ animationDelay: '0.3s' }}>🎨</div>
      <div className="fixed top-24 right-16 text-2xl animate-bounce opacity-40 pointer-events-none" style={{ animationDelay: '0.6s' }}>✨</div>

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
      `}</style>
    </div>
  )
}

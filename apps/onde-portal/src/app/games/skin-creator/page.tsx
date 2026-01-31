'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { generateAndConvertSkin, isAIAvailable } from '../lib/aiSkinGenerator';
import { enhancePromptWithLLM, checkLocalLLM } from '../lib/localLLM';

// 🎨 Premium UX Polish CSS
import './skin-creator-premium.css';

// Lazy load 3D preview to avoid SSR issues
const SkinPreview3D = dynamic(() => import('../components/SkinPreview3D'), { ssr: false });

// Confetti on download!
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

// Gallery component
const SkinGallery = dynamic(() => import('../components/SkinGallery'), { ssr: false });

// View modes
type ViewMode = 'editor' | 'gallery';

// Layer definitions for the skin editor
type LayerType = 'base' | 'details' | 'accessories';

interface Layer {
  id: LayerType;
  name: string;
  emoji: string;
  visible: boolean;
  opacity: number;
  tint: string | null; // Color tint/overlay (hex color or null for no tint)
  tintIntensity: number; // Tint intensity 0-100%
  glow: boolean; // Glow effect on layer
}

// 🔄 History state for undo/redo - tracks all layer states
interface HistoryState {
  layers: { [key in LayerType]?: ImageData };
  composite: ImageData;
  timestamp: number;
}

const DEFAULT_LAYERS: Layer[] = [
  { id: 'base', name: 'Base (Skin)', emoji: '👤', visible: true, opacity: 100, tint: null, tintIntensity: 50, glow: false },
  { id: 'details', name: 'Details', emoji: '✏️', visible: true, opacity: 100, tint: null, tintIntensity: 50, glow: false },
  { id: 'accessories', name: 'Accessories', emoji: '🎩', visible: true, opacity: 100, tint: null, tintIntensity: 50, glow: false },
];

// Preset tint colors for quick selection
const TINT_PRESETS = [
  { color: null, name: 'None', emoji: '⭕' },
  { color: '#FF6B6B', name: 'Red', emoji: '🔴' },
  { color: '#FFD93D', name: 'Gold', emoji: '🟡' },
  { color: '#4D96FF', name: 'Blue', emoji: '🔵' },
  { color: '#6BCB77', name: 'Green', emoji: '🟢' },
  { color: '#9B59B6', name: 'Purple', emoji: '🟣' },
  { color: '#FF8E53', name: 'Orange', emoji: '🟠' },
  { color: '#00BCD4', name: 'Cyan', emoji: '🩵' },
  { color: '#E91E63', name: 'Pink', emoji: '💗' },
];

// 🎨 Color Palette Presets - Quick-select themed color sets
const COLOR_PALETTE_PRESETS = [
  { 
    id: 'sunset', 
    name: 'Sunset', 
    emoji: '🌅',
    colors: ['#FF6B35', '#FF4500', '#FF8C00', '#FFD700', '#FFAE42', '#E74C3C']
  },
  { 
    id: 'ocean', 
    name: 'Ocean', 
    emoji: '🌊',
    colors: ['#006994', '#00CED1', '#20B2AA', '#40E0D0', '#48D1CC', '#5F9EA0']
  },
  { 
    id: 'forest', 
    name: 'Forest', 
    emoji: '🌲',
    colors: ['#228B22', '#8B4513', '#6B8E23', '#556B2F', '#2E8B57', '#8FBC8F']
  },
  { 
    id: 'galaxy', 
    name: 'Galaxy', 
    emoji: '🌌',
    colors: ['#9B59B6', '#3498DB', '#E91E63', '#8E44AD', '#2980B9', '#C0392B']
  },
];

// 🎭 Pattern Presets - One-click cool patterns for kids!
type PatternType = 'stripes-h' | 'stripes-v' | 'stripes-diag' | 'dots' | 'gradient-v' | 'gradient-h' | 'gradient-radial' | 'camo' | 'galaxy' | 'checkers' | 'rainbow' | 'fire' | 'ice' | 'pixel-noise';

interface PatternPreset {
  id: PatternType;
  name: string;
  emoji: string;
  description: string;
  colors?: string[]; // Optional default colors for the pattern
}

const PATTERN_PRESETS: PatternPreset[] = [
  { id: 'stripes-h', name: 'Stripes H', emoji: '➖', description: 'Horizontal stripes' },
  { id: 'stripes-v', name: 'Stripes V', emoji: '|', description: 'Vertical stripes' },
  { id: 'stripes-diag', name: 'Diagonal', emoji: '╱', description: 'Diagonal stripes' },
  { id: 'dots', name: 'Dots', emoji: '⚫', description: 'Polka dots pattern' },
  { id: 'checkers', name: 'Checkers', emoji: '🏁', description: 'Checkerboard pattern' },
  { id: 'gradient-v', name: 'Gradient ↓', emoji: '🌈', description: 'Vertical gradient' },
  { id: 'gradient-h', name: 'Gradient →', emoji: '🎨', description: 'Horizontal gradient' },
  { id: 'gradient-radial', name: 'Radial', emoji: '🔵', description: 'Radial gradient from center' },
  { id: 'camo', name: 'Camo', emoji: '🪖', description: 'Military camouflage' },
  { id: 'galaxy', name: 'Galaxy', emoji: '🌌', description: 'Space with stars!' },
  { id: 'rainbow', name: 'Rainbow', emoji: '🏳️‍🌈', description: 'Full rainbow colors!' },
  { id: 'fire', name: 'Fire', emoji: '🔥', description: 'Hot flames pattern!', colors: ['#FF0000', '#FF4500', '#FF8C00', '#FFD700'] },
  { id: 'ice', name: 'Ice', emoji: '❄️', description: 'Frozen ice crystals!', colors: ['#E0FFFF', '#87CEEB', '#4169E1', '#00008B'] },
  { id: 'pixel-noise', name: 'Pixel Noise', emoji: '📺', description: 'Random pixel texture' },
];

// 🎨 STICKER/DECAL LIBRARY - Decorative elements to apply on skins!
// Each sticker is a multi-color pixel pattern that can be placed anywhere
type StickerCategory = 'hearts' | 'stars' | 'flames' | 'wings' | 'symbols' | 'nature';

interface StickerDecal {
  id: string;
  name: string;
  emoji: string;
  category: StickerCategory;
  width: number;
  height: number;
  // Pixel data: 2D array where each cell is a hex color or null (transparent)
  pixels: (string | null)[][];
}

const STICKER_CATEGORIES: { id: StickerCategory; name: string; emoji: string }[] = [
  { id: 'hearts', name: 'Hearts', emoji: '❤️' },
  { id: 'stars', name: 'Stars', emoji: '⭐' },
  { id: 'flames', name: 'Flames', emoji: '🔥' },
  { id: 'wings', name: 'Wings', emoji: '🪽' },
  { id: 'symbols', name: 'Symbols', emoji: '⚡' },
  { id: 'nature', name: 'Nature', emoji: '🌸' },
];

const STICKER_DECALS: StickerDecal[] = [
  // ❤️ HEARTS
  {
    id: 'heart-small',
    name: 'Mini Heart',
    emoji: '💕',
    category: 'hearts',
    width: 5,
    height: 4,
    pixels: [
      [null, '#FF0000', null, '#FF0000', null],
      ['#FF0000', '#FF6B6B', '#FF0000', '#FF6B6B', '#FF0000'],
      [null, '#FF0000', '#FF0000', '#FF0000', null],
      [null, null, '#FF0000', null, null],
    ],
  },
  {
    id: 'heart-big',
    name: 'Big Heart',
    emoji: '❤️',
    category: 'hearts',
    width: 7,
    height: 6,
    pixels: [
      [null, '#FF0000', '#FF0000', null, '#FF0000', '#FF0000', null],
      ['#FF0000', '#FF6B6B', '#FF0000', '#FF0000', '#FF6B6B', '#FF0000', '#FF0000'],
      ['#FF0000', '#FF0000', '#FF0000', '#FF0000', '#FF0000', '#FF0000', '#FF0000'],
      [null, '#FF0000', '#FF0000', '#FF0000', '#FF0000', '#FF0000', null],
      [null, null, '#FF0000', '#FF0000', '#FF0000', null, null],
      [null, null, null, '#CC0000', null, null, null],
    ],
  },
  {
    id: 'heart-pixel',
    name: 'Pixel Heart',
    emoji: '💗',
    category: 'hearts',
    width: 7,
    height: 6,
    pixels: [
      [null, '#FF69B4', '#FF69B4', null, '#FF69B4', '#FF69B4', null],
      ['#FF69B4', '#FFB6C1', '#FF69B4', '#FF69B4', '#FFB6C1', '#FF69B4', '#FF69B4'],
      ['#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4'],
      [null, '#FF1493', '#FF69B4', '#FF69B4', '#FF69B4', '#FF1493', null],
      [null, null, '#FF1493', '#FF69B4', '#FF1493', null, null],
      [null, null, null, '#C71585', null, null, null],
    ],
  },
  {
    id: 'broken-heart',
    name: 'Broken Heart',
    emoji: '💔',
    category: 'hearts',
    width: 7,
    height: 6,
    pixels: [
      [null, '#8B0000', '#8B0000', null, '#8B0000', '#8B0000', null],
      ['#8B0000', '#FF0000', '#8B0000', null, '#FF0000', '#8B0000', '#8B0000'],
      ['#8B0000', '#8B0000', null, '#000000', null, '#8B0000', '#8B0000'],
      [null, '#8B0000', null, '#000000', null, '#8B0000', null],
      [null, null, '#8B0000', null, '#8B0000', null, null],
      [null, null, null, '#660000', null, null, null],
    ],
  },
  // ⭐ STARS
  {
    id: 'star-small',
    name: 'Mini Star',
    emoji: '✨',
    category: 'stars',
    width: 5,
    height: 5,
    pixels: [
      [null, null, '#FFD700', null, null],
      [null, '#FFD700', '#FFFF00', '#FFD700', null],
      ['#FFD700', '#FFFF00', '#FFFF00', '#FFFF00', '#FFD700'],
      [null, '#FFD700', '#FFFF00', '#FFD700', null],
      [null, null, '#FFD700', null, null],
    ],
  },
  {
    id: 'star-big',
    name: 'Big Star',
    emoji: '⭐',
    category: 'stars',
    width: 7,
    height: 7,
    pixels: [
      [null, null, null, '#FFD700', null, null, null],
      [null, null, '#FFD700', '#FFFF00', '#FFD700', null, null],
      [null, '#FFD700', '#FFFF00', '#FFFF00', '#FFFF00', '#FFD700', null],
      ['#FFD700', '#FFFF00', '#FFFF00', '#FFFFFF', '#FFFF00', '#FFFF00', '#FFD700'],
      [null, '#FFD700', '#FFFF00', '#FFFF00', '#FFFF00', '#FFD700', null],
      [null, null, '#FFD700', '#FFFF00', '#FFD700', null, null],
      [null, null, null, '#FFA500', null, null, null],
    ],
  },
  {
    id: 'shooting-star',
    name: 'Shooting Star',
    emoji: '🌠',
    category: 'stars',
    width: 8,
    height: 5,
    pixels: [
      [null, null, null, null, null, '#FFD700', '#FFFF00', '#FFD700'],
      [null, null, null, '#FFFFFF', '#FFD700', '#FFFF00', '#FFD700', null],
      ['#CCCCCC', '#FFFFFF', '#FFFFFF', '#FFD700', '#FFFF00', '#FFFF00', null, null],
      [null, null, null, '#FFFFFF', '#FFD700', '#FFFF00', '#FFD700', null],
      [null, null, null, null, null, '#FFD700', '#FFFF00', '#FFD700'],
    ],
  },
  {
    id: 'sparkle',
    name: 'Sparkle',
    emoji: '💫',
    category: 'stars',
    width: 5,
    height: 5,
    pixels: [
      [null, null, '#FFFFFF', null, null],
      [null, '#87CEEB', '#FFFFFF', '#87CEEB', null],
      ['#FFFFFF', '#FFFFFF', '#E0FFFF', '#FFFFFF', '#FFFFFF'],
      [null, '#87CEEB', '#FFFFFF', '#87CEEB', null],
      [null, null, '#FFFFFF', null, null],
    ],
  },
  // 🔥 FLAMES
  {
    id: 'flame-small',
    name: 'Small Flame',
    emoji: '🔥',
    category: 'flames',
    width: 5,
    height: 6,
    pixels: [
      [null, null, '#FF4500', null, null],
      [null, '#FF4500', '#FF8C00', '#FF4500', null],
      [null, '#FF4500', '#FFD700', '#FF4500', null],
      ['#FF0000', '#FF4500', '#FFD700', '#FF4500', '#FF0000'],
      ['#FF0000', '#FF4500', '#FF8C00', '#FF4500', '#FF0000'],
      [null, '#8B0000', '#FF0000', '#8B0000', null],
    ],
  },
  {
    id: 'flame-big',
    name: 'Big Flame',
    emoji: '🔥',
    category: 'flames',
    width: 7,
    height: 8,
    pixels: [
      [null, null, null, '#FF4500', null, null, null],
      [null, null, '#FF4500', '#FF8C00', '#FF4500', null, null],
      [null, '#FF4500', '#FF8C00', '#FFD700', '#FF8C00', '#FF4500', null],
      [null, '#FF4500', '#FFD700', '#FFFF00', '#FFD700', '#FF4500', null],
      ['#FF0000', '#FF4500', '#FFD700', '#FFFF00', '#FFD700', '#FF4500', '#FF0000'],
      ['#FF0000', '#FF4500', '#FF8C00', '#FFD700', '#FF8C00', '#FF4500', '#FF0000'],
      ['#8B0000', '#FF0000', '#FF4500', '#FF8C00', '#FF4500', '#FF0000', '#8B0000'],
      [null, '#8B0000', '#FF0000', '#FF0000', '#FF0000', '#8B0000', null],
    ],
  },
  {
    id: 'blue-flame',
    name: 'Blue Flame',
    emoji: '🔵',
    category: 'flames',
    width: 5,
    height: 6,
    pixels: [
      [null, null, '#00BFFF', null, null],
      [null, '#00BFFF', '#87CEEB', '#00BFFF', null],
      [null, '#0000FF', '#00BFFF', '#0000FF', null],
      ['#000080', '#0000FF', '#00BFFF', '#0000FF', '#000080'],
      ['#000080', '#0000FF', '#4169E1', '#0000FF', '#000080'],
      [null, '#00008B', '#000080', '#00008B', null],
    ],
  },
  {
    id: 'fire-trail',
    name: 'Fire Trail',
    emoji: '🔥',
    category: 'flames',
    width: 8,
    height: 4,
    pixels: [
      [null, '#FF4500', null, null, '#FF4500', null, null, '#FF8C00'],
      ['#FF0000', '#FF8C00', '#FF4500', '#FFD700', '#FF8C00', '#FF4500', '#FF8C00', '#FFD700'],
      ['#8B0000', '#FF0000', '#FF4500', '#FF8C00', '#FF4500', '#FF0000', '#FF4500', '#FF8C00'],
      [null, '#8B0000', '#FF0000', '#FF0000', '#8B0000', null, '#8B0000', '#FF0000'],
    ],
  },
  // 🪽 WINGS
  {
    id: 'angel-wing-left',
    name: 'Angel Wing L',
    emoji: '🪽',
    category: 'wings',
    width: 6,
    height: 8,
    pixels: [
      [null, null, null, null, '#FFFFFF', null],
      [null, null, null, '#FFFFFF', '#F0F0F0', '#FFFFFF'],
      [null, null, '#FFFFFF', '#F0F0F0', '#E0E0E0', '#F0F0F0'],
      [null, '#FFFFFF', '#F0F0F0', '#E0E0E0', '#D0D0D0', '#E0E0E0'],
      ['#FFFFFF', '#F0F0F0', '#E0E0E0', '#D0D0D0', '#E0E0E0', null],
      ['#F0F0F0', '#E0E0E0', '#D0D0D0', '#E0E0E0', null, null],
      [null, '#E0E0E0', '#D0D0D0', '#E0E0E0', null, null],
      [null, null, '#D0D0D0', null, null, null],
    ],
  },
  {
    id: 'angel-wing-right',
    name: 'Angel Wing R',
    emoji: '🪽',
    category: 'wings',
    width: 6,
    height: 8,
    pixels: [
      [null, '#FFFFFF', null, null, null, null],
      ['#FFFFFF', '#F0F0F0', '#FFFFFF', null, null, null],
      ['#F0F0F0', '#E0E0E0', '#F0F0F0', '#FFFFFF', null, null],
      ['#E0E0E0', '#D0D0D0', '#E0E0E0', '#F0F0F0', '#FFFFFF', null],
      [null, '#E0E0E0', '#D0D0D0', '#E0E0E0', '#F0F0F0', '#FFFFFF'],
      [null, null, '#E0E0E0', '#D0D0D0', '#E0E0E0', '#F0F0F0'],
      [null, null, '#E0E0E0', '#D0D0D0', '#E0E0E0', null],
      [null, null, null, '#D0D0D0', null, null],
    ],
  },
  {
    id: 'demon-wing-left',
    name: 'Demon Wing L',
    emoji: '🦇',
    category: 'wings',
    width: 7,
    height: 8,
    pixels: [
      [null, null, null, null, null, '#2D0A0A', null],
      [null, null, null, null, '#2D0A0A', '#1A0505', '#2D0A0A'],
      [null, null, null, '#2D0A0A', '#1A0505', '#2D0A0A', '#1A0505'],
      [null, null, '#2D0A0A', '#1A0505', '#2D0A0A', '#1A0505', null],
      [null, '#2D0A0A', '#1A0505', '#2D0A0A', '#1A0505', null, null],
      ['#2D0A0A', '#1A0505', '#2D0A0A', '#400000', null, null, null],
      ['#1A0505', '#2D0A0A', '#400000', '#2D0A0A', null, null, null],
      [null, '#400000', '#2D0A0A', null, null, null, null],
    ],
  },
  {
    id: 'demon-wing-right',
    name: 'Demon Wing R',
    emoji: '🦇',
    category: 'wings',
    width: 7,
    height: 8,
    pixels: [
      [null, '#2D0A0A', null, null, null, null, null],
      ['#2D0A0A', '#1A0505', '#2D0A0A', null, null, null, null],
      ['#1A0505', '#2D0A0A', '#1A0505', '#2D0A0A', null, null, null],
      [null, '#1A0505', '#2D0A0A', '#1A0505', '#2D0A0A', null, null],
      [null, null, '#1A0505', '#2D0A0A', '#1A0505', '#2D0A0A', null],
      [null, null, null, '#400000', '#2D0A0A', '#1A0505', '#2D0A0A'],
      [null, null, null, '#2D0A0A', '#400000', '#2D0A0A', '#1A0505'],
      [null, null, null, null, '#2D0A0A', '#400000', null],
    ],
  },
  {
    id: 'fairy-wing',
    name: 'Fairy Wing',
    emoji: '🧚',
    category: 'wings',
    width: 5,
    height: 7,
    pixels: [
      [null, null, '#E0FFFF', null, null],
      [null, '#E0FFFF', '#87CEEB', '#E0FFFF', null],
      ['#E0FFFF', '#87CEEB', '#B0E0E6', '#87CEEB', '#E0FFFF'],
      ['#87CEEB', '#B0E0E6', '#E0FFFF', '#B0E0E6', '#87CEEB'],
      [null, '#87CEEB', '#B0E0E6', '#87CEEB', null],
      [null, null, '#87CEEB', null, null],
      [null, null, '#B0E0E6', null, null],
    ],
  },
  // ⚡ SYMBOLS
  {
    id: 'lightning',
    name: 'Lightning',
    emoji: '⚡',
    category: 'symbols',
    width: 5,
    height: 7,
    pixels: [
      [null, null, '#FFD700', '#FFFF00', '#FFD700'],
      [null, '#FFD700', '#FFFF00', '#FFD700', null],
      ['#FFD700', '#FFFF00', '#FFFF00', null, null],
      ['#FFFF00', '#FFFF00', '#FFFF00', '#FFD700', null],
      [null, null, '#FFFF00', '#FFD700', null],
      [null, '#FFD700', '#FFFF00', null, null],
      ['#FFA500', '#FFD700', null, null, null],
    ],
  },
  {
    id: 'skull',
    name: 'Skull',
    emoji: '💀',
    category: 'symbols',
    width: 6,
    height: 6,
    pixels: [
      [null, '#FFFFFF', '#F0F0F0', '#F0F0F0', '#FFFFFF', null],
      ['#FFFFFF', '#000000', '#F0F0F0', '#F0F0F0', '#000000', '#FFFFFF'],
      ['#F0F0F0', '#000000', '#FFFFFF', '#FFFFFF', '#000000', '#F0F0F0'],
      ['#F0F0F0', '#F0F0F0', '#F0F0F0', '#F0F0F0', '#F0F0F0', '#F0F0F0'],
      [null, '#E0E0E0', '#000000', '#000000', '#E0E0E0', null],
      [null, null, '#D0D0D0', '#D0D0D0', null, null],
    ],
  },
  {
    id: 'crown',
    name: 'Crown',
    emoji: '👑',
    category: 'symbols',
    width: 7,
    height: 5,
    pixels: [
      ['#FFD700', null, '#FFD700', null, '#FFD700', null, '#FFD700'],
      ['#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700'],
      ['#FFA500', '#FFD700', '#FF0000', '#FFD700', '#FF0000', '#FFD700', '#FFA500'],
      ['#FFA500', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFA500'],
      [null, '#B8860B', '#B8860B', '#B8860B', '#B8860B', '#B8860B', null],
    ],
  },
  {
    id: 'diamond-gem',
    name: 'Diamond',
    emoji: '💎',
    category: 'symbols',
    width: 7,
    height: 6,
    pixels: [
      [null, null, '#87CEEB', '#E0FFFF', '#87CEEB', null, null],
      [null, '#87CEEB', '#B0E0E6', '#E0FFFF', '#B0E0E6', '#87CEEB', null],
      ['#4169E1', '#87CEEB', '#B0E0E6', '#FFFFFF', '#B0E0E6', '#87CEEB', '#4169E1'],
      [null, '#4169E1', '#87CEEB', '#B0E0E6', '#87CEEB', '#4169E1', null],
      [null, null, '#4169E1', '#87CEEB', '#4169E1', null, null],
      [null, null, null, '#00008B', null, null, null],
    ],
  },
  {
    id: 'sword',
    name: 'Sword',
    emoji: '⚔️',
    category: 'symbols',
    width: 3,
    height: 8,
    pixels: [
      [null, '#C0C0C0', null],
      [null, '#E0E0E0', null],
      [null, '#E0E0E0', null],
      [null, '#C0C0C0', null],
      [null, '#E0E0E0', null],
      ['#8B4513', '#FFD700', '#8B4513'],
      [null, '#8B4513', null],
      [null, '#654321', null],
    ],
  },
  // 🌸 NATURE
  {
    id: 'flower',
    name: 'Flower',
    emoji: '🌸',
    category: 'nature',
    width: 5,
    height: 5,
    pixels: [
      [null, '#FF69B4', null, '#FF69B4', null],
      ['#FF69B4', '#FFB6C1', '#FF69B4', '#FFB6C1', '#FF69B4'],
      [null, '#FF69B4', '#FFFF00', '#FF69B4', null],
      ['#FF69B4', '#FFB6C1', '#FF69B4', '#FFB6C1', '#FF69B4'],
      [null, '#FF69B4', null, '#FF69B4', null],
    ],
  },
  {
    id: 'rose',
    name: 'Rose',
    emoji: '🌹',
    category: 'nature',
    width: 5,
    height: 7,
    pixels: [
      [null, '#FF0000', '#FF4444', '#FF0000', null],
      ['#FF0000', '#FF4444', '#FF0000', '#FF4444', '#FF0000'],
      ['#CC0000', '#FF0000', '#FF4444', '#FF0000', '#CC0000'],
      [null, '#CC0000', '#FF0000', '#CC0000', null],
      [null, null, '#228B22', null, null],
      [null, '#228B22', '#228B22', null, null],
      [null, null, '#228B22', null, null],
    ],
  },
  {
    id: 'leaf',
    name: 'Leaf',
    emoji: '🍃',
    category: 'nature',
    width: 5,
    height: 6,
    pixels: [
      [null, null, '#228B22', null, null],
      [null, '#228B22', '#32CD32', '#228B22', null],
      ['#228B22', '#32CD32', '#90EE90', '#32CD32', '#228B22'],
      [null, '#228B22', '#32CD32', '#228B22', null],
      [null, null, '#228B22', null, null],
      [null, null, '#8B4513', null, null],
    ],
  },
  {
    id: 'sun',
    name: 'Sun',
    emoji: '☀️',
    category: 'nature',
    width: 7,
    height: 7,
    pixels: [
      [null, null, null, '#FFD700', null, null, null],
      [null, '#FFD700', null, '#FFFF00', null, '#FFD700', null],
      [null, null, '#FFFF00', '#FFFF00', '#FFFF00', null, null],
      ['#FFD700', '#FFFF00', '#FFFF00', '#FFFFFF', '#FFFF00', '#FFFF00', '#FFD700'],
      [null, null, '#FFFF00', '#FFFF00', '#FFFF00', null, null],
      [null, '#FFD700', null, '#FFFF00', null, '#FFD700', null],
      [null, null, null, '#FFD700', null, null, null],
    ],
  },
  {
    id: 'moon',
    name: 'Moon',
    emoji: '🌙',
    category: 'nature',
    width: 5,
    height: 6,
    pixels: [
      [null, null, '#F0E68C', '#FFD700', null],
      [null, '#F0E68C', '#FFFF00', null, null],
      ['#F0E68C', '#FFFF00', null, null, null],
      ['#F0E68C', '#FFFF00', null, null, null],
      [null, '#F0E68C', '#FFFF00', null, null],
      [null, null, '#F0E68C', '#FFD700', null],
    ],
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    emoji: '❄️',
    category: 'nature',
    width: 7,
    height: 7,
    pixels: [
      [null, null, null, '#E0FFFF', null, null, null],
      [null, '#87CEEB', null, '#E0FFFF', null, '#87CEEB', null],
      [null, null, '#B0E0E6', '#E0FFFF', '#B0E0E6', null, null],
      ['#E0FFFF', '#E0FFFF', '#E0FFFF', '#FFFFFF', '#E0FFFF', '#E0FFFF', '#E0FFFF'],
      [null, null, '#B0E0E6', '#E0FFFF', '#B0E0E6', null, null],
      [null, '#87CEEB', null, '#E0FFFF', null, '#87CEEB', null],
      [null, null, null, '#E0FFFF', null, null, null],
    ],
  },
];

// Multi-game support
type GameType = 'minecraft' | 'roblox';

interface GameConfig {
  name: string;
  emoji: string;
  width: number;
  height: number;
  exportFormat: string;
}

const GAME_CONFIGS: Record<GameType, GameConfig> = {
  minecraft: {
    name: 'Minecraft',
    emoji: '⛏️',
    width: 64,
    height: 64,
    exportFormat: 'PNG 64x64',
  },
  roblox: {
    name: 'Roblox',
    emoji: '🎮',
    width: 128,
    height: 128,
    exportFormat: 'PNG 128x128',
  },
};

// Minecraft skin layout (64x64)
// The skin is divided into body parts with specific regions
const BODY_PARTS = {
  head: { x: 0, y: 0, w: 32, h: 16, label: '🗣️ Head' },
  body: { x: 16, y: 16, w: 24, h: 16, label: '👕 Body' },
  rightArm: { x: 40, y: 16, w: 16, h: 16, label: '💪 Right Arm' },
  leftArm: { x: 32, y: 48, w: 16, h: 16, label: '🤛 Left Arm' },
  rightLeg: { x: 0, y: 16, w: 16, h: 16, label: '🦵 Right Leg' },
  leftLeg: { x: 16, y: 48, w: 16, h: 16, label: '🦿 Left Leg' },
};

// Overlay regions in Minecraft skin format (the "hat" layer / outer layer)
// These overlay on top of the base parts - available for future accessory layer enhancements
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OVERLAY_REGIONS = {
  headOverlay: { x: 32, y: 0, w: 32, h: 16, label: '🎩 Head Overlay' },
  bodyOverlay: { x: 16, y: 32, w: 24, h: 16, label: '🧥 Body Overlay' },
  rightArmOverlay: { x: 40, y: 32, w: 16, h: 16, label: '🧤 Right Arm Overlay' },
  leftArmOverlay: { x: 48, y: 48, w: 16, h: 16, label: '🧤 Left Arm Overlay' },
  rightLegOverlay: { x: 0, y: 32, w: 16, h: 16, label: '👖 Right Leg Overlay' },
  leftLegOverlay: { x: 0, y: 48, w: 16, h: 16, label: '👖 Left Leg Overlay' },
};

// Skin templates
const TEMPLATES = {
  steve: {
    name: '👦 Steve',
    skin: '#c4a57b', hair: '#442920', shirt: '#00a8a8', pants: '#3c2a5e', shoes: '#444444', eyes: '#ffffff', pupils: '#5a3825',
  },
  robot: {
    name: '🤖 Robot',
    skin: '#8a8a8a', hair: '#444444', shirt: '#3498db', pants: '#2c3e50', shoes: '#1a1a1a', eyes: '#00ff00', pupils: '#00aa00',
  },
  ninja: {
    name: '🥷 Ninja',
    skin: '#c4a57b', hair: '#1a1a1a', shirt: '#1a1a1a', pants: '#1a1a1a', shoes: '#2c2c2c', eyes: '#ffffff', pupils: '#000000',
  },
  alien: {
    name: '👽 Alien',
    skin: '#7dcea0', hair: '#27ae60', shirt: '#9b59b6', pants: '#8e44ad', shoes: '#6c3483', eyes: '#000000', pupils: '#1a1a1a',
  },
  princess: {
    name: '👸 Princess',
    skin: '#ffdfc4', hair: '#f1c40f', shirt: '#e91e63', pants: '#9c27b0', shoes: '#ff69b4', eyes: '#87ceeb', pupils: '#4169e1',
  },
  zombie: {
    name: '🧟 Zombie',
    skin: '#5a8f5a', hair: '#2d4a2d', shirt: '#00a8a8', pants: '#3c2a5e', shoes: '#444444', eyes: '#1a1a1a', pupils: '#000000',
  },
  creeper: {
    name: '💚 Creeper',
    skin: '#5ba555', hair: '#3d7a3d', shirt: '#4a934a', pants: '#3d7a3d', shoes: '#2d5a2d', eyes: '#000000', pupils: '#000000',
  },
  pirate: {
    name: '🏴‍☠️ Pirate',
    skin: '#c4956a', hair: '#1a1a1a', shirt: '#8b0000', pants: '#2c2c2c', shoes: '#3d2314', eyes: '#ffffff', pupils: '#2c1810',
  },
  astronaut: {
    name: '🚀 Astronaut',
    skin: '#e8e8e8', hair: '#c0c0c0', shirt: '#ffffff', pants: '#e0e0e0', shoes: '#a8a8a8', eyes: '#4da6ff', pupils: '#0066cc',
  },
  superhero: {
    name: '🦸 Superhero',
    skin: '#d4a76a', hair: '#2c1810', shirt: '#dc143c', pants: '#00008b', shoes: '#ffd700', eyes: '#ffffff', pupils: '#1a1a1a',
  },
  knight: {
    name: '⚔️ Knight',
    skin: '#d4a76a', hair: '#4a3728', shirt: '#7f8c8d', pants: '#5d6d7e', shoes: '#2c3e50', eyes: '#ffffff', pupils: '#3d3d3d',
  },
  mermaid: {
    name: '🧜 Mermaid',
    skin: '#a8e6cf', hair: '#40e0d0', shirt: '#20b2aa', pants: '#9b59b6', shoes: '#8e44ad', eyes: '#e0ffff', pupils: '#00ced1',
  },
};

// Legacy alias (for backwards compatibility)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const STEVE_TEMPLATE = TEMPLATES.steve;

// 🎮 CHARACTER TEMPLATES - Pre-made base skins for kids to customize!
// These are PNG images that kids can start from instead of blank canvas
interface CharacterTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  imagePath: string;
  tags: string[];
}

const CHARACTER_TEMPLATES: CharacterTemplate[] = [
  {
    id: 'steve',
    name: 'Steve',
    emoji: '👦',
    description: 'The classic Minecraft hero!',
    imagePath: '/games/skin-templates/steve.png',
    tags: ['classic', 'human', 'boy'],
  },
  {
    id: 'alex',
    name: 'Alex',
    emoji: '👧',
    description: 'Brave adventurer with orange hair!',
    imagePath: '/games/skin-templates/alex.png',
    tags: ['classic', 'human', 'girl'],
  },
  {
    id: 'zombie',
    name: 'Zombie',
    emoji: '🧟',
    description: 'Spooky green zombie!',
    imagePath: '/games/skin-templates/zombie.png',
    tags: ['monster', 'spooky', 'green'],
  },
  {
    id: 'creeper',
    name: 'Creeper',
    emoji: '💚',
    description: 'Sssss... The iconic Creeper!',
    imagePath: '/games/skin-templates/creeper.png',
    tags: ['monster', 'classic', 'green'],
  },
];

// Fun color palette - Kid-friendly!
const COLORS = [
  // 🎨 SIMPLE COLORS (top row - easy for kids!)
  '#FF0000', '#FF8800', '#FFFF00', '#00FF00', '#00FFFF', '#0088FF',
  '#0000FF', '#8800FF', '#FF00FF', '#FF69B4', '#FFFFFF', '#000000',
  // Skin tones
  '#ffdfc4', '#f0c8a8', '#d4a76a', '#c4a57b', '#8d6e4c', '#5c4033',
  // More colors
  '#FF6B6B', '#FF8E53', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6',
  // Extras
  '#E91E63', '#00BCD4', '#8BC34A', '#FF5722', '#795548', '#607D8B',
  // Grays
  '#CCCCCC', '#888888', '#444444', '#222222',
];

const SKIN_WIDTH = 64;
const SKIN_HEIGHT = 64;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DISPLAY_SCALE = 6;

export default function SkinCreator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const exportPreviewRef = useRef<HTMLCanvasElement>(null);
  const [selectedGame, setSelectedGame] = useState<GameType>('minecraft');
  const [viewMode, setViewMode] = useState<ViewMode>('editor'); // editor or gallery
  const [selectedColor, setSelectedColor] = useState('#FF0000'); // Classic red!
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'pencil' | 'eraser' | 'fill' | 'gradient' | 'glow' | 'stamp' | 'eyedropper' | 'line' | 'spray'>('brush');
  // Drawing state for smooth lines and line tool
  const lastDrawPosition = useRef<{ x: number; y: number } | null>(null);
  const lineStartPosition = useRef<{ x: number; y: number } | null>(null);
  const linePreviewCanvas = useRef<HTMLCanvasElement | null>(null);
  const eyedropperUseCount = useRef(0);
  const [stampShape, setStampShape] = useState<'star' | 'heart' | 'diamond' | 'smiley' | 'fire' | 'lightning'>('star');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [show3D, setShow3D] = useState(true); // Toggle 2D/3D preview - default ON for 3D rotation!
  const [textureVersion, setTextureVersion] = useState(0); // Increment to refresh 3D texture
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoomLevel, setZoomLevel] = useState(typeof window !== 'undefined' && window.innerWidth < 480 ? 3 : (typeof window !== 'undefined' && window.innerWidth < 768 ? 4 : 6));
  const [showGrid, setShowGrid] = useState(true); // Grid overlay toggle
  const [gridColor, setGridColor] = useState<'light' | 'dark' | 'blue' | 'red'>('dark'); // Grid line color
  const [showBodyPartOverlay, setShowBodyPartOverlay] = useState(false); // Highlight body part regions
  const [hoverPixel, setHoverPixel] = useState<{ x: number; y: number } | null>(null); // Pixel under cursor
  const [eyedropperPreviewColor, setEyedropperPreviewColor] = useState<string | null>(null); // Color preview for eyedropper
  const [secondaryColor, setSecondaryColor] = useState('#4D96FF'); // For gradient
  const [brushSize, setBrushSize] = useState(1);
  const [skinName, setSkinName] = useState('my-skin');
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [customTintColors, setCustomTintColors] = useState<string[]>([]); // Recent custom tint colors
  const [showHelp, setShowHelp] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showURLImport, setShowURLImport] = useState(false);
  const [importURL, setImportURL] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showWelcomeHints, setShowWelcomeHints] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [skinModel, setSkinModel] = useState<'steve' | 'alex'>('steve'); // Steve (4px arms) or Alex (3px slim arms)
  const lastPinchDistance = useRef<number | null>(null); // For pinch-to-zoom
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null); // Right-click menu
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [localLLMAvailable, setLocalLLMAvailable] = useState(false);
  const [aiStyle, setAiStyle] = useState<'cartoon' | 'realistic' | 'pixel-art' | 'anime' | 'blocky'>('blocky');
  const [aiError, setAiError] = useState<string | null>(null);
  const [useRealAI, setUseRealAI] = useState(false); // Toggle between real AI and fallback

  // 🤖 AI History & Favorites
  interface AIHistoryItem {
    id: string;
    prompt: string;
    style: typeof aiStyle;
    skinDataUrl: string;
    timestamp: number;
    isFavorite: boolean;
  }
  const [aiHistory, setAiHistory] = useState<AIHistoryItem[]>([]);
  const [showAIHistory, setShowAIHistory] = useState(false);

  // Load AI history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('minecraft-skin-ai-history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setAiHistory(parsed);
        }
      }
    } catch (e) { /* ignore */ }

    // Check if local LLM is available
    checkLocalLLM().then(setLocalLLMAvailable);
    
    // Show simple welcome hints for first-time visitors
    const hasVisited = localStorage.getItem('skin-studio-visited');
    if (!hasVisited) {
      setShowWelcomeHints(true);
    }
    
    // Show detailed tutorial on first visit (if welcome hints already dismissed)
    const tutorialSeen = localStorage.getItem('skin-creator-tutorial-seen');
    if (!tutorialSeen && hasVisited) {
      setShowTutorial(true);
    }
  }, []);

  // Save AI history to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('minecraft-skin-ai-history', JSON.stringify(aiHistory));
    } catch (e) { /* ignore quota errors */ }
  }, [aiHistory]);

  // Add a generation to history
  const addToAIHistory = useCallback((prompt: string, style: typeof aiStyle, skinDataUrl: string) => {
    const newItem: AIHistoryItem = {
      id: `ai-${Date.now()}`,
      prompt,
      style,
      skinDataUrl,
      timestamp: Date.now(),
      isFavorite: false,
    };
    setAiHistory(prev => {
      // Keep only last 10 non-favorite items + all favorites
      const favorites = prev.filter(item => item.isFavorite);
      const nonFavorites = prev.filter(item => !item.isFavorite);
      const newNonFavorites = [newItem, ...nonFavorites].slice(0, 10);
      return [...newNonFavorites, ...favorites].sort((a, b) => b.timestamp - a.timestamp);
    });
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback((id: string) => {
    setAiHistory(prev => prev.map(item =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  }, []);

  // Load a history item onto the canvas
  const loadFromHistory = useCallback((item: AIHistoryItem) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
      ctx.drawImage(img, 0, 0);
      updatePreview();
      saveState();
      setShowAIPanel(false);
      playSound('click');
    };
    img.src = item.skinDataUrl;
  }, []);

  // Regenerate with same prompt
  const regenerateFromHistory = useCallback((item: AIHistoryItem) => {
    setAiPrompt(item.prompt);
    setAiStyle(item.style);
    setShowAIHistory(false);
  }, []);

  // Delete from history
  const deleteFromHistory = useCallback((id: string) => {
    setAiHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  // 🎨 Layer system state
  const [layers, setLayers] = useState<Layer[]>(DEFAULT_LAYERS);
  const [activeLayer, setActiveLayer] = useState<LayerType>('base');
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const layerCanvasRefs = useRef<{ [key in LayerType]?: HTMLCanvasElement }>({});

  // 💾 MY SKINS - Save/Load System
  interface SavedSkin {
    id: string;
    name: string;
    dataUrl: string;
    timestamp: number;
    tags?: string[]; // e.g., ['warrior', 'fantasy', 'cool']
    rating?: number; // 1-5 stars
  }
  const SKIN_TAGS = ['⚔️ Warrior', '🧙 Mage', '🐱 Cute', '👻 Spooky', '🤖 Robot', '🎮 Gaming', '🌟 Fantasy', '😎 Cool'];
  const [savedSkins, setSavedSkins] = useState<SavedSkin[]>([]);
  const [showMySkins, setShowMySkins] = useState(false);

  // Load saved skins on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('minecraft-my-skins');
      if (saved) setSavedSkins(JSON.parse(saved));
    } catch (e) { /* ignore */ }
  }, []);

  // Save skins list when it changes
  useEffect(() => {
    try {
      localStorage.setItem('minecraft-my-skins', JSON.stringify(savedSkins));
    } catch (e) { /* ignore quota */ }
  }, [savedSkins]);

  // Create off-screen canvases for each layer
  const getLayerCanvas = useCallback((layerId: LayerType): HTMLCanvasElement => {
    if (!layerCanvasRefs.current[layerId]) {
      const canvas = document.createElement('canvas');
      canvas.width = SKIN_WIDTH;
      canvas.height = SKIN_HEIGHT;
      layerCanvasRefs.current[layerId] = canvas;
    }
    return layerCanvasRefs.current[layerId]!;
  }, []);

  // Toggle layer visibility
  const toggleLayerVisibility = useCallback((layerId: LayerType) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  }, []);

  // Set layer opacity
  const setLayerOpacity = useCallback((layerId: LayerType, opacity: number) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, opacity } : layer
    ));
  }, []);

  // Set layer tint color
  const setLayerTint = useCallback((layerId: LayerType, tint: string | null) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, tint } : layer
    ));
  }, []);

  // Set layer tint intensity
  const setLayerTintIntensity = useCallback((layerId: LayerType, tintIntensity: number) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, tintIntensity } : layer
    ));
  }, []);

  // Apply color tint to a canvas with blend mode
  const applyTintToCanvas = useCallback((sourceCanvas: HTMLCanvasElement, tint: string, intensity: number): HTMLCanvasElement => {
    const tintedCanvas = document.createElement('canvas');
    tintedCanvas.width = sourceCanvas.width;
    tintedCanvas.height = sourceCanvas.height;
    const ctx = tintedCanvas.getContext('2d');
    if (!ctx) return sourceCanvas;

    // Draw original image
    ctx.drawImage(sourceCanvas, 0, 0);

    // Apply tint using multiply blend mode
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = intensity / 100;
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, tintedCanvas.width, tintedCanvas.height);

    // Restore alpha from original (multiply can darken transparent areas)
    ctx.globalCompositeOperation = 'destination-in';
    ctx.globalAlpha = 1;
    ctx.drawImage(sourceCanvas, 0, 0);

    return tintedCanvas;
  }, []);

  // Move layer up/down in the stack
  // Note: "up" means higher z-index (rendered later, appears on top)
  // In the layers array: lower index = bottom, higher index = top
  // Recompositing is handled by the useEffect that watches [layers]
  const moveLayer = useCallback((layerId: LayerType, direction: 'up' | 'down') => {
    setLayers(prev => {
      const index = prev.findIndex(l => l.id === layerId);
      if (index === -1) return prev;
      // "up" = move to higher index (toward top of stack)
      // "down" = move to lower index (toward bottom of stack)
      const newIndex = direction === 'up' ? index + 1 : index - 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const newLayers = [...prev];
      [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
      return newLayers;
    });
  }, []);

  // Composite all visible layers onto the main canvas
  const compositeLayersToMain = useCallback(() => {
    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return;
    const mainCtx = mainCanvas.getContext('2d');
    if (!mainCtx) return;

    // Clear main canvas
    mainCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);

    // Draw layers in order (bottom to top), respecting visibility, opacity, and tint
    layers.forEach(layer => {
      if (!layer.visible) return;
      const layerCanvas = layerCanvasRefs.current[layer.id];
      if (!layerCanvas) return;

      // Apply tint if set
      let canvasToDraw = layerCanvas;
      if (layer.tint && layer.tintIntensity > 0) {
        canvasToDraw = applyTintToCanvas(layerCanvas, layer.tint, layer.tintIntensity);
      }

      mainCtx.globalAlpha = layer.opacity / 100;
      mainCtx.drawImage(canvasToDraw, 0, 0);
    });

    mainCtx.globalAlpha = 1;
  }, [layers, applyTintToCanvas]);

  // Clear a specific layer
  const clearLayer = useCallback((layerId: LayerType) => {
    const layerCanvas = getLayerCanvas(layerId);
    const ctx = layerCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
    }
    compositeLayersToMain();
    updatePreview();
  }, [getLayerCanvas, compositeLayersToMain]);

  // Copy layer content to another layer (duplicate layer feature)
  const copyLayerTo = useCallback((fromId: LayerType, toId: LayerType) => {
    const fromCanvas = getLayerCanvas(fromId);
    const toCanvas = getLayerCanvas(toId);
    const toCtx = toCanvas.getContext('2d');
    if (toCtx) {
      toCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
      toCtx.drawImage(fromCanvas, 0, 0);
    }
    compositeLayersToMain();
    updatePreview();
    saveState();
    playSound('click');
  }, [getLayerCanvas, compositeLayersToMain]);

  // State for duplicate layer dropdown
  const [showDuplicateMenu, setShowDuplicateMenu] = useState(false);

  // Merge all layers into base
  const flattenLayers = useCallback(() => {
    if (!confirm('Merge all visible layers into base? This cannot be undone.')) return;

    // Get composite result
    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return;

    // Copy composite to base layer
    const baseCanvas = getLayerCanvas('base');
    const baseCtx = baseCanvas.getContext('2d');
    if (baseCtx) {
      baseCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
      baseCtx.drawImage(mainCanvas, 0, 0);
    }

    // Clear other layers
    clearLayer('details');
    clearLayer('accessories');

    compositeLayersToMain();
    updatePreview();
    playSound('click');
  }, [getLayerCanvas, clearLayer, compositeLayersToMain]);

  // ✨ Enhance prompt with local LLM
  const enhancePrompt = async () => {
    if (!aiPrompt.trim() || !localLLMAvailable) return;
    setEnhancing(true);
    try {
      const enhanced = await enhancePromptWithLLM(aiPrompt);
      if (enhanced && enhanced !== aiPrompt) {
        setAiPrompt(enhanced);
      }
    } catch (e) {
      console.error('Enhance failed:', e);
    } finally {
      setEnhancing(false);
    }
  };

  // 🤖 AI Skin Generation with real DALL-E 3 API + fallback
  const generateAISkin = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);

    const canvas = canvasRef.current;
    if (!canvas) {
      setAiLoading(false);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setAiLoading(false);
      return;
    }

    // Try real AI if available and enabled
    if (useRealAI && isAIAvailable()) {
      try {
        const result = await generateAndConvertSkin({
          prompt: aiPrompt,
          style: aiStyle,
        });

        if (result.success && result.skinDataUrl) {
          // Load the generated skin onto the canvas
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
            ctx.drawImage(img, 0, 0);
            updatePreview();
            saveState();
            // Save to AI history
            addToAIHistory(aiPrompt, aiStyle, result.skinDataUrl!);
            setAiLoading(false);
            setShowAIPanel(false);
            playSound('download');
          };
          img.onerror = () => {
            setAiError('Failed to load generated skin');
            setAiLoading(false);
          };
          img.src = result.skinDataUrl;
          return;
        } else {
          setAiError(result.error || 'AI generation failed');
          // Fall through to fallback generation
        }
      } catch (error) {
        setAiError(error instanceof Error ? error.message : 'AI generation failed');
        // Fall through to fallback generation
      }
    }

    // Fallback: keyword-based generation (no API required)
    await new Promise(r => setTimeout(r, 800)); // Brief delay for UX

    const prompt = aiPrompt.toLowerCase();
    let colors = {
      skin: '#c4a57b', hair: '#442920', shirt: '#00a8a8',
      pants: '#3c2a5e', shoes: '#444444'
    };

    // Style-aware color palettes
    const styleModifier = aiStyle === 'anime' ? 1.2 : aiStyle === 'cartoon' ? 1.1 : 1;

    if (prompt.includes('zombie') || prompt.includes('undead')) {
      colors = { skin: '#5a8f5a', hair: '#2d4a2d', shirt: '#3d5a3d', pants: '#2d4a2d', shoes: '#1a3a1a' };
    } else if (prompt.includes('robot') || prompt.includes('mech') || prompt.includes('android')) {
      colors = { skin: '#8a8a8a', hair: '#444444', shirt: '#3498db', pants: '#2c3e50', shoes: '#1a1a1a' };
    } else if (prompt.includes('ninja') || prompt.includes('assassin') || prompt.includes('stealth')) {
      colors = { skin: '#c4a57b', hair: '#1a1a1a', shirt: '#1a1a1a', pants: '#1a1a1a', shoes: '#2c2c2c' };
    } else if (prompt.includes('princess') || prompt.includes('queen') || prompt.includes('royalty')) {
      colors = { skin: '#ffdfc4', hair: '#f1c40f', shirt: '#e91e63', pants: '#9c27b0', shoes: '#ff69b4' };
    } else if (prompt.includes('pirate') || prompt.includes('captain') || prompt.includes('sailor')) {
      colors = { skin: '#d4a76a', hair: '#2c1810', shirt: '#8B0000', pants: '#1a1a1a', shoes: '#3d2314' };
    } else if (prompt.includes('wizard') || prompt.includes('mage') || prompt.includes('sorcerer')) {
      colors = { skin: '#e8d5c4', hair: '#c0c0c0', shirt: '#4B0082', pants: '#2E0854', shoes: '#1a1a2e' };
    } else if (prompt.includes('alien') || prompt.includes('space') || prompt.includes('extraterrestrial')) {
      colors = { skin: '#7dcea0', hair: '#27ae60', shirt: '#9b59b6', pants: '#8e44ad', shoes: '#6c3483' };
    } else if (prompt.includes('knight') || prompt.includes('armor') || prompt.includes('warrior')) {
      colors = { skin: '#d4a76a', hair: '#4a3728', shirt: '#7f8c8d', pants: '#5d6d7e', shoes: '#2c3e50' };
    } else if (prompt.includes('elf') || prompt.includes('fairy') || prompt.includes('nature')) {
      colors = { skin: '#f5deb3', hair: '#228b22', shirt: '#006400', pants: '#556b2f', shoes: '#8b4513' };
    } else if (prompt.includes('vampire') || prompt.includes('dark') || prompt.includes('gothic')) {
      colors = { skin: '#e8e8e8', hair: '#1a1a1a', shirt: '#8b0000', pants: '#1a1a1a', shoes: '#2c2c2c' };
    } else if (prompt.includes('superhero') || prompt.includes('hero')) {
      colors = { skin: '#d4a76a', hair: '#2c1810', shirt: '#dc143c', pants: '#00008b', shoes: '#ffd700' };
    } else if (prompt.includes('chef') || prompt.includes('cook')) {
      colors = { skin: '#d4a76a', hair: '#3d2314', shirt: '#ffffff', pants: '#1a1a1a', shoes: '#2c2c2c' };
    } else if (prompt.includes('doctor') || prompt.includes('nurse') || prompt.includes('medical')) {
      colors = { skin: '#d4a76a', hair: '#3d2314', shirt: '#87ceeb', pants: '#87ceeb', shoes: '#ffffff' };
    } else {
      // Generate colors based on prompt hash for unique results
      const hash = aiPrompt.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const hue = hash % 360;
      colors.shirt = `hsl(${hue}, 70%, ${50 * styleModifier}%)`;
      colors.pants = `hsl(${(hue + 180) % 360}, 60%, ${40 * styleModifier}%)`;
      colors.hair = `hsl(${(hue + 90) % 360}, 40%, 25%)`;
    }

    // Draw the generated skin
    ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);

    // Head (all 6 faces)
    ctx.fillStyle = colors.skin;
    ctx.fillRect(8, 8, 8, 8); // front
    ctx.fillRect(24, 8, 8, 8); // back
    ctx.fillRect(0, 8, 8, 8); // right
    ctx.fillRect(16, 8, 8, 8); // left
    ctx.fillRect(8, 0, 8, 8); // top
    ctx.fillRect(16, 0, 8, 8); // bottom

    // Hair (on top and front of head)
    ctx.fillStyle = colors.hair;
    ctx.fillRect(8, 0, 8, 8); // top of head
    ctx.fillRect(8, 8, 8, 2); // front hair line
    ctx.fillRect(0, 8, 8, 3); // right side
    ctx.fillRect(16, 8, 8, 3); // left side
    ctx.fillRect(24, 8, 8, 3); // back

    // Face details
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 12, 2, 2); // right eye white
    ctx.fillRect(14, 12, 2, 2); // left eye white
    ctx.fillStyle = '#000000';
    ctx.fillRect(11, 13, 1, 1); // right pupil
    ctx.fillRect(15, 13, 1, 1); // left pupil
    ctx.fillStyle = '#d4a76a';
    ctx.fillRect(12, 14, 2, 1); // nose
    ctx.fillStyle = '#b35a5a';
    ctx.fillRect(11, 15, 4, 1); // mouth

    // Body (all faces)
    ctx.fillStyle = colors.shirt;
    ctx.fillRect(20, 20, 8, 12); // front
    ctx.fillRect(32, 20, 8, 12); // back
    ctx.fillRect(16, 20, 4, 12); // right
    ctx.fillRect(28, 20, 4, 12); // left
    ctx.fillRect(20, 16, 8, 4); // top

    // Right Arm
    ctx.fillStyle = colors.skin;
    ctx.fillRect(44, 20, 4, 12); // inner
    ctx.fillRect(48, 20, 4, 12); // outer
    ctx.fillRect(40, 20, 4, 12); // front
    ctx.fillRect(52, 20, 4, 12); // back
    ctx.fillStyle = colors.shirt;
    ctx.fillRect(44, 20, 4, 8); // sleeve inner
    ctx.fillRect(40, 20, 4, 8); // sleeve front

    // Left Arm (second layer for 64x64 skins)
    ctx.fillStyle = colors.skin;
    ctx.fillRect(36, 52, 4, 12);
    ctx.fillRect(44, 52, 4, 12);
    ctx.fillRect(32, 52, 4, 12);
    ctx.fillRect(48, 52, 4, 12);
    ctx.fillStyle = colors.shirt;
    ctx.fillRect(36, 52, 4, 8);
    ctx.fillRect(32, 52, 4, 8);

    // Right Leg
    ctx.fillStyle = colors.pants;
    ctx.fillRect(4, 20, 4, 12);
    ctx.fillRect(8, 20, 4, 12);
    ctx.fillRect(0, 20, 4, 12);
    ctx.fillRect(12, 20, 4, 12);
    ctx.fillStyle = colors.shoes;
    ctx.fillRect(4, 28, 4, 4);
    ctx.fillRect(0, 28, 4, 4);

    // Left Leg (second layer)
    ctx.fillStyle = colors.pants;
    ctx.fillRect(20, 52, 4, 12);
    ctx.fillRect(24, 52, 4, 12);
    ctx.fillRect(16, 52, 4, 12);
    ctx.fillRect(28, 52, 4, 12);
    ctx.fillStyle = colors.shoes;
    ctx.fillRect(20, 60, 4, 4);
    ctx.fillRect(16, 60, 4, 4);

    updatePreview();
    saveState();
    // Save fallback generation to AI history
    const fallbackDataUrl = canvas.toDataURL('image/png');
    addToAIHistory(aiPrompt, aiStyle, fallbackDataUrl);
    setAiLoading(false);
    setShowAIPanel(false);
    playSound('download');
  };

  // Add color to recent colors
  const addRecentColor = useCallback((color: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 8);
    });
  }, []);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);

  // 🎉 T1000 MILESTONE CELEBRATION!
  useEffect(() => {
    // Show milestone celebration on first load
    const hasSeenMilestone = localStorage.getItem('skin-creator-t1000-seen');
    if (!hasSeenMilestone) {
      setTimeout(() => {
        setShowMilestone(true);
        setShowConfetti(true);
        localStorage.setItem('skin-creator-t1000-seen', 'true');
        setTimeout(() => {
          setShowConfetti(false);
          setShowMilestone(false);
        }, 5000);
      }, 1000);
    }
  }, []);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [particles, setParticles] = useState<Array<{id: number; x: number; y: number; color: string}>>([]);
  const particleIdRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [soundMuted, setSoundMuted] = useState(false);
  const [exportHistory, setExportHistory] = useState<{timestamp: number, format: string}[]>(() => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('skin-export-history') || '[]');
  });
  const logExport = (format: string) => {
    const entry = { timestamp: Date.now(), format };
    const updated = [...exportHistory, entry].slice(-20); // Keep last 20
    setExportHistory(updated);
    localStorage.setItem('skin-export-history', JSON.stringify(updated));
  };
  // 🔄 Undo/Redo History System - Tracks all layer states
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const maxHistory = 30; // Increased for better UX
  const [showHistoryPanel, setShowHistoryPanel] = useState(false); // Visual timeline
  
  // 🏆 Achievement System
  const [achievements, setAchievements] = useState<Record<string, boolean>>({});
  const [showAchievement, setShowAchievement] = useState<{id: string; name: string; emoji: string} | null>(null);
  const [showAchievementGallery, setShowAchievementGallery] = useState(false);
  const [helpTipDismissed, setHelpTipDismissed] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    return JSON.parse(localStorage.getItem('skin-tips-dismissed') || '{}');
  });
  const dismissTip = (tip: string) => {
    const updated = { ...helpTipDismissed, [tip]: true };
    setHelpTipDismissed(updated);
    localStorage.setItem('skin-tips-dismissed', JSON.stringify(updated));
  };
  
  // 📅 Daily Challenge
  const DAILY_CHALLENGES = [
    { theme: '🏴‍☠️ Pirate', hint: 'Arrr! Create a swashbuckling pirate!' },
    { theme: '🧙 Wizard', hint: 'Magical robes and pointy hat!' },
    { theme: '🤖 Robot', hint: 'Beep boop! Metallic and futuristic!' },
    { theme: '🦸 Superhero', hint: 'Cape and mask ready!' },
    { theme: '🎃 Halloween', hint: 'Spooky and scary!' },
    { theme: '🐉 Dragon Knight', hint: 'Scale armor and dragon themes!' },
    { theme: '🌊 Ocean Explorer', hint: 'Dive deep with aquatic vibes!' },
    { theme: '🚀 Astronaut', hint: 'Space suit and cosmic colors!' },
    { theme: '🍀 Leprechaun', hint: 'Green and gold luck!' },
    { theme: '⚔️ Medieval Knight', hint: 'Armor up!' },
    { theme: '🎭 Jester', hint: 'Colorful and silly!' },
    { theme: '🐱 Cat Person', hint: 'Meow! Ears and whiskers!' },
    { theme: '🔥 Fire Mage', hint: 'Hot and fiery!' },
    { theme: '❄️ Ice Queen/King', hint: 'Frozen elegance!' },
  ];
  const todayChallenge = DAILY_CHALLENGES[new Date().getDate() % DAILY_CHALLENGES.length];
  
  // 🕺 Pose Selection
  const [selectedPose, setSelectedPose] = useState('standing');
  const POSES = [
    { id: 'standing', name: '🧍 Standing', desc: 'Default pose' },
    { id: 'walking', name: '🚶 Walking', desc: 'Mid-stride' },
    { id: 'combat', name: '⚔️ Combat', desc: 'Battle ready!' },
    { id: 'sitting', name: '🪑 Sitting', desc: 'Relaxed' },
    { id: 'wave', name: '👋 Waving', desc: 'Friendly wave' },
    // 💃 Emotes/Dances
    { id: 'orange-justice', name: '🍊 Orange Justice', desc: 'Fortnite classic!' },
    { id: 'default-dance', name: '💃 Default Dance', desc: 'The OG!' },
    { id: 'floss', name: '🦷 Floss', desc: 'Side to side!' },
  ];
  
  const ACHIEVEMENTS = {
    firstDraw: { name: 'First Stroke!', emoji: '🎨' },
    colorMaster: { name: 'Color Master', emoji: '🌈' },
    saved: { name: 'Saved!', emoji: '💾' },
    shared: { name: 'Shared!', emoji: '🔗' },
    downloaded: { name: 'Downloaded!', emoji: '📥' },
    undoKing: { name: 'Undo King', emoji: '↩️' },
    layerPro: { name: 'Layer Pro', emoji: '📚' },
    patternUser: { name: 'Pattern User', emoji: '🎭' },
    // 🤫 Secret Achievements
    nightOwl: { name: '🤫 Night Owl', emoji: '🦉' }, // Draw between 2-5 AM
    speedDemon: { name: '🤫 Speed Demon', emoji: '⚡' }, // Download within 30 seconds
    perfectionist: { name: '🤫 Perfectionist', emoji: '✨' }, // Undo 50+ times
    explorer: { name: '🤫 Explorer', emoji: '🧭' }, // Try all tools
    zenMaster: { name: '🤫 Zen Master', emoji: '🧘' }, // Use eyedropper 20+ times
  };
  
  const unlockAchievement = useCallback((id: string) => {
    if (achievements[id]) return;
    const ach = ACHIEVEMENTS[id as keyof typeof ACHIEVEMENTS];
    if (!ach) return;
    setAchievements(prev => ({ ...prev, [id]: true }));
    setShowAchievement({ id, ...ach });
    // Play achievement sound 🏆🔊
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [523, 659, 784, 988, 1047];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.3);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.3);
      });
    } catch {}
    setTimeout(() => setShowAchievement(null), 3000);
    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem('skin-creator-achievements') || '{}');
    saved[id] = true;
    localStorage.setItem('skin-creator-achievements', JSON.stringify(saved));
  }, [achievements]);
  
  // Load achievements on mount
  useEffect(() => {
    const saved = localStorage.getItem('skin-creator-achievements');
    if (saved) setAchievements(JSON.parse(saved));
  }, []);
  
  // ⌨️ Keyboard Shortcuts Help
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        setShowShortcuts(prev => !prev);
      } else if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 🔄 Save canvas state for undo/redo - captures ALL layers
  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Capture the composite canvas state
    const compositeData = ctx.getImageData(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
    
    // Capture all layer states
    const layerStates: { [key in LayerType]?: ImageData } = {};
    (['base', 'details', 'accessories'] as LayerType[]).forEach(layerId => {
      const layerCanvas = layerCanvasRefs.current[layerId];
      if (layerCanvas) {
        const layerCtx = layerCanvas.getContext('2d');
        if (layerCtx) {
          layerStates[layerId] = layerCtx.getImageData(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
        }
      }
    });

    const newState: HistoryState = {
      layers: layerStates,
      composite: compositeData,
      timestamp: Date.now(),
    };

    setHistory(prev => {
      // Remove any future states if we're in the middle of history
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      // Keep only last maxHistory states
      if (newHistory.length > maxHistory) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, maxHistory - 1));

    // Auto-save to localStorage 💾
    try {
      localStorage.setItem('minecraft-skin-autosave', canvas.toDataURL('image/png'));
    } catch (e) { /* ignore quota errors */ }
  }, [historyIndex]);

  // 🔄 Undo - restores ALL layer states
  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newIndex = historyIndex - 1;
    const state = history[newIndex];
    if (!state) return;

    // Restore all layer canvases
    (['base', 'details', 'accessories'] as LayerType[]).forEach(layerId => {
      const layerCanvas = layerCanvasRefs.current[layerId];
      const layerData = state.layers[layerId];
      if (layerCanvas && layerData) {
        const layerCtx = layerCanvas.getContext('2d');
        if (layerCtx) {
          layerCtx.putImageData(layerData, 0, 0);
        }
      }
    });

    // Restore the composite canvas
    ctx.putImageData(state.composite, 0, 0);
    setHistoryIndex(newIndex);
    updatePreview();
    // 🎮 Trigger 3D preview texture refresh
    setTextureVersion(v => v + 1);

    // 🤫 Perfectionist achievement - track undo count
    const undoCount = parseInt(localStorage.getItem('skin-undo-count') || '0') + 1;
    localStorage.setItem('skin-undo-count', undoCount.toString());
    if (undoCount >= 50) {
      unlockAchievement('perfectionist');
    }
    
    // Unlock undo achievement after 10 uses
    if (undoCount >= 10) {
      unlockAchievement('undoKing');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, historyIndex, unlockAchievement]);

  // 🔄 Redo - restores ALL layer states
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newIndex = historyIndex + 1;
    const state = history[newIndex];
    if (!state) return;

    // Restore all layer canvases
    (['base', 'details', 'accessories'] as LayerType[]).forEach(layerId => {
      const layerCanvas = layerCanvasRefs.current[layerId];
      const layerData = state.layers[layerId];
      if (layerCanvas && layerData) {
        const layerCtx = layerCanvas.getContext('2d');
        if (layerCtx) {
          layerCtx.putImageData(layerData, 0, 0);
        }
      }
    });

    // Restore the composite canvas
    ctx.putImageData(state.composite, 0, 0);
    setHistoryIndex(newIndex);
    updatePreview();
    // 🎮 Trigger 3D preview texture refresh
    setTextureVersion(v => v + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, historyIndex]);

  // 🔄 Jump to specific history state (for timeline panel)
  const jumpToHistoryState = useCallback((index: number) => {
    if (index < 0 || index >= history.length) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = history[index];
    if (!state) return;

    // Restore all layer canvases
    (['base', 'details', 'accessories'] as LayerType[]).forEach(layerId => {
      const layerCanvas = layerCanvasRefs.current[layerId];
      const layerData = state.layers[layerId];
      if (layerCanvas && layerData) {
        const layerCtx = layerCanvas.getContext('2d');
        if (layerCtx) {
          layerCtx.putImageData(layerData, 0, 0);
        }
      }
    });

    // Restore the composite canvas
    ctx.putImageData(state.composite, 0, 0);
    setHistoryIndex(index);
    updatePreview();
    // 🎮 Trigger 3D preview texture refresh
    setTextureVersion(v => v + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);
  
  // 🔄 Clear all history (fresh start)
  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  // Sound effects using Web Audio API 🔊
  const playSound = useCallback((type: 'draw' | 'click' | 'download' | 'undo' | 'redo' | 'error' | 'success' | 'save' | 'achievement') => {
    if (soundMuted) return; // Mute check
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'draw') {
      // Quick bloop
      oscillator.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } else if (type === 'click') {
      // Pop sound
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } else if (type === 'download') {
      // Celebration jingle
      const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.2);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.2);
      });
    } else if (type === 'undo') {
      // Swoosh backwards
      oscillator.frequency.setValueAtTime(300, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.12);
    } else if (type === 'redo') {
      // Swoosh forwards
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.12);
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.12);
    } else if (type === 'error') {
      // Buzzer
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } else if (type === 'success') {
      // Happy ding
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } else if (type === 'achievement') {
      // Triumphant fanfare for achievements! 🏆
      const notes = [523, 659, 784, 988, 1047]; // C5, E5, G5, B5, C6 - victory chord
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'triangle'; // Softer sound
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.3);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.3);
      });
    } else if (type === 'save') {
      // Quick save beep
      const notes = [784, 988]; // G5, B5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.1);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.1);
      });
    }
  }, []);

  // Get window size for confetti
  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-load saved skin from localStorage 💾
  useEffect(() => {
    const saved = localStorage.getItem('minecraft-skin-autosave');
    if (saved && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
          ctx.drawImage(img, 0, 0);
          updatePreview();
          // 🎮 Trigger 3D preview texture refresh
          setTextureVersion(v => v + 1);
        };
        img.src = saved;
      }
    }
  }, []);

  // ⌨️ Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch(e.key.toLowerCase()) {
        case 'b': setTool('brush'); break;
        case 'p': setTool('pencil'); break;
        case 'e': setTool('eraser'); break;
        case 'r': if (!(e.metaKey || e.ctrlKey)) setTool('spray'); break;
        case 'f': setTool('fill'); break;
        case 'g': 
          if (e.shiftKey) { setShowGrid(prev => !prev); } 
          else { setTool('gradient'); } 
          break;
        case 's': setTool('stamp'); break;
        case 'i': setTool('eyedropper'); break;
        case '?': setShowHelp(prev => !prev); break;
        case 'z': 
          if ((e.metaKey || e.ctrlKey) && e.shiftKey) { e.preventDefault(); redo(); playSound('redo'); }
          else if (e.metaKey || e.ctrlKey) { e.preventDefault(); undo(); playSound('undo'); } 
          break;
        case 'y': if (e.metaKey || e.ctrlKey) { e.preventDefault(); redo(); playSound('redo'); } break;
        case 'm': setMirrorMode(prev => !prev); break;
        case 'd': setDarkMode(prev => !prev); break;
        case '+': case '=': setZoomLevel(prev => Math.min(20, prev + 1)); break;
        case '-': setZoomLevel(prev => Math.max(2, prev - 1)); break;
        case '0': setZoomLevel(6); break; // Reset to default zoom
        case '1': setBrushSize(1); break;
        case '2': setBrushSize(2); break;
        case '3': setBrushSize(3); break;
        // Layer shortcuts
        case 'l': setShowLayerPanel(prev => !prev); break;
        case '[': setActiveLayer(prev => {
          const idx = ['base', 'details', 'accessories'].indexOf(prev);
          return ['base', 'details', 'accessories'][(idx + 2) % 3] as LayerType;
        }); break;
        case ']': setActiveLayer(prev => {
          const idx = ['base', 'details', 'accessories'].indexOf(prev);
          return ['base', 'details', 'accessories'][(idx + 1) % 3] as LayerType;
        }); break;
        case 'c': if (!e.metaKey && !e.ctrlKey) setShowDuplicateMenu(prev => !prev); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Auto-save to localStorage when canvas changes 💾
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const autoSave = useCallback(() => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      localStorage.setItem('minecraft-skin-autosave', dataUrl);
    }
  }, []);

  // 🎲 Generate random skin!
  const generateRandomSkin = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Random color palettes
    const palettes = [
      { skin: '#ffdfc4', hair: '#4a3728', shirt: '#e74c3c', pants: '#2c3e50', shoes: '#1a1a1a' },
      { skin: '#c4a57b', hair: '#1a1a1a', shirt: '#3498db', pants: '#9b59b6', shoes: '#2c2c2c' },
      { skin: '#8d6e4c', hair: '#2c1810', shirt: '#27ae60', pants: '#f39c12', shoes: '#34495e' },
      { skin: '#7dcea0', hair: '#27ae60', shirt: '#e91e63', pants: '#673ab7', shoes: '#4a148c' },
      { skin: '#ff6b6b', hair: '#c0392b', shirt: '#f1c40f', pants: '#1abc9c', shoes: '#16a085' },
      { skin: '#a29bfe', hair: '#6c5ce7', shirt: '#fd79a8', pants: '#00cec9', shoes: '#0984e3' },
      { skin: '#ffeaa7', hair: '#fdcb6e', shirt: '#e17055', pants: '#74b9ff', shoes: '#0984e3' },
    ];
    const p = palettes[Math.floor(Math.random() * palettes.length)];

    ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);

    // Head
    ctx.fillStyle = p.skin;
    ctx.fillRect(8, 8, 8, 8);
    ctx.fillRect(0, 8, 8, 8);
    ctx.fillRect(16, 8, 8, 8);
    ctx.fillRect(24, 8, 8, 8);
    ctx.fillRect(8, 0, 8, 8);
    ctx.fillStyle = p.hair;
    ctx.fillRect(8, 8, 8, Math.random() > 0.5 ? 2 : 1);
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 11, 2, 1);
    ctx.fillRect(13, 11, 2, 1);
    ctx.fillStyle = '#000000';
    ctx.fillRect(10, 11, 1, 1);
    ctx.fillRect(13, 11, 1, 1);

    // Body
    ctx.fillStyle = p.shirt;
    ctx.fillRect(20, 20, 8, 12);
    ctx.fillRect(16, 20, 4, 12);
    ctx.fillRect(28, 20, 4, 12);
    ctx.fillRect(20, 16, 8, 4);

    // Arms
    ctx.fillStyle = p.skin;
    ctx.fillRect(44, 20, 4, 4);
    ctx.fillRect(36, 52, 4, 4);
    ctx.fillStyle = p.shirt;
    ctx.fillRect(44, 24, 4, 8);
    ctx.fillRect(36, 56, 4, 8);

    // Legs
    ctx.fillStyle = p.pants;
    ctx.fillRect(4, 20, 4, 12);
    ctx.fillRect(20, 52, 4, 12);
    ctx.fillStyle = p.shoes;
    ctx.fillRect(4, 28, 4, 4);
    ctx.fillRect(20, 60, 4, 4);

    updatePreview();
    saveState();
    playSound('download');
  }, []);

  // 🎭 Apply Pattern to canvas - One-click cool patterns!
  const applyPattern = useCallback((patternId: PatternType, targetArea?: 'all' | 'selected' | 'body') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get the area to apply the pattern
    let startX = 0, startY = 0, width = SKIN_WIDTH, height = SKIN_HEIGHT;
    
    if (targetArea === 'selected' && selectedPart) {
      const part = BODY_PARTS[selectedPart as keyof typeof BODY_PARTS];
      if (part) {
        startX = part.x;
        startY = part.y;
        width = part.w;
        height = part.h;
      }
    }

    // Get pattern preset for default colors
    const preset = PATTERN_PRESETS.find(p => p.id === patternId);
    const color1 = preset?.colors?.[0] || selectedColor;
    const color2 = preset?.colors?.[1] || secondaryColor;

    // Helper function to parse hex color to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    // Helper to interpolate colors
    const lerpColor = (c1: string, c2: string, t: number) => {
      const rgb1 = hexToRgb(c1);
      const rgb2 = hexToRgb(c2);
      const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
      const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
      const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);
      return `rgb(${r},${g},${b})`;
    };

    // Apply patterns based on type
    switch (patternId) {
      case 'stripes-h': {
        // Horizontal stripes
        const stripeHeight = 2;
        for (let y = startY; y < startY + height; y++) {
          const stripeIndex = Math.floor((y - startY) / stripeHeight);
          ctx.fillStyle = stripeIndex % 2 === 0 ? color1 : color2;
          for (let x = startX; x < startX + width; x++) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
        break;
      }

      case 'stripes-v': {
        // Vertical stripes
        const stripeWidth = 2;
        for (let x = startX; x < startX + width; x++) {
          const stripeIndex = Math.floor((x - startX) / stripeWidth);
          ctx.fillStyle = stripeIndex % 2 === 0 ? color1 : color2;
          for (let y = startY; y < startY + height; y++) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
        break;
      }

      case 'stripes-diag': {
        // Diagonal stripes
        for (let y = startY; y < startY + height; y++) {
          for (let x = startX; x < startX + width; x++) {
            const stripeIndex = Math.floor((x - startX + y - startY) / 3);
            ctx.fillStyle = stripeIndex % 2 === 0 ? color1 : color2;
            ctx.fillRect(x, y, 1, 1);
          }
        }
        break;
      }

      case 'dots': {
        // Fill background first
        ctx.fillStyle = color2;
        ctx.fillRect(startX, startY, width, height);
        // Add dots
        ctx.fillStyle = color1;
        for (let y = startY; y < startY + height; y += 3) {
          for (let x = startX + ((Math.floor((y - startY) / 3) % 2) * 2); x < startX + width; x += 4) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
        break;
      }

      case 'checkers': {
        // Checkerboard pattern
        const squareSize = 2;
        for (let y = startY; y < startY + height; y++) {
          for (let x = startX; x < startX + width; x++) {
            const checkX = Math.floor((x - startX) / squareSize);
            const checkY = Math.floor((y - startY) / squareSize);
            ctx.fillStyle = (checkX + checkY) % 2 === 0 ? color1 : color2;
            ctx.fillRect(x, y, 1, 1);
          }
        }
        break;
      }

      case 'gradient-v': {
        // Vertical gradient (top to bottom)
        for (let y = startY; y < startY + height; y++) {
          const t = (y - startY) / height;
          ctx.fillStyle = lerpColor(color1, color2, t);
          for (let x = startX; x < startX + width; x++) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
        break;
      }

      case 'gradient-h': {
        // Horizontal gradient (left to right)
        for (let x = startX; x < startX + width; x++) {
          const t = (x - startX) / width;
          ctx.fillStyle = lerpColor(color1, color2, t);
          for (let y = startY; y < startY + height; y++) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
        break;
      }

      case 'gradient-radial': {
        // Radial gradient from center
        const centerX = startX + width / 2;
        const centerY = startY + height / 2;
        const maxDist = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);
        for (let y = startY; y < startY + height; y++) {
          for (let x = startX; x < startX + width; x++) {
            const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            const t = Math.min(dist / maxDist, 1);
            ctx.fillStyle = lerpColor(color1, color2, t);
            ctx.fillRect(x, y, 1, 1);
          }
        }
        break;
      }

      case 'camo': {
        // Military camouflage pattern
        const camoColors = ['#4A5D23', '#2D3A14', '#6B7B3F', '#3C4B1E', '#556B2F'];
        // First pass: base color
        ctx.fillStyle = camoColors[0];
        ctx.fillRect(startX, startY, width, height);
        // Second pass: random blobs
        for (let i = 0; i < Math.floor(width * height / 8); i++) {
          const bx = startX + Math.floor(Math.random() * width);
          const by = startY + Math.floor(Math.random() * height);
          const bsize = 1 + Math.floor(Math.random() * 3);
          ctx.fillStyle = camoColors[Math.floor(Math.random() * camoColors.length)];
          ctx.fillRect(bx, by, bsize, bsize);
        }
        break;
      }

      case 'galaxy': {
        // Space pattern with stars
        const galaxyColors = ['#0B0B1A', '#1A1A3A', '#2D1B4E', '#0D0D2B'];
        // Background: dark space gradient
        for (let y = startY; y < startY + height; y++) {
          for (let x = startX; x < startX + width; x++) {
            ctx.fillStyle = galaxyColors[Math.floor(Math.random() * galaxyColors.length)];
            ctx.fillRect(x, y, 1, 1);
          }
        }
        // Stars: white and colored dots
        const starColors = ['#FFFFFF', '#FFD700', '#87CEEB', '#FFA500', '#FF69B4'];
        for (let i = 0; i < Math.floor(width * height / 12); i++) {
          const sx = startX + Math.floor(Math.random() * width);
          const sy = startY + Math.floor(Math.random() * height);
          ctx.fillStyle = starColors[Math.floor(Math.random() * starColors.length)];
          ctx.fillRect(sx, sy, 1, 1);
        }
        break;
      }

      case 'rainbow': {
        // Full rainbow gradient
        const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        for (let y = startY; y < startY + height; y++) {
          const colorIndex = Math.floor(((y - startY) / height) * rainbowColors.length);
          const nextColorIndex = Math.min(colorIndex + 1, rainbowColors.length - 1);
          const localT = ((y - startY) / height) * rainbowColors.length - colorIndex;
          ctx.fillStyle = lerpColor(rainbowColors[colorIndex], rainbowColors[nextColorIndex], localT);
          for (let x = startX; x < startX + width; x++) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
        break;
      }

      case 'fire': {
        // Fire/flame pattern
        const fireColors = ['#FF0000', '#FF4500', '#FF8C00', '#FFD700', '#FFFF00'];
        for (let y = startY; y < startY + height; y++) {
          for (let x = startX; x < startX + width; x++) {
            // More yellow/white at bottom, red at top
            const baseIndex = Math.floor((1 - (y - startY) / height) * (fireColors.length - 1));
            const noise = Math.random() * 0.3;
            const colorIndex = Math.max(0, Math.min(fireColors.length - 1, Math.floor(baseIndex + noise * 2)));
            ctx.fillStyle = fireColors[colorIndex];
            ctx.fillRect(x, y, 1, 1);
          }
        }
        break;
      }

      case 'ice': {
        // Ice/frozen pattern
        const iceColors = ['#E0FFFF', '#87CEEB', '#B0E0E6', '#ADD8E6', '#4169E1'];
        for (let y = startY; y < startY + height; y++) {
          for (let x = startX; x < startX + width; x++) {
            const noise = Math.random();
            const colorIndex = Math.floor(noise * iceColors.length);
            ctx.fillStyle = iceColors[colorIndex];
            ctx.fillRect(x, y, 1, 1);
          }
        }
        // Add some "crystal" highlights
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < Math.floor(width * height / 20); i++) {
          const cx = startX + Math.floor(Math.random() * width);
          const cy = startY + Math.floor(Math.random() * height);
          ctx.fillRect(cx, cy, 1, 1);
        }
        break;
      }

      case 'pixel-noise': {
        // Random pixel noise texture using selected colors
        for (let y = startY; y < startY + height; y++) {
          for (let x = startX; x < startX + width; x++) {
            const t = Math.random();
            ctx.fillStyle = lerpColor(color1, color2, t);
            ctx.fillRect(x, y, 1, 1);
          }
        }
        break;
      }
    }

    updatePreview();
    saveState();
    playSound('download');
    unlockAchievement('patternUser');
  }, [selectedColor, secondaryColor, selectedPart, unlockAchievement]);

  // Spawn sparkle particles when drawing
  const spawnParticle = useCallback((clientX: number, clientY: number) => {
    if (tool === 'eraser') return;
    const id = particleIdRef.current++;
    const newParticle = { id, x: clientX, y: clientY, color: selectedColor };
    setParticles(prev => [...prev.slice(-20), newParticle]); // Keep max 20 particles
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 600);
  }, [selectedColor, tool]);

  // Initialize with Steve template
  const loadTemplate = useCallback((template: keyof typeof TEMPLATES | 'blank') => {
    // 🎨 Clear all layer canvases first
    const baseCanvas = getLayerCanvas('base');
    const detailsCanvas = getLayerCanvas('details');
    const accessoriesCanvas = getLayerCanvas('accessories');

    const baseCtx = baseCanvas.getContext('2d');
    const detailsCtx = detailsCanvas.getContext('2d');
    const accessoriesCtx = accessoriesCanvas.getContext('2d');

    if (!baseCtx || !detailsCtx || !accessoriesCtx) return;

    baseCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
    detailsCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
    accessoriesCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);

    if (template === 'blank') {
      compositeLayersToMain();
      updatePreview();
      return;
    }

    const t = TEMPLATES[template] || TEMPLATES.steve;

    // 🎨 LAYER: BASE - Skin, face features (drawn on base layer)
    // Head - front face (8x8 at position 8,8)
    baseCtx.fillStyle = t.skin;
    baseCtx.fillRect(8, 8, 8, 8);
    // Eyes
    baseCtx.fillStyle = t.eyes;
    baseCtx.fillRect(9, 11, 2, 1);
    baseCtx.fillRect(13, 11, 2, 1);
    baseCtx.fillStyle = t.pupils;
    baseCtx.fillRect(10, 11, 1, 1);
    baseCtx.fillRect(13, 11, 1, 1);
    // Hair
    baseCtx.fillStyle = t.hair;
    baseCtx.fillRect(8, 8, 8, 1);
    baseCtx.fillRect(8, 8, 1, 2);
    baseCtx.fillRect(15, 8, 1, 2);
    // Mouth
    baseCtx.fillStyle = '#a87d5a';
    baseCtx.fillRect(11, 14, 2, 1);

    // Head sides
    baseCtx.fillStyle = t.skin;
    baseCtx.fillRect(0, 8, 8, 8); // right
    baseCtx.fillRect(16, 8, 8, 8); // left
    baseCtx.fillRect(24, 8, 8, 8); // back
    baseCtx.fillStyle = t.hair;
    baseCtx.fillRect(24, 8, 8, 1);

    // Head top/bottom
    baseCtx.fillStyle = t.hair;
    baseCtx.fillRect(8, 0, 8, 8); // top
    baseCtx.fillStyle = t.skin;
    baseCtx.fillRect(16, 0, 8, 8); // bottom

    // Arms - skin parts (base layer)
    baseCtx.fillStyle = t.skin;
    // Right arm - hand visible part
    baseCtx.fillRect(44, 20, 4, 12);
    baseCtx.fillRect(40, 20, 4, 12);
    baseCtx.fillRect(48, 20, 4, 12);
    baseCtx.fillRect(52, 20, 4, 12);
    // Left arm
    baseCtx.fillRect(36, 52, 4, 12);
    baseCtx.fillRect(32, 52, 4, 12);
    baseCtx.fillRect(40, 52, 4, 12);
    baseCtx.fillRect(44, 52, 4, 12);

    // 🎨 LAYER: DETAILS - Shirt, pants, shoes (drawn on details layer)
    // Body - front (8x12 at position 20,20)
    detailsCtx.fillStyle = t.shirt;
    detailsCtx.fillRect(20, 20, 8, 12);
    // Body sides, back
    detailsCtx.fillRect(16, 20, 4, 12);
    detailsCtx.fillRect(28, 20, 4, 12);
    detailsCtx.fillRect(32, 20, 8, 12);

    // Legs - pants
    detailsCtx.fillStyle = t.pants;
    // Right leg
    detailsCtx.fillRect(4, 20, 4, 12);
    detailsCtx.fillRect(0, 20, 4, 12);
    detailsCtx.fillRect(8, 20, 4, 12);
    detailsCtx.fillRect(12, 20, 4, 12);
    // Left leg
    detailsCtx.fillRect(20, 52, 4, 12);
    detailsCtx.fillRect(16, 52, 4, 12);
    detailsCtx.fillRect(24, 52, 4, 12);
    detailsCtx.fillRect(28, 52, 4, 12);

    // Shoes
    detailsCtx.fillStyle = t.shoes;
    detailsCtx.fillRect(4, 31, 4, 1);
    detailsCtx.fillRect(20, 63, 4, 1);

    // 🎨 Composite all layers to main canvas
    compositeLayersToMain();
    updatePreview();
    // 🎮 Trigger 3D preview texture refresh
    setTextureVersion(v => v + 1);
  }, [getLayerCanvas, compositeLayersToMain]);

  const updatePreview = useCallback(() => {
    const canvas = canvasRef.current;
    const preview = previewRef.current;
    if (!canvas || !preview) return;

    const ctx = preview.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, preview.width, preview.height);

    // Draw a simple front view of the character
    const scale = 8;
    const offsetX = 60;
    const offsetY = 20;

    ctx.imageSmoothingEnabled = false;

    // Head (front face from 8,8)
    ctx.drawImage(canvas, 8, 8, 8, 8, offsetX, offsetY, 8 * scale, 8 * scale);

    // Body (front from 20,20)
    ctx.drawImage(canvas, 20, 20, 8, 12, offsetX, offsetY + 8 * scale, 8 * scale, 12 * scale);

    // Right Arm
    ctx.drawImage(canvas, 44, 20, 4, 12, offsetX - 4 * scale, offsetY + 8 * scale, 4 * scale, 12 * scale);

    // Left Arm
    ctx.drawImage(canvas, 36, 52, 4, 12, offsetX + 8 * scale, offsetY + 8 * scale, 4 * scale, 12 * scale);

    // Right Leg
    ctx.drawImage(canvas, 4, 20, 4, 12, offsetX, offsetY + 20 * scale, 4 * scale, 12 * scale);

    // Left Leg
    ctx.drawImage(canvas, 20, 52, 4, 12, offsetX + 4 * scale, offsetY + 20 * scale, 4 * scale, 12 * scale);
  }, []);

  // 🎮 Load a character template (PNG image) - Kids start from a base!
  const loadCharacterTemplate = useCallback((templateId: string) => {
    const template = CHARACTER_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Clear all layer canvases first
      const baseCanvas = getLayerCanvas('base');
      const detailsCanvas = getLayerCanvas('details');
      const accessoriesCanvas = getLayerCanvas('accessories');

      const baseCtx = baseCanvas.getContext('2d');
      const detailsCtx = detailsCanvas.getContext('2d');
      const accessoriesCtx = accessoriesCanvas.getContext('2d');

      if (!baseCtx || !detailsCtx || !accessoriesCtx) return;

      // Clear all layers
      baseCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
      detailsCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
      accessoriesCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);

      // Draw the template to the base layer
      baseCtx.drawImage(img, 0, 0, SKIN_WIDTH, SKIN_HEIGHT);

      // Composite to main canvas
      compositeLayersToMain();
      updatePreview();
      saveState();
      playSound('click');

      // Special effects for certain characters!
      if (templateId === 'creeper') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    };
    img.onerror = () => {
      console.error(`Failed to load template: ${template.imagePath}`);
      playSound('error');
    };
    img.src = template.imagePath;
  }, [getLayerCanvas, compositeLayersToMain, updatePreview, saveState, playSound]);

  // 💾 Save current skin
  const saveSkin = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const name = prompt('💾 Name your skin:', `Skin ${savedSkins.length + 1}`);
    if (!name) return;
    const newSkin: SavedSkin = {
      id: `skin-${Date.now()}`,
      name,
      dataUrl: canvas.toDataURL('image/png'),
      timestamp: Date.now(),
    };
    setSavedSkins(prev => [newSkin, ...prev].slice(0, 20));
  }, [savedSkins.length]);

  // 💾 Load a saved skin
  const loadSavedSkin = useCallback((skin: SavedSkin) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, 64, 64);
      ctx.drawImage(img, 0, 0);
      setShowMySkins(false);
      updatePreview();
    };
    img.src = skin.dataUrl;
  }, [updatePreview]);

  // 💾 Delete a saved skin
  const deleteSavedSkin = useCallback((id: string) => {
    setSavedSkins(prev => prev.filter(s => s.id !== id));
  }, []);

  // 🔗 Share skin via URL
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const shareSkin = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    // Compress: remove data:image/png;base64, prefix and use URL-safe base64
    const base64 = dataUrl.split(',')[1];
    const compressed = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const url = `${window.location.origin}${window.location.pathname}?skin=${compressed.slice(0, 2000)}`;
    setShareUrl(url);
    navigator.clipboard.writeText(url).then(() => {
      playSound('download');
      unlockAchievement('shared'); // 🏆 Shared achievement!
    }).catch(() => {});
  }, []);

  // Load skin from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const skinData = params.get('skin');
    if (skinData) {
      try {
        const base64 = skinData.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4);
        const dataUrl = `data:image/png;base64,${padded}`;
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.clearRect(0, 0, 64, 64);
          ctx.drawImage(img, 0, 0);
          updatePreview();
        };
        img.src = dataUrl;
      } catch (e) { /* ignore invalid skin data */ }
    }
  }, [updatePreview]);

  // Load template from gallery if available, otherwise load steve
  useEffect(() => {
    // Check for community gallery import (full skin image)
    const galleryImport = localStorage.getItem('skin-gallery-import');
    if (galleryImport) {
      try {
        const { imageData, name, timestamp } = JSON.parse(galleryImport);
        // Only use if recent (within 5 minutes)
        if (Date.now() - timestamp < 5 * 60 * 1000 && imageData) {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const img = new Image();
              img.onload = () => {
                ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
                ctx.drawImage(img, 0, 0);
                // Also copy to base layer
                const baseCanvas = getLayerCanvas('base');
                const baseCtx = baseCanvas.getContext('2d');
                if (baseCtx) {
                  baseCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
                  baseCtx.drawImage(img, 0, 0);
                }
                compositeLayersToMain();
                updatePreview();
                saveState();
                // Set skin name from gallery
                if (name) {
                  setSkinName(name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase());
                }
              };
              img.src = imageData;
              localStorage.removeItem('skin-gallery-import');
              return;
            }
          }
        }
      } catch (e) {
        // Ignore invalid import data
      }
      localStorage.removeItem('skin-gallery-import');
    }
    
    // Check for gallery template choice
    const templateChoice = localStorage.getItem('skin-template-choice');
    if (templateChoice) {
      try {
        const { colors, timestamp } = JSON.parse(templateChoice);
        // Only use if recent (within 5 minutes)
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          // Apply gallery template colors
          const baseCanvas = getLayerCanvas('base');
          const detailsCanvas = getLayerCanvas('details');
          const baseCtx = baseCanvas.getContext('2d');
          const detailsCtx = detailsCanvas.getContext('2d');
          
          if (baseCtx && detailsCtx) {
            baseCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
            detailsCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
            
            // Draw base (skin/face)
            baseCtx.fillStyle = colors.skin;
            baseCtx.fillRect(8, 8, 8, 8); // Face front
            baseCtx.fillRect(0, 8, 8, 8); // Face right
            baseCtx.fillRect(16, 8, 8, 8); // Face left
            baseCtx.fillRect(24, 8, 8, 8); // Face back
            baseCtx.fillStyle = colors.hair;
            baseCtx.fillRect(8, 0, 8, 8); // Hair top
            baseCtx.fillRect(8, 8, 8, 1); // Hair front
            // Eyes
            baseCtx.fillStyle = '#ffffff';
            baseCtx.fillRect(9, 11, 2, 1);
            baseCtx.fillRect(13, 11, 2, 1);
            baseCtx.fillStyle = '#000000';
            baseCtx.fillRect(10, 11, 1, 1);
            baseCtx.fillRect(13, 11, 1, 1);
            // Arms (skin)
            baseCtx.fillStyle = colors.skin;
            baseCtx.fillRect(44, 20, 4, 4);
            baseCtx.fillRect(36, 52, 4, 4);
            
            // Draw details (clothing)
            detailsCtx.fillStyle = colors.shirt;
            detailsCtx.fillRect(20, 20, 8, 12); // Body front
            detailsCtx.fillRect(16, 20, 4, 12); // Body right
            detailsCtx.fillRect(28, 20, 4, 12); // Body left
            detailsCtx.fillRect(32, 20, 8, 12); // Body back
            detailsCtx.fillRect(44, 24, 4, 8); // Right arm sleeve
            detailsCtx.fillRect(36, 56, 4, 8); // Left arm sleeve
            // Pants
            detailsCtx.fillStyle = colors.pants;
            detailsCtx.fillRect(4, 20, 4, 12);
            detailsCtx.fillRect(0, 20, 4, 12);
            detailsCtx.fillRect(8, 20, 4, 12);
            detailsCtx.fillRect(12, 20, 4, 12);
            detailsCtx.fillRect(20, 52, 4, 12);
            detailsCtx.fillRect(16, 52, 4, 12);
            detailsCtx.fillRect(24, 52, 4, 12);
            detailsCtx.fillRect(28, 52, 4, 12);
            // Shoes
            detailsCtx.fillStyle = colors.shoes;
            detailsCtx.fillRect(4, 28, 4, 4);
            detailsCtx.fillRect(20, 60, 4, 4);
            
            compositeLayersToMain();
            updatePreview();
            
            // Clear the template choice after use
            localStorage.removeItem('skin-template-choice');
            return;
          }
        }
      } catch (e) {
        // Ignore invalid template data
      }
      localStorage.removeItem('skin-template-choice');
    }
    
    // Default: load steve template
    loadTemplate('steve');
  }, [loadTemplate, getLayerCanvas, compositeLayersToMain, updatePreview]);

  // 🎨 Recomposite layers when visibility/opacity changes
  useEffect(() => {
    compositeLayersToMain();
    updatePreview();
  }, [layers, compositeLayersToMain]);

  // 🎨 Flood Fill Algorithm - Proper bucket fill!
  const floodFill = useCallback((ctx: CanvasRenderingContext2D, startX: number, startY: number, fillColor: string) => {
    const imageData = ctx.getImageData(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
    const data = imageData.data;
    
    // Get target color at click position
    const startIdx = (startY * SKIN_WIDTH + startX) * 4;
    const targetR = data[startIdx];
    const targetG = data[startIdx + 1];
    const targetB = data[startIdx + 2];
    const targetA = data[startIdx + 3];
    
    // Parse fill color
    const fillR = parseInt(fillColor.slice(1, 3), 16);
    const fillG = parseInt(fillColor.slice(3, 5), 16);
    const fillB = parseInt(fillColor.slice(5, 7), 16);
    
    // Don't fill if same color
    if (targetR === fillR && targetG === fillG && targetB === fillB && targetA === 255) {
      return;
    }
    
    // Flood fill using queue (BFS)
    const queue: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();
    const tolerance = 5; // Color tolerance for more forgiving fills
    
    const colorMatches = (idx: number) => {
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      return Math.abs(r - targetR) <= tolerance &&
             Math.abs(g - targetG) <= tolerance &&
             Math.abs(b - targetB) <= tolerance &&
             Math.abs(a - targetA) <= tolerance;
    };
    
    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      const key = `${x},${y}`;
      
      if (visited.has(key)) continue;
      if (x < 0 || x >= SKIN_WIDTH || y < 0 || y >= SKIN_HEIGHT) continue;
      
      const idx = (y * SKIN_WIDTH + x) * 4;
      if (!colorMatches(idx)) continue;
      
      visited.add(key);
      
      // Fill this pixel
      data[idx] = fillR;
      data[idx + 1] = fillG;
      data[idx + 2] = fillB;
      data[idx + 3] = 255;
      
      // Add neighbors
      queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, []);

  // 🖌️ Draw line with interpolation (Bresenham's algorithm for smooth lines)
  const drawLineInterpolated = useCallback((
    ctx: CanvasRenderingContext2D,
    x0: number, y0: number,
    x1: number, y1: number,
    color: string,
    size: number,
    isEraser: boolean = false
  ) => {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    
    let x = x0;
    let y = y0;
    
    while (true) {
      // Draw at current position with brush size
      for (let bx = 0; bx < size; bx++) {
        for (let by = 0; by < size; by++) {
          const px = x + bx;
          const py = y + by;
          if (px >= 0 && px < SKIN_WIDTH && py >= 0 && py < SKIN_HEIGHT) {
            if (isEraser) {
              ctx.clearRect(px, py, 1, 1);
            } else {
              ctx.fillStyle = color;
              ctx.fillRect(px, py, 1, 1);
            }
          }
        }
      }
      
      if (x === x1 && y === y1) break;
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }, []);

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type === 'mousemove') return;

    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return;
    const mainCtx = mainCanvas.getContext('2d');
    if (!mainCtx) return;

    // 🎨 Get the active layer canvas to draw on
    const layerCanvas = getLayerCanvas(activeLayer);
    const ctx = layerCanvas.getContext('2d');
    if (!ctx) return;

    const rect = mainCanvas.getBoundingClientRect();
    const scaleX = SKIN_WIDTH / rect.width;
    const scaleY = SKIN_HEIGHT / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x < 0 || x >= SKIN_WIDTH || y < 0 || y >= SKIN_HEIGHT) return;

    // Spawn sparkle particle! ✨
    if (isDrawing && Math.random() > 0.7) {
      spawnParticle(e.clientX, e.clientY);
      playSound('draw'); // 🔊 Bloop!
      unlockAchievement('firstDraw'); // 🏆 First draw achievement!
      // 🤫 Night Owl - drawing between 2-5 AM
      const hour = new Date().getHours();
      if (hour >= 2 && hour < 5) {
        unlockAchievement('nightOwl');
      }
    }

    // Eyedropper - pick color from composite (main canvas)
    if (tool === 'eyedropper') {
      const imageData = mainCtx.getImageData(x, y, 1, 1).data;
      if (imageData[3] > 0) { // Not transparent
        const hex = '#' + [imageData[0], imageData[1], imageData[2]]
          .map(v => v.toString(16).padStart(2, '0')).join('');
        setSelectedColor(hex.toUpperCase());
        addRecentColor(hex.toUpperCase());
        playSound('click');
        // 🤫 Zen Master achievement - use eyedropper 20+ times
        eyedropperUseCount.current++;
        if (eyedropperUseCount.current >= 20) {
          unlockAchievement('zenMaster');
        }
      }
      return;
    }

    // 📏 Line tool - store start position on mouse down
    if (tool === 'line') {
      if (e.type === 'mousedown') {
        lineStartPosition.current = { x, y };
        // Create preview canvas if not exists
        if (!linePreviewCanvas.current) {
          linePreviewCanvas.current = document.createElement('canvas');
          linePreviewCanvas.current.width = SKIN_WIDTH;
          linePreviewCanvas.current.height = SKIN_HEIGHT;
        }
        // Copy current layer to preview
        const previewCtx = linePreviewCanvas.current.getContext('2d');
        if (previewCtx) {
          previewCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
          previewCtx.drawImage(layerCanvas, 0, 0);
        }
      } else if (e.type === 'mousemove' && lineStartPosition.current && linePreviewCanvas.current) {
        // Preview the line
        const previewCtx = linePreviewCanvas.current.getContext('2d');
        if (previewCtx) {
          // Restore original layer
          ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
          ctx.drawImage(linePreviewCanvas.current, 0, 0);
          // Draw preview line
          drawLineInterpolated(ctx, lineStartPosition.current.x, lineStartPosition.current.y, x, y, selectedColor, brushSize);
          compositeLayersToMain();
          updatePreview();
        }
      }
      return;
    }

    // Check if in selected part (if any)
    if (selectedPart) {
      const part = BODY_PARTS[selectedPart as keyof typeof BODY_PARTS];
      if (x < part.x || x >= part.x + part.w || y < part.y || y >= part.y + part.h) {
        return;
      }
    }

    // 🪣 Fill tool - proper flood fill
    if (tool === 'fill') {
      floodFill(ctx, x, y, selectedColor);
      // 🪞 Mirror mode - also fill on the opposite side
      if (mirrorMode) {
        const mirrorX = SKIN_WIDTH - 1 - x;
        floodFill(ctx, mirrorX, y, selectedColor);
      }
      compositeLayersToMain();
      updatePreview();
      return;
    }

    // 🌈 Gradient fill on selected part
    if (tool === 'gradient') {
      if (selectedPart) {
        const part = BODY_PARTS[selectedPart as keyof typeof BODY_PARTS];
        const gradient = ctx.createLinearGradient(part.x, part.y, part.x + part.w, part.y + part.h);
        gradient.addColorStop(0, selectedColor);
        gradient.addColorStop(1, secondaryColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(part.x, part.y, part.w, part.h);
      } else {
        // Gradient on entire canvas if no part selected
        const gradient = ctx.createLinearGradient(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
        gradient.addColorStop(0, selectedColor);
        gradient.addColorStop(1, secondaryColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
      }
      compositeLayersToMain();
      updatePreview();
      return;
    }

    // ⭐ Stamp tool
    if (tool === 'stamp') {
      ctx.fillStyle = selectedColor;
      const patterns: Record<string, number[][]> = {
        star: [[1,0],[0,1],[1,1],[2,1],[1,2]],
        heart: [[0,1],[2,1],[0,0],[1,1],[2,0]],
        diamond: [[1,0],[0,1],[2,1],[1,2]],
        smiley: [[0,0],[2,0],[0,2],[1,2],[2,2],[1,1]],
        fire: [[1,0],[0,1],[1,1],[2,1],[0,2],[1,2],[2,2]],
        lightning: [[1,0],[0,1],[1,1],[1,2],[2,2]],
      };
      const pattern = patterns[stampShape] || patterns.star;
      pattern.forEach(([pdx, pdy]) => {
        const px = x + pdx;
        const py = y + pdy;
        if (px >= 0 && px < SKIN_WIDTH && py >= 0 && py < SKIN_HEIGHT) {
          ctx.fillRect(px, py, 1, 1);
          // 🪞 Mirror mode - stamp on opposite side (mirrored horizontally)
          if (mirrorMode) {
            const mirrorPx = SKIN_WIDTH - 1 - px;
            if (mirrorPx >= 0 && mirrorPx < SKIN_WIDTH) {
              ctx.fillRect(mirrorPx, py, 1, 1);
            }
          }
        }
      });
      compositeLayersToMain();
      updatePreview();
      return;
    }

    // ✨ Glow brush
    if (tool === 'glow') {
      ctx.shadowColor = selectedColor;
      ctx.shadowBlur = 2;
      ctx.fillStyle = selectedColor;
      for (let i = 0; i < brushSize; i++) {
        for (let j = 0; j < brushSize; j++) {
          const px = x + i;
          const py = y + j;
          if (px >= 0 && px < SKIN_WIDTH && py >= 0 && py < SKIN_HEIGHT) {
            ctx.fillRect(px, py, 1, 1);
            // 🪞 Mirror mode for glow
            if (mirrorMode) {
              const mirrorPx = SKIN_WIDTH - 1 - px;
              if (mirrorPx >= 0 && mirrorPx < SKIN_WIDTH) {
                ctx.fillRect(mirrorPx, py, 1, 1);
              }
            }
          }
        }
      }
      ctx.shadowBlur = 0;
      compositeLayersToMain();
      updatePreview();
      return;
    }

    // ✏️ Pencil - precise 1px drawing with interpolation
    if (tool === 'pencil') {
      ctx.fillStyle = selectedColor;
      // Interpolate from last position for smooth lines
      if (lastDrawPosition.current && isDrawing) {
        drawLineInterpolated(ctx, lastDrawPosition.current.x, lastDrawPosition.current.y, x, y, selectedColor, 1, false);
        if (mirrorMode) {
          drawLineInterpolated(ctx, SKIN_WIDTH - 1 - lastDrawPosition.current.x, lastDrawPosition.current.y, SKIN_WIDTH - 1 - x, y, selectedColor, 1, false);
        }
      } else {
        ctx.fillRect(x, y, 1, 1);
        if (mirrorMode) {
          ctx.fillRect(SKIN_WIDTH - 1 - x, y, 1, 1);
        }
      }
      lastDrawPosition.current = { x, y };
      compositeLayersToMain();
      updatePreview();
      return;
    }

    // 💨 Spray - random pixels in radius (airbrush effect)
    if (tool === 'spray') {
      ctx.fillStyle = selectedColor;
      const sprayRadius = Math.max(brushSize * 2, 3);
      const density = 8 + brushSize * 4; // More density with larger brush
      for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * sprayRadius;
        const sprayX = Math.floor(x + Math.cos(angle) * radius);
        const sprayY = Math.floor(y + Math.sin(angle) * radius);
        if (sprayX >= 0 && sprayX < SKIN_WIDTH && sprayY >= 0 && sprayY < SKIN_HEIGHT) {
          ctx.fillRect(sprayX, sprayY, 1, 1);
          if (mirrorMode) {
            ctx.fillRect(SKIN_WIDTH - 1 - sprayX, sprayY, 1, 1);
          }
        }
      }
      compositeLayersToMain();
      updatePreview();
      return;
    }

    // 🖌️ Brush and 🧽 Eraser - with smooth interpolation!
    const isEraser = tool === 'eraser';
    
    // Interpolate from last position for smooth lines
    if (lastDrawPosition.current && isDrawing) {
      drawLineInterpolated(
        ctx,
        lastDrawPosition.current.x,
        lastDrawPosition.current.y,
        x, y,
        selectedColor,
        brushSize,
        isEraser
      );
      
      // Mirror mode - draw on opposite side too! 🪞
      if (mirrorMode && !isEraser) {
        drawLineInterpolated(
          ctx,
          SKIN_WIDTH - 1 - lastDrawPosition.current.x,
          lastDrawPosition.current.y,
          SKIN_WIDTH - 1 - x,
          y,
          selectedColor,
          brushSize,
          false
        );
      }
    } else {
      // First point - just draw a dot
      for (let dx = 0; dx < brushSize; dx++) {
        for (let dy = 0; dy < brushSize; dy++) {
          const px = x + dx;
          const py = y + dy;
          if (px >= 0 && px < SKIN_WIDTH && py >= 0 && py < SKIN_HEIGHT) {
            if (isEraser) {
              ctx.clearRect(px, py, 1, 1);
            } else {
              ctx.fillStyle = selectedColor;
              ctx.fillRect(px, py, 1, 1);
              if (mirrorMode) {
                ctx.fillRect(SKIN_WIDTH - 1 - px, py, 1, 1);
              }
            }
          }
        }
      }
    }
    
    // Update last position for next frame
    lastDrawPosition.current = { x, y };

    // 🎨 Composite all layers to main canvas
    compositeLayersToMain();
    updatePreview();
  };

  // 📱 Touch draw for mobile - improved for better responsiveness
  const drawTouch = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    if (!touch) return;

    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return;
    const mainCtx = mainCanvas.getContext('2d');
    if (!mainCtx) return;

    // 🎨 Get the active layer canvas to draw on
    const layerCanvas = getLayerCanvas(activeLayer);
    const ctx = layerCanvas.getContext('2d');
    if (!ctx) return;

    const rect = mainCanvas.getBoundingClientRect();
    const scaleX = SKIN_WIDTH / rect.width;
    const scaleY = SKIN_HEIGHT / rect.height;

    const x = Math.floor((touch.clientX - rect.left) * scaleX);
    const y = Math.floor((touch.clientY - rect.top) * scaleY);

    if (x < 0 || x >= SKIN_WIDTH || y < 0 || y >= SKIN_HEIGHT) return;

    // Eyedropper - pick color from composite (main canvas)
    if (tool === 'eyedropper') {
      const imageData = mainCtx.getImageData(x, y, 1, 1).data;
      if (imageData[3] > 0) { // Not transparent
        const hex = '#' + [imageData[0], imageData[1], imageData[2]]
          .map(v => v.toString(16).padStart(2, '0')).join('');
        setSelectedColor(hex.toUpperCase());
        playSound('click');
      }
      return;
    }

    if (selectedPart) {
      const part = BODY_PARTS[selectedPart as keyof typeof BODY_PARTS];
      if (x < part.x || x >= part.x + part.w || y < part.y || y >= part.y + part.h) {
        return;
      }
    }

    for (let dx = 0; dx < brushSize; dx++) {
      for (let dy = 0; dy < brushSize; dy++) {
        const px = x + dx;
        const py = y + dy;
        if (px >= SKIN_WIDTH || py >= SKIN_HEIGHT) continue;

        if (tool === 'eraser') {
          ctx.clearRect(px, py, 1, 1);
        } else if (tool === 'fill' && selectedPart) {
          const part = BODY_PARTS[selectedPart as keyof typeof BODY_PARTS];
          ctx.fillStyle = selectedColor;
          ctx.fillRect(part.x, part.y, part.w, part.h);
          // 🪞 Mirror mode for fill - fill mirrored region too
          if (mirrorMode) {
            const mirrorPartX = SKIN_WIDTH - part.x - part.w;
            ctx.fillRect(mirrorPartX, part.y, part.w, part.h);
          }
        } else if (tool === 'glow') {
          ctx.shadowColor = selectedColor;
          ctx.shadowBlur = 2;
          ctx.fillStyle = selectedColor;
          ctx.fillRect(px, py, 1, 1);
          // 🪞 Mirror mode for glow
          if (mirrorMode) {
            const mirrorPx = SKIN_WIDTH - 1 - px;
            ctx.fillRect(mirrorPx, py, 1, 1);
          }
          ctx.shadowBlur = 0;
        } else if (tool === 'stamp') {
          ctx.fillStyle = selectedColor;
          const patterns: Record<string, number[][]> = {
            star: [[1,0],[0,1],[1,1],[2,1],[1,2]],
            heart: [[0,1],[2,1],[0,0],[1,1],[2,0]],
            diamond: [[1,0],[0,1],[2,1],[1,2]],
            smiley: [[0,0],[2,0],[0,2],[1,2],[2,2],[1,1]],
            fire: [[1,0],[0,1],[1,1],[2,1],[0,2],[1,2],[2,2]],
            lightning: [[1,0],[0,1],[1,1],[1,2],[2,2]],
          };
          const pattern = patterns[stampShape] || patterns.star;
          pattern.forEach(([pdx, pdy]) => {
            const stampPx = x + pdx;
            const stampPy = y + pdy;
            ctx.fillRect(stampPx, stampPy, 1, 1);
            // 🪞 Mirror mode for stamp
            if (mirrorMode) {
              const mirrorStampPx = SKIN_WIDTH - 1 - stampPx;
              ctx.fillRect(mirrorStampPx, stampPy, 1, 1);
            }
          });
        } else {
          ctx.fillStyle = selectedColor;
          ctx.fillRect(px, py, 1, 1);
          if (mirrorMode) {
            const mirrorX = SKIN_WIDTH - 1 - px;
            ctx.fillRect(mirrorX, py, 1, 1);
          }
        }
      }
    }

    // 🎨 Composite all layers to main canvas
    compositeLayersToMain();
    updatePreview();
  }, [activeLayer, getLayerCanvas, selectedPart, brushSize, tool, selectedColor, mirrorMode, stampShape, compositeLayersToMain, updatePreview, playSound]);

  // 🎨 Export skin with layer options
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportLayers, setExportLayers] = useState<{ [key in LayerType]: boolean }>({
    base: true,
    details: true,
    accessories: true,
  });
  const [exportResolution, setExportResolution] = useState<64 | 128 | 256 | 512>(64);
  
  const EXPORT_RESOLUTIONS = [
    { size: 64, label: '64×64', desc: 'Original (Minecraft)' },
    { size: 128, label: '128×128', desc: '2× scale' },
    { size: 256, label: '256×256', desc: '4× scale' },
    { size: 512, label: '512×512', desc: '8× HD' },
  ] as const;

  const downloadSkin = (useSelectedLayers = false) => {
    // Create source canvas with the content to export
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = SKIN_WIDTH;
    sourceCanvas.height = SKIN_HEIGHT;
    const sourceCtx = sourceCanvas.getContext('2d');
    if (!sourceCtx) return;

    if (useSelectedLayers) {
      // Draw only selected layers
      layers.forEach(layer => {
        if (!exportLayers[layer.id]) return;
        const layerCanvas = layerCanvasRefs.current[layer.id];
        if (!layerCanvas) return;
        sourceCtx.globalAlpha = layer.opacity / 100;
        sourceCtx.drawImage(layerCanvas, 0, 0);
      });
      sourceCtx.globalAlpha = 1;
    } else {
      // Full composite from main canvas
      const canvas = canvasRef.current;
      if (!canvas) return;
      sourceCtx.drawImage(canvas, 0, 0);
    }

    // Scale to export resolution
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = exportResolution;
    finalCanvas.height = exportResolution;
    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx) return;
    
    finalCtx.imageSmoothingEnabled = false; // Keep pixelated look
    finalCtx.drawImage(sourceCanvas, 0, 0, exportResolution, exportResolution);

    // Generate filename with resolution suffix if not original
    const suffix = exportResolution > 64 ? `-${exportResolution}px` : '';
    const filename = `${skinName || 'my-skin'}${suffix}.png`;

    const link = document.createElement('a');
    link.download = filename;
    link.href = finalCanvas.toDataURL('image/png');
    link.click();

    // 🎉 Confetti celebration!
    setShowConfetti(true);
    playSound('download'); // 🔊 Celebration jingle!
    setTimeout(() => setShowConfetti(false), 3000);
    setShowExportPanel(false);
    unlockAchievement('downloaded'); // 🏆 Downloaded achievement!
    logExport(`PNG ${exportResolution}×${exportResolution}`); // 📊 Track export with resolution
  };
  
  // 💾 Save to My Skins collection
  const saveToMySkins = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const newSkin: SavedSkin = {
      id: `skin-${Date.now()}`,
      name: skinName || 'Untitled Skin',
      dataUrl: canvas.toDataURL('image/png'),
      timestamp: Date.now(),
      tags: [],
    };
    
    setSavedSkins(prev => [newSkin, ...prev]);
    playSound('save');
    unlockAchievement('saved');
    
    // Brief success feedback
    setShowExportPanel(false);
    alert(`✅ "${newSkin.name}" saved to My Skins!`);
  };

  // Export only base layer (skin without details/accessories)
  const downloadBaseOnly = () => {
    const baseCanvas = getLayerCanvas('base');
    const link = document.createElement('a');
    link.download = `${skinName || 'my-skin'}-base.png`;
    link.href = baseCanvas.toDataURL('image/png');
    link.click();
    playSound('download');
  };

  // 🎮 Export for Roblox (scaled up for avatar templates)
  const downloadForRoblox = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Roblox uses larger templates - scale 4x for quality
    const robloxCanvas = document.createElement('canvas');
    robloxCanvas.width = 256;
    robloxCanvas.height = 256;
    const ctx = robloxCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.imageSmoothingEnabled = false; // Keep pixelated look
    ctx.drawImage(canvas, 0, 0, 256, 256);
    
    const link = document.createElement('a');
    link.download = `${skinName || 'my-skin'}-roblox.png`;
    link.href = robloxCanvas.toDataURL('image/png');
    link.click();
    
    setShowConfetti(true);
    playSound('download');
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // 🗑️ Clear canvas
  const clearCanvas = () => {
    if (!confirm('Clear the entire canvas?')) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
    updatePreview();
    saveState();
    playSound('click');
  };

  // 🎲 RANDOM SKIN GENERATOR - Surprise the kids! 
  const generateRandomSkin = useCallback(() => {
    // 🎨 Fun color pools for each body part
    const skinTones = ['#ffdfc4', '#f0c8a8', '#d4a76a', '#c4a57b', '#8d6e4c', '#5c4033', '#7dcea0', '#87CEEB', '#DDA0DD', '#FFB6C1'];
    const hairColors = ['#442920', '#1a1a1a', '#8B4513', '#FFD700', '#FF4500', '#FF1493', '#00CED1', '#32CD32', '#9400D3', '#FF6347'];
    const shirtColors = ['#FF0000', '#FF8800', '#FFFF00', '#00FF00', '#00FFFF', '#0088FF', '#FF00FF', '#9B59B6', '#E91E63', '#FF6B6B'];
    const pantsColors = ['#3c2a5e', '#00008B', '#2c3e50', '#8B0000', '#006400', '#4B0082', '#191970', '#2F4F4F', '#696969', '#1a1a1a'];
    const shoesColors = ['#444444', '#1a1a1a', '#8B4513', '#A0522D', '#FFD700', '#C0C0C0', '#FF1493', '#00FF00'];
    const eyeColors = ['#ffffff', '#87CEEB', '#00ff00', '#FF69B4', '#FFD700', '#FF0000', '#00FFFF'];
    
    // 🎭 Fun special effects/accessories to randomly add
    const specialEffects = ['none', 'stars', 'hearts', 'stripes', 'spots', 'rainbow-hair', 'glowing-eyes', 'robot-face', 'cat-ears', 'sunglasses'];
    
    // Pick random colors
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    const skin = pick(skinTones);
    const hair = pick(hairColors);
    const shirt = pick(shirtColors);
    const pants = pick(pantsColors);
    const shoes = pick(shoesColors);
    const eyes = pick(eyeColors);
    const pupils = pick(['#000000', '#1a1a1a', '#4169E1', '#2c1810']);
    const effect = pick(specialEffects);

    // 🎨 Clear all layer canvases first
    const baseCanvas = getLayerCanvas('base');
    const detailsCanvas = getLayerCanvas('details');
    const accessoriesCanvas = getLayerCanvas('accessories');

    const baseCtx = baseCanvas.getContext('2d');
    const detailsCtx = detailsCanvas.getContext('2d');
    const accessoriesCtx = accessoriesCanvas.getContext('2d');

    if (!baseCtx || !detailsCtx || !accessoriesCtx) return;

    baseCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
    detailsCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
    accessoriesCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);

    // 🎨 LAYER: BASE - Skin, face features
    // Head - front face (8x8 at position 8,8)
    baseCtx.fillStyle = skin;
    baseCtx.fillRect(8, 8, 8, 8);
    // Eyes
    baseCtx.fillStyle = eyes;
    baseCtx.fillRect(9, 11, 2, 1);
    baseCtx.fillRect(13, 11, 2, 1);
    baseCtx.fillStyle = pupils;
    baseCtx.fillRect(10, 11, 1, 1);
    baseCtx.fillRect(13, 11, 1, 1);
    // Hair
    baseCtx.fillStyle = hair;
    baseCtx.fillRect(8, 8, 8, 1);
    baseCtx.fillRect(8, 8, 1, 2);
    baseCtx.fillRect(15, 8, 1, 2);
    // Mouth
    baseCtx.fillStyle = '#a87d5a';
    baseCtx.fillRect(11, 14, 2, 1);

    // Head sides
    baseCtx.fillStyle = skin;
    baseCtx.fillRect(0, 8, 8, 8);
    baseCtx.fillRect(16, 8, 8, 8);
    baseCtx.fillRect(24, 8, 8, 8);
    baseCtx.fillStyle = hair;
    baseCtx.fillRect(24, 8, 8, 1);

    // Head top/bottom
    baseCtx.fillStyle = hair;
    baseCtx.fillRect(8, 0, 8, 8);
    baseCtx.fillStyle = skin;
    baseCtx.fillRect(16, 0, 8, 8);

    // Arms - skin parts
    baseCtx.fillStyle = skin;
    baseCtx.fillRect(44, 20, 4, 12);
    baseCtx.fillRect(40, 20, 4, 12);
    baseCtx.fillRect(48, 20, 4, 12);
    baseCtx.fillRect(52, 20, 4, 12);
    baseCtx.fillRect(36, 52, 4, 12);
    baseCtx.fillRect(32, 52, 4, 12);
    baseCtx.fillRect(40, 52, 4, 12);
    baseCtx.fillRect(44, 52, 4, 12);

    // 🎨 LAYER: DETAILS - Shirt, pants, shoes
    detailsCtx.fillStyle = shirt;
    detailsCtx.fillRect(20, 20, 8, 12);
    detailsCtx.fillRect(16, 20, 4, 12);
    detailsCtx.fillRect(28, 20, 4, 12);
    detailsCtx.fillRect(32, 20, 8, 12);

    // Legs - pants
    detailsCtx.fillStyle = pants;
    detailsCtx.fillRect(4, 20, 4, 12);
    detailsCtx.fillRect(0, 20, 4, 12);
    detailsCtx.fillRect(8, 20, 4, 12);
    detailsCtx.fillRect(12, 20, 4, 12);
    detailsCtx.fillRect(20, 52, 4, 12);
    detailsCtx.fillRect(16, 52, 4, 12);
    detailsCtx.fillRect(24, 52, 4, 12);
    detailsCtx.fillRect(28, 52, 4, 12);

    // Shoes
    detailsCtx.fillStyle = shoes;
    detailsCtx.fillRect(4, 31, 4, 1);
    detailsCtx.fillRect(20, 63, 4, 1);

    // 🎭 Apply special effects!
    if (effect === 'stars') {
      // Add star pattern to shirt
      accessoriesCtx.fillStyle = '#FFD700';
      accessoriesCtx.fillRect(22, 22, 1, 1);
      accessoriesCtx.fillRect(25, 25, 1, 1);
      accessoriesCtx.fillRect(21, 27, 1, 1);
      accessoriesCtx.fillRect(26, 23, 1, 1);
    } else if (effect === 'hearts') {
      // Heart on shirt
      accessoriesCtx.fillStyle = '#FF69B4';
      accessoriesCtx.fillRect(23, 23, 2, 2);
      accessoriesCtx.fillRect(22, 24, 1, 1);
      accessoriesCtx.fillRect(25, 24, 1, 1);
      accessoriesCtx.fillRect(24, 26, 1, 1);
    } else if (effect === 'stripes') {
      // Horizontal stripes on shirt
      const stripeColor = pick(['#ffffff', '#000000', '#FFD700']);
      accessoriesCtx.fillStyle = stripeColor;
      accessoriesCtx.fillRect(20, 22, 8, 1);
      accessoriesCtx.fillRect(20, 25, 8, 1);
      accessoriesCtx.fillRect(20, 28, 8, 1);
    } else if (effect === 'spots') {
      // Polka dots
      accessoriesCtx.fillStyle = pick(['#ffffff', '#000000', '#FF69B4']);
      accessoriesCtx.fillRect(21, 22, 1, 1);
      accessoriesCtx.fillRect(25, 24, 1, 1);
      accessoriesCtx.fillRect(22, 27, 1, 1);
      accessoriesCtx.fillRect(26, 29, 1, 1);
    } else if (effect === 'rainbow-hair') {
      // Rainbow gradient in hair
      const rainbowColors = ['#FF0000', '#FF8800', '#FFFF00', '#00FF00', '#0088FF', '#8800FF'];
      rainbowColors.forEach((c, i) => {
        baseCtx.fillStyle = c;
        baseCtx.fillRect(8 + i, 8, 1, 1);
      });
    } else if (effect === 'glowing-eyes') {
      // Bright glowing eyes
      baseCtx.fillStyle = '#00FF00';
      baseCtx.fillRect(9, 11, 2, 1);
      baseCtx.fillRect(13, 11, 2, 1);
      accessoriesCtx.fillStyle = '#ADFF2F';
      accessoriesCtx.fillRect(9, 10, 2, 1);
      accessoriesCtx.fillRect(13, 10, 2, 1);
    } else if (effect === 'robot-face') {
      // Robot antenna and visor
      accessoriesCtx.fillStyle = '#C0C0C0';
      accessoriesCtx.fillRect(11, 7, 2, 1);
      accessoriesCtx.fillRect(12, 6, 1, 1);
      accessoriesCtx.fillStyle = '#FF0000';
      accessoriesCtx.fillRect(12, 5, 1, 1);
      // Visor
      baseCtx.fillStyle = '#00BFFF';
      baseCtx.fillRect(9, 11, 6, 1);
    } else if (effect === 'cat-ears') {
      // Cat ears on head
      accessoriesCtx.fillStyle = hair;
      accessoriesCtx.fillRect(8, 7, 2, 1);
      accessoriesCtx.fillRect(9, 6, 1, 1);
      accessoriesCtx.fillRect(14, 7, 2, 1);
      accessoriesCtx.fillRect(14, 6, 1, 1);
      // Inner ear
      accessoriesCtx.fillStyle = '#FFB6C1';
      accessoriesCtx.fillRect(9, 7, 1, 1);
      accessoriesCtx.fillRect(14, 7, 1, 1);
    } else if (effect === 'sunglasses') {
      // Cool sunglasses
      accessoriesCtx.fillStyle = '#000000';
      accessoriesCtx.fillRect(9, 11, 2, 1);
      accessoriesCtx.fillRect(13, 11, 2, 1);
      accessoriesCtx.fillRect(11, 11, 2, 1);
      accessoriesCtx.fillRect(8, 11, 1, 1);
      accessoriesCtx.fillRect(15, 11, 1, 1);
    }

    // Composite all layers
    compositeLayersToMain();
    updatePreview();
    saveState();
    
    // 🎉 Confetti for surprise!
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
    playSound('success');

    // Trigger 3D preview refresh
    setTextureVersion(v => v + 1);
  }, [getLayerCanvas, compositeLayersToMain, updatePreview, saveState, playSound]);

  // 📋 Copy skin to clipboard
  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      playSound('click');
      // Show feedback
      alert('✅ Skin copied to clipboard!');
    } catch (err) {
      // Fallback: copy data URL
      const dataUrl = canvas.toDataURL('image/png');
      await navigator.clipboard.writeText(dataUrl);
      alert('📋 Skin URL copied!');
    }
  };

  // Import existing skin PNG 📥
  const importSkin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
      ctx.drawImage(img, 0, 0, SKIN_WIDTH, SKIN_HEIGHT);
      updatePreview();
      saveState();
      playSound('click');
    };
    img.src = URL.createObjectURL(file);
    e.target.value = ''; // Reset input
  };

  // Import skin from URL 🌐
  const importFromURL = async () => {
    if (!importURL.trim()) return;
    
    setImportLoading(true);
    setImportError(null);
    
    try {
      // Try to extract skin URL from various sources
      let skinURL = importURL.trim();
      
      // NameMC profile URL pattern
      if (skinURL.includes('namemc.com/profile/')) {
        const username = skinURL.split('/profile/')[1]?.split('/')[0];
        if (username) {
          skinURL = `https://mc-heads.net/skin/${username}`;
        }
      }
      // Skindex URL pattern  
      else if (skinURL.includes('minecraftskins.com/skin/')) {
        // Try direct download
        skinURL = skinURL.replace('/skin/', '/download/');
      }
      // Minotar for usernames
      else if (!skinURL.includes('http')) {
        // Assume it's a username
        skinURL = `https://mc-heads.net/skin/${skinURL}`;
      }
      
      // Fetch via proxy to avoid CORS
      const proxyURL = `https://corsproxy.io/?${encodeURIComponent(skinURL)}`;
      
      const response = await fetch(proxyURL);
      if (!response.ok) throw new Error('Failed to fetch skin');
      
      const blob = await response.blob();
      const img = new Image();
      
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
        ctx.drawImage(img, 0, 0, SKIN_WIDTH, SKIN_HEIGHT);
        updatePreview();
        saveState();
        playSound('click');
        
        setShowURLImport(false);
        setImportURL('');
        setImportLoading(false);
      };
      
      img.onerror = () => {
        setImportError('Failed to load image. Try a direct PNG URL.');
        setImportLoading(false);
      };
      
      img.src = URL.createObjectURL(blob);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import skin');
      setImportLoading(false);
    }
  };

  return (
    <div className={`min-h-screen p-6 flex flex-col items-center transition-all duration-700 ${
      darkMode
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
        : 'bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500'
    }`}
    style={{
      backgroundSize: '400% 400%',
      animation: 'gradient 15s ease infinite',
    }}>
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        /* Glass Card - Modern glassmorphism */
        .glass-card {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.1),
            0 2px 8px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }
        
        .glass-card:hover {
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.12),
            0 4px 12px rgba(0, 0, 0, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }
        
        /* Kid-friendly buttons */
        .kid-btn {
          padding: 0.625rem 1rem;
          border-radius: 0.75rem;
          font-weight: 700;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
        }
        
        .kid-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .kid-btn:active {
          transform: translateY(0) scale(0.97);
        }
        
        /* Smooth float animation */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-gentle {
          animation: float 4s ease-in-out infinite;
        }
        
        /* Wiggle animation for fun interactions */
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
        
        .animate-wiggle {
          animation: wiggle 0.4s ease-in-out;
        }
        
        /* Bounce-in for modals */
        @keyframes bounce-in {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Soft bounce for mascots */
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        
        .animate-bounce-soft {
          animation: bounce-soft 2s ease-in-out infinite;
        }
        
        /* Consistent scrollbar styling */
        .glass-card::-webkit-scrollbar,
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .glass-card::-webkit-scrollbar-track,
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 3px;
        }
        
        .glass-card::-webkit-scrollbar-thumb,
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 3px;
        }
        
        .glass-card::-webkit-scrollbar-thumb:hover,
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.25);
        }
        
        /* Consistent input focus states */
        input:focus, select:focus {
          outline: none;
          border-color: #a855f7 !important;
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
        }
        
        /* Slider styling */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          background: linear-gradient(to right, #e9d5ff, #f3e8ff);
          border-radius: 3px;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(168, 85, 247, 0.4);
          transition: transform 0.15s ease;
        }
        
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        
        /* Color picker styling */
        input[type="color"] {
          -webkit-appearance: none;
          appearance: none;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          overflow: hidden;
        }
        
        input[type="color"]::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        
        input[type="color"]::-webkit-color-swatch {
          border: none;
          border-radius: 6px;
        }
        
        /* Tool button active state glow */
        .tool-active {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(59, 130, 246, 0.25);
        }
      `}</style>
      {/* 🎉 Confetti celebration on download! */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      {/* ⌨️ Keyboard Shortcuts Help */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowShortcuts(false)}>
          <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-2xl max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">⌨️ Keyboard Shortcuts</h2>
            <input
              type="text"
              placeholder="🔍 Search shortcuts..."
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm mb-3 focus:outline-none focus:border-purple-500"
              onChange={(e) => {
                const query = e.target.value.toLowerCase();
                document.querySelectorAll('[data-shortcut]').forEach(el => {
                  const text = el.getAttribute('data-shortcut') || '';
                  (el as HTMLElement).style.display = text.includes(query) ? '' : 'none';
                });
              }}
            />
            <div className="grid grid-cols-2 gap-2 text-sm max-h-60 overflow-auto">
              <div data-shortcut="b brush" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">B</div><div className="py-2">Brush tool</div></div>
              <div data-shortcut="p pencil" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">P</div><div className="py-2">Pencil (1px)</div></div>
              <div data-shortcut="e eraser" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">E</div><div className="py-2">Eraser</div></div>
              <div data-shortcut="r spray airbrush" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">R</div><div className="py-2">Spray</div></div>
              <div data-shortcut="f fill bucket" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">F</div><div className="py-2">Fill bucket</div></div>
              <div data-shortcut="i eyedropper color picker" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">I</div><div className="py-2">Eyedropper</div></div>
              <div data-shortcut="1 2 3 4 5 brush size" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">1-5</div><div className="py-2">Brush size</div></div>
              <div data-shortcut="z undo ctrl cmd" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">⌘/Ctrl + Z</div><div className="py-2">Undo</div></div>
              <div data-shortcut="y redo ctrl cmd" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">⌘/Ctrl + Shift + Z</div><div className="py-2">Redo</div></div>
              <div data-shortcut="s save ctrl cmd" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">⌘/Ctrl + S</div><div className="py-2">Save</div></div>
              <div data-shortcut="? help shortcuts" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">?</div><div className="py-2">This help</div></div>
              <div data-shortcut="esc escape close" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">Esc</div><div className="py-2">Close panels</div></div>
            </div>
            <p className="text-gray-400 text-xs mt-4 text-center">Press ? or Esc to close</p>
          </div>
        </div>
      )}

      {/* 🏆 Achievement Popup */}
      {showAchievement && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <span className="text-4xl">{showAchievement.emoji}</span>
            <div>
              <p className="text-xs opacity-75">Achievement Unlocked!</p>
              <p className="font-bold text-lg">{showAchievement.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* 🏆 Achievement Gallery */}
      {showAchievementGallery && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowAchievementGallery(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">🏆 Achievements</h2>
              <span className="text-sm text-gray-500">
                {Object.values(achievements).filter(Boolean).length}/{Object.keys(ACHIEVEMENTS).length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-auto">
              {Object.entries(ACHIEVEMENTS).map(([id, ach]) => (
                <div
                  key={id}
                  className={`p-3 rounded-xl text-center transition-all ${
                    achievements[id]
                      ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-400'
                      : 'bg-gray-100 opacity-50'
                  }`}
                >
                  <div className={`text-3xl mb-1 ${achievements[id] ? '' : 'grayscale'}`}>
                    {ach.emoji}
                  </div>
                  <p className="font-bold text-sm">{ach.name}</p>
                  {!achievements[id] && <p className="text-xs text-gray-400 mt-1">🔒 Locked</p>}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAchievementGallery(false)}
              className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 🎉 T1000 MILESTONE POPUP */}
      {showMilestone && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-white px-8 py-6 rounded-3xl shadow-2xl animate-bounce">
            <div className="text-center">
              <div className="text-6xl mb-2">🎉</div>
              <h2 className="text-3xl font-black mb-2">TASK 1000!</h2>
              <p className="text-lg opacity-90">Milestone Reached!</p>
              <p className="text-sm opacity-75 mt-2">22+ features added today</p>
            </div>
          </div>
        </div>
      )}

      {/* ✨ Sparkle particles when drawing */}
      {particles.map(p => (
        <div
          key={p.id}
          className="fixed pointer-events-none animate-ping"
          style={{
            left: p.x - 8,
            top: p.y - 8,
            width: 16,
            height: 16,
            backgroundColor: p.color,
            borderRadius: '50%',
            boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`,
            zIndex: 9999,
          }}
        />
      ))}
      {/* Header */}
      <div className="text-center mb-4 md:mb-6 relative px-12 md:px-0 skin-animate-in">
        {/* Mobile Menu Button - More prominent */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden absolute left-0 top-0 w-11 h-11 bg-white/30 rounded-xl hover:bg-white/40 active:scale-95 transition-all flex items-center justify-center shadow-lg skin-btn-premium"
          aria-label="Menu"
        >
          <span className="text-2xl">{showMobileMenu ? '✕' : '☰'}</span>
        </button>
        
        <div className="flex items-center justify-center gap-2 mb-1 skin-animate-in delay-100">
          <span className="text-sm font-semibold text-white/80 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
            🌙 Moonlight
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl animate-float skin-animate-in-scale delay-150" style={{ textShadow: '0 0 40px rgba(139, 92, 246, 0.5), 0 4px 20px rgba(0,0,0,0.3)' }}>
          🎨 Skin Studio
        </h1>
        <p className="text-lg text-white/90 mt-1">
          AI Skin Creator for Minecraft & Roblox ✨
          <button
            onClick={() => setShowShortcuts(true)}
            className="ml-3 px-2 py-1 text-sm bg-white/20 hover:bg-white/30 rounded-full transition-all"
            title="Keyboard shortcuts (?)"
          >
            ⌨️ Help
          </button>
          <button
            onClick={() => setShowAchievementGallery(true)}
            className="ml-2 px-2 py-1 text-sm bg-yellow-500/30 hover:bg-yellow-500/50 rounded-full transition-all"
            title="View achievements"
          >
            🏆 {Object.values(achievements).filter(Boolean).length}/{Object.keys(ACHIEVEMENTS).length}
          </button>
          <button
            onClick={() => setSoundMuted(!soundMuted)}
            className={`ml-2 px-2 py-1 text-sm rounded-full transition-all ${
              soundMuted ? 'bg-red-500/50 hover:bg-red-500/70' : 'bg-green-500/30 hover:bg-green-500/50'
            }`}
            title={soundMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {soundMuted ? '🔇' : '🔊'}
          </button>
        </p>

        {/* Daily Challenge Banner */}
        <div className="mt-3 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 rounded-xl px-4 py-2 text-white text-sm flex items-center justify-between skin-glass-card skin-animate-in delay-200 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="flex items-center gap-2 relative z-10">
            <span className="text-lg animate-bounce">📅</span>
            <span className="font-bold">Daily Challenge:</span>
            <span className="font-semibold">{todayChallenge.theme}</span>
            <span className="opacity-80 text-xs hidden sm:inline">• {todayChallenge.hint}</span>
          </div>
          <span className="text-xs opacity-75 relative z-10">#SkinStudioChallenge</span>
        </div>

        {/* Game Selector */}
        <div className="flex gap-2 mt-3 skin-animate-in delay-250">
          {(Object.entries(GAME_CONFIGS) as [GameType, GameConfig][]).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedGame(key)}
              className={`px-4 py-2 rounded-full font-bold transition-all duration-300 skin-btn-premium ${
                selectedGame === key
                  ? 'bg-white text-purple-600 scale-105 shadow-lg shadow-purple-500/30'
                  : 'bg-white/20 text-white hover:bg-white/30 hover:scale-105'
              }`}
            >
              {config.emoji} {config.name}
            </button>
          ))}
        </div>

        {/* Model Selector (Steve vs Alex) - Only for Minecraft */}
        {selectedGame === 'minecraft' && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setSkinModel('steve')}
              className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                skinModel === 'steve'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title="Steve model - 4px arms"
            >
              👦 Steve
            </button>
            <button
              onClick={() => setSkinModel('alex')}
              className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                skinModel === 'alex'
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title="Alex model - 3px slim arms"
            >
              👧 Alex (slim)
            </button>
          </div>
        )}

        {/* View Mode Tabs */}
        <div className="flex gap-2 mt-4 flex-wrap justify-center skin-animate-in delay-300">
          <button
            onClick={() => setViewMode('editor')}
            className={`px-6 py-2 rounded-full font-bold transition-all duration-300 skin-btn-premium ${
              viewMode === 'editor'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105 shadow-lg shadow-purple-500/40'
                : 'bg-white/20 text-white hover:bg-white/30 hover:scale-105'
            }`}
          >
            🎨 Editor
          </button>
          <button
            onClick={() => setViewMode('gallery')}
            className={`px-6 py-2 rounded-full font-bold transition-all duration-300 skin-btn-premium ${
              viewMode === 'gallery'
                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white scale-105 shadow-lg shadow-green-500/40'
                : 'bg-white/20 text-white hover:bg-white/30 hover:scale-105'
            }`}
          >
            🖼️ Gallery
          </button>
          <a
            href="/games/skin-creator/gallery"
            className="px-6 py-2 rounded-full font-bold transition-all duration-300 bg-gradient-to-r from-orange-400 to-pink-500 text-white hover:from-orange-500 hover:to-pink-600 flex items-center gap-1 skin-btn-premium hover:scale-105 shadow-lg shadow-orange-500/30 animate-pulse"
          >
            🌟 Community Skins
          </a>
        </div>
      </div>

      {/* Gallery View */}
      {viewMode === 'gallery' && (
        <div className="w-full max-w-6xl px-2 mt-4">
          {/* 🏆 Leaderboard */}
          <div className="mb-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
              🏆 Top Creators This Week
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { rank: '🥇', name: 'PixelMaster', skins: 47 },
                { rank: '🥈', name: 'SkinWizard', skins: 38 },
                { rank: '🥉', name: 'BlockArtist', skins: 31 },
                { rank: '4', name: 'CraftQueen', skins: 28 },
                { rank: '5', name: 'You?', skins: '🚀' },
              ].map((user, i) => (
                <div key={i} className="bg-white/80 rounded-xl p-2 text-center">
                  <div className="text-2xl">{user.rank}</div>
                  <div className="font-bold text-sm truncate">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.skins} skins</div>
                </div>
              ))}
            </div>
          </div>

          <SkinGallery
            onSelectSkin={(imageData: string) => {
              // Load skin into editor
              const img = new Image();
              img.onload = () => {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = 64;
                tempCanvas.height = 64;
                const tempCtx = tempCanvas.getContext('2d');
                if (tempCtx) {
                  tempCtx.drawImage(img, 0, 0, 64, 64);
                  const imageData = tempCtx.getImageData(0, 0, 64, 64);
                  // Apply to all layer canvases
                  layerCanvasRefs.current.forEach(canvas => {
                    if (canvas) {
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        ctx.putImageData(imageData, 0, 0);
                      }
                    }
                  });
                  redrawPreview();
                  setViewMode('editor');
                }
              };
              img.src = imageData;
            }}
            currentSkinData={(() => {
              // Get current skin as base64
              const previewCanvas = previewCanvasRef.current;
              if (previewCanvas) {
                return previewCanvas.toDataURL('image/png');
              }
              return undefined;
            })()}
          />
        </div>
      )}

      {/* Editor View */}
      <div className={`flex flex-col lg:flex-row gap-4 w-full max-w-6xl px-2 ${viewMode !== 'editor' ? 'hidden' : ''}`}>
        {/* Left Panel - Preview - Clean and focused */}
        <div className="glass-card skin-glass-card rounded-3xl p-4 md:p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 skin-animate-in-left delay-300">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-xl md:text-2xl font-black text-gray-800 flex items-center gap-2">
              <span className="animate-float-gentle">👀</span> Preview
            </h2>
            <button
              onClick={() => { setShow3D(!show3D); playSound('click'); }}
              className={`kid-btn px-4 py-2 text-sm font-bold transition-all ${
                show3D
                  ? 'bg-purple-500 text-white shadow-lg ring-2 ring-purple-300'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title="Toggle 3D view - drag to rotate!"
            >
              {show3D ? '🎮 3D ON' : '📐 2D'}
            </button>
          </div>
          
          {/* Pose Selector - Simplified */}
          {show3D && (
            <div className="flex flex-wrap justify-center gap-2 mb-3">
              {POSES.slice(0, 5).map(pose => (
                <button
                  key={pose.id}
                  onClick={() => { setSelectedPose(pose.id); playSound('click'); }}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    selectedPose === pose.id
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  title={pose.desc}
                >
                  {pose.name}
                </button>
              ))}
            </div>
          )}

          {show3D ? (
            <div className="rounded-xl mx-auto overflow-hidden skin-preview-3d-container" style={{ width: 200, height: 280 }}>
              <SkinPreview3D skinCanvas={canvasRef.current} />
            </div>
          ) : (
            <canvas
              ref={previewRef}
              width={200}
              height={280}
              className="rounded-xl mx-auto"
              style={{ imageRendering: 'pixelated' }}
            />
          )}

          {/* Templates - Simplified with categories */}
          <div className="mt-4">
            <p className="text-sm font-bold text-gray-700 mb-3">🎮 Start from a character:</p>
            
            {/* 🎮 CHARACTER TEMPLATES - Pre-made base skins! */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {CHARACTER_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => loadCharacterTemplate(template.id)}
                  className="group relative kid-btn bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg flex flex-col items-center py-3 hover:scale-105 transition-all duration-200 overflow-hidden"
                  title={template.description}
                >
                  {/* Skin preview thumbnail */}
                  <div className="relative w-10 h-10 mb-1">
                    <img
                      src={template.imagePath}
                      alt={template.name}
                      className="w-full h-full object-cover rounded"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <span className="text-lg leading-none">{template.emoji}</span>
                  <span className="text-xs font-bold mt-1">{template.name}</span>
                  {/* Hover tooltip */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                    <span className="text-xs text-center">{template.description}</span>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-500 mb-3 text-center">👆 Click a character to start customizing!</p>

            <p className="text-sm font-bold text-gray-700 mb-2">🎭 Or try these styles:</p>
            
            {/* Quick Start Row - Most popular */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                onClick={() => {
                  setIsWiggling(true);
                  generateRandomSkin();
                  setTimeout(() => setIsWiggling(false), 500);
                }}
                className={`kid-btn bg-gradient-to-r from-pink-500 to-yellow-500 text-white shadow-md flex flex-col items-center py-3 ${isWiggling ? 'animate-wiggle' : ''}`}
              >
                <span className="text-xl">🎲</span>
                <span className="text-xs font-bold">Random</span>
              </button>
              <button
                onClick={() => { loadTemplate('blank'); playSound('click'); }}
                className="kid-btn bg-gray-400 text-white shadow-md flex flex-col items-center py-3"
              >
                <span className="text-xl">⬜</span>
                <span className="text-xs font-bold">Blank</span>
              </button>
              <button
                onClick={() => { loadTemplate('robot'); playSound('click'); }}
                className="kid-btn bg-slate-600 text-white shadow-md flex flex-col items-center py-3"
              >
                <span className="text-xl">🤖</span>
                <span className="text-xs font-bold">Robot</span>
              </button>
            </div>
            
            {/* More Templates - Scrollable */}
            <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
              {Object.entries(TEMPLATES).slice(2, 8).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => {
                    loadTemplate(key as keyof typeof TEMPLATES);
                    playSound('click');
                    if (key === 'creeper') {
                      setShowConfetti(true);
                      setTimeout(() => setShowConfetti(false), 2000);
                    }
                  }}
                  className={`flex-shrink-0 px-3 py-2 text-white rounded-xl text-sm font-bold active:scale-95 transition-all shadow-md ${
                    key === 'creeper' ? 'bg-green-500' : 'bg-indigo-500'
                  }`}
                >
                  {template.name}
                </button>
              ))}
            </div>

            {/* Save & Share Row */}
            <div className="flex gap-2 mt-3 justify-center">
              <button
                onClick={() => { saveSkin(); playSound('save'); }}
                className="kid-btn px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg flex items-center gap-1"
              >
                <span className="text-lg">💾</span>
                <span className="text-sm font-bold">Save</span>
              </button>
              <button
                onClick={() => { setShowMySkins(!showMySkins); playSound('click'); }}
                className={`kid-btn px-4 shadow-lg flex items-center gap-1 ${
                  showMySkins ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'
                }`}
              >
                <span className="text-lg">📂</span>
                <span className="text-sm font-bold">{savedSkins.length}</span>
              </button>
              <button
                onClick={() => { shareSkin(); }}
                className="kid-btn px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg flex items-center gap-1"
              >
                <span className="text-lg">🔗</span>
                <span className="text-sm font-bold">Share</span>
              </button>
            </div>
            
            {/* Share URL Modal */}
            {shareUrl && (
              <div className="mt-2 p-2 bg-green-100 rounded-lg text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-green-800 font-bold">✅ Link copied!</span>
                  <button onClick={() => setShareUrl(null)} className="text-green-600 hover:text-green-800">✕</button>
                </div>
                <input 
                  type="text" 
                  value={shareUrl} 
                  readOnly 
                  className="w-full mt-1 p-1 text-xs bg-white rounded border truncate"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                {/* Social Share Buttons */}
                <div className="flex gap-2 mt-2 justify-center">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out my Minecraft skin! 🎮')}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-black text-white rounded text-xs hover:bg-gray-800"
                  >𝕏</a>
                  <a
                    href={`https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent('My Minecraft Skin')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
                  >Reddit</a>
                  <a
                    href={`https://discord.com/channels/@me?content=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600"
                  >Discord</a>
                  <button
                    onClick={() => {
                      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
                      window.open(qrUrl, '_blank');
                    }}
                    className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-800"
                    title="Generate QR Code"
                  >📱 QR</button>
                </div>
              </div>
            )}

            {/* My Skins Panel */}
            {showMySkins && savedSkins.length > 0 && (
              <div className="mt-2 p-2 bg-white/90 rounded-lg max-h-32 overflow-y-auto">
                <div className="grid grid-cols-5 gap-1">
                  {savedSkins.map(skin => (
                    <div key={skin.id} className="relative group">
                      <img
                        src={skin.dataUrl}
                        alt={skin.name}
                        className="w-10 h-10 rounded cursor-pointer hover:scale-110 transition-transform border-2 border-transparent hover:border-blue-500"
                        style={{ imageRendering: 'pixelated' }}
                        onClick={() => loadSavedSkin(skin)}
                        title={`${skin.name} - Click to load`}
                      />
                      <button
                        onClick={(e) => { 
                          e.stopPropagation();
                          // Rename skin
                          const newName = prompt('✏️ Rename skin:', skin.name);
                          if (newName && newName.trim()) {
                            setSavedSkins(prev => prev.map(s => s.id === skin.id ? { ...s, name: newName.trim() } : s));
                          }
                        }}
                        className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Rename"
                      >✏️</button>
                      <button
                        onClick={(e) => { 
                          e.stopPropagation();
                          // Add tag
                          const tagOptions = SKIN_TAGS.join('\n');
                          const tag = prompt(`🏷️ Add tag:\n${tagOptions}`, skin.tags?.[0] || '');
                          if (tag && tag.trim()) {
                            setSavedSkins(prev => prev.map(s => s.id === skin.id 
                              ? { ...s, tags: [...(s.tags || []), tag.trim()].slice(0, 3) } 
                              : s
                            ));
                          }
                        }}
                        className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Add tag"
                      >🏷️</button>
                      {/* Rating stars */}
                      {skin.rating && (
                        <div className="absolute top-8 left-0 right-0 flex justify-center text-xs">
                          {'⭐'.repeat(skin.rating)}
                        </div>
                      )}
                      <button
                        onClick={(e) => { 
                          e.stopPropagation();
                          // Duplicate skin
                          const newSkin = { ...skin, id: Date.now().toString(), name: `${skin.name} (copy)` };
                          setSavedSkins(prev => [...prev, newSkin]);
                        }}
                        className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Duplicate"
                      >📋</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSavedSkin(skin.id); }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete"
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {showMySkins && savedSkins.length === 0 && (
              <div className="mt-2 p-2 bg-white/90 rounded-lg text-center text-xs text-gray-500">
                No saved skins yet! Click 💾 Save to save your creation.
              </div>
            )}
          </div>
        </div>

        {/* Center - Canvas Editor */}
        <div className="flex-1 glass-card skin-glass-card rounded-2xl md:rounded-3xl p-3 md:p-6 shadow-2xl skin-animate-in delay-400 skin-canvas-container">
          {/* Toolbar - Mobile-friendly with larger touch targets */}
          <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4 justify-center px-1">
            <button
              onClick={() => setTool('brush')}
              title="🖌️ Draw! Click and drag to color (B)"
              className={`min-w-[44px] min-h-[44px] px-3 py-2 md:px-3 md:py-2 rounded-xl md:rounded-full text-base md:text-sm font-bold transition-all active:scale-95 ${
                tool === 'brush' ? 'bg-blue-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white'
              }`}
            >
              🖌️
            </button>
            <button
              onClick={() => setTool('pencil')}
              title="✏️ Pencil! Precise 1px drawing (P)"
              className={`min-w-[44px] min-h-[44px] px-3 py-2 md:px-3 md:py-2 rounded-xl md:rounded-full text-base md:text-sm font-bold transition-all active:scale-95 ${
                tool === 'pencil' ? 'bg-gray-700 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white'
              }`}
            >
              ✏️
            </button>
            <button
              onClick={() => setTool('eraser')}
              title="🧽 Erase! Remove colors (E)"
              className={`min-w-[44px] min-h-[44px] px-3 py-2 md:px-3 md:py-2 rounded-xl md:rounded-full text-base md:text-sm font-bold transition-all active:scale-95 ${
                tool === 'eraser' ? 'bg-pink-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white'
              }`}
            >
              🧽
            </button>
            <button
              onClick={() => setTool('spray')}
              title="💨 Spray! Airbrush effect (R)"
              className={`min-w-[44px] min-h-[44px] px-3 py-2 md:px-3 md:py-2 rounded-xl md:rounded-full text-base md:text-sm font-bold transition-all active:scale-95 ${
                tool === 'spray' ? 'bg-cyan-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white'
              }`}
            >
              💨
            </button>
            <button
              onClick={() => setTool('fill')}
              title="🪣 Fill! Color a whole area (F)"
              className={`min-w-[44px] min-h-[44px] px-3 py-2 md:px-3 md:py-2 rounded-xl md:rounded-full text-base md:text-sm font-bold transition-all active:scale-95 ${
                tool === 'fill' ? 'bg-yellow-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white'
              }`}
            >
              🪣
            </button>
            <button
              onClick={() => setTool('gradient')}
              title="🌈 Rainbow! Blend two colors"
              className={`min-w-[44px] min-h-[44px] px-3 py-2 md:px-3 md:py-2 rounded-xl md:rounded-full text-base md:text-sm font-bold transition-all active:scale-95 ${
                tool === 'gradient' ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white'
              }`}
            >
              🌈
            </button>
            <button
              onClick={() => setTool('glow')}
              title="✨ Glow! Make it sparkle"
              className={`min-w-[44px] min-h-[44px] px-3 py-2 md:px-3 md:py-2 rounded-xl md:rounded-full text-base md:text-sm font-bold transition-all active:scale-95 ${
                tool === 'glow' ? 'bg-purple-600 text-white scale-105 shadow-lg shadow-purple-500/50' : 'bg-white/80 hover:bg-white'
              }`}
            >
              ✨
            </button>
            <div className="relative group">
              <button
                onClick={() => setTool('stamp')}
                className={`min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl md:rounded-full font-bold transition-all active:scale-95 ${
                  tool === 'stamp' ? 'bg-pink-500 text-white scale-105' : 'bg-white/80 hover:bg-white'
                }`}
              >
                {stampShape === 'star' ? '⭐' : stampShape === 'heart' ? '❤️' : stampShape === 'diamond' ? '💎' : stampShape === 'smiley' ? '😊' : stampShape === 'fire' ? '🔥' : '⚡'} <span className="hidden sm:inline">Stamp</span>
              </button>
              {tool === 'stamp' && (
                <div className="absolute top-full left-0 mt-1 flex gap-1 bg-white rounded-lg p-2 shadow-lg z-10">
                  <button onClick={() => setStampShape('star')} className={`min-w-[40px] min-h-[40px] p-2 rounded-lg text-lg active:scale-95 ${stampShape === 'star' ? 'bg-pink-200' : 'hover:bg-gray-100'}`}>⭐</button>
                  <button onClick={() => setStampShape('heart')} className={`min-w-[40px] min-h-[40px] p-2 rounded-lg text-lg active:scale-95 ${stampShape === 'heart' ? 'bg-pink-200' : 'hover:bg-gray-100'}`}>❤️</button>
                  <button onClick={() => setStampShape('diamond')} className={`min-w-[40px] min-h-[40px] p-2 rounded-lg text-lg active:scale-95 ${stampShape === 'diamond' ? 'bg-pink-200' : 'hover:bg-gray-100'}`}>💎</button>
                  <button onClick={() => setStampShape('smiley')} className={`min-w-[40px] min-h-[40px] p-2 rounded-lg text-lg active:scale-95 ${stampShape === 'smiley' ? 'bg-pink-200' : 'hover:bg-gray-100'}`}>😊</button>
                  <button onClick={() => setStampShape('fire')} className={`min-w-[40px] min-h-[40px] p-2 rounded-lg text-lg active:scale-95 ${stampShape === 'fire' ? 'bg-pink-200' : 'hover:bg-gray-100'}`}>🔥</button>
                  <button onClick={() => setStampShape('lightning')} className={`min-w-[40px] min-h-[40px] p-2 rounded-lg text-lg active:scale-95 ${stampShape === 'lightning' ? 'bg-pink-200' : 'hover:bg-gray-100'}`}>⚡</button>
                </div>
              )}
            </div>
            <button
              onClick={() => setTool('eyedropper')}
              title="🎯 Pick a color from your drawing! (Press I)"
              className={`min-w-[44px] min-h-[44px] px-3 py-2 md:px-3 md:py-2 rounded-xl md:rounded-full text-base md:text-sm font-bold transition-all active:scale-95 ${
                tool === 'eyedropper' ? 'bg-amber-500 text-white scale-105 shadow-lg ring-2 ring-amber-300' : 'bg-white/80 hover:bg-white hover:ring-2 hover:ring-amber-200'
              }`}
            >
              🎯 <span className="hidden sm:inline">Pick</span>
            </button>
            <button
              onClick={() => { undo(); playSound('undo'); }}
              disabled={historyIndex <= 0}
              className={`min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl md:rounded-full font-bold transition-all active:scale-95 relative ${
                historyIndex <= 0 ? 'bg-gray-300 text-gray-500' : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
              title={`Undo (${historyIndex} steps available)`}
            >
              ↩️ <span className="hidden sm:inline">Undo</span>
              {historyIndex > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {historyIndex}
                </span>
              )}
            </button>
            <button
              onClick={() => { redo(); playSound('redo'); }}
              disabled={historyIndex >= history.length - 1}
              className={`min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl md:rounded-full font-bold transition-all active:scale-95 relative ${
                historyIndex >= history.length - 1 ? 'bg-gray-300 text-gray-500' : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
              title={`Redo (${history.length - 1 - historyIndex} steps available)`}
            >
              ↪️ <span className="hidden sm:inline">Redo</span>
              {historyIndex < history.length - 1 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {history.length - 1 - historyIndex}
                </span>
              )}
            </button>
            <button
              onClick={() => setMirrorMode(!mirrorMode)}
              className={`min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl md:rounded-full font-bold transition-all active:scale-95 ${
                mirrorMode ? 'bg-purple-500 text-white scale-105' : 'bg-white/80 hover:bg-white'
              }`}
            >
              🪞 <span className="hidden sm:inline">Mirror</span>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl md:rounded-full font-bold transition-all active:scale-95 ${
                darkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-white'
              }`}
            >
              {darkMode ? '☀️' : '🌙'} <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl md:rounded-full font-bold bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95"
              title="Import from file"
            >
              📥 <span className="hidden sm:inline">File</span>
            </button>
            <button
              onClick={() => setShowURLImport(true)}
              className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl md:rounded-full font-bold bg-cyan-500 text-white hover:bg-cyan-600 active:scale-95"
              title="Import from URL or username"
            >
              🌐 <span className="hidden sm:inline">URL</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png"
              onChange={importSkin}
              className="hidden"
            />
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <input
                type="text"
                value={skinName}
                onChange={(e) => setSkinName(e.target.value)}
                placeholder="skin-name"
                className="w-20 sm:w-24 px-2 py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-green-500 outline-none"
              />
              <button
                onClick={() => downloadSkin(false)}
                className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl md:rounded-full font-bold bg-green-500 text-white hover:bg-green-600 animate-pulse active:scale-95"
                title="💾 Save your skin!"
              >
                💾
              </button>
              <button
                onClick={() => setShowExportPanel(true)}
                className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl md:rounded-full font-bold bg-green-600 text-white hover:bg-green-700 active:scale-95"
                title="Export options (choose layers)"
              >
                📤
              </button>
            </div>
            <button
              onClick={copyToClipboard}
              className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl md:rounded-full font-bold bg-violet-500 text-white hover:bg-violet-600 active:scale-95"
              title="Copy to clipboard"
            >
              📋 <span className="hidden sm:inline">Copy</span>
            </button>
            <button
              onClick={clearCanvas}
              className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl md:rounded-full font-bold bg-red-500 text-white hover:bg-red-600 active:scale-95"
              title="🗑️ Start over!"
            >
              🗑️ <span className="hidden sm:inline">Clear</span>
            </button>
            <button
              onClick={generateRandomSkin}
              className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl md:rounded-full font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-white hover:from-yellow-500 hover:via-pink-600 hover:to-purple-600 active:scale-95 animate-pulse"
              title="🎲 Surprise! Generate a random fun skin!"
            >
              🎲 <span className="hidden sm:inline">Random!</span>
            </button>
            <div className="hidden md:flex items-center gap-1 ml-2">
              <button
                onClick={() => setZoomLevel(Math.max(2, zoomLevel - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 font-bold active:scale-95"
                title="Zoom out"
              >
                -
              </button>
              <span className="text-sm font-bold w-8 text-center">{zoomLevel}x</span>
              <button
                onClick={() => setZoomLevel(Math.min(20, zoomLevel + 1))}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 font-bold active:scale-95"
                title="Zoom in"
              >
                +
              </button>
            </div>
          </div>

          {/* Brush Size - Mobile friendly */}
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3">
            <span className="text-sm font-semibold">Brush:</span>
            {[1, 2, 3].map((size) => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                className={`min-w-[44px] min-h-[44px] md:w-10 md:h-10 rounded-full font-bold text-lg active:scale-95 transition-all ${
                  brushSize === size ? 'bg-blue-500 text-white scale-110' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Body Part Selector - Mobile friendly with scrollable on small screens */}
          <div className="flex flex-wrap gap-1.5 mb-3 justify-center px-1 max-w-full overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            <button
              onClick={() => setSelectedPart(null)}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap active:scale-95 transition-all ${
                !selectedPart ? 'bg-purple-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              🎯 All
            </button>
            {Object.entries(BODY_PARTS).map(([key, part]) => (
              <button
                key={key}
                onClick={() => setSelectedPart(key)}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap active:scale-95 transition-all ${
                  selectedPart === key ? 'bg-purple-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {part.label}
              </button>
            ))}
          </div>

          {/* Canvas with Grid Controls */}
          <div className="flex flex-col items-center gap-2 w-full">
            {/* 🔍 ZOOM CONTROLS - Enhanced for Pixel-Precise Editing */}
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex items-center gap-2 bg-white/95 rounded-2xl px-4 py-2 shadow-lg flex-wrap justify-center border border-purple-200">
                {/* Zoom Out */}
                <button
                  onClick={() => { setZoomLevel(Math.max(2, zoomLevel - 1)); playSound('click'); }}
                  className="kid-btn bg-gray-100 hover:bg-gray-200 font-black text-xl"
                  title="Zoom out (- key)"
                >
                  ➖
                </button>
                
                {/* Zoom Level Display + Quick Presets */}
                <div className="relative group">
                  <div className="bg-purple-100 px-4 py-2 rounded-xl cursor-pointer hover:bg-purple-200 transition-colors">
                    <span className="text-lg font-black text-purple-600">{zoomLevel}x</span>
                  </div>
                  {/* Quick zoom presets dropdown */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-20 bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-[140px]">
                    <p className="text-xs text-gray-500 mb-2 text-center font-medium">Quick Zoom</p>
                    <div className="grid grid-cols-4 gap-1">
                      {[4, 6, 8, 10, 12, 14, 16, 20].map((z) => (
                        <button
                          key={z}
                          onClick={() => { setZoomLevel(z); playSound('click'); }}
                          className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                            zoomLevel === z 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {z}x
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 text-center">+/- keys • 0 = reset</p>
                  </div>
                </div>
                
                {/* Zoom In */}
                <button
                  onClick={() => { setZoomLevel(Math.min(20, zoomLevel + 1)); playSound('click'); }}
                  className="kid-btn bg-gray-100 hover:bg-gray-200 font-black text-xl"
                  title="Zoom in (+ key)"
                >
                  ➕
                </button>
                
                <div className="w-px h-8 bg-gray-300 mx-1 hidden sm:block"></div>
                
                {/* 📐 Grid Toggle */}
                <button
                  onClick={() => { setShowGrid(!showGrid); playSound('click'); }}
                  className={`kid-btn px-3 font-bold ${
                    showGrid
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Toggle grid (Shift+G)"
                >
                  <span className="text-lg mr-1">{showGrid ? '▦' : '▢'}</span>
                  <span className="text-xs">Grid</span>
                </button>
                
                {/* Grid Color Selector - Only visible when grid is on */}
                {showGrid && (
                  <div className="flex items-center gap-1">
                    {(['dark', 'light', 'blue', 'red'] as const).map((color) => (
                      <button
                        key={color}
                        onClick={() => { setGridColor(color); playSound('click'); }}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          gridColor === color ? 'scale-125 border-purple-500' : 'border-gray-300 hover:scale-110'
                        }`}
                        style={{
                          backgroundColor: color === 'dark' ? '#333' : color === 'light' ? '#ccc' : color === 'blue' ? '#3b82f6' : '#ef4444'
                        }}
                        title={`${color} grid`}
                      />
                    ))}
                  </div>
                )}
                
                <div className="w-px h-8 bg-gray-300 mx-1 hidden sm:block"></div>
                
                {/* 🎯 Body Parts Overlay */}
                <button
                  onClick={() => { setShowBodyPartOverlay(!showBodyPartOverlay); playSound('click'); }}
                  className={`kid-btn px-3 font-bold ${
                    showBodyPartOverlay
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Show body part regions"
                >
                  <span className="text-lg mr-1">🎯</span>
                  <span className="text-xs">Parts</span>
                </button>
              </div>
              
              {/* Pixel Coordinate Display + Eyedropper Preview */}
              {hoverPixel && (
                <div className="flex items-center gap-2 bg-gray-900/90 text-white px-3 py-1 rounded-lg text-xs font-mono">
                  <span>📍</span>
                  <span>X: <strong>{hoverPixel.x}</strong></span>
                  <span>Y: <strong>{hoverPixel.y}</strong></span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-300">{SKIN_WIDTH}×{SKIN_HEIGHT}</span>
                  {/* 🎯 Eyedropper color preview */}
                  {tool === 'eyedropper' && eyedropperPreviewColor && (
                    <>
                      <span className="text-gray-400">|</span>
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-4 h-4 rounded border border-white/50 shadow-inner" 
                          style={{ backgroundColor: eyedropperPreviewColor }}
                        />
                        <span className="text-amber-300 font-bold">{eyedropperPreviewColor}</span>
                      </div>
                    </>
                  )}
                  {tool === 'eyedropper' && !eyedropperPreviewColor && (
                    <>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-500 italic">transparent</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Canvas - with overflow scroll for mobile */}
            <div className="relative overflow-auto max-w-full pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
              {/* Floating Help Tip */}
              {!helpTipDismissed['canvas'] && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 animate-bounce pointer-events-auto">
                  <div className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg flex items-center gap-2 whitespace-nowrap">
                    👆 Tap and drag to draw!
                    <button 
                      onClick={() => dismissTip('canvas')}
                      className="ml-1 hover:bg-blue-600 rounded-full w-6 h-6 text-xs active:scale-95"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-500 mx-auto" />
                </div>
              )}
            <div
              className="relative rounded-xl p-1 mx-auto"
              style={{
                backgroundImage: 'repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%)',
                backgroundSize: '12px 12px',
                width: 'fit-content'
              }}
            >
              <canvas
                ref={canvasRef}
                width={SKIN_WIDTH}
                height={SKIN_HEIGHT}
                className="block"
                style={{
                  width: SKIN_WIDTH * zoomLevel,
                  height: SKIN_HEIGHT * zoomLevel,
                  imageRendering: 'pixelated',
                  transition: 'width 0.2s ease, height 0.2s ease',
                  touchAction: 'none', // Prevent browser touch handling for drawing
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  cursor: tool === 'eyedropper' ? 'copy' : 'crosshair',
                }}
                onMouseDown={(e) => { setIsDrawing(true); draw(e); }}
                onMouseUp={() => { setIsDrawing(false); saveState(); addRecentColor(selectedColor); }}
                onMouseLeave={() => { setIsDrawing(false); setContextMenu(null); setHoverPixel(null); setEyedropperPreviewColor(null); }}
                onMouseMove={(e) => {
                  draw(e);
                  // Track pixel position for coordinate display
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.floor((e.clientX - rect.left) / zoomLevel);
                  const y = Math.floor((e.clientY - rect.top) / zoomLevel);
                  if (x >= 0 && x < SKIN_WIDTH && y >= 0 && y < SKIN_HEIGHT) {
                    setHoverPixel({ x, y });
                    // 🎯 Eyedropper preview: show color under cursor
                    if (tool === 'eyedropper' && canvasRef.current) {
                      const mainCtx = canvasRef.current.getContext('2d');
                      if (mainCtx) {
                        const imageData = mainCtx.getImageData(x, y, 1, 1).data;
                        if (imageData[3] > 0) {
                          const hex = '#' + [imageData[0], imageData[1], imageData[2]]
                            .map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
                          setEyedropperPreviewColor(hex);
                        } else {
                          setEyedropperPreviewColor(null);
                        }
                      }
                    }
                  } else {
                    setHoverPixel(null);
                    setEyedropperPreviewColor(null);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY });
                }}
                onTouchStart={(e) => {
                  // Only prevent default for drawing, allow pinch-to-zoom
                  if (e.touches.length === 2) {
                    // Pinch start - calculate initial distance
                    const dx = e.touches[0].clientX - e.touches[1].clientX;
                    const dy = e.touches[0].clientY - e.touches[1].clientY;
                    lastPinchDistance.current = Math.sqrt(dx * dx + dy * dy);
                  } else if (e.touches.length === 1) {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDrawing(true);
                    drawTouch(e);
                  }
                }}
                onTouchEnd={(e) => {
                  if (isDrawing) {
                    e.preventDefault();
                    setIsDrawing(false);
                    saveState();
                    addRecentColor(selectedColor);
                  }
                  lastPinchDistance.current = null;
                }}
                onTouchCancel={() => {
                  setIsDrawing(false);
                  lastPinchDistance.current = null;
                }}
                onTouchMove={(e) => {
                  if (e.touches.length === 2 && lastPinchDistance.current !== null) {
                    // Pinch-to-zoom - don't prevent default to allow native behavior
                    const dx = e.touches[0].clientX - e.touches[1].clientX;
                    const dy = e.touches[0].clientY - e.touches[1].clientY;
                    const newDistance = Math.sqrt(dx * dx + dy * dy);
                    const delta = newDistance - lastPinchDistance.current;
                    if (Math.abs(delta) > 15) {
                      setZoomLevel(prev => Math.min(10, Math.max(2, prev + (delta > 0 ? 1 : -1))));
                      lastPinchDistance.current = newDistance;
                    }
                  } else if (e.touches.length === 1 && isDrawing) {
                    e.preventDefault();
                    e.stopPropagation();
                    drawTouch(e);
                  }
                }}
              />
              {/* Right-Click Context Menu */}
              {contextMenu && (
                <div
                  className="fixed bg-white rounded-lg shadow-2xl py-1 z-50 min-w-[140px] border"
                  style={{ left: contextMenu.x, top: contextMenu.y }}
                  onClick={() => setContextMenu(null)}
                >
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => { setTool('eyedropper'); setContextMenu(null); }}
                  >
                    🎨 Pick Color
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => { setTool('fill'); setContextMenu(null); }}
                  >
                    🪣 Fill Area
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => { setTool('eraser'); setContextMenu(null); }}
                  >
                    🧹 Eraser
                  </button>
                  <hr className="my-1" />
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => { undo(); setContextMenu(null); }}
                  >
                    ↩️ Undo
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => { redo(); setContextMenu(null); }}
                  >
                    ↪️ Redo
                  </button>
                  <hr className="my-1" />
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => { clearCanvas(); setContextMenu(null); }}
                  >
                    🗑️ Clear All
                  </button>
                </div>
              )}

              {/* Grid Overlay - with configurable color */}
              {showGrid && (
                <svg
                  className="absolute top-1 left-1 pointer-events-none"
                  width={SKIN_WIDTH * zoomLevel}
                  height={SKIN_HEIGHT * zoomLevel}
                  style={{ opacity: gridColor === 'light' ? 0.4 : 0.35 }}
                >
                  {/* Vertical lines */}
                  {Array.from({ length: SKIN_WIDTH + 1 }).map((_, i) => {
                    const majorLine = i % 8 === 0;
                    const gridColors = {
                      dark: { major: '#000', minor: '#555' },
                      light: { major: '#fff', minor: '#ccc' },
                      blue: { major: '#1d4ed8', minor: '#60a5fa' },
                      red: { major: '#dc2626', minor: '#f87171' },
                    };
                    return (
                      <line
                        key={`v-${i}`}
                        x1={i * zoomLevel}
                        y1={0}
                        x2={i * zoomLevel}
                        y2={SKIN_HEIGHT * zoomLevel}
                        stroke={majorLine ? gridColors[gridColor].major : gridColors[gridColor].minor}
                        strokeWidth={majorLine ? 1.5 : 0.5}
                      />
                    );
                  })}
                  {/* Horizontal lines */}
                  {Array.from({ length: SKIN_HEIGHT + 1 }).map((_, i) => {
                    const majorLine = i % 8 === 0;
                    const gridColors = {
                      dark: { major: '#000', minor: '#555' },
                      light: { major: '#fff', minor: '#ccc' },
                      blue: { major: '#1d4ed8', minor: '#60a5fa' },
                      red: { major: '#dc2626', minor: '#f87171' },
                    };
                    return (
                      <line
                        key={`h-${i}`}
                        x1={0}
                        y1={i * zoomLevel}
                        x2={SKIN_WIDTH * zoomLevel}
                        y2={i * zoomLevel}
                        stroke={majorLine ? gridColors[gridColor].major : gridColors[gridColor].minor}
                        strokeWidth={majorLine ? 1.5 : 0.5}
                      />
                    );
                  })}
                </svg>
              )}
              
              {/* 🎯 Body Part Overlay - Shows regions */}
              {showBodyPartOverlay && (
                <svg
                  className="absolute top-1 left-1 pointer-events-none"
                  width={SKIN_WIDTH * zoomLevel}
                  height={SKIN_HEIGHT * zoomLevel}
                >
                  {Object.entries(BODY_PARTS).map(([key, part]) => {
                    const colors: Record<string, string> = {
                      head: 'rgba(255, 200, 50, 0.3)',
                      body: 'rgba(50, 200, 50, 0.3)',
                      rightArm: 'rgba(50, 150, 255, 0.3)',
                      leftArm: 'rgba(100, 180, 255, 0.3)',
                      rightLeg: 'rgba(255, 100, 100, 0.3)',
                      leftLeg: 'rgba(255, 150, 150, 0.3)',
                    };
                    return (
                      <g key={key}>
                        <rect
                          x={part.x * zoomLevel}
                          y={part.y * zoomLevel}
                          width={part.w * zoomLevel}
                          height={part.h * zoomLevel}
                          fill={colors[key] || 'rgba(128, 128, 128, 0.2)'}
                          stroke={colors[key]?.replace('0.3', '0.8') || 'rgba(128, 128, 128, 0.6)'}
                          strokeWidth={2}
                        />
                        {zoomLevel >= 6 && (
                          <text
                            x={part.x * zoomLevel + (part.w * zoomLevel) / 2}
                            y={part.y * zoomLevel + (part.h * zoomLevel) / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#000"
                            fontSize={Math.min(12, zoomLevel * 1.5)}
                            fontWeight="bold"
                            style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}
                          >
                            {part.label.split(' ')[0]}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
          </div>
          </div>

          <p className="text-center mt-2 text-gray-500 text-sm">
            🎨 Draw here! See your character on the left! ✨
          </p>
        </div>

        {/* Right Panel - Colors */}
        <div className="glass-card skin-glass-card rounded-3xl p-6 shadow-2xl skin-animate-in-right delay-500 skin-scrollbar">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center skin-animate-in-scale delay-600">🎨 Colors</h2>

          {/* 🎨 Advanced Color Palette Presets */}
          <div className="mb-4 p-3 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-xl border border-violet-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-violet-700 flex items-center gap-1">
                <span className="text-base">🎨</span> Color Palettes
              </p>
              <span className="text-[10px] text-violet-400">16 themes</span>
            </div>
            
            {/* 🎮 Game Palettes */}
            <div className="mb-2">
              <p className="text-[10px] font-semibold mb-1 px-2 py-0.5 rounded-full inline-block text-white bg-gradient-to-r from-green-500 to-emerald-600">
                🎮 Game
              </p>
              <div className="grid grid-cols-2 gap-1">
                {COLOR_PALETTE_PRESETS.filter(p => p.category === 'game').map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedColor(preset.colors[0]);
                      setRecentColors(preset.colors);
                      playSound('click');
                    }}
                    className="group relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 hover:border-violet-300 transition-all hover:scale-[1.02] hover:shadow-md text-xs font-medium"
                    title={`Load ${preset.name} palette`}
                  >
                    <span className="text-sm">{preset.emoji}</span>
                    <span className="font-semibold text-gray-700 truncate flex-1 text-left">{preset.name}</span>
                    <div className="flex gap-0 rounded overflow-hidden shadow-sm">
                      {preset.colors.slice(0, 4).map((color, i) => (
                        <div key={i} className="w-3 h-4" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* ✨ Mood Palettes */}
            <div className="mb-2">
              <p className="text-[10px] font-semibold mb-1 px-2 py-0.5 rounded-full inline-block text-white bg-gradient-to-r from-purple-500 to-pink-500">
                ✨ Mood
              </p>
              <div className="grid grid-cols-2 gap-1">
                {COLOR_PALETTE_PRESETS.filter(p => p.category === 'mood').map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedColor(preset.colors[0]);
                      setRecentColors(preset.colors);
                      playSound('click');
                    }}
                    className="group relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 hover:border-violet-300 transition-all hover:scale-[1.02] hover:shadow-md text-xs font-medium"
                    title={`Load ${preset.name} palette`}
                  >
                    <span className="text-sm">{preset.emoji}</span>
                    <span className="font-semibold text-gray-700 truncate flex-1 text-left">{preset.name}</span>
                    <div className="flex gap-0 rounded overflow-hidden shadow-sm">
                      {preset.colors.slice(0, 4).map((color, i) => (
                        <div key={i} className="w-3 h-4" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* 🌿 Nature Palettes */}
            <div className="mb-2">
              <p className="text-[10px] font-semibold mb-1 px-2 py-0.5 rounded-full inline-block text-white bg-gradient-to-r from-teal-500 to-cyan-500">
                🌿 Nature
              </p>
              <div className="grid grid-cols-2 gap-1">
                {COLOR_PALETTE_PRESETS.filter(p => p.category === 'nature').map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedColor(preset.colors[0]);
                      setRecentColors(preset.colors);
                      playSound('click');
                    }}
                    className="group relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 hover:border-violet-300 transition-all hover:scale-[1.02] hover:shadow-md text-xs font-medium"
                    title={`Load ${preset.name} palette`}
                  >
                    <span className="text-sm">{preset.emoji}</span>
                    <span className="font-semibold text-gray-700 truncate flex-1 text-left">{preset.name}</span>
                    <div className="flex gap-0 rounded overflow-hidden shadow-sm">
                      {preset.colors.slice(0, 4).map((color, i) => (
                        <div key={i} className="w-3 h-4" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* 🌟 Special Palettes */}
            <div className="mb-2">
              <p className="text-[10px] font-semibold mb-1 px-2 py-0.5 rounded-full inline-block text-white bg-gradient-to-r from-amber-500 to-orange-500">
                🌟 Special
              </p>
              <div className="grid grid-cols-2 gap-1">
                {COLOR_PALETTE_PRESETS.filter(p => p.category === 'special').map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedColor(preset.colors[0]);
                      setRecentColors(preset.colors);
                      playSound('click');
                    }}
                    className="group relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 hover:border-violet-300 transition-all hover:scale-[1.02] hover:shadow-md text-xs font-medium"
                    title={`Load ${preset.name} palette`}
                  >
                    <span className="text-sm">{preset.emoji}</span>
                    <span className="font-semibold text-gray-700 truncate flex-1 text-left">{preset.name}</span>
                    <div className="flex gap-0 rounded overflow-hidden shadow-sm">
                      {preset.colors.slice(0, 4).map((color, i) => (
                        <div key={i} className="w-3 h-4" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quick tip */}
            <p className="text-[10px] text-violet-500 text-center mt-2 flex items-center justify-center gap-1">
              💡 Click a palette to load all its colors!
            </p>
          </div>

          {/* 🎭 Pattern Presets - One-click cool patterns! */}
          <div className="mb-4 p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <p className="text-xs font-bold text-purple-700 mb-2 flex items-center gap-1">
              <span className="text-base">🎭</span> Pattern Magic!
              <span className="text-purple-400 font-normal ml-1">(uses your colors)</span>
            </p>
            
            {/* Quick Pattern Buttons - First Row: Popular */}
            <div className="grid grid-cols-4 gap-1 mb-2">
              {PATTERN_PRESETS.slice(0, 4).map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => {
                    applyPattern(pattern.id);
                    playSound('click');
                  }}
                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-white hover:bg-purple-100 border border-purple-200 hover:border-purple-400 transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                  title={pattern.description}
                >
                  <span className="text-lg">{pattern.emoji}</span>
                  <span className="text-[10px] font-medium text-gray-600 truncate w-full text-center">{pattern.name}</span>
                </button>
              ))}
            </div>

            {/* Second Row: Gradients & Effects */}
            <div className="grid grid-cols-4 gap-1 mb-2">
              {PATTERN_PRESETS.slice(4, 8).map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => {
                    applyPattern(pattern.id);
                    playSound('click');
                  }}
                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-white hover:bg-blue-100 border border-blue-200 hover:border-blue-400 transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                  title={pattern.description}
                >
                  <span className="text-lg">{pattern.emoji}</span>
                  <span className="text-[10px] font-medium text-gray-600 truncate w-full text-center">{pattern.name}</span>
                </button>
              ))}
            </div>

            {/* Third Row: Special Patterns */}
            <div className="grid grid-cols-3 gap-1">
              {PATTERN_PRESETS.slice(8, 11).map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => {
                    applyPattern(pattern.id);
                    playSound('click');
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${
                    pattern.id === 'galaxy' 
                      ? 'bg-gradient-to-br from-purple-900 to-blue-900 text-white border-purple-500 hover:from-purple-800 hover:to-blue-800' 
                      : pattern.id === 'camo'
                      ? 'bg-gradient-to-br from-green-700 to-green-900 text-white border-green-600 hover:from-green-600 hover:to-green-800'
                      : pattern.id === 'rainbow'
                      ? 'bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 text-white border-pink-400'
                      : 'bg-white hover:bg-orange-100 border-orange-200 hover:border-orange-400'
                  }`}
                  title={pattern.description}
                >
                  <span className="text-lg">{pattern.emoji}</span>
                  <span className="text-[10px] font-medium truncate w-full text-center">{pattern.name}</span>
                </button>
              ))}
            </div>

            {/* Fourth Row: Fire, Ice, Noise */}
            <div className="grid grid-cols-3 gap-1 mt-1">
              {PATTERN_PRESETS.slice(11, 14).map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => {
                    applyPattern(pattern.id);
                    playSound('click');
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${
                    pattern.id === 'fire' 
                      ? 'bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 text-white border-orange-500' 
                      : pattern.id === 'ice'
                      ? 'bg-gradient-to-b from-cyan-200 via-blue-300 to-blue-500 text-blue-900 border-cyan-400'
                      : 'bg-gradient-to-br from-gray-600 to-gray-800 text-white border-gray-500'
                  }`}
                  title={pattern.description}
                >
                  <span className="text-lg">{pattern.emoji}</span>
                  <span className="text-[10px] font-medium truncate w-full text-center">{pattern.name}</span>
                </button>
              ))}
            </div>

            {/* Tip */}
            <p className="text-[10px] text-purple-500 mt-2 text-center">
              💡 Pick colors above, then click a pattern!
            </p>
          </div>

          {/* Recent Colors */}
          {recentColors.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Recent:</p>
              <div className="flex gap-1 flex-wrap">
                {recentColors.map((color, i) => (
                  <button
                    key={`${color}-${i}`}
                    onClick={() => setSelectedColor(color)}
                    className="w-6 h-6 rounded shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 max-w-[200px]">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-10 h-10 rounded-lg shadow transition-transform hover:scale-110 ${
                  selectedColor === color ? 'ring-4 ring-blue-400 scale-110' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Current Color */}
          <div className="mt-4 text-center">
            <p className="text-sm font-semibold text-gray-700">Selected:</p>
            <div
              className="w-16 h-16 mx-auto mt-2 rounded-xl shadow-lg border-4 border-white"
              style={{ backgroundColor: selectedColor }}
            />
          </div>

          {/* Custom Color */}
          <div className="mt-4">
            <div className="flex gap-1 items-center">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setSelectedColor(v);
                }}
                className="flex-1 px-2 py-1 text-xs font-mono rounded border border-gray-300 uppercase"
                maxLength={7}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">🎯 Your color!</p>
          </div>
          <div className="mt-2">
            <div className="flex gap-1 items-center">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setSecondaryColor(v);
                }}
                className="flex-1 px-2 py-1 text-xs font-mono rounded border border-gray-300 uppercase"
                maxLength={7}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">🌈 Mix color!</p>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md m-4 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">⌨️ Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">B</span><span>Brush</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">E</span><span>Eraser</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">F</span><span>Fill</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">G</span><span>Gradient</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">W</span><span>Glow</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">S</span><span>Stamp</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">I</span><span>Eyedropper</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">M</span><span>Mirror</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">D</span><span>Dark mode</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">1-3</span><span>Brush size</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">⌘Z</span><span>Undo</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">⌘Y</span><span>Redo</span>
            </div>
            <h4 className="text-lg font-bold mt-4 mb-2">🎨 Layer Shortcuts</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">L</span><span>Toggle layer panel</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">[</span><span>Previous layer</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">]</span><span>Next layer</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">C</span><span>Duplicate layer</span>
            </div>
            <button onClick={() => setShowHelp(false)} className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg font-bold">
              Got it! 👍
            </button>
          </div>
        </div>
      )}

      {/* 🎨 Layer Panel - Floating (hidden by default on mobile) */}
      {showLayerPanel && (
        <div className="fixed left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur rounded-2xl p-3 md:p-4 shadow-2xl z-40 w-[280px] md:w-64 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold">🎨 Layers</h3>
            <button
              onClick={() => setShowLayerPanel(false)}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >×</button>
          </div>

          {/* Layer List */}
          <div className="space-y-2 mb-3">
            {layers.slice().reverse().map((layer, idx) => (
              <div
                key={layer.id}
                className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
                  activeLayer === layer.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setActiveLayer(layer.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                      className={`text-lg ${layer.visible ? '' : 'opacity-30'}`}
                      title={layer.visible ? 'Hide layer' : 'Show layer'}
                    >
                      {layer.visible ? '👁️' : '🚫'}
                    </button>
                    <span className="text-lg">{layer.emoji}</span>
                    <span className="text-sm font-medium">{layer.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'up'); playSound('click'); }}
                      disabled={idx === 0}
                      className="text-sm px-2 py-1 disabled:opacity-30 hover:bg-blue-100 hover:scale-110 rounded transition-all"
                      title="Move layer up"
                    >⬆️</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'down'); playSound('click'); }}
                      disabled={idx === layers.length - 1}
                      className="text-sm px-2 py-1 disabled:opacity-30 hover:bg-blue-100 hover:scale-110 rounded transition-all"
                      title="Move layer down"
                    >⬇️</button>
                  </div>
                </div>

                {/* Opacity slider */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">Opacity:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={layer.opacity}
                    onChange={(e) => {
                      setLayerOpacity(layer.id, parseInt(e.target.value));
                      compositeLayersToMain();
                      updatePreview();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 h-1"
                  />
                  <span className="text-xs text-gray-500 w-8">{layer.opacity}%</span>
                </div>

                {/* Opacity quick presets */}
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-400">Quick:</span>
                  {[25, 50, 75, 100].map((preset) => (
                    <button
                      key={preset}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLayerOpacity(layer.id, preset);
                        compositeLayersToMain();
                        updatePreview();
                      }}
                      className={`px-2 py-0.5 text-xs rounded transition-all ${
                        layer.opacity === preset
                          ? 'bg-blue-500 text-white font-medium'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>

                {/* Color Tint */}
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs text-gray-500">🎨 Tint:</span>
                    <div className="flex gap-0.5 flex-wrap items-center">
                      {TINT_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLayerTint(layer.id, preset.color);
                            setTimeout(() => {
                              compositeLayersToMain();
                              updatePreview();
                            }, 0);
                          }}
                          className={`w-5 h-5 rounded text-xs flex items-center justify-center transition-all ${
                            layer.tint === preset.color
                              ? 'ring-2 ring-blue-500 ring-offset-1 scale-110'
                              : 'hover:scale-110'
                          }`}
                          style={{
                            backgroundColor: preset.color || 'transparent',
                            border: preset.color ? 'none' : '1px dashed #ccc'
                          }}
                          title={preset.name}
                        >
                          {!preset.color && '⭕'}
                        </button>
                      ))}
                      {/* Custom color picker */}
                      <div className="relative ml-1">
                        <input
                          type="color"
                          value={layer.tint || '#808080'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const color = e.target.value;
                            setLayerTint(layer.id, color);
                            // Add to custom tint colors if not already there
                            setCustomTintColors(prev => {
                              const filtered = prev.filter(c => c !== color);
                              return [color, ...filtered].slice(0, 6);
                            });
                            setTimeout(() => {
                              compositeLayersToMain();
                              updatePreview();
                            }, 0);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                          title="Custom color"
                          style={{ background: 'linear-gradient(135deg, #ff6b6b, #4d96ff, #6bcb77)' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recent custom tint colors */}
                  {customTintColors.length > 0 && (
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs text-gray-400">Recent:</span>
                      <div className="flex gap-0.5">
                        {customTintColors.map((color, idx) => (
                          <button
                            key={`custom-${idx}-${color}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setLayerTint(layer.id, color);
                              setTimeout(() => {
                                compositeLayersToMain();
                                updatePreview();
                              }, 0);
                            }}
                            className={`w-4 h-4 rounded text-xs transition-all ${
                              layer.tint === color
                                ? 'ring-2 ring-blue-500 ring-offset-1 scale-110'
                                : 'hover:scale-110'
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tint intensity slider (only show if tint is set) */}
                  {layer.tint && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Intensity:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={layer.tintIntensity}
                        onChange={(e) => {
                          setLayerTintIntensity(layer.id, parseInt(e.target.value));
                          compositeLayersToMain();
                          updatePreview();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 h-1"
                        style={{ accentColor: layer.tint }}
                      />
                      <span className="text-xs text-gray-500 w-8">{layer.tintIntensity}%</span>
                    </div>
                  )}

                  {/* ✨ Glow Toggle */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLayers(prev => prev.map(l =>
                          l.id === layer.id ? { ...l, glow: !l.glow } : l
                        ));
                        setTimeout(() => {
                          compositeLayersToMain();
                          updatePreview();
                        }, 0);
                      }}
                      className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                        layer.glow
                          ? 'bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-400/50'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      ✨ Glow {layer.glow ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Layer Actions */}
          <div className="flex flex-wrap gap-1 relative">
            <button
              onClick={() => clearLayer(activeLayer)}
              className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
              title="Clear current layer"
            >
              🗑️ Clear
            </button>
            <div className="relative">
              <button
                onClick={() => setShowDuplicateMenu(!showDuplicateMenu)}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                title="Duplicate to another layer"
              >
                📋 Duplicate
              </button>
              {/* Duplicate Layer Target Menu */}
              {showDuplicateMenu && (
                <div className="absolute bottom-full left-0 mb-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10 min-w-[140px]">
                  <p className="text-xs text-gray-500 mb-1">Copy to:</p>
                  {layers.filter(l => l.id !== activeLayer).map(layer => (
                    <button
                      key={layer.id}
                      onClick={() => {
                        copyLayerTo(activeLayer, layer.id);
                        setShowDuplicateMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-blue-50 text-left"
                    >
                      <span>{layer.emoji}</span>
                      <span>{layer.name}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setShowDuplicateMenu(false)}
                    className="w-full text-xs text-gray-400 mt-1 hover:text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={flattenLayers}
              className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
              title="Merge all layers"
            >
              🔗 Flatten
            </button>
          </div>

          {/* Active Layer Indicator */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Active: <span className="font-bold">{layers.find(l => l.id === activeLayer)?.name}</span>
            </p>
          </div>
        </div>
      )}

      {/* 📤 Export Panel - Mobile optimized with all export options */}
      {showExportPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50" onClick={() => setShowExportPanel(false)}>
          <div className="bg-white rounded-t-3xl md:rounded-2xl p-4 md:p-6 w-full md:max-w-md md:m-4 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()} style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">📤 Export Skin</h3>
              <button onClick={() => setShowExportPanel(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            
            {/* Skin preview */}
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-2 rounded-xl">
                <canvas
                  ref={(el) => {
                    if (el && canvasRef.current) {
                      const ctx = el.getContext('2d');
                      if (ctx) {
                        ctx.imageSmoothingEnabled = false;
                        ctx.clearRect(0, 0, 128, 128);
                        ctx.drawImage(canvasRef.current, 0, 0, 128, 128);
                      }
                    }
                  }}
                  width={128}
                  height={128}
                  className="rounded-lg"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">Choose which layers to include:</p>

            <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-xl">
              {layers.map(layer => (
                <label key={layer.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={exportLayers[layer.id]}
                    onChange={(e) => setExportLayers(prev => ({ ...prev, [layer.id]: e.target.checked }))}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-lg">{layer.emoji}</span>
                  <span className="font-medium">{layer.name}</span>
                  {!layer.visible && <span className="text-xs text-gray-400">(hidden)</span>}
                </label>
              ))}
            </div>

            {/* 📐 Resolution selector */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Export resolution:</p>
              <div className="grid grid-cols-4 gap-2">
                {EXPORT_RESOLUTIONS.map(({ size, label, desc }) => (
                  <button
                    key={size}
                    onClick={() => setExportResolution(size as 64 | 128 | 256 | 512)}
                    className={`py-2 px-1 rounded-lg text-center transition-all ${
                      exportResolution === size
                        ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="block text-sm font-bold">{label}</span>
                    <span className="block text-[10px] opacity-70">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main export buttons */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => downloadSkin(true)}
                  className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 active:scale-[0.98] transition-all"
                >
                  💾 Download Selected
                </button>
                <button
                  onClick={() => downloadSkin(false)}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 active:scale-[0.98] transition-all"
                >
                  📦 Download All
                </button>
              </div>
              
              {/* Save to My Skins */}
              <button
                onClick={saveToMySkins}
                className="w-full py-2.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                ⭐ Save to My Skins
              </button>

              {/* Copy to clipboard */}
              <button
                onClick={async () => {
                  const canvas = canvasRef.current;
                  if (!canvas) return;
                  try {
                    const blob = await new Promise<Blob>((resolve) =>
                      canvas.toBlob((b) => resolve(b!), 'image/png')
                    );
                    await navigator.clipboard.write([
                      new ClipboardItem({ 'image/png': blob })
                    ]);
                    playSound('success');
                    setShowExportPanel(false);
                    // Brief success message
                    alert('✅ Copied to clipboard!');
                  } catch {
                    // Fallback: copy data URL
                    const dataUrl = canvas.toDataURL('image/png');
                    await navigator.clipboard.writeText(dataUrl);
                    playSound('click');
                    alert('📋 Image URL copied!');
                  }
                }}
                className="w-full py-2.5 bg-violet-500 text-white rounded-xl font-bold hover:bg-violet-600 active:scale-[0.98] transition-all"
              >
                📋 Copy to Clipboard
              </button>

              <button
                onClick={downloadBaseOnly}
                className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 active:scale-[0.98] transition-all"
              >
                👤 Base Layer Only (no clothes)
              </button>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Export for specific games:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      downloadSkin(false);
                      logExport('Minecraft');
                    }}
                    className="py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1"
                  >
                    ⛏️ Minecraft
                  </button>
                  <button
                    onClick={() => {
                      downloadForRoblox();
                      logExport('Roblox');
                    }}
                    className="py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1"
                  >
                    🎮 Roblox
                  </button>
                </div>
              </div>
            </div>

            {/* Export history */}
            {exportHistory.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Recent exports: {exportHistory.length}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer - Improved touch interactions */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setShowMobileMenu(false)}>
          <div 
            className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl p-4 transform transition-transform overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">🎨 Menu</h3>
              <button 
                onClick={() => setShowMobileMenu(false)} 
                className="w-10 h-10 flex items-center justify-center text-2xl rounded-full hover:bg-gray-100 active:scale-95"
              >
                ✕
              </button>
            </div>
            
            <nav className="space-y-2">
              <button
                onClick={() => { setViewMode('editor'); setShowMobileMenu(false); }}
                className={`w-full text-left px-4 py-4 rounded-xl font-bold transition-all active:scale-[0.98] ${
                  viewMode === 'editor' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 active:bg-gray-200'
                }`}
              >
                🎨 Editor
              </button>
              <button
                onClick={() => { setViewMode('gallery'); setShowMobileMenu(false); }}
                className={`w-full text-left px-4 py-4 rounded-xl font-bold transition-all active:scale-[0.98] ${
                  viewMode === 'gallery' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 active:bg-gray-200'
                }`}
              >
                🖼️ Gallery
              </button>
              <a
                href="/games/skin-creator/gallery"
                onClick={() => setShowMobileMenu(false)}
                className="block w-full text-left px-4 py-4 rounded-xl font-bold hover:bg-gray-100 active:bg-gray-200 active:scale-[0.98] transition-all"
              >
                ✨ Templates
              </a>
              
              <hr className="my-4" />
              
              <button
                onClick={() => { setShowAIPanel(true); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-4 rounded-xl font-bold hover:bg-gray-100 active:bg-gray-200 active:scale-[0.98] transition-all"
              >
                🤖 AI Generator
              </button>
              <button
                onClick={() => { setShowLayerPanel(!showLayerPanel); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-4 rounded-xl font-bold hover:bg-gray-100 active:bg-gray-200 active:scale-[0.98] transition-all"
              >
                🎨 Layers
              </button>
              <button
                onClick={() => { setShowURLImport(true); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-4 rounded-xl font-bold hover:bg-gray-100 active:bg-gray-200 active:scale-[0.98] transition-all"
              >
                🌐 Import from URL
              </button>
              <button
                onClick={() => { setShowMySkins(!showMySkins); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-4 rounded-xl font-bold hover:bg-gray-100 active:bg-gray-200 active:scale-[0.98] transition-all"
              >
                📂 My Skins ({savedSkins.length})
              </button>
              
              <hr className="my-4" />
              
              <button
                onClick={() => { setDarkMode(!darkMode); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-4 rounded-xl font-bold hover:bg-gray-100 active:bg-gray-200 active:scale-[0.98] transition-all"
              >
                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              <button
                onClick={() => { setSoundMuted(!soundMuted); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-4 rounded-xl font-bold hover:bg-gray-100 active:bg-gray-200 active:scale-[0.98] transition-all"
              >
                {soundMuted ? '🔇 Unmute Sounds' : '🔊 Mute Sounds'}
              </button>
              <button
                onClick={() => { setShowTutorial(true); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-4 rounded-xl font-bold hover:bg-gray-100 active:bg-gray-200 active:scale-[0.98] transition-all"
              >
                📚 Tutorial
              </button>
              <button
                onClick={() => { setShowShortcuts(true); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-4 rounded-xl font-bold hover:bg-gray-100 active:bg-gray-200 active:scale-[0.98] transition-all"
              >
                ⌨️ Keyboard Shortcuts
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Welcome Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl transform animate-bounce-in">
            {tutorialStep === 0 && (
              <>
                <div className="text-center mb-6">
                  <span className="text-6xl animate-bounce-soft">🎨</span>
                  <h2 className="text-3xl font-black mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                    Welcome to Skin Studio!
                  </h2>
                  <p className="text-gray-600 mt-2">Create awesome Minecraft & Roblox skins in minutes!</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                    <span className="text-2xl">🖌️</span>
                    <div>
                      <p className="font-bold">Draw on the Canvas</p>
                      <p className="text-sm text-gray-500">Use tools to paint your character</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <span className="text-2xl">👀</span>
                    <div>
                      <p className="font-bold">Live 3D Preview</p>
                      <p className="text-sm text-gray-500">See your skin come to life!</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <span className="text-2xl">🎨</span>
                    <div>
                      <p className="font-bold">Layers System</p>
                      <p className="text-sm text-gray-500">Base, Clothing, and Accessories</p>
                    </div>
                  </div>
                </div>
              </>
            )}
            {tutorialStep === 1 && (
              <>
                <div className="text-center mb-6">
                  <span className="text-6xl">✨</span>
                  <h2 className="text-2xl font-black mt-4">Pro Tips!</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
                    <span className="text-2xl">⌨️</span>
                    <div>
                      <p className="font-bold">Keyboard Shortcuts</p>
                      <p className="text-sm text-gray-500">B=Brush, E=Eraser, F=Fill, ?=Help</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                    <span className="text-2xl">📱</span>
                    <div>
                      <p className="font-bold">Touch Gestures</p>
                      <p className="text-sm text-gray-500">Pinch to zoom • Tap to draw • Long-press for color</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <p className="font-bold">AI Generation</p>
                      <p className="text-sm text-gray-500">Let AI create skins for you!</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-xl">
                    <span className="text-2xl">🖼️</span>
                    <div>
                      <p className="font-bold">Community Gallery</p>
                      <p className="text-sm text-gray-500">Browse and share skins!</p>
                    </div>
                  </div>
                  <a
                    href="https://youtube.com/@OndeUniverse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <span className="text-2xl">📺</span>
                    <div>
                      <p className="font-bold">Video Tutorials</p>
                      <p className="text-sm text-gray-500">Watch step-by-step guides!</p>
                    </div>
                  </a>
                </div>
              </>
            )}
            <div className="flex gap-3 mt-6">
              {tutorialStep > 0 && (
                <button
                  onClick={() => setTutorialStep(tutorialStep - 1)}
                  className="flex-1 py-3 rounded-xl font-bold bg-gray-200 hover:bg-gray-300 transition-all"
                >
                  ← Back
                </button>
              )}
              {tutorialStep < 1 ? (
                <button
                  onClick={() => setTutorialStep(1)}
                  className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowTutorial(false);
                    localStorage.setItem('skin-creator-tutorial-seen', 'true');
                  }}
                  className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-green-500 to-teal-500 text-white hover:shadow-lg transition-all"
                >
                  🚀 Start Creating!
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setShowTutorial(false);
                localStorage.setItem('skin-creator-tutorial-seen', 'true');
              }}
              className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600"
            >
              Skip tutorial
            </button>
          </div>
        </div>
      )}

      {/* First-Time Welcome Hints Modal */}
      {showWelcomeHints && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl transform animate-bounce-in">
            <div className="text-center mb-6">
              <span className="text-6xl animate-bounce-soft">👋</span>
              <h2 className="text-2xl font-black mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                Welcome to Skin Studio!
              </h2>
              <p className="text-gray-600 mt-2">Here are some quick tips to get you started:</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <span className="text-3xl">🎨</span>
                <p className="font-medium">Click colors to paint!</p>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <span className="text-3xl">🔄</span>
                <p className="font-medium">Use Mirror Mode for symmetry!</p>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
                <span className="text-3xl">⬇️</span>
                <p className="font-medium">Download your skin when done!</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowWelcomeHints(false);
                localStorage.setItem('skin-studio-visited', 'true');
                playSound('click');
              }}
              className="w-full mt-6 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Got it! 🚀
            </button>
          </div>
        </div>
      )}

      {/* URL Import Modal - Mobile optimized */}
      {showURLImport && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50" onClick={() => setShowURLImport(false)}>
          <div className="bg-white rounded-t-3xl md:rounded-2xl p-4 md:p-6 w-full md:max-w-md md:m-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">🌐 Import from URL</h3>
              <button
                onClick={() => setShowURLImport(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Enter a Minecraft username, NameMC profile URL, or direct PNG URL:
            </p>
            
            <input
              type="text"
              value={importURL}
              onChange={(e) => setImportURL(e.target.value)}
              placeholder="e.g., Notch or https://..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none mb-3"
              onKeyDown={(e) => e.key === 'Enter' && importFromURL()}
            />
            
            {importError && (
              <p className="text-red-500 text-sm mb-3">❌ {importError}</p>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={importFromURL}
                disabled={!importURL.trim() || importLoading}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                  importURL.trim() && !importLoading
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {importLoading ? '⏳ Loading...' : '📥 Import Skin'}
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-gray-100 rounded-xl">
              <p className="text-xs text-gray-500 font-bold mb-1">💡 Tips:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Enter username: <code className="bg-gray-200 px-1 rounded">Notch</code></li>
                <li>• NameMC URL: <code className="bg-gray-200 px-1 rounded">namemc.com/profile/...</code></li>
                <li>• Direct PNG URL works too!</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* AI Panel - Mobile optimized */}
      {showAIPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50" onClick={() => setShowAIPanel(false)}>
          <div className="bg-white rounded-t-3xl md:rounded-2xl p-4 md:p-6 w-full md:max-w-md md:m-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} style={{ WebkitOverflowScrolling: 'touch' }}>
            <h3 className="text-xl font-bold mb-2">🤖 AI Skin Generator</h3>
            <p className="text-sm text-gray-600 mb-4">Describe your character and AI will create a skin!</p>

            {/* Prompt Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., pirate with red bandana, wizard with purple robe..."
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && generateAISkin()}
              />
              <button
                onClick={enhancePrompt}
                disabled={enhancing || !aiPrompt.trim()}
                className="px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                title="Enhance with AI (local LLM)"
              >
                {enhancing ? '⏳' : '✨'}
              </button>
            </div>

            {/* 📚 Kid-Friendly Prompt Library */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">🎭 Pick an Idea!</label>
              <div className="space-y-2">
                {/* Category tabs */}
                {[
                  {
                    id: 'heroes',
                    emoji: '🦸',
                    name: 'Heroes',
                    color: 'bg-red-100 text-red-700 hover:bg-red-200',
                    prompts: [
                      { emoji: '🦸', text: 'superhero with cape', label: 'Superhero' },
                      { emoji: '⚔️', text: 'brave knight in shining armor', label: 'Knight' },
                      { emoji: '🥷', text: 'cool ninja with black outfit', label: 'Ninja' },
                      { emoji: '🏴‍☠️', text: 'adventure pirate with bandana', label: 'Pirate' },
                      { emoji: '🧙', text: 'powerful wizard with magic staff', label: 'Wizard' },
                    ]
                  },
                  {
                    id: 'animals',
                    emoji: '🐾',
                    name: 'Animals',
                    color: 'bg-green-100 text-green-700 hover:bg-green-200',
                    prompts: [
                      { emoji: '🐺', text: 'wolf warrior with fur', label: 'Wolf' },
                      { emoji: '🐱', text: 'cute cat person with whiskers', label: 'Cat' },
                      { emoji: '🦊', text: 'clever fox with orange fur', label: 'Fox' },
                      { emoji: '🐼', text: 'friendly panda bear', label: 'Panda' },
                      { emoji: '🦁', text: 'brave lion with mane', label: 'Lion' },
                    ]
                  },
                  {
                    id: 'fantasy',
                    emoji: '✨',
                    name: 'Fantasy',
                    color: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
                    prompts: [
                      { emoji: '🧚', text: 'magical fairy with wings', label: 'Fairy' },
                      { emoji: '🐉', text: 'dragon person with scales', label: 'Dragon' },
                      { emoji: '🧜', text: 'mermaid with shiny tail', label: 'Mermaid' },
                      { emoji: '🦄', text: 'unicorn with rainbow mane', label: 'Unicorn' },
                      { emoji: '🧝', text: 'elf with pointy ears', label: 'Elf' },
                    ]
                  },
                  {
                    id: 'space',
                    emoji: '🚀',
                    name: 'Space',
                    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
                    prompts: [
                      { emoji: '🤖', text: 'friendly robot with glowing eyes', label: 'Robot' },
                      { emoji: '👽', text: 'cool alien from outer space', label: 'Alien' },
                      { emoji: '👨‍🚀', text: 'astronaut in space suit', label: 'Astronaut' },
                      { emoji: '🌟', text: 'star guardian with cosmic powers', label: 'Star' },
                      { emoji: '🛸', text: 'space explorer with laser gun', label: 'Explorer' },
                    ]
                  },
                  {
                    id: 'jobs',
                    emoji: '👷',
                    name: 'Jobs',
                    color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
                    prompts: [
                      { emoji: '👨‍🍳', text: 'chef with white hat and apron', label: 'Chef' },
                      { emoji: '👨‍🚒', text: 'firefighter with helmet', label: 'Firefighter' },
                      { emoji: '👮', text: 'police officer in uniform', label: 'Police' },
                      { emoji: '👨‍⚕️', text: 'doctor with stethoscope', label: 'Doctor' },
                      { emoji: '🧑‍🔬', text: 'scientist with lab coat', label: 'Scientist' },
                    ]
                  },
                  {
                    id: 'spooky',
                    emoji: '👻',
                    name: 'Spooky',
                    color: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    prompts: [
                      { emoji: '🧟', text: 'zombie with torn clothes', label: 'Zombie' },
                      { emoji: '🧛', text: 'vampire with cape and fangs', label: 'Vampire' },
                      { emoji: '👻', text: 'friendly ghost with spooky glow', label: 'Ghost' },
                      { emoji: '🎃', text: 'pumpkin head monster', label: 'Pumpkin' },
                      { emoji: '💀', text: 'skeleton warrior', label: 'Skeleton' },
                    ]
                  },
                ].map(category => (
                  <details key={category.id} className="group">
                    <summary className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${category.color} font-medium`}>
                      <span className="text-lg">{category.emoji}</span>
                      <span>{category.name}</span>
                      <span className="ml-auto text-xs opacity-60">{category.prompts.length}</span>
                    </summary>
                    <div className="flex flex-wrap gap-1 mt-2 pl-2">
                      {category.prompts.map(prompt => (
                        <button
                          key={prompt.label}
                          onClick={() => setAiPrompt(prompt.text)}
                          className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1 ${
                            aiPrompt === prompt.text
                              ? 'bg-purple-500 text-white scale-105'
                              : 'bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <span>{prompt.emoji}</span>
                          <span>{prompt.label}</span>
                        </button>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Style Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">🎨 Art Style</label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'blocky', emoji: '🧱', name: 'Blocky' },
                  { id: 'pixel-art', emoji: '👾', name: 'Pixel' },
                  { id: 'cartoon', emoji: '🎨', name: 'Cartoon' },
                  { id: 'anime', emoji: '✨', name: 'Anime' },
                  { id: 'realistic', emoji: '📷', name: 'Real' },
                ].map(style => (
                  <button
                    key={style.id}
                    onClick={() => setAiStyle(style.id as typeof aiStyle)}
                    className={`p-2 rounded-lg text-center transition-all ${
                      aiStyle === style.id
                        ? 'bg-purple-500 text-white ring-2 ring-purple-300'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    title={style.name}
                  >
                    <div className="text-xl">{style.emoji}</div>
                    <div className="text-xs mt-1">{style.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Real AI Toggle */}
            <div className="mb-4 p-3 bg-gray-50 rounded-xl">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium text-gray-700">🧠 Use Real AI (DALL-E 3)</span>
                  <p className="text-xs text-gray-500 mt-1">
                    {isAIAvailable()
                      ? 'API key configured ✓'
                      : 'Requires NEXT_PUBLIC_OPENAI_API_KEY'}
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={useRealAI}
                    onChange={(e) => setUseRealAI(e.target.checked)}
                    disabled={!isAIAvailable()}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    useRealAI && isAIAvailable() ? 'bg-purple-500' : 'bg-gray-300'
                  } ${!isAIAvailable() ? 'opacity-50' : ''}`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      useRealAI ? 'translate-x-5' : ''
                    }`} />
                  </div>
                </div>
              </label>
            </div>

            {/* Error Display */}
            {aiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <strong>⚠️ Error:</strong> {aiError}
                <button
                  onClick={() => setAiError(null)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateAISkin}
              disabled={aiLoading || !aiPrompt.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {aiLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🔄</span>
                  {useRealAI ? 'AI is thinking...' : 'Generating...'}
                </span>
              ) : (
                '✨ Generate Skin'
              )}
            </button>

            {/* 📚 AI History & Favorites */}
            {aiHistory.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAIHistory(!showAIHistory)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-medium text-gray-700">
                    📚 History & Favorites ({aiHistory.length})
                  </span>
                  <span className="text-gray-400">{showAIHistory ? '▲' : '▼'}</span>
                </button>

                {showAIHistory && (
                  <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                    {/* Favorites first */}
                    {aiHistory.filter(item => item.isFavorite).length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-yellow-600 font-semibold mb-1">⭐ Favorites</p>
                        {aiHistory.filter(item => item.isFavorite).map(item => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200"
                          >
                            <img
                              src={item.skinDataUrl}
                              alt={item.prompt}
                              className="w-12 h-12 rounded border bg-gray-100"
                              style={{ imageRendering: 'pixelated' }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.prompt}</p>
                              <p className="text-xs text-gray-500">{item.style}</p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => loadFromHistory(item)}
                                className="p-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200"
                                title="Load this skin"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => regenerateFromHistory(item)}
                                className="p-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
                                title="Use this prompt"
                              >
                                🔄
                              </button>
                              <button
                                onClick={() => toggleFavorite(item.id)}
                                className="p-1 text-xs bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
                                title="Remove from favorites"
                              >
                                ⭐
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Recent history */}
                    <p className="text-xs text-gray-500 font-semibold mb-1">🕐 Recent</p>
                    {aiHistory.filter(item => !item.isFavorite).map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <img
                          src={item.skinDataUrl}
                          alt={item.prompt}
                          className="w-12 h-12 rounded border bg-white"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.prompt}</p>
                          <p className="text-xs text-gray-400">
                            {item.style} • {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => loadFromHistory(item)}
                            className="p-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200"
                            title="Load this skin"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => regenerateFromHistory(item)}
                            className="p-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
                            title="Use this prompt"
                          >
                            🔄
                          </button>
                          <button
                            onClick={() => toggleFavorite(item.id)}
                            className="p-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                            title="Add to favorites"
                          >
                            ☆
                          </button>
                          <button
                            onClick={() => deleteFromHistory(item.id)}
                            className="p-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Info text */}
            <p className="text-xs text-gray-400 mt-3 text-center">
              {useRealAI
                ? 'Real AI generates unique skins from your description'
                : 'Quick mode uses smart color matching based on keywords'}
            </p>
          </div>
        </div>
      )}

      {/* Floating Action Buttons - Mobile-friendly with proper spacing */}
      <div className="fixed bottom-20 md:bottom-4 left-4 flex flex-col md:flex-row gap-2 z-30">
        {/* AI Button */}
        <button
          onClick={() => setShowAIPanel(true)}
          className="w-12 h-12 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg text-xl hover:scale-110 active:scale-95 transition-transform flex items-center justify-center"
          title="AI Skin Generator"
        >
          🤖
        </button>
        
        {/* Layer Panel Toggle Button */}
        <button
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className={`w-12 h-12 md:w-10 md:h-10 rounded-full shadow-lg text-xl hover:scale-110 active:scale-95 transition-transform flex items-center justify-center ${
            showLayerPanel ? 'bg-blue-500 text-white' : 'bg-white/90'
          }`}
          title="Toggle Layers (L)"
        >
          🎨
        </button>
      </div>

      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-20 md:bottom-4 right-4 w-12 h-12 md:w-10 md:h-10 bg-white/90 rounded-full shadow-lg text-xl font-bold hover:scale-110 active:scale-95 transition-transform flex items-center justify-center z-30"
        title="Keyboard shortcuts (?)"
      >
        ?
      </button>

      {/* Footer */}
      <p className="mt-4 text-white/70 text-sm">
        Made with 💖 by Onde • Works with Minecraft Java & Bedrock!
      </p>

      {/* 🎨 Bouncing Mascots - Hidden on mobile to avoid interference */}
      <div className="hidden md:flex fixed bottom-0 left-0 right-0 h-16 justify-around items-end pointer-events-none overflow-hidden">
        <span className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🎨</span>
        <span className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🖌️</span>
        <span className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>⛏️</span>
        <span className="text-4xl animate-bounce" style={{ animationDelay: '0.6s' }}>💎</span>
        <span className="text-4xl animate-bounce" style={{ animationDelay: '0.8s' }}>🧱</span>
      </div>
    </div>
  );
}

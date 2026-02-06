// Shared types for skin-creator components

export type LayerType = 'base' | 'clothing' | 'accessories';

export interface Layer {
  id: LayerType;
  name: string;
  emoji: string;
  visible: boolean;
  opacity: number;
  tint: string | null;
  tintIntensity: number;
  glow: boolean;
}

export type GameType = 'minecraft' | 'roblox';

export interface GameConfig {
  name: string;
  emoji: string;
  width: number;
  height: number;
  exportFormat: string;
}

export type ViewMode = 'editor' | 'gallery';

export type ToolType = 'brush' | 'eraser' | 'fill' | 'gradient' | 'glow' | 'stamp' | 'eyedropper';
export type StampShape = 'star' | 'heart' | 'diamond' | 'smiley' | 'fire' | 'lightning';
export type AIStyle = 'cartoon' | 'realistic' | 'pixel-art' | 'anime' | 'blocky';

export interface AIHistoryItem {
  id: string;
  prompt: string;
  style: AIStyle;
  skinDataUrl: string;
  timestamp: number;
  isFavorite: boolean;
}

export interface SavedSkin {
  id: string;
  name: string;
  dataUrl: string;
  timestamp: number;
  tags?: string[];
}

export interface TintPreset {
  color: string | null;
  name: string;
  emoji: string;
}

export interface Pose {
  id: string;
  name: string;
  desc: string;
  icon?: string;
  label?: string;
}

export interface Achievement {
  name: string;
  emoji: string;
}

// Sound types used across components
export type SoundType = 'draw' | 'click' | 'download' | 'undo' | 'redo' | 'error' | 'success' | 'save' | 'achievement';

// Shared types and constants for the Skin Creator

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
}

export interface Achievement {
  name: string;
  emoji: string;
}

export const DEFAULT_LAYERS: Layer[] = [
  { id: 'base', name: 'Base (Skin)', emoji: '👤', visible: true, opacity: 100, tint: null, tintIntensity: 50, glow: false },
  { id: 'clothing', name: 'Clothing', emoji: '👕', visible: true, opacity: 100, tint: null, tintIntensity: 50, glow: false },
  { id: 'accessories', name: 'Accessories', emoji: '🎩', visible: true, opacity: 100, tint: null, tintIntensity: 50, glow: false },
];

export const TINT_PRESETS = [
  { color: null as string | null, name: 'None', emoji: '⭕' },
  { color: '#FF6B6B', name: 'Red', emoji: '🔴' },
  { color: '#FFD93D', name: 'Gold', emoji: '🟡' },
  { color: '#4D96FF', name: 'Blue', emoji: '🔵' },
  { color: '#6BCB77', name: 'Green', emoji: '🟢' },
  { color: '#9B59B6', name: 'Purple', emoji: '🟣' },
  { color: '#FF8E53', name: 'Orange', emoji: '🟠' },
  { color: '#00BCD4', name: 'Cyan', emoji: '🩵' },
  { color: '#E91E63', name: 'Pink', emoji: '💗' },
];

export const GAME_CONFIGS: Record<GameType, GameConfig> = {
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

export const BODY_PARTS = {
  head: { x: 0, y: 0, w: 32, h: 16, label: '🗣️ Head' },
  body: { x: 16, y: 16, w: 24, h: 16, label: '👕 Body' },
  rightArm: { x: 40, y: 16, w: 16, h: 16, label: '💪 Right Arm' },
  leftArm: { x: 32, y: 48, w: 16, h: 16, label: '🤛 Left Arm' },
  rightLeg: { x: 0, y: 16, w: 16, h: 16, label: '🦵 Right Leg' },
  leftLeg: { x: 16, y: 48, w: 16, h: 16, label: '🦿 Left Leg' },
};

export const TEMPLATES = {
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
};

export const COLORS = [
  '#FF0000', '#FF8800', '#FFFF00', '#00FF00', '#00FFFF', '#0088FF',
  '#0000FF', '#8800FF', '#FF00FF', '#FF69B4', '#FFFFFF', '#000000',
  '#ffdfc4', '#f0c8a8', '#d4a76a', '#c4a57b', '#8d6e4c', '#5c4033',
  '#FF6B6B', '#FF8E53', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6',
  '#E91E63', '#00BCD4', '#8BC34A', '#FF5722', '#795548', '#607D8B',
  '#CCCCCC', '#888888', '#444444', '#222222',
];

export const ACHIEVEMENTS: Record<string, Achievement> = {
  firstDraw: { name: 'First Stroke!', emoji: '🎨' },
  colorMaster: { name: 'Color Master', emoji: '🌈' },
  saved: { name: 'Saved!', emoji: '💾' },
  shared: { name: 'Shared!', emoji: '🔗' },
  downloaded: { name: 'Downloaded!', emoji: '📥' },
  undoKing: { name: 'Undo King', emoji: '↩️' },
  layerPro: { name: 'Layer Pro', emoji: '📚' },
  patternUser: { name: 'Pattern User', emoji: '🎭' },
};

export const SKIN_WIDTH = 64;
export const SKIN_HEIGHT = 64;

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { generateAndConvertSkin, isAIAvailable } from '../../lib/aiSkinGenerator';
import { enhancePromptWithLLM, checkLocalLLM } from '../../lib/localLLM';
import type { Layer, LayerType, GameType, GameConfig, ViewMode, AIHistoryItem, SavedSkin, ToolType, StampShape, AIStyle, SoundType } from './types';

// Constants
export const SKIN_WIDTH = 64;
export const SKIN_HEIGHT = 64;
export const DISPLAY_SCALE = 6;

export const DEFAULT_LAYERS: Layer[] = [
  { id: 'base', name: 'Base (Skin)', emoji: '👤', visible: true, opacity: 100, tint: null, tintIntensity: 50, glow: false },
  { id: 'clothing', name: 'Clothing', emoji: '👕', visible: true, opacity: 100, tint: null, tintIntensity: 50, glow: false },
  { id: 'accessories', name: 'Accessories', emoji: '🎩', visible: true, opacity: 100, tint: null, tintIntensity: 50, glow: false },
];

export const TINT_PRESETS = [
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

export const GAME_CONFIGS: Record<GameType, GameConfig> = {
  minecraft: { name: 'Minecraft', emoji: '⛏️', width: 64, height: 64, exportFormat: 'PNG 64x64' },
  roblox: { name: 'Roblox', emoji: '🎮', width: 128, height: 128, exportFormat: 'PNG 128x128' },
};

export const BODY_PARTS = {
  head: { x: 0, y: 0, w: 32, h: 16, label: '🗣️ Head' },
  body: { x: 16, y: 16, w: 24, h: 16, label: '👕 Body' },
  rightArm: { x: 40, y: 16, w: 16, h: 16, label: '💪 Right Arm' },
  leftArm: { x: 32, y: 48, w: 16, h: 16, label: '🤛 Left Arm' },
  rightLeg: { x: 0, y: 16, w: 16, h: 16, label: '🦵 Right Leg' },
  leftLeg: { x: 16, y: 48, w: 16, h: 16, label: '🦿 Left Leg' },
};

export const TEMPLATES: Record<string, { name: string; skin: string; hair: string; shirt: string; pants: string; shoes: string; eyes: string; pupils: string }> = {
  steve: { name: '👦 Steve', skin: '#c4a57b', hair: '#442920', shirt: '#00a8a8', pants: '#3c2a5e', shoes: '#444444', eyes: '#ffffff', pupils: '#5a3825' },
  robot: { name: '🤖 Robot', skin: '#8a8a8a', hair: '#444444', shirt: '#3498db', pants: '#2c3e50', shoes: '#1a1a1a', eyes: '#00ff00', pupils: '#00aa00' },
  ninja: { name: '🥷 Ninja', skin: '#c4a57b', hair: '#1a1a1a', shirt: '#1a1a1a', pants: '#1a1a1a', shoes: '#2c2c2c', eyes: '#ffffff', pupils: '#000000' },
  alien: { name: '👽 Alien', skin: '#7dcea0', hair: '#27ae60', shirt: '#9b59b6', pants: '#8e44ad', shoes: '#6c3483', eyes: '#000000', pupils: '#1a1a1a' },
  princess: { name: '👸 Princess', skin: '#ffdfc4', hair: '#f1c40f', shirt: '#e91e63', pants: '#9c27b0', shoes: '#ff69b4', eyes: '#87ceeb', pupils: '#4169e1' },
  zombie: { name: '🧟 Zombie', skin: '#5a8f5a', hair: '#2d4a2d', shirt: '#00a8a8', pants: '#3c2a5e', shoes: '#444444', eyes: '#1a1a1a', pupils: '#000000' },
  creeper: { name: '💚 Creeper', skin: '#5ba555', hair: '#3d7a3d', shirt: '#4a934a', pants: '#3d7a3d', shoes: '#2d5a2d', eyes: '#000000', pupils: '#000000' },
};

export const COLORS = [
  '#FF0000', '#FF8800', '#FFFF00', '#00FF00', '#00FFFF', '#0088FF',
  '#0000FF', '#8800FF', '#FF00FF', '#FF69B4', '#FFFFFF', '#000000',
  '#ffdfc4', '#f0c8a8', '#d4a76a', '#c4a57b', '#8d6e4c', '#5c4033',
  '#FF6B6B', '#FF8E53', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6',
  '#E91E63', '#00BCD4', '#8BC34A', '#FF5722', '#795548', '#607D8B',
  '#CCCCCC', '#888888', '#444444', '#222222',
];

export const SKIN_TAGS = ['⚔️ Warrior', '🧙 Mage', '🐱 Cute', '👻 Spooky', '🤖 Robot', '🎮 Gaming', '🌟 Fantasy', '😎 Cool'];

export const DAILY_CHALLENGES = [
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

export const POSES = [
  { id: 'standing', name: '🧍 Standing', desc: 'Default pose' },
  { id: 'walking', name: '🚶 Walking', desc: 'Mid-stride' },
  { id: 'combat', name: '⚔️ Combat', desc: 'Battle ready!' },
  { id: 'sitting', name: '🪑 Sitting', desc: 'Relaxed' },
  { id: 'wave', name: '👋 Waving', desc: 'Friendly wave' },
  { id: 'orange-justice', name: '🍊 Orange Justice', desc: 'Fortnite classic!' },
  { id: 'default-dance', name: '💃 Default Dance', desc: 'The OG!' },
  { id: 'floss', name: '🦷 Floss', desc: 'Side to side!' },
];

export const ACHIEVEMENTS_DEF = {
  firstDraw: { name: 'First Stroke!', emoji: '🎨' },
  colorMaster: { name: 'Color Master', emoji: '🌈' },
  saved: { name: 'Saved!', emoji: '💾' },
  shared: { name: 'Shared!', emoji: '🔗' },
  downloaded: { name: 'Downloaded!', emoji: '📥' },
  undoKing: { name: 'Undo King', emoji: '↩️' },
  layerPro: { name: 'Layer Pro', emoji: '📚' },
  patternUser: { name: 'Pattern User', emoji: '🎭' },
  nightOwl: { name: '🤫 Night Owl', emoji: '🦉' },
  speedDemon: { name: '🤫 Speed Demon', emoji: '⚡' },
  perfectionist: { name: '🤫 Perfectionist', emoji: '✨' },
  explorer: { name: '🤫 Explorer', emoji: '🧭' },
  zenMaster: { name: '🤫 Zen Master', emoji: '🧘' },
};

export function useSkinCreator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [selectedGame, setSelectedGame] = useState<GameType>('minecraft');
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<ToolType>('brush');
  const [stampShape, setStampShape] = useState<StampShape>('star');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [show3D, setShow3D] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoomLevel, setZoomLevel] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 4 : 6);
  const [showGrid, setShowGrid] = useState(true);
  const [secondaryColor, setSecondaryColor] = useState('#4D96FF');
  const [brushSize, setBrushSize] = useState(1);
  const [skinName, setSkinName] = useState('my-skin');
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [customTintColors, setCustomTintColors] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showURLImport, setShowURLImport] = useState(false);
  const [importURL, setImportURL] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileColorPicker, setShowMobileColorPicker] = useState(false);
  const [showMobile3DPreview, setShowMobile3DPreview] = useState(false);
  const [skinModel, setSkinModel] = useState<'steve' | 'alex'>('steve');
  const [skinVersion, setSkinVersion] = useState(0);
  const lastPinchDistance = useRef<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [localLLMAvailable, setLocalLLMAvailable] = useState(false);
  const [aiStyle, setAiStyle] = useState<AIStyle>('blocky');
  const [aiError, setAiError] = useState<string | null>(null);
  const [useRealAI, setUseRealAI] = useState(false);
  const [aiHistory, setAiHistory] = useState<AIHistoryItem[]>([]);
  const [showAIHistory, setShowAIHistory] = useState(false);
  const [layers, setLayers] = useState<Layer[]>(DEFAULT_LAYERS);
  const [activeLayer, setActiveLayer] = useState<LayerType>('base');
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const layerCanvasRefs = useRef<{ [key in LayerType]?: HTMLCanvasElement }>({});
  const [savedSkins, setSavedSkins] = useState<SavedSkin[]>([]);
  const [showMySkins, setShowMySkins] = useState(false);
  const [showDuplicateMenu, setShowDuplicateMenu] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);
  const particleIdRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [soundMuted, setSoundMuted] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const maxHistory = 50;
  const [achievements, setAchievements] = useState<Record<string, boolean>>({});
  const [showAchievement, setShowAchievement] = useState<{ id: string; name: string; emoji: string } | null>(null);
  const [showAchievementGallery, setShowAchievementGallery] = useState(false);
  const [helpTipDismissed, setHelpTipDismissed] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    return JSON.parse(localStorage.getItem('skin-tips-dismissed') || '{}');
  });
  const [selectedPose, setSelectedPose] = useState('standing');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportLayers, setExportLayers] = useState<{ [key in LayerType]: boolean }>({
    base: true, clothing: true, accessories: true,
  });
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Pattern generator states (kept for completeness)
  const [showZigzagPanel, setShowZigzagPanel] = useState(false);
  const [showCircuitPanel, setShowCircuitPanel] = useState(false);
  const [showStarPanel, setShowStarPanel] = useState(false);
  const [showHoneycombPanel, setShowHoneycombPanel] = useState(false);

  const todayChallenge = DAILY_CHALLENGES[new Date().getDate() % DAILY_CHALLENGES.length];

  const dismissTip = (tip: string) => {
    const updated = { ...helpTipDismissed, [tip]: true };
    setHelpTipDismissed(updated);
    localStorage.setItem('skin-tips-dismissed', JSON.stringify(updated));
  };

  // Sound effects
  const playSound = useCallback((type: SoundType) => {
    if (soundMuted) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'draw') {
      oscillator.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } else if (type === 'click') {
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } else if (type === 'download') {
      const notes = [523, 659, 784, 1047];
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
      oscillator.frequency.setValueAtTime(300, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.12);
    } else if (type === 'redo') {
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.12);
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.12);
    } else if (type === 'error') {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } else if (type === 'success') {
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } else if (type === 'achievement') {
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
    } else if (type === 'save') {
      const notes = [784, 988];
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
  }, [soundMuted]);

  // Achievement system
  const unlockAchievement = useCallback((id: string) => {
    if (achievements[id]) return;
    const ach = ACHIEVEMENTS_DEF[id as keyof typeof ACHIEVEMENTS_DEF];
    if (!ach) return;
    setAchievements(prev => ({ ...prev, [id]: true }));
    setShowAchievement({ id, ...ach });
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
    const saved = JSON.parse(localStorage.getItem('skin-creator-achievements') || '{}');
    saved[id] = true;
    localStorage.setItem('skin-creator-achievements', JSON.stringify(saved));
  }, [achievements]);

  // Layer canvas management
  const getLayerCanvas = useCallback((layerId: LayerType): HTMLCanvasElement => {
    if (!layerCanvasRefs.current[layerId]) {
      const canvas = document.createElement('canvas');
      canvas.width = SKIN_WIDTH;
      canvas.height = SKIN_HEIGHT;
      layerCanvasRefs.current[layerId] = canvas;
    }
    return layerCanvasRefs.current[layerId]!;
  }, []);

  const toggleLayerVisibility = useCallback((layerId: LayerType) => {
    setLayers(prev => prev.map(layer => layer.id === layerId ? { ...layer, visible: !layer.visible } : layer));
  }, []);

  const setLayerOpacity = useCallback((layerId: LayerType, opacity: number) => {
    setLayers(prev => prev.map(layer => layer.id === layerId ? { ...layer, opacity } : layer));
  }, []);

  const setLayerTint = useCallback((layerId: LayerType, tint: string | null) => {
    setLayers(prev => prev.map(layer => layer.id === layerId ? { ...layer, tint } : layer));
  }, []);

  const setLayerTintIntensity = useCallback((layerId: LayerType, tintIntensity: number) => {
    setLayers(prev => prev.map(layer => layer.id === layerId ? { ...layer, tintIntensity } : layer));
  }, []);

  const applyTintToCanvas = useCallback((sourceCanvas: HTMLCanvasElement, tint: string, intensity: number): HTMLCanvasElement => {
    const tintedCanvas = document.createElement('canvas');
    tintedCanvas.width = sourceCanvas.width;
    tintedCanvas.height = sourceCanvas.height;
    const ctx = tintedCanvas.getContext('2d');
    if (!ctx) return sourceCanvas;
    ctx.drawImage(sourceCanvas, 0, 0);
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = intensity / 100;
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, tintedCanvas.width, tintedCanvas.height);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.globalAlpha = 1;
    ctx.drawImage(sourceCanvas, 0, 0);
    return tintedCanvas;
  }, []);

  const moveLayer = useCallback((layerId: LayerType, direction: 'up' | 'down') => {
    setLayers(prev => {
      const index = prev.findIndex(l => l.id === layerId);
      if (index === -1) return prev;
      const newIndex = direction === 'up' ? index + 1 : index - 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const newLayers = [...prev];
      [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
      return newLayers;
    });
  }, []);

  const compositeLayersToMain = useCallback(() => {
    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return;
    const mainCtx = mainCanvas.getContext('2d');
    if (!mainCtx) return;
    mainCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
    layers.forEach(layer => {
      if (!layer.visible) return;
      const layerCanvas = layerCanvasRefs.current[layer.id];
      if (!layerCanvas) return;
      let canvasToDraw = layerCanvas;
      if (layer.tint && layer.tintIntensity > 0) {
        canvasToDraw = applyTintToCanvas(layerCanvas, layer.tint, layer.tintIntensity);
      }
      mainCtx.globalAlpha = layer.opacity / 100;
      mainCtx.drawImage(canvasToDraw, 0, 0);
    });
    mainCtx.globalAlpha = 1;
  }, [layers, applyTintToCanvas]);

  const updatePreview = useCallback(() => {
    const canvas = canvasRef.current;
    const preview = previewRef.current;
    if (!canvas || !preview) return;
    const ctx = preview.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, preview.width, preview.height);
    const scale = 8;
    const offsetX = 60;
    const offsetY = 20;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 8, 8, 8, 8, offsetX, offsetY, 8 * scale, 8 * scale);
    ctx.drawImage(canvas, 20, 20, 8, 12, offsetX, offsetY + 8 * scale, 8 * scale, 12 * scale);
    ctx.drawImage(canvas, 44, 20, 4, 12, offsetX - 4 * scale, offsetY + 8 * scale, 4 * scale, 12 * scale);
    ctx.drawImage(canvas, 36, 52, 4, 12, offsetX + 8 * scale, offsetY + 8 * scale, 4 * scale, 12 * scale);
    ctx.drawImage(canvas, 4, 20, 4, 12, offsetX, offsetY + 20 * scale, 4 * scale, 12 * scale);
    ctx.drawImage(canvas, 20, 52, 4, 12, offsetX + 4 * scale, offsetY + 20 * scale, 4 * scale, 12 * scale);
  }, []);

  const clearLayer = useCallback((layerId: LayerType) => {
    const layerCanvas = getLayerCanvas(layerId);
    const ctx = layerCanvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
    compositeLayersToMain();
    updatePreview();
  }, [getLayerCanvas, compositeLayersToMain, updatePreview]);

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
    playSound('click');
  }, [getLayerCanvas, compositeLayersToMain, updatePreview, playSound]);

  const flattenLayers = useCallback(() => {
    if (!confirm('Merge all visible layers into base? This cannot be undone.')) return;
    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return;
    const baseCanvas = getLayerCanvas('base');
    const baseCtx = baseCanvas.getContext('2d');
    if (baseCtx) {
      baseCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
      baseCtx.drawImage(mainCanvas, 0, 0);
    }
    clearLayer('clothing');
    clearLayer('accessories');
    compositeLayersToMain();
    updatePreview();
    playSound('click');
  }, [getLayerCanvas, clearLayer, compositeLayersToMain, updatePreview, playSound]);

  // Save state for undo/redo
  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      if (newHistory.length > maxHistory) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, maxHistory - 1));
    setSkinVersion(v => v + 1);
    try { localStorage.setItem('minecraft-skin-autosave', canvas.toDataURL('image/png')); } catch {}
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
    const undoCount = parseInt(localStorage.getItem('skin-undo-count') || '0') + 1;
    localStorage.setItem('skin-undo-count', undoCount.toString());
    if (undoCount >= 50) unlockAchievement('perfectionist');
  }, [history, historyIndex, unlockAchievement]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const newIndex = historyIndex + 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  }, [history, historyIndex]);

  // AI History
  const addToAIHistory = useCallback((prompt: string, style: AIStyle, skinDataUrl: string) => {
    const newItem: AIHistoryItem = {
      id: `ai-${Date.now()}`, prompt, style, skinDataUrl, timestamp: Date.now(), isFavorite: false,
    };
    setAiHistory(prev => {
      const favorites = prev.filter(item => item.isFavorite);
      const nonFavorites = prev.filter(item => !item.isFavorite);
      const newNonFavorites = [newItem, ...nonFavorites].slice(0, 10);
      return [...newNonFavorites, ...favorites].sort((a, b) => b.timestamp - a.timestamp);
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setAiHistory(prev => prev.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
  }, []);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatePreview, playSound]);

  const regenerateFromHistory = useCallback((item: AIHistoryItem) => {
    setAiPrompt(item.prompt);
    setAiStyle(item.style);
    setShowAIHistory(false);
  }, []);

  const deleteFromHistory = useCallback((id: string) => {
    setAiHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  // Enhance prompt with LLM
  const enhancePrompt = async () => {
    if (!aiPrompt.trim() || !localLLMAvailable) return;
    setEnhancing(true);
    try {
      const enhanced = await enhancePromptWithLLM(aiPrompt);
      if (enhanced && enhanced !== aiPrompt) setAiPrompt(enhanced);
    } catch {} finally { setEnhancing(false); }
  };

  // AI generation
  const generateAISkin = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    const canvas = canvasRef.current;
    if (!canvas) { setAiLoading(false); return; }
    const ctx = canvas.getContext('2d');
    if (!ctx) { setAiLoading(false); return; }

    if (useRealAI && isAIAvailable()) {
      try {
        const result = await generateAndConvertSkin({ prompt: aiPrompt, style: aiStyle });
        if (result.success && result.skinDataUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
            ctx.drawImage(img, 0, 0);
            updatePreview();
            saveState();
            addToAIHistory(aiPrompt, aiStyle, result.skinDataUrl!);
            setAiLoading(false);
            setShowAIPanel(false);
            playSound('download');
          };
          img.onerror = () => { setAiError('Failed to load generated skin'); setAiLoading(false); };
          img.src = result.skinDataUrl;
          return;
        } else {
          setAiError(result.error || 'AI generation failed');
        }
      } catch (error) {
        setAiError(error instanceof Error ? error.message : 'AI generation failed');
      }
    }

    // Fallback generation
    await new Promise(r => setTimeout(r, 800));
    const prompt = aiPrompt.toLowerCase();
    let colors = { skin: '#c4a57b', hair: '#442920', shirt: '#00a8a8', pants: '#3c2a5e', shoes: '#444444' };
    const styleModifier = aiStyle === 'anime' ? 1.2 : aiStyle === 'cartoon' ? 1.1 : 1;

    if (prompt.includes('zombie') || prompt.includes('undead')) colors = { skin: '#5a8f5a', hair: '#2d4a2d', shirt: '#3d5a3d', pants: '#2d4a2d', shoes: '#1a3a1a' };
    else if (prompt.includes('robot') || prompt.includes('mech')) colors = { skin: '#8a8a8a', hair: '#444444', shirt: '#3498db', pants: '#2c3e50', shoes: '#1a1a1a' };
    else if (prompt.includes('ninja') || prompt.includes('assassin')) colors = { skin: '#c4a57b', hair: '#1a1a1a', shirt: '#1a1a1a', pants: '#1a1a1a', shoes: '#2c2c2c' };
    else if (prompt.includes('princess') || prompt.includes('queen')) colors = { skin: '#ffdfc4', hair: '#f1c40f', shirt: '#e91e63', pants: '#9c27b0', shoes: '#ff69b4' };
    else if (prompt.includes('pirate') || prompt.includes('captain')) colors = { skin: '#d4a76a', hair: '#2c1810', shirt: '#8B0000', pants: '#1a1a1a', shoes: '#3d2314' };
    else if (prompt.includes('wizard') || prompt.includes('mage')) colors = { skin: '#e8d5c4', hair: '#c0c0c0', shirt: '#4B0082', pants: '#2E0854', shoes: '#1a1a2e' };
    else if (prompt.includes('alien') || prompt.includes('space')) colors = { skin: '#7dcea0', hair: '#27ae60', shirt: '#9b59b6', pants: '#8e44ad', shoes: '#6c3483' };
    else if (prompt.includes('knight') || prompt.includes('armor')) colors = { skin: '#d4a76a', hair: '#4a3728', shirt: '#7f8c8d', pants: '#5d6d7e', shoes: '#2c3e50' };
    else if (prompt.includes('elf') || prompt.includes('fairy')) colors = { skin: '#f5deb3', hair: '#228b22', shirt: '#006400', pants: '#556b2f', shoes: '#8b4513' };
    else if (prompt.includes('vampire') || prompt.includes('dark')) colors = { skin: '#e8e8e8', hair: '#1a1a1a', shirt: '#8b0000', pants: '#1a1a1a', shoes: '#2c2c2c' };
    else if (prompt.includes('superhero') || prompt.includes('hero')) colors = { skin: '#d4a76a', hair: '#2c1810', shirt: '#dc143c', pants: '#00008b', shoes: '#ffd700' };
    else if (prompt.includes('chef') || prompt.includes('cook')) colors = { skin: '#d4a76a', hair: '#3d2314', shirt: '#ffffff', pants: '#1a1a1a', shoes: '#2c2c2c' };
    else if (prompt.includes('doctor') || prompt.includes('nurse')) colors = { skin: '#d4a76a', hair: '#3d2314', shirt: '#87ceeb', pants: '#87ceeb', shoes: '#ffffff' };
    else {
      const hash = aiPrompt.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const hue = hash % 360;
      colors.shirt = `hsl(${hue}, 70%, ${50 * styleModifier}%)`;
      colors.pants = `hsl(${(hue + 180) % 360}, 60%, ${40 * styleModifier}%)`;
      colors.hair = `hsl(${(hue + 90) % 360}, 40%, 25%)`;
    }

    ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
    // Head
    ctx.fillStyle = colors.skin;
    ctx.fillRect(8, 8, 8, 8); ctx.fillRect(24, 8, 8, 8); ctx.fillRect(0, 8, 8, 8); ctx.fillRect(16, 8, 8, 8); ctx.fillRect(8, 0, 8, 8); ctx.fillRect(16, 0, 8, 8);
    ctx.fillStyle = colors.hair;
    ctx.fillRect(8, 0, 8, 8); ctx.fillRect(8, 8, 8, 2); ctx.fillRect(0, 8, 8, 3); ctx.fillRect(16, 8, 8, 3); ctx.fillRect(24, 8, 8, 3);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(10, 12, 2, 2); ctx.fillRect(14, 12, 2, 2);
    ctx.fillStyle = '#000000'; ctx.fillRect(11, 13, 1, 1); ctx.fillRect(15, 13, 1, 1);
    ctx.fillStyle = '#d4a76a'; ctx.fillRect(12, 14, 2, 1);
    ctx.fillStyle = '#b35a5a'; ctx.fillRect(11, 15, 4, 1);
    // Body
    ctx.fillStyle = colors.shirt;
    ctx.fillRect(20, 20, 8, 12); ctx.fillRect(32, 20, 8, 12); ctx.fillRect(16, 20, 4, 12); ctx.fillRect(28, 20, 4, 12); ctx.fillRect(20, 16, 8, 4);
    // Arms
    ctx.fillStyle = colors.skin;
    ctx.fillRect(44, 20, 4, 12); ctx.fillRect(48, 20, 4, 12); ctx.fillRect(40, 20, 4, 12); ctx.fillRect(52, 20, 4, 12);
    ctx.fillStyle = colors.shirt;
    ctx.fillRect(44, 20, 4, 8); ctx.fillRect(40, 20, 4, 8);
    ctx.fillStyle = colors.skin;
    ctx.fillRect(36, 52, 4, 12); ctx.fillRect(44, 52, 4, 12); ctx.fillRect(32, 52, 4, 12); ctx.fillRect(48, 52, 4, 12);
    ctx.fillStyle = colors.shirt;
    ctx.fillRect(36, 52, 4, 8); ctx.fillRect(32, 52, 4, 8);
    // Legs
    ctx.fillStyle = colors.pants;
    ctx.fillRect(4, 20, 4, 12); ctx.fillRect(8, 20, 4, 12); ctx.fillRect(0, 20, 4, 12); ctx.fillRect(12, 20, 4, 12);
    ctx.fillStyle = colors.shoes; ctx.fillRect(4, 28, 4, 4); ctx.fillRect(0, 28, 4, 4);
    ctx.fillStyle = colors.pants;
    ctx.fillRect(20, 52, 4, 12); ctx.fillRect(24, 52, 4, 12); ctx.fillRect(16, 52, 4, 12); ctx.fillRect(28, 52, 4, 12);
    ctx.fillStyle = colors.shoes; ctx.fillRect(20, 60, 4, 4); ctx.fillRect(16, 60, 4, 4);

    updatePreview();
    saveState();
    const fallbackDataUrl = canvas.toDataURL('image/png');
    addToAIHistory(aiPrompt, aiStyle, fallbackDataUrl);
    setAiLoading(false);
    setShowAIPanel(false);
    playSound('download');
  };

  const addRecentColor = useCallback((color: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 8);
    });
  }, []);

  const spawnParticle = useCallback((clientX: number, clientY: number) => {
    if (tool === 'eraser') return;
    const id = particleIdRef.current++;
    const newParticle = { id, x: clientX, y: clientY, color: selectedColor };
    setParticles(prev => [...prev.slice(-20), newParticle]);
    setTimeout(() => { setParticles(prev => prev.filter(p => p.id !== id)); }, 600);
  }, [selectedColor, tool]);

  // Template loading
  const loadTemplate = useCallback((template: string) => {
    const baseCanvas = getLayerCanvas('base');
    const clothingCanvas = getLayerCanvas('clothing');
    const accessoriesCanvas = getLayerCanvas('accessories');
    const baseCtx = baseCanvas.getContext('2d');
    const clothingCtx = clothingCanvas.getContext('2d');
    const accessoriesCtx = accessoriesCanvas.getContext('2d');
    if (!baseCtx || !clothingCtx || !accessoriesCtx) return;
    baseCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
    clothingCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
    accessoriesCtx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);

    if (template === 'blank') {
      compositeLayersToMain();
      updatePreview();
      return;
    }

    const t = TEMPLATES[template] || TEMPLATES.steve;

    // Head
    baseCtx.fillStyle = t.hair; baseCtx.fillRect(8, 0, 8, 8);
    baseCtx.fillStyle = t.skin; baseCtx.fillRect(16, 0, 8, 8);
    baseCtx.fillStyle = t.skin; baseCtx.fillRect(0, 8, 8, 8);
    baseCtx.fillStyle = t.skin; baseCtx.fillRect(8, 8, 8, 8);
    baseCtx.fillStyle = t.eyes; baseCtx.fillRect(9, 11, 2, 1); baseCtx.fillRect(13, 11, 2, 1);
    baseCtx.fillStyle = t.pupils; baseCtx.fillRect(10, 11, 1, 1); baseCtx.fillRect(13, 11, 1, 1);
    baseCtx.fillStyle = t.hair; baseCtx.fillRect(8, 8, 8, 1); baseCtx.fillRect(8, 8, 1, 2); baseCtx.fillRect(15, 8, 1, 2);
    baseCtx.fillStyle = '#a87d5a'; baseCtx.fillRect(11, 14, 2, 1);
    baseCtx.fillStyle = t.skin; baseCtx.fillRect(16, 8, 8, 8);
    baseCtx.fillStyle = t.hair; baseCtx.fillRect(24, 8, 8, 8);

    // Body
    clothingCtx.fillStyle = t.shirt;
    clothingCtx.fillRect(20, 16, 8, 4); clothingCtx.fillRect(28, 16, 8, 4);
    clothingCtx.fillRect(16, 20, 4, 12); clothingCtx.fillRect(20, 20, 8, 12); clothingCtx.fillRect(28, 20, 4, 12); clothingCtx.fillRect(32, 20, 8, 12);

    // Right arm
    baseCtx.fillStyle = t.skin;
    baseCtx.fillRect(44, 16, 4, 4); baseCtx.fillRect(48, 16, 4, 4);
    baseCtx.fillRect(40, 20, 4, 12); baseCtx.fillRect(44, 20, 4, 12); baseCtx.fillRect(48, 20, 4, 12); baseCtx.fillRect(52, 20, 4, 12);

    // Right leg
    clothingCtx.fillStyle = t.pants;
    clothingCtx.fillRect(4, 16, 4, 4); clothingCtx.fillRect(8, 16, 4, 4);
    clothingCtx.fillRect(0, 20, 4, 12); clothingCtx.fillRect(4, 20, 4, 12); clothingCtx.fillRect(8, 20, 4, 12); clothingCtx.fillRect(12, 20, 4, 12);
    clothingCtx.fillStyle = t.shoes;
    clothingCtx.fillRect(4, 28, 4, 4); clothingCtx.fillRect(0, 28, 4, 4); clothingCtx.fillRect(8, 28, 4, 4); clothingCtx.fillRect(12, 28, 4, 4);

    // Left arm
    baseCtx.fillStyle = t.skin;
    baseCtx.fillRect(36, 48, 4, 4); baseCtx.fillRect(40, 48, 4, 4);
    baseCtx.fillRect(32, 52, 4, 12); baseCtx.fillRect(36, 52, 4, 12); baseCtx.fillRect(40, 52, 4, 12); baseCtx.fillRect(44, 52, 4, 12);

    // Left leg
    clothingCtx.fillStyle = t.pants;
    clothingCtx.fillRect(20, 48, 4, 4); clothingCtx.fillRect(24, 48, 4, 4);
    clothingCtx.fillRect(16, 52, 4, 12); clothingCtx.fillRect(20, 52, 4, 12); clothingCtx.fillRect(24, 52, 4, 12); clothingCtx.fillRect(28, 52, 4, 12);
    clothingCtx.fillStyle = t.shoes;
    clothingCtx.fillRect(20, 60, 4, 4); clothingCtx.fillRect(16, 60, 4, 4); clothingCtx.fillRect(24, 60, 4, 4); clothingCtx.fillRect(28, 60, 4, 4);

    compositeLayersToMain();
    updatePreview();
    setSkinVersion(v => v + 1);
  }, [getLayerCanvas, compositeLayersToMain, updatePreview]);

  const generateRandomSkin = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
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
    ctx.fillStyle = p.skin;
    ctx.fillRect(8, 8, 8, 8); ctx.fillRect(0, 8, 8, 8); ctx.fillRect(16, 8, 8, 8); ctx.fillRect(24, 8, 8, 8); ctx.fillRect(8, 0, 8, 8);
    ctx.fillStyle = p.hair; ctx.fillRect(8, 8, 8, Math.random() > 0.5 ? 2 : 1);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(9, 11, 2, 1); ctx.fillRect(13, 11, 2, 1);
    ctx.fillStyle = '#000000'; ctx.fillRect(10, 11, 1, 1); ctx.fillRect(13, 11, 1, 1);
    ctx.fillStyle = p.shirt;
    ctx.fillRect(20, 20, 8, 12); ctx.fillRect(16, 20, 4, 12); ctx.fillRect(28, 20, 4, 12); ctx.fillRect(20, 16, 8, 4);
    ctx.fillStyle = p.skin; ctx.fillRect(44, 20, 4, 4); ctx.fillRect(36, 52, 4, 4);
    ctx.fillStyle = p.shirt; ctx.fillRect(44, 24, 4, 8); ctx.fillRect(36, 56, 4, 8);
    ctx.fillStyle = p.pants; ctx.fillRect(4, 20, 4, 12); ctx.fillRect(20, 52, 4, 12);
    ctx.fillStyle = p.shoes; ctx.fillRect(4, 28, 4, 4); ctx.fillRect(20, 60, 4, 4);
    updatePreview();
    saveState();
    playSound('download');
  }, [updatePreview, playSound]);

  // Drawing functions
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type === 'mousemove') return;
    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return;
    const mainCtx = mainCanvas.getContext('2d');
    if (!mainCtx) return;
    const layerCanvas = getLayerCanvas(activeLayer);
    const ctx = layerCanvas.getContext('2d');
    if (!ctx) return;
    if (isDrawing && Math.random() > 0.7) {
      spawnParticle(e.clientX, e.clientY);
      playSound('draw');
      unlockAchievement('firstDraw');
      const hour = new Date().getHours();
      if (hour >= 2 && hour < 5) unlockAchievement('nightOwl');
    }
    const rect = mainCanvas.getBoundingClientRect();
    const scaleX = SKIN_WIDTH / rect.width;
    const scaleY = SKIN_HEIGHT / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    if (x < 0 || x >= SKIN_WIDTH || y < 0 || y >= SKIN_HEIGHT) return;

    if (tool === 'eyedropper') {
      const imageData = mainCtx.getImageData(x, y, 1, 1).data;
      if (imageData[3] > 0) {
        const hex = '#' + [imageData[0], imageData[1], imageData[2]].map(v => v.toString(16).padStart(2, '0')).join('');
        setSelectedColor(hex.toUpperCase());
        playSound('click');
      }
      return;
    }

    if (selectedPart) {
      const part = BODY_PARTS[selectedPart as keyof typeof BODY_PARTS];
      if (x < part.x || x >= part.x + part.w || y < part.y || y >= part.y + part.h) return;
    }

    for (let dx = 0; dx < brushSize; dx++) {
      for (let dy = 0; dy < brushSize; dy++) {
        const px = x + dx;
        const py = y + dy;
        if (px >= SKIN_WIDTH || py >= SKIN_HEIGHT) continue;
        if (tool === 'eraser') { ctx.clearRect(px, py, 1, 1); }
        else if (tool === 'fill') {
          if (selectedPart) {
            const part = BODY_PARTS[selectedPart as keyof typeof BODY_PARTS];
            ctx.fillStyle = selectedColor;
            ctx.fillRect(part.x, part.y, part.w, part.h);
          }
        } else if (tool === 'gradient') {
          if (selectedPart) {
            const part = BODY_PARTS[selectedPart as keyof typeof BODY_PARTS];
            const gradient = ctx.createLinearGradient(part.x, part.y, part.x + part.w, part.y + part.h);
            gradient.addColorStop(0, selectedColor);
            gradient.addColorStop(1, secondaryColor);
            ctx.fillStyle = gradient;
            ctx.fillRect(part.x, part.y, part.w, part.h);
          }
        } else if (tool === 'glow') {
          ctx.shadowColor = selectedColor;
          ctx.shadowBlur = 2;
          ctx.fillStyle = selectedColor;
          for (let i = 0; i < brushSize; i++) { for (let j = 0; j < brushSize; j++) { ctx.fillRect(x + i, y + j, 1, 1); } }
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
          pattern.forEach(([pdx, pdy]) => { ctx.fillRect(x + pdx, y + pdy, 1, 1); });
        } else {
          ctx.fillStyle = selectedColor;
          ctx.fillRect(px, py, 1, 1);
          if (mirrorMode) { ctx.fillRect(SKIN_WIDTH - 1 - px, py, 1, 1); }
        }
      }
    }
    compositeLayersToMain();
    updatePreview();
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return;
    const layerCanvas = getLayerCanvas(activeLayer);
    const ctx = layerCanvas.getContext('2d');
    if (!ctx) return;
    const rect = mainCanvas.getBoundingClientRect();
    const scaleX = SKIN_WIDTH / rect.width;
    const scaleY = SKIN_HEIGHT / rect.height;
    const x = Math.floor((touch.clientX - rect.left) * scaleX);
    const y = Math.floor((touch.clientY - rect.top) * scaleY);
    if (x < 0 || x >= SKIN_WIDTH || y < 0 || y >= SKIN_HEIGHT) return;
    if (selectedPart) {
      const part = BODY_PARTS[selectedPart as keyof typeof BODY_PARTS];
      if (x < part.x || x >= part.x + part.w || y < part.y || y >= part.y + part.h) return;
    }
    for (let dx = 0; dx < brushSize; dx++) {
      for (let dy = 0; dy < brushSize; dy++) {
        const px = x + dx; const py = y + dy;
        if (px >= SKIN_WIDTH || py >= SKIN_HEIGHT) continue;
        if (tool === 'eraser') { ctx.clearRect(px, py, 1, 1); }
        else { ctx.fillStyle = selectedColor; ctx.fillRect(px, py, 1, 1); if (mirrorMode) { ctx.fillRect(SKIN_WIDTH - 1 - px, py, 1, 1); } }
      }
    }
    compositeLayersToMain();
    updatePreview();
  };

  // Download/Export
  const downloadSkin = (useSelectedLayers = false) => {
    const downloadCanvas = (sourceCanvas: HTMLCanvasElement, filename: string) => {
      sourceCanvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
    };

    if (useSelectedLayers) {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = SKIN_WIDTH;
      exportCanvas.height = SKIN_HEIGHT;
      const exportCtx = exportCanvas.getContext('2d');
      if (!exportCtx) return;
      layers.forEach(layer => {
        if (!exportLayers[layer.id]) return;
        const layerCanvas = layerCanvasRefs.current[layer.id];
        if (!layerCanvas) return;
        exportCtx.globalAlpha = layer.opacity / 100;
        exportCtx.drawImage(layerCanvas, 0, 0);
      });
      exportCtx.globalAlpha = 1;
      downloadCanvas(exportCanvas, `${skinName || 'my-skin'}.png`);
    } else {
      const canvas = canvasRef.current;
      if (!canvas) return;
      downloadCanvas(canvas, `${skinName || 'my-skin'}.png`);
    }
    setShowConfetti(true);
    playSound('download');
    setTimeout(() => setShowConfetti(false), 3000);
    setShowExportPanel(false);
    unlockAchievement('downloaded');
  };

  const downloadBaseOnly = () => {
    const baseCanvas = getLayerCanvas('base');
    const link = document.createElement('a');
    link.download = `${skinName || 'my-skin'}-base.png`;
    link.href = baseCanvas.toDataURL('image/png');
    link.click();
    playSound('download');
  };

  const downloadForRoblox = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const robloxCanvas = document.createElement('canvas');
    robloxCanvas.width = 256;
    robloxCanvas.height = 256;
    const ctx = robloxCanvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, 256, 256);
    const link = document.createElement('a');
    link.download = `${skinName || 'my-skin'}-roblox.png`;
    link.href = robloxCanvas.toDataURL('image/png');
    link.click();
    setShowConfetti(true);
    playSound('download');
    setTimeout(() => setShowConfetti(false), 3000);
  };

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

  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      playSound('click');
      alert('✅ Skin copied to clipboard!');
    } catch {
      const dataUrl = canvas.toDataURL('image/png');
      await navigator.clipboard.writeText(dataUrl);
      alert('📋 Skin URL copied!');
    }
  };

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
    e.target.value = '';
  };

  const importFromURL = async () => {
    if (!importURL.trim()) return;
    setImportLoading(true);
    setImportError(null);
    try {
      let skinURL = importURL.trim();
      if (skinURL.includes('namemc.com/profile/')) {
        const username = skinURL.split('/profile/')[1]?.split('/')[0];
        if (username) skinURL = `https://mc-heads.net/skin/${username}`;
      } else if (skinURL.includes('minecraftskins.com/skin/')) {
        skinURL = skinURL.replace('/skin/', '/download/');
      } else if (!skinURL.includes('http')) {
        skinURL = `https://mc-heads.net/skin/${skinURL}`;
      }
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
      img.onerror = () => { setImportError('Failed to load image.'); setImportLoading(false); };
      img.src = URL.createObjectURL(blob);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import skin');
      setImportLoading(false);
    }
  };

  const saveSkin = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const name = prompt('💾 Name your skin:', `Skin ${savedSkins.length + 1}`);
    if (!name) return;
    const newSkin: SavedSkin = { id: `skin-${Date.now()}`, name, dataUrl: canvas.toDataURL('image/png'), timestamp: Date.now() };
    setSavedSkins(prev => [newSkin, ...prev].slice(0, 20));
  }, [savedSkins.length]);

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

  const deleteSavedSkin = useCallback((id: string) => {
    setSavedSkins(prev => prev.filter(s => s.id !== id));
  }, []);

  const shareSkin = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    const compressed = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const url = `${window.location.origin}${window.location.pathname}?skin=${compressed.slice(0, 2000)}`;
    setShareUrl(url);
    navigator.clipboard.writeText(url).then(() => {
      playSound('download');
      unlockAchievement('shared');
    }).catch(() => {});
  }, [playSound, unlockAchievement]);

  // Effects
  useEffect(() => {
    try {
      const saved = localStorage.getItem('minecraft-skin-ai-history');
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) setAiHistory(parsed); }
    } catch {}
    checkLocalLLM().then(setLocalLLMAvailable);
    const tutorialSeen = localStorage.getItem('skin-creator-tutorial-seen');
    if (!tutorialSeen) setShowTutorial(true);
  }, []);

  useEffect(() => {
    try { localStorage.setItem('minecraft-skin-ai-history', JSON.stringify(aiHistory)); } catch {}
  }, [aiHistory]);

  useEffect(() => {
    try { const saved = localStorage.getItem('minecraft-my-skins'); if (saved) setSavedSkins(JSON.parse(saved)); } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('minecraft-my-skins', JSON.stringify(savedSkins)); } catch {}
  }, [savedSkins]);

  useEffect(() => {
    const hasSeenMilestone = localStorage.getItem('skin-creator-t1000-seen');
    if (!hasSeenMilestone) {
      setTimeout(() => {
        setShowMilestone(true);
        setShowConfetti(true);
        localStorage.setItem('skin-creator-t1000-seen', 'true');
        setTimeout(() => { setShowConfetti(false); setShowMilestone(false); }, 5000);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('minecraft-skin-autosave');
    if (saved && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => { ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT); ctx.drawImage(img, 0, 0); updatePreview(); };
        img.src = saved;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('skin-creator-achievements');
    if (saved) setAchievements(JSON.parse(saved));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) setShowShortcuts(prev => !prev);
      else if (e.key === 'Escape') setShowShortcuts(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key.toLowerCase()) {
        case 'b': setTool('brush'); break;
        case 'e': setTool('eraser'); break;
        case 'f': setTool('fill'); break;
        case 'g': if (e.shiftKey) setShowGrid(prev => !prev); else setTool('gradient'); break;
        case 's': setTool('stamp'); break;
        case 'i': setTool('eyedropper'); break;
        case '?': setShowHelp(prev => !prev); break;
        case 'z': if (e.metaKey || e.ctrlKey) { e.preventDefault(); undo(); } break;
        case 'y': if (e.metaKey || e.ctrlKey) { e.preventDefault(); redo(); } break;
        case 'm': setMirrorMode(prev => !prev); break;
        case 'd': setDarkMode(prev => !prev); break;
        case '+': case '=': setZoomLevel(prev => Math.min(12, prev + 1)); break;
        case '-': setZoomLevel(prev => Math.max(2, prev - 1)); break;
        case '1': setBrushSize(1); break;
        case '2': setBrushSize(2); break;
        case '3': setBrushSize(3); break;
        case 'l': setShowLayerPanel(prev => !prev); break;
        case '[': setActiveLayer(prev => { const idx = ['base', 'clothing', 'accessories'].indexOf(prev); return ['base', 'clothing', 'accessories'][(idx + 2) % 3] as LayerType; }); break;
        case ']': setActiveLayer(prev => { const idx = ['base', 'clothing', 'accessories'].indexOf(prev); return ['base', 'clothing', 'accessories'][(idx + 1) % 3] as LayerType; }); break;
        case 'c': if (!e.metaKey && !e.ctrlKey) setShowDuplicateMenu(prev => !prev); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  useEffect(() => { loadTemplate('steve'); }, [loadTemplate]);

  useEffect(() => { compositeLayersToMain(); updatePreview(); }, [layers, compositeLayersToMain, updatePreview]);

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
      } catch {}
    }
  }, [updatePreview]);

  return {
    // Refs
    canvasRef, previewRef, fileInputRef, lastPinchDistance, layerCanvasRefs,
    // State
    selectedGame, setSelectedGame, viewMode, setViewMode,
    selectedColor, setSelectedColor, isDrawing, setIsDrawing,
    tool, setTool, stampShape, setStampShape,
    selectedPart, setSelectedPart, mirrorMode, setMirrorMode,
    darkMode, setDarkMode, show3D, setShow3D,
    zoomLevel, setZoomLevel, showGrid, setShowGrid,
    secondaryColor, setSecondaryColor, brushSize, setBrushSize,
    skinName, setSkinName, recentColors, customTintColors, setCustomTintColors,
    showHelp, setShowHelp, showAIPanel, setShowAIPanel,
    showURLImport, setShowURLImport, importURL, setImportURL,
    importLoading, importError, showTutorial, setShowTutorial,
    tutorialStep, setTutorialStep, showMobileMenu, setShowMobileMenu,
    showMobileColorPicker, setShowMobileColorPicker,
    showMobile3DPreview, setShowMobile3DPreview,
    skinModel, setSkinModel, skinVersion,
    contextMenu, setContextMenu,
    aiPrompt, setAiPrompt, aiLoading, enhancing, localLLMAvailable,
    aiStyle, setAiStyle, aiError, setAiError,
    useRealAI, setUseRealAI,
    aiHistory, showAIHistory, setShowAIHistory,
    layers, setLayers, activeLayer, setActiveLayer,
    showLayerPanel, setShowLayerPanel,
    savedSkins, setSavedSkins, showMySkins, setShowMySkins,
    showDuplicateMenu, setShowDuplicateMenu,
    showConfetti, setShowConfetti, showMilestone, isWiggling, setIsWiggling,
    windowSize, particles, soundMuted, setSoundMuted,
    history, historyIndex,
    achievements, showAchievement, showAchievementGallery, setShowAchievementGallery,
    helpTipDismissed, selectedPose, setSelectedPose,
    showShortcuts, setShowShortcuts,
    showExportPanel, setShowExportPanel, exportLayers, setExportLayers,
    shareUrl, setShareUrl,
    todayChallenge,
    // Actions
    playSound, unlockAchievement, dismissTip,
    toggleLayerVisibility, setLayerOpacity, setLayerTint, setLayerTintIntensity,
    moveLayer, compositeLayersToMain, updatePreview,
    clearLayer, copyLayerTo, flattenLayers,
    saveState, undo, redo,
    addToAIHistory, toggleFavorite, loadFromHistory, regenerateFromHistory, deleteFromHistory,
    enhancePrompt, generateAISkin,
    addRecentColor, loadTemplate, generateRandomSkin,
    draw, drawTouch,
    downloadSkin, downloadBaseOnly, downloadForRoblox,
    clearCanvas, copyToClipboard, importSkin, importFromURL,
    saveSkin, loadSavedSkin, deleteSavedSkin, shareSkin,
    getLayerCanvas,
  };
}

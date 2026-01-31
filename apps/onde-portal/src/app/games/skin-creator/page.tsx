'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { generateAndConvertSkin, isAIAvailable } from '../lib/aiSkinGenerator';
import { enhancePromptWithLLM, checkLocalLLM } from '../lib/localLLM';

// Lazy load 3D preview to avoid SSR issues
const SkinPreview3D = dynamic(() => import('../components/SkinPreview3D'), { ssr: false });

// Confetti on download!
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

// Gallery component
const SkinGallery = dynamic(() => import('../components/SkinGallery'), { ssr: false });

// View modes
type ViewMode = 'editor' | 'gallery';

// Layer definitions for the skin editor
type LayerType = 'base' | 'clothing' | 'accessories';

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

const DEFAULT_LAYERS: Layer[] = [
  { id: 'base', name: 'Base (Skin)', emoji: '👤', visible: true, opacity: 100, tint: null, tintIntensity: 50, glow: false },
  { id: 'clothing', name: 'Clothing', emoji: '👕', visible: true, opacity: 100, tint: null, tintIntensity: 50, glow: false },
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
};

// Legacy alias (for backwards compatibility)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const STEVE_TEMPLATE = TEMPLATES.steve;

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
  const [selectedGame, setSelectedGame] = useState<GameType>('minecraft');
  const [viewMode, setViewMode] = useState<ViewMode>('editor'); // editor or gallery
  const [selectedColor, setSelectedColor] = useState('#FF0000'); // Classic red!
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'eraser' | 'fill' | 'gradient' | 'glow' | 'stamp' | 'eyedropper'>('brush');
  const [stampShape, setStampShape] = useState<'star' | 'heart' | 'diamond' | 'smiley' | 'fire' | 'lightning'>('star');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [show3D, setShow3D] = useState(false); // Toggle 2D/3D preview
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoomLevel, setZoomLevel] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 4 : 6);
  const [showGrid, setShowGrid] = useState(true); // Grid overlay toggle
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
    
    // Show tutorial on first visit
    const tutorialSeen = localStorage.getItem('skin-creator-tutorial-seen');
    if (!tutorialSeen) {
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
  }
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
    clearLayer('clothing');
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
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const maxHistory = 50;
  
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

  // Save canvas state for undo/redo
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

    // Auto-save to localStorage 💾
    try {
      localStorage.setItem('minecraft-skin-autosave', canvas.toDataURL('image/png'));
    } catch (e) { /* ignore quota errors */ }
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
    // 🤫 Perfectionist achievement - track undo count
    const undoCount = parseInt(localStorage.getItem('skin-undo-count') || '0') + 1;
    localStorage.setItem('skin-undo-count', undoCount.toString());
    if (undoCount >= 50) {
      unlockAchievement('perfectionist');
    }
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

  // Sound effects using Web Audio API 🔊
  const playSound = useCallback((type: 'draw' | 'click' | 'download' | 'undo' | 'redo' | 'error' | 'success' | 'save' | 'achievement') => {
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
        case 'e': setTool('eraser'); break;
        case 'f': setTool('fill'); break;
        case 'g': 
          if (e.shiftKey) { setShowGrid(prev => !prev); } 
          else { setTool('gradient'); } 
          break;
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
        // Layer shortcuts
        case 'l': setShowLayerPanel(prev => !prev); break;
        case '[': setActiveLayer(prev => {
          const idx = ['base', 'clothing', 'accessories'].indexOf(prev);
          return ['base', 'clothing', 'accessories'][(idx + 2) % 3] as LayerType;
        }); break;
        case ']': setActiveLayer(prev => {
          const idx = ['base', 'clothing', 'accessories'].indexOf(prev);
          return ['base', 'clothing', 'accessories'][(idx + 1) % 3] as LayerType;
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

    // 🎨 LAYER: CLOTHING - Shirt, pants, shoes (drawn on clothing layer)
    // Body - front (8x12 at position 20,20)
    clothingCtx.fillStyle = t.shirt;
    clothingCtx.fillRect(20, 20, 8, 12);
    // Body sides, back
    clothingCtx.fillRect(16, 20, 4, 12);
    clothingCtx.fillRect(28, 20, 4, 12);
    clothingCtx.fillRect(32, 20, 8, 12);

    // Legs - pants
    clothingCtx.fillStyle = t.pants;
    // Right leg
    clothingCtx.fillRect(4, 20, 4, 12);
    clothingCtx.fillRect(0, 20, 4, 12);
    clothingCtx.fillRect(8, 20, 4, 12);
    clothingCtx.fillRect(12, 20, 4, 12);
    // Left leg
    clothingCtx.fillRect(20, 52, 4, 12);
    clothingCtx.fillRect(16, 52, 4, 12);
    clothingCtx.fillRect(24, 52, 4, 12);
    clothingCtx.fillRect(28, 52, 4, 12);

    // Shoes
    clothingCtx.fillStyle = t.shoes;
    clothingCtx.fillRect(4, 31, 4, 1);
    clothingCtx.fillRect(20, 63, 4, 1);

    // 🎨 Composite all layers to main canvas
    compositeLayersToMain();
    updatePreview();
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

  useEffect(() => {
    loadTemplate('steve');
  }, [loadTemplate]);

  // 🎨 Recomposite layers when visibility/opacity changes
  useEffect(() => {
    compositeLayersToMain();
    updatePreview();
  }, [layers, compositeLayersToMain]);

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

    const rect = mainCanvas.getBoundingClientRect();
    const scaleX = SKIN_WIDTH / rect.width;
    const scaleY = SKIN_HEIGHT / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

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

    // Check if in selected part (if any)
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
        } else if (tool === 'fill') {
          // Simple fill - just fill selected part
          if (selectedPart) {
            const part = BODY_PARTS[selectedPart as keyof typeof BODY_PARTS];
            ctx.fillStyle = selectedColor;
            ctx.fillRect(part.x, part.y, part.w, part.h);
          }
        } else if (tool === 'gradient') {
          // Gradient fill on selected part
          if (selectedPart) {
            const part = BODY_PARTS[selectedPart as keyof typeof BODY_PARTS];
            const gradient = ctx.createLinearGradient(part.x, part.y, part.x + part.w, part.y + part.h);
            gradient.addColorStop(0, selectedColor);
            gradient.addColorStop(1, secondaryColor);
            ctx.fillStyle = gradient;
            ctx.fillRect(part.x, part.y, part.w, part.h);
          }
        } else if (tool === 'glow') {
          // Neon glow brush - draw with shadow
          ctx.shadowColor = selectedColor;
          ctx.shadowBlur = 2;
          ctx.fillStyle = selectedColor;
          for (let i = 0; i < brushSize; i++) {
            for (let j = 0; j < brushSize; j++) {
              ctx.fillRect(x + i, y + j, 1, 1);
            }
          }
          ctx.shadowBlur = 0;
        } else if (tool === 'stamp') {
          // Pattern stamps - draw shapes!
          ctx.fillStyle = selectedColor;
          const patterns: Record<string, number[][]> = {
            star: [[1,0],[0,1],[1,1],[2,1],[1,2]], // ⭐ star
            heart: [[0,1],[2,1],[0,0],[1,1],[2,0]], // ❤️ heart
            diamond: [[1,0],[0,1],[2,1],[1,2]], // 💎 diamond
            smiley: [[0,0],[2,0],[0,2],[1,2],[2,2],[1,1]], // 😊 smiley face
            fire: [[1,0],[0,1],[1,1],[2,1],[0,2],[1,2],[2,2]], // 🔥 fire
            lightning: [[1,0],[0,1],[1,1],[1,2],[2,2]], // ⚡ lightning
          };
          const pattern = patterns[stampShape] || patterns.star;
          pattern.forEach(([pdx, pdy]) => {
            ctx.fillRect(x + pdx, y + pdy, 1, 1);
          });
        } else {
          ctx.fillStyle = selectedColor;
          ctx.fillRect(px, py, 1, 1);

          // Mirror mode - draw on opposite side too! 🪞
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
  };

  // 📱 Touch draw for mobile
  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    if (!touch) return;

    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return;

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
  };

  // 🎨 Export skin with layer options
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportLayers, setExportLayers] = useState<{ [key in LayerType]: boolean }>({
    base: true,
    clothing: true,
    accessories: true,
  });

  const downloadSkin = (useSelectedLayers = false) => {
    // If using selected layers, create a composite with only those layers
    if (useSelectedLayers) {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = SKIN_WIDTH;
      exportCanvas.height = SKIN_HEIGHT;
      const exportCtx = exportCanvas.getContext('2d');
      if (!exportCtx) return;

      // Draw only selected layers
      layers.forEach(layer => {
        if (!exportLayers[layer.id]) return;
        const layerCanvas = layerCanvasRefs.current[layer.id];
        if (!layerCanvas) return;
        exportCtx.globalAlpha = layer.opacity / 100;
        exportCtx.drawImage(layerCanvas, 0, 0);
      });
      exportCtx.globalAlpha = 1;

      const link = document.createElement('a');
      link.download = `${skinName || 'my-skin'}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
    } else {
      // Default: export full composite
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `${skinName || 'my-skin'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }

    // 🎉 Confetti celebration!
    setShowConfetti(true);
    playSound('download'); // 🔊 Celebration jingle!
    setTimeout(() => setShowConfetti(false), 3000);
    setShowExportPanel(false);
    unlockAchievement('downloaded'); // 🏆 Downloaded achievement!
  };

  // Export only base layer (skin without clothing/accessories)
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
              <div data-shortcut="e eraser" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">E</div><div className="py-2">Eraser</div></div>
              <div data-shortcut="f fill bucket" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">F</div><div className="py-2">Fill bucket</div></div>
              <div data-shortcut="i eyedropper color picker" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">I</div><div className="py-2">Eyedropper</div></div>
              <div data-shortcut="1 2 3 4 5 brush size" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">1-5</div><div className="py-2">Brush size</div></div>
              <div data-shortcut="z undo ctrl cmd" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">⌘/Ctrl + Z</div><div className="py-2">Undo</div></div>
              <div data-shortcut="y redo ctrl cmd" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">⌘/Ctrl + Y</div><div className="py-2">Redo</div></div>
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
      <div className="text-center mb-6 relative">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden absolute left-0 top-0 p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all"
          aria-label="Menu"
        >
          <span className="text-2xl">{showMobileMenu ? '✕' : '☰'}</span>
        </button>
        
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-sm font-semibold text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
            🌙 Moonlight
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl animate-float">
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
        </p>

        {/* Daily Challenge Banner */}
        <div className="mt-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl px-4 py-2 text-white text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <span className="font-bold">Daily Challenge:</span>
            <span>{todayChallenge.theme}</span>
            <span className="opacity-80 text-xs hidden sm:inline">• {todayChallenge.hint}</span>
          </div>
          <span className="text-xs opacity-75">#SkinStudioChallenge</span>
        </div>

        {/* Game Selector */}
        <div className="flex gap-2 mt-3">
          {(Object.entries(GAME_CONFIGS) as [GameType, GameConfig][]).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedGame(key)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${
                selectedGame === key
                  ? 'bg-white text-purple-600 scale-105 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
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
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setViewMode('editor')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              viewMode === 'editor'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            🎨 Editor
          </button>
          <button
            onClick={() => setViewMode('gallery')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              viewMode === 'gallery'
                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white scale-105 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            🖼️ Gallery
          </button>
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
        {/* Left Panel - Preview */}
        <div className="glass-card rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="animate-bounce-soft">👀</span> Preview
            </h2>
            <button
              onClick={() => setShow3D(!show3D)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                show3D
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              title="Toggle 3D view - drag to rotate!"
            >
              {show3D ? '🎮 3D' : '📐 2D'}
            </button>
          </div>
          
          {/* Pose Selector */}
          {show3D && (
            <div className="flex flex-wrap justify-center gap-1 mb-2">
              {POSES.map(pose => (
                <button
                  key={pose.id}
                  onClick={() => setSelectedPose(pose.id)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all ${
                    selectedPose === pose.id
                      ? 'bg-purple-500 text-white'
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
            <div className="rounded-xl mx-auto overflow-hidden" style={{ width: 200, height: 280 }}>
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

          {/* Templates */}
          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Start from:</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {Object.entries(TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => {
                    loadTemplate(key as keyof typeof TEMPLATES);
                    // 💚 Creeper Surprise Effect!
                    if (key === 'creeper') {
                      setShowConfetti(true);
                      playSound('download');
                      // Shake the preview!
                      const preview = document.querySelector('.glass-card');
                      if (preview) {
                        preview.classList.add('animate-wiggle');
                        setTimeout(() => preview.classList.remove('animate-wiggle'), 500);
                      }
                      setTimeout(() => setShowConfetti(false), 2000);
                    }
                  }}
                  className={`px-2 py-1 text-white rounded-lg text-xs font-bold hover:scale-105 transition-all ${key === 'creeper' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                  {template.name}
                </button>
              ))}
              <button
                onClick={() => loadTemplate('blank')}
                className="px-2 py-1 bg-gray-500 text-white rounded-lg text-xs font-bold hover:bg-gray-600"
              >
                ⬜ Blank
              </button>
              <button
                onClick={() => {
                  setIsWiggling(true);
                  generateRandomSkin();
                  setTimeout(() => setIsWiggling(false), 500);
                }}
                className={`px-2 py-1 bg-gradient-to-r from-pink-500 to-yellow-500 text-white rounded-lg text-xs font-bold hover:scale-105 transition-transform ${isWiggling ? 'animate-wiggle' : 'animate-pulse'}`}
              >
                🎲 Random!
              </button>
              <button
                onClick={() => {
                  // 🎁 Mystery Box - completely random pixels!
                  const canvas = layerCanvasRefs.current[activeLayer];
                  if (!canvas) return;
                  const ctx = canvas.getContext('2d');
                  if (!ctx) return;

                  // Fill with random colored pixels
                  for (let x = 0; x < 64; x++) {
                    for (let y = 0; y < 64; y++) {
                      ctx.fillStyle = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
                      ctx.fillRect(x, y, 1, 1);
                    }
                  }

                  compositeLayersToMain();
                  updatePreview();
                  setShowConfetti(true);
                  playSound('download');
                  setTimeout(() => setShowConfetti(false), 2000);
                }}
                className="px-2 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-xs font-bold hover:scale-105 transition-transform"
                title="🎁 Mystery surprise skin!"
              >
                🎁 Mystery!
              </button>
              <button
                onClick={() => {
                  // 🎭 Random Outfit - randomize clothing/accessories tints!
                  const outfitColors = ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#9B59B6', '#FF8E53', '#00BCD4', '#E91E63'];
                  const randomColor = () => outfitColors[Math.floor(Math.random() * outfitColors.length)];

                  setLayers(prev => prev.map(layer => {
                    if (layer.id === 'clothing' || layer.id === 'accessories') {
                      return { ...layer, tint: randomColor(), tintIntensity: 70 };
                    }
                    return layer;
                  }));

                  playSound('download');
                }}
                className="px-2 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg text-xs font-bold hover:scale-105 transition-transform"
                title="🎭 Randomize outfit colors!"
              >
                🎭 Outfit!
              </button>
              
              {/* ✨ AI Color Palette */}
              <button
                onClick={() => {
                  // AI-inspired color harmonies
                  const palettes = [
                    // Cyberpunk
                    { name: 'Cyberpunk', base: '#0ff', accent: '#f0f', dark: '#0a0a2e' },
                    // Forest Warrior
                    { name: 'Forest', base: '#228B22', accent: '#8B4513', dark: '#1a3a1a' },
                    // Ice Mage
                    { name: 'Ice', base: '#87CEEB', accent: '#E0FFFF', dark: '#1a2a3a' },
                    // Fire Lord
                    { name: 'Fire', base: '#FF4500', accent: '#FFD700', dark: '#2a1a0a' },
                    // Void Walker
                    { name: 'Void', base: '#4B0082', accent: '#8B008B', dark: '#0a0a1a' },
                    // Ocean Deep
                    { name: 'Ocean', base: '#006994', accent: '#40E0D0', dark: '#0a1a2a' },
                    // Golden Knight
                    { name: 'Golden', base: '#FFD700', accent: '#DAA520', dark: '#2a2a1a' },
                    // Neon Gamer
                    { name: 'Neon', base: '#39FF14', accent: '#FF1493', dark: '#0a0a0a' },
                  ];
                  const palette = palettes[Math.floor(Math.random() * palettes.length)];
                  
                  // Apply to layers
                  setLayers(prev => prev.map(layer => {
                    if (layer.id === 'clothing') {
                      return { ...layer, tint: palette.base, tintIntensity: 60 };
                    }
                    if (layer.id === 'accessories') {
                      return { ...layer, tint: palette.accent, tintIntensity: 70 };
                    }
                    return layer;
                  }));
                  
                  playSound('success');
                }}
                className="px-2 py-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg text-xs font-bold hover:scale-105 transition-transform animate-pulse"
                title="✨ AI-inspired color palette"
              >
                ✨ AI Colors
              </button>

              {/* 💾 Save/My Skins */}
              <button
                onClick={() => { saveSkin(); playSound('save'); }}
                className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-bold hover:scale-105 transition-transform"
                title="💾 Save current skin"
              >
                💾 Save
              </button>
              <button
                onClick={() => setShowMySkins(!showMySkins)}
                className={`px-2 py-1 rounded-lg text-xs font-bold hover:scale-105 transition-transform ${
                  showMySkins ? 'bg-blue-500 text-white' : 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white'
                }`}
                title="📂 My saved skins"
              >
                📂 My Skins ({savedSkins.length})
              </button>
              <button
                onClick={shareSkin}
                className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-bold hover:scale-105 transition-transform"
                title="🔗 Share skin via link"
              >
                🔗 Share
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
        <div className="flex-1 glass-card rounded-2xl md:rounded-3xl p-3 md:p-6 shadow-2xl">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4 justify-center">
            <button
              onClick={() => setTool('brush')}
              title="🖌️ Draw! Click and drag to color"
              className={`px-2 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-full text-xs md:text-sm font-bold transition-all ${
                tool === 'brush' ? 'bg-blue-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white'
              }`}
            >
              🖌️
            </button>
            <button
              onClick={() => setTool('eraser')}
              title="🧽 Erase! Remove colors"
              className={`px-2 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-full text-xs md:text-sm font-bold transition-all ${
                tool === 'eraser' ? 'bg-pink-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white'
              }`}
            >
              🧽
            </button>
            <button
              onClick={() => setTool('fill')}
              title="🪣 Fill! Color a whole area"
              className={`px-2 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-full text-xs md:text-sm font-bold transition-all ${
                tool === 'fill' ? 'bg-yellow-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white'
              }`}
            >
              🪣
            </button>
            <button
              onClick={() => setTool('gradient')}
              title="🌈 Rainbow! Blend two colors"
              className={`px-2 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-full text-xs md:text-sm font-bold transition-all ${
                tool === 'gradient' ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white'
              }`}
            >
              🌈
            </button>
            <button
              onClick={() => setTool('glow')}
              title="✨ Glow! Make it sparkle"
              className={`px-2 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-full text-xs md:text-sm font-bold transition-all ${
                tool === 'glow' ? 'bg-purple-600 text-white scale-105 shadow-lg shadow-purple-500/50' : 'bg-white/80 hover:bg-white'
              }`}
            >
              ✨
            </button>
            <div className="relative group">
              <button
                onClick={() => setTool('stamp')}
                className={`px-3 py-2 rounded-full font-bold transition-all ${
                  tool === 'stamp' ? 'bg-pink-500 text-white scale-105' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {stampShape === 'star' ? '⭐' : stampShape === 'heart' ? '❤️' : stampShape === 'diamond' ? '💎' : stampShape === 'smiley' ? '😊' : stampShape === 'fire' ? '🔥' : '⚡'} Stamp
              </button>
              {tool === 'stamp' && (
                <div className="absolute top-full left-0 mt-1 flex gap-1 bg-white rounded-lg p-1 shadow-lg z-10">
                  <button onClick={() => setStampShape('star')} className={`p-1 rounded ${stampShape === 'star' ? 'bg-pink-200' : ''}`}>⭐</button>
                  <button onClick={() => setStampShape('heart')} className={`p-1 rounded ${stampShape === 'heart' ? 'bg-pink-200' : ''}`}>❤️</button>
                  <button onClick={() => setStampShape('diamond')} className={`p-1 rounded ${stampShape === 'diamond' ? 'bg-pink-200' : ''}`}>💎</button>
                  <button onClick={() => setStampShape('smiley')} className={`p-1 rounded ${stampShape === 'smiley' ? 'bg-pink-200' : ''}`}>😊</button>
                  <button onClick={() => setStampShape('fire')} className={`p-1 rounded ${stampShape === 'fire' ? 'bg-pink-200' : ''}`}>🔥</button>
                  <button onClick={() => setStampShape('lightning')} className={`p-1 rounded ${stampShape === 'lightning' ? 'bg-pink-200' : ''}`}>⚡</button>
                </div>
              )}
            </div>
            <button
              onClick={() => setTool('eyedropper')}
              title="🎯 Pick a color from your drawing!"
              className={`px-2 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-full text-xs md:text-sm font-bold transition-all ${
                tool === 'eyedropper' ? 'bg-amber-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white'
              }`}
            >
              🎯
            </button>
            <button
              onClick={() => { undo(); playSound('undo'); }}
              disabled={historyIndex <= 0}
              className={`px-3 py-2 rounded-full font-bold transition-all relative ${
                historyIndex <= 0 ? 'bg-gray-300 text-gray-500' : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
              title={`Undo (${historyIndex} steps available)`}
            >
              ↩️ Undo
              {historyIndex > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {historyIndex}
                </span>
              )}
            </button>
            <button
              onClick={() => { redo(); playSound('redo'); }}
              disabled={historyIndex >= history.length - 1}
              className={`px-3 py-2 rounded-full font-bold transition-all relative ${
                historyIndex >= history.length - 1 ? 'bg-gray-300 text-gray-500' : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
              title={`Redo (${history.length - 1 - historyIndex} steps available)`}
            >
              ↪️ Redo
              {historyIndex < history.length - 1 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {history.length - 1 - historyIndex}
                </span>
              )}
            </button>
            <button
              onClick={() => setMirrorMode(!mirrorMode)}
              className={`px-3 py-2 rounded-full font-bold transition-all ${
                mirrorMode ? 'bg-purple-500 text-white scale-105' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              🪞 Mirror
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-3 py-2 rounded-full font-bold transition-all ${
                darkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-white'
              }`}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-full font-bold bg-indigo-500 text-white hover:bg-indigo-600"
              title="Import from file"
            >
              📥 File
            </button>
            <button
              onClick={() => setShowURLImport(true)}
              className="px-3 py-2 rounded-full font-bold bg-cyan-500 text-white hover:bg-cyan-600"
              title="Import from URL or username"
            >
              🌐 URL
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png"
              onChange={importSkin}
              className="hidden"
            />
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={skinName}
                onChange={(e) => setSkinName(e.target.value)}
                placeholder="skin-name"
                className="w-24 px-2 py-1 text-sm rounded-lg border-2 border-gray-300 focus:border-green-500 outline-none"
              />
              <button
                onClick={() => downloadSkin(false)}
                className="px-3 py-2 rounded-full font-bold bg-green-500 text-white hover:bg-green-600 animate-pulse"
                title="💾 Save your skin!"
              >
                💾
              </button>
              <button
                onClick={() => setShowExportPanel(true)}
                className="px-2 py-2 rounded-full font-bold bg-green-600 text-white hover:bg-green-700"
                title="Export options (choose layers)"
              >
                📤
              </button>
            </div>
            <button
              onClick={copyToClipboard}
              className="px-3 py-2 rounded-full font-bold bg-violet-500 text-white hover:bg-violet-600"
              title="Copy to clipboard"
            >
              📋 Copy
            </button>
            <button
              onClick={clearCanvas}
              className="px-3 py-2 rounded-full font-bold bg-red-500 text-white hover:bg-red-600"
              title="🗑️ Start over!"
            >
              🗑️ Clear
            </button>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => setZoomLevel(Math.max(4, zoomLevel - 1))}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold"
              >
                -
              </button>
              <span className="text-sm font-bold w-8 text-center">{zoomLevel}x</span>
              <button
                onClick={() => setZoomLevel(Math.min(10, zoomLevel + 1))}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Brush Size */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-sm font-semibold">Brush:</span>
            {[1, 2, 3].map((size) => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                className={`w-8 h-8 rounded-full font-bold ${
                  brushSize === size ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Body Part Selector */}
          <div className="flex flex-wrap gap-1 mb-3 justify-center">
            <button
              onClick={() => setSelectedPart(null)}
              className={`px-2 py-1 rounded text-sm font-bold ${
                !selectedPart ? 'bg-purple-500 text-white' : 'bg-gray-200'
              }`}
            >
              🎯 All
            </button>
            {Object.entries(BODY_PARTS).map(([key, part]) => (
              <button
                key={key}
                onClick={() => setSelectedPart(key)}
                className={`px-2 py-1 rounded text-sm font-bold ${
                  selectedPart === key ? 'bg-purple-500 text-white' : 'bg-gray-200'
                }`}
              >
                {part.label}
              </button>
            ))}
          </div>

          {/* Canvas with Grid Controls */}
          <div className="flex flex-col items-center gap-2">
            {/* Zoom and Grid Controls */}
            <div className="flex items-center gap-2 bg-white/80 rounded-full px-3 py-1.5 shadow">
              <button
                onClick={() => setZoomLevel(Math.max(2, zoomLevel - 1))}
                className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 font-bold text-sm"
                title="Zoom out (-)"
              >
                −
              </button>
              <span className="text-sm font-bold w-12 text-center">{zoomLevel}x</span>
              <button
                onClick={() => setZoomLevel(Math.min(12, zoomLevel + 1))}
                className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 font-bold text-sm"
                title="Zoom in (+)"
              >
                +
              </button>
              <div className="w-px h-5 bg-gray-300 mx-1"></div>
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-2 py-1 rounded-full text-xs font-bold transition-all ${
                  showGrid
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title="Toggle grid (G)"
              >
                {showGrid ? '▦' : '▢'} Grid
              </button>
              <div className="w-px h-5 bg-gray-300 mx-1"></div>
              {/* Zoom Presets */}
              {[2, 4, 6, 8].map(z => (
                <button
                  key={z}
                  onClick={() => setZoomLevel(z)}
                  className={`w-6 h-6 rounded text-xs font-bold transition-all ${
                    zoomLevel === z
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  title={`Zoom ${z}x`}
                >
                  {z}
                </button>
              ))}
            </div>

            {/* Canvas */}
            <div className="relative">
              {/* Floating Help Tip */}
              {!helpTipDismissed['canvas'] && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                  <div className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
                    👆 Click and drag to draw!
                    <button 
                      onClick={() => dismissTip('canvas')}
                      className="ml-1 hover:bg-blue-600 rounded-full w-5 h-5 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-500 mx-auto" />
                </div>
              )}
            <div
              className="relative rounded-xl p-1"
              style={{
                backgroundImage: 'repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%)',
                backgroundSize: '12px 12px'
              }}
            >
              <canvas
                ref={canvasRef}
                width={SKIN_WIDTH}
                height={SKIN_HEIGHT}
                className="cursor-crosshair"
                style={{
                  width: SKIN_WIDTH * zoomLevel,
                  height: SKIN_HEIGHT * zoomLevel,
                  imageRendering: 'pixelated',
                  transition: 'all 0.2s ease',
                }}
                onMouseDown={(e) => { setIsDrawing(true); draw(e); }}
                onMouseUp={() => { setIsDrawing(false); saveState(); addRecentColor(selectedColor); }}
                onMouseLeave={() => { setIsDrawing(false); setContextMenu(null); }}
                onMouseMove={draw}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY });
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  if (e.touches.length === 2) {
                    // Pinch start - calculate initial distance
                    const dx = e.touches[0].clientX - e.touches[1].clientX;
                    const dy = e.touches[0].clientY - e.touches[1].clientY;
                    lastPinchDistance.current = Math.sqrt(dx * dx + dy * dy);
                  } else if (e.touches.length === 1) {
                    setIsDrawing(true);
                    drawTouch(e);
                  }
                }}
                onTouchEnd={() => {
                  setIsDrawing(false);
                  lastPinchDistance.current = null;
                  saveState();
                  addRecentColor(selectedColor);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  if (e.touches.length === 2 && lastPinchDistance.current !== null) {
                    // Pinch-to-zoom
                    const dx = e.touches[0].clientX - e.touches[1].clientX;
                    const dy = e.touches[0].clientY - e.touches[1].clientY;
                    const newDistance = Math.sqrt(dx * dx + dy * dy);
                    const delta = newDistance - lastPinchDistance.current;
                    if (Math.abs(delta) > 10) {
                      setZoomLevel(prev => Math.min(12, Math.max(2, prev + (delta > 0 ? 1 : -1))));
                      lastPinchDistance.current = newDistance;
                    }
                  } else if (e.touches.length === 1) {
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

              {/* Grid Overlay */}
              {showGrid && (
                <svg
                  className="absolute top-1 left-1 pointer-events-none"
                  width={SKIN_WIDTH * zoomLevel}
                  height={SKIN_HEIGHT * zoomLevel}
                  style={{ opacity: 0.3 }}
                >
                  {/* Vertical lines */}
                  {Array.from({ length: SKIN_WIDTH + 1 }).map((_, i) => (
                    <line
                      key={`v-${i}`}
                      x1={i * zoomLevel}
                      y1={0}
                      x2={i * zoomLevel}
                      y2={SKIN_HEIGHT * zoomLevel}
                      stroke={i % 8 === 0 ? '#000' : '#666'}
                      strokeWidth={i % 8 === 0 ? 1 : 0.5}
                    />
                  ))}
                  {/* Horizontal lines */}
                  {Array.from({ length: SKIN_HEIGHT + 1 }).map((_, i) => (
                    <line
                      key={`h-${i}`}
                      x1={0}
                      y1={i * zoomLevel}
                      x2={SKIN_WIDTH * zoomLevel}
                      y2={i * zoomLevel}
                      stroke={i % 8 === 0 ? '#000' : '#666'}
                      strokeWidth={i % 8 === 0 ? 1 : 0.5}
                    />
                  ))}
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
        <div className="glass-card rounded-3xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">🎨 Colors</h2>

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

      {/* 🎨 Layer Panel - Floating */}
      {showLayerPanel && (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-2xl z-40 w-64">
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

      {/* 📤 Export Panel */}
      {showExportPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowExportPanel(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md m-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">📤 Export Skin</h3>
            <p className="text-sm text-gray-600 mb-4">Choose which layers to include in your export:</p>

            <div className="space-y-2 mb-4">
              {layers.map(layer => (
                <label key={layer.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportLayers[layer.id]}
                    onChange={(e) => setExportLayers(prev => ({ ...prev, [layer.id]: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <span className="text-lg">{layer.emoji}</span>
                  <span>{layer.name}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => downloadSkin(true)}
                className="flex-1 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
              >
                💾 Export Selected
              </button>
              <button
                onClick={() => downloadSkin(false)}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
              >
                📦 Export All
              </button>
            </div>

            <button
              onClick={downloadBaseOnly}
              className="w-full mt-2 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
            >
              👤 Export Base Only (no clothes)
            </button>

            <button
              onClick={downloadForRoblox}
              className="w-full mt-2 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform"
            >
              🎮 Export for Roblox (256x256)
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setShowMobileMenu(false)}>
          <div 
            className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl p-4 transform transition-transform"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">🎨 Menu</h3>
              <button onClick={() => setShowMobileMenu(false)} className="text-2xl">✕</button>
            </div>
            
            <nav className="space-y-2">
              <button
                onClick={() => { setViewMode('editor'); setShowMobileMenu(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${
                  viewMode === 'editor' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                }`}
              >
                🎨 Editor
              </button>
              <button
                onClick={() => { setViewMode('gallery'); setShowMobileMenu(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${
                  viewMode === 'gallery' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
                }`}
              >
                🖼️ Gallery
              </button>
              
              <hr className="my-4" />
              
              <button
                onClick={() => { setShowAIPanel(true); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-3 rounded-xl font-bold hover:bg-gray-100"
              >
                🤖 AI Generator
              </button>
              <button
                onClick={() => { setShowLayerPanel(!showLayerPanel); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-3 rounded-xl font-bold hover:bg-gray-100"
              >
                🎨 Layers
              </button>
              <button
                onClick={() => { setShowURLImport(true); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-3 rounded-xl font-bold hover:bg-gray-100"
              >
                🌐 Import from URL
              </button>
              <button
                onClick={() => { setShowShortcuts(true); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-3 rounded-xl font-bold hover:bg-gray-100"
              >
                ⌨️ Shortcuts
              </button>
              
              <hr className="my-4" />
              
              <button
                onClick={() => { setDarkMode(!darkMode); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-3 rounded-xl font-bold hover:bg-gray-100"
              >
                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              <button
                onClick={() => { setShowTutorial(true); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-3 rounded-xl font-bold hover:bg-gray-100"
              >
                📚 Tutorial
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

      {/* URL Import Modal */}
      {showURLImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowURLImport(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
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

      {/* AI Panel */}
      {showAIPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAIPanel(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md m-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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

      {/* Layer Panel Toggle Button */}
      <button
        onClick={() => setShowLayerPanel(!showLayerPanel)}
        className={`fixed bottom-4 left-16 w-10 h-10 rounded-full shadow-lg text-xl hover:scale-110 transition-transform ${
          showLayerPanel ? 'bg-blue-500 text-white' : 'bg-white/90'
        }`}
        title="Toggle Layers (L)"
      >
        🎨
      </button>

      {/* AI Button */}
      <button
        onClick={() => setShowAIPanel(true)}
        className="fixed bottom-4 left-4 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg text-xl hover:scale-110 transition-transform"
        title="AI Skin Generator"
      >
        🤖
      </button>

      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-4 right-4 w-10 h-10 bg-white/90 rounded-full shadow-lg text-xl font-bold hover:scale-110 transition-transform"
        title="Keyboard shortcuts (?)"
      >
        ?
      </button>

      {/* Footer */}
      <p className="mt-4 text-white/70 text-sm">
        Made with 💖 by Onde • Works with Minecraft Java & Bedrock!
      </p>
    </div>
  );
}

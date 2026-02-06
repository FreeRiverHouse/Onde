'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { generateAndConvertSkin, isAIAvailable } from '../lib/aiSkinGenerator';
import { enhancePromptWithLLM, checkLocalLLM } from '../lib/localLLM';
import {
  Layer, LayerType, GameType, GameConfig, AIHistoryItem, SavedSkin,
  ToolType, StampShape, AIStyle,
  DEFAULT_LAYERS, GAME_CONFIGS, BODY_PARTS, TEMPLATES,
  SKIN_WIDTH, SKIN_HEIGHT, ACHIEVEMENTS,
} from '../components/types';

// Lazy load components to reduce initial bundle size
const Overlays = dynamic(() => import('../components/Overlays'), { ssr: false });
const PreviewPanel = dynamic(() => import('../components/PreviewPanel'), { ssr: false });
const ToolBar = dynamic(() => import('../components/ToolBar'), { ssr: false });
const ColorPalette = dynamic(() => import('../components/ColorPalette'), { ssr: false });
const LayerPanel = dynamic(() => import('../components/LayerPanel'), { ssr: false });
const ExportPanel = dynamic(() => import('../components/ExportPanel'), { ssr: false });
const AIGenerator = dynamic(() => import('../components/AIGenerator'), { ssr: false });

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

export default function SkinCreator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [selectedGame, setSelectedGame] = useState<GameType>('minecraft');
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<ToolType>('brush');
  const [stampShape, setStampShape] = useState<StampShape>('star');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoomLevel, setZoomLevel] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 4 : 6);
  
  // 📱 Touch Gesture State for pinch-to-zoom and pan
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const touchGestureRef = useRef<{
    isGesture: boolean;
    initialDistance: number;
    initialZoom: number;
    initialPan: { x: number; y: number };
    lastCenter: { x: number; y: number };
  }>({
    isGesture: false,
    initialDistance: 0,
    initialZoom: 6,
    initialPan: { x: 0, y: 0 },
    lastCenter: { x: 0, y: 0 },
  });
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  const [secondaryColor, setSecondaryColor] = useState('#4D96FF');
  const [brushSize, setBrushSize] = useState(1);
  const [skinName, setSkinName] = useState('my-skin');
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [customTintColors, setCustomTintColors] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [localLLMAvailable, setLocalLLMAvailable] = useState(false);
  const [aiStyle, setAiStyle] = useState<AIStyle>('blocky');
  const [aiError, setAiError] = useState<string | null>(null);
  const [useRealAI, setUseRealAI] = useState(false);

  // 🤖 AI History & Favorites
  const [aiHistory, setAiHistory] = useState<AIHistoryItem[]>([]);
  const [showAIHistory, setShowAIHistory] = useState(false);
  
  // 📱 Mobile hamburger menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // 📱 Helper to set tool and close mobile menu
  const selectTool = useCallback((newTool: ToolType) => {
    setTool(newTool);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileMenuOpen(false);
    }
  }, []);

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
    checkLocalLLM().then(setLocalLLMAvailable);
  }, []);

  // Save AI history to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('minecraft-skin-ai-history', JSON.stringify(aiHistory));
    } catch (e) { /* ignore quota errors */ }
  }, [aiHistory]);

  // Add a generation to history
  const addToAIHistory = useCallback((prompt: string, style: AIStyle, skinDataUrl: string) => {
    const newItem: AIHistoryItem = {
      id: `ai-${Date.now()}`,
      prompt,
      style,
      skinDataUrl,
      timestamp: Date.now(),
      isFavorite: false,
    };
    setAiHistory(prev => {
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
  // eslint-disable-next-line
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

  const toggleLayerVisibility = useCallback((layerId: LayerType) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  }, []);

  const setLayerOpacity = useCallback((layerId: LayerType, opacity: number) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, opacity } : layer
    ));
  }, []);

  const setLayerTint = useCallback((layerId: LayerType, tint: string | null) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, tint } : layer
    ));
  }, []);

  const setLayerTintIntensity = useCallback((layerId: LayerType, tintIntensity: number) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, tintIntensity } : layer
    ));
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

  const clearLayer = useCallback((layerId: LayerType) => {
    const layerCanvas = getLayerCanvas(layerId);
    const ctx = layerCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
    }
    compositeLayersToMain();
    updatePreview();
  // eslint-disable-next-line
  }, [getLayerCanvas, compositeLayersToMain]);

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
  // eslint-disable-next-line
  }, [getLayerCanvas, compositeLayersToMain]);

  const [showDuplicateMenu, setShowDuplicateMenu] = useState(false);

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
  // eslint-disable-next-line
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
          img.onerror = () => {
            setAiError('Failed to load generated skin');
            setAiLoading(false);
          };
          img.src = result.skinDataUrl;
          return;
        } else {
          setAiError(result.error || 'AI generation failed');
        }
      } catch (error) {
        setAiError(error instanceof Error ? error.message : 'AI generation failed');
      }
    }

    // Fallback: keyword-based generation
    await new Promise(r => setTimeout(r, 800));

    const prompt = aiPrompt.toLowerCase();
    let colors = {
      skin: '#c4a57b', hair: '#442920', shirt: '#00a8a8',
      pants: '#3c2a5e', shoes: '#444444'
    };

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
    ctx.fillRect(8, 8, 8, 8);
    ctx.fillRect(24, 8, 8, 8);
    ctx.fillRect(0, 8, 8, 8);
    ctx.fillRect(16, 8, 8, 8);
    ctx.fillRect(8, 0, 8, 8);
    ctx.fillRect(16, 0, 8, 8);

    // Hair
    ctx.fillStyle = colors.hair;
    ctx.fillRect(8, 0, 8, 8);
    ctx.fillRect(8, 8, 8, 2);
    ctx.fillRect(0, 8, 8, 3);
    ctx.fillRect(16, 8, 8, 3);
    ctx.fillRect(24, 8, 8, 3);

    // Face details
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 12, 2, 2);
    ctx.fillRect(14, 12, 2, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(11, 13, 1, 1);
    ctx.fillRect(15, 13, 1, 1);
    ctx.fillStyle = '#d4a76a';
    ctx.fillRect(12, 14, 2, 1);
    ctx.fillStyle = '#b35a5a';
    ctx.fillRect(11, 15, 4, 1);

    // Body
    ctx.fillStyle = colors.shirt;
    ctx.fillRect(20, 20, 8, 12);
    ctx.fillRect(32, 20, 8, 12);
    ctx.fillRect(16, 20, 4, 12);
    ctx.fillRect(28, 20, 4, 12);
    ctx.fillRect(20, 16, 8, 4);

    // Right Arm
    ctx.fillStyle = colors.skin;
    ctx.fillRect(44, 20, 4, 12);
    ctx.fillRect(48, 20, 4, 12);
    ctx.fillRect(40, 20, 4, 12);
    ctx.fillRect(52, 20, 4, 12);
    ctx.fillStyle = colors.shirt;
    ctx.fillRect(44, 20, 4, 8);
    ctx.fillRect(40, 20, 4, 8);

    // Left Arm
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

    // Left Leg
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
  
  const unlockAchievement = useCallback((id: string) => {
    if (achievements[id]) return;
    const ach = ACHIEVEMENTS[id as keyof typeof ACHIEVEMENTS];
    if (!ach) return;
    setAchievements(prev => ({ ...prev, [id]: true }));
    setShowAchievement({ id, ...ach });
    setTimeout(() => setShowAchievement(null), 3000);
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
  }, [history, historyIndex]);

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
  const playSound = useCallback((type: 'draw' | 'click' | 'download' | 'undo' | 'redo' | 'error' | 'success' | 'save') => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
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
  }, []);

  // Get window size for confetti
  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-load saved skin from localStorage
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
  // eslint-disable-next-line
  }, []);

  // ⌨️ Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch(e.key.toLowerCase()) {
        case 'b': setTool('brush'); break;
        case 'e': setTool('eraser'); break;
        case 'f': setTool('fill'); break;
        case 'g': setTool('gradient'); break;
        case 's': setTool('stamp'); break;
        case 'i': setTool('eyedropper'); break;
        case '?': setShowHelp(prev => !prev); break;
        case 'z': if (e.metaKey || e.ctrlKey) { e.preventDefault(); undo(); } break;
        case 'y': if (e.metaKey || e.ctrlKey) { e.preventDefault(); redo(); } break;
        case 'm': setMirrorMode(prev => !prev); break;
        case 'd': setDarkMode(prev => !prev); break;
        case '1': setBrushSize(1); break;
        case '2': setBrushSize(2); break;
        case '3': setBrushSize(3); break;
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

  // 🎲 Generate random skin!
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

    // Head
    ctx.fillStyle = p.skin;
    ctx.fillRect(8, 8, 8, 8);
    ctx.fillRect(0, 8, 8, 8);
    ctx.fillRect(16, 8, 8, 8);
    ctx.fillRect(24, 8, 8, 8);
    ctx.fillRect(8, 0, 8, 8);
    ctx.fillStyle = p.hair;
    ctx.fillRect(8, 8, 8, Math.random() > 0.5 ? 2 : 1);
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
  // eslint-disable-next-line
  }, []);

  // Spawn sparkle particles when drawing
  const spawnParticle = useCallback((clientX: number, clientY: number) => {
    if (tool === 'eraser') return;
    const id = particleIdRef.current++;
    const newParticle = { id, x: clientX, y: clientY, color: selectedColor };
    setParticles(prev => [...prev.slice(-20), newParticle]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 600);
  }, [selectedColor, tool]);

  // Initialize with template
  const loadTemplate = useCallback((template: keyof typeof TEMPLATES | 'blank') => {
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

    // BASE layer - Skin, face features
    baseCtx.fillStyle = t.skin;
    baseCtx.fillRect(8, 8, 8, 8);
    baseCtx.fillStyle = t.eyes;
    baseCtx.fillRect(9, 11, 2, 1);
    baseCtx.fillRect(13, 11, 2, 1);
    baseCtx.fillStyle = t.pupils;
    baseCtx.fillRect(10, 11, 1, 1);
    baseCtx.fillRect(13, 11, 1, 1);
    baseCtx.fillStyle = t.hair;
    baseCtx.fillRect(8, 8, 8, 1);
    baseCtx.fillRect(8, 8, 1, 2);
    baseCtx.fillRect(15, 8, 1, 2);
    baseCtx.fillStyle = '#a87d5a';
    baseCtx.fillRect(11, 14, 2, 1);

    // Head sides
    baseCtx.fillStyle = t.skin;
    baseCtx.fillRect(0, 8, 8, 8);
    baseCtx.fillRect(16, 8, 8, 8);
    baseCtx.fillRect(24, 8, 8, 8);
    baseCtx.fillStyle = t.hair;
    baseCtx.fillRect(24, 8, 8, 1);
    baseCtx.fillStyle = t.hair;
    baseCtx.fillRect(8, 0, 8, 8);
    baseCtx.fillStyle = t.skin;
    baseCtx.fillRect(16, 0, 8, 8);

    // Arms - skin parts
    baseCtx.fillStyle = t.skin;
    baseCtx.fillRect(44, 20, 4, 12);
    baseCtx.fillRect(40, 20, 4, 12);
    baseCtx.fillRect(48, 20, 4, 12);
    baseCtx.fillRect(52, 20, 4, 12);
    baseCtx.fillRect(36, 52, 4, 12);
    baseCtx.fillRect(32, 52, 4, 12);
    baseCtx.fillRect(40, 52, 4, 12);
    baseCtx.fillRect(44, 52, 4, 12);

    // CLOTHING layer - Shirt, pants, shoes
    clothingCtx.fillStyle = t.shirt;
    clothingCtx.fillRect(20, 20, 8, 12);
    clothingCtx.fillRect(16, 20, 4, 12);
    clothingCtx.fillRect(28, 20, 4, 12);
    clothingCtx.fillRect(32, 20, 8, 12);

    // Legs - pants
    clothingCtx.fillStyle = t.pants;
    clothingCtx.fillRect(4, 20, 4, 12);
    clothingCtx.fillRect(0, 20, 4, 12);
    clothingCtx.fillRect(8, 20, 4, 12);
    clothingCtx.fillRect(12, 20, 4, 12);
    clothingCtx.fillRect(20, 52, 4, 12);
    clothingCtx.fillRect(16, 52, 4, 12);
    clothingCtx.fillRect(24, 52, 4, 12);
    clothingCtx.fillRect(28, 52, 4, 12);

    // Shoes
    clothingCtx.fillStyle = t.shoes;
    clothingCtx.fillRect(4, 31, 4, 1);
    clothingCtx.fillRect(20, 63, 4, 1);

    compositeLayersToMain();
    updatePreview();
  // eslint-disable-next-line
  }, [getLayerCanvas, compositeLayersToMain]);

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

  const [shareUrl, setShareUrl] = useState<string | null>(null);
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
  // eslint-disable-next-line
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
  }, [layers, compositeLayersToMain, updatePreview]);

  // Drawing function
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
    }

    const rect = mainCanvas.getBoundingClientRect();
    const scaleX = SKIN_WIDTH / rect.width;
    const scaleY = SKIN_HEIGHT / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x < 0 || x >= SKIN_WIDTH || y < 0 || y >= SKIN_HEIGHT) return;

    // Eyedropper
    if (tool === 'eyedropper') {
      const imageData = mainCtx.getImageData(x, y, 1, 1).data;
      if (imageData[3] > 0) {
        const hex = '#' + [imageData[0], imageData[1], imageData[2]]
          .map(v => v.toString(16).padStart(2, '0')).join('');
        setSelectedColor(hex.toUpperCase());
        playSound('click');
      }
      return;
    }

    // Check if in selected part
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
          for (let i = 0; i < brushSize; i++) {
            for (let j = 0; j < brushSize; j++) {
              ctx.fillRect(x + i, y + j, 1, 1);
            }
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
            ctx.fillRect(x + pdx, y + pdy, 1, 1);
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

    compositeLayersToMain();
    updatePreview();
  };

  // 📱 Touch draw for mobile
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

    compositeLayersToMain();
    updatePreview();
  };

  // 📱 Touch Gesture Handlers
  const getTouchDistance = useCallback((touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getTouchCenter = useCallback((touch1: React.Touch, touch2: React.Touch): { x: number; y: number } => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length >= 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = getTouchDistance(touch1, touch2);
      const center = getTouchCenter(touch1, touch2);
      
      touchGestureRef.current = {
        isGesture: true,
        initialDistance: distance,
        initialZoom: zoomLevel,
        initialPan: { ...panOffset },
        lastCenter: center,
      };
      setIsDrawing(false);
    } else {
      touchGestureRef.current.isGesture = false;
      setIsDrawing(true);
      drawTouch(e);
    }
  // eslint-disable-next-line
  }, [getTouchDistance, getTouchCenter, zoomLevel, panOffset]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length >= 2 && touchGestureRef.current.isGesture) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = getTouchDistance(touch1, touch2);
      const currentCenter = getTouchCenter(touch1, touch2);
      
      const scale = currentDistance / touchGestureRef.current.initialDistance;
      const newZoom = Math.round(touchGestureRef.current.initialZoom * scale);
      const clampedZoom = Math.max(2, Math.min(12, newZoom));
      setZoomLevel(clampedZoom);
      
      const dx = currentCenter.x - touchGestureRef.current.lastCenter.x;
      const dy = currentCenter.y - touchGestureRef.current.lastCenter.y;
      
      setPanOffset(prev => ({
        x: Math.max(-200, Math.min(200, prev.x + dx)),
        y: Math.max(-200, Math.min(200, prev.y + dy)),
      }));
      
      touchGestureRef.current.lastCenter = currentCenter;
    } else if (e.touches.length === 1 && !touchGestureRef.current.isGesture) {
      e.preventDefault();
      drawTouch(e);
    }
  // eslint-disable-next-line
  }, [getTouchDistance, getTouchCenter]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length < 2) {
      if (touchGestureRef.current.isGesture) {
        touchGestureRef.current.isGesture = false;
      } else {
        setIsDrawing(false);
        saveState();
        addRecentColor(selectedColor);
      }
    }
  }, [saveState, addRecentColor, selectedColor]);

  const resetPanOffset = useCallback(() => {
    setPanOffset({ x: 0, y: 0 });
    playSound('click');
  }, [playSound]);

  // 🎨 Export skin with layer options
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportLayers, setExportLayers] = useState<{ [key in LayerType]: boolean }>({
    base: true,
    clothing: true,
    accessories: true,
  });

  const downloadSkin = (useSelectedLayers = false) => {
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

      const link = document.createElement('a');
      link.download = `${skinName || 'my-skin'}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
    } else {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `${skinName || 'my-skin'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
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
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
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

  // ============================================================
  // RENDER
  // ============================================================
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

      {/* Overlays: Confetti, Shortcuts, Achievement, Milestone, Particles, Help */}
      <Overlays
        showConfetti={showConfetti}
        windowSize={windowSize}
        showShortcuts={showShortcuts}
        setShowShortcuts={setShowShortcuts}
        showAchievement={showAchievement}
        showMilestone={showMilestone}
        particles={particles}
        showHelp={showHelp}
        setShowHelp={setShowHelp}
      />

      {/* Header */}
      <div className="text-center mb-6">
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
        </p>

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
      </div>

      <div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl px-2">
        {/* Left Panel - Preview */}
        <PreviewPanel
          canvasRef={canvasRef}
          previewRef={previewRef}
          show3D={show3D}
          setShow3D={setShow3D}
          loadTemplate={loadTemplate}
          generateRandomSkin={generateRandomSkin}
          isWiggling={isWiggling}
          setIsWiggling={setIsWiggling}
          showConfetti={showConfetti}
          setShowConfetti={setShowConfetti}
          playSound={playSound}
          setLayers={setLayers}
          activeLayer={activeLayer}
          layerCanvasRefs={layerCanvasRefs}
          compositeLayersToMain={compositeLayersToMain}
          updatePreview={updatePreview}
          saveSkin={saveSkin}
          savedSkins={savedSkins}
          showMySkins={showMySkins}
          setShowMySkins={setShowMySkins}
          loadSavedSkin={loadSavedSkin}
          deleteSavedSkin={deleteSavedSkin}
          shareSkin={shareSkin}
          shareUrl={shareUrl}
          setShareUrl={setShareUrl}
        />

        {/* Center - Canvas Editor */}
        <div className="flex-1 glass-card rounded-2xl md:rounded-3xl p-3 md:p-6 shadow-2xl">
          <ToolBar
            tool={tool}
            selectTool={selectTool}
            stampShape={stampShape}
            setStampShape={setStampShape}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            selectedPart={selectedPart}
            setSelectedPart={setSelectedPart}
            mirrorMode={mirrorMode}
            setMirrorMode={setMirrorMode}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            skinName={skinName}
            setSkinName={setSkinName}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            panOffset={panOffset}
            resetPanOffset={resetPanOffset}
            historyIndex={historyIndex}
            historyLength={history.length}
            undo={undo}
            redo={redo}
            downloadSkin={downloadSkin}
            setShowExportPanel={setShowExportPanel}
            copyToClipboard={copyToClipboard}
            clearCanvas={clearCanvas}
            importSkin={importSkin}
            fileInputRef={fileInputRef}
            playSound={playSound}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />

          {/* Canvas with Touch Gesture Support */}
          <div className="flex justify-center overflow-hidden">
            <div
              ref={canvasContainerRef}
              className="relative rounded-xl p-1 touch-none"
              style={{
                backgroundImage: 'repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%)',
                backgroundSize: '12px 12px',
                transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                transition: touchGestureRef.current?.isGesture ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              <canvas
                ref={canvasRef}
                width={SKIN_WIDTH}
                height={SKIN_HEIGHT}
                className="cursor-crosshair touch-none"
                style={{
                  width: SKIN_WIDTH * zoomLevel,
                  height: SKIN_HEIGHT * zoomLevel,
                  imageRendering: 'pixelated',
                  transition: touchGestureRef.current?.isGesture ? 'none' : 'width 0.15s ease-out, height 0.15s ease-out',
                }}
                onMouseDown={(e) => { setIsDrawing(true); draw(e); }}
                onMouseUp={() => { setIsDrawing(false); saveState(); addRecentColor(selectedColor); }}
                onMouseLeave={() => { setIsDrawing(false); }}
                onMouseMove={draw}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
              />
              {(panOffset.x !== 0 || panOffset.y !== 0) && (
                <button
                  onClick={resetPanOffset}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold shadow-lg hover:bg-blue-600 transition-all z-10"
                  title="Reset pan position"
                >
                  ↺
                </button>
              )}
            </div>
          </div>

          <p className="text-center mt-2 text-gray-500 text-sm">
            🎨 Draw here! See your character on the left! ✨
            <span className="block text-xs mt-1 md:hidden text-gray-400">
              📱 Pinch to zoom • Two fingers to pan
            </span>
          </p>
        </div>

        {/* Right Panel - Colors */}
        <ColorPalette
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          secondaryColor={secondaryColor}
          setSecondaryColor={setSecondaryColor}
          recentColors={recentColors}
        />
      </div>

      {/* Floating Layer Panel */}
      <LayerPanel
        layers={layers}
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        toggleLayerVisibility={toggleLayerVisibility}
        setLayerOpacity={setLayerOpacity}
        setLayerTint={setLayerTint}
        setLayerTintIntensity={setLayerTintIntensity}
        setLayers={setLayers}
        moveLayer={moveLayer}
        clearLayer={clearLayer}
        copyLayerTo={copyLayerTo}
        flattenLayers={flattenLayers}
        compositeLayersToMain={compositeLayersToMain}
        updatePreview={updatePreview}
        playSound={playSound}
        showLayerPanel={showLayerPanel}
        setShowLayerPanel={setShowLayerPanel}
        showDuplicateMenu={showDuplicateMenu}
        setShowDuplicateMenu={setShowDuplicateMenu}
        customTintColors={customTintColors}
        setCustomTintColors={setCustomTintColors}
      />

      {/* Export Panel Modal */}
      <ExportPanel
        showExportPanel={showExportPanel}
        setShowExportPanel={setShowExportPanel}
        layers={layers}
        exportLayers={exportLayers}
        setExportLayers={setExportLayers}
        downloadSkin={downloadSkin}
        downloadBaseOnly={downloadBaseOnly}
        downloadForRoblox={downloadForRoblox}
      />

      {/* AI Generator Modal */}
      <AIGenerator
        showAIPanel={showAIPanel}
        setShowAIPanel={setShowAIPanel}
        aiPrompt={aiPrompt}
        setAiPrompt={setAiPrompt}
        aiStyle={aiStyle}
        setAiStyle={setAiStyle}
        aiLoading={aiLoading}
        aiError={aiError}
        setAiError={setAiError}
        useRealAI={useRealAI}
        setUseRealAI={setUseRealAI}
        enhancing={enhancing}
        enhancePrompt={enhancePrompt}
        generateAISkin={generateAISkin}
        aiHistory={aiHistory}
        showAIHistory={showAIHistory}
        setShowAIHistory={setShowAIHistory}
        loadFromHistory={loadFromHistory}
        regenerateFromHistory={regenerateFromHistory}
        toggleFavorite={toggleFavorite}
        deleteFromHistory={deleteFromHistory}
      />

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

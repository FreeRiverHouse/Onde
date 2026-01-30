'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Confetti on download!
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

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
};

// Legacy alias
const STEVE_TEMPLATE = TEMPLATES.steve;

// Fun color palette
const COLORS = [
  // Skin tones
  '#ffdfc4', '#f0c8a8', '#d4a76a', '#c4a57b', '#8d6e4c', '#5c4033',
  // Rainbow
  '#FF6B6B', '#FF8E53', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6',
  // More colors
  '#E91E63', '#00BCD4', '#8BC34A', '#FF5722', '#795548', '#607D8B',
  // Basics
  '#FFFFFF', '#CCCCCC', '#888888', '#444444', '#222222', '#000000',
];

const SKIN_WIDTH = 64;
const SKIN_HEIGHT = 64;
const DISPLAY_SCALE = 6;

export default function SkinCreator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'eraser' | 'fill' | 'gradient' | 'glow' | 'stamp'>('brush');
  const [stampShape, setStampShape] = useState<'star' | 'heart' | 'diamond'>('star');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoomLevel, setZoomLevel] = useState(6); // 6x default
  const [secondaryColor, setSecondaryColor] = useState('#4D96FF'); // For gradient
  const [brushSize, setBrushSize] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [particles, setParticles] = useState<Array<{id: number; x: number; y: number; color: string}>>([]);
  const particleIdRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const maxHistory = 50;

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
  const playSound = useCallback((type: 'draw' | 'click' | 'download') => {
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
        case 'g': setTool('gradient'); break;
        case 's': setTool('stamp'); break;
        case 'z': if (e.metaKey || e.ctrlKey) { e.preventDefault(); undo(); } break;
        case 'y': if (e.metaKey || e.ctrlKey) { e.preventDefault(); redo(); } break;
        case 'm': setMirrorMode(prev => !prev); break;
        case 'd': setDarkMode(prev => !prev); break;
        case '1': setBrushSize(1); break;
        case '2': setBrushSize(2); break;
        case '3': setBrushSize(3); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Auto-save to localStorage when canvas changes 💾
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);

    if (template === 'blank') {
      updatePreview();
      return;
    }

    const t = TEMPLATES[template] || TEMPLATES.steve;
    
    // Head - front face (8x8 at position 8,8)
    ctx.fillStyle = t.skin;
    ctx.fillRect(8, 8, 8, 8);
    // Eyes
    ctx.fillStyle = t.eyes;
    ctx.fillRect(9, 11, 2, 1);
    ctx.fillRect(13, 11, 2, 1);
    ctx.fillStyle = t.pupils;
    ctx.fillRect(10, 11, 1, 1);
    ctx.fillRect(13, 11, 1, 1);
    // Hair
    ctx.fillStyle = t.hair;
    ctx.fillRect(8, 8, 8, 1);
    ctx.fillRect(8, 8, 1, 2);
    ctx.fillRect(15, 8, 1, 2);
    // Mouth
    ctx.fillStyle = '#a87d5a';
    ctx.fillRect(11, 14, 2, 1);

    // Head sides
    ctx.fillStyle = t.skin;
    ctx.fillRect(0, 8, 8, 8); // right
    ctx.fillRect(16, 8, 8, 8); // left
    ctx.fillRect(24, 8, 8, 8); // back
    ctx.fillStyle = t.hair;
    ctx.fillRect(24, 8, 8, 1);
    
    // Head top/bottom
    ctx.fillStyle = t.hair;
    ctx.fillRect(8, 0, 8, 8); // top
    ctx.fillStyle = t.skin;
    ctx.fillRect(16, 0, 8, 8); // bottom

    // Body - front (8x12 at position 20,20)
    ctx.fillStyle = t.shirt;
    ctx.fillRect(20, 20, 8, 12);
    // Body sides, back
    ctx.fillRect(16, 20, 4, 12);
    ctx.fillRect(28, 20, 4, 12);
    ctx.fillRect(32, 20, 8, 12);

    // Arms
    ctx.fillStyle = t.skin;
    // Right arm
    ctx.fillRect(44, 20, 4, 12);
    ctx.fillRect(40, 20, 4, 12);
    ctx.fillRect(48, 20, 4, 12);
    ctx.fillRect(52, 20, 4, 12);
    // Left arm (mirrored position in new format)
    ctx.fillRect(36, 52, 4, 12);
    ctx.fillRect(32, 52, 4, 12);
    ctx.fillRect(40, 52, 4, 12);
    ctx.fillRect(44, 52, 4, 12);

    // Legs
    ctx.fillStyle = t.pants;
    // Right leg
    ctx.fillRect(4, 20, 4, 12);
    ctx.fillRect(0, 20, 4, 12);
    ctx.fillRect(8, 20, 4, 12);
    ctx.fillRect(12, 20, 4, 12);
    // Left leg
    ctx.fillRect(20, 52, 4, 12);
    ctx.fillRect(16, 52, 4, 12);
    ctx.fillRect(24, 52, 4, 12);
    ctx.fillRect(28, 52, 4, 12);

    // Shoes
    ctx.fillStyle = t.shoes;
    ctx.fillRect(4, 31, 4, 1);
    ctx.fillRect(20, 63, 4, 1);

    updatePreview();
  }, []);

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

  useEffect(() => {
    loadTemplate('steve');
  }, [loadTemplate]);

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type === 'mousemove') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Spawn sparkle particle! ✨
    if (isDrawing && Math.random() > 0.7) {
      spawnParticle(e.clientX, e.clientY);
      playSound('draw'); // 🔊 Bloop!
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = SKIN_WIDTH / rect.width;
    const scaleY = SKIN_HEIGHT / rect.height;
    
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x < 0 || x >= SKIN_WIDTH || y < 0 || y >= SKIN_HEIGHT) return;

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
            star: [[1,0],[0,1],[1,1],[2,1],[1,2]], // 3x3 star
            heart: [[0,1],[2,1],[0,0],[1,1],[2,0]], // 3x3 heart-ish
            diamond: [[1,0],[0,1],[2,1],[1,2]], // 3x3 diamond
          };
          const pattern = patterns[stampShape] || patterns.star;
          pattern.forEach(([dx, dy]) => {
            ctx.fillRect(x + dx, y + dy, 1, 1);
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

    updatePreview();
  };

  const downloadSkin = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'my-minecraft-skin.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    // 🎉 Confetti celebration!
    setShowConfetti(true);
    playSound('download'); // 🔊 Celebration jingle!
    setTimeout(() => setShowConfetti(false), 3000);
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
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl animate-float">
          🎨 Minecraft Skin Creator
        </h1>
        <p className="text-lg text-white/90 mt-1">
          Design your character! ✨
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl">
        {/* Left Panel - Preview */}
        <div className="glass-card rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
            <span className="animate-bounce-soft">👀</span> Preview
          </h2>
          <canvas
            ref={previewRef}
            width={200}
            height={280}
            className="rounded-xl mx-auto"
            style={{ imageRendering: 'pixelated' }}
          />
          
          {/* Templates */}
          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Start from:</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {Object.entries(TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => loadTemplate(key as keyof typeof TEMPLATES)}
                  className="px-2 py-1 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 hover:scale-105 transition-all"
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
                onClick={generateRandomSkin}
                className="px-2 py-1 bg-gradient-to-r from-pink-500 to-yellow-500 text-white rounded-lg text-xs font-bold hover:scale-105 transition-transform animate-pulse"
              >
                🎲 Random!
              </button>
            </div>
          </div>
        </div>

        {/* Center - Canvas Editor */}
        <div className="flex-1 glass-card rounded-3xl p-6 shadow-2xl">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            <button
              onClick={() => setTool('brush')}
              title="Brush tool (B)"
              className={`px-3 py-2 rounded-full font-bold transition-all ${
                tool === 'brush' ? 'bg-blue-500 text-white scale-105' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              🖌️ Brush
            </button>
            <button
              onClick={() => setTool('eraser')}
              title="Eraser tool (E)"
              className={`px-3 py-2 rounded-full font-bold transition-all ${
                tool === 'eraser' ? 'bg-pink-500 text-white scale-105' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              🧽 Eraser
            </button>
            <button
              onClick={() => setTool('fill')}
              title="Fill tool (F)"
              className={`px-3 py-2 rounded-full font-bold transition-all ${
                tool === 'fill' ? 'bg-yellow-500 text-white scale-105' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              🪣 Fill
            </button>
            <button
              onClick={() => setTool('gradient')}
              title="Gradient fill (G)"
              className={`px-3 py-2 rounded-full font-bold transition-all ${
                tool === 'gradient' ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white scale-105' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              🌈 Gradient
            </button>
            <button
              onClick={() => setTool('glow')}
              title="Glow brush (W)"
              className={`px-3 py-2 rounded-full font-bold transition-all ${
                tool === 'glow' ? 'bg-purple-600 text-white scale-105 shadow-lg shadow-purple-500/50' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              ✨ Glow
            </button>
            <div className="relative group">
              <button
                onClick={() => setTool('stamp')}
                className={`px-3 py-2 rounded-full font-bold transition-all ${
                  tool === 'stamp' ? 'bg-pink-500 text-white scale-105' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {stampShape === 'star' ? '⭐' : stampShape === 'heart' ? '❤️' : '💎'} Stamp
              </button>
              {tool === 'stamp' && (
                <div className="absolute top-full left-0 mt-1 flex gap-1 bg-white rounded-lg p-1 shadow-lg z-10">
                  <button onClick={() => setStampShape('star')} className={`p-1 rounded ${stampShape === 'star' ? 'bg-pink-200' : ''}`}>⭐</button>
                  <button onClick={() => setStampShape('heart')} className={`p-1 rounded ${stampShape === 'heart' ? 'bg-pink-200' : ''}`}>❤️</button>
                  <button onClick={() => setStampShape('diamond')} className={`p-1 rounded ${stampShape === 'diamond' ? 'bg-pink-200' : ''}`}>💎</button>
                </div>
              )}
            </div>
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`px-3 py-2 rounded-full font-bold transition-all ${
                historyIndex <= 0 ? 'bg-gray-300 text-gray-500' : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              ↩️ Undo
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`px-3 py-2 rounded-full font-bold transition-all ${
                historyIndex >= history.length - 1 ? 'bg-gray-300 text-gray-500' : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              ↪️ Redo
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
            >
              📥 Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png"
              onChange={importSkin}
              className="hidden"
            />
            <button
              onClick={downloadSkin}
              className="px-3 py-2 rounded-full font-bold bg-green-500 text-white hover:bg-green-600 animate-pulse"
            >
              💾 Download
            </button>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => setZoomLevel(Math.max(4, zoomLevel - 1))}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold"
              >
                −
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

          {/* Canvas */}
          <div className="flex justify-center">
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
                onMouseUp={() => { setIsDrawing(false); saveState(); }}
                onMouseLeave={() => { setIsDrawing(false); }}
                onMouseMove={draw}
              />
            </div>
          </div>

          <p className="text-center mt-2 text-gray-500 text-sm">
            This is the skin texture map - see preview on left!
          </p>
        </div>

        {/* Right Panel - Colors */}
        <div className="glass-card rounded-3xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">🎨 Colors</h2>
          
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
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full h-10 rounded cursor-pointer"
            />
            <p className="text-xs text-gray-500 text-center mt-1">Primary color</p>
          </div>
          <div className="mt-2">
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
            <p className="text-xs text-gray-500 text-center mt-1">Gradient end</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-4 text-white/70 text-sm">
        Made with 💖 by Onde • Works with Minecraft Java & Bedrock!
      </p>
    </div>
  );
}

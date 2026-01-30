'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

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

// Steve skin base colors (simplified)
const STEVE_TEMPLATE = {
  skin: '#c4a57b',
  hair: '#442920',
  shirt: '#00a8a8',
  pants: '#3c2a5e',
  shoes: '#444444',
  eyes: '#ffffff',
  pupils: '#5a3825',
};

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
  const [tool, setTool] = useState<'brush' | 'eraser' | 'fill'>('brush');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [symmetry, setSymmetry] = useState(true);
  const [brushSize, setBrushSize] = useState(1);

  // Initialize with Steve template
  const loadTemplate = useCallback((template: 'steve' | 'alex' | 'blank') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);

    if (template === 'blank') {
      updatePreview();
      return;
    }

    const t = STEVE_TEMPLATE;
    
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
        } else {
          ctx.fillStyle = selectedColor;
          ctx.fillRect(px, py, 1, 1);
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
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center bg-gradient-to-br from-emerald-500 via-cyan-500 to-purple-600">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
          🎨 Minecraft Skin Creator
        </h1>
        <p className="text-lg text-white/90 mt-1">
          Design your character! ✨
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 w-full max-w-6xl">
        {/* Left Panel - Preview */}
        <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-3 text-center">👀 Preview</h2>
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
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => loadTemplate('steve')}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600"
              >
                👦 Steve
              </button>
              <button
                onClick={() => loadTemplate('blank')}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg text-sm font-bold hover:bg-gray-600"
              >
                ⬜ Blank
              </button>
            </div>
          </div>
        </div>

        {/* Center - Canvas Editor */}
        <div className="flex-1 bg-white/90 backdrop-blur rounded-2xl p-4 shadow-xl">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 mb-3 justify-center">
            <button
              onClick={() => setTool('brush')}
              className={`px-3 py-2 rounded-full font-bold transition-all ${
                tool === 'brush' ? 'bg-blue-500 text-white scale-105' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              🖌️ Brush
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`px-3 py-2 rounded-full font-bold transition-all ${
                tool === 'eraser' ? 'bg-pink-500 text-white scale-105' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              🧽 Eraser
            </button>
            <button
              onClick={() => setTool('fill')}
              className={`px-3 py-2 rounded-full font-bold transition-all ${
                tool === 'fill' ? 'bg-yellow-500 text-white scale-105' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              🪣 Fill
            </button>
            <button
              onClick={downloadSkin}
              className="px-3 py-2 rounded-full font-bold bg-green-500 text-white hover:bg-green-600"
            >
              💾 Download
            </button>
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
                  width: SKIN_WIDTH * DISPLAY_SCALE, 
                  height: SKIN_HEIGHT * DISPLAY_SCALE,
                  imageRendering: 'pixelated',
                }}
                onMouseDown={(e) => { setIsDrawing(true); draw(e); }}
                onMouseUp={() => setIsDrawing(false)}
                onMouseLeave={() => setIsDrawing(false)}
                onMouseMove={draw}
              />
            </div>
          </div>

          <p className="text-center mt-2 text-gray-500 text-sm">
            This is the skin texture map - see preview on left!
          </p>
        </div>

        {/* Right Panel - Colors */}
        <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-3 text-center">🎨 Colors</h2>
          
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
            <p className="text-xs text-gray-500 text-center mt-1">Pick any color!</p>
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

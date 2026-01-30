'use client';

import { useState, useRef, useEffect } from 'react';

// Minecraft skin is 64x64 pixels
const SKIN_WIDTH = 64;
const SKIN_HEIGHT = 64;
const PIXEL_SIZE = 8; // Display size per pixel

// Fun color palette for kids
const COLORS = [
  '#FF6B6B', '#FF8E53', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6',
  '#E91E63', '#00BCD4', '#8BC34A', '#FF5722', '#795548', '#607D8B',
  '#FFFFFF', '#CCCCCC', '#888888', '#444444', '#222222', '#000000',
  '#FFB6C1', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8B500',
];

export default function SkinCreator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with transparent (skin template)
    ctx.fillStyle = '#00000000';
    ctx.fillRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
    
    // Draw a simple template outline
    ctx.fillStyle = '#FFCC99'; // Skin color
    // Head (front)
    ctx.fillRect(8, 8, 8, 8);
    // Body (front)
    ctx.fillRect(20, 20, 8, 12);
    // Arms
    ctx.fillRect(44, 20, 4, 12);
    ctx.fillRect(36, 52, 4, 12);
    // Legs
    ctx.fillRect(4, 20, 4, 12);
    ctx.fillRect(20, 52, 4, 12);
  }, []);

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = SKIN_WIDTH / rect.width;
    const scaleY = SKIN_HEIGHT / rect.height;
    
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x >= 0 && x < SKIN_WIDTH && y >= 0 && y < SKIN_HEIGHT) {
      if (tool === 'eraser') {
        ctx.clearRect(x, y, 1, 1);
      } else {
        ctx.fillStyle = selectedColor;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  };

  const downloadSkin = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'my-minecraft-skin.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, SKIN_WIDTH, SKIN_HEIGHT);
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg animate-bounce-soft">
          🎨 Skin Creator
        </h1>
        <p className="text-xl text-white/90 mt-2">
          Create your own Minecraft skin! ✨
        </p>
      </div>

      {/* Main Editor */}
      <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-2xl max-w-2xl w-full">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 mb-4 justify-center">
          <button
            onClick={() => setTool('brush')}
            className={`px-4 py-2 rounded-full font-bold text-lg transition-all ${
              tool === 'brush'
                ? 'bg-blue-500 text-white scale-110'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🖌️ Brush
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`px-4 py-2 rounded-full font-bold text-lg transition-all ${
              tool === 'eraser'
                ? 'bg-pink-500 text-white scale-110'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🧽 Eraser
          </button>
          <button
            onClick={clearCanvas}
            className="px-4 py-2 rounded-full font-bold text-lg bg-red-400 text-white hover:bg-red-500 transition-all"
          >
            🗑️ Clear
          </button>
          <button
            onClick={downloadSkin}
            className="px-4 py-2 rounded-full font-bold text-lg bg-green-500 text-white hover:bg-green-600 transition-all"
          >
            💾 Download
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center p-3 bg-gray-100 rounded-2xl">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-10 h-10 rounded-full color-btn shadow-md ${
                selectedColor === color ? 'ring-4 ring-blue-400 scale-125' : ''
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Canvas */}
        <div className="flex justify-center">
          <div className="relative bg-gray-200 rounded-xl p-2" style={{ 
            backgroundImage: 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%)',
            backgroundSize: '16px 16px'
          }}>
            <canvas
              ref={canvasRef}
              width={SKIN_WIDTH}
              height={SKIN_HEIGHT}
              className="pixel-grid cursor-crosshair"
              style={{ 
                width: SKIN_WIDTH * PIXEL_SIZE, 
                height: SKIN_HEIGHT * PIXEL_SIZE,
              }}
              onMouseDown={() => setIsDrawing(true)}
              onMouseUp={() => setIsDrawing(false)}
              onMouseLeave={() => setIsDrawing(false)}
              onMouseMove={draw}
              onClick={draw}
            />
          </div>
        </div>

        {/* Help text */}
        <p className="text-center mt-4 text-gray-600">
          Click and drag to draw! Download when you&apos;re done 🚀
        </p>
      </div>

      {/* Footer */}
      <p className="mt-6 text-white/70 text-sm">
        Made with 💖 by Onde
      </p>
    </div>
  );
}

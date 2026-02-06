'use client';

import React from 'react';
import type { ToolType, SoundType } from './types';

const SKIN_WIDTH = 64;
const SKIN_HEIGHT = 64;

const BODY_PARTS: Record<string, { x: number; y: number; w: number; h: number; label: string }> = {
  head: { x: 0, y: 0, w: 32, h: 16, label: '🗣️ Head' },
  body: { x: 16, y: 16, w: 24, h: 16, label: '👕 Body' },
  rightArm: { x: 40, y: 16, w: 16, h: 16, label: '💪 Right Arm' },
  leftArm: { x: 32, y: 48, w: 16, h: 16, label: '🤛 Left Arm' },
  rightLeg: { x: 0, y: 16, w: 16, h: 16, label: '🦵 Right Leg' },
  leftLeg: { x: 16, y: 48, w: 16, h: 16, label: '🦿 Left Leg' },
};

interface CanvasEditorProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  zoomLevel: number;
  setZoomLevel: (v: number) => void;
  showGrid: boolean;
  setShowGrid: (v: boolean) => void;
  brushSize: number;
  setBrushSize: (v: number) => void;
  selectedPart: string | null;
  setSelectedPart: (v: string | null) => void;
  tool: ToolType;
  setTool: (tool: ToolType) => void;
  contextMenu: { x: number; y: number } | null;
  setContextMenu: (v: { x: number; y: number } | null) => void;
  helpTipDismissed: Record<string, boolean>;
  dismissTip: (tip: string) => void;
  // Drawing handlers
  isDrawing: boolean;
  setIsDrawing: (v: boolean) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  drawTouch: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  saveState: () => void;
  addRecentColor: (color: string) => void;
  selectedColor: string;
  lastPinchDistance: React.MutableRefObject<number | null>;
  // Actions
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
  playSound: (type: SoundType) => void;
}

export default function CanvasEditor({
  canvasRef, zoomLevel, setZoomLevel, showGrid, setShowGrid,
  brushSize, setBrushSize, selectedPart, setSelectedPart,
  tool, setTool,
  contextMenu, setContextMenu,
  helpTipDismissed, dismissTip,
  isDrawing, setIsDrawing, draw, drawTouch,
  saveState, addRecentColor, selectedColor,
  lastPinchDistance,
  undo, redo, clearCanvas, playSound,
}: CanvasEditorProps) {
  return (
    <>
      {/* Brush Size */}
      <div className="hidden md:flex items-center justify-center gap-2 mb-3">
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
      <div className="hidden md:flex flex-wrap gap-1 mb-3 justify-center">
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
        <div className="hidden md:flex items-center gap-2 bg-white/80 rounded-full px-3 py-1.5 shadow">
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
                  const dx = e.touches[0].clientX - e.touches[1].clientX;
                  const dy = e.touches[0].clientY - e.touches[1].clientY;
                  const newDistance = Math.sqrt(dx * dx + dy * dy);
                  const delta = newDistance - lastPinchDistance.current;
                  if (Math.abs(delta) > 10) {
                    setZoomLevel(Math.min(12, Math.max(2, zoomLevel + (delta > 0 ? 1 : -1))));
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
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2" onClick={() => { setTool('eyedropper'); setContextMenu(null); }}>🎨 Pick Color</button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2" onClick={() => { setTool('fill'); setContextMenu(null); }}>🪣 Fill Area</button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2" onClick={() => { setTool('eraser'); setContextMenu(null); }}>🧹 Eraser</button>
                <hr className="my-1" />
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2" onClick={() => { undo(); setContextMenu(null); }}>↩️ Undo</button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2" onClick={() => { redo(); setContextMenu(null); }}>↪️ Redo</button>
                <hr className="my-1" />
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2" onClick={() => { clearCanvas(); setContextMenu(null); }}>🗑️ Clear All</button>
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
    </>
  );
}

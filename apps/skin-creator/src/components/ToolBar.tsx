'use client';

import React from 'react';
import { ToolType, StampShape, BODY_PARTS } from './types';

interface ToolBarProps {
  tool: ToolType;
  selectTool: (tool: ToolType) => void;
  stampShape: StampShape;
  setStampShape: (shape: StampShape) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  selectedPart: string | null;
  setSelectedPart: (part: string | null) => void;
  mirrorMode: boolean;
  setMirrorMode: (v: boolean) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  skinName: string;
  setSkinName: (name: string) => void;
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
  panOffset: { x: number; y: number };
  resetPanOffset: () => void;
  historyIndex: number;
  historyLength: number;
  undo: () => void;
  redo: () => void;
  downloadSkin: (useSelectedLayers: boolean) => void;
  setShowExportPanel: (show: boolean) => void;
  copyToClipboard: () => void;
  clearCanvas: () => void;
  importSkin: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  playSound: (type: 'draw' | 'click' | 'download' | 'undo' | 'redo' | 'error' | 'success' | 'save') => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function ToolBar({
  tool,
  selectTool,
  stampShape,
  setStampShape,
  brushSize,
  setBrushSize,
  selectedPart,
  setSelectedPart,
  mirrorMode,
  setMirrorMode,
  darkMode,
  setDarkMode,
  skinName,
  setSkinName,
  zoomLevel,
  setZoomLevel,
  panOffset,
  resetPanOffset,
  historyIndex,
  historyLength,
  undo,
  redo,
  downloadSkin,
  setShowExportPanel,
  copyToClipboard,
  clearCanvas,
  importSkin,
  fileInputRef,
  playSound,
  mobileMenuOpen,
  setMobileMenuOpen,
}: ToolBarProps) {
  return (
    <>
      {/* 📱 Mobile Hamburger Menu Button */}
      <div className="md:hidden flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-gray-700">
          🛠️ {tool.charAt(0).toUpperCase() + tool.slice(1)}
        </span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-2 rounded-xl transition-all ${
            mobileMenuOpen
              ? 'bg-purple-500 text-white shadow-lg'
              : 'bg-white/80 text-gray-700 hover:bg-white'
          }`}
          aria-label="Toggle tools menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Toolbar - Collapsible on mobile */}
      <div className={`${
        mobileMenuOpen ? 'block' : 'hidden'
      } md:block transition-all duration-300 ease-in-out`}>
        <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4 justify-center">
          <button
            onClick={() => selectTool('brush')}
            title="🖌️ Draw! Click and drag to color"
            aria-label="Brush tool"
            aria-pressed={tool === 'brush'}
            className={`px-3 py-2.5 md:px-3 md:py-2 min-w-[44px] min-h-[44px] rounded-lg md:rounded-full text-sm font-bold transition-all ${
              tool === 'brush' ? 'bg-blue-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white text-gray-800'
            }`}
          >
            🖌️
          </button>
          <button
            onClick={() => selectTool('eraser')}
            title="🧽 Erase! Remove colors"
            aria-label="Eraser tool"
            aria-pressed={tool === 'eraser'}
            className={`px-3 py-2.5 md:px-3 md:py-2 min-w-[44px] min-h-[44px] rounded-lg md:rounded-full text-sm font-bold transition-all ${
              tool === 'eraser' ? 'bg-pink-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white text-gray-800'
            }`}
          >
            🧽
          </button>
          <button
            onClick={() => selectTool('fill')}
            title="🪣 Fill! Color a whole area"
            aria-label="Fill tool"
            aria-pressed={tool === 'fill'}
            className={`px-3 py-2.5 md:px-3 md:py-2 min-w-[44px] min-h-[44px] rounded-lg md:rounded-full text-sm font-bold transition-all ${
              tool === 'fill' ? 'bg-yellow-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white text-gray-800'
            }`}
          >
            🪣
          </button>
          <button
            onClick={() => selectTool('gradient')}
            title="🌈 Rainbow! Blend two colors"
            aria-label="Gradient tool"
            aria-pressed={tool === 'gradient'}
            className={`px-3 py-2.5 md:px-3 md:py-2 min-w-[44px] min-h-[44px] rounded-lg md:rounded-full text-sm font-bold transition-all ${
              tool === 'gradient' ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white text-gray-800'
            }`}
          >
            🌈
          </button>
          <button
            onClick={() => selectTool('glow')}
            title="✨ Glow! Make it sparkle"
            aria-label="Glow tool"
            aria-pressed={tool === 'glow'}
            className={`px-3 py-2.5 md:px-3 md:py-2 min-w-[44px] min-h-[44px] rounded-lg md:rounded-full text-sm font-bold transition-all ${
              tool === 'glow' ? 'bg-purple-600 text-white scale-105 shadow-lg shadow-purple-500/50' : 'bg-white/80 hover:bg-white text-gray-800'
            }`}
          >
            ✨
          </button>
          <div className="relative group">
            <button
              onClick={() => selectTool('stamp')}
              aria-label="Stamp tool"
              aria-pressed={tool === 'stamp'}
              className={`px-3 py-2.5 min-w-[44px] min-h-[44px] rounded-full font-bold transition-all ${
                tool === 'stamp' ? 'bg-pink-500 text-white scale-105' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {stampShape === 'star' ? '⭐' : stampShape === 'heart' ? '❤️' : stampShape === 'diamond' ? '💎' : stampShape === 'smiley' ? '😊' : stampShape === 'fire' ? '🔥' : '⚡'} Stamp
            </button>
            {tool === 'stamp' && (
              <div className="absolute top-full left-0 mt-1 flex gap-1 bg-white rounded-lg p-2 shadow-lg z-10" role="group" aria-label="Stamp shapes">
                <button onClick={() => setStampShape('star')} aria-label="Star stamp" className={`p-2 min-w-[40px] min-h-[40px] rounded ${stampShape === 'star' ? 'bg-pink-200' : 'hover:bg-gray-100'}`}>⭐</button>
                <button onClick={() => setStampShape('heart')} aria-label="Heart stamp" className={`p-2 min-w-[40px] min-h-[40px] rounded ${stampShape === 'heart' ? 'bg-pink-200' : 'hover:bg-gray-100'}`}>❤️</button>
                <button onClick={() => setStampShape('diamond')} aria-label="Diamond stamp" className={`p-2 min-w-[40px] min-h-[40px] rounded ${stampShape === 'diamond' ? 'bg-pink-200' : 'hover:bg-gray-100'}`}>💎</button>
                <button onClick={() => setStampShape('smiley')} aria-label="Smiley stamp" className={`p-2 min-w-[40px] min-h-[40px] rounded ${stampShape === 'smiley' ? 'bg-pink-200' : 'hover:bg-gray-100'}`}>😊</button>
                <button onClick={() => setStampShape('fire')} aria-label="Fire stamp" className={`p-2 min-w-[40px] min-h-[40px] rounded ${stampShape === 'fire' ? 'bg-pink-200' : 'hover:bg-gray-100'}`}>🔥</button>
                <button onClick={() => setStampShape('lightning')} aria-label="Lightning stamp" className={`p-2 min-w-[40px] min-h-[40px] rounded ${stampShape === 'lightning' ? 'bg-pink-200' : 'hover:bg-gray-100'}`}>⚡</button>
              </div>
            )}
          </div>
          <button
            onClick={() => selectTool('eyedropper')}
            title="🎯 Pick a color from your drawing!"
            aria-label="Eyedropper tool"
            aria-pressed={tool === 'eyedropper'}
            className={`px-3 py-2.5 md:px-3 md:py-2 min-w-[44px] min-h-[44px] rounded-lg md:rounded-full text-sm font-bold transition-all ${
              tool === 'eyedropper' ? 'bg-amber-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white text-gray-800'
            }`}
          >
            🎯
          </button>
          <button
            onClick={() => { undo(); playSound('undo'); }}
            disabled={historyIndex <= 0}
            aria-label={`Undo, ${historyIndex} steps available`}
            className={`px-3 py-2.5 min-h-[44px] rounded-full font-bold transition-all relative ${
              historyIndex <= 0 ? 'bg-gray-300 text-gray-600' : 'bg-orange-500 text-white hover:bg-orange-600'
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
            disabled={historyIndex >= historyLength - 1}
            aria-label={`Redo, ${historyLength - 1 - historyIndex} steps available`}
            className={`px-3 py-2.5 min-h-[44px] rounded-full font-bold transition-all relative ${
              historyIndex >= historyLength - 1 ? 'bg-gray-300 text-gray-600' : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
            title={`Redo (${historyLength - 1 - historyIndex} steps available)`}
          >
            ↪️ Redo
            {historyIndex < historyLength - 1 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {historyLength - 1 - historyIndex}
              </span>
            )}
          </button>
          <button
            onClick={() => setMirrorMode(!mirrorMode)}
            aria-label="Toggle mirror mode"
            aria-pressed={mirrorMode}
            className={`px-3 py-2.5 min-h-[44px] rounded-full font-bold transition-all ${
              mirrorMode ? 'bg-purple-500 text-white scale-105' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            🪞 Mirror
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`px-3 py-2.5 min-h-[44px] rounded-full font-bold transition-all ${
              darkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-white'
            }`}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="Import skin image"
            className="px-3 py-2.5 min-h-[44px] rounded-full font-bold bg-indigo-500 text-white hover:bg-indigo-600"
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
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={skinName}
              onChange={(e) => setSkinName(e.target.value)}
              placeholder="skin-name"
              aria-label="Skin name"
              className="w-24 px-2 py-2 text-sm rounded-lg border-2 border-gray-300 focus:border-green-500 outline-none min-h-[44px]"
            />
            <button
              onClick={() => downloadSkin(false)}
              aria-label="Save skin"
              className="px-3 py-2.5 min-w-[44px] min-h-[44px] rounded-full font-bold bg-green-500 text-white hover:bg-green-600 animate-pulse"
              title="💾 Save your skin!"
            >
              💾
            </button>
            <button
              onClick={() => setShowExportPanel(true)}
              aria-label="Export options"
              className="px-3 py-2.5 min-w-[44px] min-h-[44px] rounded-full font-bold bg-green-600 text-white hover:bg-green-700"
              title="Export options (choose layers)"
            >
              📤
            </button>
          </div>
          <button
            onClick={copyToClipboard}
            aria-label="Copy skin to clipboard"
            className="px-3 py-2.5 min-h-[44px] rounded-full font-bold bg-violet-500 text-white hover:bg-violet-600"
            title="Copy to clipboard"
          >
            📋 Copy
          </button>
          <button
            onClick={clearCanvas}
            aria-label="Clear canvas"
            className="px-3 py-2.5 min-h-[44px] rounded-full font-bold bg-red-500 text-white hover:bg-red-600"
            title="🗑️ Start over!"
          >
            🗑️ Clear
          </button>
          <div className="flex items-center gap-1.5 ml-2" role="group" aria-label="Zoom controls">
            <button
              onClick={() => setZoomLevel(Math.max(2, zoomLevel - 1))}
              aria-label={`Zoom out, currently ${zoomLevel}x`}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-gray-200 hover:bg-gray-300 font-bold text-gray-800"
              title="Zoom out (min 2x)"
            >
              −
            </button>
            <span className="text-sm font-bold w-8 text-center text-gray-800" aria-live="polite">{zoomLevel}x</span>
            <button
              onClick={() => setZoomLevel(Math.min(12, zoomLevel + 1))}
              aria-label={`Zoom in, currently ${zoomLevel}x`}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-gray-200 hover:bg-gray-300 font-bold text-gray-800"
              title="Zoom in (max 12x)"
            >
              +
            </button>
            {(panOffset.x !== 0 || panOffset.y !== 0) && (
              <button
                onClick={resetPanOffset}
                aria-label="Reset pan position"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-blue-500 text-white hover:bg-blue-600 font-bold ml-1"
                title="Reset pan position"
              >
                ↺
              </button>
            )}
          </div>
        </div>

        {/* Brush Size */}
        <div className="flex items-center justify-center gap-2 mb-3" role="group" aria-label="Brush size">
          <span className="text-sm font-semibold text-gray-800">Brush:</span>
          {[1, 2, 3].map((size) => (
            <button
              key={size}
              onClick={() => setBrushSize(size)}
              aria-label={`Brush size ${size}`}
              aria-pressed={brushSize === size}
              className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full font-bold ${
                brushSize === size ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Body Part Selector */}
        <div className="flex flex-wrap gap-1.5 mb-3 justify-center" role="group" aria-label="Body part selector">
          <button
            onClick={() => setSelectedPart(null)}
            aria-label="Select all body parts"
            aria-pressed={!selectedPart}
            className={`px-3 py-2 min-h-[44px] rounded text-sm font-bold ${
              !selectedPart ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            🎯 All
          </button>
          {Object.entries(BODY_PARTS).map(([key, part]) => (
            <button
              key={key}
              onClick={() => setSelectedPart(key)}
              aria-label={`Select ${part.label}`}
              aria-pressed={selectedPart === key}
              className={`px-3 py-2 min-h-[44px] rounded text-sm font-bold ${
                selectedPart === key ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              {part.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

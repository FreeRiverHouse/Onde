'use client';

import type { ToolType, StampShape, SoundType } from './types';

interface ToolbarProps {
  tool: ToolType;
  setTool: (tool: ToolType) => void;
  stampShape: StampShape;
  setStampShape: (shape: StampShape) => void;
  historyIndex: number;
  historyLength: number;
  undo: () => void;
  redo: () => void;
  mirrorMode: boolean;
  setMirrorMode: (v: boolean) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  importSkin: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setShowURLImport: (v: boolean) => void;
  skinName: string;
  setSkinName: (v: string) => void;
  downloadSkin: (useSelectedLayers: boolean) => void;
  setShowExportPanel: (v: boolean) => void;
  copyToClipboard: () => void;
  clearCanvas: () => void;
  zoomLevel: number;
  setZoomLevel: (v: number) => void;
  playSound: (type: SoundType) => void;
}

export default function Toolbar({
  tool, setTool, stampShape, setStampShape,
  historyIndex, historyLength, undo, redo,
  mirrorMode, setMirrorMode, darkMode, setDarkMode,
  fileInputRef, importSkin, setShowURLImport,
  skinName, setSkinName, downloadSkin, setShowExportPanel,
  copyToClipboard, clearCanvas, zoomLevel, setZoomLevel,
  playSound,
}: ToolbarProps) {
  return (
    <div className="hidden md:flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4 justify-center">
      {/* Core tools */}
      <button
        onClick={() => setTool('brush')}
        title="🖌️ Draw! Click and drag to color"
        className={`px-3 py-2 md:px-3 md:py-2 rounded-xl md:rounded-full text-sm md:text-sm font-bold transition-all ${
          tool === 'brush' ? 'bg-blue-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white'
        }`}
      >
        🖌️
      </button>
      <button
        onClick={() => setTool('eraser')}
        title="🧽 Erase! Remove colors"
        className={`px-3 py-2 md:px-3 md:py-2 rounded-xl md:rounded-full text-sm md:text-sm font-bold transition-all ${
          tool === 'eraser' ? 'bg-pink-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white'
        }`}
      >
        🧽
      </button>
      <button
        onClick={() => setTool('fill')}
        title="🪣 Fill! Color a whole area"
        className={`px-3 py-2 md:px-3 md:py-2 rounded-xl md:rounded-full text-sm md:text-sm font-bold transition-all ${
          tool === 'fill' ? 'bg-yellow-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white'
        }`}
      >
        🪣
      </button>
      {/* Advanced tools */}
      <button
        onClick={() => setTool('gradient')}
        title="🌈 Rainbow! Blend two colors"
        className={`hidden md:block px-2 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-full text-xs md:text-sm font-bold transition-all ${
          tool === 'gradient' ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white scale-105 shadow-lg' : 'bg-white/80 hover:bg-white'
        }`}
      >
        🌈
      </button>
      <button
        onClick={() => setTool('glow')}
        title="✨ Glow! Make it sparkle"
        className={`hidden md:block px-2 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-full text-xs md:text-sm font-bold transition-all ${
          tool === 'glow' ? 'bg-purple-600 text-white scale-105 shadow-lg shadow-purple-500/50' : 'bg-white/80 hover:bg-white'
        }`}
      >
        ✨
      </button>
      <div className="relative group hidden md:block">
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
        className={`px-3 py-2 md:px-3 md:py-2 rounded-xl md:rounded-full text-sm md:text-sm font-bold transition-all ${
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
        disabled={historyIndex >= historyLength - 1}
        className={`px-3 py-2 rounded-full font-bold transition-all relative ${
          historyIndex >= historyLength - 1 ? 'bg-gray-300 text-gray-500' : 'bg-orange-500 text-white hover:bg-orange-600'
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
  );
}

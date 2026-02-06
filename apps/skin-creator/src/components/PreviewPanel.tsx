'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { TEMPLATES, Layer, LayerType, SavedSkin, SKIN_WIDTH, SKIN_HEIGHT } from './types';

const SkinPreview3D = dynamic(() => import('./SkinPreview3D'), { ssr: false });

interface PreviewPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  previewRef: React.RefObject<HTMLCanvasElement | null>;
  show3D: boolean;
  setShow3D: (show: boolean) => void;
  loadTemplate: (template: keyof typeof TEMPLATES | 'blank') => void;
  generateRandomSkin: () => void;
  isWiggling: boolean;
  setIsWiggling: (w: boolean) => void;
  showConfetti: boolean;
  setShowConfetti: (show: boolean) => void;
  playSound: (type: 'draw' | 'click' | 'download' | 'undo' | 'redo' | 'error' | 'success' | 'save') => void;
  // Layer tint randomization
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  activeLayer: LayerType;
  layerCanvasRefs: React.MutableRefObject<{ [key in LayerType]?: HTMLCanvasElement }>;
  compositeLayersToMain: () => void;
  updatePreview: () => void;
  // Save/Load
  saveSkin: () => void;
  savedSkins: SavedSkin[];
  showMySkins: boolean;
  setShowMySkins: (show: boolean) => void;
  loadSavedSkin: (skin: SavedSkin) => void;
  deleteSavedSkin: (id: string) => void;
  // Share
  shareSkin: () => void;
  shareUrl: string | null;
  setShareUrl: (url: string | null) => void;
}

export default function PreviewPanel({
  canvasRef,
  previewRef,
  show3D,
  setShow3D,
  loadTemplate,
  generateRandomSkin,
  isWiggling,
  setIsWiggling,
  showConfetti,
  setShowConfetti,
  playSound,
  setLayers,
  activeLayer,
  layerCanvasRefs,
  compositeLayersToMain,
  updatePreview,
  saveSkin,
  savedSkins,
  showMySkins,
  setShowMySkins,
  loadSavedSkin,
  deleteSavedSkin,
  shareSkin,
  shareUrl,
  setShareUrl,
}: PreviewPanelProps) {
  return (
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
                if (key === 'creeper') {
                  setShowConfetti(true);
                  playSound('download');
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
              const canvas = layerCanvasRefs.current[activeLayer];
              if (!canvas) return;
              const ctx = canvas.getContext('2d');
              if (!ctx) return;
              for (let x = 0; x < SKIN_WIDTH; x++) {
                for (let y = 0; y < SKIN_HEIGHT; y++) {
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
              const palettes = [
                { name: 'Cyberpunk', base: '#0ff', accent: '#f0f', dark: '#0a0a2e' },
                { name: 'Forest', base: '#228B22', accent: '#8B4513', dark: '#1a3a1a' },
                { name: 'Ice', base: '#87CEEB', accent: '#E0FFFF', dark: '#1a2a3a' },
                { name: 'Fire', base: '#FF4500', accent: '#FFD700', dark: '#2a1a0a' },
                { name: 'Void', base: '#4B0082', accent: '#8B008B', dark: '#0a0a1a' },
                { name: 'Ocean', base: '#006994', accent: '#40E0D0', dark: '#0a1a2a' },
                { name: 'Golden', base: '#FFD700', accent: '#DAA520', dark: '#2a2a1a' },
                { name: 'Neon', base: '#39FF14', accent: '#FF1493', dark: '#0a0a0a' },
              ];
              const palette = palettes[Math.floor(Math.random() * palettes.length)];
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
  );
}

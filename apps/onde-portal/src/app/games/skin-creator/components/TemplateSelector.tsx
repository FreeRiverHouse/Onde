'use client';

import type { LayerType, Layer, SavedSkin, SoundType } from './types';

interface TemplateSelectorProps {
  templates: Record<string, { name: string; [key: string]: string }>;
  loadTemplate: (template: string) => void;
  generateRandomSkin: () => void;
  isWiggling: boolean;
  setIsWiggling: (v: boolean) => void;
  // Mystery box
  activeLayer: LayerType;
  layerCanvasRefs: React.MutableRefObject<{ [key in LayerType]?: HTMLCanvasElement }>;
  compositeLayersToMain: () => void;
  updatePreview: () => void;
  // Outfit randomizer
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  // Save/Share
  saveSkin: () => void;
  showMySkins: boolean;
  setShowMySkins: (v: boolean) => void;
  savedSkins: SavedSkin[];
  setSavedSkins: React.Dispatch<React.SetStateAction<SavedSkin[]>>;
  loadSavedSkin: (skin: SavedSkin) => void;
  deleteSavedSkin: (id: string) => void;
  shareSkin: () => void;
  shareUrl: string | null;
  setShareUrl: (url: string | null) => void;
  playSound: (type: SoundType) => void;
  setShowConfetti: (v: boolean) => void;
  skinTags: string[];
}

export default function TemplateSelector({
  templates, loadTemplate, generateRandomSkin,
  isWiggling, setIsWiggling,
  activeLayer, layerCanvasRefs, compositeLayersToMain, updatePreview,
  setLayers, saveSkin, showMySkins, setShowMySkins,
  savedSkins, setSavedSkins, loadSavedSkin, deleteSavedSkin,
  shareSkin, shareUrl, setShareUrl,
  playSound, setShowConfetti, skinTags,
}: TemplateSelectorProps) {
  return (
    <div className="mt-4">
      <p className="text-sm font-semibold text-gray-700 mb-2">Start from:</p>
      <div className="flex flex-wrap gap-1 justify-center">
        {Object.entries(templates).map(([key, template]) => (
          <button
            key={key}
            onClick={() => {
              loadTemplate(key);
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
        
        {/* AI Color Palette */}
        <button
          onClick={() => {
            const palettes = [
              { base: '#0ff', accent: '#f0f' },
              { base: '#228B22', accent: '#8B4513' },
              { base: '#87CEEB', accent: '#E0FFFF' },
              { base: '#FF4500', accent: '#FFD700' },
              { base: '#4B0082', accent: '#8B008B' },
              { base: '#006994', accent: '#40E0D0' },
              { base: '#FFD700', accent: '#DAA520' },
              { base: '#39FF14', accent: '#FF1493' },
            ];
            const palette = palettes[Math.floor(Math.random() * palettes.length)];
            setLayers(prev => prev.map(layer => {
              if (layer.id === 'clothing') return { ...layer, tint: palette.base, tintIntensity: 60 };
              if (layer.id === 'accessories') return { ...layer, tint: palette.accent, tintIntensity: 70 };
              return layer;
            }));
            playSound('success');
          }}
          className="px-2 py-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg text-xs font-bold hover:scale-105 transition-transform animate-pulse"
          title="✨ AI-inspired color palette"
        >
          ✨ AI Colors
        </button>

        {/* Save/My Skins */}
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
          {/* Social Share Buttons */}
          <div className="flex gap-2 mt-2 justify-center">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out my Minecraft skin! 🎮')}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-black text-white rounded text-xs hover:bg-gray-800"
            >𝕏</a>
            <a
              href={`https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent('My Minecraft Skin')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
            >Reddit</a>
            <a
              href={`https://discord.com/channels/@me?content=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600"
            >Discord</a>
            <button
              onClick={() => {
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
                window.open(qrUrl, '_blank');
              }}
              className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-800"
              title="Generate QR Code"
            >📱 QR</button>
          </div>
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
                  onClick={(e) => { 
                    e.stopPropagation();
                    const newName = prompt('✏️ Rename skin:', skin.name);
                    if (newName && newName.trim()) {
                      setSavedSkins(prev => prev.map(s => s.id === skin.id ? { ...s, name: newName.trim() } : s));
                    }
                  }}
                  className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Rename"
                >✏️</button>
                <button
                  onClick={(e) => { 
                    e.stopPropagation();
                    const tagOptions = skinTags.join('\n');
                    const tag = prompt(`🏷️ Add tag:\n${tagOptions}`, skin.tags?.[0] || '');
                    if (tag && tag.trim()) {
                      setSavedSkins(prev => prev.map(s => s.id === skin.id 
                        ? { ...s, tags: [...(s.tags || []), tag.trim()].slice(0, 3) } 
                        : s
                      ));
                    }
                  }}
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Add tag"
                >🏷️</button>
                <button
                  onClick={(e) => { 
                    e.stopPropagation();
                    const newSkin = { ...skin, id: Date.now().toString(), name: `${skin.name} (copy)` };
                    setSavedSkins(prev => [...prev, newSkin]);
                  }}
                  className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Duplicate"
                >📋</button>
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
  );
}

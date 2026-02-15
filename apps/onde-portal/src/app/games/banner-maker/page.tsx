'use client';

import { useState, useCallback } from 'react';
import BannerCanvas, { MC_COLORS, PATTERNS } from './components/BannerCanvas';
import CraftingRecipe from './components/CraftingRecipe';

interface BannerLayer {
  pattern: string;
  color: string;
}

const MAX_LAYERS = 6;

// Preset banner designs
const PRESETS: { name: string; icon: string; base: string; layers: BannerLayer[] }[] = [
  {
    name: 'Creeper',
    icon: '💚',
    base: 'lime',
    layers: [{ pattern: 'creeper', color: 'black' }],
  },
  {
    name: 'Skull & Crossbones',
    icon: '☠️',
    base: 'black',
    layers: [
      { pattern: 'skull', color: 'white' },
      { pattern: 'stripe_bottom', color: 'red' },
    ],
  },
  {
    name: 'Sunset',
    icon: '🌅',
    base: 'orange',
    layers: [
      { pattern: 'gradient', color: 'yellow' },
      { pattern: 'half_horizontal_bottom', color: 'red' },
      { pattern: 'stripe_bottom', color: 'brown' },
    ],
  },
  {
    name: 'Ocean',
    icon: '🌊',
    base: 'blue',
    layers: [
      { pattern: 'gradient_up', color: 'light_blue' },
      { pattern: 'stripe_bottom', color: 'cyan' },
      { pattern: 'circle', color: 'yellow' },
    ],
  },
  {
    name: 'Japanese',
    icon: '🇯🇵',
    base: 'white',
    layers: [{ pattern: 'circle', color: 'red' }],
  },
  {
    name: 'Knight Shield',
    icon: '🛡️',
    base: 'blue',
    layers: [
      { pattern: 'straight_cross', color: 'yellow' },
      { pattern: 'border', color: 'yellow' },
      { pattern: 'rhombus', color: 'red' },
    ],
  },
  {
    name: 'Galaxy',
    icon: '🌌',
    base: 'black',
    layers: [
      { pattern: 'circle', color: 'purple' },
      { pattern: 'rhombus', color: 'magenta' },
      { pattern: 'flower', color: 'light_blue' },
    ],
  },
  {
    name: 'Fire',
    icon: '🔥',
    base: 'red',
    layers: [
      { pattern: 'gradient_up', color: 'orange' },
      { pattern: 'triangle_bottom', color: 'yellow' },
      { pattern: 'stripe_bottom', color: 'black' },
    ],
  },
];

function colorLabel(c: string) {
  return c.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export default function BannerMakerPage() {
  const [baseColor, setBaseColor] = useState<string>('white');
  const [layers, setLayers] = useState<BannerLayer[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('black');
  const [showPatterns, setShowPatterns] = useState(false);

  const addLayer = useCallback(
    (pattern: string) => {
      if (layers.length >= MAX_LAYERS) return;
      setLayers((prev) => [...prev, { pattern, color: selectedColor }]);
      setShowPatterns(false);
    },
    [layers.length, selectedColor],
  );

  const removeLayer = useCallback((index: number) => {
    setLayers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveLayer = useCallback((index: number, direction: 'up' | 'down') => {
    setLayers((prev) => {
      const next = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const loadPreset = useCallback((preset: (typeof PRESETS)[0]) => {
    setBaseColor(preset.base);
    setLayers(preset.layers);
  }, []);

  const clearAll = useCallback(() => {
    setLayers([]);
    setBaseColor('white');
  }, []);

  const randomBanner = useCallback(() => {
    const colors = Object.keys(MC_COLORS);
    const patternKeys = Object.keys(PATTERNS).filter((k) => k !== 'base');
    const base = colors[Math.floor(Math.random() * colors.length)];
    const numLayers = 1 + Math.floor(Math.random() * 4);
    const newLayers: BannerLayer[] = [];
    for (let i = 0; i < numLayers; i++) {
      newLayers.push({
        pattern: patternKeys[Math.floor(Math.random() * patternKeys.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setBaseColor(base);
    setLayers(newLayers);
  }, []);

  const downloadBanner = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'minecraft-banner.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  const copyCommand = useCallback(() => {
    const patternTags = layers.map((l) => `{pattern:"${l.pattern}",color:"${l.color}"}`).join(',');
    const cmd =
      layers.length === 0
        ? `/give @p ${baseColor}_banner 1`
        : `/give @p ${baseColor}_banner{BlockEntityTag:{Patterns:[${patternTags}]}} 1`;
    navigator.clipboard.writeText(cmd);
  }, [baseColor, layers]);

  return (
    <div
      className="min-h-screen p-3 md:p-6 flex flex-col items-center"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      {/* Header */}
      <div className="text-center mb-4 md:mb-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-sm font-semibold text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
            🌙 Moonlight
          </span>
        </div>
        <h1 className="text-2xl md:text-5xl font-black text-white drop-shadow-2xl">
          🏳️ Banner Maker
        </h1>
        <p className="text-sm md:text-lg text-white/90 mt-1">
          Design Custom Minecraft Banners ✨
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 w-full max-w-5xl">
        {/* Left: Preview */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            👀 Preview
          </h2>
          <div className="bg-gray-800/50 rounded-xl p-6 flex items-center justify-center">
            <BannerCanvas baseColor={baseColor} layers={layers} scale={8} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadBanner}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold text-sm transition-all hover:scale-105"
            >
              💾 Download PNG
            </button>
            <button
              onClick={copyCommand}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-bold text-sm transition-all hover:scale-105"
            >
              📋 Copy Command
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={randomBanner}
              className="px-3 py-2 bg-gradient-to-r from-pink-500 to-yellow-500 text-white rounded-full font-bold text-sm hover:scale-105 transition-all"
            >
              🎲 Random
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full font-bold text-sm transition-all"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Center: Editor */}
        <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-4">
          {/* Base Color */}
          <div>
            <h3 className="text-lg font-bold text-white mb-2">🎨 Base Color</h3>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(MC_COLORS).map(([name, hex]) => (
                <button
                  key={name}
                  onClick={() => setBaseColor(name)}
                  title={colorLabel(name)}
                  className={`w-8 h-8 rounded-lg transition-all hover:scale-110 ${
                    baseColor === name ? 'ring-3 ring-white scale-110 shadow-lg' : 'ring-1 ring-white/20'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          {/* Pattern Color */}
          <div>
            <h3 className="text-lg font-bold text-white mb-2">🖌️ Pattern Color</h3>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(MC_COLORS).map(([name, hex]) => (
                <button
                  key={name}
                  onClick={() => setSelectedColor(name)}
                  title={colorLabel(name)}
                  className={`w-8 h-8 rounded-lg transition-all hover:scale-110 ${
                    selectedColor === name ? 'ring-3 ring-yellow-400 scale-110 shadow-lg' : 'ring-1 ring-white/20'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          {/* Add Pattern */}
          <div>
            <button
              onClick={() => setShowPatterns(!showPatterns)}
              disabled={layers.length >= MAX_LAYERS}
              className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
                layers.length >= MAX_LAYERS
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-[1.02] hover:shadow-lg'
              }`}
            >
              {layers.length >= MAX_LAYERS ? '⚠️ Max 6 Layers' : '➕ Add Pattern'}
            </button>

            {showPatterns && (
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-2 bg-black/20 rounded-xl">
                {Object.entries(PATTERNS)
                  .filter(([key]) => key !== 'base')
                  .map(([key, pattern]) => (
                    <button
                      key={key}
                      onClick={() => addLayer(key)}
                      className="flex flex-col items-center gap-1 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all hover:scale-105 group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {pattern.icon}
                      </span>
                      <span className="text-[10px] text-white/70 text-center leading-tight">
                        {pattern.name}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Current Layers */}
          <div>
            <h3 className="text-lg font-bold text-white mb-2">
              📚 Layers ({layers.length}/{MAX_LAYERS})
            </h3>
            {layers.length === 0 ? (
              <p className="text-white/50 text-sm text-center py-4">
                No patterns yet! Click "Add Pattern" to start designing.
              </p>
            ) : (
              <div className="space-y-2">
                {layers.map((layer, i) => {
                  const pDef = PATTERNS[layer.pattern];
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-white/10 rounded-lg p-2"
                    >
                      <span className="text-lg">{pDef?.icon || '?'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-semibold truncate">
                          {pDef?.name || layer.pattern}
                        </p>
                        <div className="flex items-center gap-1">
                          <span
                            className="inline-block w-3 h-3 rounded-sm border border-white/30"
                            style={{ backgroundColor: MC_COLORS[layer.color] }}
                          />
                          <span className="text-xs text-white/60">{colorLabel(layer.color)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => moveLayer(i, 'up')}
                        disabled={i === 0}
                        className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 text-white text-xs disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveLayer(i, 'down')}
                        disabled={i === layers.length - 1}
                        className="w-7 h-7 rounded bg-white/10 hover:bg-white/20 text-white text-xs disabled:opacity-30"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => removeLayer(i)}
                        className="w-7 h-7 rounded bg-red-500/50 hover:bg-red-500 text-white text-xs transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Presets */}
          <div>
            <h3 className="text-lg font-bold text-white mb-2">✨ Presets</h3>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => loadPreset(preset)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white font-medium transition-all hover:scale-105"
                >
                  {preset.icon} {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Crafting Recipe */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 lg:w-72">
          <CraftingRecipe baseColor={baseColor} layers={layers} />
        </div>
      </div>

      {/* SEO Content */}
      <div className="mt-8 w-full max-w-3xl text-white/70 text-sm space-y-4">
        <h2 className="text-xl font-bold text-white">How to Make Custom Minecraft Banners</h2>
        <p>
          Minecraft banners are decorative blocks that can be customized with up to 6 pattern layers.
          Use our free online Banner Maker to design your perfect banner, then follow the crafting
          recipe to build it in your game!
        </p>
        <h3 className="text-lg font-semibold text-white/90">How Banners Work in Minecraft</h3>
        <p>
          Start by crafting a base banner using 6 wool blocks and 1 stick. Then use a Loom to add
          patterns one at a time. Each pattern requires a dye of the color you want. Some special
          patterns (like the Creeper face or Skull) require a Banner Pattern item.
        </p>
        <h3 className="text-lg font-semibold text-white/90">Compatible Versions</h3>
        <p>
          Banner patterns work in both Minecraft Java Edition and Bedrock Edition. The /give command
          generated by this tool works in Java Edition. For Bedrock Edition, use the Loom crafting
          station with the pattern steps shown above.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <a
            href="/games/"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white text-sm font-medium transition-all"
          >
            🎮 More Games
          </a>
          <a
            href="/games/skin-creator/"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white text-sm font-medium transition-all"
          >
            🎨 Skin Creator
          </a>
          <a
            href="/libri/"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white text-sm font-medium transition-all"
          >
            📚 Free Books
          </a>
        </div>
      </div>

      <p className="text-white/40 text-xs mt-6">
        Made with 💖 by Onde • Free Minecraft Banner Maker Online
      </p>
    </div>
  );
}

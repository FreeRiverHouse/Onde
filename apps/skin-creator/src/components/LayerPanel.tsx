'use client';

import React from 'react';
import { Layer, LayerType, TINT_PRESETS } from './types';

interface LayerPanelProps {
  layers: Layer[];
  activeLayer: LayerType;
  setActiveLayer: (layer: LayerType) => void;
  toggleLayerVisibility: (layerId: LayerType) => void;
  setLayerOpacity: (layerId: LayerType, opacity: number) => void;
  setLayerTint: (layerId: LayerType, tint: string | null) => void;
  setLayerTintIntensity: (layerId: LayerType, intensity: number) => void;
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  moveLayer: (layerId: LayerType, direction: 'up' | 'down') => void;
  clearLayer: (layerId: LayerType) => void;
  copyLayerTo: (fromId: LayerType, toId: LayerType) => void;
  flattenLayers: () => void;
  compositeLayersToMain: () => void;
  updatePreview: () => void;
  playSound: (type: 'draw' | 'click' | 'download' | 'undo' | 'redo' | 'error' | 'success' | 'save') => void;
  showLayerPanel: boolean;
  setShowLayerPanel: (show: boolean) => void;
  showDuplicateMenu: boolean;
  setShowDuplicateMenu: (show: boolean) => void;
  customTintColors: string[];
  setCustomTintColors: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function LayerPanel({
  layers,
  activeLayer,
  setActiveLayer,
  toggleLayerVisibility,
  setLayerOpacity,
  setLayerTint,
  setLayerTintIntensity,
  setLayers,
  moveLayer,
  clearLayer,
  copyLayerTo,
  flattenLayers,
  compositeLayersToMain,
  updatePreview,
  playSound,
  showLayerPanel,
  setShowLayerPanel,
  showDuplicateMenu,
  setShowDuplicateMenu,
  customTintColors,
  setCustomTintColors,
}: LayerPanelProps) {
  if (!showLayerPanel) return null;

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-2xl z-40 w-64">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold">🎨 Layers</h3>
        <button
          onClick={() => setShowLayerPanel(false)}
          aria-label="Close layers panel"
          className="text-gray-500 hover:text-gray-700 text-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
        >×</button>
      </div>

      {/* Layer List */}
      <div className="space-y-2 mb-3">
        {layers.slice().reverse().map((layer, idx) => (
          <div
            key={layer.id}
            className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
              activeLayer === layer.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setActiveLayer(layer.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                  aria-label={layer.visible ? `Hide ${layer.name} layer` : `Show ${layer.name} layer`}
                  className={`text-lg min-w-[36px] min-h-[36px] flex items-center justify-center ${layer.visible ? '' : 'opacity-30'}`}
                  title={layer.visible ? 'Hide layer' : 'Show layer'}
                >
                  {layer.visible ? '👁️' : '🚫'}
                </button>
                <span className="text-lg">{layer.emoji}</span>
                <span className="text-sm font-medium">{layer.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'up'); playSound('click'); }}
                  disabled={idx === 0}
                  aria-label={`Move ${layer.name} layer up`}
                  className="text-sm px-2 py-1.5 min-w-[36px] min-h-[36px] disabled:opacity-30 hover:bg-blue-100 hover:scale-110 rounded transition-all"
                  title="Move layer up"
                >⬆️</button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'down'); playSound('click'); }}
                  disabled={idx === layers.length - 1}
                  aria-label={`Move ${layer.name} layer down`}
                  className="text-sm px-2 py-1.5 min-w-[36px] min-h-[36px] disabled:opacity-30 hover:bg-blue-100 hover:scale-110 rounded transition-all"
                  title="Move layer down"
                >⬇️</button>
              </div>
            </div>

            {/* Opacity slider */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-600">Opacity:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={layer.opacity}
                onChange={(e) => {
                  setLayerOpacity(layer.id, parseInt(e.target.value));
                  compositeLayersToMain();
                  updatePreview();
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 h-1"
              />
              <span className="text-xs text-gray-600 w-8">{layer.opacity}%</span>
            </div>

            {/* Opacity quick presets */}
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-600">Quick:</span>
              {[25, 50, 75, 100].map((preset) => (
                <button
                  key={preset}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLayerOpacity(layer.id, preset);
                    compositeLayersToMain();
                    updatePreview();
                  }}
                  className={`px-2 py-0.5 text-xs rounded transition-all ${
                    layer.opacity === preset
                      ? 'bg-blue-500 text-white font-medium'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>

            {/* Color Tint */}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs text-gray-600">🎨 Tint:</span>
                <div className="flex gap-1 flex-wrap items-center">
                  {TINT_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLayerTint(layer.id, preset.color);
                        setTimeout(() => {
                          compositeLayersToMain();
                          updatePreview();
                        }, 0);
                      }}
                      aria-label={`Tint: ${preset.name}`}
                      className={`w-7 h-7 min-w-[28px] min-h-[28px] rounded text-xs flex items-center justify-center transition-all ${
                        layer.tint === preset.color
                          ? 'ring-2 ring-blue-500 ring-offset-1 scale-110'
                          : 'hover:scale-110'
                      }`}
                      style={{
                        backgroundColor: preset.color || 'transparent',
                        border: preset.color ? 'none' : '1px dashed #ccc'
                      }}
                      title={preset.name}
                    >
                      {!preset.color && '⭕'}
                    </button>
                  ))}
                  {/* Custom color picker */}
                  <div className="relative ml-1">
                    <input
                      type="color"
                      value={layer.tint || '#808080'}
                      onChange={(e) => {
                        e.stopPropagation();
                        const color = e.target.value;
                        setLayerTint(layer.id, color);
                        setCustomTintColors(prev => {
                          const filtered = prev.filter(c => c !== color);
                          return [color, ...filtered].slice(0, 6);
                        });
                        setTimeout(() => {
                          compositeLayersToMain();
                          updatePreview();
                        }, 0);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Pick custom tint color"
                      className="w-7 h-7 min-w-[28px] min-h-[28px] rounded cursor-pointer border-0 p-0"
                      title="Custom color"
                      style={{ background: 'linear-gradient(135deg, #ff6b6b, #4d96ff, #6bcb77)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Recent custom tint colors */}
              {customTintColors.length > 0 && (
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs text-gray-600">Recent:</span>
                  <div className="flex gap-1">
                    {customTintColors.map((color, idx) => (
                      <button
                        key={`custom-${idx}-${color}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLayerTint(layer.id, color);
                          setTimeout(() => {
                            compositeLayersToMain();
                            updatePreview();
                          }, 0);
                        }}
                        aria-label={`Recent tint color ${color}`}
                        className={`w-6 h-6 min-w-[24px] min-h-[24px] rounded text-xs transition-all ${
                          layer.tint === color
                            ? 'ring-2 ring-blue-500 ring-offset-1 scale-110'
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tint intensity slider */}
              {layer.tint && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Intensity:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={layer.tintIntensity}
                    onChange={(e) => {
                      setLayerTintIntensity(layer.id, parseInt(e.target.value));
                      compositeLayersToMain();
                      updatePreview();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 h-1"
                    style={{ accentColor: layer.tint }}
                  />
                  <span className="text-xs text-gray-600 w-8">{layer.tintIntensity}%</span>
                </div>
              )}

              {/* ✨ Glow Toggle */}
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLayers(prev => prev.map(l =>
                      l.id === layer.id ? { ...l, glow: !l.glow } : l
                    ));
                    setTimeout(() => {
                      compositeLayersToMain();
                      updatePreview();
                    }, 0);
                  }}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                    layer.glow
                      ? 'bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-400/50'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  ✨ Glow {layer.glow ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Layer Actions */}
      <div className="flex flex-wrap gap-1.5 relative">
        <button
          onClick={() => clearLayer(activeLayer)}
          aria-label="Clear current layer"
          className="px-3 py-2 min-h-[36px] text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
          title="Clear current layer"
        >
          🗑️ Clear
        </button>
        <div className="relative">
          <button
            onClick={() => setShowDuplicateMenu(!showDuplicateMenu)}
            aria-label="Duplicate layer"
            className="px-3 py-2 min-h-[36px] text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
            title="Duplicate to another layer"
          >
            📋 Duplicate
          </button>
          {showDuplicateMenu && (
            <div className="absolute bottom-full left-0 mb-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10 min-w-[140px]">
              <p className="text-xs text-gray-500 mb-1">Copy to:</p>
              {layers.filter(l => l.id !== activeLayer).map(layer => (
                <button
                  key={layer.id}
                  onClick={() => {
                    copyLayerTo(activeLayer, layer.id);
                    setShowDuplicateMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-blue-50 text-left"
                >
                  <span>{layer.emoji}</span>
                  <span>{layer.name}</span>
                </button>
              ))}
              <button
                onClick={() => setShowDuplicateMenu(false)}
                className="w-full text-xs text-gray-400 mt-1 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        <button
          onClick={flattenLayers}
          aria-label="Flatten all layers"
          className="px-3 py-2 min-h-[36px] text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 font-medium"
          title="Merge all layers"
        >
          🔗 Flatten
        </button>
      </div>

      {/* Active Layer Indicator */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-700">
          Active: <span className="font-bold">{layers.find(l => l.id === activeLayer)?.name}</span>
        </p>
      </div>
    </div>
  );
}

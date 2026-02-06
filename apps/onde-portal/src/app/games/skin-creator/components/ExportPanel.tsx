'use client';

import type { Layer, LayerType } from './types';

interface ExportPanelProps {
  show: boolean;
  onClose: () => void;
  layers: Layer[];
  exportLayers: { [key in LayerType]: boolean };
  setExportLayers: React.Dispatch<React.SetStateAction<{ [key in LayerType]: boolean }>>;
  downloadSkin: (useSelectedLayers: boolean) => void;
  downloadBaseOnly: () => void;
  downloadForRoblox: () => void;
}

export default function ExportPanel({
  show, onClose, layers, exportLayers, setExportLayers,
  downloadSkin, downloadBaseOnly, downloadForRoblox,
}: ExportPanelProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md m-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4">📤 Export Skin</h3>
        <p className="text-sm text-gray-600 mb-4">Choose which layers to include in your export:</p>

        <div className="space-y-2 mb-4">
          {layers.map(layer => (
            <label key={layer.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={exportLayers[layer.id]}
                onChange={(e) => setExportLayers(prev => ({ ...prev, [layer.id]: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-lg">{layer.emoji}</span>
              <span>{layer.name}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => downloadSkin(true)}
            className="flex-1 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
          >
            💾 Export Selected
          </button>
          <button
            onClick={() => downloadSkin(false)}
            className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
          >
            📦 Export All
          </button>
        </div>

        <button
          onClick={downloadBaseOnly}
          className="w-full mt-2 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
        >
          👤 Export Base Only (no clothes)
        </button>

        <button
          onClick={downloadForRoblox}
          className="w-full mt-2 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105 transition-transform"
        >
          🎮 Export for Roblox (256x256)
        </button>
      </div>
    </div>
  );
}

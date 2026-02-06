'use client';

import { COLORS } from './types';

interface ColorPaletteProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
  recentColors: string[];
}

export default function ColorPalette({
  selectedColor,
  setSelectedColor,
  secondaryColor,
  setSecondaryColor,
  recentColors,
}: ColorPaletteProps) {
  return (
    <div className="glass-card rounded-3xl p-6 shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">🎨 Colors</h2>

      {/* Recent Colors */}
      {recentColors.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-1">Recent:</p>
          <div className="flex gap-1.5 flex-wrap">
            {recentColors.map((color, i) => (
              <button
                key={`${color}-${i}`}
                onClick={() => setSelectedColor(color)}
                aria-label={`Select recent color ${color}`}
                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded shadow-sm hover:scale-110 transition-transform border border-gray-300"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 max-w-[220px]">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            aria-label={`Select color ${color}`}
            aria-pressed={selectedColor === color}
            className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg shadow transition-transform hover:scale-110 border border-gray-300 ${
              selectedColor === color ? 'ring-4 ring-blue-400 scale-110' : ''
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Current Color */}
      <div className="mt-4 text-center">
        <p className="text-sm font-semibold text-gray-800">Selected:</p>
        <div
          className="w-16 h-16 mx-auto mt-2 rounded-xl shadow-lg border-4 border-white"
          style={{ backgroundColor: selectedColor }}
        />
      </div>

      {/* Custom Color */}
      <div className="mt-4">
        <label className="block text-xs font-semibold text-gray-700 mb-1">Primary color</label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            aria-label="Pick primary color"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded cursor-pointer border border-gray-300"
          />
          <input
            type="text"
            value={selectedColor}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setSelectedColor(v);
            }}
            aria-label="Primary color hex code"
            className="flex-1 px-2 py-2 text-sm font-mono rounded border border-gray-300 uppercase"
            maxLength={7}
          />
        </div>
        <p className="text-xs text-gray-600 text-center mt-1">🎯 Your color!</p>
      </div>
      <div className="mt-3">
        <label className="block text-xs font-semibold text-gray-700 mb-1">Secondary color</label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={secondaryColor}
            onChange={(e) => setSecondaryColor(e.target.value)}
            aria-label="Pick secondary color"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded cursor-pointer border border-gray-300"
          />
          <input
            type="text"
            value={secondaryColor}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setSecondaryColor(v);
            }}
            aria-label="Secondary color hex code"
            className="flex-1 px-2 py-2 text-sm font-mono rounded border border-gray-300 uppercase"
            maxLength={7}
          />
        </div>
        <p className="text-xs text-gray-600 text-center mt-1">🌈 Mix color!</p>
      </div>
    </div>
  );
}

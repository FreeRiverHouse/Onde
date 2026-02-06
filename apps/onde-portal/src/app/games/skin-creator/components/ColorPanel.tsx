'use client';

interface ColorPanelProps {
  colors: string[];
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
  recentColors: string[];
}

export default function ColorPanel({
  colors, selectedColor, setSelectedColor,
  secondaryColor, setSecondaryColor,
  recentColors,
}: ColorPanelProps) {
  return (
    <div className="hidden md:block glass-card rounded-3xl p-6 shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">🎨 Colors</h2>

      {/* Recent Colors */}
      {recentColors.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Recent:</p>
          <div className="flex gap-1 flex-wrap">
            {recentColors.map((color, i) => (
              <button
                key={`${color}-${i}`}
                onClick={() => setSelectedColor(color)}
                className="w-6 h-6 rounded shadow-sm hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 max-w-[200px]">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`w-10 h-10 rounded-lg shadow transition-transform hover:scale-110 ${
              selectedColor === color ? 'ring-4 ring-blue-400 scale-110' : ''
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Current Color */}
      <div className="mt-4 text-center">
        <p className="text-sm font-semibold text-gray-700">Selected:</p>
        <div
          className="w-16 h-16 mx-auto mt-2 rounded-xl shadow-lg border-4 border-white"
          style={{ backgroundColor: selectedColor }}
        />
      </div>

      {/* Custom Color */}
      <div className="mt-4">
        <div className="flex gap-1 items-center">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={selectedColor}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setSelectedColor(v);
            }}
            className="flex-1 px-2 py-1 text-xs font-mono rounded border border-gray-300 uppercase"
            maxLength={7}
          />
        </div>
        <p className="text-xs text-gray-500 text-center mt-1">🎯 Your color!</p>
      </div>
      <div className="mt-2">
        <div className="flex gap-1 items-center">
          <input
            type="color"
            value={secondaryColor}
            onChange={(e) => setSecondaryColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
          />
          <input
            type="text"
            value={secondaryColor}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setSecondaryColor(v);
            }}
            className="flex-1 px-2 py-1 text-xs font-mono rounded border border-gray-300 uppercase"
            maxLength={7}
          />
        </div>
        <p className="text-xs text-gray-500 text-center mt-1">🌈 Mix color!</p>
      </div>
    </div>
  );
}

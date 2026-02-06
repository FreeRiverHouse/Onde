'use client';

interface MobileColorPickerProps {
  show: boolean;
  onClose: () => void;
  colors: string[];
  selectedColor: string;
  setSelectedColor: (color: string) => void;
}

export default function MobileColorPicker({
  show, onClose, colors, selectedColor, setSelectedColor,
}: MobileColorPickerProps) {
  return (
    <>
      {/* Bottom Sheet */}
      <div className={`md:hidden fixed bottom-24 left-0 right-0 z-50 transition-transform duration-300 ${show ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-white rounded-t-2xl shadow-2xl p-4 mx-2">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-gray-800">🎨 Colors</span>
            <button onClick={onClose} className="text-gray-500 text-xl">✕</button>
          </div>
          <div className="skin-mobile-colors">
            {colors.slice(0, 24).map((color) => (
              <button
                key={color}
                onClick={() => { setSelectedColor(color); onClose(); }}
                className={`skin-mobile-color-btn ${selectedColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onClose}
        className="md:hidden fixed bottom-24 left-4 w-12 h-12 rounded-full shadow-lg border-4 border-white z-40"
        style={{ backgroundColor: selectedColor }}
        title="Pick color"
      />
    </>
  );
}

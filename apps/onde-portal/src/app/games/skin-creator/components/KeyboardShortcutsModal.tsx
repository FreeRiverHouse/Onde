'use client';

interface KeyboardShortcutsModalProps {
  show: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ show, onClose }: KeyboardShortcutsModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-2xl max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">⌨️ Keyboard Shortcuts</h2>
        <input
          type="text"
          placeholder="🔍 Search shortcuts..."
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm mb-3 focus:outline-none focus:border-purple-500"
          onChange={(e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('[data-shortcut]').forEach(el => {
              const text = el.getAttribute('data-shortcut') || '';
              (el as HTMLElement).style.display = text.includes(query) ? '' : 'none';
            });
          }}
        />
        <div className="grid grid-cols-2 gap-2 text-sm max-h-60 overflow-auto">
          <div data-shortcut="b brush" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">B</div><div className="py-2">Brush tool</div></div>
          <div data-shortcut="e eraser" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">E</div><div className="py-2">Eraser</div></div>
          <div data-shortcut="f fill bucket" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">F</div><div className="py-2">Fill bucket</div></div>
          <div data-shortcut="i eyedropper color picker" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">I</div><div className="py-2">Eyedropper</div></div>
          <div data-shortcut="1 2 3 4 5 brush size" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">1-5</div><div className="py-2">Brush size</div></div>
          <div data-shortcut="z undo ctrl cmd" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">⌘/Ctrl + Z</div><div className="py-2">Undo</div></div>
          <div data-shortcut="y redo ctrl cmd" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">⌘/Ctrl + Y</div><div className="py-2">Redo</div></div>
          <div data-shortcut="s save ctrl cmd" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">⌘/Ctrl + S</div><div className="py-2">Save</div></div>
          <div data-shortcut="? help shortcuts" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">?</div><div className="py-2">This help</div></div>
          <div data-shortcut="esc escape close" className="contents"><div className="bg-gray-800 px-3 py-2 rounded">Esc</div><div className="py-2">Close panels</div></div>
        </div>
        <p className="text-gray-400 text-xs mt-4 text-center">Press ? or Esc to close</p>
      </div>
    </div>
  );
}

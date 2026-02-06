'use client';

import type { ViewMode } from './types';

interface MobileDrawerProps {
  show: boolean;
  onClose: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  setShowAIPanel: (v: boolean) => void;
  showLayerPanel: boolean;
  setShowLayerPanel: (v: boolean) => void;
  setShowURLImport: (v: boolean) => void;
  setShowShortcuts: (v: boolean) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  setShowTutorial: (v: boolean) => void;
}

export default function MobileDrawer({
  show, onClose, viewMode, setViewMode,
  setShowAIPanel, showLayerPanel, setShowLayerPanel,
  setShowURLImport, setShowShortcuts,
  darkMode, setDarkMode, setShowTutorial,
}: MobileDrawerProps) {
  if (!show) return null;

  return (
    <div className="md:hidden fixed inset-0 bg-black/50 z-50" onClick={onClose}>
      <div 
        className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl p-4 transform transition-transform"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">🎨 Menu</h3>
          <button onClick={onClose} className="text-2xl">✕</button>
        </div>
        
        <nav className="space-y-2">
          <button
            onClick={() => { setViewMode('editor'); onClose(); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${
              viewMode === 'editor' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
            }`}
          >
            🎨 Editor
          </button>
          <button
            onClick={() => { setViewMode('gallery'); onClose(); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${
              viewMode === 'gallery' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
            }`}
          >
            🖼️ Gallery
          </button>
          
          <hr className="my-4" />
          
          <button
            onClick={() => { setShowAIPanel(true); onClose(); }}
            className="w-full text-left px-4 py-3 rounded-xl font-bold hover:bg-gray-100"
          >
            🤖 AI Generator
          </button>
          <button
            onClick={() => { setShowLayerPanel(!showLayerPanel); onClose(); }}
            className="w-full text-left px-4 py-3 rounded-xl font-bold hover:bg-gray-100"
          >
            🎨 Layers
          </button>
          <button
            onClick={() => { setShowURLImport(true); onClose(); }}
            className="w-full text-left px-4 py-3 rounded-xl font-bold hover:bg-gray-100"
          >
            🌐 Import from URL
          </button>
          <button
            onClick={() => { setShowShortcuts(true); onClose(); }}
            className="w-full text-left px-4 py-3 rounded-xl font-bold hover:bg-gray-100"
          >
            ⌨️ Shortcuts
          </button>
          
          <hr className="my-4" />
          
          <button
            onClick={() => { setDarkMode(!darkMode); onClose(); }}
            className="w-full text-left px-4 py-3 rounded-xl font-bold hover:bg-gray-100"
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button
            onClick={() => { setShowTutorial(true); onClose(); }}
            className="w-full text-left px-4 py-3 rounded-xl font-bold hover:bg-gray-100"
          >
            📚 Tutorial
          </button>
        </nav>
      </div>
    </div>
  );
}

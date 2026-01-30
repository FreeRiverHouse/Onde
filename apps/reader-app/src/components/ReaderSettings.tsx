'use client';

import { useReaderStore, Theme } from '@/store/readerStore';

export function ReaderSettings() {
  const { settings, updateSettings, toggleSettings } = useReaderStore();

  const themes: { id: Theme; label: string; icon: string }[] = [
    { id: 'light', label: 'Light', icon: '☀️' },
    { id: 'dark', label: 'Dark', icon: '🌙' },
    { id: 'sepia', label: 'Sepia', icon: '📜' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={toggleSettings}
      />
      
      {/* Panel */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl shadow-2xl p-6 ${
        settings.theme === 'dark' ? 'bg-gray-800 text-white' :
        settings.theme === 'sepia' ? 'bg-sepia-200 text-sepia-900' :
        'bg-white text-gray-900'
      }`}>
        <div className="max-w-lg mx-auto">
          {/* Handle */}
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6" />
          
          <h3 className="text-lg font-semibold mb-6">Reading Settings</h3>
          
          {/* Theme Selection */}
          <div className="mb-8">
            <label className="text-sm font-medium opacity-70 mb-3 block">Theme</label>
            <div className="flex gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => updateSettings({ theme: theme.id })}
                  className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                    settings.theme === theme.id
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="text-2xl">{theme.icon}</span>
                  <span className="text-sm">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium opacity-70">Font Size</label>
              <span className="text-sm font-mono">{settings.fontSize}px</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">A</span>
              <input
                type="range"
                min="14"
                max="28"
                value={settings.fontSize}
                onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-xl">A</span>
            </div>
          </div>

          {/* Font Family */}
          <div className="mb-8">
            <label className="text-sm font-medium opacity-70 mb-3 block">Font Style</label>
            <div className="flex gap-3">
              <button
                onClick={() => updateSettings({ fontFamily: 'serif' })}
                className={`flex-1 py-3 px-4 rounded-xl font-serif transition-all ${
                  settings.fontFamily === 'serif'
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                Serif
              </button>
              <button
                onClick={() => updateSettings({ fontFamily: 'sans' })}
                className={`flex-1 py-3 px-4 rounded-xl font-sans transition-all ${
                  settings.fontFamily === 'sans'
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                Sans-Serif
              </button>
            </div>
          </div>

          {/* Line Height */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium opacity-70">Line Spacing</label>
              <span className="text-sm font-mono">{settings.lineHeight.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs opacity-50">Tight</span>
              <input
                type="range"
                min="1.4"
                max="2.2"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-xs opacity-50">Loose</span>
            </div>
          </div>

          {/* Margins */}
          <div className="mb-6">
            <label className="text-sm font-medium opacity-70 mb-3 block">Page Margins</label>
            <div className="flex gap-3">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updateSettings({ marginSize: size })}
                  className={`flex-1 py-3 px-4 rounded-xl capitalize transition-all ${
                    settings.marginSize === size
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={toggleSettings}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}

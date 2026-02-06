'use client';

interface URLImportModalProps {
  show: boolean;
  onClose: () => void;
  importURL: string;
  setImportURL: (url: string) => void;
  importLoading: boolean;
  importError: string | null;
  importFromURL: () => void;
}

export default function URLImportModal({
  show, onClose, importURL, setImportURL,
  importLoading, importError, importFromURL,
}: URLImportModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">🌐 Import from URL</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Enter a Minecraft username, NameMC profile URL, or direct PNG URL:
        </p>
        
        <input
          type="text"
          value={importURL}
          onChange={(e) => setImportURL(e.target.value)}
          placeholder="e.g., Notch or https://..."
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none mb-3"
          onKeyDown={(e) => e.key === 'Enter' && importFromURL()}
        />
        
        {importError && (
          <p className="text-red-500 text-sm mb-3">❌ {importError}</p>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={importFromURL}
            disabled={!importURL.trim() || importLoading}
            className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
              importURL.trim() && !importLoading
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {importLoading ? '⏳ Loading...' : '📥 Import Skin'}
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-gray-100 rounded-xl">
          <p className="text-xs text-gray-500 font-bold mb-1">💡 Tips:</p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Enter username: <code className="bg-gray-200 px-1 rounded">Notch</code></li>
            <li>• NameMC URL: <code className="bg-gray-200 px-1 rounded">namemc.com/profile/...</code></li>
            <li>• Direct PNG URL works too!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

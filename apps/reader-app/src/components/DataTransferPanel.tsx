'use client';

import { useState, useRef } from 'react';
import { useReaderStore } from '@/store/readerStore';
import {
  downloadExport,
  validateImportData,
  importReaderData,
  readFileAsText,
  MergeStrategy,
  ImportSummary,
  ValidationResult,
} from '@/lib/dataTransfer';

interface ImportState {
  step: 'idle' | 'validating' | 'preview' | 'importing' | 'done' | 'error';
  validation?: ValidationResult;
  summary?: ImportSummary;
  error?: string;
  strategy: MergeStrategy;
}

export function DataTransferPanel() {
  const { settings } = useReaderStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [importState, setImportState] = useState<ImportState>({ step: 'idle', strategy: 'merge' });
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isDark = settings.theme === 'dark';
  const isSepia = settings.theme === 'sepia';

  const handleExport = () => {
    downloadExport();
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImportState({ step: 'validating', strategy: 'merge' });
    
    try {
      const contents = await readFileAsText(file);
      const validation = validateImportData(contents);
      
      if (!validation.valid) {
        setImportState({
          step: 'error',
          error: validation.errors.join('\n'),
          strategy: 'merge',
        });
        return;
      }
      
      setImportState({
        step: 'preview',
        validation,
        strategy: 'merge',
      });
    } catch (err) {
      setImportState({
        step: 'error',
        error: err instanceof Error ? err.message : 'Failed to read file',
        strategy: 'merge',
      });
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = () => {
    if (!importState.validation?.data) return;
    
    setImportState(prev => ({ ...prev, step: 'importing' }));
    
    try {
      const result = importReaderData(importState.validation.data, importState.strategy);
      setImportState({
        step: 'done',
        summary: result.imported,
        strategy: importState.strategy,
      });
    } catch (err) {
      setImportState({
        step: 'error',
        error: err instanceof Error ? err.message : 'Import failed',
        strategy: importState.strategy,
      });
    }
  };

  const handleCancel = () => {
    setImportState({ step: 'idle', strategy: 'merge' });
  };

  const renderImportContent = () => {
    switch (importState.step) {
      case 'validating':
        return (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
            <span className="ml-2 opacity-70">Validating...</span>
          </div>
        );
        
      case 'preview': {
        const data = importState.validation?.data;
        return (
          <div className="space-y-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : isSepia ? 'bg-sepia-100' : 'bg-gray-50'}`}>
              <h4 className="font-medium mb-2">📦 Import Preview</h4>
              <ul className="text-sm space-y-1 opacity-80">
                <li>• {data?.books.length || 0} books</li>
                <li>• {data?.highlights.length || 0} highlights</li>
                <li>• {data?.bookmarks.length || 0} bookmarks</li>
                <li>• {data?.vocabulary.length || 0} vocabulary words</li>
              </ul>
              {importState.validation?.warnings.length ? (
                <div className="mt-2 text-amber-600 text-xs">
                  ⚠️ {importState.validation.warnings.join(', ')}
                </div>
              ) : null}
            </div>
            
            <div>
              <label className="text-sm font-medium opacity-70 mb-2 block">Import Strategy</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setImportState(prev => ({ ...prev, strategy: 'merge' }))}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
                    importState.strategy === 'merge'
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : isDark ? 'bg-gray-700' : isSepia ? 'bg-sepia-100' : 'bg-gray-100'
                  }`}
                >
                  🔀 Merge
                  <span className="block text-xs opacity-60">Keep existing + add new</span>
                </button>
                <button
                  onClick={() => setImportState(prev => ({ ...prev, strategy: 'overwrite' }))}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
                    importState.strategy === 'overwrite'
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : isDark ? 'bg-gray-700' : isSepia ? 'bg-sepia-100' : 'bg-gray-100'
                  }`}
                >
                  🔄 Overwrite
                  <span className="block text-xs opacity-60">Replace all data</span>
                </button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className={`flex-1 py-2 rounded-lg ${isDark ? 'bg-gray-700' : isSepia ? 'bg-sepia-100' : 'bg-gray-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Import
              </button>
            </div>
          </div>
        );
      }
        
      case 'importing':
        return (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
            <span className="ml-2 opacity-70">Importing...</span>
          </div>
        );
        
      case 'done':
        return (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-800 dark:text-green-200">
              <h4 className="font-medium">✅ Import Complete!</h4>
              <ul className="text-sm mt-2 space-y-1">
                {importState.summary?.booksAdded ? <li>• {importState.summary.booksAdded} books added</li> : null}
                {importState.summary?.booksUpdated ? <li>• {importState.summary.booksUpdated} books updated</li> : null}
                {importState.summary?.highlightsAdded ? <li>• {importState.summary.highlightsAdded} highlights added</li> : null}
                {importState.summary?.bookmarksAdded ? <li>• {importState.summary.bookmarksAdded} bookmarks added</li> : null}
                {importState.summary?.vocabularyAdded ? <li>• {importState.summary.vocabularyAdded} vocabulary words added</li> : null}
                {importState.summary?.settingsUpdated ? <li>• Settings restored</li> : null}
                {importState.summary?.statsUpdated ? <li>• Reading stats updated</li> : null}
              </ul>
            </div>
            <button
              onClick={handleCancel}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium"
            >
              Done
            </button>
          </div>
        );
        
      case 'error':
        return (
          <div className="space-y-3">
            <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-800 dark:text-red-200">
              <h4 className="font-medium">❌ Import Failed</h4>
              <p className="text-sm mt-1 opacity-80">{importState.error}</p>
            </div>
            <button
              onClick={handleCancel}
              className={`w-full py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              Try Again
            </button>
          </div>
        );
        
      default:
        return (
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                isDark ? 'bg-gray-700 hover:bg-gray-600' : isSepia ? 'bg-sepia-100 hover:bg-sepia-200' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span>📤</span>
              <span>Export</span>
            </button>
            <label
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                isDark ? 'bg-gray-700 hover:bg-gray-600' : isSepia ? 'bg-sepia-100 hover:bg-sepia-200' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span>📥</span>
              <span>Import</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        );
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-sm font-medium opacity-70 mb-3"
      >
        <span>💾 Backup & Restore</span>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      {isExpanded && (
        <div className="space-y-3">
          {renderImportContent()}
          
          {showExportSuccess && (
            <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-800 dark:text-green-200 text-sm text-center">
              ✅ Export downloaded!
            </div>
          )}
          
          <p className="text-xs opacity-50 text-center">
            Export your library, settings, and progress to a JSON file. Import to restore on any device.
          </p>
        </div>
      )}
    </div>
  );
}

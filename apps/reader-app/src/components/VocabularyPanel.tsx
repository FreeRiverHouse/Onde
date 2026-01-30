'use client';

import { useState } from 'react';
import { useReaderStore } from '@/store/readerStore';

interface VocabularyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bookId?: string; // Optional: filter by current book
}

export function VocabularyPanel({ isOpen, onClose, bookId }: VocabularyPanelProps) {
  const { vocabulary, removeVocabularyWord, books } = useReaderStore();
  const [filter, setFilter] = useState<'all' | 'current'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter vocabulary
  let filteredVocab = vocabulary;
  if (filter === 'current' && bookId) {
    filteredVocab = vocabulary.filter(v => v.bookId === bookId);
  }
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredVocab = filteredVocab.filter(
      v => v.word.toLowerCase().includes(query) || v.definition.toLowerCase().includes(query)
    );
  }

  // Sort by most recent first
  filteredVocab = [...filteredVocab].sort((a, b) => b.createdAt - a.createdAt);

  const getBookTitle = (id?: string) => {
    if (!id) return 'Unknown';
    const book = books.find(b => b.id === id);
    return book?.title || 'Unknown';
  };

  const exportVocabulary = () => {
    const markdown = [
      '# My Vocabulary List',
      '',
      `*Exported on ${new Date().toLocaleDateString()}*`,
      '',
      ...filteredVocab.map(v => [
        `## ${v.word}`,
        v.phonetic ? `*${v.phonetic}*` : '',
        '',
        v.definition,
        '',
        v.bookId ? `📖 From: ${getBookTitle(v.bookId)}` : '',
        '',
        '---',
        '',
      ].filter(Boolean).join('\n')),
    ].join('\n');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vocabulary.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-[90] transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 
                      shadow-2xl z-[95] animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Vocabulary</h2>
            <span className="px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
              {filteredVocab.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 space-y-3">
          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words..."
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          
          {/* Filter tabs */}
          {bookId && (
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === 'all' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                All Books
              </button>
              <button
                onClick={() => setFilter('current')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === 'current' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                Current Book
              </button>
            </div>
          )}
        </div>

        {/* Vocabulary List */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {filteredVocab.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-3 block">📖</span>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No words match your search' : 'No words saved yet'}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Select a word while reading and tap "Look up" to add it
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVocab.map((word) => (
                <div 
                  key={word.id}
                  className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 
                             rounded-xl border border-amber-200/50 dark:border-amber-800/30"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white capitalize">
                        {word.word}
                      </span>
                      {word.phonetic && (
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          {word.phonetic}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeVocabularyWord(word.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remove word"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {word.definition}
                  </p>
                  {word.bookId && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      📖 {getBookTitle(word.bookId)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredVocab.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={exportVocabulary}
              className="w-full px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white 
                         rounded-lg hover:from-amber-500 hover:to-orange-500 transition-all
                         flex items-center justify-center gap-2"
            >
              <span>📤</span>
              <span>Export to Markdown</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

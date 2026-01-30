'use client';

import { useState, useMemo } from 'react';
import { useReaderStore, HighlightColor } from '@/store/readerStore';

interface AnnotationsPanelProps {
  bookId: string;
  onNavigate: (cfi: string) => void;
  onClose: () => void;
}

type Tab = 'highlights' | 'bookmarks';
type HighlightFilter = 'all' | HighlightColor;

const HIGHLIGHT_COLORS: { color: HighlightColor; label: string; bg: string; text: string }[] = [
  { color: 'yellow', label: 'Yellow', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  { color: 'green', label: 'Green', bg: 'bg-green-100', text: 'text-green-800' },
  { color: 'blue', label: 'Blue', bg: 'bg-blue-100', text: 'text-blue-800' },
  { color: 'pink', label: 'Pink', bg: 'bg-pink-100', text: 'text-pink-800' },
];

export function AnnotationsPanel({ bookId, onNavigate, onClose }: AnnotationsPanelProps) {
  const { highlights, bookmarks, removeHighlight, removeBookmark, settings } = useReaderStore();
  const [tab, setTab] = useState<Tab>('highlights');
  const [searchQuery, setSearchQuery] = useState('');
  const [colorFilter, setColorFilter] = useState<HighlightFilter>('all');
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  // Filter highlights for current book
  const bookHighlights = useMemo(() => {
    return highlights
      .filter((h) => h.bookId === bookId)
      .filter((h) => colorFilter === 'all' || h.color === colorFilter)
      .filter((h) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          h.text.toLowerCase().includes(query) ||
          h.note?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [highlights, bookId, colorFilter, searchQuery]);

  // Filter bookmarks for current book
  const bookBookmarks = useMemo(() => {
    return bookmarks
      .filter((b) => b.bookId === bookId)
      .filter((b) => {
        if (!searchQuery) return true;
        return b.title?.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [bookmarks, bookId, searchQuery]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getHighlightStyle = (color: HighlightColor) => {
    const colorConfig = HIGHLIGHT_COLORS.find((c) => c.color === color);
    return colorConfig || HIGHLIGHT_COLORS[0];
  };

  const exportAnnotations = () => {
    const content = [
      `# Annotations Export`,
      ``,
      `## Highlights (${bookHighlights.length})`,
      ``,
      ...bookHighlights.map((h, i) => [
        `### ${i + 1}. [${h.color.toUpperCase()}]`,
        `> ${h.text}`,
        h.note ? `\n**Note:** ${h.note}` : '',
        `*${formatDate(h.createdAt)}*`,
        ``,
      ].filter(Boolean).join('\n')),
      ``,
      `## Bookmarks (${bookBookmarks.length})`,
      ``,
      ...bookBookmarks.map((b, i) => [
        `${i + 1}. ${b.title || 'Untitled bookmark'}`,
        `   *${formatDate(b.createdAt)}*`,
        ``,
      ].join('\n')),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotations.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Theme classes
  const themeClasses = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-gray-100',
    sepia: 'bg-sepia-100 text-sepia-900',
  };

  const inputTheme = {
    light: 'bg-gray-100 text-gray-900 placeholder-gray-500',
    dark: 'bg-gray-800 text-gray-100 placeholder-gray-500',
    sepia: 'bg-sepia-200 text-sepia-900 placeholder-sepia-700',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Panel */}
      <div 
        className={`relative ml-auto w-full max-w-md h-full ${themeClasses[settings.theme]} shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Annotations</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={exportAnnotations}
              className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
              title="Export to Markdown"
            >
              📤
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setTab('highlights')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === 'highlights'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Highlights ({bookHighlights.length})
          </button>
          <button
            onClick={() => setTab('bookmarks')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === 'bookmarks'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Bookmarks ({bookBookmarks.length})
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-3 space-y-2 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search annotations..."
            className={`w-full px-3 py-2 rounded-lg text-sm ${inputTheme[settings.theme]} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          
          {tab === 'highlights' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setColorFilter('all')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  colorFilter === 'all'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              {HIGHLIGHT_COLORS.map(({ color, bg }) => (
                <button
                  key={color}
                  onClick={() => setColorFilter(color)}
                  className={`w-6 h-6 rounded-full ${bg} transition-transform ${
                    colorFilter === color ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {tab === 'highlights' ? (
            bookHighlights.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-2">🖍️</p>
                <p>No highlights yet</p>
                <p className="text-sm mt-1">Select text while reading to add highlights</p>
              </div>
            ) : (
              bookHighlights.map((highlight) => {
                const style = getHighlightStyle(highlight.color);
                return (
                  <div
                    key={highlight.id}
                    className={`p-3 rounded-lg ${style.bg} ${style.text} cursor-pointer hover:shadow-md transition-shadow`}
                    onClick={() => onNavigate(highlight.cfi)}
                  >
                    <p className="text-sm line-clamp-3">"{highlight.text}"</p>
                    
                    {highlight.note && (
                      <div 
                        className={`mt-2 pt-2 border-t border-black/10 text-sm cursor-pointer ${
                          expandedNote === highlight.id ? '' : 'line-clamp-2'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedNote(expandedNote === highlight.id ? null : highlight.id);
                        }}
                      >
                        📝 {highlight.note}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                      <span>{formatDate(highlight.createdAt)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this highlight?')) {
                            removeHighlight(highlight.id);
                          }
                        }}
                        className="p-1 hover:bg-black/10 rounded"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            bookBookmarks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-2">🔖</p>
                <p>No bookmarks yet</p>
                <p className="text-sm mt-1">Tap the bookmark icon while reading</p>
              </div>
            ) : (
              bookBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onNavigate(bookmark.cfi)}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🔖</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {bookmark.title || 'Untitled bookmark'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(bookmark.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this bookmark?')) {
                          removeBookmark(bookmark.id);
                        }
                      }}
                      className="p-1 hover:bg-black/10 rounded text-gray-500"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}

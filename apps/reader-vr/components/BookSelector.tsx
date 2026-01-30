'use client';

import { useBookStore, DEMO_BOOKS } from '@/store/bookStore';

interface BookSelectorProps {
  onClose?: () => void;
}

export function BookSelector({ onClose }: BookSelectorProps) {
  const { loadDemoBook, isLoading, error, currentBookId, clearBook } = useBookStore();

  const handleSelectBook = async (bookId: string) => {
    await loadDemoBook(bookId);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/30 shadow-xl shadow-purple-500/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">📚 Select Book</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {DEMO_BOOKS.map((book) => (
            <button
              key={book.id}
              onClick={() => handleSelectBook(book.id)}
              disabled={isLoading}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                currentBookId === book.id
                  ? 'bg-purple-600/30 border-purple-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 hover:border-purple-500/50'
              } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
            >
              <div className="font-semibold">{book.title}</div>
              <div className="text-sm text-gray-400">{book.author}</div>
              {currentBookId === book.id && (
                <div className="text-xs text-purple-400 mt-1">Currently reading</div>
              )}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-purple-400">
            <span className="animate-spin">⏳</span>
            <span>Loading book...</span>
          </div>
        )}

        {currentBookId && (
          <button
            onClick={clearBook}
            className="mt-4 w-full p-3 rounded-lg border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            Use Sample Text Instead
          </button>
        )}

        <p className="mt-4 text-xs text-gray-500 text-center">
          Free books from Project Gutenberg
        </p>
      </div>
    </div>
  );
}

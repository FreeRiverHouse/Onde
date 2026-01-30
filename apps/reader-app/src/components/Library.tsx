'use client';

import { useReaderStore, Book } from '@/store/readerStore';
import { useState, useRef } from 'react';

export function Library() {
  const { books, setCurrentBook, addBook, settings } = useReaderStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBookClick = (book: Book) => {
    setCurrentBook(book);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // For now, create a placeholder book entry
      // Full EPUB parsing will happen in the Reader component
      const newBook: Book = {
        id: crypto.randomUUID(),
        title: file.name.replace('.epub', ''),
        author: 'Unknown Author',
        progress: 0,
      };
      
      // Store the file in IndexedDB for later
      const arrayBuffer = await file.arrayBuffer();
      await storeEpubFile(newBook.id, arrayBuffer);
      
      addBook(newBook);
      setCurrentBook(newBook);
    } catch (error) {
      console.error('Failed to upload book:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`min-h-screen p-8 ${
      settings.theme === 'dark' ? 'bg-gray-900 text-white' : 
      settings.theme === 'sepia' ? 'bg-sepia-100 text-sepia-900' : 
      'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">📚 Library</h1>
            <p className="text-lg opacity-70 mt-2">Your personal reading collection</p>
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <span className="animate-spin">⏳</span>
                Uploading...
              </>
            ) : (
              <>
                <span>➕</span>
                Add Book
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".epub"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </header>

      {/* Reading Progress Section */}
      {books.some(b => b.progress > 0) && (
        <section className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold mb-6">📖 Continue Reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books
              .filter(b => b.progress > 0 && b.progress < 100)
              .sort((a, b) => (b.lastRead || 0) - (a.lastRead || 0))
              .slice(0, 3)
              .map((book) => (
                <ContinueReadingCard key={book.id} book={book} onClick={handleBookClick} />
              ))}
          </div>
        </section>
      )}

      {/* All Books */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">📚 All Books</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onClick={handleBookClick} />
          ))}
          
          {/* Add Book Card */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[2/3] rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <span className="text-4xl">➕</span>
            <span className="text-sm opacity-70">Add EPUB</span>
          </button>
        </div>
      </section>
    </div>
  );
}

function BookCard({ book, onClick }: { book: Book; onClick: (book: Book) => void }) {
  return (
    <button
      onClick={() => onClick(book)}
      className="group relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
    >
      {book.cover ? (
        <img
          src={book.cover}
          alt={book.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
          <span className="text-white text-center font-medium line-clamp-3">{book.title}</span>
        </div>
      )}
      
      {/* Progress indicator */}
      {book.progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div 
            className="h-full bg-green-500" 
            style={{ width: `${book.progress}%` }}
          />
        </div>
      )}
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
        <span className="text-white text-center font-medium line-clamp-2">{book.title}</span>
        <span className="text-white/70 text-sm mt-1">{book.author}</span>
        {book.progress > 0 && (
          <span className="text-green-400 text-sm mt-2">{Math.round(book.progress)}% complete</span>
        )}
      </div>
    </button>
  );
}

function ContinueReadingCard({ book, onClick }: { book: Book; onClick: (book: Book) => void }) {
  return (
    <button
      onClick={() => onClick(book)}
      className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
    >
      <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
        {book.cover ? (
          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
        )}
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-semibold line-clamp-2">{book.title}</h3>
        <p className="text-sm opacity-70">{book.author}</p>
        <div className="mt-3">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${book.progress}%` }}
            />
          </div>
          <p className="text-xs opacity-60 mt-1">{Math.round(book.progress)}% complete</p>
        </div>
      </div>
    </button>
  );
}

// IndexedDB helper for storing EPUB files
async function storeEpubFile(bookId: string, arrayBuffer: ArrayBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('onde-reader-db', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('epubs')) {
        db.createObjectStore('epubs', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('epubs', 'readwrite');
      const store = tx.objectStore('epubs');
      store.put({ id: bookId, data: arrayBuffer });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
  });
}

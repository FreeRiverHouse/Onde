'use client';

import { useReaderStore, Book } from '@/store/readerStore';
import { useState, useRef, useCallback, DragEvent, useMemo, useEffect } from 'react';
import { storeEpubFile } from '@/lib/epubStorage';
import { formatReadingTimeCompact, calculateRemainingMinutes } from '@/lib/readingTime';
import { OfflineIndicator } from './OfflineIndicator';
import { GoalProgressWidget } from './GoalProgressWidget';
import { OPDSBrowser } from './OPDSBrowser';

// Upload progress state
interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

// Filter and sort options
type FilterOption = 'all' | 'reading' | 'completed' | 'unread';
type SortOption = 'recent' | 'title' | 'author' | 'progress';

// Persist library preferences
const LIBRARY_PREFS_KEY = 'onde-reader-library-prefs';

interface LibraryPrefs {
  filter: FilterOption;
  sort: SortOption;
}

function loadLibraryPrefs(): LibraryPrefs {
  if (typeof window === 'undefined') return { filter: 'all', sort: 'recent' };
  try {
    const saved = localStorage.getItem(LIBRARY_PREFS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // Ignore localStorage errors
  }
  return { filter: 'all', sort: 'recent' };
}

function saveLibraryPrefs(prefs: LibraryPrefs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LIBRARY_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore localStorage errors
  }
}

export function Library() {
  const { books, setCurrentBook, addBook, settings } = useReaderStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  
  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [showOPDSBrowser, setShowOPDSBrowser] = useState(false);
  
  // Load saved preferences on mount
  useEffect(() => {
    const prefs = loadLibraryPrefs();
    setFilter(prefs.filter);
    setSort(prefs.sort);
  }, []);
  
  // Save preferences when changed
  useEffect(() => {
    saveLibraryPrefs({ filter, sort });
  }, [filter, sort]);
  
  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = [...books];
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
      );
    }
    
    // Apply filter
    switch (filter) {
      case 'reading':
        result = result.filter(b => b.progress > 0 && b.progress < 100);
        break;
      case 'completed':
        result = result.filter(b => b.progress >= 100);
        break;
      case 'unread':
        result = result.filter(b => b.progress === 0 || !b.progress);
        break;
    }
    
    // Apply sort
    switch (sort) {
      case 'recent':
        result.sort((a, b) => (b.lastRead || 0) - (a.lastRead || 0));
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'author':
        result.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case 'progress':
        result.sort((a, b) => (b.progress || 0) - (a.progress || 0));
        break;
    }
    
    return result;
  }, [books, searchQuery, filter, sort]);

  const handleBookClick = (book: Book) => {
    setCurrentBook(book);
  };

  // Process a single EPUB file
  const processEpubFile = async (file: File, _index: number, _total: number): Promise<Book | null> => {
    try {
      // Update progress to uploading
      setUploadProgress(prev => prev.map((p) => 
        p.fileName === file.name ? { ...p, status: 'uploading' as const, progress: 30 } : p
      ));

      const newBook: Book = {
        id: crypto.randomUUID(),
        title: file.name.replace('.epub', ''),
        author: 'Unknown Author',
        progress: 0,
      };
      
      // Read file
      const arrayBuffer = await file.arrayBuffer();
      
      setUploadProgress(prev => prev.map(p => 
        p.fileName === file.name ? { ...p, progress: 60 } : p
      ));

      // Store the file in IndexedDB
      await storeEpubFile(newBook.id, arrayBuffer);
      
      setUploadProgress(prev => prev.map(p => 
        p.fileName === file.name ? { ...p, status: 'done' as const, progress: 100 } : p
      ));
      
      return newBook;
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      setUploadProgress(prev => prev.map(p => 
        p.fileName === file.name ? { ...p, status: 'error' as const } : p
      ));
      return null;
    }
  };

  // Handle multiple files upload
  const handleFilesUpload = async (files: FileList | File[]) => {
    const epubFiles = Array.from(files).filter(f => 
      f.name.toLowerCase().endsWith('.epub')
    );
    
    if (epubFiles.length === 0) return;

    setIsUploading(true);
    
    // Initialize progress tracking
    setUploadProgress(epubFiles.map(f => ({
      fileName: f.name,
      progress: 0,
      status: 'pending' as const
    })));

    const uploadedBooks: Book[] = [];

    // Process files sequentially to avoid overwhelming IndexedDB
    for (let i = 0; i < epubFiles.length; i++) {
      const book = await processEpubFile(epubFiles[i], i, epubFiles.length);
      if (book) {
        uploadedBooks.push(book);
        addBook(book);
      }
    }

    // Open the last uploaded book
    if (uploadedBooks.length > 0) {
      setCurrentBook(uploadedBooks[uploadedBooks.length - 1]);
    }

    // Clear progress after a short delay
    setTimeout(() => {
      setUploadProgress([]);
      setIsUploading(false);
    }, 1500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await handleFilesUpload(files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFilesUpload(files);
    }
  }, []);

  return (
    <div 
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`min-h-screen p-8 relative ${
      settings.theme === 'dark' ? 'bg-gray-900 text-white' : 
      settings.theme === 'sepia' ? 'bg-sepia-100 text-sepia-900' : 
      'bg-gray-50 text-gray-900'
    }`}>
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center border-4 border-dashed border-blue-500 animate-pulse">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Drop your EPUBs here!</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Release to add to your library</p>
          </div>
        </div>
      )}

      {/* Upload Progress Modal */}
      {uploadProgress.length > 0 && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="animate-spin">📖</span>
              Uploading {uploadProgress.length} book{uploadProgress.length > 1 ? 's' : ''}...
            </h3>
            <div className="space-y-3">
              {uploadProgress.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[200px]">{item.fileName}</span>
                    <span className="flex items-center gap-1">
                      {item.status === 'done' && <span className="text-green-500">✓</span>}
                      {item.status === 'error' && <span className="text-red-500">✗</span>}
                      {item.status === 'uploading' && <span className="animate-spin">⏳</span>}
                      {item.status === 'pending' && <span className="opacity-50">⋯</span>}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        item.status === 'error' ? 'bg-red-500' :
                        item.status === 'done' ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight">📚 Library</h1>
              <OfflineIndicator />
            </div>
            <p className="text-lg opacity-70 mt-2">Your personal reading collection</p>
          </div>
          
          {/* Goal Progress Widget - shows between title and buttons on larger screens */}
          <div className="hidden lg:block">
            <GoalProgressWidget compact />
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOPDSBrowser(true)}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
              title="Browse OPDS Catalogs"
            >
              <span>🌐</span>
              <span className="hidden sm:inline">Browse Catalogs</span>
            </button>
            <a
              href="/reader-vr/"
              className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              title="Try VR Reading Mode"
            >
              <span>🥽</span>
              <span className="hidden sm:inline">VR Mode</span>
            </a>
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
                  <span className="hidden sm:inline">Add Book</span>
                </>
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".epub"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </header>

      {/* Search and Filter Bar */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                settings.theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : settings.theme === 'sepia'
                  ? 'bg-sepia-50 border-sepia-300 text-sepia-900 placeholder-sepia-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Filter Toggle Button (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`sm:hidden px-4 py-3 rounded-xl border flex items-center justify-center gap-2 ${
              settings.theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : settings.theme === 'sepia'
                ? 'bg-sepia-50 border-sepia-300 text-sepia-900'
                : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <span>🎛️</span>
            Filters
            {(filter !== 'all' || sort !== 'recent') && (
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </button>
          
          {/* Filter and Sort (Desktop or expanded on mobile) */}
          <div className={`flex gap-3 ${showFilters ? 'flex' : 'hidden sm:flex'}`}>
            {/* Filter Dropdown */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterOption)}
              className={`px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                settings.theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : settings.theme === 'sepia'
                  ? 'bg-sepia-50 border-sepia-300 text-sepia-900'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <option value="all">📚 All Books</option>
              <option value="reading">📖 Currently Reading</option>
              <option value="completed">✅ Completed</option>
              <option value="unread">🆕 Unread</option>
            </select>
            
            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className={`px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                settings.theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : settings.theme === 'sepia'
                  ? 'bg-sepia-50 border-sepia-300 text-sepia-900'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <option value="recent">🕐 Recently Read</option>
              <option value="title">🔤 Title A-Z</option>
              <option value="author">👤 Author A-Z</option>
              <option value="progress">📊 Progress</option>
            </select>
          </div>
        </div>
        
        {/* Result count */}
        {(searchQuery || filter !== 'all') && (
          <p className="mt-3 text-sm opacity-70">
            {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} found
            {searchQuery && ` for "${searchQuery}"`}
            {filter !== 'all' && ` (${filter})`}
          </p>
        )}
      </div>

      {/* Goal Progress Widget - full size on mobile only */}
      <div className="lg:hidden max-w-6xl mx-auto mb-8">
        <GoalProgressWidget />
      </div>

      {/* Reading Progress Section - only show when not filtering */}
      {!searchQuery && filter === 'all' && books.some(b => b.progress > 0 && b.progress < 100) && (
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
        <h2 className="text-2xl font-semibold mb-6">
          {filter === 'all' ? '📚 All Books' : 
           filter === 'reading' ? '📖 Currently Reading' :
           filter === 'completed' ? '✅ Completed' : '🆕 Unread'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredBooks.length === 0 && (searchQuery || filter !== 'all') ? (
            <div className="col-span-full text-center py-12 opacity-60">
              <span className="text-4xl block mb-4">📭</span>
              <p>No books found</p>
              <button 
                onClick={() => { setSearchQuery(''); setFilter('all'); }}
                className="mt-2 text-blue-500 hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} onClick={handleBookClick} />
            ))
          )}
          
          {/* Add Book Card - also acts as drop zone hint */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-[2/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors ${
              isDragging 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-105' 
                : 'border-gray-300 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
          >
            <span className="text-4xl">{isDragging ? '📥' : '➕'}</span>
            <span className="text-sm opacity-70 text-center px-2">
              {isDragging ? 'Drop here!' : 'Add EPUB(s)'}
            </span>
            <span className="text-xs opacity-40">or drag & drop</span>
          </button>
        </div>
      </section>
      
      {/* OPDS Catalog Browser */}
      {showOPDSBrowser && (
        <OPDSBrowser
          onClose={() => setShowOPDSBrowser(false)}
          theme={settings.theme}
        />
      )}
    </div>
  );
}

function BookCard({ book, onClick }: { book: Book; onClick: (book: Book) => void }) {
  // Calculate remaining reading time
  const remainingTime = book.estimatedReadingMinutes && book.progress > 0
    ? calculateRemainingMinutes(book.estimatedReadingMinutes, book.progress)
    : book.estimatedReadingMinutes;
  
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
      
      {/* Reading time badge */}
      {remainingTime && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <span>⏱️</span>
          <span>{formatReadingTimeCompact(remainingTime)}</span>
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
        {remainingTime && (
          <span className="text-blue-300 text-sm mt-1">
            {book.progress > 0 ? `${formatReadingTimeCompact(remainingTime)} left` : formatReadingTimeCompact(remainingTime)}
          </span>
        )}
      </div>
    </button>
  );
}

function ContinueReadingCard({ book, onClick }: { book: Book; onClick: (book: Book) => void }) {
  // Calculate remaining reading time
  const remainingTime = book.estimatedReadingMinutes
    ? calculateRemainingMinutes(book.estimatedReadingMinutes, book.progress)
    : undefined;
  
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
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs opacity-60">{Math.round(book.progress)}% complete</p>
            {remainingTime && (
              <p className="text-xs text-blue-500">⏱️ {formatReadingTimeCompact(remainingTime)} left</p>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// storeEpubFile is now imported from @/lib/epubStorage

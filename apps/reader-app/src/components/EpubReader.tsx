'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useReaderStore, HighlightColor } from '@/store/readerStore';
import { ReaderSettings } from './ReaderSettings';
import { TableOfContents } from './TableOfContents';
import { HighlightMenu } from './HighlightMenu';
import { AnnotationsPanel } from './AnnotationsPanel';
import { VocabularyPanel } from './VocabularyPanel';
import { TextToSpeech } from './TextToSpeech';
import ePub, { Book as EpubBook, Rendition, NavItem } from 'epubjs';

interface TocItem {
  id: string;
  href: string;
  label: string;
  subitems?: TocItem[];
}

interface EpubReaderProps {
  bookUrl: string;
  bookId: string;
}

export function EpubReader({ bookUrl, bookId }: EpubReaderProps) {
  const {
    currentBook,
    setCurrentBook,
    updateBookProgress,
    settings,
    isSettingsOpen,
    isTocOpen,
    toggleSettings,
    toggleToc,
    addBook,
    books,
    highlights,
    bookmarks,
    addBookmark,
    removeBookmark,
  } = useReaderStore();
  
  // Check if current location is bookmarked
  const isBookmarked = bookmarks.some(
    (b) => b.bookId === bookId && b.cfi === currentCfi
  );
  
  // Get highlights for current book
  const bookHighlights = highlights.filter((h) => h.bookId === bookId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentChapterTitle, setCurrentChapterTitle] = useState('');
  const [currentLocation, setCurrentLocation] = useState(0);
  const [totalLocations, setTotalLocations] = useState(0);
  const [currentCfi, setCurrentCfi] = useState<string>('');
  
  // Annotation states
  const [isAnnotationsOpen, setIsAnnotationsOpen] = useState(false);
  const [isVocabularyOpen, setIsVocabularyOpen] = useState(false);
  const [isTTSOpen, setIsTTSOpen] = useState(false);
  const [pageText, setPageText] = useState('');
  const [highlightMenu, setHighlightMenu] = useState<{
    position: { x: number; y: number };
    selectedText: string;
    cfi: string;
  } | null>(null);

  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<EpubBook | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Convert epub.js NavItem to our TocItem
  const convertToc = (items: NavItem[]): TocItem[] => {
    return items.map((item, i) => ({
      id: `toc-${i}`,
      href: item.href,
      label: item.label,
      subitems: item.subitems ? convertToc(item.subitems) : undefined,
    }));
  };

  // Apply theme to rendition
  const applyTheme = useCallback(() => {
    if (!renditionRef.current) return;

    const themes: Record<string, { background: string; color: string }> = {
      light: {
        background: '#ffffff',
        color: '#1a1a1a',
      },
      dark: {
        background: '#1a1a1a',
        color: '#f0f0f0',
      },
      sepia: {
        background: '#f4ecd8',
        color: '#5c4a32',
      },
    };

    renditionRef.current.themes.override('color', themes[settings.theme].color);
    renditionRef.current.themes.override('background', themes[settings.theme].background);
    renditionRef.current.themes.override('font-size', `${settings.fontSize}px`);
    renditionRef.current.themes.override('line-height', `${settings.lineHeight}`);
    renditionRef.current.themes.override(
      'font-family', 
      settings.fontFamily === 'serif' 
        ? 'Georgia, Cambria, "Times New Roman", serif'
        : 'system-ui, -apple-system, sans-serif'
    );
  }, [settings]);

  // Initialize EPUB
  useEffect(() => {
    if (!viewerRef.current) return;

    const initBook = async () => {
      try {
        setLoading(true);
        setError(null);

        // Clean up previous instance
        if (renditionRef.current) {
          renditionRef.current.destroy();
        }
        if (bookRef.current) {
          bookRef.current.destroy();
        }

        // Load EPUB
        const book = ePub(bookUrl);
        bookRef.current = book;

        // Wait for book to open
        await book.ready;

        // Get metadata
        const metadata = await book.loaded.metadata;
        const coverUrl = await book.coverUrl();

        // Check if book exists in library, add if not
        const existingBook = books.find(b => b.id === bookId);
        if (!existingBook) {
          addBook({
            id: bookId,
            title: metadata.title || 'Unknown Title',
            author: metadata.creator || 'Unknown Author',
            cover: coverUrl || undefined,
            progress: 0,
          });
        }

        // Update current book
        setCurrentBook({
          id: bookId,
          title: metadata.title || 'Unknown Title',
          author: metadata.creator || 'Unknown Author',
          cover: coverUrl || undefined,
          progress: existingBook?.progress || 0,
          currentCfi: existingBook?.currentCfi,
        });

        // Get table of contents
        const navigation = await book.loaded.navigation;
        setToc(convertToc(navigation.toc));

        // Generate locations for progress tracking
        await book.locations.generate(1024);
        setTotalLocations(book.locations.length());

        // Create rendition
        const rendition = book.renderTo(viewerRef.current!, {
          width: '100%',
          height: '100%',
          spread: 'none',
          flow: 'paginated',
        });
        renditionRef.current = rendition;

        // Apply initial theme
        applyTheme();

        // Location changed handler
        rendition.on('locationChanged', (location: { start: { cfi: string; displayed: { page: number; total: number } }; end: { cfi: string } }) => {
          const loc = book.locations.locationFromCfi(location.start.cfi);
          const total = book.locations.length();
          const pct = Math.round((loc / total) * 100);
          
          setProgress(pct);
          setCurrentLocation(loc);
          setCurrentCfi(location.start.cfi);
          
          // Find current chapter title
          const spine = book.spine;
          const spineItem = spine.get(location.start.cfi);
          if (spineItem) {
            const tocItem = navigation.toc.find(t => 
              t.href === spineItem.href || t.href.startsWith(spineItem.href.split('#')[0])
            );
            if (tocItem) {
              setCurrentChapterTitle(tocItem.label);
            }
          }

          // Update progress in store
          updateBookProgress(bookId, pct, location.start.cfi, loc);
        });
        
        // Text selection handler for highlights
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rendition.on('selected', (cfiRange: any, contents: any) => {
          const selection = contents?.window?.getSelection();
          if (!selection || selection.rangeCount === 0) return;
          
          const text = selection.toString().trim();
          if (text.length < 3) return; // Ignore very short selections
          
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          setHighlightMenu({
            position: { x: rect.left + rect.width / 2, y: rect.top },
            selectedText: text,
            cfi: String(cfiRange),
          });
        });

        // Display book - start from saved location or beginning
        if (existingBook?.currentCfi) {
          await rendition.display(existingBook.currentCfi);
        } else {
          await rendition.display();
        }
        
        // Render existing highlights and extract page text
        rendition.on('rendered', () => {
          const currentHighlights = highlights.filter((h) => h.bookId === bookId);
          currentHighlights.forEach((highlight) => {
            const colorMap: Record<HighlightColor, string> = {
              yellow: 'rgba(255, 255, 0, 0.3)',
              green: 'rgba(0, 255, 0, 0.3)',
              blue: 'rgba(0, 100, 255, 0.3)',
              pink: 'rgba(255, 182, 193, 0.5)',
            };
            // epub.js annotations API (not in TS types)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (rendition as any).annotations?.highlight?.(
              highlight.cfi,
              {},
              () => {},
              undefined,
              { fill: colorMap[highlight.color] }
            );
          });
          
          // Extract text for TTS
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const contents = (rendition as any).getContents?.();
            if (contents && contents[0]?.document) {
              const doc = contents[0].document;
              const body = doc.body;
              if (body) {
                const text = body.innerText.replace(/\s+/g, ' ').trim();
                setPageText(text);
              }
            }
          } catch (e) {
            console.error('Error extracting page text:', e);
          }
        });

        // Add keyboard navigation
        rendition.on('keyup', (e: KeyboardEvent) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            rendition.prev();
          } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
            rendition.next();
          }
        });

        setLoading(false);
      } catch (err) {
        console.error('Error loading EPUB:', err);
        setError('Failed to load book. Please try again.');
        setLoading(false);
      }
    };

    initBook();

    return () => {
      if (renditionRef.current) {
        renditionRef.current.destroy();
      }
      if (bookRef.current) {
        bookRef.current.destroy();
      }
    };
  }, [bookUrl, bookId]);

  // Apply theme when settings change
  useEffect(() => {
    applyTheme();
  }, [settings, applyTheme]);

  // Navigation
  const goToPrev = () => {
    renditionRef.current?.prev();
  };

  const goToNext = () => {
    renditionRef.current?.next();
  };

  const goToChapter = (index: number) => {
    const item = toc[index];
    if (item && renditionRef.current) {
      renditionRef.current.display(item.href);
    }
    toggleToc();
  };
  
  // Navigate to specific CFI (for annotations)
  const navigateToCfi = (cfi: string) => {
    if (renditionRef.current) {
      renditionRef.current.display(cfi);
      setIsAnnotationsOpen(false);
    }
  };
  
  // Toggle bookmark at current location
  const toggleBookmark = () => {
    if (!currentCfi) return;
    
    const existingBookmark = bookmarks.find(
      (b) => b.bookId === bookId && b.cfi === currentCfi
    );
    
    if (existingBookmark) {
      removeBookmark(existingBookmark.id);
    } else {
      addBookmark({
        bookId,
        cfi: currentCfi,
        title: currentChapterTitle || `Page ${currentLocation}`,
      });
    }
  };
  
  // Close highlight menu when clicking elsewhere
  const handleContainerClick = () => {
    if (highlightMenu) {
      setHighlightMenu(null);
    }
    handleTap();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToPrev();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'Escape') {
        setCurrentBook(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentBook]);

  // Touch handling for swipe
  const touchStartX = useRef(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  };

  // Show/hide controls on tap
  const handleTap = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // Theme classes
  const themeClasses = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-gray-100',
    sepia: 'bg-sepia-100 text-sepia-900',
  };

  // Loading state now shows overlay instead of replacing content
  // This allows viewerRef to be mounted for epub.js initialization

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses[settings.theme]}`}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => setCurrentBook(null)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen ${themeClasses[settings.theme]} transition-colors duration-300`}
      onClick={handleContainerClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Header controls */}
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className={`${themeClasses[settings.theme]} bg-opacity-95 backdrop-blur-sm shadow-md`}>
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentBook(null); }}
              className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
            >
              ← Library
            </button>
            
            <div className="flex-1 text-center px-4">
              <h1 className="font-semibold truncate">{currentBook?.title}</h1>
              <p className="text-sm opacity-70">{currentChapterTitle || 'Reading...'}</p>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); toggleBookmark(); }}
                className={`p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${
                  isBookmarked ? 'text-amber-500' : ''
                }`}
                title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
              >
                {isBookmarked ? '🔖' : '🏷️'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsAnnotationsOpen(true); }}
                className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 relative"
                title="Annotations"
              >
                🖍️
                {(bookHighlights.length > 0 || bookmarks.filter(b => b.bookId === bookId).length > 0) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                    {bookHighlights.length + bookmarks.filter(b => b.bookId === bookId).length}
                  </span>
                )}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsVocabularyOpen(true); }}
                className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                title="Vocabulary"
              >
                📚
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsTTSOpen(true); }}
                className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                title="Listen (Text-to-Speech)"
              >
                🎧
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleToc(); }}
                className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                title="Table of Contents"
              >
                📖
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleSettings(); }}
                className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                title="Settings"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* EPUB Viewer */}
      <main className="fixed inset-0 pt-16 pb-16">
        <div 
          ref={viewerRef} 
          className="w-full h-full"
          style={{
            padding: settings.marginSize === 'small' ? '0 16px' : 
                     settings.marginSize === 'medium' ? '0 32px' : '0 48px',
          }}
        />
      </main>

      {/* Loading overlay - shown over viewer while book initializes */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inherit">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
            <p>Loading book...</p>
          </div>
        </div>
      )}

      {/* Footer navigation */}
      <footer 
        className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className={`${themeClasses[settings.theme]} bg-opacity-95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.1)]`}>
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={(e) => { e.stopPropagation(); goToPrev(); }}
              className="px-4 py-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
            >
              ← Prev
            </button>
            
            <div className="text-center">
              <p className="text-sm opacity-70">
                {currentLocation} / {totalLocations}
              </p>
              <p className="text-xs opacity-50">
                {progress}% complete
              </p>
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="px-4 py-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
            >
              Next →
            </button>
          </div>
        </div>
      </footer>

      {/* Settings panel */}
      {isSettingsOpen && <ReaderSettings />}

      {/* Table of Contents */}
      {isTocOpen && (
        <TableOfContents 
          items={toc} 
          currentIndex={-1}
          onSelect={goToChapter}
        />
      )}
      
      {/* Highlight menu (appears on text selection) */}
      {highlightMenu && (
        <HighlightMenu
          position={highlightMenu.position}
          selectedText={highlightMenu.selectedText}
          cfi={highlightMenu.cfi}
          bookId={bookId}
          onClose={() => setHighlightMenu(null)}
        />
      )}
      
      {/* Annotations panel (highlights & bookmarks) */}
      {isAnnotationsOpen && (
        <AnnotationsPanel
          bookId={bookId}
          onNavigate={navigateToCfi}
          onClose={() => setIsAnnotationsOpen(false)}
        />
      )}
      
      {/* Vocabulary panel */}
      <VocabularyPanel
        isOpen={isVocabularyOpen}
        onClose={() => setIsVocabularyOpen(false)}
        bookId={bookId}
      />
      
      {/* Text-to-Speech audiobook mode */}
      <TextToSpeech
        text={pageText}
        isOpen={isTTSOpen}
        onClose={() => setIsTTSOpen(false)}
        onPageComplete={goToNext}
      />
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useReaderStore } from '@/store/readerStore';
import { ReaderSettings } from './ReaderSettings';
import { TableOfContents } from './TableOfContents';

// EPUB.js types - will be used when EPUB support is enabled
// interface EpubBook { ... }
// interface EpubRendition { ... }

interface TocItem {
  id: string;
  href: string;
  label: string;
  subitems?: TocItem[];
}

// Sample text for demo (when no EPUB loaded)
const SAMPLE_CHAPTERS = [
  {
    title: 'Chapter 1: The Beginning',
    content: `It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"

Mr. Bennet replied that he had not.

"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."

Mr. Bennet made no answer.

"Do you not want to know who has taken it?" cried his wife impatiently.

"You want to tell me, and I have no objection to hearing it."

This was invitation enough.

"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week."

"What is his name?"

"Bingley."

"Is he married or single?"

"Oh! Single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!"`,
  },
  {
    title: 'Chapter 2: First Impressions',
    content: `Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it.

It was then disclosed in the following manner. Observing his second daughter employed in trimming a hat, he suddenly addressed her with:

"I hope Mr. Bingley will like it, Lizzy."

"We are not in a way to know what Mr. Bingley likes," said her mother resentfully, "since we are not to visit."

"But you forget, mamma," said Elizabeth, "that we shall meet him at the assemblies, and that Mrs. Long promised to introduce him."

"I do not believe Mrs. Long will do any such thing. She has two nieces of her own. She is a selfish, hypocritical woman, and I have no opinion of her."

"No more have I," said Mr. Bennet; "and I am glad to find that you do not depend on her serving you."

Mrs. Bennet deigned not to make any reply, but, unable to contain herself, began scolding one of her daughters.

"Don't keep coughing so, Kitty, for Heaven's sake! Have a little compassion on my nerves. You tear them to pieces."

"Kitty has no discretion in her coughs," said her father; "she times them ill."

"I do not cough for my own amusement," replied Kitty fretfully.`,
  },
  {
    title: 'Chapter 3: The Ball',
    content: `Not all that Mrs. Bennet, however, with the assistance of her five daughters, could ask on the subject, was sufficient to draw from her husband any satisfactory description of Mr. Bingley.

They attacked him in various ways—with barefaced questions, ingenious suppositions, and distant surmises; but he eluded the skill of them all, and they were at last obliged to accept the second-hand intelligence of their neighbour, Lady Lucas.

Her report was highly favourable. Sir William had been delighted with him. He was quite young, wonderfully handsome, extremely agreeable, and, to crown the whole, he meant to be at the next assembly with a large party.

Nothing could be more delightful! To be fond of dancing was a certain step towards falling in love; and very lively hopes of Mr. Bingley's heart were entertained.

"If I can but see one of my daughters happily settled at Netherfield," said Mrs. Bennet to her husband, "and all the others equally well married, I shall have nothing to wish for."

In a few days Mr. Bingley returned Mr. Bennet's visit, and sat about ten minutes with him in his library. He had entertained hopes of being admitted to a sight of the young ladies, of whose beauty he had heard much; but he saw only the father.

The ladies were somewhat more fortunate, for they had the advantage of ascertaining from an upper window that he wore a blue coat, and rode a black horse.`,
  },
];

export function Reader() {
  const {
    currentBook,
    setCurrentBook,
    updateBookProgress,
    settings,
    isSettingsOpen,
    isTocOpen,
    toggleSettings,
    toggleToc,
  } = useReaderStore();

  const [currentChapter, setCurrentChapter] = useState(0);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch handling for swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const totalChapters = SAMPLE_CHAPTERS.length;
  const progress = ((currentChapter + 1) / totalChapters) * 100;

  // Update progress in store
  useEffect(() => {
    if (currentBook) {
      updateBookProgress(currentBook.id, progress);
    }
  }, [progress, currentBook, updateBookProgress]);

  // Build TOC from sample chapters
  useEffect(() => {
    const tocItems: TocItem[] = SAMPLE_CHAPTERS.map((ch, i) => ({
      id: `ch-${i}`,
      href: `#ch-${i}`,
      label: ch.title,
    }));
    setToc(tocItems);
  }, []);

  // Navigation functions
  const goToPrev = useCallback(() => {
    if (currentChapter > 0) {
      setCurrentChapter(c => c - 1);
    }
  }, [currentChapter]);

  const goToNext = useCallback(() => {
    if (currentChapter < totalChapters - 1) {
      setCurrentChapter(c => c + 1);
    }
  }, [currentChapter, totalChapters]);

  const goToChapter = (index: number) => {
    setCurrentChapter(index);
    toggleToc();
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
  }, [goToPrev, goToNext, setCurrentBook]);

  // Touch handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    
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

  const marginClasses = {
    small: 'px-4 md:px-8',
    medium: 'px-8 md:px-16 lg:px-24',
    large: 'px-12 md:px-24 lg:px-32',
  };

  return (
    <div 
      className={`min-h-screen ${themeClasses[settings.theme]} transition-colors duration-300`}
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      ref={containerRef}
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
              <p className="text-sm opacity-70">{SAMPLE_CHAPTERS[currentChapter].title}</p>
            </div>
            
            <div className="flex items-center gap-2">
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

      {/* Main content */}
      <main 
        className={`min-h-screen pt-20 pb-24 ${marginClasses[settings.marginSize]} reader-scroll`}
      >
        <article 
          className="max-w-3xl mx-auto reader-content"
          style={{ 
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            fontFamily: settings.fontFamily === 'serif' 
              ? 'Georgia, Cambria, "Times New Roman", serif'
              : 'system-ui, -apple-system, sans-serif',
          }}
        >
          <h2 className="text-2xl font-bold mb-8 text-center">
            {SAMPLE_CHAPTERS[currentChapter].title}
          </h2>
          
          {SAMPLE_CHAPTERS[currentChapter].content.split('\n\n').map((paragraph, i) => (
            <p key={i} className="mb-4">
              {paragraph}
            </p>
          ))}
        </article>
      </main>

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
              disabled={currentChapter === 0}
              className="px-4 py-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30"
            >
              ← Prev
            </button>
            
            <div className="text-center">
              <p className="text-sm opacity-70">
                Chapter {currentChapter + 1} of {totalChapters}
              </p>
              <p className="text-xs opacity-50">
                {Math.round(progress)}% complete
              </p>
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              disabled={currentChapter === totalChapters - 1}
              className="px-4 py-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30"
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
          currentIndex={currentChapter}
          onSelect={goToChapter}
        />
      )}
    </div>
  );
}

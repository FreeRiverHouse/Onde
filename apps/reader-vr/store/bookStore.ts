/**
 * Book Store for VR Reader
 * 
 * Manages the current book, reading progress, and settings using Zustand.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ParsedBook, BookMetadata, loadEpubFromUrl, getPage } from '@/lib/epubParser';

// Demo EPUB URLs (Project Gutenberg)
export const DEMO_BOOKS = [
  {
    id: 'pride-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    url: 'https://www.gutenberg.org/ebooks/1342.epub.noimages',
  },
  {
    id: 'moby-dick',
    title: 'Moby Dick',
    author: 'Herman Melville',
    url: 'https://www.gutenberg.org/ebooks/2701.epub.noimages',
  },
  {
    id: 'frankenstein',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    url: 'https://www.gutenberg.org/ebooks/84.epub.noimages',
  },
];

interface BookState {
  // Current book data
  currentBook: ParsedBook | null;
  currentBookId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Reading position
  currentPage: number;
  
  // VR Settings
  fontSize: number;
  bookDistance: number;
  
  // Actions
  loadBook: (bookId: string, url?: string) => Promise<void>;
  loadDemoBook: (demoBookId: string) => Promise<void>;
  clearBook: () => void;
  
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  
  setFontSize: (size: number) => void;
  setBookDistance: (distance: number) => void;
  
  // Getters
  getCurrentPageContent: () => ReturnType<typeof getPage>;
}

export const useBookStore = create<BookState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentBook: null,
      currentBookId: null,
      isLoading: false,
      error: null,
      currentPage: 0,
      fontSize: 0.035,
      bookDistance: 1.5,
      
      // Load a book from URL
      loadBook: async (bookId: string, url?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const bookUrl = url || DEMO_BOOKS.find(b => b.id === bookId)?.url;
          if (!bookUrl) {
            throw new Error('Book URL not found');
          }
          
          const parsed = await loadEpubFromUrl(bookUrl);
          
          // Restore reading position from persisted state
          const savedPosition = get().currentBookId === bookId ? get().currentPage : 0;
          
          set({
            currentBook: parsed,
            currentBookId: bookId,
            currentPage: savedPosition,
            isLoading: false,
          });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to load book',
            isLoading: false,
          });
        }
      },
      
      // Convenience method for demo books
      loadDemoBook: async (demoBookId: string) => {
        const demo = DEMO_BOOKS.find(b => b.id === demoBookId);
        if (demo) {
          await get().loadBook(demo.id, demo.url);
        }
      },
      
      // Clear current book
      clearBook: () => {
        set({
          currentBook: null,
          currentBookId: null,
          currentPage: 0,
          error: null,
        });
      },
      
      // Page navigation
      setPage: (page: number) => {
        const { currentBook } = get();
        if (currentBook) {
          const maxPage = currentBook.totalPages - 1;
          set({ currentPage: Math.max(0, Math.min(page, maxPage)) });
        }
      },
      
      nextPage: () => {
        const { currentBook, currentPage } = get();
        if (currentBook && currentPage < currentBook.totalPages - 1) {
          set({ currentPage: currentPage + 1 });
        }
      },
      
      prevPage: () => {
        const { currentPage } = get();
        if (currentPage > 0) {
          set({ currentPage: currentPage - 1 });
        }
      },
      
      // Settings
      setFontSize: (size: number) => {
        set({ fontSize: Math.max(0.02, Math.min(0.06, size)) });
      },
      
      setBookDistance: (distance: number) => {
        set({ bookDistance: Math.max(0.8, Math.min(3, distance)) });
      },
      
      // Get current page content
      getCurrentPageContent: () => {
        const { currentBook, currentPage } = get();
        if (!currentBook) return null;
        return getPage(currentBook, currentPage);
      },
    }),
    {
      name: 'vr-reader-storage',
      // Only persist specific fields
      partialize: (state) => ({
        currentBookId: state.currentBookId,
        currentPage: state.currentPage,
        fontSize: state.fontSize,
        bookDistance: state.bookDistance,
      }),
    }
  )
);

// Sample pages fallback (when no EPUB loaded)
export const SAMPLE_PAGES = [
  `PRIDE AND PREJUDICE
by Jane Austen

Chapter 1

It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.`,

  `"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"

Mr. Bennet replied that he had not.

"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."

Mr. Bennet made no answer.

"Do you not want to know who has taken it?" cried his wife impatiently.`,

  `"You want to tell me, and I have no objection to hearing it."

This was invitation enough.

"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately."`,
];

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'sepia';
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

export interface Highlight {
  id: string;
  bookId: string;
  cfi: string; // EPUB CFI location
  text: string;
  color: HighlightColor;
  note?: string;
  createdAt: number;
}

export interface Bookmark {
  id: string;
  bookId: string;
  cfi: string;
  title?: string;
  createdAt: number;
}

export interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  phonetic?: string;
  bookId?: string;
  createdAt: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  progress: number; // 0-100
  currentCfi?: string;
  totalLocations?: number;
  currentLocation?: number;
  lastRead?: number;
}

export interface ReaderSettings {
  theme: Theme;
  fontSize: number; // 14-28
  fontFamily: 'serif' | 'sans';
  lineHeight: number; // 1.4-2.2
  marginSize: 'small' | 'medium' | 'large';
}

interface ReaderState {
  // Current reading
  currentBook: Book | null;
  
  // Library
  books: Book[];
  
  // Annotations
  highlights: Highlight[];
  bookmarks: Bookmark[];
  vocabulary: VocabularyWord[];
  
  // Settings
  settings: ReaderSettings;
  
  // UI State
  isSettingsOpen: boolean;
  isTocOpen: boolean;
  
  // Actions
  setCurrentBook: (book: Book | null) => void;
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
  updateBookProgress: (id: string, progress: number, cfi?: string, location?: number) => void;
  
  addHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => void;
  removeHighlight: (id: string) => void;
  
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  
  addVocabularyWord: (word: Omit<VocabularyWord, 'id' | 'createdAt'>) => void;
  removeVocabularyWord: (id: string) => void;
  
  updateSettings: (settings: Partial<ReaderSettings>) => void;
  
  toggleSettings: () => void;
  toggleToc: () => void;
}

const defaultSettings: ReaderSettings = {
  theme: 'light',
  fontSize: 18,
  fontFamily: 'serif',
  lineHeight: 1.8,
  marginSize: 'medium',
};

// Sample books for demo
const sampleBooks: Book[] = [
  {
    id: 'pride-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    cover: 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg',
    progress: 0,
  },
  {
    id: 'moby-dick',
    title: 'Moby Dick',
    author: 'Herman Melville',
    cover: 'https://www.gutenberg.org/cache/epub/2701/pg2701.cover.medium.jpg',
    progress: 0,
  },
  {
    id: 'frankenstein',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    cover: 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg',
    progress: 0,
  },
];

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, _get) => ({
      currentBook: null,
      books: sampleBooks,
      highlights: [],
      bookmarks: [],
      vocabulary: [],
      settings: defaultSettings,
      isSettingsOpen: false,
      isTocOpen: false,
      
      setCurrentBook: (book) => set({ currentBook: book }),
      
      addBook: (book) => set((state) => ({
        books: [...state.books, book],
      })),
      
      removeBook: (id) => set((state) => ({
        books: state.books.filter((b) => b.id !== id),
      })),
      
      updateBookProgress: (id, progress, cfi, location) => set((state) => ({
        books: state.books.map((b) =>
          b.id === id
            ? { ...b, progress, currentCfi: cfi ?? b.currentCfi, currentLocation: location ?? b.currentLocation, lastRead: Date.now() }
            : b
        ),
        currentBook: state.currentBook?.id === id
          ? { ...state.currentBook, progress, currentCfi: cfi ?? state.currentBook.currentCfi, currentLocation: location ?? state.currentBook.currentLocation }
          : state.currentBook,
      })),
      
      addHighlight: (highlight) => set((state) => ({
        highlights: [
          ...state.highlights,
          { ...highlight, id: crypto.randomUUID(), createdAt: Date.now() },
        ],
      })),
      
      removeHighlight: (id) => set((state) => ({
        highlights: state.highlights.filter((h) => h.id !== id),
      })),
      
      addBookmark: (bookmark) => set((state) => ({
        bookmarks: [
          ...state.bookmarks,
          { ...bookmark, id: crypto.randomUUID(), createdAt: Date.now() },
        ],
      })),
      
      removeBookmark: (id) => set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== id),
      })),
      
      addVocabularyWord: (word) => set((state) => {
        // Don't add duplicates
        if (state.vocabulary.some(v => v.word.toLowerCase() === word.word.toLowerCase())) {
          return state;
        }
        return {
          vocabulary: [
            ...state.vocabulary,
            { ...word, id: crypto.randomUUID(), createdAt: Date.now() },
          ],
        };
      }),
      
      removeVocabularyWord: (id) => set((state) => ({
        vocabulary: state.vocabulary.filter((v) => v.id !== id),
      })),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),
      
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
      toggleToc: () => set((state) => ({ isTocOpen: !state.isTocOpen })),
    }),
    {
      name: 'onde-reader-storage',
      partialize: (state) => ({
        books: state.books,
        highlights: state.highlights,
        bookmarks: state.bookmarks,
        vocabulary: state.vocabulary,
        settings: state.settings,
      }),
    }
  )
);

/**
 * Export/Import functionality for Reader App data
 * Handles backup and restore of: books, progress, annotations, vocabulary, settings, stats
 */

import { useReaderStore, Book, Highlight, Bookmark, VocabularyWord, ReaderSettings, TTSSettings } from '@/store/readerStore';
import { useReadingStatsStore, DailyStats } from '@/store/readingStatsStore';

// Export data schema version for future migrations
const EXPORT_VERSION = 1;

export interface ExportedData {
  version: number;
  exportedAt: string;
  appVersion: string;
  
  // Reader Store data
  books: Book[];
  highlights: Highlight[];
  bookmarks: Bookmark[];
  vocabulary: VocabularyWord[];
  settings: ReaderSettings;
  ttsSettings: TTSSettings;
  
  // Reading Stats data
  stats: {
    totalReadingTimeMs: number;
    totalPagesRead: number;
    totalSessions: number;
    booksCompleted: number;
    currentStreak: number;
    longestStreak: number;
    lastReadDate: string | null;
    dailyStats: DailyStats[];
  };
}

export type MergeStrategy = 'overwrite' | 'merge';

/**
 * Gathers all reader data and returns as JSON string
 */
export function exportReaderData(): string {
  const readerState = useReaderStore.getState();
  const statsState = useReadingStatsStore.getState();
  
  const exportData: ExportedData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0',
    
    // Reader data
    books: readerState.books,
    highlights: readerState.highlights,
    bookmarks: readerState.bookmarks,
    vocabulary: readerState.vocabulary,
    settings: readerState.settings,
    ttsSettings: readerState.ttsSettings,
    
    // Stats data
    stats: {
      totalReadingTimeMs: statsState.totalReadingTimeMs,
      totalPagesRead: statsState.totalPagesRead,
      totalSessions: statsState.totalSessions,
      booksCompleted: statsState.booksCompleted,
      currentStreak: statsState.currentStreak,
      longestStreak: statsState.longestStreak,
      lastReadDate: statsState.lastReadDate,
      dailyStats: statsState.dailyStats,
    },
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Triggers download of export file
 */
export function downloadExport(): void {
  const data = exportReaderData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `onde-reader-backup-${dateStr}.json`;
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  data?: ExportedData;
}

/**
 * Validates imported JSON data
 */
export function validateImportData(jsonString: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Parse JSON
  let data: unknown;
  try {
    data = JSON.parse(jsonString);
  } catch {
    return { valid: false, errors: ['Invalid JSON format'], warnings: [] };
  }
  
  // Type guard
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Data must be an object'], warnings: [] };
  }
  
  const obj = data as Record<string, unknown>;
  
  // Check version
  if (typeof obj.version !== 'number') {
    errors.push('Missing or invalid version field');
  } else if (obj.version > EXPORT_VERSION) {
    warnings.push(`Export version ${obj.version} is newer than current ${EXPORT_VERSION}. Some data may not import correctly.`);
  }
  
  // Check required arrays
  const requiredArrays = ['books', 'highlights', 'bookmarks', 'vocabulary'] as const;
  for (const field of requiredArrays) {
    if (!Array.isArray(obj[field])) {
      errors.push(`Missing or invalid ${field} array`);
    }
  }
  
  // Check settings objects
  if (!obj.settings || typeof obj.settings !== 'object') {
    errors.push('Missing or invalid settings object');
  }
  
  if (!obj.ttsSettings || typeof obj.ttsSettings !== 'object') {
    errors.push('Missing or invalid ttsSettings object');
  }
  
  // Check stats
  if (!obj.stats || typeof obj.stats !== 'object') {
    errors.push('Missing or invalid stats object');
  } else {
    const stats = obj.stats as Record<string, unknown>;
    const requiredStatFields = ['totalReadingTimeMs', 'totalPagesRead', 'totalSessions', 'booksCompleted'];
    for (const field of requiredStatFields) {
      if (typeof stats[field] !== 'number') {
        errors.push(`Missing or invalid stats.${field}`);
      }
    }
  }
  
  // Validate books have required fields
  if (Array.isArray(obj.books)) {
    (obj.books as unknown[]).forEach((book, i) => {
      if (!book || typeof book !== 'object') {
        errors.push(`Book at index ${i} is invalid`);
      } else {
        const b = book as Record<string, unknown>;
        if (!b.id || !b.title || !b.author) {
          warnings.push(`Book at index ${i} may be missing id, title, or author`);
        }
      }
    });
  }
  
  // Validate highlights
  if (Array.isArray(obj.highlights)) {
    (obj.highlights as unknown[]).forEach((h, i) => {
      if (!h || typeof h !== 'object') {
        errors.push(`Highlight at index ${i} is invalid`);
      } else {
        const highlight = h as Record<string, unknown>;
        if (!highlight.id || !highlight.bookId || !highlight.cfi || !highlight.text) {
          warnings.push(`Highlight at index ${i} may be missing required fields`);
        }
      }
    });
  }
  
  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }
  
  return { valid: true, errors: [], warnings, data: obj as unknown as ExportedData };
}

/**
 * Import data with specified merge strategy
 * 'overwrite': replaces all existing data
 * 'merge': keeps existing items, adds new ones, updates matching by ID
 */
export function importReaderData(data: ExportedData, strategy: MergeStrategy): { success: boolean; imported: ImportSummary } {
  const readerState = useReaderStore.getState();
  const statsState = useReadingStatsStore.getState();
  
  const summary: ImportSummary = {
    booksAdded: 0,
    booksUpdated: 0,
    highlightsAdded: 0,
    bookmarksAdded: 0,
    vocabularyAdded: 0,
    settingsUpdated: false,
    statsUpdated: false,
  };
  
  if (strategy === 'overwrite') {
    // Full replacement
    useReaderStore.setState({
      books: data.books,
      highlights: data.highlights,
      bookmarks: data.bookmarks,
      vocabulary: data.vocabulary,
      settings: data.settings,
      ttsSettings: data.ttsSettings,
    });
    
    useReadingStatsStore.setState({
      totalReadingTimeMs: data.stats.totalReadingTimeMs,
      totalPagesRead: data.stats.totalPagesRead,
      totalSessions: data.stats.totalSessions,
      booksCompleted: data.stats.booksCompleted,
      currentStreak: data.stats.currentStreak,
      longestStreak: data.stats.longestStreak,
      lastReadDate: data.stats.lastReadDate,
      dailyStats: data.stats.dailyStats,
    });
    
    summary.booksAdded = data.books.length;
    summary.highlightsAdded = data.highlights.length;
    summary.bookmarksAdded = data.bookmarks.length;
    summary.vocabularyAdded = data.vocabulary.length;
    summary.settingsUpdated = true;
    summary.statsUpdated = true;
    
  } else {
    // Merge strategy
    const existingHighlightIds = new Set(readerState.highlights.map(h => h.id));
    const existingBookmarkIds = new Set(readerState.bookmarks.map(b => b.id));
    const existingVocabWords = new Set(readerState.vocabulary.map(v => v.word.toLowerCase()));
    
    // Merge books
    const mergedBooks = [...readerState.books];
    for (const book of data.books) {
      const existingIndex = mergedBooks.findIndex(b => b.id === book.id);
      if (existingIndex >= 0) {
        // Update if imported has more progress
        if (book.progress > mergedBooks[existingIndex].progress) {
          mergedBooks[existingIndex] = book;
          summary.booksUpdated++;
        }
      } else {
        mergedBooks.push(book);
        summary.booksAdded++;
      }
    }
    
    // Merge highlights (add new ones only)
    const mergedHighlights = [...readerState.highlights];
    for (const highlight of data.highlights) {
      if (!existingHighlightIds.has(highlight.id)) {
        mergedHighlights.push(highlight);
        summary.highlightsAdded++;
      }
    }
    
    // Merge bookmarks (add new ones only)
    const mergedBookmarks = [...readerState.bookmarks];
    for (const bookmark of data.bookmarks) {
      if (!existingBookmarkIds.has(bookmark.id)) {
        mergedBookmarks.push(bookmark);
        summary.bookmarksAdded++;
      }
    }
    
    // Merge vocabulary (add new words only)
    const mergedVocabulary = [...readerState.vocabulary];
    for (const word of data.vocabulary) {
      if (!existingVocabWords.has(word.word.toLowerCase())) {
        mergedVocabulary.push(word);
        summary.vocabularyAdded++;
      }
    }
    
    useReaderStore.setState({
      books: mergedBooks,
      highlights: mergedHighlights,
      bookmarks: mergedBookmarks,
      vocabulary: mergedVocabulary,
      // Keep existing settings in merge mode
    });
    
    // Merge stats: take the higher values
    const mergedStats = {
      totalReadingTimeMs: Math.max(statsState.totalReadingTimeMs, data.stats.totalReadingTimeMs),
      totalPagesRead: Math.max(statsState.totalPagesRead, data.stats.totalPagesRead),
      totalSessions: Math.max(statsState.totalSessions, data.stats.totalSessions),
      booksCompleted: Math.max(statsState.booksCompleted, data.stats.booksCompleted),
      longestStreak: Math.max(statsState.longestStreak, data.stats.longestStreak),
      currentStreak: statsState.currentStreak, // Keep current streak
      lastReadDate: statsState.lastReadDate, // Keep current last read date
      // Merge daily stats
      dailyStats: mergeDailyStats(statsState.dailyStats, data.stats.dailyStats),
    };
    
    useReadingStatsStore.setState(mergedStats);
    summary.statsUpdated = true;
  }
  
  return { success: true, imported: summary };
}

/**
 * Merge daily stats arrays, preferring higher values for each day
 */
function mergeDailyStats(existing: DailyStats[], imported: DailyStats[]): DailyStats[] {
  const byDate = new Map<string, DailyStats>();
  
  // Add existing
  for (const stat of existing) {
    byDate.set(stat.date, stat);
  }
  
  // Merge imported
  for (const stat of imported) {
    const existing = byDate.get(stat.date);
    if (existing) {
      // Take higher values
      byDate.set(stat.date, {
        date: stat.date,
        readingTimeMs: Math.max(existing.readingTimeMs, stat.readingTimeMs),
        pagesRead: Math.max(existing.pagesRead, stat.pagesRead),
        sessionsCount: Math.max(existing.sessionsCount, stat.sessionsCount),
      });
    } else {
      byDate.set(stat.date, stat);
    }
  }
  
  // Sort by date and return
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export interface ImportSummary {
  booksAdded: number;
  booksUpdated: number;
  highlightsAdded: number;
  bookmarksAdded: number;
  vocabularyAdded: number;
  settingsUpdated: boolean;
  statsUpdated: boolean;
}

/**
 * Read file and return contents as string
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

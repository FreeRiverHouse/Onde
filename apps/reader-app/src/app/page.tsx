'use client';

import { Library } from '@/components/Library';
import { Reader } from '@/components/Reader';
import { EpubReader } from '@/components/EpubReader';
import { useReaderStore } from '@/store/readerStore';
import { useState, useEffect } from 'react';
import { getEpubFile, createEpubUrl } from '@/lib/epubStorage';

// Sample books use the demo Reader, uploaded EPUBs use EpubReader
// Note: SAMPLE_BOOK_IDS can be used for future logic to distinguish demo books
// const SAMPLE_BOOK_IDS = ['pride-prejudice', 'moby-dick', 'frankenstein'];

// Demo EPUB book IDs - URLs are constructed dynamically based on window.location
const DEMO_BOOK_IDS = ['pride-prejudice', 'moby-dick', 'frankenstein'];

// Build EPUB URL dynamically to handle basePath correctly
function getEpubUrl(bookId: string): string {
  // In browser, construct URL relative to current location
  if (typeof window !== 'undefined') {
    const baseUrl = window.location.pathname.replace(/\/$/, '');
    return `${baseUrl}/books/${bookId}.epub`;
  }
  // Fallback for SSR (shouldn't be used for EPUB loading)
  return `/books/${bookId}.epub`;
}

export default function Home() {
  const { currentBook } = useReaderStore();
  const [epubUrl, setEpubUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if current book has stored EPUB or needs to fetch from Gutenberg
  useEffect(() => {
    if (!currentBook) {
      // Clean up any blob URLs
      if (epubUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(epubUrl);
      }
      setEpubUrl(null);
      return;
    }

    const loadEpub = async () => {
      setIsLoading(true);
      try {
        // First check if we have a locally stored EPUB
        const storedData = await getEpubFile(currentBook.id);
        if (storedData) {
          setEpubUrl(createEpubUrl(storedData));
          return;
        }

        // Check if it's a demo book
        if (DEMO_BOOK_IDS.includes(currentBook.id)) {
          setEpubUrl(getEpubUrl(currentBook.id));
          return;
        }

        // No EPUB available, use demo reader
        setEpubUrl(null);
      } catch (error) {
        console.error('Error loading EPUB:', error);
        setEpubUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadEpub();
  }, [currentBook?.id]);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      if (epubUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(epubUrl);
      }
    };
  }, [epubUrl]);

  if (!currentBook) {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Library />
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Preparing book...</p>
        </div>
      </main>
    );
  }

  // Use EpubReader for real EPUBs, demo Reader for samples without EPUB
  if (epubUrl) {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <EpubReader bookUrl={epubUrl} bookId={currentBook.id} />
      </main>
    );
  }

  // Fallback to demo reader for sample books
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Reader />
    </main>
  );
}

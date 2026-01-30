'use client';

import { Library } from '@/components/Library';
import { Reader } from '@/components/Reader';
import { useReaderStore } from '@/store/readerStore';

export default function Home() {
  const { currentBook } = useReaderStore();

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {currentBook ? <Reader /> : <Library />}
    </main>
  );
}

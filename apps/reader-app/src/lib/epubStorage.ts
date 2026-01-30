// IndexedDB utilities for EPUB file storage

const DB_NAME = 'onde-reader-db';
const DB_VERSION = 1;
const EPUB_STORE = 'epubs';

interface EpubRecord {
  id: string;
  data: ArrayBuffer;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(EPUB_STORE)) {
        db.createObjectStore(EPUB_STORE, { keyPath: 'id' });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
  });
}

export async function storeEpubFile(bookId: string, arrayBuffer: ArrayBuffer): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(EPUB_STORE, 'readwrite');
    const store = tx.objectStore(EPUB_STORE);
    store.put({ id: bookId, data: arrayBuffer });
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getEpubFile(bookId: string): Promise<ArrayBuffer | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(EPUB_STORE, 'readonly');
    const store = tx.objectStore(EPUB_STORE);
    const request = store.get(bookId);
    
    request.onsuccess = () => {
      db.close();
      const record = request.result as EpubRecord | undefined;
      resolve(record?.data ?? null);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function deleteEpubFile(bookId: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(EPUB_STORE, 'readwrite');
    const store = tx.objectStore(EPUB_STORE);
    store.delete(bookId);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function hasEpubFile(bookId: string): Promise<boolean> {
  const data = await getEpubFile(bookId);
  return data !== null;
}

// Create a blob URL from ArrayBuffer for epub.js
export function createEpubUrl(arrayBuffer: ArrayBuffer): string {
  const blob = new Blob([arrayBuffer], { type: 'application/epub+zip' });
  return URL.createObjectURL(blob);
}

// Interface for cached book info
export interface CachedBookInfo {
  id: string;
  size: number; // in bytes
}

// Get all cached book IDs and their sizes
export async function getAllCachedBooks(): Promise<CachedBookInfo[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(EPUB_STORE, 'readonly');
    const store = tx.objectStore(EPUB_STORE);
    const request = store.getAll();
    
    request.onsuccess = () => {
      db.close();
      const records = request.result as EpubRecord[];
      const books = records.map(record => ({
        id: record.id,
        size: record.data.byteLength
      }));
      resolve(books);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

// Get total cache size in bytes
export async function getTotalCacheSize(): Promise<number> {
  const books = await getAllCachedBooks();
  return books.reduce((total, book) => total + book.size, 0);
}

// Clear all cached books
export async function clearAllCache(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(EPUB_STORE, 'readwrite');
    const store = tx.objectStore(EPUB_STORE);
    store.clear();
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

// Get storage quota info (if available)
export async function getStorageQuota(): Promise<{ used: number; total: number } | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        total: estimate.quota || 0
      };
    } catch {
      return null;
    }
  }
  return null;
}

import * as SQLite from 'expo-sqlite';
import { Book, ReadingProgress } from '../types/book';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('ondebooks.db');
    await initializeDatabase(db);
  }
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      description TEXT,
      coverUrl TEXT,
      epubPath TEXT,
      price INTEGER DEFAULT 30,
      isFree INTEGER DEFAULT 0,
      language TEXT DEFAULT 'it',
      category TEXT,
      publishedAt TEXT,
      isPurchased INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reading_progress (
      bookId TEXT PRIMARY KEY,
      currentPage INTEGER DEFAULT 0,
      totalPages INTEGER DEFAULT 0,
      lastReadAt TEXT,
      FOREIGN KEY (bookId) REFERENCES books(id)
    );
  `);
}

export async function getAllBooks(): Promise<Book[]> {
  const database = await getDatabase();
  const result = await database.getAllAsync<any>('SELECT * FROM books ORDER BY publishedAt DESC');
  return result.map(row => ({
    ...row,
    isFree: !!row.isFree,
    isPurchased: !!row.isPurchased,
  }));
}

export async function getBookById(id: string): Promise<Book | null> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<any>('SELECT * FROM books WHERE id = ?', [id]);
  if (!result) return null;
  return {
    ...result,
    isFree: !!result.isFree,
    isPurchased: !!result.isPurchased,
  };
}

export async function getFreeBooks(): Promise<Book[]> {
  const database = await getDatabase();
  const result = await database.getAllAsync<any>('SELECT * FROM books WHERE isFree = 1 ORDER BY publishedAt DESC');
  return result.map(row => ({
    ...row,
    isFree: true,
    isPurchased: !!row.isPurchased,
  }));
}

export async function getPurchasedBooks(): Promise<Book[]> {
  const database = await getDatabase();
  const result = await database.getAllAsync<any>('SELECT * FROM books WHERE isPurchased = 1 OR isFree = 1 ORDER BY publishedAt DESC');
  return result.map(row => ({
    ...row,
    isFree: !!row.isFree,
    isPurchased: !!row.isPurchased,
  }));
}

export async function purchaseBook(bookId: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('UPDATE books SET isPurchased = 1 WHERE id = ?', [bookId]);
}

export async function insertBook(book: Omit<Book, 'isPurchased'>): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO books (id, title, author, description, coverUrl, epubPath, price, isFree, language, category, publishedAt, isPurchased)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [book.id, book.title, book.author, book.description, book.coverUrl, book.epubPath, book.price, book.isFree ? 1 : 0, book.language, book.category, book.publishedAt]
  );
}

export async function getReadingProgress(bookId: string): Promise<ReadingProgress | null> {
  const database = await getDatabase();
  return database.getFirstAsync<ReadingProgress>('SELECT * FROM reading_progress WHERE bookId = ?', [bookId]);
}

export async function updateReadingProgress(progress: ReadingProgress): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO reading_progress (bookId, currentPage, totalPages, lastReadAt)
     VALUES (?, ?, ?, ?)`,
    [progress.bookId, progress.currentPage, progress.totalPages, progress.lastReadAt]
  );
}

// Seed initial catalog
export async function seedCatalog(): Promise<void> {
  const database = await getDatabase();
  const count = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM books');

  if (count && count.count > 0) return; // Already seeded

  const initialBooks: Omit<Book, 'isPurchased'>[] = [
    {
      id: 'shepherds-promise-en',
      title: "The Shepherd's Promise",
      author: 'Onde Publishing',
      description: 'A beautifully illustrated children\'s book based on Psalm 23, teaching kids about faith, comfort, and God\'s love through gentle storytelling.',
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      epubPath: 'psalm-23-abundance-en.epub',
      price: 30, // €0.30
      isFree: false,
      language: 'en',
      category: 'children',
      publishedAt: '2026-01-08',
    },
    {
      id: 'promessa-pastore-it',
      title: 'La Promessa del Pastore',
      author: 'Onde Publishing',
      description: 'Un libro illustrato per bambini basato sul Salmo 23, che insegna ai piccoli la fede, il conforto e l\'amore di Dio attraverso una narrazione dolce.',
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      epubPath: 'salmo-23-bambini.epub',
      price: 30,
      isFree: false,
      language: 'it',
      category: 'bambini',
      publishedAt: '2026-01-08',
    },
    {
      id: 'aiko-robot-friend-en',
      title: 'AIKO: A Robot Friend',
      author: 'Onde Publishing',
      description: 'Meet AIKO, a friendly robot who learns what it means to be a good friend. A heartwarming story about AI and humanity.',
      coverUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
      epubPath: 'aiko-ai-children.epub',
      price: 30,
      isFree: true, // Free to attract users
      language: 'en',
      category: 'children',
      publishedAt: '2026-01-07',
    },
    {
      id: 'piccole-rime-it',
      title: 'Piccole Rime',
      author: 'Onde Publishing',
      description: 'Una raccolta di filastrocche e rime per i più piccoli. Perfetto per la lettura serale con i tuoi bambini.',
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
      epubPath: 'piccole-rime.epub',
      price: 30,
      isFree: true,
      language: 'it',
      category: 'bambini',
      publishedAt: '2026-01-06',
    },
  ];

  for (const book of initialBooks) {
    await insertBook(book);
  }
}

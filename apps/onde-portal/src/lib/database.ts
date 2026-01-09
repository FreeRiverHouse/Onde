import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'data', 'onde-books.db')

let db: Database.Database | null = null

export function getDb() {
  if (!db) {
    db = new Database(dbPath)
    initDb()
  }
  return db
}

function initDb() {
  if (!db) return

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      illustrator TEXT,
      price REAL NOT NULL,
      description TEXT,
      epub_path TEXT,
      cover_path TEXT,
      category TEXT,
      age_range TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      book_id TEXT NOT NULL,
      amount REAL NOT NULL,
      stripe_payment_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (book_id) REFERENCES books(id)
    );

    CREATE TABLE IF NOT EXISTS family_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      is_child BOOLEAN DEFAULT FALSE,
      avatar TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `)
}

export function getBooks() {
  return getDb().prepare('SELECT * FROM books ORDER BY created_at DESC').all()
}

export function getBook(id: string) {
  return getDb().prepare('SELECT * FROM books WHERE id = ?').get(id)
}

export function getUserPurchases(userId: number) {
  return getDb().prepare(`
    SELECT p.*, b.title, b.author, b.cover_path
    FROM purchases p
    JOIN books b ON p.book_id = b.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `).all(userId)
}

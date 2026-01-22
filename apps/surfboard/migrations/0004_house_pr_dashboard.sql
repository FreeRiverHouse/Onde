-- Migration: House Dashboard + PR Auto-posting
-- Date: 2026-01-21
-- Purpose: Add auto_post to posts, create books table for pipeline

-- Step 1: Add auto_post column to posts table
-- SQLite doesn't support ALTER COLUMN, so we need to recreate

CREATE TABLE IF NOT EXISTS posts_v2 (
  id TEXT PRIMARY KEY,
  account TEXT NOT NULL CHECK (account IN ('onde', 'frh', 'magmatic')),
  content TEXT NOT NULL,
  scheduled_for TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'posted')),
  feedback TEXT,
  media_files TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  approved_at TEXT,
  posted_at TEXT,
  post_url TEXT,
  twitter_post_id TEXT,
  error TEXT,
  source TEXT DEFAULT 'dashboard' CHECK (source IN ('dashboard', 'telegram', 'agent', 'scheduler')),
  auto_post INTEGER DEFAULT 1,
  posted_from TEXT CHECK (posted_from IN ('telegram', 'dashboard', 'auto', 'cron'))
);

-- Copy existing data
INSERT INTO posts_v2 (
  id, account, content, scheduled_for, status, feedback, media_files,
  created_at, approved_at, posted_at, post_url, error, source
)
SELECT
  id, account, content, scheduled_for, status, feedback, media_files,
  created_at, approved_at, posted_at, post_url, error, source
FROM posts;

-- Drop old table and rename
DROP TABLE IF EXISTS posts;
ALTER TABLE posts_v2 RENAME TO posts;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_account ON posts(account);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_auto_post ON posts(auto_post);

-- Step 2: Create books table for pipeline visualization
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'writing', 'illustrating', 'reviewing', 'published')),
  author_agent TEXT DEFAULT 'gianni-parola',
  illustrator_agent TEXT DEFAULT 'pina-pennello',
  chapters_total INTEGER DEFAULT 0,
  chapters_done INTEGER DEFAULT 0,
  illustrations_total INTEGER DEFAULT 0,
  illustrations_done INTEGER DEFAULT 0,
  cover_ready INTEGER DEFAULT 0,
  pdf_url TEXT,
  epub_url TEXT,
  kdp_asin TEXT,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  published_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);

-- Step 3: Insert existing books from Onde
INSERT OR IGNORE INTO books (id, title, slug, status, chapters_total, chapters_done, cover_ready)
VALUES
  ('milo-internet', 'MILO: Internet', 'milo-internet', 'illustrating', 10, 10, 1),
  ('milo-ai', 'MILO: AI Explained', 'milo-ai', 'writing', 8, 8, 0),
  ('salmo-23', 'Il Salmo 23 per Bambini', 'salmo-23', 'reviewing', 7, 7, 1),
  ('piccole-rime', 'Piccole Rime', 'piccole-rime', 'published', 10, 10, 1),
  ('potere-desideri', 'Il Potere dei Desideri', 'potere-desideri', 'published', 5, 5, 1);

-- Step 4: Add Editore Capo to agents if not exists
INSERT OR IGNORE INTO agents (id, name, type, description, capabilities, status)
VALUES ('editore-capo', 'Editore Capo', 'editorial', 'Editor-in-Chief coordinating book production', '["book_edit","book_review","content_create"]', 'active');

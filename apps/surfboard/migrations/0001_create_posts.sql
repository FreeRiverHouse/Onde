-- Migration: Create posts table for OndeDB
-- Date: 2026-01-21

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  account TEXT NOT NULL CHECK (account IN ('onde', 'frh', 'magmatic')),
  content TEXT NOT NULL,
  scheduled_for TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'posted')),
  feedback TEXT, -- JSON array of feedback strings
  media_files TEXT, -- JSON array of media file paths/URLs
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  approved_at TEXT,
  posted_at TEXT,
  post_url TEXT,
  error TEXT,
  source TEXT DEFAULT 'dashboard' CHECK (source IN ('dashboard', 'telegram', 'agent'))
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_account ON posts(account);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Activity log table for the activity feed
CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('post_approved', 'post_rejected', 'post_created', 'post_posted', 'deploy', 'book_updated', 'agent_action', 'image_generated')),
  title TEXT NOT NULL,
  description TEXT,
  actor TEXT,
  metadata TEXT, -- JSON for extra data
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_log(created_at DESC);

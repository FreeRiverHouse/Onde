-- Migration: Expand activity_log types for Mission Control
-- Remove restrictive CHECK constraint to allow any activity type
-- New types: task_completed, task_started, git_commit, heartbeat, alert,
--            game_tested, translation, memory_update, cron_job, monitor, error, chat_message

-- SQLite doesn't support ALTER TABLE DROP CONSTRAINT, so we recreate the table
CREATE TABLE IF NOT EXISTS activity_log_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  actor TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Copy existing data
INSERT INTO activity_log_new (id, type, title, description, actor, metadata, created_at)
  SELECT id, type, title, description, actor, metadata, created_at FROM activity_log;

-- Swap tables
DROP TABLE activity_log;
ALTER TABLE activity_log_new RENAME TO activity_log;

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_log(type);
CREATE INDEX IF NOT EXISTS idx_activity_actor ON activity_log(actor);

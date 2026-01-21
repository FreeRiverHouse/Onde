-- Migration: Create agent_tasks table for OndeDB
-- Date: 2026-01-21
-- Purpose: Task queue system for AI agents

CREATE TABLE IF NOT EXISTS agent_tasks (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('post_feedback', 'post_edit', 'book_edit', 'image_generate', 'content_create')),
  target_id TEXT,
  target_type TEXT CHECK (target_type IN ('post', 'book', 'image', 'general')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'in_progress', 'done', 'failed')),
  assigned_to TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_by TEXT DEFAULT 'dashboard',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  claimed_at TEXT,
  completed_at TEXT,
  result TEXT,
  error TEXT
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_assigned ON agent_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_priority ON agent_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_type ON agent_tasks(type);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_created_at ON agent_tasks(created_at DESC);

-- Add new activity type for task events
-- Note: SQLite doesn't support ALTER CHECK directly, so we'll add task-related activities
-- as 'agent_action' type with metadata indicating task specifics

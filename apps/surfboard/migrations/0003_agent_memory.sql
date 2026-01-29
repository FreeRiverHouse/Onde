-- Agent Memory System
-- Run: wrangler d1 execute ondaDB --file=./migrations/0003_agent_memory.sql

CREATE TABLE IF NOT EXISTS agent_memory (
  id TEXT PRIMARY KEY,
  agent_name TEXT NOT NULL,
  memory_type TEXT NOT NULL, -- 'conversation', 'decision', 'lesson', 'context', 'task_result'
  content TEXT NOT NULL,
  task_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT,
  importance INTEGER DEFAULT 0 -- 0-10, higher = more important
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_agent_memory_agent ON agent_memory(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_memory_type ON agent_memory(memory_type);
CREATE INDEX IF NOT EXISTS idx_agent_memory_created ON agent_memory(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_memory_importance ON agent_memory(importance DESC);

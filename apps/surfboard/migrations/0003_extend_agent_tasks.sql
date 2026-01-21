-- Migration: Extend agent_tasks table for multi-agent coordination
-- Date: 2026-01-21
-- Purpose: Support all FRH agents (OndePR, CEO, Engineering, QA, etc.)

-- SQLite doesn't support modifying CHECK constraints directly.
-- We need to create a new table with the extended constraints and migrate data.

-- Step 1: Create agents table for agent registry
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('social', 'editorial', 'engineering', 'qa', 'automation', 'orchestrator', 'creative')),
  description TEXT,
  capabilities TEXT,  -- JSON array of task types this agent can handle
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'offline')),
  last_seen TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Step 2: Create new agent_tasks_v2 table with extended types
CREATE TABLE IF NOT EXISTS agent_tasks_v2 (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN (
    -- Social/PR tasks (OndePR)
    'post_feedback', 'post_edit', 'post_create', 'post_approve', 'post_schedule',
    -- Book/Editorial tasks (Gianni, Pina)
    'book_edit', 'book_create', 'book_review', 'book_translate',
    -- Image tasks (Pina)
    'image_generate', 'image_edit', 'image_upscale',
    -- Content tasks (general)
    'content_create', 'content_review', 'content_translate',
    -- Engineering tasks
    'code_review', 'code_fix', 'code_deploy', 'code_test',
    -- QA tasks
    'qa_test', 'qa_report', 'qa_validate',
    -- Automation tasks
    'automation_run', 'automation_schedule', 'automation_monitor',
    -- General agent tasks
    'agent_message', 'agent_request', 'agent_response'
  )),
  target_id TEXT,
  target_type TEXT CHECK (target_type IN ('post', 'book', 'image', 'code', 'test', 'deployment', 'message', 'general')),
  description TEXT NOT NULL,
  payload TEXT,  -- JSON payload for task-specific data
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'in_progress', 'done', 'failed', 'cancelled')),
  assigned_to TEXT,  -- Agent ID or name
  source_agent TEXT,  -- Agent that created the task
  source_dashboard TEXT CHECK (source_dashboard IN ('onde.surf', 'freeriverflow', 'telegram', 'cli')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_by TEXT DEFAULT 'dashboard',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  claimed_at TEXT,
  started_at TEXT,
  completed_at TEXT,
  due_at TEXT,  -- Optional deadline
  result TEXT,
  error TEXT,
  metadata TEXT  -- JSON for additional data
);

-- Step 3: Copy existing data from agent_tasks to agent_tasks_v2
INSERT INTO agent_tasks_v2 (
  id, type, target_id, target_type, description, status,
  assigned_to, priority, created_by, created_at,
  claimed_at, completed_at, result, error
)
SELECT
  id, type, target_id, target_type, description, status,
  assigned_to, priority, created_by, created_at,
  claimed_at, completed_at, result, error
FROM agent_tasks;

-- Step 4: Drop old table and rename
DROP TABLE IF EXISTS agent_tasks;
ALTER TABLE agent_tasks_v2 RENAME TO agent_tasks;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_assigned ON agent_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_priority ON agent_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_type ON agent_tasks(type);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_source ON agent_tasks(source_dashboard);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_created_at ON agent_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_due_at ON agent_tasks(due_at);

-- Step 6: Insert default agents
INSERT OR IGNORE INTO agents (id, name, type, description, capabilities, status)
VALUES
  ('onde-pr', 'OndePR', 'social', 'Social media and PR agent', '["post_feedback","post_edit","post_create","post_approve","post_schedule"]', 'active'),
  ('gianni-parola', 'Gianni Parola', 'editorial', 'Writer agent for Onde books', '["book_edit","book_create","book_review","content_create"]', 'active'),
  ('pina-pennello', 'Pina Pennello', 'creative', 'Illustrator agent for Onde', '["image_generate","image_edit","image_upscale"]', 'active'),
  ('ceo-orchestrator', 'CEO Orchestrator', 'orchestrator', 'CEO agent coordinating all projects', '["agent_message","agent_request"]', 'active'),
  ('engineering-dept', 'Engineering', 'engineering', 'Engineering department agent', '["code_review","code_fix","code_deploy","code_test"]', 'active'),
  ('qa-test-engineer', 'QA Team', 'qa', 'QA and testing agent', '["qa_test","qa_report","qa_validate"]', 'active'),
  ('automation-architect', 'Automation', 'automation', 'Automation and CI/CD agent', '["automation_run","automation_schedule","automation_monitor"]', 'active');

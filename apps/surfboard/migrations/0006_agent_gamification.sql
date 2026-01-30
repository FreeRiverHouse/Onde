-- Migration: Agent Gamification - XP, Levels, and Badges
-- Date: 2026-01-31
-- Purpose: Add gamification system for agents in Free River House

-- SQLite doesn't support ALTER TABLE ADD COLUMN with CHECK constraints well,
-- so we create a new table and migrate data

-- Step 1: Create new agents_v2 table with gamification columns
CREATE TABLE IF NOT EXISTS agents_v2 (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('social', 'editorial', 'engineering', 'qa', 'automation', 'orchestrator', 'creative', 'ai')),
  description TEXT,
  capabilities TEXT,  -- JSON array of task types this agent can handle
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'offline')),
  last_seen TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  -- Gamification columns
  xp INTEGER DEFAULT 0,  -- Experience points
  level INTEGER DEFAULT 1,  -- Calculated: floor(xp/100) + 1
  total_tasks_done INTEGER DEFAULT 0,  -- Total tasks completed
  current_streak INTEGER DEFAULT 0,  -- Consecutive days with completed tasks
  longest_streak INTEGER DEFAULT 0,  -- Best streak ever
  badges TEXT DEFAULT '[]',  -- JSON array of earned badge IDs
  last_task_at TEXT  -- When the agent last completed a task
);

-- Step 2: Copy existing data
INSERT INTO agents_v2 (
  id, name, type, description, capabilities, status, last_seen, created_at
)
SELECT
  id, name, type, description, capabilities, status, last_seen, created_at
FROM agents;

-- Step 3: Drop old table and rename
DROP TABLE IF EXISTS agents;
ALTER TABLE agents_v2 RENAME TO agents;

-- Step 4: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(type);
CREATE INDEX IF NOT EXISTS idx_agents_level ON agents(level);
CREATE INDEX IF NOT EXISTS idx_agents_xp ON agents(xp);

-- Step 5: Initialize XP based on completed tasks count (retroactive)
-- Calculate initial XP as 10 * number of completed tasks
UPDATE agents SET 
  xp = COALESCE((
    SELECT COUNT(*) * 10 
    FROM agent_tasks 
    WHERE agent_tasks.assigned_to = agents.id 
    AND agent_tasks.status = 'done'
  ), 0),
  total_tasks_done = COALESCE((
    SELECT COUNT(*) 
    FROM agent_tasks 
    WHERE agent_tasks.assigned_to = agents.id 
    AND agent_tasks.status = 'done'
  ), 0);

-- Step 6: Calculate initial levels (level = floor(xp/100) + 1)
UPDATE agents SET level = (xp / 100) + 1;

-- Step 7: Create badges reference table
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,  -- Emoji or icon name
  requirement TEXT,  -- JSON describing unlock criteria
  xp_bonus INTEGER DEFAULT 0,  -- Bonus XP when earned
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Step 8: Insert default badges
INSERT OR IGNORE INTO badges (id, name, description, icon, requirement, xp_bonus)
VALUES
  ('first-task', 'First Steps', 'Completed first task', '🎯', '{"tasks_done": 1}', 10),
  ('task-10', 'Warming Up', 'Completed 10 tasks', '🔥', '{"tasks_done": 10}', 25),
  ('task-50', 'Seasoned', 'Completed 50 tasks', '⭐', '{"tasks_done": 50}', 50),
  ('task-100', 'Centurion', 'Completed 100 tasks', '💯', '{"tasks_done": 100}', 100),
  ('task-500', 'Legend', 'Completed 500 tasks', '🏆', '{"tasks_done": 500}', 250),
  ('level-5', 'Rising Star', 'Reached level 5', '🌟', '{"level": 5}', 25),
  ('level-10', 'Expert', 'Reached level 10', '💎', '{"level": 10}', 50),
  ('level-25', 'Master', 'Reached level 25', '👑', '{"level": 25}', 100),
  ('streak-7', 'Week Warrior', '7 day task streak', '🔗', '{"streak": 7}', 25),
  ('streak-30', 'Monthly Master', '30 day task streak', '⛓️', '{"streak": 30}', 100),
  ('speed-demon', 'Speed Demon', 'Completed 5 tasks in 1 hour', '⚡', '{"tasks_per_hour": 5}', 50),
  ('night-owl', 'Night Owl', 'Completed task after midnight', '🦉', '{"night_task": true}', 10),
  ('early-bird', 'Early Bird', 'Completed task before 6 AM', '🐦', '{"early_task": true}', 10);

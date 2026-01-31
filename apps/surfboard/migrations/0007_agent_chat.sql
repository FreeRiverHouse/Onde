-- Migration: Agent Chat Messages
-- Created: 2026-01-31
-- Purpose: Enable real-time chat between onde.surf dashboard and Clawdbot sessions

-- Messages table for chat queue
CREATE TABLE IF NOT EXISTS agent_chat_messages (
  id TEXT PRIMARY KEY,
  session_key TEXT NOT NULL,           -- Target session (e.g., 'telegram:7505631979', 'main')
  agent_id TEXT NOT NULL,              -- Target agent (e.g., 'clawdinho', 'onde-bot')
  sender TEXT NOT NULL,                -- Who sent it ('dashboard', 'agent')
  sender_name TEXT,                    -- Human-readable name
  content TEXT NOT NULL,               -- Message content
  status TEXT DEFAULT 'pending',       -- pending, delivered, read, error
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  delivered_at DATETIME,
  read_at DATETIME,
  metadata TEXT                        -- JSON for extra data (attachments, etc)
);

-- Index for efficient polling by agent
CREATE INDEX IF NOT EXISTS idx_agent_chat_agent_status 
ON agent_chat_messages(agent_id, status, created_at);

-- Index for session history
CREATE INDEX IF NOT EXISTS idx_agent_chat_session 
ON agent_chat_messages(session_key, created_at);

-- Index for pending messages pickup
CREATE INDEX IF NOT EXISTS idx_agent_chat_pending 
ON agent_chat_messages(status, agent_id) 
WHERE status = 'pending';

-- Chat sessions table (tracks active conversations)
CREATE TABLE IF NOT EXISTS agent_chat_sessions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  user_id TEXT,                        -- Dashboard user if authenticated
  session_name TEXT,                   -- Human-readable name
  last_message_at DATETIME,
  message_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT
);

CREATE INDEX IF NOT EXISTS idx_agent_chat_sessions_agent 
ON agent_chat_sessions(agent_id, last_message_at);

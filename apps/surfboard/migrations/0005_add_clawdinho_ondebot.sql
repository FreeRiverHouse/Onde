-- Migration: Add Clawdinho and Onde-bot to agents table
-- Date: 2026-01-29
-- Purpose: Register core AI agents (real Clawdbot sessions) in DB

-- Clawdinho: Main AI coordinator (like a CEO/orchestrator)
INSERT OR IGNORE INTO agents (id, name, type, description, capabilities, status)
VALUES (
  'clawdinho', 
  'Clawdinho', 
  'orchestrator', 
  'Main AI agent - coordinates all tasks, talks to human, delegates to sub-agents. Real Clawdbot session.', 
  '["agent_message","agent_request","agent_response","code_review","content_create","automation_run"]', 
  'active'
);

-- Onde-bot (ex Ondinho): Brother agent for parallel work
INSERT OR IGNORE INTO agents (id, name, type, description, capabilities, status)
VALUES (
  'onde-bot', 
  'Onde-bot', 
  'creative', 
  'Brother agent for parallel tasks. Autonomous but coordinated by Clawdinho. Real Clawdbot sub-agent.', 
  '["agent_message","content_create","book_translate","image_generate","automation_run"]', 
  'active'
);

-- Also add Sally if not exists (from AGENT_VISUALS)
INSERT OR IGNORE INTO agents (id, name, type, description, capabilities, status)
VALUES (
  'sally', 
  'Sally', 
  'automation', 
  'General assistant for support tasks.', 
  '["agent_message","content_create"]', 
  'active'
);

-- And Video Factory
INSERT OR IGNORE INTO agents (id, name, type, description, capabilities, status)
VALUES (
  'video-factory', 
  'Video Factory', 
  'creative', 
  'Video content production agent.', 
  '["content_create","image_generate","image_edit"]', 
  'active'
);

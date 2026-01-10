const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const ONDE_ROOT = '/Users/mattia/Projects/Onde';
const DB_PATH = path.join(ONDE_ROOT, '.claude-memory', 'memories.db');

// Ensure directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'idea',
    source TEXT DEFAULT 'chat',
    date TEXT,
    saved_to_roadmap BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS handoffs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    yaml_content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    start_time DATETIME,
    end_time DATETIME,
    status TEXT DEFAULT 'active'
  );

  CREATE INDEX IF NOT EXISTS idx_memories_date ON memories(date);
  CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
`);

console.log('Database initialized at:', DB_PATH);
db.close();

import Database from 'better-sqlite3'
import { join } from 'path'
import { app } from 'electron'

export let db: Database.Database;

export function initDb() {
  const userDataPath = app.getPath('userData');
  const dbPath = join(userDataPath, 'free-river-flow.db');

  db = new Database(dbPath, { verbose: console.log });
  db.pragma('journal_mode = WAL');

  // Basic migrations
  db.exec(`
    CREATE TABLE IF NOT EXISTS dictations (
      id TEXT PRIMARY KEY,
      user_id TEXT DEFAULT 'local',
      device_id TEXT DEFAULT 'local',
      project_id TEXT,
      raw_transcript TEXT NOT NULL,
      processed_text TEXT NOT NULL,
      language TEXT DEFAULT 'en',
      app_name TEXT,
      app_bundle_id TEXT,
      window_title TEXT,
      input_mode TEXT DEFAULT 'push',
      started_at DATETIME NOT NULL,
      ended_at DATETIME NOT NULL,
      duration_ms INTEGER NOT NULL,
      word_count INTEGER DEFAULT 0,
      char_count INTEGER DEFAULT 0,
      wpm REAL DEFAULT 0,
      whisper_model TEXT DEFAULT 'base.en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      synced_at DATETIME,
      is_deleted INTEGER DEFAULT 0
    );
  `);
}

export function saveDictation(record: any) {
  const stmt = db.prepare(`
    INSERT INTO dictations (
      id, user_id, device_id, raw_transcript, processed_text, 
      started_at, ended_at, duration_ms, word_count
    ) VALUES (
      @id, @user_id, @device_id, @raw_transcript, @processed_text,
      @started_at, @ended_at, @duration_ms, @word_count
    )
  `);
  stmt.run(record);
}

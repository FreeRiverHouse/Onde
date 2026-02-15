import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

const MIGRATIONS = [
  // 0007_agent_chat.sql
  `CREATE TABLE IF NOT EXISTS agent_chat_messages (
    id TEXT PRIMARY KEY,
    session_key TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    sender_name TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivered_at DATETIME,
    read_at DATETIME,
    metadata TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_agent_chat_agent_status ON agent_chat_messages(agent_id, status, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_agent_chat_session ON agent_chat_messages(session_key, created_at)`,
  `CREATE TABLE IF NOT EXISTS agent_chat_sessions (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    user_id TEXT,
    session_name TEXT,
    last_message_at DATETIME,
    message_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_agent_chat_sessions_agent ON agent_chat_sessions(agent_id, last_message_at)`,
  // 0006_metrics_history.sql
  `CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_name TEXT NOT NULL,
    metric_value REAL,
    metric_text TEXT,
    category TEXT NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    source TEXT DEFAULT 'manual'
  )`,
  `CREATE INDEX IF NOT EXISTS idx_metrics_name_date ON metrics(metric_name, recorded_at)`,
  `CREATE INDEX IF NOT EXISTS idx_metrics_category ON metrics(category, recorded_at)`,
]

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (authHeader !== 'Bearer onde-admin-migrate-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { env } = getRequestContext()
    
    if (!env?.DB) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const results: string[] = []
    for (const sql of MIGRATIONS) {
      try {
        const result = await env.DB.prepare(sql).run()
        results.push(`✅ ${sql.substring(0, 60)}... success=${result.success}`)
      } catch (e) {
        results.push(`⚠️ ${sql.substring(0, 60)}... — ${e instanceof Error ? e.message : 'error'}`)
      }
    }

    return NextResponse.json({ ok: true, results })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

import { NextResponse, NextRequest } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

// Auth tokens — one per bot + one for Mattia
const TOKENS: Record<string, string> = {
  [process.env.HOUSE_TOKEN_MATTIA || 'mattia-house-token']: 'Mattia',
  [process.env.HOUSE_TOKEN_CLAWDINHO || 'clawdinho-house-token']: 'Clawdinho',
  [process.env.HOUSE_TOKEN_ONDINHO || 'ondinho-house-token']: 'Ondinho',
  [process.env.HOUSE_TOKEN_BUBBLE || 'bubble-house-token']: 'Bubble',
}

function authenticate(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  return TOKENS[token] || null
}

// GET /api/house/chat — get messages
export async function GET(req: NextRequest) {
  const { env } = getRequestContext()
  const db = env.DB
  if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

  // Ensure table exists
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS house_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      reply_to INTEGER
    )
  `).run()

  const url = new URL(req.url)
  const afterId = url.searchParams.get('after_id')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 200)
  const mentioning = url.searchParams.get('mentioning')

  let query: string
  let params: (string | number)[]

  if (afterId) {
    if (mentioning) {
      query = 'SELECT * FROM house_messages WHERE id > ? AND content LIKE ? ORDER BY id ASC LIMIT ?'
      params = [parseInt(afterId), `%@${mentioning}%`, limit]
    } else {
      query = 'SELECT * FROM house_messages WHERE id > ? ORDER BY id ASC LIMIT ?'
      params = [parseInt(afterId), limit]
    }
  } else {
    if (mentioning) {
      query = 'SELECT * FROM (SELECT * FROM house_messages WHERE content LIKE ? ORDER BY id DESC LIMIT ?) sub ORDER BY id ASC'
      params = [`%@${mentioning}%`, limit]
    } else {
      query = 'SELECT * FROM (SELECT * FROM house_messages ORDER BY id DESC LIMIT ?) sub ORDER BY id ASC'
      params = [limit]
    }
  }

  const result = await db.prepare(query).bind(...params).all()

  return NextResponse.json({
    ok: true,
    messages: result.results || [],
    count: result.results?.length || 0,
    serverTime: Date.now(),
  })
}

// POST /api/house/chat — send a message
export async function POST(req: NextRequest) {
  const sender = authenticate(req)
  if (!sender) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { env } = getRequestContext()
  const db = env.DB
  if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

  // Ensure table exists
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS house_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      reply_to INTEGER
    )
  `).run()

  let body: { content?: string; reply_to?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.content?.trim()) {
    return NextResponse.json({ error: 'Content required' }, { status: 400 })
  }

  const result = await db.prepare(
    'INSERT INTO house_messages (sender, content, reply_to) VALUES (?, ?, ?)'
  ).bind(sender, body.content.trim(), body.reply_to || null).run()

  // Fetch the inserted message
  const msg = await db.prepare(
    'SELECT * FROM house_messages WHERE id = ?'
  ).bind(result.meta.last_row_id).first()

  return NextResponse.json({ ok: true, message: msg })
}

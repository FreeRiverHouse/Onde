import { NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

// Valid activity types - expanded for Mission Control
const VALID_TYPES = [
  'post_approved', 'post_rejected', 'post_created', 'post_posted',
  'deploy', 'book_updated', 'agent_action', 'image_generated',
  'task_completed', 'task_started', 'git_commit', 'heartbeat',
  'alert', 'game_tested', 'translation', 'memory_update',
  'cron_job', 'monitor', 'error', 'chat_message'
]

// Empty fallback - no mock data (DASH-013: removed hardcoded mock activities)
const emptyActivities: { id: number; type: string; title: string; description: string; actor: string; created_at: string }[] = []

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const type = searchParams.get('type') // Filter by type
    const actor = searchParams.get('actor') // Filter by actor

    const { env } = getRequestContext()
    const db = env.DB

    if (db) {
      // Use D1 database with optional filters
      let query = 'SELECT * FROM activity_log'
      const params: (string | number)[] = []
      const conditions: string[] = []

      if (type) {
        conditions.push('type = ?')
        params.push(type)
      }
      if (actor) {
        conditions.push('actor = ?')
        params.push(actor)
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ')
      }
      query += ' ORDER BY created_at DESC LIMIT ?'
      params.push(limit)

      const result = await db.prepare(query).bind(...params).all()
      const activities = result.results.map((row: Record<string, unknown>) => ({
        id: row.id as number,
        type: row.type as string,
        title: row.title as string,
        description: row.description as string | undefined,
        actor: row.actor as string | undefined,
        metadata: row.metadata ? JSON.parse(row.metadata as string) : undefined,
        created_at: row.created_at as string,
      }))
      return NextResponse.json({ activities, source: 'd1' })
    } else {
      // No D1 database available - return empty (DASH-013: no mock fallback)
      return NextResponse.json({ activities: emptyActivities, source: 'no-db', notice: 'No activity data available. D1 database not configured.' })
    }
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json({ activities: emptyActivities, source: 'error', notice: 'Failed to fetch activity data.' })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, title, description, actor, metadata } = body

    // Validate required fields
    if (!type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title' },
        { status: 400 }
      )
    }

    // Validate type (allow any type for forward compatibility, but warn on unknown)
    const isKnownType = VALID_TYPES.includes(type)

    const { env } = getRequestContext()
    const db = env.DB

    if (db) {
      const result = await db.prepare(
        'INSERT INTO activity_log (type, title, description, actor, metadata) VALUES (?, ?, ?, ?, ?)'
      ).bind(
        type,
        title,
        description || null,
        actor || 'system',
        metadata ? JSON.stringify(metadata) : null
      ).run()

      return NextResponse.json({
        ok: true,
        id: result.meta?.last_row_id,
        knownType: isKnownType,
      })
    } else {
      // Dev mode: just acknowledge (no D1 database available)
      return NextResponse.json({
        ok: true,
        id: Date.now(),
        source: 'no-db',
        knownType: isKnownType,
      })
    }
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}

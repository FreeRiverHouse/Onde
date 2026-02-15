import { NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { syncPlayer, getCorsHeaders } from '@/lib/players'

export const runtime = 'edge'

/**
 * POST /api/players/[nickname]/sync
 * Body: { xp?, coins?, level?, gamesPlayed? }
 * Updates player data (only increases values to prevent cheating)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ nickname: string }> }
) {
  const cors = getCorsHeaders(request)

  try {
    const { env } = getRequestContext()
    const kv = env.PLAYERS_KV

    if (!kv) {
      return NextResponse.json(
        { ok: false, error: 'Storage not available' },
        { status: 500, headers: cors }
      )
    }

    const { nickname } = await params
    const body = await request.json()

    const { xp, coins, level, gamesPlayed } = body

    const updated = await syncPlayer(kv, nickname, {
      xp: typeof xp === 'number' ? xp : undefined,
      coins: typeof coins === 'number' ? coins : undefined,
      level: typeof level === 'number' ? level : undefined,
      gamesPlayed: typeof gamesPlayed === 'number' ? gamesPlayed : undefined,
    })

    if (!updated) {
      return NextResponse.json(
        { ok: false, error: 'Player not found' },
        { status: 404, headers: cors }
      )
    }

    return NextResponse.json({
      ok: true,
      player: {
        nickname: updated.nickname,
        xp: updated.xp,
        level: updated.level,
        coins: updated.coins,
        gamesPlayed: updated.gamesPlayed,
        lastSyncAt: updated.lastSyncAt,
      }
    }, { headers: cors })
  } catch (error) {
    console.error('Player sync error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: cors }
    )
  }
}

/**
 * OPTIONS /api/players/[nickname]/sync - CORS preflight
 */
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  })
}

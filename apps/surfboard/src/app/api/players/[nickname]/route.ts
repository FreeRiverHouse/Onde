import { NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { getPlayer, getCorsHeaders } from '@/lib/players'

export const runtime = 'edge'

/**
 * GET /api/players/[nickname]
 * Returns player data or 404
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ nickname: string }> }
) {
  const cors = getCorsHeaders(request)

  try {
    const { env } = getRequestContext()
    const kv = env.PLAYERS_KV

    if (!kv) {
      return NextResponse.json(
        { error: 'Storage not available' },
        { status: 500, headers: cors }
      )
    }

    const { nickname } = await params
    const player = await getPlayer(kv, nickname)

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404, headers: cors }
      )
    }

    return NextResponse.json({
      nickname: player.nickname,
      xp: player.xp,
      level: player.level,
      coins: player.coins,
      gamesPlayed: player.gamesPlayed,
      joinedAt: player.joinedAt,
    }, { headers: cors })
  } catch (error) {
    console.error('Player GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: cors }
    )
  }
}

/**
 * OPTIONS /api/players/[nickname] - CORS preflight
 */
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  })
}

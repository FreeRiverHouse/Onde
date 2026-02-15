import { NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { registerPlayer, getCorsHeaders } from '@/lib/players'

export const runtime = 'edge'

/**
 * POST /api/players/register
 * Body: { nickname: string }
 * Returns: { ok: true, playerId, nickname } or { ok: false, error }
 */
export async function POST(request: Request) {
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

    const body = await request.json()
    const { nickname } = body

    if (!nickname || typeof nickname !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Nickname is required' },
        { status: 400, headers: cors }
      )
    }

    const result = await registerPlayer(kv, nickname)

    if (!result.ok) {
      return NextResponse.json(result, { status: 409, headers: cors })
    }

    return NextResponse.json(result, { status: 201, headers: cors })
  } catch (error) {
    console.error('Player register error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500, headers: cors }
    )
  }
}

/**
 * OPTIONS /api/players/register - CORS preflight
 */
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  })
}

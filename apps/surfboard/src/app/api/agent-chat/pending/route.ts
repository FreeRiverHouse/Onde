/**
 * Agent Chat Pending Messages API
 * 
 * GET /api/agent-chat/pending?agentId=ondinho
 * Returns pending dashboard messages for an agent to pick up
 * 
 * PATCH /api/agent-chat/pending
 * Mark messages as delivered + optionally attach agent response
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { nanoid } from 'nanoid'

export const runtime = 'edge'

// GET - Fetch pending messages for an agent
export async function GET(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const db = env.DB

    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')

    if (!agentId) {
      return NextResponse.json({ error: 'agentId required' }, { status: 400 })
    }

    // Get pending messages from dashboard users (not agent messages)
    const result = await db.prepare(`
      SELECT * FROM agent_chat_messages 
      WHERE agent_id = ? AND sender = 'dashboard' AND status = 'pending'
      ORDER BY created_at ASC
      LIMIT 10
    `).bind(agentId).all()

    return NextResponse.json({
      pending: result.results || [],
      count: (result.results || []).length,
    })
  } catch (error) {
    console.error('Pending messages error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

// PATCH - Mark messages as delivered + add agent response
export async function PATCH(request: NextRequest) {
  try {
    const { env } = getRequestContext()
    const db = env.DB

    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const body = await request.json()
    const { messageId, status, agentResponse, agentId, sessionKey } = body

    if (!messageId) {
      return NextResponse.json({ error: 'messageId required' }, { status: 400 })
    }

    // Update message status
    const newStatus = status || 'delivered'
    await db.prepare(`
      UPDATE agent_chat_messages 
      SET status = ?, delivered_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(newStatus, messageId).run()

    // If agent response provided, insert it as a new message
    if (agentResponse && agentId) {
      const responseId = nanoid()
      const effectiveSessionKey = sessionKey || `dashboard:${agentId}:response`

      await db.prepare(`
        INSERT INTO agent_chat_messages (
          id, session_key, agent_id, sender, sender_name, content, status, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        responseId,
        effectiveSessionKey,
        agentId,
        'agent',
        agentId,
        agentResponse,
        'delivered',
        JSON.stringify({ source: 'cron-pickup' })
      ).run()

      return NextResponse.json({
        success: true,
        messageId,
        responseId,
        status: newStatus,
      })
    }

    return NextResponse.json({
      success: true,
      messageId,
      status: newStatus,
    })
  } catch (error) {
    console.error('Patch message error:', error)
    return NextResponse.json(
      { error: 'Failed to update message', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

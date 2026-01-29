import { NextRequest, NextResponse } from 'next/server'
import { getDashboardMetrics, recordMetricsBatch } from '@/lib/metrics'
import { getDB } from '@/lib/db'

export const runtime = 'edge'

// Env type for Cloudflare
interface Env {
  DB: D1Database
}

// GET /api/metrics - Get dashboard metrics
export async function GET(request: NextRequest) {
  try {
    // Access the env from the request context
    // @ts-expect-error - Cloudflare context
    const env = (request as { env?: Env }).env || (globalThis as { env?: Env }).env
    
    if (!env?.DB) {
      return NextResponse.json(
        { error: 'Database not configured', hasData: false },
        { status: 500 }
      )
    }
    
    const db = getDB(env)
    const metrics = await getDashboardMetrics(db)
    
    // Check if we have any actual data
    const hasData = 
      metrics.publishing.booksPublished !== null ||
      metrics.social.xFollowers !== null ||
      metrics.analytics.pageviews !== null
    
    return NextResponse.json({
      ...metrics,
      hasData
    })
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics', hasData: false },
      { status: 500 }
    )
  }
}

// POST /api/metrics - Record new metrics
// Note: In production, add proper authentication
export async function POST(request: NextRequest) {
  try {
    // Simple API key check (can be enhanced with proper auth)
    const authHeader = request.headers.get('Authorization')
    const apiKey = process.env.METRICS_API_KEY
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // @ts-expect-error - Cloudflare context
    const env = (request as { env?: Env }).env || (globalThis as { env?: Env }).env
    
    if (!env?.DB) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }
    
    const db = getDB(env)
    const body = await request.json()
    
    // Validate input
    if (!body.metrics || !Array.isArray(body.metrics)) {
      return NextResponse.json(
        { error: 'Invalid input: expected { metrics: [...] }' },
        { status: 400 }
      )
    }
    
    // Record metrics
    await recordMetricsBatch(db, body.metrics)
    
    return NextResponse.json({ success: true, recorded: body.metrics.length })
  } catch (error) {
    console.error('Error recording metrics:', error)
    return NextResponse.json(
      { error: 'Failed to record metrics' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getMetricWithHistory } from '@/lib/metrics'
import { getDB } from '@/lib/db'

export const runtime = 'edge'

interface Env {
  DB: D1Database
}

// GET /api/metrics/history?key=books_published&days=30
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metricKey = searchParams.get('key')
    const days = parseInt(searchParams.get('days') || '30', 10)
    
    if (!metricKey) {
      return NextResponse.json(
        { error: 'Missing required parameter: key' },
        { status: 400 }
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
    const metricWithHistory = await getMetricWithHistory(db, metricKey, days)
    
    if (!metricWithHistory) {
      return NextResponse.json(
        { error: 'Metric not found', key: metricKey },
        { status: 404 }
      )
    }
    
    return NextResponse.json(metricWithHistory)
  } catch (error) {
    console.error('Error fetching metric history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metric history' },
      { status: 500 }
    )
  }
}

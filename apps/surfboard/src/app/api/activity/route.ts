import { NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { getActivityLogFromD1 } from '@/lib/posts'

export const runtime = 'edge'

// Fallback mock activities for development
const mockActivities = [
  { id: 1, type: 'deploy', title: 'onde.surf deployed', description: 'Production build v1.2.0', actor: 'CI/CD', created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
  { id: 2, type: 'post_approved', title: 'Quote post approved', description: '@Onde_FRH - Marcus Aurelius', actor: 'Mattia', created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: 3, type: 'image_generated', title: 'MILO illustration created', description: 'Chapter 5 - Internet safety', actor: 'Grok', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 4, type: 'book_updated', title: 'Piccole Rime updated', description: 'Added new poem - Stella Stellina', actor: 'Gianni Parola', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  { id: 5, type: 'agent_action', title: 'QA tests completed', description: 'All 19 tests passed', actor: 'QA Agent', created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const { env } = getRequestContext()
    const db = env.DB

    if (db) {
      // Use D1 database
      const activities = await getActivityLogFromD1(db, limit)
      return NextResponse.json({ activities, source: 'd1' })
    } else {
      // Fallback to mock data for local dev
      return NextResponse.json({ activities: mockActivities.slice(0, limit), source: 'mock' })
    }
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json({ activities: mockActivities, source: 'mock-fallback' })
  }
}

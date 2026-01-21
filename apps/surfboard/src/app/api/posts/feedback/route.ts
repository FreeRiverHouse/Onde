import { NextResponse } from 'next/server'
import { addFeedback } from '@/lib/posts'

export async function POST(request: Request) {
  try {
    const { id, feedback } = await request.json()

    if (!id || !feedback) {
      return NextResponse.json({ error: 'Post ID and feedback required' }, { status: 400 })
    }

    const success = addFeedback(id, feedback)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Feedback sent to OndePR agent for content regeneration'
      })
    } else {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

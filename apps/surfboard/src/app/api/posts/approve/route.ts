import { NextResponse } from 'next/server'
import { approvePost } from '@/lib/posts'

export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
    }

    const success = approvePost(id)

    if (success) {
      return NextResponse.json({ success: true, message: 'Post approved' })
    } else {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

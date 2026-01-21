import { NextResponse } from 'next/server'
import { getPendingPosts } from '@/lib/posts'

export async function GET() {
  const posts = getPendingPosts()
  return NextResponse.json({ posts })
}

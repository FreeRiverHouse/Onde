import { NextResponse } from 'next/server'
import { getCurrentUser, getUserPurchases } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ purchases: [] }, { status: 401 })
  }

  const purchases = getUserPurchases(user.id)

  return NextResponse.json({ purchases })
}

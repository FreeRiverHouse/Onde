import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  getProfilesByUser,
  createParentProfile,
  createChildProfile,
  AVATAR_EMOJIS
} from '@/lib/family'

// GET - List all family profiles
export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  let profiles = getProfilesByUser(user.id)

  // If no profiles exist, create parent profile automatically
  if (profiles.length === 0) {
    const parentProfile = createParentProfile(user.id, user.name || 'Genitore')
    profiles = [parentProfile]
  }

  return NextResponse.json({
    profiles: profiles.map(p => ({
      id: p.id,
      name: p.name,
      avatarEmoji: p.avatarEmoji,
      age: p.age,
      isChild: p.isChild,
      createdAt: p.createdAt
    })),
    avatarOptions: AVATAR_EMOJIS,
    maxProfiles: 5
  })
}

// POST - Create a new child profile
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, avatarEmoji, age } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Nome richiesto' }, { status: 400 })
    }

    if (name.length > 50) {
      return NextResponse.json({ error: 'Nome troppo lungo' }, { status: 400 })
    }

    // Ensure parent profile exists first
    let profiles = getProfilesByUser(user.id)
    if (profiles.length === 0) {
      createParentProfile(user.id, user.name || 'Genitore')
    }

    const profile = createChildProfile(
      user.id,
      name.trim(),
      avatarEmoji || AVATAR_EMOJIS[0],
      age
    )

    if (!profile) {
      return NextResponse.json(
        { error: 'Limite profili raggiunto (max 5)' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        avatarEmoji: profile.avatarEmoji,
        age: profile.age,
        isChild: profile.isChild
      }
    })
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

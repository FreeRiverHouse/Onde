import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  getProfile,
  updateProfile,
  updateProfilePreferences,
  deleteProfile,
  getReadingStats
} from '@/lib/family'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get a specific profile
export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  const { id } = await params
  const profile = getProfile(id)

  if (!profile) {
    return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
  }

  // Check ownership
  if (profile.userId !== user.id) {
    return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
  }

  const stats = getReadingStats(id)

  return NextResponse.json({
    profile: {
      id: profile.id,
      name: profile.name,
      avatarEmoji: profile.avatarEmoji,
      age: profile.age,
      isChild: profile.isChild,
      preferences: profile.preferences,
      createdAt: profile.createdAt
    },
    stats
  })
}

// PATCH - Update a profile
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  const { id } = await params
  const profile = getProfile(id)

  if (!profile) {
    return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
  }

  // Check ownership
  if (profile.userId !== user.id) {
    return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { name, avatarEmoji, age, preferences } = body

    // Update basic info
    if (name !== undefined || avatarEmoji !== undefined || age !== undefined) {
      const updated = updateProfile(id, { name, avatarEmoji, age })
      if (!updated) {
        return NextResponse.json({ error: 'Errore aggiornamento' }, { status: 500 })
      }
    }

    // Update preferences
    if (preferences) {
      updateProfilePreferences(id, preferences)
    }

    const updatedProfile = getProfile(id)!

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedProfile.id,
        name: updatedProfile.name,
        avatarEmoji: updatedProfile.avatarEmoji,
        age: updatedProfile.age,
        isChild: updatedProfile.isChild,
        preferences: updatedProfile.preferences
      }
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

// DELETE - Delete a child profile
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  const { id } = await params
  const profile = getProfile(id)

  if (!profile) {
    return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
  }

  // Cannot delete parent profile
  if (!profile.isChild) {
    return NextResponse.json(
      { error: 'Non puoi eliminare il profilo principale' },
      { status: 400 }
    )
  }

  const deleted = deleteProfile(id, user.id)

  if (!deleted) {
    return NextResponse.json({ error: 'Errore eliminazione' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

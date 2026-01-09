// Family profiles module for Onde Portal
// Allows parents to manage children profiles under one account

import crypto from 'crypto'

// Types
export interface FamilyProfile {
  id: string
  userId: string        // Parent user ID
  name: string
  avatarEmoji: string   // Simple emoji avatar
  age?: number
  isChild: boolean
  createdAt: Date
  readingProgress: ReadingProgress[]
  preferences: ProfilePreferences
}

export interface ReadingProgress {
  bookId: string
  currentChapter: number
  totalChapters: number
  lastReadAt: Date
  completed: boolean
}

export interface ProfilePreferences {
  fontSize: 'small' | 'medium' | 'large'
  theme: 'light' | 'dark' | 'sepia'
  readAloud: boolean
  autoPlay: boolean
}

// Avatar emoji options for children
export const AVATAR_EMOJIS = [
  '🦊', '🐻', '🐰', '🦁', '🐼',
  '🦄', '🐸', '🦋', '🌟', '🌈',
  '🚀', '🎨', '📚', '🎸', '⚽',
  '🧸', '🎭', '🎪', '🎠', '🏰'
]

// Default preferences for children
const DEFAULT_CHILD_PREFERENCES: ProfilePreferences = {
  fontSize: 'large',
  theme: 'light',
  readAloud: true,
  autoPlay: false
}

// Default preferences for adults
const DEFAULT_ADULT_PREFERENCES: ProfilePreferences = {
  fontSize: 'medium',
  theme: 'dark',
  readAloud: false,
  autoPlay: false
}

// In-memory store (replace with database in production)
const profiles: Map<string, FamilyProfile> = new Map()

// Constants
const MAX_PROFILES_PER_USER = 5
const ACTIVE_PROFILE_COOKIE = 'onde_active_profile'

/**
 * Create the main parent profile
 */
export function createParentProfile(userId: string, name: string): FamilyProfile {
  const id = crypto.randomUUID()

  const profile: FamilyProfile = {
    id,
    userId,
    name,
    avatarEmoji: '👤',
    isChild: false,
    createdAt: new Date(),
    readingProgress: [],
    preferences: DEFAULT_ADULT_PREFERENCES
  }

  profiles.set(id, profile)
  return profile
}

/**
 * Create a child profile
 */
export function createChildProfile(
  userId: string,
  name: string,
  avatarEmoji: string,
  age?: number
): FamilyProfile | null {
  // Check max profiles limit
  const userProfiles = getProfilesByUser(userId)
  if (userProfiles.length >= MAX_PROFILES_PER_USER) {
    return null
  }

  // Validate emoji
  if (!AVATAR_EMOJIS.includes(avatarEmoji)) {
    avatarEmoji = AVATAR_EMOJIS[0]
  }

  const id = crypto.randomUUID()

  const profile: FamilyProfile = {
    id,
    userId,
    name,
    avatarEmoji,
    age,
    isChild: true,
    createdAt: new Date(),
    readingProgress: [],
    preferences: DEFAULT_CHILD_PREFERENCES
  }

  profiles.set(id, profile)
  return profile
}

/**
 * Get all profiles for a user
 */
export function getProfilesByUser(userId: string): FamilyProfile[] {
  return Array.from(profiles.values())
    .filter(p => p.userId === userId)
    .sort((a, b) => {
      // Parent first, then by creation date
      if (a.isChild !== b.isChild) return a.isChild ? 1 : -1
      return a.createdAt.getTime() - b.createdAt.getTime()
    })
}

/**
 * Get a specific profile
 */
export function getProfile(profileId: string): FamilyProfile | undefined {
  return profiles.get(profileId)
}

/**
 * Update profile info
 */
export function updateProfile(
  profileId: string,
  updates: Partial<Pick<FamilyProfile, 'name' | 'avatarEmoji' | 'age'>>
): FamilyProfile | null {
  const profile = profiles.get(profileId)

  if (!profile) {
    return null
  }

  if (updates.name !== undefined) {
    profile.name = updates.name
  }

  if (updates.avatarEmoji !== undefined && AVATAR_EMOJIS.includes(updates.avatarEmoji)) {
    profile.avatarEmoji = updates.avatarEmoji
  }

  if (updates.age !== undefined) {
    profile.age = updates.age
  }

  return profile
}

/**
 * Update profile preferences
 */
export function updateProfilePreferences(
  profileId: string,
  preferences: Partial<ProfilePreferences>
): FamilyProfile | null {
  const profile = profiles.get(profileId)

  if (!profile) {
    return null
  }

  profile.preferences = {
    ...profile.preferences,
    ...preferences
  }

  return profile
}

/**
 * Delete a child profile (cannot delete parent profile)
 */
export function deleteProfile(profileId: string, userId: string): boolean {
  const profile = profiles.get(profileId)

  if (!profile) {
    return false
  }

  // Cannot delete parent profile
  if (!profile.isChild) {
    return false
  }

  // Must own the profile
  if (profile.userId !== userId) {
    return false
  }

  profiles.delete(profileId)
  return true
}

/**
 * Update reading progress for a profile
 */
export function updateReadingProgress(
  profileId: string,
  bookId: string,
  currentChapter: number,
  totalChapters: number
): ReadingProgress | null {
  const profile = profiles.get(profileId)

  if (!profile) {
    return null
  }

  // Find existing progress or create new
  let progress = profile.readingProgress.find(p => p.bookId === bookId)

  if (!progress) {
    progress = {
      bookId,
      currentChapter: 0,
      totalChapters,
      lastReadAt: new Date(),
      completed: false
    }
    profile.readingProgress.push(progress)
  }

  progress.currentChapter = currentChapter
  progress.totalChapters = totalChapters
  progress.lastReadAt = new Date()
  progress.completed = currentChapter >= totalChapters

  return progress
}

/**
 * Get reading progress for a specific book
 */
export function getReadingProgress(profileId: string, bookId: string): ReadingProgress | null {
  const profile = profiles.get(profileId)

  if (!profile) {
    return null
  }

  return profile.readingProgress.find(p => p.bookId === bookId) || null
}

/**
 * Get all reading progress for a profile
 */
export function getAllReadingProgress(profileId: string): ReadingProgress[] {
  const profile = profiles.get(profileId)

  if (!profile) {
    return []
  }

  return [...profile.readingProgress].sort(
    (a, b) => b.lastReadAt.getTime() - a.lastReadAt.getTime()
  )
}

/**
 * Get reading stats for a profile
 */
export function getReadingStats(profileId: string): {
  booksStarted: number
  booksCompleted: number
  chaptersRead: number
  lastReadAt: Date | null
} {
  const profile = profiles.get(profileId)

  if (!profile) {
    return {
      booksStarted: 0,
      booksCompleted: 0,
      chaptersRead: 0,
      lastReadAt: null
    }
  }

  const progress = profile.readingProgress

  return {
    booksStarted: progress.length,
    booksCompleted: progress.filter(p => p.completed).length,
    chaptersRead: progress.reduce((sum, p) => sum + p.currentChapter, 0),
    lastReadAt: progress.length > 0
      ? new Date(Math.max(...progress.map(p => p.lastReadAt.getTime())))
      : null
  }
}

/**
 * Check if a profile can access a book (based on user purchases)
 */
export function profileCanAccessBook(
  profileId: string,
  bookId: string,
  userPurchases: { bookId: string }[]
): boolean {
  const profile = profiles.get(profileId)

  if (!profile) {
    return false
  }

  // Check if the parent user owns the book
  return userPurchases.some(p => p.bookId === bookId)
}

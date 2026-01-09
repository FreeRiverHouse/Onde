// Authentication module for Onde Portal
// Uses simple email-based magic link authentication

import { cookies } from 'next/headers'
import crypto from 'crypto'

// Types
export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
  purchases: Purchase[]
}

export interface Purchase {
  id: string
  bookId: string
  bookTitle: string
  purchasedAt: Date
  price: number
}

export interface Session {
  userId: string
  email: string
  expiresAt: Date
}

// In-memory store (replace with database in production)
const users: Map<string, User> = new Map()
const sessions: Map<string, Session> = new Map()
const magicLinks: Map<string, { email: string; expiresAt: Date }> = new Map()

// Constants
const SESSION_COOKIE = 'onde_session'
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days
const MAGIC_LINK_DURATION = 15 * 60 * 1000 // 15 minutes

/**
 * Generate a magic link token for email login
 */
export function generateMagicLinkToken(email: string): string {
  const token = crypto.randomBytes(32).toString('hex')

  magicLinks.set(token, {
    email: email.toLowerCase(),
    expiresAt: new Date(Date.now() + MAGIC_LINK_DURATION)
  })

  return token
}

/**
 * Verify a magic link token and create session
 */
export async function verifyMagicLink(token: string): Promise<Session | null> {
  const link = magicLinks.get(token)

  if (!link) {
    return null
  }

  if (new Date() > link.expiresAt) {
    magicLinks.delete(token)
    return null
  }

  // Delete used token
  magicLinks.delete(token)

  // Find or create user
  let user = getUserByEmail(link.email)
  if (!user) {
    user = createUser(link.email)
  }

  // Create session
  const session = await createSession(user.id, user.email)
  return session
}

/**
 * Create a new user
 */
export function createUser(email: string, name?: string): User {
  const id = crypto.randomUUID()

  const user: User = {
    id,
    email: email.toLowerCase(),
    name,
    createdAt: new Date(),
    purchases: []
  }

  users.set(id, user)
  return user
}

/**
 * Get user by email
 */
export function getUserByEmail(email: string): User | undefined {
  const lowerEmail = email.toLowerCase()
  return Array.from(users.values()).find(u => u.email === lowerEmail)
}

/**
 * Get user by ID
 */
export function getUserById(id: string): User | undefined {
  return users.get(id)
}

/**
 * Create a new session
 */
export async function createSession(userId: string, email: string): Promise<Session> {
  const sessionId = crypto.randomBytes(32).toString('hex')

  const session: Session = {
    userId,
    email,
    expiresAt: new Date(Date.now() + SESSION_DURATION)
  }

  sessions.set(sessionId, session)

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: session.expiresAt,
    path: '/'
  })

  return session
}

/**
 * Get current session from cookies
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value

  if (!sessionId) {
    return null
  }

  const session = sessions.get(sessionId)

  if (!session) {
    return null
  }

  if (new Date() > session.expiresAt) {
    sessions.delete(sessionId)
    return null
  }

  return session
}

/**
 * Get current user from session
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()

  if (!session) {
    return null
  }

  return getUserById(session.userId) || null
}

/**
 * Logout - destroy session
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value

  if (sessionId) {
    sessions.delete(sessionId)
    cookieStore.delete(SESSION_COOKIE)
  }
}

/**
 * Add a purchase to user's history
 */
export function addPurchase(userId: string, bookId: string, bookTitle: string, price: number): Purchase | null {
  const user = users.get(userId)

  if (!user) {
    return null
  }

  const purchase: Purchase = {
    id: crypto.randomUUID(),
    bookId,
    bookTitle,
    purchasedAt: new Date(),
    price
  }

  user.purchases.push(purchase)
  return purchase
}

/**
 * Check if user owns a book
 */
export function userOwnsBook(userId: string, bookId: string): boolean {
  const user = users.get(userId)

  if (!user) {
    return false
  }

  return user.purchases.some(p => p.bookId === bookId)
}

/**
 * Get user's purchase history
 */
export function getUserPurchases(userId: string): Purchase[] {
  const user = users.get(userId)

  if (!user) {
    return []
  }

  return [...user.purchases].sort((a, b) =>
    b.purchasedAt.getTime() - a.purchasedAt.getTime()
  )
}

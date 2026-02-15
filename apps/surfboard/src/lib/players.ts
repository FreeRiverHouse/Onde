/**
 * Player management library for Onde.la
 * Uses Cloudflare KV for storage (edge-compatible)
 * 
 * KV Structure:
 *   player:{nickname_lower} → PlayerData JSON
 *   players:index → string[] of all lowercase nicknames (for listing)
 */

// ============================================
// Types
// ============================================

export interface PlayerData {
  playerId: string
  nickname: string       // Original casing
  nicknameLower: string  // Lowercase for uniqueness
  xp: number
  level: number
  coins: number
  gamesPlayed: number
  joinedAt: string       // ISO date
  lastSyncAt: string     // ISO date
}

export type RegisterResult = {
  ok: true
  playerId: string
  nickname: string
} | {
  ok: false
  error: string
}

export interface SyncData {
  xp?: number
  coins?: number
  level?: number
  gamesPlayed?: number
}

// ============================================
// Validation
// ============================================

const NICKNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/

// Basic profanity filter (Italian + English)
const BLOCKED_WORDS = [
  'cazzo', 'merda', 'stronzo', 'stronza', 'puttana', 'vaffanculo',
  'minchia', 'coglione', 'bastardo', 'bastarda', 'troia',
  'fuck', 'shit', 'ass', 'dick', 'bitch', 'nigger', 'nigga',
  'pussy', 'cunt', 'whore', 'slut', 'retard', 'faggot',
  'admin', 'administrator', 'moderator', 'staff', 'system',
  'onde', 'ondela', 'ondesurf',
]

export function validateNickname(nickname: string): { valid: boolean; error?: string } {
  if (!nickname || typeof nickname !== 'string') {
    return { valid: false, error: 'Nickname is required' }
  }

  const trimmed = nickname.trim()

  if (trimmed.length < 3) {
    return { valid: false, error: 'Nickname must be at least 3 characters' }
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'Nickname must be at most 20 characters' }
  }

  if (!NICKNAME_REGEX.test(trimmed)) {
    return { valid: false, error: 'Nickname can only contain letters, numbers, underscore and dash' }
  }

  const lower = trimmed.toLowerCase()
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) {
      return { valid: false, error: 'This nickname is not allowed' }
    }
  }

  return { valid: true }
}

// ============================================
// KV Operations
// ============================================

function generatePlayerId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `p_${result}`
}

export async function getPlayer(kv: KVNamespace, nickname: string): Promise<PlayerData | null> {
  const key = `player:${nickname.toLowerCase()}`
  const data = await kv.get(key, 'json')
  return data as PlayerData | null
}

export async function registerPlayer(kv: KVNamespace, nickname: string): Promise<RegisterResult> {
  // Validate
  const validation = validateNickname(nickname)
  if (!validation.valid) {
    return { ok: false, error: validation.error! }
  }

  const trimmed = nickname.trim()
  const lower = trimmed.toLowerCase()
  const key = `player:${lower}`

  // Check uniqueness
  const existing = await kv.get(key)
  if (existing) {
    return { ok: false, error: 'Nickname already taken' }
  }

  // Create player
  const playerId = generatePlayerId()
  const now = new Date().toISOString()
  const playerData: PlayerData = {
    playerId,
    nickname: trimmed,
    nicknameLower: lower,
    xp: 0,
    level: 1,
    coins: 0,
    gamesPlayed: 0,
    joinedAt: now,
    lastSyncAt: now,
  }

  // Save player
  await kv.put(key, JSON.stringify(playerData))

  // Update index
  const indexStr = await kv.get('players:index')
  const index: string[] = indexStr ? JSON.parse(indexStr) : []
  index.push(lower)
  await kv.put('players:index', JSON.stringify(index))

  return { ok: true, playerId, nickname: trimmed }
}

export async function syncPlayer(kv: KVNamespace, nickname: string, data: SyncData): Promise<PlayerData | null> {
  const lower = nickname.toLowerCase()
  const key = `player:${lower}`

  const existing = await kv.get(key, 'json') as PlayerData | null
  if (!existing) return null

  // Only update fields that are provided and are higher values (prevent cheating regression)
  const updated: PlayerData = {
    ...existing,
    xp: data.xp !== undefined ? Math.max(existing.xp, data.xp) : existing.xp,
    level: data.level !== undefined ? Math.max(existing.level, data.level) : existing.level,
    coins: data.coins !== undefined ? Math.max(existing.coins, data.coins) : existing.coins,
    gamesPlayed: data.gamesPlayed !== undefined ? Math.max(existing.gamesPlayed, data.gamesPlayed) : existing.gamesPlayed,
    lastSyncAt: new Date().toISOString(),
  }

  await kv.put(key, JSON.stringify(updated))
  return updated
}

export async function getAllPlayers(kv: KVNamespace): Promise<PlayerData[]> {
  const indexStr = await kv.get('players:index')
  if (!indexStr) return []

  const index: string[] = JSON.parse(indexStr)
  const players: PlayerData[] = []

  for (const nick of index) {
    const data = await kv.get(`player:${nick}`, 'json') as PlayerData | null
    if (data) players.push(data)
  }

  return players
}

// ============================================
// CORS helpers
// ============================================

const ALLOWED_ORIGINS = [
  'https://onde.la',
  'https://www.onde.la',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
]

export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]

  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

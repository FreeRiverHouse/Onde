/**
 * Supabase Client for Reader App Cloud Sync
 * 
 * Uses anonymous device ID for authentication.
 * Data is synced per-device, with optional pairing code for cross-device sync.
 */

import { createClient } from '@supabase/supabase-js';

// Supabase project credentials (anon key is safe to expose)
// TODO: Move to environment variables for production
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://reader-sync.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Fallback mode when Supabase is not configured
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Device ID management
const DEVICE_ID_KEY = 'onde-reader-device-id';
const SYNC_CODE_KEY = 'onde-reader-sync-code';

export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export function getSyncCode(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SYNC_CODE_KEY);
}

export function setSyncCode(code: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SYNC_CODE_KEY, code);
}

export function clearSyncCode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SYNC_CODE_KEY);
}

// Generate a short, human-readable sync code (6 alphanumeric)
export function generateSyncCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0,O,1,I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

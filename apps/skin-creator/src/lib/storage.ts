/**
 * Cross-platform storage utility
 * Uses Capacitor Preferences on iOS/Android, localStorage on web
 */

// Check if running in Capacitor (native app)
const isCapacitor = typeof window !== 'undefined' && 
  (window as any).Capacitor !== undefined;

// Dynamic import for Capacitor Preferences (only loaded in native apps)
let Preferences: any = null;

async function getPreferences() {
  if (!Preferences && isCapacitor) {
    try {
      const mod = await import('@capacitor/preferences');
      Preferences = mod.Preferences;
    } catch (e) {
      console.warn('Capacitor Preferences not available, using localStorage');
    }
  }
  return Preferences;
}

/**
 * Get item from storage
 */
export async function getItem(key: string): Promise<string | null> {
  if (isCapacitor) {
    const prefs = await getPreferences();
    if (prefs) {
      const { value } = await prefs.get({ key });
      return value;
    }
  }
  // Fallback to localStorage
  return localStorage.getItem(key);
}

/**
 * Set item in storage
 */
export async function setItem(key: string, value: string): Promise<void> {
  if (isCapacitor) {
    const prefs = await getPreferences();
    if (prefs) {
      await prefs.set({ key, value });
      return;
    }
  }
  // Fallback to localStorage
  localStorage.setItem(key, value);
}

/**
 * Remove item from storage
 */
export async function removeItem(key: string): Promise<void> {
  if (isCapacitor) {
    const prefs = await getPreferences();
    if (prefs) {
      await prefs.remove({ key });
      return;
    }
  }
  // Fallback to localStorage
  localStorage.removeItem(key);
}

/**
 * Sync helper - get JSON parsed value
 */
export async function getJSON<T>(key: string, defaultValue: T): Promise<T> {
  const value = await getItem(key);
  if (!value) return defaultValue;
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

/**
 * Sync helper - set JSON stringified value
 */
export async function setJSON(key: string, value: any): Promise<void> {
  await setItem(key, JSON.stringify(value));
}

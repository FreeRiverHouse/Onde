'use client';

/**
 * Analytics hook for privacy-friendly event tracking.
 *
 * Supports multiple providers simultaneously:
 * - Cloudflare Web Analytics (page views only, via beacon)
 * - Umami (page views + custom events)
 * - Plausible (page views + custom events)
 *
 * Custom events are dispatched to whichever provider is active.
 * All providers are privacy-friendly (no cookies, GDPR-compliant).
 */

// Extend Window for analytics providers
declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, string | number>) => void;
    };
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number> }
    ) => void;
  }
}

/**
 * Track a custom analytics event.
 * Dispatches to all available providers (Umami, Plausible).
 *
 * Note: Cloudflare Web Analytics does NOT support custom events —
 * it only tracks page views via the beacon script.
 */
export function trackEvent(
  name: string,
  props?: Record<string, string | number>
): void {
  try {
    // Umami
    if (typeof window !== 'undefined' && window.umami) {
      window.umami.track(name, props);
    }

    // Plausible
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible(name, { props });
    }
  } catch {
    // Silently ignore analytics errors — never break the app
  }
}

// ── Pre-defined event helpers ──────────────────────────────────

/** Player opened a game */
export function trackGamePlay(gameName: string): void {
  trackEvent('game_play', { game: gameName });
}

/** Player won a game */
export function trackGameWin(gameName: string, score?: number): void {
  trackEvent('game_win', {
    game: gameName,
    ...(score !== undefined ? { score } : {}),
  });
}

/** Player registered a nickname */
export function trackPlayerRegister(): void {
  trackEvent('player_register');
}

/** Book downloaded */
export function trackBookDownload(bookTitle: string, format: string): void {
  trackEvent('book_download', { title: bookTitle, format });
}

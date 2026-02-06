/**
 * Hooks barrel export
 * Import hooks from '@/hooks' for cleaner imports
 */

export { useFocusTrap } from './useFocusTrap'
export { useLocalStorage } from './useLocalStorage'
export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, usePrefersReducedMotion, usePrefersDarkMode } from './useMediaQuery'
export { useCopyToClipboard } from './useCopyToClipboard'
export { useDebounce, useDebouncedCallback } from './useDebounce'
export { useOnClickOutside } from './useOnClickOutside'
export { useRecentlyPlayed } from './useRecentlyPlayed'
export type { RecentlyPlayedGame } from './useRecentlyPlayed'

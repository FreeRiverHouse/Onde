'use client';

import { useContext, useCallback, useMemo } from 'react';
import { ThemeContext, ThemeContextType } from '@/components/ThemeProvider';

// ============================================
// THEME TYPES
// ============================================

export type ThemeMode = 'light' | 'dark' | 'auto';

export type AccentColor = 'gold' | 'teal' | 'coral' | 'purple' | 'cyan';

export type FontSize = 'small' | 'medium' | 'large';

export interface ThemeSettings {
  mode: ThemeMode;
  accentColor: AccentColor;
  fontSize: FontSize;
  reduceMotion: boolean;
  highContrast: boolean;
}

export interface ThemeState extends ThemeSettings {
  resolvedMode: 'light' | 'dark'; // Actual mode after auto resolution
}

// ============================================
// ACCENT COLOR PRESETS
// ============================================

export const ACCENT_COLORS: Record<AccentColor, { name: string; primary: string; light: string; glow: string }> = {
  gold: {
    name: 'Oro Marino',
    primary: '#D4AF37',
    light: '#E5C158',
    glow: 'rgba(212, 175, 55, 0.4)',
  },
  teal: {
    name: 'Turchese',
    primary: '#5B9AA0',
    light: '#7EB8C4',
    glow: 'rgba(91, 154, 160, 0.4)',
  },
  coral: {
    name: 'Corallo',
    primary: '#E07A5F',
    light: '#F09A7F',
    glow: 'rgba(224, 122, 95, 0.4)',
  },
  purple: {
    name: 'Lapislazzuli',
    primary: '#26619C',
    light: '#4A7C9B',
    glow: 'rgba(38, 97, 156, 0.4)',
  },
  cyan: {
    name: 'Azzurro',
    primary: '#7EB8C4',
    light: '#A5D4DC',
    glow: 'rgba(126, 184, 196, 0.4)',
  },
};

// ============================================
// FONT SIZE PRESETS
// ============================================

export const FONT_SIZES: Record<FontSize, { name: string; base: string; scale: number }> = {
  small: {
    name: 'Piccolo',
    base: '14px',
    scale: 0.875,
  },
  medium: {
    name: 'Medio',
    base: '16px',
    scale: 1,
  },
  large: {
    name: 'Grande',
    base: '18px',
    scale: 1.125,
  },
};

// ============================================
// DEFAULT SETTINGS
// ============================================

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  mode: 'auto',
  accentColor: 'gold',
  fontSize: 'medium',
  reduceMotion: false,
  highContrast: false,
};

// ============================================
// LOCAL STORAGE KEY
// ============================================

export const THEME_STORAGE_KEY = 'onde-theme-settings';

// ============================================
// USE THEME HOOK
// ============================================

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Hook to get current accent color values
 */
export function useAccentColor() {
  const { settings } = useTheme();
  return useMemo(() => ACCENT_COLORS[settings.accentColor], [settings.accentColor]);
}

/**
 * Hook to get current font size values
 */
export function useFontSize() {
  const { settings } = useTheme();
  return useMemo(() => FONT_SIZES[settings.fontSize], [settings.fontSize]);
}

/**
 * Hook to check if dark mode is active
 */
export function useIsDarkMode() {
  const { resolvedMode } = useTheme();
  return resolvedMode === 'dark';
}

/**
 * Hook to check if reduced motion is preferred
 */
export function useReducedMotion() {
  const { settings } = useTheme();
  return settings.reduceMotion;
}

/**
 * Hook to toggle dark mode quickly
 */
export function useToggleDarkMode() {
  const { settings, setMode } = useTheme();
  
  return useCallback(() => {
    if (settings.mode === 'auto') {
      // If auto, switch to opposite of current resolved mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'light' : 'dark');
    } else {
      setMode(settings.mode === 'dark' ? 'light' : 'dark');
    }
  }, [settings.mode, setMode]);
}

// ============================================
// CSS VARIABLE GENERATOR
// ============================================

export function generateThemeCSSVariables(
  settings: ThemeSettings,
  resolvedMode: 'light' | 'dark'
): Record<string, string> {
  const accent = ACCENT_COLORS[settings.accentColor];
  const fontSize = FONT_SIZES[settings.fontSize];
  
  const variables: Record<string, string> = {
    // Accent colors
    '--theme-accent': accent.primary,
    '--theme-accent-light': accent.light,
    '--theme-accent-glow': accent.glow,
    
    // Font sizes
    '--theme-font-base': fontSize.base,
    '--theme-font-scale': String(fontSize.scale),
    
    // Computed font sizes
    '--theme-font-xs': `calc(${fontSize.base} * 0.75)`,
    '--theme-font-sm': `calc(${fontSize.base} * 0.875)`,
    '--theme-font-md': fontSize.base,
    '--theme-font-lg': `calc(${fontSize.base} * 1.125)`,
    '--theme-font-xl': `calc(${fontSize.base} * 1.25)`,
    '--theme-font-2xl': `calc(${fontSize.base} * 1.5)`,
    '--theme-font-3xl': `calc(${fontSize.base} * 1.875)`,
    '--theme-font-4xl': `calc(${fontSize.base} * 2.25)`,
    
    // Motion
    '--theme-transition-fast': settings.reduceMotion ? '0ms' : '150ms',
    '--theme-transition-base': settings.reduceMotion ? '0ms' : '300ms',
    '--theme-transition-slow': settings.reduceMotion ? '0ms' : '500ms',
    '--theme-animation-enabled': settings.reduceMotion ? '0' : '1',
  };
  
  // Mode-specific colors
  if (resolvedMode === 'dark') {
    variables['--theme-bg'] = '#0B1929';
    variables['--theme-bg-secondary'] = '#0D2137';
    variables['--theme-bg-surface'] = '#122A42';
    variables['--theme-bg-elevated'] = '#1A3A52';
    variables['--theme-text'] = settings.highContrast ? '#FFFFFF' : 'rgba(255, 255, 255, 0.95)';
    variables['--theme-text-secondary'] = settings.highContrast ? '#E0E0E0' : 'rgba(255, 255, 255, 0.7)';
    variables['--theme-text-muted'] = settings.highContrast ? '#CCCCCC' : 'rgba(255, 255, 255, 0.5)';
    variables['--theme-border'] = settings.highContrast ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)';
    variables['--theme-glass-bg'] = 'rgba(255, 255, 255, 0.03)';
    variables['--theme-glass-border'] = 'rgba(255, 255, 255, 0.08)';
  } else {
    variables['--theme-bg'] = '#F8FAFC';
    variables['--theme-bg-secondary'] = '#FFFFFF';
    variables['--theme-bg-surface'] = '#FFFFFF';
    variables['--theme-bg-elevated'] = '#F1F5F9';
    variables['--theme-text'] = settings.highContrast ? '#000000' : '#1E293B';
    variables['--theme-text-secondary'] = settings.highContrast ? '#1A1A1A' : '#475569';
    variables['--theme-text-muted'] = settings.highContrast ? '#333333' : '#94A3B8';
    variables['--theme-border'] = settings.highContrast ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.08)';
    variables['--theme-glass-bg'] = 'rgba(0, 0, 0, 0.02)';
    variables['--theme-glass-border'] = 'rgba(0, 0, 0, 0.06)';
  }
  
  // High contrast overrides
  if (settings.highContrast) {
    variables['--theme-accent-contrast'] = resolvedMode === 'dark' ? '#FFFFFF' : '#000000';
    variables['--theme-focus-ring'] = `0 0 0 3px ${accent.primary}`;
  } else {
    variables['--theme-accent-contrast'] = resolvedMode === 'dark' ? '#0B1929' : '#FFFFFF';
    variables['--theme-focus-ring'] = `0 0 0 2px ${accent.glow}`;
  }
  
  return variables;
}

export default useTheme;

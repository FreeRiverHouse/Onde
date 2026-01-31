'use client';

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  ThemeSettings,
  ThemeMode,
  AccentColor,
  FontSize,
  DEFAULT_THEME_SETTINGS,
  THEME_STORAGE_KEY,
  generateThemeCSSVariables,
} from '@/hooks/useTheme';

// ============================================
// CONTEXT TYPE
// ============================================

export interface ThemeContextType {
  settings: ThemeSettings;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  setFontSize: (size: FontSize) => void;
  setReduceMotion: (reduce: boolean) => void;
  setHighContrast: (high: boolean) => void;
  resetToDefaults: () => void;
}

// ============================================
// CONTEXT
// ============================================

export const ThemeContext = createContext<ThemeContextType | null>(null);

// ============================================
// PROVIDER PROPS
// ============================================

interface ThemeProviderProps {
  children: ReactNode;
  defaultSettings?: Partial<ThemeSettings>;
  storageKey?: string;
}

// ============================================
// HELPER: LOAD FROM STORAGE
// ============================================

function loadSettingsFromStorage(key: string): ThemeSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME_SETTINGS;
  }
  
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate and merge with defaults to ensure all fields exist
      return {
        mode: ['light', 'dark', 'auto'].includes(parsed.mode) ? parsed.mode : DEFAULT_THEME_SETTINGS.mode,
        accentColor: ['gold', 'teal', 'coral', 'purple', 'cyan'].includes(parsed.accentColor)
          ? parsed.accentColor
          : DEFAULT_THEME_SETTINGS.accentColor,
        fontSize: ['small', 'medium', 'large'].includes(parsed.fontSize)
          ? parsed.fontSize
          : DEFAULT_THEME_SETTINGS.fontSize,
        reduceMotion: typeof parsed.reduceMotion === 'boolean'
          ? parsed.reduceMotion
          : DEFAULT_THEME_SETTINGS.reduceMotion,
        highContrast: typeof parsed.highContrast === 'boolean'
          ? parsed.highContrast
          : DEFAULT_THEME_SETTINGS.highContrast,
      };
    }
  } catch (e) {
    console.warn('Failed to load theme settings from storage:', e);
  }
  
  return DEFAULT_THEME_SETTINGS;
}

// ============================================
// HELPER: SAVE TO STORAGE
// ============================================

function saveSettingsToStorage(key: string, settings: ThemeSettings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save theme settings to storage:', e);
  }
}

// ============================================
// HELPER: GET SYSTEM PREFERENCE
// ============================================

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// ============================================
// HELPER: CHECK REDUCED MOTION PREFERENCE
// ============================================

function getSystemReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ============================================
// PROVIDER COMPONENT
// ============================================

export function ThemeProvider({
  children,
  defaultSettings,
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  // Initialize state
  const [settings, setSettings] = useState<ThemeSettings>(() => ({
    ...DEFAULT_THEME_SETTINGS,
    ...defaultSettings,
  }));
  
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);
  
  // Load settings from storage on mount
  useEffect(() => {
    const stored = loadSettingsFromStorage(storageKey);
    const merged = { ...stored, ...defaultSettings };
    setSettings(merged);
    
    // Check system preference for reduced motion if not explicitly set
    if (merged.reduceMotion === false && getSystemReducedMotion()) {
      setSettings(prev => ({ ...prev, reduceMotion: true }));
    }
    
    setMounted(true);
  }, [storageKey, defaultSettings]);
  
  // Resolve auto mode
  useEffect(() => {
    if (!mounted) return;
    
    const resolveMode = () => {
      if (settings.mode === 'auto') {
        setResolvedMode(getSystemPreference());
      } else {
        setResolvedMode(settings.mode);
      }
    };
    
    resolveMode();
    
    // Listen for system preference changes
    if (settings.mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => resolveMode();
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [settings.mode, mounted]);
  
  // Apply CSS variables when settings change
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    const variables = generateThemeCSSVariables(settings, resolvedMode);
    
    // Apply all CSS variables
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Set data attributes for CSS targeting
    root.setAttribute('data-theme', resolvedMode);
    root.setAttribute('data-accent', settings.accentColor);
    root.setAttribute('data-font-size', settings.fontSize);
    root.setAttribute('data-reduce-motion', String(settings.reduceMotion));
    root.setAttribute('data-high-contrast', String(settings.highContrast));
    
    // Update body classes
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(resolvedMode);
    
    if (settings.reduceMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
    
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [settings, resolvedMode, mounted]);
  
  // Save to storage when settings change
  useEffect(() => {
    if (mounted) {
      saveSettingsToStorage(storageKey, settings);
    }
  }, [settings, storageKey, mounted]);
  
  // Setting updaters
  const setMode = useCallback((mode: ThemeMode) => {
    setSettings(prev => ({ ...prev, mode }));
  }, []);
  
  const setAccentColor = useCallback((accentColor: AccentColor) => {
    setSettings(prev => ({ ...prev, accentColor }));
  }, []);
  
  const setFontSize = useCallback((fontSize: FontSize) => {
    setSettings(prev => ({ ...prev, fontSize }));
  }, []);
  
  const setReduceMotion = useCallback((reduceMotion: boolean) => {
    setSettings(prev => ({ ...prev, reduceMotion }));
  }, []);
  
  const setHighContrast = useCallback((highContrast: boolean) => {
    setSettings(prev => ({ ...prev, highContrast }));
  }, []);
  
  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_THEME_SETTINGS);
  }, []);
  
  // Memoize context value
  const contextValue = useMemo<ThemeContextType>(() => ({
    settings,
    resolvedMode,
    setMode,
    setAccentColor,
    setFontSize,
    setReduceMotion,
    setHighContrast,
    resetToDefaults,
  }), [
    settings,
    resolvedMode,
    setMode,
    setAccentColor,
    setFontSize,
    setReduceMotion,
    setHighContrast,
    resetToDefaults,
  ]);
  
  // Prevent flash of incorrect theme
  if (!mounted) {
    return (
      <ThemeContext.Provider value={contextValue}>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </ThemeContext.Provider>
    );
  }
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================
// THEME SCRIPT (for SSR flash prevention)
// ============================================

export const ThemeScript = () => {
  const script = `
(function() {
  try {
    const stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    const settings = stored ? JSON.parse(stored) : null;
    let mode = settings?.mode || 'auto';
    
    if (mode === 'auto') {
      mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', mode);
    document.body.classList.add(mode);
    
    if (settings?.reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('reduce-motion');
    }
    
    if (settings?.highContrast) {
      document.body.classList.add('high-contrast');
    }
  } catch (e) {}
})();
`;
  
  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
};

export default ThemeProvider;

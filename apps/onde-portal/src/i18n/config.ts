export const locales = ['en', 'it'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  it: 'Italiano'
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  it: '🇮🇹'
};

// Helper to get preferred locale from browser
export function getPreferredLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;

  // Check localStorage first
  const stored = localStorage.getItem('preferred-locale');
  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale;
  }

  // Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (locales.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }

  return defaultLocale;
}

// Save preferred locale
export function setPreferredLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferred-locale', locale);
  }
}

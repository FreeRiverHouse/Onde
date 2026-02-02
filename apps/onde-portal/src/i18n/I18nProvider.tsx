'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, defaultLocale, locales } from './config';
import { getMessages, Messages } from './messages';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<Messages>(getMessages(defaultLocale));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved locale from localStorage
    const stored = localStorage.getItem('locale');
    if (stored && locales.includes(stored as Locale)) {
      setLocaleState(stored as Locale);
      setMessages(getMessages(stored as Locale));
    } else {
      // Check browser language
      const browserLang = navigator.language.split('-')[0];
      if (locales.includes(browserLang as Locale)) {
        setLocaleState(browserLang as Locale);
        setMessages(getMessages(browserLang as Locale));
      }
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    localStorage.setItem('locale', newLocale);
    setLocaleState(newLocale);
    setMessages(getMessages(newLocale));
    // Update HTML lang attribute
    document.documentElement.lang = newLocale;
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ locale: defaultLocale, setLocale, t: getMessages(defaultLocale) }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: messages }}>
      {children}
    </I18nContext.Provider>
  );
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export function useI18n() {
  const context = useContext(I18nContext);
  // Return default values during SSR/static generation or when context is undefined
  if (!isBrowser || context === undefined) {
    const defaultMessages = getMessages(defaultLocale);
    return {
      locale: defaultLocale,
      setLocale: () => {},
      t: defaultMessages
    };
  }
  return context;
}

export function useTranslations() {
  // During SSR/static generation, return default messages directly
  if (!isBrowser) {
    return getMessages(defaultLocale);
  }
  const { t } = useI18n();
  return t;
}

export function useLocale() {
  const { locale, setLocale } = useI18n();
  return { locale, setLocale };
}

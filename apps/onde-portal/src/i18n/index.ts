// Legacy exports for backward compatibility
export { I18nProvider, useI18n, useTranslations, useLocale } from './I18nProvider';

// Config exports
export { 
  locales, 
  defaultLocale, 
  localeNames,
  localeFlags,
  getPreferredLocale,
  setPreferredLocale,
  type Locale 
} from './config';

// Navigation exports for next-intl
export { Link, redirect, usePathname, useRouter } from './navigation';

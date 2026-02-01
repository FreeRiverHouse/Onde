'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { locales, localeNames, localeFlags, setPreferredLocale, Locale } from '@/i18n/config';

export default function LanguageSwitcher() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = (params?.locale as Locale) || 'en';
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newLocale: Locale) => {
    setIsOpen(false);
    
    // Save preference
    setPreferredLocale(newLocale);
    
    // Navigate to the new locale path
    // Replace current locale in path with new locale
    let newPath = pathname;
    
    // Check if pathname starts with a locale
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length > 0 && locales.includes(pathParts[0] as Locale)) {
      // Replace the locale
      pathParts[0] = newLocale;
      newPath = '/' + pathParts.join('/') + '/';
    } else {
      // Prepend the locale
      newPath = `/${newLocale}${pathname}`;
    }
    
    // Ensure trailing slash
    if (!newPath.endsWith('/')) {
      newPath += '/';
    }
    
    router.push(newPath);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl
                   bg-white/60 backdrop-blur-sm border border-onde-ocean/10
                   text-onde-ocean/70 hover:text-onde-ocean hover:border-onde-coral/30
                   transition-all duration-300 text-sm font-medium"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <span className="text-lg">{localeFlags[currentLocale]}</span>
        <span className="hidden sm:inline">{currentLocale.toUpperCase()}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-40 py-2 rounded-xl
                       bg-white/95 backdrop-blur-lg border border-onde-ocean/10
                       shadow-xl shadow-onde-ocean/10 z-50"
            role="listbox"
            aria-label="Available languages"
          >
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleSelect(loc)}
                className={`w-full px-4 py-2.5 text-left text-sm font-medium
                           flex items-center gap-3 transition-colors
                           ${currentLocale === loc
                             ? 'bg-onde-coral/10 text-onde-coral'
                             : 'text-onde-ocean/70 hover:bg-onde-cream hover:text-onde-ocean'
                           }`}
                role="option"
                aria-selected={currentLocale === loc}
              >
                <span className="text-lg">
                  {localeFlags[loc]}
                </span>
                <span>{localeNames[loc]}</span>
                {currentLocale === loc && (
                  <svg className="w-4 h-4 ml-auto text-onde-coral" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

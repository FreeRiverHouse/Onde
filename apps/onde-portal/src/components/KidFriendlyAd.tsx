'use client';

import { useState, useEffect, useMemo } from 'react';
import { ADS_CONFIG, AD_ITEMS, type AdSlot, type AdItem } from '@/config/ads';

interface KidFriendlyAdProps {
  /** Which ad slot this renders in — determines sizing & preferred category */
  slot: AdSlot;
  /** Optional CSS class override */
  className?: string;
}

/**
 * KidFriendlyAd — COPPA-compliant affiliate banner
 *
 * ✅ No cookies, no tracking pixels, no behavioral targeting
 * ✅ Static affiliate links only (Amazon)
 * ✅ Contextual (slot-based), not personalized
 * ✅ Clearly labeled as "Sponsored"
 * ✅ Pastel, rounded, non-invasive design
 * ✅ Respects ENABLE_ADS config flag
 */
export default function KidFriendlyAd({ slot, className = '' }: KidFriendlyAdProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Pick ads by contextual category based on slot (NOT user behavior)
  const slotAds: AdItem[] = useMemo(() => {
    const categoryMap: Record<AdSlot, AdItem['category'][]> = {
      'games-top': ['games', 'educational'],
      'games-bottom-mobile': ['games', 'educational'],
      'blog-sidebar': ['books', 'educational'],
      'libri-bottom': ['books', 'educational'],
    };
    const cats = categoryMap[slot];
    const filtered = AD_ITEMS.filter((a) => cats.includes(a.category));
    return filtered.length > 0 ? filtered : AD_ITEMS;
  }, [slot]);

  // Rotate ads (simple index bump, no tracking)
  useEffect(() => {
    if (ADS_CONFIG.ROTATION_INTERVAL_MS <= 0 || slotAds.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % slotAds.length);
    }, ADS_CONFIG.ROTATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slotAds]);

  // Master kill switch
  if (!ADS_CONFIG.ENABLE_ADS) return null;

  const ad = slotAds[currentIndex % slotAds.length];

  // --- Layout variants ---
  const isTopDesktop = slot === 'games-top';
  const isBottomMobile = slot === 'games-bottom-mobile';
  const isSidebar = slot === 'blog-sidebar';
  const isLibriBottom = slot === 'libri-bottom';

  // Visibility classes
  const visibilityClass = isTopDesktop
    ? 'hidden md:flex'       // desktop-only 728x90
    : isBottomMobile
      ? 'flex md:hidden'     // mobile-only 320x50
      : 'flex';              // always visible

  // Size classes
  const sizeClass = isTopDesktop
    ? 'max-w-[728px] h-[90px]'
    : isBottomMobile
      ? 'max-w-[320px] h-[50px] mx-auto'
      : isSidebar
        ? 'w-full max-w-[300px]'
        : isLibriBottom
          ? 'max-w-[728px] h-[90px] md:h-[90px]'
          : '';

  // Color theme per slot (pastel palette)
  const colorThemes: Record<AdSlot, { bg: string; border: string; text: string; cta: string }> = {
    'games-top': {
      bg: 'bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/30 dark:to-indigo-950/30',
      border: 'border-sky-200/60 dark:border-sky-800/40',
      text: 'text-sky-800 dark:text-sky-200',
      cta: 'bg-sky-500 hover:bg-sky-600 text-white',
    },
    'games-bottom-mobile': {
      bg: 'bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-950/30 dark:to-pink-950/30',
      border: 'border-violet-200/60 dark:border-violet-800/40',
      text: 'text-violet-800 dark:text-violet-200',
      cta: 'bg-violet-500 hover:bg-violet-600 text-white',
    },
    'blog-sidebar': {
      bg: 'bg-gradient-to-b from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30',
      border: 'border-teal-200/60 dark:border-teal-800/40',
      text: 'text-teal-800 dark:text-teal-200',
      cta: 'bg-teal-500 hover:bg-teal-600 text-white',
    },
    'libri-bottom': {
      bg: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
      border: 'border-amber-200/60 dark:border-amber-800/40',
      text: 'text-amber-800 dark:text-amber-200',
      cta: 'bg-amber-500 hover:bg-amber-600 text-white',
    },
  };

  const theme = colorThemes[slot];

  // Sidebar has a vertical layout
  if (isSidebar) {
    return (
      <aside
        className={`${visibilityClass} flex-col items-center gap-3 p-4 rounded-2xl border
          ${theme.bg} ${theme.border} ${sizeClass} ${className}`}
        role="complementary"
        aria-label="Sponsored content"
      >
        <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium">
          Sponsored
        </span>
        <span className="text-3xl">{ad.emoji}</span>
        <p className={`text-sm font-semibold text-center leading-snug ${theme.text}`}>
          {ad.headline}
        </p>
        <a
          href={ad.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={`px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-colors ${theme.cta}`}
        >
          {ad.cta}
        </a>
      </aside>
    );
  }

  // Horizontal banner (games-top, games-bottom-mobile, libri-bottom)
  return (
    <aside
      className={`${visibilityClass} items-center justify-center gap-3 px-4 py-2 rounded-2xl border
        ${theme.bg} ${theme.border} ${sizeClass} mx-auto ${className}`}
      role="complementary"
      aria-label="Sponsored content"
    >
      <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium shrink-0">
        Sponsored
      </span>
      <span className="text-2xl shrink-0">{ad.emoji}</span>
      <p className={`text-xs sm:text-sm font-semibold truncate ${theme.text}`}>
        {ad.headline}
      </p>
      <a
        href={ad.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm transition-colors shrink-0 whitespace-nowrap ${theme.cta}`}
      >
        {ad.cta}
      </a>
    </aside>
  );
}

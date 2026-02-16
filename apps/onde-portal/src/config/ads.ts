/**
 * Ads Configuration
 * 
 * COPPA-compliant ad settings for onde.la
 * - No behavioral targeting
 * - No tracking cookies
 * - No third-party scripts
 * - Kid-friendly content only
 */

export const ADS_CONFIG = {
  /** Master switch — set to false to disable all ads site-wide */
  ENABLE_ADS: true,

  /** Amazon affiliate tag (replace with your real tag) */
  AMAZON_AFFILIATE_TAG: 'onde0a-20',

  /** Ad rotation interval in ms (0 = no rotation) */
  ROTATION_INTERVAL_MS: 30_000,
} as const;

export type AdSlot = 'games-top' | 'games-bottom-mobile' | 'blog-sidebar' | 'libri-bottom';

export interface AdItem {
  id: string;
  headline: string;
  emoji: string;
  cta: string;
  url: string;
  /** Contextual category — no behavioral targeting */
  category: 'books' | 'games' | 'educational';
}

/**
 * Static, curated ad items — NO dynamic ad network, NO tracking pixels.
 * All links are Amazon affiliate or direct product links.
 */
export const AD_ITEMS: AdItem[] = [
  {
    id: 'book-1',
    headline: 'Discover fun books for kids! 📖',
    emoji: '📚',
    cta: 'Browse Books →',
    url: `https://www.amazon.com/s?k=children+books+bestseller&tag=${ADS_CONFIG.AMAZON_AFFILIATE_TAG}`,
    category: 'books',
  },
  {
    id: 'book-2',
    headline: 'New adventures await! Stories kids love 🌟',
    emoji: '✨',
    cta: 'See Stories →',
    url: `https://www.amazon.com/s?k=kids+adventure+books&tag=${ADS_CONFIG.AMAZON_AFFILIATE_TAG}`,
    category: 'books',
  },
  {
    id: 'game-1',
    headline: 'Cool educational games for kids! 🎲',
    emoji: '🎮',
    cta: 'Explore Games →',
    url: `https://www.amazon.com/s?k=educational+board+games+kids&tag=${ADS_CONFIG.AMAZON_AFFILIATE_TAG}`,
    category: 'games',
  },
  {
    id: 'game-2',
    headline: 'STEM toys that spark curiosity 🔬',
    emoji: '🧪',
    cta: 'Shop STEM →',
    url: `https://www.amazon.com/s?k=stem+toys+kids&tag=${ADS_CONFIG.AMAZON_AFFILIATE_TAG}`,
    category: 'educational',
  },
  {
    id: 'edu-1',
    headline: 'Creative kits for young artists 🎨',
    emoji: '🖍️',
    cta: 'Get Creative →',
    url: `https://www.amazon.com/s?k=kids+art+kit&tag=${ADS_CONFIG.AMAZON_AFFILIATE_TAG}`,
    category: 'educational',
  },
  {
    id: 'edu-2',
    headline: 'Learning made fun! Puzzles & more 🧩',
    emoji: '🧩',
    cta: 'See Puzzles →',
    url: `https://www.amazon.com/s?k=kids+puzzles+educational&tag=${ADS_CONFIG.AMAZON_AFFILIATE_TAG}`,
    category: 'educational',
  },
];

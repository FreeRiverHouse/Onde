/**
 * Blog posts data — single source of truth.
 * Used by /blog page, RSS feed, and sitemap.
 */

/** Blog post categories */
export type BlogCategory = 'Tech' | 'AI' | 'Design' | 'Updates'

export const BLOG_CATEGORIES: { value: BlogCategory | 'All'; label: string; emoji: string }[] = [
  { value: 'All', label: 'All', emoji: '🌊' },
  { value: 'Tech', label: 'Tech', emoji: '⚡' },
  { value: 'AI', label: 'AI', emoji: '🤖' },
  { value: 'Design', label: 'Design', emoji: '🎨' },
  { value: 'Updates', label: 'Updates', emoji: '📣' },
]

export interface BlogPost {
  slug: string
  title: string
  subtitle: string
  description: string
  date: string          // Human-readable: "February 2026"
  dateISO: string       // ISO 8601: "2026-02-15T00:00:00Z"
  readTime: string
  category: BlogCategory
  tags: string[]
  emoji: string
  gradient: string
  excerpt: string
  /** Language of the post */
  lang: 'en' | 'it'
  /** Full HTML content for RSS <content:encoded>. Keep concise — summary + link to full post. */
  contentHtml?: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'radeon-7900-xtx-mac-tinygrad',
    title: 'Running AMD Radeon RX 7900 XTX on macOS with TinyGrad',
    subtitle: 'The "Impossible" Setup',
    description:
      'We got a Radeon RX 7900 XTX (24GB VRAM) running ML inference on a MacBook Pro M1 via Thunderbolt eGPU, using TinyGrad with a small patch. Everyone said it was impossible.',
    date: 'February 2026',
    dateISO: '2026-02-15T00:00:00Z',
    readTime: '8 min read',
    category: 'Tech',
    tags: ['GPU', 'TinyGrad', 'macOS', 'AMD', 'ML', 'eGPU'],
    emoji: '🔥',
    gradient: 'from-red-500 via-orange-500 to-amber-500',
    excerpt:
      'We got a Radeon RX 7900 XTX (24GB VRAM) running ML inference on a MacBook Pro M1 via Thunderbolt eGPU, using TinyGrad with a small patch. Everyone said it was impossible.',
    lang: 'en',
    contentHtml: `<p>We got a Radeon RX 7900 XTX (24GB VRAM) running ML inference on a MacBook Pro M1 via Thunderbolt eGPU, using TinyGrad with a small float16 patch.</p><p>Everyone said it was impossible — Apple doesn't support AMD drivers natively on Apple Silicon, and TinyGrad's AMD backend targets Linux. But with a virtual USB device (TinyGPU.app) and a one-line patch, we got GPT-2, GPT-2 XL, and LLaMA 3.1 8B running.</p><p><a href="https://onde.la/blog/radeon-7900-xtx-mac-tinygrad/">Read the full article →</a></p>`,
  },
]

/** Get a single post by slug */
export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}

/** Site metadata for the feed */
export const SITE_URL = 'https://onde.la'
export const BLOG_TITLE = 'Onde Blog'
export const BLOG_DESCRIPTION =
  'The Onde Blog — tech deep dives, AI experiments, eGPU setups, and engineering stories from the FreeRiverHouse lab.'

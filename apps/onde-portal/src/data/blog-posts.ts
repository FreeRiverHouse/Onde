/**
 * Blog posts data — single source of truth.
 * Used by /blog page, RSS feed, and sitemap.
 */

export interface BlogPost {
  slug: string
  title: string
  subtitle: string
  description: string
  date: string          // Human-readable: "February 2026"
  dateISO: string       // ISO 8601: "2026-02-15T00:00:00Z"
  readTime: string
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
    slug: 'kalshi-trading-bot-ai',
    title: 'Come funziona il nostro trading bot AI su Kalshi',
    subtitle: '7.000 righe di Python che tradano da sole',
    description:
      'Dietro le quinte del nostro autotrader: architettura multi-agente (Forecaster, Critic, Trader), Kelly criterion, momentum detection e edge calibration su prediction markets.',
    date: 'February 2026',
    dateISO: '2026-02-15T12:00:00Z',
    readTime: '12 min read',
    tags: ['Trading', 'AI', 'Kalshi', 'Kelly Criterion', 'Python', 'Prediction Markets'],
    emoji: '🤖',
    gradient: 'from-onde-teal via-cyan-500 to-blue-500',
    excerpt:
      'Dietro le quinte del nostro autotrader: architettura multi-agente (Forecaster, Critic, Trader), Kelly criterion, momentum detection e edge calibration su prediction markets.',
    lang: 'it',
    contentHtml: `<p>Dietro le quinte del nostro autotrader su Kalshi: architettura multi-agente con Forecaster, Critic e Trader, Kelly criterion per il position sizing, momentum detection e edge calibration su prediction markets.</p><p>7.000 righe di Python che analizzano il mercato, stimano probabilità, calibrano gli edge e piazzano trade — completamente in automatico.</p><p><a href="https://onde.la/blog/kalshi-trading-bot-ai/">Read the full article →</a></p>`,
  },
  {
    slug: 'radeon-7900-xtx-mac-tinygrad',
    title: 'Running AMD Radeon RX 7900 XTX on macOS with TinyGrad',
    subtitle: 'The "Impossible" Setup',
    description:
      'We got a Radeon RX 7900 XTX (24GB VRAM) running ML inference on a MacBook Pro M1 via Thunderbolt eGPU, using TinyGrad with a small patch. Everyone said it was impossible.',
    date: 'February 2026',
    dateISO: '2026-02-15T00:00:00Z',
    readTime: '8 min read',
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
export const BLOG_TITLE = 'Onde Tech'
export const BLOG_DESCRIPTION =
  'Behind the scenes at Onde — the tech stack, AI agents, trading bots, eGPU setups, and engineering deep dives from the FreeRiverHouse lab.'

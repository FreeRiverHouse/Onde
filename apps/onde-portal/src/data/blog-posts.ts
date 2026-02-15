/**
 * Blog posts data — single source of truth.
 * Used by /blog page, RSS feed, and sitemap.
 */

/** Blog post categories */
export type BlogCategory = 'Tech' | 'AI' | 'Trading' | 'Design' | 'Updates'

export const BLOG_CATEGORIES: { value: BlogCategory | 'All'; label: string; emoji: string }[] = [
  { value: 'All', label: 'All', emoji: '🌊' },
  { value: 'Tech', label: 'Tech', emoji: '⚡' },
  { value: 'AI', label: 'AI', emoji: '🤖' },
  { value: 'Trading', label: 'Trading', emoji: '📈' },
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
    slug: 'how-we-built-onde-la',
    title: 'How We Built onde.la — A Free Kids\' Site, Mostly by AI',
    subtitle: 'Two Weeks, Two AI Agents, Zero Ads',
    description:
      'The full technical story behind onde.la: Next.js 14, Tailwind, Cloudflare Pages, 50+ browser games, an ePub reader, a Minecraft skin creator, and two AI agents that wrote 90% of the code in two weeks.',
    date: 'February 2026',
    dateISO: '2026-02-28T00:00:00Z',
    readTime: '11 min read',
    category: 'Tech',
    tags: ['Next.js', 'Tailwind', 'Cloudflare', 'Three.js', 'AI', 'Games', 'PWA', 'i18n'],
    emoji: '🌊',
    gradient: 'from-teal-400 via-cyan-500 to-blue-500',
    excerpt:
      'A free kids\' site with 50+ games, illustrated books, and a Minecraft skin creator — built in two weeks, mostly by AI agents. Here\'s the full technical story.',
    lang: 'en',
    contentHtml: `<p>onde.la is a free website for kids — no ads, no tracking, no paywalls. It has 50+ browser games, free illustrated books with an ePub reader, and a Minecraft skin creator with real-time 3D preview. The whole thing runs on Next.js 14 + Tailwind CSS + Cloudflare Pages, costs essentially nothing to host, and was built in about two weeks — with ~90% of the code written by AI agents.</p><p>This post covers the full technical story: stack decisions, game architecture, Three.js skin creator, multi-agent AI workflow, real analytics, and honest costs.</p><p><a href="https://onde.la/blog/how-we-built-onde-la/">Read the full article →</a></p>`,
  },
  {
    slug: 'multi-agent-setup',
    title: 'Multi-Agent Setup: 2 Macs, 5 Bots, Zero Humans',
    subtitle: 'Running a 24/7 AI Workforce on ~$200/month',
    description:
      'How we run a 24/7 AI workforce with 2 Mac Minis, 5 Claude-powered agents, a shared task system on git, and persistent memory — for about $200/month.',
    date: 'February 2026',
    dateISO: '2026-02-16T00:00:00Z',
    readTime: '10 min read',
    category: 'AI',
    tags: ['AI Agents', 'Multi-Agent', 'Claude', 'Automation', 'Mac Mini', 'Clawdbot'],
    emoji: '🤖',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    excerpt:
      'We run 5 Claude-powered agents across 2 Mac Minis, coordinated through git, with persistent memory and shared tasks. Here\'s how it actually works — and what breaks.',
    lang: 'en',
    contentHtml: `<p>We run a 24/7 AI workforce with 2 Mac Minis, 5 Claude-powered agents, a shared task system on git, and persistent memory — for about $200/month. This post covers the real architecture, the honest failures, and what we'd change.</p><p><a href="https://onde.la/blog/multi-agent-setup/">Read the full article →</a></p>`,
  },
  {
    slug: 'ai-trading-bot-kalshi',
    title: 'How We Built an AI Trading Bot for Kalshi (And What We Learned)',
    subtitle: 'From 44% Win Rate to AI Forecasting',
    description:
      'We built a trading bot for Kalshi prediction markets — starting with crypto price feeds, failing at 44% win rate, then discovering that LLMs like Claude are surprisingly good forecasters for non-crypto markets.',
    date: 'June 2025',
    dateISO: '2025-06-21T00:00:00Z',
    readTime: '10 min read',
    category: 'AI',
    tags: ['Kalshi', 'Prediction Markets', 'Trading Bot', 'Claude', 'LLM', 'Python'],
    emoji: '🎲',
    gradient: 'from-purple-500 via-indigo-500 to-blue-500',
    excerpt:
      'We built a trading bot for Kalshi prediction markets. The crypto approach had a mediocre 44% win rate. Then we discovered LLMs are surprisingly good at forecasting non-crypto events like CPI, Fed rates, and politics.',
    lang: 'en',
    contentHtml: `<p>We built a trading bot for Kalshi prediction markets — starting with simple crypto price feeds, achieving a mediocre 44% win rate, then discovering that LLMs like Claude are surprisingly effective forecasters for non-crypto markets like CPI, GDP, and politics.</p><p>This post covers real numbers, real code, and honest lessons about why prediction markets are hard to beat — and where the actual edge might be.</p><p><a href="https://onde.la/blog/ai-trading-bot-kalshi/">Read the full article →</a></p>`,
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

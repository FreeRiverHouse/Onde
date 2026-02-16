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
  // { value: 'Trading', label: 'Trading', emoji: '📈' },
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
  // NOTE: how-we-built-onde-la and multi-agent-setup REMOVED from public blog
  // per Mattia's request (2026-02-16) — too many internal details.
  // Files kept as backup in src/app/blog/ directories.
  {
    slug: 'free-minecraft-skin-creator-kids',
    title: 'Free Minecraft Skin Creator for Kids — AI-Powered Online Editor',
    subtitle: 'Kid-Friendly & Safe',
    description:
      'Create custom Minecraft skins for free! Our kid-friendly online editor features AI tools, 3D preview, and templates. Safe, no ads, no signup. Perfect for young gamers.',
    date: 'February 2026',
    dateISO: '2026-02-18T00:00:00Z',
    readTime: '5 min read',
    category: 'Design',
    tags: ['Minecraft', 'Skin Creator', 'Kids', 'AI', 'Free Tool', 'Gaming'],
    emoji: '🧒',
    gradient: 'from-cyan-500 via-blue-500 to-violet-500',
    excerpt:
      'A safe, ad-free Minecraft skin creator built for kids. AI color suggestions, 3D preview, fun templates — no signup, no downloads, totally free.',
    lang: 'en',
    contentHtml: `<p>A free, kid-friendly Minecraft skin creator with AI-powered tools, 3D preview, and dozens of templates. Designed for young gamers — no ads, no signup, no data collection.</p><p>Kids can design custom skins in minutes using simple drawing tools and smart AI color suggestions. Works with Minecraft Java &amp; Bedrock editions.</p><p><a href="https://onde.la/blog/free-minecraft-skin-creator-kids/">Read more →</a></p><p><a href="https://onde.la/games/skin-creator/">🎨 Open Skin Creator</a></p>`,
  },
  {
    slug: 'skin-creator-minecraft',
    title: 'Free Minecraft Skin Creator — Design Your Perfect Skin Online',
    subtitle: 'Create, Preview & Download',
    description:
      'Create custom Minecraft skins for free with our online Skin Creator. 3D preview, layer system, templates, and AI-powered tools. Works with Java & Bedrock editions.',
    date: 'February 2026',
    dateISO: '2026-02-16T00:00:00Z',
    readTime: '4 min read',
    category: 'Design',
    tags: ['Minecraft', 'Skin Creator', 'Free Tool', 'Gaming', 'Kids'],
    emoji: '🎨',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    excerpt:
      'Design unique Minecraft skins with our free browser-based creator. 3D preview, layers, templates, AI tools — no download, no signup.',
    lang: 'en',
    contentHtml: `<p>Create custom Minecraft skins for free with Onde's online Skin Creator. Features include a pixel canvas editor, real-time 3D preview, layer system, templates gallery, and AI-powered color suggestions.</p><p>Works with Minecraft Java &amp; Bedrock, plus Roblox, Fortnite, and Among Us. No download, no signup, 100% free.</p><p><a href="https://onde.la/blog/skin-creator-minecraft/">Read more →</a></p><p><a href="https://onde.la/games/skin-creator/">🎨 Open Skin Creator</a></p>`,
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

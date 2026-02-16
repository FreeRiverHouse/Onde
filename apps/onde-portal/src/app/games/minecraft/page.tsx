import type { Metadata } from 'next'
import Script from 'next/script'
import CategoryPage, { CategoryGame } from '../category/CategoryPage'

const games: CategoryGame[] = [
  {
    id: 'skin-creator',
    href: '/games/skin-creator',
    emoji: '🎨',
    title: 'Minecraft Skin Creator',
    description: 'Create custom Minecraft skins with our free online editor — pixel art, 3D preview, export & share',
  },
  {
    id: 'name-generator',
    href: '/games/name-generator',
    emoji: '📛',
    title: 'Minecraft Name Generator',
    description: 'Generate unique Minecraft usernames — fantasy, funny, pro gamer, and more styles',
  },
  {
    id: 'crafting-guide',
    href: '/games/crafting-guide',
    emoji: '⚒️',
    title: 'Crafting Recipe Guide',
    description: 'Interactive crafting table — search any recipe, drag & drop ingredients, learn every craft',
  },
  {
    id: 'enchant-calc',
    href: '/games/enchant-calc',
    emoji: '✨',
    title: 'Enchantment Calculator',
    description: 'Plan the perfect enchantments — calculate XP costs, find optimal enchanting order',
  },
  {
    id: 'pixel-art',
    href: '/games/pixel-art',
    emoji: '🖼️',
    title: 'Pixel Art Studio',
    description: 'Draw pixel art like Minecraft blocks — grid editor, palette, and export to PNG',
  },
  {
    id: 'banner-maker',
    href: '/games/banner-maker',
    emoji: '🏳️',
    title: 'Banner Designer',
    description: 'Design custom banners with patterns, layers, and colors — Minecraft style',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Free Minecraft Tools Online — Skin Creator, Name Generator, Crafting Guide | Onde',
  description:
    'Free Minecraft tools: Skin Creator, Name Generator, Crafting Guide, Enchantment Calculator, Pixel Art, and Banner Designer. No download, no login. Play in your browser!',
  url: 'https://onde.la/games/minecraft/',
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  hasPart: games.map((g) => ({
    '@type': 'SoftwareApplication',
    name: g.title,
    description: g.description,
    url: `https://onde.la${g.href}/`,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    audience: { '@type': 'PeopleAudience', suggestedMinAge: 6 },
  })),
}

export const metadata: Metadata = {
  title: 'Free Minecraft Tools Online — Skin Creator, Name Generator & More | Onde',
  description:
    'Free Minecraft tools: Skin Creator, Name Generator, Crafting Guide, Enchantment Calculator, Pixel Art Editor, and Banner Designer. No download required. Play online!',
  keywords: [
    'minecraft tools online free',
    'minecraft skin creator online',
    'minecraft skin maker free',
    'minecraft name generator',
    'minecraft username generator',
    'minecraft crafting guide',
    'minecraft crafting recipes',
    'minecraft enchantment calculator',
    'minecraft pixel art maker',
    'minecraft banner maker',
    'free minecraft games online',
    'minecraft tools no download',
    'minecraft skin editor free online',
  ],
  openGraph: {
    title: '⛏️ Free Minecraft Tools Online — Onde',
    description:
      'Skin Creator, Name Generator, Crafting Guide, Enchantment Calculator & more. All free, no download!',
    url: 'https://onde.la/games/minecraft/',
    siteName: 'Onde',
    images: [
      {
        url: '/images/og-skin-creator.png',
        width: 1200,
        height: 630,
        alt: 'Free Minecraft Tools - Onde',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '⛏️ Free Minecraft Tools Online — Onde',
    description:
      'Skin Creator, Name Generator, Crafting Guide & more. All free, no download!',
    images: ['/images/og-skin-creator.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://onde.la/games/minecraft/' },
}

export default function MinecraftHubPage() {
  return (
    <>
      <Script
        id="minecraft-hub-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryPage
        title="Minecraft Tools"
        subtitle="Free online tools for Minecraft players — skins, names, crafting, enchantments & more!"
        emoji="⛏️"
        headerGradient="from-green-600 to-emerald-500"
        cardAccent="border-green-200"
        games={games}
        relatedCategories={[
          { href: '/games/category/creative', emoji: '🎨', name: 'Creative & Art' },
          { href: '/games/category/puzzle', emoji: '🧩', name: 'Puzzle & Brain' },
          { href: '/games/category/educational', emoji: '📚', name: 'Educational' },
        ]}
      />
    </>
  )
}

import type { Metadata } from 'next'
import Script from 'next/script'
import CategoryPage, { CategoryGame } from '../CategoryPage'

const games: CategoryGame[] = [
  { id: 'draw', href: '/games/draw', emoji: '✏️', title: 'Drawing Canvas', description: 'Free drawing canvas with brushes, colors, and tools' },
  { id: 'coloring', href: '/games/coloring', emoji: '🖍️', title: 'Coloring Book', description: 'Express your creativity with a digital coloring book' },
  { id: 'music', href: '/games/music', emoji: '🎵', title: 'Music Maker', description: 'Create your own music with virtual instruments' },
  { id: 'rhythm', href: '/games/rhythm', emoji: '🥁', title: 'Rhythm Game', description: 'Hit the beats in time with the music' },
  { id: 'skin-creator', href: '/games/skin-creator', emoji: '🎨', title: 'Skin Creator', description: 'Create custom Minecraft skins with AI-powered editor' },
  { id: 'scratch', href: '/games/scratch', emoji: '💻', title: 'Scratch Card', description: 'Scratch and reveal hidden surprises' },
  { id: 'kids-chef-studio', href: '/games/kids-chef-studio', emoji: '👨‍🍳', title: 'Kids Chef Studio', description: 'Become a chef and cook delicious recipes' },
  { id: 'moonlight-magic-house', href: '/games/moonlight-magic-house', emoji: '🏠', title: 'Moonlight Magic House', description: 'Explore a magical house under the moonlight' },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Creative & Art Games for Kids - Onde',
  description: 'Free creative games for kids! Drawing, coloring, music making, rhythm games, and more. Express yourself and have fun. Safe and ad-free.',
  url: 'https://onde.la/games/category/creative/',
  publisher: {
    '@type': 'Organization',
    name: 'Onde',
    url: 'https://onde.la',
  },
  hasPart: games.map((g) => ({
    '@type': 'VideoGame',
    name: g.title,
    description: g.description,
    url: `https://onde.la${g.href}/`,
    genre: ['Educational', 'Creative'],
    audience: { '@type': 'PeopleAudience', suggestedMinAge: 3 },
  })),
}

export const metadata: Metadata = {
  title: 'Creative & Art Games for Kids — Free Online | Onde',
  description: 'Free creative games for kids! Drawing, coloring, music making, rhythm games, and more. Express yourself and have fun. Safe and ad-free.',
  keywords: [
    'creative games for kids',
    'art games for kids',
    'drawing games online',
    'coloring games for kids',
    'music games for kids',
    'kids music maker',
    'minecraft skin creator',
    'free art games online',
    'kids creative games',
    'rhythm games for kids',
  ],
  openGraph: {
    title: '🎨 Creative & Art Games for Kids — Onde',
    description: 'Free creative games for kids! Drawing, coloring, music, rhythm games and more. Express yourself!',
    url: 'https://onde.la/games/category/creative/',
    siteName: 'Onde',
    images: [{ url: '/images/og-games.png', width: 1200, height: 630, alt: 'Creative & Art Games for Kids - Onde' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🎨 Creative & Art Games for Kids — Onde',
    description: 'Free creative games! Drawing, coloring, music and more. Safe & ad-free!',
    images: ['/images/og-games.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://onde.la/games/category/creative/' },
}

export default function CreativeCategoryPage() {
  return (
    <>
      <Script
        id="creative-category-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryPage
        title="Creative & Art Games"
        subtitle="Draw, color, make music, and express your creativity!"
        emoji="🎨"
        headerGradient="from-orange-500 to-rose-500"
        cardAccent="border-orange-200"
        games={games}
        relatedCategories={[
          { href: '/games/category/puzzle', emoji: '🧩', name: 'Puzzle & Brain' },
          { href: '/games/category/educational', emoji: '📚', name: 'Educational' },
        ]}
      />
    </>
  )
}

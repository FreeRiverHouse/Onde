import type { Metadata } from 'next'
import Script from 'next/script'
import CategoryPage, { CategoryGame } from '../CategoryPage'

const games: CategoryGame[] = [
  { id: 'breakout', href: '/games/breakout', emoji: '🧱', title: 'Breakout', description: 'Smash bricks with a bouncing ball — classic arcade fun' },
  { id: 'invaders', href: '/games/invaders', emoji: '👾', title: 'Space Invaders', description: 'Defend Earth from waves of descending aliens' },
  { id: 'asteroids', href: '/games/asteroids', emoji: '☄️', title: 'Asteroids', description: 'Navigate your ship and blast asteroids in space' },
  { id: 'flappy', href: '/games/flappy', emoji: '🐦', title: 'Flappy Bird', description: 'Tap to fly through the pipes — how far can you go?' },
  { id: 'pong', href: '/games/pong', emoji: '🏓', title: 'Pong', description: 'Classic two-player paddle game' },
  { id: 'dino', href: '/games/dino', emoji: '🦕', title: 'Dino Run', description: 'Jump over obstacles in this endless runner' },
  { id: 'catch', href: '/games/catch', emoji: '🧺', title: 'Catch Game', description: 'Catch falling objects before they hit the ground' },
  { id: 'whack', href: '/games/whack', emoji: '🔨', title: 'Whack-a-Mole', description: 'Whack the moles as they pop up — test your reflexes' },
  { id: 'reaction', href: '/games/reaction', emoji: '⚡', title: 'Reaction Time', description: 'Test how fast you can react to visual cues' },
  { id: 'bubble-pop', href: '/games/bubble-pop', emoji: '🫧', title: 'Bubble Pop', description: 'Pop colorful bubbles before they float away' },
  { id: 'bubbles', href: '/games/bubbles', emoji: '🔮', title: 'Bubble Shooter', description: 'Shoot and match bubbles to clear the board' },
  { id: 'fortune-cookie', href: '/games/fortune-cookie', emoji: '🥠', title: 'Fortune Cookie', description: 'Crack open a cookie and discover your fortune' },
  { id: 'slots', href: '/games/slots', emoji: '🎰', title: 'Lucky Slots', description: 'Spin the reels and try your luck — kid-friendly fun' },
  { id: 'wheel', href: '/games/wheel', emoji: '🎡', title: 'Spin the Wheel', description: 'Spin the wheel and see where it lands' },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Action & Arcade Games for Kids - Onde',
  description: 'Free action and arcade games for kids! Breakout, Space Invaders, Flappy Bird, Pong, Whack-a-Mole and more classic games. Safe and ad-free.',
  url: 'https://onde.la/games/category/action/',
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
    genre: ['Arcade', 'Action'],
    audience: { '@type': 'PeopleAudience', suggestedMinAge: 4 },
  })),
}

export const metadata: Metadata = {
  title: 'Action & Arcade Games for Kids — Free Online | Onde',
  description: 'Free action and arcade games for kids! Breakout, Space Invaders, Flappy Bird, Pong, Whack-a-Mole and more classic games. Safe and ad-free.',
  keywords: [
    'arcade games for kids',
    'action games for kids',
    'free online arcade games',
    'kids breakout game',
    'space invaders for kids',
    'flappy bird online',
    'pong game',
    'whack a mole game',
    'classic arcade games',
    'safe games for children',
  ],
  openGraph: {
    title: '🕹️ Action & Arcade Games for Kids — Onde',
    description: 'Free arcade games for kids! Breakout, Space Invaders, Flappy Bird, Pong, Whack-a-Mole and more. Safe and ad-free!',
    url: 'https://onde.la/games/category/action/',
    siteName: 'Onde',
    images: [{ url: '/images/og-games.png', width: 1200, height: 630, alt: 'Action & Arcade Games for Kids - Onde' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🕹️ Action & Arcade Games for Kids — Onde',
    description: 'Free arcade games! Breakout, Invaders, Flappy Bird, Pong and more. Safe & ad-free!',
    images: ['/images/og-games.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://onde.la/games/category/action/' },
}

export default function ActionCategoryPage() {
  return (
    <>
      <Script
        id="action-category-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryPage
        title="Action & Arcade Games"
        subtitle="Classic arcade action — break bricks, blast aliens, and test your reflexes!"
        emoji="🕹️"
        headerGradient="from-red-500 to-orange-600"
        cardAccent="border-red-200"
        games={games}
        relatedCategories={[
          { href: '/games/category/puzzle', emoji: '🧩', name: 'Puzzle & Brain' },
          { href: '/games/category/educational', emoji: '📚', name: 'Educational' },
          { href: '/games/category/creative', emoji: '🎨', name: 'Creative' },
        ]}
      />
    </>
  )
}

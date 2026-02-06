import type { Metadata } from 'next'
import Script from 'next/script'
import CategoryPage, { CategoryGame } from '../CategoryPage'

const games: CategoryGame[] = [
  { id: 'quiz', href: '/games/quiz', emoji: '❓', title: 'Quiz Challenge', description: 'Test your knowledge with fun trivia questions' },
  { id: 'math', href: '/games/math', emoji: '➕', title: 'Math Quest', description: 'Fun math adventures — addition, subtraction, and more' },
  { id: 'counting', href: '/games/counting', emoji: '🔢', title: 'Counting Fun', description: 'Learn to count with colorful objects and animations' },
  { id: 'alphabet', href: '/games/alphabet', emoji: '🔤', title: 'ABC Fun', description: 'Learn the alphabet with fun interactive games' },
  { id: 'typing', href: '/games/typing', emoji: '⌨️', title: 'Typing Practice', description: 'Improve your typing speed and accuracy' },
  { id: 'typing-race', href: '/games/typing-race', emoji: '🏎️', title: 'Typing Race', description: 'Race against time by typing words as fast as you can' },
  { id: 'word-puzzle', href: '/games/word-puzzle', emoji: '📝', title: 'Word Puzzle', description: 'Unscramble letters and find hidden words' },
  { id: 'wordle', href: '/games/wordle', emoji: '🟩', title: 'Wordle', description: 'Guess the five-letter word in six tries' },
  { id: 'crossword', href: '/games/crossword', emoji: '📰', title: 'Crossword', description: 'Solve crossword puzzles with kid-friendly clues' },
  { id: 'hangman', href: '/games/hangman', emoji: '🪢', title: 'Hangman', description: 'Guess the hidden word letter by letter' },
  { id: '2048', href: '/games/2048', emoji: '🔢', title: '2048', description: 'Slide numbered tiles to combine them and reach 2048' },
  { id: 'memory', href: '/games/memory', emoji: '🧠', title: 'Memory', description: 'Flip cards and find matching pairs to train your brain' },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Educational Games for Kids - Onde',
  description: 'Free educational games for kids! Math, typing, quiz, alphabet, counting, and word games. Learn while having fun. Safe and ad-free.',
  url: 'https://onde.la/games/category/educational/',
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
    genre: ['Educational'],
    audience: { '@type': 'PeopleAudience', suggestedMinAge: 4 },
  })),
}

export const metadata: Metadata = {
  title: 'Educational Games for Kids — Free Online Learning | Onde',
  description: 'Free educational games for kids! Math, typing, quiz, alphabet, counting, and word games. Learn while having fun. Safe and ad-free.',
  keywords: [
    'educational games for kids',
    'learning games for kids',
    'math games for kids',
    'typing games for kids',
    'quiz games for kids',
    'alphabet games',
    'counting games',
    'word games for kids',
    'free learning games online',
    'kids educational games',
  ],
  openGraph: {
    title: '📚 Educational Games for Kids — Onde',
    description: 'Free educational games for kids! Math, typing, quiz, alphabet, counting and word games. Learn while having fun!',
    url: 'https://onde.la/games/category/educational/',
    siteName: 'Onde',
    images: [{ url: '/images/og-games.png', width: 1200, height: 630, alt: 'Educational Games for Kids - Onde' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '📚 Educational Games for Kids — Onde',
    description: 'Free learning games! Math, typing, quiz, alphabet and more. Safe & ad-free!',
    images: ['/images/og-games.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://onde.la/games/category/educational/' },
}

export default function EducationalCategoryPage() {
  return (
    <>
      <Script
        id="educational-category-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryPage
        title="Educational Games"
        subtitle="Learn math, words, typing and more while having fun!"
        emoji="📚"
        headerGradient="from-emerald-500 to-teal-600"
        cardAccent="border-emerald-200"
        games={games}
        relatedCategories={[
          { href: '/games/category/puzzle', emoji: '🧩', name: 'Puzzle & Brain' },
          { href: '/games/category/creative', emoji: '🎨', name: 'Creative' },
        ]}
      />
    </>
  )
}

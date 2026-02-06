import type { Metadata } from 'next'
import Script from 'next/script'
import CategoryPage, { CategoryGame } from '../CategoryPage'

const games: CategoryGame[] = [
  { id: 'puzzle', href: '/games/puzzle', emoji: '🧩', title: 'Sliding Puzzle', description: 'Slide tiles into the correct order to complete the picture' },
  { id: 'jigsaw', href: '/games/jigsaw', emoji: '🖼️', title: 'Jigsaw Puzzle', description: 'Piece together beautiful jigsaw puzzles online' },
  { id: 'memory', href: '/games/memory', emoji: '🧠', title: 'Memory', description: 'Flip cards and find matching pairs' },
  { id: 'matching', href: '/games/matching', emoji: '🃏', title: 'Matching Game', description: 'Match pairs of cards to clear the board' },
  { id: 'sudoku', href: '/games/sudoku', emoji: '🧮', title: 'Sudoku', description: 'Solve number puzzles with multiple difficulty levels' },
  { id: 'crossword', href: '/games/crossword', emoji: '📰', title: 'Crossword', description: 'Solve crossword puzzles with kid-friendly clues' },
  { id: 'minesweeper', href: '/games/minesweeper', emoji: '💣', title: 'Minesweeper', description: 'Classic logic puzzle — clear the minefield' },
  { id: 'maze', href: '/games/maze', emoji: '🏁', title: 'Maze Runner', description: 'Find your way through tricky mazes' },
  { id: 'wordle', href: '/games/wordle', emoji: '🟩', title: 'Wordle', description: 'Guess the five-letter word in six tries' },
  { id: 'hangman', href: '/games/hangman', emoji: '🪢', title: 'Hangman', description: 'Guess the hidden word letter by letter' },
  { id: 'spot-difference', href: '/games/spot-difference', emoji: '🔍', title: 'Spot the Difference', description: 'Compare two pictures and find all the differences' },
  { id: 'connect4', href: '/games/connect4', emoji: '🔴', title: 'Connect 4', description: 'Drop discs to connect four in a row' },
  { id: '2048', href: '/games/2048', emoji: '🔢', title: '2048', description: 'Slide numbered tiles to combine them and reach 2048' },
  { id: 'simon', href: '/games/simon', emoji: '🎯', title: 'Simon Says', description: 'Follow the pattern of lights and sounds' },
  { id: 'tictactoe', href: '/games/tictactoe', emoji: '⭕', title: 'Tic Tac Toe', description: 'Classic X and O strategy game' },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Puzzle & Brain Games for Kids - Onde',
  description: 'Free online puzzle games for kids! Sudoku, crossword, jigsaw, memory, maze, wordle and more brain-teasing games. Safe and ad-free.',
  url: 'https://onde.la/games/category/puzzle/',
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
    genre: ['Educational', 'Puzzle'],
    audience: { '@type': 'PeopleAudience', suggestedMinAge: 4 },
  })),
}

export const metadata: Metadata = {
  title: 'Puzzle & Brain Games for Kids — Free Online | Onde',
  description: 'Free online puzzle games for kids! Sudoku, crossword, jigsaw, memory, maze, wordle and more brain-teasing games. Safe and ad-free.',
  keywords: [
    'puzzle games for kids',
    'brain games for kids',
    'free online puzzle games',
    'kids sudoku',
    'kids crossword',
    'jigsaw puzzle online',
    'memory game for kids',
    'maze game',
    'wordle for kids',
    'educational puzzle games',
  ],
  openGraph: {
    title: '🧩 Puzzle & Brain Games for Kids — Onde',
    description: 'Free online puzzle games for kids! Sudoku, crossword, jigsaw, memory, maze, wordle and more. Safe and ad-free!',
    url: 'https://onde.la/games/category/puzzle/',
    siteName: 'Onde',
    images: [{ url: '/images/og-games.png', width: 1200, height: 630, alt: 'Puzzle & Brain Games for Kids - Onde' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🧩 Puzzle & Brain Games for Kids — Onde',
    description: 'Free puzzle games for kids! Sudoku, crossword, jigsaw, memory and more. Safe & ad-free!',
    images: ['/images/og-games.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://onde.la/games/category/puzzle/' },
}

export default function PuzzleCategoryPage() {
  return (
    <>
      <Script
        id="puzzle-category-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryPage
        title="Puzzle & Brain Games"
        subtitle="Challenge your mind with puzzles, logic games, and brain teasers!"
        emoji="🧩"
        headerGradient="from-purple-500 to-indigo-600"
        cardAccent="border-purple-200"
        games={games}
        relatedCategories={[
          { href: '/games/category/educational', emoji: '📚', name: 'Educational' },
          { href: '/games/category/creative', emoji: '🎨', name: 'Creative' },
        ]}
      />
    </>
  )
}

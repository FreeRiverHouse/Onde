import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sudoku - Free Online Game | Onde',
  description: 'Solve number puzzles! Classic Sudoku with multiple difficulty levels. Train your brain for free.',
  keywords: 'sudoku, number puzzle, brain game, logic puzzle',
  openGraph: {
    title: '🎮 Sudoku - Play Free Online!',
    description: 'Solve number puzzles! Classic Sudoku with multiple difficulty levels. Train your brain for free.',
    url: 'https://onde.la/games/sudoku/',
    siteName: 'Onde',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '🎮 Sudoku - Free Online Game',
    description: 'Solve number puzzles! Classic Sudoku with multiple difficulty levels. Train your brain for free.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

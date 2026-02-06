'use client';

import Link from 'next/link';
import { useMemo } from 'react';

interface GameInfo {
  slug: string;
  name: string;
  emoji: string;
  tags: string[];
}

const ALL_GAMES: GameInfo[] = [
  { slug: '2048', name: '2048', emoji: '🔢', tags: ['puzzle', 'numbers'] },
  { slug: 'alphabet', name: 'Alphabet', emoji: '🔤', tags: ['educational', 'kids'] },
  { slug: 'arcade', name: 'Arcade', emoji: '🕹️', tags: ['arcade', 'collection'] },
  { slug: 'asteroids', name: 'Asteroids', emoji: '☄️', tags: ['arcade', 'action'] },
  { slug: 'breakout', name: 'Breakout', emoji: '🧱', tags: ['arcade', 'action'] },
  { slug: 'bubble-pop', name: 'Bubble Pop', emoji: '🫧', tags: ['casual', 'kids'] },
  { slug: 'bubbles', name: 'Bubbles', emoji: '🔵', tags: ['casual', 'relaxing'] },
  { slug: 'catch', name: 'Catch', emoji: '🧤', tags: ['arcade', 'kids'] },
  { slug: 'coloring', name: 'Coloring', emoji: '🎨', tags: ['creative', 'kids'] },
  { slug: 'connect4', name: 'Connect 4', emoji: '🔴', tags: ['strategy', 'classic'] },
  { slug: 'counting', name: 'Counting', emoji: '🔢', tags: ['educational', 'kids'] },
  { slug: 'crossword', name: 'Crossword', emoji: '📝', tags: ['puzzle', 'words'] },
  { slug: 'dino', name: 'Dino Run', emoji: '🦕', tags: ['arcade', 'action'] },
  { slug: 'draw', name: 'Draw', emoji: '✏️', tags: ['creative', 'kids'] },
  { slug: 'flappy', name: 'Flappy', emoji: '🐦', tags: ['arcade', 'action'] },
  { slug: 'fortune-cookie', name: 'Fortune Cookie', emoji: '🥠', tags: ['casual', 'fun'] },
  { slug: 'hangman', name: 'Hangman', emoji: '📎', tags: ['puzzle', 'words'] },
  { slug: 'invaders', name: 'Space Invaders', emoji: '👾', tags: ['arcade', 'action'] },
  { slug: 'jigsaw', name: 'Jigsaw', emoji: '🧩', tags: ['puzzle', 'relaxing'] },
  { slug: 'kids-chef-studio', name: 'Chef Studio', emoji: '👨‍🍳', tags: ['educational', 'kids'] },
  { slug: 'matching', name: 'Matching', emoji: '🃏', tags: ['puzzle', 'memory'] },
  { slug: 'math', name: 'Math', emoji: '➕', tags: ['educational', 'numbers'] },
  { slug: 'maze', name: 'Maze', emoji: '🏁', tags: ['puzzle', 'action'] },
  { slug: 'memory', name: 'Memory', emoji: '🧠', tags: ['puzzle', 'memory'] },
  { slug: 'minesweeper', name: 'Minesweeper', emoji: '💣', tags: ['puzzle', 'classic'] },
  { slug: 'music', name: 'Music', emoji: '🎵', tags: ['creative', 'music'] },
  { slug: 'pong', name: 'Pong', emoji: '🏓', tags: ['arcade', 'classic'] },
  { slug: 'puzzle', name: 'Slide Puzzle', emoji: '🧩', tags: ['puzzle', 'classic'] },
  { slug: 'quiz', name: 'Quiz', emoji: '❓', tags: ['educational', 'trivia'] },
  { slug: 'reaction', name: 'Reaction', emoji: '⚡', tags: ['arcade', 'speed'] },
  { slug: 'rhythm', name: 'Rhythm', emoji: '🥁', tags: ['music', 'action'] },
  { slug: 'scratch', name: 'Scratch Card', emoji: '🎰', tags: ['casual', 'fun'] },
  { slug: 'simon', name: 'Simon', emoji: '🔴', tags: ['puzzle', 'memory'] },
  { slug: 'skin-creator', name: 'Skin Creator', emoji: '🎨', tags: ['creative', 'tool'] },
  { slug: 'slots', name: 'Lucky Slots', emoji: '🎰', tags: ['casual', 'fun'] },
  { slug: 'spot-difference', name: 'Spot Difference', emoji: '🔍', tags: ['puzzle', 'observation'] },
  { slug: 'sudoku', name: 'Sudoku', emoji: '9️⃣', tags: ['puzzle', 'numbers'] },
  { slug: 'tictactoe', name: 'Tic Tac Toe', emoji: '❌', tags: ['strategy', 'classic'] },
  { slug: 'typing', name: 'Typing', emoji: '⌨️', tags: ['educational', 'speed'] },
  { slug: 'typing-race', name: 'Typing Race', emoji: '🏎️', tags: ['educational', 'speed'] },
  { slug: 'whack', name: 'Whack-a-Mole', emoji: '🔨', tags: ['arcade', 'action'] },
  { slug: 'wheel', name: 'Spin Wheel', emoji: '🎡', tags: ['casual', 'fun'] },
  { slug: 'word-puzzle', name: 'Word Puzzle', emoji: '📖', tags: ['puzzle', 'words'] },
  { slug: 'wordle', name: 'Wordle', emoji: '🟩', tags: ['puzzle', 'words'] },
];

interface GameRecommendationsProps {
  currentGame: string; // slug of the current game
  count?: number;      // number of recommendations (default 4)
}

export default function GameRecommendations({ currentGame, count = 4 }: GameRecommendationsProps) {
  const recommendations = useMemo(() => {
    const current = ALL_GAMES.find(g => g.slug === currentGame);
    if (!current) return ALL_GAMES.filter(g => g.slug !== currentGame).slice(0, count);

    const others = ALL_GAMES.filter(g => g.slug !== currentGame);
    
    // Score by tag overlap
    const scored = others.map(game => {
      const overlap = game.tags.filter(t => current.tags.includes(t)).length;
      return { game, score: overlap + Math.random() * 0.5 }; // slight randomness
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, count).map(s => s.game);
  }, [currentGame, count]);

  return (
    <div className="mt-8 mx-auto max-w-2xl px-4 pb-8">
      <h3 className="text-lg font-bold text-white/80 mb-3">
        🎮 You might also like
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {recommendations.map(game => (
          <Link
            key={game.slug}
            href={`/games/${game.slug}`}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all hover:scale-105"
          >
            <span className="text-2xl">{game.emoji}</span>
            <span className="text-sm text-white/70 font-medium text-center leading-tight">
              {game.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

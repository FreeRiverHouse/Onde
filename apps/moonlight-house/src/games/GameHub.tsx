import { motion } from 'framer-motion';
import { useState } from 'react';

interface GameHubProps {
  onSelectGame: (game: string) => void;
  onBack: () => void;
  lang: 'it' | 'en';
}

// Featured games - show these first (4 core games)
const featuredGames = [
  { id: 'memory', emoji: '🧠', name: { it: 'Memory', en: 'Memory' }, color: '#6ee7b7' },
  { id: 'drawing', emoji: '🎨', name: { it: 'Disegna!', en: 'Draw!' }, color: '#ff85a1' },
  { id: 'bubbles', emoji: '🫧', name: { it: 'Bolle!', en: 'Bubbles!' }, color: '#93c5fd' },
  { id: 'puzzle', emoji: '🧩', name: { it: 'Puzzle', en: 'Puzzle' }, color: '#a78bfa' },
];

// More games - show when expanded
const moreGames = [
  { id: 'stars', emoji: '⭐', name: { it: 'Stelle', en: 'Stars' }, color: '#ffd93d' },
  { id: 'simon', emoji: '🎵', name: { it: 'Simon', en: 'Simon' }, color: '#8b5cf6' },
  { id: 'catch', emoji: '🧺', name: { it: 'Acchiappa!', en: 'Catch!' }, color: '#f59e0b' },
  { id: 'gardening', emoji: '🌱', name: { it: 'Giardino', en: 'Garden' }, color: '#4ade80' },
  { id: 'cooking', emoji: '👨‍🍳', name: { it: 'Cucina!', en: 'Cooking!' }, color: '#f97316' },
];

export default function GameHub({ onSelectGame, onBack, lang }: GameHubProps) {
  const [showMore, setShowMore] = useState(false);
  
  const t = {
    it: { title: '🎮 Giochi', back: '←', play: 'Gioca!', more: 'Altri Giochi ▼', less: 'Meno ▲' },
    en: { title: '🎮 Games', back: '←', play: 'Play!', more: 'More Games ▼', less: 'Less ▲' }
  }[lang];

  return (
    <div className="mini-game-overlay">
      <div className="gamehub-container glass-card">
        <div className="gamehub-header">
          <button className="back-btn" onClick={onBack}>{t.back}</button>
          <h2>{t.title}</h2>
          <div style={{ width: 40 }} /> {/* Spacer for centering */}
        </div>
        
        {/* Featured games - 2x2 grid with big cards */}
        <div className="games-grid-big">
          {featuredGames.map((game, i) => (
            <motion.button
              key={game.id}
              className="game-card-big"
              onClick={() => onSelectGame(game.id)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                '--game-color': game.color 
              } as React.CSSProperties}
            >
              <span className="game-emoji-big">{game.emoji}</span>
              <span className="game-name-big">{game.name[lang]}</span>
            </motion.button>
          ))}
        </div>

        {/* More games toggle */}
        <button 
          className="more-games-btn"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? t.less : t.more}
        </button>

        {/* More games - smaller cards in scrollable row */}
        {showMore && (
          <motion.div 
            className="games-row"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {moreGames.map((game, i) => (
              <motion.button
                key={game.id}
                className="game-card-small"
                onClick={() => onSelectGame(game.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  '--game-color': game.color 
                } as React.CSSProperties}
              >
                <span className="game-emoji-small">{game.emoji}</span>
                <span className="game-name-small">{game.name[lang]}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
      
      <style>{`
        .gamehub-container {
          max-width: 360px;
          width: 95%;
          margin: 0 auto;
          padding: 16px;
        }
        .gamehub-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .gamehub-header h2 {
          margin: 0;
          font-size: 1.4rem;
        }
        .back-btn {
          padding: 10px 14px;
          border-radius: 12px;
          background: rgba(255,255,255,0.15);
          border: none;
          color: white;
          cursor: pointer;
          font-size: 1.2rem;
        }
        
        /* Featured games - 2x2 big cards */
        .games-grid-big {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }
        .game-card-big {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 24px 16px;
          border-radius: 20px;
          border: 3px solid transparent;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
          backdrop-filter: blur(10px);
          cursor: pointer;
          transition: all 0.3s ease;
          aspect-ratio: 1;
        }
        .game-card-big:hover, .game-card-big:focus {
          border-color: var(--game-color);
          box-shadow: 0 0 24px color-mix(in srgb, var(--game-color) 40%, transparent);
          background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1));
        }
        .game-emoji-big {
          font-size: 4rem;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
        }
        .game-name-big {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        /* More games button */
        .more-games-btn {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255,255,255,0.1);
          border: 2px dashed rgba(255,255,255,0.3);
          color: rgba(255,255,255,0.8);
          cursor: pointer;
          font-size: 0.9rem;
          margin-bottom: 12px;
          transition: all 0.2s ease;
        }
        .more-games-btn:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.5);
        }
        
        /* More games - horizontal scroll row */
        .games-row {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
          -webkit-overflow-scrolling: touch;
        }
        .games-row::-webkit-scrollbar {
          height: 4px;
        }
        .games-row::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .games-row::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 4px;
        }
        .game-card-small {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
          border-radius: 14px;
          border: 2px solid transparent;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          backdrop-filter: blur(10px);
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .game-card-small:hover {
          border-color: var(--game-color);
        }
        .game-emoji-small {
          font-size: 2rem;
        }
        .game-name-small {
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

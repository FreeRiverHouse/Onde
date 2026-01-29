import { motion } from 'framer-motion';

interface GameHubProps {
  onSelectGame: (game: string) => void;
  onBack: () => void;
  lang: 'it' | 'en';
}

const games = [
  { id: 'stars', emoji: '⭐', name: { it: 'Cattura Stelle', en: 'Star Catch' }, color: '#ffd93d' },
  { id: 'puzzle', emoji: '🧩', name: { it: 'Puzzle Magico', en: 'Magic Puzzle' }, color: '#a78bfa' },
  { id: 'drawing', emoji: '🎨', name: { it: 'Disegna!', en: 'Draw!' }, color: '#ff85a1' },
  { id: 'memory', emoji: '🧠', name: { it: 'Memory', en: 'Memory' }, color: '#6ee7b7' },
];

export default function GameHub({ onSelectGame, onBack, lang }: GameHubProps) {
  const t = {
    it: { title: '🎮 Sala Giochi', back: '← Casa', play: 'Gioca!' },
    en: { title: '🎮 Game Room', back: '← Home', play: 'Play!' }
  }[lang];

  return (
    <div className="mini-game-overlay">
      <div className="gamehub-container glass-card">
        <div className="gamehub-header">
          <button className="back-btn" onClick={onBack}>{t.back}</button>
          <h2>{t.title}</h2>
        </div>
        
        <div className="games-grid">
          {games.map((game, i) => (
            <motion.button
              key={game.id}
              className="game-card"
              onClick={() => onSelectGame(game.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                '--game-color': game.color 
              } as React.CSSProperties}
            >
              <span className="game-emoji">{game.emoji}</span>
              <span className="game-name">{game.name[lang]}</span>
              <span className="play-btn">{t.play}</span>
            </motion.button>
          ))}
        </div>
      </div>
      
      <style>{`
        .gamehub-container {
          max-width: 400px;
          width: 95%;
          margin: 0 auto;
          padding: 20px;
        }
        .gamehub-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .gamehub-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }
        .games-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .game-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px 12px;
          border-radius: 16px;
          border: none;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          backdrop-filter: blur(10px);
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        .game-card:hover {
          border-color: var(--game-color);
          box-shadow: 0 0 20px color-mix(in srgb, var(--game-color) 30%, transparent);
        }
        .game-emoji {
          font-size: 3rem;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        .game-name {
          font-size: 1rem;
          font-weight: 600;
          color: white;
        }
        .play-btn {
          font-size: 0.8rem;
          padding: 4px 12px;
          border-radius: 20px;
          background: var(--game-color);
          color: #1a1a2e;
          font-weight: 600;
        }
        .back-btn {
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

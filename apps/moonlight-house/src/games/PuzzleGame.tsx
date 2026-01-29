import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PuzzleGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
  lang: 'it' | 'en';
}

interface Tile {
  id: number;
  currentPos: number;
  correctPos: number;
}

const puzzleImages = [
  '🌙', '⭐', '🐰', '🌸', '🦋', '🌈', '☀️', '🎀', '✨'
];

export default function PuzzleGame({ onComplete, onBack, lang }: PuzzleGameProps) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [gridSize] = useState(3); // 3x3 puzzle
  
  const t = {
    it: { title: '🧩 Puzzle Magico', moves: 'Mosse', back: '← Indietro', done: '🎉 Completato!', tap: 'Tocca due tessere per scambiarle!' },
    en: { title: '🧩 Magic Puzzle', moves: 'Moves', back: '← Back', done: '🎉 Completed!', tap: 'Tap two tiles to swap them!' }
  }[lang];

  const initializePuzzle = useCallback(() => {
    const totalTiles = gridSize * gridSize;
    const newTiles: Tile[] = [];
    const positions = Array.from({ length: totalTiles }, (_, i) => i);
    
    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    
    for (let i = 0; i < totalTiles; i++) {
      newTiles.push({
        id: i,
        currentPos: positions[i],
        correctPos: i
      });
    }
    
    setTiles(newTiles);
    setMoves(0);
    setCompleted(false);
    setSelectedTile(null);
  }, [gridSize]);

  useEffect(() => {
    initializePuzzle();
  }, [initializePuzzle]);

  const handleTileClick = (tileId: number) => {
    if (completed) return;
    
    if (selectedTile === null) {
      setSelectedTile(tileId);
    } else {
      // Swap tiles
      setTiles(prev => {
        const newTiles = [...prev];
        const tile1 = newTiles.find(t => t.id === selectedTile)!;
        const tile2 = newTiles.find(t => t.id === tileId)!;
        
        const tempPos = tile1.currentPos;
        tile1.currentPos = tile2.currentPos;
        tile2.currentPos = tempPos;
        
        return newTiles;
      });
      setMoves(m => m + 1);
      setSelectedTile(null);
    }
  };

  useEffect(() => {
    if (tiles.length > 0) {
      const isComplete = tiles.every(t => t.currentPos === t.correctPos);
      if (isComplete && moves > 0) {
        setCompleted(true);
        const score = Math.max(100 - moves * 2, 20);
        setTimeout(() => onComplete(score), 2000);
      }
    }
  }, [tiles, moves, onComplete]);

  const getTileAtPosition = (pos: number) => tiles.find(t => t.currentPos === pos);

  return (
    <div className="mini-game-overlay">
      <div className="puzzle-container glass-card">
        <div className="puzzle-header">
          <button className="back-btn" onClick={onBack}>{t.back}</button>
          <h2>{t.title}</h2>
          <span className="moves-counter">{t.moves}: {moves}</span>
        </div>
        
        <p className="puzzle-hint">{t.tap}</p>
        
        <div className="puzzle-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gap: '8px',
          padding: '16px'
        }}>
          <AnimatePresence>
            {Array.from({ length: gridSize * gridSize }).map((_, pos) => {
              const tile = getTileAtPosition(pos);
              if (!tile) return null;
              
              return (
                <motion.button
                  key={tile.id}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: selectedTile === tile.id ? 1.1 : 1, 
                    opacity: 1,
                    boxShadow: selectedTile === tile.id ? '0 0 20px rgba(255,255,0,0.5)' : 'none'
                  }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`puzzle-tile ${tile.currentPos === tile.correctPos ? 'correct' : ''}`}
                  onClick={() => handleTileClick(tile.id)}
                  style={{
                    width: '80px',
                    height: '80px',
                    fontSize: '2.5rem',
                    background: tile.currentPos === tile.correctPos 
                      ? 'linear-gradient(135deg, #6ee7b7 0%, #3b82f6 100%)' 
                      : 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
                    border: selectedTile === tile.id ? '3px solid yellow' : '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {puzzleImages[tile.id]}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {completed && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="puzzle-complete"
          >
            <span className="complete-text">{t.done}</span>
            <span className="complete-moves">{moves} {t.moves.toLowerCase()}!</span>
          </motion.div>
        )}
      </div>
      
      <style>{`
        .puzzle-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
        }
        .puzzle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .puzzle-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }
        .puzzle-hint {
          text-align: center;
          opacity: 0.7;
          margin-bottom: 12px;
        }
        .puzzle-grid {
          background: rgba(0,0,0,0.2);
          border-radius: 16px;
        }
        .puzzle-tile:hover {
          transform: scale(1.05);
        }
        .puzzle-complete {
          text-align: center;
          margin-top: 20px;
          animation: bounce 0.5s ease infinite alternate;
        }
        .complete-text {
          display: block;
          font-size: 2rem;
        }
        .complete-moves {
          display: block;
          opacity: 0.8;
        }
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

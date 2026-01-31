import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CatchGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
  lang: 'it' | 'en';
}

interface FallingItem {
  id: number;
  x: number;
  y: number;
  emoji: string;
  points: number;
  speed: number;
}

const items = [
  { emoji: '⭐', points: 10, weight: 30 },
  { emoji: '🍎', points: 5, weight: 25 },
  { emoji: '🍪', points: 5, weight: 25 },
  { emoji: '💎', points: 20, weight: 10 },
  { emoji: '🌙', points: 15, weight: 10 },
  { emoji: '💣', points: -15, weight: 15 }, // Bomb - avoid!
];

export default function CatchGame({ onComplete, onBack, lang }: CatchGameProps) {
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [basketX, setBasketX] = useState(50);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isPlaying, setIsPlaying] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('catchHighScore');
    return saved ? parseInt(saved) : 0;
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const isTouchDevice = useRef('ontouchstart' in window);

  const t = {
    it: {
      title: '🧺 Acchiappa!',
      back: '← Indietro',
      score: 'Punti',
      time: 'Tempo',
      start: '▶️ Inizia!',
      gameOver: '⏰ Fine!',
      newRecord: '🏆 Nuovo Record!',
      playAgain: '🔄 Rigioca',
      hint: 'Muovi il cestino per catturare le stelle!',
      avoidBombs: '💣 Evita le bombe!',
    },
    en: {
      title: '🧺 Catch!',
      back: '← Back',
      score: 'Score',
      time: 'Time',
      start: '▶️ Start!',
      gameOver: '⏰ Time Up!',
      newRecord: '🏆 New Record!',
      playAgain: '🔄 Play Again',
      hint: 'Move the basket to catch the stars!',
      avoidBombs: '💣 Avoid the bombs!',
    }
  }[lang];

  // Weighted random item selection
  const getRandomItem = useCallback(() => {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of items) {
      random -= item.weight;
      if (random <= 0) {
        return item;
      }
    }
    return items[0];
  }, []);

  // Spawn items
  const spawnItem = useCallback(() => {
    const item = getRandomItem();
    const newItem: FallingItem = {
      id: Date.now() + Math.random(),
      x: 5 + Math.random() * 90,
      y: -10,
      emoji: item.emoji,
      points: item.points,
      speed: 1 + Math.random() * 0.8 + (45 - timeLeft) * 0.02, // Gets faster over time
    };
    setFallingItems(prev => [...prev, newItem]);
  }, [getRandomItem, timeLeft]);

  // Move items down
  useEffect(() => {
    if (!isPlaying) return;
    
    const moveInterval = setInterval(() => {
      setFallingItems(prev => {
        const updated = prev
          .map(item => ({ ...item, y: item.y + item.speed }))
          .filter(item => item.y < 105);
        
        // Check for catches
        const caught: number[] = [];
        updated.forEach(item => {
          if (item.y > 75 && item.y < 95) {
            const distance = Math.abs(item.x - basketX);
            if (distance < 12) {
              caught.push(item.id);
              const points = item.points;
              
              if (points > 0) {
                setCombo(c => c + 1);
                setShowCombo(true);
                setTimeout(() => setShowCombo(false), 500);
                const comboBonus = Math.floor(combo / 3);
                setScore(s => s + points + comboBonus);
              } else {
                setCombo(0);
                setScore(s => Math.max(0, s + points));
              }
            }
          }
        });
        
        return updated.filter(item => !caught.includes(item.id));
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [isPlaying, basketX, combo]);

  // Spawn timer
  useEffect(() => {
    if (!isPlaying) return;
    
    const spawnInterval = setInterval(spawnItem, 700);
    return () => clearInterval(spawnInterval);
  }, [isPlaying, spawnItem]);

  // Game timer
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('catchHighScore', score.toString());
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score, highScore]);

  // Mouse/touch controls
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !isPlaying) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(10, Math.min(90, x)));
  }, [isPlaying]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  // Keyboard controls
  useEffect(() => {
    if (!isPlaying) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setBasketX(x => Math.max(10, x - 5));
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setBasketX(x => Math.min(90, x + 5));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const startGame = () => {
    setFallingItems([]);
    setScore(0);
    setTimeLeft(45);
    setBasketX(50);
    setCombo(0);
    setIsPlaying(true);
  };

  return (
    <div className="mini-game-overlay">
      <div className="catch-game">
        <div className="catch-header">
          <button className="back-btn" onClick={onBack}>{t.back}</button>
          <h2>{t.title}</h2>
          <div className="catch-stats">
            <span className="stat">{t.score}: {score}</span>
            <span className={`stat time ${timeLeft <= 10 ? 'urgent' : ''}`}>
              {t.time}: {timeLeft}s
            </span>
          </div>
        </div>

        <div 
          className="catch-arena"
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
        >
          <AnimatePresence>
            {fallingItems.map(item => (
              <motion.div
                key={item.id}
                className={`falling-item ${item.points < 0 ? 'bomb' : ''}`}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 1.5, opacity: 0 }}
              >
                {item.emoji}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Basket */}
          <motion.div 
            className="basket"
            style={{ left: `${basketX}%` }}
            animate={{ x: '-50%' }}
          >
            🧺
          </motion.div>

          {/* Combo indicator */}
          <AnimatePresence>
            {showCombo && combo > 2 && (
              <motion.div
                className="combo-text"
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                🔥 x{combo}!
              </motion.div>
            )}
          </AnimatePresence>

          {!isPlaying && timeLeft === 45 && (
            <motion.div 
              className="start-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="hint">{t.hint}</p>
              <p className="hint-small">{t.avoidBombs}</p>
              <button className="start-btn" onClick={startGame}>
                {t.start}
              </button>
              {highScore > 0 && (
                <p className="high-score">🏆 Best: {highScore}</p>
              )}
            </motion.div>
          )}

          {!isPlaying && timeLeft === 0 && (
            <motion.div 
              className="game-over-screen"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <h3>{t.gameOver}</h3>
              <p className="final-score">{score} ⭐</p>
              {score > highScore && score > 0 && (
                <p className="new-record">{t.newRecord}</p>
              )}
              <div className="gameover-buttons">
                <button className="play-again-btn" onClick={startGame}>
                  {t.playAgain}
                </button>
                <button 
                  className="done-btn" 
                  onClick={() => onComplete(score)}
                >
                  ✓ OK (+{Math.floor(score / 3)} XP)
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="controls-hint">
          {isTouchDevice.current ? '👆 Tocca e trascina' : '⬅️ ➡️ o A/D per muoversi'}
        </div>
      </div>

      <style>{`
        .catch-game {
          max-width: 400px;
          width: 95%;
          height: 520px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #0f172a 0%, #1e3a5f 50%, #0d9488 100%);
          border-radius: 20px;
          overflow: hidden;
        }
        .catch-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          gap: 8px;
          background: rgba(0,0,0,0.3);
        }
        .catch-header h2 {
          margin: 0;
          font-size: 1.2rem;
        }
        .catch-stats {
          display: flex;
          gap: 10px;
          font-size: 0.9rem;
        }
        .stat {
          background: rgba(255,255,255,0.1);
          padding: 4px 10px;
          border-radius: 12px;
        }
        .stat.time.urgent {
          color: #f87171;
          font-weight: bold;
          animation: pulse 0.5s ease infinite alternate;
        }
        .catch-arena {
          flex: 1;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          touch-action: none;
        }
        .falling-item {
          position: absolute;
          transform: translate(-50%, -50%);
          font-size: 2rem;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          pointer-events: none;
        }
        .falling-item.bomb {
          animation: shake 0.3s ease infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translate(-50%, -50%) rotate(-5deg); }
          50% { transform: translate(-50%, -50%) rotate(5deg); }
        }
        .basket {
          position: absolute;
          bottom: 5%;
          font-size: 3rem;
          transform: translateX(-50%);
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
          transition: left 0.05s ease-out;
        }
        .combo-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 2rem;
          font-weight: bold;
          color: #fbbf24;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
          pointer-events: none;
        }
        .controls-hint {
          text-align: center;
          padding: 8px;
          font-size: 0.85rem;
          opacity: 0.7;
          background: rgba(0,0,0,0.2);
        }
        .start-screen, .game-over-screen {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(5px);
        }
        .hint {
          font-size: 1rem;
          margin: 0;
        }
        .hint-small {
          font-size: 0.9rem;
          opacity: 0.7;
          margin: 0;
        }
        .start-btn, .play-again-btn, .done-btn {
          padding: 12px 32px;
          font-size: 1.2rem;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          color: white;
          font-weight: bold;
          transition: transform 0.2s;
        }
        .start-btn:hover, .play-again-btn:hover, .done-btn:hover {
          transform: scale(1.05);
        }
        .done-btn {
          background: linear-gradient(135deg, #10b981, #3b82f6);
          font-size: 1rem;
        }
        .high-score {
          opacity: 0.7;
          margin: 0;
        }
        .final-score {
          font-size: 3rem;
          font-weight: bold;
          margin: 0;
        }
        .new-record {
          color: #fbbf24;
          animation: pulse 0.5s ease infinite alternate;
          margin: 0;
        }
        .gameover-buttons {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
        }
        @keyframes pulse {
          to { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

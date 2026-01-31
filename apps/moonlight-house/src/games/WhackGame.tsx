import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WhackGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
  lang: 'it' | 'en';
}

interface Mole {
  id: number;
  holeIndex: number;
  type: 'normal' | 'golden' | 'bomb';
  isWhacked: boolean;
}

export default function WhackGame({ onComplete, onBack, lang }: WhackGameProps) {
  const [moles, setMoles] = useState<Mole[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('whackHighScore');
    return saved ? parseInt(saved) : 0;
  });
  const [showHit, setShowHit] = useState<number | null>(null);
  const moleIdRef = useRef(0);

  const t = {
    it: {
      title: '🎯 Acchiappa la Talpa!',
      back: '← Indietro',
      score: 'Punti',
      time: 'Tempo',
      start: '▶️ Inizia!',
      gameOver: '⏰ Fine!',
      newRecord: '🏆 Nuovo Record!',
      playAgain: '🔄 Rigioca',
      hint: 'Colpisci le talpe quando escono!',
      golden: '⭐ Dorate = +20',
      bomb: '💣 Bombe = -10',
    },
    en: {
      title: '🎯 Whack-a-Mole!',
      back: '← Back',
      score: 'Score',
      time: 'Time',
      start: '▶️ Start!',
      gameOver: '⏰ Time Up!',
      newRecord: '🏆 New Record!',
      playAgain: '🔄 Play Again',
      hint: 'Hit the moles when they pop up!',
      golden: '⭐ Golden = +20',
      bomb: '💣 Bombs = -10',
    }
  }[lang];

  const holes = Array.from({ length: 9 }, (_, i) => i);

  // Spawn mole
  const spawnMole = useCallback(() => {
    const occupiedHoles = moles.filter(m => !m.isWhacked).map(m => m.holeIndex);
    const availableHoles = holes.filter(h => !occupiedHoles.includes(h));
    
    if (availableHoles.length === 0) return;
    
    const holeIndex = availableHoles[Math.floor(Math.random() * availableHoles.length)];
    const rand = Math.random();
    const type = rand < 0.1 ? 'golden' : rand < 0.2 ? 'bomb' : 'normal';
    
    const newMole: Mole = {
      id: moleIdRef.current++,
      holeIndex,
      type,
      isWhacked: false,
    };
    
    setMoles(prev => [...prev, newMole]);
    
    // Auto-hide after delay
    const hideDelay = 1000 + Math.random() * 800 - (30 - timeLeft) * 20;
    setTimeout(() => {
      setMoles(prev => prev.filter(m => m.id !== newMole.id));
    }, Math.max(hideDelay, 500));
  }, [moles, holes, timeLeft]);

  // Spawn timer
  useEffect(() => {
    if (!isPlaying) return;
    
    const spawnInterval = setInterval(() => {
      spawnMole();
    }, 600 - (30 - timeLeft) * 10);

    return () => clearInterval(spawnInterval);
  }, [isPlaying, spawnMole, timeLeft]);

  // Game timer
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('whackHighScore', score.toString());
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score, highScore]);

  const whackMole = (mole: Mole) => {
    if (mole.isWhacked) return;
    
    setMoles(prev => prev.map(m => 
      m.id === mole.id ? { ...m, isWhacked: true } : m
    ));
    
    setShowHit(mole.holeIndex);
    setTimeout(() => setShowHit(null), 200);

    switch (mole.type) {
      case 'golden':
        setScore(s => s + 20);
        break;
      case 'bomb':
        setScore(s => Math.max(0, s - 10));
        break;
      default:
        setScore(s => s + 10);
    }

    // Remove whacked mole after animation
    setTimeout(() => {
      setMoles(prev => prev.filter(m => m.id !== mole.id));
    }, 150);
  };

  const startGame = () => {
    setMoles([]);
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    moleIdRef.current = 0;
  };

  const getMoleEmoji = (type: string) => {
    switch (type) {
      case 'golden': return '⭐';
      case 'bomb': return '💣';
      default: return '🐹';
    }
  };

  return (
    <div className="mini-game-overlay">
      <div className="whack-game">
        <div className="whack-header">
          <button className="back-btn" onClick={onBack}>{t.back}</button>
          <h2>{t.title}</h2>
          <div className="whack-stats">
            <span className="stat">{t.score}: {score}</span>
            <span className={`stat time ${timeLeft <= 10 ? 'urgent' : ''}`}>
              {t.time}: {timeLeft}s
            </span>
          </div>
        </div>

        <div className="whack-arena">
          <div className="holes-grid">
            {holes.map(holeIndex => {
              const mole = moles.find(m => m.holeIndex === holeIndex && !m.isWhacked);
              
              return (
                <div 
                  key={holeIndex} 
                  className={`hole ${showHit === holeIndex ? 'hit' : ''}`}
                  onClick={() => mole && whackMole(mole)}
                >
                  <div className="hole-back" />
                  <AnimatePresence>
                    {mole && (
                      <motion.div
                        className={`mole ${mole.type}`}
                        initial={{ y: 60, scale: 0.8 }}
                        animate={{ y: 0, scale: 1 }}
                        exit={{ y: 60, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        {getMoleEmoji(mole.type)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="hole-front" />
                </div>
              );
            })}
          </div>

          {!isPlaying && timeLeft === 30 && (
            <motion.div 
              className="start-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="hint">{t.hint}</p>
              <p className="hint-small">{t.golden}</p>
              <p className="hint-small">{t.bomb}</p>
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
              <p className="final-score">{score} 🎯</p>
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
                  ✓ OK (+{Math.floor(score / 4)} XP)
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        .whack-game {
          max-width: 400px;
          width: 95%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #854d0e 0%, #a16207 50%, #65a30d 100%);
          border-radius: 20px;
          overflow: hidden;
        }
        .whack-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          gap: 8px;
          background: rgba(0,0,0,0.3);
        }
        .whack-header h2 {
          margin: 0;
          font-size: 1.1rem;
        }
        .whack-stats {
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
          color: #fca5a5;
          font-weight: bold;
          animation: pulse 0.5s ease infinite alternate;
        }
        .whack-arena {
          position: relative;
          padding: 30px 20px;
        }
        .holes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          max-width: 320px;
          margin: 0 auto;
        }
        .hole {
          position: relative;
          aspect-ratio: 1;
          cursor: pointer;
          overflow: hidden;
        }
        .hole-back {
          position: absolute;
          bottom: 5%;
          left: 10%;
          right: 10%;
          height: 40%;
          background: #1f1f1f;
          border-radius: 50%;
          box-shadow: inset 0 5px 15px rgba(0,0,0,0.8);
        }
        .hole-front {
          position: absolute;
          bottom: 0;
          left: 5%;
          right: 5%;
          height: 30%;
          background: linear-gradient(180deg, #65a30d 0%, #4d7c0f 100%);
          border-radius: 50% 50% 40% 40%;
          z-index: 2;
        }
        .hole.hit .hole-front {
          background: linear-gradient(180deg, #fbbf24 0%, #d97706 100%);
        }
        .mole {
          position: absolute;
          bottom: 20%;
          left: 50%;
          transform: translateX(-50%);
          font-size: 3rem;
          z-index: 1;
          cursor: pointer;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
          transition: filter 0.1s;
        }
        .mole:active {
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5)) brightness(0.8);
        }
        .mole.bomb {
          animation: shake 0.3s ease infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(-50%) rotate(-5deg); }
          50% { transform: translateX(-50%) rotate(5deg); }
        }
        .start-screen, .game-over-screen {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(5px);
          z-index: 10;
        }
        .hint {
          font-size: 1rem;
          margin: 0;
        }
        .hint-small {
          font-size: 0.85rem;
          opacity: 0.7;
          margin: 0;
        }
        .start-btn, .play-again-btn, .done-btn {
          padding: 12px 32px;
          font-size: 1.2rem;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          background: linear-gradient(135deg, #84cc16, #22c55e);
          color: white;
          font-weight: bold;
          transition: transform 0.2s;
          margin-top: 10px;
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

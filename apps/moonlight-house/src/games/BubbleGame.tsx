import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BubbleGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
  lang: 'it' | 'en';
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  emoji: string;
  speed: number;
}

const bubbleEmojis = ['🌙', '⭐', '🦋', '🌸', '💖', '🌈', '✨', '🎀'];
const bubbleColors = [
  'rgba(168, 123, 250, 0.7)',
  'rgba(255, 133, 161, 0.7)',
  'rgba(110, 231, 183, 0.7)',
  'rgba(255, 217, 61, 0.7)',
  'rgba(147, 197, 253, 0.7)',
];

export default function BubbleGame({ onComplete, onBack, lang }: BubbleGameProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('bubbleHighScore');
    return saved ? parseInt(saved) : 0;
  });

  const t = {
    it: {
      title: '🫧 Scoppia le Bolle!',
      back: '← Indietro',
      score: 'Punti',
      time: 'Tempo',
      start: '▶️ Inizia!',
      gameOver: '⏰ Fine!',
      newRecord: '🏆 Nuovo Record!',
      playAgain: '🔄 Rigioca',
      hint: 'Tocca le bolle prima che scappino!',
    },
    en: {
      title: '🫧 Pop the Bubbles!',
      back: '← Back',
      score: 'Score',
      time: 'Time',
      start: '▶️ Start!',
      gameOver: '⏰ Time Up!',
      newRecord: '🏆 New Record!',
      playAgain: '🔄 Play Again',
      hint: 'Tap the bubbles before they escape!',
    }
  }[lang];

  // Spawn bubbles
  const spawnBubble = useCallback(() => {
    const id = Date.now() + Math.random();
    const newBubble: Bubble = {
      id,
      x: 10 + Math.random() * 80, // % position
      y: 110, // Start below screen
      size: 40 + Math.random() * 30,
      color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
      emoji: bubbleEmojis[Math.floor(Math.random() * bubbleEmojis.length)],
      speed: 0.8 + Math.random() * 0.8,
    };
    setBubbles(prev => [...prev, newBubble]);
  }, []);

  // Move bubbles up
  useEffect(() => {
    if (!isPlaying) return;
    
    const moveInterval = setInterval(() => {
      setBubbles(prev => 
        prev
          .map(b => ({ ...b, y: b.y - b.speed }))
          .filter(b => b.y > -20) // Remove escaped bubbles
      );
    }, 50);

    return () => clearInterval(moveInterval);
  }, [isPlaying]);

  // Spawn timer
  useEffect(() => {
    if (!isPlaying) return;
    
    const spawnInterval = setInterval(() => {
      spawnBubble();
    }, 600);

    return () => clearInterval(spawnInterval);
  }, [isPlaying, spawnBubble]);

  // Game timer
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          // Check high score
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('bubbleHighScore', score.toString());
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score, highScore]);

  const popBubble = (id: number, size: number) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    // Smaller bubbles = more points
    const points = Math.round((100 - size) / 10) + 1;
    setScore(prev => prev + points);
  };

  const startGame = () => {
    setBubbles([]);
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
  };

  return (
    <div className="mini-game-overlay">
      <div className="bubble-game">
        <div className="bubble-header">
          <button className="back-btn" onClick={onBack}>{t.back}</button>
          <h2>{t.title}</h2>
          <div className="bubble-stats">
            <span className="stat">{t.score}: {score}</span>
            <span className="stat time">{t.time}: {timeLeft}s</span>
          </div>
        </div>

        <div className="bubble-arena">
          <AnimatePresence>
            {bubbles.map(bubble => (
              <motion.button
                key={bubble.id}
                className="bubble"
                onClick={() => popBubble(bubble.id, bubble.size)}
                style={{
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`,
                  width: bubble.size,
                  height: bubble.size,
                  background: bubble.color,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
                whileTap={{ scale: 0.5 }}
              >
                <span className="bubble-emoji">{bubble.emoji}</span>
              </motion.button>
            ))}
          </AnimatePresence>

          {!isPlaying && timeLeft === 30 && (
            <motion.div 
              className="start-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="hint">{t.hint}</p>
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
              <p className="final-score">{score} 🫧</p>
              {score > highScore && score > 0 && (
                <p className="new-record">{t.newRecord}</p>
              )}
              <button className="play-again-btn" onClick={startGame}>
                {t.playAgain}
              </button>
              <button 
                className="done-btn" 
                onClick={() => onComplete(score)}
              >
                ✓ OK (+{Math.floor(score / 5)} XP)
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        .bubble-game {
          max-width: 400px;
          width: 95%;
          height: 500px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 20px;
          overflow: hidden;
        }
        .bubble-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          gap: 8px;
          background: rgba(0,0,0,0.3);
        }
        .bubble-header h2 {
          margin: 0;
          font-size: 1.2rem;
          flex: 1;
          text-align: center;
        }
        .bubble-stats {
          display: flex;
          gap: 12px;
          font-size: 0.9rem;
        }
        .stat {
          background: rgba(255,255,255,0.1);
          padding: 4px 10px;
          border-radius: 12px;
        }
        .stat.time {
          color: ${timeLeft <= 5 ? '#ff6b6b' : 'inherit'};
          font-weight: ${timeLeft <= 5 ? 'bold' : 'normal'};
        }
        .bubble-arena {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, 
            rgba(168,123,250,0.1) 0%, 
            rgba(147,197,253,0.1) 50%,
            rgba(110,231,183,0.1) 100%
          );
        }
        .bubble {
          position: absolute;
          transform: translate(-50%, -50%);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            inset 0 0 20px rgba(255,255,255,0.3),
            0 4px 15px rgba(0,0,0,0.2);
          backdrop-filter: blur(2px);
        }
        .bubble:hover {
          filter: brightness(1.2);
        }
        .bubble-emoji {
          font-size: 1.2rem;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
        }
        .start-screen, .game-over-screen {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(5px);
        }
        .hint {
          font-size: 1rem;
          opacity: 0.8;
        }
        .start-btn, .play-again-btn, .done-btn {
          padding: 12px 32px;
          font-size: 1.2rem;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          background: linear-gradient(135deg, #a78bfa, #ec4899);
          color: white;
          font-weight: bold;
          transition: transform 0.2s;
        }
        .start-btn:hover, .play-again-btn:hover, .done-btn:hover {
          transform: scale(1.05);
        }
        .done-btn {
          background: linear-gradient(135deg, #6ee7b7, #3b82f6);
          font-size: 1rem;
        }
        .high-score {
          opacity: 0.7;
          font-size: 0.9rem;
        }
        .final-score {
          font-size: 3rem;
          font-weight: bold;
          margin: 0;
        }
        .new-record {
          color: #ffd93d;
          animation: pulse 0.5s ease infinite alternate;
        }
        @keyframes pulse {
          to { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

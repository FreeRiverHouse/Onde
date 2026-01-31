import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface SimonGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
  lang: 'it' | 'en';
}

const colors = [
  { id: 0, color: '#ef4444', activeColor: '#f87171', emoji: '❤️' },
  { id: 1, color: '#22c55e', activeColor: '#4ade80', emoji: '💚' },
  { id: 2, color: '#3b82f6', activeColor: '#60a5fa', emoji: '💙' },
  { id: 3, color: '#eab308', activeColor: '#facc15', emoji: '💛' },
];

type GamePhase = 'idle' | 'showing' | 'input' | 'success' | 'gameover';

export default function SimonGame({ onComplete, onBack, lang }: SimonGameProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('simonHighScore');
    return saved ? parseInt(saved) : 0;
  });
  const timeoutRef = useRef<number | null>(null);

  const t = {
    it: {
      title: '🎵 Simon Dice',
      back: '← Indietro',
      score: 'Livello',
      start: '▶️ Inizia!',
      watch: '👀 Guarda!',
      yourTurn: '👆 Tocca a te!',
      correct: '✨ Bravo!',
      wrong: '💥 Sbagliato!',
      newRecord: '🏆 Nuovo Record!',
      playAgain: '🔄 Rigioca',
      hint: 'Ripeti la sequenza di colori!',
    },
    en: {
      title: '🎵 Simon Says',
      back: '← Back',
      score: 'Level',
      start: '▶️ Start!',
      watch: '👀 Watch!',
      yourTurn: '👆 Your turn!',
      correct: '✨ Great!',
      wrong: '💥 Wrong!',
      newRecord: '🏆 New Record!',
      playAgain: '🔄 Play Again',
      hint: 'Repeat the color sequence!',
    }
  }[lang];

  // Play sound for a color
  const playSound = useCallback((colorId: number) => {
    // Create simple oscillator tones
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      // Different frequencies for each color
      const frequencies = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      oscillator.frequency.value = frequencies[colorId];
      oscillator.type = 'sine';
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Audio not available
    }
  }, []);

  // Flash a button
  const flashButton = useCallback((colorId: number, duration: number = 400) => {
    setActiveButton(colorId);
    playSound(colorId);
    return new Promise<void>(resolve => {
      setTimeout(() => {
        setActiveButton(null);
        setTimeout(resolve, 100);
      }, duration);
    });
  }, [playSound]);

  // Show the sequence
  const showSequence = useCallback(async () => {
    setPhase('showing');
    await new Promise(r => setTimeout(r, 500));
    
    for (const colorId of sequence) {
      await flashButton(colorId, 400);
    }
    
    setPhase('input');
    setPlayerInput([]);
  }, [sequence, flashButton]);

  // Start a new game
  const startGame = useCallback(() => {
    const firstColor = Math.floor(Math.random() * 4);
    setSequence([firstColor]);
    setScore(0);
    setPlayerInput([]);
  }, []);

  // Handle player input
  const handleButtonClick = useCallback((colorId: number) => {
    if (phase !== 'input') return;
    
    playSound(colorId);
    setActiveButton(colorId);
    setTimeout(() => setActiveButton(null), 200);
    
    const newInput = [...playerInput, colorId];
    setPlayerInput(newInput);
    
    // Check if correct so far
    const expectedColor = sequence[newInput.length - 1];
    if (colorId !== expectedColor) {
      // Wrong!
      setPhase('gameover');
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('simonHighScore', score.toString());
      }
      return;
    }
    
    // Check if sequence complete
    if (newInput.length === sequence.length) {
      const newScore = score + 1;
      setScore(newScore);
      setPhase('success');
      
      // Add new color and continue
      timeoutRef.current = window.setTimeout(() => {
        const nextColor = Math.floor(Math.random() * 4);
        setSequence(prev => [...prev, nextColor]);
      }, 800);
    }
  }, [phase, playerInput, sequence, score, highScore, playSound]);

  // Show sequence when it changes
  useEffect(() => {
    if (sequence.length > 0 && phase !== 'gameover') {
      showSequence();
    }
  }, [sequence.length]); // eslint-disable-line

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getStatusText = () => {
    switch (phase) {
      case 'idle': return t.hint;
      case 'showing': return t.watch;
      case 'input': return t.yourTurn;
      case 'success': return t.correct;
      case 'gameover': return t.wrong;
    }
  };

  return (
    <div className="mini-game-overlay">
      <div className="simon-game">
        <div className="simon-header">
          <button className="back-btn" onClick={onBack}>{t.back}</button>
          <h2>{t.title}</h2>
          <div className="simon-score">{t.score}: {score}</div>
        </div>

        <div className="simon-status">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="status-text"
          >
            {getStatusText()}
          </motion.div>
          <div className="progress-dots">
            {sequence.map((_, i) => (
              <span 
                key={i} 
                className={`dot ${i < playerInput.length ? 'filled' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="simon-board">
          {colors.map(c => (
            <motion.button
              key={c.id}
              className={`simon-button ${activeButton === c.id ? 'active' : ''}`}
              style={{
                '--btn-color': c.color,
                '--btn-active': c.activeColor,
              } as React.CSSProperties}
              onClick={() => handleButtonClick(c.id)}
              disabled={phase !== 'input'}
              whileTap={{ scale: 0.95 }}
            >
              <span className="btn-emoji">{c.emoji}</span>
            </motion.button>
          ))}
        </div>

        {phase === 'idle' && (
          <motion.div 
            className="start-area"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button className="start-btn" onClick={startGame}>
              {t.start}
            </button>
            {highScore > 0 && (
              <p className="high-score">🏆 Best: {highScore}</p>
            )}
          </motion.div>
        )}

        {phase === 'gameover' && (
          <motion.div 
            className="gameover-area"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <p className="final-score">{t.score}: {score}</p>
            {score > 0 && score >= highScore && (
              <p className="new-record">{t.newRecord}</p>
            )}
            <div className="gameover-buttons">
              <button className="play-again-btn" onClick={startGame}>
                {t.playAgain}
              </button>
              <button 
                className="done-btn" 
                onClick={() => onComplete(score * 5)}
              >
                ✓ OK (+{score * 5} XP)
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        .simon-game {
          max-width: 360px;
          width: 95%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: linear-gradient(180deg, #1e1b4b 0%, #312e81 100%);
          border-radius: 24px;
          padding: 20px;
        }
        .simon-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .simon-header h2 {
          margin: 0;
          font-size: 1.3rem;
        }
        .simon-score {
          background: rgba(255,255,255,0.1);
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: bold;
        }
        .simon-status {
          text-align: center;
          padding: 10px;
        }
        .status-text {
          font-size: 1.2rem;
          margin-bottom: 10px;
        }
        .progress-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          transition: background 0.2s;
        }
        .dot.filled {
          background: #a78bfa;
        }
        .simon-board {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding: 20px;
        }
        .simon-button {
          aspect-ratio: 1;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          background: var(--btn-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          transition: all 0.15s ease;
          box-shadow: 
            0 6px 0 rgba(0,0,0,0.3),
            inset 0 2px 10px rgba(255,255,255,0.2);
        }
        .simon-button:disabled {
          cursor: default;
          opacity: 0.7;
        }
        .simon-button.active {
          background: var(--btn-active);
          transform: translateY(3px);
          box-shadow: 
            0 3px 0 rgba(0,0,0,0.3),
            inset 0 2px 20px rgba(255,255,255,0.4);
        }
        .simon-button:not(:disabled):hover {
          filter: brightness(1.1);
        }
        .btn-emoji {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        .start-area, .gameover-area {
          text-align: center;
          padding: 20px;
        }
        .start-btn, .play-again-btn, .done-btn {
          padding: 14px 36px;
          font-size: 1.2rem;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: white;
          font-weight: bold;
          transition: transform 0.2s;
          margin: 6px;
        }
        .start-btn:hover, .play-again-btn:hover, .done-btn:hover {
          transform: scale(1.05);
        }
        .done-btn {
          background: linear-gradient(135deg, #10b981, #3b82f6);
        }
        .high-score {
          opacity: 0.7;
          margin-top: 12px;
        }
        .final-score {
          font-size: 2rem;
          font-weight: bold;
          margin: 0 0 10px;
        }
        .new-record {
          color: #fbbf24;
          animation: pulse 0.5s ease infinite alternate;
        }
        .gameover-buttons {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin-top: 16px;
        }
        @keyframes pulse {
          to { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

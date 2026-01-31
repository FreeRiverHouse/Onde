import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
  lang: 'it' | 'en';
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const emojis = ['🌙', '⭐', '🐰', '🌸', '🦋', '🌈', '☀️', '💖'];

export default function MemoryGame({ onComplete, onBack, lang }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  
  const t = {
    it: { 
      title: '🧠 Memory!', 
      back: '← Indietro', 
      moves: 'Mosse',
      matches: 'Coppie',
      done: '🎉 Bravo!',
      hint: 'Trova le coppie!'
    },
    en: { 
      title: '🧠 Memory!', 
      back: '← Back',
      moves: 'Moves',
      matches: 'Matches',
      done: '🎉 Great!',
      hint: 'Find the pairs!'
    }
  }[lang];

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    // Create pairs
    const gameEmojis = emojis.slice(0, 6); // 6 pairs = 12 cards
    const pairs = [...gameEmojis, ...gameEmojis];
    
    // Shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    
    setCards(pairs.map((emoji, i) => ({
      id: i,
      emoji,
      isFlipped: false,
      isMatched: false
    })));
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameComplete(false);
  };

  const handleCardClick = (cardId: number) => {
    if (isChecking) return;
    if (flippedCards.length >= 2) return;
    if (cards[cardId].isMatched) return;
    if (flippedCards.includes(cardId)) return;
    
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));
    
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsChecking(true);
      
      const [first, second] = newFlipped;
      
      setTimeout(() => {
        if (cards[first].emoji === cards[second].emoji) {
          // Match!
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true }
              : card
          ));
          setMatches(m => m + 1);
        } else {
          // No match, flip back
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isFlipped: false }
              : card
          ));
        }
        setFlippedCards([]);
        setIsChecking(false);
      }, 800);
    }
  };

  useEffect(() => {
    if (matches === 6 && !gameComplete) { // 6 pairs
      setGameComplete(true);
      const score = Math.max(150 - moves * 5, 30);
      setTimeout(() => onComplete(score), 2000);
    }
  }, [matches, gameComplete, moves, onComplete]);

  return (
    <div className="mini-game-overlay">
      <div className="memory-container glass-card">
        <div className="memory-header">
          <button className="back-btn" onClick={onBack}>{t.back}</button>
          <h2>{t.title}</h2>
          <div className="memory-stats">
            <span>{t.moves}: {moves}</span>
            <span>{t.matches}: {matches}/6</span>
          </div>
        </div>
        
        <p className="memory-hint">{t.hint}</p>
        
        <div className="memory-grid">
          <AnimatePresence>
            {cards.map(card => (
              <motion.button
                key={card.id}
                className={`memory-card ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
                onClick={() => handleCardClick(card.id)}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0, rotateY: 0 }}
                animate={{ 
                  scale: 1, 
                  rotateY: card.isFlipped || card.isMatched ? 180 : 0,
                  opacity: card.isMatched ? 0.6 : 1
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <span className="card-front">{card.emoji}</span>
                <span className="card-back">?</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {gameComplete && (
          <motion.div 
            className="memory-complete"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <span className="complete-text">{t.done}</span>
            <span className="complete-moves">{moves} {t.moves.toLowerCase()}</span>
          </motion.div>
        )}
      </div>
      
      <style>{`
        .memory-container {
          max-width: 380px;
          width: 95%;
          margin: 0 auto;
          padding: 20px;
        }
        .memory-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }
        .memory-header h2 {
          margin: 0;
          font-size: 1.4rem;
        }
        .memory-stats {
          display: flex;
          gap: 12px;
          font-size: 0.9rem;
          opacity: 0.9;
        }
        .memory-hint {
          text-align: center;
          opacity: 0.7;
          margin-bottom: 16px;
        }
        .memory-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          perspective: 1000px;
        }
        .memory-card {
          aspect-ratio: 1;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          position: relative;
          transform-style: preserve-3d;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-size: 2rem;
          transition: transform 0.3s;
        }
        .memory-card .card-front,
        .memory-card .card-back {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          backface-visibility: hidden;
          border-radius: 12px;
        }
        .memory-card .card-back {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 1.5rem;
        }
        .memory-card .card-front {
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
          transform: rotateY(180deg);
        }
        .memory-card.flipped,
        .memory-card.matched {
          pointer-events: none;
        }
        .memory-card.matched {
          box-shadow: 0 0 15px rgba(110, 231, 183, 0.5);
        }
        .back-btn {
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          cursor: pointer;
        }
        .memory-complete {
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

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CookingGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
  lang: 'it' | 'en';
}

interface Ingredient {
  id: string;
  emoji: string;
  name: { it: string; en: string };
}

interface Recipe {
  id: string;
  name: { it: string; en: string };
  emoji: string;
  ingredients: string[];
  reward: number;
}

const allIngredients: Ingredient[] = [
  { id: 'flour', emoji: '🌾', name: { it: 'Farina', en: 'Flour' } },
  { id: 'egg', emoji: '🥚', name: { it: 'Uovo', en: 'Egg' } },
  { id: 'milk', emoji: '🥛', name: { it: 'Latte', en: 'Milk' } },
  { id: 'sugar', emoji: '🍬', name: { it: 'Zucchero', en: 'Sugar' } },
  { id: 'butter', emoji: '🧈', name: { it: 'Burro', en: 'Butter' } },
  { id: 'chocolate', emoji: '🍫', name: { it: 'Cioccolato', en: 'Chocolate' } },
  { id: 'strawberry', emoji: '🍓', name: { it: 'Fragola', en: 'Strawberry' } },
  { id: 'apple', emoji: '🍎', name: { it: 'Mela', en: 'Apple' } },
  { id: 'banana', emoji: '🍌', name: { it: 'Banana', en: 'Banana' } },
  { id: 'cheese', emoji: '🧀', name: { it: 'Formaggio', en: 'Cheese' } },
  { id: 'tomato', emoji: '🍅', name: { it: 'Pomodoro', en: 'Tomato' } },
  { id: 'bread', emoji: '🍞', name: { it: 'Pane', en: 'Bread' } },
];

const recipes: Recipe[] = [
  { 
    id: 'cake', 
    name: { it: 'Torta', en: 'Cake' }, 
    emoji: '🎂', 
    ingredients: ['flour', 'egg', 'sugar', 'milk'],
    reward: 50
  },
  { 
    id: 'cookies', 
    name: { it: 'Biscotti', en: 'Cookies' }, 
    emoji: '🍪', 
    ingredients: ['flour', 'butter', 'sugar'],
    reward: 30
  },
  { 
    id: 'pancakes', 
    name: { it: 'Pancakes', en: 'Pancakes' }, 
    emoji: '🥞', 
    ingredients: ['flour', 'egg', 'milk'],
    reward: 35
  },
  { 
    id: 'chocolate_cake', 
    name: { it: 'Torta al Cioccolato', en: 'Chocolate Cake' }, 
    emoji: '🍰', 
    ingredients: ['flour', 'egg', 'chocolate', 'sugar'],
    reward: 60
  },
  { 
    id: 'fruit_salad', 
    name: { it: 'Macedonia', en: 'Fruit Salad' }, 
    emoji: '🥗', 
    ingredients: ['strawberry', 'apple', 'banana'],
    reward: 25
  },
  { 
    id: 'sandwich', 
    name: { it: 'Panino', en: 'Sandwich' }, 
    emoji: '🥪', 
    ingredients: ['bread', 'cheese', 'tomato'],
    reward: 20
  },
];

export default function CookingGame({ onComplete, onBack, lang }: CookingGameProps) {
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [recipesCompleted, setRecipesCompleted] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFail, setShowFail] = useState(false);
  const [cookingAnimation, setCookingAnimation] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('cookingHighScore');
    return saved ? parseInt(saved) : 0;
  });

  const t = {
    it: {
      title: '👨‍🍳 Cucina con Luna!',
      back: '← Indietro',
      score: 'Punti',
      recipe: 'Ricetta',
      ingredients: 'Ingredienti',
      cook: '🔥 Cucina!',
      nextRecipe: 'Prossima Ricetta',
      perfect: '⭐ Perfetto!',
      tryAgain: 'Riprova!',
      hint: 'Tocca gli ingredienti giusti!',
      cooking: 'Sto cucinando...',
      done: 'Fatto!',
      needed: 'Ti serve:',
      bowl: 'Nella ciotola:',
      clear: '🗑️ Svuota',
      newRecord: '🏆 Nuovo Record!',
      gameOver: '🎉 Ottimo lavoro!',
      playAgain: '🔄 Rigioca',
      recipesCooked: 'Ricette cucinate',
    },
    en: {
      title: '👨‍🍳 Cook with Luna!',
      back: '← Back',
      score: 'Score',
      recipe: 'Recipe',
      ingredients: 'Ingredients',
      cook: '🔥 Cook!',
      nextRecipe: 'Next Recipe',
      perfect: '⭐ Perfect!',
      tryAgain: 'Try again!',
      hint: 'Tap the right ingredients!',
      cooking: 'Cooking...',
      done: 'Done!',
      needed: 'You need:',
      bowl: 'In the bowl:',
      clear: '🗑️ Clear',
      newRecord: '🏆 New Record!',
      gameOver: '🎉 Great job!',
      playAgain: '🔄 Play Again',
      recipesCooked: 'Recipes cooked',
    },
  }[lang];

  // Start with a random recipe
  useEffect(() => {
    selectNewRecipe();
  }, []);

  const selectNewRecipe = () => {
    const remaining = recipes.filter(r => 
      !selectedIngredients.includes(r.id)
    );
    const recipe = remaining.length > 0 
      ? remaining[Math.floor(Math.random() * remaining.length)]
      : recipes[Math.floor(Math.random() * recipes.length)];
    
    setCurrentRecipe(recipe);
    setSelectedIngredients([]);
    
    // Set available ingredients (recipe ingredients + some random ones)
    const recipeIngs = allIngredients.filter(i => recipe.ingredients.includes(i.id));
    const otherIngs = allIngredients
      .filter(i => !recipe.ingredients.includes(i.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    
    setAvailableIngredients([...recipeIngs, ...otherIngs].sort(() => Math.random() - 0.5));
  };

  const toggleIngredient = (ingredientId: string) => {
    if (cookingAnimation || showSuccess || showFail || gameOver) return;
    
    setSelectedIngredients(prev => {
      if (prev.includes(ingredientId)) {
        return prev.filter(id => id !== ingredientId);
      }
      return [...prev, ingredientId];
    });
  };

  const cook = () => {
    if (!currentRecipe || cookingAnimation) return;
    
    setCookingAnimation(true);
    
    setTimeout(() => {
      setCookingAnimation(false);
      
      // Check if correct ingredients
      const correct = currentRecipe.ingredients.every(i => selectedIngredients.includes(i)) 
        && selectedIngredients.every(i => currentRecipe.ingredients.includes(i));
      
      if (correct) {
        const newScore = score + currentRecipe.reward;
        setScore(newScore);
        setRecipesCompleted(prev => prev + 1);
        setShowSuccess(true);
        
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('cookingHighScore', newScore.toString());
        }
        
        setTimeout(() => {
          setShowSuccess(false);
          if (recipesCompleted >= 4) {
            setGameOver(true);
          } else {
            selectNewRecipe();
          }
        }, 1500);
      } else {
        setShowFail(true);
        setTimeout(() => {
          setShowFail(false);
          setSelectedIngredients([]);
        }, 1000);
      }
    }, 2000);
  };

  const clearBowl = () => {
    setSelectedIngredients([]);
  };

  const restart = () => {
    setScore(0);
    setRecipesCompleted(0);
    setGameOver(false);
    selectNewRecipe();
  };

  const handleComplete = () => {
    onComplete(score);
    onBack();
  };

  if (gameOver) {
    const isNewRecord = score >= highScore && score > 0;
    return (
      <div className="mini-game-overlay">
        <motion.div 
          className="cooking-game glass-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <h2>{t.gameOver}</h2>
          {isNewRecord && <div className="new-record">{t.newRecord}</div>}
          <div className="final-stats">
            <div className="stat">
              <span className="stat-label">{t.score}</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat">
              <span className="stat-label">{t.recipesCooked}</span>
              <span className="stat-value">{recipesCompleted} 🍽️</span>
            </div>
          </div>
          <div className="game-over-buttons">
            <button className="action-btn restart" onClick={restart}>{t.playAgain}</button>
            <button className="action-btn done" onClick={handleComplete}>{t.done}</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mini-game-overlay">
      <motion.div 
        className="cooking-game glass-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="cooking-header">
          <button className="back-btn" onClick={onBack}>{t.back}</button>
          <h2>{t.title}</h2>
          <div className="score-display">{t.score}: {score}</div>
        </div>

        {currentRecipe && (
          <>
            {/* Current Recipe */}
            <div className="recipe-card">
              <div className="recipe-icon">{currentRecipe.emoji}</div>
              <div className="recipe-name">{currentRecipe.name[lang]}</div>
              <div className="recipe-hint">
                {t.needed} {currentRecipe.ingredients.map(id => 
                  allIngredients.find(i => i.id === id)?.emoji
                ).join(' ')}
              </div>
            </div>

            {/* Cooking Bowl */}
            <div className="cooking-bowl">
              <div className="bowl-label">{t.bowl}</div>
              <div className="bowl-contents">
                {selectedIngredients.length === 0 ? (
                  <span className="empty-bowl">🥣</span>
                ) : (
                  selectedIngredients.map(id => {
                    const ing = allIngredients.find(i => i.id === id);
                    return (
                      <motion.span 
                        key={id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bowl-ingredient"
                      >
                        {ing?.emoji}
                      </motion.span>
                    );
                  })
                )}
              </div>
              {selectedIngredients.length > 0 && (
                <button className="clear-btn" onClick={clearBowl}>{t.clear}</button>
              )}
            </div>

            {/* Ingredients Grid */}
            <div className="ingredients-grid">
              {availableIngredients.map((ingredient, i) => (
                <motion.button
                  key={ingredient.id}
                  className={`ingredient-btn ${selectedIngredients.includes(ingredient.id) ? 'selected' : ''}`}
                  onClick={() => toggleIngredient(ingredient.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="ingredient-emoji">{ingredient.emoji}</span>
                  <span className="ingredient-name">{ingredient.name[lang]}</span>
                </motion.button>
              ))}
            </div>

            {/* Cook Button */}
            <motion.button
              className="cook-btn"
              onClick={cook}
              disabled={selectedIngredients.length === 0 || cookingAnimation}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cookingAnimation ? t.cooking : t.cook}
            </motion.button>
          </>
        )}

        {/* Cooking Animation Overlay */}
        <AnimatePresence>
          {cookingAnimation && (
            <motion.div 
              className="cooking-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="cooking-pot"
                animate={{ 
                  rotate: [0, -5, 5, -5, 0],
                  y: [0, -10, 0, -10, 0]
                }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                🍳
              </motion.div>
              <div className="steam">☁️ ☁️ ☁️</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              className="result-overlay success"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <span className="result-emoji">{currentRecipe?.emoji}</span>
              <span className="result-text">{t.perfect}</span>
              <span className="result-points">+{currentRecipe?.reward}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fail Overlay */}
        <AnimatePresence>
          {showFail && (
            <motion.div 
              className="result-overlay fail"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <span className="result-emoji">😅</span>
              <span className="result-text">{t.tryAgain}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        .cooking-game {
          max-width: 420px;
          width: 95%;
          margin: 0 auto;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .cooking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .cooking-header h2 {
          margin: 0;
          font-size: 1.3rem;
        }
        .score-display {
          background: rgba(255,215,0,0.2);
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
          color: #ffd700;
        }
        .recipe-card {
          background: linear-gradient(135deg, rgba(255,133,161,0.2), rgba(168,123,250,0.2));
          border-radius: 16px;
          padding: 16px;
          text-align: center;
          margin-bottom: 16px;
        }
        .recipe-icon {
          font-size: 3rem;
        }
        .recipe-name {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 8px 0;
        }
        .recipe-hint {
          font-size: 0.9rem;
          opacity: 0.8;
        }
        .cooking-bowl {
          background: rgba(139,92,246,0.1);
          border-radius: 16px;
          padding: 12px;
          margin-bottom: 16px;
          text-align: center;
        }
        .bowl-label {
          font-size: 0.85rem;
          margin-bottom: 8px;
          opacity: 0.7;
        }
        .bowl-contents {
          min-height: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .empty-bowl {
          font-size: 2.5rem;
          opacity: 0.5;
        }
        .bowl-ingredient {
          font-size: 1.8rem;
        }
        .clear-btn {
          margin-top: 8px;
          padding: 4px 12px;
          border-radius: 12px;
          background: rgba(239,68,68,0.2);
          border: none;
          color: #ef4444;
          cursor: pointer;
          font-size: 0.8rem;
        }
        .ingredients-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }
        .ingredient-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 6px;
          border-radius: 12px;
          border: 2px solid transparent;
          background: rgba(255,255,255,0.1);
          cursor: pointer;
          transition: all 0.2s;
        }
        .ingredient-btn.selected {
          border-color: #4ade80;
          background: rgba(74,222,128,0.2);
        }
        .ingredient-emoji {
          font-size: 1.5rem;
        }
        .ingredient-name {
          font-size: 0.65rem;
          color: white;
          opacity: 0.8;
        }
        .cook-btn {
          width: 100%;
          padding: 14px;
          border-radius: 16px;
          border: none;
          background: linear-gradient(135deg, #f97316, #ef4444);
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cook-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .cooking-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 16px;
        }
        .cooking-pot {
          font-size: 5rem;
        }
        .steam {
          font-size: 2rem;
          opacity: 0.6;
        }
        .result-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 12px;
          border-radius: 24px;
        }
        .result-overlay.success {
          background: rgba(74,222,128,0.9);
        }
        .result-overlay.fail {
          background: rgba(239,68,68,0.9);
        }
        .result-emoji {
          font-size: 4rem;
        }
        .result-text {
          font-size: 1.5rem;
          font-weight: 700;
        }
        .result-points {
          font-size: 1.2rem;
          background: rgba(255,255,255,0.2);
          padding: 4px 16px;
          border-radius: 20px;
        }
        .final-stats {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin: 24px 0;
        }
        .stat {
          text-align: center;
        }
        .stat-label {
          display: block;
          font-size: 0.9rem;
          opacity: 0.7;
          margin-bottom: 4px;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
        }
        .new-record {
          font-size: 1.2rem;
          color: #ffd700;
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .game-over-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .action-btn {
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
        }
        .action-btn.restart {
          background: rgba(168,123,250,0.3);
          color: white;
        }
        .action-btn.done {
          background: linear-gradient(135deg, #4ade80, #22c55e);
          color: white;
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

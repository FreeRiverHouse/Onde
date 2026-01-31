import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
  lang: 'it' | 'en';
}

interface Question {
  id: number;
  question: { it: string; en: string };
  options: { it: string[]; en: string[] };
  correctIndex: number;
  category: 'animals' | 'colors' | 'shapes' | 'nature' | 'space' | 'fun';
  emoji: string;
}

const questions: Question[] = [
  // Animals
  { id: 1, question: { it: 'Quale animale fa "miao"?', en: 'Which animal says "meow"?' }, options: { it: ['🐱 Gatto', '🐶 Cane', '🐰 Coniglio', '🐦 Uccello'], en: ['🐱 Cat', '🐶 Dog', '🐰 Rabbit', '🐦 Bird'] }, correctIndex: 0, category: 'animals', emoji: '🐱' },
  { id: 2, question: { it: 'Quale animale ha una lunga proboscide?', en: 'Which animal has a long trunk?' }, options: { it: ['🦁 Leone', '🐘 Elefante', '🦒 Giraffa', '🐻 Orso'], en: ['🦁 Lion', '🐘 Elephant', '🦒 Giraffe', '🐻 Bear'] }, correctIndex: 1, category: 'animals', emoji: '🐘' },
  { id: 3, question: { it: 'Quale animale vive nell\'acqua?', en: 'Which animal lives in water?' }, options: { it: ['🐕 Cane', '🦅 Aquila', '🐟 Pesce', '🦊 Volpe'], en: ['🐕 Dog', '🦅 Eagle', '🐟 Fish', '🦊 Fox'] }, correctIndex: 2, category: 'animals', emoji: '🐟' },
  { id: 4, question: { it: 'Quale animale ha il collo più lungo?', en: 'Which animal has the longest neck?' }, options: { it: ['🐘 Elefante', '🐊 Coccodrillo', '🦒 Giraffa', '🐪 Cammello'], en: ['🐘 Elephant', '🐊 Crocodile', '🦒 Giraffe', '🐪 Camel'] }, correctIndex: 2, category: 'animals', emoji: '🦒' },
  
  // Colors
  { id: 5, question: { it: 'Di che colore è il cielo?', en: 'What color is the sky?' }, options: { it: ['🟢 Verde', '🔵 Blu', '🔴 Rosso', '🟡 Giallo'], en: ['🟢 Green', '🔵 Blue', '🔴 Red', '🟡 Yellow'] }, correctIndex: 1, category: 'colors', emoji: '🔵' },
  { id: 6, question: { it: 'Di che colore è l\'erba?', en: 'What color is grass?' }, options: { it: ['🟢 Verde', '🟠 Arancione', '🟣 Viola', '⚫ Nero'], en: ['🟢 Green', '🟠 Orange', '🟣 Purple', '⚫ Black'] }, correctIndex: 0, category: 'colors', emoji: '🟢' },
  { id: 7, question: { it: 'Di che colore sono le banane?', en: 'What color are bananas?' }, options: { it: ['🔴 Rosso', '🟢 Verde', '🔵 Blu', '🟡 Giallo'], en: ['🔴 Red', '🟢 Green', '🔵 Blue', '🟡 Yellow'] }, correctIndex: 3, category: 'colors', emoji: '🍌' },
  
  // Shapes
  { id: 8, question: { it: 'Quanti lati ha un triangolo?', en: 'How many sides does a triangle have?' }, options: { it: ['2', '3', '4', '5'], en: ['2', '3', '4', '5'] }, correctIndex: 1, category: 'shapes', emoji: '🔺' },
  { id: 9, question: { it: 'Quale forma ha la luna piena?', en: 'What shape is a full moon?' }, options: { it: ['⬜ Quadrato', '🔺 Triangolo', '⭕ Cerchio', '⬛ Rettangolo'], en: ['⬜ Square', '🔺 Triangle', '⭕ Circle', '⬛ Rectangle'] }, correctIndex: 2, category: 'shapes', emoji: '🌕' },
  { id: 10, question: { it: 'Quanti lati ha un quadrato?', en: 'How many sides does a square have?' }, options: { it: ['3', '4', '5', '6'], en: ['3', '4', '5', '6'] }, correctIndex: 1, category: 'shapes', emoji: '⬜' },
  
  // Nature
  { id: 11, question: { it: 'Cosa ci dà luce durante il giorno?', en: 'What gives us light during the day?' }, options: { it: ['🌙 Luna', '☀️ Sole', '⭐ Stelle', '💡 Lampadina'], en: ['🌙 Moon', '☀️ Sun', '⭐ Stars', '💡 Light bulb'] }, correctIndex: 1, category: 'nature', emoji: '☀️' },
  { id: 12, question: { it: 'Cosa fa la pioggia?', en: 'What does rain do?' }, options: { it: ['Brucia', 'Bagna', 'Congela', 'Vola'], en: ['Burns', 'Wets', 'Freezes', 'Flies'] }, correctIndex: 1, category: 'nature', emoji: '🌧️' },
  { id: 13, question: { it: 'Dove vivono i pesci?', en: 'Where do fish live?' }, options: { it: ['🌳 Alberi', '🏔️ Montagne', '🌊 Acqua', '🏠 Case'], en: ['🌳 Trees', '🏔️ Mountains', '🌊 Water', '🏠 Houses'] }, correctIndex: 2, category: 'nature', emoji: '🐠' },
  
  // Space
  { id: 14, question: { it: 'Come si chiama il nostro pianeta?', en: 'What is our planet called?' }, options: { it: ['🌕 Luna', '🌍 Terra', '☀️ Sole', '⭐ Stella'], en: ['🌕 Moon', '🌍 Earth', '☀️ Sun', '⭐ Star'] }, correctIndex: 1, category: 'space', emoji: '🌍' },
  { id: 15, question: { it: 'Cosa vediamo di notte nel cielo?', en: 'What do we see in the night sky?' }, options: { it: ['🌈 Arcobaleno', '☁️ Nuvole rosa', '⭐ Stelle', '🌻 Girasoli'], en: ['🌈 Rainbow', '☁️ Pink clouds', '⭐ Stars', '🌻 Sunflowers'] }, correctIndex: 2, category: 'space', emoji: '⭐' },
  
  // Fun facts
  { id: 16, question: { it: 'Quante zampe ha un ragno?', en: 'How many legs does a spider have?' }, options: { it: ['4', '6', '8', '10'], en: ['4', '6', '8', '10'] }, correctIndex: 2, category: 'fun', emoji: '🕷️' },
  { id: 17, question: { it: 'Quale frutto è giallo dentro e fuori?', en: 'Which fruit is yellow inside and out?' }, options: { it: ['🍎 Mela', '🍊 Arancia', '🍋 Limone', '🍇 Uva'], en: ['🍎 Apple', '🍊 Orange', '🍋 Lemon', '🍇 Grape'] }, correctIndex: 2, category: 'fun', emoji: '🍋' },
  { id: 18, question: { it: 'Cosa mangiano i conigli?', en: 'What do rabbits eat?' }, options: { it: ['🥩 Carne', '🥕 Carote', '🐟 Pesce', '🍕 Pizza'], en: ['🥩 Meat', '🥕 Carrots', '🐟 Fish', '🍕 Pizza'] }, correctIndex: 1, category: 'fun', emoji: '🥕' },
  { id: 19, question: { it: 'Quanti colori ha l\'arcobaleno?', en: 'How many colors does a rainbow have?' }, options: { it: ['5', '6', '7', '8'], en: ['5', '6', '7', '8'] }, correctIndex: 2, category: 'fun', emoji: '🌈' },
  { id: 20, question: { it: 'Cosa fa il gallo al mattino?', en: 'What does a rooster do in the morning?' }, options: { it: ['Dorme', 'Canta', 'Nuota', 'Vola'], en: ['Sleeps', 'Crows', 'Swims', 'Flies'] }, correctIndex: 1, category: 'fun', emoji: '🐓' },
];

const QUESTIONS_PER_GAME = 5;
const TIME_PER_QUESTION = 15; // seconds

export default function QuizGame({ onComplete, onBack, lang }: QuizGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [gameComplete, setGameComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const t = {
    it: {
      title: '📚 Quiz Time!',
      back: '← Indietro',
      score: 'Punti',
      question: 'Domanda',
      of: 'di',
      correct: '✅ Esatto!',
      wrong: '❌ Ops! La risposta era:',
      timeUp: '⏰ Tempo scaduto!',
      next: 'Avanti →',
      done: '🎉 Quiz completato!',
      yourScore: 'Il tuo punteggio:',
      highScore: 'Record:',
      newRecord: '🏆 Nuovo record!',
      playAgain: '🔄 Gioca ancora',
      perfect: '🌟 Perfetto!',
      great: '😊 Ottimo!',
      good: '👍 Bravo!',
      tryAgain: '💪 Riprova!',
      streak: '🔥 Serie:',
    },
    en: {
      title: '📚 Quiz Time!',
      back: '← Back',
      score: 'Score',
      question: 'Question',
      of: 'of',
      correct: '✅ Correct!',
      wrong: '❌ Oops! The answer was:',
      timeUp: '⏰ Time\'s up!',
      next: 'Next →',
      done: '🎉 Quiz complete!',
      yourScore: 'Your score:',
      highScore: 'High score:',
      newRecord: '🏆 New record!',
      playAgain: '🔄 Play again',
      perfect: '🌟 Perfect!',
      great: '😊 Great!',
      good: '👍 Good!',
      tryAgain: '💪 Try again!',
      streak: '🔥 Streak:',
    }
  }[lang];

  // Initialize game with random questions
  useEffect(() => {
    initGame();
    const saved = localStorage.getItem('moonlight-quiz-highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const initGame = () => {
    // Shuffle and pick random questions
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setSelectedQuestions(shuffled.slice(0, QUESTIONS_PER_GAME));
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setTimeLeft(TIME_PER_QUESTION);
    setGameComplete(false);
    setShowFeedback(false);
  };

  // Timer countdown
  useEffect(() => {
    if (gameComplete || showFeedback) return;
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameComplete, showFeedback]);

  const handleTimeUp = useCallback(() => {
    setSelectedAnswer(-1);
    setIsCorrect(false);
    setStreak(0);
    setShowFeedback(true);
  }, []);

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    const currentQuestion = selectedQuestions[currentQuestionIndex];
    const correct = answerIndex === currentQuestion.correctIndex;

    setSelectedAnswer(answerIndex);
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const bonus = Math.ceil(timeLeft / 3); // Time bonus
      const streakBonus = streak >= 2 ? streak : 0; // Streak bonus
      setScore(prev => prev + 10 + bonus + streakBonus);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS_PER_GAME - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setTimeLeft(TIME_PER_QUESTION);
      setShowFeedback(false);
    } else {
      // Game complete
      setGameComplete(true);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('moonlight-quiz-highscore', score.toString());
      }
    }
  };

  const getResultMessage = () => {
    const percentage = (score / (QUESTIONS_PER_GAME * 15)) * 100;
    if (percentage >= 90) return t.perfect;
    if (percentage >= 70) return t.great;
    if (percentage >= 50) return t.good;
    return t.tryAgain;
  };

  const currentQuestion = selectedQuestions[currentQuestionIndex];

  if (!currentQuestion) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-4 z-50"
    >
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-200"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${8 + Math.random() * 12}px`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white/20 rounded-full text-white font-bold hover:bg-white/30 transition-all"
        >
          {t.back}
        </button>
        <h1 className="text-2xl font-black text-white drop-shadow-lg">{t.title}</h1>
        <div className="flex items-center gap-2">
          <span className="px-4 py-2 bg-yellow-500 rounded-full text-white font-bold">
            {t.score}: {score}
          </span>
        </div>
      </div>

      {/* Streak indicator */}
      {streak >= 2 && !gameComplete && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-2 px-4 py-1 bg-orange-500 rounded-full text-white font-bold"
        >
          {t.streak} {streak}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {!gameComplete ? (
          <motion.div
            key={currentQuestionIndex}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-full max-w-lg"
          >
            {/* Progress & Timer */}
            <div className="flex items-center justify-between mb-4 text-white">
              <span className="font-bold">
                {t.question} {currentQuestionIndex + 1} {t.of} {QUESTIONS_PER_GAME}
              </span>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}>
                <span className="text-lg">⏱️</span>
                <span className="font-bold">{timeLeft}s</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-white/20 rounded-full mb-6 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl mb-6">
              <div className="text-5xl text-center mb-4">{currentQuestion.emoji}</div>
              <p className="text-xl font-bold text-gray-800 text-center">
                {currentQuestion.question[lang]}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options[lang].map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === currentQuestion.correctIndex;
                const showResult = showFeedback;

                let bgColor = 'bg-white hover:bg-purple-100';
                if (showResult) {
                  if (isCorrectAnswer) {
                    bgColor = 'bg-green-400';
                  } else if (isSelected && !isCorrect) {
                    bgColor = 'bg-red-400';
                  } else {
                    bgColor = 'bg-white/50';
                  }
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showFeedback}
                    whileHover={!showFeedback ? { scale: 1.05 } : {}}
                    whileTap={!showFeedback ? { scale: 0.95 } : {}}
                    className={`p-4 rounded-xl font-bold text-lg transition-all ${bgColor} ${
                      showFeedback ? '' : 'shadow-lg'
                    }`}
                    animate={showResult && isCorrectAnswer ? {
                      scale: [1, 1.1, 1],
                    } : {}}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-center"
                >
                  {selectedAnswer === -1 ? (
                    <p className="text-xl font-bold text-yellow-300">{t.timeUp}</p>
                  ) : isCorrect ? (
                    <p className="text-xl font-bold text-green-300">{t.correct}</p>
                  ) : (
                    <p className="text-lg font-bold text-red-300">
                      {t.wrong} {currentQuestion.options[lang][currentQuestion.correctIndex]}
                    </p>
                  )}
                  
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={handleNext}
                    className="mt-4 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
                  >
                    {t.next}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Game Complete Screen */
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-8xl mb-4"
            >
              🎉
            </motion.div>
            
            <h2 className="text-3xl font-black text-white mb-2">{t.done}</h2>
            <p className="text-xl text-purple-200 mb-4">{getResultMessage()}</p>
            
            <div className="bg-white/20 rounded-2xl p-6 mb-6">
              <p className="text-2xl font-bold text-white">
                {t.yourScore} <span className="text-yellow-300">{score}</span>
              </p>
              <p className="text-lg text-purple-200">
                {t.highScore} {highScore}
              </p>
              {score > highScore - 1 && score === highScore && (
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xl font-bold text-yellow-300 mt-2"
                >
                  {t.newRecord}
                </motion.p>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={initGame}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
              >
                {t.playAgain}
              </button>
              <button
                onClick={() => onComplete(score)}
                className="px-6 py-3 bg-white/20 text-white font-bold rounded-full shadow-lg hover:bg-white/30 transition-all"
              >
                {t.back}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

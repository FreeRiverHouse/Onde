import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { MEMORY_GAME, MEMORY_EMOJIS } from '../../constants/GameConfig';

const { width } = Dimensions.get('window');

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

interface Card {
  id: number;
  emoji: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface CardProps {
  card: Card;
  onPress: () => void;
  disabled: boolean;
  cardSize: number;
}

function MemoryCard({ card, onPress, disabled, cardSize }: CardProps) {
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: card.isFlipped || card.isMatched ? 1 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  }, [card.isFlipped, card.isMatched]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <TouchableOpacity
      style={[styles.cardContainer, { width: cardSize, height: cardSize }]}
      onPress={onPress}
      disabled={disabled || card.isFlipped || card.isMatched}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          backAnimatedStyle,
          { width: cardSize - 8, height: cardSize - 8 },
        ]}
      >
        <Text style={styles.cardBackText}>🌙</Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.card,
          styles.cardFront,
          frontAnimatedStyle,
          card.isMatched && styles.cardMatched,
          { width: cardSize - 8, height: cardSize - 8 },
        ]}
      >
        <Text style={[styles.cardEmoji, { fontSize: cardSize * 0.4 }]}>
          {card.emoji}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function DifficultySelector({
  onSelect,
}: {
  onSelect: (d: Difficulty) => void;
}) {
  return (
    <View style={styles.difficultyContainer}>
      <Text style={styles.difficultyTitle}>Scegli la difficolta</Text>
      <View style={styles.difficultyButtons}>
        <TouchableOpacity
          style={[styles.difficultyButton, { borderColor: Colors.success }]}
          onPress={() => onSelect('EASY')}
        >
          <Text style={styles.difficultyEmoji}>🌟</Text>
          <Text style={styles.difficultyText}>Facile</Text>
          <Text style={styles.difficultyDesc}>3 coppie</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.difficultyButton, { borderColor: Colors.accent.gold }]}
          onPress={() => onSelect('MEDIUM')}
        >
          <Text style={styles.difficultyEmoji}>⭐</Text>
          <Text style={styles.difficultyText}>Medio</Text>
          <Text style={styles.difficultyDesc}>6 coppie</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.difficultyButton, { borderColor: Colors.accent.pink }]}
          onPress={() => onSelect('HARD')}
        >
          <Text style={styles.difficultyEmoji}>🌠</Text>
          <Text style={styles.difficultyText}>Difficile</Text>
          <Text style={styles.difficultyDesc}>8 coppie</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MemoryGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime && !gameWon) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, gameWon]);

  const initializeGame = useCallback((diff: Difficulty) => {
    const config = MEMORY_GAME[diff];
    const totalCards = config.rows * config.cols;
    const pairsNeeded = totalCards / 2;

    // Shuffle and pick emojis
    const shuffledEmojis = [...MEMORY_EMOJIS]
      .sort(() => Math.random() - 0.5)
      .slice(0, pairsNeeded);

    // Create pairs
    const cardPairs: Card[] = [];
    shuffledEmojis.forEach((emoji, index) => {
      cardPairs.push({
        id: index * 2,
        emoji: emoji.emoji,
        name: emoji.name,
        isFlipped: false,
        isMatched: false,
      });
      cardPairs.push({
        id: index * 2 + 1,
        emoji: emoji.emoji,
        name: emoji.name,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameWon(false);
    setStartTime(Date.now());
    setElapsedTime(0);
  }, []);

  const handleCardPress = useCallback(
    (cardId: number) => {
      if (isChecking || flippedCards.length >= 2) return;

      const cardIndex = cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return;

      // Flip the card
      const newCards = [...cards];
      newCards[cardIndex].isFlipped = true;
      setCards(newCards);

      const newFlipped = [...flippedCards, cardId];
      setFlippedCards(newFlipped);

      // Check for match when 2 cards are flipped
      if (newFlipped.length === 2) {
        setIsChecking(true);
        setMoves((m) => m + 1);

        const [first, second] = newFlipped;
        const firstCard = cards.find((c) => c.id === first);
        const secondCard = cards.find((c) => c.id === second);

        if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
          // Match found!
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === first || c.id === second
                  ? { ...c, isMatched: true }
                  : c
              )
            );
            setMatches((m) => {
              const newMatches = m + 1;
              if (difficulty) {
                const totalPairs =
                  (MEMORY_GAME[difficulty].rows * MEMORY_GAME[difficulty].cols) / 2;
                if (newMatches === totalPairs) {
                  setGameWon(true);
                }
              }
              return newMatches;
            });
            setFlippedCards([]);
            setIsChecking(false);
          }, MEMORY_GAME.MATCH_DELAY);
        } else {
          // No match - flip back
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === first || c.id === second
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            setFlippedCards([]);
            setIsChecking(false);
          }, MEMORY_GAME.FLIP_DELAY);
        }
      }
    },
    [cards, flippedCards, isChecking, difficulty]
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!difficulty) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Indietro</Text>
        </TouchableOpacity>
        <View style={styles.header}>
          <Text style={styles.title}>🃏 Memory</Text>
          <Text style={styles.subtitle}>Trova le coppie nascoste!</Text>
        </View>
        <DifficultySelector
          onSelect={(d) => {
            setDifficulty(d);
            initializeGame(d);
          }}
        />
      </SafeAreaView>
    );
  }

  const config = MEMORY_GAME[difficulty];
  const cardSize = Math.min(
    (width - 40 - (config.cols - 1) * 8) / config.cols,
    100
  );

  if (gameWon) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.winContainer}>
          <Text style={styles.winEmoji}>🎉</Text>
          <Text style={styles.winTitle}>Complimenti!</Text>
          <Text style={styles.winSubtitle}>Hai trovato tutte le coppie!</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{moves}</Text>
              <Text style={styles.statLabel}>Mosse</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
              <Text style={styles.statLabel}>Tempo</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.playAgainButton}
            onPress={() => initializeGame(difficulty)}
          >
            <Text style={styles.playAgainText}>Gioca Ancora</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.homeButtonText}>Menu Principale</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Indietro</Text>
      </TouchableOpacity>

      <View style={styles.gameHeader}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Mosse</Text>
          <Text style={styles.statBoxValue}>{moves}</Text>
        </View>
        <Text style={styles.gameTitle}>🃏 Memory</Text>
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Tempo</Text>
          <Text style={styles.statBoxValue}>{formatTime(elapsedTime)}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${(matches / (config.rows * config.cols / 2)) * 100}%` },
          ]}
        />
      </View>

      <View style={styles.gameBoard}>
        <View
          style={[
            styles.cardsGrid,
            { width: cardSize * config.cols + (config.cols - 1) * 8 },
          ]}
        >
          {cards.map((card) => (
            <MemoryCard
              key={card.id}
              card={card}
              onPress={() => handleCardPress(card.id)}
              disabled={isChecking}
              cardSize={cardSize}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => initializeGame(difficulty)}
      >
        <Text style={styles.resetButtonText}>🔄 Ricomincia</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    color: Colors.text.secondary,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  difficultyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  difficultyTitle: {
    fontSize: 20,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 30,
  },
  difficultyButtons: {
    gap: 15,
  },
  difficultyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.medium,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
  },
  difficultyEmoji: {
    fontSize: 30,
    marginRight: 15,
  },
  difficultyText: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  difficultyDesc: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: Colors.background.medium,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  statBoxLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statBoxValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  progressContainer: {
    height: 6,
    backgroundColor: Colors.background.light,
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 3,
  },
  gameBoard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  cardContainer: {
    perspective: 1000,
  },
  card: {
    position: 'absolute',
    backfaceVisibility: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  cardBack: {
    backgroundColor: Colors.card.back,
    borderWidth: 2,
    borderColor: Colors.card.border,
  },
  cardFront: {
    backgroundColor: Colors.card.front,
    borderWidth: 2,
    borderColor: Colors.card.border,
  },
  cardMatched: {
    backgroundColor: Colors.card.matched,
    borderColor: Colors.success,
  },
  cardBackText: {
    fontSize: 30,
  },
  cardEmoji: {
    // fontSize set dynamically
  },
  resetButton: {
    alignSelf: 'center',
    backgroundColor: Colors.background.medium,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
  },
  resetButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  winContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  winEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  winTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.accent.gold,
    marginBottom: 10,
  },
  winSubtitle: {
    fontSize: 18,
    color: Colors.text.secondary,
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 5,
  },
  playAgainButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  playAgainText: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  homeButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  homeButtonText: {
    color: Colors.text.secondary,
    fontSize: 16,
  },
});

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

interface MatchItem {
  id: number;
  emoji: string;
  matchId: number;
  isMatched: boolean;
}

// Coppie da abbinare - tema notturno
const MATCH_PAIRS = [
  { left: '🦉', right: '🌲', hint: 'Il gufo dorme...' },
  { left: '🐺', right: '🌙', hint: 'Il lupo ulula alla...' },
  { left: '⭐', right: '🌌', hint: 'Le stelle nella...' },
  { left: '🚀', right: '🪐', hint: 'Il razzo vola verso...' },
  { left: '👽', right: '🛸', hint: 'L\'alieno sul suo...' },
  { left: '🦇', right: '🏰', hint: 'Il pipistrello nel...' },
  { left: '🌠', right: '✨', hint: 'La stella cadente e...' },
  { left: '💤', right: '🛏️', hint: 'Dormire nel...' },
];

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

const DIFFICULTY_CONFIG = {
  EASY: 3,
  MEDIUM: 5,
  HARD: 8,
};

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
          <Text style={styles.difficultyDesc}>5 coppie</Text>
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

export default function MatchingGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [leftItems, setLeftItems] = useState<MatchItem[]>([]);
  const [rightItems, setRightItems] = useState<MatchItem[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matches, setMatches] = useState(0);
  const [errors, setErrors] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [showHint, setShowHint] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Animation refs
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

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
    const pairsCount = DIFFICULTY_CONFIG[diff];

    // Shuffle and select pairs
    const shuffledPairs = [...MATCH_PAIRS]
      .sort(() => Math.random() - 0.5)
      .slice(0, pairsCount);

    // Create left and right items
    const left: MatchItem[] = shuffledPairs.map((pair, index) => ({
      id: index,
      emoji: pair.left,
      matchId: index,
      isMatched: false,
    }));

    const right: MatchItem[] = shuffledPairs.map((pair, index) => ({
      id: index,
      emoji: pair.right,
      matchId: index,
      isMatched: false,
    }));

    // Shuffle right items
    const shuffledRight = right.sort(() => Math.random() - 0.5);

    setLeftItems(left);
    setRightItems(shuffledRight);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatches(0);
    setErrors(0);
    setGameWon(false);
    setShowHint(null);
    setStartTime(Date.now());
    setElapsedTime(0);
  }, []);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const triggerSuccess = () => {
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(successAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const checkMatch = useCallback(
    (leftId: number, rightId: number) => {
      const leftItem = leftItems.find((i) => i.id === leftId);
      const rightItem = rightItems.find((i) => i.id === rightId);

      if (!leftItem || !rightItem) return;

      if (leftItem.matchId === rightItem.matchId) {
        // Match found!
        triggerSuccess();
        setLeftItems((prev) =>
          prev.map((i) => (i.id === leftId ? { ...i, isMatched: true } : i))
        );
        setRightItems((prev) =>
          prev.map((i) => (i.id === rightId ? { ...i, isMatched: true } : i))
        );
        setMatches((m) => {
          const newMatches = m + 1;
          if (difficulty && newMatches === DIFFICULTY_CONFIG[difficulty]) {
            setGameWon(true);
          }
          return newMatches;
        });
        setShowHint(null);
      } else {
        // No match
        triggerShake();
        setErrors((e) => e + 1);
        // Show hint for the left item
        const pair = MATCH_PAIRS.find((p) => p.left === leftItem.emoji);
        if (pair) {
          setShowHint(pair.hint);
          setTimeout(() => setShowHint(null), 2000);
        }
      }

      setSelectedLeft(null);
      setSelectedRight(null);
    },
    [leftItems, rightItems, difficulty]
  );

  const handleLeftSelect = (id: number) => {
    if (leftItems.find((i) => i.id === id)?.isMatched) return;
    setSelectedLeft(id);
    if (selectedRight !== null) {
      checkMatch(id, selectedRight);
    }
  };

  const handleRightSelect = (id: number) => {
    if (rightItems.find((i) => i.id === id)?.isMatched) return;
    setSelectedRight(id);
    if (selectedLeft !== null) {
      checkMatch(selectedLeft, id);
    }
  };

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
          <Text style={styles.title}>🔗 Abbina</Text>
          <Text style={styles.subtitle}>Collega le coppie giuste!</Text>
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

  if (gameWon) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.winContainer}>
          <Text style={styles.winEmoji}>🌟</Text>
          <Text style={styles.winTitle}>Fantastico!</Text>
          <Text style={styles.winSubtitle}>Hai abbinato tutto!</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{errors}</Text>
              <Text style={styles.statLabel}>Errori</Text>
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
          <Text style={styles.statBoxLabel}>Errori</Text>
          <Text style={styles.statBoxValue}>{errors}</Text>
        </View>
        <Text style={styles.gameTitle}>🔗 Abbina</Text>
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Tempo</Text>
          <Text style={styles.statBoxValue}>{formatTime(elapsedTime)}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: difficulty
                ? `${(matches / DIFFICULTY_CONFIG[difficulty]) * 100}%`
                : '0%',
            },
          ]}
        />
      </View>

      {showHint && (
        <Animated.View
          style={[styles.hintContainer, { transform: [{ translateX: shakeAnim }] }]}
        >
          <Text style={styles.hintText}>💡 {showHint}</Text>
        </Animated.View>
      )}

      <View style={styles.gameBoard}>
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Chi?</Text>
          {leftItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.matchItem,
                selectedLeft === item.id && styles.matchItemSelected,
                item.isMatched && styles.matchItemMatched,
              ]}
              onPress={() => handleLeftSelect(item.id)}
              disabled={item.isMatched}
            >
              <Text style={styles.matchEmoji}>{item.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.connectorColumn}>
          {leftItems.map((item, index) => (
            <View key={index} style={styles.connector}>
              {item.isMatched && <Text style={styles.connectorLine}>━━</Text>}
            </View>
          ))}
        </View>

        <View style={styles.column}>
          <Text style={styles.columnTitle}>Dove?</Text>
          {rightItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.matchItem,
                selectedRight === item.id && styles.matchItemSelected,
                item.isMatched && styles.matchItemMatched,
              ]}
              onPress={() => handleRightSelect(item.id)}
              disabled={item.isMatched}
            >
              <Text style={styles.matchEmoji}>{item.emoji}</Text>
            </TouchableOpacity>
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
    backgroundColor: Colors.accent.purple,
    borderRadius: 3,
  },
  hintContainer: {
    backgroundColor: Colors.background.medium,
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  hintText: {
    color: Colors.accent.gold,
    fontSize: 14,
    textAlign: 'center',
  },
  gameBoard: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  columnTitle: {
    color: Colors.text.secondary,
    fontSize: 14,
    marginBottom: 5,
  },
  connectorColumn: {
    width: 50,
    alignItems: 'center',
    paddingTop: 30,
    gap: 10,
  },
  connector: {
    height: 60,
    justifyContent: 'center',
  },
  connectorLine: {
    color: Colors.success,
    fontSize: 14,
  },
  matchItem: {
    width: 60,
    height: 60,
    backgroundColor: Colors.background.medium,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.card.border,
  },
  matchItemSelected: {
    borderColor: Colors.accent.gold,
    backgroundColor: Colors.background.light,
  },
  matchItemMatched: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  matchEmoji: {
    fontSize: 30,
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
    color: Colors.accent.purple,
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
    backgroundColor: Colors.accent.purple,
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

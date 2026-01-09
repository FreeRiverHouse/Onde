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

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

interface Tile {
  value: number;
  isEmpty: boolean;
}

const DIFFICULTY_CONFIG = {
  EASY: { size: 3, emoji: '🌙' },
  MEDIUM: { size: 4, emoji: '⭐' },
  HARD: { size: 5, emoji: '🌠' },
};

// Emoji for tiles - night theme
const TILE_EMOJIS = ['🌙', '⭐', '✨', '🌟', '🪐', '🚀', '🛸', '👽', '🌌', '🌠', '🌕', '🌑', '🦉', '🦇', '🏰', '💫', '🌃', '⚡', '☄️', '🌈', '🦋', '🐱', '🐰', '🦊'];

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
          <Text style={styles.difficultyDesc}>3x3 (8 tessere)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.difficultyButton, { borderColor: Colors.accent.gold }]}
          onPress={() => onSelect('MEDIUM')}
        >
          <Text style={styles.difficultyEmoji}>⭐</Text>
          <Text style={styles.difficultyText}>Medio</Text>
          <Text style={styles.difficultyDesc}>4x4 (15 tessere)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.difficultyButton, { borderColor: Colors.accent.pink }]}
          onPress={() => onSelect('HARD')}
        >
          <Text style={styles.difficultyEmoji}>🌠</Text>
          <Text style={styles.difficultyText}>Difficile</Text>
          <Text style={styles.difficultyDesc}>5x5 (24 tessere)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SlidingPuzzle() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showNumbers, setShowNumbers] = useState(false);

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

  const isSolvable = (tiles: number[], size: number): boolean => {
    let inversions = 0;
    const arr = tiles.filter((t) => t !== 0);

    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] > arr[j]) inversions++;
      }
    }

    if (size % 2 === 1) {
      // Odd grid: solvable if inversions is even
      return inversions % 2 === 0;
    } else {
      // Even grid: more complex rule
      const emptyRow = Math.floor(tiles.indexOf(0) / size);
      const rowFromBottom = size - emptyRow;
      return (inversions + rowFromBottom) % 2 === 1;
    }
  };

  const shuffleTiles = (size: number): number[] => {
    const totalTiles = size * size;
    let arr: number[];

    do {
      arr = Array.from({ length: totalTiles }, (_, i) => i);
      // Fisher-Yates shuffle
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    } while (!isSolvable(arr, size));

    return arr;
  };

  const initializeGame = useCallback((diff: Difficulty) => {
    const size = DIFFICULTY_CONFIG[diff].size;
    const shuffled = shuffleTiles(size);

    const newTiles: Tile[] = shuffled.map((value) => ({
      value,
      isEmpty: value === 0,
    }));

    setTiles(newTiles);
    setMoves(0);
    setGameWon(false);
    setStartTime(Date.now());
    setElapsedTime(0);
  }, []);

  const checkWin = useCallback((currentTiles: Tile[]) => {
    for (let i = 0; i < currentTiles.length - 1; i++) {
      if (currentTiles[i].value !== i + 1) return false;
    }
    return currentTiles[currentTiles.length - 1].isEmpty;
  }, []);

  const findEmptyIndex = (currentTiles: Tile[]): number => {
    return currentTiles.findIndex((t) => t.isEmpty);
  };

  const canMove = (index: number, emptyIndex: number, size: number): boolean => {
    const row = Math.floor(index / size);
    const col = index % size;
    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;

    // Can only move if adjacent (not diagonal)
    return (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );
  };

  const handleTilePress = (index: number) => {
    if (gameWon || !difficulty) return;

    const size = DIFFICULTY_CONFIG[difficulty].size;
    const emptyIndex = findEmptyIndex(tiles);

    if (!canMove(index, emptyIndex, size)) return;

    // Swap tiles
    const newTiles = [...tiles];
    [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];

    setTiles(newTiles);
    setMoves((m) => m + 1);

    // Check win
    if (checkWin(newTiles)) {
      setGameWon(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmojiForTile = (value: number): string => {
    if (value === 0) return '';
    return TILE_EMOJIS[(value - 1) % TILE_EMOJIS.length];
  };

  if (!difficulty) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Indietro</Text>
        </TouchableOpacity>
        <View style={styles.header}>
          <Text style={styles.title}>🧩 Puzzle Scorrevole</Text>
          <Text style={styles.subtitle}>Riordina le tessere!</Text>
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
          <Text style={styles.winEmoji}>🧩</Text>
          <Text style={styles.winTitle}>Perfetto!</Text>
          <Text style={styles.winSubtitle}>Puzzle completato!</Text>
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

  const size = DIFFICULTY_CONFIG[difficulty].size;
  const boardSize = Math.min(width - 40, 350);
  const tileSize = (boardSize - (size + 1) * 4) / size;

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
        <Text style={styles.gameTitle}>🧩 Puzzle</Text>
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Tempo</Text>
          <Text style={styles.statBoxValue}>{formatTime(elapsedTime)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowNumbers(!showNumbers)}
      >
        <Text style={styles.toggleButtonText}>
          {showNumbers ? '🔢 Nascondi Numeri' : '🔢 Mostra Numeri'}
        </Text>
      </TouchableOpacity>

      <View style={styles.gameBoard}>
        <View
          style={[
            styles.puzzleBoard,
            { width: boardSize, height: boardSize },
          ]}
        >
          {tiles.map((tile, index) => {
            const row = Math.floor(index / size);
            const col = index % size;
            const emptyIndex = findEmptyIndex(tiles);
            const isMovable = canMove(index, emptyIndex, size);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tile,
                  {
                    width: tileSize,
                    height: tileSize,
                    left: col * (tileSize + 4) + 4,
                    top: row * (tileSize + 4) + 4,
                  },
                  tile.isEmpty && styles.emptyTile,
                  !tile.isEmpty && isMovable && styles.movableTile,
                ]}
                onPress={() => handleTilePress(index)}
                disabled={tile.isEmpty}
                activeOpacity={0.7}
              >
                {!tile.isEmpty && (
                  <>
                    <Text style={[styles.tileEmoji, { fontSize: tileSize * 0.45 }]}>
                      {getEmojiForTile(tile.value)}
                    </Text>
                    {showNumbers && (
                      <Text style={styles.tileNumber}>{tile.value}</Text>
                    )}
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.helpContainer}>
        <Text style={styles.helpText}>
          Obiettivo: ordina i numeri da 1 a {size * size - 1}
        </Text>
        <Text style={styles.helpSubtext}>
          (lo spazio vuoto va in basso a destra)
        </Text>
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
  toggleButton: {
    alignSelf: 'center',
    backgroundColor: Colors.background.medium,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
    marginVertical: 10,
  },
  toggleButtonText: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  gameBoard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  puzzleBoard: {
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    position: 'relative',
  },
  tile: {
    position: 'absolute',
    backgroundColor: Colors.card.front,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.card.border,
  },
  emptyTile: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  movableTile: {
    borderColor: Colors.accent.gold,
    backgroundColor: Colors.background.medium,
  },
  tileEmoji: {
    // fontSize set dynamically
  },
  tileNumber: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontSize: 10,
    color: Colors.text.muted,
    fontWeight: 'bold',
  },
  helpContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  helpText: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  helpSubtext: {
    color: Colors.text.muted,
    fontSize: 12,
    marginTop: 4,
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
    color: Colors.accent.pink,
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
    backgroundColor: Colors.accent.pink,
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

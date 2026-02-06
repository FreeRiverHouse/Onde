'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type GridSize = 3 | 4 | 5
type Position = { row: number; col: number }

interface Tile {
  id: number // Original position (0 = empty tile)
  currentPos: number
}

interface LeaderboardEntry {
  time: number
  moves: number
  gridSize: GridSize
  puzzle: string
  date: string
}

// Puzzle images - use beautiful Unsplash photos that look great as puzzles
const PUZZLES = [
  { 
    id: 'sunset', 
    name: '🌅 Sunset', 
    emoji: '🌅',
    image: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&h=600&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=80&h=80&fit=crop',
  },
  { 
    id: 'ocean', 
    name: '🌊 Ocean', 
    emoji: '🌊',
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=600&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=80&h=80&fit=crop',
  },
  { 
    id: 'forest', 
    name: '🌲 Forest', 
    emoji: '🌲',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=600&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=80&h=80&fit=crop',
  },
  { 
    id: 'space', 
    name: '🌌 Space', 
    emoji: '🌌',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=600&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=80&h=80&fit=crop',
  },
  { 
    id: 'flowers', 
    name: '🌸 Flowers', 
    emoji: '🌸',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&h=600&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=80&h=80&fit=crop',
  },
  { 
    id: 'mountains', 
    name: '🏔️ Mountains', 
    emoji: '🏔️',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=600&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=80&h=80&fit=crop',
  },
  { 
    id: 'kitten', 
    name: '🐱 Kitten', 
    emoji: '🐱',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=600&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=80&h=80&fit=crop',
  },
  { 
    id: 'rainbow', 
    name: '🌈 Rainbow', 
    emoji: '🌈',
    image: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&h=600&fit=crop&sat=-100&blur=0',
    thumb: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=80&h=80&fit=crop',
  },
]

// Sound effects using Web Audio API
const playSound = (type: 'slide' | 'shuffle' | 'win' | 'click') => {
  try {
    const audio = new AudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    switch (type) {
      case 'slide':
        osc.frequency.value = 440
        osc.type = 'sine'
        gain.gain.value = 0.1
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(550, audio.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
        osc.stop(audio.currentTime + 0.1)
        break
      case 'shuffle':
        osc.frequency.value = 300
        osc.type = 'square'
        gain.gain.value = 0.08
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(600, audio.currentTime + 0.3)
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
        osc.stop(audio.currentTime + 0.3)
        break
      case 'click':
        osc.frequency.value = 800
        gain.gain.value = 0.1
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.05)
        osc.stop(audio.currentTime + 0.05)
        break
      case 'win':
        const notes = [523.25, 659.25, 783.99, 1046.50]
        notes.forEach((freq, i) => {
          setTimeout(() => {
            const osc2 = audio.createOscillator()
            const gain2 = audio.createGain()
            osc2.connect(gain2)
            gain2.connect(audio.destination)
            osc2.frequency.value = freq
            gain2.gain.value = 0.06
            osc2.start()
            gain2.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.3)
            osc2.stop(audio.currentTime + 0.3)
          }, i * 150)
        })
        osc.stop(0)
        break
    }
  } catch {
    // Audio not supported
  }
}

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3', '#a8d8ea']
  const confetti = Array.from({ length: 150 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    size: 8 + Math.random() * 8,
    shape: Math.random() > 0.5 ? 'square' : 'circle',
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className={`absolute animate-confetti ${piece.shape === 'circle' ? 'rounded-full' : ''}`}
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}

// Get adjacent positions to empty tile
const getAdjacentToEmpty = (emptyPos: number, gridSize: number): number[] => {
  const row = Math.floor(emptyPos / gridSize)
  const col = emptyPos % gridSize
  const adjacent: number[] = []

  if (row > 0) adjacent.push(emptyPos - gridSize) // above
  if (row < gridSize - 1) adjacent.push(emptyPos + gridSize) // below
  if (col > 0) adjacent.push(emptyPos - 1) // left
  if (col < gridSize - 1) adjacent.push(emptyPos + 1) // right

  return adjacent
}

// Check if puzzle is solved
const isSolved = (tiles: Tile[]): boolean => {
  return tiles.every((tile) => tile.id === tile.currentPos)
}

// Shuffle puzzle by making valid moves (ensures solvability)
const shufflePuzzle = (gridSize: number, shuffleCount: number): Tile[] => {
  const totalTiles = gridSize * gridSize
  const tiles: Tile[] = Array.from({ length: totalTiles }, (_, i) => ({
    id: i,
    currentPos: i,
  }))

  let emptyPos = totalTiles - 1 // Empty tile starts at last position
  let lastMove = -1

  for (let i = 0; i < shuffleCount; i++) {
    const adjacent = getAdjacentToEmpty(emptyPos, gridSize).filter((pos) => pos !== lastMove)
    const randomAdjacent = adjacent[Math.floor(Math.random() * adjacent.length)]

    // Swap tiles
    const emptyTileIdx = tiles.findIndex((t) => t.currentPos === emptyPos)
    const movingTileIdx = tiles.findIndex((t) => t.currentPos === randomAdjacent)

    tiles[emptyTileIdx].currentPos = randomAdjacent
    tiles[movingTileIdx].currentPos = emptyPos

    lastMove = emptyPos
    emptyPos = randomAdjacent
  }

  return tiles
}

// Tile component with real image pieces
const PuzzleTile = ({
  tile,
  gridSize,
  puzzle,
  onClick,
  isAdjacent,
  isShuffling,
  boardSize,
}: {
  tile: Tile
  gridSize: GridSize
  puzzle: typeof PUZZLES[0]
  onClick: () => void
  isAdjacent: boolean
  isShuffling: boolean
  boardSize: number
}) => {
  const isEmpty = tile.id === gridSize * gridSize - 1
  const row = Math.floor(tile.currentPos / gridSize)
  const col = tile.currentPos % gridSize

  // Original position for background offset
  const origRow = Math.floor(tile.id / gridSize)
  const origCol = tile.id % gridSize

  const tileSize = boardSize / gridSize
  const gap = gridSize === 3 ? 4 : gridSize === 4 ? 3 : 2

  if (isEmpty) {
    return null
  }

  // Calculate background position so tile shows correct piece of image
  const bgPosX = -(origCol * tileSize)
  const bgPosY = -(origRow * tileSize)

  return (
    <button
      onClick={onClick}
      disabled={!isAdjacent || isShuffling}
      className={`
        absolute rounded-lg shadow-lg overflow-hidden
        transition-all duration-200 ease-out
        ${isAdjacent && !isShuffling ? 'cursor-pointer hover:brightness-110 ring-2 ring-white/70 z-10' : 'cursor-default'}
        ${isShuffling ? 'animate-pulse' : ''}
      `}
      style={{
        width: `${tileSize - gap}px`,
        height: `${tileSize - gap}px`,
        left: `${col * tileSize + gap / 2}px`,
        top: `${row * tileSize + gap / 2}px`,
        backgroundImage: `url(${puzzle.image})`,
        backgroundSize: `${boardSize}px ${boardSize}px`,
        backgroundPosition: `${bgPosX}px ${bgPosY}px`,
        transition: 'left 0.15s ease-out, top 0.15s ease-out',
      }}
    >
      {/* Small number overlay in corner */}
      <div className="absolute bottom-1 right-1 bg-black/40 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center backdrop-blur-sm">
        {tile.id + 1}
      </div>
      
      {/* Highlight border for adjacent tiles */}
      {isAdjacent && !isShuffling && (
        <div className="absolute inset-0 border-2 border-white/50 rounded-lg pointer-events-none" />
      )}
    </button>
  )
}

// Image selector button
const ImageButton = ({ 
  puzzle, 
  selected, 
  onClick, 
  disabled 
}: { 
  puzzle: typeof PUZZLES[0]
  selected: boolean
  onClick: () => void
  disabled: boolean
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden flex-shrink-0
        transition-all duration-200
        ${selected ? 'ring-3 ring-white shadow-lg scale-110' : 'ring-1 ring-white/30 hover:ring-white/60'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      `}
    >
      <img 
        src={puzzle.thumb} 
        alt={puzzle.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </button>
  )
}

// Main game component
export default function SlidingPuzzle() {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [gridSize, setGridSize] = useState<GridSize>(3)
  const [selectedPuzzle, setSelectedPuzzle] = useState(PUZZLES[0])
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const [boardSize, setBoardSize] = useState(320)

  // Calculate board size responsively
  useEffect(() => {
    const updateSize = () => {
      const maxSize = Math.min(window.innerWidth - 48, 420)
      setBoardSize(Math.max(240, maxSize))
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Preload image when puzzle changes
  useEffect(() => {
    setImageLoaded(false)
    const img = new Image()
    img.onload = () => setImageLoaded(true)
    img.src = selectedPuzzle.image
  }, [selectedPuzzle])

  // Load leaderboard from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('puzzle-game-leaderboard')
    if (saved) {
      try {
        setLeaderboard(JSON.parse(saved))
      } catch {
        // Invalid data
      }
    }
  }, [])

  // Initialize solved puzzle
  const initializeSolved = useCallback(() => {
    const totalTiles = gridSize * gridSize
    return Array.from({ length: totalTiles }, (_, i) => ({
      id: i,
      currentPos: i,
    }))
  }, [gridSize])

  // Initialize game
  const initializeGame = useCallback(() => {
    setTiles(initializeSolved())
    setMoves(0)
    setTime(0)
    setIsPlaying(false)
    setGameWon(false)
    setShowConfetti(false)
    setShowHint(false)

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [initializeSolved])

  // Initialize on mount and settings change
  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  // Timer
  useEffect(() => {
    if (isPlaying && !gameWon) {
      timerRef.current = setInterval(() => {
        setTime((t) => t + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying, gameWon])

  // Shuffle with animation
  const handleShuffle = async () => {
    setIsShuffling(true)
    setShowHint(false)
    
    if (soundEnabled) {
      playSound('shuffle')
    }

    const shuffleSteps = gridSize === 3 ? 30 : gridSize === 4 ? 50 : 80
    const newTiles = shufflePuzzle(gridSize, shuffleSteps)

    // Quick animation
    for (let i = 0; i < 5; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50))
      const intermediateTiles = shufflePuzzle(gridSize, shuffleSteps / 2)
      setTiles(intermediateTiles)
    }

    setTiles(newTiles)
    setMoves(0)
    setTime(0)
    setIsPlaying(true)
    setGameWon(false)
    setShowConfetti(false)
    setIsShuffling(false)

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    timerRef.current = setInterval(() => {
      setTime((t) => t + 1)
    }, 1000)
  }

  // Handle tile click
  const handleTileClick = (clickedTile: Tile) => {
    if (gameWon || isShuffling || !isPlaying) return

    const emptyTile = tiles.find((t) => t.id === gridSize * gridSize - 1)!
    const adjacent = getAdjacentToEmpty(emptyTile.currentPos, gridSize)

    if (!adjacent.includes(clickedTile.currentPos)) return

    if (soundEnabled) {
      playSound('slide')
    }

    const newTiles = tiles.map((t) => {
      if (t.id === clickedTile.id) {
        return { ...t, currentPos: emptyTile.currentPos }
      }
      if (t.id === emptyTile.id) {
        return { ...t, currentPos: clickedTile.currentPos }
      }
      return t
    })

    setTiles(newTiles)
    setMoves((m) => m + 1)

    // Check for win
    if (isSolved(newTiles)) {
      setGameWon(true)
      setIsPlaying(false)
      setShowConfetti(true)

      if (soundEnabled) {
        playSound('win')
      }

      const newEntry: LeaderboardEntry = {
        time,
        moves: moves + 1,
        gridSize,
        puzzle: selectedPuzzle.id,
        date: new Date().toISOString(),
      }

      const newLeaderboard = [...leaderboard, newEntry]
        .filter((e) => e.gridSize === gridSize)
        .sort((a, b) => a.time - b.time || a.moves - b.moves)
        .slice(0, 10)

      const otherEntries = leaderboard.filter((e) => e.gridSize !== gridSize)
      const fullLeaderboard = [...newLeaderboard, ...otherEntries]

      setLeaderboard(fullLeaderboard)
      localStorage.setItem('puzzle-game-leaderboard', JSON.stringify(fullLeaderboard))
    }
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Get empty tile position
  const emptyTile = tiles.find((t) => t.id === gridSize * gridSize - 1)
  const adjacentPositions = emptyTile ? getAdjacentToEmpty(emptyTile.currentPos, gridSize) : []

  // Current leaderboard
  const currentLeaderboard = leaderboard
    .filter((e) => e.gridSize === gridSize)
    .sort((a, b) => a.time - b.time || a.moves - b.moves)
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-400 via-blue-400 to-purple-500 flex flex-col items-center p-4">

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation">
        <span className="text-lg">←</span>
        <span className="font-mono text-sm">Games</span>
      </Link>

      <Confetti active={showConfetti} />

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="fixed top-4 right-4 z-50 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all"
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-black text-white mb-2 mt-14 text-center drop-shadow-lg">
        🧩 Sliding Puzzle
      </h1>
      <p className="text-white/90 mb-4 text-center">
        Slide the tiles to arrange them in order!
      </p>

      {/* Stats */}
      <div className="flex gap-4 mb-4">
        <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-blue-700 shadow-lg">
          ⏱️ {formatTime(time)}
        </div>
        <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-blue-700 shadow-lg">
          👆 {moves} moves
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4 justify-center items-center">
        {/* Grid size */}
        <div className="flex gap-1 bg-white/30 p-1 rounded-full">
          {([3, 4, 5] as GridSize[]).map((size) => (
            <button
              key={size}
              onClick={() => {
                if (soundEnabled) playSound('click')
                setGridSize(size)
              }}
              disabled={isPlaying && !gameWon}
              className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                gridSize === size
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-white hover:bg-white/20'
              } ${isPlaying && !gameWon ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {size}×{size}
            </button>
          ))}
        </div>

        {/* Image selection - now with real image thumbnails */}
        <div className="flex gap-2 bg-white/20 p-2 rounded-2xl overflow-x-auto max-w-xs md:max-w-lg">
          {PUZZLES.map((p) => (
            <ImageButton
              key={p.id}
              puzzle={p}
              selected={selectedPuzzle.id === p.id}
              onClick={() => {
                if (soundEnabled) playSound('click')
                setSelectedPuzzle(p)
              }}
              disabled={isPlaying && !gameWon}
            />
          ))}
        </div>
      </div>

      {/* Game board */}
      <div className="relative">
        <div
          ref={boardRef}
          className="relative bg-white/20 backdrop-blur rounded-2xl shadow-2xl overflow-hidden"
          style={{ 
            width: `${boardSize}px`, 
            height: `${boardSize}px`,
            padding: '4px',
          }}
        >
          {/* Loading state */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/10 rounded-2xl z-20">
              <div className="text-white text-lg animate-pulse">Loading image...</div>
            </div>
          )}

          {/* Tiles */}
          {imageLoaded && tiles
            .filter((t) => t.id !== gridSize * gridSize - 1)
            .map((tile) => (
              <PuzzleTile
                key={tile.id}
                tile={tile}
                gridSize={gridSize}
                puzzle={selectedPuzzle}
                onClick={() => handleTileClick(tile)}
                isAdjacent={adjacentPositions.includes(tile.currentPos)}
                isShuffling={isShuffling}
                boardSize={boardSize - 8} // Account for padding
              />
            ))}
        </div>

        {/* Hint overlay - shows full image */}
        {showHint && (
          <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-4 z-30">
            <h3 className="text-xl font-bold text-gray-700 mb-4">📸 Original Image</h3>
            <img 
              src={selectedPuzzle.image} 
              alt={selectedPuzzle.name}
              className="rounded-xl shadow-lg"
              style={{ 
                width: `${boardSize - 48}px`, 
                height: `${boardSize - 48}px`,
                objectFit: 'cover',
              }}
            />
            <button
              onClick={() => setShowHint(false)}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-all"
            >
              Got it!
            </button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mt-6 justify-center">
        <button
          onClick={handleShuffle}
          disabled={isShuffling || !imageLoaded}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all disabled:opacity-50"
        >
          🔀 {isPlaying ? 'Reshuffle' : 'Shuffle & Play'}
        </button>
        <button
          onClick={() => setShowHint(true)}
          disabled={!isPlaying || gameWon}
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all disabled:opacity-50"
        >
          💡 Hint
        </button>
        <button
          onClick={() => setShowLeaderboard(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
        >
          🏆 Best Times
        </button>
      </div>

      {/* Instructions */}
      {!isPlaying && !gameWon && (
        <div className="mt-6 text-center text-white/80 max-w-md">
          <p className="text-sm">
            👆 Click tiles next to the empty space to slide them.<br />
            Arrange the image pieces to complete the picture!
          </p>
        </div>
      )}

      {/* Win modal */}
      {gameWon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-bounceIn">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-black text-blue-700 mb-4">Puzzle Complete!</h2>
            
            {/* Show completed image */}
            <img 
              src={selectedPuzzle.image} 
              alt={selectedPuzzle.name}
              className="w-32 h-32 mx-auto rounded-xl shadow-lg mb-4 object-cover"
            />
            
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-500">{formatTime(time)}</div>
                <div className="text-sm text-gray-500">Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500">{moves}</div>
                <div className="text-sm text-gray-500">Moves</div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowConfetti(false)
                  handleShuffle()
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
              >
                🎮 Play Again
              </button>
              <button
                onClick={() => {
                  setShowConfetti(false)
                  initializeGame()
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-full shadow-lg hover:scale-105 transition-all"
              >
                ⚙️ Change Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard modal */}
      {showLeaderboard && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4"
          onClick={() => setShowLeaderboard(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-blue-700">🏆 Best Times ({gridSize}×{gridSize})</h2>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {currentLeaderboard.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No records yet! Complete a puzzle to set a record.
              </p>
            ) : (
              <div className="space-y-2">
                {currentLeaderboard.map((entry, index) => {
                  const puzzleData = PUZZLES.find((p) => p.id === entry.puzzle)
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300'
                          : index === 1
                          ? 'bg-gradient-to-r from-gray-100 to-slate-100 border-2 border-gray-300'
                          : index === 2
                          ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </span>
                        <div>
                          <div className="font-bold text-blue-700 flex items-center gap-2">
                            {puzzleData && (
                              <img src={puzzleData.thumb} alt="" className="w-6 h-6 rounded object-cover" />
                            )}
                            {formatTime(entry.time)}
                          </div>
                          <div className="text-xs text-gray-500">{entry.moves} moves</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">{formatDate(entry.date)}</div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Grid size tabs */}
            <div className="flex gap-2 mt-4 justify-center">
              {([3, 4, 5] as GridSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setGridSize(size)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    gridSize === size
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {size}×{size}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setLeaderboard([])
                localStorage.removeItem('puzzle-game-leaderboard')
              }}
              className="w-full mt-4 px-4 py-2 bg-red-100 text-red-600 font-bold rounded-full hover:bg-red-200 transition-all"
            >
              🗑️ Clear Records
            </button>
          </div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="fixed bottom-8 left-8 text-4xl animate-bounce opacity-60 pointer-events-none">🌟</div>
      <div className="fixed bottom-12 right-8 text-3xl animate-bounce opacity-60 pointer-events-none" style={{ animationDelay: '0.3s' }}>
        ✨
      </div>
      <div className="fixed top-24 right-16 text-2xl animate-bounce opacity-40 pointer-events-none" style={{ animationDelay: '0.6s' }}>
        ⭐
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti ease-out forwards;
        }
        @keyframes bounceIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  GameLayout,
  GameHeader,
  GameTitle,
  GameButton,
  StatsBadge,
  Confetti,
  WinModal,
  DifficultySelector,
} from '../components/KidUI'

// =============================================================================
// TYPES
// =============================================================================

interface PuzzlePiece {
  id: number
  correctX: number
  correctY: number
  currentX: number
  currentY: number
  isPlaced: boolean
}

interface PuzzleImage {
  id: string
  name: string
  emoji: string
  gradient: string
  pattern?: string
}

type PieceCount = 9 | 16 | 25 | 36
type GridSize = 3 | 4 | 5 | 6

// =============================================================================
// CONSTANTS
// =============================================================================

const PUZZLE_IMAGES: PuzzleImage[] = [
  { id: 'sunset', name: 'Tramonto', emoji: '🌅', gradient: 'from-orange-400 via-rose-500 to-purple-600' },
  { id: 'ocean', name: 'Oceano', emoji: '🌊', gradient: 'from-cyan-400 via-blue-500 to-indigo-600' },
  { id: 'forest', name: 'Foresta', emoji: '🌲', gradient: 'from-green-400 via-emerald-500 to-teal-600' },
  { id: 'space', name: 'Spazio', emoji: '🚀', gradient: 'from-indigo-900 via-purple-800 to-pink-700' },
  { id: 'rainbow', name: 'Arcobaleno', emoji: '🌈', gradient: 'from-red-400 via-yellow-400 to-green-400' },
  { id: 'candy', name: 'Caramelle', emoji: '🍬', gradient: 'from-pink-400 via-purple-400 to-indigo-400' },
  { id: 'fire', name: 'Fuoco', emoji: '🔥', gradient: 'from-yellow-400 via-orange-500 to-red-600' },
  { id: 'aurora', name: 'Aurora', emoji: '✨', gradient: 'from-green-300 via-cyan-400 to-purple-500' },
]

const DIFFICULTY_OPTIONS = [
  { value: '9', label: '3×3', emoji: '😊', description: 'Facile - 9 pezzi' },
  { value: '16', label: '4×4', emoji: '🎯', description: 'Medio - 16 pezzi' },
  { value: '25', label: '5×5', emoji: '💪', description: 'Difficile - 25 pezzi' },
  { value: '36', label: '6×6', emoji: '🏆', description: 'Esperto - 36 pezzi' },
]

const SNAP_DISTANCE = 30 // pixels

// =============================================================================
// SOUND EFFECTS
// =============================================================================

function useJigsawSounds() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playPickup = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = 400
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  const playSnap = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const notes = [523.25, 659.25, 783.99] // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.05)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.12)
        osc.start(ctx.currentTime + i * 0.05)
        osc.stop(ctx.currentTime + i * 0.05 + 0.12)
      })
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  const playDrop = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = 250
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
      osc.start()
      osc.stop(ctx.currentTime + 0.08)
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  const playWin = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.15)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3)
        osc.start(ctx.currentTime + i * 0.15)
        osc.stop(ctx.currentTime + i * 0.15 + 0.3)
      })
    } catch { /* Audio not available */ }
  }, [getAudioContext])

  return { playPickup, playSnap, playDrop, playWin }
}

// =============================================================================
// PUZZLE PIECE COMPONENT
// =============================================================================

interface PuzzlePieceProps {
  piece: PuzzlePiece
  gridSize: GridSize
  pieceSize: number
  image: PuzzleImage
  boardSize: number
  isDragging: boolean
  onDragStart: (piece: PuzzlePiece, e: React.MouseEvent | React.TouchEvent) => void
}

function PuzzlePieceComponent({
  piece,
  gridSize,
  pieceSize,
  image,
  boardSize,
  isDragging,
  onDragStart,
}: PuzzlePieceProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!piece.isPlaced) {
      e.preventDefault()
      onDragStart(piece, e)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!piece.isPlaced) {
      onDragStart(piece, e)
    }
  }

  // Calculate background position for the gradient pattern
  const bgPosX = (piece.correctX / gridSize) * 100
  const bgPosY = (piece.correctY / gridSize) * 100

  return (
    <div
      className={`
        absolute rounded-lg overflow-hidden
        transition-shadow duration-200
        ${piece.isPlaced 
          ? 'cursor-default shadow-none' 
          : isDragging 
            ? 'cursor-grabbing shadow-2xl z-50 scale-105' 
            : 'cursor-grab shadow-lg hover:shadow-xl hover:scale-102 z-10'
        }
      `}
      style={{
        width: pieceSize,
        height: pieceSize,
        left: piece.currentX,
        top: piece.currentY,
        transition: piece.isPlaced ? 'all 0.3s ease-out' : isDragging ? 'none' : 'box-shadow 0.2s',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Piece background with gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${image.gradient}`}
        style={{
          backgroundSize: `${boardSize}px ${boardSize}px`,
          backgroundPosition: `-${piece.correctX * pieceSize}px -${piece.correctY * pieceSize}px`,
        }}
      />
      
      {/* Pattern overlay based on position */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(circle at ${30 + bgPosX * 0.4}% ${30 + bgPosY * 0.4}%, 
              rgba(255,255,255,0.5) 0%, 
              transparent 50%),
            radial-gradient(circle at ${70 - bgPosX * 0.2}% ${70 - bgPosY * 0.2}%, 
              rgba(255,255,255,0.3) 0%, 
              transparent 40%)
          `
        }}
      />
      
      {/* Large centered emoji */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          fontSize: pieceSize * 0.5,
          opacity: 0.3,
          transform: `translate(${(piece.correctX - gridSize/2) * -pieceSize * 0.3}px, ${(piece.correctY - gridSize/2) * -pieceSize * 0.3}px)`,
        }}
      >
        {image.emoji}
      </div>

      {/* Piece number (small, for debugging/help) */}
      <div className="absolute bottom-1 right-1 bg-black/30 text-white text-xs font-bold px-1 rounded">
        {piece.id + 1}
      </div>

      {/* Border effect */}
      <div className={`
        absolute inset-0 border-2 rounded-lg pointer-events-none
        ${piece.isPlaced ? 'border-white/20' : 'border-white/40'}
      `} />
    </div>
  )
}

// =============================================================================
// PREVIEW COMPONENT
// =============================================================================

interface PreviewProps {
  image: PuzzleImage
  gridSize: GridSize
  show: boolean
  onClose: () => void
}

function Preview({ image, gridSize, show, onClose }: PreviewProps) {
  if (!show) return null

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
          📸 Anteprima - {image.name}
        </h3>
        
        {/* Preview image */}
        <div className={`relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br ${image.gradient}`}>
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-40" style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(255,255,255,0.3) 0%, transparent 40%)
            `
          }} />
          
          {/* Large emoji */}
          <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-50">
            {image.emoji}
          </div>
          
          {/* Grid overlay */}
          <div className="absolute inset-0 grid" style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }}>
            {Array.from({ length: gridSize * gridSize }, (_, i) => (
              <div key={i} className="border border-white/30" />
            ))}
          </div>
        </div>

        <p className="text-center text-gray-600 mt-4 mb-2">
          {gridSize}×{gridSize} = {gridSize * gridSize} pezzi
        </p>

        <GameButton onClick={onClose} variant="primary" className="w-full">
          Capito! 👍
        </GameButton>
      </div>
      
      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

// =============================================================================
// MAIN GAME COMPONENT
// =============================================================================

export default function JigsawPuzzle() {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([])
  const [pieceCount, setPieceCount] = useState<PieceCount>(9)
  const [selectedImage, setSelectedImage] = useState<PuzzleImage>(PUZZLE_IMAGES[0])
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [draggingPiece, setDraggingPiece] = useState<PuzzlePiece | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [boardRef, setBoardRef] = useState<HTMLDivElement | null>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { playPickup, playSnap, playDrop, playWin } = useJigsawSounds()

  const gridSize = useMemo(() => Math.sqrt(pieceCount) as GridSize, [pieceCount])
  
  // Calculate board and piece sizes based on viewport
  const boardSize = useMemo(() => {
    if (typeof window === 'undefined') return 320
    const maxSize = Math.min(window.innerWidth - 32, 400)
    return maxSize
  }, [])
  
  const pieceSize = useMemo(() => Math.floor(boardSize / gridSize), [boardSize, gridSize])

  // Timer effect
  useEffect(() => {
    if (isPlaying && !gameWon) {
      timerRef.current = setInterval(() => {
        setTime((t) => t + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, gameWon])

  // Initialize puzzle
  const initializePuzzle = useCallback(() => {
    const totalPieces = pieceCount
    const newPieces: PuzzlePiece[] = []
    
    // Create pieces with their correct positions
    for (let i = 0; i < totalPieces; i++) {
      const correctX = i % gridSize
      const correctY = Math.floor(i / gridSize)
      newPieces.push({
        id: i,
        correctX,
        correctY,
        currentX: correctX * pieceSize,
        currentY: correctY * pieceSize,
        isPlaced: false,
      })
    }

    // Scatter pieces randomly in the area around and below the board
    const scatterArea = {
      minX: -pieceSize,
      maxX: boardSize + pieceSize * 2,
      minY: boardSize + 20,
      maxY: boardSize + 180,
    }

    newPieces.forEach((piece) => {
      piece.currentX = scatterArea.minX + Math.random() * (scatterArea.maxX - scatterArea.minX - pieceSize)
      piece.currentY = scatterArea.minY + Math.random() * (scatterArea.maxY - scatterArea.minY - pieceSize)
    })

    setPieces(newPieces)
    setMoves(0)
    setTime(0)
    setGameWon(false)
    setShowConfetti(false)
    setIsPlaying(true)
  }, [pieceCount, gridSize, pieceSize, boardSize])

  // Handle drag start
  const handleDragStart = useCallback((piece: PuzzlePiece, e: React.MouseEvent | React.TouchEvent) => {
    if (piece.isPlaced || gameWon) return

    let clientX: number, clientY: number
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const boardRect = boardRef?.getBoundingClientRect()
    if (!boardRect) return

    setDragOffset({
      x: clientX - (boardRect.left + piece.currentX),
      y: clientY - (boardRect.top + piece.currentY),
    })
    setDraggingPiece(piece)

    if (soundEnabled) playPickup()
  }, [gameWon, boardRef, soundEnabled, playPickup])

  // Handle drag move
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!draggingPiece || !boardRef) return

    let clientX: number, clientY: number
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const boardRect = boardRef.getBoundingClientRect()
    const newX = clientX - boardRect.left - dragOffset.x
    const newY = clientY - boardRect.top - dragOffset.y

    setPieces((prev) =>
      prev.map((p) =>
        p.id === draggingPiece.id ? { ...p, currentX: newX, currentY: newY } : p
      )
    )
  }, [draggingPiece, boardRef, dragOffset])

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!draggingPiece) return

    const targetX = draggingPiece.correctX * pieceSize
    const targetY = draggingPiece.correctY * pieceSize

    const piece = pieces.find((p) => p.id === draggingPiece.id)
    if (!piece) return

    const distance = Math.sqrt(
      Math.pow(piece.currentX - targetX, 2) + Math.pow(piece.currentY - targetY, 2)
    )

    if (distance < SNAP_DISTANCE) {
      // Snap to correct position
      setPieces((prev) =>
        prev.map((p) =>
          p.id === draggingPiece.id
            ? { ...p, currentX: targetX, currentY: targetY, isPlaced: true }
            : p
        )
      )
      if (soundEnabled) playSnap()
    } else {
      if (soundEnabled) playDrop()
    }

    setMoves((m) => m + 1)
    setDraggingPiece(null)
  }, [draggingPiece, pieces, pieceSize, soundEnabled, playSnap, playDrop])

  // Global mouse/touch event handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e)
    const handleMouseUp = () => handleDragEnd()
    const handleTouchMove = (e: TouchEvent) => handleDragMove(e)
    const handleTouchEnd = () => handleDragEnd()

    if (draggingPiece) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: true })
      window.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [draggingPiece, handleDragMove, handleDragEnd])

  // Check for win
  useEffect(() => {
    if (pieces.length > 0 && pieces.every((p) => p.isPlaced)) {
      setGameWon(true)
      setIsPlaying(false)
      setShowConfetti(true)
      if (soundEnabled) playWin()
    }
  }, [pieces, soundEnabled, playWin])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Count placed pieces
  const placedCount = pieces.filter((p) => p.isPlaced).length

  return (
    <GameLayout background="coolSky">
      <Confetti active={showConfetti} />

      <GameHeader
        backHref="/games/arcade"
        backLabel="◀ Arcade"
        soundEnabled={soundEnabled}
        onSoundToggle={() => setSoundEnabled(!soundEnabled)}
      >
        <div className="pt-20 pb-4 px-4">
          <GameTitle
            emoji="🧩"
            title="Puzzle"
            subtitle="Ricomponi l'immagine!"
          />
        </div>
      </GameHeader>

      <div className="px-4 pb-4 flex flex-col items-center">
        {/* Stats */}
        <div className="flex gap-3 mb-4 flex-wrap justify-center">
          <StatsBadge icon="⏱️" value={formatTime(time)} />
          <StatsBadge icon="👆" value={moves} label="mosse" />
          <StatsBadge icon="✅" value={`${placedCount}/${pieceCount}`} />
        </div>

        {/* Game settings (when not playing) */}
        {!isPlaying && !gameWon && (
          <div className="w-full max-w-md space-y-4 mb-6">
            {/* Image selection */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-4">
              <h3 className="text-center font-bold text-gray-700 mb-3">
                🖼️ Scegli l'immagine
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {PUZZLE_IMAGES.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className={`
                      aspect-square rounded-xl text-3xl
                      transition-all duration-200
                      ${selectedImage.id === img.id
                        ? 'scale-110 ring-4 ring-purple-400 shadow-lg'
                        : 'hover:scale-105 opacity-70 hover:opacity-100'
                      }
                      bg-gradient-to-br ${img.gradient}
                    `}
                    title={img.name}
                  >
                    {img.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty selection */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-4">
              <h3 className="text-center font-bold text-gray-700 mb-3">
                🎯 Difficoltà
              </h3>
              <DifficultySelector
                value={String(pieceCount)}
                options={DIFFICULTY_OPTIONS}
                onChange={(v) => setPieceCount(Number(v) as PieceCount)}
              />
            </div>
          </div>
        )}

        {/* Main game area */}
        <div 
          ref={setBoardRef}
          className="relative"
          style={{ 
            width: boardSize + pieceSize * 2, 
            height: boardSize + 200,
          }}
        >
          {/* Board area (drop zone) */}
          <div
            className="absolute bg-white/30 backdrop-blur-sm rounded-2xl border-4 border-dashed border-white/50"
            style={{
              width: boardSize,
              height: boardSize,
              left: pieceSize,
              top: 0,
            }}
          >
            {/* Grid lines */}
            <div
              className="absolute inset-0 grid"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize}, 1fr)`,
              }}
            >
              {Array.from({ length: gridSize * gridSize }, (_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>

          {/* Pieces */}
          {pieces.map((piece) => (
            <PuzzlePieceComponent
              key={piece.id}
              piece={{
                ...piece,
                currentX: piece.currentX + pieceSize, // Offset for board position
              }}
              gridSize={gridSize}
              pieceSize={pieceSize}
              image={selectedImage}
              boardSize={boardSize}
              isDragging={draggingPiece?.id === piece.id}
              onDragStart={(p, e) => handleDragStart({ ...p, currentX: p.currentX - pieceSize }, e)}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          {!isPlaying ? (
            <>
              <GameButton
                onClick={initializePuzzle}
                variant="success"
                icon="🎮"
                size="xl"
              >
                Gioca!
              </GameButton>
              <GameButton
                onClick={() => setShowPreview(true)}
                variant="ghost"
                icon="👁️"
              >
                Anteprima
              </GameButton>
            </>
          ) : (
            <>
              <GameButton
                onClick={() => setShowPreview(true)}
                variant="ghost"
                icon="💡"
              >
                Aiuto
              </GameButton>
              <GameButton
                onClick={initializePuzzle}
                variant="secondary"
                icon="🔄"
              >
                Ricomincia
              </GameButton>
            </>
          )}
        </div>

        {/* Instructions */}
        {!isPlaying && !gameWon && (
          <div className="mt-6 bg-white/80 rounded-2xl p-4 max-w-md w-full">
            <h3 className="text-center font-bold text-purple-700 mb-2">📖 Come si gioca</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span>👆</span>
                <span>Trascina i pezzi sulla griglia</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🎯</span>
                <span>I pezzi si agganciano quando sono vicini al posto giusto</span>
              </li>
              <li className="flex items-start gap-2">
                <span>💡</span>
                <span>Usa "Anteprima" per vedere l'immagine completa</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🏆</span>
                <span>Completa il puzzle più velocemente possibile!</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Preview modal */}
      <Preview
        image={selectedImage}
        gridSize={gridSize}
        show={showPreview}
        onClose={() => setShowPreview(false)}
      />

      {/* Win modal */}
      <WinModal
        show={gameWon}
        title="Puzzle completato!"
        emoji="🧩"
        score={moves}
        time={formatTime(time)}
        onPlayAgain={initializePuzzle}
        onGoBack={() => window.location.href = '/games'}
      >
        <p className="text-gray-600 mb-2">
          {selectedImage.emoji} {selectedImage.name} • {gridSize}×{gridSize}
        </p>
      </WinModal>

      <style jsx>{`
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </GameLayout>
  )
}

'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Word data with Italian/English translations and clues
interface WordEntry {
  word: string
  clue: string
  translation?: string
  category: string
}

const wordDatabase: Record<string, WordEntry[]> = {
  easy: [
    // Animals
    { word: 'CAT', clue: 'A furry pet that meows', translation: 'GATTO', category: 'animals' },
    { word: 'DOG', clue: 'A loyal pet that barks', translation: 'CANE', category: 'animals' },
    { word: 'BIRD', clue: 'It flies in the sky', translation: 'UCCELLO', category: 'animals' },
    { word: 'FISH', clue: 'It swims in water', translation: 'PESCE', category: 'animals' },
    { word: 'BEAR', clue: 'Large furry forest animal', translation: 'ORSO', category: 'animals' },
    // Food
    { word: 'CAKE', clue: 'Sweet birthday dessert', translation: 'TORTA', category: 'food' },
    { word: 'MILK', clue: 'White drink from cows', translation: 'LATTE', category: 'food' },
    { word: 'RICE', clue: 'Small white grains', translation: 'RISO', category: 'food' },
    { word: 'SOUP', clue: 'Hot liquid food in a bowl', translation: 'ZUPPA', category: 'food' },
    { word: 'BREAD', clue: 'Baked dough for sandwiches', translation: 'PANE', category: 'food' },
    // Nature
    { word: 'TREE', clue: 'Tall plant with leaves', translation: 'ALBERO', category: 'nature' },
    { word: 'STAR', clue: 'It twinkles at night', translation: 'STELLA', category: 'nature' },
    { word: 'MOON', clue: 'It glows at night', translation: 'LUNA', category: 'nature' },
    { word: 'SUN', clue: 'Gives us light and warmth', translation: 'SOLE', category: 'nature' },
    { word: 'RAIN', clue: 'Water falling from clouds', translation: 'PIOGGIA', category: 'nature' },
    // Home
    { word: 'BED', clue: 'Where you sleep', translation: 'LETTO', category: 'home' },
    { word: 'DOOR', clue: 'You open it to enter', translation: 'PORTA', category: 'home' },
    { word: 'LAMP', clue: 'Gives light in dark rooms', translation: 'LAMPADA', category: 'home' },
    { word: 'BOOK', clue: 'You read stories in it', translation: 'LIBRO', category: 'home' },
    { word: 'BALL', clue: 'Round toy for playing', translation: 'PALLA', category: 'home' },
    // Colors
    { word: 'RED', clue: 'Color of fire', translation: 'ROSSO', category: 'colors' },
    { word: 'BLUE', clue: 'Color of the sky', translation: 'BLU', category: 'colors' },
    { word: 'GREEN', clue: 'Color of grass', translation: 'VERDE', category: 'colors' },
    { word: 'PINK', clue: 'Light red color', translation: 'ROSA', category: 'colors' },
    { word: 'GOLD', clue: 'Shiny yellow metal color', translation: 'ORO', category: 'colors' },
  ],
  medium: [
    // Animals
    { word: 'HORSE', clue: 'You can ride this animal', translation: 'CAVALLO', category: 'animals' },
    { word: 'TIGER', clue: 'Striped big cat', translation: 'TIGRE', category: 'animals' },
    { word: 'MOUSE', clue: 'Small rodent, cats chase it', translation: 'TOPO', category: 'animals' },
    { word: 'SHEEP', clue: 'Gives us wool', translation: 'PECORA', category: 'animals' },
    { word: 'ZEBRA', clue: 'Black and white striped horse', translation: 'ZEBRA', category: 'animals' },
    // Food
    { word: 'PIZZA', clue: 'Italian flat bread with toppings', translation: 'PIZZA', category: 'food' },
    { word: 'PASTA', clue: 'Italian noodles', translation: 'PASTA', category: 'food' },
    { word: 'APPLE', clue: 'Red or green fruit', translation: 'MELA', category: 'food' },
    { word: 'GRAPE', clue: 'Small fruit for wine', translation: 'UVA', category: 'food' },
    { word: 'LEMON', clue: 'Sour yellow citrus', translation: 'LIMONE', category: 'food' },
    // Nature
    { word: 'OCEAN', clue: 'Very large body of water', translation: 'OCEANO', category: 'nature' },
    { word: 'CLOUD', clue: 'White fluffy things in sky', translation: 'NUVOLA', category: 'nature' },
    { word: 'BEACH', clue: 'Sandy place by the sea', translation: 'SPIAGGIA', category: 'nature' },
    { word: 'RIVER', clue: 'Flowing water to the sea', translation: 'FIUME', category: 'nature' },
    { word: 'STORM', clue: 'Thunder, lightning, and rain', translation: 'TEMPESTA', category: 'nature' },
    // Home
    { word: 'TABLE', clue: 'You eat meals on it', translation: 'TAVOLO', category: 'home' },
    { word: 'CHAIR', clue: 'You sit on it', translation: 'SEDIA', category: 'home' },
    { word: 'CLOCK', clue: 'Shows the time', translation: 'OROLOGIO', category: 'home' },
    { word: 'PLANT', clue: 'Green living decoration', translation: 'PIANTA', category: 'home' },
    { word: 'TOWEL', clue: 'You dry yourself with it', translation: 'ASCIUGAMANO', category: 'home' },
    // Italian words
    { word: 'CIAO', clue: 'Italian greeting (hello/bye)', category: 'italian' },
    { word: 'AMORE', clue: 'Italian word for love', category: 'italian' },
    { word: 'BELLA', clue: 'Italian word for beautiful', category: 'italian' },
    { word: 'NOTTE', clue: 'Italian word for night', category: 'italian' },
    { word: 'MARE', clue: 'Italian word for sea', category: 'italian' },
  ],
  hard: [
    // Animals
    { word: 'DOLPHIN', clue: 'Smart sea mammal', translation: 'DELFINO', category: 'animals' },
    { word: 'ELEPHANT', clue: 'Largest land animal', translation: 'ELEFANTE', category: 'animals' },
    { word: 'GIRAFFE', clue: 'Tallest animal with long neck', translation: 'GIRAFFA', category: 'animals' },
    { word: 'PENGUIN', clue: 'Bird that swims, can\'t fly', translation: 'PINGUINO', category: 'animals' },
    { word: 'BUTTERFLY', clue: 'Beautiful flying insect', translation: 'FARFALLA', category: 'animals' },
    // Food
    { word: 'SPAGHETTI', clue: 'Long thin Italian pasta', translation: 'SPAGHETTI', category: 'food' },
    { word: 'SANDWICH', clue: 'Bread with filling inside', translation: 'PANINO', category: 'food' },
    { word: 'PANCAKE', clue: 'Flat breakfast treat with syrup', translation: 'PANCAKE', category: 'food' },
    { word: 'MUSHROOM', clue: 'Fungus you can eat', translation: 'FUNGO', category: 'food' },
    { word: 'CHOCOLATE', clue: 'Sweet brown candy', translation: 'CIOCCOLATO', category: 'food' },
    // Nature
    { word: 'MOUNTAIN', clue: 'Very tall rocky landform', translation: 'MONTAGNA', category: 'nature' },
    { word: 'RAINBOW', clue: 'Colorful arc after rain', translation: 'ARCOBALENO', category: 'nature' },
    { word: 'VOLCANO', clue: 'Mountain that erupts lava', translation: 'VULCANO', category: 'nature' },
    { word: 'THUNDER', clue: 'Loud sound during storms', translation: 'TUONO', category: 'nature' },
    { word: 'SUNSHINE', clue: 'Light from the sun', translation: 'SOLE', category: 'nature' },
    // Home
    { word: 'KITCHEN', clue: 'Room where you cook', translation: 'CUCINA', category: 'home' },
    { word: 'BEDROOM', clue: 'Room where you sleep', translation: 'CAMERA', category: 'home' },
    { word: 'BATHROOM', clue: 'Room with shower and toilet', translation: 'BAGNO', category: 'home' },
    { word: 'COMPUTER', clue: 'Electronic device for work', translation: 'COMPUTER', category: 'home' },
    { word: 'BLANKET', clue: 'Warm cover for bed', translation: 'COPERTA', category: 'home' },
    // Italian phrases/words
    { word: 'BUONGIORNO', clue: 'Italian for "good morning"', category: 'italian' },
    { word: 'FAMIGLIA', clue: 'Italian word for family', category: 'italian' },
    { word: 'GRAZIE', clue: 'Italian word for thank you', category: 'italian' },
    { word: 'GELATO', clue: 'Italian ice cream', category: 'italian' },
    { word: 'BAMBINO', clue: 'Italian word for child', category: 'italian' },
  ]
}

// Grid cell type
interface Cell {
  letter: string
  number?: number
  isBlack: boolean
  acrossClue?: number
  downClue?: number
  revealed?: boolean
}

// Clue type
interface Clue {
  number: number
  direction: 'across' | 'down'
  clue: string
  answer: string
  translation?: string
  row: number
  col: number
}

// Generate a crossword grid
const generateCrossword = (difficulty: 'easy' | 'medium' | 'hard'): { grid: Cell[][], clues: Clue[] } => {
  const words = wordDatabase[difficulty]
  const gridSize = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 10 : 12
  
  // Initialize empty grid
  const grid: Cell[][] = Array(gridSize).fill(null).map(() => 
    Array(gridSize).fill(null).map(() => ({ letter: '', isBlack: true }))
  )
  
  const usedWords: WordEntry[] = []
  const clues: Clue[] = []
  let clueNumber = 1
  
  // Shuffle words
  const shuffled = [...words].sort(() => Math.random() - 0.5)
  
  // Place first word horizontally in the center
  const firstWord = shuffled[0]
  const startRow = Math.floor(gridSize / 2)
  const startCol = Math.floor((gridSize - firstWord.word.length) / 2)
  
  for (let i = 0; i < firstWord.word.length; i++) {
    grid[startRow][startCol + i] = {
      letter: firstWord.word[i],
      isBlack: false,
      number: i === 0 ? clueNumber : undefined,
      acrossClue: clueNumber
    }
  }
  
  clues.push({
    number: clueNumber,
    direction: 'across',
    clue: firstWord.clue,
    answer: firstWord.word,
    translation: firstWord.translation,
    row: startRow,
    col: startCol
  })
  
  usedWords.push(firstWord)
  clueNumber++
  
  // Try to place more words
  const maxAttempts = 100
  let attempts = 0
  const targetWords = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 10
  
  while (usedWords.length < targetWords && attempts < maxAttempts) {
    attempts++
    
    // Find a word that intersects with existing words
    for (const word of shuffled) {
      if (usedWords.includes(word)) continue
      
      // Try to find an intersection point
      let placed = false
      
      for (let row = 0; row < gridSize && !placed; row++) {
        for (let col = 0; col < gridSize && !placed; col++) {
          if (grid[row][col].isBlack || !grid[row][col].letter) continue
          
          const existingLetter = grid[row][col].letter
          
          // Check if word contains this letter
          for (let i = 0; i < word.word.length && !placed; i++) {
            if (word.word[i] !== existingLetter) continue
            
            // Try placing vertically
            const vStartRow = row - i
            const vEndRow = vStartRow + word.word.length - 1
            
            if (vStartRow >= 0 && vEndRow < gridSize) {
              let canPlace = true
              
              // Check if placement is valid
              for (let r = vStartRow; r <= vEndRow && canPlace; r++) {
                const c = col
                const letterIdx = r - vStartRow
                const cell = grid[r][c]
                
                if (r === row) continue // This is the intersection point
                
                // Check if cell is available
                if (!cell.isBlack && cell.letter && cell.letter !== word.word[letterIdx]) {
                  canPlace = false
                }
                
                // Check adjacent cells (left and right)
                if (c > 0 && !grid[r][c - 1].isBlack && r !== row) {
                  canPlace = false
                }
                if (c < gridSize - 1 && !grid[r][c + 1].isBlack && r !== row) {
                  canPlace = false
                }
                
                // Check cell above start
                if (r === vStartRow && vStartRow > 0 && !grid[vStartRow - 1][c].isBlack) {
                  canPlace = false
                }
                
                // Check cell below end
                if (r === vEndRow && vEndRow < gridSize - 1 && !grid[vEndRow + 1][c].isBlack) {
                  canPlace = false
                }
              }
              
              if (canPlace) {
                // Place the word
                for (let r = vStartRow; r <= vEndRow; r++) {
                  const letterIdx = r - vStartRow
                  const needsNumber = r === vStartRow && !grid[r][col].number
                  
                  grid[r][col] = {
                    letter: word.word[letterIdx],
                    isBlack: false,
                    number: needsNumber ? clueNumber : grid[r][col].number,
                    acrossClue: grid[r][col].acrossClue,
                    downClue: clueNumber
                  }
                }
                
                clues.push({
                  number: grid[vStartRow][col].number || clueNumber,
                  direction: 'down',
                  clue: word.clue,
                  answer: word.word,
                  translation: word.translation,
                  row: vStartRow,
                  col: col
                })
                
                usedWords.push(word)
                clueNumber++
                placed = true
              }
            }
            
            // Try placing horizontally
            if (!placed) {
              const hStartCol = col - i
              const hEndCol = hStartCol + word.word.length - 1
              
              if (hStartCol >= 0 && hEndCol < gridSize) {
                let canPlace = true
                
                for (let c = hStartCol; c <= hEndCol && canPlace; c++) {
                  const r = row
                  const letterIdx = c - hStartCol
                  const cell = grid[r][c]
                  
                  if (c === col) continue
                  
                  if (!cell.isBlack && cell.letter && cell.letter !== word.word[letterIdx]) {
                    canPlace = false
                  }
                  
                  // Check adjacent cells (top and bottom)
                  if (r > 0 && !grid[r - 1][c].isBlack && c !== col) {
                    canPlace = false
                  }
                  if (r < gridSize - 1 && !grid[r + 1][c].isBlack && c !== col) {
                    canPlace = false
                  }
                  
                  // Check cell before start
                  if (c === hStartCol && hStartCol > 0 && !grid[r][hStartCol - 1].isBlack) {
                    canPlace = false
                  }
                  
                  // Check cell after end
                  if (c === hEndCol && hEndCol < gridSize - 1 && !grid[r][hEndCol + 1].isBlack) {
                    canPlace = false
                  }
                }
                
                if (canPlace) {
                  for (let c = hStartCol; c <= hEndCol; c++) {
                    const letterIdx = c - hStartCol
                    const needsNumber = c === hStartCol && !grid[row][c].number
                    
                    grid[row][c] = {
                      letter: word.word[letterIdx],
                      isBlack: false,
                      number: needsNumber ? clueNumber : grid[row][c].number,
                      acrossClue: clueNumber,
                      downClue: grid[row][c].downClue
                    }
                  }
                  
                  clues.push({
                    number: grid[row][hStartCol].number || clueNumber,
                    direction: 'across',
                    clue: word.clue,
                    answer: word.word,
                    translation: word.translation,
                    row: row,
                    col: hStartCol
                  })
                  
                  usedWords.push(word)
                  clueNumber++
                  placed = true
                }
              }
            }
          }
        }
      }
    }
  }
  
  return { grid, clues }
}

// Difficulty settings
const difficultyConfig = {
  easy: { label: '⭐ Easy', gridSize: 8, timeLimit: 600, hintPenalty: 30 },
  medium: { label: '⭐⭐ Medium', gridSize: 10, timeLimit: 480, hintPenalty: 45 },
  hard: { label: '⭐⭐⭐ Hard', gridSize: 12, timeLimit: 360, hintPenalty: 60 }
}

type Difficulty = 'easy' | 'medium' | 'hard'

// Confetti component
const Confetti = ({ show }: { show: boolean }) => {
  if (!show) return null
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          <span 
            className="text-2xl"
            style={{ 
              filter: `hue-rotate(${Math.random() * 360}deg)`,
              display: 'inline-block',
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          >
            {['🎉', '🎊', '⭐', '✨', '🌟', '💫', '🏆', '📝'][Math.floor(Math.random() * 8)]}
          </span>
        </div>
      ))}
    </div>
  )
}

function CrosswordPuzzleInner() {
  const rewards = useGameContext()
  // Game state
  const [gameMode, setGameMode] = useState<'menu' | 'playing' | 'result'>('menu')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [grid, setGrid] = useState<Cell[][]>([])
  const [clues, setClues] = useState<Clue[]>([])
  const [userInput, setUserInput] = useState<string[][]>([])
  
  // Selection state
  const [selectedCell, setSelectedCell] = useState<{ row: number, col: number } | null>(null)
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across')
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null)
  
  // Timer state
  const [useTimer, setUseTimer] = useState<boolean>(true)
  const [timeLeft, setTimeLeft] = useState<number>(600)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  
  // Hints state
  const [hintsUsed, setHintsUsed] = useState<number>(0)
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set())
  
  // Score & Stats
  const [score, setScore] = useState<number>(0)
  const [totalScore, setTotalScore] = useState<number>(0)
  const [puzzlesCompleted, setPuzzlesCompleted] = useState<number>(0)
  
  // UI state
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [showTranslations, setShowTranslations] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map())

  // Load saved data
  useEffect(() => {
    const savedScore = localStorage.getItem('crossword-total-score')
    if (savedScore) setTotalScore(parseInt(savedScore))
    
    const savedPuzzles = localStorage.getItem('crossword-puzzles-completed')
    if (savedPuzzles) setPuzzlesCompleted(parseInt(savedPuzzles))
  }, [])

  // Timer effect
  useEffect(() => {
    if (gameMode === 'playing' && useTimer && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameMode, useTimer, isPaused])

  // Check if puzzle is complete
  const checkComplete = useCallback(() => {
    if (grid.length === 0) return false
    
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[0].length; col++) {
        if (!grid[row][col].isBlack) {
          if (userInput[row]?.[col]?.toUpperCase() !== grid[row][col].letter) {
            return false
          }
        }
      }
    }
    return true
  }, [grid, userInput])

  // Check completion on input change
  useEffect(() => {
    if (gameMode === 'playing' && checkComplete()) {
      endGame(true)
    }
  }, [userInput, gameMode, checkComplete])

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff)
    
    // Generate crossword
    const { grid: newGrid, clues: newClues } = generateCrossword(diff)
    setGrid(newGrid)
    setClues(newClues)
    
    // Initialize user input
    const input = newGrid.map(row => row.map(() => ''))
    setUserInput(input)
    
    // Reset state
    setSelectedCell(null)
    setSelectedClue(null)
    setSelectedDirection('across')
    setHintsUsed(0)
    setRevealedCells(new Set())
    setScore(0)
    setTimeLeft(difficultyConfig[diff].timeLimit)
    setIsPaused(false)
    setMessage('')
    setShowConfetti(false)
    
    setGameMode('playing')
  }

  const endGame = (won: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current)
    
    if (won) {
      // Calculate score
      const baseScore = 1000
      const timeBonus = useTimer ? timeLeft * 2 : 0
      const hintPenalty = hintsUsed * difficultyConfig[difficulty].hintPenalty
      const difficultyBonus = difficulty === 'easy' ? 0 : difficulty === 'medium' ? 200 : 500
      
      const finalScore = Math.max(0, baseScore + timeBonus + difficultyBonus - hintPenalty)
      setScore(finalScore)
      
      const newTotal = totalScore + finalScore
      setTotalScore(newTotal)
      localStorage.setItem('crossword-total-score', newTotal.toString())
      
      const newPuzzles = puzzlesCompleted + 1
      setPuzzlesCompleted(newPuzzles)
      rewards.trackWin()
      localStorage.setItem('crossword-puzzles-completed', newPuzzles.toString())
      
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
    
    setGameMode('result')
  }

  const handleCellClick = (row: number, col: number) => {
    if (grid[row][col].isBlack) return
    
    if (selectedCell?.row === row && selectedCell?.col === col) {
      // Toggle direction if clicking same cell
      setSelectedDirection(prev => prev === 'across' ? 'down' : 'across')
    } else {
      setSelectedCell({ row, col })
    }
    
    // Find and select the clue for this cell
    const acrossClue = clues.find(c => c.direction === 'across' && c.row === row && col >= c.col && col < c.col + c.answer.length)
    const downClue = clues.find(c => c.direction === 'down' && c.col === col && row >= c.row && row < c.row + c.answer.length)
    
    if (selectedDirection === 'across' && acrossClue) {
      setSelectedClue(acrossClue)
    } else if (selectedDirection === 'down' && downClue) {
      setSelectedClue(downClue)
    } else if (acrossClue) {
      setSelectedClue(acrossClue)
      setSelectedDirection('across')
    } else if (downClue) {
      setSelectedClue(downClue)
      setSelectedDirection('down')
    }
    
    // Focus input
    const inputRef = inputRefs.current.get(`${row}-${col}`)
    inputRef?.focus()
  }

  const handleClueClick = (clue: Clue) => {
    setSelectedClue(clue)
    setSelectedDirection(clue.direction)
    setSelectedCell({ row: clue.row, col: clue.col })
    
    const inputRef = inputRefs.current.get(`${clue.row}-${clue.col}`)
    inputRef?.focus()
  }

  const handleInput = (row: number, col: number, value: string) => {
    const letter = value.toUpperCase().replace(/[^A-Z]/g, '').slice(-1)
    
    const newInput = [...userInput]
    newInput[row] = [...(newInput[row] || [])]
    newInput[row][col] = letter
    setUserInput(newInput)
    
    // Move to next cell
    if (letter) {
      moveToNextCell(row, col)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (e.key === 'Backspace' && !userInput[row]?.[col]) {
      e.preventDefault()
      moveToPrevCell(row, col)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      moveInDirection(row, col, 0, 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      moveInDirection(row, col, 0, -1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      moveInDirection(row, col, 1, 0)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      moveInDirection(row, col, -1, 0)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      setSelectedDirection(prev => prev === 'across' ? 'down' : 'across')
    }
  }

  const moveToNextCell = (row: number, col: number) => {
    if (selectedDirection === 'across') {
      moveInDirection(row, col, 0, 1)
    } else {
      moveInDirection(row, col, 1, 0)
    }
  }

  const moveToPrevCell = (row: number, col: number) => {
    if (selectedDirection === 'across') {
      moveInDirection(row, col, 0, -1)
    } else {
      moveInDirection(row, col, -1, 0)
    }
  }

  const moveInDirection = (row: number, col: number, rowDelta: number, colDelta: number) => {
    let newRow = row + rowDelta
    let newCol = col + colDelta
    
    while (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length) {
      if (!grid[newRow][newCol].isBlack) {
        setSelectedCell({ row: newRow, col: newCol })
        const inputRef = inputRefs.current.get(`${newRow}-${newCol}`)
        inputRef?.focus()
        return
      }
      newRow += rowDelta
      newCol += colDelta
    }
  }

  const useHint = () => {
    if (!selectedClue) return
    
    // Find first empty or wrong cell in the selected word
    let targetRow = -1
    let targetCol = -1
    
    if (selectedClue.direction === 'across') {
      for (let i = 0; i < selectedClue.answer.length; i++) {
        const c = selectedClue.col + i
        if (userInput[selectedClue.row]?.[c]?.toUpperCase() !== selectedClue.answer[i]) {
          targetRow = selectedClue.row
          targetCol = c
          break
        }
      }
    } else {
      for (let i = 0; i < selectedClue.answer.length; i++) {
        const r = selectedClue.row + i
        if (userInput[r]?.[selectedClue.col]?.toUpperCase() !== selectedClue.answer[i]) {
          targetRow = r
          targetCol = selectedClue.col
          break
        }
      }
    }
    
    if (targetRow === -1) return // Word already complete
    
    // Reveal the letter
    const newInput = [...userInput]
    newInput[targetRow] = [...(newInput[targetRow] || [])]
    newInput[targetRow][targetCol] = grid[targetRow][targetCol].letter
    setUserInput(newInput)
    
    // Mark as revealed
    setRevealedCells(prev => new Set([...prev, `${targetRow}-${targetCol}`]))
    setHintsUsed(prev => prev + 1)
    
    setMessage(`💡 Hint used! (-${difficultyConfig[difficulty].hintPenalty} points)`)
    setTimeout(() => setMessage(''), 2000)
  }

  const revealWord = () => {
    if (!selectedClue) return
    
    const newInput = [...userInput]
    
    if (selectedClue.direction === 'across') {
      for (let i = 0; i < selectedClue.answer.length; i++) {
        const c = selectedClue.col + i
        newInput[selectedClue.row] = [...(newInput[selectedClue.row] || [])]
        newInput[selectedClue.row][c] = grid[selectedClue.row][c].letter
        setRevealedCells(prev => new Set([...prev, `${selectedClue.row}-${c}`]))
      }
    } else {
      for (let i = 0; i < selectedClue.answer.length; i++) {
        const r = selectedClue.row + i
        newInput[r] = [...(newInput[r] || [])]
        newInput[r][selectedClue.col] = grid[r][selectedClue.col].letter
        setRevealedCells(prev => new Set([...prev, `${r}-${selectedClue.col}`]))
      }
    }
    
    setUserInput(newInput)
    setHintsUsed(prev => prev + selectedClue.answer.length)
    setMessage('📖 Word revealed!')
    setTimeout(() => setMessage(''), 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isInSelectedWord = (row: number, col: number): boolean => {
    if (!selectedClue) return false
    
    if (selectedClue.direction === 'across') {
      return row === selectedClue.row && col >= selectedClue.col && col < selectedClue.col + selectedClue.answer.length
    } else {
      return col === selectedClue.col && row >= selectedClue.row && row < selectedClue.row + selectedClue.answer.length
    }
  }

  // Menu Screen
  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-400 to-cyan-400 flex flex-col items-center p-4">

      <Link href="/games/arcade/" className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 transition-all active:scale-95 touch-manipulation"><span className="text-lg">←</span><span className="font-mono text-sm">Arcade</span></Link>
        <Link href="/games/arcade/" className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-full font-bold text-teal-700 shadow-lg hover:scale-105 transition-all">
          ← Games
        </Link>

        {/* Stats */}
        <div className="absolute top-4 right-4 flex gap-2 flex-wrap justify-end">
          <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-teal-700 shadow-lg">
            📝 {puzzlesCompleted} puzzles
          </div>
          <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-teal-700 shadow-lg">
            🏆 {totalScore.toLocaleString()}
          </div>
        </div>

        {/* Title */}
        <div className="mt-16 mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-lg mb-2">
            ✏️ Crossword Puzzle
          </h1>
          <p className="text-xl text-white/90">
            English & Italian Words! 🇮🇹🇬🇧
          </p>
        </div>

        {/* Timer Toggle */}
        <div className="w-full max-w-md mb-6">
          <button
            onClick={() => setUseTimer(!useTimer)}
            className={`
              w-full p-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3
              ${useTimer 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : 'bg-white/50 text-white hover:bg-white/70'
              }
            `}
          >
            {useTimer ? '⏱️ Timer ON' : '⏱️ Timer OFF (Relaxed Mode)'}
          </button>
        </div>

        {/* Difficulty Selection */}
        <div className="w-full max-w-md mb-6">
          <h2 className="text-xl font-bold text-white mb-3 text-center">Choose Difficulty:</h2>
          <div className="grid grid-cols-1 gap-3">
            {(Object.keys(difficultyConfig) as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => startGame(diff)}
                className="
                  p-5 rounded-xl font-bold text-lg
                  bg-white/90 text-teal-700
                  hover:scale-105 hover:shadow-xl
                  transition-all flex items-center justify-between
                "
              >
                <span>{difficultyConfig[diff].label}</span>
                <span className="text-sm opacity-70">
                  {diff === 'easy' && '3-4 letter words'}
                  {diff === 'medium' && '4-6 letter words'}
                  {diff === 'hard' && '6+ letter words'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 bg-white/30 backdrop-blur rounded-2xl p-6 max-w-md">
          <h3 className="font-bold text-white text-lg mb-2">How to Play:</h3>
          <ul className="text-white/90 text-sm space-y-1">
            <li>• Click a cell or clue to start</li>
            <li>• Type letters to fill in the puzzle</li>
            <li>• Use hints if you&apos;re stuck</li>
            <li>• Toggle Italian translations for help</li>
            <li>• Complete the puzzle before time runs out!</li>
          </ul>
        </div>

        {/* Language hint */}
        <div className="mt-6 text-center">
          <div className="inline-block bg-white/20 rounded-full px-6 py-3">
            <span className="text-white font-bold">🌍 Learn words in English & Italian!</span>
          </div>
        </div>
      </div>
    )
  }

  // Result Screen
  if (gameMode === 'result') {
    const won = score > 0 || checkComplete()
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-400 to-cyan-400 flex flex-col items-center justify-center p-4">
        <Confetti show={showConfetti} />
        
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center">
          <h1 className="text-4xl font-black text-teal-700 mb-2">
            {won ? '🎉 Puzzle Complete!' : '⏰ Time\'s Up!'}
          </h1>
          
          <div className="my-8 space-y-4">
            {won && (
              <div className="bg-teal-100 rounded-2xl p-4">
                <div className="text-5xl font-black text-teal-700">{score.toLocaleString()}</div>
                <div className="text-teal-500 font-bold">Points This Puzzle</div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-100 rounded-xl p-3">
                <div className="text-2xl font-bold text-blue-700">{clues.length}</div>
                <div className="text-blue-500 text-sm">Words</div>
              </div>
              <div className="bg-orange-100 rounded-xl p-3">
                <div className="text-2xl font-bold text-orange-700">{hintsUsed}</div>
                <div className="text-orange-500 text-sm">Hints Used</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-3">
              <div className="text-2xl font-bold text-orange-700">{totalScore.toLocaleString()}</div>
              <div className="text-orange-500 text-sm">Total Score 🏆</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => startGame(difficulty)}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
            >
              🎮 New Puzzle
            </button>
            <button
              onClick={() => setGameMode('menu')}
              className="w-full py-4 bg-gray-200 text-gray-700 font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-all"
            >
              ← Back to Menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Game Screen
  const acrossClues = clues.filter(c => c.direction === 'across').sort((a, b) => a.number - b.number)
  const downClues = clues.filter(c => c.direction === 'down').sort((a, b) => a.number - b.number)

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-400 via-teal-400 to-cyan-400 flex flex-col items-center p-2 md:p-4">
      <Confetti show={showConfetti} />
      
      {/* Header */}
      <div className="w-full max-w-4xl flex flex-wrap justify-between items-center gap-2 mb-2">
        <button
          onClick={() => {
            if (timerRef.current) clearInterval(timerRef.current)
            setGameMode('menu')
          }}
          className="bg-white/90 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold text-teal-700 shadow-lg hover:scale-105 transition-all text-sm"
        >
          ← Exit
        </button>
        
        <div className="flex gap-2 flex-wrap">
          {useTimer && (
            <>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="bg-white/90 px-3 py-1.5 rounded-full font-bold text-teal-700 shadow-lg hover:scale-105 transition-all text-sm"
              >
                {isPaused ? '▶️' : '⏸️'}
              </button>
              <div className={`
                px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold shadow-lg text-sm
                ${timeLeft <= 60 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-white/90 text-teal-700'
                }
              `}>
                ⏱️ {formatTime(timeLeft)}
              </div>
            </>
          )}
          <div className="bg-white/90 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold text-teal-700 shadow-lg text-sm">
            💡 {hintsUsed}
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-amber-500 text-white px-4 py-2 rounded-full font-bold mb-2 animate-bounce shadow-lg text-sm">
          {message}
        </div>
      )}

      {/* Pause overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="text-6xl mb-4">⏸️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Paused</h2>
            <button
              onClick={() => setIsPaused(false)}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-full hover:scale-105 transition-all"
            >
              Resume ▶️
            </button>
          </div>
        </div>
      )}

      {/* Main game area */}
      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-4">
        {/* Grid */}
        <div className="flex-shrink-0">
          <div 
            className="bg-white rounded-xl p-2 shadow-xl inline-block"
            style={{ 
              display: 'grid',
              gridTemplateColumns: `repeat(${grid[0]?.length || 1}, minmax(28px, 36px))`,
              gap: '1px',
              backgroundColor: '#1a1a1a'
            }}
          >
            {grid.map((row, rowIdx) => 
              row.map((cell, colIdx) => (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={`
                    relative aspect-square flex items-center justify-center
                    ${cell.isBlack 
                      ? 'bg-gray-800' 
                      : selectedCell?.row === rowIdx && selectedCell?.col === colIdx
                        ? 'bg-yellow-300'
                        : isInSelectedWord(rowIdx, colIdx)
                          ? 'bg-yellow-100'
                          : revealedCells.has(`${rowIdx}-${colIdx}`)
                            ? 'bg-green-100'
                            : 'bg-white'
                    }
                    ${!cell.isBlack ? 'cursor-pointer hover:bg-yellow-50' : ''}
                  `}
                  onClick={() => handleCellClick(rowIdx, colIdx)}
                >
                  {/* Cell number */}
                  {cell.number && (
                    <span className="absolute top-0 left-0.5 text-[8px] md:text-[10px] font-bold text-gray-600">
                      {cell.number}
                    </span>
                  )}
                  
                  {/* Input */}
                  {!cell.isBlack && (
                    <input
                      ref={(el) => {
                        if (el) inputRefs.current.set(`${rowIdx}-${colIdx}`, el)
                      }}
                      type="text"
                      value={userInput[rowIdx]?.[colIdx] || ''}
                      onChange={(e) => handleInput(rowIdx, colIdx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                      onFocus={() => handleCellClick(rowIdx, colIdx)}
                      className={`
                        w-full h-full text-center font-bold text-lg md:text-xl uppercase
                        bg-transparent outline-none
                        ${revealedCells.has(`${rowIdx}-${colIdx}`) ? 'text-green-600' : 'text-gray-800'}
                      `}
                      maxLength={1}
                    />
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 mt-3 flex-wrap justify-center">
            <button
              onClick={useHint}
              disabled={!selectedClue}
              className={`
                px-4 py-2 rounded-full font-bold shadow-lg transition-all text-sm
                ${selectedClue 
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              💡 Hint Letter
            </button>
            
            <button
              onClick={revealWord}
              disabled={!selectedClue}
              className={`
                px-4 py-2 rounded-full font-bold shadow-lg transition-all text-sm
                ${selectedClue 
                  ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              📖 Reveal Word
            </button>
            
            <button
              onClick={() => setShowTranslations(!showTranslations)}
              className={`
                px-4 py-2 rounded-full font-bold shadow-lg transition-all text-sm
                ${showTranslations 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  : 'bg-white/80 text-teal-700 hover:bg-white'
                }
              `}
            >
              🇮🇹 {showTranslations ? 'Hide' : 'Show'} Italian
            </button>
          </div>
        </div>

        {/* Clues */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
          {/* Across clues */}
          <div className="bg-white/90 rounded-xl p-3 shadow-lg">
            <h3 className="font-bold text-teal-700 text-lg mb-2 flex items-center gap-2">
              ➡️ Across
            </h3>
            <div className="space-y-1 max-h-[40vh] overflow-y-auto">
              {acrossClues.map((clue) => (
                <button
                  key={`across-${clue.number}`}
                  onClick={() => handleClueClick(clue)}
                  className={`
                    w-full text-left p-2 rounded-lg transition-all text-sm
                    ${selectedClue === clue 
                      ? 'bg-yellow-200 font-bold' 
                      : 'hover:bg-teal-50'
                    }
                  `}
                >
                  <span className="font-bold text-teal-600">{clue.number}.</span>{' '}
                  <span className="text-gray-700">{clue.clue}</span>
                  {showTranslations && clue.translation && (
                    <span className="block text-xs text-green-600 mt-0.5">
                      🇮🇹 {clue.translation}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Down clues */}
          <div className="bg-white/90 rounded-xl p-3 shadow-lg">
            <h3 className="font-bold text-teal-700 text-lg mb-2 flex items-center gap-2">
              ⬇️ Down
            </h3>
            <div className="space-y-1 max-h-[40vh] overflow-y-auto">
              {downClues.map((clue) => (
                <button
                  key={`down-${clue.number}`}
                  onClick={() => handleClueClick(clue)}
                  className={`
                    w-full text-left p-2 rounded-lg transition-all text-sm
                    ${selectedClue === clue 
                      ? 'bg-yellow-200 font-bold' 
                      : 'hover:bg-teal-50'
                    }
                  `}
                >
                  <span className="font-bold text-teal-600">{clue.number}.</span>{' '}
                  <span className="text-gray-700">{clue.clue}</span>
                  {showTranslations && clue.translation && (
                    <span className="block text-xs text-green-600 mt-0.5">
                      🇮🇹 {clue.translation}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected clue highlight */}
      {selectedClue && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur px-6 py-3 rounded-2xl shadow-xl max-w-lg text-center z-30">
          <div className="text-sm text-teal-600 font-bold">
            {selectedClue.number} {selectedClue.direction === 'across' ? '➡️' : '⬇️'}
          </div>
          <div className="text-gray-800 font-medium">{selectedClue.clue}</div>
          {showTranslations && selectedClue.translation && (
            <div className="text-green-600 text-sm mt-1">🇮🇹 {selectedClue.translation}</div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        :global(.animate-confetti) {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  )
}


// ============================================
// Game Wrapper with XP + Coins tracking
// ============================================
export default function CrosswordPuzzle() {
  return (
    <GameWrapper gameName="Crossword" gameId="crossword" emoji={"📝"}>
      <CrosswordPuzzleInner />
    </GameWrapper>
  )
}

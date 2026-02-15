'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Types
type GameState = 'menu' | 'playing' | 'paused' | 'results'
type HitResult = 'perfect' | 'good' | 'miss' | null
type Lane = 0 | 1 | 2 | 3

interface Note {
  id: number
  lane: Lane
  time: number // ms from song start
  hit: boolean
  missed: boolean
}

interface Song {
  id: string
  title: string
  artist: string
  emoji: string
  bpm: number
  difficulty: 'easy' | 'medium' | 'hard'
  notes: { lane: Lane; beat: number }[]
  duration: number // ms
  color: string
}

interface HitEffect {
  id: number
  lane: Lane
  result: HitResult
  time: number
}

// Lane colors and keys
const LANE_CONFIG = [
  { key: 'd', color: 'from-pink-500 to-pink-600', glow: 'shadow-pink-500/50', emoji: '💖' },
  { key: 'f', color: 'from-blue-500 to-blue-600', glow: 'shadow-blue-500/50', emoji: '💙' },
  { key: 'j', color: 'from-green-500 to-green-600', glow: 'shadow-green-500/50', emoji: '💚' },
  { key: 'k', color: 'from-yellow-500 to-yellow-600', glow: 'shadow-yellow-500/50', emoji: '💛' },
]

// Generate notes from beat patterns
const generateNotes = (patterns: { lane: Lane; beat: number }[], bpm: number): { lane: Lane; time: number }[] => {
  const msPerBeat = 60000 / bpm
  return patterns.map(p => ({
    lane: p.lane,
    time: p.beat * msPerBeat + 2000, // 2s delay before first note
  }))
}

// Songs with patterns
const SONGS: Song[] = [
  {
    id: 'twinkle',
    title: 'Twinkle Star',
    artist: 'Classic',
    emoji: '⭐',
    bpm: 100,
    difficulty: 'easy',
    duration: 25000,
    color: 'from-yellow-400 to-amber-500',
    notes: [
      { lane: 0, beat: 0 }, { lane: 0, beat: 1 },
      { lane: 2, beat: 2 }, { lane: 2, beat: 3 },
      { lane: 3, beat: 4 }, { lane: 3, beat: 5 },
      { lane: 2, beat: 6 },
      { lane: 1, beat: 8 }, { lane: 1, beat: 9 },
      { lane: 0, beat: 10 }, { lane: 0, beat: 11 },
      { lane: 3, beat: 12 }, { lane: 3, beat: 13 },
      { lane: 2, beat: 14 },
      { lane: 1, beat: 16 }, { lane: 1, beat: 17 },
      { lane: 0, beat: 18 }, { lane: 0, beat: 19 },
      { lane: 3, beat: 20 }, { lane: 3, beat: 21 },
      { lane: 2, beat: 22 },
    ],
  },
  {
    id: 'dance',
    title: 'Dance Beat',
    artist: 'DJ Onde',
    emoji: '🎵',
    bpm: 120,
    difficulty: 'medium',
    duration: 32000,
    color: 'from-purple-500 to-pink-500',
    notes: [
      { lane: 0, beat: 0 }, { lane: 2, beat: 0.5 },
      { lane: 1, beat: 1 }, { lane: 3, beat: 1.5 },
      { lane: 0, beat: 2 }, { lane: 2, beat: 2.5 },
      { lane: 1, beat: 3 }, { lane: 3, beat: 3.5 },
      { lane: 0, beat: 4 }, { lane: 1, beat: 4 },
      { lane: 2, beat: 5 }, { lane: 3, beat: 5 },
      { lane: 0, beat: 6 }, { lane: 1, beat: 6.5 },
      { lane: 2, beat: 7 }, { lane: 3, beat: 7.5 },
      { lane: 0, beat: 8 }, { lane: 2, beat: 8.5 },
      { lane: 1, beat: 9 }, { lane: 3, beat: 9.5 },
      { lane: 0, beat: 10 }, { lane: 2, beat: 10 },
      { lane: 1, beat: 11 }, { lane: 3, beat: 11 },
      { lane: 0, beat: 12 }, { lane: 1, beat: 12.5 },
      { lane: 2, beat: 13 }, { lane: 3, beat: 13.5 },
      { lane: 0, beat: 14 }, { lane: 1, beat: 14.5 }, { lane: 2, beat: 14.5 },
      { lane: 3, beat: 15 }, { lane: 0, beat: 15.5 },
      { lane: 1, beat: 16 }, { lane: 2, beat: 16 },
      { lane: 3, beat: 17 }, { lane: 0, beat: 17.5 },
      { lane: 1, beat: 18 }, { lane: 2, beat: 18.5 },
      { lane: 3, beat: 19 }, { lane: 0, beat: 19.5 },
      { lane: 1, beat: 20 }, { lane: 2, beat: 20 }, { lane: 3, beat: 20 },
    ],
  },
  {
    id: 'rhythm-master',
    title: 'Rhythm Master',
    artist: 'DJ Extreme',
    emoji: '🔥',
    bpm: 140,
    difficulty: 'hard',
    duration: 35000,
    color: 'from-red-500 to-orange-500',
    notes: [
      { lane: 0, beat: 0 }, { lane: 1, beat: 0.25 }, { lane: 2, beat: 0.5 }, { lane: 3, beat: 0.75 },
      { lane: 3, beat: 1 }, { lane: 2, beat: 1.25 }, { lane: 1, beat: 1.5 }, { lane: 0, beat: 1.75 },
      { lane: 0, beat: 2 }, { lane: 3, beat: 2 },
      { lane: 1, beat: 2.5 }, { lane: 2, beat: 2.5 },
      { lane: 0, beat: 3 }, { lane: 1, beat: 3.25 }, { lane: 2, beat: 3.5 }, { lane: 3, beat: 3.75 },
      { lane: 0, beat: 4 }, { lane: 2, beat: 4 },
      { lane: 1, beat: 4.5 }, { lane: 3, beat: 4.5 },
      { lane: 0, beat: 5 }, { lane: 1, beat: 5 }, { lane: 2, beat: 5 }, { lane: 3, beat: 5 },
      { lane: 0, beat: 5.5 }, { lane: 3, beat: 5.5 },
      { lane: 1, beat: 6 }, { lane: 2, beat: 6 },
      { lane: 0, beat: 6.5 }, { lane: 1, beat: 6.75 }, { lane: 2, beat: 7 }, { lane: 3, beat: 7.25 },
      { lane: 0, beat: 7.5 }, { lane: 1, beat: 7.5 },
      { lane: 2, beat: 8 }, { lane: 3, beat: 8 },
      { lane: 0, beat: 8.5 }, { lane: 2, beat: 8.5 },
      { lane: 1, beat: 9 }, { lane: 3, beat: 9 },
      { lane: 0, beat: 9.25 }, { lane: 1, beat: 9.5 }, { lane: 2, beat: 9.75 }, { lane: 3, beat: 10 },
      { lane: 0, beat: 10.5 }, { lane: 1, beat: 10.5 }, { lane: 2, beat: 10.5 }, { lane: 3, beat: 10.5 },
      { lane: 0, beat: 11 }, { lane: 3, beat: 11 },
      { lane: 1, beat: 11.5 }, { lane: 2, beat: 11.5 },
      { lane: 0, beat: 12 }, { lane: 1, beat: 12.25 }, { lane: 2, beat: 12.5 }, { lane: 3, beat: 12.75 },
      { lane: 0, beat: 13 }, { lane: 1, beat: 13 }, { lane: 2, beat: 13 }, { lane: 3, beat: 13 },
    ],
  },
  {
    id: 'chill-vibes',
    title: 'Chill Vibes',
    artist: 'Lofi Kid',
    emoji: '🌙',
    bpm: 85,
    difficulty: 'easy',
    duration: 28000,
    color: 'from-indigo-500 to-purple-600',
    notes: [
      { lane: 0, beat: 0 }, { lane: 2, beat: 1 },
      { lane: 1, beat: 2 }, { lane: 3, beat: 3 },
      { lane: 0, beat: 4 }, { lane: 1, beat: 5 },
      { lane: 2, beat: 6 }, { lane: 3, beat: 7 },
      { lane: 0, beat: 8 }, { lane: 2, beat: 8 },
      { lane: 1, beat: 10 }, { lane: 3, beat: 10 },
      { lane: 0, beat: 12 }, { lane: 1, beat: 13 },
      { lane: 2, beat: 14 }, { lane: 3, beat: 15 },
      { lane: 0, beat: 16 }, { lane: 2, beat: 17 },
      { lane: 1, beat: 18 }, { lane: 3, beat: 19 },
    ],
  },
  {
    id: 'electric',
    title: 'Electric Dreams',
    artist: 'Synth Wave',
    emoji: '⚡',
    bpm: 128,
    difficulty: 'medium',
    duration: 30000,
    color: 'from-cyan-400 to-blue-600',
    notes: [
      { lane: 0, beat: 0 }, { lane: 1, beat: 0.5 },
      { lane: 2, beat: 1 }, { lane: 3, beat: 1.5 },
      { lane: 0, beat: 2 }, { lane: 1, beat: 2 },
      { lane: 2, beat: 3 }, { lane: 3, beat: 3 },
      { lane: 0, beat: 4 }, { lane: 3, beat: 4.5 },
      { lane: 1, beat: 5 }, { lane: 2, beat: 5.5 },
      { lane: 0, beat: 6 }, { lane: 1, beat: 6 }, { lane: 2, beat: 6 },
      { lane: 3, beat: 7 }, { lane: 2, beat: 7.5 },
      { lane: 1, beat: 8 }, { lane: 0, beat: 8.5 },
      { lane: 3, beat: 9 }, { lane: 2, beat: 9.5 },
      { lane: 1, beat: 10 }, { lane: 0, beat: 10.5 },
      { lane: 0, beat: 11 }, { lane: 1, beat: 11 }, { lane: 2, beat: 11 }, { lane: 3, beat: 11 },
      { lane: 0, beat: 12 }, { lane: 2, beat: 12.5 },
      { lane: 1, beat: 13 }, { lane: 3, beat: 13.5 },
      { lane: 0, beat: 14 }, { lane: 1, beat: 14 },
      { lane: 2, beat: 15 }, { lane: 3, beat: 15 },
    ],
  },
]

// Sound effects using Web Audio API
const audioContextRef = { current: null as AudioContext | null }

const getAudioContext = () => {
  if (!audioContextRef.current) {
    audioContextRef.current = new AudioContext()
  }
  return audioContextRef.current
}

const playNote = (lane: Lane, result: HitResult) => {
  try {
    const audio = getAudioContext()
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)

    const frequencies = [261.63, 329.63, 392.00, 523.25] // C4, E4, G4, C5
    osc.frequency.value = frequencies[lane]
    
    if (result === 'perfect') {
      osc.type = 'sine'
      gain.gain.value = 0.3
    } else if (result === 'good') {
      osc.type = 'triangle'
      gain.gain.value = 0.2
    } else {
      osc.type = 'sawtooth'
      osc.frequency.value = 100
      gain.gain.value = 0.1
    }

    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.15)
    osc.stop(audio.currentTime + 0.15)
  } catch {
    // Audio not supported
  }
}

const playComboSound = (combo: number) => {
  try {
    const audio = getAudioContext()
    const baseFreq = 440 + Math.min(combo * 20, 400)
    
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(audio.destination)
    
    osc.frequency.value = baseFreq
    osc.type = 'sine'
    gain.gain.value = 0.15
    
    osc.start()
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, audio.currentTime + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.2)
    osc.stop(audio.currentTime + 0.2)
  } catch {
    // Audio not supported
  }
}

// Confetti component
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null

  const colors = ['#ec4899', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316']
  const confetti = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 8,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti rounded-full"
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

// Hit effect component
const HitEffectDisplay = ({ effect }: { effect: HitEffect }) => {
  const config = {
    perfect: { text: 'PERFECT!', color: 'text-yellow-400', scale: 'scale-125' },
    good: { text: 'GOOD', color: 'text-green-400', scale: 'scale-100' },
    miss: { text: 'MISS', color: 'text-red-400', scale: 'scale-90' },
  }
  
  const { text, color, scale } = config[effect.result || 'miss']
  
  return (
    <div 
      className={`absolute bottom-24 left-1/2 -translate-x-1/2 font-black text-2xl ${color} ${scale} animate-hit-effect pointer-events-none whitespace-nowrap`}
      style={{ 
        left: `${12.5 + effect.lane * 25}%`,
        textShadow: '0 0 20px currentColor',
      }}
    >
      {text}
    </div>
  )
}

// Note component
const NoteComponent = ({ note, currentTime, hitZoneY }: { note: Note; currentTime: number; hitZoneY: number }) => {
  if (note.hit || note.missed) return null
  
  const noteSpeed = 400 // pixels per second
  const timeToHit = note.time - currentTime
  const y = hitZoneY - (timeToHit / 1000) * noteSpeed
  
  // Only render if visible
  if (y < -60 || y > hitZoneY + 100) return null
  
  const laneConfig = LANE_CONFIG[note.lane]
  
  return (
    <div
      className={`absolute w-14 h-14 rounded-xl bg-gradient-to-br ${laneConfig.color} shadow-lg ${laneConfig.glow} 
        flex items-center justify-center text-2xl transform transition-transform
        border-2 border-white/50`}
      style={{
        left: `${12.5 + note.lane * 25}%`,
        top: `${y}px`,
        transform: 'translateX(-50%)',
      }}
    >
      {laneConfig.emoji}
    </div>
  )
}

// Lane button component
const LaneButton = ({ 
  lane, 
  pressed, 
  onPress 
}: { 
  lane: Lane
  pressed: boolean
  onPress: () => void
}) => {
  const config = LANE_CONFIG[lane]
  
  return (
    <button
      onMouseDown={onPress}
      onTouchStart={(e) => { e.preventDefault(); onPress() }}
      className={`
        w-16 h-16 rounded-xl border-4 transition-all duration-75
        ${pressed 
          ? `bg-gradient-to-br ${config.color} scale-95 shadow-xl ${config.glow} border-white` 
          : 'bg-gray-800/80 border-gray-600 hover:border-gray-400'
        }
        flex items-center justify-center text-2xl font-bold
      `}
    >
      <span className={pressed ? 'text-white' : 'text-gray-400'}>
        {config.key.toUpperCase()}
      </span>
    </button>
  )
}

// Song card component
const SongCard = ({ song, onSelect, highScore }: { song: Song; onSelect: () => void; highScore: number }) => {
  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500',
  }
  
  return (
    <button
      onClick={onSelect}
      className={`bg-gradient-to-br ${song.color} p-4 rounded-2xl shadow-xl hover:scale-105 transition-all text-left w-full`}
    >
      <div className="flex items-center gap-3">
        <div className="text-4xl">{song.emoji}</div>
        <div className="flex-1">
          <h3 className="text-lg font-black text-white">{song.title}</h3>
          <p className="text-sm text-white/70">{song.artist}</p>
        </div>
        <div className={`${difficultyColors[song.difficulty]} px-2 py-1 rounded-full text-xs font-bold text-white uppercase`}>
          {song.difficulty}
        </div>
      </div>
      {highScore > 0 && (
        <div className="mt-2 text-sm text-white/80">
          🏆 Best: {highScore.toLocaleString()}
        </div>
      )}
      <div className="mt-2 text-xs text-white/60">
        {song.notes.length} notes • {song.bpm} BPM
      </div>
    </button>
  )
}

function RhythmGameInner() {
  const rewards = useGameContext()
  const [gameState, setGameState] = useState<GameState>('menu')
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [perfectCount, setPerfectCount] = useState(0)
  const [goodCount, setGoodCount] = useState(0)
  const [missCount, setMissCount] = useState(0)
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([])
  const [pressedLanes, setPressedLanes] = useState<Set<Lane>>(new Set())
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [highScores, setHighScores] = useState<Record<string, number>>({})
  const [showConfetti, setShowConfetti] = useState(false)
  
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const startTimeRef = useRef(0)
  const animationFrameRef = useRef<number>(0)
  const currentTimeRef = useRef(0)
  const effectIdRef = useRef(0)

  // Load high scores
  useEffect(() => {
    const saved = localStorage.getItem('rhythm-game-scores')
    if (saved) {
      try {
        setHighScores(JSON.parse(saved))
      } catch {
        // Invalid data
      }
    }
  }, [])

  // Save high score
  const saveHighScore = useCallback((songId: string, newScore: number) => {
    const currentHigh = highScores[songId] || 0
    if (newScore > currentHigh) {
      const updated = { ...highScores, [songId]: newScore }
      setHighScores(updated)
      localStorage.setItem('rhythm-game-scores', JSON.stringify(updated))
    }
  }, [highScores])

  // Start game
  const startGame = useCallback((song: Song) => {
    setSelectedSong(song)
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setPerfectCount(0)
    setGoodCount(0)
    setMissCount(0)
    setHitEffects([])
    setShowConfetti(false)
    
    // Generate notes
    const generatedNotes = generateNotes(song.notes, song.bpm)
    const noteObjects: Note[] = generatedNotes.map((n, i) => ({
      id: i,
      lane: n.lane,
      time: n.time,
      hit: false,
      missed: false,
    }))
    setNotes(noteObjects)
    
    startTimeRef.current = performance.now()
    setGameState('playing')
  }, [])

  // Handle note hit
  const handleLanePress = useCallback((lane: Lane) => {
    if (gameState !== 'playing') return
    
    setPressedLanes(prev => new Set([...prev, lane]))
    setTimeout(() => {
      setPressedLanes(prev => {
        const next = new Set(prev)
        next.delete(lane)
        return next
      })
    }, 100)
    
    const currentTime = currentTimeRef.current
    const hitWindow = { perfect: 50, good: 120 }
    
    // Find closest unhit note in this lane
    let closestNote: Note | null = null
    let closestDiff = Infinity
    
    setNotes(prev => {
      const updated = [...prev]
      
      for (const note of updated) {
        if (note.lane !== lane || note.hit || note.missed) continue
        
        const diff = Math.abs(note.time - currentTime)
        if (diff < closestDiff && diff < hitWindow.good) {
          closestDiff = diff
          closestNote = note
        }
      }
      
      if (closestNote) {
        const noteIndex = updated.findIndex(n => n.id === closestNote!.id)
        updated[noteIndex] = { ...updated[noteIndex], hit: true }
      }
      
      return updated
    })
    
    if (closestNote && closestDiff < hitWindow.good) {
      let result: HitResult
      let points: number
      
      if (closestDiff < hitWindow.perfect) {
        result = 'perfect'
        points = 300
        setPerfectCount(p => p + 1)
      } else {
        result = 'good'
        points = 100
        setGoodCount(g => g + 1)
      }
      
      const newCombo = combo + 1
      setCombo(newCombo)
      setMaxCombo(m => Math.max(m, newCombo))
      
      // Combo multiplier
      const multiplier = 1 + Math.floor(newCombo / 10) * 0.1
      setScore(s => s + Math.floor(points * multiplier))
      
      if (soundEnabled) {
        playNote(lane, result)
        if (newCombo > 0 && newCombo % 10 === 0) {
          playComboSound(newCombo)
        }
      }
      
      // Add hit effect
      const effectId = effectIdRef.current++
      setHitEffects(prev => [...prev, { id: effectId, lane, result, time: Date.now() }])
      setTimeout(() => {
        setHitEffects(prev => prev.filter(e => e.id !== effectId))
      }, 500)
    }
  }, [gameState, combo, soundEnabled])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return
      
      const keyMap: Record<string, Lane> = { d: 0, f: 1, j: 2, k: 3 }
      const lane = keyMap[e.key.toLowerCase()]
      
      if (lane !== undefined && !e.repeat) {
        handleLanePress(lane)
      }
      
      if (e.key === 'Escape') {
        setGameState('paused')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, handleLanePress])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing' || !selectedSong) return
    
    const gameLoop = () => {
      const currentTime = performance.now() - startTimeRef.current
      currentTimeRef.current = currentTime
      
      // Check for missed notes
      setNotes(prev => {
        let missed = false
        const updated = prev.map(note => {
          if (!note.hit && !note.missed && currentTime > note.time + 150) {
            missed = true
            return { ...note, missed: true }
          }
          return note
        })
        
        if (missed) {
          setCombo(0)
          setMissCount(m => m + 1)
          
          // Add miss effect
          const missedNote = updated.find(n => n.missed && !prev.find(p => p.id === n.id && p.missed))
          if (missedNote) {
            const effectId = effectIdRef.current++
            setHitEffects(eff => [...eff, { id: effectId, lane: missedNote.lane, result: 'miss', time: Date.now() }])
            setTimeout(() => {
              setHitEffects(eff => eff.filter(e => e.id !== effectId))
            }, 500)
          }
        }
        
        return updated
      })
      
      // Check if song ended
      if (currentTime > selectedSong.duration) {
        setGameState('results')
        rewards.trackWin()
        saveHighScore(selectedSong.id, score)
        if (perfectCount > notes.length * 0.8) {
          setShowConfetti(true)
        }
        return
      }
      
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
    
    animationFrameRef.current = requestAnimationFrame(gameLoop)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameState, selectedSong, score, perfectCount, notes.length, saveHighScore])

  // Calculate accuracy
  const totalNotes = perfectCount + goodCount + missCount
  const accuracy = totalNotes > 0 ? Math.round(((perfectCount * 100 + goodCount * 50) / (totalNotes * 100)) * 100) : 0

  // Get grade
  const getGrade = () => {
    if (accuracy >= 95 && missCount === 0) return { grade: 'S', color: 'text-yellow-400', emoji: '👑' }
    if (accuracy >= 90) return { grade: 'A', color: 'text-green-400', emoji: '🌟' }
    if (accuracy >= 80) return { grade: 'B', color: 'text-blue-400', emoji: '✨' }
    if (accuracy >= 70) return { grade: 'C', color: 'text-purple-400', emoji: '💫' }
    if (accuracy >= 60) return { grade: 'D', color: 'text-orange-400', emoji: '💪' }
    return { grade: 'F', color: 'text-red-400', emoji: '😅' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex flex-col">
      <Confetti active={showConfetti} />
      
      {/* Header */}
      <div className="flex justify-between items-center p-4 z-20">
        <Link
          href="/games/"
          className="bg-white/90 px-4 py-2 rounded-full font-bold text-purple-700 shadow-lg hover:scale-105 transition-all"
        >
          ← Games
        </Link>
        
        {gameState === 'menu' && (
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="bg-white/90 px-4 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        )}
      </div>

      {/* Menu */}
      {gameState === 'menu' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎵</div>
            <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">
              Rhythm Game
            </h1>
            <p className="text-white/70 mt-2">Hit the notes on beat!</p>
            <p className="text-sm text-white/50 mt-1">Press D F J K or tap</p>
          </div>
          
          <div className="w-full max-w-md space-y-3">
            {SONGS.map(song => (
              <SongCard 
                key={song.id} 
                song={song} 
                onSelect={() => startGame(song)}
                highScore={highScores[song.id] || 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Game */}
      {(gameState === 'playing' || gameState === 'paused') && selectedSong && (
        <div className="flex-1 flex flex-col relative overflow-hidden" ref={gameAreaRef}>
          {/* Score display */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-10 bg-gradient-to-b from-black/50 to-transparent">
            <div>
              <div className="text-2xl font-black text-white">{score.toLocaleString()}</div>
              <div className="text-sm text-white/70">Score</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-black ${combo >= 10 ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>
                {combo}x
              </div>
              <div className="text-sm text-white/70">Combo</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-white">{accuracy}%</div>
              <div className="text-sm text-white/70">Accuracy</div>
            </div>
          </div>

          {/* Game area */}
          <div className="flex-1 relative mt-20">
            {/* Lane backgrounds */}
            <div className="absolute inset-0 flex justify-center gap-2 px-4">
              {[0, 1, 2, 3].map(lane => (
                <div 
                  key={lane}
                  className="w-16 h-full bg-gray-800/30 border-l border-r border-gray-700/30"
                />
              ))}
            </div>
            
            {/* Notes */}
            {notes.map(note => (
              <NoteComponent 
                key={note.id} 
                note={note} 
                currentTime={currentTimeRef.current}
                hitZoneY={gameAreaRef.current?.clientHeight ? gameAreaRef.current.clientHeight - 120 : 400}
              />
            ))}
            
            {/* Hit effects */}
            {hitEffects.map(effect => (
              <HitEffectDisplay key={effect.id} effect={effect} />
            ))}
            
            {/* Hit zone */}
            <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 px-4">
              {[0, 1, 2, 3].map(lane => (
                <div 
                  key={lane}
                  className={`w-16 h-16 rounded-xl border-4 ${
                    pressedLanes.has(lane as Lane)
                      ? `bg-gradient-to-br ${LANE_CONFIG[lane].color} border-white shadow-lg ${LANE_CONFIG[lane].glow}`
                      : 'border-gray-500 bg-gray-800/50'
                  } transition-all duration-75`}
                />
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-2 p-4 bg-gradient-to-t from-black/80 to-transparent">
            {([0, 1, 2, 3] as Lane[]).map(lane => (
              <LaneButton 
                key={lane}
                lane={lane}
                pressed={pressedLanes.has(lane)}
                onPress={() => handleLanePress(lane)}
              />
            ))}
          </div>

          {/* Pause overlay */}
          {gameState === 'paused' && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30">
              <div className="bg-gray-800 rounded-3xl p-8 text-center shadow-2xl">
                <h2 className="text-3xl font-black text-white mb-6">Paused</h2>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setGameState('playing')}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
                  >
                    ▶ Resume
                  </button>
                  <button
                    onClick={() => setGameState('menu')}
                    className="px-8 py-3 bg-gray-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
                  >
                    🏠 Menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {gameState === 'results' && selectedSong && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-2 border-purple-500/50">
            {/* Grade */}
            <div className="mb-4">
              <span className={`text-8xl font-black ${getGrade().color}`}>
                {getGrade().grade}
              </span>
              <span className="text-4xl ml-2">{getGrade().emoji}</span>
            </div>
            
            {/* Song info */}
            <div className="mb-6">
              <div className="text-3xl mb-1">{selectedSong.emoji}</div>
              <h2 className="text-xl font-bold text-white">{selectedSong.title}</h2>
              <p className="text-sm text-white/60">{selectedSong.artist}</p>
            </div>
            
            {/* Score */}
            <div className="text-5xl font-black text-white mb-2">
              {score.toLocaleString()}
            </div>
            {score > (highScores[selectedSong.id] || 0) && score > 0 && (
              <div className="text-yellow-400 font-bold animate-pulse mb-4">
                🎉 NEW HIGH SCORE! 🎉
              </div>
            )}
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 my-6">
              <div className="bg-yellow-500/20 rounded-xl p-3">
                <div className="text-2xl font-bold text-yellow-400">{perfectCount}</div>
                <div className="text-xs text-yellow-300">Perfect</div>
              </div>
              <div className="bg-green-500/20 rounded-xl p-3">
                <div className="text-2xl font-bold text-green-400">{goodCount}</div>
                <div className="text-xs text-green-300">Good</div>
              </div>
              <div className="bg-red-500/20 rounded-xl p-3">
                <div className="text-2xl font-bold text-red-400">{missCount}</div>
                <div className="text-xs text-red-300">Miss</div>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">{maxCombo}x</div>
                <div className="text-xs text-white/60">Max Combo</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-cyan-400">{accuracy}%</div>
                <div className="text-xs text-white/60">Accuracy</div>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => startGame(selectedSong)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-full shadow-lg hover:scale-105 transition-all"
              >
                🔄 Play Again
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="px-6 py-3 bg-gray-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all"
              >
                🎵 Song Select
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decorations */}
      <div className="fixed bottom-8 left-8 text-4xl animate-bounce opacity-30 pointer-events-none">🎵</div>
      <div className="fixed bottom-12 right-8 text-3xl animate-bounce opacity-30 pointer-events-none" style={{ animationDelay: '0.3s' }}>🎶</div>
      <div className="fixed top-24 right-16 text-2xl animate-bounce opacity-20 pointer-events-none" style={{ animationDelay: '0.6s' }}>✨</div>

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
        @keyframes hit-effect {
          0% {
            transform: translateX(-50%) translateY(0) scale(0.5);
            opacity: 0;
          }
          20% {
            transform: translateX(-50%) translateY(-10px) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translateX(-50%) translateY(-40px) scale(1);
            opacity: 0;
          }
        }
        .animate-hit-effect {
          animation: hit-effect 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}


// ============================================
// Game Wrapper with XP + Coins tracking
// ============================================
export default function RhythmGame() {
  return (
    <GameWrapper gameName="Rhythm Game" gameId="rhythm" emoji={"🎶"}>
      <RhythmGameInner />
    </GameWrapper>
  )
}

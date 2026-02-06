'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================
// GAMING ISLAND - 3D EXPLORABLE WORLD
// ============================================

// Island buildings that link to games
const buildings = [
  { 
    id: 'arcade', 
    name: 'Pixel Arcade', 
    emoji: '🎮', 
    x: 45, y: 35, 
    width: 12, height: 16,
    color: 'from-purple-500 to-pink-500',
    games: ['/games/breakout', '/games/invaders', '/games/pong'],
    description: 'Classic arcade games!'
  },
  { 
    id: 'library', 
    name: 'Story Tower', 
    emoji: '📚', 
    x: 70, y: 45, 
    width: 10, height: 20,
    color: 'from-amber-600 to-orange-500',
    games: ['/games/word-puzzle', '/games/alphabet', '/games/typing'],
    description: 'Words & Stories'
  },
  { 
    id: 'lab', 
    name: 'Brain Lab', 
    emoji: '🧪', 
    x: 25, y: 50, 
    width: 11, height: 14,
    color: 'from-green-500 to-emerald-400',
    games: ['/games/math', '/games/counting', '/games/memory'],
    description: 'Math & Logic puzzles'
  },
  { 
    id: 'studio', 
    name: 'Art Studio', 
    emoji: '🎨', 
    x: 60, y: 65, 
    width: 10, height: 12,
    color: 'from-pink-500 to-rose-400',
    games: ['/games/draw', '/games/coloring', '/games/skin-creator'],
    description: 'Create & Color'
  },
  { 
    id: 'theater', 
    name: 'Music Hall', 
    emoji: '🎵', 
    x: 35, y: 70, 
    width: 12, height: 14,
    color: 'from-blue-500 to-cyan-400',
    games: ['/games/music', '/games/simon', '/games/rhythm'],
    description: 'Rhythm & Sound'
  },
  { 
    id: 'arena', 
    name: 'Challenge Arena', 
    emoji: '⚡', 
    x: 80, y: 30, 
    width: 10, height: 12,
    color: 'from-yellow-500 to-orange-400',
    games: ['/games/reaction', '/games/whack', '/games/catch'],
    description: 'Quick reflexes!'
  },
  { 
    id: 'cafe', 
    name: "Chef's Kitchen", 
    emoji: '👨‍🍳', 
    x: 15, y: 35, 
    width: 9, height: 11,
    color: 'from-red-500 to-orange-400',
    games: ['/games/kids-chef-studio', '/games/cooking'],
    description: 'Cooking games'
  },
  { 
    id: 'puzzle', 
    name: 'Puzzle Palace', 
    emoji: '🧩', 
    x: 50, y: 55, 
    width: 11, height: 15,
    color: 'from-indigo-500 to-purple-400',
    games: ['/games/puzzle', '/games/matching', '/games/spot-difference'],
    description: 'Brain teasers'
  },
]

// NPCs that walk around
const npcTypes = [
  { emoji: '🧒', name: 'Explorer Kid' },
  { emoji: '🧒🏻', name: 'Curious Charlie' },
  { emoji: '👧', name: 'Adventure Amy' },
  { emoji: '👧🏽', name: 'Smart Sara' },
  { emoji: '🐱', name: 'Whiskers' },
  { emoji: '🐶', name: 'Buddy' },
  { emoji: '🦊', name: 'Foxy' },
  { emoji: '🐰', name: 'Hoppy' },
  { emoji: '🦉', name: 'Wise Owl' },
  { emoji: '🐻', name: 'Bruno Bear' },
]

// Collectibles hidden around the island
const collectibleTypes = [
  { emoji: '⭐', name: 'Star', points: 10 },
  { emoji: '💎', name: 'Gem', points: 25 },
  { emoji: '🍎', name: 'Apple', points: 5 },
  { emoji: '🍪', name: 'Cookie', points: 5 },
  { emoji: '🎁', name: 'Gift Box', points: 50 },
  { emoji: '🏆', name: 'Trophy', points: 100 },
  { emoji: '🌟', name: 'Super Star', points: 30 },
  { emoji: '💰', name: 'Treasure', points: 75 },
]

// Trees and decorations
const decorations = [
  { emoji: '🌴', x: 10, y: 25 },
  { emoji: '🌳', x: 85, y: 60 },
  { emoji: '🌲', x: 5, y: 65 },
  { emoji: '🌸', x: 90, y: 75 },
  { emoji: '🌺', x: 20, y: 80 },
  { emoji: '🪨', x: 75, y: 80 },
  { emoji: '🌻', x: 30, y: 25 },
  { emoji: '🍄', x: 65, y: 25 },
  { emoji: '🌴', x: 88, y: 45 },
  { emoji: '🌳', x: 8, y: 55 },
  { emoji: '⛲', x: 50, y: 40 }, // Fountain in center
  { emoji: '🏔️', x: 50, y: 15 }, // Mountain in back
  { emoji: '🏖️', x: 92, y: 90 }, // Beach
  { emoji: '🌊', x: 5, y: 90 },
  { emoji: '⛵', x: 15, y: 95 },
]

// Weather types
type Weather = 'sunny' | 'cloudy' | 'rain' | 'snow' | 'storm'

const weatherEffects: Record<Weather, { bg: string; particles: string; icon: string }> = {
  sunny: { bg: 'from-sky-400 via-blue-300 to-cyan-200', particles: '', icon: '☀️' },
  cloudy: { bg: 'from-slate-400 via-gray-300 to-slate-200', particles: '☁️', icon: '⛅' },
  rain: { bg: 'from-slate-600 via-gray-500 to-slate-400', particles: '🌧️', icon: '🌧️' },
  snow: { bg: 'from-slate-300 via-blue-100 to-white', particles: '❄️', icon: '🌨️' },
  storm: { bg: 'from-slate-800 via-gray-700 to-purple-900', particles: '⚡', icon: '⛈️' },
}

// Generate initial collectibles
const generateCollectibles = () => {
  const collectibles = []
  for (let i = 0; i < 20; i++) {
    const type = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)]
    collectibles.push({
      id: `collectible-${i}`,
      ...type,
      x: 10 + Math.random() * 80,
      y: 20 + Math.random() * 70,
      collected: false,
    })
  }
  return collectibles
}

// Generate NPCs
const generateNPCs = () => {
  return npcTypes.map((npc, i) => ({
    ...npc,
    id: `npc-${i}`,
    x: 20 + Math.random() * 60,
    y: 30 + Math.random() * 50,
    targetX: 20 + Math.random() * 60,
    targetY: 30 + Math.random() * 50,
    speed: 0.3 + Math.random() * 0.4,
    direction: Math.random() > 0.5 ? 1 : -1,
  }))
}

export default function ExploreIsland() {
  // Player state
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 50 })
  const [playerDirection, setPlayerDirection] = useState<'left' | 'right'>('right')
  const [isWalking, setIsWalking] = useState(false)
  
  // World state
  const [collectibles, setCollectibles] = useState(generateCollectibles)
  const [npcs, setNpcs] = useState(generateNPCs)
  const [score, setScore] = useState(0)
  const [weather, setWeather] = useState<Weather>('sunny')
  const [timeOfDay, setTimeOfDay] = useState(12) // 0-24 hours
  const [selectedBuilding, setSelectedBuilding] = useState<typeof buildings[0] | null>(null)
  const [showMiniMap, setShowMiniMap] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  
  // Touch controls
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const gameRef = useRef<HTMLDivElement>(null)
  
  // Real-time day/night cycle (1 real minute = 1 game hour)
  useEffect(() => {
    const now = new Date()
    setTimeOfDay(now.getHours() + now.getMinutes() / 60)
    
    const interval = setInterval(() => {
      setTimeOfDay(prev => (prev + 1/60) % 24) // Advance 1 minute per second for demo
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Weather changes randomly
  useEffect(() => {
    const changeWeather = () => {
      const weathers: Weather[] = ['sunny', 'sunny', 'sunny', 'cloudy', 'rain', 'snow', 'storm']
      setWeather(weathers[Math.floor(Math.random() * weathers.length)])
    }
    
    const interval = setInterval(changeWeather, 30000) // Change every 30 seconds
    return () => clearInterval(interval)
  }, [])
  
  // NPC movement
  useEffect(() => {
    const moveNPCs = () => {
      setNpcs(prev => prev.map(npc => {
        let { x, y, targetX, targetY, speed, direction } = npc
        
        // Move toward target
        const dx = targetX - x
        const dy = targetY - y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist < 1) {
          // Pick new target
          targetX = 15 + Math.random() * 70
          targetY = 25 + Math.random() * 60
        } else {
          x += (dx / dist) * speed
          y += (dy / dist) * speed
          direction = dx > 0 ? 1 : -1
        }
        
        return { ...npc, x, y, targetX, targetY, direction }
      }))
    }
    
    const interval = setInterval(moveNPCs, 50)
    return () => clearInterval(interval)
  }, [])
  
  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const speed = 2
    setIsWalking(true)
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        setPlayerPos(prev => ({ ...prev, y: Math.max(15, prev.y - speed) }))
        break
      case 'ArrowDown':
      case 's':
      case 'S':
        setPlayerPos(prev => ({ ...prev, y: Math.min(90, prev.y + speed) }))
        break
      case 'ArrowLeft':
      case 'a':
      case 'A':
        setPlayerPos(prev => ({ ...prev, x: Math.max(5, prev.x - speed) }))
        setPlayerDirection('left')
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        setPlayerPos(prev => ({ ...prev, x: Math.min(95, prev.x + speed) }))
        setPlayerDirection('right')
        break
      case 'Enter':
      case ' ':
        // Interact with nearby building
        checkBuildingInteraction()
        break
    }
  }, [])
  
  const handleKeyUp = useCallback(() => {
    setIsWalking(false)
  }, [])
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])
  
  // Touch/swipe controls
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return
    
    const dx = e.touches[0].clientX - touchStart.current.x
    const dy = e.touches[0].clientY - touchStart.current.y
    const speed = 0.1
    
    setIsWalking(true)
    setPlayerPos(prev => ({
      x: Math.max(5, Math.min(95, prev.x + dx * speed)),
      y: Math.max(15, Math.min(90, prev.y + dy * speed))
    }))
    
    if (Math.abs(dx) > 5) {
      setPlayerDirection(dx > 0 ? 'right' : 'left')
    }
    
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
  }
  
  const handleTouchEnd = () => {
    touchStart.current = null
    setIsWalking(false)
  }
  
  // Check for collectible collection
  useEffect(() => {
    setCollectibles(prev => {
      let collected = false
      const updated = prev.map(c => {
        if (c.collected) return c
        const dx = c.x - playerPos.x
        const dy = c.y - playerPos.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 5) {
          collected = true
          setScore(s => s + c.points)
          setMessage(`+${c.points} ${c.emoji} ${c.name}!`)
          setTimeout(() => setMessage(null), 1500)
          return { ...c, collected: true }
        }
        return c
      })
      return collected ? updated : prev
    })
  }, [playerPos])
  
  // Check building interaction
  const checkBuildingInteraction = () => {
    for (const building of buildings) {
      const dx = building.x + building.width/2 - playerPos.x
      const dy = building.y + building.height/2 - playerPos.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 12) {
        setSelectedBuilding(building)
        return
      }
    }
  }
  
  // Check NPC interaction
  const checkNPCInteraction = (npc: typeof npcs[0]) => {
    const greetings = [
      `${npc.emoji} "${npc.name}: Hi there, explorer!"`,
      `${npc.emoji} "${npc.name}: Have you found any treasures?"`,
      `${npc.emoji} "${npc.name}: What a beautiful day on the island!"`,
      `${npc.emoji} "${npc.name}: Try the Puzzle Palace, it's fun!"`,
      `${npc.emoji} "${npc.name}: Keep exploring, adventurer!"`,
    ]
    setMessage(greetings[Math.floor(Math.random() * greetings.length)])
    setTimeout(() => setMessage(null), 2500)
  }
  
  // Calculate sky gradient based on time
  const getSkyGradient = () => {
    if (weather !== 'sunny' && weather !== 'cloudy') {
      return weatherEffects[weather].bg
    }
    
    if (timeOfDay < 5 || timeOfDay >= 21) {
      return 'from-slate-900 via-indigo-900 to-purple-900' // Night
    } else if (timeOfDay < 7) {
      return 'from-orange-400 via-pink-400 to-purple-500' // Sunrise
    } else if (timeOfDay < 18) {
      return weather === 'cloudy' 
        ? 'from-slate-400 via-gray-300 to-slate-200'
        : 'from-sky-400 via-blue-300 to-cyan-200' // Day
    } else {
      return 'from-orange-500 via-red-400 to-purple-600' // Sunset
    }
  }
  
  const isNight = timeOfDay < 6 || timeOfDay >= 20
  
  return (
    <div 
      ref={gameRef}
      className="min-h-screen relative overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      {/* Sky with day/night cycle */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b ${getSkyGradient()} transition-all duration-1000`}
      >
        {/* Sun/Moon */}
        <motion.div
          className="absolute text-6xl"
          animate={{
            x: `${(timeOfDay / 24) * 100}vw`,
            y: `${Math.sin((timeOfDay / 24) * Math.PI) * -30 + 10}vh`,
          }}
          transition={{ duration: 0.5 }}
        >
          {isNight ? '🌙' : '☀️'}
        </motion.div>
        
        {/* Stars at night */}
        {isNight && (
          <div className="absolute inset-0">
            {Array.from({ length: 50 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute text-white text-xs"
                style={{
                  left: `${(i * 17) % 100}%`,
                  top: `${(i * 13) % 40}%`,
                }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1 + (i % 3), repeat: Infinity }}
              >
                ✦
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Weather particles */}
        {weather === 'rain' && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 100 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute text-blue-300 text-sm opacity-60"
                style={{ left: `${(i * 1.1) % 100}%` }}
                initial={{ top: '-5%' }}
                animate={{ top: '105%' }}
                transition={{
                  duration: 0.5 + (i % 3) * 0.2,
                  repeat: Infinity,
                  delay: (i * 0.05) % 1,
                }}
              >
                💧
              </motion.div>
            ))}
          </div>
        )}
        
        {weather === 'snow' && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 60 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute text-white"
                style={{ 
                  left: `${(i * 1.7) % 100}%`,
                  fontSize: `${8 + (i % 8)}px`
                }}
                initial={{ top: '-5%', rotate: 0 }}
                animate={{ 
                  top: '105%', 
                  rotate: 360,
                  x: [0, 20, -20, 0]
                }}
                transition={{
                  duration: 3 + (i % 4),
                  repeat: Infinity,
                  delay: (i * 0.1) % 3,
                }}
              >
                ❄️
              </motion.div>
            ))}
          </div>
        )}
        
        {weather === 'storm' && (
          <>
            {Array.from({ length: 80 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute text-blue-400 text-sm opacity-70"
                style={{ left: `${(i * 1.3) % 100}%` }}
                initial={{ top: '-5%' }}
                animate={{ top: '105%' }}
                transition={{
                  duration: 0.3 + (i % 2) * 0.1,
                  repeat: Infinity,
                  delay: (i * 0.03) % 0.5,
                }}
              >
                💧
              </motion.div>
            ))}
            {/* Lightning flashes */}
            <motion.div
              className="absolute inset-0 bg-white pointer-events-none"
              animate={{ opacity: [0, 0, 0, 0.5, 0, 0.3, 0, 0, 0, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
          </>
        )}
      </div>
      
      {/* ISOMETRIC ISLAND WORLD */}
      <div 
        className="absolute inset-0"
        style={{
          perspective: '1500px',
          perspectiveOrigin: '50% 30%',
        }}
      >
        {/* Ground plane with isometric transform */}
        <div
          className="absolute w-full h-full"
          style={{
            transform: 'rotateX(55deg) rotateZ(-45deg) scale(0.8)',
            transformOrigin: '50% 50%',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Island base */}
          <div 
            className="absolute rounded-full"
            style={{
              width: '140%',
              height: '140%',
              left: '-20%',
              top: '-20%',
              background: isNight 
                ? 'linear-gradient(135deg, #1a472a 0%, #0d331f 50%, #0a2818 100%)'
                : 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)',
              boxShadow: isNight 
                ? '0 30px 60px rgba(0,0,0,0.8), inset 0 -10px 40px rgba(0,0,0,0.5)'
                : '0 30px 60px rgba(0,100,0,0.4), inset 0 -10px 40px rgba(0,100,0,0.3)',
            }}
          >
            {/* Grass texture */}
            <div 
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 20%),
                  radial-gradient(circle at 70% 60%, rgba(255,255,255,0.1) 0%, transparent 15%),
                  radial-gradient(circle at 40% 80%, rgba(0,0,0,0.1) 0%, transparent 25%)
                `,
              }}
            />
            
            {/* Paths */}
            <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100">
              <path 
                d="M50 50 L30 35 L15 40" 
                fill="none" 
                stroke={isNight ? '#654321' : '#d4a574'} 
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path 
                d="M50 50 L70 45 L80 30" 
                fill="none" 
                stroke={isNight ? '#654321' : '#d4a574'}  
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path 
                d="M50 50 L25 55 L20 70" 
                fill="none" 
                stroke={isNight ? '#654321' : '#d4a574'}  
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path 
                d="M50 50 L60 65 L55 75" 
                fill="none" 
                stroke={isNight ? '#654321' : '#d4a574'}  
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Central plaza */}
              <circle 
                cx="50" cy="50" r="8" 
                fill={isNight ? '#4a3728' : '#c9a67a'} 
                opacity="0.6"
              />
            </svg>
          </div>
        </div>
        
        {/* WORLD OBJECTS (rendered in 2D overlay for clarity) */}
        <div className="absolute inset-0">
          {/* Decorations (trees, rocks, etc) */}
          {decorations.map((dec, i) => (
            <motion.div
              key={i}
              className="absolute transform -translate-x-1/2"
              style={{
                left: `${dec.x}%`,
                top: `${dec.y}%`,
                fontSize: '2rem',
                zIndex: Math.floor(dec.y),
                filter: isNight ? 'brightness(0.6)' : 'none',
              }}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2 + i % 2, repeat: Infinity }}
            >
              {dec.emoji}
            </motion.div>
          ))}
          
          {/* Buildings */}
          {buildings.map(building => {
            const isNear = Math.sqrt(
              Math.pow(building.x + building.width/2 - playerPos.x, 2) +
              Math.pow(building.y + building.height/2 - playerPos.y, 2)
            ) < 12
            
            return (
              <motion.div
                key={building.id}
                className={`absolute cursor-pointer transform -translate-x-1/2`}
                style={{
                  left: `${building.x}%`,
                  top: `${building.y}%`,
                  zIndex: Math.floor(building.y) + 10,
                }}
                whileHover={{ scale: 1.1 }}
                onClick={() => setSelectedBuilding(building)}
              >
                {/* Building structure */}
                <div 
                  className={`relative bg-gradient-to-b ${building.color} rounded-lg shadow-2xl p-3
                    ${isNear ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''}
                    transition-all duration-300`}
                  style={{
                    width: `${building.width * 4}px`,
                    height: `${building.height * 4}px`,
                    transform: 'perspective(200px) rotateX(-5deg)',
                    filter: isNight ? 'brightness(0.7)' : 'none',
                  }}
                >
                  {/* Building emoji */}
                  <div className="text-4xl text-center mb-1">{building.emoji}</div>
                  <div className="text-xs text-white text-center font-bold truncate">
                    {building.name}
                  </div>
                  
                  {/* Glow for nearby buildings */}
                  {isNear && (
                    <motion.div
                      className="absolute -inset-2 bg-yellow-400 rounded-lg -z-10"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                  
                  {/* Lights at night */}
                  {isNight && (
                    <motion.div
                      className="absolute inset-0 bg-yellow-300 rounded-lg opacity-20"
                      animate={{ opacity: [0.15, 0.25, 0.15] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                
                {/* Door hint when near */}
                {isNear && (
                  <motion.div
                    className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 
                      bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Press ENTER to enter 🚪
                  </motion.div>
                )}
              </motion.div>
            )
          })}
          
          {/* Collectibles */}
          {collectibles.filter(c => !c.collected).map(collectible => (
            <motion.div
              key={collectible.id}
              className="absolute transform -translate-x-1/2 cursor-pointer"
              style={{
                left: `${collectible.x}%`,
                top: `${collectible.y}%`,
                fontSize: '1.5rem',
                zIndex: Math.floor(collectible.y),
                filter: isNight ? 'brightness(1.2)' : 'none',
              }}
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              whileHover={{ scale: 1.5 }}
            >
              {collectible.emoji}
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full -z-10"
                style={{
                  background: 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, transparent 70%)',
                  width: '200%',
                  height: '200%',
                  left: '-50%',
                  top: '-50%',
                }}
                animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          ))}
          
          {/* NPCs */}
          {npcs.map(npc => (
            <motion.div
              key={npc.id}
              className="absolute transform -translate-x-1/2 cursor-pointer"
              style={{
                left: `${npc.x}%`,
                top: `${npc.y}%`,
                fontSize: '2rem',
                zIndex: Math.floor(npc.y) + 5,
                transform: `translateX(-50%) scaleX(${npc.direction})`,
                filter: isNight ? 'brightness(0.8)' : 'none',
              }}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              onClick={() => checkNPCInteraction(npc)}
              whileHover={{ scale: 1.2 }}
            >
              {npc.emoji}
              {/* NPC shadow */}
              <div 
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 
                  w-6 h-2 bg-black/30 rounded-full"
              />
            </motion.div>
          ))}
          
          {/* PLAYER */}
          <motion.div
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${playerPos.x}%`,
              top: `${playerPos.y}%`,
              zIndex: 1000,
            }}
            animate={isWalking ? { y: [0, -5, 0] } : {}}
            transition={{ duration: 0.2, repeat: isWalking ? Infinity : 0 }}
          >
            {/* Player character */}
            <div 
              className="text-4xl"
              style={{ transform: `scaleX(${playerDirection === 'left' ? -1 : 1})` }}
            >
              🧒
            </div>
            {/* Player shadow */}
            <div 
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 
                w-8 h-3 bg-black/40 rounded-full blur-sm"
            />
            {/* Player glow ring */}
            <motion.div
              className="absolute -inset-4 rounded-full border-2 border-yellow-400"
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </div>
      
      {/* UI OVERLAY */}
      
      {/* Top bar: Score, Time, Weather */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-50">
        {/* Score */}
        <motion.div 
          className="bg-black/60 backdrop-blur-md rounded-xl px-4 py-2 text-white"
          initial={{ x: -100 }}
          animate={{ x: 0 }}
        >
          <div className="text-2xl font-bold">⭐ {score}</div>
          <div className="text-xs opacity-70">Points</div>
        </motion.div>
        
        {/* Time & Weather */}
        <motion.div 
          className="bg-black/60 backdrop-blur-md rounded-xl px-4 py-2 text-white text-center"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
        >
          <div className="text-xl">
            {weatherEffects[weather].icon} {Math.floor(timeOfDay).toString().padStart(2, '0')}:
            {Math.floor((timeOfDay % 1) * 60).toString().padStart(2, '0')}
          </div>
          <div className="text-xs opacity-70 capitalize">{weather}</div>
        </motion.div>
        
        {/* Controls hint */}
        <motion.div 
          className="bg-black/60 backdrop-blur-md rounded-xl px-4 py-2 text-white text-right"
          initial={{ x: 100 }}
          animate={{ x: 0 }}
        >
          <div className="text-sm">⬆️⬇️⬅️➡️ Move</div>
          <div className="text-xs opacity-70">ENTER to interact</div>
        </motion.div>
      </div>
      
      {/* Message popup */}
      <AnimatePresence>
        {message && (
          <motion.div
            className="absolute top-1/3 left-1/2 transform -translate-x-1/2 
              bg-black/80 backdrop-blur-md rounded-2xl px-6 py-4 text-white text-xl
              z-50 text-center"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mini-map */}
      {showMiniMap && (
        <motion.div
          className="absolute bottom-4 right-4 w-40 h-40 bg-black/70 backdrop-blur-md 
            rounded-xl overflow-hidden border-2 border-white/20 z-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {/* Map background */}
          <div className="absolute inset-2 bg-green-800 rounded-lg">
            {/* Buildings on map */}
            {buildings.map(b => (
              <div
                key={b.id}
                className={`absolute w-2 h-2 rounded-sm bg-gradient-to-br ${b.color}`}
                style={{
                  left: `${b.x - 5}%`,
                  top: `${b.y - 15}%`,
                }}
              />
            ))}
            
            {/* Collectibles on map */}
            {collectibles.filter(c => !c.collected).map(c => (
              <div
                key={c.id}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                style={{
                  left: `${c.x - 5}%`,
                  top: `${c.y - 15}%`,
                }}
              />
            ))}
            
            {/* Player on map */}
            <motion.div
              className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white"
              style={{
                left: `${playerPos.x - 6}%`,
                top: `${playerPos.y - 16}%`,
              }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
          
          {/* Toggle button */}
          <button
            className="absolute top-1 right-1 text-xs bg-white/20 rounded px-1"
            onClick={() => setShowMiniMap(false)}
          >
            ✕
          </button>
        </motion.div>
      )}
      
      {/* Show mini-map button when hidden */}
      {!showMiniMap && (
        <button
          className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-2 rounded-xl z-50"
          onClick={() => setShowMiniMap(true)}
        >
          🗺️ Map
        </button>
      )}
      
      {/* Mobile D-pad controls */}
      <div className="absolute bottom-4 left-4 md:hidden z-50">
        <div className="grid grid-cols-3 gap-1">
          <div />
          <button
            className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg text-2xl active:bg-white/40"
            onTouchStart={() => {
              setIsWalking(true)
              setPlayerPos(p => ({ ...p, y: Math.max(15, p.y - 3) }))
            }}
            onTouchEnd={() => setIsWalking(false)}
          >
            ⬆️
          </button>
          <div />
          <button
            className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg text-2xl active:bg-white/40"
            onTouchStart={() => {
              setIsWalking(true)
              setPlayerDirection('left')
              setPlayerPos(p => ({ ...p, x: Math.max(5, p.x - 3) }))
            }}
            onTouchEnd={() => setIsWalking(false)}
          >
            ⬅️
          </button>
          <button
            className="w-12 h-12 bg-yellow-500/60 backdrop-blur rounded-lg text-xl active:bg-yellow-500"
            onClick={checkBuildingInteraction}
          >
            🚪
          </button>
          <button
            className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg text-2xl active:bg-white/40"
            onTouchStart={() => {
              setIsWalking(true)
              setPlayerDirection('right')
              setPlayerPos(p => ({ ...p, x: Math.min(95, p.x + 3) }))
            }}
            onTouchEnd={() => setIsWalking(false)}
          >
            ➡️
          </button>
          <div />
          <button
            className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg text-2xl active:bg-white/40"
            onTouchStart={() => {
              setIsWalking(true)
              setPlayerPos(p => ({ ...p, y: Math.min(90, p.y + 3) }))
            }}
            onTouchEnd={() => setIsWalking(false)}
          >
            ⬇️
          </button>
          <div />
        </div>
      </div>
      
      {/* Building modal */}
      <AnimatePresence>
        {selectedBuilding && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBuilding(null)}
          >
            <motion.div
              className={`bg-gradient-to-br ${selectedBuilding.color} rounded-3xl p-6 max-w-md w-full shadow-2xl`}
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 100 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{selectedBuilding.emoji}</div>
                <h2 className="text-2xl font-bold text-white">{selectedBuilding.name}</h2>
                <p className="text-white/80">{selectedBuilding.description}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-white/70 text-sm text-center mb-3">Choose a game to play:</p>
                {selectedBuilding.games.map((game, i) => (
                  <Link
                    key={i}
                    href={game}
                    className="block w-full bg-white/20 hover:bg-white/40 rounded-xl py-3 px-4
                      text-white text-center font-semibold transition-all"
                  >
                    🎮 {game.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Link>
                ))}
              </div>
              
              <button
                className="w-full mt-4 bg-black/30 hover:bg-black/50 rounded-xl py-3 text-white"
                onClick={() => setSelectedBuilding(null)}
              >
                ← Back to Island
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Back to home link */}
      <Link
        href="/games/"
        className="absolute top-4 left-1/2 transform -translate-x-1/2 
          bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full px-4 py-2
          text-white text-sm z-50 transition-all"
      >
        ← Back to Games Hub
      </Link>
    </div>
  )
}

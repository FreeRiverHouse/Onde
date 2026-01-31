'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  usePetCollection, 
  ALL_PETS, 
  RARITY_CONFIG, 
  getXpForLevel,
  PetDefinition
} from '@/hooks/usePetCollection'

// Pet card in the gallery
function PetCard({ 
  pet, 
  definition, 
  isOwned,
  isCompanion,
  onSelect 
}: { 
  pet?: ReturnType<typeof usePetCollection>['pets'][0]
  definition: PetDefinition
  isOwned: boolean
  isCompanion: boolean
  onSelect: () => void
}) {
  const rarity = RARITY_CONFIG[definition.rarity]
  
  return (
    <motion.button
      whileHover={{ scale: isOwned ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      disabled={!isOwned}
      className={`relative p-4 rounded-2xl text-left transition-all w-full ${
        isOwned 
          ? `bg-gradient-to-br ${rarity.gradient} ${rarity.border} border-2 shadow-lg hover:shadow-xl cursor-pointer`
          : 'bg-gray-100/50 border-2 border-gray-200 opacity-60 cursor-not-allowed'
      }`}
    >
      {/* Companion badge */}
      {isCompanion && (
        <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 rounded-full px-2 py-0.5 text-xs font-bold shadow-md flex items-center gap-1">
          <span>⭐</span> Companion
        </div>
      )}
      
      {/* Rarity badge */}
      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold ${rarity.bg} ${rarity.color}`}>
        {rarity.label}
      </div>
      
      {/* Pet emoji */}
      <div className={`text-5xl mb-3 mt-4 text-center ${!isOwned && 'grayscale'}`}>
        {isOwned ? definition.emoji : '❓'}
      </div>
      
      {/* Pet info */}
      <div className="text-center">
        <h3 className={`font-bold ${isOwned ? 'text-gray-800' : 'text-gray-400'}`}>
          {isOwned ? (pet?.nickname || definition.name) : '???'}
        </h3>
        
        {isOwned && pet && (
          <div className="mt-2 space-y-2">
            {/* Level */}
            <div className="flex items-center justify-center gap-1 text-sm">
              <span className="text-amber-600 font-medium">Lv.{pet.level}</span>
            </div>
            
            {/* XP Bar */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                style={{ width: `${pet.xpProgress}%` }}
              />
            </div>
            
            {/* Happiness */}
            <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
              <span>{pet.currentHappiness >= 70 ? '😊' : pet.currentHappiness >= 40 ? '😐' : '😢'}</span>
              <span>{pet.currentHappiness}%</span>
            </div>
          </div>
        )}
        
        {!isOwned && (
          <p className="text-xs text-gray-400 mt-2">{definition.unlockRequirement}</p>
        )}
      </div>
    </motion.button>
  )
}

// Pet interaction modal
function PetModal({ 
  pet, 
  definition, 
  isCompanion,
  onClose, 
  onFeed, 
  onPlay, 
  onSetCompanion,
  onRename
}: { 
  pet: ReturnType<typeof usePetCollection>['pets'][0]
  definition: PetDefinition
  isCompanion: boolean
  onClose: () => void
  onFeed: () => { success: boolean; xpGained: number; leveledUp: boolean }
  onPlay: () => { success: boolean; xpGained: number; leveledUp: boolean }
  onSetCompanion: () => void
  onRename: (name: string) => void
}) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [nameInput, setNameInput] = useState(pet.nickname)
  const [feedResult, setFeedResult] = useState<{ xp: number; leveledUp: boolean } | null>(null)
  const [playResult, setPlayResult] = useState<{ xp: number; leveledUp: boolean } | null>(null)
  const [animation, setAnimation] = useState<'idle' | 'eating' | 'playing' | 'happy'>('idle')
  
  const rarity = RARITY_CONFIG[definition.rarity]
  
  const handleFeed = () => {
    const result = onFeed()
    if (result.success) {
      setAnimation('eating')
      setFeedResult({ xp: result.xpGained, leveledUp: result.leveledUp })
      setTimeout(() => {
        setAnimation('happy')
        setTimeout(() => setAnimation('idle'), 1000)
      }, 1500)
      setTimeout(() => setFeedResult(null), 3000)
    }
  }
  
  const handlePlay = () => {
    const result = onPlay()
    if (result.success) {
      setAnimation('playing')
      setPlayResult({ xp: result.xpGained, leveledUp: result.leveledUp })
      setTimeout(() => {
        setAnimation('happy')
        setTimeout(() => setAnimation('idle'), 1000)
      }, 1500)
      setTimeout(() => setPlayResult(null), 3000)
    }
  }
  
  const handleRename = () => {
    onRename(nameInput)
    setIsRenaming(false)
  }
  
  // Can feed if 30 minutes passed
  const canFeed = () => {
    const lastFed = new Date(pet.lastFed)
    return (Date.now() - lastFed.getTime()) >= 30 * 60 * 1000
  }
  
  // Can play if 15 minutes passed
  const canPlay = () => {
    const lastPlayed = new Date(pet.lastPlayed)
    return (Date.now() - lastPlayed.getTime()) >= 15 * 60 * 1000
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`bg-gradient-to-br ${rarity.gradient} rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 ${rarity.border}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md"
          >
            ✕
          </button>
          
          {/* Pet display */}
          <div className="text-center">
            <motion.div 
              className="text-8xl mb-4"
              animate={{
                scale: animation === 'eating' ? [1, 1.1, 1] : animation === 'playing' ? [1, 1.2, 0.9, 1.1, 1] : animation === 'happy' ? [1, 1.15, 1] : 1,
                rotate: animation === 'playing' ? [0, -10, 10, -10, 0] : 0
              }}
              transition={{ duration: animation === 'playing' ? 0.5 : 0.3, repeat: animation !== 'idle' ? 3 : 0 }}
            >
              {animation === 'eating' ? '😋' : animation === 'happy' ? '🥰' : definition.emoji}
            </motion.div>
            
            {/* XP notifications */}
            <AnimatePresence>
              {feedResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full font-bold"
                >
                  +{feedResult.xp} XP! {feedResult.leveledUp && '🎉 LEVEL UP!'}
                </motion.div>
              )}
              {playResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-24 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full font-bold"
                >
                  +{playResult.xp} XP! {playResult.leveledUp && '🎉 LEVEL UP!'}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Name */}
            {isRenaming ? (
              <div className="flex gap-2 justify-center items-center">
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  maxLength={20}
                  className="px-3 py-1 rounded-lg border-2 border-gray-300 focus:border-teal-500 outline-none text-center"
                  autoFocus
                />
                <button onClick={handleRename} className="text-green-600 font-bold">✓</button>
                <button onClick={() => setIsRenaming(false)} className="text-red-600 font-bold">✕</button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-bold text-gray-800">{pet.nickname}</h2>
                <button 
                  onClick={() => setIsRenaming(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✏️
                </button>
              </div>
            )}
            
            <p className={`text-sm mt-1 ${rarity.color} font-medium`}>{rarity.label} {definition.species}</p>
            <p className="text-gray-600 text-sm mt-2">{definition.description}</p>
          </div>
          
          {/* Stats */}
          <div className="mt-6 bg-white/60 rounded-xl p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-amber-600">{pet.level}</p>
                <p className="text-xs text-gray-500">Level</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{pet.xp}/{getXpForLevel(pet.level)}</p>
                <p className="text-xs text-gray-500">XP</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{pet.currentHappiness >= 70 ? '😊' : pet.currentHappiness >= 40 ? '😐' : '😢'}</p>
                <p className="text-xs text-gray-500">{pet.currentHappiness}% Happy</p>
              </div>
            </div>
            
            {/* XP progress bar */}
            <div className="mt-3">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${pet.xpProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFeed}
              disabled={!canFeed()}
              className={`py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 ${
                canFeed() 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="text-xl">🍖</span>
              <span>Feed</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePlay}
              disabled={!canPlay()}
              className={`py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 ${
                canPlay() 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-xl' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="text-xl">🎾</span>
              <span>Play</span>
            </motion.button>
          </div>
          
          {/* Set as companion */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSetCompanion}
            className={`mt-3 w-full py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 ${
              isCompanion
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900'
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            <span className="text-xl">⭐</span>
            <span>{isCompanion ? 'Current Companion!' : 'Set as Companion'}</span>
          </motion.button>
          
          {/* Obtained date */}
          <p className="text-center text-xs text-gray-500 mt-4">
            Obtained on {new Date(pet.obtainedAt).toLocaleDateString()}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// New pet celebration modal
function NewPetModal({ 
  pet, 
  onClose 
}: { 
  pet: PetDefinition
  onClose: () => void
}) {
  const rarity = RARITY_CONFIG[pet.rarity]
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', damping: 15 }}
          className={`bg-gradient-to-br ${rarity.gradient} rounded-3xl p-8 max-w-sm w-full shadow-2xl border-4 ${rarity.border} text-center`}
          onClick={e => e.stopPropagation()}
        >
          {/* Sparkles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0, 1, 0],
                  x: [0, (Math.random() - 0.5) * 200],
                  y: [0, (Math.random() - 0.5) * 200]
                }}
                transition={{ duration: 1.5, delay: i * 0.1 }}
                style={{ 
                  left: '50%', 
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                ✨
              </motion.span>
            ))}
          </div>
          
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-black text-gray-800 mb-2">🎉 NEW PET! 🎉</h2>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${rarity.bg} ${rarity.color} mb-4`}>
              {rarity.label}
            </div>
          </motion.div>
          
          <motion.div
            className="text-9xl my-6"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {pet.emoji}
          </motion.div>
          
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-3xl font-bold text-gray-800">{pet.name}</h3>
            <p className="text-gray-600 mt-2">{pet.description}</p>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-8 px-8 py-3 bg-white/80 hover:bg-white rounded-xl font-bold text-gray-800 shadow-lg"
          >
            Awesome! 🐾
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Floating companion component
function FloatingCompanion({ companion }: { companion: ReturnType<typeof usePetCollection>['companion'] }) {
  if (!companion || !companion.definition) return null
  
  return (
    <motion.div
      className="fixed bottom-24 right-6 z-40 cursor-pointer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      drag
      dragConstraints={{ left: -300, right: 0, top: -400, bottom: 0 }}
    >
      <div className="relative">
        {/* Speech bubble */}
        <motion.div
          className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white rounded-xl px-3 py-1 shadow-lg text-sm whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 5 }}
        >
          {companion.currentHappiness >= 70 ? '💕 Happy!' : companion.currentHappiness >= 40 ? '🤔 Hungry...' : '😢 Feed me!'}
        </motion.div>
        
        {/* Pet */}
        <motion.div
          className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-4 border-amber-400 shadow-xl flex items-center justify-center text-3xl"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {companion.definition.emoji}
        </motion.div>
        
        {/* Level badge */}
        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">
          {companion.level}
        </div>
      </div>
    </motion.div>
  )
}

export default function PetsPage() {
  const {
    mounted,
    pets,
    companion,
    newlyObtained,
    collectionStats,
    stats,
    allPets,
    rarityConfig,
    getPetDefinition,
    ownsPet,
    feedPet,
    playWithPet,
    setCompanion,
    renamePet,
    clearNewlyObtained,
    awardRandomPet
  } = usePetCollection()
  
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const [filterRarity, setFilterRarity] = useState<string>('all')
  const [filterSpecies, setFilterSpecies] = useState<string>('all')
  const [showOwned, setShowOwned] = useState<'all' | 'owned' | 'missing'>('all')
  
  // Sort pets: owned first, then by rarity
  const sortedPets = [...allPets].sort((a, b) => {
    const aOwned = ownsPet(a.id)
    const bOwned = ownsPet(b.id)
    if (aOwned !== bOwned) return aOwned ? -1 : 1
    
    const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common']
    return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
  })
  
  // Filter pets
  const filteredPets = sortedPets.filter(pet => {
    if (filterRarity !== 'all' && pet.rarity !== filterRarity) return false
    if (filterSpecies !== 'all' && pet.species !== filterSpecies) return false
    if (showOwned === 'owned' && !ownsPet(pet.id)) return false
    if (showOwned === 'missing' && ownsPet(pet.id)) return false
    return true
  })
  
  const selectedPet = selectedPetId ? pets.find(p => p.petId === selectedPetId) : null
  const selectedDefinition = selectedPetId ? getPetDefinition(selectedPetId) : null

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FEF3E2 0%, #FFECD2 30%, #FCB69F 100%)' }}>
        <motion.div 
          className="text-6xl"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🐾
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(180deg, #FEF3E2 0%, #FFECD2 30%, #FCB69F 100%)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Back link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 transition-colors mb-6"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black text-orange-800 mb-2">
            🐾 Pet Collection 🐾
          </h1>
          <p className="text-orange-600">
            Collect, care for, and play with your virtual pets!
          </p>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border-2 border-orange-200 shadow-xl mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-4">
              <p className="text-3xl font-black text-orange-600">{collectionStats.owned}</p>
              <p className="text-sm text-orange-500">Pets Owned</p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4">
              <p className="text-3xl font-black text-purple-600">{collectionStats.percentage}%</p>
              <p className="text-sm text-purple-500">Complete</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-4">
              <p className="text-3xl font-black text-blue-600">{collectionStats.totalLevels}</p>
              <p className="text-sm text-blue-500">Total Levels</p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4">
              <p className="text-3xl font-black text-green-600">{stats.totalFeedings}</p>
              <p className="text-sm text-green-500">Feedings</p>
            </div>
            <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl p-4">
              <p className="text-3xl font-black text-pink-600">{stats.totalPlaySessions}</p>
              <p className="text-sm text-pink-500">Play Sessions</p>
            </div>
          </div>
          
          {/* Rarity breakdown */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {Object.entries(collectionStats.byRarity).map(([rarity, count]) => {
              const config = rarityConfig[rarity as keyof typeof rarityConfig]
              const total = allPets.filter(p => p.rarity === rarity).length
              return (
                <div key={rarity} className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
                  {config.label}: {count}/{total}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-center"
        >
          {/* Rarity filter */}
          <select
            value={filterRarity}
            onChange={e => setFilterRarity(e.target.value)}
            className="px-4 py-2 rounded-xl border-2 border-orange-200 bg-white focus:outline-none focus:border-orange-400"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
          
          {/* Species filter */}
          <select
            value={filterSpecies}
            onChange={e => setFilterSpecies(e.target.value)}
            className="px-4 py-2 rounded-xl border-2 border-orange-200 bg-white focus:outline-none focus:border-orange-400"
          >
            <option value="all">All Species</option>
            <option value="cat">🐱 Cats</option>
            <option value="dog">🐕 Dogs</option>
            <option value="bunny">🐰 Bunnies</option>
            <option value="fox">🦊 Foxes</option>
            <option value="owl">🦉 Owls</option>
            <option value="dragon">🐲 Dragons</option>
            <option value="unicorn">🦄 Unicorns</option>
            <option value="phoenix">🔥 Phoenixes</option>
          </select>
          
          {/* Owned filter */}
          <div className="flex bg-orange-100 rounded-xl p-1">
            {(['all', 'owned', 'missing'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setShowOwned(filter)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  showOwned === filter
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-orange-700 hover:bg-orange-200'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'owned' ? 'Owned' : 'Missing'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Pet Gallery */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {filteredPets.map((petDef, index) => {
            const owned = ownsPet(petDef.id)
            const ownedPet = owned ? pets.find(p => p.petId === petDef.id) : undefined
            
            return (
              <motion.div
                key={petDef.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <PetCard
                  pet={ownedPet}
                  definition={petDef}
                  isOwned={owned}
                  isCompanion={companion?.petId === petDef.id}
                  onSelect={() => owned && setSelectedPetId(petDef.id)}
                />
              </motion.div>
            )
          })}
        </motion.div>

        {filteredPets.length === 0 && (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-xl text-orange-600">No pets match your filters</p>
          </div>
        )}

        {/* How to get pets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white/80 backdrop-blur-xl rounded-3xl p-6 border-2 border-orange-200 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-orange-800 mb-4 text-center">
            🎁 How to Get Pets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <span className="text-4xl">🎮</span>
              <h3 className="font-bold text-blue-800 mt-2">Play Games</h3>
              <p className="text-sm text-blue-600">Win games in the arcade to earn pet rewards!</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl">
              <span className="text-4xl">🏆</span>
              <h3 className="font-bold text-amber-800 mt-2">Achievements</h3>
              <p className="text-sm text-amber-600">Unlock achievements to get rare pets!</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <span className="text-4xl">📚</span>
              <h3 className="font-bold text-purple-800 mt-2">Read Books</h3>
              <p className="text-sm text-purple-600">Complete books to befriend wise pets!</p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-orange-500 text-sm py-8">
          <p className="flex items-center justify-center gap-2">
            <span>🐾</span>
            Collect them all!
            <span>🐾</span>
          </p>
        </div>
      </div>

      {/* Pet interaction modal */}
      {selectedPet && selectedDefinition && (
        <PetModal
          pet={selectedPet}
          definition={selectedDefinition}
          isCompanion={companion?.petId === selectedPetId}
          onClose={() => setSelectedPetId(null)}
          onFeed={() => feedPet(selectedPetId!)}
          onPlay={() => playWithPet(selectedPetId!)}
          onSetCompanion={() => setCompanion(companion?.petId === selectedPetId ? null : selectedPetId)}
          onRename={(name) => renamePet(selectedPetId!, name)}
        />
      )}

      {/* New pet celebration */}
      {newlyObtained && (
        <NewPetModal
          pet={newlyObtained}
          onClose={clearNewlyObtained}
        />
      )}

      {/* Floating companion */}
      <FloatingCompanion companion={companion} />
    </div>
  )
}

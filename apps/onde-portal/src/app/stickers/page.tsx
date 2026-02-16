'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  useStickerCollection,
  StickerDefinition,
  StickerPackDefinition,
  StickerSet,
  RARITY_CONFIG
} from '@/hooks/useStickerCollection'

// ============================================
// COMPONENTS
// ============================================

// Sticker card component
function StickerCard({
  sticker,
  isOwned,
  count,
  isNew,
  onClick,
  size = 'normal'
}: {
  sticker: StickerDefinition
  isOwned: boolean
  count: number
  isNew?: boolean
  onClick?: () => void
  size?: 'small' | 'normal' | 'large'
}) {
  const rarity = RARITY_CONFIG[sticker.rarity]
  const sizeClasses = {
    small: 'w-16 h-16 text-2xl',
    normal: 'w-20 h-20 text-4xl',
    large: 'w-28 h-28 text-6xl'
  }

  return (
    <motion.button
      whileHover={{ scale: isOwned ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={!isOwned && !onClick}
      className={`relative ${sizeClasses[size]} rounded-xl flex items-center justify-center transition-all ${
        isOwned
          ? `bg-gradient-to-br ${rarity.gradient} border-2 ${rarity.borderColor} shadow-lg cursor-pointer`
          : 'bg-gray-200/50 border-2 border-gray-300 border-dashed cursor-default'
      }`}
    >
      {/* Sticker emoji */}
      <span className={!isOwned ? 'grayscale opacity-30' : ''}>
        {sticker.emoji}
      </span>

      {/* Count badge */}
      {count > 1 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
          {count}
        </div>
      )}

      {/* New badge */}
      {isNew && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -left-2 px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full shadow-md"
        >
          NEW
        </motion.div>
      )}

      {/* Number badge */}
      <div className={`absolute bottom-0.5 right-1 text-[10px] font-medium ${isOwned ? 'text-white/80' : 'text-gray-400'}`}>
        #{sticker.number}
      </div>
    </motion.button>
  )
}

// Pack card component
function PackCard({
  pack,
  onBuy,
  canAfford
}: {
  pack: StickerPackDefinition
  onBuy: () => void
  canAfford: boolean
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`relative bg-gradient-to-br ${pack.gradient} rounded-2xl p-5 shadow-lg overflow-hidden cursor-pointer`}
      onClick={canAfford ? onBuy : undefined}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-white/10 animate-pulse" />
      
      {/* Pack icon */}
      <div className="text-5xl mb-3 text-center filter drop-shadow-lg">
        {pack.icon}
      </div>

      {/* Pack info */}
      <h3 className="font-bold text-white text-lg text-center mb-1">{pack.name}</h3>
      <p className="text-white/80 text-xs text-center mb-3">{pack.description}</p>

      {/* Pack contents */}
      <div className="bg-white/20 rounded-lg px-3 py-1.5 text-center mb-3">
        <span className="text-white text-sm font-medium">
          {pack.stickersCount} stickers
          {pack.guaranteedRarity && (
            <span className="ml-1">
              • 1 {RARITY_CONFIG[pack.guaranteedRarity].label}+
            </span>
          )}
        </span>
      </div>

      {/* Price */}
      <button
        disabled={!canAfford}
        className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
          canAfford
            ? 'bg-white text-gray-800 hover:bg-white/90 shadow-md'
            : 'bg-white/30 text-white/60 cursor-not-allowed'
        }`}
      >
        <span>🪙</span>
        <span>{pack.price}</span>
      </button>
    </motion.div>
  )
}

// Set progress card
function SetCard({
  set,
  progress,
  isCompleted,
  onClick
}: {
  set: StickerSet
  progress: { owned: number; total: number; percentage: number }
  isCompleted: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-4 rounded-2xl text-left transition-all w-full ${
        isCompleted
          ? `bg-gradient-to-br ${set.gradient} shadow-xl border-4 border-amber-400`
          : 'bg-white/80 backdrop-blur-xl border-2 border-gray-200 hover:border-gray-300 shadow-md'
      }`}
    >
      {/* Completed badge */}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 rounded-full px-2 py-0.5 text-xs font-bold shadow-md flex items-center gap-1">
          <span>✓</span> Complete!
        </div>
      )}

      {/* Set icon */}
      <div className="text-4xl mb-2">{set.icon}</div>

      {/* Set info */}
      <h3 className={`font-bold text-lg ${isCompleted ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
        {set.name}
      </h3>
      <p className={`text-sm mb-3 ${isCompleted ? 'text-white/80' : 'text-gray-500'}`}>
        {set.description}
      </p>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
        <motion.div
          className={`h-full bg-gradient-to-r ${set.gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress.percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Progress text */}
      <div className={`flex items-center justify-between text-sm ${isCompleted ? 'text-white' : 'text-gray-600'}`}>
        <span>{progress.owned}/{progress.total} stickers</span>
        <span className="font-medium">{progress.percentage}%</span>
      </div>

      {/* Reward preview */}
      <div className={`mt-3 p-2 rounded-lg ${isCompleted ? 'bg-white/20' : 'bg-gray-100'}`}>
        <span className={`text-xs font-medium ${isCompleted ? 'text-white' : 'text-gray-600'}`}>
          🎁 Reward: {set.reward.name}
        </span>
      </div>
    </motion.button>
  )
}

// Pack opening modal
function PackOpeningModal({
  pack,
  stickers,
  onClose,
  onConfirm
}: {
  pack: StickerPackDefinition
  stickers: StickerDefinition[]
  onClose: () => void
  onConfirm: () => void
}) {
  const [revealedCount, setRevealedCount] = useState(0)
  const [showAll, setShowAll] = useState(false)

  const revealNext = useCallback(() => {
    if (revealedCount < stickers.length) {
      setRevealedCount(prev => prev + 1)
    } else {
      setShowAll(true)
    }
  }, [revealedCount, stickers.length])

  const revealAll = () => {
    setRevealedCount(stickers.length)
    setShowAll(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={showAll ? () => { onConfirm(); onClose(); } : undefined}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotateY: -180 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className={`bg-gradient-to-br ${pack.gradient} rounded-3xl p-6 max-w-lg w-full shadow-2xl`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: showAll ? 0 : [0, -10, 10, 0], scale: showAll ? 1.2 : [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: showAll ? 0 : Infinity, repeatDelay: 1 }}
            className="text-6xl mb-4 filter drop-shadow-lg"
          >
            {pack.icon}
          </motion.div>
          <h2 className="text-2xl font-bold text-white">{pack.name}</h2>
          <p className="text-white/80">
            {showAll ? 'You got:' : `Tap to reveal! (${revealedCount}/${stickers.length})`}
          </p>
        </div>

        {/* Stickers grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
          {stickers.map((sticker, index) => {
            const isRevealed = index < revealedCount
            const rarity = RARITY_CONFIG[sticker.rarity]

            return (
              <motion.div
                key={`${sticker.id}-${index}`}
                initial={{ rotateY: 180, opacity: 0 }}
                animate={isRevealed ? { rotateY: 0, opacity: 1 } : {}}
                transition={{ delay: 0.1, type: 'spring' }}
                onClick={!isRevealed && !showAll ? revealNext : undefined}
                className="perspective-1000"
              >
                <motion.div
                  className={`w-full aspect-square rounded-xl flex items-center justify-center cursor-pointer relative ${
                    isRevealed
                      ? `bg-gradient-to-br ${rarity.gradient} border-2 ${rarity.borderColor} shadow-lg`
                      : 'bg-white/30 border-2 border-white/50'
                  }`}
                  whileHover={!isRevealed ? { scale: 1.1 } : {}}
                  whileTap={!isRevealed ? { scale: 0.9 } : {}}
                >
                  {isRevealed ? (
                    <>
                      <span className="text-3xl">{sticker.emoji}</span>
                      {/* Rarity indicator */}
                      <div className={`absolute bottom-0.5 left-0.5 right-0.5 text-center text-[8px] font-bold ${rarity.color}`}>
                        {rarity.label}
                      </div>
                    </>
                  ) : (
                    <span className="text-2xl text-white/60">?</span>
                  )}
                </motion.div>
              </motion.div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {!showAll && (
            <button
              onClick={revealAll}
              className="flex-1 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-colors"
            >
              Reveal All
            </button>
          )}
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-3 bg-white text-gray-800 font-bold rounded-xl hover:bg-white/90 transition-colors shadow-lg ${!showAll && 'opacity-50'}`}
          >
            {showAll ? 'Awesome! 🎉' : 'Collect All'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Set detail modal
function SetDetailModal({
  set,
  progress,
  isCompleted,
  onClose
}: {
  set: StickerSet
  progress: ReturnType<ReturnType<typeof useStickerCollection>['getSetProgress']>
  isCompleted: boolean
  onClose: () => void
}) {
  return (
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
        className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${set.gradient} flex items-center justify-center text-4xl shadow-lg`}>
              {set.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{set.name}</h2>
              <p className="text-gray-500">{set.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">{progress.owned}/{progress.total} Collected</span>
            <span className="font-bold text-lg">{progress.percentage}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${set.gradient}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Reward section */}
        <div className={`p-4 rounded-xl mb-6 ${isCompleted ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300' : 'bg-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎁</span>
              <div>
                <p className="font-medium text-gray-800">Set Reward</p>
                <p className={`text-sm ${isCompleted ? 'text-amber-700' : 'text-gray-500'}`}>
                  {set.reward.name}
                </p>
              </div>
            </div>
            {isCompleted && (
              <div className="px-3 py-1 bg-amber-400 text-amber-900 font-bold rounded-full text-sm">
                ✓ Claimed
              </div>
            )}
          </div>
        </div>

        {/* Stickers grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {progress.stickers.map(sticker => (
            <div key={sticker.id} className="text-center">
              <StickerCard
                sticker={sticker}
                isOwned={sticker.owned}
                count={sticker.count}
                size="normal"
              />
              <p className={`text-xs mt-1 font-medium truncate ${sticker.owned ? 'text-gray-700' : 'text-gray-400'}`}>
                {sticker.owned ? sticker.name : '???'}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Trade modal
function TradeModal({
  duplicates,
  getStickerDefinition,
  onTrade,
  onClose
}: {
  duplicates: { stickerId: string; count: number }[]
  getStickerDefinition: (id: string) => StickerDefinition | undefined
  onTrade: (stickerId: string, quantity: number) => void
  onClose: () => void
}) {
  return (
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
        className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🔄 Trade Stickers</h2>
            <p className="text-gray-500">Exchange duplicates for coins!</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Trade rates */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-amber-800 mb-2">💰 Trade Rates</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Common:</span>
              <span className="font-medium">5 coins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Uncommon:</span>
              <span className="font-medium">10 coins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rare:</span>
              <span className="font-medium">25 coins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Epic:</span>
              <span className="font-medium">50 coins</span>
            </div>
          </div>
        </div>

        {/* Duplicates list */}
        {duplicates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-gray-500">No duplicates to trade!</p>
            <p className="text-gray-400 text-sm">Keep opening packs to find more.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {duplicates.map(({ stickerId, count }) => {
              const sticker = getStickerDefinition(stickerId)
              if (!sticker) return null
              const rarity = RARITY_CONFIG[sticker.rarity]
              const coinValue = { common: 5, uncommon: 10, rare: 25, epic: 50, legendary: 100 }[sticker.rarity]

              return (
                <div
                  key={stickerId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${rarity.gradient} flex items-center justify-center text-2xl border ${rarity.borderColor}`}>
                      {sticker.emoji}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{sticker.name}</p>
                      <p className={`text-sm ${rarity.color}`}>{rarity.label} • ×{count} extra</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onTrade(stickerId, 1)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Trade</span>
                    <span className="text-xs">+{coinValue}🪙</span>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function StickersPage() {
  const {
    mounted,
    state,
    collectionStats,
    allSets,
    allPacks,
    getStickerDefinition,
    getSetProgress,
    ownsSticker,
    getOwnedSticker,
    getDuplicateCount,
    openPack,
    confirmPackOpening,
    tradeDuplicates
  } = useStickerCollection()

  const [activeTab, setActiveTab] = useState<'album' | 'packs' | 'sets'>('album')
  const [selectedSet, setSelectedSet] = useState<StickerSet | null>(null)
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [coins, setCoins] = useState(500) // Mock coins - would come from useCoins

  // Get duplicates for trading
  const duplicates = state.ownedStickers
    .filter(s => s.count > 1)
    .map(s => ({ stickerId: s.stickerId, count: s.count - 1 }))

  const handleBuyPack = (pack: StickerPackDefinition) => {
    if (coins >= pack.price) {
      setCoins(prev => prev - pack.price)
      openPack(pack)
    }
  }

  const handleTrade = (stickerId: string, quantity: number) => {
    const sticker = getStickerDefinition(stickerId)
    if (!sticker) return
    const coinValue = { common: 5, uncommon: 10, rare: 25, epic: 50, legendary: 100 }[sticker.rarity]
    if (tradeDuplicates(stickerId, quantity)) {
      setCoins(prev => prev + coinValue)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 50%, #BAE6FD 100%)' }}>
        <motion.div
          className="text-6xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🎴
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 dark:bg-gray-900" style={{ background: 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 50%, #BAE6FD 100%)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 transition-colors mb-6"
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
          <h1 className="text-4xl md:text-5xl font-black text-sky-800 mb-2">
            🎴 Sticker Album 🎴
          </h1>
          <p className="text-sky-600">
            Collect, trade, and complete sets for rewards!
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 border-2 border-sky-200 shadow-xl mb-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Collection progress */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-black text-sky-700">{collectionStats.ownedUnique}</p>
                <p className="text-xs text-sky-500">/ {collectionStats.totalStickers}</p>
              </div>
              <div className="h-12 w-px bg-sky-200" />
              <div className="text-center">
                <p className="text-2xl font-black text-purple-600">{collectionStats.percentage}%</p>
                <p className="text-xs text-purple-500">Complete</p>
              </div>
              <div className="h-12 w-px bg-sky-200" />
              <div className="text-center">
                <p className="text-2xl font-black text-amber-600">{collectionStats.completedSets}</p>
                <p className="text-xs text-amber-500">/ {collectionStats.totalSets} Sets</p>
              </div>
            </div>

            {/* Coins & Trade */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTradeModal(true)}
                className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                <span>🔄</span>
                <span>Trade ({collectionStats.totalDuplicates})</span>
              </button>
              <div className="px-4 py-2 bg-amber-100 rounded-xl flex items-center gap-2">
                <span className="text-xl">🪙</span>
                <span className="font-bold text-amber-700">{coins}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'album', label: '📖 Album', icon: '📖' },
            { id: 'packs', label: '📦 Packs', icon: '📦' },
            { id: 'sets', label: '🏆 Sets', icon: '🏆' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                  : 'bg-white/80 text-sky-700 hover:bg-white border border-sky-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'album' && (
            <motion.div
              key="album"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Album view - grouped by set */}
              <div className="space-y-8">
                {allSets.map(set => {
                  const progress = getSetProgress(set.id)
                  const isCompleted = state.completedSets.includes(set.id)

                  return (
                    <motion.div
                      key={set.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border-2 border-sky-200 shadow-xl"
                    >
                      {/* Set header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${set.gradient} flex items-center justify-center text-2xl shadow-md`}>
                            {set.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                              {set.name}
                              {isCompleted && <span className="text-amber-500">⭐</span>}
                            </h3>
                            <p className="text-sm text-gray-500">{progress.owned}/{progress.total} collected</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedSet(set)}
                          className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-700 text-sm font-medium rounded-lg transition-colors"
                        >
                          View All
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${set.gradient}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress.percentage}%` }}
                        />
                      </div>

                      {/* Stickers preview */}
                      <div className="flex flex-wrap gap-2">
                        {progress.stickers.slice(0, 8).map(sticker => (
                          <StickerCard
                            key={sticker.id}
                            sticker={sticker}
                            isOwned={sticker.owned}
                            count={sticker.count}
                            isNew={getOwnedSticker(sticker.id)?.isNew}
                            size="small"
                          />
                        ))}
                        {progress.stickers.length > 8 && (
                          <button
                            onClick={() => setSelectedSet(set)}
                            className="w-16 h-16 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-medium transition-colors"
                          >
                            +{progress.stickers.length - 8}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'packs' && (
            <motion.div
              key="packs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Packs shop */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border-2 border-sky-200 shadow-xl mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">📦 Sticker Packs</h2>
                <p className="text-gray-500 mb-6">Buy packs with coins to expand your collection!</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allPacks.map((pack, index) => (
                    <motion.div
                      key={pack.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PackCard
                        pack={pack}
                        onBuy={() => handleBuyPack(pack)}
                        canAfford={coins >= pack.price}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white/60 rounded-2xl p-4 text-center">
                <p className="text-gray-600">
                  📊 <span className="font-medium">{state.packsOpened}</span> packs opened •
                  <span className="font-medium ml-1">{state.totalStickersCollected}</span> stickers collected
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'sets' && (
            <motion.div
              key="sets"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Sets overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allSets.map((set, index) => {
                  const progress = getSetProgress(set.id)
                  const isCompleted = state.completedSets.includes(set.id)

                  return (
                    <motion.div
                      key={set.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <SetCard
                        set={set}
                        progress={progress}
                        isCompleted={isCompleted}
                        onClick={() => setSelectedSet(set)}
                      />
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How to get stickers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white/80 backdrop-blur-xl rounded-3xl p-6 border-2 border-sky-200 shadow-xl"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            🎁 How to Get Stickers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <span className="text-3xl">🎮</span>
              <h3 className="font-bold text-blue-800 mt-2">Win Games</h3>
              <p className="text-sm text-blue-600">Complete games to earn random stickers!</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl">
              <span className="text-3xl">📦</span>
              <h3 className="font-bold text-amber-800 mt-2">Buy Packs</h3>
              <p className="text-sm text-amber-600">Spend coins on sticker packs!</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <span className="text-3xl">🔄</span>
              <h3 className="font-bold text-green-800 mt-2">Trade</h3>
              <p className="text-sm text-green-600">Exchange duplicates for coins!</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <span className="text-3xl">🏆</span>
              <h3 className="font-bold text-purple-800 mt-2">Complete Sets</h3>
              <p className="text-sm text-purple-600">Finish sets for exclusive rewards!</p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-sky-500 text-sm py-8">
          <p className="flex items-center justify-center gap-2">
            <span>🎴</span>
            Collect them all!
            <span>🎴</span>
          </p>
        </div>
      </div>

      {/* Pack opening modal */}
      <AnimatePresence>
        {state.pendingPack && state.revealedStickers.length > 0 && (
          <PackOpeningModal
            pack={state.pendingPack}
            stickers={state.revealedStickers}
            onClose={() => confirmPackOpening()}
            onConfirm={confirmPackOpening}
          />
        )}
      </AnimatePresence>

      {/* Set detail modal */}
      <AnimatePresence>
        {selectedSet && (
          <SetDetailModal
            set={selectedSet}
            progress={getSetProgress(selectedSet.id)}
            isCompleted={state.completedSets.includes(selectedSet.id)}
            onClose={() => setSelectedSet(null)}
          />
        )}
      </AnimatePresence>

      {/* Trade modal */}
      <AnimatePresence>
        {showTradeModal && (
          <TradeModal
            duplicates={duplicates}
            getStickerDefinition={getStickerDefinition}
            onTrade={handleTrade}
            onClose={() => setShowTradeModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from '@/i18n/I18nProvider'
import { 
  useCoins, 
  THEMES, 
  PETS, 
  PROFILE_FRAMES, 
  BADGES, 
  EFFECTS,
  formatCoinAmount,
  getRarityColor,
  getRarityGlow,
  type Cosmetic,
  type Pet,
  type ProfileFrame,
  type CosmeticType
} from '@/hooks/useCoins'
import { CoinDisplayLarge } from '@/components/CoinDisplay'

type ShopCategory = 'all' | CosmeticType

interface ShopItemCardProps {
  item: Cosmetic | Pet | ProfileFrame
  type: CosmeticType
  owned: boolean
  equipped: boolean
  canAfford: boolean
  onPurchase: () => void
  onEquip: () => void
  onUnequip: () => void
}

function ShopItemCard({ 
  item, 
  type, 
  owned, 
  equipped, 
  canAfford, 
  onPurchase, 
  onEquip,
  onUnequip 
}: ShopItemCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false)
  
  const handlePurchase = () => {
    onPurchase()
    setShowPurchaseSuccess(true)
    setTimeout(() => setShowPurchaseSuccess(false), 2000)
  }
  
  const rarityLabel = {
    common: shopT.rarity?.common || 'Common',
    rare: shopT.rarity?.rare || 'Rare',
    epic: shopT.rarity?.epic || 'Epic',
    legendary: shopT.rarity?.legendary || 'Legendary'
  }
  
  return (
    <motion.div
      className={`relative rounded-2xl p-4 border-2 transition-all duration-300
                  ${owned 
                    ? 'bg-green-50 border-green-200' 
                    : canAfford 
                      ? 'bg-white border-onde-ocean/10 hover:border-onde-gold/50' 
                      : 'bg-gray-50 border-gray-200 opacity-75'}
                  ${getRarityGlow(item.rarity)}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4, scale: 1.02 }}
      layout
    >
      {/* Rarity badge */}
      <div className={`absolute -top-2 right-4 px-2 py-0.5 rounded-full text-xs font-bold ${getRarityColor(item.rarity)}`}>
        {rarityLabel[item.rarity]}
      </div>
      
      {/* Owned/Equipped badge */}
      {owned && (
        <div className="absolute -top-2 left-4 px-2 py-0.5 rounded-full text-xs font-bold bg-green-500 text-white">
          {equipped ? '✓ Equipaggiato' : '✓ Posseduto'}
        </div>
      )}
      
      {/* Icon */}
      <div className="text-center mb-3">
        <motion.span 
          className="text-5xl block"
          animate={isHovered ? { 
            scale: [1, 1.2, 1],
            rotate: [0, -10, 10, 0]
          } : {}}
          transition={{ duration: 0.5 }}
        >
          {item.icon}
        </motion.span>
      </div>
      
      {/* Info */}
      <h3 className="font-bold text-onde-ocean text-center mb-1">{item.name}</h3>
      <p className="text-xs text-onde-ocean/60 text-center mb-3 line-clamp-2">{item.description}</p>
      
      {/* Pet animations preview */}
      {'animations' in item && (
        <div className="flex justify-center gap-1 mb-3 flex-wrap">
          {(item as Pet).animations.map(anim => (
            <span key={anim} className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">
              {anim}
            </span>
          ))}
        </div>
      )}
      
      {/* Frame preview */}
      {'borderStyle' in item && (
        <div className="flex justify-center mb-3">
          <div className={`w-12 h-12 ${(item as ProfileFrame).borderStyle} ${(item as ProfileFrame).animation || ''}`}
               style={{ boxShadow: (item as ProfileFrame).glowColor ? `0 0 15px ${(item as ProfileFrame).glowColor}` : undefined }}>
            <div className="w-full h-full rounded-full bg-gradient-to-br from-onde-ocean to-onde-coral" />
          </div>
        </div>
      )}
      
      {/* Price / Actions */}
      <div className="mt-auto">
        {!owned ? (
          <motion.button
            onClick={handlePurchase}
            disabled={!canAfford}
            className={`w-full py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2
                       ${canAfford 
                         ? 'bg-gradient-to-r from-onde-gold to-amber-500 text-white shadow-lg shadow-onde-gold/30 hover:shadow-xl' 
                         : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            whileHover={canAfford ? { scale: 1.02 } : {}}
            whileTap={canAfford ? { scale: 0.98 } : {}}
          >
            <span>🪙 {formatCoinAmount(item.price)}</span>
          </motion.button>
        ) : !equipped ? (
          <motion.button
            onClick={onEquip}
            className="w-full py-2 rounded-xl font-bold text-sm bg-onde-ocean text-white"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Equipaggia
          </motion.button>
        ) : (
          <motion.button
            onClick={onUnequip}
            className="w-full py-2 rounded-xl font-bold text-sm bg-gray-200 text-gray-600"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Rimuovi
          </motion.button>
        )}
      </div>
      
      {/* Purchase success animation */}
      <AnimatePresence>
        {showPurchaseSuccess && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-green-500/90 rounded-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="text-center text-white">
              <motion.span 
                className="text-4xl block mb-2"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.5 }}
              >
                ✓
              </motion.span>
              <span className="font-bold">Acquistato!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ShopPage() {
  const { 
    balance, 
    mounted, 
    ownsCosmetic, 
    canAfford, 
    purchaseCosmetic, 
    equipCosmetic, 
    unequipCosmetic,
    getEquipped,
    getRecentTransactions
  } = useCoins()
  
  const [activeCategory, setActiveCategory] = useState<ShopCategory>('all')
  const [showHistory, setShowHistory] = useState(false)
  
  // i18n
  const t = useTranslations()
  const shopT = t.shop || { categories: {}, rarity: {}, actions: {}, history: {} }
  
  const categories: { id: ShopCategory; label: string; icon: string }[] = [
    { id: 'all', label: shopT.categories?.all || 'All', icon: '🏪' },
    { id: 'theme', label: shopT.categories?.theme || 'Themes', icon: '🎨' },
    { id: 'pet', label: shopT.categories?.pet || 'Pets', icon: '🐾' },
    { id: 'frame', label: shopT.categories?.frame || 'Frames', icon: '🖼️' },
    { id: 'badge', label: shopT.categories?.badge || 'Badges', icon: '🏅' },
    { id: 'effect', label: shopT.categories?.effect || 'Effects', icon: '✨' }
  ]
  
  const allItems = useMemo(() => {
    const items: Array<{ item: Cosmetic | Pet | ProfileFrame; type: CosmeticType }> = [
      ...THEMES.map(item => ({ item, type: 'theme' as CosmeticType })),
      ...PETS.map(item => ({ item: item as unknown as Cosmetic, type: 'pet' as CosmeticType })),
      ...PROFILE_FRAMES.map(item => ({ item: item as unknown as Cosmetic, type: 'frame' as CosmeticType })),
      ...BADGES.map(item => ({ item, type: 'badge' as CosmeticType })),
      ...EFFECTS.map(item => ({ item, type: 'effect' as CosmeticType }))
    ]
    
    if (activeCategory === 'all') return items
    return items.filter(({ type }) => type === activeCategory)
  }, [activeCategory])
  
  const transactions = getRecentTransactions(10)
  
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-onde-cream to-white pt-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-gray-200 rounded-2xl" />
            <div className="h-12 bg-gray-200 rounded-xl w-1/2" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-onde-cream to-white pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-onde-ocean mb-2">
            🏪 Il Negozio
          </h1>
          <p className="text-onde-ocean/60">
            Spendi le tue monete in fantastici oggetti!
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-[300px,1fr] gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Coin balance */}
            <CoinDisplayLarge />
            
            {/* Transaction history toggle */}
            <motion.button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full py-3 rounded-xl bg-white border border-onde-ocean/10 
                         font-medium text-onde-ocean hover:bg-onde-cream/50 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              📜 {showHistory ? (shopT.history?.hide || 'Hide History') : (shopT.history?.show || 'Show History')}
            </motion.button>
            
            {/* Transaction history */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  className="bg-white rounded-2xl border border-onde-ocean/10 p-4 overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <h3 className="font-bold text-onde-ocean mb-3">Ultime Transazioni</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {transactions.length === 0 ? (
                      <p className="text-sm text-onde-ocean/50 text-center py-4">
                        Nessuna transazione
                      </p>
                    ) : (
                      transactions.map(tx => (
                        <div key={tx.id} className="flex items-center gap-2 text-sm">
                          <span className={tx.amount > 0 ? 'text-green-600' : 'text-red-500'}>
                            {tx.amount > 0 ? '+' : ''}{formatCoinAmount(tx.amount)}
                          </span>
                          <span className="flex-1 text-onde-ocean/60 truncate">
                            {tx.description}
                          </span>
                          {tx.multiplier && (
                            <span className="text-xs px-1 py-0.5 bg-purple-100 text-purple-600 rounded">
                              {tx.multiplier}x
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-onde-ocean/10 p-4">
              <h3 className="font-bold text-onde-ocean mb-3">Come guadagnare</h3>
              <ul className="space-y-2 text-sm text-onde-ocean/70">
                <li className="flex items-center gap-2">
                  <span>🎮</span>
                  <Link href="/games" className="hover:text-onde-coral">Gioca ai minigiochi</Link>
                </li>
                <li className="flex items-center gap-2">
                  <span>📖</span>
                  <Link href="/libri" className="hover:text-onde-coral">Leggi i libri</Link>
                </li>
                <li className="flex items-center gap-2">
                  <span>🏆</span>
                  <Link href="/profile" className="hover:text-onde-coral">Sblocca achievements</Link>
                </li>
                <li className="flex items-center gap-2">
                  <span>📅</span>
                  <span>Login giornaliero</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🎯</span>
                  <Link href="/daily" className="hover:text-onde-coral">Sfide giornaliere</Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Main content */}
          <div>
            {/* Category tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <motion.button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap
                             transition-colors duration-200
                             ${activeCategory === cat.id 
                               ? 'bg-onde-ocean text-white' 
                               : 'bg-white border border-onde-ocean/10 text-onde-ocean hover:bg-onde-cream/50'}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </motion.button>
              ))}
            </div>
            
            {/* Items grid */}
            <motion.div 
              className="grid grid-cols-2 lg:grid-cols-3 gap-4"
              layout
            >
              <AnimatePresence mode="popLayout">
                {allItems.map(({ item, type }) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ShopItemCard
                      item={item}
                      type={type}
                      owned={ownsCosmetic(item.id)}
                      equipped={getEquipped(type) === item.id}
                      canAfford={canAfford(item.price)}
                      onPurchase={() => purchaseCosmetic(item.id)}
                      onEquip={() => equipCosmetic(item.id, type)}
                      onUnequip={() => unequipCosmetic(type)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            
            {/* Empty state */}
            {allItems.length === 0 && (
              <div className="text-center py-12">
                <span className="text-6xl block mb-4">🏪</span>
                <p className="text-onde-ocean/60">Nessun oggetto in questa categoria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

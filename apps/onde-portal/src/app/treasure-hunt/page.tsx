'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TreasureMap, 
  TreasureLeaderboard, 
  TreasureProgress 
} from '@/components/TreasureChest'
import { 
  useTreasureHunt, 
  TREASURE_CHESTS,
  DIFFICULTY_CONFIG,
  RARITY_CONFIG 
} from '@/hooks/useTreasureHunt'

type Tab = 'map' | 'collection' | 'leaderboard'

export default function TreasureHuntPage() {
  const [activeTab, setActiveTab] = useState<Tab>('map')
  const { stats, rewards, isChestFound, allChests, mounted } = useTreasureHunt()

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">🗺️</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-onde-gold via-amber-400 to-amber-500 
                      text-white py-16 px-4 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
              }}
            >
              {['💎', '🪙', '👑', '⭐', '✨'][i % 5]}
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-4"
          >
            🗺️ Treasure Hunt
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/90 mb-8"
          >
            Explore the site to find hidden treasures!
          </motion.p>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <StatCard
              icon="📦"
              value={`${stats.foundCount}/${stats.totalChests}`}
              label="Chests Found"
            />
            <StatCard
              icon="💰"
              value={stats.totalCoins.toLocaleString()}
              label="Gold Coins"
            />
            <StatCard
              icon="🐾"
              value={stats.petsCount}
              label="Pets Unlocked"
            />
            <StatCard
              icon="🏅"
              value={stats.badgesCount}
              label="Badges"
            />
          </motion.div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-center gap-2 p-1 bg-gray-100 rounded-xl">
          {[
            { id: 'map', icon: '🗺️', label: 'Treasure Map' },
            { id: 'collection', icon: '🎒', label: 'My Collection' },
            { id: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-medium
                transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-white shadow-md text-onde-ocean' 
                  : 'text-gray-600 hover:text-gray-800'}
              `}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <AnimatePresence mode="wait">
          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TreasureMap />
              
              {/* Chest list by location */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  📍 Chest Locations
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(
                    allChests.reduce((acc, chest) => {
                      if (!chest.isSecret || isChestFound(chest.id)) {
                        acc[chest.location] = acc[chest.location] || []
                        acc[chest.location].push(chest)
                      }
                      return acc
                    }, {} as Record<string, typeof allChests>)
                  ).map(([location, chests]) => (
                    <LocationCard
                      key={location}
                      location={location}
                      chests={chests}
                      isChestFound={isChestFound}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'collection' && (
            <motion.div
              key="collection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CollectionTab rewards={rewards} allChests={allChests} isChestFound={isChestFound} />
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TreasureLeaderboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Stat card component
function StatCard({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-white/80">{label}</div>
    </div>
  )
}

// Location card component
function LocationCard({ 
  location, 
  chests, 
  isChestFound 
}: { 
  location: string
  chests: typeof TREASURE_CHESTS
  isChestFound: (id: string) => boolean
}) {
  const foundCount = chests.filter(c => isChestFound(c.id)).length
  const allFound = foundCount === chests.length

  return (
    <div className={`
      bg-white rounded-xl p-4 border-2 transition-all
      ${allFound ? 'border-green-300 bg-green-50' : 'border-gray-200'}
    `}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800">{location}</h3>
        <span className={`
          text-sm px-2 py-1 rounded-full
          ${allFound ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}
        `}>
          {foundCount}/{chests.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {chests.map(chest => {
          const found = isChestFound(chest.id)
          const rarityConfig = RARITY_CONFIG[chest.reward.rarity]
          
          return (
            <div
              key={chest.id}
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${found ? rarityConfig.bg : 'bg-gray-100'}
                ${found ? rarityConfig.border : 'border-gray-200'}
                border-2 transition-all
              `}
              title={found ? chest.name : '???'}
            >
              <span className="text-lg">
                {found ? chest.reward.icon : '❓'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Collection tab component
function CollectionTab({ 
  rewards, 
  allChests,
  isChestFound
}: { 
  rewards: ReturnType<typeof useTreasureHunt>['rewards']
  allChests: typeof TREASURE_CHESTS
  isChestFound: (id: string) => boolean
}) {
  const categories = [
    { 
      id: 'pets', 
      title: '🐾 Pets', 
      items: allChests.filter(c => c.reward.type === 'pet'),
      unlocked: rewards.pets 
    },
    { 
      id: 'badges', 
      title: '🏅 Badges', 
      items: allChests.filter(c => c.reward.type === 'badge'),
      unlocked: rewards.badges 
    },
    { 
      id: 'avatars', 
      title: '👤 Avatars', 
      items: allChests.filter(c => c.reward.type === 'avatar'),
      unlocked: rewards.avatars 
    },
    { 
      id: 'themes', 
      title: '🎨 Themes', 
      items: allChests.filter(c => c.reward.type === 'theme'),
      unlocked: rewards.themes 
    },
  ]

  return (
    <div className="space-y-8">
      {/* Coins display */}
      <div className="bg-gradient-to-r from-onde-gold to-amber-400 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="text-5xl">💰</div>
          <div>
            <div className="text-4xl font-bold">{rewards.coins.toLocaleString()}</div>
            <div className="text-white/80">Gold Coins</div>
          </div>
        </div>
      </div>

      {/* Category grids */}
      {categories.map(category => (
        <div key={category.id}>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            {category.title}
            <span className="text-sm font-normal text-gray-500">
              ({category.unlocked.length}/{category.items.length})
            </span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {category.items.map(chest => {
              const isUnlocked = category.unlocked.includes(chest.reward.id)
              const rarityConfig = RARITY_CONFIG[chest.reward.rarity]

              return (
                <motion.div
                  key={chest.id}
                  whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
                  className={`
                    relative rounded-xl p-4 text-center
                    ${isUnlocked ? rarityConfig.bg : 'bg-gray-100'}
                    ${isUnlocked ? rarityConfig.border : 'border-gray-200'}
                    ${isUnlocked ? rarityConfig.glow : ''}
                    border-2 transition-all
                  `}
                >
                  <div className={`text-4xl mb-2 ${!isUnlocked && 'filter grayscale opacity-30'}`}>
                    {chest.reward.icon}
                  </div>
                  <div className={`font-medium text-sm ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                    {isUnlocked ? chest.reward.name : '???'}
                  </div>
                  <div className={`text-xs ${rarityConfig.color}`}>
                    {rarityConfig.label}
                  </div>

                  {/* Lock overlay */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">🔒</span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Powerups */}
      {Object.keys(rewards.powerups).length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">⚡ Power-Ups</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.entries(rewards.powerups).map(([id, count]) => {
              const chest = allChests.find(c => c.reward.id === id)
              if (!chest) return null

              return (
                <div
                  key={id}
                  className="bg-purple-100 border-2 border-purple-300 rounded-xl p-4 text-center"
                >
                  <div className="text-3xl mb-1">{chest.reward.icon}</div>
                  <div className="font-medium text-purple-800">{chest.reward.name}</div>
                  <div className="text-purple-600">×{count}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'
import AnimatedCard from '@/components/ui/AnimatedCard'
import Button from '@/components/ui/Button'
import { GameCardsSkeletonGrid } from '@/components/ui/Skeleton'
import { useTranslations } from '@/i18n/I18nProvider'

// Type for game color variants
type GameColor = 'gold' | 'teal' | 'coral'

// Game configuration (non-translatable data)
const miniGamesConfig = [
  {
    id: 'moonlight-magic-house',
    translationKey: 'moonlightMagicHouse',
    icon: '/games/moonlight-magic-house/assets/backgrounds/house-map.jpg',
    iconFallback: '🌙',
    color: 'gold' as GameColor,
    featureKeys: ['dragAndDrop', 'exploration', 'age2to6'],
    statusKey: 'playNow',
    playable: true,
    href: '/games/moonlight-magic-house/',
  },
  {
    id: 'chef-studio',
    translationKey: 'chefStudio',
    icon: '/images/games/chef-placeholder.jpg',
    iconFallback: '👨‍🍳',
    color: 'gold' as GameColor,
    featureKeys: ['recipes50', 'stepByStep', 'noRisk'],
    statusKey: 'comingSoon',
  },
  {
    id: 'art-studio',
    translationKey: 'artStudio',
    icon: '/images/games/art-placeholder.jpg',
    iconFallback: '🎨',
    color: 'teal' as GameColor,
    featureKeys: ['watercolorTechniques', 'guidedTutorials', 'personalGallery'],
    statusKey: 'inDevelopment',
  },
  {
    id: 'puzzle-world',
    translationKey: 'puzzleWorld',
    icon: '/images/games/puzzle-placeholder.jpg',
    iconFallback: '🧩',
    color: 'coral' as GameColor,
    featureKeys: ['levels100', 'progressiveDifficulty', 'dailyChallenges'],
    statusKey: 'comingSoon',
  },
  {
    id: 'music-maker',
    translationKey: 'musicMaker',
    icon: '/images/games/music-placeholder.jpg',
    iconFallback: '🎵',
    color: 'gold' as GameColor,
    featureKeys: ['instruments10', 'recordAndShare', 'musicBasics'],
    statusKey: 'inPlanning',
  },
  {
    id: 'nature-explorer',
    translationKey: 'natureExplorer',
    icon: '/images/games/nature-placeholder.jpg',
    iconFallback: '🌿',
    color: 'teal' as GameColor,
    featureKeys: ['arSupported', 'encyclopedia', 'interactiveQuizzes'],
    statusKey: 'comingSoon',
  },
  {
    id: 'word-play',
    translationKey: 'wordPlay',
    icon: '/images/games/words-placeholder.jpg',
    iconFallback: '📝',
    color: 'coral' as GameColor,
    featureKeys: ['multilingual', 'rhymesAndNursery', 'dailyChallengesShort'],
    statusKey: 'comingSoon',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function GiochiPage() {
  const t = useTranslations()
  const [isLoading, setIsLoading] = useState(true)

  // Simulate content loading (translations, images, etc.)
  useEffect(() => {
    // Short delay for initial render, then show content
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  // Helper to get status color
  const getStatusColor = (statusKey: string) => {
    if (statusKey === 'playNow') return 'bg-green-500/20 text-green-600'
    if (statusKey === 'inDevelopment') return 'bg-onde-teal/10 text-onde-teal'
    return 'bg-onde-gold/10 text-onde-gold-dark'
  }

  return (
    <div className="min-h-screen py-12">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl
                       bg-gradient-to-br from-onde-gold to-onde-gold-light
                       shadow-xl shadow-onde-gold/30 mb-8"
          >
            <span className="text-5xl">🎮</span>
          </motion.div>

          <SectionHeader
            badge={t.games.badge}
            title={t.games.title}
            subtitle={t.games.subtitle}
            gradient="gold"
          />
        </div>
      </section>

      {/* Minecraft Section - Emilio's World */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="relative rounded-4xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Background - Minecraft style with watercolor overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-onde-ocean via-onde-ocean-dark to-black" />

          {/* Watercolor texture overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                radial-gradient(ellipse at 20% 30%, rgba(72, 201, 176, 0.3) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 70%, rgba(244, 208, 63, 0.2) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 50%, rgba(255, 127, 127, 0.15) 0%, transparent 60%)
              `,
            }}
          />

          {/* Pixel pattern subtle overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Crect width='4' height='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative px-8 py-16 md:px-16 md:py-20">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                {/* Coming Soon Badge */}
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                             bg-onde-gold/20 text-onde-gold text-sm font-semibold mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="w-2 h-2 rounded-full bg-onde-gold animate-pulse" />
                  {t.games.minecraft.badge}
                </motion.div>

                <motion.h3
                  className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  {t.games.minecraft.title}
                </motion.h3>

                <motion.p
                  className="text-lg md:text-xl text-white/70 max-w-lg mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  {t.games.minecraft.description}
                </motion.p>

                {/* Features */}
                <motion.div
                  className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  {[
                    t.games.minecraft.features.moderated,
                    t.games.minecraft.features.collaborative,
                    t.games.minecraft.features.weeklyEvents,
                    t.games.minecraft.features.age
                  ].map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1.5 rounded-xl text-sm bg-white/10 backdrop-blur-sm text-white/80"
                    >
                      {feature}
                    </span>
                  ))}
                </motion.div>

                {/* Stats placeholders */}
                <motion.div
                  className="flex flex-wrap gap-4 justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm">
                    <p className="text-xs text-white/50 mb-1">{t.games.minecraft.version}</p>
                    <p className="text-xl font-bold text-white">1.21+</p>
                  </div>
                  <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm">
                    <p className="text-xs text-white/50 mb-1">{t.games.minecraft.age}</p>
                    <p className="text-xl font-bold text-white">6+</p>
                  </div>
                  <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm">
                    <p className="text-xs text-white/50 mb-1">{t.games.minecraft.status}</p>
                    <p className="text-xl font-bold text-onde-gold">{t.games.minecraft.comingSoon}</p>
                  </div>
                </motion.div>
              </div>

              {/* Visual - Emilio with Minecraft elements */}
              <motion.div
                className="flex-shrink-0"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative">
                  {/* Main icon container with watercolor effect */}
                  <motion.div
                    className="w-48 h-48 md:w-56 md:h-56 rounded-3xl
                               bg-gradient-to-br from-onde-teal/30 via-onde-gold/20 to-onde-coral/30
                               backdrop-blur-sm border border-white/20
                               flex items-center justify-center relative overflow-hidden"
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 2, 0],
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {/* Watercolor blob effect inside */}
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        background: `
                          radial-gradient(circle at 30% 30%, rgba(72, 201, 176, 0.4) 0%, transparent 40%),
                          radial-gradient(circle at 70% 70%, rgba(244, 208, 63, 0.3) 0%, transparent 40%)
                        `,
                      }}
                    />

                    {/* Minecraft pickaxe + Robot combo */}
                    <div className="relative z-10 flex flex-col items-center">
                      <span className="text-7xl md:text-8xl">🤖</span>
                      <span className="text-3xl md:text-4xl -mt-2">⛏️</span>
                    </div>
                  </motion.div>

                  {/* Floating decorative elements */}
                  <motion.div
                    className="absolute -top-4 -right-4 w-12 h-12 rounded-xl bg-onde-gold/30
                               backdrop-blur-sm flex items-center justify-center text-2xl"
                    animate={{ y: [0, -5, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  >
                    🌟
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-2 -left-4 w-10 h-10 rounded-xl bg-onde-teal/30
                               backdrop-blur-sm flex items-center justify-center text-xl"
                    animate={{ y: [0, 5, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  >
                    🧱
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Mini-Giochi Educativi Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <SectionHeader
          badge={t.games.miniGames.badge}
          title={t.games.miniGames.title}
          subtitle={t.games.miniGames.subtitle}
          gradient="teal"
        />

        {/* Games Grid */}
        {isLoading ? (
          <div className="mt-12">
            <GameCardsSkeletonGrid count={6} />
          </div>
        ) : (
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12"
          variants={container}
          initial="show"
          animate="show"
        >
          {miniGamesConfig.map((game, index) => {
            const gameT = t.games.gameTitles[game.translationKey as keyof typeof t.games.gameTitles]
            const statusLabel = t.games.status[game.statusKey as keyof typeof t.games.status]
            
            const CardContent = (
              <>
                {/* Header with image placeholder */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl
                                   bg-gradient-to-br from-onde-${game.color}/20 to-onde-${game.color}/5
                                   relative overflow-hidden`}>
                    {/* Watercolor texture in icon background */}
                    <div
                      className="absolute inset-0 opacity-50"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 70%)`,
                      }}
                    />
                    <span className="relative z-10">{game.iconFallback}</span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold
                                     bg-onde-ocean/5 text-onde-ocean/60">
                      {gameT.badge}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(game.statusKey)}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-display font-bold text-onde-ocean mb-1">
                  {gameT.title}
                </h3>
                <p className="text-sm text-onde-ocean/50 mb-3">{gameT.subtitle}</p>
                <p className="text-onde-ocean/60 leading-relaxed mb-4">
                  {gameT.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {game.featureKeys.map((featureKey) => (
                    <span
                      key={featureKey}
                      className="px-2 py-1 rounded-lg text-xs bg-onde-cream text-onde-ocean/70"
                    >
                      {t.games.features[featureKey as keyof typeof t.games.features]}
                    </span>
                  ))}
                </div>

                {/* Play button for playable games */}
                {game.playable && (
                  <div className="mt-4 pt-4 border-t border-onde-ocean/10">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                                     bg-gradient-to-r from-onde-gold to-onde-coral
                                     text-white font-semibold text-sm
                                     group-hover:shadow-lg transition-shadow">
                      ▶️ {t.games.status.playNow}
                    </span>
                  </div>
                )}
              </>
            );

            if (game.playable && game.href) {
              return (
                <Link key={game.id} href={game.href} className="group block">
                  <AnimatedCard delay={index * 0.1} variant={game.color}>
                    {CardContent}
                  </AnimatedCard>
                </Link>
              );
            }

            return (
              <AnimatedCard key={game.id} delay={index * 0.1} variant={game.color}>
                {CardContent}
              </AnimatedCard>
            );
          })}
        </motion.div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="relative rounded-4xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* Watercolor background */}
          <div className="absolute inset-0 bg-gradient-to-br from-onde-cream via-white to-onde-cream" />
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at 20% 30%, rgba(255, 127, 127, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 70%, rgba(72, 201, 176, 0.12) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 50%, rgba(244, 208, 63, 0.1) 0%, transparent 60%)
              `,
            }}
          />

          {/* Content */}
          <div className="relative px-8 py-12 md:px-16 md:py-16 text-center">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                         bg-gradient-to-br from-onde-gold/20 to-onde-coral/20
                         mb-6"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-4xl">🚀</span>
            </motion.div>

            <motion.h3
              className="text-2xl md:text-3xl font-display font-bold text-onde-ocean mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {t.games.cta.title}
            </motion.h3>

            <motion.p
              className="text-lg text-onde-ocean/60 max-w-xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              {t.games.cta.subtitle}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Button href="/app" variant="teal">
                {t.games.cta.discoverApps}
              </Button>
              <Button href="/libri" variant="secondary">
                {t.games.cta.exploreBooks}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

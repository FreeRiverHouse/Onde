'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Portal from '@/components/Portal'
import PortalGallery from '@/components/PortalGallery'
import PortalHub from '@/components/PortalHub'
import EasterEggPortal, { KonamiPortal, CornerPortal } from '@/components/EasterEggPortal'
import SectionHeader from '@/components/ui/SectionHeader'
import { usePortalDiscovery } from '@/hooks/usePortalDiscovery'
import { useTranslations } from '@/i18n/I18nProvider'

export default function PortalsPage() {
  const t = useTranslations()
  const { mounted, getStats, reset, achievementUnlocked } = usePortalDiscovery()
  const [showSecretSection, setShowSecretSection] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const stats = getStats()

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
                       bg-gradient-to-br from-onde-teal to-onde-coral
                       shadow-xl shadow-onde-teal/30 mb-8"
          >
            <motion.span
              className="text-5xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            >
              🌀
            </motion.span>
          </motion.div>

          <SectionHeader
            badge="✨ Dimensional Travel"
            title="Portal System"
            subtitle="Journey between worlds through magical dimensional portals"
            gradient="teal"
          />

          {/* Achievement badge */}
          <AnimatePresence>
            {achievementUnlocked && (
              <motion.div
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                         bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <span>🏆</span> Portal Master Achievement Unlocked!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Portal Hub - Current World Navigation */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.h2
          className="text-2xl font-display font-bold text-onde-ocean text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🏝️ Gaming Island Portal Hub
        </motion.h2>

        <PortalHub currentWorld="gaming-island" />
      </section>

      {/* All Portals Gallery */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-display font-bold text-onde-ocean mb-4">
            📖 Portal Codex
          </h2>
          <p className="text-onde-ocean/60 max-w-lg mx-auto">
            Discover and collect all the dimensional portals. Some are hidden...
          </p>
        </motion.div>

        <PortalGallery 
          showSecrets={showSecretSection}
          onPortalEnter={(portalId) => console.log('Entering portal:', portalId)}
        />

        {/* Secret section toggle */}
        {mounted && stats.secrets > 0 && (
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <button
              onClick={() => setShowSecretSection(!showSecretSection)}
              className="px-6 py-3 rounded-2xl bg-purple-500/10 text-purple-600 font-semibold
                       hover:bg-purple-500/20 transition-colors"
            >
              {showSecretSection ? '🙈 Hide Secrets' : '🔮 Reveal Secret Portals'}
            </button>
          </motion.div>
        )}
      </section>

      {/* Easter Egg Demo Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-display font-bold text-onde-ocean mb-4">
            🥚 Hidden Portals
          </h2>
          <p className="text-onde-ocean/60 max-w-lg mx-auto">
            Some portals are hidden in plain sight. Can you find them all?
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Click to reveal Easter Egg */}
          <EasterEggPortal
            portalId="moonlight-secret"
            triggerType="click"
            onDiscover={() => console.log('Moonlight secret discovered!')}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl cursor-pointer"
          >
            <div className="text-center">
              <span className="text-4xl block mb-4">🌙</span>
              <h3 className="font-display font-bold text-onde-ocean mb-2">
                Moonlit Object
              </h3>
              <p className="text-sm text-onde-ocean/60">
                Click to reveal what hides in the moonlight...
              </p>
            </div>
          </EasterEggPortal>

          {/* Hover Easter Egg */}
          <EasterEggPortal
            portalId="rainbow-bridge"
            triggerType="hover"
            onDiscover={() => console.log('Rainbow bridge discovered!')}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl cursor-pointer"
          >
            <div className="text-center">
              <span className="text-4xl block mb-4">🌈</span>
              <h3 className="font-display font-bold text-onde-ocean mb-2">
                Rainbow Stone
              </h3>
              <p className="text-sm text-onde-ocean/60">
                Hover over this a few times...
              </p>
            </div>
          </EasterEggPortal>

          {/* Konami Code Easter Egg */}
          <KonamiPortal
            portalId="void-gateway"
            onDiscover={() => console.log('Void gateway discovered!')}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl"
          >
            <div className="text-center">
              <span className="text-4xl block mb-4">⌨️</span>
              <h3 className="font-display font-bold text-onde-ocean mb-2">
                Ancient Terminal
              </h3>
              <p className="text-sm text-onde-ocean/60">
                Enter the sacred code: ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA
              </p>
            </div>
          </KonamiPortal>
        </div>
      </section>

      {/* Portal Showcase - Individual Portals */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-display font-bold text-onde-ocean mb-4">
            🎨 Portal Styles
          </h2>
          <p className="text-onde-ocean/60 max-w-lg mx-auto">
            Each portal type has its own unique visual style and energy
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-16">
          <div className="flex flex-col items-center">
            <Portal portalId="gaming-to-library" size="lg" />
          </div>
          <div className="flex flex-col items-center">
            <Portal portalId="library-to-gaming" size="lg" />
          </div>
          <div className="flex flex-col items-center">
            <Portal portalId="game-hopper" size="lg" />
          </div>
        </div>
      </section>

      {/* Portal Sizes Demo */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-display font-bold text-onde-ocean mb-4">
            📐 Portal Sizes
          </h2>
        </motion.div>

        <div className="flex flex-wrap items-end justify-center gap-8">
          <div className="flex flex-col items-center">
            <Portal portalId="gaming-to-library" size="sm" showLabel={false} />
            <p className="mt-4 text-sm text-onde-ocean/60">Small</p>
          </div>
          <div className="flex flex-col items-center">
            <Portal portalId="gaming-to-library" size="md" showLabel={false} />
            <p className="mt-4 text-sm text-onde-ocean/60">Medium</p>
          </div>
          <div className="flex flex-col items-center">
            <Portal portalId="gaming-to-library" size="lg" showLabel={false} />
            <p className="mt-4 text-sm text-onde-ocean/60">Large</p>
          </div>
          <div className="flex flex-col items-center">
            <Portal portalId="gaming-to-library" size="xl" showLabel={false} />
            <p className="mt-4 text-sm text-onde-ocean/60">Extra Large</p>
          </div>
        </div>
      </section>

      {/* Reset Progress */}
      {mounted && stats.discovered > 0 && (
        <section className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <motion.div
            className="text-center p-6 rounded-3xl bg-red-50 border border-red-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-lg font-display font-bold text-red-900 mb-2">
              🔄 Reset Progress
            </h3>
            <p className="text-sm text-red-700/70 mb-4">
              Clear all portal discoveries and start fresh
            </p>
            
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-semibold
                         hover:bg-red-200 transition-colors"
              >
                Reset All Progress
              </button>
            ) : (
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    reset()
                    setShowResetConfirm(false)
                  }}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold
                           hover:bg-red-600 transition-colors"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-semibold
                           hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* Corner Portal Easter Egg */}
      <CornerPortal portalId="moonlight-secret" corner="bottom-right">
        <div />
      </CornerPortal>
    </div>
  )
}

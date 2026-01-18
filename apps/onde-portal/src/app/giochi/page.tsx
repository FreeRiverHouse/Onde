'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'
import AnimatedCard from '@/components/ui/AnimatedCard'
import Button from '@/components/ui/Button'

// Mini-giochi educativi
const miniGames = [
  {
    id: 'moonlight-magic-house',
    title: 'Moonlight Magic House',
    subtitle: 'Tamagotchi Moderno',
    description: 'Esplora la casa magica di Moonlight! Trascina il personaggio nelle stanze, gioca, mangia, dormi e guadagna monete.',
    icon: '/games/moonlight-magic-house/assets/backgrounds/house-map.jpg',
    iconFallback: '🌙',
    badge: 'Tamagotchi',
    color: 'gold' as const,
    features: ['Drag & Drop', 'Esplorazione', '2-6 anni'],
    status: 'Gioca Ora',
    playable: true,
    href: '/games/moonlight-magic-house/',  // Uses Next.js page that embeds the game
  },
  {
    id: 'chef-studio',
    title: 'Kids Chef Studio',
    subtitle: 'Cucina Virtuale',
    description: 'Cucina virtuale per piccoli chef. Ricette divertenti e sicure da preparare. Impara i fondamenti della cucina giocando.',
    icon: '/images/games/chef-placeholder.jpg',
    iconFallback: '👨‍🍳',
    badge: 'Educativo',
    color: 'gold' as const,
    features: ['50+ ricette', 'Step-by-step', 'Nessun rischio'],
    status: 'Prossimamente',
  },
  {
    id: 'art-studio',
    title: 'Pina Art Studio',
    subtitle: 'Disegno e Colori',
    description: "Disegna e colora con Pina Pennello. Impara tecniche ad acquarello, crea opere d'arte e sviluppa la creativita.",
    icon: '/images/games/art-placeholder.jpg',
    iconFallback: '🎨',
    badge: 'Creativo',
    color: 'teal' as const,
    features: ['Tecniche acquarello', 'Tutorial guidati', 'Galleria personale'],
    status: 'In sviluppo',
  },
  {
    id: 'puzzle-world',
    title: 'Puzzle World',
    subtitle: 'Rompicapi Creativi',
    description: 'Collezione di puzzle e rompicapi per tutte le eta. Allena il pensiero logico e la risoluzione di problemi.',
    icon: '/images/games/puzzle-placeholder.jpg',
    iconFallback: '🧩',
    badge: 'Logica',
    color: 'coral' as const,
    features: ['100+ livelli', 'Difficolta progressiva', 'Sfide giornaliere'],
    status: 'Prossimamente',
  },
  {
    id: 'music-maker',
    title: 'Music Maker Kids',
    subtitle: 'Crea Musica',
    description: 'Crea melodie e ritmi con strumenti virtuali. Esplora la musica, componi canzoni e impara le basi musicali.',
    icon: '/images/games/music-placeholder.jpg',
    iconFallback: '🎵',
    badge: 'Musicale',
    color: 'gold' as const,
    features: ['10 strumenti', 'Registra e condividi', 'Basi musicali'],
    status: 'In progettazione',
  },
  {
    id: 'nature-explorer',
    title: 'Nature Explorer',
    subtitle: 'Scopri la Natura',
    description: 'Esplora la natura attraverso giochi interattivi. Impara su piante, animali e ambiente in modo divertente.',
    icon: '/images/games/nature-placeholder.jpg',
    iconFallback: '🌿',
    badge: 'Natura',
    color: 'teal' as const,
    features: ['AR supportato', 'Enciclopedia', 'Quiz interattivi'],
    status: 'Prossimamente',
  },
  {
    id: 'word-play',
    title: 'Word Play',
    subtitle: 'Giochi di Parole',
    description: 'Giochi di parole e rime in italiano e inglese. Amplia il vocabolario divertendoti con le parole.',
    icon: '/images/games/words-placeholder.jpg',
    iconFallback: '📝',
    badge: 'Linguistico',
    color: 'coral' as const,
    features: ['Multilingua', 'Rime e filastrocche', 'Sfide quotidiane'],
    status: 'Prossimamente',
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
            badge="Divertimento Creativo"
            title="Giochi"
            subtitle="Esperienze interattive che stimolano creativita, logica e apprendimento. Sicuri per tutta la famiglia."
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
                  Coming Soon
                </motion.div>

                <motion.h3
                  className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  Emilio&apos;s World
                </motion.h3>

                <motion.p
                  className="text-lg md:text-xl text-white/70 max-w-lg mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Il server Minecraft ufficiale della community Onde. Costruisci, esplora e impara
                  insieme ad altri bambini in un ambiente sicuro e moderato, guidato da EMILIO!
                </motion.p>

                {/* Features */}
                <motion.div
                  className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  {['Moderato 24/7', 'Costruzioni collaborative', 'Eventi settimanali', 'Eta 6+'].map((feature) => (
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
                    <p className="text-xs text-white/50 mb-1">Versione</p>
                    <p className="text-xl font-bold text-white">1.21+</p>
                  </div>
                  <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm">
                    <p className="text-xs text-white/50 mb-1">Eta</p>
                    <p className="text-xl font-bold text-white">6+</p>
                  </div>
                  <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm">
                    <p className="text-xs text-white/50 mb-1">Status</p>
                    <p className="text-xl font-bold text-onde-gold">In arrivo</p>
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
          badge="Impara Giocando"
          title="Mini-Giochi Educativi"
          subtitle="Una collezione di giochi pensati per stimolare creativita, logica e apprendimento nei bambini."
          gradient="teal"
        />

        {/* Games Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12"
          variants={container}
          initial="show"
          animate="show"
        >
          {miniGames.map((game, index) => {
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
                      {game.badge}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium
                                      ${game.status === 'Gioca Ora'
                                        ? 'bg-green-500/20 text-green-600'
                                        : game.status === 'In sviluppo'
                                        ? 'bg-onde-teal/10 text-onde-teal'
                                        : 'bg-onde-gold/10 text-onde-gold-dark'
                                      }`}>
                      {game.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-display font-bold text-onde-ocean mb-1">
                  {game.title}
                </h3>
                <p className="text-sm text-onde-ocean/50 mb-3">{game.subtitle}</p>
                <p className="text-onde-ocean/60 leading-relaxed mb-4">
                  {game.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {game.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 rounded-lg text-xs bg-onde-cream text-onde-ocean/70"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Play button for playable games */}
                {'playable' in game && game.playable && (
                  <div className="mt-4 pt-4 border-t border-onde-ocean/10">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                                     bg-gradient-to-r from-onde-gold to-onde-coral
                                     text-white font-semibold text-sm
                                     group-hover:shadow-lg transition-shadow">
                      ▶️ Gioca Ora
                    </span>
                  </div>
                )}
              </>
            );

            if ('playable' in game && game.playable && 'href' in game) {
              return (
                <Link key={game.id} href={game.href as string} className="group block">
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
              Nuovi giochi in arrivo!
            </motion.h3>

            <motion.p
              className="text-lg text-onde-ocean/60 max-w-xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Stiamo lavorando a nuove esperienze di gioco educative.
              Seguici per rimanere aggiornato sulle novita!
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Button href="/app" variant="teal">
                Scopri le App
              </Button>
              <Button href="/libri" variant="secondary">
                Esplora i Libri
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

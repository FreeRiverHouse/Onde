'use client'

import { motion } from 'framer-motion'
import SectionHeader from '@/components/ui/SectionHeader'
import AnimatedCard from '@/components/ui/AnimatedCard'
import Button from '@/components/ui/Button'

const games = [
  {
    id: 'minecraft-onde',
    title: 'Minecraft Onde',
    subtitle: 'Server Community',
    description: 'Il server Minecraft ufficiale della community Onde. Costruisci, esplora e impara insieme ad altri bambini in un ambiente sicuro e moderato.',
    icon: '⛏️',
    badge: 'Community',
    color: 'coral' as const,
    features: ['Moderato 24/7', 'Costruzioni collaborative', 'Eventi settimanali'],
    status: 'Attivo',
  },
  {
    id: 'chef-studio',
    title: 'Kids Chef Studio',
    subtitle: 'Cucina Virtuale',
    description: 'Cucina virtuale per piccoli chef. Ricette divertenti e sicure da preparare. Impara i fondamenti della cucina giocando.',
    icon: '👨‍🍳',
    badge: 'Educativo',
    color: 'gold' as const,
    features: ['50+ ricette', 'Step-by-step', 'Nessun rischio'],
    status: 'Prossimamente',
  },
  {
    id: 'art-studio',
    title: 'Pina Art Studio',
    subtitle: 'Disegno e Colori',
    description: 'Disegna e colora con Pina Pennello. Impara tecniche ad acquarello, crea opere d\'arte e sviluppa la creativita.',
    icon: '🎨',
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
    icon: '🧩',
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
    icon: '🎵',
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
    icon: '🌿',
    badge: 'Natura',
    color: 'teal' as const,
    features: ['AR supportato', 'Enciclopedia', 'Quiz interattivi'],
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
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

        {/* Games Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {games.map((game, index) => (
            <AnimatedCard key={game.id} delay={index * 0.1} variant={game.color}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl
                                 bg-gradient-to-br from-onde-${game.color}/20 to-onde-${game.color}/5`}>
                  {game.icon}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold
                                   bg-onde-ocean/5 text-onde-ocean/60">
                    {game.badge}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium
                                    ${game.status === 'Attivo'
                                      ? 'bg-green-100 text-green-700'
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
              <div className="flex flex-wrap gap-2 mb-4">
                {game.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-1 rounded-lg text-xs bg-onde-cream text-onde-ocean/70"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* CTA */}
              {game.status === 'Attivo' && (
                <Button variant="gold" size="sm" className="w-full">
                  Gioca Ora
                </Button>
              )}
            </AnimatedCard>
          ))}
        </motion.div>
      </section>

      {/* Minecraft Server Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="relative rounded-4xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-onde-ocean via-onde-ocean-dark to-black" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Crect width='4' height='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative px-8 py-16 md:px-16 md:py-20">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 text-center md:text-left">
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                             bg-green-500/20 text-green-400 text-sm font-semibold mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Server Online
                </motion.div>

                <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                  Minecraft Onde Server
                </h3>
                <p className="text-lg text-white/70 max-w-lg mb-8">
                  Unisciti alla nostra community Minecraft! Un server sicuro e moderato
                  dove i bambini possono costruire, esplorare e imparare insieme.
                </p>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
                    <p className="text-xs text-white/50 mb-1">Giocatori Online</p>
                    <p className="text-2xl font-bold text-white">12</p>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
                    <p className="text-xs text-white/50 mb-1">Versione</p>
                    <p className="text-2xl font-bold text-white">1.21</p>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
                    <p className="text-xs text-white/50 mb-1">Eta</p>
                    <p className="text-2xl font-bold text-white">6+</p>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <motion.div
                  className="w-48 h-48 rounded-3xl bg-gradient-to-br from-onde-coral/20 to-onde-teal/20
                             flex items-center justify-center text-8xl"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 3, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ⛏️
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

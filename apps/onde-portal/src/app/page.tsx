'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'
import AnimatedCard from '@/components/ui/AnimatedCard'
import Button from '@/components/ui/Button'

// Data
const apps = [
  {
    id: 'emilio',
    title: 'EMILIO',
    description: 'Il robot amico che insegna ai bambini come funziona la tecnologia.',
    color: 'coral',
    icon: '🤖',
    status: 'Prossimamente',
  },
  {
    id: 'moonlight-puzzle',
    title: 'Moonlight Puzzle',
    description: 'Puzzle rilassanti sotto le stelle per la buonanotte.',
    color: 'teal',
    icon: '🌙',
    status: 'In sviluppo',
  },
  {
    id: 'word-play',
    title: 'Word Play',
    description: 'Giochi di parole e rime in italiano e inglese.',
    color: 'gold',
    icon: '📝',
    status: 'Prossimamente',
  },
]

const games = [
  {
    id: 'minecraft-onde',
    title: 'Minecraft Onde',
    description: 'Il server Minecraft della community Onde. Costruisci e impara.',
    image: '/games/minecraft.jpg',
    badge: 'Community',
  },
  {
    id: 'chef-studio',
    title: 'Kids Chef Studio',
    description: 'Cucina virtuale per piccoli chef. Ricette divertenti e sicure.',
    image: '/games/chef.jpg',
    badge: 'Educativo',
  },
  {
    id: 'art-studio',
    title: 'Pina Art Studio',
    description: 'Disegna e colora con Pina Pennello. Tecniche ad acquarello.',
    image: '/games/art.jpg',
    badge: 'Creativo',
  },
]

const featuredBooks = [
  {
    id: 'salmo-23',
    title: 'Il Pastore',
    author: 'Salmo 23',
    cover: '/books/salmo-23-cover.jpg',
    category: 'Spiritualita',
  },
  {
    id: 'aiko',
    title: 'AIKO - La Mia Amica Robot',
    author: 'Onde',
    cover: '/books/aiko-cover.jpg',
    category: 'Tech',
  },
  {
    id: 'piccole-rime',
    title: 'Piccole Rime',
    author: 'Poeti Italiani',
    cover: '/books/piccole-rime-cover.jpg',
    category: 'Poesia',
  },
  {
    id: 'alice',
    title: 'Alice nel Paese delle Meraviglie',
    author: 'Lewis Carroll',
    cover: '/books/alice-cover.jpg',
    category: 'Classici',
  },
]

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'Storie Illustrate',
    description: 'Libri con acquarelli originali. Ogni pagina e un quadro da sfogliare.',
    color: 'coral',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'App Educative',
    description: 'Tecnologia al servizio dell\'apprendimento. Sicure e senza pubblicita.',
    color: 'teal',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Giochi Creativi',
    description: 'Divertimento che stimola creativita e problem solving.',
    color: 'gold',
  },
]

export default function Home() {
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50])

  return (
    <div className="relative">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="text-center"
            style={{ y: heroY }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8
                         bg-gradient-to-r from-onde-coral/10 to-onde-gold/10
                         text-onde-coral text-sm font-semibold border border-onde-coral/20"
            >
              <span className="w-2 h-2 rounded-full bg-onde-coral animate-pulse" />
              Fatto con amore a Los Angeles
            </motion.div>

            {/* Main Title */}
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold
                         text-onde-ocean leading-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Storie che{' '}
              <span className="relative inline-block">
                <span className="text-gradient-sunset">crescono</span>
                <motion.svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                >
                  <motion.path
                    d="M0 6 Q50 0 100 6 T200 6"
                    fill="none"
                    stroke="url(#brushGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="brushGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF7F7F" />
                      <stop offset="50%" stopColor="#F4D03F" />
                      <stop offset="100%" stopColor="#48C9B0" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </span>
              <br />
              con te
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl md:text-2xl text-onde-ocean/60 max-w-2xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Libri illustrati ad acquarello, app educative e giochi
              per far fiorire immaginazione e curiosita.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button href="/libri" variant="primary" size="lg">
                Esplora i Libri
              </Button>
              <Button href="/app" variant="secondary" size="lg">
                Scopri le App
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-1/4 left-10 w-16 h-16 rounded-2xl bg-onde-coral/20
                     backdrop-blur-sm border border-onde-coral/30 hidden lg:flex
                     items-center justify-center text-3xl"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          📚
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-16 w-14 h-14 rounded-2xl bg-onde-teal/20
                     backdrop-blur-sm border border-onde-teal/30 hidden lg:flex
                     items-center justify-center text-2xl"
          animate={{
            y: [0, 12, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          🤖
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-12 h-12 rounded-2xl bg-onde-gold/20
                     backdrop-blur-sm border border-onde-gold/30 hidden lg:flex
                     items-center justify-center text-xl"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 8, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        >
          🎮
        </motion.div>
      </section>

      {/* ============================================
          FEATURES SECTION
          ============================================ */}
      <section className="relative py-24 bg-gradient-to-b from-transparent to-onde-cream/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedCard key={feature.title} delay={index * 0.1} variant={feature.color as 'coral' | 'gold' | 'teal'}>
                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center
                                 bg-onde-${feature.color}/10 text-onde-${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-display font-bold text-onde-ocean mb-3">
                  {feature.title}
                </h3>
                <p className="text-onde-ocean/60 leading-relaxed">
                  {feature.description}
                </p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          APP SECTION
          ============================================ */}
      <section id="app" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="App Educative"
            title="App"
            subtitle="Tecnologia pensata per i bambini. Sicura, educativa, senza pubblicita."
            gradient="teal"
          />

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {apps.map((app, index) => (
              <AnimatedCard key={app.id} delay={index * 0.1} variant={app.color as 'coral' | 'gold' | 'teal'}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{app.icon}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold
                                   bg-onde-ocean/5 text-onde-ocean/60">
                    {app.status}
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-onde-ocean mb-2">
                  {app.title}
                </h3>
                <p className="text-onde-ocean/60 leading-relaxed">
                  {app.description}
                </p>
              </AnimatedCard>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Button href="/app" variant="teal">
              Vedi Tutte le App
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          GAMES SECTION
          ============================================ */}
      <section id="giochi" className="relative py-24 bg-gradient-to-b from-onde-cream/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Divertimento Creativo"
            title="Giochi"
            subtitle="Esperienze interattive che stimolano creativita e apprendimento."
            gradient="gold"
          />

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {games.map((game, index) => (
              <AnimatedCard key={game.id} delay={index * 0.1} variant="gold">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-onde-gold/20 to-onde-coral/10
                                mb-6 flex items-center justify-center overflow-hidden relative">
                  <span className="text-6xl opacity-50">🎮</span>
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold
                                   bg-white/80 backdrop-blur-sm text-onde-ocean">
                    {game.badge}
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-onde-ocean mb-2">
                  {game.title}
                </h3>
                <p className="text-onde-ocean/60 leading-relaxed">
                  {game.description}
                </p>
              </AnimatedCard>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Button href="/giochi" variant="gold">
              Esplora i Giochi
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          BOOKS SECTION
          ============================================ */}
      <section id="libri" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Libreria Illustrata"
            title="Libri"
            subtitle="I grandi classici e storie originali, illustrati con cura artigianale."
            gradient="coral"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {featuredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/libro/${book.id}`}>
                  <motion.div
                    className="group relative"
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Book Cover */}
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4 relative
                                    bg-gradient-to-br from-onde-coral/10 to-onde-teal/10
                                    shadow-card group-hover:shadow-card-hover transition-shadow duration-300">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl opacity-30">📖</span>
                      </div>
                      <span className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-medium
                                       bg-white/80 backdrop-blur-sm text-onde-ocean">
                        {book.category}
                      </span>
                    </div>

                    {/* Book Info */}
                    <h3 className="font-display font-bold text-onde-ocean mb-1 group-hover:text-onde-coral transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-onde-ocean/50">{book.author}</p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Button href="/libri" variant="primary">
              Vai alla Libreria
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative rounded-4xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-onde-ocean to-onde-ocean-dark" />
            <div className="absolute inset-0 opacity-30"
                 style={{
                   backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255, 127, 127, 0.3) 0%, transparent 50%),
                                     radial-gradient(circle at 80% 70%, rgba(72, 201, 176, 0.2) 0%, transparent 50%)`
                 }}
            />

            {/* Content */}
            <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
              <motion.h2
                className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Pronto a esplorare?
              </motion.h2>
              <motion.p
                className="text-lg text-white/70 max-w-xl mx-auto mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Unisciti alla community Onde. Storie, app e giochi che crescono con te e la tua famiglia.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Button href="/libri" variant="primary" size="lg">
                  Inizia a Leggere
                </Button>
                <Button
                  href="https://twitter.com/Onde_FRH"
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/10"
                >
                  Seguici su X
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

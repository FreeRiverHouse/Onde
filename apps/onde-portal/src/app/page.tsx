'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'
import AnimatedCard from '@/components/ui/AnimatedCard'
import Button from '@/components/ui/Button'

// Data - I Nostri Libri
const featuredBooks = [
  {
    id: 'salmo-23',
    title: 'Il Pastore',
    subtitle: 'Salmo 23 per Bambini',
    cover: '/books/salmo-23-cover.jpg',
    category: 'Spiritualità',
    color: 'gold',
    description: 'Il Salmo più amato, illustrato con cura per i piccoli.',
  },
  {
    id: 'aiko',
    title: 'AIKO',
    subtitle: 'La Mia Amica Robot',
    cover: '/books/aiko-cover.jpg',
    category: 'Tech',
    color: 'teal',
    description: 'Come funziona l\'intelligenza artificiale? Sofia lo scopre con AIKO.',
  },
  {
    id: 'piccole-rime',
    title: 'Piccole Rime',
    subtitle: 'Poesie Italiane',
    cover: '/books/piccole-rime-cover.jpg',
    category: 'Poesia',
    color: 'coral',
    description: 'Le più belle filastrocche della tradizione italiana.',
  },
  {
    id: 'alice',
    title: 'Alice',
    subtitle: 'Nel Paese delle Meraviglie',
    cover: '/books/alice-cover.jpg',
    category: 'Classici',
    color: 'teal',
    description: 'Il capolavoro di Carroll, illustrato in stile acquarello.',
  },
]

// Data - Le Nostre App
const apps = [
  {
    id: 'emilio',
    title: 'EMILIO',
    description: 'Il robot amico che insegna ai bambini come funziona la tecnologia. Lezioni interattive e divertenti.',
    color: 'coral',
    icon: '🤖',
    status: 'Prossimamente',
    features: ['AI Educator', 'Lezioni Interattive', 'Per Bambini 5-12'],
  },
  {
    id: 'moonlight-puzzle',
    title: 'Moonlight Puzzle',
    description: 'Puzzle rilassanti sotto le stelle per la buonanotte. Suoni della natura e musica dolce.',
    color: 'teal',
    icon: '🌙',
    status: 'In sviluppo',
    features: ['Puzzle Rilassanti', 'Suoni Natura', 'Modalità Notte'],
  },
  {
    id: 'word-play',
    title: 'Word Play',
    description: 'Giochi di parole e rime in italiano e inglese. Impara giocando!',
    color: 'gold',
    icon: '📝',
    status: 'Prossimamente',
    features: ['Multilingua', 'Giochi di Parole', 'Educativo'],
  },
]

// Data - Giochi
const games = [
  {
    id: 'minecraft-onde',
    title: 'Minecraft Onde',
    description: 'Il server Minecraft della community Onde. Costruisci e impara insieme.',
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

// Features section data
const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'Storie Illustrate',
    description: 'Libri con acquarelli originali. Ogni pagina è un quadro da sfogliare.',
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
    description: 'Tecnologia al servizio dell\'apprendimento. Sicure e senza pubblicità.',
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
    description: 'Divertimento che stimola creatività e problem solving.',
    color: 'gold',
  },
]

export default function Home() {
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50])

  return (
    <div className="relative overflow-hidden">
      {/* ============================================
          HERO SECTION - Impattante con Acquarello
          ============================================ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Watercolor Background Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large coral blob top-left */}
          <motion.div
            className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(255,127,127,0.4) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Gold blob center-right */}
          <motion.div
            className="absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full opacity-25"
            style={{
              background: 'radial-gradient(circle, rgba(244,208,63,0.5) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
            animate={{
              scale: [1, 1.15, 1],
              x: [0, -40, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />

          {/* Teal blob bottom-left */}
          <motion.div
            className="absolute bottom-20 left-1/4 w-[400px] h-[400px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(72,201,176,0.4) 0%, transparent 70%)',
              filter: 'blur(70px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -40, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          />

          {/* Ocean blob bottom-right */}
          <motion.div
            className="absolute -bottom-20 right-1/4 w-[350px] h-[350px] rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, rgba(27,79,114,0.3) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </div>

        {/* Wave Pattern SVG Background */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none opacity-40">
          <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" className="w-full h-full">
            <motion.path
              d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,30 1440,60 L1440,120 L0,120 Z"
              fill="url(#waveGradient)"
              initial={{ d: "M0,60 C360,120 720,0 1080,60 C1260,90 1380,30 1440,60 L1440,120 L0,120 Z" }}
              animate={{
                d: [
                  "M0,60 C360,120 720,0 1080,60 C1260,90 1380,30 1440,60 L1440,120 L0,120 Z",
                  "M0,80 C360,20 720,100 1080,40 C1260,60 1380,80 1440,50 L1440,120 L0,120 Z",
                  "M0,60 C360,120 720,0 1080,60 C1260,90 1380,30 1440,60 L1440,120 L0,120 Z",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF7F7F" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#F4D03F" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#48C9B0" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <motion.div
            className="text-center"
            style={{ y: heroY }}
          >
            {/* Badge con Onde animate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-10
                         bg-white/60 backdrop-blur-md
                         text-onde-ocean text-sm font-semibold
                         border border-onde-coral/30 shadow-watercolor"
            >
              <motion.span
                className="flex gap-1"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-onde-coral">~</span>
                <span className="text-onde-gold">~</span>
                <span className="text-onde-teal">~</span>
              </motion.span>
              Los Angeles
              <motion.span
                className="flex gap-1"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <span className="text-onde-teal">~</span>
                <span className="text-onde-gold">~</span>
                <span className="text-onde-coral">~</span>
              </motion.span>
            </motion.div>

            {/* Main Title - Grande e Impattante */}
            <motion.h1
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-bold
                         text-onde-ocean leading-[0.9] mb-8"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="block">Storie che</span>
              <span className="relative inline-block mt-2">
                <span className="text-gradient-sunset">crescono</span>
                {/* Brush stroke effect */}
                <motion.svg
                  className="absolute -bottom-4 left-0 w-full h-6"
                  viewBox="0 0 300 20"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 1 }}
                >
                  <motion.path
                    d="M5 10 Q75 2 150 10 T295 10"
                    fill="none"
                    stroke="url(#brushStroke)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    style={{ filter: 'blur(0.5px)' }}
                  />
                  <defs>
                    <linearGradient id="brushStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF7F7F" />
                      <stop offset="50%" stopColor="#F4D03F" />
                      <stop offset="100%" stopColor="#48C9B0" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </span>
              <span className="block mt-2">con te</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl md:text-2xl lg:text-3xl text-onde-ocean/60 max-w-3xl mx-auto mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Libri illustrati ad acquarello, app educative e giochi
              per far fiorire <span className="text-onde-coral font-medium">immaginazione</span> e <span className="text-onde-teal font-medium">curiosità</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <Button href="#libri" variant="primary" size="lg">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Esplora i Libri
                </span>
              </Button>
              <Button href="#app" variant="secondary" size="lg">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Scopri le App
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Decorative Elements */}
        <motion.div
          className="absolute top-1/4 left-10 w-20 h-20 rounded-3xl bg-white/60
                     backdrop-blur-sm border border-onde-coral/30 hidden lg:flex
                     items-center justify-center text-4xl shadow-watercolor"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          📚
        </motion.div>

        <motion.div
          className="absolute top-1/3 right-16 w-16 h-16 rounded-2xl bg-white/60
                     backdrop-blur-sm border border-onde-teal/30 hidden lg:flex
                     items-center justify-center text-3xl shadow-watercolor"
          animate={{
            y: [0, 15, 0],
            rotate: [0, -8, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          🤖
        </motion.div>

        <motion.div
          className="absolute bottom-1/3 left-1/4 w-14 h-14 rounded-2xl bg-white/60
                     backdrop-blur-sm border border-onde-gold/30 hidden lg:flex
                     items-center justify-center text-2xl shadow-watercolor"
          animate={{
            y: [0, -12, 0],
            rotate: [0, 10, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        >
          🎨
        </motion.div>

        <motion.div
          className="absolute bottom-1/4 right-1/4 w-12 h-12 rounded-xl bg-white/60
                     backdrop-blur-sm border border-onde-coral/30 hidden lg:flex
                     items-center justify-center text-xl shadow-watercolor"
          animate={{
            y: [0, -10, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        >
          🌙
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ opacity: { delay: 1.5 }, y: { duration: 2, repeat: Infinity } }}
        >
          <div className="flex flex-col items-center gap-2 text-onde-ocean/40">
            <span className="text-sm font-medium">Scorri</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* ============================================
          FEATURES SECTION
          ============================================ */}
      <section className="relative py-24 bg-gradient-to-b from-transparent via-onde-cream/30 to-transparent">
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
          I NOSTRI LIBRI - Book Cards Section
          ============================================ */}
      <section id="libri" className="relative py-24">
        {/* Watercolor accent */}
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none opacity-20">
          <div
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,127,127,0.4) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader
            badge="Libreria Illustrata"
            title="I Nostri Libri"
            subtitle="Storie classiche e originali, illustrate con acquarelli in stile europeo. Ogni libro è un'opera d'arte da sfogliare."
            gradient="coral"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {featuredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Link href={`/libro/${book.id}`}>
                  <motion.div
                    className="group relative"
                    whileHover={{ y: -12 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Book Cover with 3D effect */}
                    <div className="relative">
                      {/* Book shadow */}
                      <div className="absolute -bottom-4 left-4 right-4 h-8 bg-onde-ocean/10 rounded-lg blur-xl
                                      group-hover:bg-onde-ocean/20 transition-all duration-300" />

                      {/* Cover */}
                      <div className={`aspect-[3/4] rounded-2xl overflow-hidden relative
                                      bg-gradient-to-br from-onde-${book.color}/20 to-onde-${book.color}/5
                                      border-2 border-white/60 shadow-card group-hover:shadow-card-hover
                                      transition-all duration-300`}
                      >
                        {/* Placeholder illustration */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.span
                            className="text-7xl opacity-40"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            📖
                          </motion.span>
                        </div>

                        {/* Watercolor overlay effect */}
                        <div className="absolute inset-0 opacity-30 pointer-events-none"
                             style={{
                               background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 50%),
                                           radial-gradient(circle at 70% 70%, rgba(244,208,63,0.2) 0%, transparent 40%)`,
                             }}
                        />

                        {/* Category badge */}
                        <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold
                                         bg-white/90 backdrop-blur-sm text-onde-ocean shadow-sm`}>
                          {book.category}
                        </span>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-onde-ocean/60 via-transparent to-transparent
                                        opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                        flex items-end p-4">
                          <span className="text-white text-sm font-medium">
                            Scopri di più
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Book Info */}
                    <div className="mt-6 text-center">
                      <h3 className="font-display font-bold text-lg text-onde-ocean group-hover:text-onde-coral transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm text-onde-ocean/50 mt-1">{book.subtitle}</p>
                      <p className="text-sm text-onde-ocean/60 mt-2 line-clamp-2">{book.description}</p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-16"
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
          LE NOSTRE APP - App Cards Section
          ============================================ */}
      <section id="app" className="relative py-24 bg-gradient-to-b from-onde-cream/30 via-transparent to-onde-cream/30">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 pointer-events-none opacity-20">
          <div
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(72,201,176,0.5) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader
            badge="App Educative"
            title="Le Nostre App"
            subtitle="Tecnologia pensata per i bambini. Sicura, educativa, senza pubblicità. Impara giocando!"
            gradient="teal"
          />

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {apps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
              >
                <div className={`relative bg-white/80 backdrop-blur-sm rounded-3xl p-8
                               border-2 border-onde-${app.color}/20
                               hover:border-onde-${app.color}/40 hover:shadow-glow-${app.color}
                               shadow-card hover:shadow-card-hover
                               transition-all duration-300 h-full group`}
                >
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                  bg-gradient-to-br from-onde-${app.color}/5 to-transparent pointer-events-none`} />

                  {/* Header */}
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <motion.div
                      className={`w-16 h-16 rounded-2xl bg-onde-${app.color}/10
                                  flex items-center justify-center text-4xl
                                  group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      {app.icon}
                    </motion.div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold
                                     bg-onde-${app.color}/10 text-onde-${app.color} border border-onde-${app.color}/20`}>
                      {app.status}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-2xl font-display font-bold text-onde-ocean mb-3">
                      {app.title}
                    </h3>
                    <p className="text-onde-ocean/60 leading-relaxed mb-6">
                      {app.description}
                    </p>

                    {/* Features tags */}
                    <div className="flex flex-wrap gap-2">
                      {app.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-3 py-1 rounded-full text-xs font-medium
                                   bg-onde-ocean/5 text-onde-ocean/70"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-16"
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
      <section id="giochi" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Divertimento Creativo"
            title="Giochi"
            subtitle="Esperienze interattive che stimolano creatività e apprendimento."
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
          CTA SECTION - Join Onde
          ============================================ */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative rounded-4xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Background con onde */}
            <div className="absolute inset-0 bg-gradient-to-br from-onde-ocean via-onde-ocean-dark to-onde-ocean" />

            {/* Watercolor accents */}
            <div className="absolute inset-0 opacity-40 pointer-events-none"
                 style={{
                   backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255, 127, 127, 0.3) 0%, transparent 50%),
                                     radial-gradient(circle at 80% 70%, rgba(72, 201, 176, 0.2) 0%, transparent 50%),
                                     radial-gradient(circle at 50% 50%, rgba(244, 208, 63, 0.15) 0%, transparent 40%)`
                 }}
            />

            {/* Wave decoration */}
            <div className="absolute top-0 left-0 right-0 h-16 opacity-20 overflow-hidden">
              <svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none" className="w-full h-full">
                <path
                  d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,15 1440,30 L1440,0 L0,0 Z"
                  fill="white"
                />
              </svg>
            </div>

            {/* Content */}
            <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6
                           bg-white/10 text-white/80 text-sm font-medium border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="w-2 h-2 rounded-full bg-onde-coral animate-pulse" />
                Unisciti alla Community
              </motion.div>

              <motion.h2
                className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Pronto a <span className="text-onde-gold">esplorare</span>?
              </motion.h2>

              <motion.p
                className="text-lg md:text-xl text-white/70 max-w-xl mx-auto mb-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Storie, app e giochi che crescono con te e la tua famiglia.
                Seguici per scoprire le novità!
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
                  className="text-white hover:bg-white/10 border border-white/20"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
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

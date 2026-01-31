'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { 
  GradientText, 
  Card3D, 
  GlowingCard, 
  BentoGrid, 
  BentoGridItem, 
  FloatingDock,
  SpotlightBeam,
  MovingBorder,
  WavyBackground
} from '@/components/ui/aceternity'
import { useTranslations } from '@/i18n'

// Particle for ambient background - Ocean bubbles
function Particle({ index }: { index: number }) {
  // Ocean colors - soft blues, teals, and sparkles
  const colors = ['#5EEAD4', '#67E8F9', '#A5F3FC', '#FFFFFF', '#FDE68A']
  const color = colors[index % colors.length]
  
  const [values, setValues] = useState({ x: 50, size: 3, delay: 0, duration: 20 })
  useEffect(() => {
    setValues({
      x: Math.random() * 100,
      size: 3 + Math.random() * 8,
      delay: Math.random() * 20,
      duration: 12 + Math.random() * 18
    })
  }, [])

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${values.x}%`,
        width: values.size,
        height: values.size,
        background: color,
        boxShadow: `0 0 ${values.size * 4}px ${color}`,
      }}
      initial={{ y: '110vh', opacity: 0 }}
      animate={{ y: '-10vh', opacity: [0, 0.9, 0.9, 0] }}
      transition={{
        duration: values.duration,
        delay: values.delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

// Books data
const books = [
  {
    id: 'meditations',
    title: 'Meditations',
    subtitle: 'Thoughts to Himself',
    author: 'Marcus Aurelius',
    description: 'The private reflections of the Roman Emperor. A timeless guide to Stoic philosophy and inner peace.',
    category: 'Philosophy',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    cover: '/books/meditations-cover.jpg',
    pdfUrl: '/books/meditations-en.pdf',
  },
  {
    id: 'shepherds-promise',
    title: "The Shepherd's Promise",
    subtitle: 'Psalm 23 for Children',
    author: 'Biblical Tradition',
    description: 'The most beloved Psalm, beautifully illustrated for young readers.',
    category: 'Spirituality',
    gradient: 'from-emerald-400 via-green-500 to-teal-600',
    cover: '/books/shepherds-promise-cover.jpg',
    pdfUrl: '/books/the-shepherds-promise.pdf',
  },
]

// Features for Bento Grid - will be populated with translations in component
const featureIcons = ["📚", "🚀", "📱", "🎨"]
const featureClassNames = ["md:col-span-2", "", "", "md:col-span-2"]

// Dock items
const dockItems = [
  { title: "Books", icon: "📚", href: "#books" },
  { title: "Games", icon: "🎮", href: "/games" },
  { title: "VR", icon: "🥽", href: "/vr" },
  { title: "About", icon: "✨", href: "#about" },
]

// Announcements data
const announcements = [
  {
    id: 'gaming-island',
    emoji: '🎮',
    text: 'New: Gaming Island!',
    description: 'Explore our collection of fun games',
    href: '/games',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'vr-experience',
    emoji: '🥽',
    text: 'VR Experiences Available!',
    description: 'Immersive virtual reality adventures',
    href: '/vr',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'free-books',
    emoji: '📚',
    text: 'Free Books During Launch!',
    description: 'Download beautiful illustrated books',
    href: '#books',
    gradient: 'from-amber-500 to-orange-500',
  },
]

const DISMISSED_KEY = 'onde-announcements-dismissed'

// Announcements Banner Component
function AnnouncementsBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDismissed, setIsDismissed] = useState(true) // Start hidden to avoid flash
  const [isHovered, setIsHovered] = useState(false)

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed) {
      const dismissedData = JSON.parse(dismissed)
      // Check if dismissed less than 24 hours ago
      if (Date.now() - dismissedData.timestamp < 24 * 60 * 60 * 1000) {
        setIsDismissed(true)
        return
      }
    }
    setIsDismissed(false)
  }, [])

  // Auto-rotate announcements
  useEffect(() => {
    if (isDismissed || isHovered) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isDismissed, isHovered])

  const handleDismiss = useCallback(() => {
    setIsDismissed(true)
    localStorage.setItem(DISMISSED_KEY, JSON.stringify({ timestamp: Date.now() }))
  }, [])

  if (isDismissed) return null

  const current = announcements[currentIndex]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`bg-gradient-to-r ${current.gradient} shadow-lg`}>
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Announcement Content */}
              <Link 
                href={current.href}
                className="flex-1 flex items-center justify-center gap-3 group"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3"
                  >
                    <motion.span 
                      className="text-2xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      {current.emoji}
                    </motion.span>
                    <span className="text-white font-bold text-sm sm:text-base">
                      {current.text}
                    </span>
                    <span className="hidden sm:inline text-white/80 text-sm">
                      — {current.description}
                    </span>
                    <motion.span 
                      className="text-white/90 text-lg group-hover:translate-x-1 transition-transform"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </motion.div>
                </AnimatePresence>
              </Link>

              {/* Indicators */}
              <div className="hidden sm:flex items-center gap-1.5">
                {announcements.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentIndex 
                        ? 'bg-white scale-125' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Go to announcement ${i + 1}`}
                  />
                ))}
              </div>

              {/* Dismiss Button */}
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white"
                aria-label="Dismiss announcements"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function Home() {
  const t = useTranslations()
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.9])
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -150])
  const particles = useMemo(() => Array.from({ length: 50 }, (_, i) => i), [])
  
  // Features with translations
  const features = [
    {
      title: t.home.featuresNew.beautifulBooks.title,
      description: t.home.featuresNew.beautifulBooks.description,
      icon: "📚",
      className: "md:col-span-2",
    },
    {
      title: t.home.featuresNew.freeDuringLaunch.title,
      description: t.home.featuresNew.freeDuringLaunch.description,
      icon: "🚀",
    },
    {
      title: t.home.featuresNew.multiFormat.title,
      description: t.home.featuresNew.multiFormat.description,
      icon: "📱",
    },
    {
      title: t.home.featuresNew.aiEnhanced.title,
      description: t.home.featuresNew.aiEnhanced.description,
      icon: "🎨",
      className: "md:col-span-2",
    },
  ]

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(180deg, #E8F4F8 0%, #D4EEF2 30%, #B8E0E8 60%, #A8D8E0 100%)' }}>
      {/* ============================================
          GLOBAL BACKGROUND - Ocean Relaxing + Kids Friendly
          ============================================ */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Soft ocean gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #E8F4F8 0%, #D4EEF2 30%, #B8E0E8 60%, #A8D8E0 100%)' }} />
        
        {/* Warm sun glow */}
        <div className="absolute -top-40 right-1/4 w-[600px] h-[600px] bg-amber-300/30 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -left-20 w-[500px] h-[500px] bg-cyan-300/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-300/25 rounded-full blur-[90px]" />
        
        {/* Playful wave pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q25 0 50 10 T100 10' stroke='%235B9AA0' fill='none' stroke-width='2'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 20px',
          }}
        />
        
        {/* Floating particles - ocean bubbles */}
        {particles.map((i) => <Particle key={i} index={i} />)}
      </div>

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-20">
        <SpotlightBeam className="-top-40 left-1/4" fill="#D4AF37" />
        <SpotlightBeam className="-top-20 right-1/4" fill="#5B9AA0" />
        
        <motion.div
          className="relative z-10 max-w-6xl mx-auto px-4 text-center"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-white shadow-lg backdrop-blur-xl mb-8"
          >
            <span className="text-2xl">🌊</span>
            <span className="text-teal-700 text-sm font-medium">{t.home.badge} 🌊</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-bold leading-[0.85] mb-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <GradientText colors={["#0D9488", "#D97706", "#EC4899", "#0D9488"]}>
              {t.home.hero.code}
            </GradientText>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-teal-600/80 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {t.home.hero.subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link 
              href="#books"
              className="group px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-lg rounded-full shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>{t.home.hero.exploreBooks}</span>
              <span className="text-xl group-hover:rotate-12 transition-transform">📚</span>
            </Link>
            
            <Link 
              href="/games"
              className="group px-8 py-4 bg-white/80 backdrop-blur text-teal-700 font-bold text-lg border-2 border-teal-300 rounded-full hover:bg-white hover:border-teal-400 hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>{t.home.hero.playGames}</span>
              <span className="text-xl group-hover:animate-bounce">🎮</span>
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1, y: { duration: 1.5, repeat: Infinity } }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-teal-500 text-sm font-medium">{t.home.hero.scrollHint}</span>
              <motion.span 
                className="text-2xl"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🐠
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================
          FEATURES BENTO GRID
          ============================================ */}
      <section className="relative py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-amber-500 text-sm font-medium tracking-wider uppercase flex items-center justify-center gap-2">
              <span>🌟</span> {t.home.whyOnde.badge} <span>🌟</span>
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-teal-800 mt-4 mb-6">
              {t.home.whyOnde.title}
            </h2>
            <p className="text-teal-600/70 max-w-xl mx-auto">
              {t.home.whyOnde.subtitle}
            </p>
          </motion.div>

          <BentoGrid>
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <BentoGridItem
                  title={feature.title}
                  description={feature.description}
                  icon={<span className="text-4xl">{feature.icon}</span>}
                  className={feature.className}
                />
              </motion.div>
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* ============================================
          BOOKS SECTION
          ============================================ */}
      <section id="books" className="relative py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-amber-500 text-sm font-medium tracking-wider uppercase flex items-center justify-center gap-2">
              <span>📖</span> {t.home.library.badge} <span>📖</span>
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-teal-800 mt-4 mb-6">
              {t.home.library.title}
            </h2>
            <p className="text-teal-600/70 max-w-xl mx-auto">
              {t.home.library.subtitle}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card3D containerClassName="h-full">
                  <GlowingCard 
                    className="h-full"
                    glowColor={book.gradient.includes('amber') ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}
                  >
                    <div className="bg-white/90 backdrop-blur-xl border-2 border-teal-200 rounded-2xl overflow-hidden shadow-xl">
                      {/* Cover */}
                      <div className={`aspect-[16/10] relative bg-gradient-to-br ${book.gradient}`}>
                        <Image
                          src={book.cover}
                          alt={book.title}
                          fill
                          className="object-contain p-8 drop-shadow-2xl"
                        />
                        
                        {/* Category badge */}
                        <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-teal-700 shadow-md">
                          {book.category}
                        </span>
                        
                        {/* Free badge */}
                        <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-md flex items-center gap-1">
                          <span>✨</span> {t.home.library.free}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="p-8">
                        <h3 className="text-2xl font-bold text-teal-800 mb-1">{book.title}</h3>
                        <p className="text-amber-600 text-sm mb-1">{book.subtitle}</p>
                        <p className="text-teal-500 text-xs mb-4">by {book.author}</p>
                        <p className="text-teal-600/70 text-sm leading-relaxed mb-8">
                          {book.description}
                        </p>

                        <a
                          href={book.pdfUrl}
                          download
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all hover:scale-105"
                        >
                          <span>📥</span>
                          {t.home.library.downloadPdf}
                        </a>
                      </div>
                    </div>
                  </GlowingCard>
                </Card3D>
              </motion.div>
            ))}
          </div>

          {/* See all books link */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link 
              href="/libri"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-800 transition-colors group font-medium"
            >
              <span>{t.home.library.viewAll}</span>
              <motion.span 
                className="inline-block text-xl"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                📚
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="p-12 md:p-20 text-center bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-teal-200 shadow-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-6xl mb-6 block">{t.home.ctaNew.emoji}</span>
              <h2 className="text-3xl md:text-5xl font-bold text-teal-800 mb-6">
                {t.home.ctaNew.title}
              </h2>
              <p className="text-teal-600/70 text-lg mb-10 max-w-lg mx-auto">
                {t.home.ctaNew.subtitle}
              </p>
              <Link 
                href="/libri"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white font-bold text-lg rounded-full hover:shadow-xl hover:shadow-teal-500/30 transition-all transform hover:scale-105"
              >
                <span>{t.home.ctaNew.button}</span>
                <span className="text-2xl">📖</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 border-t border-teal-200">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-teal-500 text-sm flex items-center justify-center gap-2">
            <span>🌊</span>
            {t.home.footerNew.copyright}
            <span>☀️</span>
          </p>
        </div>
      </footer>

      {/* Floating Dock */}
      <FloatingDock items={dockItems} />
    </div>
  )
}

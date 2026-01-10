'use client'

import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useRef, useState, useMemo } from 'react'
import { useTranslations } from '@/i18n'

// Particle component for floating background particles
function Particle({ index }: { index: number }) {
  const randomX = useMemo(() => Math.random() * 100, [])
  const randomDelay = useMemo(() => Math.random() * 20, [])
  const randomDuration = useMemo(() => 15 + Math.random() * 15, [])
  const randomSize = useMemo(() => 2 + Math.random() * 4, [])
  const colors = ['#4ECDC4', '#6C63FF', '#A855F7', '#FF6B6B', '#FFD93D']
  const color = useMemo(() => colors[index % colors.length], [index])

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${randomX}%`,
        width: randomSize,
        height: randomSize,
        background: color,
        boxShadow: `0 0 ${randomSize * 3}px ${color}`,
      }}
      initial={{ y: '110vh', opacity: 0 }}
      animate={{
        y: '-10vh',
        opacity: [0, 0.8, 0.8, 0],
      }}
      transition={{
        duration: randomDuration,
        delay: randomDelay,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

// 3D Tilt Card Component
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95])
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100])
  const t = useTranslations()

  // Generate particle indices
  const particleIndices = useMemo(() => Array.from({ length: 40 }, (_, i) => i), [])

  // Data - Featured Books
  const featuredBooks = [
    {
      id: 'salmo-23',
      title: t.books.bookTitles.salmo23.title,
      subtitle: t.books.bookTitles.salmo23.subtitle,
      cover: '/books/salmo-23-cover.jpg',
      category: t.books.categories.spirituality,
      gradient: 'from-amber-500 to-orange-600',
      description: t.books.bookTitles.salmo23.description,
    },
    {
      id: 'aiko',
      title: t.books.bookTitles.aiko.title,
      subtitle: t.books.bookTitles.aiko.subtitle,
      cover: '/books/aiko-cover.jpg',
      category: t.books.categories.tech,
      gradient: 'from-cyan-500 to-blue-600',
      description: t.books.bookTitles.aiko.description,
    },
    {
      id: 'piccole-rime',
      title: t.books.bookTitles.piccoleRime.title,
      subtitle: t.books.bookTitles.piccoleRime.subtitle,
      cover: '/books/piccole-rime-cover.jpg',
      category: t.books.categories.poetry,
      gradient: 'from-pink-500 to-rose-600',
      description: t.books.bookTitles.piccoleRime.description,
    },
    {
      id: 'alice',
      title: t.books.bookTitles.alice.title,
      subtitle: t.books.bookTitles.alice.subtitle,
      cover: '/books/alice-cover.jpg',
      category: t.books.categories.classics,
      gradient: 'from-violet-500 to-purple-600',
      description: t.books.bookTitles.alice.description,
    },
  ]

  // Data - Apps
  const apps = [
    {
      id: 'emilio',
      title: t.apps.appTitles.emilio.title,
      description: t.apps.appTitles.emilio.description,
      icon: '🤖',
      status: t.common.comingSoon,
      gradient: 'from-onde-coral to-onde-pink',
    },
    {
      id: 'moonlight-puzzle',
      title: t.apps.appTitles.moonlightPuzzle.title,
      description: t.apps.appTitles.moonlightPuzzle.description,
      icon: '🌙',
      status: t.common.inDevelopment,
      gradient: 'from-onde-blue to-onde-purple',
    },
    {
      id: 'word-play',
      title: t.apps.appTitles.wordPlay.title,
      description: t.apps.appTitles.wordPlay.description,
      icon: '📝',
      status: t.common.comingSoon,
      gradient: 'from-onde-gold to-onde-coral',
    },
  ]

  // Features
  const features = [
    {
      icon: '📚',
      title: t.home.features.illustratedStories.title,
      description: t.home.features.illustratedStories.description,
    },
    {
      icon: '🎮',
      title: t.home.features.educationalApps.title,
      description: t.home.features.educationalApps.description,
    },
    {
      icon: '✨',
      title: t.home.features.creativeGames.title,
      description: t.home.features.creativeGames.description,
    },
  ]

  return (
    <div className="relative overflow-x-hidden w-full">
      {/* ============================================
          FIXED BACKGROUND - Immersive Futuristic
          ============================================ */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-onde-dark" />

        {/* Mesh gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 100% 100% at 50% 0%, rgba(108, 99, 255, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse 80% 60% at 100% 50%, rgba(78, 205, 196, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 60% 80% at 0% 100%, rgba(255, 107, 107, 0.12) 0%, transparent 50%),
              radial-gradient(ellipse 50% 50% at 50% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 70%)
            `,
          }}
        />

        {/* Animated grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particleIndices.map((i) => (
            <Particle key={i} index={i} />
          ))}
        </div>
      </div>

      {/* ============================================
          HERO SECTION - Cinematic Full Screen
          ============================================ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Orbs Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large purple orb */}
          <motion.div
            className="floating-orb w-[600px] h-[600px] -top-40 -left-40"
            style={{ background: 'var(--onde-purple)' }}
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Teal orb right */}
          <motion.div
            className="floating-orb w-[500px] h-[500px] top-1/4 -right-40"
            style={{ background: 'var(--onde-teal)' }}
            animate={{
              x: [0, -30, 0],
              y: [0, 50, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
          {/* Blue orb bottom */}
          <motion.div
            className="floating-orb w-[400px] h-[400px] bottom-20 left-1/4"
            style={{ background: 'var(--onde-blue)' }}
            animate={{
              x: [0, 40, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          />
          {/* Coral accent orb */}
          <motion.div
            className="floating-orb w-[300px] h-[300px] top-1/2 right-1/4"
            style={{ background: 'var(--onde-coral)' }}
            animate={{
              x: [0, -20, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          />
        </div>

        {/* Grid Pattern Overlay */}
        <div className="grid-pattern opacity-30" />

        {/* Hero Content */}
        <motion.div
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="section-badge-futuristic mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-onde-teal animate-pulse" />
            {t.home.badge}
          </motion.div>

          {/* Main Title */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.9] mb-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-white">{t.home.title1}</span>
            <br />
            <span className="text-gradient-neon">{t.home.title2}</span>
            <br />
            <span className="text-white/80 italic">{t.home.title3}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t.home.subtitle}{' '}
            <span className="text-onde-teal">{t.home.imagination}</span> {t.home.and}{' '}
            <span className="text-onde-purple">{t.home.curiosity}</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link href="#libri">
              <button className="btn-futuristic group">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {t.home.exploreBooks}
                </span>
              </button>
            </Link>
            <Link href="#app">
              <button className="btn-outline-glow">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {t.home.discoverApps}
                </span>
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-white/40 text-sm font-medium">{t.home.scroll}</span>
          <div className="scroll-indicator-line" />
        </motion.div>
      </section>

      {/* ============================================
          FEATURES SECTION
          ============================================ */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="card-3d p-8"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-display font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          BOOKS SECTION - Cinematic Cards
          ============================================ */}
      <section id="libri" className="relative py-32">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] floating-orb opacity-20"
             style={{ background: 'var(--onde-coral)', filter: 'blur(150px)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge-futuristic">
              <span className="w-2 h-2 rounded-full bg-onde-coral" />
              {t.home.booksSection.badge}
            </span>
            <h2 className="section-title-futuristic mb-4">{t.home.booksSection.title}</h2>
            <p className="section-subtitle-futuristic">{t.home.booksSection.subtitle}</p>
            <div className="glow-line w-32 mx-auto mt-8" />
          </motion.div>

          {/* Books Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Link href={`/libro/${book.id}`}>
                  <TiltCard className="group">
                    <motion.div
                      className="card-holographic p-1 relative"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Glow effect on hover */}
                      <motion.div
                        className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                        style={{
                          background: `radial-gradient(circle, ${book.gradient.includes('amber') ? '#FFD93D' : book.gradient.includes('cyan') ? '#4ECDC4' : book.gradient.includes('pink') ? '#FF6B6B' : '#6C63FF'}40 0%, transparent 70%)`,
                          filter: 'blur(20px)',
                        }}
                      />

                      {/* Book Cover */}
                      <div className={`aspect-[3/4] rounded-2xl overflow-hidden relative bg-gradient-to-br ${book.gradient}`}>
                        {/* Animated shimmer effect */}
                        <motion.div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100"
                          style={{
                            background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                            backgroundSize: '200% 200%',
                          }}
                          animate={{ backgroundPosition: ['200% 200%', '-100% -100%'] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        />

                        {/* Placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.span
                            className="text-8xl opacity-30"
                            animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                          >
                            📖
                          </motion.span>
                        </div>

                        {/* Category Badge */}
                        <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold
                                       glass-dark text-white/90 backdrop-blur-md border border-white/10">
                          {book.category}
                        </span>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent
                                      opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                      flex items-end p-6">
                          <span className="text-white font-medium flex items-center gap-2">
                            {t.home.booksSection.learnMore}
                            <motion.svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </motion.svg>
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Book shadow glow */}
                    <div
                      className="absolute -bottom-4 left-4 right-4 h-8 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300"
                      style={{
                        background: book.gradient.includes('amber') ? '#FFD93D' : book.gradient.includes('cyan') ? '#4ECDC4' : book.gradient.includes('pink') ? '#FF6B6B' : '#6C63FF',
                        opacity: 0.4,
                      }}
                    />

                    {/* Book Info */}
                    <div className="mt-6 text-center relative">
                      <h3 className="font-display font-bold text-lg text-white group-hover:text-onde-teal transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm text-white/40 mt-1">{book.subtitle}</p>
                    </div>
                  </TiltCard>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/libri">
              <button className="btn-futuristic">
                <span>{t.home.booksSection.goToLibrary}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          APPS SECTION
          ============================================ */}
      <section id="app" className="relative py-32">
        {/* Decorative glow */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] floating-orb opacity-15"
             style={{ background: 'var(--onde-blue)', filter: 'blur(150px)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge-futuristic" style={{ borderColor: 'var(--onde-teal)', color: 'var(--onde-teal)' }}>
              <span className="w-2 h-2 rounded-full bg-onde-teal" />
              {t.home.appsSection.badge}
            </span>
            <h2 className="section-title-futuristic mb-4">{t.home.appsSection.title}</h2>
            <p className="section-subtitle-futuristic">{t.home.appsSection.subtitle}</p>
            <div className="glow-line w-32 mx-auto mt-8" />
          </motion.div>

          {/* Apps Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {apps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
              >
                <div className="card-3d glass-glow p-8 h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <motion.div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.gradient}
                                flex items-center justify-center text-4xl shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {app.icon}
                    </motion.div>
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold
                                   glass-dark text-onde-teal border border-onde-teal/30">
                      {app.status}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-display font-bold text-white mb-3">
                    {app.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    {app.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/app">
              <button className="btn-outline-glow">
                <span>{t.home.appsSection.viewAllApps}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION - Join Onde
          ============================================ */}
      <section className="relative py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative border-gradient-animated overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Inner content */}
            <div className="relative p-12 md:p-16 text-center bg-onde-dark-surface rounded-[calc(1.5rem-2px)]">
              {/* Background glow */}
              <div className="absolute inset-0 overflow-hidden rounded-[calc(1.5rem-2px)]">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-onde-purple/20 blur-[100px]" />
                <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-onde-teal/20 blur-[100px]" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <motion.span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6
                           glass-dark text-white/80 text-sm font-medium border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="w-2 h-2 rounded-full bg-onde-teal animate-pulse" />
                  {t.home.ctaSection.badge}
                </motion.span>

                <motion.h2
                  className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  {t.home.ctaSection.title}{' '}
                  <span className="text-gradient-neon">{t.home.ctaSection.titleHighlight}</span>?
                </motion.h2>

                <motion.p
                  className="text-lg md:text-xl text-white/60 max-w-xl mx-auto mb-10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  {t.home.ctaSection.subtitle}
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <Link href="/libri">
                    <button className="btn-futuristic">
                      <span>{t.home.ctaSection.startReading}</span>
                    </button>
                  </Link>
                  <a href="https://twitter.com/Onde_FRH" target="_blank" rel="noopener noreferrer">
                    <button className="btn-outline-glow flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      {t.home.ctaSection.followOnX}
                    </button>
                  </a>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

'use client'

import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRef, useMemo, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

// Import split-screen dynamically
const SurfSelector = dynamic(() => import('./surf-selector/page'), { ssr: false })

// Particle component for floating background particles - Maritime Relaxing theme
function Particle({ index }: { index: number }) {
  // Turchese, azzurro, bianco, oro, blu lapislazzuli - marittimo e rilassante
  const colors = ['#5B9AA0', '#7EB8C4', '#F5F5F5', '#D4AF37', '#26619C']
  const color = useMemo(() => colors[index % colors.length], [index])
  
  // Generate random values only on client side to avoid hydration errors
  const [randomValues, setRandomValues] = useState({
    x: 50, // Default center position
    size: 3, // Default size
    delay: 0,
    duration: 20
  })

  useEffect(() => {
    // Generate random values after component mounts (client-side only)
    setRandomValues({
      x: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 20,
      duration: 15 + Math.random() * 15
    })
  }, [])

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${randomValues.x}%`,
        width: randomValues.size,
        height: randomValues.size,
        background: color,
        boxShadow: `0 0 ${randomValues.size * 3}px ${color}`,
      }}
      initial={{ y: '110vh', opacity: 0 }}
      animate={{
        y: '-10vh',
        opacity: [0, 0.8, 0.8, 0],
      }}
      transition={{
        duration: randomValues.duration,
        delay: randomValues.delay,
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

// Book data
const books = [
  {
    id: 'meditations',
    title: 'Meditations',
    subtitle: 'Thoughts to Himself',
    author: 'Marcus Aurelius',
    description: 'The private reflections of the Roman Emperor. A timeless guide to Stoic philosophy and inner peace.',
    category: 'Philosophy',
    price: 'Free',
    gradient: 'from-amber-500 to-amber-700',
    cover: '/books/meditations-cover.jpg',
    pdfUrl: '/books/meditations-en.pdf',
    epubUrl: '/books/epub/meditations-en.epub',
  },
  {
    id: 'shepherds-promise',
    title: "The Shepherd's Promise",
    subtitle: 'Psalm 23 for Children',
    author: 'Biblical Tradition',
    description: 'The most beloved Psalm, beautifully illustrated for young readers. A journey of trust and protection.',
    category: 'Spirituality',
    price: 'Free',
    gradient: 'from-emerald-500 to-green-600',
    cover: '/books/shepherds-promise-cover.jpg',
    pdfUrl: '/books/the-shepherds-promise.pdf',
  },
]

export default function Home() {
  // Check if we're on onde.surf domain - MUST be initialized to correct value immediately
  const [isOndeSurf, setIsOndeSurf] = useState(() => {
    // Only run on client side
    if (typeof window === 'undefined') return false
    
    const hostname = window.location.hostname
    const port = window.location.port
    const urlParams = new URLSearchParams(window.location.search)
    const mode = urlParams.get('mode')
    const showPortal = sessionStorage.getItem('showPortal')
    
    // If mode=preprod or showPortal flag is set, show portal (not surf selector)
    if (mode === 'preprod' || showPortal === 'true') {
      sessionStorage.removeItem('showPortal')
      return false
    }
    
    // onde.surf: show split-screen
    // onde.la: show normal portal
    // localhost:7777: show split-screen (onde.surf test)
    // localhost:8888: show normal portal (onde.la test)
    return hostname.includes('onde.surf') || port === '7777'
  })
  
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURN
  // This is a React rule - hooks must be called in the same order every render
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95])
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100])
  const particleIndices = useMemo(() => Array.from({ length: 40 }, (_, i) => i), [])
  
  // If onde.surf, show split-screen selector
  // This conditional return is AFTER all hooks have been called
  if (isOndeSurf) {
    return <SurfSelector />
  }
  
  // Otherwise, show normal portal (onde.la)

  return (
    <div className="relative overflow-x-hidden w-full">
      {/* ============================================
          FIXED BACKGROUND - Ocean Relaxing Theme
          ============================================ */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Base LIGHT maritime gradient - AZZURRO CHIARO */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #E8F4F8 0%, #B8D8E0 50%, #7EB8C4 100%)' }} />

        {/* Onde marine overlay - VISIBILE */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 100% 100% at 50% 0%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
              radial-gradient(ellipse 80% 60% at 100% 50%, rgba(91, 154, 160, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse 60% 80% at 0% 100%, rgba(38, 97, 156, 0.2) 0%, transparent 50%)
            `,
          }}
        />

        {/* Pattern onde marine */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(38, 97, 156, 1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(38, 97, 156, 1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
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
        {/* Animated Orbs Background - Maritime Relaxing Theme */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Riflessi d'acqua - PIU' SOFT */}
          <motion.div
            className="floating-orb w-[500px] h-[500px] -top-40 -left-40"
            style={{ background: 'rgba(38, 97, 156, 0.15)', filter: 'blur(80px)' }}
            animate={{
              x: [0, 30, 0],
              y: [0, 20, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Riflesso turchese */}
          <motion.div
            className="floating-orb w-[400px] h-[400px] top-1/4 -right-40"
            style={{ background: 'rgba(91, 154, 160, 0.2)', filter: 'blur(70px)' }}
            animate={{
              x: [0, -20, 0],
              y: [0, 25, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          />
          {/* Riflesso azzurro chiaro */}
          <motion.div
            className="floating-orb w-[350px] h-[350px] bottom-20 left-1/4"
            style={{ background: 'rgba(126, 184, 196, 0.18)', filter: 'blur(60px)' }}
            animate={{
              x: [0, 20, 0],
              y: [0, -15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
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
            Los Angeles
          </motion.div>

          {/* Main Title */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.9] mb-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-gray-900 drop-shadow-[0_2px_20px_rgba(255,255,255,0.3)]">Beautiful Books</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-gray-800 max-w-3xl mx-auto mb-12 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Illustrated editions of timeless classics, crafted with care.
            <br />
            Download and enjoy.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link href="#books">
              <button className="btn-futuristic group">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Explore Books
                </span>
              </button>
            </Link>
            <Link href="/about">
              <button className="btn-outline-glow">
                <span className="flex items-center gap-2">
                  About Us
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
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
          <span className="text-gray-600 text-sm font-medium">Scroll</span>
          <div className="scroll-indicator-line" />
        </motion.div>
      </section>

      {/* ============================================
          BOOKS SECTION - Cinematic Cards
          ============================================ */}
      <section id="books" className="relative py-32">
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
              Now Available
            </span>
            <h2 className="section-title-futuristic mb-4">Our Books</h2>
            <p className="section-subtitle-futuristic">
              Classic literature, illustrated with care. Beautiful editions for the digital age.
            </p>
            <div className="glow-line w-32 mx-auto mt-8" />
          </motion.div>

          {/* Books Grid */}
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
              >
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
                        background: `radial-gradient(circle, ${book.gradient.includes('amber') ? '#FFD93D' : '#4ECDC4'}40 0%, transparent 70%)`,
                        filter: 'blur(20px)',
                      }}
                    />

                    <div className="bg-onde-dark-surface/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                      {/* Book Cover */}
                      <div className={`aspect-[4/3] relative bg-gradient-to-br ${book.gradient}`}>
                        <Image
                          src={book.cover}
                          alt={book.title}
                          fill
                          className="object-contain p-6"
                          priority={index === 0}
                        />

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

                        {/* Category Badge */}
                        <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold
                                       glass-dark text-white/90 backdrop-blur-md border border-white/10">
                          {book.category}
                        </span>

                        {/* Price Badge */}
                        <span className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold
                                        ${book.price === 'Free' ? 'bg-emerald-500' : 'bg-amber-500'} text-white`}>
                          {book.price}
                        </span>
                      </div>

                      {/* Book Info */}
                      <div className="p-6">
                        <h3 className="text-2xl font-display font-bold text-white mb-1 group-hover:text-onde-teal transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-onde-teal/80 text-sm mb-1">{book.subtitle}</p>
                        <p className="text-white/40 text-xs mb-4">by {book.author}</p>
                        <p className="text-white/70 text-sm leading-relaxed mb-6">
                          {book.description}
                        </p>

                        {/* Download Buttons */}
                        <div className="flex gap-3">
                          <a
                            href={book.pdfUrl}
                            download
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                                     bg-gradient-to-r from-onde-teal to-onde-blue text-white font-semibold text-sm
                                     hover:shadow-lg hover:shadow-onde-teal/30 transition-all duration-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                          </a>
                          {book.epubUrl && (
                            <a
                              href={book.epubUrl}
                              download
                              className="px-4 py-3 rounded-xl bg-white/5 text-white/80 font-semibold text-sm
                                       border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                            >
                              EPUB
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
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
                  More books coming
                </motion.span>

                <motion.h2
                  className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  Want to stay{' '}
                  <span className="text-gradient-neon">updated</span>?
                </motion.h2>

                <motion.p
                  className="text-lg md:text-xl text-white/70 max-w-xl mx-auto mb-10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  We&apos;re preparing more beautiful editions of classic literature.
                  Follow us on X for updates.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <a
                    href="https://twitter.com/Onde_FRH"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-futuristic"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Follow @Onde_FRH
                    </span>
                  </a>
                  <a
                    href="https://twitter.com/FreeRiverHouse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline-glow"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Follow @FreeRiverHouse
                    </span>
                  </a>
                  <Link href="/about">
                    <button className="btn-outline-glow">
                      <span>About Us</span>
                    </button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

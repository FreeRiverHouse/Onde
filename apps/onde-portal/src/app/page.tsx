'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRef, useMemo, useState, useEffect } from 'react'
import { 
  GradientText, 
  Card3D, 
  GlowingCard, 
  BentoGrid, 
  BentoGridItem, 
  FloatingDock,
  SpotlightBeam,
  MovingBorder,
  InfiniteMovingCards,
  WavyBackground
} from '@/components/ui/aceternity'

// Particle for ambient background
function Particle({ index }: { index: number }) {
  const colors = ['#5B9AA0', '#7EB8C4', '#D4AF37', '#26619C', '#E8B4B8']
  const color = colors[index % colors.length]
  
  const [values, setValues] = useState({ x: 50, size: 3, delay: 0, duration: 20 })
  useEffect(() => {
    setValues({
      x: Math.random() * 100,
      size: 2 + Math.random() * 6,
      delay: Math.random() * 20,
      duration: 15 + Math.random() * 15
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

// Features for Bento Grid
const features = [
  {
    title: "Beautiful Books",
    description: "Classic literature, reimagined with stunning AI illustrations",
    icon: "📚",
    className: "md:col-span-2",
  },
  {
    title: "Free Forever",
    description: "All our books are free to download and share",
    icon: "✨",
  },
  {
    title: "Multi-format",
    description: "PDF, EPUB, and web reader",
    icon: "📱",
  },
  {
    title: "AI Enhanced",
    description: "Illustrations crafted with cutting-edge AI",
    icon: "🎨",
    className: "md:col-span-2",
  },
]

// Testimonials
const testimonials = [
  { quote: "The illustrations in Meditations are breathtaking. This is how classic literature should be presented.", name: "Sarah M.", title: "Teacher" },
  { quote: "My kids love The Shepherd's Promise. The imagery brings the Psalm to life.", name: "David L.", title: "Parent" },
  { quote: "Finally, beautiful editions of classic books that are free and accessible to everyone.", name: "Emily R.", title: "Librarian" },
  { quote: "The attention to detail in each illustration is remarkable. True digital art.", name: "Marcus T.", title: "Art Director" },
]

// Dock items
const dockItems = [
  { title: "Books", icon: "📚", href: "#books" },
  { title: "Games", icon: "🎮", href: "/games" },
  { title: "VR", icon: "🥽", href: "/vr" },
  { title: "About", icon: "✨", href: "#about" },
]

export default function Home() {
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.9])
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -150])
  const particles = useMemo(() => Array.from({ length: 50 }, (_, i) => i), [])

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* ============================================
          GLOBAL BACKGROUND
          ============================================ */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Dark gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f]" />
        
        {/* Ambient orbs */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] translate-x-1/2" />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-purple-500/10 rounded-full blur-[130px]" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Floating particles */}
        {particles.map((i) => <Particle key={i} index={i} />)}
      </div>

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative min-h-screen flex items-center justify-center">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="text-white/70 text-sm font-medium">Los Angeles • 2026</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-bold leading-[0.85] mb-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="text-white drop-shadow-2xl">Crafted by</span>
            <br />
            <GradientText colors={["#5B9AA0", "#D4AF37", "#E8B4B8", "#5B9AA0"]}>
              Code
            </GradientText>
            <br />
            <span className="text-white/80">Touched by</span>
            <br />
            <motion.span 
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(135deg, #E8B4B8 0%, #D4AF37 50%, #5B9AA0 100%)',
              }}
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              Soul
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Where technology meets artistry. Beautiful books, immersive games, 
            and magical experiences—all free, all open.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <MovingBorder containerClassName="rounded-full">
              <Link 
                href="#books"
                className="block px-8 py-4 text-white font-semibold text-lg hover:bg-white/5 transition-colors rounded-full"
              >
                Explore Books ✨
              </Link>
            </MovingBorder>
            
            <Link 
              href="/games"
              className="px-8 py-4 text-white/70 font-medium text-lg border border-white/10 rounded-full hover:bg-white/5 hover:border-white/20 transition-all"
            >
              Play Games 🎮
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1, y: { duration: 1.5, repeat: Infinity } }}
          >
            <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
              <motion.div 
                className="w-1.5 h-1.5 bg-white/50 rounded-full"
                animate={{ y: [0, 16, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================
          FEATURES BENTO GRID
          ============================================ */}
      <section className="relative py-32">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-cyan-400 text-sm font-medium tracking-wider uppercase">Why Onde</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
              Built Different
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              We create beautiful digital experiences with love and cutting-edge technology
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
      <section id="books" className="relative py-32">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-amber-400 text-sm font-medium tracking-wider uppercase">Library</span>
            <h2 className="text-4xl md:text-6xl font-bold text-white mt-4 mb-6">
              Featured Books
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Classic literature with stunning AI-generated illustrations
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
                    <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                      {/* Cover */}
                      <div className={`aspect-[16/10] relative bg-gradient-to-br ${book.gradient}`}>
                        <Image
                          src={book.cover}
                          alt={book.title}
                          fill
                          className="object-contain p-8 drop-shadow-2xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                        
                        {/* Category badge */}
                        <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-black/30 backdrop-blur-md text-white border border-white/10">
                          {book.category}
                        </span>
                        
                        {/* Free badge */}
                        <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">
                          FREE
                        </span>
                      </div>

                      {/* Info */}
                      <div className="p-8">
                        <h3 className="text-2xl font-bold text-white mb-1">{book.title}</h3>
                        <p className="text-cyan-400 text-sm mb-1">{book.subtitle}</p>
                        <p className="text-white/40 text-xs mb-4">by {book.author}</p>
                        <p className="text-white/60 text-sm leading-relaxed mb-8">
                          {book.description}
                        </p>

                        <a
                          href={book.pdfUrl}
                          download
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download PDF
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
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
            >
              <span>View all 1000+ books</span>
              <motion.span 
                className="inline-block"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS
          ============================================ */}
      <section className="relative py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 mb-12 text-center">
          <span className="text-purple-400 text-sm font-medium tracking-wider uppercase">Loved by readers</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-4">
            What People Say
          </h2>
        </div>
        
        <InfiniteMovingCards items={testimonials} speed="slow" />
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="relative py-32">
        <div className="max-w-4xl mx-auto px-4">
          <MovingBorder containerClassName="rounded-3xl" duration={5000}>
            <div className="p-12 md:p-20 text-center bg-gray-900/50 backdrop-blur-xl rounded-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-6xl mb-6 block">✨</span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                  Start Your Journey
                </h2>
                <p className="text-white/50 text-lg mb-10 max-w-lg mx-auto">
                  Join thousands of readers enjoying beautiful, free books 
                  crafted with love and technology.
                </p>
                <Link 
                  href="/libri"
                  className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-bold text-lg rounded-full hover:shadow-xl hover:shadow-orange-500/30 transition-all transform hover:scale-105"
                >
                  Browse Library
                  <span>→</span>
                </Link>
              </motion.div>
            </div>
          </MovingBorder>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-white/30 text-sm">
            © 2026 Onde • Crafted with ❤️ in Los Angeles
          </p>
        </div>
      </footer>

      {/* Floating Dock */}
      <FloatingDock items={dockItems} />
    </div>
  )
}

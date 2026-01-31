'use client'

import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import Link from 'next/link'
import { useRef, useState, FormEvent } from 'react'
import { useTranslations } from '@/i18n/I18nProvider'

// ============================================
// MOCK DATA - Team Members
// ============================================
const teamMembers = [
  {
    id: 'gianni',
    emoji: '✍️',
    color: 'coral',
    colorClass: 'bg-onde-coral/10',
    textColor: 'text-onde-coral',
  },
  {
    id: 'pina',
    emoji: '🎨',
    color: 'gold',
    colorClass: 'bg-onde-gold/10',
    textColor: 'text-onde-gold',
  },
  {
    id: 'emilio',
    emoji: '🤖',
    color: 'teal',
    colorClass: 'bg-onde-teal/10',
    textColor: 'text-onde-teal',
  },
]

// ============================================
// MOCK DATA - Timeline Milestones
// ============================================
const milestones = [
  {
    year: '2024',
    quarter: 'Q1',
    title: 'The Spark',
    description: 'Onde was born from a simple idea: make beautiful books accessible to everyone using AI.',
    emoji: '💡',
    color: 'onde-gold',
  },
  {
    year: '2024',
    quarter: 'Q2',
    title: 'First Books Published',
    description: 'Released our first illustrated classics including Meditations and The Shepherd\'s Promise.',
    emoji: '📚',
    color: 'onde-coral',
  },
  {
    year: '2024',
    quarter: 'Q3',
    title: 'AI Team Assembled',
    description: 'Our AI agents - Gianni, Pina, and Emilio - joined forces to create magic together.',
    emoji: '🤖',
    color: 'onde-teal',
  },
  {
    year: '2024',
    quarter: 'Q4',
    title: 'Gaming Island Launch',
    description: 'Expanded beyond books with educational games and interactive experiences.',
    emoji: '🎮',
    color: 'onde-purple',
  },
  {
    year: '2025',
    quarter: 'Q1',
    title: 'VR Experiences',
    description: 'Started development of immersive VR education - Home School VR and FreeRiver Flow.',
    emoji: '🥽',
    color: 'onde-blue',
  },
  {
    year: '2025',
    quarter: 'Future',
    title: 'The Vision',
    description: 'Building an AI-native publishing house that moves at the speed of imagination.',
    emoji: '🌊',
    color: 'onde-cyan',
  },
]

// ============================================
// ANIMATED SCROLL SECTION WRAPPER
// ============================================
function ScrollReveal({ children, className = '', delay = 0 }: { 
  children: React.ReactNode
  className?: string
  delay?: number 
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// PARALLAX BACKGROUND ELEMENT
// ============================================
function ParallaxOrb({ 
  size, 
  color, 
  position, 
  speed = 0.5 
}: { 
  size: number
  color: string
  position: { x: string; y: string }
  speed?: number
}) {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 500])
  const smoothY = useSpring(y, { stiffness: 50, damping: 20 })

  return (
    <motion.div
      className="absolute rounded-full blur-[100px] pointer-events-none"
      style={{
        width: size,
        height: size,
        background: `var(--${color})`,
        left: position.x,
        top: position.y,
        y: smoothY,
        opacity: 0.3,
      }}
    />
  )
}

// ============================================
// TIMELINE COMPONENT
// ============================================
function Timeline() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  return (
    <div ref={containerRef} className="relative">
      {/* Animated Timeline Line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-white/10">
        <motion.div 
          className="absolute top-0 left-0 right-0 bg-gradient-to-b from-onde-teal via-onde-gold to-onde-coral"
          style={{ height: lineHeight }}
        />
      </div>

      <div className="space-y-12 md:space-y-24">
        {milestones.map((milestone, index) => (
          <ScrollReveal key={milestone.title} delay={index * 0.1}>
            <div className={`relative flex items-start gap-8 ${
              index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            }`}>
              {/* Timeline Node */}
              <motion.div 
                className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10"
                whileHover={{ scale: 1.2 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-${milestone.color}/20 border-2 border-${milestone.color}/50 
                  flex items-center justify-center text-2xl shadow-lg shadow-${milestone.color}/20`}>
                  {milestone.emoji}
                </div>
              </motion.div>

              {/* Content Card */}
              <div className={`ml-20 md:ml-0 md:w-[calc(50%-3rem)] ${
                index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left'
              }`}>
                <motion.div 
                  className="card-3d p-6 md:p-8"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className={`flex items-center gap-2 mb-3 ${
                    index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'
                  }`}>
                    <span className={`text-${milestone.color} font-bold text-lg`}>
                      {milestone.year}
                    </span>
                    <span className="text-white/40 text-sm">{milestone.quarter}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-3">
                    {milestone.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    {milestone.description}
                  </p>
                </motion.div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}

// ============================================
// CONTACT FORM COMPONENT (UI Only)
// ============================================
function ContactForm() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission (UI only)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setSubmitted(true)
    setFormState({ name: '', email: '', subject: '', message: '' })
    
    // Reset success message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-2">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            required
            value={formState.name}
            onChange={(e) => setFormState(s => ({ ...s, name: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white 
              placeholder:text-white/30 focus:border-onde-teal focus:ring-2 focus:ring-onde-teal/20 
              transition-all duration-300 outline-none"
            placeholder="Enter your name"
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            required
            value={formState.email}
            onChange={(e) => setFormState(s => ({ ...s, email: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white 
              placeholder:text-white/30 focus:border-onde-teal focus:ring-2 focus:ring-onde-teal/20 
              transition-all duration-300 outline-none"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* Subject Field */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-white/70 mb-2">
          Subject
        </label>
        <select
          id="subject"
          required
          value={formState.subject}
          onChange={(e) => setFormState(s => ({ ...s, subject: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white 
            focus:border-onde-teal focus:ring-2 focus:ring-onde-teal/20 
            transition-all duration-300 outline-none appearance-none cursor-pointer"
        >
          <option value="" className="bg-onde-dark">Select a topic</option>
          <option value="general" className="bg-onde-dark">General Inquiry</option>
          <option value="collaboration" className="bg-onde-dark">Collaboration</option>
          <option value="books" className="bg-onde-dark">Books & Publishing</option>
          <option value="vr" className="bg-onde-dark">VR Experiences</option>
          <option value="games" className="bg-onde-dark">Games</option>
          <option value="other" className="bg-onde-dark">Other</option>
        </select>
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-white/70 mb-2">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={formState.message}
          onChange={(e) => setFormState(s => ({ ...s, message: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white 
            placeholder:text-white/30 focus:border-onde-teal focus:ring-2 focus:ring-onde-teal/20 
            transition-all duration-300 outline-none resize-none"
          placeholder="Tell us what's on your mind..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-4">
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="btn-futuristic flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
              Sending...
            </>
          ) : (
            <>
              Send Message
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </motion.button>

        {submitted && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-green-400 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Message sent successfully!
          </motion.span>
        )}
      </div>
    </form>
  )
}

// ============================================
// MAIN ABOUT PAGE COMPONENT
// ============================================
export default function About() {
  const t = useTranslations()
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ============================================
          PARALLAX BACKGROUND ELEMENTS
          ============================================ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <ParallaxOrb size={600} color="onde-purple" position={{ x: '-10%', y: '-10%' }} speed={0.3} />
        <ParallaxOrb size={500} color="onde-teal" position={{ x: '80%', y: '20%' }} speed={0.5} />
        <ParallaxOrb size={400} color="onde-gold" position={{ x: '20%', y: '60%' }} speed={0.4} />
        <ParallaxOrb size={350} color="onde-coral" position={{ x: '70%', y: '80%' }} speed={0.6} />
      </div>

      {/* ============================================
          HERO SECTION - About Onde
          ============================================ */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="floating-orb w-[500px] h-[500px] -top-40 -right-40"
            style={{ background: 'var(--onde-purple)' }}
            animate={{
              x: [0, -30, 0],
              y: [0, 40, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="floating-orb w-[400px] h-[400px] bottom-20 -left-20"
            style={{ background: 'var(--onde-teal)' }}
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          />
        </div>

        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="section-badge-futuristic mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-onde-coral animate-pulse" />
              {t.about.badge}
            </motion.div>

            {/* Main Title */}
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-tight mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="text-white">{t.about.title1} </span>
              <span className="text-gradient-neon">{t.about.title2}</span>
            </motion.h1>

            {/* Story intro */}
            <motion.div
              className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p>
                <strong className="text-onde-teal">Onde</strong> {t.about.intro1}
              </p>
              <p className="text-lg text-white/60">
                {t.about.intro2}
              </p>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              className="mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <motion.div
                className="w-6 h-10 rounded-full border-2 border-white/20 mx-auto flex justify-center"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.div 
                  className="w-1.5 h-3 bg-onde-teal rounded-full mt-2"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ============================================
          MISSION STATEMENT
          ============================================ */}
      <section className="relative py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="relative">
              {/* Decorative quotes */}
              <span className="absolute -top-8 -left-4 text-8xl text-onde-gold/20 font-serif">"</span>
              <span className="absolute -bottom-16 -right-4 text-8xl text-onde-gold/20 font-serif rotate-180">"</span>
              
              <motion.blockquote 
                className="relative z-10 text-center py-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <p className="text-2xl md:text-3xl lg:text-4xl font-display font-medium text-white leading-relaxed mb-8">
                  We believe the best stories are <span className="text-onde-teal">timeless</span>, 
                  and the best technology is <span className="text-onde-gold">invisible</span>. 
                  Our mission is to bring classic literature to life with beautiful 
                  illustrations, making wisdom <span className="text-onde-coral">accessible</span> to everyone.
                </p>
                <footer className="text-white/40 text-lg">
                  — The Onde Team
                </footer>
              </motion.blockquote>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================
          WHAT WE DO
          ============================================ */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text side */}
            <ScrollReveal>
              <span className="section-badge-futuristic mb-6">
                <span className="w-2 h-2 rounded-full bg-onde-gold" />
                {t.about.whatWeDo.badge}
              </span>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
                {t.about.whatWeDo.title}
              </h2>

              <div className="space-y-4 text-white/70 leading-relaxed text-lg">
                <p>{t.about.whatWeDo.p1}</p>
                <p>{t.about.whatWeDo.p2}</p>
                <p>{t.about.whatWeDo.p3}</p>
              </div>

              <motion.div
                className="mt-8"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link href="/" className="btn-futuristic">
                  <span className="flex items-center gap-2">
                    {t.about.whatWeDo.cta}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              </motion.div>
            </ScrollReveal>

            {/* Visual side */}
            <ScrollReveal delay={0.2}>
              <div className="card-holographic p-8 md:p-10 text-center">
                <div className="space-y-8">
                  {/* AI Icon with glow effect */}
                  <motion.div
                    className="relative"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="absolute inset-0 text-8xl blur-xl opacity-50">🤖</div>
                    <div className="relative text-8xl">🤖</div>
                  </motion.div>

                  <div>
                    <h3 className="text-2xl font-display font-bold text-white mb-2">
                      {t.about.whatWeDo.aiNative}
                    </h3>
                    <p className="text-white/60">
                      {t.about.whatWeDo.aiNativeDesc}
                    </p>
                  </div>

                  <div className="flex justify-center gap-6 text-4xl">
                    <motion.span 
                      animate={{ rotate: [0, 10, 0], scale: [1, 1.1, 1] }} 
                      transition={{ duration: 3, repeat: Infinity }}
                    >📚</motion.span>
                    <motion.span 
                      animate={{ rotate: [0, -10, 0], scale: [1, 1.1, 1] }} 
                      transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                    >🎨</motion.span>
                    <motion.span 
                      animate={{ rotate: [0, 10, 0], scale: [1, 1.1, 1] }} 
                      transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    >✨</motion.span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ============================================
          TIMELINE - Our Journey
          ============================================ */}
      <section className="relative py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16 md:mb-24">
              <span className="section-badge-futuristic mb-6">
                <span className="w-2 h-2 rounded-full bg-onde-cyan animate-pulse" />
                Our Journey
              </span>
              <h2 className="section-title-futuristic mb-4">Milestones</h2>
              <p className="section-subtitle-futuristic max-w-2xl mx-auto">
                From a spark of an idea to a growing library of illustrated classics.
              </p>
              <div className="glow-line w-32 mx-auto mt-8" />
            </div>
          </ScrollReveal>

          <Timeline />
        </div>
      </section>

      {/* ============================================
          THE ORCHESTRA - Magmatic
          ============================================ */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <motion.div
              className="relative border-gradient-animated overflow-hidden"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="relative p-8 md:p-12 lg:p-16 bg-onde-dark-surface rounded-[calc(1.5rem-2px)]">
                {/* Background glow */}
                <div className="absolute inset-0 overflow-hidden rounded-[calc(1.5rem-2px)]">
                  <motion.div 
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-onde-purple/20 blur-[100px]"
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div 
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-onde-coral/20 blur-[100px]"
                    animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>

                <div className="relative z-10 text-center">
                  <motion.span
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6
                             glass-dark text-white/80 text-sm font-medium border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <span className="w-2 h-2 rounded-full bg-onde-purple animate-pulse" />
                    {t.about.orchestra.badge}
                  </motion.span>

                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
                    {t.about.orchestra.title}{' '}
                    <span className="text-gradient-fire">{t.about.orchestra.titleHighlight}</span>
                  </h2>

                  <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-6 leading-relaxed">
                    {t.about.orchestra.description}
                  </p>

                  <p className="text-white/40 text-sm mb-8">
                    {t.about.orchestra.subtitle}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.a
                      href="https://twitter.com/magmatic__"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-futuristic"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        {t.about.orchestra.followMagmatic}
                      </span>
                    </motion.a>
                    <motion.a
                      href="https://twitter.com/Onde_FRH"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline-glow"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        {t.about.orchestra.followOnde}
                      </span>
                    </motion.a>
                  </div>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================
          VIRTUAL TEAM
          ============================================ */}
      <section className="relative py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="section-badge-futuristic">
                <span className="w-2 h-2 rounded-full bg-onde-teal" />
                {t.about.team.badge}
              </span>
              <h2 className="section-title-futuristic mb-4">{t.about.team.title}</h2>
              <p className="section-subtitle-futuristic">
                {t.about.team.subtitle}
              </p>
              <div className="glow-line w-32 mx-auto mt-8" />
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {teamMembers.map((member, index) => {
              const memberData = t.about.team[member.id as keyof typeof t.about.team] as {
                name: string
                role: string
                description: string
                quote: string
              }
              
              return (
                <ScrollReveal key={member.id} delay={index * 0.15}>
                  <motion.div
                    className="card-3d p-6 md:p-8 h-full"
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.div 
                      className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center text-4xl ${member.colorClass}`}
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {member.emoji}
                    </motion.div>
                    <h3 className="text-2xl font-display font-bold text-white mb-1">
                      {memberData.name}
                    </h3>
                    <p className={`${member.textColor} font-semibold text-sm uppercase tracking-wide mb-4`}>
                      {memberData.role}
                    </p>
                    <p className="text-white/70 leading-relaxed mb-6">
                      {memberData.description}
                    </p>
                    <blockquote className="relative">
                      <div className={`absolute -left-2 top-0 text-3xl ${member.textColor}/30`}>&ldquo;</div>
                      <p className="text-sm italic text-white/50 pl-4">
                        {memberData.quote}
                      </p>
                    </blockquote>
                  </motion.div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================================
          VALUES
          ============================================ */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="section-title-futuristic mb-4">{t.about.values.title}</h2>
              <div className="glow-line w-32 mx-auto mt-8" />
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { key: 'beauty', emoji: '🌸', delay: 0.1 },
              { key: 'simplicity', emoji: '🌿', delay: 0.2 },
              { key: 'wonder', emoji: '✨', delay: 0.3 },
            ].map((value) => (
              <ScrollReveal key={value.key} delay={value.delay}>
                <motion.div
                  className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                  whileHover={{ 
                    scale: 1.05, 
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderColor: 'rgba(255,255,255,0.2)'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <motion.div 
                    className="text-6xl mb-4"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: value.delay * 2 }}
                  >
                    {value.emoji}
                  </motion.div>
                  <h3 className="text-xl font-display font-bold text-white mb-2">
                    {t.about.values[value.key as keyof typeof t.about.values].title}
                  </h3>
                  <p className="text-white/60">
                    {t.about.values[value.key as keyof typeof t.about.values].description}
                  </p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CONTACT FORM SECTION
          ============================================ */}
      <section className="relative py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <motion.div
                className="text-5xl mb-6"
                animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                🌊
              </motion.div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
                {t.about.contact.title}
              </h2>

              <p className="text-lg text-white/60 mb-2">
                {t.about.contact.subtitle}
              </p>
              
              <p className="text-onde-teal">
                Or email us directly at{' '}
                <a 
                  href="mailto:onde.frh@proton.me" 
                  className="underline hover:text-onde-teal-light transition-colors"
                >
                  onde.frh@proton.me
                </a>
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="card-3d p-8 md:p-10">
              <ContactForm />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================
          FINAL CTA
          ============================================ */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <motion.div
              className="relative p-12 md:p-16 rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(91, 154, 160, 0.2), rgba(212, 175, 55, 0.2))'
              }}
            >
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-3xl border border-white/10" />
              
              <motion.div
                className="absolute inset-0 opacity-50"
                animate={{
                  background: [
                    'radial-gradient(circle at 0% 0%, rgba(91, 154, 160, 0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 100% 100%, rgba(212, 175, 55, 0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 0% 100%, rgba(91, 154, 160, 0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 100% 0%, rgba(212, 175, 55, 0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 0% 0%, rgba(91, 154, 160, 0.3) 0%, transparent 50%)',
                  ]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                  Ready to Explore?
                </h2>
                <p className="text-lg text-white/60 mb-8 max-w-xl mx-auto">
                  Dive into our library of beautifully illustrated classics, games, and VR experiences.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/" className="btn-futuristic">
                    Browse Library
                  </Link>
                  <Link href="/games" className="btn-outline-glow">
                    Play Games
                  </Link>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}

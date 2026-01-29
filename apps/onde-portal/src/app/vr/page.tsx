'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import SectionHeader from '@/components/ui/SectionHeader'
import AnimatedCard from '@/components/ui/AnimatedCard'
import Button from '@/components/ui/Button'
import { useTranslations } from '@/i18n'

// VR Feature icons (SVG components don't need translation)
const vrFeatureIcons = {
  totalImmersion: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  interactiveLessons: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  familyValues: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
}

// Feature data structure (translations applied at render time)
const vrFeatureData = [
  { key: 'totalImmersion', color: 'teal' },
  { key: 'interactiveLessons', color: 'coral' },
  { key: 'familyValues', color: 'gold' },
]

// Flow VR Features data
const flowFeatureData = [
  { key: 'voiceToCode', icon: '🎤' },
  { key: 'visualDebugging', icon: '🔍' },
  { key: 'aiCompanion', icon: '🤖' },
  { key: 'multiPlatform', icon: '🥽' },
]

// Home School Subjects data
const subjectData = [
  { key: 'math', icon: '🔢', color: 'coral' },
  { key: 'science', icon: '🔬', color: 'teal' },
  { key: 'history', icon: '🏛️', color: 'gold' },
  { key: 'art', icon: '🎨', color: 'coral' },
  { key: 'music', icon: '🎵', color: 'teal' },
  { key: 'languages', icon: '🌍', color: 'gold' },
]

// Expansion items data
const expansionData = [
  { key: 'therapists', icon: '🩺' },
  { key: 'psychologists', icon: '🧠' },
  { key: 'doctors', icon: '👨‍⚕️' },
  { key: 'educators', icon: '👨‍🏫' },
]

export default function VRPage() {
  const t = useTranslations()
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50])

  // Build translated data
  const vrFeatures = vrFeatureData.map(f => ({
    icon: vrFeatureIcons[f.key as keyof typeof vrFeatureIcons],
    title: t.vrPage.features[f.key as keyof typeof t.vrPage.features].title,
    description: t.vrPage.features[f.key as keyof typeof t.vrPage.features].description,
    color: f.color,
  }))

  const flowFeatures = flowFeatureData.map(f => ({
    icon: f.icon,
    title: t.vrPage.flow.features[f.key as keyof typeof t.vrPage.flow.features].title,
    description: t.vrPage.flow.features[f.key as keyof typeof t.vrPage.flow.features].description,
  }))

  const subjects = subjectData.map(s => ({
    icon: s.icon,
    color: s.color,
    name: t.vrPage.homeSchool.subjectsList[s.key as keyof typeof t.vrPage.homeSchool.subjectsList].name,
    description: t.vrPage.homeSchool.subjectsList[s.key as keyof typeof t.vrPage.homeSchool.subjectsList].description,
  }))

  const expansionItems = expansionData.map(e => ({
    icon: e.icon,
    title: t.vrPage.expansion.items[e.key as keyof typeof t.vrPage.expansion.items].title,
    desc: t.vrPage.expansion.items[e.key as keyof typeof t.vrPage.expansion.items].description,
  }))

  return (
    <div className="relative">
      {/* ============================================
          HERO SECTION - Futuristico Acquarello
          ============================================ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background - VR Grid Effect */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Watercolor base */}
          <div className="absolute inset-0 bg-gradient-to-b from-onde-ocean/5 via-onde-teal/10 to-onde-coral/5" />

          {/* Grid perspective lines */}
          <motion.div
            className="absolute inset-0 opacity-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 2 }}
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(72, 201, 176, 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(72, 201, 176, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              transform: 'perspective(500px) rotateX(60deg)',
              transformOrigin: 'center top',
            }}
          />

          {/* Floating orbs */}
          <motion.div
            className="absolute w-96 h-96 rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(72, 201, 176, 0.4) 0%, transparent 70%)',
              top: '10%',
              right: '10%',
              filter: 'blur(40px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-80 h-80 rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(255, 127, 127, 0.4) 0%, transparent 70%)',
              bottom: '20%',
              left: '5%',
              filter: 'blur(40px)',
            }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.2, 0.3],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="text-center"
            style={{ y: heroY }}
          >
            {/* VR Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-8
                         bg-gradient-to-r from-onde-teal/20 to-onde-coral/10
                         text-onde-teal text-sm font-semibold border border-onde-teal/30
                         backdrop-blur-sm"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-onde-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-onde-teal"></span>
              </span>
              {t.vrPage.hero.badge}
            </motion.div>

            {/* VR Headset Icon */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-32 h-32 rounded-3xl
                           bg-gradient-to-br from-onde-teal/20 to-onde-ocean/30
                           border border-onde-teal/30 backdrop-blur-sm
                           shadow-2xl shadow-onde-teal/20"
                animate={{
                  y: [0, -10, 0],
                  rotateY: [0, 10, 0, -10, 0],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-6xl">🥽</span>
              </motion.div>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold
                         text-onde-ocean leading-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {t.vrPage.hero.title}{' '}
              <span className="relative inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-onde-teal via-onde-coral to-onde-gold">
                  {t.vrPage.hero.titleHighlight}
                </span>
                {/* Glow effect */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-onde-teal via-onde-coral to-onde-gold opacity-30 blur-xl"
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl md:text-2xl text-onde-ocean/70 max-w-3xl mx-auto mb-6 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {t.vrPage.hero.tagline}
            </motion.p>
            <motion.p
              className="text-lg md:text-xl text-onde-ocean/50 max-w-2xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {t.vrPage.hero.subtitle}
            </motion.p>

            {/* CTA */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <Button href="#home-school" variant="teal" size="lg">
                {t.vrPage.hero.discoverHomeSchool}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </Button>
              <Button href="#flow" variant="secondary" size="lg">
                {t.vrPage.hero.freeriverFlow}
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-onde-ocean/30 flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-onde-teal"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ============================================
          FEATURES SECTION
          ============================================ */}
      <section className="relative py-24 bg-gradient-to-b from-transparent via-onde-cream/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {vrFeatures.map((feature, index) => (
              <AnimatedCard key={feature.title} delay={index * 0.1} variant={feature.color as 'coral' | 'gold' | 'teal'}>
                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center
                                 bg-gradient-to-br from-onde-${feature.color}/20 to-onde-${feature.color}/5
                                 text-onde-${feature.color}`}>
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
          FREERIVER FLOW VR - Coming Soon
          ============================================ */}
      <section id="flow" className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-onde-ocean to-onde-ocean-dark" />
        <div className="absolute inset-0 opacity-20"
             style={{
               backgroundImage: `
                 radial-gradient(circle at 20% 30%, rgba(72, 201, 176, 0.4) 0%, transparent 50%),
                 radial-gradient(circle at 80% 70%, rgba(255, 127, 127, 0.3) 0%, transparent 50%)
               `
             }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6
                           bg-onde-teal/20 text-onde-teal text-sm font-semibold
                           border border-onde-teal/30"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <span className="w-2 h-2 rounded-full bg-onde-teal animate-pulse" />
                {t.vrPage.flow.badge}
              </motion.div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
                {t.vrPage.flow.title}{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-onde-teal to-onde-coral">
                  {t.vrPage.flow.titleHighlight}
                </span>
              </h2>

              <p className="text-xl text-white/70 mb-8 leading-relaxed">
                {t.vrPage.flow.description}
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {flowFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="text-2xl mb-2 block">{feature.icon}</span>
                    <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                    <p className="text-sm text-white/50">{feature.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex gap-4">
                <Button variant="teal">
                  {t.vrPage.flow.joinWaitlist}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </div>
            </motion.div>

            {/* Right: Mockup Preview */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* VR Mockup Frame */}
              <div className="relative aspect-square">
                {/* Outer glow */}
                <motion.div
                  className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-onde-teal/30 to-onde-coral/20 blur-3xl"
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />

                {/* Main frame */}
                <div className="relative h-full rounded-[2rem] bg-gradient-to-br from-white/10 to-white/5
                                border border-white/20 backdrop-blur-xl overflow-hidden
                                shadow-2xl shadow-onde-teal/20">

                  {/* Content mockup */}
                  <div className="absolute inset-6 rounded-2xl bg-gradient-to-br from-onde-ocean-dark to-onde-ocean
                                  border border-white/10 overflow-hidden">
                    {/* Code lines mockup */}
                    <div className="p-6 space-y-3">
                      <motion.div
                        className="flex gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                      >
                        <span className="text-onde-coral font-mono text-sm">const</span>
                        <span className="text-white font-mono text-sm">app</span>
                        <span className="text-white/50 font-mono text-sm">=</span>
                        <span className="text-onde-teal font-mono text-sm">create()</span>
                      </motion.div>
                      <motion.div
                        className="flex gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 }}
                      >
                        <span className="text-onde-gold font-mono text-sm">// {t.vrPage.flow.voiceInput}</span>
                      </motion.div>
                      <motion.div
                        className="flex gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.9 }}
                      >
                        <span className="text-onde-coral font-mono text-sm">app</span>
                        <span className="text-white/50 font-mono text-sm">.</span>
                        <span className="text-onde-teal font-mono text-sm">addButton</span>
                        <span className="text-white/50 font-mono text-sm">(</span>
                        <span className="text-onde-gold font-mono text-sm">"Start"</span>
                        <span className="text-white/50 font-mono text-sm">)</span>
                      </motion.div>
                    </div>

                    {/* 3D elements floating */}
                    <motion.div
                      className="absolute bottom-6 right-6 w-24 h-24 rounded-xl
                                 bg-gradient-to-br from-onde-teal/30 to-onde-coral/20
                                 border border-white/20"
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 5, 0],
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute bottom-20 right-20 w-16 h-16 rounded-lg
                                 bg-gradient-to-br from-onde-coral/30 to-onde-gold/20
                                 border border-white/20"
                      animate={{
                        y: [0, -8, 0],
                        rotate: [0, -5, 0],
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    />
                  </div>

                  {/* Voice indicator */}
                  <motion.div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3
                               px-4 py-2 rounded-full bg-onde-teal/20 border border-onde-teal/30"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.div
                      className="w-3 h-3 rounded-full bg-onde-teal"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                    <span className="text-white text-sm font-medium">{t.vrPage.flow.listening}</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          ONDE HOME SCHOOL VR
          ============================================ */}
      <section id="home-school" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge={t.vrPage.homeSchool.badge}
            title={t.vrPage.homeSchool.title}
            subtitle={t.vrPage.homeSchool.subtitle}
            gradient="coral"
          />

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 mt-16">
            {/* Left: Description */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Problem Statement */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-onde-coral/10 to-onde-gold/5
                              border border-onde-coral/20">
                <h3 className="text-xl font-display font-bold text-onde-ocean mb-3">
                  {t.vrPage.homeSchool.problem.title}
                </h3>
                <p className="text-onde-ocean/70 leading-relaxed">
                  {t.vrPage.homeSchool.problem.description}
                </p>
              </div>

              {/* Solution */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-onde-teal/10 to-onde-coral/5
                              border border-onde-teal/20">
                <h3 className="text-xl font-display font-bold text-onde-ocean mb-3">
                  {t.vrPage.homeSchool.solution.title}
                </h3>
                <p className="text-onde-ocean/70 leading-relaxed">
                  {t.vrPage.homeSchool.solution.description}
                </p>
              </div>

              {/* Values List */}
              <div className="space-y-4">
                <h4 className="font-display font-bold text-onde-ocean">{t.vrPage.homeSchool.parentsDecide}</h4>
                <div className="flex flex-wrap gap-3">
                  {t.vrPage.homeSchool.values.map((value: string) => (
                    <span
                      key={value}
                      className="px-4 py-2 rounded-full text-sm font-medium
                                 bg-gradient-to-r from-onde-coral/10 to-onde-gold/10
                                 text-onde-ocean border border-onde-coral/20"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right: Subjects Preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {/* VR Preview Frame */}
              <div className="relative">
                {/* Glow */}
                <motion.div
                  className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-onde-coral/20 to-onde-teal/10 blur-2xl"
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 5, repeat: Infinity }}
                />

                {/* Frame */}
                <div className="relative rounded-3xl bg-white/80 backdrop-blur-sm border border-onde-coral/20
                                shadow-xl overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b border-onde-cream">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">📚</span>
                      <div>
                        <h4 className="font-display font-bold text-onde-ocean">{t.vrPage.homeSchool.subjects.title}</h4>
                        <p className="text-sm text-onde-ocean/50">{t.vrPage.homeSchool.subjects.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Subjects Grid */}
                  <div className="p-6 grid grid-cols-2 gap-4">
                    {subjects.map((subject, index) => (
                      <motion.div
                        key={subject.name}
                        className={`p-4 rounded-2xl bg-gradient-to-br
                                    ${subject.color === 'coral' ? 'from-onde-coral/10 to-onde-coral/5 border-onde-coral/20' :
                                      subject.color === 'teal' ? 'from-onde-teal/10 to-onde-teal/5 border-onde-teal/20' :
                                      'from-onde-gold/10 to-onde-gold/5 border-onde-gold/20'}
                                    border cursor-pointer transition-all duration-300
                                    hover:scale-105 hover:shadow-lg`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4 }}
                      >
                        <span className="text-3xl mb-2 block">{subject.icon}</span>
                        <h5 className="font-semibold text-onde-ocean mb-1">{subject.name}</h5>
                        <p className="text-xs text-onde-ocean/50">{subject.description}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer CTA */}
                  <div className="p-6 bg-gradient-to-br from-onde-cream/50 to-transparent">
                    <Button variant="primary" className="w-full">
                      {t.vrPage.homeSchool.subjects.startConfig}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          FUTURE EXPANSION
          ============================================ */}
      <section className="relative py-24 bg-gradient-to-b from-onde-cream/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge={t.vrPage.expansion.badge}
            title={t.vrPage.expansion.title}
            subtitle={t.vrPage.expansion.subtitle}
            gradient="teal"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {expansionItems.map((item, index) => (
              <motion.div
                key={item.title}
                className="p-6 rounded-3xl bg-white/80 backdrop-blur-sm border border-onde-teal/20
                           text-center hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <span className="text-5xl mb-4 block">{item.icon}</span>
                <h3 className="font-display font-bold text-onde-ocean mb-2">{item.title}</h3>
                <p className="text-sm text-onde-ocean/60">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative rounded-[2rem] overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-onde-teal to-onde-ocean" />
            <div className="absolute inset-0"
                 style={{
                   backgroundImage: `
                     radial-gradient(circle at 20% 30%, rgba(255, 127, 127, 0.3) 0%, transparent 50%),
                     radial-gradient(circle at 80% 70%, rgba(244, 208, 63, 0.2) 0%, transparent 50%)
                   `
                 }}
            />

            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-10"
                 style={{
                   backgroundImage: `
                     linear-gradient(to right, white 1px, transparent 1px),
                     linear-gradient(to bottom, white 1px, transparent 1px)
                   `,
                   backgroundSize: '40px 40px',
                 }}
            />

            {/* Content */}
            <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl
                           bg-white/10 border border-white/20 mb-8"
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <span className="text-4xl">🥽</span>
              </motion.div>

              <motion.h2
                className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {t.vrPage.cta.title}
              </motion.h2>
              <motion.p
                className="text-lg text-white/70 max-w-xl mx-auto mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                {t.vrPage.cta.subtitle}
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Button variant="primary" size="lg">
                  {t.vrPage.cta.joinWaitlist}
                </Button>
                <Button
                  href="/"
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/10"
                >
                  {t.vrPage.cta.backHome}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

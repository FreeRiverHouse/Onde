'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'
import AnimatedCard from '@/components/ui/AnimatedCard'
import Button from '@/components/ui/Button'

// Team members
const team = [
  {
    id: 'gianni',
    name: 'Gianni Parola',
    role: 'Scrittore',
    description: 'Le storie nascono dalle parole. Gianni le sceglie con cura, una per una, come si raccolgono fiori in un prato. Ogni libro e un giardino da esplorare.',
    icon: '✍️',
    color: 'coral' as const,
    quote: '"Le parole sono semi. Se le pianti con amore, fioriscono."',
  },
  {
    id: 'pina',
    name: 'Pina Pennello',
    role: 'Illustratrice',
    description: 'I colori danzano sulla carta. Pina dipinge mondi dove i bambini possono entrare, camminare, sognare. Ogni pennellata e una porta verso l\'immaginazione.',
    icon: '🎨',
    color: 'gold' as const,
    quote: '"Dipingo quello che le parole non riescono a dire."',
  },
  {
    id: 'emilio',
    name: 'Emilio',
    role: 'AI Educator',
    description: 'Un amico robot che capisce il futuro. Emilio spiega la tecnologia ai bambini con pazienza infinita, trasformando il complesso in semplice, il misterioso in meraviglioso.',
    icon: '🤖',
    color: 'teal' as const,
    quote: '"Imparare e il superpotere piu bello che esista."',
  },
]

// Mission values
const values = [
  {
    title: 'Bellezza',
    description: 'Ogni libro e un\'opera d\'arte. Acquarelli che raccontano storie.',
    icon: '🌸',
  },
  {
    title: 'Semplicita',
    description: 'Le grandi verita si nascondono nelle cose semplici.',
    icon: '🌿',
  },
  {
    title: 'Meraviglia',
    description: 'Coltiviamo lo stupore. Il mondo e pieno di magia.',
    icon: '✨',
  },
]

export default function About() {
  return (
    <div className="relative">
      {/* ============================================
          HERO SECTION - Chi siamo
          ============================================ */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
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
              Los Angeles, California
            </motion.div>

            {/* Main Title */}
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl font-display font-bold
                         text-onde-ocean leading-tight mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              C'era una volta{' '}
              <span className="relative inline-block">
                <span className="text-gradient-sunset">Onde</span>
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
            </motion.h1>

            {/* Story intro */}
            <motion.div
              className="text-xl md:text-2xl text-onde-ocean/70 max-w-3xl mx-auto leading-relaxed space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p>
                Una piccola casa editrice italiana, nata sotto il sole della California.
              </p>
              <p className="text-lg text-onde-ocean/60">
                Crediamo che le storie belle possano cambiare il mondo.
                Che un libro illustrato ad acquarello possa aprire porte
                che nessuna tecnologia sa aprire. Che l'immaginazione
                sia il dono piu prezioso che possiamo fare ai bambini.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating watercolor elements */}
        <motion.div
          className="absolute top-1/4 left-10 w-20 h-20 rounded-full
                     bg-gradient-to-br from-onde-coral/20 to-onde-gold/10
                     blur-xl hidden lg:block"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/3 right-16 w-32 h-32 rounded-full
                     bg-gradient-to-br from-onde-teal/15 to-onde-gold/10
                     blur-2xl hidden lg:block"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </section>

      {/* ============================================
          MISSION SECTION - NASCOSTA PER ORA
          Mattia dirà quando rimetterla (10 Gen 2026)
          Testo: "Far fiorire il mondo"
          ============================================ */}

      {/* ============================================
          TEAM SECTION
          ============================================ */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Il Team"
            title="Chi siamo"
            subtitle="Tre anime, una visione. Uniamo parole, colori e tecnologia per creare qualcosa di bello."
            gradient="sunset"
          />

          <div className="grid lg:grid-cols-3 gap-8 mt-12">
            {team.map((member, index) => (
              <AnimatedCard
                key={member.id}
                delay={index * 0.15}
                variant={member.color}
              >
                {/* Icon */}
                <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center
                                 text-4xl bg-onde-${member.color}/10`}>
                  {member.icon}
                </div>

                {/* Name & Role */}
                <h3 className="text-2xl font-display font-bold text-onde-ocean mb-1">
                  {member.name}
                </h3>
                <p className={`text-onde-${member.color} font-semibold text-sm uppercase tracking-wide mb-4`}>
                  {member.role}
                </p>

                {/* Description */}
                <p className="text-onde-ocean/60 leading-relaxed mb-6">
                  {member.description}
                </p>

                {/* Quote */}
                <blockquote className="relative">
                  <div className={`absolute -left-2 top-0 text-3xl text-onde-${member.color}/30`}>"</div>
                  <p className="text-sm italic text-onde-ocean/50 pl-4">
                    {member.quote}
                  </p>
                </blockquote>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          STORY SECTION - Il viaggio
          ============================================ */}
      <section className="relative py-24 bg-gradient-to-b from-onde-cream/30 to-transparent overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                           text-sm font-semibold mb-6
                           bg-gradient-to-r from-onde-gold/10 to-onde-coral/10
                           text-onde-gold border border-onde-gold/20"
              >
                La nostra storia
              </motion.span>

              <h2 className="text-3xl md:text-4xl font-display font-bold text-onde-ocean mb-6">
                Dall'Italia a Los Angeles
              </h2>

              <div className="space-y-4 text-onde-ocean/70 leading-relaxed">
                <p>
                  Onde nasce da un sogno semplice: creare libri che i bambini vogliano
                  rileggere, e rileggere ancora. Libri che profumano di carta e colori,
                  ma parlano il linguaggio del futuro.
                </p>
                <p>
                  Siamo un piccolo team sparso tra l'Italia e la California, unito
                  dalla passione per le storie belle e la convinzione che la tecnologia,
                  usata con saggezza, puo amplificare la creativita umana.
                </p>
                <p>
                  Ogni nostro libro combina l'arte dell'illustrazione tradizionale -
                  acquarelli, sfumature, luce dorata - con le possibilita del digitale.
                  Il risultato? Storie che vivono su carta e schermo, che crescono
                  con i bambini che le leggono.
                </p>
              </div>

              <motion.div
                className="mt-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Button href="/libri" variant="primary">
                  Esplora i nostri libri
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </motion.div>
            </motion.div>

            {/* Visual side - Watercolor illustration placeholder */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="aspect-square rounded-4xl overflow-hidden relative
                              bg-gradient-to-br from-onde-coral/10 via-onde-gold/10 to-onde-teal/10
                              border border-onde-coral/20">
                {/* Decorative watercolor circles */}
                <motion.div
                  className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full
                             bg-gradient-to-br from-onde-coral/40 to-onde-gold/30 blur-xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 6, repeat: Infinity }}
                />
                <motion.div
                  className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full
                             bg-gradient-to-br from-onde-teal/30 to-onde-gold/20 blur-2xl"
                  animate={{ scale: [1.1, 1, 1.1] }}
                  transition={{ duration: 8, repeat: Infinity, delay: 1 }}
                />
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                             w-24 h-24 rounded-full
                             bg-gradient-to-br from-onde-gold/50 to-onde-coral/30 blur-lg"
                  animate={{ scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 2 }}
                />

                {/* Central icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="text-8xl"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    🌊
                  </motion.div>
                </div>

                {/* Onde logo waves */}
                <svg className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-16" viewBox="0 0 120 40">
                  <motion.path
                    d="M0 25C20 15 30 35 50 25C70 15 80 35 100 25"
                    stroke="#FF7F7F"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                  <motion.path
                    d="M10 20C30 10 40 30 60 20C80 10 90 30 110 20"
                    stroke="#F4D03F"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.7 }}
                  />
                  <motion.path
                    d="M20 15C40 5 50 25 70 15C90 5 100 25 120 15"
                    stroke="#48C9B0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.9 }}
                  />
                </svg>
              </div>
            </motion.div>
          </div>
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
              <motion.div
                className="text-5xl mb-6"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                🌸
              </motion.div>

              <motion.h2
                className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Fai parte della storia
              </motion.h2>

              <motion.p
                className="text-lg text-white/70 max-w-xl mx-auto mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Seguici nel nostro viaggio. Nuove storie, nuove avventure,
                nuove idee da esplorare insieme.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Button href="/catalogo" variant="primary" size="lg">
                  Esplora il Catalogo
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

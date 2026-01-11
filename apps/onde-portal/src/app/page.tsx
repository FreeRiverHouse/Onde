'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from '@/i18n'

export default function Home() {
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95])
  const t = useTranslations()

  return (
    <div className="relative overflow-x-hidden w-full">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <motion.section
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-onde-cream via-white to-amber-50/30 -z-10" />

        <div className="max-w-5xl mx-auto text-center pt-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                       bg-amber-100/80 border border-amber-200/50 mb-8"
          >
            <span className="text-lg">📚</span>
            <span className="text-amber-800 font-medium">Classic Literature, Reimagined</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl font-display font-bold text-onde-ocean mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Beautiful Books,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">
              Freely Shared
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl text-onde-ocean/60 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Illustrated editions of timeless classics, crafted with care.
            Download and enjoy for free.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link
              href="/libri"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl
                         bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-lg
                         shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40
                         transition-all duration-300 hover:scale-[1.02]"
            >
              Explore Our Books
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <motion.div
              className="w-6 h-10 rounded-full border-2 border-onde-ocean/30 flex justify-center pt-2"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-1.5 h-3 rounded-full bg-onde-ocean/40" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ============================================
          FEATURED BOOKS
          ============================================ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-50/30 via-white to-onde-cream">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-medium mb-4">
              Now Available
            </span>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-onde-ocean">
              Our Books
            </h2>
          </motion.div>

          {/* Books Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Meditations */}
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-amber-200/30"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative aspect-[4/3] bg-gradient-to-br from-amber-50 to-amber-100">
                <Image
                  src="/books/meditations-cover.jpg"
                  alt="Meditations"
                  fill
                  className="object-contain p-4"
                  priority
                />
                <span className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-900/80 text-amber-100">
                  Philosophy
                </span>
                <span className="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-white">
                  $0.99
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-display font-bold text-amber-900 mb-1">Meditations</h3>
                <p className="text-amber-700/80 text-sm mb-1">Thoughts to Himself</p>
                <p className="text-onde-ocean/50 text-xs mb-4">by Marcus Aurelius</p>
                <p className="text-onde-ocean/70 text-sm leading-relaxed mb-6">
                  The private reflections of the Roman Emperor. A timeless guide to Stoic philosophy and inner peace.
                </p>
                <div className="flex gap-3">
                  <a href="/books/meditations-en.pdf" download
                     className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                              bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-sm">
                    Download PDF
                  </a>
                  <a href="/books/epub/meditations-en.epub" download
                     className="px-4 py-2.5 rounded-xl bg-onde-ocean/10 text-onde-ocean font-semibold text-sm">
                    EPUB
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Psalm 23 */}
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-green-200/30"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative aspect-[4/3] bg-gradient-to-br from-green-50 to-emerald-50">
                <Image
                  src="/books/salmo-23-cover.svg"
                  alt="The Shepherd - Psalm 23"
                  fill
                  className="object-contain p-4"
                />
                <span className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-xs font-semibold bg-green-800/80 text-green-100">
                  Spirituality
                </span>
                <span className="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-xs font-bold bg-green-500 text-white">
                  Free
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-display font-bold text-green-900 mb-1">The Shepherd</h3>
                <p className="text-green-700/80 text-sm mb-1">Psalm 23 for Children</p>
                <p className="text-onde-ocean/50 text-xs mb-4">Biblical Tradition</p>
                <p className="text-onde-ocean/70 text-sm leading-relaxed mb-6">
                  The most beloved Psalm, beautifully illustrated for young readers. A journey of trust and protection.
                </p>
                <div className="flex gap-3">
                  <a href="/books/salmo-23.pdf" download
                     className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                              bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-sm">
                    Download Free PDF
                  </a>
                </div>
                <p className="mt-4 text-xs text-green-600 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Free illustrated edition
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          ABOUT / MISSION
          ============================================ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-onde-cream">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-5xl mb-6 block">🌊</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-onde-ocean mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-onde-ocean/70 leading-relaxed mb-8">
              At Onde, we believe great literature should be beautiful and accessible to everyone.
              We create illustrated editions of public domain classics, combining timeless wisdom
              with modern design. Every book is free to download and share.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:text-amber-700 transition-colors"
            >
              Learn more about us
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          COMING SOON
          ============================================ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-onde-cream to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-gradient-to-br from-onde-ocean/5 to-onde-teal/10 rounded-3xl p-8 md:p-12
                       border border-onde-ocean/10 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-4xl mb-4 block">📖</span>
            <h3 className="text-2xl font-display font-bold text-onde-ocean mb-4">
              More Books Coming Soon
            </h3>
            <p className="text-onde-ocean/60 max-w-lg mx-auto mb-8">
              We&apos;re preparing more beautifully illustrated editions of classic literature.
              Follow us on social media for updates.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://twitter.com/Onde_FRH"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                           bg-onde-ocean text-white font-medium hover:bg-onde-ocean/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Follow @Onde_FRH
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

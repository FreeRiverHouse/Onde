'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function About() {
  return (
    <div className="relative min-h-screen">
      {/* ============================================
          HERO SECTION - About Onde
          ============================================ */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Background orbs */}
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
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
              className="section-badge-futuristic mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-onde-coral animate-pulse" />
              Los Angeles, California
            </motion.div>

            {/* Main Title */}
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl font-display font-bold leading-tight mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="text-white">About </span>
              <span className="text-gradient-neon">Onde</span>
            </motion.h1>

            {/* Story intro */}
            <motion.div
              className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p>
                <strong className="text-onde-teal">Onde</strong> is an AI-native digital publishing house based in Los Angeles.
              </p>
              <p className="text-lg text-white/50">
                We create beautifully illustrated ebooks from classic literature in the public domain.
                Every book is crafted with care, combining timeless wisdom with modern design.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          WHAT WE DO
          ============================================ */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="section-badge-futuristic mb-6">
                <span className="w-2 h-2 rounded-full bg-onde-gold" />
                What We Do
              </span>

              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
                AI-Powered Digital Publishing
              </h2>

              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  We leverage AI tools to create illustrated editions of classic books that have entered the public domain.
                  From Marcus Aurelius to biblical texts, we bring timeless wisdom to life with beautiful artwork.
                </p>
                <p>
                  Each book is available in PDF and EPUB formats. Some are free, others have a small price.
                  All are delivered digitally.
                </p>
                <p>
                  Our catalog includes philosophy, spirituality, children&apos;s literature, art, and technology titles.
                </p>
              </div>

              <motion.div
                className="mt-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Link
                  href="/"
                  className="btn-futuristic"
                >
                  <span className="flex items-center gap-2">
                    See Our Books
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Visual side */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="card-holographic p-8 text-center">
                <div className="space-y-8">
                  {/* AI Icon */}
                  <motion.div
                    className="text-8xl"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    🤖
                  </motion.div>

                  <div>
                    <h3 className="text-2xl font-display font-bold text-white mb-2">AI-Native</h3>
                    <p className="text-white/50">
                      Built from the ground up with AI at the core of our workflow
                    </p>
                  </div>

                  <div className="flex justify-center gap-6 text-4xl">
                    <motion.span animate={{ rotate: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity }}>📚</motion.span>
                    <motion.span animate={{ rotate: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity }}>🎨</motion.span>
                    <motion.span animate={{ rotate: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }}>✨</motion.span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          THE ORCHESTRA - Magmatic
          ============================================ */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative border-gradient-animated overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="relative p-12 md:p-16 bg-onde-dark-surface rounded-[calc(1.5rem-2px)]">
              {/* Background glow */}
              <div className="absolute inset-0 overflow-hidden rounded-[calc(1.5rem-2px)]">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-onde-purple/20 blur-[100px]" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-onde-coral/20 blur-[100px]" />
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
                  The Orchestra
                </motion.span>

                <motion.h2
                  className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  Orchestrated by{' '}
                  <span className="text-gradient-fire">Magmatic</span>
                </motion.h2>

                <motion.p
                  className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  Onde is a project by <strong className="text-white">Magmatic</strong>, a creator and builder based in Los Angeles.
                  Using AI agents and automation, we&apos;re building a new kind of publishing house &mdash; one that moves at the speed of thought.
                </motion.p>

                <motion.p
                  className="text-white/40 text-sm mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  From content creation to illustration to publishing &mdash; AI agents handle the heavy lifting while humans curate the vision.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <a
                    href="https://twitter.com/magmatic__"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-futuristic"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Follow @magmatic__
                    </span>
                  </a>
                  <a
                    href="https://twitter.com/Onde_FRH"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline-glow"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Follow @Onde_FRH
                    </span>
                  </a>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          VIRTUAL TEAM
          ============================================ */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge-futuristic">
              <span className="w-2 h-2 rounded-full bg-onde-teal" />
              The Virtual Team
            </span>
            <h2 className="section-title-futuristic mb-4">AI Agents at Work</h2>
            <p className="section-subtitle-futuristic">
              Our AI agents each have their specialty. Together, they bring books to life.
            </p>
            <div className="glow-line w-32 mx-auto mt-8" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Gianni Parola */}
            <motion.div
              className="card-3d p-8"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-20 h-20 rounded-3xl mb-6 flex items-center justify-center text-4xl bg-onde-coral/10">
                ✍️
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-1">Gianni Parola</h3>
              <p className="text-onde-coral font-semibold text-sm uppercase tracking-wide mb-4">Writer</p>
              <p className="text-white/60 leading-relaxed mb-6">
                Stories are born from words. Gianni chooses them with care, one by one, like picking flowers in a meadow.
              </p>
              <blockquote className="relative">
                <div className="absolute -left-2 top-0 text-3xl text-onde-coral/30">&ldquo;</div>
                <p className="text-sm italic text-white/40 pl-4">
                  Words are seeds. If you plant them with love, they bloom.
                </p>
              </blockquote>
            </motion.div>

            {/* Pina Pennello */}
            <motion.div
              className="card-3d p-8"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-20 h-20 rounded-3xl mb-6 flex items-center justify-center text-4xl bg-onde-gold/10">
                🎨
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-1">Pina Pennello</h3>
              <p className="text-onde-gold font-semibold text-sm uppercase tracking-wide mb-4">Illustrator</p>
              <p className="text-white/60 leading-relaxed mb-6">
                Colors dance on paper. Pina paints worlds where readers can enter, walk, and dream.
              </p>
              <blockquote className="relative">
                <div className="absolute -left-2 top-0 text-3xl text-onde-gold/30">&ldquo;</div>
                <p className="text-sm italic text-white/40 pl-4">
                  I paint what words cannot say.
                </p>
              </blockquote>
            </motion.div>

            {/* Emilio */}
            <motion.div
              className="card-3d p-8"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-20 h-20 rounded-3xl mb-6 flex items-center justify-center text-4xl bg-onde-teal/10">
                🤖
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-1">Emilio</h3>
              <p className="text-onde-teal font-semibold text-sm uppercase tracking-wide mb-4">AI Educator</p>
              <p className="text-white/60 leading-relaxed mb-6">
                A robot friend who understands the future. Emilio explains technology with infinite patience.
              </p>
              <blockquote className="relative">
                <div className="absolute -left-2 top-0 text-3xl text-onde-teal/30">&ldquo;</div>
                <p className="text-sm italic text-white/40 pl-4">
                  Learning is the most beautiful superpower.
                </p>
              </blockquote>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          VALUES
          ============================================ */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title-futuristic mb-4">What We Believe</h2>
            <div className="glow-line w-32 mx-auto mt-8" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="text-center p-8"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-6xl mb-4">🌸</div>
              <h3 className="text-xl font-display font-bold text-white mb-2">Beauty</h3>
              <p className="text-white/50">
                Every book is a work of art. Illustrations that tell stories.
              </p>
            </motion.div>

            <motion.div
              className="text-center p-8"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-6xl mb-4">🌿</div>
              <h3 className="text-xl font-display font-bold text-white mb-2">Simplicity</h3>
              <p className="text-white/50">
                Great truths hide in simple things.
              </p>
            </motion.div>

            <motion.div
              className="text-center p-8"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-xl font-display font-bold text-white mb-2">Wonder</h3>
              <p className="text-white/50">
                We cultivate amazement. The world is full of magic.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          CONTACT CTA
          ============================================ */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="text-5xl mb-6"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              🌊
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Get in Touch
            </h2>

            <p className="text-lg text-white/60 mb-8">
              Questions? Want to collaborate? Reach out.
            </p>

            <a
              href="mailto:onde.frh@proton.me"
              className="text-onde-teal hover:text-onde-teal-light transition-colors text-lg font-medium"
            >
              onde.frh@proton.me
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

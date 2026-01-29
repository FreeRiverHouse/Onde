'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from '@/i18n/I18nProvider'

export default function About() {
  const t = useTranslations()

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
              {t.about.badge}
            </motion.div>

            {/* Main Title */}
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl font-display font-bold leading-tight mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="text-gray-900">{t.about.title1} </span>
              <span className="text-gradient-neon">{t.about.title2}</span>
            </motion.h1>

            {/* Story intro */}
            <motion.div
              className="text-xl md:text-2xl text-gray-800 max-w-3xl mx-auto leading-relaxed space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p>
                <strong className="text-onde-teal">Onde</strong> {t.about.intro1}
              </p>
              <p className="text-lg text-gray-600">
                {t.about.intro2}
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
                {t.about.whatWeDo.badge}
              </span>

              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-6">
                {t.about.whatWeDo.title}
              </h2>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>{t.about.whatWeDo.p1}</p>
                <p>{t.about.whatWeDo.p2}</p>
                <p>{t.about.whatWeDo.p3}</p>
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
                    {t.about.whatWeDo.cta}
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
                    <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">{t.about.whatWeDo.aiNative}</h3>
                    <p className="text-gray-600">
                      {t.about.whatWeDo.aiNativeDesc}
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
                           glass-dark text-gray-800 text-sm font-medium border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="w-2 h-2 rounded-full bg-onde-purple animate-pulse" />
                  {t.about.orchestra.badge}
                </motion.span>

                <motion.h2
                  className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  {t.about.orchestra.title}{' '}
                  <span className="text-gradient-fire">{t.about.orchestra.titleHighlight}</span>
                </motion.h2>

                <motion.p
                  className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  {t.about.orchestra.description}
                </motion.p>

                <motion.p
                  className="text-gray-500 text-sm mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  {t.about.orchestra.subtitle}
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
                      {t.about.orchestra.followMagmatic}
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
                      {t.about.orchestra.followOnde}
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
              {t.about.team.badge}
            </span>
            <h2 className="section-title-futuristic mb-4">{t.about.team.title}</h2>
            <p className="section-subtitle-futuristic">
              {t.about.team.subtitle}
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
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-1">{t.about.team.gianni.name}</h3>
              <p className="text-onde-coral font-semibold text-sm uppercase tracking-wide mb-4">{t.about.team.gianni.role}</p>
              <p className="text-gray-700 leading-relaxed mb-6">
                {t.about.team.gianni.description}
              </p>
              <blockquote className="relative">
                <div className="absolute -left-2 top-0 text-3xl text-onde-coral/30">&ldquo;</div>
                <p className="text-sm italic text-gray-500 pl-4">
                  {t.about.team.gianni.quote}
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
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-1">{t.about.team.pina.name}</h3>
              <p className="text-onde-gold font-semibold text-sm uppercase tracking-wide mb-4">{t.about.team.pina.role}</p>
              <p className="text-gray-700 leading-relaxed mb-6">
                {t.about.team.pina.description}
              </p>
              <blockquote className="relative">
                <div className="absolute -left-2 top-0 text-3xl text-onde-gold/30">&ldquo;</div>
                <p className="text-sm italic text-gray-500 pl-4">
                  {t.about.team.pina.quote}
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
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-1">{t.about.team.emilio.name}</h3>
              <p className="text-onde-teal font-semibold text-sm uppercase tracking-wide mb-4">{t.about.team.emilio.role}</p>
              <p className="text-gray-700 leading-relaxed mb-6">
                {t.about.team.emilio.description}
              </p>
              <blockquote className="relative">
                <div className="absolute -left-2 top-0 text-3xl text-onde-teal/30">&ldquo;</div>
                <p className="text-sm italic text-gray-500 pl-4">
                  {t.about.team.emilio.quote}
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
            <h2 className="section-title-futuristic mb-4">{t.about.values.title}</h2>
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
              <h3 className="text-xl font-display font-bold text-white mb-2">{t.about.values.beauty.title}</h3>
              <p className="text-gray-600">
                {t.about.values.beauty.description}
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
              <h3 className="text-xl font-display font-bold text-white mb-2">{t.about.values.simplicity.title}</h3>
              <p className="text-gray-600">
                {t.about.values.simplicity.description}
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
              <h3 className="text-xl font-display font-bold text-white mb-2">{t.about.values.wonder.title}</h3>
              <p className="text-gray-600">
                {t.about.values.wonder.description}
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
              {t.about.contact.title}
            </h2>

            <p className="text-lg text-white/60 mb-8">
              {t.about.contact.subtitle}
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

'use client'

import { motion } from 'framer-motion'
import SectionHeader from '@/components/ui/SectionHeader'
import AnimatedCard from '@/components/ui/AnimatedCard'
import Button from '@/components/ui/Button'
import { useTranslations } from '@/i18n'

// App data with translation keys
const upcomingAppsData = [
  {
    id: 'kids-chef-studio',
    translationKey: 'kidsChefStudio',
    color: 'coral' as const,
    icon: '👨‍🍳',
    featureKeys: ['illustratedRecipes', 'zeroRealRisks', 'learnByCooking'],
  },
  {
    id: 'aiko-interactive',
    translationKey: 'aikoInteractive',
    color: 'teal' as const,
    icon: '🤖',
    featureKeys: ['aiAdventures', 'interactiveDialogues', 'techDiscoveries'],
  },
  {
    id: 'mindful-kids',
    translationKey: 'mindfulKids',
    color: 'gold' as const,
    icon: '🧘',
    featureKeys: ['guidedMeditation', 'breathingExercises', 'relaxingStories'],
  },
  {
    id: 'freeriver-flow',
    translationKey: 'freeriverFlow',
    color: 'teal' as const,
    icon: '🌊',
    featureKeys: ['visualRelax', 'natureSounds', 'immersiveExperience'],
  },
]

// Future apps data with translation keys
const futureAppsData = [
  {
    id: 'emilio',
    translationKey: 'emilio',
    color: 'coral' as const,
    icon: '🤖',
    statusKey: 'inDesign',
  },
  {
    id: 'moonlight-puzzle',
    translationKey: 'moonlightPuzzle',
    color: 'teal' as const,
    icon: '🌙',
    statusKey: 'inProgress',
  },
  {
    id: 'word-play',
    translationKey: 'wordPlay',
    color: 'gold' as const,
    icon: '📝',
    statusKey: 'inDesign',
  },
  {
    id: 'story-maker',
    translationKey: 'storyMaker',
    color: 'coral' as const,
    icon: '📖',
    statusKey: 'inDesign',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

export default function AppPage() {
  const t = useTranslations()

  // Build translated apps data
  const upcomingApps = upcomingAppsData.map(app => ({
    ...app,
    title: t.appPage.apps[app.translationKey as keyof typeof t.appPage.apps].title,
    subtitle: t.appPage.apps[app.translationKey as keyof typeof t.appPage.apps].subtitle,
    description: t.appPage.apps[app.translationKey as keyof typeof t.appPage.apps].description,
    illustration: (t.appPage.apps[app.translationKey as keyof typeof t.appPage.apps] as { illustration?: string }).illustration || '',
    features: app.featureKeys.map(key => t.appPage.features[key as keyof typeof t.appPage.features]),
  }))

  const futureApps = futureAppsData.map(app => ({
    ...app,
    title: t.appPage.apps[app.translationKey as keyof typeof t.appPage.apps].title,
    subtitle: t.appPage.apps[app.translationKey as keyof typeof t.appPage.apps].subtitle,
    description: t.appPage.apps[app.translationKey as keyof typeof t.appPage.apps].description,
    status: t.appPage.status[app.statusKey as keyof typeof t.appPage.status],
  }))

  return (
    <div className="min-h-screen">
      {/* Watercolor Background Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FF7F7F 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #48C9B0 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #F4D03F 0%, transparent 70%)' }}
        />
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center mb-16">
          {/* Watercolor Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="inline-flex items-center justify-center w-28 h-28 rounded-full mb-8 relative"
          >
            {/* Watercolor blob effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-onde-teal/30 via-onde-gold/20 to-onde-coral/30 blur-xl" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-onde-teal to-onde-teal-light shadow-xl" />
            <span className="relative text-5xl">📱</span>
          </motion.div>

          <SectionHeader
            badge={t.appPage.badge}
            title={t.appPage.title}
            subtitle={t.appPage.subtitle}
            gradient="teal"
          />
        </div>
      </section>

      {/* Coming Soon Apps - Featured Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="grid md:grid-cols-2 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {upcomingApps.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
            >
              <div className={`
                relative bg-white/80 backdrop-blur-sm rounded-4xl p-8
                border border-onde-${app.color}/20 shadow-card
                hover:shadow-card-hover hover:border-onde-${app.color}/40
                transition-all duration-300 overflow-hidden group
              `}>
                {/* Watercolor Splash Background */}
                <div
                  className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                  style={{
                    background: app.color === 'coral'
                      ? 'radial-gradient(circle, #FF7F7F 0%, transparent 70%)'
                      : app.color === 'teal'
                        ? 'radial-gradient(circle, #48C9B0 0%, transparent 70%)'
                        : 'radial-gradient(circle, #F4D03F 0%, transparent 70%)'
                  }}
                />

                {/* Coming Soon Badge */}
                <motion.div
                  className="absolute top-6 right-6"
                  initial={{ scale: 0, rotate: 15 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1, type: 'spring', stiffness: 200 }}
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                                   bg-gradient-to-r from-onde-coral/10 to-onde-gold/10
                                   text-onde-coral text-sm font-bold border border-onde-coral/30
                                   shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-onde-coral animate-pulse" />
                    {t.appPage.comingSoon}
                  </span>
                </motion.div>

                {/* Icon with watercolor effect */}
                <div className="relative mb-6">
                  <div className={`
                    w-20 h-20 rounded-3xl flex items-center justify-center text-5xl
                    bg-gradient-to-br from-onde-${app.color}/20 to-onde-${app.color}/5
                    shadow-inner relative overflow-hidden
                  `}>
                    {/* Watercolor texture overlay */}
                    <div className="absolute inset-0 opacity-30"
                         style={{
                           background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")'
                         }}
                    />
                    <span className="relative">{app.icon}</span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-display font-bold text-onde-ocean mb-2">
                  {app.title}
                </h3>
                <p className="text-sm text-onde-ocean/50 font-medium mb-4">{app.subtitle}</p>
                <p className="text-onde-ocean/70 leading-relaxed mb-6">
                  {app.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {app.features.map((feature) => (
                    <span
                      key={feature}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium
                                  bg-onde-${app.color}/10 text-onde-${app.color}
                                  border border-onde-${app.color}/20`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Illustration hint */}
                <div className="flex items-center gap-2 text-xs text-onde-ocean/40 italic">
                  <span className="text-lg">🎨</span>
                  <span>{app.illustration}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Future Apps Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-display font-bold text-onde-ocean mb-2">
            {t.appPage.futureApps.title}
          </h3>
          <p className="text-onde-ocean/60">{t.appPage.futureApps.subtitle}</p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {futureApps.map((app, index) => (
            <AnimatedCard key={app.id} delay={index * 0.1} variant={app.color}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl
                                 bg-onde-${app.color}/10`}>
                  {app.icon}
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium
                                 bg-onde-ocean/5 text-onde-ocean/50">
                  {app.status}
                </span>
              </div>
              <h4 className="text-lg font-display font-bold text-onde-ocean mb-1">
                {app.title}
              </h4>
              <p className="text-xs text-onde-ocean/50 mb-2">{app.subtitle}</p>
              <p className="text-sm text-onde-ocean/60 leading-relaxed">
                {app.description}
              </p>
            </AnimatedCard>
          ))}
        </motion.div>
      </section>

      {/* Newsletter CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="relative rounded-4xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Watercolor Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-onde-teal via-onde-teal-dark to-onde-ocean" />
          <div className="absolute inset-0 opacity-20"
               style={{
                 background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.5\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
               }}
          />

          {/* Floating Elements */}
          <motion.div
            className="absolute top-8 left-8 text-4xl opacity-20"
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            🎨
          </motion.div>
          <motion.div
            className="absolute bottom-8 right-12 text-4xl opacity-20"
            animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            🌊
          </motion.div>

          <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                         bg-white/10 text-white/80 text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-onde-gold animate-pulse" />
              {t.appPage.cta.badge}
            </motion.div>

            <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              {t.appPage.cta.title}
            </h3>
            <p className="text-lg text-white/70 max-w-lg mx-auto mb-8">
              {t.appPage.cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                href="https://twitter.com/Onde_FRH"
                variant="primary"
                className="bg-white text-onde-teal hover:bg-onde-cream"
              >
                {t.appPage.cta.followOnX}
              </Button>
              <Button
                href="/about"
                variant="ghost"
                className="text-white border-white/30 hover:bg-white/10"
              >
                {t.appPage.cta.learnMore}
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

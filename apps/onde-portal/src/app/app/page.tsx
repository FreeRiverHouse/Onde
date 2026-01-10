'use client'

import { motion } from 'framer-motion'
import SectionHeader from '@/components/ui/SectionHeader'
import AnimatedCard from '@/components/ui/AnimatedCard'
import Button from '@/components/ui/Button'

const apps = [
  {
    id: 'emilio',
    title: 'EMILIO',
    subtitle: 'AI Educator per Bambini',
    description: 'Il robot amico che insegna ai bambini come funziona la tecnologia, l\'intelligenza artificiale e il mondo digitale in modo sicuro e divertente.',
    color: 'coral' as const,
    icon: '🤖',
    status: 'Prossimamente',
    features: ['Lezioni interattive', 'Sicuro e senza pubblicita', 'Contenuti adatti all\'eta'],
  },
  {
    id: 'moonlight-puzzle',
    title: 'Moonlight Puzzle',
    subtitle: 'Puzzle per la Buonanotte',
    description: 'Puzzle rilassanti con atmosfere notturne e musiche dolci. Perfetti per calmare la mente prima di dormire.',
    color: 'teal' as const,
    icon: '🌙',
    status: 'In sviluppo',
    features: ['Musiche rilassanti', 'Grafica acquarello', 'Modalita notte'],
  },
  {
    id: 'word-play',
    title: 'Word Play',
    subtitle: 'Giochi di Parole',
    description: 'Giochi di parole, rime e vocabolario in italiano e inglese. Impara divertendoti con sfide creative.',
    color: 'gold' as const,
    icon: '📝',
    status: 'Prossimamente',
    features: ['Multilingua', 'Sfide quotidiane', 'Progressi tracciabili'],
  },
  {
    id: 'kids-chef',
    title: 'Kids Chef Studio',
    subtitle: 'Cucina Virtuale',
    description: 'Impara a cucinare con ricette virtuali. Segui i passaggi, scopri gli ingredienti, crea piatti deliziosi.',
    color: 'coral' as const,
    icon: '👨‍🍳',
    status: 'Prossimamente',
    features: ['Ricette vere', 'Step-by-step', 'Senza rischi'],
  },
  {
    id: 'mindful-kids',
    title: 'Mindful Kids',
    subtitle: 'Meditazione per Bambini',
    description: 'Esercizi di respirazione, meditazione guidata e mindfulness pensati per i piu piccoli.',
    color: 'teal' as const,
    icon: '🧘',
    status: 'Prossimamente',
    features: ['Voce guidata', 'Esercizi brevi', 'Routine quotidiane'],
  },
  {
    id: 'story-maker',
    title: 'Story Maker',
    subtitle: 'Crea le Tue Storie',
    description: 'Scrivi e illustra le tue storie. Scegli personaggi, ambientazioni e crea libri digitali da condividere.',
    color: 'gold' as const,
    icon: '📖',
    status: 'In progettazione',
    features: ['Editor semplice', 'Illustrazioni predefinite', 'Condivisione'],
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function AppPage() {
  return (
    <div className="min-h-screen py-12">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl
                       bg-gradient-to-br from-onde-teal to-onde-teal-light
                       shadow-xl shadow-onde-teal/30 mb-8"
          >
            <span className="text-5xl">📱</span>
          </motion.div>

          <SectionHeader
            badge="App Educative"
            title="App"
            subtitle="App educative progettate per bambini. Sicure, senza pubblicita, con contenuti curati per ogni eta."
            gradient="teal"
          />
        </div>

        {/* App Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {apps.map((app, index) => (
            <AnimatedCard key={app.id} delay={index * 0.1} variant={app.color}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl
                                 bg-onde-${app.color}/10`}>
                  {app.icon}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                  ${app.status === 'In sviluppo'
                                    ? 'bg-onde-teal/10 text-onde-teal'
                                    : app.status === 'Prossimamente'
                                      ? 'bg-onde-gold/10 text-onde-gold-dark'
                                      : 'bg-onde-ocean/5 text-onde-ocean/60'
                                  }`}>
                  {app.status}
                </span>
              </div>

              <h3 className="text-xl font-display font-bold text-onde-ocean mb-1">
                {app.title}
              </h3>
              <p className="text-sm text-onde-ocean/50 mb-3">{app.subtitle}</p>
              <p className="text-onde-ocean/60 leading-relaxed mb-4">
                {app.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {app.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-1 rounded-lg text-xs bg-onde-cream text-onde-ocean/70"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </AnimatedCard>
          ))}
        </motion.div>
      </section>

      {/* Coming Soon CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-onde-teal to-onde-teal-dark
                     p-8 md:p-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
            Vuoi essere tra i primi a provarle?
          </h3>
          <p className="text-white/70 max-w-lg mx-auto mb-6">
            Iscriviti per ricevere aggiornamenti sulle nuove app e accesso anticipato ai beta test.
          </p>
          <Button
            href="https://twitter.com/Onde_FRH"
            variant="primary"
            className="bg-white text-onde-teal hover:bg-onde-cream"
          >
            Seguici per Aggiornamenti
          </Button>
        </motion.div>
      </section>
    </div>
  )
}

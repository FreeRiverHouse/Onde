'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Privacy() {
  return (
    <div className="relative min-h-screen dark:bg-gray-900">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="floating-orb w-[400px] h-[400px] -top-40 -right-40"
          style={{ background: 'var(--onde-teal)', opacity: 0.3 }}
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <h1 className="font-display text-4xl md:text-5xl font-bold text-onde-ocean dark:text-white mb-8">
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg max-w-none text-onde-ocean/80 dark:text-gray-300">
            <p className="text-xl mb-8">
              La tua privacy è importante per noi. Questa policy spiega come raccogliamo, 
              usiamo e proteggiamo i tuoi dati personali.
            </p>

            <h2 className="font-display text-2xl font-semibold text-onde-ocean dark:text-white mt-12 mb-4">
              Dati che raccogliamo
            </h2>
            <p>
              Raccogliamo solo i dati necessari per fornirti i nostri servizi:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email (se ti iscrivi alla newsletter)</li>
              <li>Dati di navigazione anonimi per migliorare il sito</li>
              <li>Preferenze di lettura (se usi le nostre app)</li>
            </ul>

            <h2 className="font-display text-2xl font-semibold text-onde-ocean dark:text-white mt-12 mb-4">
              Come usiamo i tuoi dati
            </h2>
            <p>
              I tuoi dati vengono usati esclusivamente per:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Inviarti aggiornamenti sui nostri libri e app (solo se iscritto)</li>
              <li>Migliorare l'esperienza utente sul nostro sito</li>
              <li>Personalizzare i contenuti nelle nostre app</li>
            </ul>

            <h2 className="font-display text-2xl font-semibold text-onde-ocean dark:text-white mt-12 mb-4">
              Protezione dei dati
            </h2>
            <p>
              I tuoi dati sono protetti con le migliori pratiche di sicurezza. 
              Non vendiamo mai i tuoi dati a terzi e li conserviamo solo per il 
              tempo necessario.
            </p>

            <h2 className="font-display text-2xl font-semibold text-onde-ocean dark:text-white mt-12 mb-4">
              I tuoi diritti
            </h2>
            <p>
              Hai il diritto di:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accedere ai tuoi dati personali</li>
              <li>Richiedere la correzione o cancellazione dei tuoi dati</li>
              <li>Opporti al trattamento dei tuoi dati</li>
              <li>Revocare il consenso in qualsiasi momento</li>
            </ul>

            <h2 className="font-display text-2xl font-semibold text-onde-ocean dark:text-white mt-12 mb-4">
              Contatti
            </h2>
            <p>
              Per qualsiasi domanda sulla privacy, contattaci all'indirizzo:{' '}
              <a href="mailto:privacy@onde.la" className="text-onde-coral dark:text-cyan-400 hover:underline">
                privacy@onde.la
              </a>
            </p>

            <div className="mt-12 pt-8 border-t border-onde-ocean/10 dark:border-gray-700">
              <p className="text-sm text-onde-ocean/50 dark:text-gray-500">
                Ultimo aggiornamento: Gennaio 2026
              </p>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-12">
            <Link 
              href="/" 
              className="text-onde-coral dark:text-cyan-400 hover:text-onde-coral-light dark:hover:text-cyan-300 transition-colors"
            >
              ← Torna alla home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

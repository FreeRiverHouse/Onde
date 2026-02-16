'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Terms() {
  return (
    <div className="relative min-h-screen dark:bg-gray-900">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="floating-orb w-[400px] h-[400px] -top-40 -left-40"
          style={{ background: 'var(--onde-coral)', opacity: 0.3 }}
          animate={{
            x: [0, 20, 0],
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
            Termini di Servizio
          </h1>
          
          <div className="prose prose-lg max-w-none text-onde-ocean/80 dark:text-gray-300">
            <p className="text-xl mb-8">
              Benvenuto su Onde! Usando i nostri servizi accetti questi termini.
              Leggi attentamente prima di procedere.
            </p>

            <h2 className="font-display text-2xl font-semibold text-onde-ocean dark:text-white mt-12 mb-4">
              Uso dei servizi
            </h2>
            <p>
              I nostri servizi sono pensati per le famiglie. Usando Onde, accetti di:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usare i contenuti solo per scopi personali e non commerciali</li>
              <li>Non condividere contenuti a pagamento con terzi</li>
              <li>Supervisionare l'uso dei minori sui nostri servizi</li>
              <li>Non tentare di aggirare le protezioni dei contenuti</li>
            </ul>

            <h2 className="font-display text-2xl font-semibold text-onde-ocean dark:text-white mt-12 mb-4">
              Contenuti
            </h2>
            <p>
              Tutti i contenuti su Onde (libri, illustrazioni, app, giochi) sono protetti 
              da copyright. I diritti restano di Onde e dei rispettivi autori. 
              L'acquisto di un libro o l'uso di un'app ti dà una licenza personale, 
              non trasferibile.
            </p>

            <h2 className="font-display text-2xl font-semibold text-onde-ocean dark:text-white mt-12 mb-4">
              Account
            </h2>
            <p>
              Se crei un account:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sei responsabile della sicurezza delle tue credenziali</li>
              <li>Devi fornire informazioni accurate</li>
              <li>Non puoi condividere l'account con altri</li>
            </ul>

            <h2 className="font-display text-2xl font-semibold text-onde-ocean dark:text-white mt-12 mb-4">
              Acquisti e rimborsi
            </h2>
            <p>
              Per acquisti digitali (libri, app):
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>I prezzi sono in Euro e includono IVA dove applicabile</li>
              <li>Gli acquisti digitali sono definitivi, salvo difetti tecnici</li>
              <li>Per problemi tecnici, contattaci entro 14 giorni</li>
            </ul>

            <h2 className="font-display text-2xl font-semibold text-onde-ocean dark:text-white mt-12 mb-4">
              Limitazioni
            </h2>
            <p>
              Onde non è responsabile per:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Interruzioni temporanee del servizio</li>
              <li>Perdita di dati dovuta a cause esterne</li>
              <li>Uso improprio dei contenuti da parte tua</li>
            </ul>

            <h2 className="font-display text-2xl font-semibold text-onde-ocean dark:text-white mt-12 mb-4">
              Modifiche
            </h2>
            <p>
              Possiamo aggiornare questi termini. Ti avviseremo di cambiamenti significativi.
              Continuando a usare i servizi dopo le modifiche, accetti i nuovi termini.
            </p>

            <h2 className="font-display text-2xl font-semibold text-onde-ocean dark:text-white mt-12 mb-4">
              Contatti
            </h2>
            <p>
              Per domande sui termini di servizio:{' '}
              <a href="mailto:info@onde.la" className="text-onde-coral dark:text-cyan-400 hover:underline">
                info@onde.la
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

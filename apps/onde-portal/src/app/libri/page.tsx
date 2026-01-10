'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import SectionHeader from '@/components/ui/SectionHeader'
import Button from '@/components/ui/Button'

const categories = [
  { id: 'tutti', label: 'Tutti', count: 12 },
  { id: 'spiritualita', label: 'Spiritualita', count: 3 },
  { id: 'classici', label: 'Classici', count: 4 },
  { id: 'poesia', label: 'Poesia', count: 2 },
  { id: 'tech', label: 'Tech', count: 3 },
]

const books = [
  {
    id: 'salmo-23',
    title: 'Il Pastore',
    subtitle: 'Il Salmo 23 per Bambini',
    author: 'Tradizione Biblica',
    description: 'Il Salmo piu amato, raccontato e illustrato per i piu piccoli. Un viaggio di fiducia e protezione.',
    category: 'spiritualita',
    price: 0,
    featured: true,
    color: 'coral' as const,
  },
  {
    id: 'aiko',
    title: 'AIKO',
    subtitle: 'La Mia Amica Robot',
    author: 'Onde',
    description: 'Sofia scopre che la sua nuova amica non e una bambina come le altre. E una AI! Un\'avventura di amicizia e tecnologia.',
    category: 'tech',
    price: 0,
    featured: true,
    color: 'teal' as const,
  },
  {
    id: 'piccole-rime',
    title: 'Piccole Rime',
    subtitle: 'Poesie Italiane per Bambini',
    author: 'Lina Schwarz, A.S. Novaro',
    description: 'Le piu belle filastrocche della tradizione italiana, illustrate con delicatezza. Stella Stellina, La Pioggerellina e altre.',
    category: 'poesia',
    price: 0,
    featured: true,
    color: 'gold' as const,
  },
  {
    id: 'alice',
    title: 'Alice nel Paese delle Meraviglie',
    subtitle: 'Edizione Illustrata',
    author: 'Lewis Carroll',
    description: 'Il viaggio di Alice nel mondo capovolto. Illustrazioni originali in stile acquarello europeo.',
    category: 'classici',
    price: 0,
    featured: false,
    color: 'coral' as const,
  },
  {
    id: 'jungle-book',
    title: 'Il Libro della Giungla',
    subtitle: 'Edizione Illustrata',
    author: 'Rudyard Kipling',
    description: 'Mowgli e i suoi amici della giungla. La legge del branco, l\'amicizia e il coraggio.',
    category: 'classici',
    price: 0,
    featured: false,
    color: 'teal' as const,
  },
  {
    id: 'peter-rabbit',
    title: 'Peter Rabbit',
    subtitle: 'Le Avventure Complete',
    author: 'Beatrix Potter',
    description: 'Il coniglio piu famoso della letteratura inglese. Illustrazioni fedeli allo spirito originale.',
    category: 'classici',
    price: 0,
    featured: false,
    color: 'gold' as const,
  },
  {
    id: 'aiko-2',
    title: 'AIKO 2',
    subtitle: 'L\'Avventura del Robotaxi',
    author: 'Onde',
    description: 'Sofia e AIKO scoprono come funzionano le auto che guidano da sole. Un viaggio dalla nonna diventa una lezione di tecnologia!',
    category: 'tech',
    price: 0,
    featured: false,
    color: 'teal' as const,
  },
  {
    id: 'mindfulness-kids',
    title: 'Il Respiro Magico',
    subtitle: 'Mindfulness per Bambini',
    author: 'Onde',
    description: 'Impara a respirare, calmarti e trovare la pace interiore. Esercizi semplici per piccoli guerrieri della tranquillita.',
    category: 'spiritualita',
    price: 0,
    featured: false,
    color: 'coral' as const,
  },
]

export default function LibriPage() {
  return (
    <div className="min-h-screen py-12">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl
                       bg-gradient-to-br from-onde-coral to-onde-coral-light
                       shadow-xl shadow-onde-coral/30 mb-8"
          >
            <span className="text-5xl">📚</span>
          </motion.div>

          <SectionHeader
            badge="Libreria Illustrata"
            title="Libri"
            subtitle="I grandi classici e storie originali, illustrati con cura artigianale in stile acquarello europeo."
            gradient="coral"
          />
        </div>

        {/* Categories */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all
                ${cat.id === 'tutti'
                  ? 'bg-onde-coral text-white shadow-lg shadow-onde-coral/30'
                  : 'bg-white/80 text-onde-ocean/70 hover:bg-onde-coral/10 hover:text-onde-coral'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {cat.label}
              <span className="ml-2 text-xs opacity-60">({cat.count})</span>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* Featured Books */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.h3
          className="text-2xl font-display font-bold text-onde-ocean mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          In Evidenza
        </motion.h3>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {books.filter(b => b.featured).map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/libro/${book.id}`}>
                <motion.div
                  className="group relative bg-white/80 backdrop-blur-sm rounded-3xl
                             border border-white/50 shadow-card overflow-hidden
                             transition-all duration-500"
                  whileHover={{
                    y: -8,
                    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.12)',
                  }}
                >
                  {/* Cover */}
                  <div className={`aspect-[4/3] bg-gradient-to-br from-onde-${book.color}/20 to-onde-${book.color}/5
                                   flex items-center justify-center relative overflow-hidden`}>
                    <span className="text-8xl opacity-20 group-hover:scale-110 transition-transform duration-500">📖</span>

                    {/* Category Badge */}
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-lg text-xs font-medium
                                     bg-white/90 backdrop-blur-sm text-onde-ocean capitalize">
                      {book.category}
                    </span>

                    {/* Featured Badge */}
                    <span className="absolute top-4 right-4 px-3 py-1 rounded-lg text-xs font-semibold
                                     bg-onde-gold text-onde-ocean">
                      In Evidenza
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h4 className="text-xl font-display font-bold text-onde-ocean mb-1
                                   group-hover:text-onde-coral transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-sm text-onde-ocean/50 mb-2">{book.subtitle}</p>
                    <p className="text-sm text-onde-ocean/40 mb-3">di {book.author}</p>
                    <p className="text-onde-ocean/60 text-sm leading-relaxed line-clamp-2">
                      {book.description}
                    </p>

                    {/* Price */}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-2xl font-bold text-onde-coral">Gratis</span>
                      <span className="text-sm text-onde-ocean/40 group-hover:text-onde-coral transition-colors">
                        Leggi ora →
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* All Books Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.h3
          className="text-2xl font-display font-bold text-onde-ocean mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Tutti i Libri
        </motion.h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {books.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index % 4) * 0.1 }}
            >
              <Link href={`/libro/${book.id}`}>
                <motion.div
                  className="group"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Cover */}
                  <div className={`aspect-[3/4] rounded-2xl mb-4 overflow-hidden relative
                                   bg-gradient-to-br from-onde-${book.color}/15 to-onde-${book.color}/5
                                   shadow-card group-hover:shadow-card-hover transition-shadow duration-300`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl opacity-25 group-hover:scale-110 transition-transform duration-500">📖</span>
                    </div>
                    <span className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-medium
                                     bg-white/90 backdrop-blur-sm text-onde-ocean capitalize">
                      {book.category}
                    </span>
                  </div>

                  {/* Info */}
                  <h4 className="font-display font-bold text-onde-ocean mb-1
                                 group-hover:text-onde-coral transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-sm text-onde-ocean/50 mb-2">{book.author}</p>
                  <p className="text-lg font-bold text-onde-coral">Gratis</p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-onde-coral to-onde-coral-dark
                     p-8 md:p-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
            Tutti i libri sono gratuiti
          </h3>
          <p className="text-white/70 max-w-lg mx-auto mb-6">
            La letteratura per bambini dovrebbe essere accessibile a tutti.
            Scarica, leggi e condividi le nostre storie illustrate.
          </p>
          <Button
            href="/catalogo"
            variant="secondary"
            className="bg-white text-onde-coral hover:bg-onde-cream border-0"
          >
            Esplora il Catalogo Completo
          </Button>
        </motion.div>
      </section>
    </div>
  )
}

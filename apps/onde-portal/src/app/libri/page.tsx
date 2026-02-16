'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import SectionHeader from '@/components/ui/SectionHeader'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { useTranslations } from '@/i18n'
import KidFriendlyAd from '@/components/KidFriendlyAd'

interface Book {
  id: string
  title: string
  subtitle: string
  author: string
  description: string
  category: string
  coverImage: string
  pdfLink: string
  epubLink?: string
  price: string
  isFree: boolean
}

const books: Book[] = [
  {
    id: 'meditations',
    title: 'Meditations',
    subtitle: 'Thoughts to Himself',
    author: 'Marcus Aurelius',
    description: 'Personal notes of a Roman Emperor. Stoic philosophy. George Long translation (1862).',
    category: 'Philosophy',
    coverImage: '/books/meditations-cover.jpg',
    pdfLink: '/books/meditations-en.pdf',
    epubLink: '/books/epub/meditations-en.epub',
    price: 'Free',
    isFree: true,
  },
  {
    id: 'saggio-imperatore-it',
    title: 'Il Saggio Imperatore',
    subtitle: 'Le Avventure di Marco Aurelio',
    author: 'Gianni Parola',
    description: 'La saggezza delle Meditazioni di Marco Aurelio raccontata ai bambini. 10 capitoli illustrati con lezioni di vita.',
    category: 'Children',
    coverImage: '/books/marco-aurelio-bambini/images/00-copertina.png',
    pdfLink: 'https://github.com/FreeRiverHouse/Onde/raw/main/books/marco-aurelio-bambini/Il-Saggio-Imperatore-Professional.pdf',
    epubLink: '/books/marco-aurelio-bambini/Il-Saggio-Imperatore.epub',
    price: 'Free',
    isFree: true,
  },
  {
    id: 'wise-emperor-en',
    title: 'The Wise Emperor',
    subtitle: 'The Adventures of Marcus Aurelius',
    author: 'Gianni Parola',
    description: 'The wisdom of Marcus Aurelius\' Meditations told for children. 10 illustrated chapters with life lessons.',
    category: 'Children',
    coverImage: '/books/marco-aurelio-bambini/images/00-copertina.png',
    pdfLink: 'https://github.com/FreeRiverHouse/Onde/raw/main/books/marco-aurelio-bambini/The-Wise-Emperor-Professional.pdf',
    epubLink: '/books/marco-aurelio-bambini/The-Wise-Emperor.epub',
    price: 'Free',
    isFree: true,
  },
  {
    id: 'respiro-magico-it',
    title: 'Il Respiro Magico',
    subtitle: 'Un libro sulla calma interiore',
    author: 'Gianni Parola',
    description: 'Esercizi di respirazione e mindfulness per bambini 4-7 anni. 9 capitoli interattivi con il piccolo Tommaso.',
    category: 'Children',
    coverImage: '/books/il-respiro-magico/illustrations/00-cover.png',
    pdfLink: 'https://github.com/FreeRiverHouse/Onde/raw/main/books/il-respiro-magico/Il-Respiro-Magico-Professional.pdf',
    epubLink: '/books/il-respiro-magico/Il-Respiro-Magico.epub',
    price: 'Free',
    isFree: true,
  },
  {
    id: 'magic-breath-en',
    title: 'The Magic Breath',
    subtitle: 'A Book About Inner Calm',
    author: 'Gianni Parola',
    description: 'Breathing exercises and mindfulness for children ages 4-7. 9 interactive chapters with little Tommy.',
    category: 'Children',
    coverImage: '/books/il-respiro-magico/illustrations/00-cover.png',
    pdfLink: 'https://github.com/FreeRiverHouse/Onde/raw/main/books/il-respiro-magico/The-Magic-Breath-Professional.pdf',
    epubLink: '/books/il-respiro-magico/The-Magic-Breath.epub',
    price: 'Free',
    isFree: true,
  },
  {
    id: 'shepherds-promise',
    title: "The Shepherd's Promise",
    subtitle: 'Psalm 23 Illustrated',
    author: 'Biblical Tradition',
    description: 'Psalm 23 with watercolor illustrations for children.',
    category: 'Spirituality',
    coverImage: '/books/shepherds-promise-cover.jpg',
    pdfLink: '/books/the-shepherds-promise.pdf',
    epubLink: '/books/epub/the-shepherds-promise.epub',
    price: 'Free',
    isFree: true,
  },
  {
    id: 'psalm-23-abundance-de',
    title: 'Psalm 23 - Überfluss',
    subtitle: 'Die Verheißung der Fülle',
    author: 'Biblische Tradition',
    description: 'Psalm 23 mit Fokus auf Überfluss und Fülle. Deutsche Ausgabe.',
    category: 'Spirituality',
    coverImage: '/books/salmo-23-cover.svg',
    pdfLink: '/books/salmo-23.pdf',
    epubLink: '/books/epub/psalm-23-abundance-de.epub',
    price: 'Free',
    isFree: true,
  },
  {
    id: 'psalm-23-abundance-es',
    title: 'Salmo 23 - Abundancia',
    subtitle: 'La Promesa de la Abundancia',
    author: 'Tradición Bíblica',
    description: 'Salmo 23 con enfoque en abundancia y prosperidad. Edición en español.',
    category: 'Spirituality',
    coverImage: '/books/salmo-23-cover.svg',
    pdfLink: '/books/salmo-23.pdf',
    epubLink: '/books/epub/psalm-23-abundance-es.epub',
    price: 'Free',
    isFree: true,
  },
  {
    id: 'psalm-23-abundance-fr',
    title: 'Psaume 23 - Abondance',
    subtitle: 'La Promesse de l\'Abondance',
    author: 'Tradition Biblique',
    description: 'Psaume 23 avec focus sur l\'abondance et la prospérité. Édition française.',
    category: 'Spirituality',
    coverImage: '/books/salmo-23-cover.svg',
    pdfLink: '/books/salmo-23.pdf',
    epubLink: '/books/epub/psalm-23-abundance-fr.epub',
    price: 'Free',
    isFree: true,
  },
  {
    id: 'psalm-23-abundance-ko',
    title: '시편 23편 - 풍요',
    subtitle: '풍요의 약속',
    author: '성경 전통',
    description: '풍요와 번영에 초점을 맞춘 시편 23편. 한국어 판.',
    category: 'Spirituality',
    coverImage: '/books/salmo-23-cover.svg',
    pdfLink: '/books/salmo-23.pdf',
    epubLink: '/books/epub/psalm-23-abundance-ko.epub',
    price: 'Free',
    isFree: true,
  },
  {
    id: 'salmo-23-bambini-it',
    title: 'Salmo 23 per Bambini',
    subtitle: 'La Promessa del Pastore',
    author: 'Tradizione Biblica',
    description: 'Salmo 23 illustrato per bambini con linguaggio semplice e immagini delicate.',
    category: 'Spirituality',
    coverImage: '/books/salmo-23-cover.svg',
    pdfLink: '/books/salmo-23.pdf',
    epubLink: '/books/epub/salmo-23-bambini-it.epub',
    price: 'Free',
    isFree: true,
  },
  {
    id: 'salmo-23-bambini-en',
    title: 'Psalm 23 for Kids',
    subtitle: 'The Shepherd\'s Promise',
    author: 'Biblical Tradition',
    description: 'Psalm 23 illustrated for children with simple language and gentle images.',
    category: 'Spirituality',
    coverImage: '/books/shepherds-promise-cover.jpg',
    pdfLink: '/books/the-shepherds-promise.pdf',
    epubLink: '/books/epub/salmo-23-bambini-en.epub',
    price: 'Free',
    isFree: true,
  },
  {
    id: 'alice-wonderland-en',
    title: 'Alice\'s Adventures in Wonderland',
    subtitle: 'A Journey Down the Rabbit Hole',
    author: 'Lewis Carroll',
    description: 'Follow Alice through a fantastical underground world filled with peculiar creatures, mad tea parties, and unforgettable adventures. The beloved 1865 classic.',
    category: 'Classics',
    coverImage: '/books/alice-cover.svg',
    pdfLink: '',
    epubLink: '/books/epub/alice-wonderland-en.epub',
    price: 'Free',
    isFree: true,
  },
  {
    id: 'jungle-book-en',
    title: 'The Jungle Book',
    subtitle: 'Stories of Mowgli and the Jungle',
    author: 'Rudyard Kipling',
    description: 'The timeless tales of Mowgli, raised by wolves in the Indian jungle, and his adventures with Baloo, Bagheera, and the fearsome Shere Khan. Published 1894.',
    category: 'Classics',
    coverImage: '/books/jungle-cover.svg',
    pdfLink: '',
    epubLink: '/books/epub/jungle-book-en.epub',
    price: 'Free',
    isFree: true,
  },
  {
    id: 'peter-rabbit-en',
    title: 'The Tale of Peter Rabbit',
    subtitle: 'A Classic Children\'s Story',
    author: 'Beatrix Potter',
    description: 'The charming tale of a mischievous young rabbit who sneaks into Mr. McGregor\'s garden. Beatrix Potter\'s most beloved story, first published in 1893.',
    category: 'Children',
    coverImage: '/books/peter-rabbit-cover.svg',
    pdfLink: '',
    epubLink: '/books/epub/peter-rabbit-en.epub',
    price: 'Free',
    isFree: true,
  },
  {
    id: 'grimm-fairy-tales-en',
    title: 'Grimm\'s Fairy Tales',
    subtitle: 'Household Stories',
    author: 'Brothers Grimm',
    description: 'The timeless collection of fairy tales by Jacob and Wilhelm Grimm — Hansel and Gretel, Rapunzel, Cinderella, Snow White, and dozens more. The stories that shaped childhood imagination worldwide.',
    category: 'Classics',
    coverImage: '/books/grimm-cover.svg',
    pdfLink: '',
    epubLink: '/books/epub/grimm-fairy-tales-en.epub',
    price: 'Free',
    isFree: true,
  },
  {
    id: 'wizard-of-oz-en',
    title: 'The Wonderful Wizard of Oz',
    subtitle: 'Follow the Yellow Brick Road',
    author: 'L. Frank Baum',
    description: 'Dorothy and her dog Toto are swept away to the magical Land of Oz, where they join the Scarecrow, Tin Woodman, and Cowardly Lion on an unforgettable journey to the Emerald City. Published 1900.',
    category: 'Classics',
    coverImage: '/books/wizard-oz-cover.svg',
    pdfLink: '',
    epubLink: '/books/epub/wizard-of-oz-en.epub',
    price: 'Free',
    isFree: true,
  },
  {
    id: 'andersen-fairy-tales-en',
    title: 'Andersen\'s Fairy Tales',
    subtitle: 'Stories of Wonder and Magic',
    author: 'Hans Christian Andersen',
    description: 'The enchanting tales of Hans Christian Andersen — The Little Mermaid, The Ugly Duckling, The Snow Queen, The Emperor\'s New Clothes, and more. Danish storytelling at its most magical.',
    category: 'Classics',
    coverImage: '/books/andersen-cover.svg',
    pdfLink: '',
    epubLink: '/books/epub/andersen-fairy-tales-en.epub',
    price: 'Free',
    isFree: true,
  },
  {
    id: 'frankenstein-en',
    title: 'Frankenstein',
    subtitle: 'Or, The Modern Prometheus',
    author: 'Mary Shelley',
    description: 'The legendary tale of Victor Frankenstein and his monstrous creation. A masterpiece of Gothic literature exploring ambition, isolation, and the consequences of playing God. First published in 1818.',
    category: 'Classics',
    coverImage: '/books/frankenstein-cover.svg',
    pdfLink: '',
    epubLink: '/books/epub/frankenstein-en.epub',
    price: 'Free',
    isFree: true,
  },
]

export default function LibriPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen py-12 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumb items={[
          { label: 'Home', href: '/', emoji: '🏠' },
          { label: 'Books', emoji: '📚' },
        ]} />
      </div>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
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
            badge={t.books.badge}
            title={t.books.title}
            subtitle={t.books.subtitle}
            gradient="coral"
          />
        </div>
      </section>

      {/* Books Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid md:grid-cols-2 gap-8">
          {books.map((book, index) => (
            <motion.div
              key={book.id}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl border border-amber-200/50 dark:border-gray-700
                         shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              {/* Cover Image */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-700 dark:to-gray-800">
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  fill
                  className="object-contain p-4"
                  priority={index === 0}
                />
                {/* Category Badge */}
                <span className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-xs font-semibold
                               bg-amber-900/80 text-amber-100 backdrop-blur-md shadow-lg">
                  {book.category}
                </span>
                {/* Price Badge */}
                <span className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg
                               ${book.isFree
                                 ? 'bg-green-500 text-white'
                                 : 'bg-amber-500 text-white'}`}>
                  {book.price}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-2xl font-display font-bold text-amber-900 dark:text-amber-200 mb-1">
                  {book.title}
                </h2>
                <p className="text-amber-900 dark:text-amber-300 mb-1">{book.subtitle}</p>
                <p className="text-gray-700 dark:text-gray-400 text-sm mb-4">by {book.author}</p>

                <p className="text-gray-800 dark:text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3">
                  {book.description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {book.pdfLink && (
                    <a
                      href={book.pdfLink}
                      download
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                               bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-sm
                               shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40
                               transition-all duration-300 hover:scale-[1.02]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </a>
                    )}
                    {book.epubLink && (
                      <a
                        href={book.epubLink}
                        download
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                                 bg-onde-ocean/10 text-onde-ocean font-semibold text-sm
                                 hover:bg-onde-ocean/20 transition-all duration-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      EPUB
                      </a>
                    )}
                  </div>
                  {book.epubLink && (
                    <Link
                      href={`/libro/${book.id}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                               bg-gradient-to-r from-onde-teal to-onde-blue text-white font-semibold text-sm
                               shadow-lg shadow-onde-teal/30 hover:shadow-xl hover:shadow-onde-teal/40
                               transition-all duration-300 hover:scale-[1.02]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Read Now
                    </Link>
                  )}
                </div>

                {/* Free Label */}
                {book.isFree && (
                  <p className="mt-4 text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Free illustrated edition
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-onde-ocean/5 to-onde-teal/10 dark:from-gray-800 dark:to-gray-800
                     p-8 md:p-12 text-center border border-onde-ocean/10 dark:border-gray-700"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-4xl mb-4 block">📖</span>
          <h3 className="text-2xl font-display font-bold text-onde-ocean dark:text-teal-300 mb-4">
            More Books Coming Soon
          </h3>
          <p className="text-gray-700 dark:text-gray-300 max-w-lg mx-auto">
            We&apos;re preparing more beautifully illustrated editions of classic literature.
            Stay tuned for new releases.
          </p>
        </motion.div>
      </section>

      {/* Sponsored — kid-friendly affiliate ad */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex justify-center">
          <KidFriendlyAd slot="libri-bottom" className="w-full" />
        </div>
      </section>

      {/* Explore More - Cross Links */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-display font-bold text-center text-amber-800 dark:text-amber-300 mb-8">✨ Explore More on Onde</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/games/"
              className="group flex items-center gap-3 p-5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border-2 border-sky-200 dark:border-sky-800 shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">🎮</span>
              <div>
                <p className="font-bold text-sky-800 dark:text-sky-300">Games</p>
                <p className="text-sm text-sky-600/70 dark:text-sky-400/70">50+ free browser games for kids</p>
              </div>
            </Link>
            <Link
              href="/games/skin-creator"
              className="group flex items-center gap-3 p-5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border-2 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">🎨</span>
              <div>
                <p className="font-bold text-purple-800 dark:text-purple-300">Skin Creator</p>
                <p className="text-sm text-purple-600/70 dark:text-purple-400/70">Design Minecraft skins with AI</p>
              </div>
            </Link>
            <Link
              href="/shop/"
              className="group flex items-center gap-3 p-5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border-2 border-teal-200 dark:border-teal-800 shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">🛍️</span>
              <div>
                <p className="font-bold text-teal-800 dark:text-teal-300">Shop</p>
                <p className="text-sm text-teal-600/70 dark:text-teal-400/70">Stickers, merch & more</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

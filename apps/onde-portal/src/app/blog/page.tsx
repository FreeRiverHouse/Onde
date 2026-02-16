'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { blogPosts, BLOG_CATEGORIES, type BlogCategory } from '@/data/blog-posts'

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'All'>('All')

  const filteredPosts =
    activeCategory === 'All'
      ? blogPosts
      : blogPosts.filter((post) => post.category === activeCategory)

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 dark:opacity-20"
          style={{ background: 'var(--onde-purple)', left: '-10%', top: '10%' }}
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 dark:opacity-20"
          style={{ background: 'var(--onde-teal)', right: '-5%', top: '50%' }}
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Breadcrumb */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/', emoji: '🏠' },
            { label: 'Blog', emoji: '📝' },
          ]}
        />
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl
                       bg-gradient-to-br from-onde-teal/20 to-onde-purple/20
                       border border-white/10 shadow-xl shadow-onde-teal/10 mb-8"
          >
            <span className="text-4xl">📝</span>
          </motion.div>

          <motion.div
            className="section-badge-futuristic mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="w-2 h-2 rounded-full bg-onde-teal animate-pulse" />
            Stories from the Lab
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-onde-ocean dark:text-white">Onde </span>
            <span className="text-gradient-neon">Blog</span>
          </motion.h1>

          <motion.p
            className="text-lg text-onde-ocean/70 dark:text-white/70 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Tech deep dives, AI agents, eGPU setups, and
            engineering stories from the FreeRiverHouse lab.
          </motion.p>

          {/* RSS Feed Link */}
          <motion.div
            className="mt-6 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <a
              href="/blog/feed.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-onde-ocean/10 dark:border-white/10 bg-onde-ocean/5 dark:bg-white/5 text-onde-ocean/60 dark:text-white/60 hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-400/30 hover:bg-orange-400/5 transition-all duration-300 text-sm min-h-[44px]"
              title="Subscribe via RSS"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="6.18" cy="17.82" r="2.18"/>
                <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>
              </svg>
              RSS Feed
            </a>
          </motion.div>

          <div className="glow-line w-32 mx-auto mt-8" />
        </div>

        {/* Category Filter Tabs */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {BLOG_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value
            const count =
              cat.value === 'All'
                ? blogPosts.length
                : blogPosts.filter((p) => p.category === cat.value).length

            // Hide empty categories (except "All")
            if (cat.value !== 'All' && count === 0) return null

            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`
                  group relative flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium
                  border transition-all duration-300 cursor-pointer
                  ${
                    isActive
                      ? 'bg-onde-teal/15 border-onde-teal/40 text-onde-teal shadow-lg shadow-onde-teal/10'
                      : 'bg-onde-ocean/5 dark:bg-white/5 border-onde-ocean/10 dark:border-white/10 text-onde-ocean/50 dark:text-white/50 hover:bg-onde-ocean/10 dark:hover:bg-white/10 hover:text-onde-ocean/70 dark:hover:text-white/70 hover:border-onde-ocean/20 dark:hover:border-white/20'
                  }
                `}
              >
                <span className="text-base">{cat.emoji}</span>
                <span>{cat.label}</span>
                <span
                  className={`
                    text-xs px-1.5 py-0.5 rounded-full
                    ${isActive ? 'bg-onde-teal/20 text-onde-teal' : 'bg-onde-ocean/10 dark:bg-white/10 text-onde-ocean/40 dark:text-white/40'}
                  `}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </motion.div>
      </section>

      {/* Posts Grid */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {filteredPosts.length === 0 ? (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-5xl mb-4 block">🏗️</span>
                <p className="text-onde-ocean/50 dark:text-white/50 text-lg">
                  No posts in this category yet. Stay tuned!
                </p>
              </motion.div>
            ) : (
              filteredPosts.map((post, index) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`} className="group block">
                    <div
                      className="card-3d p-8 md:p-10 relative overflow-hidden
                                 hover:border-white/20 transition-all duration-500"
                    >
                      {/* Gradient accent */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${post.gradient}
                                   opacity-60 group-hover:opacity-100 transition-opacity`}
                      />

                      <div className="flex flex-col md:flex-row md:items-start gap-6">
                        {/* Emoji icon */}
                        <motion.div
                          className="flex-shrink-0 w-16 h-16 rounded-2xl bg-onde-ocean/5 dark:bg-white/5 border border-onde-ocean/10 dark:border-white/10
                                     flex items-center justify-center text-3xl
                                     group-hover:scale-110 group-hover:bg-onde-ocean/10 dark:group-hover:bg-white/10 transition-all duration-300"
                          whileHover={{ rotate: [0, -5, 5, 0] }}
                        >
                          {post.emoji}
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          {/* Meta */}
                          <div className="flex flex-wrap items-center gap-3 text-sm text-onde-ocean/40 dark:text-white/40 mb-3">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
                                         bg-onde-ocean/5 dark:bg-white/5 border border-onde-ocean/10 dark:border-white/10 text-onde-ocean/60 dark:text-white/60 text-xs font-medium"
                            >
                              {BLOG_CATEGORIES.find((c) => c.value === post.category)?.emoji}{' '}
                              {post.category}
                            </span>
                            <span>{post.date}</span>
                            <span className="w-1 h-1 rounded-full bg-onde-ocean/20 dark:bg-white/20" />
                            <span>{post.readTime}</span>
                          </div>

                          {/* Title */}
                          <h2
                            className="text-2xl md:text-3xl font-display font-bold text-onde-ocean dark:text-white mb-2
                                       group-hover:text-onde-teal transition-colors duration-300"
                          >
                            {post.title}
                          </h2>

                          <p className="text-onde-teal font-medium mb-3">{post.subtitle}</p>

                          {/* Excerpt */}
                          <p className="text-onde-ocean/70 dark:text-white/70 text-base leading-relaxed mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-3 py-1 rounded-full text-xs font-medium
                                           bg-onde-ocean/5 dark:bg-white/5 text-onde-ocean/60 dark:text-white/50 border border-onde-ocean/10 dark:border-white/10
                                           group-hover:bg-onde-ocean/10 dark:group-hover:bg-white/10 group-hover:text-onde-ocean dark:group-hover:text-white/70
                                           transition-all duration-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Arrow */}
                        <div
                          className="hidden md:flex flex-shrink-0 items-center self-center
                                     text-onde-ocean/20 dark:text-white/20 group-hover:text-onde-teal group-hover:translate-x-1
                                     transition-all duration-300"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Explore More */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-display font-bold text-center text-onde-ocean dark:text-white mb-8">
            ✨ Explore More on Onde
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/libri/"
              className="group flex items-center gap-3 p-5 min-h-[64px] card-3d hover:border-onde-ocean/20 dark:hover:border-white/20 transition-all active:scale-[0.98]"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">📚</span>
              <div>
                <p className="font-bold text-onde-ocean dark:text-white">Books</p>
                <p className="text-sm text-onde-ocean/60 dark:text-white/60">Free illustrated classics</p>
              </div>
            </Link>
            <Link
              href="/games/"
              className="group flex items-center gap-3 p-5 min-h-[64px] card-3d hover:border-onde-ocean/20 dark:hover:border-white/20 transition-all active:scale-[0.98]"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">🎮</span>
              <div>
                <p className="font-bold text-onde-ocean dark:text-white">Games</p>
                <p className="text-sm text-onde-ocean/60 dark:text-white/60">50+ free browser games</p>
              </div>
            </Link>
            <Link
              href="/about/"
              className="group flex items-center gap-3 p-5 min-h-[64px] card-3d hover:border-onde-ocean/20 dark:hover:border-white/20 transition-all active:scale-[0.98]"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">🌊</span>
              <div>
                <p className="font-bold text-onde-ocean dark:text-white">About</p>
                <p className="text-sm text-onde-ocean/60 dark:text-white/60">Our story & mission</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

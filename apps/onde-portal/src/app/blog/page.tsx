'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { blogPosts } from '@/data/blog-posts'

const posts = blogPosts

export default function BlogPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
          style={{ background: 'var(--onde-purple)', left: '-10%', top: '10%' }}
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-20"
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
            { label: 'Tech', emoji: '⚡' },
          ]}
        />
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl
                       bg-gradient-to-br from-onde-teal/20 to-onde-purple/20
                       border border-white/10 shadow-xl shadow-onde-teal/10 mb-8"
          >
            <span className="text-4xl">⚡</span>
          </motion.div>

          <motion.div
            className="section-badge-futuristic mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="w-2 h-2 rounded-full bg-onde-teal animate-pulse" />
            Behind the Scenes
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-white">Onde </span>
            <span className="text-gradient-neon">Tech</span>
          </motion.h1>

          <motion.p
            className="text-lg text-white/60 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Behind the scenes at Onde — the tech stack, AI agents, trading bots,
            eGPU setups, and engineering deep dives from the lab.
          </motion.p>

          <div className="glow-line w-32 mx-auto mt-8" />
        </div>
      </section>

      {/* Posts Grid */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="space-y-8">
          {posts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.15 }}
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
                      className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/5 border border-white/10
                                 flex items-center justify-center text-3xl
                                 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300"
                      whileHover={{ rotate: [0, -5, 5, 0] }}
                    >
                      {post.emoji}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-white/40 mb-3">
                        <span>{post.date}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span>{post.readTime}</span>
                      </div>

                      {/* Title */}
                      <h2
                        className="text-2xl md:text-3xl font-display font-bold text-white mb-2
                                   group-hover:text-onde-teal transition-colors duration-300"
                      >
                        {post.title}
                      </h2>

                      <p className="text-onde-teal/80 font-medium mb-3">{post.subtitle}</p>

                      {/* Excerpt */}
                      <p className="text-white/60 leading-relaxed mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full text-xs font-medium
                                       bg-white/5 text-white/50 border border-white/10
                                       group-hover:bg-white/10 group-hover:text-white/70
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
                                 text-white/20 group-hover:text-onde-teal group-hover:translate-x-1
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
          ))}
        </div>
      </section>

      {/* Explore More */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-display font-bold text-center text-white mb-8">
            ✨ Explore More on Onde
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/libri/"
              className="group flex items-center gap-3 p-5 card-3d hover:border-white/20 transition-all"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">📚</span>
              <div>
                <p className="font-bold text-white">Books</p>
                <p className="text-sm text-white/50">Free illustrated classics</p>
              </div>
            </Link>
            <Link
              href="/games/"
              className="group flex items-center gap-3 p-5 card-3d hover:border-white/20 transition-all"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">🎮</span>
              <div>
                <p className="font-bold text-white">Games</p>
                <p className="text-sm text-white/50">50+ free browser games</p>
              </div>
            </Link>
            <Link
              href="/about/"
              className="group flex items-center gap-3 p-5 card-3d hover:border-white/20 transition-all"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">🌊</span>
              <div>
                <p className="font-bold text-white">About</p>
                <p className="text-sm text-white/50">Our story & mission</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

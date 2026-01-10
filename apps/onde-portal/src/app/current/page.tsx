'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

type PostCategory = 'cheat-code' | 'shortcut' | 'hot-ship' | 'quick-win' | 'deep-dive' | 'news'
type PostSource = 'community' | 'news'

interface Post {
  id: string
  title: string
  bullets: string[]  // 3 bullet points of value
  author: string
  authorHandle: string
  authorAvatar?: string
  category: PostCategory
  source: PostSource
  tweetUrl: string
  timestamp: string
  likes?: number
}

const categoryConfig: Record<PostCategory, { label: string; emoji: string; color: string; bgColor: string; description: string }> = {
  'cheat-code': {
    label: 'Cheat Code',
    emoji: '🎮',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20 border-purple-500/50',
    description: 'Tips that save you hours'
  },
  'shortcut': {
    label: 'The Shortcut',
    emoji: '⚡',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20 border-yellow-500/50',
    description: 'Faster ways to do things'
  },
  'hot-ship': {
    label: 'Hot Ship',
    emoji: '🔥',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20 border-orange-500/50',
    description: 'Just shipped, trending now'
  },
  'quick-win': {
    label: 'Quick Win',
    emoji: '💡',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20 border-green-500/50',
    description: 'Learn in 2 minutes'
  },
  'deep-dive': {
    label: 'Deep Dive',
    emoji: '🧠',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20 border-blue-500/50',
    description: 'Worth the read'
  },
  'news': {
    label: 'News',
    emoji: '📰',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20 border-cyan-500/50',
    description: 'Just announced'
  },
}

// Sample posts - ultra concise format: title + 3 bullets of VALUE
const samplePosts: Post[] = [
  // === NEWS ===
  {
    id: 'news-1',
    title: 'ChatGPT o3 Update',
    bullets: [
      '2x faster responses on complex tasks',
      'Better code generation accuracy',
      'New canvas mode for visual projects'
    ],
    author: 'OpenAI',
    authorHandle: '@OpenAI',
    category: 'news',
    source: 'news',
    tweetUrl: 'https://x.com/OpenAI',
    timestamp: '2h ago',
    likes: 15000,
  },
  {
    id: 'news-2',
    title: 'Claude Opus 4.5 Released',
    bullets: [
      'Extended thinking for complex problems',
      'Better at coding than any model',
      'Runs in your terminal with Claude Code'
    ],
    author: 'Anthropic',
    authorHandle: '@AnthropicAI',
    category: 'news',
    source: 'news',
    tweetUrl: 'https://x.com/AnthropicAI',
    timestamp: '1d ago',
    likes: 8900,
  },
  // === COMMUNITY ===
  {
    id: 'cc-1',
    title: 'Claude "ultrathink" Mode',
    bullets: [
      'Add "ultrathink" to activate extended thinking',
      'Perfect for complex code reviews',
      'Catches bugs you would miss'
    ],
    author: 'Dev Tips',
    authorHandle: '@devtips',
    category: 'cheat-code',
    source: 'community',
    tweetUrl: 'https://x.com/devtips',
    timestamp: '4h ago',
    likes: 890,
  },
  {
    id: 'sc-1',
    title: 'Parallel Agents in Claude Code',
    bullets: [
      'Use Task tool to spawn multiple agents',
      'Refactor 50 files in 3 minutes',
      'Each agent works independently'
    ],
    author: 'Ship Fast',
    authorHandle: '@shipfast',
    category: 'shortcut',
    source: 'community',
    tweetUrl: 'https://x.com/shipfast',
    timestamp: '6h ago',
    likes: 1200,
  },
  {
    id: 'qw-1',
    title: 'Screenshot → Bug Fix',
    bullets: [
      'Drag screenshot directly into Claude',
      'It understands the visual context',
      'Get fix suggestions instantly'
    ],
    author: 'Today I Learned',
    authorHandle: '@til_dev',
    category: 'quick-win',
    source: 'community',
    tweetUrl: 'https://x.com/til_dev',
    timestamp: '8h ago',
    likes: 670,
  },
  {
    id: 'cc-2',
    title: 'Cursor + Claude Opus',
    bullets: [
      'Set Claude as AI model in Cursor settings',
      'Code completion is 10x better',
      'Tab-complete entire functions'
    ],
    author: 'Vibe Coder',
    authorHandle: '@vibecoder',
    category: 'cheat-code',
    source: 'community',
    tweetUrl: 'https://x.com/vibecoder',
    timestamp: '3h ago',
    likes: 1500,
  },
  {
    id: 'hs-1',
    title: 'MCP Servers Dropped',
    bullets: [
      'Connect Claude to Notion, Linear, GitHub',
      'AI has context on everything',
      'No more copy-pasting context'
    ],
    author: 'MCP Updates',
    authorHandle: '@mcpupdates',
    category: 'hot-ship',
    source: 'community',
    tweetUrl: 'https://x.com/mcpupdates',
    timestamp: '5h ago',
    likes: 980,
  },
  {
    id: 'sc-2',
    title: 'Debug Shortcut',
    bullets: [
      'Just paste error + code, nothing else',
      'Claude figures out the context',
      'Save 5 min per debug session'
    ],
    author: 'Debug Pro',
    authorHandle: '@debugpro',
    category: 'shortcut',
    source: 'community',
    tweetUrl: 'https://x.com/debugpro',
    timestamp: '7h ago',
    likes: 450,
  },
  {
    id: 'dd-1',
    title: 'SaaS in a Weekend',
    bullets: [
      'Idea to Stripe payments in 48h',
      'Claude Code wrote 90% of the code',
      'Full thread with exact steps'
    ],
    author: 'Weekend Builder',
    authorHandle: '@weekendbuilder',
    category: 'deep-dive',
    source: 'community',
    tweetUrl: 'https://x.com/weekendbuilder',
    timestamp: '1d ago',
    likes: 3400,
  },
]

function PostCard({ post, index }: { post: Post; index: number }) {
  const config = categoryConfig[post.category]

  return (
    <motion.a
      href={post.tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <div className="relative glass-dark rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group">
        {/* Category Badge - Pops! */}
        <motion.div
          className={`absolute -top-3 left-4 px-3 py-1.5 rounded-full text-sm font-bold border ${config.bgColor} ${config.color} flex items-center gap-1.5 shadow-lg`}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: index * 0.05 + 0.2, type: 'spring', stiffness: 500 }}
        >
          <span>{config.emoji}</span>
          <span>{config.label}</span>
        </motion.div>

        {/* Content */}
        <div className="mt-4">
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-3">
            {post.title}
          </h3>

          {/* Value Bullets - Ultra Concise */}
          <ul className="space-y-1.5 mb-4">
            {post.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2 text-white/80">
                <span className={`${config.color} text-sm mt-0.5`}>→</span>
                <span className="text-sm leading-snug">{bullet}</span>
              </li>
            ))}
          </ul>

          {/* Author & Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-onde-teal to-onde-purple flex items-center justify-center text-white font-bold">
                {post.author[0]}
              </div>
              <div>
                <div className="text-white font-medium">{post.author}</div>
                <div className="text-white/40 text-sm">{post.authorHandle}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white/40 text-sm">
              <span>{post.timestamp}</span>
              {post.likes && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  {post.likes.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-white/5 to-transparent"
        />
      </div>
    </motion.a>
  )
}

export default function CurrentPage() {
  const [activeFilter, setActiveFilter] = useState<PostCategory | 'all'>('all')

  const filteredPosts = activeFilter === 'all'
    ? samplePosts
    : samplePosts.filter(p => p.category === activeFilter)

  return (
    <div className="min-h-screen py-12">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Logo */}
          <motion.div
            className="inline-flex items-center gap-3 mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-onde-teal via-onde-purple to-onde-coral flex items-center justify-center">
              <span className="text-3xl">⚡</span>
            </div>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4">
            Current<span className="text-gradient-neon">Vibe</span>
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-2">
            3 lines. Real value. Keep moving.
          </p>
          <p className="text-white/40 mb-8">
            The AI community curates. You ship faster.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{samplePosts.length}</div>
              <div className="text-white/40 text-sm">Posts Today</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-onde-teal">~12h</div>
              <div className="text-white/40 text-sm">Time Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-onde-coral">47</div>
              <div className="text-white/40 text-sm">Contributors</div>
            </div>
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeFilter === 'all'
                ? 'bg-white text-onde-dark'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            All Posts
          </button>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key as PostCategory)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                activeFilter === key
                  ? `${config.bgColor} ${config.color} border`
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <span>{config.emoji}</span>
              <span>{config.label}</span>
            </button>
          ))}
        </motion.div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            className="grid gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredPosts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/40">No posts in this category yet</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          className="glass-dark rounded-3xl p-8 text-center border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-display font-bold text-white mb-3">
            Got a tip worth sharing?
          </h3>
          <p className="text-white/60 mb-6">
            Tag @FreeRiverHouse on X and we&apos;ll feature the best ones
          </p>
          <a
            href="https://x.com/FreeRiverHouse"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 btn-futuristic"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Share on X
          </a>
        </motion.div>
      </section>
    </div>
  )
}

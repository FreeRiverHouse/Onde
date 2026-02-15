'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Types ─── */
interface ReactionData {
  counts: Record<string, number>
  reacted: string[] // emojis the user already clicked
}

interface BlogReactionsProps {
  slug: string
}

/* ─── Config ─── */
const REACTIONS = [
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🧠', label: 'Big brain' },
  { emoji: '💡', label: 'Insightful' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '🤔', label: 'Thinking' },
] as const

const STORAGE_KEY_PREFIX = 'onde-blog-reactions-'

/* ─── Helpers ─── */
function getStorageKey(slug: string) {
  return `${STORAGE_KEY_PREFIX}${slug}`
}

function loadReactions(slug: string): ReactionData {
  if (typeof window === 'undefined') return { counts: {}, reacted: [] }
  try {
    const raw = localStorage.getItem(getStorageKey(slug))
    if (raw) return JSON.parse(raw)
  } catch {
    // corrupted data, reset
  }
  return { counts: {}, reacted: [] }
}

function saveReactions(slug: string, data: ReactionData) {
  try {
    localStorage.setItem(getStorageKey(slug), JSON.stringify(data))
  } catch {
    // localStorage full or blocked, fail silently
  }
}

/* ─── Component ─── */
export default function BlogReactions({ slug }: BlogReactionsProps) {
  const [data, setData] = useState<ReactionData>({ counts: {}, reacted: [] })
  const [justReacted, setJustReacted] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setData(loadReactions(slug))
    setMounted(true)
  }, [slug])

  const handleReact = useCallback(
    (emoji: string) => {
      setData((prev) => {
        const alreadyReacted = prev.reacted.includes(emoji)

        const next: ReactionData = {
          counts: {
            ...prev.counts,
            [emoji]: Math.max(0, (prev.counts[emoji] || 0) + (alreadyReacted ? -1 : 1)),
          },
          reacted: alreadyReacted
            ? prev.reacted.filter((e) => e !== emoji)
            : [...prev.reacted, emoji],
        }

        saveReactions(slug, next)
        return next
      })

      // Trigger bounce animation
      setJustReacted(emoji)
      setTimeout(() => setJustReacted(null), 600)
    },
    [slug],
  )

  // Don't render anything until client-side hydration
  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-3 py-8">
        {REACTIONS.map(({ emoji }) => (
          <div
            key={emoji}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.06]"
          >
            <span className="text-xl opacity-40">{emoji}</span>
            <span className="text-sm text-white/20 font-medium tabular-nums min-w-[1ch]">0</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mt-12 mb-4"
    >
      {/* Label */}
      <p className="text-center text-white/30 text-sm mb-4 tracking-wide">
        React to this post
      </p>

      {/* Reaction buttons */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        {REACTIONS.map(({ emoji, label }) => {
          const count = data.counts[emoji] || 0
          const isReacted = data.reacted.includes(emoji)
          const isBouncing = justReacted === emoji

          return (
            <motion.button
              key={emoji}
              onClick={() => handleReact(emoji)}
              animate={
                isBouncing
                  ? { scale: [1, 1.3, 0.9, 1.1, 1] }
                  : { scale: 1 }
              }
              transition={
                isBouncing
                  ? { duration: 0.5, ease: 'easeInOut' }
                  : { duration: 0.15 }
              }
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              title={label}
              className={`
                relative flex items-center gap-1.5 px-4 py-2.5 rounded-full
                transition-all duration-200 cursor-pointer select-none
                border
                ${
                  isReacted
                    ? 'bg-onde-teal/10 border-onde-teal/30 shadow-[0_0_12px_rgba(0,200,180,0.1)]'
                    : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]'
                }
              `}
            >
              <span className={`text-xl transition-all duration-200 ${isReacted ? '' : 'grayscale-[30%]'}`}>
                {emoji}
              </span>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={count}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className={`text-sm font-medium tabular-nums min-w-[1ch] ${
                    isReacted ? 'text-onde-teal' : 'text-white/40'
                  }`}
                >
                  {count}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

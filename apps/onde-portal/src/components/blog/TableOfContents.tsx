'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface TocItem {
  id: string
  label: string
  emoji?: string
}

interface TableOfContentsProps {
  items: TocItem[]
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [isVisible, setIsVisible] = useState(false)

  /* ── Track which section is in view ── */
  useEffect(() => {
    const ids = items.map((i) => i.id)
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible entry (topmost)
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1,
      },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items])

  /* ── Show TOC only after scrolling past the hero ── */
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const offset = 100
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          aria-label="Table of contents"
          className="hidden xl:block fixed right-[max(1rem,calc((100vw-56rem)/2-16rem))] top-32
                     w-56 z-40"
        >
          <div
            className="rounded-2xl border border-white/10 bg-onde-dark-surface/60
                        backdrop-blur-xl shadow-xl shadow-black/20 p-4"
          >
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-3 px-1">
              On this page
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const isActive = activeId === item.id
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollTo(item.id)}
                      className={`
                        w-full text-left text-[13px] leading-snug rounded-lg px-2.5 py-1.5
                        transition-all duration-200 flex items-center gap-2
                        ${
                          isActive
                            ? 'text-onde-teal bg-onde-teal/10 font-medium'
                            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                        }
                      `}
                    >
                      {item.emoji && (
                        <span className="text-xs flex-shrink-0">{item.emoji}</span>
                      )}
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="toc-active-dot"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-onde-teal flex-shrink-0"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}

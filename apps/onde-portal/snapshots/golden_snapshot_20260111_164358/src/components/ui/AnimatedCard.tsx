'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  variant?: 'coral' | 'gold' | 'teal' | 'default'
  delay?: number
  href?: string
}

const variantStyles = {
  coral: 'border-onde-coral/20 hover:border-onde-coral/40 hover:shadow-glow-coral',
  gold: 'border-onde-gold/20 hover:border-onde-gold/40 hover:shadow-glow-gold',
  teal: 'border-onde-teal/20 hover:border-onde-teal/40 hover:shadow-glow-teal',
  default: 'border-white/50 hover:border-onde-coral/30',
}

export default function AnimatedCard({
  children,
  className = '',
  variant = 'default',
  delay = 0,
  href,
}: AnimatedCardProps) {
  const cardContent = (
    <motion.div
      className={`
        relative bg-white/80 backdrop-blur-sm rounded-3xl p-6
        border shadow-card cursor-pointer overflow-hidden
        transition-colors duration-300
        ${variantStyles[variant]}
        ${className}
      `}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3 },
      }}
    >
      {/* Gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        style={{
          background: `linear-gradient(135deg,
            rgba(255, 127, 127, 0.03) 0%,
            rgba(244, 208, 63, 0.03) 50%,
            rgba(72, 201, 176, 0.03) 100%
          )`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )

  if (href) {
    return <a href={href}>{cardContent}</a>
  }

  return cardContent
}

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
  coral: 'border-onde-coral/20 hover:border-onde-coral/40',
  gold: 'border-onde-gold/20 hover:border-onde-gold/40',
  teal: 'border-onde-teal/20 hover:border-onde-teal/40',
  default: 'border-white/50 hover:border-onde-coral/30',
}

// Shadow variants for enhanced depth on hover
const shadowStyles = {
  coral: '0 20px 40px -10px rgba(255, 127, 127, 0.25)',
  gold: '0 20px 40px -10px rgba(212, 175, 55, 0.25)',
  teal: '0 20px 40px -10px rgba(91, 154, 160, 0.25)',
  default: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
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
        transition-all duration-300
        group
        ${variantStyles[variant]}
        ${className}
      `}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: shadowStyles[variant],
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 },
      }}
    >
      {/* Gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-3xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `linear-gradient(135deg,
            rgba(255, 127, 127, 0.05) 0%,
            rgba(244, 208, 63, 0.05) 50%,
            rgba(72, 201, 176, 0.05) 100%
          )`,
        }}
      />

      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
        }}
        initial={{ backgroundPosition: '200% 0' }}
        whileHover={{
          backgroundPosition: '-100% 0',
          transition: { duration: 0.6, ease: 'easeOut' },
        }}
      />

      {/* Content with icon wobble support */}
      <div className="relative z-10 [&_.card-icon]:transition-transform [&_.card-icon]:duration-300 [&_.card-icon]:group-hover:scale-110 [&_.card-icon]:group-hover:rotate-3">
        {children}
      </div>
    </motion.div>
  )

  if (href) {
    return <a href={href}>{cardContent}</a>
  }

  return cardContent
}

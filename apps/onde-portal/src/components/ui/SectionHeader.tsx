'use client'

import { motion } from 'framer-motion'

interface SectionHeaderProps {
  badge?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  gradient?: 'coral' | 'gold' | 'teal' | 'sunset'
}

const gradientMap = {
  coral: 'from-onde-coral to-onde-coral-light',
  gold: 'from-onde-gold to-onde-gold-light',
  teal: 'from-onde-teal to-onde-teal-light',
  sunset: 'from-onde-coral via-onde-gold to-onde-teal',
}

export default function SectionHeader({
  badge,
  title,
  subtitle,
  align = 'center',
  gradient = 'coral',
}: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left'

  return (
    <motion.div
      className={`mb-12 md:mb-16 ${alignClass}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {badge && (
        <motion.span
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                     text-sm font-semibold mb-6
                     bg-gradient-to-r from-onde-coral/10 to-onde-gold/10
                     text-onde-coral border border-onde-coral/20"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {badge}
        </motion.span>
      )}

      <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-onde-ocean mb-4">
        <span className={`bg-clip-text text-transparent bg-gradient-to-r ${gradientMap[gradient]}`}>
          {title}
        </span>
      </h2>

      {subtitle && (
        <motion.p
          className={`text-lg md:text-xl text-onde-ocean/60 leading-relaxed
                      ${align === 'center' ? 'max-w-2xl mx-auto' : 'max-w-xl'}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {subtitle}
        </motion.p>
      )}

      {/* Decorative line */}
      <motion.div
        className={`h-1 w-24 rounded-full mt-6
                    bg-gradient-to-r ${gradientMap[gradient]}
                    ${align === 'center' ? 'mx-auto' : ''}`}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
    </motion.div>
  )
}

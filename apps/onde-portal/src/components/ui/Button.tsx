'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import Link from 'next/link'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'gold' | 'teal' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  onClick?: () => void
  className?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  disabled?: boolean
}

const variantStyles = {
  primary: `
    bg-gradient-to-r from-onde-coral to-onde-coral-light
    text-white shadow-lg shadow-onde-coral/30
    hover:shadow-xl hover:shadow-onde-coral/40
  `,
  secondary: `
    bg-white/80 backdrop-blur-sm
    text-onde-ocean border-2 border-onde-ocean/20
    hover:bg-onde-cream hover:border-onde-coral/40
  `,
  gold: `
    bg-gradient-to-r from-onde-gold to-onde-gold-light
    text-onde-ocean shadow-lg shadow-onde-gold/30
    hover:shadow-xl hover:shadow-onde-gold/40
  `,
  teal: `
    bg-gradient-to-r from-onde-teal to-onde-teal-light
    text-white shadow-lg shadow-onde-teal/30
    hover:shadow-xl hover:shadow-onde-teal/40
  `,
  ghost: `
    bg-transparent text-onde-ocean
    hover:bg-onde-coral/10
  `,
}

const sizeStyles = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-base rounded-2xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className = '',
  icon,
  iconPosition = 'right',
  disabled = false,
}: ButtonProps) {
  const baseStyles = `
    relative inline-flex items-center justify-center gap-2
    font-semibold transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-onde-coral
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </>
  )

  const motionProps = {
    whileHover: disabled ? {} : { scale: 1.05 },
    whileTap: disabled ? {} : { scale: 0.98 },
    transition: { duration: 0.2 },
  }

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

  if (href && !disabled) {
    return (
      <Link href={href}>
        <motion.span className={combinedClassName} {...motionProps}>
          {content}
        </motion.span>
      </Link>
    )
  }

  return (
    <motion.button
      className={combinedClassName}
      onClick={onClick}
      disabled={disabled}
      {...motionProps}
    >
      {content}
    </motion.button>
  )
}

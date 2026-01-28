'use client'

import { type ReactNode } from 'react'
import { TiltCard } from './TiltCard'

interface GlowCardProps {
  children: ReactNode
  className?: string
  variant?: 'cyan' | 'gold' | 'purple' | 'emerald'
  noPadding?: boolean
  noTilt?: boolean
}

const variantColors = {
  cyan: {
    glow: 'rgba(6, 182, 212, 0.4)',
    border: 'border-cyan-500/20 hover:border-cyan-400/40',
    bg: 'from-cyan-500/10 to-cyan-500/5',
    shadow: 'hover:shadow-cyan-500/20',
  },
  gold: {
    glow: 'rgba(251, 191, 36, 0.4)',
    border: 'border-amber-500/20 hover:border-amber-400/40',
    bg: 'from-amber-500/10 to-amber-500/5',
    shadow: 'hover:shadow-amber-500/20',
  },
  purple: {
    glow: 'rgba(139, 92, 246, 0.4)',
    border: 'border-purple-500/20 hover:border-purple-400/40',
    bg: 'from-purple-500/10 to-purple-500/5',
    shadow: 'hover:shadow-purple-500/20',
  },
  emerald: {
    glow: 'rgba(16, 185, 129, 0.4)',
    border: 'border-emerald-500/20 hover:border-emerald-400/40',
    bg: 'from-emerald-500/10 to-emerald-500/5',
    shadow: 'hover:shadow-emerald-500/20',
  },
}

export function GlowCard({ 
  children, 
  className = '', 
  variant = 'cyan',
  noPadding = false,
  noTilt = false,
}: GlowCardProps) {
  const colors = variantColors[variant]
  
  const cardContent = (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br ${colors.bg}
        backdrop-blur-xl
        border ${colors.border}
        transition-all duration-500 ease-out
        hover:shadow-2xl ${colors.shadow}
        ${noPadding ? '' : 'p-6'}
        ${className}
      `}
      style={{
        boxShadow: `
          0 4px 24px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.05)
        `,
      }}
    >
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Shimmer effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `linear-gradient(
            105deg,
            transparent 20%,
            rgba(255, 255, 255, 0.03) 40%,
            rgba(255, 255, 255, 0.05) 50%,
            rgba(255, 255, 255, 0.03) 60%,
            transparent 80%
          )`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s ease-in-out infinite',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
  
  if (noTilt) {
    return cardContent
  }
  
  return (
    <TiltCard glowColor={colors.glow} tiltAmount={5}>
      {cardContent}
    </TiltCard>
  )
}

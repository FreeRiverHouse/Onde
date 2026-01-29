'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
}

// Base skeleton with shimmer animation
export function Skeleton({ 
  className = '', 
  width, 
  height, 
  rounded = 'lg' 
}: SkeletonProps) {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  }

  return (
    <div
      className={`
        relative overflow-hidden bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200
        ${roundedClasses[rounded]}
        ${className}
      `}
      style={{ width, height }}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        }}
        animate={{
          translateX: ['100%', '-100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}

// Game card skeleton
export function GameCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {/* Header with icon and badges */}
      <div className="flex items-start justify-between mb-4">
        <Skeleton width={80} height={80} rounded="2xl" />
        <div className="flex flex-col items-end gap-2">
          <Skeleton width={60} height={24} rounded="full" />
          <Skeleton width={80} height={20} rounded="md" />
        </div>
      </div>

      {/* Title */}
      <Skeleton width="70%" height={28} rounded="lg" className="mb-2" />
      
      {/* Subtitle */}
      <Skeleton width="50%" height={16} rounded="md" className="mb-3" />
      
      {/* Description lines */}
      <Skeleton width="100%" height={16} rounded="md" className="mb-2" />
      <Skeleton width="90%" height={16} rounded="md" className="mb-4" />

      {/* Feature tags */}
      <div className="flex flex-wrap gap-2">
        <Skeleton width={70} height={24} rounded="lg" />
        <Skeleton width={90} height={24} rounded="lg" />
        <Skeleton width={60} height={24} rounded="lg" />
      </div>
    </motion.div>
  )
}

// Grid of game card skeletons
export function GameCardsSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <GameCardSkeleton key={i} delay={i * 0.05} />
      ))}
    </div>
  )
}

export default Skeleton

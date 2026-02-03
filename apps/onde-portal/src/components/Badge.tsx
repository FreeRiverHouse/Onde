import { ReactNode } from 'react'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  pill?: boolean
  dot?: boolean
  className?: string
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  primary: 'bg-onde-coral/10 text-onde-coral border-onde-coral/20',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
}

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
}

const DOT_COLORS: Record<BadgeVariant, string> = {
  default: 'bg-gray-500',
  primary: 'bg-onde-coral',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  pill = false,
  dot = false,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium border
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${pill ? 'rounded-full' : 'rounded-md'}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[variant]}`} />
      )}
      {children}
    </span>
  )
}

// Preset badges for common use cases
export function NewBadge() {
  return <Badge variant="primary" size="sm" pill>NEW</Badge>
}

export function FreeBadge() {
  return <Badge variant="success" size="sm" pill>FREE</Badge>
}

export function BetaBadge() {
  return <Badge variant="warning" size="sm" pill>BETA</Badge>
}

export default Badge

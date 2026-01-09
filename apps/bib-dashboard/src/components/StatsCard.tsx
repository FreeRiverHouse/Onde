'use client'

import { useEffect, useState } from 'react'

interface StatsCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'gold' | 'green' | 'blue' | 'purple' | 'red'
  animate?: boolean
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'gold',
  animate = true
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(animate && typeof value === 'number' ? 0 : value)

  useEffect(() => {
    if (animate && typeof value === 'number') {
      const duration = 1000 // 1 second
      const steps = 30
      const increment = value / steps
      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setDisplayValue(value)
          clearInterval(timer)
        } else {
          setDisplayValue(Math.floor(current))
        }
      }, duration / steps)
      return () => clearInterval(timer)
    }
  }, [value, animate])

  const colorClasses = {
    gold: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
    green: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
    red: 'from-red-500/20 to-red-600/5 border-red-500/30'
  }

  const iconColorClasses = {
    gold: 'text-amber-400',
    green: 'text-emerald-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    red: 'text-red-400'
  }

  return (
    <div className={`stat-card bg-gradient-to-br ${colorClasses[color]} hover:scale-[1.02] transition-transform duration-300`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-white/5 ${iconColorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            <svg
              className={`w-4 h-4 ${trend.isPositive ? '' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium opacity-60">{title}</h3>
        <p className={`text-4xl font-bold tracking-tight ${color === 'gold' ? 'glow-text text-amber-400' : ''}`}>
          {displayValue}
        </p>
        {subtitle && (
          <p className="text-sm opacity-40">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

'use client'

export const runtime = 'edge'


import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface ServiceHealth {
  name: string
  url: string
  status: 'healthy' | 'degraded' | 'down' | 'checking'
  latency?: number
  lastCheck: string
  details?: Record<string, unknown>
  error?: string
}

interface HealthData {
  overall: 'healthy' | 'degraded' | 'down'
  timestamp: string
  services: ServiceHealth[]
  checks: {
    total: number
    healthy: number
    degraded: number
    down: number
  }
}

const STATUS_CONFIG = {
  healthy: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
    icon: '✓',
    label: 'Healthy'
  },
  degraded: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/20',
    icon: '⚠',
    label: 'Degraded'
  },
  down: {
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    glow: 'shadow-red-500/20',
    icon: '✕',
    label: 'Down'
  },
  checking: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20',
    icon: '◌',
    label: 'Checking...'
  }
}

function ServiceCard({ service }: { service: ServiceHealth }) {
  const config = STATUS_CONFIG[service.status]
  
  return (
    <div className={`
      relative p-6 rounded-2xl border backdrop-blur-xl
      ${config.bg} ${config.border}
      hover:scale-[1.02] transition-all duration-300
      group
    `}>
      {/* Glow effect */}
      <div className={`
        absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
        transition-opacity duration-300 blur-xl -z-10
        ${config.bg}
      `} />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {service.name}
          </h3>
          <a 
            href={service.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-white/50 hover:text-white/70 transition-colors"
          >
            {service.url.replace('https://', '')}
          </a>
        </div>
        
        {/* Status Badge */}
        <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full
          ${config.bg} ${config.border} border
        `}>
          <span className={`text-lg ${service.status === 'checking' ? 'animate-spin' : ''}`}>
            {config.icon}
          </span>
          <span className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
        </div>
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-xs text-white/40 mb-1">Latency</div>
          <div className="text-xl font-mono text-white">
            {service.latency ? `${service.latency}ms` : '—'}
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-xs text-white/40 mb-1">Status Code</div>
          <div className="text-xl font-mono text-white">
            {service.details?.statusCode || '—'}
          </div>
        </div>
      </div>
      
      {/* Error message if any */}
      {service.error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="text-xs text-red-400/70 mb-1">Error</div>
          <div className="text-sm text-red-300 font-mono truncate">
            {service.error}
          </div>
        </div>
      )}
      
      {/* Last check */}
      <div className="mt-4 text-xs text-white/30">
        Last checked: {new Date(service.lastCheck).toLocaleTimeString()}
      </div>
    </div>
  )
}

function OverallStatus({ data }: { data: HealthData | null }) {
  const status = data?.overall || 'checking'
  const config = STATUS_CONFIG[status]
  
  return (
    <div className={`
      relative p-8 rounded-3xl border backdrop-blur-xl mb-8
      ${config.bg} ${config.border}
      overflow-hidden
    `}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className={`
          absolute -top-1/2 -left-1/2 w-full h-full
          bg-gradient-radial from-current to-transparent
          ${config.color} animate-pulse
        `} style={{ animationDuration: '3s' }} />
      </div>
      
      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-sm text-white/50 mb-2 uppercase tracking-wider">
            System Status
          </div>
          <div className={`text-4xl font-bold ${config.color} flex items-center gap-4`}>
            <span className={`text-5xl ${status === 'checking' ? 'animate-spin' : 'animate-pulse'}`}>
              {config.icon}
            </span>
            {config.label}
          </div>
          {data && (
            <div className="mt-4 text-sm text-white/40">
              {data.checks.healthy}/{data.checks.total} services operational
            </div>
          )}
        </div>
        
        {/* Quick stats */}
        {data && (
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">
                {data.checks.healthy}
              </div>
              <div className="text-xs text-white/40 mt-1">Healthy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">
                {data.checks.degraded}
              </div>
              <div className="text-xs text-white/40 mt-1">Degraded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">
                {data.checks.down}
              </div>
              <div className="text-xs text-white/40 mt-1">Down</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health', { cache: 'no-store' })
      const json = await res.json()
      setData(json)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch health data:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchHealth()
    
    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchHealth, 30000)
      return () => clearInterval(interval)
    }
  }, [fetchHealth, autoRefresh])
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <Link 
              href="/"
              className="text-white/50 hover:text-white transition-colors text-sm mb-2 block"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              System Health
            </h1>
            <p className="text-white/50 mt-2">
              Real-time monitoring of production services
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`
                px-4 py-2 rounded-xl border transition-all
                ${autoRefresh 
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                  : 'bg-white/5 border-white/10 text-white/50'}
              `}
            >
              {autoRefresh ? '⟳ Auto-refresh ON' : '⟳ Auto-refresh OFF'}
            </button>
            
            {/* Manual refresh */}
            <button
              onClick={() => {
                setLoading(true)
                fetchHealth()
              }}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-all disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Refresh Now'}
            </button>
          </div>
        </div>
        
        {/* Overall Status */}
        <OverallStatus data={data} />
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading && !data ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div 
                key={i}
                className="p-6 rounded-2xl border border-white/10 bg-white/5 animate-pulse"
              >
                <div className="h-6 bg-white/10 rounded w-1/3 mb-4" />
                <div className="h-4 bg-white/10 rounded w-1/2 mb-6" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 bg-white/10 rounded-xl" />
                  <div className="h-16 bg-white/10 rounded-xl" />
                </div>
              </div>
            ))
          ) : data?.services.map((service, i) => (
            <ServiceCard key={i} service={service} />
          ))}
        </div>
        
        {/* Timezone Info Section */}
        <div className="mt-8 p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-white/40 text-sm">⏰ Cron Timezone</div>
              <div className="text-emerald-400 font-mono text-sm font-bold">UTC</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-white/40 text-sm">🌍 Your Timezone</div>
              <div className="text-white font-mono text-sm">
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-white/40 text-sm">🕐 UTC Now</div>
              <div className="text-cyan-400 font-mono text-sm">
                {new Date().toISOString().slice(11, 19)} UTC
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-white/40 text-sm">📍 Local Time</div>
              <div className="text-white font-mono text-sm">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-white/30 text-sm">
          {lastUpdate && (
            <p>Last updated: {lastUpdate.toLocaleString()}</p>
          )}
          <p className="mt-2">
            Health checks run every 30 seconds • Powered by Onde.surf
          </p>
        </div>
      </div>
    </div>
  )
}

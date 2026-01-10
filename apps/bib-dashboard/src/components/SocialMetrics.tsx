'use client'

import { useEffect, useState } from 'react'

interface SocialMetricsProps {
  xFollowers: number
  igFollowers: number
  tiktokFollowers: number
  postsThisWeek: number
}

export default function SocialMetrics({
  xFollowers,
  igFollowers,
  tiktokFollowers,
  postsThisWeek
}: SocialMetricsProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    setAnimated(true)
  }, [])

  const platforms = [
    {
      name: 'X (Twitter)',
      icon: '𝕏',
      followers: xFollowers,
      color: 'from-gray-600 to-gray-800',
      accounts: ['@Onde_FRH', '@FreeRiverHouse', '@magmatic__'],
      growth: '+12%'
    },
    {
      name: 'Instagram',
      icon: '📸',
      followers: igFollowers,
      color: 'from-pink-500 to-purple-600',
      accounts: ['@magmatic._'],
      growth: '+5%'
    },
    {
      name: 'TikTok',
      icon: '🎵',
      followers: tiktokFollowers,
      color: 'from-cyan-400 to-pink-500',
      accounts: ['Coming Soon'],
      growth: 'New'
    },
    {
      name: 'YouTube',
      icon: '📺',
      followers: 0,
      color: 'from-red-500 to-red-700',
      accounts: ['Onde Lounge'],
      growth: 'New'
    }
  ]

  const totalFollowers = xFollowers + igFollowers + tiktokFollowers

  return (
    <div className="chart-container">
      {/* Total Followers */}
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
        <div>
          <p className="text-sm opacity-60 mb-1">Total Reach</p>
          <p className="text-4xl font-bold glow-text text-onde-gold">
            {animated ? totalFollowers.toLocaleString() : '0'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-60 mb-1">Posts This Week</p>
          <p className="text-2xl font-semibold text-onde-green">{postsThisWeek}</p>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="space-y-4">
        {platforms.map((platform, index) => (
          <div
            key={platform.name}
            className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                  {platform.icon}
                </div>
                <div>
                  <h4 className="font-semibold group-hover:text-onde-gold transition-colors">
                    {platform.name}
                  </h4>
                  <p className="text-xs opacity-40">
                    {platform.accounts.join(' | ')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {platform.followers > 0 ? platform.followers.toLocaleString() : '--'}
                </p>
                <span className={`text-xs ${platform.growth.startsWith('+') ? 'text-onde-green' : 'opacity-40'}`}>
                  {platform.growth}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            {platform.followers > 0 && (
              <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${platform.color} transition-all duration-1000`}
                  style={{
                    width: animated ? `${(platform.followers / totalFollowers) * 100}%` : '0%'
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Engagement Note */}
      <div className="mt-6 p-4 rounded-xl bg-onde-gold/10 border border-onde-gold/20">
        <p className="text-sm">
          <span className="text-onde-gold font-semibold">Crescita organica:</span>
          {' '}Zero ads, zero growth hacks. Solo contenuti consistenti.
        </p>
      </div>
    </div>
  )
}

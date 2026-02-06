'use client'

import { useEffect } from 'react'
import { useRecentlyPlayed } from '@/hooks/useRecentlyPlayed'

interface TrackGamePlayProps {
  gameId: string
  title: string
  emoji: string
  href: string
}

/**
 * Invisible tracker component — drop into any game page to record it
 * in the "Recently Played" list.
 *
 * Usage:
 *   <TrackGamePlay gameId="quiz" title="Quiz" emoji="❓" href="/games/quiz" />
 */
export default function TrackGamePlay({ gameId, title, emoji, href }: TrackGamePlayProps) {
  const { addGame } = useRecentlyPlayed()

  useEffect(() => {
    addGame({ id: gameId, title, emoji, href })
  }, [gameId, title, emoji, href, addGame])

  return null
}

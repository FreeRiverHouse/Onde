'use client'

/**
 * ReadingTimeBadge — displays estimated reading time with a clock icon.
 * Counts words in the provided text and divides by WPM (default 200).
 */
export function calculateReadingTime(text: string, wpm = 200): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / wpm))
}

interface ReadingTimeBadgeProps {
  minutes: number
  className?: string
}

export default function ReadingTimeBadge({ minutes, className = '' }: ReadingTimeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                  bg-white/5 text-white/50 border border-white/10 ${className}`}
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      {minutes} min read
    </span>
  )
}

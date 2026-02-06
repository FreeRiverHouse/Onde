'use client'

import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
  emoji?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

/**
 * Reusable breadcrumb navigation component.
 * Usage:
 *   <Breadcrumb items={[
 *     { label: 'Home', href: '/', emoji: '🏠' },
 *     { label: 'Games', href: '/games', emoji: '🎮' },
 *     { label: 'Skin Creator' },
 *   ]} />
 */
export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-sm flex-wrap ${className}`}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1

        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <span className="text-gray-400 select-none" aria-hidden>›</span>
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1"
              >
                {item.emoji && <span className="text-xs">{item.emoji}</span>}
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-700 font-medium flex items-center gap-1">
                {item.emoji && <span className="text-xs">{item.emoji}</span>}
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

"use client"

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/analytics', label: 'Analytics', icon: '📊' },
  { href: '/house', label: 'House', icon: '🏡' },
  { href: '/pr', label: 'PR', icon: '📰' },
  { href: '/betting', label: 'Betting', icon: '🎰' },
  { href: '/corde', label: 'CORDE', icon: '🔗' },
  { href: '/social', label: 'Social', icon: '📱' },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close menu on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Hamburger button — only on mobile */}
      <button
        onClick={() => setOpen(o => !o)}
        className="md:hidden relative z-50 flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-white/10 transition-colors"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        <span
          className={`block w-5 h-0.5 bg-white/80 rounded-full transition-all duration-300 ${
            open ? 'rotate-45 translate-y-[3px]' : ''
          }`}
        />
        <span
          className={`block w-5 h-0.5 bg-white/80 rounded-full transition-all duration-300 mt-1 ${
            open ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`block w-5 h-0.5 bg-white/80 rounded-full transition-all duration-300 mt-1 ${
            open ? '-rotate-45 -translate-y-[7px]' : ''
          }`}
        />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in menu */}
      <div
        className={`md:hidden fixed top-0 right-0 z-40 h-full w-64 transform transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(10, 15, 26, 0.98) 0%, rgba(10, 15, 26, 0.95) 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex flex-col pt-20 px-4 gap-1">
          {navLinks.map(link => {
            const active = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href))
            return (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/5'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </a>
            )
          })}
        </div>
      </div>
    </>
  )
}

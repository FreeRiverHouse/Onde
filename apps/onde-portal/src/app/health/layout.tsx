import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Health Status - Onde',
  description: 'Real-time status of Onde services. Check uptime and latency for onde.la, onde.surf and related infrastructure.',
  robots: 'noindex', // Don't index status page
}

export default function HealthLayout({ children }: { children: React.ReactNode }) {
  return children
}

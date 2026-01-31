import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portal System | Onde',
  description: 'Journey between worlds through magical dimensional portals. Discover hidden passages and collect them all!',
  openGraph: {
    title: 'Portal System | Onde',
    description: 'Journey between worlds through magical dimensional portals',
    images: ['/images/og-portals.jpg'],
  },
}

export default function PortalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

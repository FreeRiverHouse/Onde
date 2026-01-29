import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Giochi Educativi - Onde',
  description: 'Mini-giochi educativi per bambini. Moonlight Magic House, cucina virtuale e arte digitale. Impara giocando con i personaggi dei nostri libri.',
  alternates: {
    canonical: '/giochi',
  },
  openGraph: {
    title: 'Giochi Educativi - Onde',
    description: 'Mini-giochi per bambini dai 2 ai 6 anni. Sicuri, educativi e divertenti.',
    type: 'website',
  },
}

export default function GiochiLayout({ children }: { children: React.ReactNode }) {
  return children
}

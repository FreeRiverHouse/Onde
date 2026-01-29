import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profili Famiglia - Onde',
  description: 'Gestisci i profili della tua famiglia su Onde. Crea account per bambini e adulti, traccia i progressi di lettura e personalizza l\'esperienza.',
  robots: 'noindex', // Private family page
}

export default function FamigliaLayout({ children }: { children: React.ReactNode }) {
  return children
}

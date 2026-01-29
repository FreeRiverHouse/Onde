import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Catalogo Libri - Onde',
  description: 'Esplora il nostro catalogo completo di libri illustrati. Classici della letteratura, filosofia, poesia e libri per bambini in formato digitale gratuito.',
  openGraph: {
    title: 'Catalogo Libri - Onde',
    description: 'Esplora libri illustrati gratuiti: classici della letteratura, filosofia e storie per bambini.',
    type: 'website',
  },
}

export default function CatalogoLayout({ children }: { children: React.ReactNode }) {
  return children
}

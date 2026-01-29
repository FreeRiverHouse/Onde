import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Collezioni - Onde',
  description: 'Playlist curate di libri per ogni momento. Scopri raccolte tematiche selezionate dai nostri curatori: filosofia, poesia, favole e molto altro.',
  openGraph: {
    title: 'Collezioni Curate - Onde',
    description: 'Raccolte tematiche di libri illustrati. Playlist letterarie per ogni gusto.',
    type: 'website',
  },
}

export default function CollezioniLayout({ children }: { children: React.ReactNode }) {
  return children
}

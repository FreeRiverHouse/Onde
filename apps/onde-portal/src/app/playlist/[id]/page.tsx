import { notFound } from 'next/navigation'
import { getPlaylistById, playlists } from '@/data/playlists'
import { books } from '@/data/books'
import PlaylistPageClient from './PlaylistPageClient'

// Generate static params for all playlists
export function generateStaticParams() {
  return playlists.map((playlist) => ({
    id: playlist.id,
  }))
}

interface PlaylistPageProps {
  params: Promise<{ id: string }>
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const resolvedParams = await params
  const playlist = getPlaylistById(resolvedParams.id)

  if (!playlist) {
    notFound()
  }

  // Ottieni i libri della playlist
  const playlistBooks = playlist.bookIds
    .map(id => books.find(b => b.id === id))
    .filter((book): book is typeof books[0] => book !== undefined)

  return <PlaylistPageClient playlist={playlist} playlistBooks={playlistBooks} />
}

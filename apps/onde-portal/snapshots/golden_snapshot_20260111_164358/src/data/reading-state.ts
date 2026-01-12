// Stato di lettura - Now Reading / Continue Reading
// Simula lo stato che in produzione verrebbe da un backend

export interface ReadingProgress {
  bookId: string
  currentPage: number
  totalPages: number
  lastReadAt: string // ISO date string
  percentComplete: number
  timeSpentMinutes: number
}

export interface UserReadingState {
  currentlyReading: ReadingProgress[]
  recentlyFinished: string[] // book IDs
  wishlist: string[] // book IDs
}

// Mock data per demo - in produzione verrebbe dal backend
export const mockReadingState: UserReadingState = {
  currentlyReading: [
    {
      bookId: 'meditations',
      currentPage: 45,
      totalPages: 120,
      lastReadAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min fa
      percentComplete: 37,
      timeSpentMinutes: 95,
    },
    {
      bookId: 'alice',
      currentPage: 78,
      totalPages: 156,
      lastReadAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 giorno fa
      percentComplete: 50,
      timeSpentMinutes: 180,
    },
  ],
  recentlyFinished: ['salmo-23', 'peter-rabbit'],
  wishlist: ['jungle-book', 'wizard-oz', 'tao-te-ching'],
}

// Funzione per calcolare il tempo di lettura stimato rimanente
export function getEstimatedTimeRemaining(progress: ReadingProgress): number {
  const pagesRemaining = progress.totalPages - progress.currentPage
  const avgMinutesPerPage = progress.timeSpentMinutes / progress.currentPage || 2
  return Math.round(pagesRemaining * avgMinutesPerPage)
}

// Funzione per formattare "letto X tempo fa"
export function getLastReadText(lastReadAt: string): string {
  const diff = Date.now() - new Date(lastReadAt).getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return minutes <= 1 ? 'Adesso' : `${minutes} minuti fa`
  } else if (hours < 24) {
    return hours === 1 ? '1 ora fa' : `${hours} ore fa`
  } else if (days < 7) {
    return days === 1 ? 'Ieri' : `${days} giorni fa`
  } else {
    return new Date(lastReadAt).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
    })
  }
}

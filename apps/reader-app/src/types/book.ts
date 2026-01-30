export interface Book {
  id: string
  title: string
  author: string
  cover?: string
  filePath?: string
  fileType: 'epub' | 'pdf' | 'txt' | 'html'
  progress: number // 0-100
  lastRead?: Date
  currentPage?: number
  totalPages?: number
  bookmarks: Bookmark[]
  highlights: Highlight[]
}

export interface Bookmark {
  id: string
  page: number
  position: string // CFI for EPUB or position identifier
  createdAt: Date
  note?: string
}

export interface Highlight {
  id: string
  text: string
  page: number
  position: string
  color: 'yellow' | 'blue' | 'green' | 'pink'
  createdAt: Date
  note?: string
}

export interface ReadingSettings {
  fontSize: number // 14-32
  fontFamily: 'serif' | 'sans' | 'mono'
  lineHeight: number // 1.4-2.2
  theme: 'light' | 'dark' | 'sepia'
  marginSize: 'small' | 'medium' | 'large'
  textAlign: 'left' | 'justify'
}

export interface ReadingProgress {
  bookId: string
  currentPage: number
  totalPages: number
  progress: number
  timeSpent: number // seconds
  lastPosition: string
}

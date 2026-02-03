/**
 * Shared TypeScript types for Onde Portal
 */

// Book types
export interface Book {
  id: string
  title: string
  author: string
  description: string
  cover: string
  category: string
  language: 'en' | 'it'
  format: 'pdf' | 'epub' | 'both'
  downloadUrl: string
  pageCount?: number
  publishedDate?: string
  isbn?: string
  tags?: string[]
}

// Game types
export interface Game {
  id: string
  title: string
  description: string
  thumbnail: string
  url: string
  category: 'creative' | 'puzzle' | 'arcade' | 'educational'
  isNew?: boolean
  isFeatured?: boolean
}

// User preferences
export interface UserPreferences {
  language: 'en' | 'it'
  theme: 'light' | 'dark' | 'system'
  reducedMotion: boolean
  fontSize: 'small' | 'medium' | 'large'
}

// API response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Form types
export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

// SEO types
export interface SeoMeta {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'book'
}

// Common utility types
export type Status = 'idle' | 'loading' | 'success' | 'error'
export type Size = 'sm' | 'md' | 'lg' | 'xl'
export type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'

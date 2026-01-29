'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'onde-reading-list'

interface ReadingListItem {
  bookId: string
  addedAt: string
}

interface ReadingListState {
  items: ReadingListItem[]
  version: number
}

export function useReadingList() {
  const [readingList, setReadingList] = useState<ReadingListState>({ items: [], version: 1 })
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ReadingListState
        setReadingList(parsed)
      }
    } catch (e) {
      console.error('Failed to load reading list:', e)
    }
  }, [])

  // Save to localStorage when list changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(readingList))
      } catch (e) {
        console.error('Failed to save reading list:', e)
      }
    }
  }, [readingList, mounted])

  const addToReadingList = useCallback((bookId: string) => {
    setReadingList(prev => {
      // Don't add duplicates
      if (prev.items.some(item => item.bookId === bookId)) {
        return prev
      }
      return {
        ...prev,
        items: [...prev.items, { bookId, addedAt: new Date().toISOString() }]
      }
    })
  }, [])

  const removeFromReadingList = useCallback((bookId: string) => {
    setReadingList(prev => ({
      ...prev,
      items: prev.items.filter(item => item.bookId !== bookId)
    }))
  }, [])

  const toggleBookmark = useCallback((bookId: string) => {
    if (isBookmarked(bookId)) {
      removeFromReadingList(bookId)
    } else {
      addToReadingList(bookId)
    }
  }, [addToReadingList, removeFromReadingList])

  const isBookmarked = useCallback((bookId: string): boolean => {
    return readingList.items.some(item => item.bookId === bookId)
  }, [readingList.items])

  const getReadingList = useCallback((): ReadingListItem[] => {
    return readingList.items
  }, [readingList.items])

  const getReadingListCount = useCallback((): number => {
    return readingList.items.length
  }, [readingList.items])

  const clearReadingList = useCallback(() => {
    setReadingList({ items: [], version: 1 })
  }, [])

  return {
    addToReadingList,
    removeFromReadingList,
    toggleBookmark,
    isBookmarked,
    getReadingList,
    getReadingListCount,
    clearReadingList,
    mounted
  }
}

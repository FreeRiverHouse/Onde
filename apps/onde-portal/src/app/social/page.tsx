'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

// Types
type PostStatus = 'draft' | 'ready' | 'posted'
type TargetAccount = '@Onde_FRH' | '@FreeRiverHouse'

interface SocialPost {
  id: string
  text: string
  imageUrl?: string
  targetAccount: TargetAccount
  status: PostStatus
  scheduledDate?: string
  scheduledTime?: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'onde-social-posts'
const MAX_CHARS = 280

// Status badge config
const statusConfig: Record<PostStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  draft: { 
    label: 'Draft', 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-100 border-amber-200',
    icon: '📝'
  },
  ready: { 
    label: 'Ready', 
    color: 'text-teal-600', 
    bgColor: 'bg-teal-100 border-teal-200',
    icon: '✅'
  },
  posted: { 
    label: 'Posted', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100 border-blue-200',
    icon: '🐦'
  },
}

// Account config
const accountConfig: Record<TargetAccount, { name: string; color: string; avatar: string }> = {
  '@Onde_FRH': { 
    name: 'Onde', 
    color: 'from-teal-500 to-cyan-500',
    avatar: '🌊'
  },
  '@FreeRiverHouse': { 
    name: 'Free River House', 
    color: 'from-amber-500 to-orange-500',
    avatar: '🏠'
  },
}

// Initial sample posts
const samplePosts: SocialPost[] = [
  {
    id: '1',
    text: '📚 New book alert! "Meditations" by Marcus Aurelius is now available for free download on Onde. Timeless Stoic wisdom for the modern age. ✨\n\n#Onde #Philosophy #FreeBooks',
    imageUrl: '/books/meditations-cover.jpg',
    targetAccount: '@Onde_FRH',
    status: 'ready',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    scheduledTime: '10:00',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    text: '🎮 Gaming Island just launched! Play free browser games with your family. No downloads, no ads, just fun.\n\nCheck it out: onde.la/games',
    targetAccount: '@FreeRiverHouse',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    text: "🌟 The Shepherd's Promise - Psalm 23 beautifully illustrated for children. Perfect for bedtime reading.\n\nDownload free: onde.la/libri",
    imageUrl: '/books/shepherds-promise-cover.jpg',
    targetAccount: '@Onde_FRH',
    status: 'posted',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
]

// Generate unique ID
function generateId(): string {
  return `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Twitter Preview Component
function TwitterPreview({ post }: { post: SocialPost }) {
  const account = accountConfig[post.targetAccount]
  
  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-4 shadow-sm"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${account.color} flex items-center justify-center text-2xl shadow-md`}>
          {account.avatar}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900 dark:text-white">{account.name}</span>
            <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
            </svg>
            <span className="text-gray-500">{post.targetAccount}</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-400 text-sm">Preview</span>
          </div>
          
          {/* Tweet text */}
          <p className="text-gray-800 whitespace-pre-wrap text-[15px] leading-relaxed mb-3">
            {post.text}
          </p>
          
          {/* Image preview */}
          {post.imageUrl && (
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              <Image
                src={post.imageUrl}
                alt="Post image"
                fill
                className="object-cover"
              />
            </div>
          )}
          
          {/* Engagement bar */}
          <div className="flex items-center justify-between mt-4 text-gray-400">
            <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm">0</span>
            </button>
            <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm">0</span>
            </button>
            <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm">0</span>
            </button>
            <button className="hover:text-blue-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Post Card Component
function PostCard({ 
  post, 
  onEdit, 
  onDelete, 
  onApprove,
  isSelected,
  onSelect 
}: { 
  post: SocialPost
  onEdit: (post: SocialPost) => void
  onDelete: (id: string) => void
  onApprove: (id: string) => void
  isSelected: boolean
  onSelect: (post: SocialPost) => void
}) {
  const status = statusConfig[post.status]
  const account = accountConfig[post.targetAccount]
  const charCount = post.text.length
  const isOverLimit = charCount > MAX_CHARS
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => onSelect(post)}
      className={`bg-white/90 backdrop-blur-xl rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-teal-400 shadow-lg shadow-teal-500/20 ring-2 ring-teal-400/30' 
          : 'border-teal-100 hover:border-teal-200 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Account avatar */}
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${account.color} flex items-center justify-center text-lg shadow-md`}>
            {account.avatar}
          </div>
          <div>
            <div className="font-semibold text-teal-800">{account.name}</div>
            <div className="text-sm text-teal-500">{post.targetAccount}</div>
          </div>
        </div>
        
        {/* Status badge */}
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${status.bgColor} ${status.color} flex items-center gap-1.5`}>
          <span>{status.icon}</span>
          <span>{status.label}</span>
        </div>
      </div>
      
      {/* Post text preview */}
      <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
        {post.text}
      </p>
      
      {/* Image thumbnail */}
      {post.imageUrl && (
        <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4 bg-gray-100">
          <Image
            src={post.imageUrl}
            alt="Post image"
            fill
            className="object-cover"
          />
        </div>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Character count */}
        <div className={`text-sm font-medium ${isOverLimit ? 'text-red-500' : charCount > MAX_CHARS * 0.9 ? 'text-amber-500' : 'text-gray-400'}`}>
          {charCount}/{MAX_CHARS}
        </div>
        
        {/* Schedule info */}
        {post.scheduledDate && (
          <div className="flex items-center gap-1.5 text-sm text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">
            <span>📅</span>
            <span>{post.scheduledDate} {post.scheduledTime}</span>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {post.status === 'draft' && (
            <button
              onClick={(e) => { e.stopPropagation(); onApprove(post.id) }}
              className="px-3 py-1.5 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors shadow-sm"
            >
              Approve ✓
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(post) }}
            className="px-3 py-1.5 bg-white border border-teal-200 text-teal-600 text-sm font-medium rounded-lg hover:bg-teal-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(post.id) }}
            className="px-3 py-1.5 bg-white border border-red-200 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Edit Modal Component
function EditModal({ 
  post, 
  onSave, 
  onClose 
}: { 
  post: SocialPost | null
  onSave: (post: SocialPost) => void
  onClose: () => void
}) {
  const [editedPost, setEditedPost] = useState<SocialPost | null>(post)
  
  useEffect(() => {
    setEditedPost(post)
  }, [post])
  
  if (!post || !editedPost) return null
  
  const charCount = editedPost.text.length
  const isOverLimit = charCount > MAX_CHARS
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-teal-800">Edit Post</h2>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Text input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Text
            </label>
            <textarea
              value={editedPost.text}
              onChange={(e) => setEditedPost({ ...editedPost, text: e.target.value })}
              className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none resize-none transition-all text-gray-800"
              placeholder="What's happening?"
            />
            <div className={`text-right text-sm mt-1 ${isOverLimit ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
              {charCount}/{MAX_CHARS}
              {isOverLimit && <span className="ml-2">⚠️ Over limit!</span>}
            </div>
          </div>
          
          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL (optional)
            </label>
            <input
              type="text"
              value={editedPost.imageUrl || ''}
              onChange={(e) => setEditedPost({ ...editedPost, imageUrl: e.target.value || undefined })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all text-gray-800"
              placeholder="/images/my-image.jpg"
            />
          </div>
          
          {/* Target account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Account
            </label>
            <div className="flex gap-3">
              {(Object.keys(accountConfig) as TargetAccount[]).map((account) => (
                <button
                  key={account}
                  onClick={() => setEditedPost({ ...editedPost, targetAccount: account })}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    editedPost.targetAccount === account
                      ? 'border-teal-400 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${accountConfig[account].color} flex items-center justify-center text-xl mx-auto mb-2`}>
                    {accountConfig[account].avatar}
                  </div>
                  <div className="text-sm font-medium text-gray-800">{accountConfig[account].name}</div>
                  <div className="text-xs text-gray-500">{account}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex gap-2">
              {(Object.keys(statusConfig) as PostStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setEditedPost({ ...editedPost, status })}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center gap-1.5 ${
                    editedPost.status === status
                      ? `${statusConfig[status].bgColor} ${statusConfig[status].color} border-current`
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span>{statusConfig[status].icon}</span>
                  <span>{statusConfig[status].label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule (optional)
            </label>
            <div className="flex gap-3">
              <input
                type="date"
                value={editedPost.scheduledDate || ''}
                onChange={(e) => setEditedPost({ ...editedPost, scheduledDate: e.target.value || undefined })}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all text-gray-800"
              />
              <input
                type="time"
                value={editedPost.scheduledTime || ''}
                onChange={(e) => setEditedPost({ ...editedPost, scheduledTime: e.target.value || undefined })}
                className="w-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all text-gray-800"
              />
              {(editedPost.scheduledDate || editedPost.scheduledTime) && (
                <button
                  onClick={() => setEditedPost({ ...editedPost, scheduledDate: undefined, scheduledTime: undefined })}
                  className="px-4 py-3 border-2 border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({ ...editedPost, updatedAt: new Date().toISOString() })
              onClose()
            }}
            disabled={isOverLimit}
            className={`px-6 py-3 font-medium rounded-xl transition-all ${
              isOverLimit
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-teal-500/30'
            }`}
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Main Page Component
export default function SocialDashboard() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null)
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null)
  const [filter, setFilter] = useState<PostStatus | 'all'>('all')
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Load posts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setPosts(JSON.parse(stored))
      } catch {
        setPosts(samplePosts)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(samplePosts))
      }
    } else {
      setPosts(samplePosts)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(samplePosts))
    }
    setIsLoaded(true)
  }, [])
  
  // Save posts to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
    }
  }, [posts, isLoaded])
  
  // Set first post as selected when posts load
  useEffect(() => {
    if (posts.length > 0 && !selectedPost) {
      setSelectedPost(posts[0])
    }
  }, [posts, selectedPost])
  
  // Filter posts
  const filteredPosts = useMemo(() => {
    if (filter === 'all') return posts
    return posts.filter(p => p.status === filter)
  }, [posts, filter])
  
  // Stats
  const stats = useMemo(() => ({
    total: posts.length,
    draft: posts.filter(p => p.status === 'draft').length,
    ready: posts.filter(p => p.status === 'ready').length,
    posted: posts.filter(p => p.status === 'posted').length,
  }), [posts])
  
  // Handlers
  const handleCreatePost = () => {
    const newPost: SocialPost = {
      id: generateId(),
      text: '',
      targetAccount: '@Onde_FRH',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setPosts([newPost, ...posts])
    setEditingPost(newPost)
    setSelectedPost(newPost)
  }
  
  const handleSavePost = (updatedPost: SocialPost) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p))
    setSelectedPost(updatedPost)
  }
  
  const handleDeletePost = (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(p => p.id !== id))
      if (selectedPost?.id === id) {
        setSelectedPost(posts.find(p => p.id !== id) || null)
      }
    }
  }
  
  const handleApprove = (id: string) => {
    setPosts(posts.map(p => 
      p.id === id 
        ? { ...p, status: 'ready' as PostStatus, updatedAt: new Date().toISOString() } 
        : p
    ))
  }
  
  return (
    <div className="min-h-screen dark:bg-gray-900" style={{ background: 'linear-gradient(180deg, #E8F4F8 0%, #D4EEF2 30%, #B8E0E8 60%, #A8D8E0 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-teal-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors">
                <span className="text-2xl">🌊</span>
                <span className="font-semibold">Onde</span>
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-xl font-bold text-teal-800">Social Dashboard</h1>
            </div>
            
            <button
              onClick={handleCreatePost}
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all flex items-center gap-2"
            >
              <span>✨</span>
              <span>New Post</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Stats bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-teal-100 shadow-sm"
          >
            <div className="text-3xl font-bold text-teal-800">{stats.total}</div>
            <div className="text-sm text-teal-600">Total Posts</div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-amber-100 shadow-sm"
          >
            <div className="text-3xl font-bold text-amber-600">{stats.draft}</div>
            <div className="text-sm text-amber-600">Drafts</div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-teal-100 shadow-sm"
          >
            <div className="text-3xl font-bold text-teal-600">{stats.ready}</div>
            <div className="text-sm text-teal-600">Ready</div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-blue-100 shadow-sm"
          >
            <div className="text-3xl font-bold text-blue-600">{stats.posted}</div>
            <div className="text-sm text-blue-600">Posted</div>
          </motion.div>
        </div>
      </div>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Posts list */}
          <div className="flex-1">
            {/* Filter tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {(['all', 'draft', 'ready', 'posted'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    filter === status
                      ? 'bg-teal-500 text-white shadow-md'
                      : 'bg-white/80 text-teal-600 hover:bg-white border border-teal-100'
                  }`}
                >
                  {status === 'all' ? '📋 All Posts' : `${statusConfig[status].icon} ${statusConfig[status].label}`}
                  <span className="ml-1.5 opacity-70">
                    ({status === 'all' ? stats.total : stats[status]})
                  </span>
                </button>
              ))}
            </div>
            
            {/* Posts */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredPosts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 bg-white/60 rounded-2xl border-2 border-dashed border-teal-200"
                  >
                    <div className="text-4xl mb-4">📭</div>
                    <div className="text-teal-600 font-medium">No posts found</div>
                    <div className="text-teal-500 text-sm mt-1">Create a new post to get started</div>
                  </motion.div>
                ) : (
                  filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onEdit={setEditingPost}
                      onDelete={handleDeletePost}
                      onApprove={handleApprove}
                      isSelected={selectedPost?.id === post.id}
                      onSelect={setSelectedPost}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Preview panel */}
          <div className="lg:w-[400px] lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-teal-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
                <span>👁️</span>
                <span>Twitter Preview</span>
              </h3>
              
              {selectedPost ? (
                <TwitterPreview post={selectedPost} />
              ) : (
                <div className="text-center py-12 text-teal-500">
                  <div className="text-3xl mb-2">🐦</div>
                  <div className="text-sm">Select a post to preview</div>
                </div>
              )}
              
              {/* Quick actions */}
              {selectedPost && selectedPost.status === 'ready' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100"
                >
                  <div className="text-sm font-medium text-teal-700 mb-3 flex items-center gap-2">
                    <span>🚀</span>
                    <span>Ready to post!</span>
                  </div>
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <span>🐦</span>
                    <span>Post to Twitter</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Edit Modal */}
      <AnimatePresence>
        {editingPost && (
          <EditModal
            post={editingPost}
            onSave={handleSavePost}
            onClose={() => setEditingPost(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

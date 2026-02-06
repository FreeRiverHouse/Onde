'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { useCollections, Collection, CollectionItem } from '@/hooks/useCollections'

// Confirmation modal component
function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}) {
  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-onde-dark/95 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/60 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Create collection modal
function CreateCollectionModal({
  isOpen,
  onClose,
  onCreate,
  presetColors,
  presetEmojis,
}: {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, options: { description?: string; emoji?: string; color?: string }) => void
  presetColors: string[]
  presetEmojis: string[]
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState(presetEmojis[0])
  const [selectedColor, setSelectedColor] = useState(presetColors[0])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreate(name.trim(), {
        description: description.trim() || undefined,
        emoji: selectedEmoji,
        color: selectedColor,
      })
      setName('')
      setDescription('')
      onClose()
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-onde-dark/95 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-3xl">{selectedEmoji}</span>
          New Collection
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Favorites"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-onde-gold/50 focus:ring-2 focus:ring-onde-gold/20"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-white/60 text-sm mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A collection of my favorite books and games..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-onde-gold/50 focus:ring-2 focus:ring-onde-gold/20 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-white/60 text-sm mb-2">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {presetEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-onde-gold/30 ring-2 ring-onde-gold scale-110'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-white/60 text-sm mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-white scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-onde-gold to-amber-500 text-onde-dark font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Edit collection modal
function EditCollectionModal({
  collection,
  onClose,
  onSave,
  presetColors,
  presetEmojis,
}: {
  collection: Collection
  onClose: () => void
  onSave: (updates: { name?: string; description?: string; emoji?: string; color?: string }) => void
  presetColors: string[]
  presetEmojis: string[]
}) {
  const [name, setName] = useState(collection.name)
  const [description, setDescription] = useState(collection.description || '')
  const [selectedEmoji, setSelectedEmoji] = useState(collection.emoji || '📚')
  const [selectedColor, setSelectedColor] = useState(collection.color)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        emoji: selectedEmoji,
        color: selectedColor,
      })
      onClose()
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-onde-dark/95 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-3xl">{selectedEmoji}</span>
          Edit Collection
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-onde-gold/50"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-white/60 text-sm mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-onde-gold/50 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-white/60 text-sm mb-2">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {presetEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-onde-gold/30 ring-2 ring-onde-gold scale-110'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-white/60 text-sm mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-white scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-onde-gold to-amber-500 text-onde-dark font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Collection cover component with 4-item grid
function CollectionCover({ collection }: { collection: Collection }) {
  const covers = collection.items.slice(0, 4)
  
  if (covers.length === 0) {
    return (
      <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${collection.color} flex items-center justify-center`}>
        <span className="text-5xl opacity-80">{collection.emoji}</span>
      </div>
    )
  }
  
  if (covers.length === 1) {
    return (
      <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${collection.color} flex items-center justify-center overflow-hidden`}>
        {covers[0].coverImage ? (
          <img src={covers[0].coverImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">{covers[0].emoji || '📖'}</span>
        )}
      </div>
    )
  }
  
  return (
    <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${collection.color} grid grid-cols-2 gap-0.5 p-0.5 overflow-hidden`}>
      {covers.map((item, idx) => (
        <div
          key={`${item.id}-${idx}`}
          className="bg-onde-dark/30 flex items-center justify-center overflow-hidden"
        >
          {item.coverImage ? (
            <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{item.emoji || '📖'}</span>
          )}
        </div>
      ))}
      {/* Fill empty slots */}
      {Array.from({ length: 4 - covers.length }).map((_, idx) => (
        <div key={`empty-${idx}`} className="bg-onde-dark/30" />
      ))}
    </div>
  )
}

// Draggable item component
function DraggableItem({
  item,
  onRemove,
}: {
  item: CollectionItem
  onRemove: () => void
}) {
  return (
    <Reorder.Item
      value={item}
      className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 cursor-grab active:cursor-grabbing group"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-onde-dark/50 flex items-center justify-center overflow-hidden">
        {item.coverImage ? (
          <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">{item.emoji || (item.type === 'book' ? '📖' : '🎮')}</span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{item.title}</p>
        <p className="text-sm text-white/40 capitalize">{item.type}</p>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30"
      >
        ✕
      </button>
      
      <div className="flex-shrink-0 text-white/20 group-hover:text-white/40">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    </Reorder.Item>
  )
}

// Collection detail view
function CollectionDetail({
  collection,
  onBack,
  onEdit,
  onDelete,
  onShare,
  onUnshare,
  onRemoveItem,
  onReorder,
}: {
  collection: Collection
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onShare: () => void
  onUnshare: () => void
  onRemoveItem: (itemId: string, itemType: 'book' | 'game') => void
  onReorder: (items: CollectionItem[]) => void
}) {
  const [showShareToast, setShowShareToast] = useState(false)
  
  const handleShare = () => {
    onShare()
    setShowShareToast(true)
    setTimeout(() => setShowShareToast(false), 3000)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen pt-24 pb-16"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-start gap-6 mb-8">
          <button
            onClick={onBack}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            ←
          </button>
          
          <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden">
            <CollectionCover collection={collection} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span>{collection.emoji}</span>
              <span className="truncate">{collection.name}</span>
            </h1>
            {collection.description && (
              <p className="text-white/60 mt-1">{collection.description}</p>
            )}
            <p className="text-sm text-white/40 mt-2">
              {collection.items.length} {collection.items.length === 1 ? 'item' : 'items'} · Created {new Date(collection.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={onEdit}
            className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            ✏️ Edit
          </button>
          
          {collection.isPublic ? (
            <button
              onClick={onUnshare}
              className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors flex items-center gap-2"
            >
              🔗 Shared
            </button>
          ) : (
            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              🔗 Share
            </button>
          )}
          
          <button
            onClick={onDelete}
            className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2"
          >
            🗑️ Delete
          </button>
        </div>
        
        {/* Share toast */}
        <AnimatePresence>
          {showShareToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50"
            >
              ✅ Link copied to clipboard!
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Items */}
        {collection.items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-50">📭</div>
            <h3 className="text-xl font-bold text-white mb-2">No items yet</h3>
            <p className="text-white/60 mb-6">
              Browse our library and games to add items to this collection.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/libri/"
                className="px-6 py-3 rounded-xl bg-onde-gold text-onde-dark font-bold hover:opacity-90 transition-opacity"
              >
                📚 Browse Books
              </Link>
              <Link
                href="/games/"
                className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                🎮 Browse Games
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-white/40 mb-4">Drag to reorder items</p>
            <Reorder.Group
              axis="y"
              values={collection.items}
              onReorder={onReorder}
              className="space-y-2"
            >
              {collection.items.map((item) => (
                <DraggableItem
                  key={`${item.id}-${item.type}`}
                  item={item}
                  onRemove={() => onRemoveItem(item.id, item.type)}
                />
              ))}
            </Reorder.Group>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Collection card component
function CollectionCard({
  collection,
  onClick,
}: {
  collection: Collection
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      className="text-left w-full group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative mb-3">
        <CollectionCover collection={collection} />
        {collection.isPublic && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            🔗 Shared
          </div>
        )}
      </div>
      
      <h3 className="font-bold text-white group-hover:text-onde-gold transition-colors truncate">
        {collection.emoji} {collection.name}
      </h3>
      <p className="text-sm text-white/40">
        {collection.items.length} {collection.items.length === 1 ? 'item' : 'items'}
      </p>
    </motion.button>
  )
}

// Main page component
export default function CollectionsPage() {
  const {
    collections,
    mounted,
    createCollection,
    deleteCollection,
    updateCollection,
    shareCollection,
    unshareCollection,
    removeFromCollection,
    reorderItems,
    PRESET_COLORS,
    PRESET_EMOJIS,
  } = useCollections()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Collection | null>(null)

  const handleCreate = (name: string, options: { description?: string; emoji?: string; color?: string }) => {
    const newCollection = createCollection(name, options)
    setSelectedCollection(newCollection)
  }

  const handleShare = (collection: Collection) => {
    const shareUrl = shareCollection(collection.id)
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
    }
    // Refresh selected collection
    const updated = collections.find(c => c.id === collection.id)
    if (updated) setSelectedCollection({ ...updated, isPublic: true })
  }

  const handleUnshare = (collection: Collection) => {
    unshareCollection(collection.id)
    const updated = collections.find(c => c.id === collection.id)
    if (updated) setSelectedCollection({ ...updated, isPublic: false })
  }

  const handleReorder = (collectionId: string, newItems: CollectionItem[]) => {
    // Find indices and reorder
    const collection = collections.find(c => c.id === collectionId)
    if (!collection) return
    
    // Update state directly since we have full new order
    const oldOrder = collection.items.map(i => `${i.id}-${i.type}`)
    const newOrder = newItems.map(i => `${i.id}-${i.type}`)
    
    // Find moved item
    for (let i = 0; i < newOrder.length; i++) {
      if (oldOrder[i] !== newOrder[i]) {
        const fromIndex = oldOrder.indexOf(newOrder[i])
        reorderItems(collectionId, fromIndex, i)
        break
      }
    }
    
    // Update selected collection view
    setSelectedCollection(prev => prev ? { ...prev, items: newItems } : null)
  }

  // Show loading skeleton
  if (!mounted) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-12 bg-white/10 rounded-xl w-64 mb-4" />
            <div className="h-6 bg-white/5 rounded-xl w-96 mb-12" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="aspect-square bg-white/10 rounded-xl mb-3" />
                  <div className="h-5 bg-white/10 rounded w-24 mb-2" />
                  <div className="h-4 bg-white/5 rounded w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show collection detail
  if (selectedCollection) {
    const currentCollection = collections.find(c => c.id === selectedCollection.id) || selectedCollection
    
    return (
      <>
        <CollectionDetail
          collection={currentCollection}
          onBack={() => setSelectedCollection(null)}
          onEdit={() => setEditingCollection(currentCollection)}
          onDelete={() => setDeleteConfirm(currentCollection)}
          onShare={() => handleShare(currentCollection)}
          onUnshare={() => handleUnshare(currentCollection)}
          onRemoveItem={(itemId, itemType) => {
            removeFromCollection(currentCollection.id, itemId, itemType)
            setSelectedCollection(prev => prev ? {
              ...prev,
              items: prev.items.filter(i => !(i.id === itemId && i.type === itemType))
            } : null)
          }}
          onReorder={(items) => handleReorder(currentCollection.id, items)}
        />
        
        <AnimatePresence>
          {editingCollection && (
            <EditCollectionModal
              collection={editingCollection}
              onClose={() => setEditingCollection(null)}
              onSave={(updates) => {
                updateCollection(editingCollection.id, updates)
                setSelectedCollection(prev => prev ? { ...prev, ...updates } : null)
              }}
              presetColors={PRESET_COLORS}
              presetEmojis={PRESET_EMOJIS}
            />
          )}
          
          {deleteConfirm && (
            <ConfirmModal
              isOpen={true}
              onClose={() => setDeleteConfirm(null)}
              onConfirm={() => {
                deleteCollection(deleteConfirm.id)
                setSelectedCollection(null)
              }}
              title="Delete Collection?"
              message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
            />
          )}
        </AnimatePresence>
      </>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            My Collections
          </h1>
          <p className="text-xl text-white/60 max-w-2xl">
            Organize your favorite books and games into custom collections. Share them with friends and family!
          </p>
        </motion.div>

        {/* Create button */}
        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="mb-8 px-6 py-3 rounded-xl bg-gradient-to-r from-onde-gold to-amber-500 text-onde-dark font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          ➕ Create New Collection
        </motion.button>

        {/* Collections grid */}
        {collections.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-8xl mb-6 opacity-50">📚</div>
            <h2 className="text-2xl font-bold text-white mb-4">No collections yet</h2>
            <p className="text-white/60 max-w-md mx-auto mb-8">
              Create your first collection to start organizing your favorite books and games!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-onde-gold to-amber-500 text-onde-dark font-bold text-lg hover:opacity-90 transition-opacity"
            >
              ✨ Create Your First Collection
            </button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {collections.map((collection, index) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={() => setSelectedCollection(collection)}
              />
            ))}
          </motion.div>
        )}

        {/* Tips section */}
        {collections.length > 0 && (
          <motion.div
            className="mt-16 p-6 rounded-2xl bg-white/5 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              💡 Tips
            </h3>
            <ul className="text-white/60 space-y-2">
              <li>• Browse books and games to add them to your collections</li>
              <li>• Drag and drop to reorder items within a collection</li>
              <li>• Share collections with friends using the share link</li>
              <li>• Collection covers are automatically generated from your first 4 items</li>
            </ul>
          </motion.div>
        )}
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateCollectionModal
            isOpen={true}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreate}
            presetColors={PRESET_COLORS}
            presetEmojis={PRESET_EMOJIS}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

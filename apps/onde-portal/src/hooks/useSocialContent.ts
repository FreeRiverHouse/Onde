'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// Types
// ============================================================================

export type PostType = 'game_announcement' | 'feature_announcement' | 'progress_update' | 'fun_fact'
export type PostStatus = 'draft' | 'ready' | 'posted'
export type Platform = 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok'

export interface SocialPost {
  id: string
  type: PostType
  platform: Platform
  content: string
  hashtags: string[]
  status: PostStatus
  createdAt: string
  scheduledFor?: string
  postedAt?: string
  featureName?: string
  emoji?: string
  mediaUrl?: string
  engagementNotes?: string
}

export interface PostTemplate {
  type: PostType
  templates: string[]
  defaultEmoji: string
  defaultHashtags: string[]
}

export interface GenerateOptions {
  featureName: string
  type: PostType
  platform?: Platform
  customEmoji?: string
  additionalHashtags?: string[]
  customTemplate?: string
}

export interface SocialContentStats {
  total: number
  drafts: number
  ready: number
  posted: number
  byPlatform: Record<Platform, number>
  byType: Record<PostType, number>
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'onde-social-content'

// Character limits per platform
export const PLATFORM_LIMITS: Record<Platform, number> = {
  twitter: 280,
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  tiktok: 2200
}

// Hashtag limits per platform
export const HASHTAG_LIMITS: Record<Platform, number> = {
  twitter: 5,
  instagram: 30,
  facebook: 10,
  linkedin: 5,
  tiktok: 10
}

// Core Onde hashtags
const CORE_HASHTAGS = ['#Onde', '#OndeApp', '#KidsApps', '#EducationalGames']

// Category-specific hashtags
const CATEGORY_HASHTAGS: Record<string, string[]> = {
  game: ['#KidsGames', '#FamilyGaming', '#EdTech', '#PlayAndLearn', '#GameDev'],
  reading: ['#KidsReading', '#ChildrensBooks', '#ReadingIsFun', '#Literacy'],
  art: ['#KidsArt', '#CreativityForKids', '#DigitalArt', '#DrawingForKids'],
  music: ['#KidsMusic', '#MusicEducation', '#MusicForKids'],
  cooking: ['#KidsCooking', '#FamilyCooking', '#LearnToCook'],
  general: ['#ParentApproved', '#ScreenTimeThatMatters', '#KidsFun', '#FamilyApp']
}

// Post templates by type
export const POST_TEMPLATES: PostTemplate[] = [
  {
    type: 'game_announcement',
    templates: [
      '🎮 NEW GAME ALERT! {emoji} {feature} is now live in Onde! Get ready for hours of fun and learning. Your kids will love it! 🌊',
      '🚀 Just launched: {feature}! {emoji} A brand new adventure awaits in Onde. Who\'s ready to play? 🎉',
      '{emoji} Exciting news! {feature} just dropped in Onde! Designed with love for curious little minds. Download and play today! 💙',
      '✨ Say hello to {feature}! {emoji} Our newest game is here to spark imagination and joy. Available now in Onde! 🌈',
      '🎯 NEW: {feature} is live! {emoji} Another fun way to learn and grow with Onde. Kids, get ready! 🌟'
    ],
    defaultEmoji: '🎮',
    defaultHashtags: ['#NewGame', '#JustLaunched', ...CATEGORY_HASHTAGS.game]
  },
  {
    type: 'feature_announcement',
    templates: [
      '✨ NEW FEATURE: {feature}! {emoji} Making Onde even better for your little ones. Update now to try it! 💙',
      '🆕 We listened, we built! {feature} is now in Onde. {emoji} Thank you for helping us grow! 🙏',
      '{emoji} Fresh from our workshop: {feature}! Onde keeps getting better. Check it out! 🛠️',
      '📢 Feature drop! {feature} {emoji} is here to make your Onde experience even more magical! ✨',
      '🌟 Introducing {feature}! {emoji} Because great apps never stop improving. What do you think? 💬'
    ],
    defaultEmoji: '✨',
    defaultHashtags: ['#NewFeature', '#AppUpdate', '#ProductUpdate', ...CATEGORY_HASHTAGS.general]
  },
  {
    type: 'progress_update',
    templates: [
      '📊 Progress Update: {feature} is coming along beautifully! {emoji} Can\'t wait to share it with you. Stay tuned! 🎬',
      '🔨 Behind the scenes: Working hard on {feature}! {emoji} Good things take time. 💪',
      '{emoji} Sneak peek! {feature} is in the works. We\'re putting so much love into this one! 💙',
      '🚧 Building something special: {feature}! {emoji} Early preview coming soon. Who\'s excited? 🙋',
      '💡 From idea to reality: {feature} is progressing! {emoji} The Onde journey continues. 🌊'
    ],
    defaultEmoji: '🛠️',
    defaultHashtags: ['#ComingSoon', '#BehindTheScenes', '#InDevelopment', '#SneakPeek']
  },
  {
    type: 'fun_fact',
    templates: [
      '💡 Did you know? {feature}! {emoji} Onde is full of delightful surprises. 🌟',
      '{emoji} Fun Onde fact: {feature}! There\'s always more to discover. 🔍',
      '🤓 Onde trivia time! {feature}. {emoji} How many of these did you know? 💭',
      '✨ Little things that make Onde special: {feature}! {emoji} It\'s all in the details. 💙',
      '🎉 Here\'s something cool: {feature}! {emoji} We love adding these little touches. 🌈'
    ],
    defaultEmoji: '💡',
    defaultHashtags: ['#FunFact', '#DidYouKnow', '#AppSecrets', '#OndeMagic']
  }
]

// Feature emoji mappings
const FEATURE_EMOJIS: Record<string, string> = {
  // Games
  'coloring book': '🎨',
  'word puzzle': '🔤',
  'quiz game': '❓',
  'drawing pad': '✏️',
  'memory game': '🧠',
  'puzzle': '🧩',
  'arcade': '🕹️',
  'leaderboard': '🏆',
  // Features
  'parental controls': '👨‍👩‍👧',
  'theme': '🎨',
  'dark mode': '🌙',
  'activity feed': '📰',
  'daily challenge': '📅',
  'achievement': '🏅',
  'notifications': '🔔',
  'profile': '👤',
  'settings': '⚙️',
  'bookmarks': '🔖',
  'timer': '⏱️',
  'undo': '↩️',
  'weather': '🌤️',
  'mini-games': '🎲',
  'fortune': '🥠',
  // General
  'reading': '📚',
  'music': '🎵',
  'cooking': '👨‍🍳',
  'surfing': '🏄',
  'space': '🚀',
  'animals': '🐾',
  'nature': '🌿',
  'ocean': '🌊'
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(): string {
  return `post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function getEmojiForFeature(featureName: string): string {
  const lowerName = featureName.toLowerCase()
  for (const [keyword, emoji] of Object.entries(FEATURE_EMOJIS)) {
    if (lowerName.includes(keyword)) {
      return emoji
    }
  }
  return '✨'
}

function getCategoryForFeature(featureName: string): string {
  const lowerName = featureName.toLowerCase()
  if (lowerName.includes('game') || lowerName.includes('puzzle') || lowerName.includes('quiz')) return 'game'
  if (lowerName.includes('book') || lowerName.includes('read')) return 'reading'
  if (lowerName.includes('draw') || lowerName.includes('color') || lowerName.includes('art')) return 'art'
  if (lowerName.includes('music') || lowerName.includes('song')) return 'music'
  if (lowerName.includes('cook') || lowerName.includes('recipe') || lowerName.includes('chef')) return 'cooking'
  return 'general'
}

function generateHashtags(featureName: string, type: PostType, platform: Platform, additional: string[] = []): string[] {
  const category = getCategoryForFeature(featureName)
  const categoryTags = CATEGORY_HASHTAGS[category] || CATEGORY_HASHTAGS.general
  const template = POST_TEMPLATES.find(t => t.type === type)
  const typeTags = template?.defaultHashtags || []
  
  // Combine all hashtags (deduplicate)
  const allHashtags = Array.from(new Set([...CORE_HASHTAGS, ...typeTags, ...categoryTags, ...additional]))
  
  // Respect platform limits
  const limit = HASHTAG_LIMITS[platform]
  return allHashtags.slice(0, limit)
}

function formatContent(template: string, featureName: string, emoji: string): string {
  return template
    .replace(/{feature}/g, featureName)
    .replace(/{emoji}/g, emoji)
}

function getRandomTemplate(type: PostType): string {
  const template = POST_TEMPLATES.find(t => t.type === type)
  if (!template) return '{feature} {emoji}'
  const index = Math.floor(Math.random() * template.templates.length)
  return template.templates[index]
}

// ============================================================================
// Hook
// ============================================================================

export function useSocialContent() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [mounted, setMounted] = useState(false)

  // Load posts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setPosts(parsed)
        }
      }
    } catch (error) {
      console.error('Error loading social posts:', error)
    }
    setMounted(true)
  }, [])

  // Save to localStorage whenever posts change
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
      } catch (error) {
        console.error('Error saving social posts:', error)
      }
    }
  }, [posts, mounted])

  // Generate a post from feature name
  const generatePost = useCallback((options: GenerateOptions): SocialPost => {
    const {
      featureName,
      type,
      platform = 'twitter',
      customEmoji,
      additionalHashtags = [],
      customTemplate
    } = options

    const emoji = customEmoji || getEmojiForFeature(featureName)
    const template = customTemplate || getRandomTemplate(type)
    const content = formatContent(template, featureName, emoji)
    const hashtags = generateHashtags(featureName, type, platform, additionalHashtags)

    const post: SocialPost = {
      id: generateId(),
      type,
      platform,
      content,
      hashtags,
      status: 'draft',
      createdAt: new Date().toISOString(),
      featureName,
      emoji
    }

    return post
  }, [])

  // Add a post to the queue
  const addPost = useCallback((post: SocialPost) => {
    setPosts(prev => [...prev, post])
  }, [])

  // Generate and immediately add to queue
  const generateAndQueue = useCallback((options: GenerateOptions): SocialPost => {
    const post = generatePost(options)
    addPost(post)
    return post
  }, [generatePost, addPost])

  // Update a post
  const updatePost = useCallback((id: string, updates: Partial<SocialPost>) => {
    setPosts(prev => prev.map(post => 
      post.id === id ? { ...post, ...updates } : post
    ))
  }, [])

  // Update post status
  const setPostStatus = useCallback((id: string, status: PostStatus) => {
    setPosts(prev => prev.map(post => {
      if (post.id !== id) return post
      return {
        ...post,
        status,
        ...(status === 'posted' ? { postedAt: new Date().toISOString() } : {})
      }
    }))
  }, [])

  // Delete a post
  const deletePost = useCallback((id: string) => {
    setPosts(prev => prev.filter(post => post.id !== id))
  }, [])

  // Check character limit
  const checkCharacterLimit = useCallback((post: SocialPost): { 
    isValid: boolean
    currentLength: number
    maxLength: number
    remaining: number 
  } => {
    const hashtagsText = post.hashtags.join(' ')
    const fullContent = `${post.content}\n\n${hashtagsText}`
    const currentLength = fullContent.length
    const maxLength = PLATFORM_LIMITS[post.platform]
    
    return {
      isValid: currentLength <= maxLength,
      currentLength,
      maxLength,
      remaining: maxLength - currentLength
    }
  }, [])

  // Get posts by status
  const getPostsByStatus = useCallback((status: PostStatus): SocialPost[] => {
    return posts.filter(post => post.status === status)
  }, [posts])

  // Get posts by platform
  const getPostsByPlatform = useCallback((platform: Platform): SocialPost[] => {
    return posts.filter(post => post.platform === platform)
  }, [posts])

  // Export pending posts as JSON
  const exportPendingPosts = useCallback((): string => {
    const pending = posts.filter(post => post.status !== 'posted')
    return JSON.stringify(pending, null, 2)
  }, [posts])

  // Export all posts as JSON
  const exportAllPosts = useCallback((): string => {
    return JSON.stringify(posts, null, 2)
  }, [posts])

  // Import posts from JSON
  const importPosts = useCallback((json: string): number => {
    try {
      const imported = JSON.parse(json)
      if (!Array.isArray(imported)) {
        throw new Error('Invalid format: expected array')
      }
      
      // Validate and regenerate IDs to avoid duplicates
      const validPosts = imported.map(post => ({
        ...post,
        id: generateId(),
        createdAt: post.createdAt || new Date().toISOString(),
        status: post.status || 'draft'
      }))

      setPosts(prev => [...prev, ...validPosts])
      return validPosts.length
    } catch (error) {
      console.error('Error importing posts:', error)
      return 0
    }
  }, [])

  // Bulk generate posts for multiple platforms
  const generateForAllPlatforms = useCallback((featureName: string, type: PostType): SocialPost[] => {
    const platforms: Platform[] = ['twitter', 'instagram', 'facebook', 'linkedin']
    return platforms.map(platform => generatePost({ featureName, type, platform }))
  }, [generatePost])

  // Get statistics
  const stats = useMemo((): SocialContentStats => {
    const byPlatform: Record<Platform, number> = {
      twitter: 0, instagram: 0, facebook: 0, linkedin: 0, tiktok: 0
    }
    const byType: Record<PostType, number> = {
      game_announcement: 0, feature_announcement: 0, progress_update: 0, fun_fact: 0
    }
    let drafts = 0, ready = 0, posted = 0

    for (const post of posts) {
      byPlatform[post.platform]++
      byType[post.type]++
      if (post.status === 'draft') drafts++
      else if (post.status === 'ready') ready++
      else if (post.status === 'posted') posted++
    }

    return {
      total: posts.length,
      drafts,
      ready,
      posted,
      byPlatform,
      byType
    }
  }, [posts])

  // Clear all posts
  const clearAllPosts = useCallback(() => {
    setPosts([])
  }, [])

  // Generate sample posts for recent features
  const generateSamplePosts = useCallback((): SocialPost[] => {
    const recentFeatures = [
      { name: 'Coloring Book', type: 'game_announcement' as PostType },
      { name: 'Word Puzzle', type: 'game_announcement' as PostType },
      { name: 'Quiz Game', type: 'game_announcement' as PostType },
      { name: 'Parental Controls', type: 'feature_announcement' as PostType },
      { name: 'Drawing Pad', type: 'game_announcement' as PostType },
      { name: 'Theme System with Dark Mode', type: 'feature_announcement' as PostType },
      { name: 'Activity Feed', type: 'feature_announcement' as PostType },
      { name: 'Daily Challenges', type: 'feature_announcement' as PostType },
      { name: 'Achievement System', type: 'feature_announcement' as PostType },
      { name: 'Notifications', type: 'feature_announcement' as PostType }
    ]

    const samples: SocialPost[] = []
    
    for (const feature of recentFeatures) {
      // Generate for Twitter
      samples.push(generatePost({
        featureName: feature.name,
        type: feature.type,
        platform: 'twitter'
      }))
      
      // Generate for Instagram
      samples.push(generatePost({
        featureName: feature.name,
        type: feature.type,
        platform: 'instagram'
      }))
    }

    // Add some fun facts
    const funFacts = [
      'Onde has over 20 interactive experiences for kids!',
      'The waves in Onde are inspired by real Portuguese surf spots',
      'Every game in Onde is designed with child development experts',
      'Onde\'s color palette is based on the ocean at sunset',
      'Kids have completed over 1000 daily challenges this month'
    ]

    for (const fact of funFacts) {
      samples.push(generatePost({
        featureName: fact,
        type: 'fun_fact',
        platform: 'twitter'
      }))
    }

    return samples
  }, [generatePost])

  // Bulk add sample posts
  const addSamplePosts = useCallback(() => {
    const samples = generateSamplePosts()
    setPosts(prev => [...prev, ...samples])
    return samples.length
  }, [generateSamplePosts])

  return {
    // State
    posts,
    mounted,
    stats,
    
    // Generation
    generatePost,
    generateAndQueue,
    generateForAllPlatforms,
    generateSamplePosts,
    addSamplePosts,
    
    // CRUD
    addPost,
    updatePost,
    deletePost,
    setPostStatus,
    
    // Queries
    getPostsByStatus,
    getPostsByPlatform,
    checkCharacterLimit,
    
    // Import/Export
    exportPendingPosts,
    exportAllPosts,
    importPosts,
    
    // Utilities
    clearAllPosts,
    
    // Constants
    PLATFORM_LIMITS,
    HASHTAG_LIMITS,
    POST_TEMPLATES
  }
}

// ============================================================================
// Utility exports for external use
// ============================================================================

export { CORE_HASHTAGS, CATEGORY_HASHTAGS, FEATURE_EMOJIS }

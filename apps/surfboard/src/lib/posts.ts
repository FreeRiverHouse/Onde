// Posts data management for FRH HQ Dashboard
// In-memory storage for MVP - can be replaced with D1 database later

export interface PendingPost {
  id: string
  account: 'onde' | 'frh' | 'magmatic'
  content: string
  scheduledFor?: string
  status: 'pending' | 'approved' | 'rejected'
  feedback?: string[]
  createdAt: string
}

// In-memory storage
let posts: PendingPost[] = [
  {
    id: '1',
    account: 'onde',
    content: 'New book release coming soon! Stay tuned for our latest children\'s story about MILO the robot.',
    scheduledFor: '2026-01-22 08:08',
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    account: 'frh',
    content: 'Building in public: Just deployed our new dashboard with real-time monitoring. #buildinpublic',
    scheduledFor: '2026-01-22 09:09',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
]

export function getPendingPosts(): PendingPost[] {
  return posts.filter(p => p.status === 'pending')
}

export function getAllPosts(): PendingPost[] {
  return posts
}

export function approvePost(id: string): boolean {
  const post = posts.find(p => p.id === id)
  if (post) {
    post.status = 'approved'
    return true
  }
  return false
}

export function rejectPost(id: string): boolean {
  const post = posts.find(p => p.id === id)
  if (post) {
    post.status = 'rejected'
    return true
  }
  return false
}

export function addFeedback(id: string, feedback: string): boolean {
  const post = posts.find(p => p.id === id)
  if (post) {
    if (!post.feedback) post.feedback = []
    post.feedback.push(feedback)
    // Agent will regenerate content based on feedback
    // For now, just store the feedback
    return true
  }
  return false
}

export function addPost(post: Omit<PendingPost, 'id' | 'createdAt'>): PendingPost {
  const newPost: PendingPost = {
    ...post,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  }
  posts.push(newPost)
  return newPost
}

export function clearApprovedRejected(): void {
  posts = posts.filter(p => p.status === 'pending')
}

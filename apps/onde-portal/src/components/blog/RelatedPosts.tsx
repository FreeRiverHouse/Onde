'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { blogPosts, BLOG_CATEGORIES, type BlogPost } from '@/data/blog-posts'

interface RelatedPostsProps {
  /** Current post slug to exclude */
  currentSlug: string
  /** Max posts to show (default: 3) */
  maxPosts?: number
}

/**
 * RelatedPosts — shows 2-3 other blog posts at the bottom of a post.
 * Prioritizes posts in the same category, then falls back to recent posts.
 */
export default function RelatedPosts({ currentSlug, maxPosts = 3 }: RelatedPostsProps) {
  const currentPost = blogPosts.find((p) => p.slug === currentSlug)
  const otherPosts = blogPosts.filter((p) => p.slug !== currentSlug)

  if (otherPosts.length === 0) return null

  // Prioritize same-category posts, then fill with others
  let related: BlogPost[] = []
  if (currentPost) {
    const sameCategory = otherPosts.filter((p) => p.category === currentPost.category)
    const different = otherPosts.filter((p) => p.category !== currentPost.category)
    related = [...sameCategory, ...different].slice(0, maxPosts)
  } else {
    related = otherPosts.slice(0, maxPosts)
  }

  if (related.length === 0) return null

  return (
    <motion.section
      className="mt-20 pt-12 border-t border-white/10"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h2 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-3">
        <span className="text-2xl">📖</span>
        Read Next
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {related.map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/blog/${post.slug}`} className="group block h-full">
              <div
                className="card-3d p-6 h-full relative overflow-hidden
                           hover:border-white/20 transition-all duration-500"
              >
                {/* Gradient accent top bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${post.gradient}
                             opacity-50 group-hover:opacity-100 transition-opacity`}
                />

                {/* Emoji + Category */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10
                               flex items-center justify-center text-xl
                               group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300"
                  >
                    {post.emoji}
                  </div>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                               bg-white/5 border border-white/10 text-white/50 text-xs font-medium"
                  >
                    {BLOG_CATEGORIES.find((c) => c.value === post.category)?.emoji}{' '}
                    {post.category}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="text-lg font-display font-bold text-white mb-2 line-clamp-2
                             group-hover:text-onde-teal transition-colors duration-300"
                >
                  {post.title}
                </h3>

                {/* Subtitle */}
                <p className="text-sm text-onde-teal/70 font-medium mb-2">{post.subtitle}</p>

                {/* Excerpt */}
                <p className="text-sm text-white/50 leading-relaxed line-clamp-2 mb-4">
                  {post.excerpt}
                </p>

                {/* Meta footer */}
                <div className="flex items-center justify-between text-xs text-white/30 mt-auto pt-3 border-t border-white/5">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

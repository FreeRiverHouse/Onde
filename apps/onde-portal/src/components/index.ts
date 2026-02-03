/**
 * Components barrel export
 * Import components from '@/components' for cleaner imports
 */

// Layout & Navigation
export { default as ScrollToTop } from './ScrollToTop'
export { default as GlobalLoadingIndicator, SectionLoadingIndicator } from './GlobalLoadingIndicator'

// Feedback
export { default as ToastProvider, useToast } from './Toast'
export { default as Spinner, Loading } from './Spinner'

// Overlays
export { default as Modal } from './Modal'
export { default as Tooltip } from './Tooltip'
export { default as KeyboardShortcutsModal } from './KeyboardShortcutsModal'

// Data Display
export { default as Badge, NewBadge, FreeBadge, BetaBadge } from './Badge'
export { default as BlurImage, BookCoverImage } from './BlurImage'

// Forms
export { default as NewsletterSignup } from './NewsletterSignup'

// Accessibility
export { default as AccessibilityAnnouncer, useAnnouncer } from './AccessibilityAnnouncer'

// SEO
export { default as BreadcrumbSchema, Breadcrumb } from './BreadcrumbSchema'
export { default as BookSchema, ArticleSchema } from './BookSchema'

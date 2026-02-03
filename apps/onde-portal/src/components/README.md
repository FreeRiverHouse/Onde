# Onde Portal Components

## Overview

This directory contains reusable React components for the Onde Portal.

## Components

### Layout & Navigation

| Component | Description | Usage |
|-----------|-------------|-------|
| `ClientLayout` | Main app layout with nav/footer | Wrap pages |
| `GlobalLoadingIndicator` | Route transition progress bar | Add to layout |

### Accessibility

| Component | Description | Usage |
|-----------|-------------|-------|
| `AccessibilityAnnouncer` | Screen reader announcements | Wrap app, use `useAnnouncer()` |

### Forms

| Component | Description | Usage |
|-----------|-------------|-------|
| `NewsletterSignup` | Email signup form | `variant="inline|card|footer"` |

### UI Elements

| Component | Description | Location |
|-----------|-------------|----------|
| Aceternity UI | Animated components | `ui/aceternity/` |

## Usage Examples

### AccessibilityAnnouncer

```tsx
import { AccessibilityAnnouncer, useAnnouncer } from '@/components/AccessibilityAnnouncer'

// In layout:
<AccessibilityAnnouncer>
  {children}
</AccessibilityAnnouncer>

// In component:
const { announce } = useAnnouncer()
announce('Download complete!')
announce('Error occurred', 'assertive')
```

### NewsletterSignup

```tsx
import { NewsletterSignup } from '@/components/NewsletterSignup'

// Card style (default)
<NewsletterSignup />

// Inline style
<NewsletterSignup variant="inline" />

// Footer style
<NewsletterSignup variant="footer" />
```

### GlobalLoadingIndicator

```tsx
import { GlobalLoadingIndicator, SectionLoadingIndicator } from '@/components/GlobalLoadingIndicator'

// In layout (once):
<GlobalLoadingIndicator />

// For specific sections:
<Suspense fallback={<SectionLoadingIndicator label="Loading books..." />}>
  <BookList />
</Suspense>
```

## Styling

Components use:
- Tailwind CSS for styling
- Onde design tokens (`onde-ocean`, `onde-coral`, `onde-cream`)
- Responsive design (mobile-first)

## Adding New Components

1. Create component file: `ComponentName.tsx`
2. Export from component file
3. Add to this README
4. Consider accessibility (aria labels, keyboard nav)
5. Test on mobile

## Design Tokens

```css
/* Colors */
--onde-ocean: #1e3a5f    /* Primary blue */
--onde-coral: #ff6b6b    /* Accent coral */
--onde-cream: #fef9f3    /* Background */
--onde-gold: #d4af37     /* Highlight */
```

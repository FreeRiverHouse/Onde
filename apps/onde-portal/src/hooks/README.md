# Onde Portal Hooks

Custom React hooks for the Onde Portal application.

## Usage

```tsx
import { useLocalStorage, useMediaQuery, useDebounce } from '@/hooks'
```

## Available Hooks

### State Management

#### `useLocalStorage<T>(key, initialValue)`
Sync state with localStorage, SSR-safe with multi-tab sync.

```tsx
const [theme, setTheme] = useLocalStorage('theme', 'light')
```

#### `useDebounce<T>(value, delay)`
Debounce a value for search inputs, etc.

```tsx
const debouncedSearch = useDebounce(searchQuery, 300)
```

### DOM & Events

#### `useFocusTrap(isActive)`
Trap focus within a container (for modals).

```tsx
const { containerRef } = useFocusTrap(isModalOpen)
```

#### `useOnClickOutside(ref, handler)`
Detect clicks outside an element.

```tsx
useOnClickOutside(dropdownRef, () => setIsOpen(false))
```

### Responsive

#### `useMediaQuery(query)`
React to media query changes.

```tsx
const isMobile = useMediaQuery('(max-width: 768px)')
```

**Preset hooks:**
- `useIsMobile()` - < 640px
- `useIsTablet()` - 640-1023px
- `useIsDesktop()` - >= 1024px
- `usePrefersReducedMotion()`
- `usePrefersDarkMode()`

### Utilities

#### `useCopyToClipboard()`
Copy text with status feedback.

```tsx
const { copy, status } = useCopyToClipboard()
// status: 'idle' | 'copied' | 'error'
```

## Adding New Hooks

1. Create `useYourHook.ts` in this directory
2. Export from `index.ts`
3. Add documentation here
4. Ensure SSR safety (check `typeof window`)

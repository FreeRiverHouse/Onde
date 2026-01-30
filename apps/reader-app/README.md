# 📚 Onde Reader

A modern, beautiful book reading app built with Next.js.

## Features

### MVP (Current)
- ✅ **Theme modes**: Light, Dark, Sepia
- ✅ **Typography controls**: Font size, font family (serif/sans), line spacing
- ✅ **Pagination**: Swipe or arrow keys to navigate
- ✅ **Progress tracking**: Per-book progress persisted to localStorage
- ✅ **Table of Contents**: Quick chapter navigation
- ✅ **Keyboard shortcuts**: Arrow keys, Space, Escape
- ✅ **Touch gestures**: Swipe left/right for page turns
- ✅ **Responsive**: Works on desktop, tablet, and mobile
- ✅ **PWA ready**: Installable as standalone app

### Coming Soon
- [ ] EPUB file support (drag & drop upload)
- [ ] Bookmarks & highlighting
- [ ] Notes & annotations
- [ ] Search within book
- [ ] Font weight control
- [ ] Sync progress across devices
- [ ] VR portal version

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **State**: Zustand with persistence
- **EPUB parsing**: epub.js (coming soon)
- **Storage**: localStorage + IndexedDB

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ← / ↑ | Previous page/chapter |
| → / ↓ / Space | Next page/chapter |
| Escape | Back to library |

## Touch Gestures

- **Swipe left**: Next page
- **Swipe right**: Previous page
- **Tap center**: Toggle controls

## Configuration

Reader settings are persisted to localStorage:
- Theme (light/dark/sepia)
- Font size (14-28px)
- Font family (serif/sans)
- Line height (1.4-2.2)
- Margins (small/medium/large)

## Future: VR Portal

The web version serves as the prototype for a VR reading experience featuring:
- Cozy virtual reading environments (library, cafe, nature)
- Eye tracking for page turns
- Spatial audio ambiance
- Virtual bookshelf
- Quest 3 & Vision Pro support

---

Built with ❤️ for Onde.la

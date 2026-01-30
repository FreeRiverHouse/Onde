# 📚 Onde Reader

A modern, beautiful book reading app built with Next.js. Features EPUB support, text-to-speech, annotations, vocabulary building, and cross-device sync.

**Live**: [onde.la/reader](https://onde.la/reader)

## ✨ Features

### Core Reading
- ✅ **Full EPUB support**: Upload and read EPUB files
- ✅ **Theme modes**: Light, Dark, Sepia
- ✅ **Typography controls**: Font size, font family, line spacing, margins
- ✅ **Pagination**: Swipe or keyboard navigation
- ✅ **Progress tracking**: Per-book progress auto-saved
- ✅ **Table of Contents**: Quick chapter navigation
- ✅ **Responsive**: Desktop, tablet, mobile

### Annotations & Vocabulary
- ✅ **Text highlighting**: 4 colors (yellow, green, blue, pink)
- ✅ **Notes**: Add notes to highlights
- ✅ **Bookmarks**: Save favorite pages
- ✅ **Dictionary lookup**: Select a word for instant definition
- ✅ **Vocabulary building**: Save words to personal vocabulary list
- ✅ **Export annotations**: Markdown export

### Text-to-Speech (Audiobook Mode)
- ✅ **System voices**: Use any installed TTS voice
- ✅ **Speed presets**: 0.75x / 1x / 1.5x / 2x
- ✅ **Auto page turn**: Seamless audiobook experience
- ✅ **Keyboard shortcuts**: Space, arrows, 1-4 for speed
- ✅ **Settings persist**: Voice, speed, pitch saved

### Reading Statistics
- ✅ **Session tracking**: Time spent, pages read
- ✅ **Daily stats**: 30-day history with chart
- ✅ **Reading streaks**: Current and longest streak
- ✅ **All-time totals**: Books completed, total time

### Cloud Sync (Optional)
- ✅ **Cross-device sync**: Sync via 6-char pairing code
- ✅ **Conflict resolution**: Timestamp-based merge
- ✅ **Local-first**: Works offline, syncs when online
- ✅ **Privacy**: Self-hosted Supabase or local-only mode

### Offline Support
- ✅ **PWA ready**: Install as standalone app
- ✅ **IndexedDB**: Books cached locally
- ✅ **Offline indicator**: Visual status in header
- ✅ **Backup/Restore**: Export/import all data as JSON

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **State**: Zustand with localStorage persistence
- **EPUB**: epub.js
- **Storage**: IndexedDB (books) + localStorage (settings)
- **Sync**: Supabase (optional)

## 🚀 Quick Start

```bash
cd apps/reader-app

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Build static export for Cloudflare
STATIC_EXPORT=1 npm run build
```

## ⌨️ Keyboard Shortcuts

### Reader
| Key | Action |
|-----|--------|
| ← / ↑ | Previous page |
| → / ↓ / Space | Next page |
| Escape | Back to library |

### Text-to-Speech
| Key | Action |
|-----|--------|
| Space | Play/Pause |
| Escape | Close TTS |
| ← / → | Previous/Next sentence |
| ↑ / ↓ | Adjust speed |
| M | Mute/Unmute |
| 1/2/3/4 | Speed presets |

## 📱 Touch Gestures

- **Swipe left**: Next page
- **Swipe right**: Previous page
- **Tap center**: Toggle controls

## ☁️ Cloud Sync Setup

Cloud sync is optional. The app works fully offline by default.

To enable cloud sync with your own Supabase project:

1. See [docs/SUPABASE-SETUP.md](docs/SUPABASE-SETUP.md) for full guide
2. Copy [docs/supabase-schema.sql](docs/supabase-schema.sql) to Supabase SQL Editor
3. Add environment variables:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📁 Project Structure

```
apps/reader-app/
├── src/
│   ├── app/               # Next.js app router pages
│   │   ├── page.tsx       # Library view
│   │   └── read/[id]/     # Reader view
│   ├── components/        # React components
│   │   ├── EpubReader.tsx # Main EPUB reader
│   │   ├── HighlightMenu.tsx
│   │   ├── TextToSpeech.tsx
│   │   ├── DictionaryPopup.tsx
│   │   ├── VocabularyPanel.tsx
│   │   ├── AnnotationsPanel.tsx
│   │   ├── ReadingStatsPanel.tsx
│   │   ├── SyncPanel.tsx
│   │   └── ...
│   ├── lib/               # Utilities and services
│   │   ├── supabase.ts    # Supabase client
│   │   ├── syncService.ts # Sync logic
│   │   ├── epubStorage.ts # IndexedDB storage
│   │   └── dataTransfer.ts # Export/import
│   └── store/             # Zustand stores
│       ├── readerStore.ts
│       └── readingStatsStore.ts
├── docs/
│   ├── SUPABASE-SETUP.md  # Cloud sync setup guide
│   └── supabase-schema.sql # Database schema
└── public/
    └── manifest.json      # PWA manifest
```

## 🎨 Customization

Reader settings persist to localStorage:
- Theme (light/dark/sepia)
- Font size (14-28px)
- Font family (serif/sans-serif)
- Line height (1.4-2.2)
- Margins (small/medium/large)

## 🔮 VR Version

See [apps/reader-vr](../reader-vr) for the WebXR version:
- Cozy virtual library environment
- Floating book with page navigation
- Time-of-day lighting
- Ambient soundscapes
- Quest 3 compatible

---

Built with ❤️ for [Onde.la](https://onde.la)

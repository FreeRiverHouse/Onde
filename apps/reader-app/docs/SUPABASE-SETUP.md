# Supabase Setup for Reader App Cloud Sync

This guide walks through setting up Supabase for the Reader App's cloud sync feature.

## Prerequisites

- A Supabase account (free tier works)
- Access to the Reader App codebase

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Name it: `onde-reader-sync`
4. Choose a strong database password (save it securely)
5. Select the region closest to most users (e.g., `us-west-1` for California)
6. Click **Create new project**

## Step 2: Create Database Schema

Run this SQL in the **SQL Editor** (Database → SQL Editor):

```sql
-- Reader App Sync Table
-- Stores sync data per sync_code group

CREATE TABLE reader_sync (
  -- Primary identifier for sync group
  sync_code TEXT PRIMARY KEY,
  
  -- Device that last updated this sync
  device_id TEXT NOT NULL,
  
  -- Sync data: books, annotations, settings, stats
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for device lookup
CREATE INDEX idx_reader_sync_device ON reader_sync(device_id);

-- Index for updated_at (for cleanup queries)
CREATE INDEX idx_reader_sync_updated ON reader_sync(updated_at);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating timestamp
CREATE TRIGGER reader_sync_updated_at
  BEFORE UPDATE ON reader_sync
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add comment for documentation
COMMENT ON TABLE reader_sync IS 'Reader App cross-device sync storage';
COMMENT ON COLUMN reader_sync.sync_code IS '6-char alphanumeric code for pairing devices';
COMMENT ON COLUMN reader_sync.device_id IS 'UUID of device that last updated';
COMMENT ON COLUMN reader_sync.data IS 'JSON: books, annotations, settings, readingStats';
```

## Step 3: Enable Row Level Security

Run this SQL to enable anonymous access with RLS:

```sql
-- Enable RLS
ALTER TABLE reader_sync ENABLE ROW LEVEL SECURITY;

-- Allow anonymous INSERT (creating new sync codes)
CREATE POLICY "Allow anonymous insert"
ON reader_sync
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous SELECT (reading sync data)
CREATE POLICY "Allow anonymous select"
ON reader_sync
FOR SELECT
TO anon
USING (true);

-- Allow anonymous UPDATE (updating sync data)
CREATE POLICY "Allow anonymous update"
ON reader_sync
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Note: DELETE is NOT allowed - data cleanup handled via cron
```

## Step 4: Optional - Auto-Cleanup Old Data

To automatically delete sync data older than 90 days (saves storage):

```sql
-- Enable pg_cron extension (may require enabling in dashboard)
-- Go to Database → Extensions → Enable pg_cron

-- Schedule cleanup for 3am daily
SELECT cron.schedule(
  'cleanup-old-sync-data',
  '0 3 * * *',
  $$DELETE FROM reader_sync WHERE updated_at < NOW() - INTERVAL '90 days'$$
);
```

## Step 5: Get API Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxx.supabase.co`)
   - **anon public** key (safe to expose in client)

## Step 6: Configure Reader App

Create or update `.env.local` in `apps/reader-app/`:

```bash
# Supabase Cloud Sync
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

For production deployment, add these to your Cloudflare Pages environment variables.

## Step 7: Verify Setup

1. Start the Reader App: `npm run dev`
2. Go to Settings → Sync
3. Click "Enable Sync"
4. Verify a sync code is generated
5. Open in another browser/incognito
6. Enter the same sync code
7. Verify data syncs between devices

## Troubleshooting

### "Local Only" Badge Showing

This means Supabase credentials are not configured. Check:
- `.env.local` exists with both variables
- Values are correct (no extra quotes or spaces)
- Restart the dev server after changes

### Sync Fails

Check browser console for errors:
- `401 Unauthorized` - Check anon key
- `CORS error` - Check project URL
- `RLS violation` - Verify policies are created

### Data Not Merging

The sync uses timestamp-based conflict resolution:
- Newer `lastRead` per book wins
- Higher `progress` per book wins
- Newer annotations per ID win
- Check `updated_at` in database

## Security Notes

- **Anon key is safe to expose** - It only allows access defined by RLS
- **Sync codes are not secret** - Anyone with the code can sync
- **Data is not encrypted** - Don't sync sensitive personal info
- **Consider rate limiting** - Add edge function if needed

## Data Schema

The `data` JSONB column contains:

```typescript
{
  books: [{
    id: string;
    title: string;
    author: string;
    progress: number;       // 0-1
    currentPage: number;
    lastRead: number;       // timestamp
    coverUrl?: string;
    totalPages?: number;
  }],
  annotations: [{
    id: string;
    bookId: string;
    type: 'highlight' | 'bookmark';
    cfiRange?: string;
    text?: string;
    note?: string;
    color?: string;
    createdAt: number;
  }],
  vocabulary: [{
    id: string;
    word: string;
    definition: string;
    bookId: string;
    createdAt: number;
  }],
  settings: {
    fontSize: number;
    fontFamily: string;
    theme: string;
    lineHeight: number;
    margins: string;
  },
  ttsSettings: {
    voiceName: string;
    rate: number;
    pitch: number;
    volume: number;
    autoPageTurn: boolean;
  },
  readingStats: {
    totalReadingTime: number;
    totalPagesRead: number;
    totalSessions: number;
    booksCompleted: number;
    currentStreak: number;
    longestStreak: number;
    lastReadDate: string;
    dailyStats: Record<string, {
      readingTime: number;
      pagesRead: number;
      sessions: number;
    }>;
  }
}
```

## Cost Estimate (Free Tier)

Supabase free tier includes:
- 500MB database storage
- 2GB bandwidth/month
- 50,000 monthly active users

Reader App usage estimate per user:
- ~5KB per sync (books + annotations)
- ~100 syncs/month = 500KB/user/month

**Free tier supports ~1,000 active users** easily.

---

*Last updated: 2026-02-01*

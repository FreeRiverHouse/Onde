-- ============================================
-- Reader App Cloud Sync - Supabase Schema
-- ============================================
-- 
-- Run this in Supabase SQL Editor to set up
-- cloud sync for the Reader App.
--
-- See SUPABASE-SETUP.md for full instructions.
-- ============================================

-- ===================
-- Table: reader_sync
-- ===================

CREATE TABLE IF NOT EXISTS reader_sync (
  -- Primary identifier for sync group (6-char code)
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
CREATE INDEX IF NOT EXISTS idx_reader_sync_device 
ON reader_sync(device_id);

-- Index for updated_at (for cleanup queries)
CREATE INDEX IF NOT EXISTS idx_reader_sync_updated 
ON reader_sync(updated_at);

-- ===================
-- Auto-update Trigger
-- ===================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reader_sync_updated_at ON reader_sync;
CREATE TRIGGER reader_sync_updated_at
  BEFORE UPDATE ON reader_sync
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ===================
-- Row Level Security
-- ===================

ALTER TABLE reader_sync ENABLE ROW LEVEL SECURITY;

-- Allow anonymous INSERT (creating new sync codes)
DROP POLICY IF EXISTS "Allow anonymous insert" ON reader_sync;
CREATE POLICY "Allow anonymous insert"
ON reader_sync
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous SELECT (reading sync data)
DROP POLICY IF EXISTS "Allow anonymous select" ON reader_sync;
CREATE POLICY "Allow anonymous select"
ON reader_sync
FOR SELECT
TO anon
USING (true);

-- Allow anonymous UPDATE (updating sync data)
DROP POLICY IF EXISTS "Allow anonymous update" ON reader_sync;
CREATE POLICY "Allow anonymous update"
ON reader_sync
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- ===================
-- Documentation
-- ===================

COMMENT ON TABLE reader_sync IS 'Reader App cross-device sync storage';
COMMENT ON COLUMN reader_sync.sync_code IS '6-char alphanumeric code for pairing devices';
COMMENT ON COLUMN reader_sync.device_id IS 'UUID of device that last updated';
COMMENT ON COLUMN reader_sync.data IS 'JSON: books, annotations, settings, readingStats';

-- ===================
-- Verification Query
-- ===================

-- Run this to verify setup:
SELECT 
  tablename,
  (SELECT COUNT(*) FROM reader_sync) as row_count,
  pg_size_pretty(pg_relation_size('reader_sync')) as table_size
FROM pg_tables 
WHERE tablename = 'reader_sync';

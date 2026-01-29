-- Metrics History Tables for onde.surf
-- Tracks historical data points for trend monitoring

-- Main metrics table - stores individual data points
CREATE TABLE IF NOT EXISTS metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_key TEXT NOT NULL,           -- e.g., 'books_published', 'x_followers', 'ga_pageviews'
  metric_value REAL NOT NULL,         -- The numeric value
  metric_date DATE NOT NULL,          -- Date of the metric (YYYY-MM-DD)
  source TEXT,                        -- e.g., 'manual', 'ga4', 'kdp', 'twitter_api'
  metadata TEXT,                      -- JSON metadata for extra context
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Only one value per metric per day
  UNIQUE(metric_key, metric_date)
);

-- Metric definitions - describes what each metric is
CREATE TABLE IF NOT EXISTS metric_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_key TEXT UNIQUE NOT NULL,    -- e.g., 'books_published'
  display_name TEXT NOT NULL,         -- e.g., 'Books Published'
  category TEXT NOT NULL,             -- e.g., 'publishing', 'social', 'revenue', 'analytics'
  unit TEXT,                          -- e.g., 'count', 'percent', 'usd', 'views'
  description TEXT,
  is_cumulative INTEGER DEFAULT 1,    -- 1 = running total, 0 = point-in-time
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Google Analytics credentials/config (stored securely)
CREATE TABLE IF NOT EXISTS analytics_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,             -- 'ga4', 'search_console', etc.
  property_id TEXT,                   -- e.g., GA4 property ID
  config_json TEXT,                   -- Encrypted/encoded config
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_metrics_key ON metrics(metric_key);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_metrics_key_date ON metrics(metric_key, metric_date);

-- Insert default metric definitions
INSERT OR IGNORE INTO metric_definitions (metric_key, display_name, category, unit, description, is_cumulative) VALUES
  ('books_published', 'Books Published', 'publishing', 'count', 'Total books published on KDP and other platforms', 1),
  ('audiobooks_published', 'Audiobooks', 'publishing', 'count', 'Total audiobooks published', 1),
  ('podcasts_published', 'Podcasts', 'publishing', 'count', 'Total podcast episodes published', 1),
  ('videos_published', 'Videos', 'publishing', 'count', 'Total videos published on YouTube', 1),
  
  ('x_followers', 'X Followers', 'social', 'count', 'Twitter/X follower count', 1),
  ('ig_followers', 'Instagram Followers', 'social', 'count', 'Instagram follower count', 1),
  ('tiktok_followers', 'TikTok Followers', 'social', 'count', 'TikTok follower count', 1),
  ('youtube_subscribers', 'YouTube Subscribers', 'social', 'count', 'YouTube subscriber count', 1),
  ('posts_published', 'Posts This Week', 'social', 'count', 'Social media posts this week', 0),
  
  ('kdp_earnings', 'KDP Earnings', 'revenue', 'usd', 'Amazon KDP royalty earnings', 1),
  ('spotify_streams', 'Spotify Streams', 'revenue', 'count', 'Total Spotify plays', 1),
  ('youtube_views', 'YouTube Views', 'revenue', 'count', 'Total YouTube video views', 1),
  
  ('ga_pageviews', 'Pageviews', 'analytics', 'count', 'Daily pageviews from Google Analytics', 0),
  ('ga_users', 'Unique Users', 'analytics', 'count', 'Daily unique users from Google Analytics', 0),
  ('ga_sessions', 'Sessions', 'analytics', 'count', 'Daily sessions from Google Analytics', 0),
  ('ga_bounce_rate', 'Bounce Rate', 'analytics', 'percent', 'Bounce rate from Google Analytics', 0),
  ('ga_avg_session_duration', 'Avg Session Duration', 'analytics', 'seconds', 'Average session duration', 0),
  
  ('gsc_clicks', 'Search Clicks', 'analytics', 'count', 'Google Search Console clicks', 0),
  ('gsc_impressions', 'Search Impressions', 'analytics', 'count', 'Google Search Console impressions', 0),
  ('gsc_ctr', 'Search CTR', 'analytics', 'percent', 'Click-through rate from search', 0),
  ('gsc_avg_position', 'Avg Search Position', 'analytics', 'number', 'Average position in search results', 0),
  
  ('tasks_completed', 'Tasks Completed', 'operations', 'count', 'Total tasks completed', 1),
  ('tasks_in_progress', 'Tasks In Progress', 'operations', 'count', 'Current tasks in progress', 0),
  ('active_agents', 'Active Agents', 'operations', 'count', 'Number of active AI agents', 0);

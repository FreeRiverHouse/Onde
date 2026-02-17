#!/bin/bash
# Check OHLC cache freshness - alert if stale >24h
# Cron: 0 */6 * * * /Users/mattia/Projects/Onde/scripts/check-ohlc-cache.sh

CACHE_DIR="/Users/mattia/Projects/Onde/data/ohlc"
ALERT_FILE="/Users/mattia/Projects/Onde/scripts/ohlc-cache-stale.alert"
MAX_AGE_HOURS=24

# Check if cache directory exists
if [ ! -d "$CACHE_DIR" ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') ⚠️ OHLC cache directory not found: $CACHE_DIR"
    exit 1
fi

# Find newest cache file (macOS compatible)
NEWEST=$(ls -t "$CACHE_DIR"/*.json 2>/dev/null | head -1)

if [ -z "$NEWEST" ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') ⚠️ No OHLC cache files found"
    if [ ! -f "$ALERT_FILE" ]; then
        echo "{\"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\", \"reason\": \"no_cache_files\", \"cache_dir\": \"$CACHE_DIR\"}" > "$ALERT_FILE"
    fi
    exit 1
fi

# Check age
FILE_AGE_SEC=$(( $(date +%s) - $(stat -f %m "$NEWEST" 2>/dev/null || stat -c %Y "$NEWEST" 2>/dev/null) ))
FILE_AGE_HOURS=$((FILE_AGE_SEC / 3600))

echo "$(date '+%Y-%m-%d %H:%M:%S') OHLC cache newest: $NEWEST (${FILE_AGE_HOURS}h old)"

if [ $FILE_AGE_HOURS -gt $MAX_AGE_HOURS ]; then
    echo "⚠️ OHLC cache is STALE (>${MAX_AGE_HOURS}h)"
    
    # Only create alert if doesn't exist (avoid spam)
    if [ ! -f "$ALERT_FILE" ]; then
        cat > "$ALERT_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "reason": "cache_stale",
  "newest_file": "$NEWEST",
  "age_hours": $FILE_AGE_HOURS,
  "max_age_hours": $MAX_AGE_HOURS,
  "action": "Run: python3 scripts/cache-ohlc-data.py"
}
EOF
        echo "Alert created: $ALERT_FILE"
    fi
    exit 1
else
    echo "✅ OHLC cache is fresh"
    # Remove old alert if exists
    [ -f "$ALERT_FILE" ] && rm "$ALERT_FILE" && echo "Cleared stale alert"
    exit 0
fi

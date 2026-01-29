#!/bin/bash
# Check OHLC cache freshness (T382)
# Alert if data/ohlc/*.json files are >24h old
# Cron: Run every 6 hours

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OHLC_DIR="$PROJECT_DIR/data/ohlc"
ALERT_FILE="$SCRIPT_DIR/ohlc-cache-stale.alert"
MAX_AGE_HOURS=24

# Skip if alert already exists (avoid spam)
if [ -f "$ALERT_FILE" ]; then
    # Check if alert is >6h old, delete if so (allow re-alert)
    ALERT_AGE=$(( ( $(date +%s) - $(stat -f %m "$ALERT_FILE" 2>/dev/null || echo 0) ) / 3600 ))
    if [ "$ALERT_AGE" -lt 6 ]; then
        exit 0  # Alert still active, skip
    fi
    rm -f "$ALERT_FILE"
fi

# Check each cache file
STALE_FILES=""
for file in "$OHLC_DIR"/btc-ohlc.json "$OHLC_DIR"/eth-ohlc.json; do
    if [ ! -f "$file" ]; then
        STALE_FILES="$STALE_FILES $(basename "$file") (missing)"
        continue
    fi
    
    # Get file modification time
    FILE_AGE_HOURS=$(( ( $(date +%s) - $(stat -f %m "$file") ) / 3600 ))
    
    if [ "$FILE_AGE_HOURS" -gt "$MAX_AGE_HOURS" ]; then
        STALE_FILES="$STALE_FILES $(basename "$file") (${FILE_AGE_HOURS}h old)"
    fi
done

# Create alert if any files are stale
if [ -n "$STALE_FILES" ]; then
    cat > "$ALERT_FILE" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "type": "ohlc_cache_stale",
  "stale_files": "$STALE_FILES",
  "max_age_hours": $MAX_AGE_HOURS,
  "message": "⚠️ OHLC cache stale! Files: $STALE_FILES. Check cron job: scripts/cache-ohlc-data.py"
}
EOF
    echo "[$(date)] ALERT: OHLC cache stale -$STALE_FILES"
    exit 1
fi

echo "[$(date)] OK: OHLC cache fresh"
exit 0

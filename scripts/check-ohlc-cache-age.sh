#!/bin/bash
# Check if OHLC cache files are stale (>24h old)
# Creates alert file for heartbeat pickup if cron isn't updating

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATA_DIR="$SCRIPT_DIR/../data/ohlc"
ALERT_FILE="$SCRIPT_DIR/ohlc-cache-stale.alert"
MAX_AGE_HOURS=24

# Check if data directory exists
if [ ! -d "$DATA_DIR" ]; then
    echo "OHLC data directory not found: $DATA_DIR"
    echo "{\"error\": \"OHLC data directory missing\", \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > "$ALERT_FILE"
    exit 1
fi

# Check BTC and ETH cache files
stale_files=""
for asset in btc eth; do
    cache_file="$DATA_DIR/${asset}-ohlc.json"
    if [ -f "$cache_file" ]; then
        # Get file age in hours
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            file_mtime=$(stat -f %m "$cache_file")
        else
            # Linux
            file_mtime=$(stat -c %Y "$cache_file")
        fi
        now=$(date +%s)
        age_hours=$(( (now - file_mtime) / 3600 ))
        
        if [ $age_hours -gt $MAX_AGE_HOURS ]; then
            asset_upper=$(echo "$asset" | tr '[:lower:]' '[:upper:]')
            stale_files="$stale_files ${asset_upper}(${age_hours}h old)"
        fi
    else
        asset_upper=$(echo "$asset" | tr '[:lower:]' '[:upper:]')
        stale_files="$stale_files ${asset_upper}(missing)"
    fi
done

# If any files are stale, create alert
if [ -n "$stale_files" ]; then
    echo "⚠️ OHLC cache stale:$stale_files"
    cat > "$ALERT_FILE" << EOF
{
  "alert": "OHLC cache stale",
  "files": "$stale_files",
  "max_age_hours": $MAX_AGE_HOURS,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "message": "🚨 OHLC cache is stale! Files:$stale_files. cache-ohlc-data.py cron may have failed. Momentum calculations affected!"
}
EOF
    exit 1
else
    echo "✅ OHLC cache is fresh (< ${MAX_AGE_HOURS}h old)"
    # Remove any existing alert if cache is now fresh
    [ -f "$ALERT_FILE" ] && rm "$ALERT_FILE"
    exit 0
fi

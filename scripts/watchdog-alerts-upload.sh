#!/bin/bash
# Watchdog for upload-alerts-to-gist.py cron job
# Creates alert file if upload hasn't run in >2h
# Cron: */30 * * * * /Users/mattia/Projects/Onde/scripts/watchdog-alerts-upload.sh

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ALERT_FILE="$PROJECT_ROOT/scripts/alerts-upload-stale.alert"
GIST_ID="43b0815cc640bba8ac799ecb27434579"
GIST_FILE="onde-trading-stats.json"
GIST_URL="https://gist.githubusercontent.com/FreeRiverHouse/${GIST_ID}/raw/${GIST_FILE}"
MAX_AGE_MINUTES=120  # 2 hours
COOLDOWN_FILE="/tmp/alerts-upload-watchdog-cooldown"
COOLDOWN_MINUTES=120

# Check cooldown
if [[ -f "$COOLDOWN_FILE" ]]; then
    cooldown_age=$(( ($(date +%s) - $(stat -f %m "$COOLDOWN_FILE" 2>/dev/null || echo 0)) / 60 ))
    if [[ $cooldown_age -lt $COOLDOWN_MINUTES ]]; then
        exit 0
    fi
fi

# Fetch Gist and check alerts.generated_at timestamp
echo "$(date '+%Y-%m-%d %H:%M:%S') Checking alerts upload status..."

# Use gh CLI to avoid GitHub's raw file cache (can be up to 5 min stale)
response=$(gh gist view "$GIST_ID" -f "$GIST_FILE" --raw 2>/dev/null || curl -s --max-time 30 "$GIST_URL" 2>/dev/null || echo '{}')

# Extract generated_at from alerts section
generated_at=$(echo "$response" | python3 -c "
import sys, json
from datetime import datetime, timezone
try:
    data = json.load(sys.stdin)
    ts = data.get('alerts', {}).get('generated_at')
    if ts:
        # Parse ISO timestamp
        dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
        # Calculate age in minutes
        now = datetime.now(timezone.utc)
        age_minutes = (now - dt).total_seconds() / 60
        print(int(age_minutes))
    else:
        print(-1)
except:
    print(-1)
" 2>/dev/null || echo "-1")

if [[ "$generated_at" == "-1" ]]; then
    echo "⚠️ Could not parse alerts timestamp from Gist"
    # Check if we have any alert files to upload
    alert_count=$(find "$PROJECT_ROOT/data/finetuning" -name "*.jsonl" -mmin -$MAX_AGE_MINUTES 2>/dev/null | wc -l | tr -d ' ')
    if [[ "$alert_count" -gt 0 ]]; then
        echo "Found $alert_count recent alert files but Gist not updated!"
        cat > "$ALERT_FILE" << EOF
⚠️ ALERTS UPLOAD STALE

The upload-alerts-to-gist.py cron job hasn't updated the Gist.
Timestamp could not be parsed from Gist response.

There are $alert_count recent alert files waiting to be uploaded.

Check:
1. Is the cron job running? crontab -l | grep upload-alerts
2. Is gh CLI authenticated? gh auth status
3. Manual run: python3 scripts/upload-alerts-to-gist.py

Time: $(date '+%Y-%m-%d %H:%M:%S %Z')
EOF
        touch "$COOLDOWN_FILE"
        echo "🚨 Created alert: $ALERT_FILE"
    fi
elif [[ "$generated_at" -gt "$MAX_AGE_MINUTES" ]]; then
    echo "⚠️ Alerts last uploaded ${generated_at}m ago (max: ${MAX_AGE_MINUTES}m)"
    cat > "$ALERT_FILE" << EOF
⚠️ ALERTS UPLOAD STALE

The upload-alerts-to-gist.py cron job is stale!
Last update: ${generated_at} minutes ago
Expected: Within ${MAX_AGE_MINUTES} minutes

Check:
1. Is the cron job running? crontab -l | grep upload-alerts
2. Is gh CLI authenticated? gh auth status
3. Manual run: python3 scripts/upload-alerts-to-gist.py

Time: $(date '+%Y-%m-%d %H:%M:%S %Z')
EOF
    touch "$COOLDOWN_FILE"
    echo "🚨 Created alert: $ALERT_FILE"
else
    echo "✅ Alerts upload healthy (last update: ${generated_at}m ago)"
    # Remove alert file if exists
    rm -f "$ALERT_FILE"
fi

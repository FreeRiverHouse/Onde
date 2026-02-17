#!/bin/bash
# Record a webhook alert to history for dashboard display
# Usage: record-webhook-alert.sh <type> <status> <message>
# Called by health-webhook-notifier.sh when alerts are sent

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HISTORY_FILE="$PROJECT_ROOT/data/alerts/webhook-history.json"

TYPE="${1:-critical}"
STATUS="${2:-unknown}"
MESSAGE="${3:-No message}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Create directory if needed
mkdir -p "$(dirname "$HISTORY_FILE")"

# Initialize history file if needed
if [ ! -f "$HISTORY_FILE" ]; then
    echo '{"generated_at":"'$TIMESTAMP'","alerts":[]}' > "$HISTORY_FILE"
fi

# Add new alert using jq
if command -v jq &> /dev/null; then
    NEW_ALERT=$(jq -n \
        --arg ts "$TIMESTAMP" \
        --arg type "$TYPE" \
        --arg status "$STATUS" \
        --arg msg "$MESSAGE" \
        '{timestamp: $ts, type: $type, status: $status, message: $msg, resolved: false}'
    )
    
    # Add to history, keep last 100 alerts
    jq --argjson alert "$NEW_ALERT" '
        .generated_at = now | todate |
        .alerts = ([$alert] + .alerts) | .alerts = .alerts[:100]
    ' "$HISTORY_FILE" > "$HISTORY_FILE.tmp" && mv "$HISTORY_FILE.tmp" "$HISTORY_FILE"
    
    echo "Recorded webhook alert: $TYPE - $STATUS"
else
    echo "Warning: jq not installed, cannot record alert"
fi

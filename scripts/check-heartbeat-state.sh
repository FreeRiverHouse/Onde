#!/bin/bash
# Check if heartbeat is recent (within last 15 minutes)
# Exit 0 if healthy, 1 if stale, 2 if missing

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STATE_FILE="$SCRIPT_DIR/../memory/heartbeat-state.json"
MAX_AGE_MINUTES=15

if [[ ! -f "$STATE_FILE" ]]; then
    echo "❌ Heartbeat state file missing"
    exit 2
fi

# Get last heartbeat epoch
LAST_EPOCH=$(cat "$STATE_FILE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('lastHeartbeatEpoch',0))" 2>/dev/null || echo "0")
NOW_EPOCH=$(date +%s)
AGE_SECONDS=$((NOW_EPOCH - LAST_EPOCH))
AGE_MINUTES=$((AGE_SECONDS / 60))

# Get human-readable time
LAST_TIME=$(cat "$STATE_FILE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('lastHeartbeat','unknown'))" 2>/dev/null)

if [[ $AGE_SECONDS -lt $((MAX_AGE_MINUTES * 60)) ]]; then
    echo "✅ Heartbeat healthy (${AGE_MINUTES}m ago at $LAST_TIME)"
    exit 0
else
    echo "⚠️ Heartbeat stale (${AGE_MINUTES}m ago at $LAST_TIME)"
    exit 1
fi

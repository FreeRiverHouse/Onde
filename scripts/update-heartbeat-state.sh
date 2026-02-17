#!/bin/bash
# Updates heartbeat state file with current timestamp
# Called at the start of each heartbeat cycle

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STATE_FILE="$SCRIPT_DIR/../memory/heartbeat-state.json"

# Create memory dir if needed
mkdir -p "$(dirname "$STATE_FILE")"

# Get current timestamp
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
NOW_EPOCH=$(date +%s)

# Read existing state or create new
if [[ -f "$STATE_FILE" ]]; then
    LAST_CHECKS=$(cat "$STATE_FILE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d.get('lastChecks',{})))" 2>/dev/null || echo "{}")
else
    LAST_CHECKS="{}"
fi

# Update state
cat > "$STATE_FILE" << EOF
{
  "lastHeartbeat": "$NOW",
  "lastHeartbeatEpoch": $NOW_EPOCH,
  "host": "$(hostname)",
  "lastChecks": $LAST_CHECKS
}
EOF

echo "Heartbeat state updated: $NOW"

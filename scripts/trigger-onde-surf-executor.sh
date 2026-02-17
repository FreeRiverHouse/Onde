#!/bin/bash
# Trigger onde.surf agent executor to process pending tasks
# Cron: */5 * * * * /Users/mattia/Projects/Onde/scripts/trigger-onde-surf-executor.sh

SCRIPT_DIR="$(dirname "$0")"
LOG_FILE="$SCRIPT_DIR/onde-surf-executor.log"

# Get executor secret from env or use default
EXECUTOR_SECRET="${AGENT_EXECUTOR_SECRET:-onde-agent-secret}"

# Trigger the executor
response=$(curl -sS -X POST "https://onde.surf/api/agent-executor" \
  -H "Authorization: Bearer $EXECUTOR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"maxTasks": 5}' \
  --max-time 120 2>&1)

exit_code=$?
timestamp=$(date '+%Y-%m-%d %H:%M:%S')

if [ $exit_code -eq 0 ]; then
  # Check if response indicates success
  processed=$(echo "$response" | grep -o '"processed":[0-9]*' | cut -d: -f2)
  if [ -n "$processed" ] && [ "$processed" -gt 0 ]; then
    echo "[$timestamp] Processed $processed tasks" >> "$LOG_FILE"
    echo "$response" | head -c 500 >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
  else
    echo "[$timestamp] No pending tasks" >> "$LOG_FILE"
  fi
else
  echo "[$timestamp] ERROR: curl exit code $exit_code" >> "$LOG_FILE"
  echo "$response" >> "$LOG_FILE"
  
  # Create alert if API is down
  if [ $exit_code -eq 28 ]; then  # timeout
    echo '{"error": "onde.surf agent-executor timeout", "timestamp": "'$timestamp'"}' > "$SCRIPT_DIR/onde-surf-executor.alert"
  fi
fi

# Keep log file manageable (last 1000 lines)
if [ -f "$LOG_FILE" ]; then
  tail -n 1000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
fi

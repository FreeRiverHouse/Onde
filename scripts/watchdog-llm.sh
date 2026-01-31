#!/bin/bash
# Watchdog per Local LLM (Ollama)
# - Checks if Ollama is responding
# - Tracks down duration
# - Creates alert if down >10 min
# - Logs latency history

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$SCRIPT_DIR/watchdog-llm.log"
ALERT_FILE="$SCRIPT_DIR/kalshi-llm-health.alert"
STATE_FILE="/tmp/llm-watchdog-state.json"
HEALTH_HISTORY="$PROJECT_DIR/data/llm-health-history.jsonl"
OLLAMA_URL="http://localhost:11434"
DOWN_THRESHOLD_SEC=600  # 10 minutes

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Check if Ollama is responding
check_health() {
    local start_ms=$(python3 -c "import time; print(int(time.time()*1000))")
    local response=$(curl -s -w "%{http_code}" --connect-timeout 5 -o /tmp/ollama-tags.json "$OLLAMA_URL/api/tags" 2>/dev/null)
    local end_ms=$(python3 -c "import time; print(int(time.time()*1000))")
    local latency_ms=$((end_ms - start_ms))
    
    if [ "$response" = "200" ]; then
        local model_count=$(jq '.models | length' /tmp/ollama-tags.json 2>/dev/null || echo 0)
        echo "{\"healthy\":true,\"latency_ms\":$latency_ms,\"models\":$model_count}"
    else
        echo "{\"healthy\":false,\"latency_ms\":null,\"error\":\"HTTP $response\"}"
    fi
}

# Load state
load_state() {
    if [ -f "$STATE_FILE" ]; then
        DOWN_SINCE=$(jq -r '.down_since // 0' "$STATE_FILE")
        ALERT_SENT=$(jq -r '.alert_sent // false' "$STATE_FILE")
    else
        DOWN_SINCE=0
        ALERT_SENT=false
    fi
}

# Save state
save_state() {
    cat > "$STATE_FILE" << EOF
{
    "down_since": $DOWN_SINCE,
    "alert_sent": $ALERT_SENT,
    "last_check": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
}

# Main
load_state
NOW=$(date +%s)
HEALTH=$(check_health)
IS_HEALTHY=$(echo "$HEALTH" | jq -r '.healthy')
LATENCY=$(echo "$HEALTH" | jq -r '.latency_ms // "null"')

# Log to history
mkdir -p "$(dirname "$HEALTH_HISTORY")"
echo "{\"ts\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",\"healthy\":$IS_HEALTHY,\"latency_ms\":$LATENCY}" >> "$HEALTH_HISTORY"

if [ "$IS_HEALTHY" = "true" ]; then
    # Healthy - reset state
    if [ "$DOWN_SINCE" -gt 0 ]; then
        log "LLM recovered after $(( (NOW - DOWN_SINCE) / 60 )) minutes"
        rm -f "$ALERT_FILE"
    fi
    DOWN_SINCE=0
    ALERT_SENT=false
    log "LLM healthy, latency: ${LATENCY}ms"
else
    # Down - track duration
    if [ "$DOWN_SINCE" -eq 0 ]; then
        DOWN_SINCE=$NOW
        log "LLM went down"
    fi
    
    DOWN_DURATION=$((NOW - DOWN_SINCE))
    log "LLM down for ${DOWN_DURATION}s"
    
    # Alert if down >10 min and not already alerted
    if [ "$DOWN_DURATION" -ge "$DOWN_THRESHOLD_SEC" ] && [ "$ALERT_SENT" = "false" ]; then
        log "Creating LLM health alert - down >10 min"
        cat > "$ALERT_FILE" << EOF
🤖 Local LLM (Ollama) Alert

Status: DOWN
Duration: $((DOWN_DURATION / 60)) minutes
Time: $(date)

The local LLM service (Ollama) has been unresponsive for >10 minutes.

To fix:
1. Check if Ollama is running: pgrep -f ollama
2. Restart: launchctl unload ~/Library/LaunchAgents/com.ollama.server.plist && launchctl load ~/Library/LaunchAgents/com.ollama.server.plist
3. Check logs: tail /tmp/ollama-stderr.log
EOF
        ALERT_SENT=true
    fi
fi

save_state

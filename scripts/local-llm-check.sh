#!/bin/bash
# Local LLM Health Check + Alert
# Usage: source this script or call check_local_llm

LLM_HOST="${LLM_HOST:-192.168.1.111}"
LLM_PORT="${LLM_PORT:-8080}"
LLM_URL="http://${LLM_HOST}:${LLM_PORT}"
ALERT_FILE="/tmp/llm-down-alert-sent"

check_local_llm() {
    local response
    response=$(curl -s --connect-timeout 3 --max-time 5 "${LLM_URL}/health" 2>/dev/null)
    
    if echo "$response" | grep -q '"status".*"ok"'; then
        # LLM is up - clear alert flag
        rm -f "$ALERT_FILE" 2>/dev/null
        echo "up"
        return 0
    else
        echo "down"
        return 1
    fi
}

get_local_llm_model() {
    curl -s --connect-timeout 3 "${LLM_URL}/v1/models" 2>/dev/null | \
        grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | \
        sed 's/"id"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/'
}

local_llm_chat() {
    local prompt="$1"
    local max_tokens="${2:-256}"
    
    curl -s --connect-timeout 5 --max-time 60 \
        -X POST "${LLM_URL}/v1/chat/completions" \
        -H "Content-Type: application/json" \
        -d "{
            \"model\": \"llama-3.1-8b-instruct\",
            \"messages\": [{\"role\": \"user\", \"content\": \"$prompt\"}],
            \"max_tokens\": $max_tokens,
            \"temperature\": 0.7
        }" 2>/dev/null
}

send_llm_down_alert() {
    # Only alert once per hour
    if [ -f "$ALERT_FILE" ]; then
        local age=$(($(date +%s) - $(stat -f %m "$ALERT_FILE" 2>/dev/null || echo 0)))
        if [ "$age" -lt 3600 ]; then
            return 0  # Already alerted recently
        fi
    fi
    
    touch "$ALERT_FILE"
    echo "🚨 LLM Server DOWN at ${LLM_URL}"
    # This will be picked up by heartbeat
}

# If run directly, do a quick check
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
    status=$(check_local_llm)
    if [ "$status" = "up" ]; then
        model=$(get_local_llm_model)
        echo "✅ Local LLM UP: ${LLM_URL}"
        echo "   Model: ${model:-unknown}"
    else
        echo "❌ Local LLM DOWN: ${LLM_URL}"
        send_llm_down_alert
        exit 1
    fi
fi

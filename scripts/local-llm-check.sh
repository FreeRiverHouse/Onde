#!/bin/bash
# Local LLM Health Check + Alert
# Usage: source this script or call check_local_llm

LLM_HOST="${LLM_HOST:-192.168.1.111}"
LLM_API_PORT="${LLM_API_PORT:-11434}"  # Ollama API
LLM_GUI_PORT="${LLM_GUI_PORT:-8080}"   # Web GUI
LLM_API_URL="http://${LLM_HOST}:${LLM_API_PORT}"
LLM_GUI_URL="http://${LLM_HOST}:${LLM_GUI_PORT}"
ALERT_FILE="/tmp/llm-down-alert-sent"

# Available models (fastest first)
FAST_MODEL="llama3.2:3b"        # 2-3 sec
CODING_MODEL="deepseek-coder:6.7b"  # 1-3 min
ALT_MODEL="qwen2.5-coder:7b"    # 1-3 min

check_local_llm() {
    local response
    # Check Ollama API
    response=$(curl -s --connect-timeout 3 --max-time 5 "${LLM_API_URL}/api/tags" 2>/dev/null)
    
    if echo "$response" | grep -q '"models"'; then
        # LLM is up - clear alert flag
        rm -f "$ALERT_FILE" 2>/dev/null
        echo "up"
        return 0
    else
        echo "down"
        return 1
    fi
}

get_local_llm_models() {
    curl -s --connect-timeout 3 "${LLM_API_URL}/api/tags" 2>/dev/null | \
        jq -r '.models[].name' 2>/dev/null
}

local_llm_chat() {
    local prompt="$1"
    local model="${2:-$FAST_MODEL}"
    
    curl -s --connect-timeout 5 --max-time 120 \
        -X POST "${LLM_API_URL}/api/generate" \
        -H "Content-Type: application/json" \
        -d "{
            \"model\": \"$model\",
            \"prompt\": \"$prompt\",
            \"stream\": false
        }" 2>/dev/null | jq -r '.response' 2>/dev/null
}

# Quick chat with fast model (2-3 sec)
local_llm_fast() {
    local_llm_chat "$1" "$FAST_MODEL"
}

# Coding with DeepSeek (1-3 min)
local_llm_code() {
    local_llm_chat "$1" "$CODING_MODEL"
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
        echo "✅ Local LLM UP"
        echo "   API: ${LLM_API_URL}"
        echo "   GUI: ${LLM_GUI_URL}"
        echo "   Models:"
        get_local_llm_models | while read -r m; do echo "     - $m"; done
    else
        echo "❌ Local LLM DOWN: ${LLM_API_URL}"
        send_llm_down_alert
        exit 1
    fi
fi

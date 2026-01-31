#!/bin/bash
# agent-dashboard-data.sh - Genera JSON con stato agenti
# DA MATTIA (ID:2972) - DASHBOARD CON DATI VERI!
#
# Output: JSON con stato Clawdinho, Ondinho, task, GPU, etc.
# Uso: ./agent-dashboard-data.sh > /tmp/agent-dashboard.json
#      Oppure via API endpoint

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TODAY=$(date +%Y-%m-%d)

# Funzioni helper
get_last_commit_by_author() {
    local author="$1"
    cd "$PROJECT_DIR"
    git log --author="$author" -1 --format='{"hash":"%h","message":"%s","date":"%ci","ago":"%ar"}' 2>/dev/null || echo '{}'
}

get_task_stats() {
    cd "$PROJECT_DIR"
    local tasks_file="$PROJECT_DIR/TASKS.md"
    
    if [[ ! -f "$tasks_file" ]]; then
        echo '{"total":0,"done":0,"in_progress":0,"todo":0}'
        return
    fi
    
    local done=$(grep -c "Status.*DONE" "$tasks_file" 2>/dev/null || echo "0")
    local in_progress=$(grep -c "Status.*IN_PROGRESS" "$tasks_file" 2>/dev/null || echo "0")
    local todo=$(grep -c "Status.*TODO" "$tasks_file" 2>/dev/null || echo "0")
    local total=$((done + in_progress + todo))
    
    echo "{\"total\":$total,\"done\":$done,\"in_progress\":$in_progress,\"todo\":$todo}"
}

get_memory_stats() {
    local memory_file="$PROJECT_DIR/memory/$TODAY.md"
    
    if [[ ! -f "$memory_file" ]]; then
        echo '{"entries_today":0,"file_exists":false}'
        return
    fi
    
    local entries=$(grep -c "^## " "$memory_file" 2>/dev/null || echo "0")
    local size=$(wc -c < "$memory_file" 2>/dev/null | tr -d ' ')
    
    echo "{\"entries_today\":$entries,\"file_exists\":true,\"size_bytes\":$size}"
}

get_gpu_status() {
    # Controlla stato GPU Radeon (se disponibile)
    local radeon_status="unknown"
    local radeon_temp="N/A"
    
    # Check se eGPU connessa
    if system_profiler SPThunderboltDataType 2>/dev/null | grep -q "Core X V2"; then
        radeon_status="connected"
        # Prova a leggere temperatura
        radeon_temp=$(ioreg -r -n gpu0 2>/dev/null | grep -E "temperature" | head -1 | awk '{print $NF}' || echo "N/A")
    else
        radeon_status="disconnected"
    fi
    
    # CPU usage
    local cpu_usage=$(ps -A -o %cpu | awk '{s+=$1} END {print s}' 2>/dev/null || echo "0")
    
    # Memory usage  
    local mem_info=$(vm_stat 2>/dev/null | awk '/Pages active|Pages wired/ {gsub(/\./,"",$NF); s+=$NF} END {print s*4096/1024/1024/1024}')
    
    echo "{\"radeon_status\":\"$radeon_status\",\"radeon_temp\":\"$radeon_temp\",\"cpu_usage\":$cpu_usage,\"memory_gb\":$mem_info}"
}

get_ollama_status() {
    # Check Ollama (locale o su 192.168.1.111)
    local ollama_local="offline"
    local ollama_remote="offline"
    local models="[]"
    
    # Check locale
    if curl -s --connect-timeout 2 http://localhost:11434/api/tags >/dev/null 2>&1; then
        ollama_local="online"
    fi
    
    # Check remoto (Radeon box)
    if curl -s --connect-timeout 2 http://192.168.1.111:11434/api/tags >/dev/null 2>&1; then
        ollama_remote="online"
        models=$(curl -s http://192.168.1.111:11434/api/tags 2>/dev/null | jq -c '[.models[].name]' 2>/dev/null || echo '[]')
    fi
    
    echo "{\"local\":\"$ollama_local\",\"remote\":\"$ollama_remote\",\"models\":$models}"
}

get_autotrader_status() {
    local running="false"
    local pid=""
    
    if pgrep -f "kalshi-autotrader" >/dev/null 2>&1; then
        running="true"
        pid=$(pgrep -f "kalshi-autotrader" | head -1)
    fi
    
    echo "{\"running\":$running,\"pid\":\"$pid\"}"
}

get_alert_count() {
    local count=$(ls "$SCRIPT_DIR"/*.alert 2>/dev/null | wc -l | tr -d ' ')
    echo "$count"
}

# Main: genera JSON completo
main() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local alert_count=$(get_alert_count)
    
    cat << EOF
{
  "timestamp": "$timestamp",
  "agents": {
    "clawdinho": {
      "last_commit": $(get_last_commit_by_author "Clawdinho"),
      "status": "active",
      "host": "FRH-M1-PRO"
    },
    "ondinho": {
      "last_commit": $(get_last_commit_by_author "onde-bot"),
      "status": "unknown",
      "host": "M4-Pro"
    }
  },
  "tasks": $(get_task_stats),
  "memory": $(get_memory_stats),
  "hardware": {
    "gpu": $(get_gpu_status),
    "ollama": $(get_ollama_status)
  },
  "services": {
    "autotrader": $(get_autotrader_status)
  },
  "alerts": {
    "count": $alert_count,
    "files": $(ls -1 "$SCRIPT_DIR"/*.alert 2>/dev/null | jq -R -s 'split("\n") | map(select(. != ""))' 2>/dev/null || echo '[]')
  }
}
EOF
}

main "$@"

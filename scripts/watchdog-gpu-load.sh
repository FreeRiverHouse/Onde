#!/bin/bash
# watchdog-gpu-load.sh - Monitor CPU/GPU load e crea alert se critico
# Cron: */5 * * * * /Users/mattia/Projects/Onde/scripts/watchdog-gpu-load.sh
# ONDE-CRON: GPU-LOAD-WATCHDOG

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ALERT_FILE="$SCRIPT_DIR/gpu-load-critical.alert"
LOG_FILE="$SCRIPT_DIR/watchdog-gpu-load.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG_FILE"
}

# Usa gpu-status.py per check completo
OUTPUT=$(python3 "$SCRIPT_DIR/gpu-status.py" 2>/dev/null || echo '{"system":{"health_status":"error"}}')

# Estrai status
STATUS=$(echo "$OUTPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('system',{}).get('health_status','unknown'))" 2>/dev/null || echo "error")
CPU=$(echo "$OUTPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('system',{}).get('cpu_percent',0))" 2>/dev/null || echo "0")
MEM=$(echo "$OUTPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('system',{}).get('memory_percent',0))" 2>/dev/null || echo "0")

log "Status: $STATUS | CPU: ${CPU}% | MEM: ${MEM}%"

if [ "$STATUS" = "critical" ]; then
    log "CRITICAL! Creating alert..."
    cat > "$ALERT_FILE" << EOF
🚨 GPU/SYSTEM LOAD CRITICO!

**Status:** $STATUS
**CPU:** ${CPU}%
**Memory:** ${MEM}%

Il sistema è sotto stress. Agenti NON devono spawnare nuovi task.

Timestamp: $(date)
EOF
    exit 1
elif [ "$STATUS" = "warning" ]; then
    log "WARNING - sistema sotto stress ma operativo"
    # Remove alert if exists (recovered from critical)
    [ -f "$ALERT_FILE" ] && rm "$ALERT_FILE" && log "Alert cleared (recovered)"
else
    # Healthy - clear alert if exists
    [ -f "$ALERT_FILE" ] && rm "$ALERT_FILE" && log "Alert cleared"
fi

exit 0

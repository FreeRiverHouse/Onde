#!/bin/bash
# Watchdog per Kalshi Autotrader
# Controlla ogni esecuzione se il trader gira, se no lo riavvia

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TRADER_SCRIPT="$SCRIPT_DIR/kalshi-autotrader-v2.py"
LOG_FILE="$SCRIPT_DIR/watchdog.log"
PID_FILE="/tmp/kalshi-autotrader.pid"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check if trader is running
is_running() {
    if pgrep -f "kalshi-autotrader" > /dev/null 2>&1; then
        return 0
    fi
    return 1
}

# Start the trader
start_trader() {
    log "🚀 Starting Kalshi Autotrader..."
    cd "$SCRIPT_DIR"
    nohup python3 "$TRADER_SCRIPT" >> "$SCRIPT_DIR/autotrader.log" 2>&1 &
    local pid=$!
    echo $pid > "$PID_FILE"
    log "✅ Autotrader started with PID $pid"
}

# Main watchdog logic
main() {
    if is_running; then
        log "✅ Autotrader is running"
    else
        log "⚠️ Autotrader NOT running! Restarting..."
        start_trader
    fi
}

main

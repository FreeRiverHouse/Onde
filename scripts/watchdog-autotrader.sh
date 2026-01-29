#!/bin/bash
# Watchdog per Kalshi Autotrader
# Controlla ogni esecuzione se il trader gira, se no lo riavvia
# Manda alert Telegram se trova il trader crashato

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TRADER_SCRIPT="$SCRIPT_DIR/kalshi-autotrader-v2.py"
LOG_FILE="$SCRIPT_DIR/watchdog.log"
PID_FILE="/tmp/kalshi-autotrader.pid"
ALERT_FILE="$SCRIPT_DIR/kalshi-autotrader-crash.alert"
COOLDOWN_FILE="/tmp/kalshi-crash-alert-cooldown"
COOLDOWN_SECONDS=1800  # 30 min cooldown between crash alerts

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check if we should send alert (cooldown logic)
should_alert() {
    if [ ! -f "$COOLDOWN_FILE" ]; then
        return 0
    fi
    local last_alert=$(cat "$COOLDOWN_FILE")
    local now=$(date +%s)
    local diff=$((now - last_alert))
    if [ $diff -gt $COOLDOWN_SECONDS ]; then
        return 0
    fi
    return 1
}

# Send crash alert
send_crash_alert() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local message="🚨 AUTOTRADER CRASH DETECTED!

⏰ Time: $timestamp
🔄 Status: Restarting automatically...

Watchdog riavvierà il trader. Controlla i log se succede spesso."

    # Create alert file for heartbeat pickup
    echo "$message" > "$ALERT_FILE"
    
    # Update cooldown
    date +%s > "$COOLDOWN_FILE"
    
    log "📢 Crash alert created"
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
    nohup /opt/homebrew/bin/python3 -u "$TRADER_SCRIPT" >> "$SCRIPT_DIR/autotrader-v2.log" 2>&1 &
    local pid=$!
    echo $pid > "$PID_FILE"
    log "✅ Autotrader started with PID $pid"
}

# Main watchdog logic
main() {
    if is_running; then
        log "✅ Autotrader is running"
        # Remove stale alert if trader is running fine
        [ -f "$ALERT_FILE" ] && rm -f "$ALERT_FILE"
    else
        log "⚠️ Autotrader NOT running! Restarting..."
        
        # Send crash alert (with cooldown)
        if should_alert; then
            send_crash_alert
        else
            log "📢 Crash alert skipped (cooldown active)"
        fi
        
        start_trader
    fi
}

main

#!/bin/bash
# Watchdog per Telegram Bot Onde
# Controlla se il bot è attivo E se risponde (heartbeat)
# Se bloccato > 3 minuti, lo uccide e riavvia

BOT_SCRIPT="/Users/mattiapetrucciani/CascadeProjects/Onde/packages/telegram-bot/autonomous-bot.js"
LOG_FILE="/Users/mattiapetrucciani/CascadeProjects/Onde/logs/watchdog.log"
LOCK_FILE="/tmp/onde-bot.lock"
HEARTBEAT_FILE="/tmp/onde-bot.heartbeat"
MAX_STALE_SECONDS=180  # 3 minuti

mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Get PID from lock file
get_pid() {
    if [ -f "$LOCK_FILE" ]; then
        python3 -c "import json; print(json.load(open('$LOCK_FILE'))['pid'])" 2>/dev/null
    fi
}

# Check if process is running
is_running() {
    local pid=$(get_pid)
    if [ -n "$pid" ] && ps -p "$pid" > /dev/null 2>&1; then
        return 0
    fi
    # Fallback: search by script name
    pgrep -f "autonomous-bot.js" > /dev/null 2>&1
    return $?
}

# Check heartbeat staleness
is_heartbeat_stale() {
    if [ ! -f "$HEARTBEAT_FILE" ]; then
        return 0  # No heartbeat = stale
    fi

    local hb_time=$(python3 -c "
import json
from datetime import datetime
try:
    data = json.load(open('$HEARTBEAT_FILE'))
    hb = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
    now = datetime.now(hb.tzinfo)
    diff = (now - hb).total_seconds()
    print(int(diff))
except:
    print(9999)
" 2>/dev/null)

    if [ "$hb_time" -gt "$MAX_STALE_SECONDS" ]; then
        return 0  # Stale
    fi
    return 1  # Fresh
}

# Kill bot
kill_bot() {
    local pid=$(get_pid)
    if [ -n "$pid" ]; then
        log "Uccido bot (PID $pid)..."
        kill -9 "$pid" 2>/dev/null
        sleep 2
    fi
    # Cleanup
    rm -f "$LOCK_FILE" "$HEARTBEAT_FILE"
    # Kill any remaining
    pkill -9 -f "autonomous-bot.js" 2>/dev/null
}

# Start bot
start_bot() {
    log "Avvio bot..."
    cd /Users/mattiapetrucciani/CascadeProjects/Onde
    nohup /opt/homebrew/bin/node "$BOT_SCRIPT" >> /tmp/frh-onde-bot.log 2>&1 &
    sleep 3
    if is_running; then
        log "Bot avviato con PID $(get_pid)"
    else
        log "ERRORE: Bot non partito!"
    fi
}

# Main logic
if is_running; then
    if is_heartbeat_stale; then
        log "⚠️ Bot BLOCCATO (heartbeat stale > ${MAX_STALE_SECONDS}s)! Riavvio..."
        kill_bot
        start_bot
    else
        log "Bot attivo ✓"
    fi
else
    log "Bot NON attivo! Avvio..."
    rm -f "$LOCK_FILE" "$HEARTBEAT_FILE"
    start_bot
fi

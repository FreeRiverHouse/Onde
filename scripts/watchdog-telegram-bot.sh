#!/bin/bash
# Watchdog per Telegram Bot Onde
# Controlla se il bot è attivo, lo riavvia se morto

BOT_DIR="/Users/mattiapetrucciani/CascadeProjects/Onde/packages/telegram-bot"
LOG_FILE="/Users/mattiapetrucciani/CascadeProjects/Onde/logs/watchdog.log"
PID_FILE="/Users/mattiapetrucciani/CascadeProjects/Onde/logs/telegram-bot.pid"

mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Controlla se il processo è attivo
is_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            return 0
        fi
    fi
    # Cerca anche per nome
    pgrep -f "telegram-bot.*start" > /dev/null 2>&1
    return $?
}

# Avvia il bot
start_bot() {
    log "Avvio bot Telegram..."
    cd "$BOT_DIR"
    nohup npm start > /dev/null 2>&1 &
    echo $! > "$PID_FILE"
    log "Bot avviato con PID $(cat $PID_FILE)"
}

# Main
if is_running; then
    log "Bot attivo ✓"
else
    log "Bot NON attivo! Riavvio..."
    start_bot
fi

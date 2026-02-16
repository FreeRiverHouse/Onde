#!/bin/bash
# Watchdog: Clawdinho monitora Ondinho
# Controlla ultimo commit di Ondinho su git, se fermo >30min crea alert
# Ogni 2 ore: review task chiusi da Ondinho

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$SCRIPT_DIR/watchdog-ondinho.log"
ALERT_FILE="$SCRIPT_DIR/ondinho-stalled.alert"
ONDINHO_BOT_TOKEN="${ONDINHO_BOT_TOKEN:-$(grep ONDINHO_BOT_TOKEN "$PROJECT_DIR/.env.trading" 2>/dev/null | cut -d= -f2)}"
MATTIA_CHAT_ID="7505631979"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Check ultimo commit di Ondinho (commits con "ondinho" o dal M4)
cd "$PROJECT_DIR" || exit 1
git fetch origin main --quiet 2>/dev/null

# Cerca commit recenti (ultimi 30 min) - qualsiasi commit conta come attività
LAST_COMMIT_TIME=$(git log origin/main -1 --format="%ct" 2>/dev/null)
NOW=$(date +%s)
DIFF_MIN=$(( (NOW - LAST_COMMIT_TIME) / 60 ))

log "Check: ultimo commit $DIFF_MIN min fa"

if [ "$DIFF_MIN" -gt 30 ]; then
    log "⚠️ Nessun commit da $DIFF_MIN minuti!"
    
    # Crea alert file per Clawdinho heartbeat
    echo "Ondinho non ha committato da $DIFF_MIN minuti. Ultimo commit: $(git log origin/main -1 --format='%s (%ar)')" > "$ALERT_FILE"
    
    log "Alert file creato: $ALERT_FILE"
else
    log "✅ Attività recente ($DIFF_MIN min fa)"
    # Rimuovi alert se esiste
    [ -f "$ALERT_FILE" ] && rm "$ALERT_FILE" && log "Alert rimosso"
fi

# Mantieni log compatto (ultime 200 righe)
if [ -f "$LOG_FILE" ] && [ "$(wc -l < "$LOG_FILE")" -gt 200 ]; then
    tail -100 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
fi

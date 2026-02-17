#!/bin/bash
# watchdog-telegram-logs.sh - Verifica che messaggi Telegram siano loggati
# DA MATTIA (ID:2972) - AUTOMAZIONE TOTALE!
#
# Controlla:
# 1. Ultimi messaggi ricevuti (da Clawdbot logs)
# 2. Verifica presenza in memory/YYYY-MM-DD.md
# 3. Crea alert se mancanti
#
# Cron: */10 * * * * /Users/mattia/Projects/Onde/scripts/watchdog-telegram-logs.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TODAY=$(date +%Y-%m-%d)
MEMORY_FILE="$PROJECT_DIR/memory/$TODAY.md"
ALERT_FILE="$SCRIPT_DIR/telegram-not-logged.alert"

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "[$(date '+%H:%M:%S')] $1"
}

# 1. Leggi ultimi message IDs da Clawdbot history (ultimi 30 minuti)
# Cerca nei log di Clawdbot per messaggi Telegram recenti
get_recent_telegram_messages() {
    # Prova a leggere dalla history di Clawdbot
    local clawdbot_logs="$HOME/.clawdbot/logs"
    local messages=()
    
    # Cerca pattern "message_id: XXXX" nei log recenti
    if [[ -d "$clawdbot_logs" ]]; then
        # Trova log files modificati negli ultimi 30 minuti
        find "$clawdbot_logs" -name "*.log" -mmin -30 -exec grep -h "message_id:" {} \; 2>/dev/null | \
            grep -oE 'message_id: [0-9]+' | \
            sed 's/message_id: //' | \
            sort -u | \
            tail -10
    fi
}

# 2. Verifica che il message ID sia presente nel file memory
check_message_logged() {
    local msg_id="$1"
    
    if [[ ! -f "$MEMORY_FILE" ]]; then
        return 1
    fi
    
    # Cerca "ID: $msg_id" o "id:$msg_id" nel file memory
    if grep -qE "(ID:|id:|message_id:)\s*$msg_id" "$MEMORY_FILE" 2>/dev/null; then
        return 0
    fi
    
    return 1
}

# 3. Controlla anche che ci siano entry oggi
check_daily_entries() {
    if [[ ! -f "$MEMORY_FILE" ]]; then
        log "${YELLOW}⚠️ File memory di oggi non esiste: $MEMORY_FILE${NC}"
        return 1
    fi
    
    # Conta entry di oggi (cerca "## " che indica sezioni)
    local entry_count=$(grep -c "^## " "$MEMORY_FILE" 2>/dev/null || echo "0")
    
    if [[ "$entry_count" -eq 0 ]]; then
        log "${RED}❌ Nessuna entry in memory oggi!${NC}"
        return 1
    fi
    
    log "${GREEN}✅ $entry_count entries in memory oggi${NC}"
    return 0
}

# 4. Verifica ultimo commit con memory/
check_memory_commit_recency() {
    cd "$PROJECT_DIR"
    
    # Ultimo commit che tocca memory/
    local last_memory_commit=$(git log -1 --format="%ar" -- "memory/" 2>/dev/null || echo "never")
    local last_memory_timestamp=$(git log -1 --format="%ct" -- "memory/" 2>/dev/null || echo "0")
    local now=$(date +%s)
    local diff=$((now - last_memory_timestamp))
    
    # Se più di 2 ore senza commit memory → warning
    if [[ "$diff" -gt 7200 ]]; then
        log "${YELLOW}⚠️ Ultimo commit memory: $last_memory_commit (>2h fa)${NC}"
        return 1
    fi
    
    log "${GREEN}✅ Ultimo commit memory: $last_memory_commit${NC}"
    return 0
}

# 5. Verifica che TASKS.md sia stato aggiornato recentemente
check_tasks_recency() {
    cd "$PROJECT_DIR"
    
    local last_tasks_commit=$(git log -1 --format="%ar" -- "TASKS.md" 2>/dev/null || echo "never")
    local last_tasks_timestamp=$(git log -1 --format="%ct" -- "TASKS.md" 2>/dev/null || echo "0")
    local now=$(date +%s)
    local diff=$((now - last_tasks_timestamp))
    
    # Se più di 4 ore senza aggiornare TASKS → warning
    if [[ "$diff" -gt 14400 ]]; then
        log "${YELLOW}⚠️ Ultimo commit TASKS.md: $last_tasks_commit (>4h fa)${NC}"
        return 1
    fi
    
    log "${GREEN}✅ Ultimo commit TASKS.md: $last_tasks_commit${NC}"
    return 0
}

# Main
main() {
    log "🔍 Watchdog Telegram Logs - Starting check..."
    
    local issues=()
    
    # Check 1: Daily entries
    if ! check_daily_entries; then
        issues+=("Nessuna entry memory oggi")
    fi
    
    # Check 2: Memory commit recency
    if ! check_memory_commit_recency; then
        issues+=("Memory non committata da >2h")
    fi
    
    # Check 3: Tasks recency
    if ! check_tasks_recency; then
        issues+=("TASKS.md non aggiornato da >4h")
    fi
    
    # Check 4: Recent messages (se disponibili)
    local recent_msgs=$(get_recent_telegram_messages)
    local missing_msgs=()
    
    if [[ -n "$recent_msgs" ]]; then
        while IFS= read -r msg_id; do
            if [[ -n "$msg_id" ]] && ! check_message_logged "$msg_id"; then
                missing_msgs+=("$msg_id")
            fi
        done <<< "$recent_msgs"
        
        if [[ ${#missing_msgs[@]} -gt 0 ]]; then
            log "${RED}❌ Messaggi non loggati: ${missing_msgs[*]}${NC}"
            issues+=("Messaggi non loggati: ${missing_msgs[*]}")
        else
            log "${GREEN}✅ Tutti i messaggi recenti sono loggati${NC}"
        fi
    else
        log "${YELLOW}ℹ️ Nessun messaggio recente trovato nei log${NC}"
    fi
    
    # Genera alert se ci sono issues
    if [[ ${#issues[@]} -gt 0 ]]; then
        log "${RED}⚠️ PROBLEMI TROVATI - Generando alert...${NC}"
        
        cat > "$ALERT_FILE" << EOF
🔍 WATCHDOG TELEGRAM LOGS ALERT
Timestamp: $(date '+%Y-%m-%d %H:%M:%S PST')

PROBLEMI RILEVATI:
$(printf '- %s\n' "${issues[@]}")

AZIONE RICHIESTA:
- Verifica che i messaggi Telegram siano loggati in memory/
- Crea task in TASKS.md per richieste esplicite
- Committa e pusha le modifiche

Questo alert sarà gestito dal prossimo heartbeat.
EOF
        log "${RED}❌ Alert creato: $ALERT_FILE${NC}"
        exit 1
    else
        log "${GREEN}✅ Tutti i controlli passati!${NC}"
        # Rimuovi alert se esistente
        rm -f "$ALERT_FILE" 2>/dev/null || true
        exit 0
    fi
}

main "$@"

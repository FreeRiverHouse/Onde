#!/bin/bash
# Watchdog per memoria e intelligenza degli agenti Onde
# Verifica che gli agenti stiano loggando e leggendo correttamente

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
MEMORY_DIR="$PROJECT_DIR/memory"
LOG_FILE="$SCRIPT_DIR/watchdog-agents.log"
ALERT_FILE="$SCRIPT_DIR/memory-stale.alert"

# Soglie
MAX_MEMORY_AGE_DAYS=3  # Memory files più vecchi di 3 giorni = stale
MAX_HEARTBEAT_AGE_HOURS=2  # Heartbeat state più vecchio di 2 ore = stale

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo "$1"
}

WARNINGS=()
ERRORS=()
PASSED=()

# ==========================================
# 1. CHECK MEMORY FILES
# ==========================================
check_memory_files() {
    log "Checking memory files..."
    
    # Verifica che la directory memory esista
    if [ ! -d "$MEMORY_DIR" ]; then
        ERRORS+=("❌ Memory directory non esiste: $MEMORY_DIR")
        return 1
    fi
    
    # Conta memory files
    local total_files=$(find "$MEMORY_DIR" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$total_files" -eq 0 ]; then
        ERRORS+=("❌ Nessun file memory trovato!")
        return 1
    fi
    PASSED+=("✅ $total_files memory files trovati")
    
    # Trova il file più recente
    local newest=$(find "$MEMORY_DIR" -name "*.md" -type f -exec stat -f '%m %N' {} \; 2>/dev/null | sort -rn | head -1)
    local newest_time=$(echo "$newest" | cut -d' ' -f1)
    local newest_file=$(echo "$newest" | cut -d' ' -f2-)
    local now=$(date +%s)
    local age_days=$(( (now - newest_time) / 86400 ))
    
    if [ "$age_days" -ge "$MAX_MEMORY_AGE_DAYS" ]; then
        ERRORS+=("❌ Memory stale! Ultimo update: $age_days giorni fa ($(basename "$newest_file"))")
    else
        PASSED+=("✅ Memory aggiornata: ultimo file $(basename "$newest_file") ($age_days giorni fa)")
    fi
    
    # Verifica che oggi ci sia un file (se sono passate più di 2 ore dall'inizio del giorno)
    local today=$(date +%Y-%m-%d)
    local hour=$(date +%H)
    if [ "$hour" -ge 10 ]; then  # Dopo le 10 di mattina
        if [ ! -f "$MEMORY_DIR/$today.md" ]; then
            WARNINGS+=("⚠️ Nessun memory file per oggi ($today) - agenti potrebbero non loggare")
        else
            PASSED+=("✅ Memory file per oggi esiste: $today.md")
            
            # Controlla dimensione (file vuoto o quasi = non sta loggando)
            local size=$(stat -f%z "$MEMORY_DIR/$today.md" 2>/dev/null || echo "0")
            if [ "$size" -lt 100 ]; then
                WARNINGS+=("⚠️ Memory di oggi troppo piccola ($size bytes) - potrebbe non loggare")
            fi
        fi
    fi
}

# ==========================================
# 2. CHECK HEARTBEAT STATE
# ==========================================
check_heartbeat() {
    log "Checking heartbeat state..."
    
    local heartbeat_state="$MEMORY_DIR/heartbeat-state.json"
    
    if [ ! -f "$heartbeat_state" ]; then
        WARNINGS+=("⚠️ Heartbeat state file non esiste - heartbeat non attivo?")
        return 0
    fi
    
    # Controlla età del file
    local file_time=$(stat -f '%m' "$heartbeat_state" 2>/dev/null || echo "0")
    local now=$(date +%s)
    local age_hours=$(( (now - file_time) / 3600 ))
    
    if [ "$age_hours" -ge "$MAX_HEARTBEAT_AGE_HOURS" ]; then
        WARNINGS+=("⚠️ Heartbeat state stale: $age_hours ore fa")
    else
        PASSED+=("✅ Heartbeat state aggiornato ($age_hours ore fa)")
    fi
}

# ==========================================
# 3. CHECK AGENTS FILES (SOUL, USER, etc)
# ==========================================
check_agent_files() {
    log "Checking agent config files..."
    
    local required_files=("SOUL.md" "USER.md" "AGENTS.md" "HEARTBEAT.md")
    
    for file in "${required_files[@]}"; do
        if [ -f "$PROJECT_DIR/$file" ]; then
            PASSED+=("✅ $file presente")
        else
            ERRORS+=("❌ $file mancante - agenti potrebbero non funzionare!")
        fi
    done
}

# ==========================================
# 4. CHECK TASKS FILE
# ==========================================
check_tasks() {
    log "Checking TASKS.md..."
    
    if [ ! -f "$PROJECT_DIR/TASKS.md" ]; then
        WARNINGS+=("⚠️ TASKS.md non esiste")
        return 0
    fi
    
    # Conta task TODO e IN_PROGRESS
    local todo_count=$(grep -c "Status: TODO" "$PROJECT_DIR/TASKS.md" 2>/dev/null | tr -d '[:space:]' || echo "0")
    local progress_count=$(grep -c "Status: IN_PROGRESS" "$PROJECT_DIR/TASKS.md" 2>/dev/null | tr -d '[:space:]' || echo "0")
    local done_count=$(grep -c "Status: DONE" "$PROJECT_DIR/TASKS.md" 2>/dev/null | tr -d '[:space:]' || echo "0")
    
    PASSED+=("✅ TASKS: $todo_count TODO, $progress_count in progress, $done_count done")
    
    # Warning se troppi task in progress (possibile stallo)
    if [ "$progress_count" -gt 5 ]; then
        WARNINGS+=("⚠️ Troppi task IN_PROGRESS ($progress_count) - possibile stallo")
    fi
}

# ==========================================
# 5. CHECK GIT STATUS
# ==========================================
check_git_status() {
    log "Checking git status..."
    
    cd "$PROJECT_DIR" || return 1
    
    # Controlla se ci sono modifiche non committate in memory/
    local uncommitted=$(git status --porcelain memory/ 2>/dev/null | wc -l | tr -d ' ')
    if [ "$uncommitted" -gt 0 ]; then
        WARNINGS+=("⚠️ $uncommitted file memory non committati - agenti potrebbero perdere log")
    else
        PASSED+=("✅ Memory files tutti committati")
    fi
    
    # Controlla ultimo commit
    local last_commit_time=$(git log -1 --format=%ct 2>/dev/null || echo "0")
    local now=$(date +%s)
    local age_hours=$(( (now - last_commit_time) / 3600 ))
    
    if [ "$age_hours" -gt 24 ]; then
        WARNINGS+=("⚠️ Ultimo commit: $age_hours ore fa - repo potrebbe essere stale")
    else
        PASSED+=("✅ Git attivo: ultimo commit $age_hours ore fa")
    fi
}

# ==========================================
# MAIN
# ==========================================
log "========== AGENTS MEMORY WATCHDOG START =========="

check_memory_files
check_heartbeat
check_agent_files
check_tasks
check_git_status

# ==========================================
# REPORT
# ==========================================
echo ""
echo "=========================================="
echo "🧠 AGENTS MEMORY WATCHDOG - $(date '+%Y-%m-%d %H:%M')"
echo "=========================================="

echo ""
echo "✅ PASSED (${#PASSED[@]}):"
for p in "${PASSED[@]}"; do
    echo "  $p"
done

if [ ${#WARNINGS[@]} -gt 0 ]; then
    echo ""
    echo "⚠️ WARNINGS (${#WARNINGS[@]}):"
    for w in "${WARNINGS[@]}"; do
        echo "  $w"
    done
fi

if [ ${#ERRORS[@]} -gt 0 ]; then
    echo ""
    echo "❌ ERRORS (${#ERRORS[@]}):"
    for e in "${ERRORS[@]}"; do
        echo "  $e"
    done
    
    # Crea alert
    cat > "$ALERT_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S)Z",
  "error_count": ${#ERRORS[@]},
  "warning_count": ${#WARNINGS[@]},
  "message": "🧠 AGENTS MEMORY ALERT!\n\n${#ERRORS[@]} errori:\n$(printf '• %s\\n' "${ERRORS[@]}")\n\n${#WARNINGS[@]} warning:\n$(printf '• %s\\n' "${WARNINGS[@]}")"
}
EOF
    log "Alert created: $ALERT_FILE"
    exit 1
elif [ ${#WARNINGS[@]} -gt 3 ]; then
    # Troppi warning = alert comunque
    cat > "$ALERT_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S)Z",
  "error_count": 0,
  "warning_count": ${#WARNINGS[@]},
  "message": "⚠️ AGENTS MEMORY WARNING!\n\n${#WARNINGS[@]} warning accumulati:\n$(printf '• %s\\n' "${WARNINGS[@]}")"
}
EOF
    log "Warning alert created: $ALERT_FILE"
    exit 0
else
    echo ""
    echo "🎉 Agents memory healthy!"
    [ -f "$ALERT_FILE" ] && rm "$ALERT_FILE"
    exit 0
fi

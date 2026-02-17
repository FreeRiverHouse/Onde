#!/bin/bash
# Auto-restart Ondinho session when stalled
# Called by heartbeat when ondinho-stalled.alert is detected

set -e
cd "$(dirname "$0")/.."

LOG_FILE="scripts/watchdog-ondinho.log"
MEMORY_DIR="memory"
TASKS_FILE="TASKS.md"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] RESTART: $1" | tee -a "$LOG_FILE"
}

# Get current date for memory logging
TODAY=$(date '+%Y-%m-%d')
MEMORY_FILE="$MEMORY_DIR/$TODAY.md"

# Find next TODO task for Ondinho to work on
get_next_task() {
    # Find TODO tasks not assigned yet, prioritize P0/P1
    grep -A 5 "Status.*TODO" "$TASKS_FILE" | \
        grep -B 1 "Owner.*-\|Owner.*TBD" | \
        grep -oP '\[T\d+\]' | head -1 || echo ""
}

# Log stall event to memory
log_stall_to_memory() {
    local reason="$1"
    
    # Create memory dir if needed
    mkdir -p "$MEMORY_DIR"
    
    # Append stall event
    cat >> "$MEMORY_FILE" << EOF

## $(date '+%Y-%m-%d %H:%M') - Ondinho Stall Event
### Contesto
- Ondinho session detected as stalled (>30 min inactive)
- Auto-restart triggered by Clawdinho heartbeat

### Dettagli
- Reason: $reason
- Action: Session restart requested via sessions_spawn
- Next task assigned: $(get_next_task)

### Notes
- Check if recurring stalls indicate deeper issue
- Consider increasing heartbeat frequency if stalls persist
EOF
    log "Logged stall event to $MEMORY_FILE"
}

# Main restart logic
restart_ondinho() {
    local alert_content=""
    
    if [ -f "scripts/ondinho-stalled.alert" ]; then
        alert_content=$(cat "scripts/ondinho-stalled.alert")
        log "Found stall alert: $alert_content"
    fi
    
    # Log to memory
    log_stall_to_memory "$alert_content"
    
    # Get next task
    NEXT_TASK=$(get_next_task)
    
    if [ -z "$NEXT_TASK" ]; then
        log "No unassigned TODO tasks found, will prompt for TASKS.md review"
        RESTART_PROMPT="Ondinho was stalled. Review TASKS.md and pick next priority task to work on. Follow HEARTBEAT.md strictly."
    else
        log "Found next task: $NEXT_TASK"
        RESTART_PROMPT="Ondinho was stalled and auto-restarted. Resume work immediately. Pick task $NEXT_TASK or next available TODO from TASKS.md. Follow HEARTBEAT.md strictly - never stop working!"
    fi
    
    # Output restart prompt for calling script to use
    echo "$RESTART_PROMPT"
    
    # Clean up alert file
    rm -f "scripts/ondinho-stalled.alert"
    log "Removed stall alert file"
    
    # Commit memory update
    git add "$MEMORY_FILE" 2>/dev/null || true
    git commit -m "memory: ondinho stall event $(date '+%Y-%m-%d %H:%M')" 2>/dev/null || true
    
    log "Restart script complete"
}

# Run if called directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    restart_ondinho
fi

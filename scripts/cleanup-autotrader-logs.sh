#!/bin/bash
# Cleanup old autotrader logs to prevent disk bloat
# Keeps last 7 days of logs, rotates old ones

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AUTOTRADER_LOG="$SCRIPT_DIR/autotrader.log"
WATCHDOG_LOG="$SCRIPT_DIR/watchdog.log"
DAYS_TO_KEEP=7

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

rotate_log() {
    local logfile="$1"
    local max_size_kb=10240  # 10MB
    
    if [ ! -f "$logfile" ]; then
        return
    fi
    
    local size=$(du -k "$logfile" 2>/dev/null | cut -f1)
    
    if [ "$size" -gt "$max_size_kb" ]; then
        log "Rotating $logfile (${size}KB > ${max_size_kb}KB)"
        
        # Keep last 1000 lines as new log
        tail -n 1000 "$logfile" > "${logfile}.tmp"
        mv "${logfile}.tmp" "$logfile"
        
        log "Rotated $logfile - kept last 1000 lines"
    fi
}

cleanup_old_backups() {
    log "Cleaning up log archives older than $DAYS_TO_KEEP days..."
    find "$SCRIPT_DIR" -name "*.log.*.gz" -mtime +$DAYS_TO_KEEP -delete 2>/dev/null
    find "$SCRIPT_DIR" -name "*.log.old" -mtime +$DAYS_TO_KEEP -delete 2>/dev/null
}

main() {
    log "=== Autotrader Log Cleanup ==="
    
    rotate_log "$AUTOTRADER_LOG"
    rotate_log "$WATCHDOG_LOG"
    cleanup_old_backups
    
    log "Cleanup complete"
}

main

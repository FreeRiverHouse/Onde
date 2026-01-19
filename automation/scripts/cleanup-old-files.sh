#!/bin/bash
# =============================================================================
# AUTOMATED CLEANUP SCRIPT
# Removes old temporary files, logs, and cache to prevent disk filling
# =============================================================================

set -e

LOG_FILE="/Users/mattiapetrucciani/CascadeProjects/Onde/automation/logs/cleanup.log"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Configuration
DAYS_TO_KEEP_LOGS=7
DAYS_TO_KEEP_TMP=3
DISK_THRESHOLD=85  # Start cleanup if disk usage > 85%

# Get current disk usage percentage
get_disk_usage() {
    df -h / | tail -1 | awk '{print $5}' | tr -d '%'
}

# Clean old log files
clean_logs() {
    log "Cleaning logs older than $DAYS_TO_KEEP_LOGS days..."

    # Clean automation logs
    local log_dir="/Users/mattiapetrucciani/CascadeProjects/Onde/automation/logs"
    if [ -d "$log_dir" ]; then
        find "$log_dir" -name "*.log" -mtime +$DAYS_TO_KEEP_LOGS -delete 2>/dev/null || true
        log "Cleaned automation logs"
    fi

    # Clean /tmp bot logs (but keep recent ones)
    find /tmp -name "*.log" -user "$USER" -mtime +$DAYS_TO_KEEP_LOGS -delete 2>/dev/null || true
    log "Cleaned /tmp logs"
}

# Clean old temporary files
clean_tmp() {
    log "Cleaning temporary files older than $DAYS_TO_KEEP_TMP days..."

    # Clean node_modules/.cache if it exists
    local onde_dir="/Users/mattiapetrucciani/CascadeProjects/Onde"
    if [ -d "$onde_dir/node_modules/.cache" ]; then
        find "$onde_dir/node_modules/.cache" -type f -mtime +$DAYS_TO_KEEP_TMP -delete 2>/dev/null || true
        log "Cleaned node_modules cache"
    fi

    # Clean old screenshots
    local screenshots_dir="$onde_dir/apps/*/test-screenshots"
    find $screenshots_dir -type f -mtime +$DAYS_TO_KEEP_LOGS -delete 2>/dev/null || true
    log "Cleaned old test screenshots"
}

# Truncate large log files instead of deleting
truncate_large_logs() {
    local max_size=$((50 * 1024 * 1024))  # 50MB

    for logfile in /tmp/*.log /Users/mattiapetrucciani/CascadeProjects/Onde/automation/logs/*.log; do
        if [ -f "$logfile" ]; then
            local size=$(stat -f%z "$logfile" 2>/dev/null || echo "0")
            if [ "$size" -gt "$max_size" ]; then
                log "Truncating large log: $logfile ($(($size / 1024 / 1024))MB)"
                # Keep last 10000 lines
                tail -10000 "$logfile" > "${logfile}.tmp" && mv "${logfile}.tmp" "$logfile"
            fi
        fi
    done
}

# Main cleanup
main() {
    log "========== CLEANUP STARTED =========="

    local disk_usage=$(get_disk_usage)
    log "Current disk usage: ${disk_usage}%"

    # Always do these lightweight cleanups
    truncate_large_logs

    # More aggressive cleanup if disk usage is high
    if [ "$disk_usage" -gt "$DISK_THRESHOLD" ]; then
        log "Disk usage above ${DISK_THRESHOLD}%, performing full cleanup"
        clean_logs
        clean_tmp
    else
        log "Disk usage acceptable, skipping deep cleanup"
    fi

    # Report new disk usage
    disk_usage=$(get_disk_usage)
    log "Disk usage after cleanup: ${disk_usage}%"

    log "========== CLEANUP COMPLETED =========="
}

# Run with optional force flag
if [ "$1" = "-f" ] || [ "$1" = "--force" ]; then
    log "Force cleanup requested"
    clean_logs
    clean_tmp
    truncate_large_logs
else
    main
fi

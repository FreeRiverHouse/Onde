#!/bin/bash
# Cleanup stale alert files older than 24 hours
# Prevents outdated notifications if heartbeat was offline
# Cron: 0 */6 * * * (every 6 hours)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$SCRIPT_DIR/cleanup-stale-alerts.log"
MAX_AGE_HOURS=24

# Alert file patterns to check
ALERT_PATTERNS=(
    "kalshi-daily-report.alert"
    "kalshi-low-winrate.alert"
    "kalshi-autotrader-crash.alert"
    "watchdog-stale.alert"
    "kalshi-weekly-report.alert"
    "kalshi-stop-loss.alert"
)

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

cleanup_count=0

for pattern in "${ALERT_PATTERNS[@]}"; do
    alert_file="$SCRIPT_DIR/$pattern"
    
    if [[ -f "$alert_file" ]]; then
        # Get file age in hours
        file_age_seconds=$(($(date +%s) - $(stat -f %m "$alert_file" 2>/dev/null || stat -c %Y "$alert_file" 2>/dev/null)))
        file_age_hours=$((file_age_seconds / 3600))
        
        if [[ $file_age_hours -ge $MAX_AGE_HOURS ]]; then
            log "Removing stale alert: $pattern (${file_age_hours}h old)"
            rm -f "$alert_file"
            ((cleanup_count++))
        fi
    fi
done

if [[ $cleanup_count -gt 0 ]]; then
    log "Cleaned up $cleanup_count stale alert file(s)"
fi

# Rotate log if > 100KB
if [[ -f "$LOG_FILE" ]] && [[ $(stat -f %z "$LOG_FILE" 2>/dev/null || stat -c %s "$LOG_FILE" 2>/dev/null) -gt 102400 ]]; then
    tail -100 "$LOG_FILE" > "$LOG_FILE.tmp"
    mv "$LOG_FILE.tmp" "$LOG_FILE"
    log "Log rotated"
fi

exit 0

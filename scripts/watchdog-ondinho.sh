#!/bin/bash
# Watchdog for Ondinho (M4 Pro agent) activity
# Creates alert file if Ondinho is inactive >30 min during work hours

set -e
cd "$(dirname "$0")/.."

ALERT_FILE="scripts/ondinho-stalled.alert"
LOG_FILE="scripts/watchdog-ondinho.log"
WORK_START=8   # 8 AM
WORK_END=23    # 11 PM

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if within work hours (PST)
HOUR=$(TZ="America/Los_Angeles" date +%H)
if [ "$HOUR" -lt "$WORK_START" ] || [ "$HOUR" -ge "$WORK_END" ]; then
    log "Outside work hours ($HOUR), skipping check"
    exit 0
fi

# Check last commit from Ondinho (commits from M4 Pro or onde-bot)
# Look for commits in last 30 minutes
LAST_COMMIT_TIME=$(git log --all --author="onde-bot\|ondinho\|M4" --format="%at" -1 2>/dev/null || echo "0")
CURRENT_TIME=$(date +%s)
INACTIVE_MINUTES=$(( (CURRENT_TIME - LAST_COMMIT_TIME) / 60 ))

log "Ondinho last commit: ${INACTIVE_MINUTES} min ago"

# Check for recent task completions (look for "DONE" additions in last hour)
RECENT_TASK_DONE=$(git log --all --since="1 hour ago" --grep="task:.*done\|DONE" --oneline 2>/dev/null | wc -l | tr -d ' ')

log "Recent task completions: ${RECENT_TASK_DONE}"

# Alert if inactive >30 min AND no recent task completions
if [ "$INACTIVE_MINUTES" -gt 30 ] && [ "$RECENT_TASK_DONE" -eq 0 ]; then
    if [ ! -f "$ALERT_FILE" ]; then
        cat > "$ALERT_FILE" << EOF
🤖 ONDINHO STALLED ALERT

Last Ondinho commit: ${INACTIVE_MINUTES} minutes ago
Recent task completions: ${RECENT_TASK_DONE}
Time: $(date '+%Y-%m-%d %H:%M:%S PST')

Ondinho may need a restart or new task assignment.
EOF
        log "ALERT: Ondinho inactive for ${INACTIVE_MINUTES} min, alert created"
    else
        log "Alert file already exists, skipping"
    fi
else
    # Remove old alert if Ondinho is active again
    if [ -f "$ALERT_FILE" ]; then
        rm "$ALERT_FILE"
        log "Ondinho active again, alert cleared"
    fi
    log "OK: Ondinho is active"
fi

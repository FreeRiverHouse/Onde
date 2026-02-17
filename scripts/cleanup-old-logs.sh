#!/bin/bash
# cleanup-old-logs.sh - Clean old log files
#
# Removes logs older than 30 days from logs/ directory

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOGS_DIR="$PROJECT_DIR/logs"
DAYS_TO_KEEP=30

if [ -d "$LOGS_DIR" ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Cleaning logs older than $DAYS_TO_KEEP days"
    find "$LOGS_DIR" -name "*.log" -type f -mtime +$DAYS_TO_KEEP -delete -print 2>/dev/null | wc -l | xargs echo "Deleted files:"
    
    # Also clean old alert files (keep 7 days)
    find "$SCRIPT_DIR" -name "*.alert" -type f -mtime +7 -delete -print 2>/dev/null | wc -l | xargs echo "Deleted alert files:"
else
    echo "Logs directory not found: $LOGS_DIR"
fi

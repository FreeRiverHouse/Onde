#!/bin/bash
# Cleanup trading backups older than 30 days
# Keeps latest.jsonl and last 30 daily backups

BACKUP_DIR="$(dirname "$0")/../data/trading"
RETENTION_DAYS=30

if [ ! -d "$BACKUP_DIR" ]; then
    echo "Backup directory not found: $BACKUP_DIR"
    exit 0
fi

# Find and delete files older than RETENTION_DAYS (excluding latest.jsonl)
deleted=0
for file in "$BACKUP_DIR"/kalshi-trades-*.jsonl; do
    [ -f "$file" ] || continue
    [[ "$(basename "$file")" == "kalshi-trades-latest.jsonl" ]] && continue
    
    # Check if file is older than retention period
    if [ "$(find "$file" -mtime +$RETENTION_DAYS 2>/dev/null)" ]; then
        echo "Deleting old backup: $(basename "$file")"
        rm "$file"
        ((deleted++))
    fi
done

if [ $deleted -gt 0 ]; then
    echo "Cleaned up $deleted old backup(s)"
else
    echo "No backups older than $RETENTION_DAYS days"
fi

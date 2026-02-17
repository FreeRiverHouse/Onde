#!/bin/bash
# Backup kalshi-trades.jsonl to git daily
# Run via cron at 00:05 UTC (16:05 PST previous day)

set -e

REPO_DIR="/Users/mattia/Projects/Onde"
TRADES_FILE="$REPO_DIR/scripts/kalshi-trades.jsonl"
BACKUP_DIR="$REPO_DIR/data/trading"
DATE=$(date -u +%Y-%m-%d)
LOG_FILE="$REPO_DIR/scripts/backup-trades.log"

log() {
    echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] $1" >> "$LOG_FILE"
}

cd "$REPO_DIR"

# Ensure backup dir exists
mkdir -p "$BACKUP_DIR"

# Check if trades file exists
if [ ! -f "$TRADES_FILE" ]; then
    log "ERROR: Trades file not found: $TRADES_FILE"
    exit 1
fi

# Count lines (trades)
TRADE_COUNT=$(wc -l < "$TRADES_FILE" | tr -d ' ')

# Copy to backup with date
BACKUP_FILE="$BACKUP_DIR/kalshi-trades-$DATE.jsonl"
cp "$TRADES_FILE" "$BACKUP_FILE"

# Also keep a latest copy
cp "$TRADES_FILE" "$BACKUP_DIR/kalshi-trades-latest.jsonl"

log "Backed up $TRADE_COUNT trades to $BACKUP_FILE"

# Git operations
git add "$BACKUP_DIR/"

# Check if there are changes to commit
if git diff --cached --quiet; then
    log "No changes to commit"
else
    git commit -m "backup: kalshi trades $DATE ($TRADE_COUNT trades)"
    git push origin main
    log "Pushed backup to git"
fi

echo "✅ Trade backup completed: $TRADE_COUNT trades"

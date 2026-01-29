#!/bin/bash
# Backup Memory Files to Git - Daily
# Backs up MEMORY.md + memory/ folder to git
# Cron: 0 2 * * * /Users/mattia/Projects/Onde/scripts/backup-memory-git.sh >> /tmp/backup-memory.log 2>&1
#
# Backs up from ~/.clawdbot workspace (where memory files live)
# into Onde/data/memory-backups/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ONDE_ROOT="$(dirname "$SCRIPT_DIR")"
# Memory files live in the workspace itself
WORKSPACE_DIR="$ONDE_ROOT"
BACKUP_DIR="$ONDE_ROOT/data/memory-backups"
TIMESTAMP=$(date +%Y-%m-%d)

echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting memory backup"

# Create backup directory if needed
mkdir -p "$BACKUP_DIR"

# Create dated backup folder
DATE_BACKUP="$BACKUP_DIR/$TIMESTAMP"
mkdir -p "$DATE_BACKUP"

# Backup MEMORY.md if exists
if [ -f "$WORKSPACE_DIR/MEMORY.md" ]; then
    cp "$WORKSPACE_DIR/MEMORY.md" "$DATE_BACKUP/MEMORY.md"
    echo "  ✅ Backed up MEMORY.md"
else
    echo "  ⚠️ MEMORY.md not found"
fi

# Backup memory folder if exists
if [ -d "$WORKSPACE_DIR/memory" ]; then
    cp -r "$WORKSPACE_DIR/memory" "$DATE_BACKUP/"
    echo "  ✅ Backed up memory/ folder"
else
    echo "  ⚠️ memory/ folder not found"
fi

# Also backup key workspace files
for FILE in SOUL.md USER.md TOOLS.md IDENTITY.md HEARTBEAT.md; do
    if [ -f "$WORKSPACE_DIR/$FILE" ]; then
        cp "$WORKSPACE_DIR/$FILE" "$DATE_BACKUP/$FILE"
        echo "  ✅ Backed up $FILE"
    fi
done

# Count files backed up
FILE_COUNT=$(find "$DATE_BACKUP" -type f | wc -l | tr -d ' ')
echo "$(date '+%Y-%m-%d %H:%M:%S') - Backed up $FILE_COUNT files to $DATE_BACKUP"

# Git operations
cd "$ONDE_ROOT"

# Check if anything changed
if git status --porcelain | grep -q "data/memory-backups"; then
    git add data/memory-backups/
    git commit -m "chore: daily memory backup $TIMESTAMP"
    git push origin main 2>/dev/null || echo "  ⚠️ Git push failed (will retry next run)"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Committed and pushed memory backup"
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - No changes to backup"
fi

# Cleanup: remove backups older than 30 days
find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \; 2>/dev/null || true
echo "$(date '+%Y-%m-%d %H:%M:%S') - Cleanup complete"

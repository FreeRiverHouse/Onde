#!/bin/bash
# archive-old-memory.sh - Move memory files >30 days old to archive
# Run monthly: 0 0 1 * * /Users/mattia/Projects/Onde/scripts/archive-old-memory.sh
# Part of T415

set -euo pipefail

MEMORY_DIR="${MEMORY_DIR:-/Users/mattia/Projects/Onde/memory}"
ARCHIVE_DIR="$MEMORY_DIR/archive"
DAYS_OLD="${DAYS_OLD:-30}"
LOG_FILE="${LOG_FILE:-/Users/mattia/Projects/Onde/scripts/memory-archive.log}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo "$1"
}

# Create archive directory if needed
mkdir -p "$ARCHIVE_DIR"

log "Starting memory archive check (files > $DAYS_OLD days old)"

# Find and archive old daily notes (YYYY-MM-DD.md pattern)
archived_count=0
for file in "$MEMORY_DIR"/????-??-??.md; do
    [ -f "$file" ] || continue
    
    filename=$(basename "$file")
    # Extract date from filename
    file_date="${filename%.md}"
    
    # Check if it's a valid date format
    if [[ ! "$file_date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
        continue
    fi
    
    # Calculate days old
    if [[ "$OSTYPE" == "darwin"* ]]; then
        file_epoch=$(date -j -f "%Y-%m-%d" "$file_date" "+%s" 2>/dev/null || echo 0)
    else
        file_epoch=$(date -d "$file_date" "+%s" 2>/dev/null || echo 0)
    fi
    
    if [ "$file_epoch" -eq 0 ]; then
        continue
    fi
    
    current_epoch=$(date "+%s")
    days_diff=$(( (current_epoch - file_epoch) / 86400 ))
    
    if [ "$days_diff" -gt "$DAYS_OLD" ]; then
        # Archive the file
        mv "$file" "$ARCHIVE_DIR/"
        log "Archived: $filename ($days_diff days old)"
        ((archived_count++))
    fi
done

if [ "$archived_count" -eq 0 ]; then
    log "No files to archive"
else
    log "Archived $archived_count files to $ARCHIVE_DIR"
    
    # Git commit the archive
    cd "$(dirname "$MEMORY_DIR")"
    if git rev-parse --git-dir > /dev/null 2>&1; then
        git add "$ARCHIVE_DIR" 2>/dev/null || true
        git add -u "$MEMORY_DIR" 2>/dev/null || true
        if ! git diff --cached --quiet 2>/dev/null; then
            git commit -m "chore: archive $archived_count old memory files (>$DAYS_OLD days)" 2>/dev/null || true
            git push origin main 2>/dev/null || log "Warning: git push failed"
        fi
    fi
fi

log "Archive check complete"

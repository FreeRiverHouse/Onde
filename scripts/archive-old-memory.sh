#!/bin/bash
# Archive memory files older than 30 days
# Moves memory/YYYY-MM-DD.md files to memory/archive/

MEMORY_DIR="/Users/mattia/Projects/Onde/memory"
ARCHIVE_DIR="$MEMORY_DIR/archive"
DAYS_OLD=30

# Create archive directory if it doesn't exist
mkdir -p "$ARCHIVE_DIR"

# Find and move old files
count=0
for file in "$MEMORY_DIR"/*.md; do
    [ -f "$file" ] || continue
    
    filename=$(basename "$file")
    
    # Skip non-date files (like MEMORY.md)
    if [[ ! "$filename" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}\.md$ ]]; then
        continue
    fi
    
    # Check if file is older than threshold
    if [ $(find "$file" -mtime +$DAYS_OLD 2>/dev/null | wc -l) -gt 0 ]; then
        mv "$file" "$ARCHIVE_DIR/"
        echo "Archived: $filename"
        ((count++))
    fi
done

if [ $count -eq 0 ]; then
    echo "No files to archive (none older than $DAYS_OLD days)"
else
    echo "Archived $count file(s) to $ARCHIVE_DIR"
fi

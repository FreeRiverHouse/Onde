#!/bin/bash
# Memory File Auto-Archiver
# Archives memory files older than 30 days to memory/archive/YYYY-MM/
# Creates searchable index for archived content
# Run weekly via cron

set -e

MEMORY_DIR="/Users/mattia/Projects/Onde/memory"
ARCHIVE_DIR="$MEMORY_DIR/archive"
INDEX_FILE="$ARCHIVE_DIR/index.md"
DAYS_OLD=30

# Create archive directory if needed
mkdir -p "$ARCHIVE_DIR"

# Initialize index if doesn't exist
if [ ! -f "$INDEX_FILE" ]; then
    cat > "$INDEX_FILE" << 'EOF'
# Memory Archive Index

Auto-generated index of archived memory files.

## Archives by Month

EOF
fi

# Get current date for comparison
CURRENT_DATE=$(date +%s)

# Counter for archived files
ARCHIVED=0

# Find daily memory files older than DAYS_OLD
for file in "$MEMORY_DIR"/20??-??-??.md; do
    [ -f "$file" ] || continue
    
    # Extract date from filename
    basename=$(basename "$file" .md)
    
    # Get file modification time
    if [[ "$OSTYPE" == "darwin"* ]]; then
        FILE_DATE=$(date -j -f "%Y-%m-%d" "$basename" +%s 2>/dev/null) || continue
    else
        FILE_DATE=$(date -d "$basename" +%s 2>/dev/null) || continue
    fi
    
    # Calculate age in days
    AGE_SECONDS=$((CURRENT_DATE - FILE_DATE))
    AGE_DAYS=$((AGE_SECONDS / 86400))
    
    if [ $AGE_DAYS -gt $DAYS_OLD ]; then
        # Extract year-month for archive folder
        YEAR_MONTH=$(echo "$basename" | cut -d'-' -f1-2)
        MONTH_DIR="$ARCHIVE_DIR/$YEAR_MONTH"
        mkdir -p "$MONTH_DIR"
        
        # Compress and move
        gzip -c "$file" > "$MONTH_DIR/$basename.md.gz"
        
        # Extract summary for index (first 5 non-empty lines with ## headers)
        SUMMARY=$(grep "^## " "$file" 2>/dev/null | head -5 | sed 's/^## /- /' || echo "- (no headers)")
        
        # Add to index
        if ! grep -q "$basename" "$INDEX_FILE" 2>/dev/null; then
            echo "" >> "$INDEX_FILE"
            echo "### $basename" >> "$INDEX_FILE"
            echo "$SUMMARY" >> "$INDEX_FILE"
        fi
        
        # Remove original
        rm "$file"
        
        ((ARCHIVED++))
        echo "Archived: $basename → $MONTH_DIR/"
    fi
done

if [ $ARCHIVED -gt 0 ]; then
    echo ""
    echo "✅ Archived $ARCHIVED files older than $DAYS_OLD days"
    
    # Update index timestamp
    echo "" >> "$INDEX_FILE"
    echo "---" >> "$INDEX_FILE"
    echo "*Last updated: $(date '+%Y-%m-%d %H:%M')*" >> "$INDEX_FILE"
else
    echo "✅ No files to archive (all files < $DAYS_OLD days old)"
fi

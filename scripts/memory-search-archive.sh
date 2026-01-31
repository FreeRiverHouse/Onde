#!/bin/bash
# Search archived memory files
# Usage: ./memory-search-archive.sh "search term"

ARCHIVE_DIR="/Users/mattia/Projects/Onde/memory/archive"

if [ -z "$1" ]; then
    echo "Usage: $0 <search_term>"
    echo "Searches through archived memory files (gzipped)"
    exit 1
fi

QUERY="$1"

echo "🔍 Searching archives for: $QUERY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Search through all gzipped files
FOUND=0
for archive in "$ARCHIVE_DIR"/*/*.md.gz; do
    [ -f "$archive" ] || continue
    
    MATCHES=$(zgrep -i -c "$QUERY" "$archive" 2>/dev/null || echo 0)
    
    if [ "$MATCHES" -gt 0 ]; then
        FILE=$(basename "$archive" .md.gz)
        FOLDER=$(dirname "$archive" | xargs basename)
        echo ""
        echo "📁 $FOLDER/$FILE ($MATCHES matches)"
        echo "─────────────────────────────"
        zgrep -i -B1 -A1 "$QUERY" "$archive" 2>/dev/null | head -20
        ((FOUND++))
    fi
done

echo ""
if [ $FOUND -eq 0 ]; then
    echo "❌ No matches found in archives"
else
    echo "✅ Found matches in $FOUND archived file(s)"
fi

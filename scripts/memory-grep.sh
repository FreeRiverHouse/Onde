#!/bin/bash
# memory-grep.sh - Grep-based memory search fallback
# Usage: ./scripts/memory-grep.sh "search terms"
# When memory_search is disabled (no embeddings API), use this instead

set -e

WORKSPACE="${WORKSPACE:-/Users/mattia/Projects/Onde}"
MEMORY_DIR="$WORKSPACE/memory"
MEMORY_FILE="$WORKSPACE/MEMORY.md"

if [ -z "$1" ]; then
    echo "Usage: $0 <search_query>"
    echo "Searches MEMORY.md and memory/*.md files"
    exit 1
fi

QUERY="$1"
echo "🔍 Searching memory files for: $QUERY"
echo "================================================"

# Search MEMORY.md
if [ -f "$MEMORY_FILE" ]; then
    echo ""
    echo "📁 MEMORY.md:"
    grep -n -i "$QUERY" "$MEMORY_FILE" 2>/dev/null | head -20 || echo "  (no matches)"
fi

# Search memory/*.md files
if [ -d "$MEMORY_DIR" ]; then
    echo ""
    echo "📁 memory/*.md files:"
    for f in "$MEMORY_DIR"/*.md; do
        if [ -f "$f" ]; then
            MATCHES=$(grep -n -i "$QUERY" "$f" 2>/dev/null | head -10)
            if [ -n "$MATCHES" ]; then
                echo ""
                echo "  📄 $(basename "$f"):"
                echo "$MATCHES" | sed 's/^/    /'
            fi
        fi
    done
fi

echo ""
echo "================================================"
echo "✅ Search complete"

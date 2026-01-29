#!/bin/bash
# Memory Search CLI - Search memory files for context
#
# Usage: ./memory-search.sh <query> [max_results]
#
# Examples:
#   ./memory-search.sh "kalshi"
#   ./memory-search.sh "trading" 10
#   ./memory-search.sh "polymarket" 5
#
# Searches: MEMORY.md, memory/*.md, daily notes

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ONDE_ROOT="$(dirname "$SCRIPT_DIR")"
MEMORY_DIR="$ONDE_ROOT/memory"

QUERY="${1:-}"
MAX_RESULTS="${2:-20}"

if [ -z "$QUERY" ]; then
    echo -e "${RED}Usage: $0 <query> [max_results]${NC}"
    echo ""
    echo "Examples:"
    echo "  $0 kalshi      # Search for kalshi mentions"
    echo "  $0 trading 10  # Search trading, max 10 results"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🔍 MEMORY SEARCH: \"$QUERY\"${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

RESULT_COUNT=0

# Search function with context
search_file() {
    local FILE="$1"
    local FILENAME=$(basename "$FILE")
    
    # Case-insensitive search with 2 lines context
    local MATCHES=$(grep -n -i -C 2 "$QUERY" "$FILE" 2>/dev/null || true)
    
    if [ -n "$MATCHES" ]; then
        echo -e "${GREEN}📄 $FILENAME${NC}"
        echo -e "${YELLOW}   Path: $FILE${NC}"
        echo ""
        
        # Show matches with line numbers
        echo "$MATCHES" | while IFS= read -r line; do
            if [[ $line == --* ]]; then
                echo "   ---"
            elif [[ $line =~ ^[0-9]+: ]]; then
                # Highlight the query in results
                highlighted=$(echo "$line" | sed -E "s/($QUERY)/\\\\033[1;33m\1\\\\033[0m/Ig")
                echo -e "   $highlighted"
            else
                echo "   $line"
            fi
        done
        
        echo ""
        RESULT_COUNT=$((RESULT_COUNT + 1))
    fi
}

# Search MEMORY.md first
if [ -f "$ONDE_ROOT/MEMORY.md" ]; then
    search_file "$ONDE_ROOT/MEMORY.md"
fi

# Search memory/*.md files (sorted by date, newest first)
if [ -d "$MEMORY_DIR" ]; then
    for FILE in $(ls -t "$MEMORY_DIR"/*.md 2>/dev/null | head -$MAX_RESULTS); do
        search_file "$FILE"
    done
fi

# Search other relevant files
for FILE in "$ONDE_ROOT/SOUL.md" "$ONDE_ROOT/USER.md" "$ONDE_ROOT/TOOLS.md" "$ONDE_ROOT/HEARTBEAT.md"; do
    if [ -f "$FILE" ]; then
        search_file "$FILE"
    fi
done

if [ $RESULT_COUNT -eq 0 ]; then
    echo -e "${YELLOW}No matches found for \"$QUERY\"${NC}"
else
    echo -e "${GREEN}Found matches in $RESULT_COUNT file(s)${NC}"
fi

echo ""

#!/bin/bash
# Local memory search - NO API KEYS NEEDED
# Uses grep + fuzzy matching for semantic-ish search

MEMORY_DIR="${1:-/Users/mattia/Projects/Onde/memory}"
QUERY="$2"
MAX_RESULTS="${3:-10}"

if [ -z "$QUERY" ]; then
    echo "Usage: $0 <memory_dir> <query> [max_results]"
    exit 1
fi

# Split query into words for multi-term search
IFS=' ' read -ra WORDS <<< "$QUERY"

# Build grep pattern (OR of all words, case insensitive)
PATTERN=$(printf "|%s" "${WORDS[@]}")
PATTERN="${PATTERN:1}"  # Remove leading |

# Search all markdown files, show context
echo "=== Memory Search Results for: $QUERY ==="
echo ""

# Search with context, rank by match count
grep -rniH -C 2 -E "$PATTERN" "$MEMORY_DIR"/*.md "$MEMORY_DIR/../MEMORY.md" 2>/dev/null | \
    head -n $((MAX_RESULTS * 5))

echo ""
echo "=== End Results ==="

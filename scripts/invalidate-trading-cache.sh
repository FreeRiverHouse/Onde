#!/bin/bash
# invalidate-trading-cache.sh - Force refresh trading stats
#
# Since the static site fetches from GitHub Gist, this script:
# 1. Recalculates stats from trade files
# 2. Pushes updated stats to Gist immediately
#
# Usage:
#   ./scripts/invalidate-trading-cache.sh          # Update with v2 data (default)
#   ./scripts/invalidate-trading-cache.sh --v1     # Update with v1 data
#   ./scripts/invalidate-trading-cache.sh --all    # Update with combined v1+v2 data

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Parse arguments
SOURCE="v2"
if [[ "$1" == "--v1" ]]; then
    SOURCE="v1"
elif [[ "$1" == "--all" ]]; then
    SOURCE="all"
fi

echo "🔄 Invalidating trading cache (source: $SOURCE)..."

# Check if gist ID exists
GIST_ID_FILE="data/trading/stats-gist-id.txt"
if [[ ! -f "$GIST_ID_FILE" ]]; then
    echo "❌ Gist ID not found. Run 'python3 scripts/push-stats-to-gist.py --create' first."
    exit 1
fi

# Run the gist update
echo "📊 Calculating fresh stats..."
python3 scripts/push-stats-to-gist.py --source "$SOURCE"

# Verify the update
GIST_ID=$(cat "$GIST_ID_FILE")
RAW_URL="https://gist.githubusercontent.com/FreeRiverHouse/${GIST_ID}/raw/onde-trading-stats.json"

echo ""
echo "✅ Cache invalidated! Stats pushed to Gist."
echo ""
echo "📍 Gist URL: https://gist.github.com/${GIST_ID}"
echo "📍 Raw URL:  ${RAW_URL}"
echo ""
echo "🌐 Static site will fetch fresh data on next page load."
echo "   (No browser cache-busting needed - Gist serves with no-cache headers)"

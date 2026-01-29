#!/bin/bash
# Check i18n completeness between en.json and it.json
# Usage: ./scripts/check-i18n.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
EN_FILE="$PROJECT_DIR/messages/en.json"
IT_FILE="$PROJECT_DIR/messages/it.json"

echo "🔍 Checking i18n completeness..."
echo ""

# Check files exist
if [ ! -f "$EN_FILE" ]; then
    echo "❌ Error: $EN_FILE not found"
    exit 1
fi

if [ ! -f "$IT_FILE" ]; then
    echo "❌ Error: $IT_FILE not found"
    exit 1
fi

# Extract all keys from JSON files (recursive)
extract_keys() {
    python3 -c "
import json
import sys

def extract_keys(obj, prefix=''):
    keys = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            new_key = f'{prefix}.{k}' if prefix else k
            if isinstance(v, dict):
                keys.extend(extract_keys(v, new_key))
            else:
                keys.append(new_key)
    return keys

with open('$1') as f:
    data = json.load(f)
    for key in sorted(extract_keys(data)):
        print(key)
"
}

# Get keys from both files
EN_KEYS=$(extract_keys "$EN_FILE")
IT_KEYS=$(extract_keys "$IT_FILE")

# Find keys missing in Italian
MISSING_IT=$(comm -23 <(echo "$EN_KEYS") <(echo "$IT_KEYS"))
# Find keys missing in English (extras in Italian)
MISSING_EN=$(comm -13 <(echo "$EN_KEYS") <(echo "$IT_KEYS"))

# Report
EN_COUNT=$(echo "$EN_KEYS" | wc -l | tr -d ' ')
IT_COUNT=$(echo "$IT_KEYS" | wc -l | tr -d ' ')

echo "📊 Translation Statistics:"
echo "   English keys: $EN_COUNT"
echo "   Italian keys: $IT_COUNT"
echo ""

HAS_ISSUES=0

if [ -n "$MISSING_IT" ]; then
    MISSING_IT_COUNT=$(echo "$MISSING_IT" | wc -l | tr -d ' ')
    echo "⚠️  Keys in en.json but missing in it.json ($MISSING_IT_COUNT):"
    echo "$MISSING_IT" | head -20 | sed 's/^/   - /'
    if [ "$MISSING_IT_COUNT" -gt 20 ]; then
        echo "   ... and $((MISSING_IT_COUNT - 20)) more"
    fi
    echo ""
    HAS_ISSUES=1
fi

if [ -n "$MISSING_EN" ]; then
    MISSING_EN_COUNT=$(echo "$MISSING_EN" | wc -l | tr -d ' ')
    echo "⚠️  Keys in it.json but missing in en.json ($MISSING_EN_COUNT):"
    echo "$MISSING_EN" | head -20 | sed 's/^/   - /'
    if [ "$MISSING_EN_COUNT" -gt 20 ]; then
        echo "   ... and $((MISSING_EN_COUNT - 20)) more"
    fi
    echo ""
    HAS_ISSUES=1
fi

if [ "$HAS_ISSUES" -eq 0 ]; then
    echo "✅ All keys are in sync!"
else
    echo "💡 Tip: Add missing keys to maintain full translation coverage."
    exit 1
fi

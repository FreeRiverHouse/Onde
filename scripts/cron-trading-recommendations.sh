#!/bin/bash
# Daily trading recommendations refresh
# Run at 00:00 UTC via Clawdbot cron
# Task: T791

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_FILE="$PROJECT_DIR/data/trading/trading-recommendations.json"
HISTORY_FILE="$PROJECT_DIR/data/trading/trading-recommendations-history.jsonl"
ALERT_FILE="$SCRIPT_DIR/kalshi-recommendations-change.alert"

cd "$PROJECT_DIR"

# Backup previous recommendations
PREV_RECOMMENDATIONS=""
if [[ -f "$OUTPUT_FILE" ]]; then
    PREV_RECOMMENDATIONS=$(cat "$OUTPUT_FILE")
fi

# Generate new recommendations
echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Generating trading recommendations..."
python3 scripts/recommend-trading-windows.py --json > "$OUTPUT_FILE.tmp"
mv "$OUTPUT_FILE.tmp" "$OUTPUT_FILE"

# Extract key metrics for comparison
extract_metrics() {
    local file="$1"
    if [[ -f "$file" ]]; then
        jq -r '.recommendations | {avoid_days: .avoid_days, active_hours: .active_hours, best_hours: (.best_windows[:3] | map("\(.day_name) \(.hour):00"))}' "$file" 2>/dev/null || echo "{}"
    else
        echo "{}"
    fi
}

PREV_METRICS=$(echo "$PREV_RECOMMENDATIONS" | jq -r '.recommendations | {avoid_days: .avoid_days, active_hours: .active_hours, best_hours: (.best_windows[:3] // [] | map("\(.day_name // "") \(.hour // ""):00"))}' 2>/dev/null || echo "{}")
NEW_METRICS=$(jq -r '.recommendations | {avoid_days: .avoid_days, active_hours: .active_hours, best_hours: (.best_windows[:3] // [] | map("\(.day_name // "") \(.hour // ""):00"))}' "$OUTPUT_FILE" 2>/dev/null || echo "{}")

# Log to history file
echo "{\"timestamp\": \"$(date -u '+%Y-%m-%dT%H:%M:%SZ')\", \"metrics\": $NEW_METRICS}" >> "$HISTORY_FILE"

# Compare and alert if significant changes
if [[ -n "$PREV_RECOMMENDATIONS" ]]; then
    PREV_AVOID=$(echo "$PREV_METRICS" | jq -r '.avoid_days // [] | sort | join(",")' 2>/dev/null || echo "")
    NEW_AVOID=$(echo "$NEW_METRICS" | jq -r '.avoid_days // [] | sort | join(",")' 2>/dev/null || echo "")
    
    PREV_HOURS=$(echo "$PREV_METRICS" | jq -r '.active_hours | length // 0' 2>/dev/null || echo "0")
    NEW_HOURS=$(echo "$NEW_METRICS" | jq -r '.active_hours | length // 0' 2>/dev/null || echo "0")
    HOUR_DIFF=$((NEW_HOURS - PREV_HOURS))
    if [[ $HOUR_DIFF -lt 0 ]]; then HOUR_DIFF=$((-HOUR_DIFF)); fi
    
    CHANGED=""
    
    if [[ "$PREV_AVOID" != "$NEW_AVOID" ]]; then
        CHANGED="Avoid days changed: [$PREV_AVOID] → [$NEW_AVOID]"
    fi
    
    if [[ $HOUR_DIFF -ge 4 ]]; then
        if [[ -n "$CHANGED" ]]; then
            CHANGED="$CHANGED; "
        fi
        CHANGED="${CHANGED}Active hours changed by $HOUR_DIFF hours"
    fi
    
    if [[ -n "$CHANGED" ]]; then
        echo "⚠️ Trading Recommendations Changed!

$CHANGED

New best windows: $(echo "$NEW_METRICS" | jq -r '.best_hours | join(", ")' 2>/dev/null || echo "N/A")
Avoid days: $(echo "$NEW_METRICS" | jq -r '.avoid_days | join(", ")' 2>/dev/null || echo "none")
Active hours: $NEW_HOURS

See full report: data/trading/trading-recommendations.json" > "$ALERT_FILE"
        echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] ALERT: Recommendations changed significantly!"
    else
        echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] No significant changes detected."
    fi
else
    echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] First run - no comparison available."
fi

# Summary
TRADES=$(jq -r '.trades_analyzed' "$OUTPUT_FILE")
AVOID=$(jq -r '.recommendations.avoid_days | length // 0' "$OUTPUT_FILE")
ACTIVE=$(jq -r '.recommendations.active_hours | length // 0' "$OUTPUT_FILE")

echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Done! Analyzed $TRADES trades. Avoid days: $AVOID, Active hours: $ACTIVE"

#!/bin/bash
# Weekly API error rate report (T474)
# Cron: 0 9 * * 0 (Sundays 9 AM UTC)
#
# Runs analyze-api-errors.py for the past 7 days
# Triggers alert at 5% error rate (lower threshold than real-time 10%)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$SCRIPT_DIR/weekly-api-errors.log"
ALERT_FILE="$SCRIPT_DIR/kalshi-api-error-weekly.alert"

# Log timestamp
echo "=== Weekly API Error Report - $(date -u +%Y-%m-%dT%H:%M:%SZ) ===" >> "$LOG_FILE"

# Run analysis for 7 days
OUTPUT=$(/opt/homebrew/bin/python3 "$SCRIPT_DIR/analyze-api-errors.py" --days 7 2>&1)
echo "$OUTPUT" >> "$LOG_FILE"

# Check for any source with error rate >= 5%
HIGH_ERRORS=$(/opt/homebrew/bin/python3 -c "
import json
from pathlib import Path

stats_file = Path('$SCRIPT_DIR').parent / 'data' / 'trading' / 'api-error-stats.json'
if not stats_file.exists():
    exit(0)

data = json.load(open(stats_file))
sources = data.get('sources', {})

high = []
for src, info in sources.items():
    if info.get('error_rate', 0) >= 5 and info.get('total_events', 0) >= 20:
        high.append(f'{src.upper()}: {info[\"error_rate\"]}% ({info[\"errors\"]} errors)')

if high:
    print('\n'.join(high))
")

if [ -n "$HIGH_ERRORS" ]; then
    echo "" >> "$LOG_FILE"
    echo "⚠️ High error rates detected (>5%):" >> "$LOG_FILE"
    echo "$HIGH_ERRORS" >> "$LOG_FILE"
    
    # Write alert file for heartbeat pickup
    cat > "$ALERT_FILE" << EOF
📊 WEEKLY API ERROR REPORT

⚠️ Sources with elevated error rates (>5%):
$HIGH_ERRORS

Review the past week's API performance and check for patterns.
Full stats: data/trading/api-error-stats.json
EOF
    
    echo "Alert written: $ALERT_FILE" >> "$LOG_FILE"
else
    echo "✅ All sources healthy (<5% error rate)" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"

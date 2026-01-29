#!/bin/bash
# Check for stale alert files (>12h but <24h)
# Logs warning to help debug why heartbeat isn't picking them up

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ALERT_FILES=(
    "kalshi-daily-report.alert"
    "kalshi-low-winrate.alert"
    "kalshi-autotrader-crash.alert"
    "watchdog-stale.alert"
    "kalshi-weekly-report.alert"
    "kalshi-stop-loss.alert"
    "kalshi-regime-change.alert"
    "kalshi-circuit-breaker.alert"
)

TWELVE_HOURS=$((12 * 60 * 60))
TWENTY_FOUR_HOURS=$((24 * 60 * 60))
NOW=$(date +%s)

for alert in "${ALERT_FILES[@]}"; do
    ALERT_PATH="$SCRIPT_DIR/$alert"
    if [[ -f "$ALERT_PATH" ]]; then
        FILE_AGE_SEC=$(( NOW - $(stat -f %m "$ALERT_PATH" 2>/dev/null || stat -c %Y "$ALERT_PATH" 2>/dev/null) ))
        FILE_AGE_HOURS=$(( FILE_AGE_SEC / 3600 ))
        
        if [[ $FILE_AGE_SEC -gt $TWELVE_HOURS && $FILE_AGE_SEC -lt $TWENTY_FOUR_HOURS ]]; then
            echo "[WARNING] Stale alert file: $alert (age: ${FILE_AGE_HOURS}h)"
            echo "  - File exists >12h but <24h - heartbeat may not be processing alerts"
            echo "  - Path: $ALERT_PATH"
        fi
    fi
done

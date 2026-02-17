#!/bin/bash
# Check if Kalshi autotrader is running in DRY RUN mode
# Creates alert if DRY_RUN is detected

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ALERT_FILE="$SCRIPT_DIR/kalshi-dryrun-mode.alert"
DRYRUN_LOG="$SCRIPT_DIR/kalshi-trades-dryrun.jsonl"
REAL_LOG="$SCRIPT_DIR/kalshi-trades.jsonl"

# Check if autotrader is running
if ! pgrep -f kalshi-autotrader > /dev/null; then
    echo "Autotrader not running, skipping dry run check"
    exit 0
fi

# Method 1: Check if DRY_RUN env is set in the process
TRADER_PID=$(pgrep -f kalshi-autotrader | head -1)
if [ -n "$TRADER_PID" ]; then
    # Check /proc/PID/environ on Linux, or ps eww on macOS
    if [[ "$(uname)" == "Darwin" ]]; then
        DRY_RUN_SET=$(ps eww -p "$TRADER_PID" 2>/dev/null | grep -i "DRY_RUN=true\|DRY_RUN=1\|DRY_RUN=yes")
    else
        DRY_RUN_SET=$(cat /proc/"$TRADER_PID"/environ 2>/dev/null | tr '\0' '\n' | grep -i "DRY_RUN=true\|DRY_RUN=1\|DRY_RUN=yes")
    fi
    
    if [ -n "$DRY_RUN_SET" ]; then
        echo "⚠️ DRY RUN MODE DETECTED via environment!"
        if [ ! -f "$ALERT_FILE" ]; then
            cat > "$ALERT_FILE" << EOF
⚠️ AUTOTRADER IN DRY RUN MODE!

⏰ Detected: $(date '+%Y-%m-%d %H:%M:%S')
🔧 PID: $TRADER_PID
📝 Environment: DRY_RUN is set to true

No real trades are being executed!
Consider switching to live mode if this is unintentional.
EOF
            echo "Alert created: $ALERT_FILE"
        fi
        exit 1
    fi
fi

# Method 2: Check if dry run log has recent entries but real log doesn't
if [ -f "$DRYRUN_LOG" ]; then
    DRYRUN_RECENT=$(find "$DRYRUN_LOG" -mmin -60 2>/dev/null)
    REAL_RECENT=$(find "$REAL_LOG" -mmin -60 2>/dev/null)
    
    if [ -n "$DRYRUN_RECENT" ] && [ -z "$REAL_RECENT" ]; then
        DRYRUN_ENTRIES=$(tail -10 "$DRYRUN_LOG" | grep -c "executed\|trade" 2>/dev/null || echo "0")
        if [ "$DRYRUN_ENTRIES" -gt 0 ]; then
            echo "⚠️ DRY RUN MODE DETECTED via log activity!"
            if [ ! -f "$ALERT_FILE" ]; then
                cat > "$ALERT_FILE" << EOF
⚠️ AUTOTRADER APPEARS TO BE IN DRY RUN MODE!

⏰ Detected: $(date '+%Y-%m-%d %H:%M:%S')
📊 Evidence: Recent activity in dry run log but not in real trades log
📝 Dry run log entries in last hour: $DRYRUN_ENTRIES

Review the trading configuration!
EOF
                echo "Alert created: $ALERT_FILE"
            fi
            exit 1
        fi
    fi
fi

# All clear - remove stale alert if exists
if [ -f "$ALERT_FILE" ]; then
    echo "✅ Autotrader in LIVE mode, removing old alert"
    rm -f "$ALERT_FILE"
fi

echo "✅ Autotrader running in LIVE mode"
exit 0

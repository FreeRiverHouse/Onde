#!/bin/bash
# Autotrader Health Cron
# Runs autotrader-health.py and creates alert if issues detected
# Cron: */15 * * * * /Users/mattia/Projects/Onde/scripts/autotrader-health-cron.sh

SCRIPTS_DIR="$(dirname "$0")"
ALERT_FILE="$SCRIPTS_DIR/kalshi-health.alert"
STATE_FILE="$SCRIPTS_DIR/kalshi-health-state.json"
COOLDOWN_HOURS=1

# Get current timestamp
NOW=$(date +%s)

# Check cooldown
if [ -f "$STATE_FILE" ]; then
    LAST_ALERT=$(python3 -c "import json; print(json.load(open('$STATE_FILE')).get('last_alert', 0))" 2>/dev/null || echo 0)
    COOLDOWN_SEC=$((COOLDOWN_HOURS * 3600))
    if [ $((NOW - LAST_ALERT)) -lt $COOLDOWN_SEC ]; then
        echo "In cooldown period, skipping alert check"
        exit 0
    fi
fi

# Run health check and capture output
HEALTH=$(python3 "$SCRIPTS_DIR/autotrader-health.py" 2>/dev/null)
if [ -z "$HEALTH" ]; then
    echo "Failed to get health status"
    exit 1
fi

# Parse health data
RUNNING=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('running', False))")
PID=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('pid', ''))")
TRADES_TODAY=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('trade_count_today', 0))")
WIN_RATE=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('win_rate_today', 0))")
TRADES_SETTLED=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('trades_won_today',0) + d.get('trades_lost_today',0))")

# Check for issues
ALERT_MSG=""

if [ "$RUNNING" = "False" ]; then
    # Check how long it's been down
    if [ -f "$STATE_FILE" ]; then
        LAST_RUNNING=$(python3 -c "import json; print(json.load(open('$STATE_FILE')).get('last_seen_running', 0))" 2>/dev/null || echo 0)
        DOWN_MINS=$(( (NOW - LAST_RUNNING) / 60 ))
        if [ $DOWN_MINS -ge 30 ]; then
            ALERT_MSG="🔴 AUTOTRADER DOWN >30min!\nDown for: ${DOWN_MINS} minutes\nLast seen running: $(date -r $LAST_RUNNING '+%Y-%m-%d %H:%M' 2>/dev/null || echo 'unknown')"
        fi
    else
        ALERT_MSG="🔴 AUTOTRADER DOWN!\nNo previous state found."
    fi
fi

# Check win rate (only if enough trades to be meaningful)
if [ "$TRADES_SETTLED" -ge 5 ]; then
    WIN_RATE_INT=$(echo "$WIN_RATE" | cut -d. -f1)
    if [ "$WIN_RATE_INT" -lt 30 ]; then
        if [ -n "$ALERT_MSG" ]; then
            ALERT_MSG="$ALERT_MSG\n\n"
        fi
        ALERT_MSG="${ALERT_MSG}⚠️ LOW WIN RATE TODAY!\nWin Rate: ${WIN_RATE}%\nTrades: ${TRADES_SETTLED} settled"
    fi
fi

# Update state file
python3 << PYEOF
import json
import os

state_file = "$STATE_FILE"
now = $NOW
running = $RUNNING == "True"

state = {}
if os.path.exists(state_file):
    try:
        with open(state_file) as f:
            state = json.load(f)
    except:
        pass

if running:
    state['last_seen_running'] = now

state['last_check'] = now
state['running'] = running
state['pid'] = "$PID" if "$PID" else None
state['trades_today'] = $TRADES_TODAY
state['win_rate_today'] = $WIN_RATE

with open(state_file, 'w') as f:
    json.dump(state, f, indent=2)
PYEOF

# Create alert if needed
if [ -n "$ALERT_MSG" ]; then
    echo -e "$ALERT_MSG" > "$ALERT_FILE"
    # Update last_alert in state
    python3 -c "import json; d=json.load(open('$STATE_FILE')); d['last_alert']=$NOW; json.dump(d, open('$STATE_FILE','w'), indent=2)"
    echo "Alert created: $ALERT_FILE"
else
    echo "Health check OK - Running: $RUNNING, Trades today: $TRADES_TODAY, Win rate: ${WIN_RATE}%"
fi

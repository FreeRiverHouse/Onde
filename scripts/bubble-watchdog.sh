#!/bin/bash
# Bubble Watchdog — pings group every 5 minutes while Mattia sleeps
# Run for 30 minutes (6 cycles)

CYCLES=6
INTERVAL=300  # 5 minutes

for i in $(seq 1 $CYCLES); do
    echo "=== Cycle $i / $CYCLES at $(date) ==="
    
    # Check autotrader
    AUTOTRADER_PID=$(pgrep -f "kalshi-autotrader" || echo "DEAD")
    echo "Autotrader PID: $AUTOTRADER_PID"
    
    # Check last autotrader log line
    LAST_LOG=$(tail -1 /Users/mattia/Projects/Onde/scripts/kalshi-autotrader.log 2>/dev/null)
    echo "Last log: $LAST_LOG"
    
    if [ "$i" -lt "$CYCLES" ]; then
        echo "Sleeping ${INTERVAL}s..."
        sleep $INTERVAL
    fi
done
echo "=== Watchdog complete ==="

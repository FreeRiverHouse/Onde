#!/bin/bash
# Polymarket iPhone Mirroring Keep-Alive
# Sends a tiny mouse movement every 45 seconds to prevent screen lock.
# Run in background: nohup ./scripts/pm-keepalive.sh &

INTERVAL=45  # seconds between keep-alive taps
LOGFILE="/tmp/pm-keepalive.log"
NAVIGATOR="python3 /Users/mattia/Projects/Onde/scripts/polymarket-navigator.py"

echo "[$(date)] Keep-alive started (interval=${INTERVAL}s)" >> "$LOGFILE"

while true; do
    # Tiny scroll (1 step down then 1 step up) — net zero movement, keeps screen alive
    $NAVIGATOR scroll down -n 1 > /dev/null 2>&1
    sleep 0.5
    $NAVIGATOR scroll up -n 1 > /dev/null 2>&1
    echo "[$(date)] keep-alive ping" >> "$LOGFILE"
    sleep $INTERVAL
done

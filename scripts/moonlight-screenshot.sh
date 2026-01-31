#!/bin/bash
# Screenshot automatico di Moonlight House ogni 5 minuti
# Per il timelapse dell'evoluzione

SCREENSHOT_DIR="/Users/mattia/Projects/Onde/data/moonlight-screenshots"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
URL="http://localhost:5174/static-games/moonlight-magic-house/"

mkdir -p "$SCREENSHOT_DIR"

# Verifica che il dev server sia attivo
if ! /usr/sbin/lsof -i :5174 > /dev/null 2>&1; then
    echo "[$(date)] ⚠️ Dev server not running, starting..." >> "$SCREENSHOT_DIR/screenshot.log"
    cd /Users/mattia/Projects/Onde/apps/moonlight-house
    nohup npm run dev > /tmp/moonlight-dev.log 2>&1 &
    sleep 5
fi

cd /Users/mattia/Projects/Onde
npx playwright screenshot --viewport-size="1920,1080" --wait-for-timeout=3000 "$URL" "$SCREENSHOT_DIR/moonlight_$TIMESTAMP.png" 2>&1

if [ -f "$SCREENSHOT_DIR/moonlight_$TIMESTAMP.png" ]; then
    echo "[$(date)] ✅ Screenshot saved: moonlight_$TIMESTAMP.png" >> "$SCREENSHOT_DIR/screenshot.log"
else
    echo "[$(date)] ❌ Screenshot FAILED" >> "$SCREENSHOT_DIR/screenshot.log"
fi

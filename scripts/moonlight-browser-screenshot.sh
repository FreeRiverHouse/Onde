#!/bin/bash
# Screenshot di Moonlight Magic House via browser headless
# Eseguito ogni 5 minuti per timelapse evoluzione

SCREENSHOT_DIR="/Users/mattia/Projects/Onde/data/moonlight-evolution-screenshots"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="moonlight_${TIMESTAMP}.png"
URL="http://localhost:5173"

# Usa Playwright per screenshot headless
cd /Users/mattia/Projects/Onde
npx playwright screenshot --browser chromium --full-page "$URL" "${SCREENSHOT_DIR}/${FILENAME}" 2>/dev/null

# Fallback: usa screencapture se playwright fallisce
if [ ! -f "${SCREENSHOT_DIR}/${FILENAME}" ]; then
    # Cattura schermo intero come fallback
    screencapture -x "${SCREENSHOT_DIR}/${FILENAME}"
fi

echo "$(date): Screenshot saved: ${FILENAME}" >> "${SCREENSHOT_DIR}/screenshot.log"

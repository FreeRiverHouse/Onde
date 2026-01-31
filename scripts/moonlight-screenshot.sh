#!/bin/bash
# Screenshot automatico di Moonlight Magic House ogni 5 minuti
# Per creare timelapse dell'evoluzione

SCREENSHOT_DIR="/Users/mattia/Projects/Onde/data/moonlight-evolution-screenshots"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="moonlight_${TIMESTAMP}.png"

# Usa screencapture per catturare la finestra del browser
# Prima trova la finestra di Chrome/Safari con Moonlight House
screencapture -x "${SCREENSHOT_DIR}/${FILENAME}"

echo "Screenshot saved: ${FILENAME}"

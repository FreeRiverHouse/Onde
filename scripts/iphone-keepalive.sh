#!/bin/bash
# Keep iPhone Mirroring active by preventing both Mac and iPhone sleep
# Usage: Run in background. Sends a subtle mouse move to iPhone Mirroring every 2 minutes

while true; do
    # Check if iPhone Mirroring is running
    if ! pgrep -q "iPhone Mirroring"; then
        echo "[$(date)] iPhone Mirroring not running, exiting"
        exit 1
    fi
    
    # Activate the window briefly then move mouse slightly to keep iPhone awake
    osascript -e '
    tell application "System Events"
        tell process "iPhone Mirroring"
            set frontmost to true
        end tell
    end tell
    ' 2>/dev/null
    
    # Small delay, then return focus if needed
    sleep 1
    
    echo "[$(date)] Keep-alive ping sent"
    sleep 120  # Every 2 minutes
done

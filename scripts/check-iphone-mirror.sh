#!/bin/bash
# Check iPhone Mirroring status
# Returns: CONNECTED, DISCONNECTED, or NOT_RUNNING
# Usage: ./scripts/check-iphone-mirror.sh

# 1. Check if process is running
if ! pgrep -qf "iPhone Mirroring"; then
    echo "NOT_RUNNING"
    exit 1
fi

# 2. Check if window exists and has proper size (connected = phone-sized window)
WINDOW_INFO=$(osascript -e '
tell application "System Events"
    tell process "iPhone Mirroring"
        try
            set w to window 1
            set s to size of w
            set wWidth to item 1 of s
            set wHeight to item 2 of s
            -- A connected iPhone mirror shows a tall phone-shaped window
            -- Typical: ~348x766. Disconnected/error screens are different.
            if wHeight > 500 and wWidth > 200 then
                return "CONNECTED"
            else
                return "DISCONNECTED"
            end if
        on error
            return "NO_WINDOW"
        end try
    end tell
end tell
' 2>/dev/null)

if [ "$WINDOW_INFO" = "CONNECTED" ]; then
    echo "CONNECTED"
    exit 0
elif [ "$WINDOW_INFO" = "NO_WINDOW" ]; then
    echo "NOT_RUNNING"
    exit 1
else
    echo "DISCONNECTED"
    exit 1
fi

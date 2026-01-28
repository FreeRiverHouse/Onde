#!/bin/bash
# Meta-watchdog: alerts if the main watchdog hasn't run in 15+ minutes
# Cron: */15 * * * * /Users/mattia/Projects/Onde/scripts/meta-watchdog.sh

WATCHDOG_LOG="/Users/mattia/Projects/Onde/scripts/watchdog.log"
ALERT_FILE="/Users/mattia/Projects/Onde/scripts/watchdog-stale.alert"
COOLDOWN_FILE="/tmp/meta-watchdog-cooldown"
COOLDOWN_SECONDS=3600  # 1 hour cooldown between alerts
MAX_AGE_SECONDS=900    # 15 minutes

# Get current time and log modification time
NOW=$(date +%s)

if [ ! -f "$WATCHDOG_LOG" ]; then
    echo "$(date): Watchdog log doesn't exist!" >> /Users/mattia/Projects/Onde/scripts/meta-watchdog.log
    # Create alert
    if [ ! -f "$COOLDOWN_FILE" ] || [ $((NOW - $(stat -f %m "$COOLDOWN_FILE"))) -gt $COOLDOWN_SECONDS ]; then
        echo "🚨 META-WATCHDOG ALERT: Watchdog log file missing! Autotrader monitoring may be down." > "$ALERT_FILE"
        touch "$COOLDOWN_FILE"
    fi
    exit 1
fi

LOG_MTIME=$(stat -f %m "$WATCHDOG_LOG")
AGE=$((NOW - LOG_MTIME))

echo "$(date): Watchdog log age: ${AGE}s (max: ${MAX_AGE_SECONDS}s)" >> /Users/mattia/Projects/Onde/scripts/meta-watchdog.log

if [ $AGE -gt $MAX_AGE_SECONDS ]; then
    echo "$(date): STALE! Watchdog hasn't run in ${AGE}s" >> /Users/mattia/Projects/Onde/scripts/meta-watchdog.log
    
    # Create alert with cooldown
    if [ ! -f "$COOLDOWN_FILE" ] || [ $((NOW - $(stat -f %m "$COOLDOWN_FILE"))) -gt $COOLDOWN_SECONDS ]; then
        cat > "$ALERT_FILE" << EOF
🚨 META-WATCHDOG ALERT

The autotrader watchdog hasn't run in $((AGE / 60)) minutes!

This means the watchdog cron job may have stopped.

Check with: crontab -l | grep watchdog
Manual run: /Users/mattia/Projects/Onde/scripts/watchdog-autotrader.sh

Last log update: $(date -r $LOG_MTIME)
EOF
        touch "$COOLDOWN_FILE"
        echo "$(date): Alert created" >> /Users/mattia/Projects/Onde/scripts/meta-watchdog.log
    else
        echo "$(date): In cooldown, skipping alert" >> /Users/mattia/Projects/Onde/scripts/meta-watchdog.log
    fi
    exit 1
else
    # Clear alert if exists and watchdog is healthy
    if [ -f "$ALERT_FILE" ]; then
        rm "$ALERT_FILE"
        echo "$(date): Watchdog healthy, cleared alert" >> /Users/mattia/Projects/Onde/scripts/meta-watchdog.log
    fi
fi

exit 0

#!/bin/bash
# Watchdog for FRH-ONDE Telegram Bot (AUTONOMOUS VERSION WITH CLAUDE)

BOT_PATH="/Users/mattiapetrucciani/CascadeProjects/Onde/packages/telegram-bot"
BOT_SCRIPT="autonomous-bot.js"
LOG_FILE="$BOT_PATH/bot.log"
LOCK_FILE="/tmp/onde-bot.lock"

cd "$BOT_PATH"

# Check if bot is already running by process name
if pgrep -f "$BOT_SCRIPT" > /dev/null 2>&1; then
    exit 0  # Bot is running, all good
fi

# Clean stale lock file if exists
rm -f "$LOCK_FILE" 2>/dev/null

# Bot not running, start it
echo "$(date): Starting FRH-ONDE AUTONOMOUS bot..." >> "$LOG_FILE"
nohup node "$BOT_SCRIPT" >> "$LOG_FILE" 2>&1 &
echo "$(date): Bot started with PID $!" >> "$LOG_FILE"

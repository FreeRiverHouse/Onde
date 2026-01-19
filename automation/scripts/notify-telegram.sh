#!/bin/bash
# =============================================================================
# TELEGRAM NOTIFICATION HELPER
# Simple script to send messages to Telegram from any automation
# Usage: ./notify-telegram.sh "Your message here"
# =============================================================================

TELEGRAM_BOT_TOKEN="8528268093:AAGNZUcYBm8iMcn9D_oWr565rpxm9riNkBM"
TELEGRAM_CHAT_ID="7505631979"

# Default message or use argument
MESSAGE="${1:-Test notification from Onde automation}"

# Support for HTML parse mode
PARSE_MODE="${2:-HTML}"

# Send the message
response=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -d "chat_id=${TELEGRAM_CHAT_ID}" \
    -d "text=${MESSAGE}" \
    -d "parse_mode=${PARSE_MODE}")

# Check response
if echo "$response" | grep -q '"ok":true'; then
    echo "Message sent successfully"
    exit 0
else
    echo "Failed to send message: $response"
    exit 1
fi

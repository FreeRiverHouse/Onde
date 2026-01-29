#!/bin/bash
# Health Webhook Notifier - Send alerts when /api/health/status returns critical
# Runs via cron every 5 min
# Creates cooldown file to avoid spam (30 min)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COOLDOWN_FILE="$SCRIPT_DIR/.health-webhook-cooldown"
COOLDOWN_SECONDS=1800  # 30 minutes

# Check cooldown
if [ -f "$COOLDOWN_FILE" ]; then
    LAST_ALERT=$(cat "$COOLDOWN_FILE")
    NOW=$(date +%s)
    ELAPSED=$((NOW - LAST_ALERT))
    if [ "$ELAPSED" -lt "$COOLDOWN_SECONDS" ]; then
        echo "Cooldown active ($ELAPSED/$COOLDOWN_SECONDS sec). Skipping."
        exit 0
    fi
fi

# Fetch health status
HEALTH_URL="${HEALTH_URL:-https://onde.surf/api/health/status}"
RESPONSE=$(curl -s --max-time 10 "$HEALTH_URL")

if [ -z "$RESPONSE" ]; then
    echo "$(date): Failed to fetch health status"
    exit 1
fi

# Parse status (requires jq)
STATUS=$(echo "$RESPONSE" | jq -r '.status // "unknown"')
ONDE_LA_OK=$(echo "$RESPONSE" | jq -r '.sites.ondeLa.ok // true')
ONDE_SURF_OK=$(echo "$RESPONSE" | jq -r '.sites.ondeSurf.ok // true')
AUTOTRADER_RUNNING=$(echo "$RESPONSE" | jq -r '.autotrader.running // true')

echo "$(date): Status=$STATUS, onde.la=$ONDE_LA_OK, onde.surf=$ONDE_SURF_OK, autotrader=$AUTOTRADER_RUNNING"

# Only alert on critical status
if [ "$STATUS" != "critical" ]; then
    echo "Status is $STATUS (not critical). No alert needed."
    exit 0
fi

# Build alert message
ALERT_MSG="🚨 CRITICAL HEALTH ALERT\n\n"
ALERT_MSG+="Status: $STATUS\n"
[ "$ONDE_LA_OK" = "false" ] && ALERT_MSG+="❌ onde.la is DOWN\n"
[ "$ONDE_SURF_OK" = "false" ] && ALERT_MSG+="❌ onde.surf is DOWN\n"
[ "$AUTOTRADER_RUNNING" = "false" ] && ALERT_MSG+="❌ Autotrader is NOT RUNNING\n"
ALERT_MSG+="\nTimestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

# Send to Discord webhook (if configured)
DISCORD_WEBHOOK="${DISCORD_WEBHOOK:-}"
if [ -n "$DISCORD_WEBHOOK" ]; then
    curl -s -X POST "$DISCORD_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d "{\"content\": \"$(echo -e "$ALERT_MSG")\"}"
    echo "Sent Discord alert"
fi

# Send to Slack webhook (if configured)
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"
if [ -n "$SLACK_WEBHOOK" ]; then
    curl -s -X POST "$SLACK_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"$(echo -e "$ALERT_MSG")\"}"
    echo "Sent Slack alert"
fi

# Send to Telegram (if configured)
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
    # Format message for Telegram (escape special chars)
    TG_MSG=$(echo -e "$ALERT_MSG" | sed 's/"/\\"/g')
    
    # Send via Telegram Bot API
    TG_RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -H "Content-Type: application/json" \
        -d "{\"chat_id\": \"${TELEGRAM_CHAT_ID}\", \"text\": \"${TG_MSG}\", \"parse_mode\": \"HTML\"}")
    
    # Check if send was successful
    TG_OK=$(echo "$TG_RESPONSE" | jq -r '.ok // false')
    if [ "$TG_OK" = "true" ]; then
        echo "Sent Telegram alert to chat $TELEGRAM_CHAT_ID"
    else
        TG_ERROR=$(echo "$TG_RESPONSE" | jq -r '.description // "Unknown error"')
        echo "Telegram send failed: $TG_ERROR"
    fi
fi

# Create alert file for heartbeat pickup
ALERT_FILE="$SCRIPT_DIR/health-critical.alert"
echo -e "$ALERT_MSG" > "$ALERT_FILE"
echo "Created $ALERT_FILE for heartbeat"

# Record to webhook alert history (T454)
WEBHOOK_HISTORY="$SCRIPT_DIR/../data/alerts/webhook-history.json"
mkdir -p "$(dirname "$WEBHOOK_HISTORY")"

# Build details JSON
DETAILS=$(jq -n \
    --arg ondeLa "$ONDE_LA_OK" \
    --arg ondeSurf "$ONDE_SURF_OK" \
    --arg autotrader "$AUTOTRADER_RUNNING" \
    '{ondeLaDown: ($ondeLa == "false"), ondeSurfDown: ($ondeSurf == "false"), autotraderDown: ($autotrader == "false")}')

if [ ! -f "$WEBHOOK_HISTORY" ]; then
    echo '{"generated_at":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'","alerts":[]}' > "$WEBHOOK_HISTORY"
fi

# Add to history
NEW_ALERT=$(jq -n \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg status "$STATUS" \
    --argjson details "$DETAILS" \
    '{timestamp: $ts, type: "critical", status: $status, details: $details, resolved: false}')

jq --argjson alert "$NEW_ALERT" '
    .generated_at = (now | strftime("%Y-%m-%dT%H:%M:%SZ")) |
    .alerts = ([$alert] + .alerts) | .alerts = .alerts[:100]
' "$WEBHOOK_HISTORY" > "$WEBHOOK_HISTORY.tmp" && mv "$WEBHOOK_HISTORY.tmp" "$WEBHOOK_HISTORY"
echo "Recorded to webhook history"

# Update cooldown
date +%s > "$COOLDOWN_FILE"
echo "Alert sent. Cooldown set for $COOLDOWN_SECONDS seconds."

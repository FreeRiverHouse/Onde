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
TELEGRAM_FAILED=false
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
        TELEGRAM_FAILED=true
    fi
else
    # Telegram not configured, consider it failed for fallback purposes
    TELEGRAM_FAILED=true
fi

# Email fallback (T219) - send if Telegram failed or not configured
ALERT_EMAIL="${ALERT_EMAIL:-}"
SENDGRID_API_KEY="${SENDGRID_API_KEY:-}"
MAILGUN_API_KEY="${MAILGUN_API_KEY:-}"
MAILGUN_DOMAIN="${MAILGUN_DOMAIN:-}"
EMAIL_FROM="${EMAIL_FROM:-alerts@onde.la}"

if [ "$TELEGRAM_FAILED" = true ] && [ -n "$ALERT_EMAIL" ]; then
    echo "Telegram unavailable. Attempting email fallback to $ALERT_EMAIL"
    EMAIL_SUBJECT="🚨 CRITICAL: Onde Health Alert"
    EMAIL_BODY=$(echo -e "$ALERT_MSG" | sed 's/\\n/\n/g')
    
    # Try SendGrid first (if configured)
    if [ -n "$SENDGRID_API_KEY" ]; then
        EMAIL_JSON=$(jq -n \
            --arg to "$ALERT_EMAIL" \
            --arg from "$EMAIL_FROM" \
            --arg subject "$EMAIL_SUBJECT" \
            --arg body "$EMAIL_BODY" \
            '{
                personalizations: [{to: [{email: $to}]}],
                from: {email: $from},
                subject: $subject,
                content: [{type: "text/plain", value: $body}]
            }')
        
        SG_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "https://api.sendgrid.com/v3/mail/send" \
            -H "Authorization: Bearer $SENDGRID_API_KEY" \
            -H "Content-Type: application/json" \
            -d "$EMAIL_JSON")
        
        if [ "$SG_RESPONSE" = "202" ]; then
            echo "Sent email via SendGrid to $ALERT_EMAIL"
        else
            echo "SendGrid email failed (HTTP $SG_RESPONSE)"
        fi
    
    # Try Mailgun (if configured)
    elif [ -n "$MAILGUN_API_KEY" ] && [ -n "$MAILGUN_DOMAIN" ]; then
        MG_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "https://api.mailgun.net/v3/$MAILGUN_DOMAIN/messages" \
            -u "api:$MAILGUN_API_KEY" \
            -F from="$EMAIL_FROM" \
            -F to="$ALERT_EMAIL" \
            -F subject="$EMAIL_SUBJECT" \
            -F text="$EMAIL_BODY")
        
        if [ "$MG_RESPONSE" = "200" ]; then
            echo "Sent email via Mailgun to $ALERT_EMAIL"
        else
            echo "Mailgun email failed (HTTP $MG_RESPONSE)"
        fi
    
    # Try local mail command (if available)
    elif command -v mail &> /dev/null; then
        echo "$EMAIL_BODY" | mail -s "$EMAIL_SUBJECT" "$ALERT_EMAIL" && \
            echo "Sent email via local mail to $ALERT_EMAIL" || \
            echo "Local mail failed"
    
    # Try msmtp (if available)
    elif command -v msmtp &> /dev/null; then
        echo -e "Subject: $EMAIL_SUBJECT\nFrom: $EMAIL_FROM\nTo: $ALERT_EMAIL\n\n$EMAIL_BODY" | msmtp "$ALERT_EMAIL" && \
            echo "Sent email via msmtp to $ALERT_EMAIL" || \
            echo "msmtp failed"
    
    else
        echo "Email fallback configured but no email method available (set SENDGRID_API_KEY, MAILGUN_API_KEY, or install mail/msmtp)"
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

# Upload to KV for persistent storage (T455)
AFFECTED_SERVICES=""
[ "$ONDE_LA_OK" = "false" ] && AFFECTED_SERVICES="${AFFECTED_SERVICES}onde.la,"
[ "$ONDE_SURF_OK" = "false" ] && AFFECTED_SERVICES="${AFFECTED_SERVICES}onde.surf,"
[ "$AUTOTRADER_RUNNING" = "false" ] && AFFECTED_SERVICES="${AFFECTED_SERVICES}autotrader,"
AFFECTED_SERVICES="${AFFECTED_SERVICES%,}"  # Remove trailing comma

if [ -n "$AFFECTED_SERVICES" ]; then
    KV_UPLOAD_SCRIPT="$SCRIPT_DIR/upload-health-alert-to-kv.sh"
    if [ -x "$KV_UPLOAD_SCRIPT" ]; then
        "$KV_UPLOAD_SCRIPT" "critical" "$AFFECTED_SERVICES" "$(echo -e "$ALERT_MSG")" || echo "KV upload failed (non-fatal)"
    else
        echo "KV upload script not found or not executable"
    fi
fi

# Update cooldown
date +%s > "$COOLDOWN_FILE"
echo "Alert sent. Cooldown set for $COOLDOWN_SECONDS seconds."

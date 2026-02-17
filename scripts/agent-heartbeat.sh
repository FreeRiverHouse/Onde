#!/bin/bash
# Agent Heartbeat - Updates agent status on onde.surf
# Called by cron every 5 minutes to keep agent "online" in virtual office

SYNC_URL="${ONDE_SYNC_URL:-https://onde.surf/api/sync}"
SYNC_SECRET="${ONDE_SYNC_SECRET:-onde-sync-2026}"

# Check if Clawdbot gateway is running (via LaunchAgent)
if launchctl list 2>/dev/null | grep -q "com.clawdbot.gateway"; then
    CLAWDINHO_STATUS="active"
elif pgrep -f "clawdbot.*gateway" > /dev/null 2>&1; then
    CLAWDINHO_STATUS="active"
elif pgrep -f "node.*clawdbot" > /dev/null 2>&1; then
    CLAWDINHO_STATUS="active"
else
    CLAWDINHO_STATUS="offline"
fi

# Send heartbeat for Clawdinho
curl -s -X POST "$SYNC_URL" \
    -H "Authorization: Bearer $SYNC_SECRET" \
    -H "Content-Type: application/json" \
    -d "{\"action\": \"agent_heartbeat\", \"agent_id\": \"clawdinho\"}" \
    > /dev/null 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Clawdinho heartbeat sent (gateway: $CLAWDINHO_STATUS)"

# Optional: If we have a sub-agent process running, send heartbeat for Onde-bot too
# For now, Onde-bot is manually triggered, so skip
# if pgrep -f "onde-bot" > /dev/null 2>&1; then
#     curl -s -X POST "$SYNC_URL" \
#         -H "Authorization: Bearer $SYNC_SECRET" \
#         -H "Content-Type: application/json" \
#         -d "{\"action\": \"agent_heartbeat\", \"agent_id\": \"onde-bot\"}"
# fi

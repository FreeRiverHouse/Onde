#!/bin/bash
# Check for pending agent chat messages from onde.surf dashboard
# Called during heartbeat to pick up messages and respond
#
# Usage: ./scripts/check-agent-chat.sh [agent_id]
# Default agent_id: clawdinho

set -e

AGENT_ID="${1:-clawdinho}"
API_URL="https://onde.surf/api/agent-chat/pending"

# Check for pending messages
response=$(curl -s "${API_URL}?agentId=${AGENT_ID}&limit=5" 2>/dev/null || echo '{"count":0}')

count=$(echo "$response" | jq -r '.count // 0')

if [[ "$count" -gt 0 ]]; then
    echo "📬 Found $count pending chat message(s) for $AGENT_ID"
    # Output the messages in JSON format for Clawdbot to process
    echo "$response" | jq -c '.messages[]' 2>/dev/null
    exit 0
else
    echo "No pending chat messages for $AGENT_ID"
    exit 0
fi

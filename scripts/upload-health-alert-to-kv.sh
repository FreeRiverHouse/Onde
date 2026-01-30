#!/bin/bash
# Upload health alert to KV via API
# Usage: ./upload-health-alert-to-kv.sh <status> <services> <message>
# Example: ./upload-health-alert-to-kv.sh critical "onde.la,autotrader" "Site is down"

set -e

STATUS="${1:-critical}"
SERVICES="${2:-unknown}"
MESSAGE="${3:-Health alert triggered}"

API_URL="${HEALTH_ALERTS_API:-https://onde.surf/api/health/alerts-history}"

# Convert comma-separated services to JSON array
SERVICES_JSON=$(echo "$SERVICES" | sed 's/,/","/g')
SERVICES_JSON="[\"$SERVICES_JSON\"]"

# Build JSON payload
PAYLOAD=$(cat <<EOF
{
  "status": "$STATUS",
  "affectedServices": $SERVICES_JSON,
  "message": "$MESSAGE"
}
EOF
)

echo "$(date): Uploading health alert to KV..."
echo "Payload: $PAYLOAD"

RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "Response: $RESPONSE"

# Check for success
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ Alert uploaded successfully"
  exit 0
else
  echo "❌ Failed to upload alert"
  exit 1
fi

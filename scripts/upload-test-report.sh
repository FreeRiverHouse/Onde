#!/bin/bash
# Upload test report to onde.surf KV storage
# Usage: ./upload-test-report.sh [report-file]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPORT_FILE="${1:-$SCRIPT_DIR/daily-test-report.json}"
API_URL="https://onde.surf/api/test-status"

# Secret is optional - set TEST_UPLOAD_SECRET in Cloudflare Pages env
SECRET="${TEST_UPLOAD_SECRET:-}"

if [ ! -f "$REPORT_FILE" ]; then
    echo "❌ Report file not found: $REPORT_FILE"
    exit 1
fi

echo "📤 Uploading test report to $API_URL..."

CURL_ARGS=(-X POST "$API_URL" -H "Content-Type: application/json" -d "@$REPORT_FILE")

if [ -n "$SECRET" ]; then
    CURL_ARGS+=(-H "X-Test-Secret: $SECRET")
fi

RESPONSE=$(curl -s -w "\n%{http_code}" "${CURL_ARGS[@]}")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Upload successful!"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
    echo "❌ Upload failed with HTTP $HTTP_CODE"
    echo "$BODY"
    exit 1
fi

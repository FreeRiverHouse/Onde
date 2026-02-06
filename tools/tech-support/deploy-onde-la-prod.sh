#!/bin/bash
# Deploy onde.la (apps/onde-portal) to Vercel Production
# Usage: ./tools/tech-support/deploy-onde-la-prod.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../../apps/onde-portal" && pwd)"
VERCEL_CMD="/opt/homebrew/bin/vercel"

echo "🌊 Deploying onde.la to Vercel..."
echo "📂 Project: $PROJECT_DIR"

cd "$PROJECT_DIR"

# Step 1: Build locally with production target
echo ""
echo "📦 Building with Vercel (production target)..."
$VERCEL_CMD build --prod --yes

# Step 2: Deploy prebuilt output
echo ""
echo "🚀 Deploying prebuilt output to Vercel..."
DEPLOY_URL=$($VERCEL_CMD deploy --prebuilt --prod --yes --archive=tgz 2>&1 | grep -oE 'https://[^ ]+\.vercel\.app' | head -1)

if [ -z "$DEPLOY_URL" ]; then
    echo "⚠️  Could not extract deploy URL, trying without archive..."
    DEPLOY_URL=$($VERCEL_CMD deploy --prebuilt --prod --yes 2>&1 | grep -oE 'https://[^ ]+\.vercel\.app' | head -1)
fi

if [ -z "$DEPLOY_URL" ]; then
    echo "❌ Deploy failed! Check Vercel dashboard."
    exit 1
fi

echo ""
echo "✅ Deploy URL: $DEPLOY_URL"

# Step 3: Verify
echo ""
echo "🔍 Verifying deployment..."
HTTP_STATUS=$(curl -sI "$DEPLOY_URL" -o /dev/null -w "%{http_code}" --max-time 10 || echo "000")
echo "   Deploy URL status: $HTTP_STATUS"

DOMAIN_STATUS=$(curl -sI "https://onde.la" -o /dev/null -w "%{http_code}" --max-time 10 || echo "000")
echo "   onde.la status: $DOMAIN_STATUS"

echo ""
echo "🏁 Done! Deploy URL: $DEPLOY_URL"

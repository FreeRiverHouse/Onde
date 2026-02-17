#!/bin/bash
# Deploy onde.surf to Cloudflare Pages with pre-deploy checks
# GROK-DASH-001: includes fake-data scan before deploy

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/.."
SURFBOARD_DIR="$PROJECT_DIR/apps/surfboard"

echo "🚀 Deploying onde.surf..."
echo ""

# STEP 1: Pre-deploy scan for fake data
echo "📋 Step 1: Scanning for fake data patterns..."
"$SCRIPT_DIR/scan-fake-data.sh"
echo ""

# STEP 2: Build
echo "📋 Step 2: Building..."
cd "$SURFBOARD_DIR"
npm run build
npm run build:cf
echo ""

# STEP 3: Deploy
echo "📋 Step 3: Deploying to Cloudflare Pages..."
CLOUDFLARE_API_TOKEN="RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw" \
CLOUDFLARE_ACCOUNT_ID="91ddd4ffd23fb9da94bb8c2a99225a3f" \
npx wrangler pages deploy .vercel/output/static --project-name=onde-surf --commit-dirty=true
echo ""

# STEP 4: Verify
echo "📋 Step 4: Verifying deployment..."
sleep 5
STATUS=$(curl -sf -o /dev/null -w "%{http_code}" "https://onde.surf" 2>/dev/null || echo "000")
HEALTH=$(curl -sf -o /dev/null -w "%{http_code}" "https://onde.surf/health" 2>/dev/null || echo "000")

echo "   onde.surf → $STATUS"
echo "   onde.surf/health → $HEALTH"

if [ "$HEALTH" = "200" ]; then
  echo ""
  echo "✅ Deploy successful!"
else
  echo ""
  echo "⚠️  Health check returned $HEALTH — investigate!"
fi

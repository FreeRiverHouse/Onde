#!/bin/bash
#
# deploy-onde-la.sh - Deploy onde.la (Portal - Main Site)
# 
# Usage: ./scripts/deploy-onde-la.sh
#
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ONDE_ROOT="$(dirname "$SCRIPT_DIR")"
APP_DIR="$ONDE_ROOT/apps/onde-portal"

# Cloudflare credentials (hardcoded for reliability)
export CLOUDFLARE_API_TOKEN="RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw"
export CLOUDFLARE_ACCOUNT_ID="91ddd4ffd23fb9da94bb8c2a99225a3f"

echo "🌊 DEPLOY ONDE.LA"
echo "=================="

# 1. Check we're in the right place
if [ ! -d "$APP_DIR" ]; then
    echo "❌ ERROR: $APP_DIR not found"
    exit 1
fi

cd "$APP_DIR"

# 2. Git sync
echo "📥 Git pull..."
git -C "$ONDE_ROOT" pull origin main 2>/dev/null || true

# 3. Install deps if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# 4. Build
echo "🔨 Building..."
npm run build

# 5. Deploy
echo "🚀 Deploying to Cloudflare..."
npx wrangler pages deploy out \
    --project-name=onde-portal \
    --commit-dirty=true

# 6. Verify
echo "✅ Verifying deployment..."
sleep 3
STATUS=$(curl -sI "https://onde.la" | head -1 | cut -d' ' -f2)

if [ "$STATUS" = "200" ]; then
    echo "✅ onde.la is UP (HTTP $STATUS)"
else
    echo "⚠️ onde.la returned HTTP $STATUS - check manually"
fi

echo ""
echo "🌊 Deploy complete!"
echo "   URL: https://onde.la"

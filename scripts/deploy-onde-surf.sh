#!/bin/bash
#
# deploy-onde-surf.sh - Deploy onde.surf (Surfboard Dashboard)
# 
# Usage: ./scripts/deploy-onde-surf.sh
#
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ONDE_ROOT="$(dirname "$SCRIPT_DIR")"
APP_DIR="$ONDE_ROOT/apps/surfboard"

# Cloudflare credentials (hardcoded for reliability)
export CLOUDFLARE_API_TOKEN="RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw"
export CLOUDFLARE_ACCOUNT_ID="91ddd4ffd23fb9da94bb8c2a99225a3f"

echo "🏄 DEPLOY ONDE.SURF"
echo "===================="

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
npm run build:cf

# 5. Deploy
echo "🚀 Deploying to Cloudflare..."
npx wrangler pages deploy .vercel/output/static \
    --project-name=onde-surf \
    --commit-dirty=true

# 6. Verify
echo "✅ Verifying deployment..."
sleep 3
STATUS=$(curl -sI "https://onde.surf" | head -1 | cut -d' ' -f2)

if [ "$STATUS" = "307" ] || [ "$STATUS" = "200" ]; then
    echo "✅ onde.surf is UP (HTTP $STATUS)"
else
    echo "⚠️ onde.surf returned HTTP $STATUS - check manually"
fi

echo ""
echo "🏄 Deploy complete!"
echo "   URL: https://onde.surf"

#!/bin/bash
# Deploy onde.la (apps/onde-portal) to Cloudflare Pages via Wrangler
# Usage: ./tools/tech-support/deploy-onde-la-prod.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../../apps/onde-portal" && pwd)"

# Cloudflare credentials
export CLOUDFLARE_API_TOKEN="RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw"
export CLOUDFLARE_ACCOUNT_ID="91ddd4ffd23fb9da94bb8c2a99225a3f"
CF_PROJECT="onde-portal"

echo "🌊 Deploying onde.la to Cloudflare Pages..."
echo "📂 Project: $PROJECT_DIR"

cd "$PROJECT_DIR"

# Step 1: Clean previous build artifacts
echo ""
echo "🧹 Cleaning previous build..."
rm -rf out .next

# Step 2: Build with static export
echo ""
echo "📦 Building (static export)..."
npm run build

# Verify output dir exists
if [ ! -d "out" ]; then
    echo "❌ Build failed! 'out' directory not found."
    echo "   Make sure next.config has output: 'export' or NEXT_OUTPUT=export is set."
    exit 1
fi

# Step 3: Deploy to Cloudflare Pages
echo ""
echo "🚀 Deploying to Cloudflare Pages (project: $CF_PROJECT)..."
npx wrangler pages deploy out --project-name="$CF_PROJECT" --commit-dirty=true

# Step 4: Verify
echo ""
echo "🔍 Verifying deployment..."
sleep 5

DOMAIN_STATUS=$(curl -sI "https://onde.la" -o /dev/null -w "%{http_code}" --max-time 15 || echo "000")
echo "   onde.la status: $DOMAIN_STATUS"

if [ "$DOMAIN_STATUS" = "200" ]; then
    echo ""
    echo "✅ Deploy successful! onde.la is live."
else
    echo ""
    echo "⚠️  onde.la returned $DOMAIN_STATUS — check Cloudflare dashboard."
    echo "   It may take a minute for the deployment to propagate."
fi

echo ""
echo "🏁 Done!"

#!/bin/bash
# Deploy onde.la to STAGING environment
# URL: https://staging.onde-portal.pages.dev

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ONDE_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
PORTAL_DIR="$ONDE_ROOT/apps/onde-portal"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🧪 DEPLOY ONDE.LA → STAGING${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Build
echo -e "${YELLOW}📦 Building onde-portal...${NC}"
cd "$PORTAL_DIR"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build completed${NC}"
echo ""

# Step 2: Deploy to staging
echo -e "${YELLOW}🚀 Deploying to staging...${NC}"

CLOUDFLARE_API_TOKEN="RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw" \
CLOUDFLARE_ACCOUNT_ID="91ddd4ffd23fb9da94bb8c2a99225a3f" \
npx wrangler pages deploy out \
  --project-name=onde-portal \
  --branch=staging \
  --commit-dirty=true

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deploy failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ STAGING DEPLOY COMPLETATO!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}🔗 URL Staging: https://staging.onde-portal.pages.dev${NC}"
echo ""

# Step 3: Verify
echo -e "${YELLOW}🔍 Verifying staging...${NC}"
sleep 5
HTTP_CODE=$(curl -sI "https://staging.onde-portal.pages.dev" 2>/dev/null | head -1 | cut -d' ' -f2)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Staging is live and responding 200 OK${NC}"
else
    echo -e "${YELLOW}⚠️  Staging returned HTTP $HTTP_CODE (may need a few more seconds)${NC}"
fi

echo ""
echo -e "${BLUE}Prossimi passi:${NC}"
echo "  1. Testa: https://staging.onde-portal.pages.dev"
echo "  2. Se tutto OK: ./deploy-onde-la-prod.sh"
echo ""

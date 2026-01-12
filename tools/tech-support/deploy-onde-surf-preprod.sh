#!/bin/bash
# Deploy Onde.surf - PREPRODUZIONE
# Deploy automatico su Cloudflare Pages per onde.surf (preproduzione)
#
# CARATTERISTICHE:
# - Deploy automatico senza richiesta manuale di autenticazione
# - Wrangler OAuth automatico
# - Build + Deploy + Verifica
#
# Usage:
#   ./deploy-onde-surf-preprod.sh

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
echo -e "${BLUE}  🌊 DEPLOY ONDE.SURF - PREPRODUZIONE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Build
echo -e "${YELLOW}📦 Building portal...${NC}"
cd "$PORTAL_DIR"
npm run build
echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# Step 2: Deploy to Cloudflare Pages
echo -e "${YELLOW}🚀 Deploying to Cloudflare Pages...${NC}"
echo -e "${YELLOW}   Project: onde-portal${NC}"
echo -e "${YELLOW}   Target: PREPRODUZIONE (onde.surf)${NC}"
npx wrangler pages deploy out --project-name=onde-portal --commit-dirty=true
echo -e "${GREEN}✅ Deploy complete${NC}"
echo ""

# Step 3: Extract deployment URL
DEPLOY_URL=$(npx wrangler pages deployment list --project-name=onde-portal --format=json 2>/dev/null | jq -r '.[0].url' 2>/dev/null || echo "")

if [ -z "$DEPLOY_URL" ]; then
    echo -e "${YELLOW}⚠️  Could not extract deployment URL automatically${NC}"
    echo -e "${YELLOW}   Check: https://dash.cloudflare.com/pages/view/onde-portal${NC}"
else
    echo -e "${GREEN}🌐 Deployment URL: $DEPLOY_URL${NC}"
    
    # Step 4: Wait for propagation
    echo ""
    echo -e "${YELLOW}⏳ Waiting 10 seconds for propagation...${NC}"
    sleep 10
    
    # Step 5: Verify deployment
    echo -e "${YELLOW}🔍 Verifying deployment...${NC}"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Deployment verified successfully (HTTP $HTTP_CODE)${NC}"
    else
        echo -e "${YELLOW}⚠️  Deployment returned HTTP $HTTP_CODE${NC}"
    fi
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🎉 DEPLOY PREPRODUZIONE COMPLETATO!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 PROSSIMI STEP:${NC}"
echo -e "${BLUE}   1. Verifica il sito su preproduzione${NC}"
echo -e "${BLUE}   2. Se OK, procedi con deploy su PRODUZIONE (onde.la)${NC}"
echo ""

# Send Telegram notification if credentials are available
if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
    MESSAGE="✅ *ONDE.SURF PREPROD DEPLOYED*%0A%0ADeployment successful!%0A%0AView: $DEPLOY_URL"
    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
        -d "chat_id=$TELEGRAM_CHAT_ID" \
        -d "text=$MESSAGE" \
        -d "parse_mode=Markdown" > /dev/null
    echo -e "${GREEN}📱 Telegram notification sent${NC}"
fi

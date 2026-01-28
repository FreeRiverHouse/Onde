#!/bin/bash
# Deploy Onde.la - PRODUZIONE
# Deploy automatico su Cloudflare Pages per onde.la (PRODUZIONE - SACRO)
#
# CARATTERISTICHE:
# - Test automatici OBBLIGATORI prima del deploy
# - Deploy su onde.la (PRODUZIONE)
# - Verifica deployment
# - Notifica Telegram
#
# Usage:
#   ./deploy-onde-la-prod.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ONDE_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
PORTAL_DIR="$ONDE_ROOT/apps/onde-portal"

# Load .env for Cloudflare credentials
if [ -f "$ONDE_ROOT/.env" ]; then
    export $(grep -E '^CLOUDFLARE_|^TELEGRAM_' "$ONDE_ROOT/.env" | xargs)
fi

echo ""
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${RED}  🌊 DEPLOY ONDE.LA - PRODUZIONE (SACRO)${NC}"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Build
echo -e "${YELLOW}📦 Building portal...${NC}"
cd "$PORTAL_DIR"
npm run build
echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# Step 2: TEST AUTOMATICI (OBBLIGATORIO) - Usa procedura centralizzata
echo -e "${YELLOW}🧪 Running automated tests...${NC}"
"$SCRIPT_DIR/test-website-before-deploy.sh" 8888 onde-la

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  ❌ DEPLOY ABORTED - Tests failed${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Tests passed - Proceeding with deploy${NC}"
echo ""

# Step 3: Deploy to Cloudflare Pages
echo -e "${YELLOW}🚀 Deploying to Cloudflare Pages...${NC}"
echo -e "${YELLOW}   Project: onde-portal${NC}"
echo -e "${YELLOW}   Target: PRODUZIONE (onde.la) - SACRO${NC}"
cd "$PORTAL_DIR"
npx wrangler pages deploy out --project-name=onde-portal --commit-dirty=true
echo -e "${GREEN}✅ Deploy complete${NC}"
echo ""

# Step 4: Extract deployment URL
DEPLOY_URL=$(npx wrangler pages deployment list --project-name=onde-portal --format=json 2>/dev/null | jq -r '.[0].url' 2>/dev/null || echo "")

if [ -z "$DEPLOY_URL" ]; then
    echo -e "${YELLOW}⚠️  Could not extract deployment URL automatically${NC}"
    echo -e "${YELLOW}   Check: https://dash.cloudflare.com/pages/view/onde-portal${NC}"
    DEPLOY_URL="https://onde.la"
else
    echo -e "${GREEN}🌐 Deployment URL: $DEPLOY_URL${NC}"
    
    # Step 5: Wait for propagation
    echo ""
    echo -e "${YELLOW}⏳ Waiting 30 seconds for propagation...${NC}"
    sleep 30
    
    # Step 6: Verify deployment
    echo -e "${YELLOW}🔍 Verifying deployment...${NC}"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Deployment verified successfully (HTTP $HTTP_CODE)${NC}"
    else
        echo -e "${YELLOW}⚠️  Deployment returned HTTP $HTTP_CODE${NC}"
    fi
fi

# Step 7: VERIFICA CONTENUTO DOPO DEPLOY
echo -e "${YELLOW}🔍 Verifying deployed content on onde.la...${NC}"
echo ""
"$SCRIPT_DIR/verify-deployment-content.sh" https://onde.la

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  ⚠️  ATTENZIONE: VERIFICA CONTENUTO FALLITA!${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  Il deploy è completato ma onde.la NON mostra le modifiche corrette${NC}"
    echo -e "${RED}  Possibile problema con custom domain o cache Cloudflare${NC}"
    echo ""
    # Non abortiamo, ma segnaliamo il problema
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🎉 DEPLOY PRODUZIONE COMPLETATO!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📋 Verifica manuale onde.la per confermare${NC}"
echo ""

# Send Telegram notification if credentials are available
if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
    MESSAGE="✅ *ONDE.LA PRODUZIONE DEPLOYED*%0A%0ADeployment successful!%0A%0AView: https://onde.la"
    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
        -d "chat_id=$TELEGRAM_CHAT_ID" \
        -d "text=$MESSAGE" \
        -d "parse_mode=Markdown" > /dev/null
    echo -e "${GREEN}📱 Telegram notification sent${NC}"
fi

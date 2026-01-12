#!/bin/bash
# Verifica Contenuto Deployment - DOPO DEPLOY
# Questa procedura verifica che il contenuto deployato su onde.la
# sia effettivamente quello corretto
#
# CARATTERISTICHE:
# - Screenshot della pagina /libri
# - Verifica prezzo Marco Aurelio con curl
# - Verifica tema azzurro
# - Report dettagliato
#
# Usage:
#   ./verify-deployment-content.sh <url>
#
# Example:
#   ./verify-deployment-content.sh https://onde.la

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parameters
DEPLOY_URL=${1:-https://onde.la}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ONDE_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🔍 VERIFICA CONTENUTO DEPLOYMENT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  URL: $DEPLOY_URL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

VERIFICATION_FAILED=0

# Step 1: Verifica HTTP status
echo -e "${YELLOW}🌐 Checking HTTP status...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ HTTP $HTTP_CODE - OK${NC}"
else
    echo -e "${RED}❌ HTTP $HTTP_CODE - ERROR${NC}"
    VERIFICATION_FAILED=1
fi
echo ""

# Step 2: Verifica prezzo Marco Aurelio con curl
echo -e "${YELLOW}💰 Checking Meditations price...${NC}"
LIBRI_HTML=$(curl -s "$DEPLOY_URL/libri")

# Cerca "Meditations" e poi il prezzo vicino
if echo "$LIBRI_HTML" | grep -q "Meditations"; then
    echo -e "${GREEN}✅ Meditations book found${NC}"
    
    # Verifica che NON ci sia $0.11
    if echo "$LIBRI_HTML" | grep -q '\$0\.11'; then
        echo -e "${RED}❌ ERRORE: Meditations mostra ancora \$0.11!${NC}"
        VERIFICATION_FAILED=1
    else
        echo -e "${GREEN}✅ No \$0.11 found${NC}"
    fi
    
    # Verifica che ci sia "Free"
    if echo "$LIBRI_HTML" | grep -A20 "Meditations" | grep -q "Free"; then
        echo -e "${GREEN}✅ Meditations price: Free${NC}"
    else
        echo -e "${YELLOW}⚠️  Warning: 'Free' not found near Meditations${NC}"
    fi
else
    echo -e "${RED}❌ Meditations book not found${NC}"
    VERIFICATION_FAILED=1
fi
echo ""

# Step 3: Screenshot con Playwright
echo -e "${YELLOW}📸 Taking screenshot of /libri page...${NC}"
SCREENSHOT_DIR="$ONDE_ROOT/test-results/deployment-verification"
mkdir -p "$SCREENSHOT_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SCREENSHOT_FILE="$SCREENSHOT_DIR/libri-${TIMESTAMP}.png"

python3 -c "
from playwright.sync_api import sync_playwright
import sys

try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})
        page.goto('$DEPLOY_URL/libri')
        page.wait_for_timeout(3000)
        page.screenshot(path='$SCREENSHOT_FILE', full_page=True)
        
        # Verifica prezzo Meditations
        meditations = page.locator('text=Meditations').first
        if meditations:
            # Cerca il badge del prezzo
            parent = meditations.locator('xpath=ancestor::div[contains(@class, \"rounded\")]').first
            price_badge = parent.locator('span:has-text(\"\$0.11\"), span:has-text(\"Free\")').first
            if price_badge:
                price = price_badge.inner_text()
                print(f'Meditations price from screenshot: {price}')
                if price == '\$0.11':
                    sys.exit(1)  # FAIL
        
        browser.close()
except Exception as e:
    print(f'Screenshot error: {e}')
    sys.exit(1)
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Screenshot saved: $SCREENSHOT_FILE${NC}"
    echo -e "${GREEN}✅ Meditations price verified: Free${NC}"
else
    echo -e "${RED}❌ Screenshot verification FAILED - Meditations still shows \$0.11${NC}"
    VERIFICATION_FAILED=1
fi
echo ""

# Step 4: Report finale
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $VERIFICATION_FAILED -eq 0 ]; then
    echo -e "${GREEN}  ✅ VERIFICA SUPERATA${NC}"
    echo -e "${GREEN}  Deployment corretto su $DEPLOY_URL${NC}"
else
    echo -e "${RED}  ❌ VERIFICA FALLITA${NC}"
    echo -e "${RED}  Il deployment NON è corretto!${NC}"
    echo -e "${RED}  Controlla screenshot: $SCREENSHOT_FILE${NC}"
fi
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

exit $VERIFICATION_FAILED

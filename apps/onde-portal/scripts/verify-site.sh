#!/bin/bash
# Site Verification Script for onde.la
# Run after deployment to verify all content is correct

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SITE_URL="${1:-https://onde.la}"
ERRORS=0

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ONDE SITE VERIFICATION"
echo "  URL: $SITE_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Function to check content
check_content() {
    local url="$1"
    local pattern="$2"
    local description="$3"
    local should_exist="$4"

    CONTENT=$(curl -s "$url")

    if [ "$should_exist" = "yes" ]; then
        if echo "$CONTENT" | grep -q "$pattern"; then
            echo -e "${GREEN}✅ $description${NC}"
            return 0
        else
            echo -e "${RED}❌ MISSING: $description${NC}"
            ERRORS=$((ERRORS + 1))
            return 1
        fi
    else
        if echo "$CONTENT" | grep -q "$pattern"; then
            echo -e "${RED}❌ FOUND (should not exist): $description${NC}"
            ERRORS=$((ERRORS + 1))
            return 1
        else
            echo -e "${GREEN}✅ NOT FOUND (correct): $description${NC}"
            return 0
        fi
    fi
}

echo "📋 Checking Homepage ($SITE_URL)..."
echo ""

# Homepage checks - must exist
check_content "$SITE_URL" "Beautiful Books" "Title: 'Beautiful Books'" yes
check_content "$SITE_URL" "Freely Shared" "Subtitle: 'Freely Shared'" yes
check_content "$SITE_URL" "#4ECDC4" "Futuristic particles (teal)" yes
check_content "$SITE_URL" "#6C63FF" "Futuristic particles (purple)" yes
check_content "$SITE_URL" "floating-orb" "Floating orb effects" yes
check_content "$SITE_URL" "card-holographic" "Holographic cards" yes
check_content "$SITE_URL" "btn-futuristic" "Futuristic buttons" yes
check_content "$SITE_URL" "Los Angeles" "Location badge" yes
check_content "$SITE_URL" "Meditations" "Book: Meditations" yes
check_content "$SITE_URL" "Shepherd" "Book: Shepherd's Promise" yes

# Homepage checks - must NOT exist
check_content "$SITE_URL" "small italian publishing house" "Old description (should be gone)" no
check_content "$SITE_URL" "piccola casa editrice" "Italian old text (should be gone)" no

echo ""
echo "📋 Checking About Page ($SITE_URL/about/)..."
echo ""

# About page checks
check_content "$SITE_URL/about/" "Magmatic" "About: Magmatic mention" yes
check_content "$SITE_URL/about/" "AI" "About: AI mention" yes
check_content "$SITE_URL/about/" "Los Angeles" "About: Los Angeles" yes

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}  ✅ ALL CHECKS PASSED!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    exit 0
else
    echo -e "${RED}  ❌ $ERRORS ERROR(S) FOUND!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    exit 1
fi

#!/usr/bin/env bash
# cambio-account-clawdbot-token.sh
# Aggiorna il token OAuth di clawdbot dopo un cambio account Claude.
#
# Quando serve: ogni volta che fai claude auth logout + claude auth login
# (cambio account, refresh token, o switch di piano).
#
# Problema risolto: clawdbot ha DUE file auth-profiles.json.
#   1) ~/.clawdbot/credentials/auth-profiles.json        (fallback)
#   2) ~/.clawdbot/agents/main/agent/auth-profiles.json   (usato dall'agent main!)
# Se aggiorni solo il primo, clawdbot continua a usare il token vecchio dal secondo
# e ricevi HTTP 429 rate_limit_error anche se Claude Code funziona.
#
# Usage:
#   ./cambio-account-clawdbot-token.sh          # usa token dal keychain
#   ./cambio-account-clawdbot-token.sh --login  # fa logout+login prima

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

KEYCHAIN_SERVICE="Claude Code-credentials"
KEYCHAIN_ACCOUNT_CLI="mattiapetrucciani"
KEYCHAIN_ACCOUNT_BOT="Claude Code"
CRED_FILE="$HOME/.clawdbot/credentials/auth-profiles.json"
AGENT_FILE="$HOME/.clawdbot/agents/main/agent/auth-profiles.json"

echo -e "${YELLOW}=== Cambio Account Clawdbot Token ===${NC}"
echo ""

# Step 0: optional login
if [[ "${1:-}" == "--login" ]]; then
    echo -e "${YELLOW}[1/5] Logout + Login Claude...${NC}"
    claude auth logout 2>/dev/null || true
    claude auth login
    echo ""
else
    echo -e "${YELLOW}[1/5] Skipping login (usa --login per fare logout+login prima)${NC}"
    echo ""
fi

# Step 1: Read token from keychain
echo -e "${YELLOW}[2/5] Leggo token dal keychain...${NC}"
CREDS=$(security find-generic-password -s "$KEYCHAIN_SERVICE" -a "$KEYCHAIN_ACCOUNT_CLI" -w 2>/dev/null || true)

if [[ -z "$CREDS" ]]; then
    echo -e "${RED}Errore: nessun token trovato nel keychain per account '$KEYCHAIN_ACCOUNT_CLI'${NC}"
    echo "Fai prima: claude auth login"
    exit 1
fi

NEW_TOKEN=$(echo "$CREDS" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['claudeAiOauth']['accessToken'])")
NEW_EXPIRES=$(echo "$CREDS" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['claudeAiOauth']['expiresAt'])")
NEW_TIER=$(echo "$CREDS" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['claudeAiOauth']['rateLimitTier'])")
NEW_SUB=$(echo "$CREDS" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['claudeAiOauth']['subscriptionType'])")

echo -e "  Token: ...${NEW_TOKEN: -12}"
echo -e "  Tier:  $NEW_TIER"
echo -e "  Sub:   $NEW_SUB"
echo ""

# Step 2: Update credentials/auth-profiles.json
echo -e "${YELLOW}[3/5] Aggiorno $CRED_FILE...${NC}"
if [[ -f "$CRED_FILE" ]]; then
    python3 -c "
import json
p = '$CRED_FILE'
d = json.load(open(p))
d['profiles']['anthropic:claude-cli']['token'] = '$NEW_TOKEN'
json.dump(d, open(p, 'w'), indent=2)
print('  OK')
"
else
    echo -e "  ${RED}File non trovato, skip${NC}"
fi
echo ""

# Step 3: Update agents/main/agent/auth-profiles.json (THE IMPORTANT ONE)
echo -e "${YELLOW}[4/5] Aggiorno $AGENT_FILE (il piu' importante!)...${NC}"
if [[ -f "$AGENT_FILE" ]]; then
    python3 -c "
import json
p = '$AGENT_FILE'
d = json.load(open(p))
d['profiles']['anthropic:claude-cli']['token'] = '$NEW_TOKEN'
d['profiles']['anthropic:claude-cli']['expires'] = $NEW_EXPIRES
if 'usageStats' in d and 'anthropic:claude-cli' in d['usageStats']:
    d['usageStats']['anthropic:claude-cli']['errorCount'] = 0
    d['usageStats']['anthropic:claude-cli']['lastFailureAt'] = 0
json.dump(d, open(p, 'w'), indent=2)
print('  OK (+ reset error counters)')
"
else
    echo -e "  ${RED}File non trovato, skip${NC}"
fi
echo ""

# Step 4: Sync keychain entry "Claude Code"
echo -e "${YELLOW}[5/5] Sincronizzo keychain entry '$KEYCHAIN_ACCOUNT_BOT'...${NC}"
security delete-generic-password -s "$KEYCHAIN_SERVICE" -a "$KEYCHAIN_ACCOUNT_BOT" 2>/dev/null || true
security add-generic-password -s "$KEYCHAIN_SERVICE" -a "$KEYCHAIN_ACCOUNT_BOT" -w "$CREDS" 2>/dev/null
echo "  OK"
echo ""

# Restart clawdbot
echo -e "${YELLOW}Restart clawdbot...${NC}"
launchctl stop com.clawdbot.gateway 2>/dev/null || true
sleep 3

# Verify
if pgrep -f "clawdbot-gateway" > /dev/null 2>&1; then
    echo -e "${GREEN}Clawdbot riavviato!${NC}"
else
    echo -e "${YELLOW}Clawdbot in avvio...${NC}"
    sleep 3
fi

# Quick test
echo ""
echo -e "${YELLOW}Test rapido...${NC}"
RESULT=$(clawdbot agent --message "ping" --session-id "token-test-$(date +%s)" --channel telegram --json --timeout 60 2>&1 || true)
if echo "$RESULT" | grep -q '"status": "ok"' && ! echo "$RESULT" | grep -q "429"; then
    echo -e "${GREEN}FUNZIONA! Clawdbot risponde correttamente.${NC}"
else
    echo -e "${RED}ERRORE: clawdbot non risponde. Controlla i log:${NC}"
    echo "  tail -20 ~/.clawdbot/logs/gateway.err.log"
    echo ""
    echo "$RESULT" | head -5
fi

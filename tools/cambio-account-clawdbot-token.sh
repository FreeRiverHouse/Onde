#!/usr/bin/env bash
# cambio-account-clawdbot-token.sh
# Aggiorna token OAuth + modello di clawdbot dopo cambio account o switch modello.
#
# Problema risolto: clawdbot ha DUE file auth-profiles.json + un models.json.
#   1) ~/.clawdbot/credentials/auth-profiles.json        (fallback)
#   2) ~/.clawdbot/agents/main/agent/auth-profiles.json   (usato dall'agent main!)
#   3) ~/.clawdbot/agents/main/agent/models.json          (catalogo modelli)
# Se aggiorni solo il primo, clawdbot continua a usare il token vecchio dal secondo
# e ricevi HTTP 429 rate_limit_error anche se Claude Code funziona.
#
# Usage:
#   ./cambio-account-clawdbot-token.sh                    # aggiorna solo token
#   ./cambio-account-clawdbot-token.sh --login            # logout+login+aggiorna token
#   ./cambio-account-clawdbot-token.sh --model sonnet     # switch a sonnet 4.6
#   ./cambio-account-clawdbot-token.sh --model opus       # switch a opus 4.6
#   ./cambio-account-clawdbot-token.sh --login --model sonnet  # tutto insieme
#
# Modelli disponibili:
#   sonnet  = anthropic/claude-sonnet-4-6  (veloce, rate limit alti, 5x meno costi)
#   opus    = anthropic/claude-opus-4-6    (potente, rate limit bassi)

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

KEYCHAIN_SERVICE="Claude Code-credentials"
KEYCHAIN_ACCOUNT_CLI="mattiapetrucciani"
KEYCHAIN_ACCOUNT_BOT="Claude Code"
CRED_FILE="$HOME/.clawdbot/credentials/auth-profiles.json"
AGENT_FILE="$HOME/.clawdbot/agents/main/agent/auth-profiles.json"
MODELS_FILE="$HOME/.clawdbot/agents/main/agent/models.json"
CONFIG_FILE="$HOME/.clawdbot/clawdbot.json"

# Parse args
DO_LOGIN=false
NEW_MODEL=""
for arg in "$@"; do
    case "$arg" in
        --login) DO_LOGIN=true ;;
        --model)  :;; # next arg is the model
        sonnet|opus)
            NEW_MODEL="$arg" ;;
    esac
done
# Handle --model <value> form
while [[ $# -gt 0 ]]; do
    case "$1" in
        --model) NEW_MODEL="${2:-}"; shift 2 || break ;;
        *) shift ;;
    esac
done

echo -e "${CYAN}=== Clawdbot Token & Model Manager ===${NC}"
echo ""

# ─── STEP 1: Optional login ─────────────────────────────────────────────────
if $DO_LOGIN; then
    echo -e "${YELLOW}[1/6] Logout + Login Claude...${NC}"
    claude auth logout 2>/dev/null || true
    claude auth login
    echo ""
else
    echo -e "${YELLOW}[1/6] Skip login (usa --login per fare logout+login)${NC}"
    echo ""
fi

# ─── STEP 2: Read token from keychain ───────────────────────────────────────
echo -e "${YELLOW}[2/6] Leggo token dal keychain...${NC}"
CREDS=$(security find-generic-password -s "$KEYCHAIN_SERVICE" -a "$KEYCHAIN_ACCOUNT_CLI" -w 2>/dev/null || true)

if [[ -z "$CREDS" ]]; then
    echo -e "${RED}Errore: nessun token nel keychain per '$KEYCHAIN_ACCOUNT_CLI'${NC}"
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

# ─── STEP 3: Update credentials/auth-profiles.json ──────────────────────────
echo -e "${YELLOW}[3/6] Aggiorno $CRED_FILE...${NC}"
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

# ─── STEP 4: Update agents/main/agent/auth-profiles.json (THE IMPORTANT ONE)
echo -e "${YELLOW}[4/6] Aggiorno $AGENT_FILE (il piu' importante!)...${NC}"
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

# ─── STEP 5: Switch model (if requested) ────────────────────────────────────
if [[ -n "$NEW_MODEL" ]]; then
    echo -e "${YELLOW}[5/6] Switch modello a: $NEW_MODEL...${NC}"

    case "$NEW_MODEL" in
        sonnet)
            MODEL_ID="claude-sonnet-4-6"
            MODEL_NAME="Claude Sonnet 4.6"
            MODEL_FULL="anthropic/claude-sonnet-4-6"
            FALLBACK="anthropic/claude-opus-4-6"
            COST_IN=0.003; COST_OUT=0.015; COST_CR=0.0003; COST_CW=0.00375
            ;;
        opus)
            MODEL_ID="claude-opus-4-6"
            MODEL_NAME="Claude Opus 4.6"
            MODEL_FULL="anthropic/claude-opus-4-6"
            FALLBACK="anthropic/claude-sonnet-4-6"
            COST_IN=0.015; COST_OUT=0.075; COST_CR=0.00375; COST_CW=0.01875
            ;;
        *)
            echo -e "${RED}Modello sconosciuto: $NEW_MODEL (usa 'sonnet' o 'opus')${NC}"
            exit 1
            ;;
    esac

    # Ensure both models exist in models.json catalog
    if [[ -f "$MODELS_FILE" ]]; then
        python3 << PYEOF
import json

with open('$MODELS_FILE', 'r') as f:
    data = json.load(f)

anthropic = data.get('providers', {}).get('anthropic', {})
existing_ids = [m['id'] for m in anthropic.get('models', [])]

sonnet = {
    "id": "claude-sonnet-4-6",
    "name": "Claude Sonnet 4.6",
    "reasoning": True,
    "input": ["text", "image"],
    "cost": {"input": 0.003, "output": 0.015, "cacheRead": 0.0003, "cacheWrite": 0.00375},
    "contextWindow": 200000,
    "maxTokens": 16000
}
opus = {
    "id": "claude-opus-4-6",
    "name": "Claude Opus 4.6",
    "reasoning": True,
    "input": ["text", "image"],
    "cost": {"input": 0.015, "output": 0.075, "cacheRead": 0.00375, "cacheWrite": 0.01875},
    "contextWindow": 200000,
    "maxTokens": 16000
}

new_models = []
for m in [sonnet, opus]:
    if m['id'] not in existing_ids:
        new_models.append(m['id'])
    # Always rebuild to ensure both are present
anthropic['models'] = [sonnet, opus]
data['providers']['anthropic'] = anthropic

with open('$MODELS_FILE', 'w') as f:
    json.dump(data, f, indent=2)

if new_models:
    print(f'  Aggiunto al catalogo: {", ".join(new_models)}')
print('  Catalogo: sonnet-4-6 + opus-4-6')
PYEOF
    fi

    # Update clawdbot.json primary model + fallback
    if [[ -f "$CONFIG_FILE" ]]; then
        python3 << PYEOF2
import json

with open('$CONFIG_FILE', 'r') as f:
    data = json.load(f)

agents = data.get('agents', {}).get('defaults', {})
agents['model'] = {
    "primary": "$MODEL_FULL",
    "fallbacks": ["$FALLBACK"]
}
agents['models'] = {
    "anthropic/claude-sonnet-4-6": {"alias": "sonnet"},
    "anthropic/claude-opus-4-6": {"alias": "opus"}
}
data['agents']['defaults'] = agents

with open('$CONFIG_FILE', 'w') as f:
    json.dump(data, f, indent=2)

print(f'  Primary: $MODEL_FULL')
print(f'  Fallback: $FALLBACK')
PYEOF2
    fi
    echo ""
else
    echo -e "${YELLOW}[5/6] Skip switch modello (usa --model sonnet|opus)${NC}"
    echo ""
fi

# ─── STEP 6: Sync keychain + restart ────────────────────────────────────────
echo -e "${YELLOW}[6/6] Sincronizzo keychain + restart...${NC}"
security delete-generic-password -s "$KEYCHAIN_SERVICE" -a "$KEYCHAIN_ACCOUNT_BOT" 2>/dev/null || true
security add-generic-password -s "$KEYCHAIN_SERVICE" -a "$KEYCHAIN_ACCOUNT_BOT" -w "$CREDS" 2>/dev/null
echo "  Keychain OK"

launchctl stop com.clawdbot.gateway 2>/dev/null || true
sleep 4

if pgrep -f "clawdbot-gateway" > /dev/null 2>&1; then
    echo -e "  ${GREEN}Clawdbot riavviato!${NC}"
else
    echo -e "  ${YELLOW}Clawdbot in avvio...${NC}"
    sleep 3
fi
echo ""

# ─── Verify ─────────────────────────────────────────────────────────────────
echo -e "${YELLOW}Test rapido...${NC}"
RESULT=$(clawdbot agent --message "ping - rispondi OK e che modello sei" --session-id "token-test-$(date +%s)" --channel telegram --json --timeout 60 2>&1 || true)

if echo "$RESULT" | grep -q '"status": "ok"' && ! echo "$RESULT" | grep -q "429"; then
    RESP=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['result']['payloads'][0]['text'][:200])" 2>/dev/null || echo "ok")
    MODEL=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['result']['meta']['agentMeta']['model'])" 2>/dev/null || echo "?")
    echo -e "${GREEN}FUNZIONA!${NC}"
    echo -e "  Risposta: $RESP"
    echo -e "  Modello:  $MODEL"
else
    echo -e "${RED}ERRORE: clawdbot non risponde.${NC}"
    echo "  Controlla: tail -20 ~/.clawdbot/logs/gateway.err.log"
    echo "$RESULT" | grep -o '"text":"[^"]*"' | head -1
fi

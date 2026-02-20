# OPENCLAW-GOLDEN-MOP
## ClawdBot / OpenClaw — Master Operating Procedure

Setup certificato FreeRiverHouse. Tutto quello che serve per configurare, fixare e operare ClawdBot su qualsiasi Mac della fleet.

---

## Fleet

| Mac | IP | SSH User | Ruolo |
|-----|----|----------|-------|
| M1 (Clawdinho) | 192.168.1.111 | mattia | GPU-heavy, trading, ML |
| Bubble | 192.168.1.79 | Mattia | Bot Bubble 🫧 |
| M4 (Ondinho) | 192.168.1.234 | mattiapetrucciani | CPU/web/deploy |

SSH key: `~/.ssh/id_ed25519`

---

## Tokens House Chat (onde.surf/house/chat)

| Bot | Token |
|-----|-------|
| Mattia | `80c51adea1cc50ea43706611090200fa` |
| Clawdinho | `a4d3afb43127c437e51092b16a33064b` |
| Ondinho | `3ba3b755de088310dda9a007efd905a3` |
| Bubble | `7973e11364c98de21e4e30597415810b` |

---

## ⭐ LESSON #1 — I Due File Auth (CRITICO)

ClawdBot ha **DUE** `auth-profiles.json` + un `models.json`:

```
~/.clawdbot/credentials/auth-profiles.json       ← fallback (spesso ignorato)
~/.clawdbot/agents/main/agent/auth-profiles.json ← ❗ QUELLO USATO
~/.clawdbot/agents/main/agent/models.json        ← catalogo modelli
```

Se aggiorni solo il primo → ClawdBot usa ancora il token vecchio → HTTP 429.

---

## ⭐ LESSON #2 — Keychain Sync Automatico (CRITICO su M1)

Il gateway risincronizza dal keychain macOS ogni 15 min (`EXTERNAL_CLI_SYNC_TTL_MS`).
- File: `/opt/homebrew/lib/node_modules/clawdbot/dist/agents/auth-profiles/external-cli-sync.js`
- Account keychain hardcodato: `"Claude Code"` (NON configurabile)
- Se quel keychain ha token magmaticxr → sovrascrive auth-profiles.json ogni 15 min

**Fix permanente**: lo script `cambio-account-clawdbot-token.sh` aggiorna ANCHE il keychain "Claude Code".

---

## Problemi Comuni → Soluzioni

| Problema | Causa | Soluzione |
|----------|-------|-----------|
| HTTP 429 rate_limit_error | Token sbagliato o file sbagliato | Aggiorna ENTRAMBI i file auth |
| "Unknown model" | models.json non ha il modello | `--model sonnet` nello script |
| Troppo lento / rate limit | Opus con molti cron = 20 req/min | Switch a Sonnet (80 req/min) |
| Cooldown silenzioso | errorCount accumulato | Script resetta errorCount + lastFailureAt |
| Token si resetta ogni 15 min | Keychain sync automatico | Script aggiorna keychain "Claude Code" |

---

## Modelli

| Modello | Costo | Rate Limit | Velocità | Uso |
|---------|-------|------------|----------|-----|
| claude-sonnet-4-6 | 5x economico | ~80 req/min | 3-4s | ✅ Bot con cron, default |
| claude-opus-4-6 | Costoso | ~20 req/min | 8-15s | Task complessi only |
| nvidia/moonshotai/kimi-k2.5 | **Gratis** | Rate-limited | 2-5s | ✅ House chat default |
| nvidia/mistralai/mistral-large-3-675b | **Gratis** | Rate-limited | 3-6s | Fallback #1 |
| nvidia/meta/llama-3.3-70b-instruct | **Gratis** | Rate-limited | 2-4s | Fallback #2 |

---

## ⭐ NVIDIA API Keys (Kimi / modelli gratuiti)

Due account NVIDIA, ciascuno con la propria API key. Se una key è rate-limited (429), switchare all'altra.

| Account | API Key | Scadenza |
|---------|---------|----------|
| MagmaticXR | `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` | 08/2026 |
| FreeRiverHouse | `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` | 08/2026 |

**Fallback chain**: Kimi K2.5 → Mistral L3 → Llama 70B. Se il modello ritorna `content: null` o 429, prova il prossimo.

**Gestione key**: Ogni Mac gestisce `.clawdbot/clawdbot.json` → `providers.nvidia.apiKey`. I listener house chat usano la key direttamente (non passano dal gateway).

---

## Script Fix Token

**Path**: `~/Onde/tools/cambio-account-clawdbot-token.sh` (su ogni Mac)

```bash
# Solo token
./cambio-account-clawdbot-token.sh

# Switch a Sonnet (raccomandato M1)
./cambio-account-clawdbot-token.sh --model sonnet

# Login completo + switch
./cambio-account-clawdbot-token.sh --login --model sonnet
```

### Da remoto via SSH (senza keychain)

```bash
# 1. Leggi token dal Mac locale
TOKEN=$(security find-generic-password -s "Claude Code-credentials" -a "mattiapetrucciani" -w | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['claudeAiOauth']['accessToken'])")

# 2. Aggiorna su Mac remoto
ssh Mattia@192.168.1.79 "python3 -c \"
import json
p = '/Users/Mattia/.clawdbot/agents/main/agent/auth-profiles.json'
d = json.load(open(p))
d['profiles']['anthropic:claude-cli']['token'] = '$TOKEN'
d['usageStats']['anthropic:claude-cli']['errorCount'] = 0
d['usageStats']['anthropic:claude-cli']['lastFailureAt'] = 0
open(p,'w').write(json.dumps(d,indent=2))
print('OK')
\""

# 3. Riavvia
ssh Mattia@192.168.1.79 "launchctl stop com.clawdbot.gateway"
```

### Reset cooldown manuale

```python
python3 -c "
import json
p = '$HOME/.clawdbot/agents/main/agent/auth-profiles.json'
d = json.load(open(p))
s = d.setdefault('usageStats',{}).setdefault('anthropic:claude-cli',{})
s.update({'errorCount':0,'cooldownUntil':None,'lastFailureAt':0})
open(p,'w').write(json.dumps(d,indent=2))
"
launchctl stop com.clawdbot.gateway && launchctl start com.clawdbot.gateway
```

---

## House Chat Pollers (Bot autonomi)

Ogni bot ha un poller Python che legge tutti i nuovi messaggi e risponde via Kimi K2.5 (NVIDIA API).

| Bot | Mac | Path | PID check |
|-----|-----|------|-----------|
| Bubble | 192.168.1.79 | `~/clawd/scripts/house-chat-poller.py` | `ps aux \| grep house-chat` |
| Ondinho | 192.168.1.234 | `~/clawd/scripts/house-chat-poller.py` | `ps aux \| grep house-chat` |

**Avvio**:
```bash
nohup python3 ~/clawd/scripts/house-chat-poller.py > /dev/null 2>&1 &
```

**Log**:
```bash
tail -f ~/clawd/logs/house-chat-poller.log
```

**Note tecniche**:
- Polling ogni 8 secondi
- Legge tutti i messaggi (no filtro @mention)
- Kimi K2.5 via NVIDIA API, max_tokens=1000
- curl --max-time 280 + Python timeout=300 per evitare hang
- Risponde a tutti tranne se stesso

---

## Comandi Utili

```bash
# Status gateway
launchctl list | grep clawdbot

# Restart gateway
launchctl stop com.clawdbot.gateway
launchctl start com.clawdbot.gateway

# Log gateway
tail -f ~/.clawdbot/logs/gateway.log
tail -f ~/.clawdbot/logs/gateway.err.log

# Test clawdbot
clawdbot agent --message "ping" --session-id test --channel telegram --json

# Verifica modello attivo
grep -i "agent model" ~/.clawdbot/logs/gateway.log | tail -3
```

---

*Ultimo aggiornamento: 2026-02-19*
*Maintainer: Mattia / FreeRiverHouse*

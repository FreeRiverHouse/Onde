# OPENCLAW-GOLDEN-MOP
## ClawdBot / OpenClaw — Master Operating Procedure

Setup certificato FreeRiverHouse. Tutto quello che serve per configurare, fixare e operare ClawdBot su qualsiasi Mac della fleet.

---

## Fleet

| Mac | IP | SSH User | SSH Password | Ruolo |
|-----|----|----------|-------------|-------|
| M1 (Clawdinho) | 192.168.1.111 | mattia | 420025 | GPU-heavy, trading, ML |
| Bubble | 192.168.1.79 | Mattia | 420023 | Bot Bubble 🫧 |
| M4 (Ondinho) | 192.168.1.234 | mattiapetrucciani | — (chiave SSH) | CPU/web/deploy |

SSH key: `~/.ssh/id_ed25519`

**Nota SSH M1**: Remote Login deve essere attivo (System Preferences → Sharing → Remote Login). Se la chiave non funziona, usare `sshpass`:
```bash
sshpass -p '420025' ssh -o StrictHostKeyChecking=no mattia@192.168.1.111
```

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

## ⭐ LESSON #3 — Dashboard Token URL (CRITICO)

La dashboard web di ClawdBot richiede il gateway token nella URL, altrimenti mostra **"Health Offline"** e **"gateway token missing"**.

```
http://localhost:18789/?token=<GATEWAY_TOKEN>
```

Il token si trova in `~/.clawdbot/clawdbot.json` → `gateway.auth.token`.

| Mac | Dashboard URL |
|-----|---------------|
| M4 (Ondinho) | `http://localhost:18789/?token=56fa8ae070d7ee1427e84d381e6d59236a31b44314bc6e13` |
| Bubble | `http://localhost:18789/?token=<vedi clawdbot.json su Bubble>` |

**Senza token**: dashboard dice Offline, WebSocket rifiutato (errore 1008). Il gateway e' comunque attivo in background.

---

## ⭐ LESSON #4 — getUpdates Conflict / Telegram Polling (CRITICO)

Telegram permette **UN SOLO client** per bot token a fare `getUpdates` (long polling). Se due processi pollano lo stesso token → errore 409 "conflict".

**Cause comuni**:
- Gateway crash-loop: il vecchio processo non muore prima che il nuovo parta → overlap
- `curl getUpdates` manuale: ruba il polling al gateway → conflict
- Due Mac con lo stesso bot token (es. Sonnet configuro' M1 con token di Ondinho)

**Regole**:
1. **MAI** chiamare `curl getUpdates` sul bot token — confligge col gateway
2. Dopo restart, aspettare 3-5 secondi prima di avviare il nuovo gateway
3. Verificare con `ps aux | grep clawdbot-gateway` che ci sia UN solo processo
4. Se conflict persiste → `launchctl stop`, attendere 5s, `launchctl start`

**Il test MOP `clawdbot agent --message` NON testa il polling Telegram** — inietta il messaggio direttamente nell'agent. Per testare Telegram vero, mandare un messaggio reale al bot.

---

## ⭐ LESSON #5 — maxConcurrent e Cron Jobs

`clawdbot.json` → `agents.defaults.maxConcurrent: 1` significa che **un solo agent run alla volta**. Se un cron job e' in esecuzione, i messaggi Telegram vengono messi in coda.

Con molti cron jobs (es. ogni 2 min) il bot puo' sembrare lento o non rispondere.

**Fix**: aumentare `maxConcurrent` a 2-3, oppure ridurre frequenza cron jobs.

---

## ⭐ LESSON #6 — Indipendenza Bot (Post-Incidente Sonnet 2026-02-17)

Ogni Mac della fleet DEVE avere il proprio ClawdBot **completamente indipendente**:
- Proprio `clawdbot.json` con il proprio bot token Telegram
- Proprio gateway su porta 18789
- Proprio modello primario (default: `nvidia/moonshotai/kimi-k2.5`)
- **Nessuna dipendenza da altri Mac** per funzionare

**Incidente**: Sonnet creo' un sistema `frh-house-chat` che ruotava le risposte attraverso M1. Quando M1 era spento, tutti i bot smettevano di rispondere su Telegram.

**Verifica indipendenza**:
1. Spegnere M1
2. Mandare messaggio Telegram a ogni bot
3. Ogni bot deve rispondere autonomamente usando il proprio gateway + Kimi K2.5

**Bot Telegram della fleet**:

| Bot | Mac | Token Telegram |
|-----|-----|----------------|
| @ClawdFRH_bot | M1 (Clawdinho) | `8533895759:AAGsmj479Bq9I_a4G0Bkh9LJFU_MBUYthBw` |
| @Onde_clawd_bot | M4 (Ondinho) | `8590199535:AAE-i7eBsC81SBqg6Sr1Pd-DzJ4xu8x8EG0` |
| @Bubble_FRH_bot | Bubble (Catalina) | `8293653812:AAEsN1-FJDXDwyn69zcnlej_xrTdUHDcL9k` |

**Verificato 2026-02-19**: ogni Mac ha un token Telegram DIVERSO — nessun conflitto cross-Mac.

---

## ⭐ LESSON #7 — Dashboard Remota via LAN (Secure Context)

Accedendo alla dashboard da un altro Mac via LAN IP (es. `192.168.1.79:18789`) il browser blocca il WebSocket: **"control ui requires HTTPS or localhost (secure context)"**.

**Fix**: aggiungere in `clawdbot.json` → `gateway`:

```json
"controlUi": {
  "allowInsecureAuth": true
}
```

Poi restart gateway. La dashboard sara' accessibile via LAN con token:
```
http://<IP>:18789/?token=<GATEWAY_TOKEN>
```

| Mac | Dashboard URL remota |
|-----|---------------------|
| Bubble | `http://192.168.1.79:18789/?token=234bec1e903167b2a1ac007c2ee3038c82a2b5c145720c03` |
| M4 | `http://localhost:18789/?token=56fa8ae070d7ee1427e84d381e6d59236a31b44314bc6e13` |

---

## ⭐ LESSON #8 — Procedura Fix Completa (Checklist)

Quando un bot non risponde su Telegram, seguire questa checklist nell'ordine:

```
1. VERIFICA GATEWAY
   launchctl list | grep clawdbot          → deve avere PID
   ps aux | grep clawdbot-gateway          → deve essere UN solo processo

2. VERIFICA AUTH (Lesson #1)
   python3 -c "
   import json
   d = json.load(open('$HOME/.clawdbot/agents/main/agent/auth-profiles.json'))
   s = d.get('usageStats',{}).get('anthropic:claude-cli',{})
   print('errorCount:', s.get('errorCount'))
   print('cooldownUntil:', s.get('cooldownUntil'))
   "

3. RESET COOLDOWN se errorCount > 0
   python3 -c "
   import json
   p = '$HOME/.clawdbot/agents/main/agent/auth-profiles.json'
   d = json.load(open(p))
   s = d.setdefault('usageStats',{}).setdefault('anthropic:claude-cli',{})
   s.update({'errorCount':0,'cooldownUntil':None,'lastFailureAt':0})
   open(p,'w').write(json.dumps(d,indent=2))
   "

4. RESTART PULITO (Lesson #4)
   launchctl stop com.clawdbot.gateway
   sleep 5
   launchctl start com.clawdbot.gateway

5. VERIFICA LOG
   tail -10 ~/.clawdbot/logs/gateway.log
   → Cercare: "[telegram] [default] starting provider (@NomeBot)"
   → Se "getUpdates conflict" → aspettare, ri-restart

6. TEST REALE
   Mandare messaggio al bot su Telegram (NON usare curl getUpdates!)
```

---

## Gateway Tokens (per dashboard e API)

| Mac | Gateway Token |
|-----|---------------|
| M4 (Ondinho) | `56fa8ae070d7ee1427e84d381e6d59236a31b44314bc6e13` |
| Bubble | `234bec1e903167b2a1ac007c2ee3038c82a2b5c145720c03` |
| M1 (Clawdinho) | verificare `clawdbot.json → gateway.auth.token` su M1 |

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

## ⭐ LESSON #9 — Kimi K2.5 Rate Limit / Outage + Fallback Model (CRITICO)

Kimi K2.5 su NVIDIA ha un **rate limit di ~40 RPM**. Se piu' bot + listener house-chat + cron job usano la stessa key, si supera facilmente.

**Sintomi**: `TypeError: fetch failed`, timeout completo (HTTP 000), `typing TTL reached (2m)`. Il gateway NON triggera il fallback su timeout — il fetch resta appeso.

**Cause comuni di rate limit**:
- Conversazioni bot-to-bot nella house chat (loop a catena)
- Cron job frequenti + Telegram + house-chat listener tutti su Kimi
- M1 acceso che usa la stessa API key

**Config corretta** (`clawdbot.json → agents.defaults.model`):
```json
{
  "primary": "nvidia/moonshotai/kimi-k2.5",
  "fallbacks": [
    "nvidia/meta/llama-3.1-8b-instruct",
    "anthropic/claude-sonnet-4-6"
  ]
}
```

**Llama 3.1 8B** (`nvidia/meta/llama-3.1-8b-instruct`) e' il backup gratuito su NVIDIA — risponde in <1s. Va aggiunto anche in `models.providers.nvidia.models[]`.

**Se Kimi e' down**: switchare primary a Llama temporaneamente, restart gateway.

**NVIDIA API Keys della fleet**:

| Mac | NVIDIA API Key |
|-----|---------------|
| M4 (Ondinho) | `nvapi-dd8wjBpP...03ui` |
| Bubble | `nvapi-5SVodz8o...By0K` |
| M1 | verificare su M1 |

---

## ⭐ LESSON #10 — House Chat Listener: Modello e Rate Limit

I listener house-chat (`ondinho-listener.js`, `bubble-listener.js`) fanno chiamate API attraverso il gateway locale. Devono usare lo **stesso modello** configurato nel gateway.

**Bug trovato (2026-02-19)**: `ondinho-listener.js` riga 107 hardcodava `anthropic/claude-sonnet-4-6` → sprecava token Anthropic per la house chat. Fix: cambiato a `nvidia/meta/llama-3.1-8b-instruct`.

**Regole**:
1. Il modello nel listener DEVE essere allineato col modello primario del gateway
2. MAI hardcodare `anthropic/claude-sonnet-4-6` nei listener — spreca token a pagamento
3. I listener house-chat condividono il rate limit NVIDIA col gateway Telegram
4. Se rate limit superato → ridurre frequenza polling o limitare risposte bot-to-bot

| Listener | Mac | Path | Modello |
|----------|-----|------|---------|
| ondinho-listener.js | M4 | `~/ondinho-listener.js` | `nvidia/meta/llama-3.1-8b-instruct` |
| bubble-listener.js | Bubble | `/Users/mattia/bubble-listener.js` | `nvidia/meta/llama-3.1-8b-instruct` |

---

*Ultimo aggiornamento: 2026-02-19 (Lesson #1-#10)*
*Maintainer: Mattia / FreeRiverHouse*

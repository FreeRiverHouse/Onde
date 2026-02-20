# ClawdBot Dashboard - BOT-CONFIGS

**URL:** https://onde.surf/bot-configs
**Password:** `Fr33R1v3r2918!` (layer 2, sopra Google Auth)
**Data implementazione:** 2026-02-17

---

## Cos'è

Dashboard centralizzata su onde.surf che mostra in tempo reale lo stato di ClawdBot su tutti i Mac della flotta FRH. Ogni Mac fa heartbeat ogni 60s e aggiorna la sua card.

**Mostra per ogni Mac:**
- Modello primario e fallback attivi
- Account Anthropic in uso + token ending
- Rate limit 5h / 7d (% utilizzo)
- Gateway status (running/stopped)
- Pulsanti switch modello (applicati al prossimo heartbeat ~1 min)

---

## Architettura

```
Mac (LaunchAgent ogni 60s)
  └─ ~/.clawdbot/heartbeat.py
       ├─ Legge ~/.clawdbot/clawdbot.json          → primary/fallbacks
       ├─ Legge agents/main/agent/auth-profiles.json → token, cooldown
       ├─ Chiama api.anthropic.com                   → rate limit headers
       └─ POST https://onde.surf/api/bot-configs/heartbeat
              └─ Scrive KV: bot-status:{macId}  TTL 600s
              └─ Legge KV: bot-cmd:{macId}      (one-shot, delete after read)

onde.surf/bot-configs (browser, auto-refresh 30s)
  └─ GET /api/bot-configs/status
       └─ Legge KV: bot-status:m1, bot-status:bubble, bot-status:m4

Utente clicca "Switch Sonnet"
  └─ POST /api/bot-configs/command
       └─ Scrive KV: bot-cmd:{macId}  TTL 600s
       └─ Mac lo legge al prossimo heartbeat → esegue cambio-account-clawdbot-token.sh
```

**Storage:** Cloudflare WEBHOOKS_KV
**KV keys:**
- `bot-status:{macId}` — stato heartbeat, TTL 600s
- `bot-cmd:{macId}` — comando pendente, TTL 600s, one-shot

---

## File Codebase (onde.surf)

| File | Descrizione |
|------|-------------|
| `src/app/bot-configs/page.tsx` | Pagina client: PasswordGate + Dashboard + BotCard |
| `src/app/api/bot-configs/heartbeat/route.ts` | POST pubblico (secret header), scrive/legge KV |
| `src/app/api/bot-configs/status/route.ts` | GET protetto da cookie, legge tutti i KV |
| `src/app/api/bot-configs/auth/route.ts` | POST verifica password, setta cookie httpOnly |
| `src/app/api/bot-configs/command/route.ts` | POST protetto da cookie, scrive comando KV |

**Auth cookie:** `frh_bots_auth=FRH-BOTS-OK-2026` (httpOnly, 30 giorni)
**Heartbeat secret:** header `x-frh-secret: FRH-BOTS-2026`

---

## Mac della Flotta

| macId | Hostname Display | IP | SSH User | Python | LaunchAgent |
|-------|------------------|----|----------|--------|-------------|
| `m1` | FRH-M1-PRO | (locale) | mattia | /opt/homebrew/bin/python3.11 | com.frh.clawdbot-heartbeat |
| `bubble` | FRH-BUBBLE | 192.168.1.79 | `mattia` | /usr/bin/python3 (3.8.2) | com.frh.clawdbot-heartbeat |
| `m4` | FRH-M4-PRO | 192.168.1.234 | `mattiapetrucciani` (alias SSH: `m4`) | /opt/homebrew/bin/python3 | com.frh.clawdbot-heartbeat |

**SSH config** (`~/.ssh/config` su M1):
```
Host m4 ondinho m4-pro
    HostName 192.168.1.234
    User mattiapetrucciani
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
```
Bubble non ha alias SSH → usare `mattia@192.168.1.79` con `-i ~/.ssh/id_ed25519`.

---

## Script Heartbeat

**Path su ogni Mac:** `~/.clawdbot/heartbeat.py`
**Source originale (M1):** `~/Projects/Onde/tools/clawdbot-dashboard/send-heartbeat.py`

Configurato via env vars nel plist:
```
CLAWDBOT_MAC_ID     = m1 | bubble | m4
CLAWDBOT_HOSTNAME   = FRH-M1-PRO | FRH-BUBBLE | FRH-M4-PRO
CLAWDBOT_BOT_NAME   = @ClawdFRH_bot | n/a | n/a
```

**Differenza M1 vs remote:** M1 legge token da keychain (`security find-generic-password`). Bubble/M4 lo leggono direttamente da `auth-profiles.json` (non hanno Claude Code in keychain).

---

## Token Account Mapping

```python
TOKEN_ACCOUNTS = {
    "hRg-PCbGEAAA":        "freeriverhouse",   # M1 (token corrente)
    "DWw-pWTs5AAA":        "magmaticxr",        # M1 (token vecchio - rate limited!)
    "dBC16Rpm3GA-ohbZNAAA": "freeriverhouse",   # Bubble + M4
}
```

**CRITICO:** Tutti i Mac usano `freeriverhouse@gmail.com`. Se un Mac mostra `magmaticxr` → token sbagliato, 7d rate limit al 100%.

---

## LaunchAgent

**Path su ogni Mac:** `~/Library/LaunchAgents/com.frh.clawdbot-heartbeat.plist`
**Log:** `/tmp/clawdbot-heartbeat.log`

```xml
<key>StartInterval</key><integer>60</integer>
<key>RunAtLoad</key><true/>
```

**Comandi gestione:**
```bash
# Reload dopo modifiche
launchctl unload ~/Library/LaunchAgents/com.frh.clawdbot-heartbeat.plist
launchctl load  ~/Library/LaunchAgents/com.frh.clawdbot-heartbeat.plist

# Test manuale
CLAWDBOT_MAC_ID=m1 CLAWDBOT_HOSTNAME=FRH-M1-PRO python3 ~/.clawdbot/heartbeat.py

# Vedi log
tail -f /tmp/clawdbot-heartbeat.log
```

---

## Troubleshooting

**Dashboard mostra Mac offline:**
1. Controlla `/tmp/clawdbot-heartbeat.log` sul Mac
2. Verifica LaunchAgent attivo: `launchctl list | grep clawdbot-heartbeat`
3. Test manuale heartbeat (vedi sopra)

**"Unknown" su Account:**
→ Token ending non in `TOKEN_ACCOUNTS`. Aggiungere mappatura in heartbeat.py e redeployare.

**Rate limit 7d alto / account non ok:**
→ Token sbagliato. Verificare con `cat ~/.clawdbot/agents/main/agent/auth-profiles.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['profiles']['anthropic:claude-cli']['token'][-20:])"`.
→ Deve finire con `hRg-PCbGEAAA` (M1) o `dBC16Rpm3GA-ohbZNAAA` (Bubble/M4).

**"OAuth token refresh failed for anthropic" (token scaduto, non rate limit):**
Il token OAuth scade ogni ~8 ore. Procedura di refresh senza `claude auth login`:
```bash
# Leggi refresh token dal keychain
REFRESH=$(security find-generic-password -s "Claude Code-credentials" -a "mattia" -w | \
  python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print(d['claudeAiOauth']['refreshToken'])")

# Chiama endpoint OAuth (CLIENT_ID fisso, da pi-ai/utils/oauth/anthropic.js)
RESULT=$(curl -s -X POST "https://console.anthropic.com/v1/oauth/token" \
  -H "Content-Type: application/json" \
  -d "{\"grant_type\":\"refresh_token\",\"client_id\":\"9d1c250a-e61b-44d9-88ed-5944d1962f5e\",\"refresh_token\":\"$REFRESH\"}")

NEW_ACCESS=$(echo $RESULT | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
NEW_REFRESH=$(echo $RESULT | python3 -c "import sys,json; print(json.load(sys.stdin)['refresh_token'])")

# Aggiorna auth-profiles.json + reset cooldown
python3 -c "
import json, time, os
p = os.path.expanduser('~/.clawdbot/agents/main/agent/auth-profiles.json')
d = json.load(open(p))
d['profiles']['anthropic:claude-cli']['token']  = '$NEW_ACCESS'
d['profiles']['anthropic:claude-cli']['access'] = '$NEW_ACCESS'
d['profiles']['anthropic:claude-cli']['refresh'] = '$NEW_REFRESH'
d['profiles']['anthropic:claude-cli']['expires'] = int((time.time() + 28800) * 1000)
s = d.setdefault('usageStats',{}).setdefault('anthropic:claude-cli',{})
s['errorCount'] = 0; s['cooldownUntil'] = None; s['lastFailureAt'] = 0
open(p,'w').write(json.dumps(d, indent=2))
"
# Aggiorna anche i keychain (gateway risincronizza da "Claude Code" ogni 15min)
NEW_KEYCHAIN=$(security find-generic-password -s "Claude Code-credentials" -a "mattia" -w | \
  python3 -c "
import sys,json,time
d=json.loads(sys.stdin.read())
d['claudeAiOauth']['accessToken']='$NEW_ACCESS'
d['claudeAiOauth']['refreshToken']='$NEW_REFRESH'
d['claudeAiOauth']['expiresAt']=int((time.time()+28800)*1000)
print(json.dumps(d))")
security delete-generic-password -s "Claude Code-credentials" -a "mattia" 2>/dev/null
security add-generic-password -s "Claude Code-credentials" -a "mattia" -w "$NEW_KEYCHAIN"
security delete-generic-password -s "Claude Code-credentials" -a "Claude Code" 2>/dev/null
security add-generic-password -s "Claude Code-credentials" -a "Claude Code" -w "$NEW_KEYCHAIN"

launchctl stop com.clawdbot.gateway
```
⚠️ Il refresh token è ONE-TIME USE — usato una volta, è invalidato. Aggiornare subito il keychain.

**Deploy su nuovo Mac:**
```bash
scp ~/.clawdbot/heartbeat.py NEWMAC:~/.clawdbot/heartbeat.py
# Creare plist con MAC_ID/HOSTNAME corretti
# launchctl load ...
```
Aggiungere `KNOWN_MACS` in `src/app/api/bot-configs/status/route.ts`.

---

## Deploy onde.surf

```bash
cd ~/Projects/Onde/apps/surfboard
npm run build
npx wrangler pages deploy .next --project-name surfboard
```

---

*Ultimo aggiornamento: 2026-02-17*

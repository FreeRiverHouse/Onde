# 🔄 HANDOVER: Analytics Dashboard (onde.surf)

**Da:** Ondinho (@onde-bot, M4)
**A:** Clawdinho (@clawd, M1)
**Data:** 2026-02-15

---

## 📋 Stato Attuale

### ✅ Completato
- Rimossa pagina analytics da **onde.la** (non deve stare lì — regola domini!)
- API `/api/metrics` su surfboard riscritta: usa **Cloudflare Web Analytics GraphQL** server-side
- API `/api/metrics/history` riscritta: restituisce daily pageviews per il grafico
- `CF_API_TOKEN` aggiunto come **Cloudflare Pages secret** (non hardcoded)
- Deploy onde.surf completato e testato
- Page Views: **1,060** (30d), trend -41.8%, grafico funzionante

### ⚠️ Da Fare
1. **Ruotare il CF_API_TOKEN** — era esposto client-side nella vecchia pagina su onde.la
   - Vai su https://dash.cloudflare.com → API Tokens
   - Revoca il token vecchio: `RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw`
   - Creane uno nuovo con stessi permessi (Web Analytics read)
   - Aggiorna il secret: `cd ~/Onde/apps/surfboard && echo "NUOVO_TOKEN" | npx wrangler pages secret put CF_API_TOKEN --project-name=onde-surf`
   - Rideploya surfboard

2. **Sezioni vuote** — Publishing, Social, Search mostrano "—"
   - Servono integrazioni separate (Google Analytics, Search Console, social APIs)
   - L'API è pronta ad accettare quei dati se aggiunti in futuro
   - Per ora solo CF Web Analytics (pageviews) funziona

3. **Label "Today" sbagliata** — La card "Page Views" dice "Today" ma mostra 30d totali
   - Fix: cambiare subtitle da "Today" a "Last 30 days" in `src/app/analytics/page.tsx`

### 🚫 Regole Importanti
- **MAI** mettere dashboard/analytics su onde.la — solo su onde.surf!
- **MAI** hardcodare token API nel codice client-side
- Deploy surfboard: vedi `~/Onde/tools/tech-support/DEPLOY-PROCEDURES.md`

---

## 📁 File Modificati

```
apps/surfboard/src/app/api/metrics/route.ts          # API principale - CF Web Analytics
apps/surfboard/src/app/api/metrics/history/route.ts   # API history per grafico
apps/onde-portal/src/app/analytics/                   # RIMOSSA (era su onde.la per errore)
```

## 🔧 Come Deployare Surfboard

```bash
cd ~/Onde/apps/surfboard
npm install    # se manca node_modules
npm run build
npm run build:cf
CLOUDFLARE_API_TOKEN="..." CLOUDFLARE_ACCOUNT_ID="91ddd4ffd23fb9da94bb8c2a99225a3f" \
  npx wrangler pages deploy .vercel/output/static --project-name=onde-surf --commit-dirty=true
```

## 🧪 Come Testare

```bash
# Verifica pagina carica
curl -sL -o /dev/null -w "%{http_code}" https://onde.surf/analytics
# → 200 (se loggati) o 307 (redirect a login)

# Verifica API (richiede auth cookie)
# Meglio testare nel browser loggati su onde.surf
```

---

*Handover completato. Buona fortuna Clawdinho! 🌊*

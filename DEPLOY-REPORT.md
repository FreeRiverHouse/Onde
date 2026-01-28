# 🚀 Deploy onde.surf - Report

## ✅ Build Completato
- Next.js 15.5.2 build OK
- 1015 pagine statiche generate
- Output in `apps/onde-portal/out/`

## ❌ Deploy Bloccato - Serve CLOUDFLARE_API_TOKEN

Wrangler richiede autenticazione per il deploy.

### Come risolvere:

**Opzione 1 - Token API (consigliato):**
1. Vai su https://dash.cloudflare.com/profile/api-tokens
2. Crea token con permessi "Cloudflare Pages:Edit"
3. Esegui:
```bash
export CLOUDFLARE_API_TOKEN="tuo-token-qui"
cd ~/Projects/Onde/apps/onde-portal
npx wrangler pages deploy out --project-name=onde-surf
```

**Opzione 2 - Login interattivo:**
```bash
cd ~/Projects/Onde/apps/onde-portal
npx wrangler login
npx wrangler pages deploy out --project-name=onde-surf
```

**Opzione 3 - Dashboard manuale:**
1. Vai su https://dash.cloudflare.com → Pages
2. Seleziona progetto "onde-surf"
3. Upload manuale della cartella `out/`

---
*Build pronto, manca solo l'auth!* 🔑

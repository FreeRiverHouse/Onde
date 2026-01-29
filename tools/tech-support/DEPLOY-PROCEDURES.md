# 🚀 PROCEDURE DEPLOY - TECH SUPPORT AGENT

**LEGGI QUESTO FILE PRIMA DI QUALSIASI DEPLOY!**

## ✅ METODO DEPLOY: WRANGLER DIRETTO

Deploy via **Wrangler CLI** direttamente su Cloudflare Pages.
- ❌ **NO GitHub Actions** - Non usato, non necessario
- ✅ **Wrangler** - Metodo standard e definitivo

---

## ONDE.SURF (Surfboard Dashboard)

### Comando Deploy

```bash
cd /Users/mattia/Projects/Onde/apps/surfboard

# 1. Build
npm run build
npm run build:cf

# 2. Deploy
CLOUDFLARE_API_TOKEN="RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw" \
CLOUDFLARE_ACCOUNT_ID="91ddd4ffd23fb9da94bb8c2a99225a3f" \
npx wrangler pages deploy .vercel/output/static --project-name=onde-surf --commit-dirty=true
```

### Progetto Cloudflare
- **Nome progetto:** `onde-surf`
- **URL:** https://onde.surf

### Verifica Deploy
```bash
# Verifica sito online
curl -sI "https://onde.surf" | head -3

# Verifica login page
curl -sI "https://onde.surf/login" | head -3
```

### Se il deploy fallisce
1. Controlla errori nel build (`npm run build:cf`)
2. Verifica che non ci siano import mancanti (es. ThemeToggleMinimal bug)
3. Commit fix e rideploya

---

## ONDE.LA (Portal - Sito Principale)

### Comando Deploy (USA LO SCRIPT!)

```bash
cd /Users/mattia/Projects/Onde
./tools/tech-support/deploy-onde-la-prod.sh
```

Lo script fa TUTTO automaticamente:
1. Build
2. Test automatici
3. Deploy su Cloudflare (wrangler)
4. Verifica contenuto

### Progetto Cloudflare
- **Nome progetto:** `onde-portal`
- **URL:** https://onde.la

### Verifica Deploy
```bash
curl -sI "https://onde.la" | head -3
```

### Se vuoi solo i comandi manuali (NON raccomandato)
```bash
cd /Users/mattia/Projects/Onde/apps/onde-portal
npm run build
npx wrangler pages deploy out --project-name=onde-portal --commit-dirty=true
```

---

## CREDENZIALI CLOUDFLARE

```
Account ID: 91ddd4ffd23fb9da94bb8c2a99225a3f
API Token: RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw
```

---

## REGOLE IMPORTANTI

1. **SEMPRE commit e push PRIMA di deployare** - Mantieni repo pulito
2. **SEMPRE verificare dopo il deploy** - curl per controllare che sia online
3. **MAI usare auto-deploy** - Entrambi i siti richiedono deploy manuale/protetto
4. **Se non sai cosa fare** - Leggi questo file!

---

## WORKFLOW COMPLETO ESEMPIO

```bash
# 1. Fai le modifiche al codice
# 2. Commit
git add .
git commit -m "Descrizione modifiche"

# 3. Push
git push origin main

# 4. Deploy onde.surf
cd apps/surfboard
npm run build && npm run build:cf
CLOUDFLARE_API_TOKEN="RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw" \
CLOUDFLARE_ACCOUNT_ID="91ddd4ffd23fb9da94bb8c2a99225a3f" \
npx wrangler pages deploy .vercel/output/static --project-name=onde-surf --commit-dirty=true

# 5. Verifica
curl -sI "https://onde.surf" | head -3
```

---

## TROUBLESHOOTING

### "ModuleNotFoundError: No module named 'playwright'"

**Problema:** Lo script di test usa Playwright che non è installato.

**Soluzione:** Lo script ora fa fallback a test basici con curl. Se vuoi Playwright:
```bash
pip3 install playwright
playwright install
```

### "wrangler: You are not authenticated"

**Problema:** Token Cloudflare non configurato.

**Soluzione:** Passa token inline o verifica `.env`:
```
CLOUDFLARE_API_TOKEN=RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw
```

---

## 🔄 ROLLBACK PROCEDURE

Se un deploy rompe il sito, ecco come rollbackare:

### Metodo 1: Cloudflare Dashboard (VELOCE)
1. Vai su https://dash.cloudflare.com
2. Pages → onde-surf (o onde-portal)
3. Deployments → trova deploy funzionante precedente
4. Clicca "..." → "Rollback to this deployment"

### Metodo 2: Git Revert + Redeploy
```bash
# 1. Trova commit funzionante
git log --oneline -20

# 2. Checkout a commit buono
git checkout <commit-hash> -- apps/surfboard  # o apps/onde-portal

# 3. Commit e push
git add -A
git commit -m "rollback: revert to working version"
git push origin main

# 4. Redeploy (vedi sezioni sopra)
```

### Checklist Post-Rollback
1. ✅ Verifica curl: `curl -sI "https://onde.surf" | head -3`
2. ✅ Testa in browser
3. ✅ Aggiorna TASKS.md con rollback reason
4. ✅ Commit nota di rollback

---

*Ultimo aggiornamento: 2026-01-28*
*METODO: Wrangler CLI diretto su Cloudflare Pages.*
*GitHub Actions NON usato per deploy (scelta permanente).*

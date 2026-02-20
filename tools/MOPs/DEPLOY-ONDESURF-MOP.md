# DEPLOY MOP - onde.surf (Surfboard Dashboard)

**LEGGI QUESTO FILE PRIMA DI QUALSIASI DEPLOY!**

---

## REGOLA D'ORO: STAGING FIRST!

**MAI deployare direttamente su onde.la (produzione)!**

### Flusso corretto:
```
1. Build locale
2. Deploy su STAGING (onde.surf o test.onde.la)
3. Test COMPLETO su staging
4. Solo se TUTTO funziona → Deploy su PRODUZIONE (onde.la)
```

---

## METODO DEPLOY: WRANGLER DIRETTO

- **NO GitHub Actions** - Non usato, non necessario
- **Wrangler CLI** - Metodo standard e definitivo

---

## ONDE.SURF (Surfboard Dashboard)

### Path su M4 (macchina principale)
```bash
cd /Users/mattiapetrucciani/Onde/apps/surfboard
```

### Path su M1 (legacy)
```bash
cd /Users/mattia/Projects/Onde/apps/surfboard
```

### Comando Deploy
```bash
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
- **Account ID:** `91ddd4ffd23fb9da94bb8c2a99225a3f`
- **API Token:** `RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw`

### Verifica Deploy
```bash
curl -sI "https://onde.surf" | head -3
curl -sI "https://onde.surf/login" | head -3
```

---

## ONDE.LA (Portal - Sito Principale)

### Comando Deploy (USA LO SCRIPT!)
```bash
cd /Users/mattiapetrucciani/Onde   # M4
./tools/tech-support/deploy-onde-la-prod.sh
```

### Progetto Cloudflare
- **Nome progetto:** `onde-portal`
- **URL:** https://onde.la

### Comandi manuali (NON raccomandato)
```bash
cd apps/onde-portal
npm run build
npx wrangler pages deploy out --project-name=onde-portal --commit-dirty=true
```

---

## TROUBLESHOOTING

### "wrangler: You are not authenticated"
Passa token inline:
```
CLOUDFLARE_API_TOKEN=RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw
```

### Build fallisce con import mancanti
```bash
npm install <pacchetto-mancante>
```

### fix-routes.sh missing
Non bloccante, build completa comunque.

---

## ROLLBACK

### Metodo 1: Cloudflare Dashboard (VELOCE)
1. https://dash.cloudflare.com → Pages → onde-surf
2. Deployments → deploy precedente funzionante
3. "..." → "Rollback to this deployment"

### Metodo 2: Git Revert + Redeploy
```bash
git log --oneline -20
git checkout <commit-hash> -- apps/surfboard
git add -A && git commit -m "rollback: revert to working version"
git push origin main
# Poi rideploya con comandi sopra
```

---

## REGOLE IMPORTANTI

1. **SEMPRE commit e push PRIMA di deployare**
2. **SEMPRE verificare dopo il deploy** con curl
3. **MAI usare auto-deploy** - Deploy manuale/protetto
4. **Se non sai cosa fare** - Leggi questo file!

---

*Ultimo aggiornamento: 2026-02-19*
*METODO: Wrangler CLI diretto su Cloudflare Pages.*

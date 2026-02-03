# 🧪 STAGING ENVIRONMENT SETUP

## Panoramica

Il progetto usa **Cloudflare Pages Preview Deployments** come staging environment.

---

## Come Funziona

### Automatico (Branch Deploys)
Cloudflare Pages crea automaticamente una preview per ogni branch push:

```
Branch: feature/my-feature
Preview URL: https://<commit-hash>.onde-portal.pages.dev
```

### Manuale (Staging Deploy)
Per deploy manuale su staging senza pushare un branch:

```bash
cd /Users/mattia/Projects/Onde/apps/onde-portal

# Build
npm run build

# Deploy su staging (preview)
npx wrangler pages deploy out \
  --project-name=onde-portal \
  --branch=staging \
  --commit-dirty=true
```

Questo crea una preview su: `https://staging.onde-portal.pages.dev`

---

## Flusso Consigliato

### Per Modifiche Piccole
```
1. Fai modifiche
2. npm run build (verifica locale)
3. Deploy staging: --branch=staging
4. Testa su https://staging.onde-portal.pages.dev
5. Se OK → Deploy prod
```

### Per Feature Branch
```
1. git checkout -b feature/nome
2. Fai modifiche + commit
3. git push origin feature/nome
4. Cloudflare crea preview automaticamente
5. Testa sulla preview URL
6. Merge su main → Deploy prod
```

---

## URL Staging

| Progetto | Staging URL |
|----------|-------------|
| onde-portal (onde.la) | `https://staging.onde-portal.pages.dev` |
| surfboard (onde.surf) | `https://staging.onde-surf.pages.dev` |

---

## Script Staging Deploy

### onde.la Staging
```bash
./tools/tech-support/deploy-onde-la-staging.sh
```

### onde.surf Staging
```bash
./tools/tech-support/deploy-onde-surf-staging.sh
```

---

## Test Staging

Dopo il deploy staging, verifica:

```bash
# Homepage
curl -sI "https://staging.onde-portal.pages.dev" | head -3

# Pagine chiave
curl -sI "https://staging.onde-portal.pages.dev/libri" | head -3
curl -sI "https://staging.onde-portal.pages.dev/games" | head -3
```

---

## Note Importanti

1. **Preview URLs** hanno certificato SSL automatico
2. **Non condividere** URL staging con utenti esterni
3. **Le preview scadono** dopo 30 giorni di inattività
4. **Nessun costo aggiuntivo** - incluso in Cloudflare Pages Free tier

# 🚀 PROCEDURE DEPLOY - TECH SUPPORT AGENT

**LEGGI QUESTO FILE PRIMA DI QUALSIASI DEPLOY!**

---

## ONDE.SURF (Surfboard Dashboard)

### Comando Deploy (UNICO METODO)

```bash
gh workflow run deploy-surfboard.yml \
  -R FreeRiverHouse/Onde \
  -f deploy_key="9eeezNPQwjY8NJl5PL9C0pqTutP642xk" \
  -f reason="DESCRIVI QUI IL MOTIVO DEL DEPLOY"
```

### Passphrase
```
9eeezNPQwjY8NJl5PL9C0pqTutP642xk
```

### Progetto Cloudflare
- **Nome progetto:** `onde-surf`
- **URL:** https://onde.surf

### Verifica Deploy
```bash
# Controlla stato workflow
gh run list -R FreeRiverHouse/Onde --workflow=deploy-surfboard.yml -L 1

# Verifica sito online
curl -sI "https://onde.surf" | head -3
```

### Se il deploy fallisce
1. Guarda i log: `gh run view <RUN_ID> -R FreeRiverHouse/Onde --log-failed`
2. Fixa il problema nel codice
3. Commit e push
4. Rilancia il workflow con lo stesso comando

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

## CREDENZIALI CLOUDFLARE (Solo emergenze)

```
Account ID: 91ddd4ffd23fb9da94bb8c2a99225a3f
API Token: RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw
```

---

## REGOLE IMPORTANTI

1. **SEMPRE commit e push PRIMA di deployare** - Il workflow prende il codice da GitHub
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
gh workflow run deploy-surfboard.yml \
  -R FreeRiverHouse/Onde \
  -f deploy_key="9eeezNPQwjY8NJl5PL9C0pqTutP642xk" \
  -f reason="Descrizione del deploy"

# 5. Aspetta ~3 minuti

# 6. Verifica
gh run list -R FreeRiverHouse/Onde --workflow=deploy-surfboard.yml -L 1
curl -sI "https://onde.surf" | head -3
```

---

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

**Soluzione:** Lo script carica automaticamente da `.env`. Verifica che `.env` contenga:
```
CLOUDFLARE_API_TOKEN=RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw
```

---

*Ultimo aggiornamento: 2026-01-28*

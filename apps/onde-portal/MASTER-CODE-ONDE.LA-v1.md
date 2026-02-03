# MASTER-CODE-ONDE.LA-v1

**Data:** 2026-02-02 17:40 PST
**Commit:** 102da8efc (feat: add Skin Creator link to homepage hero + dock)
**Stato:** ✅ STABILE E FUNZIONANTE

---

## 📋 Stato Attuale del Sito

### Homepage (onde.la)
- ✅ Versione con i18n funzionante
- ✅ Hero section con 3 bottoni: Explore Books, Play Games, Minecraft Skin Creator
- ✅ Floating dock in basso con: Books, Games, Skin Creator, VR, About
- ✅ Sezione "Why Onde?" con BentoGrid
- ✅ Sezione "Featured Books" con Meditations e Shepherd's Promise
- ✅ Sezione testimonials
- ✅ Footer con social links

### File Chiave
- `apps/onde-portal/src/app/page.tsx` - Homepage principale (481 righe)
- `apps/onde-portal/src/i18n/` - Sistema traduzioni
- `apps/onde-portal/out/` - Build statico per Cloudflare

---

## 🚀 Procedura Deploy (OBBLIGATORIA)

### Step 1: Build
```bash
cd apps/onde-portal
npm run build
```

### Step 2: Deploy su Cloudflare
```bash
CLOUDFLARE_API_TOKEN="RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw" \
CLOUDFLARE_ACCOUNT_ID="91ddd4ffd23fb9da94bb8c2a99225a3f" \
npx wrangler pages deploy out --project-name=onde-portal --commit-dirty=true
```

### Step 3: Verifica
```bash
curl -sL "https://onde.la" | grep -o '<title>.*</title>'
# Deve mostrare: <title>Onde - Crafted by Code, Touched by Soul</title>

curl -sL "https://onde.la" | grep -i "404\|not found" | head -1
# NON deve trovare nulla (pagina 404)
```

---

## ⚠️ PROBLEMI NOTI E SOLUZIONI

### Problema 1: Homepage mostra 404 (ma HTTP 200)
**Causa:** Il file `page.tsx` è stato sostituito con un redirect client-side a `/en/` o `/it/`, ma quelle route non esistono nel build statico.

**Soluzione:**
```bash
# Ripristina la homepage dalla versione funzionante
git show 112f709e6:apps/onde-portal/src/app/page.tsx > apps/onde-portal/src/app/page.tsx
# Poi rebuild e redeploy
```

### Problema 2: Link mancanti (Games, Skin Creator, etc.)
**Causa:** Versione vecchia della homepage senza i link aggiornati.

**Soluzione:** Verifica che `dockItems` in `page.tsx` contenga tutti i link necessari.

---

## 📁 Backup Versione Stabile

### Commit di riferimento
```
112f709e6 - feat(i18n): convert homepage to use translations (T373)
102da8efc - feat: add Skin Creator link to homepage hero + dock
```

### Per ripristinare questa versione
```bash
git checkout 102da8efc -- apps/onde-portal/src/app/page.tsx
cd apps/onde-portal && npm run build
# Poi deploy con wrangler
```

---

## 🔍 Watchdog Attivi

### onde-la-fast.sh (ogni 2 minuti)
- Controlla che il sito risponda HTTP 200
- Crea alert `onde-la-down.alert` se fallisce
- Verifica contenuto (non solo status code)

### Crontab
```
*/2 * * * * /Users/mattia/Projects/Onde/scripts/watchdog-onde-la-fast.sh
```

---

## 📝 Note Importanti

1. **MAI** sostituire `page.tsx` con redirect client-side - il sito è static export!
2. **SEMPRE** testare con `curl` dopo il deploy, non solo HTTP code ma anche contenuto
3. **SEMPRE** verificare che i link funzionino prima di pushare
4. In caso di dubbio, ripristinare da questo commit: `102da8efc`

---

## 🏷️ Tag Git

```bash
git tag -a v1.0.0-onde-la-stable -m "MASTER-CODE-ONDE.LA-v1: Homepage stabile con i18n + Skin Creator"
git push origin v1.0.0-onde-la-stable
```

---

*Documentato da Clawdinho il 2026-02-02 alle 17:40 PST*
*Per ordine di Mattia dopo il casino del 404*

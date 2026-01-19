# Test Environments - Onde Portal

## Architettura Ambienti

### ONDE.LA - 3 Ambienti

1. **TEST** (localhost:8888)
   - Ambiente privato LAN
   - Per testing interno onde.la
   - Comando: `npm run test:onde-la`
   - URL: http://localhost:8888

2. **PREPROD** (onde.surf destra)
   - Pre-produzione onde.la
   - Accessibile da split-screen onde.surf
   - URL: https://onde.surf/preprod

3. **PROD** (onde.la)
   - Produzione SACRO
   - Mai down
   - URL: https://onde.la

---

### ONDE.SURF - 3 Ambienti

1. **TEST** (localhost:7777)
   - Ambiente privato LAN
   - Per testing interno onde.surf
   - Comando: `npm run test:onde-surf`
   - URL: http://localhost:7777

2. **PREPROD** (onde.surf online)
   - Split-screen homepage
   - Sinistra: Portale VR → /vr
   - Destra: onde.la PREPROD → /preprod
   - URL: https://onde.surf

3. **PROD** (onde.surf online)
   - Stesso di PREPROD per ora
   - URL: https://onde.surf

---

## Comandi Rapidi

```bash
# Test onde.la (porta 8888)
cd apps/onde-portal
npm run test:onde-la

# Test onde.surf (porta 7777)
cd apps/onde-portal
npm run test:onde-surf

# Development normale (porta 3000)
npm run dev

# Build per produzione
npm run build

# Start produzione locale
npm run start
```

---

## Procedure Deploy

### Deploy onde.la (BLINDATO)
```bash
python tools/tech-support/deploy-onde-la.py <book-id> <version>
```

### Deploy onde.surf (VELOCE)
```bash
python tools/tech-support/deploy-onde-surf.py <book-id> <version>
```

---

## Note Importanti

- **DEV è SOLO localhost**: Non esiste ambiente "dev" online
- **onde.la è SACRO**: Mai down, sempre funzionante
- **onde.surf è veloce**: Meno check, iterazioni rapide
- **TEST sono LAN privati**: 8888 e 7777 non esposti online
# trigger vercel rebuild Mon Jan 19 12:00:36 PST 2026

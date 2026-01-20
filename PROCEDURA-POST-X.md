# PROCEDURA POST SU X (TWITTER)

## OBIETTIVO
Postare tweet sugli account X gestiti (@Onde_FRH, @FreeRiverHouse, @magmatic__)

## QUANDO USARE
- Quando devi postare su X per qualsiasi account
- Quando Mattia dice "/onde", "/frh", "/magmatic"

---

## CREDENZIALI (in .env)

| Account | Variabili |
|---------|-----------|
| @FreeRiverHouse | `X_FRH_API_KEY`, `X_FRH_API_SECRET`, `X_FRH_ACCESS_TOKEN`, `X_FRH_ACCESS_SECRET` |
| @Onde_FRH | `X_ONDE_API_KEY`, `X_ONDE_API_SECRET`, `X_ONDE_ACCESS_TOKEN`, `X_ONDE_ACCESS_SECRET` |
| @magmatic__ | `X_MAGMATIC_API_KEY`, `X_MAGMATIC_API_SECRET`, `X_MAGMATIC_ACCESS_TOKEN`, `X_MAGMATIC_ACCESS_SECRET` |

---

## METODO 1: SCRIPT NODE.JS (PREFERITO)

### Per @FreeRiverHouse
```bash
# Test credenziali
node test-frh.js

# Post (crea script se non esiste)
cat > post-frh-now.js << 'EOF'
const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

const client = new TwitterApi({
  appKey: process.env.X_FRH_API_KEY,
  appSecret: process.env.X_FRH_API_SECRET,
  accessToken: process.env.X_FRH_ACCESS_TOKEN,
  accessSecret: process.env.X_FRH_ACCESS_SECRET,
});

const text = process.argv[2] || 'Test post';

client.v2.tweet(text)
  .then(r => console.log('✅ Posted:', `https://x.com/FreeRiverHouse/status/${r.data.id}`))
  .catch(e => console.log('❌ Error:', e.message));
EOF

node post-frh-now.js "Testo del tweet qui"
```

### Per @Onde_FRH
```bash
cat > post-onde-now.js << 'EOF'
const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

const client = new TwitterApi({
  appKey: process.env.X_ONDE_API_KEY,
  appSecret: process.env.X_ONDE_API_SECRET,
  accessToken: process.env.X_ONDE_ACCESS_TOKEN,
  accessSecret: process.env.X_ONDE_ACCESS_SECRET,
});

const text = process.argv[2] || 'Test post';

client.v2.tweet(text)
  .then(r => console.log('✅ Posted:', `https://x.com/Onde_FRH/status/${r.data.id}`))
  .catch(e => console.log('❌ Error:', e.message));
EOF

node post-onde-now.js "Testo del tweet qui"
```

### Per @magmatic__
```bash
cat > post-magmatic-now.js << 'EOF'
const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

const client = new TwitterApi({
  appKey: process.env.X_MAGMATIC_API_KEY,
  appSecret: process.env.X_MAGMATIC_API_SECRET,
  accessToken: process.env.X_MAGMATIC_ACCESS_TOKEN,
  accessSecret: process.env.X_MAGMATIC_ACCESS_SECRET,
});

const text = process.argv[2] || 'Test post';

client.v2.tweet(text)
  .then(r => console.log('✅ Posted:', `https://x.com/magmatic__/status/${r.data.id}`))
  .catch(e => console.log('❌ Error:', e.message));
EOF

node post-magmatic-now.js "Testo del tweet qui"
```

---

## METODO 2: CURL DIRETTO (SE NODE NON FUNZIONA)

```bash
# Richiede oauth1 header - complesso, preferire Node.js
# Se 401, rigenerare token su developer.twitter.com
```

---

## TROUBLESHOOTING

### Errore 401 Unauthorized
Le credenziali sono scadute o invalide.

**Soluzione:**
1. Vai su https://developer.twitter.com/en/portal/dashboard
2. Seleziona l'app (Onde, FRH, o Magmatic)
3. Vai su "Keys and tokens"
4. Rigenera "Access Token and Secret"
5. Aggiorna il .env con i nuovi valori
6. **IMPORTANTE:** Verifica che l'app abbia permessi "Read and Write" (non solo "Read")
   - Tab "User authentication settings"
   - App permissions deve essere "Read and write"

### Errore 403 Forbidden
L'app non ha permessi di scrittura.

**Soluzione:**
1. Developer Portal → App → User authentication settings
2. Cambia permessi a "Read and write"
3. Salva
4. **DOPO** il cambio permessi, RIGENERA i token (i vecchi token mantengono i vecchi permessi)

---

## REGOLE
- ✅ Verifica sempre le credenziali prima con `test-*.js`
- ✅ Usa variabili specifiche per account (`X_FRH_*`, `X_ONDE_*`, `X_MAGMATIC_*`)
- ✅ Niente hashtag (regola Onde 2026)
- ❌ Mai usare variabili generiche `TWITTER_*` (legacy)
- ❌ Mai postare senza approvazione di Mattia

---

## CHECKLIST
- [ ] Credenziali verificate (no 401)
- [ ] Testo approvato da Mattia
- [ ] Niente hashtag nel testo
- [ ] Post eseguito
- [ ] URL del tweet verificato

---

## OUTPUT RICHIESTO
URL del tweet pubblicato: `https://x.com/[account]/status/[id]`

---

**Versione:** 1.0
**Data:** 2026-01-20

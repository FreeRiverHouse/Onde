# Session Log - 20 Gennaio 2026

## Situazione Attuale

### Problema Credenziali API X (Twitter)

**Stato credenziali:**

| Account | Variabili nel .env | Status API |
|---------|-------------------|------------|
| @magmatic__ | `X_MAGMATIC_*` | ❌ 401 Unauthorized |
| @Onde_FRH | `X_ONDE_*` | ❌ 401 Unauthorized |
| @FreeRiverHouse | `TWITTER_*` (generiche) | ❌ Non presenti nel .env |

### Il Problema FRH

Il file `daily-tech-post.ts` e `content-scheduler.ts` cercano variabili **generiche**:
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_SECRET`

Ma nel `.env` ci sono solo:
- `X_ONDE_*` (per Onde)
- `X_MAGMATIC_*` (per Magmatic)

Le credenziali FRH **non esistono** nel .env locale.

### Cosa ho provato

1. **API diretta** → 401 Unauthorized (token scaduti o permessi insufficienti)
2. **Claude for Chrome** → Non ho accesso in questa sessione
3. **GitHub Secrets** → Non riesco ad accedere ai secrets (sono criptati)

### I 3 Post Pronti da Pubblicare

**1. @Onde_FRH:**
```
You know that feeling when you read something to your kid and they stop to think, or to laugh?

That's why we make books.

Not to sell. To create those moments.

If they sell too, great. But the moment comes first.
```

**2. @FreeRiverHouse:**
```
We're building something weird at Onde.

A children's book publisher where the authors and illustrators are... illustrated themselves.

Gianni Parola writes the stories.
Pina Pennello paints them.

They're not real. But the books are.

Meta? Maybe. Fun? Definitely.
```

**3. @magmatic__:**
```
"We need to learn to see our physical form as a river.
Our body is not a static thing—it changes all the time."

— Thích Nhất Hạnh, The Heart of Practice

Impermanenza. Ogni cellula è una goccia nel fiume.
```

### Cosa serve per risolvere

**Opzione A - Rigenerare token:**
1. Vai su developer.twitter.com
2. Accedi a ogni app (Onde, Magmatic, FRH)
3. Rigenera Access Token and Secret
4. Aggiorna il .env

**Opzione B - Posta manualmente:**
I tweet sono pronti sopra, basta copia-incolla.

### Workflow GitHub che spamma FRH

Mattia ha menzionato un workflow che posta automaticamente su FRH ogni sera.
Ho cercato ma non ho trovato le credenziali nei file locali.
Probabilmente sono solo nei GitHub Secrets (criptati, non leggibili).

**Da fare:** Disattivare quel workflow una volta trovato.

---

## Prossimi Step

1. [ ] Mattia rigenera i token nel Developer Portal
2. [ ] Aggiorno il .env con i nuovi token
3. [ ] Posto i 3 tweet via API
4. [ ] Disattivo il workflow spam FRH

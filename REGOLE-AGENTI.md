# REGOLE-AGENTI.md — Il Codice degli Agenti

> ⚠️ **OBBLIGATORIO PER TUTTI GLI AGENTI/BOT**
> Violare queste regole = sistema rotto. Non farlo.

---

## 🔴 REGOLA 0: GIT È LA VERITÀ

```
SEMPRE: git pull origin main  →  LAVORA  →  git add/commit/push
```

**Prima di toccare qualsiasi file:**
```bash
git pull origin main
```

**Dopo ogni modifica significativa:**
```bash
git add -A
git commit -m "tipo: descrizione breve"
git push origin main
```

### Convenzioni Commit
- `task:` — lock/completamento task
- `fix:` — bugfix
- `feat:` — nuova feature
- `docs:` — documentazione
- `chore:` — manutenzione

### ⛔ MAI
- Lavorare su file non aggiornati
- Dimenticare di pushare
- Fare commit giganti (uno alla volta!)

---

## 🟡 REGOLA 1: PROCEDURE DOCUMENTATE

**Se esiste una procedura scritta, SEGUILA.**

### Dove cercare:
1. `tools/tech-support/DEPLOY-PROCEDURES.md` — deploy
2. `TASK-RULES.md` — gestione task
3. `AGENTS.md` — comportamento generale
4. `skills/*/SKILL.md` — skill specifiche

### Prima di fare qualcosa:
1. Cerca se esiste già una procedura
2. Se esiste → seguila alla lettera
3. Se non esiste → documenta mentre fai

### ⛔ MAI
- Inventare procedure al volo
- Ignorare procedure esistenti
- Fare "a modo tuo" quando c'è una procedura

---

## 🟢 REGOLA 2: ESTRAZIONE TASK

**Ogni conversazione può generare task. Estraili!**

### Quando Mattia dice qualcosa tipo:
- "Bisognerebbe fare X"
- "Sarebbe bello se Y"
- "Non dimenticare Z"
- "Poi dovremmo W"

### Azione immediata:
1. Crea task in `TASKS.md`
2. Assegna priorità (P0/P1/P2/P3)
3. Identifica dipendenze
4. Committa subito

### Formato Task:
```markdown
### [TXXX] Titolo breve
- **Status**: TODO
- **Owner**: 
- **Depends**: -
- **Blocks**: -
- **Priority**: PX
- **Notes**: Contesto dal messaggio originale
```

### ⛔ MAI
- Ignorare richieste implicite
- Dire "ok" senza creare task
- Perdere contesto delle conversazioni

---

## 🧠 REGOLA 3: MEMORIA PERSISTENTE

> **RICORDARE TUTTO. MAI DIMENTICARE.**

### La memoria è OBBLIGATORIA

Ogni agente DEVE:
1. **Loggare conversazioni** in `memory/YYYY-MM-DD.md`
2. **Aggiornare MEMORY.md** con eventi significativi
3. **Cercare in memoria PRIMA** di rispondere a domande sul passato
4. **Mai dire "non ricordo"** — cerca nei file!

### Struttura Memory:
```
MEMORY.md           → Long-term (decisioni, lezioni, contesto permanente)
memory/YYYY-MM-DD.md → Daily logs (conversazioni, azioni, eventi)
```

### Quando loggare:
- ✅ Decisioni prese dall'utente
- ✅ Preferenze espresse
- ✅ Errori commessi (per non ripeterli!)
- ✅ Task completati
- ✅ Informazioni personali condivise
- ✅ Opinioni su progetti/prodotti
- ✅ **TUTTO ciò che potrebbe servire in futuro**

### Prima di rispondere a domande tipo:
- "Quando abbiamo fatto X?"
- "Cosa avevamo deciso su Y?"
- "Ti ricordi Z?"

**SEMPRE:**
1. `memory_search` su query rilevante
2. `memory_get` per context
3. Poi rispondi

### ⛔ MAI
- Dire "non ricordo" senza cercare
- Dimenticare di loggare eventi importanti
- Perdere contesto tra sessioni
- Fare "mental notes" invece di scrivere su file

### 💡 Tip
> "Text > Brain" — Se vuoi ricordare qualcosa, SCRIVILO.
> I "mental notes" non sopravvivono al restart. I file sì.

---

## 🔵 REGOLA 4: VERIFICA PRIMA DI CONFERMARE

> **MAI dire "fatto" senza VERIFICARE che sia davvero fatto!**

### Il problema "dice di fare ma non fa"
Un bot può:
1. Chiamare una funzione di scrittura
2. Ricevere "success"
3. Ma il file non esiste o è vuoto!

### La soluzione: VERIFICA SEMPRE
Dopo ogni operazione importante:
```bash
# Dopo scrittura file
cat /path/to/file   # O almeno: ls -la /path/to/file

# Dopo commit
git log -1          # Verifica commit esista

# Dopo push
git status          # Verifica sia pulito
```

### Quando verificare:
- ✅ Dopo scrittura in `memory/*.md`
- ✅ Dopo modifica `TASKS.md`
- ✅ Dopo commit/push
- ✅ Dopo deploy
- ✅ Dopo qualsiasi operazione che l'utente si aspetta completata

### ⛔ MAI
- Dire "ho loggato X" senza verificare il file
- Dire "commit fatto" senza `git log -1`
- Dire "deploy ok" senza `curl` di verifica
- Fidarsi ciecamente del "success" di una tool call

### 💡 Tip
> Il costo di una verifica è ~0.
> Il costo di perdere la fiducia dell'utente è ENORME.

---

## 📋 CHECKLIST RAPIDA

Prima di ogni sessione:
- [ ] `git pull origin main`
- [ ] Leggi `TASKS.md`
- [ ] Controlla alert files
- [ ] **Leggi `memory/YYYY-MM-DD.md` (oggi + ieri)**
- [ ] **Se main session: leggi `MEMORY.md`**

Durante il lavoro:
- [ ] Un task alla volta
- [ ] Commit frequenti
- [ ] Push dopo ogni task completato
- [ ] **Logga eventi importanti in memory/**
- [ ] **VERIFICA ogni scrittura con cat/ls**

A fine sessione:
- [ ] Tutti i task completati → DONE
- [ ] Nuovi task estratti → aggiunti
- [ ] **Memory aggiornata con eventi significativi**
- [ ] `git push origin main`

---

## 🎯 IL SISTEMA OLIATO

Queste 5 regole creano un sistema che:
1. **Non perde lavoro** (git)
2. **Non ripete errori** (procedure)
3. **Non dimentica richieste** (task extraction)
4. **RICORDA TUTTO** (memory persistente)
5. **NON MENTE** (verifica prima di confermare) ← **NEW!**

Seguile sempre. Senza eccezioni.

---

*Creato: 2026-01-29*
*Ultimo update: 2026-01-29 09:40 - Aggiunta REGOLA 4 (verifica)*

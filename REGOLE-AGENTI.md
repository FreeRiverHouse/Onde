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

## 📋 CHECKLIST RAPIDA

Prima di ogni sessione:
- [ ] `git pull origin main`
- [ ] Leggi `TASKS.md`
- [ ] Controlla alert files

Durante il lavoro:
- [ ] Un task alla volta
- [ ] Commit frequenti
- [ ] Push dopo ogni task completato

A fine sessione:
- [ ] Tutti i task completati → DONE
- [ ] Nuovi task estratti → aggiunti
- [ ] `git push origin main`

---

## 🎯 IL SISTEMA OLIATO

Queste 3 regole creano un sistema che:
1. **Non perde lavoro** (git)
2. **Non ripete errori** (procedure)
3. **Non dimentica nulla** (task extraction)

Seguile sempre. Senza eccezioni.

---

*Creato: 2026-01-29*
*Ultimo update: 2026-01-29*

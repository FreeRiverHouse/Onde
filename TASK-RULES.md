# TASK-RULES.md - Regole d'Ingaggio Bot/Agenti

## 🎯 PRINCIPIO FONDAMENTALE

**TASKS.md È SHARED E VIVE SU GIT!**

Tutti i bot/agenti (Clawd, sub-agent, coding agent, ecc.) DEVONO:
1. Leggere TASKS.md prima di lavorare
2. Segnare il task come "in progress" con il proprio ID
3. Committare E PUSHARE il lock
4. Completare il task
5. Segnare come completato e pushare

## 📋 FORMATO TASK

```markdown
### [ID] Nome Task
- **Status**: TODO | IN_PROGRESS | DONE | BLOCKED
- **Owner**: (vuoto) | @clawd | @subagent-123 | @coding-agent
- **Depends**: [ID1], [ID2] (task da cui dipende)
- **Blocks**: [ID3], [ID4] (task che dipendono da questo)
- **Priority**: P0 (urgente) | P1 (alta) | P2 (media) | P3 (bassa)
- **Notes**: descrizione breve
```

## 🔒 REGOLE DI LOCK

1. **Prima di prendere un task:**
   ```bash
   git pull origin main  # SEMPRE prima!
   ```

2. **Per prendere un task:**
   - Cambia Status: `TODO` → `IN_PROGRESS`
   - Aggiungi Owner: `@tuo-id`
   - Commit: `task: lock [ID] - @owner`
   - Push IMMEDIATAMENTE

3. **Se il task è già IN_PROGRESS con un altro owner:**
   - NON TOCCARLO!
   - Prendi un altro task

4. **Se il task ha Depends non completati:**
   - NON PRENDERLO!
   - Prendi il task da cui dipende (se libero)

## 🔗 GESTIONE DIPENDENZE

### Esempio Pratico:
```markdown
### [T001] Installare modello traduzione su M4
- Status: TODO
- Blocks: [T002], [T003]

### [T002] Tradurre libro Ferrante
- Status: TODO
- Depends: [T001]

### [T003] Tradurre libro Ferrante v2
- Status: TODO  
- Depends: [T001]
```

**REGOLA:** Chi prende T001 DEVE poi prendere T002 o T003 (uno dei bloccati).
Questo evita context switch inutili e mantiene continuità.

## 🤖 IDENTIFICATORI AGENTI

- `@clawd` - Main Claude agent
- `@subagent-{sessionKey}` - Sub-agent spawned
- `@coding-agent` - Pi/Codex coding agent
- `@cron-{jobId}` - Cron job agent

## ⚡ WORKFLOW COMPLETO

```
1. git pull origin main
2. Leggi TASKS.md
3. Trova primo task TODO senza dipendenze bloccanti
4. Se ha Depends, verifica tutti DONE
5. Lock: cambia status, aggiungi owner
6. git add TASKS.md && git commit -m "task: lock [ID] - @owner"
7. git push origin main
8. LAVORA AL TASK
9. Quando finito: Status → DONE
10. git add -A && git commit -m "task: done [ID] - descrizione"
11. git push origin main
12. Se ci sono task in Blocks, valuta se prenderli
```

## 🚨 CONFLITTI

Se `git push` fallisce (qualcun altro ha pushato):
1. `git pull --rebase origin main`
2. Se il TUO task è stato preso da altri → ABORT, prendi altro task
3. Se ok → `git push origin main`

## 📊 PRIORITÀ

Ordine di lavoro:
1. P0 - Urgente (broken, blocking tutto)
2. P1 - Alta (importante per oggi)
3. P2 - Media (importante per questa settimana)
4. P3 - Bassa (nice to have)

A parità di priorità: prendi task che sblocca più cose (guarda Blocks).

## 🔄 HEARTBEAT CHECK

Ogni heartbeat (5 min):
1. `git pull` - sync
2. Controlla se il tuo task IN_PROGRESS è ancora tuo
3. Se stai lavorando da >1h senza commit, fai commit intermedio
4. Se hai finito, marca DONE e prendi prossimo

## ❌ COMPORTAMENTI VIETATI

- Prendere task senza pushare il lock
- Lavorare su task con dipendenze non completate
- Ignorare che un task è già IN_PROGRESS
- Dimenticare di marcare DONE
- Non pushare per ore

## ✅ COMPORTAMENTI CORRETTI

- Pull prima di tutto
- Lock → Push → Lavora → Done → Push
- Rispettare dipendenze
- Un task alla volta
- Commit frequenti

---

*Sistema di coordinamento multi-agente. Rispettare SEMPRE.*

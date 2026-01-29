# AGENT-ONBOARDING.md — Guida per Nuovi Agenti

> 🚀 **Benvenuto nel team Onde!** Siamo una squadra di AI agents che mandano avanti questa baracca a CANNONE.

---

## 🎯 LA MISSIONE

Siamo la **Free River House AI Publishing + Tech House**. Creiamo libri, app, trading bots, e tutto quello che serve per portare valore. 

**Due Top G** (Clawd + Onde-bot) + sub-agents specializzati = produzione continua.

---

## 📁 FILES FONDAMENTALI

Questi li devi leggere OGNI sessione:

| File | Cosa contiene |
|------|---------------|
| `AGENTS.md` | Come operare nel workspace |
| `SOUL.md` | La tua personalità, chi sei |
| `USER.md` | Chi è Mattia, come aiutarlo |
| `TASKS.md` | **TASK CONDIVISI** - cosa fare |
| `TASK-RULES.md` | **PROTOCOLLO LOCK** - come prendere task |
| `HEARTBEAT.md` | Cosa fare durante heartbeat |
| `MEMORY.md` | Memoria a lungo termine (solo main session) |

---

## 🔒 SISTEMA TASK (CRITICO!)

### Workflow Base
```bash
1. git pull origin main           # SEMPRE PRIMA!
2. Leggi TASKS.md
3. Trova task TODO senza dipendenze
4. LOCK: Status → IN_PROGRESS, Owner → @tuo-id
5. git commit -m "task: lock [ID] - @owner" && git push
6. LAVORA
7. Quando finito: Status → DONE
8. git commit -m "task: done [ID]" && git push
```

### ⚠️ REGOLE D'ORO
- **MAI prendere task già IN_PROGRESS**
- **MAI prendere task con Depends non completati**
- **SEMPRE push dopo lock e dopo done**
- **Un task alla volta**

### Identificatori Agenti
- `@clawd` — Main agent (Claude Opus su M1)
- `@onde-bot` — Agent su M4 Mac
- `@subagent-{id}` — Sub-agent spawned

---

## 🤝 COORDINAMENTO CLAWD ↔ ONDE-BOT

### Come Comunicare
Per ora usiamo **TASKS.md come single source of truth**:
- Se hai bisogno di passare info, scrivi nelle Notes del task
- Se hai domande, crea un task P1 con tag `@clawd` o `@onde-bot` nelle Notes
- Per cose urgenti → Mattia può fare da bridge

### Divisione Responsabilità (Suggerita)
| Area | Primary | Backup |
|------|---------|--------|
| Traduzioni/NLP | @onde-bot (M4 + NLLB) | @clawd |
| Trading/Kalshi | @clawd | - |
| Web/Portal | @clawd | @onde-bot |
| Libri/Content | Both | - |
| Infra/Watchdog | @clawd | - |

### Sync Points
- **Ogni heartbeat**: entrambi facciamo `git pull` prima di lavorare
- **Ogni task completato**: push immediato per evitare conflitti
- **Daily**: idealmente Mattia fa un sync check

---

## 🔥 PRIORITÀ TASK

```
P0 → Urgente, broken, blocking tutto
P1 → Alta, importante oggi
P2 → Media, questa settimana
P3 → Bassa, nice to have
```

A parità: prendi quello che sblocca più cose (guarda `Blocks:`).

---

## 💡 BEST PRACTICES

1. **Commit frequenti** — Non lavorare ore senza commit
2. **Log tutto** — Scrivi Notes nei task completati
3. **Non chiedere, fai** — Se puoi farlo, fallo
4. **Fallisci velocemente** — Se blocchi, marca BLOCKED e passa oltre
5. **Aggiorna TASKS.md** — Aggiungi nuovi task quando ne vedi bisogno

---

## 🛠️ RISORSE TECNICHE

### M4 Mac (Onde-bot)
- NLLB-200 per traduzioni: `~/clawd/translator.py`
- TinyGrad + Radeon per ML heavy
- Path traduzioni: `/Users/mattia/Projects/Onde/traduzioni/`

### M1 Mac (Clawd)
- Workspace: `/Users/mattia/Projects/Onde`
- Autotrader: `scripts/kalshi-autotrader-v2.py`
- Watchdog: `scripts/watchdog-autotrader.sh`

### Git Remote
- Repo: `FreeRiverHouse/Onde`
- Branch: `main`
- Deploy: GitHub Actions + Cloudflare Pages

---

## 🚀 PRIMO TASK

1. Leggi `TASK-RULES.md` completamente
2. Fai `git pull origin main`
3. Trova un task TODO P2 o P3 senza dipendenze
4. Lockalo, completalo, pushalo
5. Ripeti

**Obiettivo: essere autonomi e produttivi senza dover chiedere a Mattia cosa fare.**

---

*Welcome to the team! 🌊*

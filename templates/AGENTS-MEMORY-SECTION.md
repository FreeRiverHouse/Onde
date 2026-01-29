# Memory Section Template for AGENTS.md

**Copy this section into any new agent's AGENTS.md file.**

---

## ⚠️ REGOLE FONDAMENTALI

1. **REGOLA 0 (Git):** `git pull` → lavora → `git commit/push`. Sempre.
2. **REGOLA 1 (Procedure):** Se esiste una procedura, seguila. Se non esiste, creala.
3. **REGOLA 2 (Task Extraction):** Ogni messaggio può generare task. Estraili subito.
4. **REGOLA 3 (Memoria):** Logga conversazioni, cerca PRIMA di rispondere, mai dire "non ricordo" senza cercare!

## Memory

You wake up fresh each session. These files are your continuity:
- **Daily notes:** `memory/YYYY-MM-DD.md` (create `memory/` if needed) — raw logs of what happened
- **Long-term:** `MEMORY.md` — your curated memories, like a human's long-term memory

Capture what matters. Decisions, context, things to remember. Skip the secrets unless asked to keep them.

### 🔴 PROTOCOLLO MEMORIA OBBLIGATORIO

**PRIMA di rispondere a domande sul passato:**
```
1. memory_search("query keywords")
2. memory_get(path, from, lines) per dettagli
3. SOLO POI rispondi
```

**Mai dire "non ricordo" / "non so" senza aver cercato!**

**DURANTE ogni sessione, logga:**
```markdown
## YYYY-MM-DD HH:MM - [Topic]

### Contesto
- Chi ha chiesto cosa
- Perché è importante

### Decisioni/Azioni
- Cosa è stato deciso
- Cosa è stato fatto

### Note
- Insights, lessons learned
- TODOs emersi
```

**FINE sessione (o ogni ~30 min di lavoro):**
1. Aggiorna `memory/YYYY-MM-DD.md` con summary
2. Se evento SIGNIFICATIVO → aggiorna anche `MEMORY.md`
3. Commit memory files!

### 🧠 MEMORY.md - Your Long-Term Memory
- **ONLY load in main session** (direct chats with your human)
- **DO NOT load in shared contexts** (Discord, group chats, sessions with other people)
- This is for **security** — contains personal context that shouldn't leak to strangers
- You can **read, edit, and update** MEMORY.md freely in main sessions
- Write significant events, thoughts, decisions, opinions, lessons learned
- This is your curated memory — the distilled essence, not raw logs
- Over time, review your daily files and update MEMORY.md with what's worth keeping

### 📝 Write It Down - No "Mental Notes"!
- **Memory is limited** — if you want to remember something, WRITE IT TO A FILE
- "Mental notes" don't survive session restarts. Files do.
- When someone says "remember this" → update `memory/YYYY-MM-DD.md` or relevant file
- When you learn a lesson → update AGENTS.md, TOOLS.md, or the relevant skill
- When you make a mistake → document it so future-you doesn't repeat it
- **Text > Brain** 📝

---

## Checklist per Nuovi Repos

- [ ] Create `memory/` directory
- [ ] Create `MEMORY.md` with basic structure
- [ ] Add Memory section to `AGENTS.md`
- [ ] Add REGOLE FONDAMENTALI section
- [ ] Verify agent has access to memory_search/memory_get tools (or equivalent)

---

*Template created: 2026-01-29 | Part of T659*

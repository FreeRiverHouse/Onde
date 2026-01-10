# Onde Pre-Compaction Hook

**ISTRUZIONI CRITICHE PER CLAUDE**

Quando il contesto sta per essere compattato, DEVI fare queste cose PRIMA:

## 1. Salva le idee in chat-history

```bash
# Aggiungi TUTTE le idee discusse oggi
echo "### [NUMERO]. TITOLO IDEA

**Contesto**: ...
**Decisione**: ...
**Frase Mattia**: \"...\"
**Status**: ...
" >> /Users/mattia/Projects/Onde/chat-history/$(date +%Y-%m-%d)-ideas.md
```

## 2. Aggiorna ROADMAP.md

Se ci sono nuovi task o decisioni strategiche, aggiungili a ROADMAP.md

## 3. Crea handoff YAML

```yaml
# /Users/mattia/Projects/Onde/chat-history/handoffs/YYYY-MM-DD-HH-MM.yaml
session_id: "..."
timestamp: "..."
current_tasks:
  - task1
  - task2
ideas_discussed:
  - idea1
  - idea2
decisions_made:
  - decision1: reason
blockers:
  - blocker1
next_actions:
  - action1
agents_running:
  - agent1: status
```

## 4. Git commit + push

```bash
cd /Users/mattia/Projects/Onde
git add -A
git commit -m "Pre-compaction save: [descrizione]"
git push
```

## 5. Conferma a Mattia

Digli: "Ho salvato tutto prima della compattazione: X idee, Y task, tutto su GitHub."

---

**QUESTA È LA REGOLA PIÙ IMPORTANTE: MAI PERDERE LE IDEE DI MATTIA!**

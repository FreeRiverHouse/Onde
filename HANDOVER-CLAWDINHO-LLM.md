# HANDOVER PER CLAWDINHO - Sistema LLM Locale

**Da:** Claude Code
**A:** Clawdinho
**Data:** 2026-01-30
**Status:** PRONTO ALL'USO

---

## TL;DR

Sistema LLM locale funzionante. Usa per coding tasks semplici, risparmi token Claude.

---

## Endpoint Attivi

| Servizio | URL | Stato |
|----------|-----|-------|
| **GUI Chat** | http://192.168.1.111:8080/ | ✅ ATTIVO |
| **API Ollama** | http://192.168.1.111:11434/ | ✅ ATTIVO |

---

## Come Usare

### Da CLI (veloce)

```bash
# Chat veloce (2-3 sec)
python3 ~/Projects/Onde/tools/llm-client.py "Your question"

# Coding (1-3 min ma preciso)
python3 ~/Projects/Onde/tools/llm-client.py -m coding "Write a function to..."
```

### Da Python (nei tuoi bot)

```python
from tools.llm_client import LLMClient

client = LLMClient()

# Chat veloce
response = client.ask_fast("Quick question")

# Coding
code = client.ask_coding("Write a sort function")

# Check se funziona
health = client.health_check()
if health["status"] != "ok":
    # Fallback a Claude API o skip
    pass
```

### Da curl (per debug)

```bash
curl http://192.168.1.111:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Hello",
  "stream": false
}'
```

---

## Modelli Disponibili

| Alias | Modello | Tempo | Uso |
|-------|---------|-------|-----|
| `fast` | llama3.2:3b | 2-3s | Chat, domande semplici |
| `chat` | llama31-8b | 15-30s | Chat qualità |
| `coding` | deepseek-coder:6.7b | 1-3min | **Codice** |
| `qwen` | qwen2.5-coder:7b | 1-3min | Codice alternativo |

---

## Error Handling Automatico

Se il client trova errori:
1. Logga su stderr
2. Crea automaticamente task in `TASKS.md` con prefix `[TXXXX] LLM-ERROR`
3. Ritorna `None`

```python
response = client.ask("prompt")
if response is None:
    print("LLM failed, error logged to TASKS.md")
    # Use fallback
```

---

## Workflow Consigliato per Te

### Tu (Clawdinho) = PM/Orchestrator
- Pianifichi task
- Scomponi in sotto-task
- Decidi cosa delegare a LLM locale vs Claude

### LLM Locale = Code Monkey
- Scrive funzioni semplici
- Genera boilerplate
- Risponde domande tecniche veloci

### Esempio

```
1. User chiede: "Aggiungi validazione email"

2. Tu pianifichi:
   - Task A: Creare funzione validate_email()
   - Task B: Integrare nel form
   - Task C: Test

3. Tu deleghi Task A a LLM locale:
   code = client.ask_coding("Write validate_email(s) that returns bool")

4. Tu revisioni il codice

5. Tu integri e testi
```

---

## File Importanti

| File | Descrizione |
|------|-------------|
| `~/Projects/Onde/tools/llm-client.py` | Client Python con error handling |
| `~/Projects/Onde/tools/ask-coder.py` | CLI semplice |
| `~/Projects/Onde/llm-chat/index.html` | GUI web |
| `~/Projects/Onde/SETUP-LLM-OLLAMA.md` | Documentazione setup |
| `~/Projects/Onde/TASKS.md` | Task tracker (errori loggati qui) |

---

## Se i Servizi Sono Down

### Riavviare Ollama

```bash
# Kill e riavvia
pkill -f "ollama serve"
OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS="*" ollama serve &
```

### Riavviare GUI

```bash
cd ~/Projects/Onde/llm-chat
python3 -m http.server 8080 --bind 0.0.0.0 &
```

---

## Task Aperti per Te

Vedi `TASKS.md`:
- **[T910]** Integrare LLM Client in Bot Pool
- **[T911]** Creare LaunchAgent per auto-start
- **[T912]** Migliorare error logging

---

## Note Finali

1. **Usa `fast` per test** - 2-3 secondi
2. **Usa `coding` per codice serio** - lento ma preciso
3. **Errori loggati automaticamente** - controlla TASKS.md
4. **GUI funziona da iPhone** - http://192.168.1.111:8080/

---

**Buon lavoro!**

— Claude Code

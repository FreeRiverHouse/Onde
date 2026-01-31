# Architettura per Clawdinho - PM + LLM Locale per Coding

**Agente:** Clawdinho
**Ruolo:** Project Manager, Pianificazione, Assegnazione Task
**LLM Locale:** LLaMA 3.1 8B per coding tasks

---

## Architettura

```
+------------------+     +-------------------+     +------------------+
|   CLAWDINHO      |     |   LLM LOCALE      |     |   CODEBASE       |
|   (PM/Planning)  |---->|   (Coding Agent)  |---->|   (Git Repos)    |
+------------------+     +-------------------+     +------------------+
        |                        ^
        |                        |
        v                        |
+------------------+             |
|   Task Queue     |-------------+
+------------------+
```

---

## Ruoli

### Clawdinho (Tu)
- **NON scrivere codice direttamente**
- Pianifica features e bug fixes
- Crea task dettagliati
- Assegna task al LLM locale
- Revisiona output
- Decide se approvare o richiedere modifiche

### LLM Locale (LLaMA 3.1 8B)
- Scrive codice
- Genera funzioni, classi, test
- Risponde a domande tecniche
- **NON ha accesso al filesystem**
- **NON può eseguire codice**

---

## Workflow

### 1. Clawdinho riceve richiesta

```
User: "Aggiungi validazione email al form di registrazione"
```

### 2. Clawdinho pianifica

```
Task breakdown:
1. Creare funzione validate_email()
2. Integrare nel form handler
3. Aggiungere messaggi errore
4. Scrivere unit test
```

### 3. Clawdinho assegna al LLM

```bash
curl -s http://192.168.1.111:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Write a Python function validate_email(email: str) -> bool that checks if an email is valid using regex. Include docstring and type hints."}],
    "max_tokens": 300
  }'
```

### 4. LLM risponde con codice

```python
def validate_email(email: str) -> bool:
    """Validate email format using regex."""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))
```

### 5. Clawdinho revisiona e integra

- Verifica che il codice sia corretto
- Lo inserisce nel file appropriato
- Committa su git

---

## API per Clawdinho

### Endpoint
```
POST http://192.168.1.111:8080/v1/chat/completions
```

### Template richiesta coding

```json
{
  "messages": [{
    "role": "user",
    "content": "Write [TIPO: function/class/test] in [LINGUAGGIO] that [DESCRIZIONE]. Requirements: [REQUISITI]"
  }],
  "max_tokens": 400
}
```

### Esempi di prompt efficaci

```
"Write a Python function to parse JSON config files with error handling"

"Write a TypeScript class UserService with methods: create, update, delete, getById"

"Write pytest unit tests for the validate_email function"

"Write a bash script to backup all .py files to a dated folder"

"Write SQL query to find users who registered in the last 7 days"
```

---

## Helper Script per Clawdinho

```python
#!/usr/bin/env python3
# ~/Projects/Onde/tools/ask-coder.py

import requests
import sys

def ask_coder(prompt, max_tokens=400):
    """Chiedi al LLM locale di scrivere codice."""
    try:
        r = requests.post(
            "http://192.168.1.111:8080/v1/chat/completions",
            json={"messages": [{"role": "user", "content": prompt}], "max_tokens": max_tokens},
            timeout=60
        )
        return r.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        prompt = " ".join(sys.argv[1:])
        print(ask_coder(prompt))
    else:
        print("Usage: ask-coder.py 'Write a function to...'")
```

**Uso:**
```bash
python3 ~/Projects/Onde/tools/ask-coder.py "Write a function to merge two sorted lists"
```

---

## Best Practices

### DO (Fai)
- Scomponi task complessi in sotto-task
- Dai contesto specifico nei prompt
- Specifica linguaggio e requisiti
- Revisiona sempre l'output prima di usarlo
- Chiedi un pezzo di codice alla volta

### DON'T (Non fare)
- Non chiedere codice troppo lungo (>100 righe)
- Non fidarti ciecamente dell'output
- Non chiedere di modificare file esistenti (non ha accesso)
- Non aspettarti che ricordi conversazioni precedenti

---

## Limiti del LLM Locale

| Cosa | Limite |
|------|--------|
| Latenza | 4-6 sec/risposta |
| Max tokens | ~500 consigliato |
| Contesto | Non ha memoria tra richieste |
| File access | Nessuno |
| Esecuzione | Non può eseguire codice |
| Qualità | Buono per codice semplice, meno per architetture complesse |

---

## Quando usare LLM Locale vs Claude API

| Task | Usa |
|------|-----|
| Funzioni semplici | LLM Locale |
| Utility scripts | LLM Locale |
| Unit tests | LLM Locale |
| Architettura complessa | Claude API |
| Code review approfondita | Claude API |
| Debugging difficile | Claude API |
| Pianificazione strategica | Clawdinho (tu) |

---

**Server:** `http://192.168.1.111:8080/`
**GUI:** `http://192.168.1.111:8080/` (browser)
**Health:** `http://192.168.1.111:8080/health`

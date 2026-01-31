# 🤖 Agentic Framework - Multi-Agent Task Execution

Sistema di esecuzione parallela con LLM locali (Radeon 7900 XTX via Ollama).

## Architettura

```
┌─────────────────────────────────────────────────────────────┐
│                    DISPATCHER (Orchestrator)                 │
│  - Riceve task complessi                                     │
│  - Scompone in sub-task                                      │
│  - Assegna a specialist agents                               │
│  - Coordina risultati                                        │
└─────────────────────────────────────────────────────────────┘
                              │
      ┌───────────────────────┼───────────────────────┐
      ▼                       ▼                       ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   CODER     │       │   TESTER    │       │  DEPLOYER   │
│ deepseek-   │       │ llama31-8b  │       │ llama3.2:3b │
│ coder:6.7b  │       │             │       │             │
│             │       │             │       │             │
│ - Scrive    │       │ - Genera    │       │ - Deploy    │
│   codice    │       │   tests     │       │   scripts   │
│ - Refactor  │       │ - Review    │       │ - Verify    │
│ - Debug     │       │   code      │       │   deploys   │
└─────────────┘       └─────────────┘       └─────────────┘
      │                       │                       │
      └───────────────────────┼───────────────────────┘
                              ▼
                    ┌─────────────────┐
                    │ Ollama Server   │
                    │ 192.168.1.111   │
                    │ (Radeon 7900XTX)│
                    └─────────────────┘
```

## Componenti

### 1. `dispatcher.py` - Orchestratore Principale
- Accetta task in formato naturale o strutturato
- Scompone task complessi in sub-task paralleli
- Coordina l'esecuzione degli agenti
- Aggrega e reporta risultati

### 2. `agents/` - Specialist Agents
- `coder.py` - Scrittura e refactoring codice
- `tester.py` - Test generation e code review
- `deployer.py` - Deploy e verification scripts
- `researcher.py` - Analisi e ricerca

### 3. `workers/` - Worker Pool
- Pool di worker paralleli
- Queue-based task distribution
- Retry e error handling

## Uso

```python
from agentic import Dispatcher

# Inizializza dispatcher
d = Dispatcher()

# Task singolo
result = d.run("Create a REST API for todo items")

# Task multipli paralleli
results = d.parallel([
    "Write the API routes",
    "Create database models", 
    "Write unit tests"
])

# Pipeline completa
d.pipeline([
    {"agent": "coder", "task": "Write feature X"},
    {"agent": "tester", "task": "Test feature X"},
    {"agent": "deployer", "task": "Deploy feature X"}
])
```

## CLI

```bash
# Esegui task singolo
python -m agentic "Build todo API"

# Esegui task paralleli
python -m agentic --parallel tasks.txt

# Check status
python -m agentic --status
```

## Performance Target

- **Obiettivo**: 5 ore → 20 minuti
- **Strategia**: Task paralleli + specialist agents
- **Hardware**: Radeon 7900 XTX (24GB VRAM)
- **Tokens**: ∞ (locali, gratis!)

## Status

- [x] Architettura definita
- [ ] Core dispatcher
- [ ] Agent pool
- [ ] Parallel execution
- [ ] Integration tests

# ClawdBot + Modello Locale - Setup Funzionante

**Data:** 2026-02-03
**Status:** FUNZIONANTE

## Architettura

```
ClawdBot Gateway (18789)
    ↓
tinygrad provider (config)
    ↓
m1-qwen-wrapper (11435) ← proxy che rimuove tools
    ↓
Ollama (11434) ← server LLM
    ↓
Qwen 2.5 7B Q4_K_M
```

## Componenti

### 1. Ollama (porta 11434)
Serve i modelli LLM. Avviato automaticamente.

```bash
# Verifica
curl http://127.0.0.1:11434/api/tags

# Modelli disponibili
- qwen2.5:7b-instruct-q4_K_M (4.7GB, ATTIVO)
- qwen7b-16k:latest
```

### 2. M1 Qwen Wrapper (porta 11435)
Proxy Node.js che rimuove i `tools` dalle richieste (ClawdBot manda tools ma Qwen locale non li supporta).

**File:** `wrappers/m1-qwen-wrapper.js`
**LaunchAgent:** `~/Library/LaunchAgents/com.clawdbot.m1-wrapper.plist`

```bash
# Status
launchctl list | grep m1-wrapper

# Restart
launchctl stop com.clawdbot.m1-wrapper
launchctl start com.clawdbot.m1-wrapper

# Logs
tail -f ~/.clawdbot/logs/m1-wrapper.log
```

### 3. ClawdBot Gateway (porta 18789)
**LaunchAgent:** `~/Library/LaunchAgents/com.clawdbot.gateway.plist`

```bash
# Status
launchctl list | grep clawdbot.gateway

# Restart
launchctl stop com.clawdbot.gateway
launchctl start com.clawdbot.gateway

# Logs
tail -f ~/.clawdbot/logs/gateway.log
```

## Configurazione (~/.clawdbot/clawdbot.json)

### Primary Model
```json
"model": {
  "primary": "tinygrad/qwen2.5:7b-instruct-q4_K_M",
  "fallbacks": ["anthropic/claude-opus-4-5"]
}
```

### Provider TinyGrad
```json
"tinygrad": {
  "baseUrl": "http://127.0.0.1:11435/v1",
  "apiKey": "tinygrad",
  "api": "openai-completions",
  "models": [{
    "id": "qwen2.5:7b-instruct-q4_K_M",
    "name": "Qwen2.5-7B (Ollama Q4)",
    "contextWindow": 32768,
    "maxTokens": 4096
  }]
}
```

## Test

### Test diretto Ollama
```bash
curl -s "http://127.0.0.1:11434/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen2.5:7b-instruct-q4_K_M","messages":[{"role":"user","content":"Ciao"}]}'
```

### Test wrapper
```bash
curl -s "http://127.0.0.1:11435/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen2.5:7b-instruct-q4_K_M","messages":[{"role":"user","content":"Ciao"}]}'
```

### Test dashboard
1. Apri http://localhost:18789
2. Scrivi un messaggio
3. Verifica che risponda Qwen (non Claude)

## Performance

- **Modello:** Qwen 2.5 7B Instruct Q4_K_M
- **VRAM:** ~4.7 GB
- **Speed:** ~6-7 tok/s su M1 8GB
- **Latenza primo token:** ~2-3s

## Troubleshooting

### Wrapper non risponde
```bash
# Verifica porta
lsof -i :11435

# Se vuota, riavvia
launchctl stop com.clawdbot.m1-wrapper
launchctl start com.clawdbot.m1-wrapper
```

### Ollama non risponde
```bash
# Verifica
lsof -i :11434

# Se vuota
ollama serve &
```

### Gateway usa Claude invece di Qwen
Verifica che in `~/.clawdbot/clawdbot.json`:
- `agents.defaults.model.primary` sia `tinygrad/qwen2.5:7b-instruct-q4_K_M`
- Il provider `tinygrad` abbia il model ID corretto

## Upgrade Path

Per modelli più grandi:
1. Scarica con `ollama pull <model>`
2. Aggiorna model ID in:
   - `~/.clawdbot/clawdbot.json` (primary + provider)
   - `wrappers/m1-qwen-wrapper.js` (default)
3. Restart gateway e wrapper

### Modelli consigliati per M1 8GB
- `qwen2.5:7b-instruct-q4_K_M` (attuale, 4.7GB) - SAFE
- `qwen2.5:14b-instruct-q4_K_M` (~8GB) - AL LIMITE
- `mistral:7b-instruct-q4_K_M` (~4.1GB) - alternativa

### Modelli per Radeon 20GB (via TinyGrad)
- `qwen2.5:14b` - testato, funziona
- `qwen2.5:32b-q4` - dovrebbe entrare

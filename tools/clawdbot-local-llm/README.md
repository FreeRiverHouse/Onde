# ClawdBot Local LLM Integration

Sistema completo per utilizzare modelli Ollama locali (Llama, Qwen, etc.) con ClawdBot.

## Il Problema

ClawdBot espone 23 tools ai modelli LLM (tts, cron, message, etc.). I modelli Ollama/Llama/Qwen non sanno gestire correttamente questi tools e invece di rispondere con testo normale, continuano a chiamare tools in modo errato, causando:

- "No reply from agent"
- Risposte JSON invece di testo
- Loop infiniti di tool calls
- Bot Telegram che non risponde

## La Soluzione: Tool-Stripping Wrapper

Un proxy Node.js che intercetta le richieste a Ollama e **rimuove TUTTI i tools** prima di inoltrarle. Questo forza il modello a rispondere sempre con testo normale.

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│  ClawdBot   │────▶│  Tool Wrapper   │────▶│   Ollama    │
│ (23 tools)  │     │  (strips tools) │     │  (no tools) │
└─────────────┘     │   porta 11435   │     │ porta 11434 │
                    └─────────────────┘     └─────────────┘
```

---

## Struttura File

```
clawdbot-local-llm/
├── README.md                    # Questa documentazione
├── wrappers/
│   ├── tool-wrapper.js          # Wrapper per Ollama locale (11435 → 11434)
│   └── radeon-wrapper.js        # Wrapper per Radeon LAN (11436 → 192.168.1.111:11434)
├── launchagents/
│   ├── com.clawdbot.ollama-wrapper.plist   # Auto-start macOS per Ollama
│   └── com.clawdbot.radeon-wrapper.plist   # Auto-start macOS per Radeon
└── config-ui/
    ├── server.js                # Backend API per la dashboard
    ├── package.json             # Dependencies (express)
    └── public/
        └── index.html           # Web UI per configurare modelli
```

---

## Installazione Passo-Passo

### 1. Prerequisiti

```bash
# Installa Ollama
brew install ollama

# Avvia Ollama
ollama serve

# Scarica modelli
ollama pull llama3.1:8b      # Raccomandato: 4.9GB, 128K context
ollama pull qwen2.5:7b       # Alternativa: 4.7GB, 32K context
```

### 2. Setup Wrappers

```bash
# Copia i wrapper in una directory permanente
mkdir -p ~/ClawdBot/wrappers
cp wrappers/*.js ~/ClawdBot/wrappers/

# Installa dipendenze
cd ~/ClawdBot/wrappers
npm init -y
npm install express
```

### 3. Setup LaunchAgents (Auto-Start)

```bash
# Copia i plist (MODIFICA I PATH PRIMA!)
cp launchagents/*.plist ~/Library/LaunchAgents/

# Edita i path nel plist per matchare la tua installazione
nano ~/Library/LaunchAgents/com.clawdbot.ollama-wrapper.plist

# Carica i servizi
launchctl load ~/Library/LaunchAgents/com.clawdbot.ollama-wrapper.plist
launchctl load ~/Library/LaunchAgents/com.clawdbot.radeon-wrapper.plist

# Verifica che siano in esecuzione
launchctl list | grep clawdbot
```

### 4. Configura ClawdBot

Modifica `~/.clawdbot/clawdbot.json`:

```json
{
  "models": {
    "mode": "merge",
    "providers": {
      "ollama": {
        "baseUrl": "http://127.0.0.1:11435/v1",
        "apiKey": "ollama",
        "api": "openai-completions",
        "models": [
          {
            "id": "llama3.1:8b",
            "name": "Llama 3.1 8B Instruct",
            "reasoning": false,
            "input": ["text"],
            "cost": {"input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0},
            "contextWindow": 131072,
            "maxTokens": 8192
          },
          {
            "id": "qwen2.5:7b",
            "name": "Qwen 2.5 7B Chat",
            "reasoning": false,
            "input": ["text"],
            "cost": {"input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0},
            "contextWindow": 32768,
            "maxTokens": 8192
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "ollama/llama3.1:8b",
        "fallbacks": ["ollama/qwen2.5:7b"]
      }
    }
  }
}
```

**IMPORTANTE**: Il `baseUrl` deve puntare al WRAPPER (porta 11435), NON a Ollama diretto (porta 11434)!

---

## Porte

| Servizio | Porta | Descrizione |
|----------|-------|-------------|
| Ollama nativo | 11434 | Server LLM, NON usare direttamente con ClawdBot |
| Wrapper Ollama | **11435** | Proxy che rimuove tools - USARE QUESTO |
| Wrapper Radeon | 11436 | Per GPU remota su LAN (192.168.1.111) |
| Config UI | 8888 | Dashboard web per configurare modelli |

---

## Tool Wrapper - Dettagli Tecnici

### File: `wrappers/tool-wrapper.js`

Il wrapper intercetta `/v1/chat/completions` e applica queste modifiche:

#### 1. Rimuove tutti i tools dalla richiesta (linea 75-77)

```javascript
// IMPORTANTE: Rimuovi TUTTI i tools dalla richiesta per Ollama
// Ollama non sa usare i tools correttamente e continua a chiamarli
console.log(`[WRAPPER] Stripping ${tools?.length || 0} tools from request`);
```

#### 2. NON inietta tools nel prompt (linea 88)

```javascript
// NON iniettare tools nel prompt - Ollama non li gestisce bene
// Skip completamente la logica dei tools
if (false && tools && tools.length > 0) {  // "false &&" disabilita questo blocco
```

#### 3. Forza hasTools = false (linea 121-124)

```javascript
// Non usare tools con Ollama - forza sempre streaming normale
const hasTools = false; // Ignora tools
const isStreaming = stream === true;
console.log(`[WRAPPER] Stream mode: ${isStreaming}, hasTools: ${hasTools} (forced false)`);
```

#### 4. NON processa tool calls nella risposta (linea 172)

```javascript
// Non processare tool calls - Ollama non li gestisce bene
if (false && tools && tools.length > 0 && data.choices?.[0]?.message?.content) {
```

#### 5. Richiesta inviata a Ollama (senza tools)

```javascript
body: JSON.stringify({
  model,
  messages: modifiedMessages,
  stream: isStreaming,
  ...rest  // NON include 'tools'
})
```

---

## Config UI Dashboard

### Avvio

```bash
cd config-ui
npm install
npm start
# Apri http://localhost:8888
```

### Funzionalità

1. **Visualizza configurazione ClawdBot** - Legge `~/.clawdbot/clawdbot.json`
2. **Modifica modelli** - Cambia primary/fallback models
3. **Auto-discovery Ollama** - Scopre automaticamente i modelli disponibili
4. **Test provider** - Verifica connessione a Ollama/Radeon

### API Endpoints

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/config` | GET | Legge configurazione ClawdBot |
| `/api/config` | POST | Salva configurazione ClawdBot |
| `/api/ollama/models?url=...` | GET | Lista modelli Ollama |
| `/api/test-provider` | POST | Test connessione provider |

---

## LaunchAgent - Dettagli

### File: `launchagents/com.clawdbot.ollama-wrapper.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "...">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>com.clawdbot.ollama-wrapper</string>

    <key>Comment</key>
    <string>Ollama Tool Wrapper for ClawdBot (strips tools from requests)</string>

    <!-- Avvia automaticamente al login -->
    <key>RunAtLoad</key>
    <true/>

    <!-- Riavvia se crasha -->
    <key>KeepAlive</key>
    <true/>

    <!-- Comando da eseguire -->
    <key>ProgramArguments</key>
    <array>
      <string>/opt/homebrew/bin/node</string>
      <string>/PATH/TO/tool-wrapper.js</string>  <!-- MODIFICA QUESTO PATH -->
    </array>

    <!-- Working directory -->
    <key>WorkingDirectory</key>
    <string>/PATH/TO/WRAPPER/DIR</string>  <!-- MODIFICA QUESTO PATH -->

    <!-- Log files -->
    <key>StandardOutPath</key>
    <string>/Users/YOUR_USER/.clawdbot/logs/ollama-wrapper.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/YOUR_USER/.clawdbot/logs/ollama-wrapper.err.log</string>

    <!-- Environment variables -->
    <key>EnvironmentVariables</key>
    <dict>
      <key>HOME</key>
      <string>/Users/YOUR_USER</string>
      <key>PATH</key>
      <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
    </dict>
  </dict>
</plist>
```

### Comandi utili LaunchAgent

```bash
# Carica (avvia il servizio)
launchctl load ~/Library/LaunchAgents/com.clawdbot.ollama-wrapper.plist

# Scarica (ferma il servizio)
launchctl unload ~/Library/LaunchAgents/com.clawdbot.ollama-wrapper.plist

# Verifica status
launchctl list | grep clawdbot

# Vedi log
tail -f ~/.clawdbot/logs/ollama-wrapper.log
tail -f ~/.clawdbot/logs/ollama-wrapper.err.log

# Restart
launchctl unload ~/Library/LaunchAgents/com.clawdbot.ollama-wrapper.plist
launchctl load ~/Library/LaunchAgents/com.clawdbot.ollama-wrapper.plist
```

---

## Test e Verifica

### Test 1: Ollama diretto (senza wrapper)

```bash
curl -s http://127.0.0.1:11434/api/chat \
  -d '{"model":"llama3.1:8b","messages":[{"role":"user","content":"Ciao"}],"stream":false}' \
  | jq -r '.message.content'
```

### Test 2: Attraverso wrapper

```bash
curl -s http://127.0.0.1:11435/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3.1:8b","messages":[{"role":"user","content":"Ciao"}],"stream":false}' \
  | jq '.choices[0].message.content'
```

### Test 3: ClawdBot CLI

```bash
clawdbot agent --agent main --message "Ciao, chi sei?"
```

### Test 4: Telegram

```bash
clawdbot agent --agent main --channel telegram --to YOUR_CHAT_ID --message "Test" --deliver
```

### Verifica nei log

```bash
tail -f ~/.clawdbot/logs/ollama-wrapper.log
```

Output atteso:
```
[WRAPPER] Received chat completion request
[WRAPPER] Stripping 23 tools from request
[WRAPPER] Forwarding to Ollama: model=llama3.1:8b, messages=2
[WRAPPER] Stream mode: true, hasTools: false (forced false)
[WRAPPER] Proxying streaming response
```

---

## Troubleshooting

### "No reply from agent"

**Causa**: Il modello sta chiamando tools invece di rispondere
**Fix**:
1. Verifica che il wrapper sia attivo: `launchctl list | grep ollama-wrapper`
2. Verifica che ClawdBot usi la porta 11435, non 11434

### Wrapper non risponde

```bash
# Restart wrapper
launchctl unload ~/Library/LaunchAgents/com.clawdbot.ollama-wrapper.plist
launchctl load ~/Library/LaunchAgents/com.clawdbot.ollama-wrapper.plist

# Oppure manualmente
node ~/ClawdBot/wrappers/tool-wrapper.js
```

### Modello sbagliato in uso

Verifica `~/.clawdbot/clawdbot.json`:
- `agents.defaults.model.primary` deve essere `ollama/llama3.1:8b`
- NON solo `llama3.1:8b` (serve il prefisso provider)

### Config validation errors

```bash
clawdbot doctor --fix
```

### Session troppo lunga / memoria

```bash
# Reset sessione
rm -f ~/.clawdbot/agents/main/sessions/*.lock
rm -rf ~/.clawdbot/agents/main/sessions
mkdir -p ~/.clawdbot/agents/main/sessions
```

---

## Modelli Raccomandati

| Modello | Size | Context | Uso |
|---------|------|---------|-----|
| **llama3.1:8b** | 4.9 GB | 128K | Chat generale, conversazioni lunghe |
| qwen2.5:7b | 4.7 GB | 32K | Chat, buono in italiano |
| qwen2.5-coder:7b | 4.7 GB | 32K | Coding tasks |
| qwen2.5-coder:14b | 9.0 GB | 32K | Coding avanzato (richiede più RAM) |

**Raccomandazione**: Usa `llama3.1:8b` come primario per il contesto 4x maggiore (128K vs 32K).

---

## Confronto Modelli (2026-02-01)

**Prompt**: "Ciao, presentati brevemente in italiano"

### Llama 3.1 8B
> Piacere! Sono un modello di intelligenza artificiale noto come Llama (Large Language Model Meta AI). Non ho una vera identità o una storia personale come gli esseri umani, ma sono stato allenato per fornire informazioni e assistenza su una vasta gamma di argomenti.

### Qwen 2.5 7B
> Ciao! Mi chiamo Qwen e sono un assistente virtuale creato da Alibaba Cloud. Sono qui per aiutarti con tutte le tue domande e richieste.

**Verdetto**: Entrambi funzionano bene in italiano. Llama ha contesto maggiore.

---

## Radeon LAN (Opzionale)

Se hai una GPU AMD Radeon su un altro PC in LAN:

1. Configura Ollama sul PC Radeon
2. Usa `radeon-wrapper.js` (porta 11436 → 192.168.1.111:11434)
3. Aggiungi provider `radeon` in clawdbot.json con baseUrl `http://127.0.0.1:11436/v1`

---

## Autore

- **Fix implementato da**: Claude Code (Opus 4.5)
- **Data**: 2026-02-01
- **Repository**: https://github.com/FreeRiverHouse/Onde

## Changelog

- **v1.0** (2026-02-01): Prima release con tool-stripping wrapper

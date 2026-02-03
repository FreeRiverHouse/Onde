# MASTER-CODE-M4-v1
## Guida LLM Locali su Mac M4 (24GB RAM) con MLX

**Ultima modifica:** 2026-02-03 02:30
**Hardware:** MacBook Pro M4 Max, 24GB RAM unificata
**Framework:** MLX (Apple Silicon optimized)

---

## 🔥🔥🔥 CLAWDBOT + QWEN3-CODER MoE - SETUP FUNZIONANTE (2026-02-03) 🔥🔥🔥

### IL SETUP CORRETTO (TESTATO E FUNZIONANTE!)

```
ClawdBot Gateway (18789)
    ↓
mlx-coder-wrapper (11435) ← strippa 23 tools
    ↓
mlx-openai-server (8080) ← HA --context-length!
    ↓
Qwen3-Coder-30B-A3B-Instruct-4bit (MoE) ← 87 tok/s, 3 sec response!
```

### ⚠️ ERRORI DA NON RIPETERE MAI:

| SBAGLIATO | CORRETTO | Perché |
|-----------|----------|--------|
| `mlx_lm.server` | `mlx-openai-server` | mlx_lm.server NON ha --context-length → OOM! |
| `Qwen/Qwen3-32B-MLX-4bit` (dense) | `mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit` (MoE) | Dense usa 32B params, MoE solo 3B attivi! |
| contextWindow: 4096 | contextWindow: 16000+ | ClawdBot RICHIEDE min 16000! |

### Comandi di Avvio (COPIA-INCOLLA)

```bash
# 1. Avvia mlx-openai-server con context limit
source ~/mlx-env/bin/activate
nohup mlx-openai-server launch \
  --model-path mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit \
  --model-type lm \
  --context-length 8192 \
  --host 127.0.0.1 \
  --port 8080 \
  > /tmp/mlx-openai-server.log 2>&1 &

# 2. Avvia wrapper
cd ~/CascadeProjects/Onde/tools/clawdbot-local-llm/wrappers
nohup node mlx-coder-wrapper.js > /tmp/mlx-wrapper.log 2>&1 &

# 3. Verifica
curl -s http://127.0.0.1:8080/v1/models | jq -r '.data[0].id'
# Output: mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit

curl -s http://127.0.0.1:11435/health
# Output: {"status":"ok","proxy_port":11435,"target":"http://127.0.0.1:8080"}
```

### Config ClawdBot (~/.clawdbot/clawdbot.json)

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "mlx/mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit",
        "fallbacks": [
          "mlx/mlx-community/Qwen2.5-7B-Instruct-4bit",
          "anthropic/claude-opus-4-20250514"
        ]
      }
    }
  }
}
```

### Performance Misurate (MoE vs Dense)

| Modello | Tipo | RAM | Velocità | ClawdBot |
|---------|------|-----|----------|----------|
| **Qwen3-Coder-30B-A3B** | MoE (3B attivi) | ~17GB | **87 tok/s** | ✅ 3 sec |
| Qwen3-32B | Dense (32B) | ~19GB | 12 tok/s | ❌ OOM |
| Qwen2.5-7B | Dense | ~4GB | 50 tok/s | ✅ Backup |

### Disabilitare Sabotatori (LaunchAgents che fanno conflitto)

```bash
launchctl unload ~/Library/LaunchAgents/com.clawdbot.ollama-wrapper.plist 2>/dev/null
launchctl unload ~/Library/LaunchAgents/com.clawdbot.radeon-wrapper.plist 2>/dev/null
```

### Test Rapido

```bash
# Test diretto a mlx-openai-server
curl -s -X POST http://127.0.0.1:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit","messages":[{"role":"user","content":"Hello! /no_think"}],"max_tokens":50}' \
  | jq -r '.choices[0].message.content'
```

---

## 🚀 RIPRENDI DA QUI (Handover 2026-02-02 18:15)

### Sistema Traduzione OTTIMIZZATO - Two-Phase!

**GUI:** http://localhost:8501
**Server API:** http://localhost:8765

### Architettura Two-Phase

| Fase | Modello | Metodo | Note |
|------|---------|--------|------|
| **Phase 1** | Qwen3-32B | API Server (in memoria) | Traduzione + Revisione Qwen |
| _swap_ | - | Stop server, free RAM | ~3s |
| **Phase 2** | Mistral-24B | In-memory (no subprocess) | Revisione finale - VELOCE |

### Come Testare

1. **Verifica server attivo:**
   ```bash
   curl -s http://localhost:8765/health
   # Output: {"status":"ok","qwen_loaded":true,"mistral_loaded":false}
   ```

2. **Se server non è attivo:**
   ```bash
   source ~/mlx-env/bin/activate
   cd ~/CascadeProjects/Onde/traduzioni/translator-system
   python mlx_server.py
   ```

3. **Test traduzione via API:**
   ```bash
   curl -s -X POST "http://localhost:8765/translate" \
     -H "Content-Type: application/json" \
     -d '{"text":"Hello world.","revise":true}'
   ```

4. **Test traduzione libro:**
   ```bash
   source ~/mlx-env/bin/activate
   cd ~/CascadeProjects/Onde/traduzioni/translator-system
   python translate_book.py test.txt
   # Oppure senza Phase 2 (solo Qwen):
   python translate_book.py test.txt --skip-mistral
   ```

5. **GUI Streamlit:**
   ```bash
   cd gui && streamlit run app.py --server.port 8501
   # Apri http://localhost:8501
   ```

### Script Traduzione - translate_book.py

| Opzione | Descrizione |
|---------|-------------|
| `--reset` | Riparti da zero (cancella progresso) |
| `--skip-mistral` | Salta Phase 2 (solo Qwen) |

**Output:**
- `output/[nome]_IT.txt` - Traduzione Phase 1
- `output/[nome]_IT_FINAL.txt` - Dopo Phase 2 (Mistral)

---

## 📁 File del Sistema

| File | Descrizione |
|------|-------------|
| `mlx_server.py` | Server API con Qwen3 in memoria (Phase 1) |
| `translate_book.py` | **MAIN** - Two-Phase translator (API + in-memory) |
| `translate_fast.py` | Traduttore via API (solo Qwen, no Phase 2) |
| `gui/app.py` | GUI Streamlit completa |

---

## ⚡ Performance Misurate (2026-02-02)

| Metodo | Tempo/riga | Note |
|--------|------------|------|
| **Server API** | **~7s** | Modello in memoria, RACCOMANDATO |
| Subprocess | ~23s | Ricarica modello ogni volta |

### Perché Server API è 3x più veloce
- Subprocess: ogni traduzione ricarica 16GB di modello
- Server: modello caricato UNA volta, resta in RAM

---

## 🖥️ MLX Server

### Avvio Manuale
```bash
source ~/mlx-env/bin/activate
cd ~/CascadeProjects/Onde/traduzioni/translator-system
python mlx_server.py
```

### API Endpoints

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/status` | GET | Stato server |
| `/translate` | POST | Traduzione EN→IT |
| `/generate` | POST | Generazione testo libera |

### Esempio API
```bash
curl -X POST http://localhost:8765/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "revise": false}'
```

---

## ⚠️ Limitazioni RAM

**24GB non basta per entrambi i modelli contemporaneamente!**

| Modello | RAM |
|---------|-----|
| Qwen3-32B | ~18GB |
| Mistral-24B | ~12GB |
| **Totale** | **~30GB** > 24GB |

**Soluzione attuale:** Solo Qwen3 caricato nel server.

---

## Setup Ambiente MLX

```bash
# Creare virtual environment
python3 -m venv ~/mlx-env

# Attivare
source ~/mlx-env/bin/activate

# Installare MLX e tools
pip install mlx mlx-lm requests

# (Opzionale) Login HuggingFace per download veloci
pip install huggingface_hub
huggingface-cli login
```

---

## Modelli Testati e Funzionanti

### Qwen3-32B-MLX-4bit (RACCOMANDATO)

| Parametro | Valore |
|-----------|--------|
| **Modello** | `Qwen/Qwen3-32B-MLX-4bit` |
| **Dimensione** | ~16GB |
| **Velocita** | 13.5-14 tokens/sec |
| **Memoria picco** | 17.5 GB |
| **Status** | ✅ FUNZIONA |

#### Comando CLI Base
```bash
source ~/mlx-env/bin/activate && mlx_lm.generate \
  --model Qwen/Qwen3-32B-MLX-4bit \
  --prompt "Your prompt here /no_think" \
  --max-tokens 500
```

#### Disabilitare Thinking Mode
Qwen3 ha un "thinking mode" che ragiona ad alta voce. Per risposte dirette aggiungere `/no_think` nel prompt.

---

### Qwen2.5-7B-Instruct-4bit (LEGGERO)

| Parametro | Valore |
|-----------|--------|
| **Modello** | `Qwen/Qwen2.5-7B-Instruct-4bit` |
| **Dimensione** | ~4GB |
| **Status** | ✅ FUNZIONA - Backup leggero |

```bash
mlx_lm.generate --model Qwen/Qwen2.5-7B-Instruct-4bit \
  --prompt "Your prompt" --max-tokens 200
```

---

## Mistral Small Creative 24B

**Status:** Convertito ma NON usabile insieme a Qwen3 (RAM limit)

| Parametro | Valore |
|-----------|--------|
| **Path locale** | `~/Models/MistralSmall-Creative-24B-MLX-4bit` |
| **Parametri** | 23.5B |
| **RAM** | ~12GB |

### Uso standalone (senza Qwen3)
```bash
mlx_lm.generate --model ~/Models/MistralSmall-Creative-24B-MLX-4bit \
  --prompt "Your creative prompt" --max-tokens 500
```

---

## Modelli NON Funzionanti su 24GB

| Modello | Problema |
|---------|----------|
| DeepSeek-R1-Distill-Qwen-32B | METAL Command buffer crash |
| Qwen2.5-32B | Troppo grande, crash |
| DeepSeek-R1-32B | Memoria insufficiente |
| Qwen3 + Mistral insieme | OOM (30GB > 24GB) |

---

## Tips & Tricks

1. **Warning 16599 MB** - Normale, modello vicino al limite ma funziona
2. **Deprecation mx.metal.device_info** - Ignorare
3. **Thinking mode Qwen3** - Usa `/no_think` per risposte dirette
4. **Max tokens** - Non essere tirchio, i token locali sono GRATIS!
5. **Prima run** - Primo avvio scarica modello, poi cached in `~/.cache/huggingface/`
6. **Server crashato?** - Probabilmente OOM, riavvia con un solo modello

---

## Troubleshooting

### Server non risponde
```bash
# Check se è attivo
ps aux | grep mlx_server

# Se non c'è, avvia:
source ~/mlx-env/bin/activate
cd ~/CascadeProjects/Onde/traduzioni/translator-system
python mlx_server.py
```

### GUI non risponde
```bash
# Check se attiva
curl -sI http://localhost:8501 | head -1

# Se non risponde:
source ~/mlx-env/bin/activate
cd ~/CascadeProjects/Onde/traduzioni/translator-system/gui
streamlit run app.py --server.port 8501
```

### OOM / Crash memoria
- Riavvia server (modello potrebbe essere corrotto in RAM)
- `pkill -f mlx_server && pkill -f mlx_lm`
- Aspetta 5s, poi riavvia server

---

## Changelog

- **2026-02-03 01:50**: Setup finale funzionante:
  - **Qwen3-32B-MLX-4bit** = FUNZIONA con ClawdBot (contextWindow: 16000)
  - **MoE (30B-A3B)** = CRASHA con context grande (7500+ tokens) - OOM su 24GB
  - ClawdBot richiede contextWindow >= 16000 (hardcoded min)
  - Problema MoE: carica 30B in RAM anche se solo 3B attivi
  - Per 24GB RAM: usa Qwen3-32B o modelli più piccoli (14B, 7B)
- **2026-02-02 19:00**: Phase 2 ora in-memory:
  - Dopo Phase 1, stoppa Qwen server (libera RAM)
  - Carica Mistral direttamente in memoria (no subprocess!)
  - Revisione finale molto più veloce
  - Output: `*_IT.txt` (Phase 1), `*_IT_FINAL.txt` (Phase 2)
- **2026-02-02 18:15**: Sistema Two-Phase completato:
  - translate_book.py usa API server per Phase 1 (FAST)
  - Phase 1: Qwen3 traduzione + Qwen3 revisione (via API)
  - Phase 2: Mistral batch revision (subprocess)
  - Opzione --skip-mistral per saltare Phase 2
  - Anti-slop check su tutte le fasi
- **2026-02-02 17:50**: Sistema traduzione completo:
  - MLX Server con API REST (modello in memoria)
  - translate_fast.py (3x più veloce)
  - GUI completa con server control
  - Scoperto limite RAM: solo 1 modello alla volta
- **2026-02-02 10:00**: Handover iniziale
- **2026-02-02 09:30**: Testato Qwen3-32B traduzione EN→IT
- **2026-02-02 09:00**: Prima versione documento

---

## 🤖 CLAWDBOT + MLX INTEGRATION (2026-02-03)

### Setup Funzionante - TESTATO!

```
ClawdBot Gateway (18789)
    ↓
mlx provider (config)
    ↓
mlx-coder-wrapper (11435) ← proxy che rimuove 23 tools
    ↓
MLX Server (8080) ← mlx_lm.server
    ↓
Qwen3-32B-MLX-4bit ✅ FUNZIONA
```

### Architettura

| Componente | Porta | File/Comando |
|------------|-------|--------------|
| MLX Server | 8080 | `mlx_lm.server --model Qwen/Qwen3-32B-MLX-4bit` |
| Wrapper | 11435 | `node mlx-coder-wrapper.js` |
| ClawdBot | 18789 | Gateway dashboard |

### ⚠️ CONFIGURAZIONE CRITICA - Context Limits

**ClawdBot richiede contextWindow >= 16000!** (min=16000 hardcoded)

Se contextWindow < 16000 → modello bloccato → fallback su Anthropic.

**Config in `~/.clawdbot/clawdbot.json`:**

```json
{
  "models": {
    "providers": {
      "mlx": {
        "baseUrl": "http://127.0.0.1:11435/v1",
        "apiKey": "mlx",
        "api": "openai-completions",
        "models": [{
          "id": "Qwen/Qwen3-32B-MLX-4bit",
          "name": "Qwen3 32B (MLX M4)",
          "contextWindow": 16384,
          "maxTokens": 8192
        },
        {
          "id": "mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit",
          "name": "Qwen3 Coder 30B MoE (3B active)",
          "contextWindow": 16384,
          "maxTokens": 8192
        }]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "mlx/mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit"
      }
    }
  }
}
```

### Avvio Completo

```bash
# 1. MLX Server
source ~/mlx-env/bin/activate
nohup mlx_lm.server --model Qwen/Qwen3-32B-MLX-4bit \
  --host 127.0.0.1 --port 8080 --trust-remote-code \
  > /tmp/mlx-server.log 2>&1 &

# 2. Wrapper (dalla dir wrappers)
cd ~/CascadeProjects/Onde/tools/clawdbot-local-llm/wrappers
nohup node mlx-coder-wrapper.js > /tmp/mlx-wrapper.log 2>&1 &

# 3. Test
curl -s http://127.0.0.1:11435/health
# Output: {"status":"ok","proxy_port":11435,"target":"http://127.0.0.1:8080"}

# 4. Dashboard
open "http://localhost:18789/?token=YOUR_TOKEN"
```

### Test API

```bash
curl -s -X POST "http://127.0.0.1:11435/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -d '{"model":"Qwen/Qwen3-32B-MLX-4bit","messages":[{"role":"user","content":"Ciao! /no_think"}],"max_tokens":100}'
```

### Wrapper - mlx-coder-wrapper.js

**Path:** `~/CascadeProjects/Onde/tools/clawdbot-local-llm/wrappers/mlx-coder-wrapper.js`

Funzioni:
- Rimuove 23 tools da ogni richiesta (ClawdBot li manda ma MLX non li supporta)
- Proxy streaming responses
- Gestisce errori JSON

### Modelli Testati con ClawdBot (24GB RAM)

| Modello | Status | Note |
|---------|--------|------|
| **mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit** | ✅ **RACCOMANDATO** | MoE, 87 tok/s, usa `mlx-openai-server` |
| mlx-community/Qwen2.5-7B-Instruct-4bit | ✅ FUNZIONA | Backup leggero, context 32k |
| Qwen/Qwen3-32B-MLX-4bit | ⚠️ LENTO | Dense 32B, 12 tok/s, OOM con system prompt grande |

### Qwen3-Coder-30B-A3B (MoE) - RACCOMANDATO! (2026-02-03)

**Mixture of Experts**: 30B parametri totali, ma solo **3B attivi** per inferenza = VELOCISSIMO!

| Parametro | Valore |
|-----------|--------|
| **Modello** | `mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit` |
| **Parametri totali** | 30B |
| **Parametri attivi** | 3B (molto più leggero!) |
| **RAM** | ~17GB |
| **Velocità** | **87 tok/s** su M4 Max |
| **Response time** | **~3 secondi** |
| **Status** | ✅ **FUNZIONA PERFETTAMENTE** |

**⚠️ USARE `mlx-openai-server` CON `--context-length`!**

```bash
mlx-openai-server launch \
  --model-path mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit \
  --model-type lm \
  --context-length 8192 \
  --host 127.0.0.1 \
  --port 8080
```

**Config in clawdbot.json:**
```json
{
  "id": "mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit",
  "name": "Qwen3 Coder 30B MoE (3B active)",
  "contextWindow": 16000,
  "maxTokens": 8192
}
```

**Per usarlo come default:**
```json
"primary": "mlx/mlx-community/Qwen3-Coder-30B-A3B-Instruct-4bit"
```

**Perché MoE è meglio di Dense 32B:**
- MoE: 3B params attivi → 87 tok/s, ~17GB RAM
- Dense 32B: 32B params attivi → 12 tok/s, ~19GB RAM, OOM con system prompt grande

### Troubleshooting ClawdBot

**Bot usa fallback Anthropic invece di MLX:**
- Check log: `tail /tmp/clawdbot/clawdbot-*.log | grep "blocked model"`
- Se vedi `ctx=8192 (min=16000)` → contextWindow troppo piccolo!
- Soluzione: `contextWindow: 16384` in clawdbot.json, poi `clawdbot gateway --force`

**"fetch failed" nel wrapper log:**
- MLX server crashato → riavvia con `mlx_lm.server`
- Verifica: `curl http://127.0.0.1:8080/v1/models`

**OOM / METAL crash:**
- Modello denso 32B con context grande → potrebbe crashare
- MoE (3B attivi) regge meglio context grandi
- Usa `/no_think` nei prompt per risposte più corte

**Bot non risponde nella dashboard:**
- Verifica wrapper: `curl http://127.0.0.1:11435/health`
- Verifica MLX: `curl http://127.0.0.1:8080/v1/models`
- Check logs: `tail -f /tmp/mlx-wrapper.log`

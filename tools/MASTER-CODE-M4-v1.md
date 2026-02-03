# MASTER-CODE-M4-v1
## Guida LLM Locali su Mac M4 (24GB RAM) con MLX

**Ultima modifica:** 2026-02-02 17:50
**Hardware:** MacBook Pro M4, 24GB RAM unificata
**Framework:** MLX (Apple Silicon optimized)

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

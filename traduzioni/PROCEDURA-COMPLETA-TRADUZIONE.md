# 📚 PROCEDURA COMPLETA DI TRADUZIONE

**Owner:** Agente Editore Capo (@ondinho)
**Versione:** 2.0 — IRROBUSTITA
**Data:** 2026-01-30
**Ultimo aggiornamento:** Post-mortem Capussela

---

## ⛔ REGOLE ASSOLUTE

```
╔════════════════════════════════════════════════════════════════╗
║  1. MAI USARE TOKEN CLAUDE PER TRADUZIONI O REVISIONI          ║
║  2. OGNI MESSAGGIO MATTIA VA SU GIT (REGOLA ZERO)              ║
║  3. SAMPLE APPROVAZIONE OBBLIGATORIO PRIMA DI PRODUZIONE       ║
║  4. ⭐ VALIDARE COMPLETEZZA PRIMA DI DICHIARARE "FATTO"        ║
║  5. ⭐ MAI LIMITI HARDCODED (MAX_PARAGRAPHS, etc.)             ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 🛡️ MECCANISMI ANTI-CRASH (NUOVO v2.0)

### A) Monitoraggio CPU Obbligatorio
```bash
# Prima di ogni step pesante
CPU_THRESHOLD=80
current_cpu=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | tr -d '%')
if (( $(echo "$current_cpu > $CPU_THRESHOLD" | bc -l) )); then
    echo "⚠️ CPU al $current_cpu% - ATTENDI prima di continuare!"
    sleep 60
fi
```

### B) Split per Capitoli (MAI tutto insieme!)
```
⛔ SBAGLIATO: Processare 1600 paragrafi in un colpo
✅ GIUSTO:    Processare 1 capitolo alla volta con pause
```

**Sequenza obbligatoria:**
1. Splitta libro in capitoli separati
2. Processa Cap 1 → Checkpoint → Pausa 5min
3. Verifica CPU < 70%
4. Processa Cap 2 → Checkpoint → Pausa 5min
5. Ripeti...

### C) Checkpoint dopo ogni capitolo
```bash
# Dopo ogni capitolo completato
cp traduzione_in_corso.txt checkpoints/cap_N_$(date +%s).txt
echo "Cap N completato: $(date)" >> checkpoints/progress.log
```

### D) Recovery da crash
```bash
# Se crash, riparti dall'ultimo checkpoint
LAST_CHECKPOINT=$(ls -t checkpoints/*.txt | head -1)
echo "Riparto da: $LAST_CHECKPOINT"
```

### E) Timeout per singole chiamate LLM
```python
# MAI chiamate senza timeout!
TIMEOUT_SECONDS = 120  # Max 2 minuti per paragrafo
# Se timeout → log + skip + continua
```

### F) Validazione dimensioni OBBLIGATORIA
```bash
# PRIMA di dichiarare "completato":
ORIG_SIZE=$(wc -c < originale.txt)
TRAD_SIZE=$(wc -c < traduzione.txt)
RATIO=$(echo "scale=2; $TRAD_SIZE / $ORIG_SIZE * 100" | bc)

if (( $(echo "$RATIO < 80" | bc -l) )); then
    echo "🚨 ERRORE: Traduzione incompleta! Solo ${RATIO}%"
    exit 1
fi
```

---

## 🔄 PIPELINE COMPLETA v2.0

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   STEP 0     │ →   │   STEP 1     │ →   │   STEP 2     │
│  VALIDAZIONE │     │  TRADUZIONE  │     │  REVISIONE   │
│  INPUT       │     │  (per cap)   │     │  (per cap)   │
└──────────────┘     └──────────────┘     └──────────────┘
       ↓                                         ↓
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   STEP 3     │ →   │   STEP 4     │ →   │   STEP 5     │
│  VALIDAZIONE │     │   SAMPLE     │     │ APPROVAZIONE │
│  OUTPUT      │     │  (3 pagine)  │     │  (Mattia)    │
└──────────────┘     └──────────────┘     └──────────────┘
       ↓                                         ↓
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   STEP 6     │ →   │   STEP 7     │ →   │   STEP 8     │
│  PRODUZIONE  │     │  QA FINALE   │     │ PUBBLICAZ.   │
│  FINALE      │     │  COMPLETO    │     │  (KDP)       │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 📋 STEP DETTAGLIATI

### STEP 0: VALIDAZIONE INPUT ⭐ NUOVO
Prima di iniziare QUALSIASI traduzione:

```bash
# 1. Verifica file esiste e non è vuoto
if [ ! -s "$INPUT_FILE" ]; then
    echo "🚨 ERRORE: File input vuoto o inesistente!"
    exit 1
fi

# 2. Conta struttura
echo "=== ANALISI INPUT ==="
echo "File: $INPUT_FILE"
echo "Size: $(wc -c < $INPUT_FILE) bytes"
echo "Righe: $(wc -l < $INPUT_FILE)"
echo "Capitoli: $(grep -c "^Chapter\|^Capitolo" $INPUT_FILE)"
echo "Paragrafi: $(grep -c "^$" $INPUT_FILE)"

# 3. Crea manifesto capitoli
grep -n "^Chapter\|^Capitolo" $INPUT_FILE > capitoli_manifest.txt
```

**Output:** `capitoli_manifest.txt` con lista capitoli e righe

### STEP 1: TRADUZIONE (PER CAPITOLO)
- **Tool:** llama3:70b via Ollama (locale su M4)
- **⛔ MAI** tutto il libro insieme
- **⛔ MAI** più di 1 capitolo alla volta

#### Sequenza per ogni capitolo:
```bash
for cap in $(seq 1 $NUM_CAPITOLI); do
    # 1. Check CPU
    wait_for_cpu_below 70
    
    # 2. Estrai capitolo
    extract_chapter $cap > cap_${cap}_EN.txt
    
    # 3. Traduci
    translate_chapter cap_${cap}_EN.txt > cap_${cap}_IT.txt
    
    # 4. Checkpoint
    cp cap_${cap}_IT.txt checkpoints/
    
    # 5. Pausa cooldown
    echo "Capitolo $cap completato. Pausa 5 minuti..."
    sleep 300
done
```

### STEP 2: REVISIONE (5 CICLI, PER CAPITOLO)
- **Tool:** Ollama llama3:70b (locale)
- **⛔ MAI** tutti i capitoli insieme
- **⛔ MAI** timeout senza recovery

#### Cicli per ogni capitolo:
| Ciclo | Agente | Focus | Timeout |
|-------|--------|-------|---------|
| 1 | RILETTTORE | Errori grossolani | 120s |
| 2 | REVISORE | Fedeltà originale | 120s |
| 3 | GRAMMATICO | Grammatica italiana | 120s |
| 4 | ANTI-SLOP | Naturalezza | 120s |
| 5 | FORMATTATORE | Encoding, punteggiatura | 60s |

**Dopo ogni ciclo:** Checkpoint + Log

### STEP 3: VALIDAZIONE OUTPUT ⭐ NUOVO
**OBBLIGATORIO prima di procedere!**

```bash
# Script: validate_translation.sh
#!/bin/bash
ORIG=$1
TRAD=$2

ORIG_BYTES=$(wc -c < "$ORIG")
TRAD_BYTES=$(wc -c < "$TRAD")
RATIO=$(echo "scale=2; $TRAD_BYTES / $ORIG_BYTES * 100" | bc)

ORIG_LINES=$(wc -l < "$ORIG")
TRAD_LINES=$(wc -l < "$TRAD")

ORIG_CAPS=$(grep -c "^Chapter\|^Capitolo" "$ORIG")
TRAD_CAPS=$(grep -c "^Chapter\|^Capitolo" "$TRAD")

echo "=== VALIDAZIONE OUTPUT ==="
echo "Bytes:    $TRAD_BYTES / $ORIG_BYTES (${RATIO}%)"
echo "Righe:    $TRAD_LINES / $ORIG_LINES"
echo "Capitoli: $TRAD_CAPS / $ORIG_CAPS"

# FAIL CONDITIONS
FAIL=0
if (( $(echo "$RATIO < 80" | bc -l) )); then
    echo "🚨 FAIL: Traduzione < 80% dell'originale!"
    FAIL=1
fi

if [ "$TRAD_CAPS" -lt "$ORIG_CAPS" ]; then
    echo "🚨 FAIL: Capitoli mancanti!"
    FAIL=1
fi

# Check sezioni tagliate
if tail -1 "$TRAD" | grep -q "^[a-z]"; then
    echo "🚨 FAIL: File termina a metà frase!"
    FAIL=1
fi

if [ $FAIL -eq 1 ]; then
    echo "❌ VALIDAZIONE FALLITA - NON PROCEDERE"
    exit 1
else
    echo "✅ VALIDAZIONE OK"
fi
```

### STEP 4: SAMPLE PER APPROVAZIONE
*(come prima)*

### STEP 5: APPROVAZIONE MATTIA
*(come prima)*

### STEP 6: PRODUZIONE FINALE
*(come prima)*

### STEP 7: QA FINALE COMPLETO ⭐ RAFFORZATO

**Checklist OBBLIGATORIA:**

#### A) COMPLETEZZA (automatica)
```bash
./validate_translation.sh originale.txt traduzione.txt
# DEVE passare al 100%
```

#### B) ENCODING
```bash
# Zero risultati = OK
grep -c "â€™\|Ã\|â€\|Ã¨\|Ã " traduzione.txt
# Deve essere 0
```

#### C) STRUTTURA MANUALE
- [ ] Aprire il file e scrollare fino in fondo
- [ ] Verificare che l'ultima frase sia completa
- [ ] Verificare che tutti i capitoli siano presenti
- [ ] Verificare che Conclusione esista

#### D) SPOT CHECK (3 campioni)
- [ ] Campione da Cap 1 → OK?
- [ ] Campione da Cap metà → OK?
- [ ] Campione da ultimo Cap → OK?

### STEP 8: PUBBLICAZIONE
*(come prima)*

---

## 🚫 ERRORI DA EVITARE (Lezioni Apprese)

### Errore 1: Limite hardcoded dimenticato
```python
# ⛔ MAI FARE:
MAX_PARAGRAPHS = 100  # "per test"
paragraphs = paragraphs[:MAX_PARAGRAPHS]

# ✅ INVECE:
# Se serve limitare per test, usare flag esplicito
if TEST_MODE:
    paragraphs = paragraphs[:100]
    print("⚠️ TEST MODE: solo 100 paragrafi!")
```

### Errore 2: Non validare output
```bash
# ⛔ MAI FARE:
echo "Pipeline completata! 100/100 ✅"

# ✅ INVECE:
./validate_translation.sh orig.txt trad.txt
if [ $? -eq 0 ]; then
    echo "Pipeline completata E VALIDATA ✅"
fi
```

### Errore 3: Processare tutto insieme
```bash
# ⛔ MAI FARE:
translate_book entire_book.txt

# ✅ INVECE:
for chapter in chapters/*.txt; do
    translate_chapter "$chapter"
    sleep 300  # Cooldown
done
```

### Errore 4: Ignorare timeout
```python
# ⛔ MAI FARE:
result = ollama_generate(prompt)  # Può bloccarsi per sempre

# ✅ INVECE:
result = ollama_generate(prompt, timeout=120)
if "[TIMEOUT]" in result:
    log_error(f"Timeout su paragrafo {i}")
    continue  # Skip e continua
```

---

## 📊 METRICHE DA TRACCIARE

Per ogni traduzione, salvare in `metrics.json`:
```json
{
  "input_file": "capussela-spirito-EN.txt",
  "input_bytes": 301051,
  "input_lines": 1622,
  "input_chapters": 6,
  "output_file": "capussela-spirito-IT.txt",
  "output_bytes": 285000,
  "output_lines": 1580,
  "output_chapters": 6,
  "completion_ratio": 0.95,
  "model": "llama3:70b",
  "total_time_hours": 12.5,
  "cpu_max_percent": 78,
  "timeouts": 3,
  "checkpoints": 6,
  "validated": true
}
```

---

## ✅ CHECKLIST TRADUZIONE v2.0

- [ ] Step 0: Input validato (bytes, righe, capitoli contati)
- [ ] Step 1: Traduzione per capitolo con checkpoint
- [ ] Step 2: Revisione per capitolo con timeout
- [ ] Step 3: Output validato (ratio ≥80%, tutti capitoli presenti)
- [ ] Step 4: Sample 3 pagine creato
- [ ] Step 5: Approvazione Mattia ricevuta
- [ ] Step 6: Produzione finale
- [ ] Step 7: QA finale superato
- [ ] Step 8: Pubblicato su KDP

---

## 🔧 SCRIPT HELPER

Gli script helper sono in: `scripts/translation/`
- `validate_translation.sh` - Validazione output
- `split_chapters.py` - Splitta libro in capitoli
- `monitor_cpu.sh` - Monitoraggio CPU
- `translate_chapter.sh` - Traduzione singolo capitolo
- `merge_chapters.py` - Ricompone libro finale

---

*Documento v2.0 - Irrobustito dopo post-mortem Capussela*
*@ondinho | 2026-01-30*

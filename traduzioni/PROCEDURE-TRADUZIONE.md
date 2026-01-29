# PROCEDURE DI TRADUZIONE 📚

> **REGOLA #0: OGNI MESSAGGIO MATTIA VA SU GIT**
> Se non è su Git, non esiste. Trascrivere SEMPRE.

> **REGOLA #1: USA MODELLI LOCALI SU M4!**
> Non tradurre "manualmente" come Claude. M4 ha GPU per modelli locali.

---

## 🤖 WORKFLOW CON AGENTI

### Pipeline Traduzione Completa

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  TRADUTTORE │ →  │  RILETTTORE │ →  │  REVISORE   │ →  │   OUTPUT    │
│  (NLLB-200) │    │  (Errori)   │    │  (Stile)    │    │   FINALE    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Agente 1: TRADUTTORE
- **Tool:** NLLB-200 locale
- **Input:** Testo originale
- **Output:** Traduzione grezza
- **Script:** `~/clawd/translator.py`

### Agente 2: RILETTTORE (Proofreader)
- **Tool:** Script Python per check grammaticale
- **Controlla:**
  - Errori grammaticali
  - Concordanze soggetto-verbo
  - Punteggiatura
  - Frasi incomplete
- **Script:** `scripts/translation-reviewer.py` (se esiste)

### Agente 3: REVISORE (Editor)
- **Tool:** Confronto con originale
- **Controlla:**
  - Fedeltà al significato
  - Stile e registro
  - Terminologia tecnica
  - Fluidità
- **Output:** Versione finale approvata

---

## 🖥️ Setup M4 Mac

### Modelli Disponibili
- **NLLB-200** (`facebook/nllb-200-distilled-600M`) — già installato
- Path script: `~/clawd/translator.py`

### Requisiti
```bash
pip3 install transformers torch sentencepiece --break-system-packages
```

---

## 🔄 Procedura Standard

### 1. Traduci con NLLB-200
```bash
cd ~/clawd
python3 translator.py "testo da tradurre" --to it   # EN→IT
python3 translator.py "testo da tradurre" --to en   # IT→EN
```

### 2. Per file lunghi (capitoli)
```bash
# Usa lo script batch (da creare se non esiste)
python3 translate_chapter.py INPUT.txt OUTPUT.md --to it
```

### 3. Naming convention
```
TITOLO-ITALIANO_LINGUA_modello-processore.ext

Esempi:
- la-repubblica-innovazione-IT_nllb200-m4.md
- la-repubblica-innovazione-EN_originale.txt
```

---

## ⚠️ NON FARE

- ❌ Tradurre "a mano" come Claude
- ❌ Usare API esterne quando hai modelli locali
- ❌ Dimenticare di annotare il modello usato nel filename

---

## ✅ DA FARE

- ✅ Sempre usare modelli locali su M4
- ✅ Annotare modello nel nome file
- ✅ Commit dopo ogni traduzione completata
- ✅ QA/revisione dopo traduzione automatica

---

## 📊 Modelli per Tipo di Testo

| Tipo Testo | Modello Consigliato | Note |
|------------|---------------------|------|
| Accademico | NLLB-200 + revisione | Post-editing necessario |
| Narrativa | NLLB-200 | Buono per prosa |
| Tecnico | NLLB-200 | Verificare terminologia |

---

## 🔬 Confronto Qualità (2026-01-28)

**Test su frase accademica complessa:**

| Aspetto | NLLB-200 | Claude |
|---------|----------|--------|
| **Costo** | GRATIS ✅ | Token 💸 ❌ |
| **Errori grammaticali** | Alcuni (post-edit) | Meno |
| **Terminologia** | OK | Leggermente migliore |
| **Verdetto** | **USA QUESTO** | MAI per traduzioni |

**Conclusione:** NLLB-200 + revisione manuale = qualità sufficiente a costo ZERO.

---

*Ultimo aggiornamento: 2026-01-28*
*Creato da: @ondinho dopo feedback Mattia*

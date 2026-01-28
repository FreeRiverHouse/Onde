# PROCEDURE DI TRADUZIONE 📚

> **REGOLA #1: USA MODELLI LOCALI SU M4!**
> Non tradurre "manualmente" come Claude. M4 ha GPU per modelli locali.

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

*Ultimo aggiornamento: 2026-01-28*
*Creato da: @ondinho dopo feedback Mattia*

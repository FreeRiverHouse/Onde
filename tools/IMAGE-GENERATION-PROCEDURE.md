# 🖼️ Procedura Generazione Immagini - Libri per Bambini

**Ultima modifica:** 2026-02-15
**Hardware:** Apple M4 Pro (24GB RAM)
**Tool principale:** mflux v0.15.5 (Flux su MLX Apple Silicon)

---

## 🔧 Setup

### Prerequisiti
- Python virtualenv: `~/mlx-env/`
- mflux installato: `~/mlx-env/bin/mflux-generate`
- HuggingFace token: `~/.cache/huggingface/token`
- **IMPORTANTE:** Accettare i termini FLUX su HF: https://huggingface.co/black-forest-labs/FLUX.1-schnell

### Modelli Disponibili (mflux)

| Modello | Steps | Qualità | RAM | Note |
|---------|-------|---------|-----|------|
| `schnell` | 4 | Buona, veloce | ~12GB | Per test e iterazioni |
| `dev` | 20-28 | Alta | ~16GB | Per versione finale |
| `krea-dev` | 20-28 | Alta, creativa | ~16GB | Alternativa |
| `qwen` | 20 | Buona | ~12GB | Text rendering |
| `fibo` | 20 | Alta | ~16GB | Accettare termini su HF |

### Quantizzazione (per risparmiare RAM)
```bash
# Quantizza a 4-bit (riduce RAM del 75%)
~/mlx-env/bin/mflux-generate --model schnell --quantize 4 --prompt "test" --output test.png
```

---

## 🎨 Workflow Generazione Libro

### Step 1: Prepara i Prompt
I prompt sono in `apps/corde/books/{libro}/prompts-pina.md`

### Step 2: Genera Character Sheet
```bash
# Test singola immagine (veloce)
~/mlx-env/bin/mflux-generate \
  --model schnell \
  --prompt "CHARACTER DESCRIPTION HERE" \
  --width 1024 --height 1024 \
  --steps 4 \
  --output /tmp/character-test.png
```

### Step 3: Genera Tutte le Illustrazioni
**Usa lo script CORDE:**
```bash
source ~/mlx-env/bin/activate
python ~/Onde/apps/corde/engine/generate_flux.py \
  --book marco-aurelio-bambini \
  --model schnell \
  --resolution 1024 \
  --steps 4
```

**Per qualità finale (più lento):**
```bash
python ~/Onde/apps/corde/engine/generate_flux.py \
  --book marco-aurelio-bambini \
  --model dev \
  --resolution 1024 \
  --steps 28
```

### Step 4: Review e Regenerate
```bash
# Rigenerare solo un capitolo specifico
python ~/Onde/apps/corde/engine/generate_flux.py \
  --book marco-aurelio-bambini \
  --chapter 3 \
  --model dev --steps 28
```

### Step 5: Crea PDF
```bash
# Usa il testo + immagini per creare il PDF
# Script in apps/corde/engine/ o manuale con HTML→PDF
```

---

## 🎯 Stile Onde (Standard)

**Positivo:** European watercolor childrens book illustration, soft brushstrokes, warm golden light, elegant refined, Beatrix Potter style, natural skin tone, 4k

**Negativo:** Pixar, 3D, Disney, cartoon, American style, plastic, bright saturated colors, rosy cheeks, anime, manga

---

## 📋 Consistenza Personaggi

### Metodo 1: Gemini/Nano Banana (RACCOMANDATO per consistenza)
- Usa "Keep this character exactly the same" tra scene
- Dettagli in `content/processes/image-generation-procedure.md`

### Metodo 2: Grok (Alternativa gratuita)
- Una singola chat per tutto il libro
- "Same characters, same style" tra scene

### Metodo 3: mflux locale (Per batch/autonomia)
- Prompt dettagliati con CHARACTER REFERENCE
- Meno consistente, ma veloce e autonomo
- Buono per prime bozze

---

## 📁 Output

- **Test:** `/tmp/marco-aurelio-gen/`
- **Finale:** `~/Onde/books/{libro}/images/`
- **CORDE output:** `/Volumes/DATI-SSD/onde-ai/corde/outputs/` (se SSD montato)

---

## ⚠️ Troubleshooting

### "GatedRepoError 403"
→ Vai su https://huggingface.co/black-forest-labs/FLUX.1-schnell e accetta i termini

### "Out of memory"
→ Usa `--quantize 4` o riduci risoluzione a `--width 768 --height 768`

### Immagini nere
→ Riprova con seed diverso: `--seed 42`

---

*Creato da Ondinho per Casa Editrice Onde*

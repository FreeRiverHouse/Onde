# CORDE - Procedure Qualità Standard

**Data**: 2026-01-20
**Versione**: 1.0

---

## Qualità Standard per Onde Kids

### Impostazioni MAXIMUM (default per produzione)

| Parametro | Valore |
|-----------|--------|
| Risoluzione | 1024x1024 |
| Steps | 50 |
| Guidance Scale | 8.0 |
| Scheduler | DPM++ 2M SDE Karras |
| Model | stabilityai/stable-diffusion-xl-base-1.0 |
| Dtype | float32 (MPS compatibility) |

### Comando Standard

```bash
cd /Users/mattiapetrucciani/CascadeProjects/corde/engine
conda run -n corde python generate_hq.py \
  --book [nome-libro] \
  --illustrator pina_pennello \
  --quality maximum
```

---

## Profilo Pina Pennello

**File**: `/config/illustrators/pina_pennello.json`

### Stile Base
- European watercolor childrens book illustration
- Soft delicate brushstrokes
- Warm golden Mediterranean light
- Beatrix Potter meets Italian Renaissance

### Negative Prompt Standard
```
Pixar, 3D render, Disney, American cartoon, anime, manga, digital art, CGI,
plastic, oversaturated, neon, blurry, low quality, jpeg artifacts, watermark,
bad anatomy, deformed, extra limbs, rosy cheeks, red cheeks, unnatural skin
```

### Colori
- Palette Roma Antica / Mediterraneo
- Oro romano, terracotta, bianco marmo
- Verde oliva, cielo italiano, porpora imperiale
- Toni pelle mediterranei (NO guance rosse)

---

## Workflow Editore Capo

### 1. Preparazione Libro
1. Creare cartella in `/books/[nome-libro]/`
2. Creare `prompts-pina.md` con tutti i prompt
3. Creare `testo-gianni.md` con il testo (stile Gianni Parola)

### 2. Generazione Immagini
```bash
# Test singola immagine
python generate_hq.py --book [nome] --illustrator pina_pennello --quality maximum --test

# Generazione completa
python generate_hq.py --book [nome] --illustrator pina_pennello --quality maximum
```

### 3. Review su Telegram
- Inviare immagini su @OndePR_bot per approvazione
- Verificare consistenza personaggi
- Verificare stile acquarello

### 4. Confezionamento PDF
```bash
node create-book-[nome].js
```

### 5. Invio Finale
- PDF su Telegram per approvazione finale
- Se OK, procedere con KDP

---

## Checklist Qualità

- [ ] Risoluzione 1024x1024
- [ ] 50 steps minimo
- [ ] Guidance 8.0
- [ ] Stile acquarello europeo (NO Pixar/3D)
- [ ] Toni pelle mediterranei (NO guance rosse)
- [ ] Consistenza personaggi tra capitoli
- [ ] Luce dorata calda
- [ ] Texture acquarello visibile

---

## Output Directory

```
/Volumes/DATI-SSD/onde-ai/corde/outputs/[libro]/[timestamp]_maximum/
```

Ogni generazione crea:
- Immagini PNG (1024x1024)
- `generation_log.json` con seeds e parametri

---

## Note per Iterazioni Future

- I seeds delle immagini migliori vanno salvati in `pina_pennello.json` → `best_seeds`
- Per rigenerare con stesso seed: `--seed [numero]`
- Per consistency avanzata: usare IP-Adapter con character sheets

---

*Documento creato da Editore Capo - Onde Publishing*

# Genera Ritratti Autori Onde

## Istruzioni per Grok

### Step 1: Apri Grok
1. Vai su `x.com/i/grok`
2. Clicca su **"Create Images"**

---

## Ritratto 1: Gianni Parola (Scrittore)

### Prompt da copiare:
```
European watercolor children's book illustration style,
portrait of Italian male writer in his 40s named Gianni Parola,
curly dark hair, round glasses, brown tweed jacket,
warm intellectual appearance, holding a fountain pen,
soft brushstrokes, warm golden light,
cozy study background with books,
Beatrix Potter aesthetic, whimsical but refined,
NOT photo realistic, NOT 3D, NOT Pixar,
natural skin tone NO rosy cheeks, 4k
```

### Dopo la generazione:
1. **FAI UPSCALE** (importante!)
2. Scarica l'immagine
3. Rinomina: `gianni-parola-portrait.jpg`
4. Salva in questa cartella

---

## Ritratto 2: Pina Pennello (Illustratrice)

### Prompt da copiare:
```
European watercolor children's book illustration style,
portrait of Italian female illustrator in her 30s named Pina Pennello,
brown hair tied up with a paintbrush tucked in,
colorful paint-stained apron, holding palette and brush,
creative gentle smile, surrounded by watercolors,
soft brushstrokes, warm golden light,
art studio background with paintings,
Beatrix Potter aesthetic, whimsical but refined,
NOT photo realistic, NOT 3D, NOT Pixar,
natural skin tone NO rosy cheeks, 4k
```

### Dopo la generazione:
1. **FAI UPSCALE** (importante!)
2. Scarica l'immagine
3. Rinomina: `pina-pennello-portrait.jpg`
4. Salva in questa cartella

---

## Checklist QC Anatomico

Prima di approvare, verifica:
- [ ] Mani: 5 dita per mano
- [ ] Orecchie: 2, posizionate correttamente
- [ ] Occhi: 2, proporzionati
- [ ] Proporzioni corrette
- [ ] Nessuna parte duplicata

---

## Dopo aver salvato i ritratti

Esegui lo script per aggiungerli a tutti i libri:

```bash
cd /Users/mattia/Projects/Onde
node scripts/add-about-creators.js
```

---

*Editore Capo - Casa Editrice Onde*

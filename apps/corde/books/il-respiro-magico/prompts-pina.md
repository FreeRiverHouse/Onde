# Prompts Illustrazioni - Pina Pennello
## Il Respiro Magico

**Chain**: onde-classics
**Style Reference**: Acquarello europeo, Beatrix Potter, vintage italiano

---

## CHARACTER REFERENCE - TOMMASO

### Tommaso (6 anni)
```
Italian boy Tommaso about 6 years old, warm brown hair slightly messy, curious gentle eyes, wearing simple comfortable clothes, natural childlike expression, soft features, Mediterranean appearance, European watercolor childrens book illustration, Beatrix Potter inspired, soft muted colors, natural skin tone NO rosy cheeks, NOT Pixar NOT cartoon NOT plastic, 4k
```

---

## ILLUSTRATION PROMPTS PER CAPITOLO

### Copertina
```
Watercolor book cover, Italian boy eyes closed sitting peacefully in meadow, soft breeze brown hair, golden sunset butterflies dandelions, dreamy peaceful, NOT 3D NOT Pixar
```

### Capitolo 1 - Il Soffio del Vento
```
Watercolor illustration, Italian boy brown hair sitting cross-legged in green meadow eyes closed, gentle wind tall grass, golden afternoon light hills, peaceful, NOT 3D NOT Pixar
```

### Capitolo 2 - La Pancia che Sale
```
Watercolor illustration, young boy lying on grass hands on belly, looking up at fluffy white clouds blue sky, peaceful expression pastel colors, NOT 3D NOT Pixar
```

### Capitolo 3 - Il Respiro che Conta
```
Watercolor illustration, boy sitting cross-legged on colorful rug warm bedroom, eyes closed concentration, teddy bear cushions, afternoon window light, NOT 3D NOT Pixar
```

### Capitolo 4 - Il Respiro della Farfalla
```
Watercolor illustration, orange butterfly landing on boy open palm, boy looking with wonder, spring garden wildflowers, dappled sunlight magical moment, NOT 3D NOT Pixar
```

### Capitolo 5 - Il Respiro che Scalda
```
Watercolor illustration, boy red scarf wool hat blowing warm breath on cold hands, visible breath, gentle snowfall bare trees, cozy winter, NOT 3D NOT Pixar
```

### Capitolo 6 - Il Gioco dei Cinque Sensi
```
Watercolor illustration, boy eyes closed surrounded by floating five senses, flower bird sunbeams strawberry kitten, dreamy ethereal pastel, NOT 3D NOT Pixar
```

### Capitolo 7 - Il Respiro Prima di Dormire
```
Watercolor illustration, boy in cozy bed soft blanket, silver moonlight window stars outside, plush toy nearby, peaceful sleepy, calming blue violet, NOT 3D NOT Pixar
```

### Capitolo 8 - Il Respiro che Condividiamo
```
Watercolor illustration, Italian family four sitting circle on floor, mother father boy sister eyes closed, soft golden light, family warmth connection, NOT 3D NOT Pixar
```

### Capitolo 9 - Il Tuo Respiro Magico
```
Watercolor illustration, boy smiling warmly at viewer hand on heart, behind him fading images meadow bedroom garden snow stars, golden warm invitation, NOT 3D NOT Pixar
```

---

## NEGATIVE PROMPT (per tutte)
```
Pixar, 3D, Disney, cartoon, American style, plastic, bright saturated colors, rosy cheeks, red cheeks, anime, manga, digital art look, harsh lighting
```

---

## NOTE PER PINA PENNELLO
- Mantieni Tommaso coerente in tutte le illustrazioni (capelli castani, circa 6 anni)
- Usa sempre la stessa palette colori morbida
- La luce deve essere sempre presente e calda
- Evita qualsiasi elemento che sembri digitale o cartoon

## COMANDI CLI

```bash
# Test singola immagine
python generate_book.py --book il-respiro-magico --test --steps 15

# Solo copertina
python generate_book.py --book il-respiro-magico --cover --steps 20

# Tutte le illustrazioni
python generate_book.py --book il-respiro-magico --steps 20
```

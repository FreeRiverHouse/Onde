# Prompts Illustrazioni - Pina Pennello
## MILO 2: Robotaxi

**Chain**: onde-futures
**Style Reference**: European watercolor with soft tech glow, warm but futuristic

---

## CHARACTER REFERENCE

### MILO (Robot) - DESIGN APPROVATO
```
Friendly round robot MILO, silver-grey metallic body with oval egg shape, round blue LED eyes expressive and friendly, small ear-like antennas on sides of head, tiny cute arms with simple hands, rounded base no legs, chubby cute proportions, can float slightly, warm friendly expression, European watercolor childrens book illustration, soft tech aesthetic NOT cold NOT sterile, warm golden accent lighting, NOT Pixar NOT 3D NOT cartoon, 4k
```

### Sofia (7 anni) - DESIGN APPROVATO
```
Italian girl Sofia 7 years old, wavy brown hair with BIG PINK POLKA DOT BOW on top, curious expressive eyes, wearing green dress with red bird pattern over yellow-orange striped sleeves, colorful striped tights, brown boots, explorer adventurous expression, European watercolor childrens book illustration, soft brushstrokes, warm lighting, natural skin tone NO rosy cheeks, NOT Pixar NOT 3D, 4k
```

### Luca (5 anni) - DESIGN APPROVATO
```
Italian boy Luca 5 years old, short BLONDE messy hair, big blue eyes, wearing orange striped t-shirt under blue denim overalls dungarees, blue sneakers, happy energetic expression arms often open wide, younger brother energy, European watercolor childrens book illustration, soft brushstrokes, warm lighting, natural skin tone NO rosy cheeks, NOT Pixar NOT 3D, 4k
```

### Robotaxi (AURA)
```
Sleek white futuristic self-driving car, rounded friendly shape, no steering wheel inside, soft glowing accents in electric blue, large comfortable windows, inviting interior with cloud-soft seats, colorful screen dashboard, warm welcoming technology, NOT aggressive NOT cold, European watercolor style with soft tech feel, 4k
```

---

## ILLUSTRATION PROMPTS PER CAPITOLO

### Capitolo 1 - Una sorpresa nel giardino
```
Watercolor illustration, girl with pink bow and blonde boy amazed at white futuristic robotaxi, silver robot floating nearby, garden morning light, NOT 3D NOT Pixar
```

### Capitolo 2 - Dentro la macchina magica
```
Watercolor illustration, inside white robotaxi children on soft seats looking at glowing map, silver robot beside them, no steering wheel, warm interior light, NOT 3D NOT Pixar
```

### Capitolo 3 - Gli occhi dell'auto
```
Watercolor illustration, white robotaxi with colorful sensor rays like rainbow streams, children inside amazed, silver robot explaining, soft tech fantasy, NOT 3D NOT Pixar
```

### Capitolo 4 - Come decide dove andare
```
Watercolor illustration, map view from above three colored paths, white robotaxi choosing green path, children and silver robot looking at map, warm soft colors, NOT 3D NOT Pixar
```

### Capitolo 5 - Le regole d'oro
```
Watercolor illustration, white robotaxi stopped at red light, child pedestrian crossing safely, silver robot explaining through window, afternoon light cafes, NOT 3D NOT Pixar
```

### Capitolo 6 - Quando qualcosa va storto
```
Watercolor illustration, black cat crossing street, white robotaxi braking safely, cat unharmed, children relieved inside, silver robot reassuring, warm colors, NOT 3D NOT Pixar
```

### Capitolo 7 - La città del futuro
```
Watercolor illustration, utopian future city green parks, white robotaxis, children playing safely, silver robot projecting hologram for kids, hopeful atmosphere, NOT 3D NOT Pixar
```

### Capitolo 8 - Il viaggio continua
```
Watercolor illustration, girl and blonde boy with silver robot sitting on grass, white robotaxi in background, golden sunset orange pink sky, friendship hope, NOT 3D NOT Pixar
```

---

## COPERTINA
```
Watercolor book cover, girl with pink bow and blonde boy in white robotaxi, silver robot floating beside, colorful city through windows, warm golden light, title space top, NOT 3D NOT Pixar
```

---

## NEGATIVE PROMPT (per tutte)
```
Pixar, 3D, Disney, cartoon, American style, plastic, bright saturated colors, rosy cheeks, red cheeks, anime, manga, digital art look, harsh lighting, cold sterile, aggressive, scary, threatening, dystopian, white robot, teardrop eyes, golden heart
```

---

## NOTE CONSISTENZA - DESIGN APPROVATI

### MILO
- Corpo **ARGENTO/GRIGIO** metallico (NON bianco)
- Occhi **LED ROTONDI AZZURRI** (NON a goccia/teardrop)
- **Orecchie/antenne laterali** sulla testa
- **Proporzioni coccolose** (chubby cute)
- Base rotonda, SENZA gambe
- Reference: `/books/milo-internet/images-nanob/masters/master-milo.png`

### SOFIA
- Capelli castani ondulati con **FIOCCO ROSA A POIS** grande
- Vestito verde con uccellino rosso
- Maniche a righe gialle/arancioni sotto
- Calze a righe colorate + stivaletti marroni
- Reference: `/books/milo-internet/images-nanob/masters/master-sofia.png`

### LUCA
- Capelli **BIONDI** corti e disordinati
- Occhi azzurri grandi
- Maglietta a righe arancioni
- **Salopette jeans blu**
- Sneakers blu
- Reference: `/books/milo-internet/images-nanob/masters/master-luca.png`

## COMANDI CLI

```bash
# Test singola immagine
python generate_book.py --book milo-robotaxi --test --steps 15

# Solo copertina
python generate_book.py --book milo-robotaxi --cover --steps 20

# Capitolo specifico
python generate_book.py --book milo-robotaxi --chapter 1 --steps 20

# Tutte le illustrazioni
python generate_book.py --book milo-robotaxi --steps 20
```

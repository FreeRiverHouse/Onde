# Prompts Illustrazioni - Pina Pennello
## MILO: AI Explained to Children

**Chain**: onde-futures
**Style Reference**: European watercolor, soft warm lighting, NOT Pixar

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

---

## ILLUSTRATION PROMPTS PER CAPITOLO

### Capitolo 1 - A Strange New Friend
```
Watercolor illustration, girl with pink bow opening box discovering silver robot with blue eyes no legs, warm morning light window, NOT 3D NOT Pixar
```

### Capitolo 2 - What Is Artificial Intelligence
```
Watercolor illustration, girl with pink bow and silver robot sitting together, thought bubble brain connected to circuits, blonde boy peeking doorway, warm light, NOT 3D NOT Pixar
```

### Capitolo 3 - How MILO Learned to See
```
Watercolor illustration, silver robot surrounded by floating photos of cats dogs birds with labels, girl showing cat photo, warm golden light, magical learning, NOT 3D NOT Pixar
```

### Capitolo 4 - How MILO Learned to Talk
```
Watercolor illustration, silver robot with colorful text ribbons flowing around, floating books, blonde boy listening fascinated, warm golden light, library scene, NOT 3D NOT Pixar
```

### Capitolo 5 - What MILO Can Do
```
Watercolor illustration, silver robot helping with homework flags books science, girl writing notes, multiple vignettes warm light, helpful friendly, NOT 3D NOT Pixar
```

### Capitolo 6 - What MILO Cannot Do
```
Watercolor illustration, girl showing purple dragon drawing to silver robot, robot confused with question marks floating, warm afternoon light window, tender moment, NOT 3D NOT Pixar
```

### Capitolo 7 - Using AI Safely
```
Watercolor illustration, silver robot showing four glowing icons lock checkmark books heart, family dinner table listening, warm atmosphere, NOT 3D NOT Pixar
```

### Capitolo 8 - The Future We Build Together
```
Watercolor illustration, girl and blonde boy sitting on grass with silver robot, golden sunset sky orange pink, hopeful friendship future, warm emotional, NOT 3D NOT Pixar
```

---

## COPERTINA
```
Watercolor book cover, girl with pink bow and blonde boy with silver robot between them, warm golden light, friendship wonder technology, title space top, NOT 3D NOT Pixar
```

---

## NEGATIVE PROMPT (per tutte)
```
Pixar, 3D, Disney, cartoon, American style, plastic, bright saturated colors, rosy cheeks, red cheeks, anime, manga, digital art look, harsh lighting, cold sterile, aggressive, white robot, teardrop eyes, golden heart
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
python generate_book.py --book milo-ai --test --steps 15

# Solo copertina
python generate_book.py --book milo-ai --cover --steps 20

# Tutte le illustrazioni
python generate_book.py --book milo-ai --steps 20
```

# BENCHMARK SITES - Design Reference per onde.la

*Documento creato dal Design Critic di Onde*
*Ultimo aggiornamento: 9 Gennaio 2026*

---

## OBIETTIVO

Il portale onde.la deve essere **PIU' BELLO** di qualsiasi sito esistente nel settore editoriale, arte e design.
Questo documento elenca i benchmark da battere e le caratteristiche che li rendono eccezionali.

---

## TOP 15 SITI DI RIFERIMENTO

### CASE EDITRICI

| # | Sito | Categoria | Cosa lo rende speciale |
|---|------|-----------|------------------------|
| 1 | **Taschen.com** | Publishing | Layout imponente, fotografia editoriale, presentazione prodotto come opera d'arte. Ogni libro e' un'esperienza visiva. |
| 2 | **Phaidon.com** | Art/Design Publishing | Strategia editoriale digitale, libro come oggetto. Design minimale ma potente. |
| 3 | **Penguin.co.uk** | Publishing | Redesign 2019 by Tim Lane - fresco, confident, heritage + moderno. Illustrazioni originali record Instagram. +13% traffico. |
| 4 | **StripePress.com** | Tech Publishing | Tipografia editoriale Ivar serif, ogni libro ha identita' propria ma coerenza brand. Gravitas intellettuale. |

### AGENZIE AWWWARDS WINNERS

| # | Sito | Categoria | Cosa lo rende speciale |
|---|------|-----------|------------------------|
| 5 | **Locomotive.ca** | Agency (6x AOTY) | GSAP + Three.js + Locomotive Scroll. Drag navigation, 3D integration, smooth scroll perfetto. Standard del settore. |
| 6 | **Igloo Inc** | SOTY 2024 | "Pure art, like a video game as website". Creative coding at its finest. |
| 7 | **ImmersiveGarden** | Studio of the Year 2024 | Storytelling immersivo, animazioni cinematografiche. |
| 8 | **Active Theory** | Tech Excellence | Emmy + Awwwards + Cannes Lions. WebGL mastery. |

### ARTE E GALLERIE

| # | Sito | Categoria | Cosa lo rende speciale |
|---|------|-----------|------------------------|
| 9 | **Van Gogh Museum** | Art Museum | Color scheme stunning, clean e professional. Artistically sophisticated. |
| 10 | **SageCulture** | Art Gallery | Outstanding design, side menu hero, large bold typography, comprehensive homepage. |
| 11 | **RZ Collection** | Art Gallery | GSAP animation, split-screen layout, sophisticated transitions. |
| 12 | **AlmostReal** | Fine Art Photography | Gallery feel - simple, austere, WHITESPACE. Art at the center. |

### LUXURY & FASHION (Reference per eleganza)

| # | Sito | Categoria | Cosa lo rende speciale |
|---|------|-----------|------------------------|
| 13 | **SaintLaurent.com** | Luxury Fashion | Negative space estremo, bold typography, B/W high contrast. Minimal = maximum attitude. |
| 14 | **Aesop.com** | Luxury Skincare | Quiet minimalism + cultural storytelling. Palette earthy. Copy poetico. Product as sculpture. |
| 15 | **Toteme.com** | Fashion | Print magazine grids in digital form. Soft monochromatic palette. Tactile feel. |

---

## PRINCIPI CHIAVE DA BATTERE

### 1. TIPOGRAFIA

**Standard attuale:**
- Serif editoriali oversized (Ivar, Editorial New, custom fonts)
- Kinetic typography in hero sections
- Type hierarchy chiarissima: H1 imponente, body leggibile
- Spaziatura generosa (letter-spacing, line-height)

**Onde deve avere:**
- Font MEMORABILE - non Google Font generici
- Gerarchia che respira
- Display font per titoli che spacca
- Body font perfettamente leggibile

### 2. ANIMAZIONI E TRANSIZIONI

**Standard attuale (Locomotive + GSAP):**
- Smooth scroll (no jank)
- Reveal on scroll con timing perfetto
- Parallax controllato (non esagerato)
- Page transitions fluide
- Hover states con micro-animazioni
- Loading sequences cinematiche

**Onde deve avere:**
- GSAP + ScrollTrigger implementato
- Animazioni purposeful (non decorative)
- Performance mobile perfetta
- 60fps sempre

### 3. USO DELLO SPAZIO (WHITESPACE)

**Standard attuale:**
- Respiro generoso tra elementi
- Content framed come gallery pieces
- Negative space come elemento di design
- No clutter, no overwhelming

**Onde deve avere:**
- Minimo 120px tra sezioni
- Contenuto che respira
- Ogni elemento ha il suo spazio sacro

### 4. IMPATTO VISIVO IMMEDIATO

**Standard attuale:**
- Above the fold spacca subito
- Hero section memorabile (non template)
- Statement chiaro in 3 secondi
- Visual storytelling immediato

**Onde deve avere:**
- WOW factor in 1 secondo
- Identita' visiva unica e riconoscibile
- Animazione hero che ferma lo scroll

### 5. COERENZA STILISTICA

**Standard attuale:**
- Sistema di design rigoroso
- Palette limitata ma perfetta
- Ogni pagina e' parte del tutto
- Dettagli micro curati

**Onde deve avere:**
- Stile acquarello coerente OVUNQUE
- Palette Onde applicata uniformemente
- Nessun elemento fuori posto

### 6. PERFORMANCE

**Standard attuale:**
- Lighthouse 90+ su tutto
- Loading progressivo elegante
- Immagini ottimizzate (WebP/AVIF)
- Core Web Vitals perfetti

**Onde deve avere:**
- LCP < 2.5s
- CLS < 0.1
- FID < 100ms

### 7. MOBILE EXPERIENCE

**Standard attuale:**
- Mobile-first design
- Touch interactions native
- No pinch-to-zoom needed
- Animazioni ottimizzate per mobile

**Onde deve avere:**
- Mobile che sembra fatto APPOSTA per mobile
- Non un desktop rimpicciolito

---

## CARATTERISTICHE TECNICHE DA IMPLEMENTARE

### LIBRERIE OBBLIGATORIE

```javascript
// Animation
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Smooth scroll
import Lenis from '@studio-freight/lenis' // o Locomotive Scroll

// 3D (opzionale ma impressive)
import * as THREE from 'three'

// Motion
import { motion, AnimatePresence } from 'framer-motion'
```

### EFFETTI DA AVERE

1. **Smooth scroll** - Lenis o Locomotive Scroll
2. **Parallax** - sottile, elegante
3. **Text reveal** - lettere che appaiono on scroll
4. **Image reveal** - con maschere e clip-path
5. **Cursor custom** - opzionale ma premium
6. **Page transitions** - fade/slide tra pagine
7. **Magnetic buttons** - hover che attrae
8. **Stagger animations** - elementi che entrano in sequenza

---

## CHECKLIST CRITICA

Prima che Mattia veda onde.la, OGNI PUNTO deve essere YES:

### IMPATTO VISIVO
- [ ] Hero spacca in 1 secondo?
- [ ] Animazione d'ingresso memorabile?
- [ ] Palette coerente ovunque?
- [ ] Tipografia che comanda rispetto?

### ESPERIENZA
- [ ] Scroll smooth come burro?
- [ ] Transizioni fluide tra sezioni?
- [ ] Hover states curati?
- [ ] Loading experience elegante?

### TECNICA
- [ ] Lighthouse 90+ su mobile?
- [ ] No jank, 60fps?
- [ ] Immagini ottimizzate?
- [ ] Responsive perfetto?

### DETTAGLI
- [ ] Favicon curata?
- [ ] Meta tags social perfetti?
- [ ] 404 page bella?
- [ ] Cursor states curati?

---

## NOTE DEL CRITIC

**Stato attuale del portale onde-portal (9 Gen 2026):**

Ho esaminato il codice. Ecco la mia prima valutazione DURISSIMA:

### PROBLEMI GRAVI

1. **NESSUN WOW FACTOR**
   - Hero e' un semplice titolo centrato con due bottoni
   - Zero animazioni d'impatto
   - Sembra un template generico

2. **TIPOGRAFIA MEDIOCRE**
   - Usa i font di default del browser
   - Nessun display font
   - Gerarchia debole

3. **ANIMAZIONI ASSENTI**
   - Solo hover scale basici
   - Nessun GSAP
   - Nessun smooth scroll
   - Nessun reveal on scroll

4. **LAYOUT GENERICO**
   - Grid 3 colonne standard
   - Nessun layout memorabile
   - Cards tutte uguali, noioso

5. **IDENTITA' ASSENTE**
   - Non comunica ONDE
   - Potrebbe essere qualsiasi sito
   - Lo stile acquarello e' solo accennato

### VERDETTO INIZIALE

**BOCCIATO TOTALMENTE.**

Questo NON e' neanche lontanamente al livello dei benchmark.
Siamo a un 20/100 se quei siti sono 100.

### PROSSIMI PASSI

1. Redesign TOTALE della homepage
2. Implementare GSAP + smooth scroll
3. Creare hero section MEMORABILE
4. Typography system serio
5. Animazioni purposeful ovunque
6. Watercolor effects reali, non solo CSS gradienti

---

*Il Critic non approva. Tornare al lavoro.*

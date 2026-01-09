# Guida Branding Libri Onde

## Struttura Pagine Finali

Ogni libro Onde deve avere queste pagine finali:

1. **The End** (già inclusa nel testo)
2. **About the Creators** (autori con ritratti)
3. **About Onde** (logo e descrizione editore)

---

## 1. Pagina "About the Creators"

### Layout
- Due colonne o due sezioni verticali
- Ritratto autore (cerchio o quadrato arrotondato)
- Nome in grassetto
- Bio breve (2-3 righe)

### Testo Bio Standard

**Gianni Parola** (Scrittore)
> **Gianni Parola** writes stories that help children understand the world around them. He believes every child deserves books that spark curiosity and wonder.

**Pina Pennello** (Illustratrice)
> **Pina Pennello** brings stories to life with her warm watercolor illustrations. Her art is inspired by the gentle beauty of Italian countryside and the magic in everyday moments.

### File Ritratti
- Gianni: `/content/authors/gianni-parola-portrait.jpg`
- Pina: `/content/authors/pina-pennello-portrait.jpg`

---

## 2. Pagina "About Onde"

### Layout
- Logo Onde centrato (grande)
- Tagline
- Descrizione breve
- Social handles

### Testo Standard

```
[LOGO ONDE]

ONDE PUBLISHING
Stories that connect hearts.

Onde is a children's book publisher dedicated to creating
beautiful, meaningful stories. We believe in the power of
words and art to inspire the next generation.

www.ondebooks.com
@Onde_FRH
```

---

## 3. Logo Onde

### Specifiche
- Formato: SVG (vettoriale) + PNG trasparente
- Dimensioni: minimo 200x200px per stampa
- Colori: Blu Onde #2980b9, Oro #f39c12
- Background: trasparente o bianco

### Prompt per Generare Logo (Grok)

```
Minimalist elegant logo design for "ONDE" publishing house,
stylized ocean waves forming a subtle flower/book shape,
clean lines, sophisticated European aesthetic,
works in single color, scalable design,
professional publisher logo, timeless,
NOT cartoonish NOT childish, elegant and refined,
blue and gold color scheme, 4k high resolution
```

### Varianti da Creare
1. Logo principale (colori)
2. Logo monocromatico (nero)
3. Logo monocromatico (bianco su sfondo scuro)
4. Icona quadrata (per social/favicon)

### File Output
Salvare in: `/assets/branding/`
- `onde-logo-color.svg`
- `onde-logo-color.png`
- `onde-logo-black.svg`
- `onde-logo-black.png`
- `onde-logo-white.svg`
- `onde-logo-white.png`
- `onde-icon-square.png`

---

## 4. HTML Template per PDF

### Pagina About the Creators

```html
<div class="page about-creators">
  <h2>About the Creators</h2>

  <div class="creator">
    <img class="creator-portrait" src="[GIANNI_PORTRAIT_BASE64]" alt="Gianni Parola">
    <div class="creator-info">
      <h3>Gianni Parola</h3>
      <p class="role">Writer</p>
      <p class="bio">Gianni Parola writes stories that help children understand
      the world around them. He believes every child deserves books that spark
      curiosity and wonder.</p>
    </div>
  </div>

  <div class="creator">
    <img class="creator-portrait" src="[PINA_PORTRAIT_BASE64]" alt="Pina Pennello">
    <div class="creator-info">
      <h3>Pina Pennello</h3>
      <p class="role">Illustrator</p>
      <p class="bio">Pina Pennello brings stories to life with her warm watercolor
      illustrations. Her art is inspired by the gentle beauty of Italian countryside
      and the magic in everyday moments.</p>
    </div>
  </div>
</div>
```

### CSS per Pagina Creators

```css
.about-creators {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 25mm;
}

.about-creators h2 {
  font-size: 24pt;
  color: #2c3e50;
  margin-bottom: 15mm;
  text-align: center;
}

.creator {
  display: flex;
  align-items: center;
  margin: 8mm 0;
  max-width: 150mm;
}

.creator-portrait {
  width: 35mm;
  height: 35mm;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8mm;
  border: 2px solid #f39c12;
}

.creator-info h3 {
  font-size: 16pt;
  color: #2980b9;
  margin: 0 0 2mm 0;
}

.creator-info .role {
  font-size: 10pt;
  color: #7f8c8d;
  font-style: italic;
  margin: 0 0 3mm 0;
}

.creator-info .bio {
  font-size: 11pt;
  line-height: 1.5;
  color: #2c3e50;
  margin: 0;
}
```

### Pagina About Onde

```html
<div class="page about-onde">
  <img class="onde-logo" src="[ONDE_LOGO_BASE64]" alt="Onde Publishing">

  <h2>ONDE PUBLISHING</h2>
  <p class="tagline">Stories that connect hearts.</p>

  <p class="description">
    Onde is a children's book publisher dedicated to creating
    beautiful, meaningful stories. We believe in the power of
    words and art to inspire the next generation.
  </p>

  <div class="social">
    <p>www.ondebooks.com</p>
    <p>@Onde_FRH</p>
  </div>
</div>
```

### CSS per Pagina Onde

```css
.about-onde {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30mm;
}

.onde-logo {
  width: 50mm;
  height: auto;
  margin-bottom: 10mm;
}

.about-onde h2 {
  font-size: 22pt;
  color: #2980b9;
  margin: 0 0 3mm 0;
  letter-spacing: 2px;
}

.about-onde .tagline {
  font-size: 14pt;
  color: #f39c12;
  font-style: italic;
  margin: 0 0 10mm 0;
}

.about-onde .description {
  font-size: 12pt;
  line-height: 1.6;
  color: #2c3e50;
  max-width: 120mm;
  margin: 0 0 10mm 0;
}

.about-onde .social {
  font-size: 10pt;
  color: #7f8c8d;
}

.about-onde .social p {
  margin: 2mm 0;
}
```

---

## 5. Integrazione nel create-pdf.js

### Snippet da Aggiungere

```javascript
// Leggi le immagini degli autori
const gianniPortrait = fs.readFileSync(
  path.join(__dirname, '../../content/authors/gianni-parola-portrait.jpg')
).toString('base64');

const pinaPortrait = fs.readFileSync(
  path.join(__dirname, '../../content/authors/pina-pennello-portrait.jpg')
).toString('base64');

const ondeLogo = fs.readFileSync(
  path.join(__dirname, '../../assets/branding/onde-logo-color.png')
).toString('base64');

// Aggiungi dopo l'ultimo capitolo e prima di </body>
html += `
  <div class="page about-creators">
    <!-- contenuto HTML sopra -->
  </div>

  <div class="page about-onde">
    <!-- contenuto HTML sopra -->
  </div>
`;
```

---

## 6. Checklist Pre-Pubblicazione

- [ ] Copertina con logo Onde piccolo (angolo basso)
- [ ] Pagina titolo con credits completi
- [ ] Pagina "About the Creators" con ritratti
- [ ] Pagina "About Onde" con logo
- [ ] ISBN e copyright
- [ ] Social handles corretti

---

## 7. Status Assets

| Asset | Status | Path |
|-------|--------|------|
| Gianni Portrait | DA FARE | content/authors/gianni-parola-portrait.jpg |
| Pina Portrait | COMPLETATO | content/authors/pina-pennello-portrait.jpg |
| Logo Onde Colori | DA FARE | assets/branding/onde-logo-color.png |
| Logo Onde Nero | DA FARE | assets/branding/onde-logo-black.png |
| Logo Onde Bianco | DA FARE | assets/branding/onde-logo-white.png |
| Icona Quadrata | DA FARE | assets/branding/onde-icon-square.png |

---

## 8. Prossimi Passi

1. **Generare Logo Onde** via Grok (prompt sopra)
2. **Generare Ritratto Gianni** via Grok (prompt in AUTHOR-PORTRAITS.md)
3. **Creare cartella** `/assets/branding/`
4. **Aggiornare script create-pdf.js** per includere pagine finali
5. **Testare** su un libro esistente

---

*Documento creato: 2026-01-09*
*Ultima modifica: 2026-01-09*

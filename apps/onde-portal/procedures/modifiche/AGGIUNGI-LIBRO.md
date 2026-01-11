# PROCEDURA: Aggiungere un Nuovo Libro

## Prerequisiti
- Libro pronto (PDF e/o EPUB)
- Copertina (JPG, dimensione consigliata: 800x1200)
- Metadati: titolo, sottotitolo, autore, categoria, prezzo (o "Free")

---

## STEP 1: Preparare i File

### 1.1 Copertina
```bash
# Copia la copertina nella cartella books
cp /path/to/NOME-LIBRO-cover.jpg /Users/mattia/Projects/Onde/apps/onde-portal/out/books/
```

### 1.2 File PDF
```bash
# Copia il PDF nella cartella books
cp /path/to/NOME-LIBRO.pdf /Users/mattia/Projects/Onde/apps/onde-portal/out/books/
```

### 1.3 File EPUB (se presente)
```bash
# Copia l'EPUB nella cartella epub
cp /path/to/NOME-LIBRO.epub /Users/mattia/Projects/Onde/apps/onde-portal/out/books/epub/
```

---

## STEP 2: Aggiungere alla Pagina Libri (/libri/)

### 2.1 Trovare il pattern esistente
```bash
# Cerca il pattern di un libro esistente
grep -n "meditations-cover" /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/index.html | head -5
```

### 2.2 Copiare il blocco libro
Apri il file e trova un blocco `<div class="bg-white/90 backdrop-blur-sm rounded-3xl` esistente.

### 2.3 Duplicare e modificare
Copia il blocco intero e modifica:
- `src="/books/VECCHIO-cover.jpg"` -> `src="/books/NUOVO-cover.jpg"`
- `alt="Vecchio Titolo"` -> `alt="Nuovo Titolo"`
- Titolo: `<h2 class="text-2xl font-display font-bold">NUOVO TITOLO</h2>`
- Sottotitolo: `<p class="text-amber-700/80 mb-1">NUOVO SOTTOTITOLO</p>`
- Autore: `by AUTORE`
- Descrizione: modifica il paragrafo descrizione
- Categoria (badge): `Philosophy`, `Spirituality`, etc.
- Prezzo: `$X.XX` oppure `Free` (cambia anche la classe colore)
- Link PDF: `href="/books/NUOVO.pdf"`
- Link EPUB: `href="/books/epub/NUOVO.epub"`

---

## STEP 3: Aggiungere alla Homepage (opzionale)

### 3.1 Aprire index.html
```bash
# Backup prima di modificare!
cp /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html.bak
```

### 3.2 Trovare la sezione libri
```bash
# Cerca la sezione "Our Books"
grep -n "Our Books" /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

### 3.3 Pattern libro homepage
Il blocco libro in homepage ha questa struttura:
```html
<div style="opacity:0;transform:translateY(40px)">
  <div class="group" style="transform-style:preserve-3d;perspective:1000px;transform:none">
    <div class="card-holographic p-1 relative">
      <!-- Contenuto libro -->
    </div>
  </div>
</div>
```

Copia un blocco esistente e modifica i campi come al punto 2.3.

---

## STEP 4: Verifica Finale

### 4.1 Controllare che i file esistano
```bash
ls -la /Users/mattia/Projects/Onde/apps/onde-portal/out/books/ | grep NOME-LIBRO
```

### 4.2 Controllare la sintassi HTML
```bash
# Verifica che l'HTML non sia rotto (cerca tag non chiusi)
grep -c "</div>" /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/index.html
```

### 4.3 Test visivo
```bash
# Apri nel browser
open /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/index.html
```

### 4.4 Test download
- Clicca sul bottone "Download PDF"
- Clicca sul bottone "EPUB" (se presente)
- Verifica che i file si scarichino correttamente

---

## Checklist Finale

- [ ] Copertina copiata in `/out/books/`
- [ ] PDF copiato in `/out/books/`
- [ ] EPUB copiato in `/out/books/epub/` (se applicabile)
- [ ] Libro aggiunto a `/out/libri/index.html`
- [ ] Libro aggiunto a `/out/index.html` (se da mostrare in homepage)
- [ ] Backup creato prima di modificare
- [ ] Test visivo completato
- [ ] Test download completato

---

## Struttura File Riferimento

```
out/
├── books/
│   ├── NOME-cover.jpg         # Copertina
│   ├── NOME.pdf               # File PDF
│   └── epub/
│       └── NOME.epub          # File EPUB
├── index.html                  # Homepage (sezione "Our Books")
└── libri/
    └── index.html              # Pagina catalogo completo
```

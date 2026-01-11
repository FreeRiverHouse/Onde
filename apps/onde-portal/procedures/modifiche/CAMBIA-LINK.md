# PROCEDURA: Cambiare i Link di un Libro

## Tipi di Link nel Sito

### Link Interni (file sul sito)
- PDF download: `/books/nome-libro.pdf`
- EPUB download: `/books/epub/nome-libro.epub`

### Link Esterni (store)
- **Amazon**: `https://www.amazon.com/dp/ASIN`
- **Apple Books**: `https://books.apple.com/book/idXXXXXX`
- **Gumroad**: `https://ACCOUNT.gumroad.com/l/SLUG`
- **Project Gutenberg**: `https://www.gutenberg.org/ebooks/XXXX`

---

## STEP 1: Trovare i Link Esistenti

### 1.1 Cercare link per un libro specifico
```bash
# Esempio: trovare tutti i link di "Meditations"
grep -n "meditations" /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html | grep -i "href"
grep -n "meditations" /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/index.html | grep -i "href"
```

### 1.2 Cercare link Amazon
```bash
grep -n "amazon.com" /Users/mattia/Projects/Onde/apps/onde-portal/out/*.html
grep -n "amazon.com" /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/*.html
```

### 1.3 Cercare link Apple Books
```bash
grep -n "books.apple.com" /Users/mattia/Projects/Onde/apps/onde-portal/out/*.html
grep -n "books.apple.com" /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/*.html
```

### 1.4 Cercare link Gutenberg
```bash
grep -n "gutenberg.org" /Users/mattia/Projects/Onde/apps/onde-portal/out/*.html
grep -n "gutenberg.org" /Users/mattia/Projects/Onde/apps/onde-portal/out/libro/*/*.html
```

---

## STEP 2: Pattern dei Link nel Codice

### Link Download PDF (interno)
```html
<a href="/books/meditations-en.pdf" download="" class="...">
  Download PDF
</a>
```

### Link Download EPUB (interno)
```html
<a href="/books/epub/meditations-en.epub" download="" class="...">
  EPUB
</a>
```

### Link Amazon
```html
<a href="https://www.amazon.com/dp/B0XXXXX" target="_blank" rel="noopener noreferrer" class="...">
  Buy on Amazon
</a>
```

### Link Gutenberg (pagina libro)
```html
<a href="https://www.gutenberg.org/ebooks/13058" target="_blank" rel="noopener noreferrer" class="...">
  Altri formati
</a>
```

---

## STEP 3: Backup Prima di Modificare

```bash
# Backup dei file che modificherai
cp /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html.bak.$(date +%Y%m%d-%H%M%S)
cp /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/index.html /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/index.html.bak.$(date +%Y%m%d-%H%M%S)
```

---

## STEP 4: Modificare i Link

### 4.1 Usando sed (sostituzione automatica)

**Cambiare link PDF:**
```bash
# Esempio: cambiare nome file PDF
sed -i '' 's|/books/vecchio-nome.pdf|/books/nuovo-nome.pdf|g' /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
sed -i '' 's|/books/vecchio-nome.pdf|/books/nuovo-nome.pdf|g' /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/index.html
```

**Cambiare link Amazon:**
```bash
# Esempio: aggiornare ASIN Amazon
sed -i '' 's|amazon.com/dp/B0VECCHIO|amazon.com/dp/B0NUOVO|g' /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

**Cambiare link Gutenberg:**
```bash
# Esempio: cambiare numero ebook Gutenberg
sed -i '' 's|gutenberg.org/ebooks/12345|gutenberg.org/ebooks/67890|g' /Users/mattia/Projects/Onde/apps/onde-portal/out/libro/NOME/index.html
```

### 4.2 Modifica manuale

1. Aprire il file nel tuo editor preferito
2. Cercare (Cmd+F) il vecchio link
3. Sostituire con il nuovo link
4. Salvare

---

## STEP 5: Aggiungere Nuovo Tipo di Link

Se vuoi aggiungere un link Amazon dove prima c'era solo PDF:

### Pattern bottone Amazon da aggiungere:
```html
<a href="https://www.amazon.com/dp/B0XXXXX" target="_blank" rel="noopener noreferrer"
   class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-sm shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 hover:scale-[1.02]">
  <span>Buy on Amazon</span>
</a>
```

### Pattern bottone Apple Books:
```html
<a href="https://books.apple.com/book/idXXXXXX" target="_blank" rel="noopener noreferrer"
   class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-onde-ocean/10 text-onde-ocean font-semibold text-sm hover:bg-onde-ocean/20 transition-all duration-300">
  <span>Apple Books</span>
</a>
```

---

## STEP 6: Verifica

### 6.1 Controllare che il link sia corretto
```bash
# Cerca il nuovo link
grep "NUOVO-LINK" /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

### 6.2 Verificare che il vecchio link non esista
```bash
grep "VECCHIO-LINK" /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
# Dovrebbe restituire nulla se la sostituzione e' andata a buon fine
```

### 6.3 Test funzionale
```bash
# Apri nel browser
open /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/index.html
```
1. Clicca sul link modificato
2. Verifica che porti alla destinazione corretta
3. Per link download, verifica che il file si scarichi

---

## File da Controllare

| Pagina | File | Descrizione |
|--------|------|-------------|
| Homepage | `/out/index.html` | Libri in evidenza |
| Catalogo | `/out/libri/index.html` | Lista completa libri Onde |
| Libro singolo (Gutenberg) | `/out/libro/[id]/index.html` | Pagine libri Gutenberg |
| Catalogo Gutenberg | `/out/catalogo/index.html` | Biblioteca Gutenberg |

---

## Checklist Finale

- [ ] Backup creato prima di modificare
- [ ] Vecchio link identificato in tutti i file
- [ ] Nuovo link inserito correttamente
- [ ] Attributi `target="_blank"` e `rel="noopener noreferrer"` presenti (per link esterni)
- [ ] Attributo `download=""` presente (per link download)
- [ ] Test click eseguito
- [ ] Destinazione verificata

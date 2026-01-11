# PROCEDURA: Modificare la Homepage

## File Principale
```
/Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

---

## Struttura della Homepage

La homepage e' divisa in queste sezioni principali:

### 1. Hero Section (parte alta con onde animate)
```
Linea ~56-61: onde-waves animation
Linea ~59: "Beautiful Books" titolo principale
Linea ~59: "Illustrated editions..." sottotitolo
```

### 2. Sezione Libri ("Our Books")
```
Cerca: id="books"
Cerca: "Our Books"
Contiene le card dei libri in evidenza
```

### 3. Sezione "Stay Updated"
```
Cerca: "Want to stay"
Contiene link a Twitter
```

### 4. Footer
```
Cerca: <footer
Contiene link social, copyright, etc.
```

---

## STEP 0: SEMPRE Fare Backup

```bash
# Backup con timestamp
cp /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html.bak.$(date +%Y%m%d-%H%M%S)
```

**IMPORTANTE**: Il file esiste gia' un backup `.bak` - non sovrascriverlo!
```bash
# Verifica backup esistenti
ls -la /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html*
```

---

## Modifiche Comuni

### A. Cambiare il Titolo Principale

```bash
# Trova la linea
grep -n "Beautiful Books" /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

Pattern attuale:
```html
<span class="text-white drop-shadow-[0_2px_20px_rgba(255,255,255,0.3)]">Beautiful Books</span>
```

### B. Cambiare il Sottotitolo

```bash
grep -n "Illustrated editions" /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

### C. Cambiare la Location Badge (Los Angeles)

```bash
grep -n "Los Angeles" /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

### D. Aggiungere/Rimuovere un Libro dalla Sezione "Our Books"

1. Trova la sezione:
```bash
grep -n "Our Books" /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

2. Ogni libro e' un blocco che inizia con:
```html
<div style="opacity:0;transform:translateY(40px)">
```

3. Per aggiungere: copia un blocco esistente e modifica
4. Per rimuovere: elimina l'intero blocco `<div>...</div>`

### E. Modificare i Link Social nel Footer

```bash
grep -n "twitter.com" /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
grep -n "youtube.com" /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

### F. Modificare il Copyright

```bash
grep -n "2026 Onde" /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

---

## Modifiche Avanzate

### Cambiare i Colori delle Onde

Le onde sono definite in uno style block:
```bash
grep -n "onde-waves" /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

Pattern colori (RGBA):
- Teal: `rgba(78,205,196,0.4)`
- Purple: `rgba(108,99,255,0.35)`
- Magenta: `rgba(168,85,247,0.3)`

### Cambiare lo Sfondo Gradient

```bash
grep -n "linear-gradient" /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

---

## Regole di Sicurezza

### Prima di qualsiasi modifica:
1. **BACKUP** - Sempre, senza eccezioni
2. **UN CAMBIAMENTO ALLA VOLTA** - Modifica una cosa, verifica, poi la prossima
3. **NON toccare** la sezione `<script>` in fondo - e' codice Next.js

### Cosa NON modificare (a meno che non sai cosa fai):
- I blocchi `<script>` in fondo al file
- Gli attributi `style="opacity:0;transform:..."` - sono per animazioni
- I path come `/_next/static/...`

---

## Test Dopo le Modifiche

### 1. Verifica sintassi HTML
```bash
# Conta i div aperti vs chiusi
echo "Div aperti: $(grep -c '<div' /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html)"
echo "Div chiusi: $(grep -c '</div>' /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html)"
```

### 2. Apri nel browser
```bash
open /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

### 3. Controlla in diversi browser
- Safari
- Chrome
- Mobile (usa DevTools responsive)

---

## Ripristino da Backup

Se qualcosa va storto:
```bash
# Trova l'ultimo backup
ls -lt /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html.bak* | head -1

# Ripristina (esempio)
cp /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html.bak.20260111-143022 /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

---

## Checklist Modifiche Homepage

- [ ] Backup creato con timestamp
- [ ] Identificata la sezione da modificare
- [ ] Modifica eseguita
- [ ] HTML valido (tag bilanciati)
- [ ] Test visivo su desktop
- [ ] Test visivo su mobile
- [ ] Animazioni funzionanti (scroll, onde)
- [ ] Link funzionanti

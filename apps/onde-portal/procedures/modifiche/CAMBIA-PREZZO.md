# PROCEDURA: Cambiare il Prezzo di un Libro

## Prerequisiti
- Nome del libro da modificare
- Nuovo prezzo (es. "$2.99" oppure "Free")

---

## STEP 1: Trovare il Prezzo Attuale

### 1.1 Cercare in tutti i file HTML
```bash
# Esempio: cercare il prezzo di "Meditations"
grep -rn "Meditations" /Users/mattia/Projects/Onde/apps/onde-portal/out/*.html /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/*.html 2>/dev/null | head -20
```

### 1.2 Cercare il pattern prezzo specifico
```bash
# Cercare prezzi nel formato $X.XX
grep -n '\$[0-9]' /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
grep -n '\$[0-9]' /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/index.html
```

### 1.3 Cercare "Free"
```bash
grep -n '>Free<' /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
grep -n '>Free<' /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/index.html
```

---

## STEP 2: Identificare i File da Modificare

Il prezzo appare in questi file:
1. **Homepage**: `/out/index.html`
2. **Pagina Libri**: `/out/libri/index.html`

---

## STEP 3: Pattern del Prezzo nel Codice

### Pattern prezzo a pagamento
```html
<span class="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg
  bg-amber-500 text-white">$0.11</span>
```

### Pattern prezzo "Free"
```html
<span class="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg
  bg-green-500 text-white">Free</span>
```

**NOTA**: La classe di colore cambia!
- Pagamento: `bg-amber-500`
- Gratis: `bg-green-500` o `bg-emerald-500`

---

## STEP 4: Backup Prima di Modificare

```bash
# Backup homepage
cp /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html.bak.$(date +%Y%m%d-%H%M%S)

# Backup pagina libri
cp /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/index.html /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/index.html.bak.$(date +%Y%m%d-%H%M%S)
```

---

## STEP 5: Modificare il Prezzo

### 5.1 Usando sed (sostituzione automatica)

**Da prezzo a prezzo:**
```bash
# Esempio: cambiare $0.11 in $2.99 in index.html
sed -i '' 's/\$0\.11/\$2.99/g' /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
sed -i '' 's/\$0\.11/\$2.99/g' /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/index.html
```

**Da prezzo a Free:**
```bash
# Cambiare il prezzo in "Free" E il colore del badge
# ATTENZIONE: Questo richiede modifica manuale del colore
```

**Da Free a prezzo:**
```bash
# Cambiare "Free" in prezzo E il colore del badge
# ATTENZIONE: Questo richiede modifica manuale del colore
```

### 5.2 Modifica manuale (consigliata per cambi prezzo/free)

1. Aprire il file:
```bash
open -a "TextEdit" /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

2. Cercare (Cmd+F) il nome del libro

3. Modificare:
   - Il testo del prezzo
   - La classe del colore se necessario

---

## STEP 6: Verifica

### 6.1 Verificare che solo il libro giusto sia cambiato
```bash
# Contare quante volte appare il nuovo prezzo
grep -c '\$2\.99' /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
grep -c '\$2\.99' /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/index.html
```

### 6.2 Verificare che il vecchio prezzo non esista piu'
```bash
# Se il libro era l'unico con quel prezzo, non dovrebbe apparire
grep -c '\$0\.11' /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

### 6.3 Test visivo
```bash
open /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
open /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/index.html
```

---

## Esempi Comuni

### Esempio 1: Cambiare Meditations da $0.11 a $2.99
```bash
# Backup
cp /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html.bak

# Sostituzione
sed -i '' 's/\$0\.11/\$2.99/g' /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
sed -i '' 's/\$0\.11/\$2.99/g' /Users/mattia/Projects/Onde/apps/onde-portal/out/libri/index.html

# Verifica
grep '\$2\.99' /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

### Esempio 2: Rendere un libro gratuito
Modifica manuale richiesta perche' devi cambiare:
1. Il testo: `$X.XX` -> `Free`
2. La classe: `bg-amber-500` -> `bg-green-500`

---

## Checklist Finale

- [ ] Backup creato prima di modificare
- [ ] Prezzo modificato in `/out/index.html`
- [ ] Prezzo modificato in `/out/libri/index.html`
- [ ] Colore badge aggiornato (se cambio prezzo/free)
- [ ] Verifica che solo il libro corretto sia cambiato
- [ ] Test visivo completato

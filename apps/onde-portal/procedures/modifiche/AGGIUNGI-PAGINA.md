# PROCEDURA: Aggiungere una Nuova Pagina

## Struttura Next.js Static Export

Il sito usa Next.js con static export. Ogni pagina e' una cartella con un `index.html`.

```
out/
├── index.html              # Homepage (/)
├── about/
│   └── index.html          # /about/
├── libri/
│   └── index.html          # /libri/
├── catalogo/
│   └── index.html          # /catalogo/
├── libro/
│   └── [id]/
│       └── index.html      # /libro/813/, /libro/alice/, etc.
└── NUOVA-PAGINA/
    └── index.html          # /nuova-pagina/
```

---

## STEP 1: Creare la Cartella

```bash
# Crea la cartella per la nuova pagina
mkdir -p /Users/mattia/Projects/Onde/apps/onde-portal/out/NOME-PAGINA
```

Esempi:
```bash
mkdir -p /Users/mattia/Projects/Onde/apps/onde-portal/out/contatti
mkdir -p /Users/mattia/Projects/Onde/apps/onde-portal/out/blog
mkdir -p /Users/mattia/Projects/Onde/apps/onde-portal/out/faq
```

---

## STEP 2: Copiare un Template Base

Usa una pagina esistente come template:

```bash
# Copia la pagina "about" come base
cp /Users/mattia/Projects/Onde/apps/onde-portal/out/about/index.html /Users/mattia/Projects/Onde/apps/onde-portal/out/NOME-PAGINA/index.html
```

---

## STEP 3: Modificare il Contenuto

### 3.1 Aprire il file
```bash
open -a "TextEdit" /Users/mattia/Projects/Onde/apps/onde-portal/out/NOME-PAGINA/index.html
```

### 3.2 Elementi da modificare

**Titolo pagina (tag `<title>`):**
```html
<title>Onde - TITOLO NUOVA PAGINA</title>
```

**Meta description:**
```html
<meta name="description" content="DESCRIZIONE NUOVA PAGINA"/>
```

**Contenuto main:**
Cerca `<main` e modifica il contenuto interno.

**Breadcrumb/navigazione:**
Aggiorna eventuali link "Torna a..." o breadcrumb.

---

## STEP 4: Struttura Base di una Pagina

Ecco la struttura minima di una pagina funzionante:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Onde - TITOLO</title>
  <meta name="description" content="DESCRIZIONE"/>
  <link rel="stylesheet" href="/_next/static/css/ee0e1d22401e0588.css"/>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet"/>
</head>
<body class="min-h-screen antialiased overflow-x-hidden">

  <!-- NAVIGAZIONE (copiala da un'altra pagina) -->
  <nav>...</nav>

  <!-- CONTENUTO PRINCIPALE -->
  <main class="relative z-10 pt-20">
    <div class="min-h-screen py-12">
      <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">

        <h1 class="text-4xl font-display font-bold text-onde-ocean mb-8">
          TITOLO PAGINA
        </h1>

        <div class="prose prose-lg">
          <!-- IL TUO CONTENUTO QUI -->
          <p>Contenuto della pagina...</p>
        </div>

      </section>
    </div>
  </main>

  <!-- FOOTER (copialo da un'altra pagina) -->
  <footer>...</footer>

</body>
</html>
```

---

## STEP 5: Aggiungere al Menu di Navigazione

### 5.1 Trovare il menu
```bash
grep -n "hidden md:flex items-center gap-1" /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

### 5.2 Pattern voce menu
```html
<a href="/NOME-PAGINA/">
  <span class="relative px-4 py-2 font-medium transition-colors duration-300 text-onde-ocean/70 hover:text-onde-ocean">
    TESTO MENU
  </span>
</a>
```

### 5.3 File da modificare
Devi aggiungere la voce menu in TUTTI i file HTML:
- `/out/index.html`
- `/out/about/index.html`
- `/out/libri/index.html`
- `/out/NOME-PAGINA/index.html` (la nuova pagina stessa)
- Qualsiasi altra pagina esistente

**Suggerimento**: Usa sed per modificare tutti insieme:
```bash
# Esempio: aggiungere "Contatti" dopo "About Us" in tutti i file
# ATTENZIONE: Testa prima su un file solo!
```

---

## STEP 6: Aggiungere al Footer (opzionale)

Se vuoi che la pagina appaia anche nel footer:

```bash
grep -n "Explore" /Users/mattia/Projects/Onde/apps/onde-portal/out/index.html
```

Trova la sezione `<ul class="space-y-2">` e aggiungi:
```html
<li>
  <a href="/NOME-PAGINA" class="text-onde-ocean/60 hover:text-onde-coral transition-colors">
    TESTO LINK
  </a>
</li>
```

---

## STEP 7: Verifica

### 7.1 Controllare che il file esista
```bash
ls -la /Users/mattia/Projects/Onde/apps/onde-portal/out/NOME-PAGINA/
```

### 7.2 Aprire nel browser
```bash
open /Users/mattia/Projects/Onde/apps/onde-portal/out/NOME-PAGINA/index.html
```

### 7.3 Testare i link
- Verifica che i link nel menu funzionino
- Verifica che i link nella nuova pagina funzionino
- Verifica che il link nel footer funzioni (se aggiunto)

### 7.4 Testare la navigazione
- Dalla homepage, naviga alla nuova pagina
- Dalla nuova pagina, torna alla homepage
- Verifica che il menu sia coerente

---

## Tipi Comuni di Pagine

### Pagina di Testo (FAQ, Privacy, etc.)
```html
<main class="relative z-10 pt-20">
  <div class="min-h-screen py-12">
    <section class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
      <h1 class="text-4xl font-display font-bold text-onde-ocean mb-8">FAQ</h1>
      <div class="space-y-8">
        <div>
          <h2 class="text-xl font-bold text-onde-ocean mb-2">Domanda 1?</h2>
          <p class="text-onde-ocean/70">Risposta...</p>
        </div>
        <!-- Altre domande -->
      </div>
    </section>
  </div>
</main>
```

### Pagina Contatti
```html
<main class="relative z-10 pt-20">
  <div class="min-h-screen py-12">
    <section class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center">
      <h1 class="text-4xl font-display font-bold text-onde-ocean mb-4">Contatti</h1>
      <p class="text-onde-ocean/70 mb-8">Scrivici a:</p>
      <a href="mailto:info@onde.la" class="text-2xl text-onde-coral hover:underline">
        info@onde.la
      </a>
    </section>
  </div>
</main>
```

---

## Checklist Finale

- [ ] Cartella creata in `/out/NOME-PAGINA/`
- [ ] File `index.html` creato nella cartella
- [ ] Titolo e meta description aggiornati
- [ ] Contenuto inserito
- [ ] Menu navigazione aggiornato (in tutti i file HTML)
- [ ] Footer aggiornato (se necessario)
- [ ] Test link dalla homepage
- [ ] Test link alla homepage
- [ ] Test su mobile

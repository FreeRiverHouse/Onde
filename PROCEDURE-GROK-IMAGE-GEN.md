# 🎨 Procedura Generazione Immagini con Grok

## Requisiti
- Browser Chrome con profilo loggato su X/Twitter
- Account X con accesso a Grok Imagine (grok.com)
- Cartella di destinazione creata

## Procedura ESATTA Step-by-Step

### 1. SETUP INIZIALE
```
1. Apri Chrome
2. Vai su https://grok.com
3. Verifica di essere loggato (deve mostrare il tuo avatar in alto a destra)
4. Clicca su "Imagine" nella sidebar sinistra (o vai diretto a grok.com/imagine)
```

### 2. GENERARE UN'IMMAGINE
```
1. Trova il campo input "Digita per immaginare..." in basso
2. Clicca sul campo per attivarlo
3. Incolla o scrivi il prompt completo
4. Premi INVIO o clicca il pulsante di invio
5. ASPETTA 5-15 secondi per la generazione
6. Grok genera 2 varianti dell'immagine
```

### 3. SALVARE L'IMMAGINE
```
1. Posiziona il mouse sopra l'immagine che vuoi salvare
2. CLICK DESTRO sull'immagine
3. Dal menu contestuale, clicca "Salva immagine con nome..."
4. Nella finestra di salvataggio:
   - Naviga alla cartella destinazione
   - Rinomina il file (es: cap01-scena.jpg)
   - Clicca "Salva"
5. Ripeti per la seconda variante se necessario
```

### 4. CONSISTENZA TRA IMMAGINI (STESSO PERSONAGGIO)
```
1. Dopo aver generato e salvato la prima immagine
2. Clicca l'icona "Carica immagine" (📎) vicino al campo input
3. Seleziona l'immagine di riferimento salvata
4. Nel prompt scrivi: "same character but [nuova scena/azione]"
5. Genera e salva come sopra
```

### 5. UPSCALE (MIGLIORARE QUALITÀ)
```
1. Dopo la generazione, hover sull'immagine
2. Cerca il pulsante "Upscale" o icona di ingrandimento
3. Clicca per generare versione alta risoluzione
4. Salva la versione upscalata
```

## Prompt Template per Libro Bambini

```
[STILE]: Watercolor illustration, children's book style, 
Beatrix Potter meets Italian Renaissance, warm earthy palette 
(terracotta, olive green, warm gold, soft blue sky), 
soft brushstrokes, whimsical but educational, 
suitable for ages 5-8

[SCENA]: [Descrizione dettagliata della scena]

[PERSONAGGIO]: [Nome] as a [età] year old [descrizione fisica], 
wearing [vestiti], [espressione/azione]

[AMBIENTE]: [Descrizione del setting]
```

## Esempio Completo - Marco Aurelio Capitolo 1

```
Watercolor illustration, children's book style, Beatrix Potter 
meets Italian Renaissance, warm earthy palette (terracotta, 
olive green, warm gold, soft blue sky).

Young Marcus Aurelius, age 7, curly brown hair, wearing a simple 
Roman tunic, wrestling playfully with his Greek tutor in the 
sunny courtyard of a Roman villa. 

Stone columns with climbing vines, a small fountain in the 
background, cypress trees, warm afternoon light. 

The boy looks determined but joyful, learning discipline 
through play.
```

## Struttura Cartelle

```
~/Onde/books/[nome-libro]/
├── images-grok/
│   ├── cap01-[descrizione].jpg
│   ├── cap01-[descrizione]-alt.jpg
│   ├── cap02-[descrizione].jpg
│   └── ...
├── prompts/
│   └── prompts-completi.txt
└── reference/
    └── stile-reference.jpg
```

## Troubleshooting

### Click non funziona
- Assicurati che la finestra Chrome sia in focus
- Prova a scrollare per rendere visibile l'elemento
- Usa Tab per navigare ai campi se il mouse non funziona

### Immagine non si salva
- Verifica permessi cartella di destinazione
- Prova "Copia immagine" e incolla in Preview/altro editor

### Sessione scaduta
- Refresh della pagina
- Se necessario, ri-login su X/Twitter

---
*Procedura creata da Bubble Bot 🫧 - 2026-02-16*

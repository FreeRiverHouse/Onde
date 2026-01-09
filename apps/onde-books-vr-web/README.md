# Onde Books VR - WebXR Prototype

**Lettore ebook immersivo per Meta Quest**

Un prototype funzionante di lettore VR per ebook, costruito con WebXR e A-Frame. Funziona direttamente nel browser Quest - nessuna installazione richiesta.

## Screenshot

```
+------------------------------------------+
|          ONDE BOOKS VR                   |
|                                          |
|    [Biblioteca 3D con camino]            |
|                                          |
|         +--------+--------+              |
|         |  LEFT  | RIGHT  |              |
|         |  PAGE  |  PAGE  |  <- LIBRO    |
|         |        |        |              |
|         +--------+--------+              |
|                                          |
|    [Scaffali]  [Poltrona]  [Lampada]     |
+------------------------------------------+
```

## Quick Start

### 1. Installa dipendenze
```bash
cd apps/onde-books-vr-web
npm install
```

### 2. Avvia server locale
```bash
npm start
```

Il server parte su `http://localhost:8080`

### 3. Test su Desktop
Apri `http://localhost:8080` nel browser:
- **Mouse**: Guarda intorno
- **WASD**: Muoviti
- **Frecce destra/sinistra**: Cambia pagina
- **Click sui bottoni**: Navigazione

### 4. Test su Quest

**Metodo A - Stesso WiFi:**
1. Trova il tuo IP locale: `ipconfig getifaddr en0`
2. Apri il browser Quest
3. Vai a `http://[TUO-IP]:8080`
4. Tocca "Enter VR" per entrare in modalita' immersiva

**Metodo B - HTTPS richiesto per alcune feature:**
```bash
# Genera certificati self-signed (una volta)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Avvia con HTTPS
npm run https
```
Poi apri `https://[TUO-IP]:8443` (accetta il certificato)

## Controlli VR

| Controller | Azione |
|------------|--------|
| **Trigger Destro** | Pagina successiva |
| **Trigger Sinistro** | Pagina precedente |
| **A / X** | Pagina successiva |
| **B / Y** | Pagina precedente |
| **Thumbstick** | Muoviti nella stanza |
| **Laser pointer** | Punta sui bottoni UI |

## Struttura Progetto

```
onde-books-vr-web/
├── index.html          # App principale A-Frame
├── package.json        # Dipendenze
├── README.md           # Questo file
├── src/
│   └── epub-parser.js  # Parser ePub (per caricamento libri)
├── assets/
│   └── generate-assets.html  # Generatore texture
└── styles/
    └── main.css        # Stili UI overlay
```

## Features Implementate

### MVP v0.1 (Questo Prototype)

- [x] **Ambiente biblioteca 3D**
  - Stanza con pareti, pavimento, soffitto
  - Camino animato con luce dinamica
  - Scaffali con libri decorativi
  - Poltrona e tavolino
  - Finestra con luce lunare
  - Illuminazione ambient calda

- [x] **Libro 3D interattivo**
  - Due pagine visibili (spread)
  - Testo leggibile con font grande
  - Animazione page turn
  - Contenuto demo (Piccole Rime)

- [x] **Controlli**
  - Desktop: mouse + tastiera
  - Quest: controller con trigger
  - Bottoni UI in VR

- [x] **Parser ePub** (base)
  - Estrazione testo da ePub
  - Paginazione automatica per VR

## Cosa Manca per MVP Completo

### Priorita' Alta
- [ ] **Caricamento ePub dinamico** - UI per caricare propri libri
- [ ] **Font migliore** - SDF fonts per leggibilita' perfetta
- [ ] **Immagini nel libro** - Supporto illustrazioni
- [ ] **Audio ambient** - Suono camino, page turn

### Priorita' Media
- [ ] **Selezione ambiente** - Natura, spazio, mare, etc.
- [ ] **Bookmark** - Salva posizione lettura
- [ ] **Preferenze** - Font size, tema, luminosita'
- [ ] **Sync account** - Collegamento con Onde Books

### Priorita' Bassa
- [ ] **Libreria 3D** - Scegliere libri dagli scaffali
- [ ] **Multiplayer** - Leggere insieme
- [ ] **Illustrazioni 360** - Per libri bambini

## Stack Tecnologico

- **A-Frame 1.5.0** - Framework WebXR
- **A-Frame Extras** - Controlli locomotion
- **A-Frame Environment** - Ambienti procedurali
- **JSZip** - Estrazione ePub (lazy loaded)
- **Vanilla JS** - Nessun framework pesante

### Perche' WebXR invece di Unity?

1. **Velocita' prototipazione** - Da zero a testabile in ore, non settimane
2. **Nessuna installazione** - Funziona nel browser Quest
3. **Iterazione rapida** - Modifica HTML, refresh, testa
4. **Cross-platform** - Stesso codice per Quest, desktop, mobile
5. **Deployment facile** - Basta un server web

Per una versione production con grafica AAA, Unity sarebbe la scelta. Ma per validare l'idea e iterare velocemente, WebXR vince.

## Test Checklist

### Desktop Browser
- [ ] La scena si carica correttamente
- [ ] Le pagine cambiano con frecce/bottoni
- [ ] Il camino e' animato
- [ ] Si puo' navigare con WASD

### Quest Browser (non-VR)
- [ ] La pagina si carica
- [ ] Touch funziona sui bottoni
- [ ] Scroll/pan per guardarsi intorno

### Quest VR Mode
- [ ] "Enter VR" funziona
- [ ] I controller sono tracciati
- [ ] Trigger cambia pagina
- [ ] Il testo e' leggibile
- [ ] Nessun motion sickness

## Troubleshooting

**Il libro non si vede:**
- Controlla la console (F12) per errori
- Verifica che A-Frame sia caricato

**Controller non funzionano:**
- Assicurati di essere in VR mode (bottone Enter VR)
- Quest Browser richiede HTTPS per WebXR completo

**Testo sfocato:**
- Avvicinati al libro nella scena
- Il testo e' ottimizzato per ~1 metro di distanza

**Prestazioni basse:**
- Chiudi altre app sul Quest
- Il camino animato usa risorse - puo' essere disabilitato

## Prossimi Step

1. **Mattia testa il prototype** su Quest
2. **Feedback** su cosa funziona/non funziona
3. **Iterazione** basata sul feedback
4. **Decisione**: Continuare con WebXR o passare a Unity per grafica migliore?

## Licenza

MIT - Onde Publishing 2026

---

*Prototype creato per validare l'idea di Onde Books VR*
*La perfezione e' nemica del buono - prima TESTA, poi migliora*

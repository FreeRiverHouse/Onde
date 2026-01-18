# Procedura Nuova App - Onde

## Quick Start

```bash
# 1. Crea app con Vite (più affidabile per web)
cd /Users/mattiapetrucciani/CascadeProjects/Onde/apps
npm create vite@latest [nome-app] -- --template react-ts

# 2. Installa dipendenze
cd [nome-app]
npm install

# 3. Avvia development su LAN (porta assegnata)
npm run dev -- --port [PORTA] --host
```

---

## Convenzione Porte

### PROD (LAN Test) - Porte 111X
Per test su dispositivi mobili e demo.

| App | Porta PROD | URL LAN |
|-----|------------|---------|
| moonlight-house | 1112 | http://[MAC_IP]:1112 |
| moonlight-puzzle | 1113 | http://[MAC_IP]:1113 |
| aiko-interactive | 1114 | http://[MAC_IP]:1114 |
| [prossima app] | 1115 | http://[MAC_IP]:1115 |

### DEV - Porte 8889+
Per sviluppo locale con hot reload.

| App | Porta DEV |
|-----|-----------|
| moonlight-house | 8889 |
| moonlight-puzzle | 8890 |
| aiko-interactive | 8891 |
| [prossima app] | 8892 |

**Come avviare DEV:**
```bash
cd /Users/mattiapetrucciani/CascadeProjects/Onde/apps/[nome-app]
npm run dev -- --port 8889 --host
```

**Come avviare PROD (LAN):**
```bash
npm run dev -- --port 1112 --host
```

**Trovare IP Mac:**
```bash
ipconfig getifaddr en0
```

---

## 🤖 FACTORY MODE - Test Automatici

Ogni app DEVE passare test automatici prima di considerarsi "funzionante".

### Test Suite Automatica

Creare script `scripts/test-app.sh` in ogni app:

```bash
#!/bin/bash
# Test automatici per app Onde

APP_NAME=$1
PORT=$2
BASE_URL="http://localhost:$PORT"
SCREENSHOTS_DIR="./test-screenshots"

mkdir -p $SCREENSHOTS_DIR

echo "🧪 Testing $APP_NAME on $BASE_URL"

# 1. Test connettività
echo "1. Testing connectivity..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL)
if [ "$HTTP_CODE" != "200" ]; then
    echo "❌ FAIL: Server not responding (HTTP $HTTP_CODE)"
    exit 1
fi
echo "✅ Server responding"

# 2. Test HTML response
echo "2. Testing HTML structure..."
HTML=$(curl -s $BASE_URL)
if echo "$HTML" | grep -q '<div id="root"'; then
    echo "✅ React root element found"
else
    echo "❌ FAIL: React root element not found"
    exit 1
fi

# 3. Test JavaScript bundle
echo "3. Testing JS bundle loads..."
BUNDLE_URL=$(echo "$HTML" | grep -o 'src="/[^"]*\.tsx[^"]*"' | head -1 | sed 's/src="//;s/"//')
if [ -n "$BUNDLE_URL" ]; then
    BUNDLE_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${BUNDLE_URL}")
    if [ "$BUNDLE_CODE" = "200" ]; then
        echo "✅ JS bundle loads ($BUNDLE_URL)"
    else
        echo "❌ FAIL: JS bundle error (HTTP $BUNDLE_CODE)"
        exit 1
    fi
else
    echo "⚠️ WARNING: No JS bundle found in HTML"
fi

echo ""
echo "🎉 All automated tests passed for $APP_NAME"
```

### Test con Chrome (via Claude Code)

Per test visivi, Claude Code usa Claude for Chrome:

```bash
# Claude Code esegue automaticamente:
# 1. Naviga a http://localhost:PORT
# 2. Screenshot della pagina
# 3. Verifica elementi visibili
# 4. Click su ogni bottone
# 5. Screenshot dopo ogni azione
# 6. Report finale con tutti gli screenshot
```

### Checklist Test Factory Mode

Ogni funzione dell'app deve essere testata:

| Test | Metodo | Output |
|------|--------|--------|
| Server risponde | curl HTTP code | 200 OK |
| HTML corretto | curl + grep | Root element presente |
| Bundle JS carica | curl bundle URL | 200 OK |
| UI renderizza | Chrome screenshot | Screenshot iniziale |
| Bottone 1 funziona | Chrome click + screenshot | Screenshot post-click |
| Bottone 2 funziona | Chrome click + screenshot | Screenshot post-click |
| Stato si aggiorna | Chrome + screenshot | Screenshot stato |
| No errori console | Chrome console read | 0 errori |

### Script di Test Completo

Creare `scripts/factory-test.js`:

```javascript
// Factory Test Script per Onde Apps
const puppeteer = require('puppeteer');
const fs = require('fs');

async function testApp(appName, port) {
    const url = `http://localhost:${port}`;
    const screenshotsDir = `./test-screenshots/${appName}`;

    fs.mkdirSync(screenshotsDir, { recursive: true });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const results = {
        appName,
        port,
        timestamp: new Date().toISOString(),
        tests: []
    };

    try {
        // Test 1: Page loads
        await page.goto(url, { waitUntil: 'networkidle2' });
        await page.screenshot({ path: `${screenshotsDir}/01-initial.png` });
        results.tests.push({ name: 'Page loads', status: 'PASS' });

        // Test 2: Check for errors in console
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') errors.push(msg.text());
        });

        // Test 3: Find and click all buttons
        const buttons = await page.$$('button');
        for (let i = 0; i < buttons.length; i++) {
            const buttonText = await buttons[i].evaluate(el => el.innerText);
            await buttons[i].click();
            await page.waitForTimeout(500);
            await page.screenshot({ path: `${screenshotsDir}/0${i+2}-click-${buttonText.replace(/\s+/g, '-')}.png` });
            results.tests.push({ name: `Click: ${buttonText}`, status: 'PASS' });
        }

        // Test 4: Check console errors
        if (errors.length === 0) {
            results.tests.push({ name: 'No console errors', status: 'PASS' });
        } else {
            results.tests.push({ name: 'Console errors', status: 'FAIL', errors });
        }

    } catch (error) {
        results.tests.push({ name: 'Runtime', status: 'FAIL', error: error.message });
    }

    await browser.close();

    // Save results
    fs.writeFileSync(`${screenshotsDir}/results.json`, JSON.stringify(results, null, 2));

    // Print summary
    console.log(`\n📊 Test Results for ${appName}:`);
    results.tests.forEach(t => {
        const icon = t.status === 'PASS' ? '✅' : '❌';
        console.log(`${icon} ${t.name}`);
    });

    return results;
}

// Usage: node factory-test.js moonlight-house 1112
const [appName, port] = process.argv.slice(2);
testApp(appName, parseInt(port));
```

---

## Checklist Pre-Sviluppo

### 1. Definizione Progetto
- [ ] Nome app (inglese, lowercase con trattini)
- [ ] Bundle ID: `com.freeriverhouse.[nome]`
- [ ] Target età (es. 4-8 anni)
- [ ] Categoria App Store (Games, Education, etc.)
- [ ] Monetizzazione (Freemium, IAP, Subscription, Paid)

### 2. Design Brief
- [ ] CREATIVE-BRIEF.md - Concept e valori
- [ ] ARTWORK-PINA.md - Prompt per illustrazioni
- [ ] COPY-GIANNI.md - Testi e copy
- [ ] Palette colori definita (hex codes)

### 3. Asset Richiesti (Prima di Coding)
- [ ] Icona app 1024x1024
- [ ] Splash screen
- [ ] Character design (se presente)
- [ ] Sfondi principali
- [ ] Icone UI

---

## Struttura Progetto Standard (Vite)

```
apps/[nome-app]/
├── src/
│   ├── App.tsx              # Main component
│   ├── App.css              # Styles
│   ├── main.tsx             # Entry point
│   ├── components/          # UI components
│   └── hooks/               # Custom hooks
├── public/                  # Static assets
├── scripts/
│   ├── test-app.sh          # Basic tests
│   └── factory-test.js      # Full test suite
├── test-screenshots/        # Test output
├── package.json
├── vite.config.ts
├── CREATIVE-BRIEF.md
├── ARTWORK-PINA.md
├── COPY-GIANNI.md
├── DEV-LOG.md
└── TEST-LOG.md
```

---

## Stack Tecnologico (Web-First)

| Cosa | Tool |
|------|------|
| Framework | React + Vite |
| Styling | CSS/Tailwind |
| State | React useState/useReducer |
| Storage | localStorage |
| Animations | CSS transitions |
| Testing | Puppeteer + curl |
| Deployment | **Cloudflare Pages** |

### Per Mobile (Future)
| Cosa | Tool |
|------|------|
| Framework | React Native + Expo |
| Navigation | Expo Router |
| Storage | AsyncStorage |
| Audio | expo-av |
| Haptics | expo-haptics |

---

## Features Standard (Checklist)

### Obbligatorie (MVP)
- [ ] Splash screen con logo
- [ ] Schermata principale funzionante
- [ ] Almeno 1 interazione core
- [ ] Salvataggio stato (localStorage)
- [ ] **Tutti i test automatici passano**

### Consigliate
- [ ] Effetti sonori
- [ ] Animazioni fluide
- [ ] Multi-lingua (IT, EN)

### Per Bambini (COPPA Compliance)
- [ ] Parental gate (moltiplicazione)
- [ ] NO ads per under 13
- [ ] NO social sharing diretto
- [ ] Privacy policy kid-friendly

---

## Workflow Sviluppo - Factory Mode

### Fase 1: Setup
```bash
cd /Users/mattiapetrucciani/CascadeProjects/Onde/apps
npm create vite@latest [nome] -- --template react-ts
cd [nome]
npm install
npm install puppeteer --save-dev  # Per test
mkdir -p scripts test-screenshots
```

### Fase 2: Sviluppo + Test Continuo
```bash
# Terminal 1: Dev server
npm run dev -- --port [PORTA] --host

# Terminal 2: Test continui (dopo ogni modifica significativa)
./scripts/test-app.sh [nome-app] [PORTA]
```

### Fase 3: Test Completo Factory
```bash
# Prima di dichiarare "fatto"
node scripts/factory-test.js [nome-app] [PORTA]

# Verifica screenshots in test-screenshots/
# Verifica results.json - tutti PASS
```

### Fase 4: Report
Salvare in TEST-LOG.md:
- Screenshot di ogni funzione
- Risultati test
- Note su problemi risolti

---

## Comandi Utili

```bash
# Avvia dev server
npm run dev -- --port 1112 --host

# Test rapido
curl -s http://localhost:1112 | head -20

# Test completo
./scripts/test-app.sh moonlight-house 1112

# Test con Puppeteer
node scripts/factory-test.js moonlight-house 1112

# Build production
npm run build

# Preview build
npm run preview
```

---

## Palette Colori Onde Kids

```typescript
// src/constants/Colors.ts
export const Colors = {
  // Notturno (Moonlight, sleep apps)
  nightBlue: '#1a1a3e',
  starGold: '#ffd700',
  dreamViolet: '#9b59b6',
  moonWhite: '#f5f5dc',
  lavender: '#e6e6fa',

  // Giorno (educational, games)
  skyBlue: '#87CEEB',
  sunYellow: '#FFD93D',
  grassGreen: '#90EE90',
  coralPink: '#FF6B6B',

  // UI
  background: '#f5f0ff',
  text: '#4c1d95',
  accent: '#7c3aed',
  success: '#10b981',
  error: '#ef4444',
};
```

---

## Agenti Coinvolti

| Agente | Ruolo | Output |
|--------|-------|--------|
| **Editore Capo** | Approva concept e milestone | OK/Feedback |
| **Pina Pennello** | Illustrazioni via Grok | PNG assets |
| **Gianni Parola** | Copy e testi | Markdown files |
| **Engineering** | Sviluppo + Test automatici | App + TEST-LOG.md |
| **QA** | Review test screenshots | Approvazione |

---

## Documenti da Creare per Ogni App

1. **CREATIVE-BRIEF.md** - Vision, target, valori
2. **ARTWORK-PINA.md** - Prompt illustrazioni con palette
3. **COPY-GIANNI.md** - Tutti i testi dell'app
4. **DEV-LOG.md** - Log decisioni tecniche
5. **TEST-LOG.md** - Screenshot + risultati test automatici

---

## 🚨 REGOLA FACTORY MODE

**Un'app NON è "fatta" finché:**
1. `./scripts/test-app.sh` passa tutti i test
2. `node scripts/factory-test.js` genera screenshot di ogni funzione
3. `results.json` mostra tutti PASS
4. TEST-LOG.md contiene gli screenshot
5. **Layout occupa TUTTA la pagina** (vedi sezione sotto)

---

## 🚨 LEZIONE IMPARATA - Layout Full Page (2026-01-17)

**PROBLEMA:** Vite template di default ha CSS che CENTRA il contenuto invece di riempire la pagina.

**FIX OBBLIGATORIO dopo `npm create vite`:**

Modificare `src/index.css`:
```css
/* RIMUOVERE questo (default Vite): */
body {
  display: flex;
  place-items: center;  /* ❌ QUESTO CENTRA TUTTO */
}

/* SOSTITUIRE con: */
html, body, #root {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport per mobile */
  width: 100%;
  overflow-x: hidden;
}
```

**In App.css aggiungere al container:**
```css
.container {
  min-height: 100vh;
  min-height: 100dvh;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}
```

**TEST VISIVO OBBLIGATORIO:**
- Screenshot deve mostrare app che occupa TUTTA l'altezza viewport
- NO spazi bianchi sopra/sotto l'app
- Testare anche su mobile (100dvh gestisce la barra browser)

### Background Full-Page (se serve sfondo illustrato)

Se l'app ha uno sfondo che deve coprire TUTTO lo schermo:

```tsx
// App.tsx - wrapper esterno per background
return (
  <div className="full-page-bg" style={{ backgroundImage: `url(${bg})` }}>
    <div className="overlay" />
    <div className="container">
      {/* contenuto app */}
    </div>
  </div>
);
```

```css
/* App.css */
.full-page-bg {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
}

.overlay {
  position: fixed; /* NON absolute! */
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1;
}

.particles {
  position: fixed; /* NON absolute! */
}

.container {
  max-width: 480px; /* mobile-first */
  z-index: 5;
}
```

**ERRORE COMUNE:** Mettere background-image sul container con max-width → lo sfondo non copre i lati

**Engineering Dept Agent deve:**
- Eseguire test automatici dopo ogni modifica
- Generare screenshot prima di dichiarare "completato"
- Includere results.json nel report

---

---

## 🚀 DEPLOY SU ONDE.SURF (DEV)

**onde.surf è ambiente DEV - posso committare direttamente senza chiedere approvazione.**

### Procedura Deploy Game/App su onde.surf

1. **Build l'app con base path corretto:**
   ```bash
   cd /Users/mattiapetrucciani/CascadeProjects/Onde/apps/[nome-app]

   # vite.config.ts deve avere:
   # base: '/static-games/[nome-app]/',

   npx vite build
   ```

2. **Copia build in onde-portal:**
   ```bash
   rm -rf /Users/mattiapetrucciani/CascadeProjects/Onde/apps/onde-portal/public/static-games/[nome-app]
   cp -r dist /Users/mattiapetrucciani/CascadeProjects/Onde/apps/onde-portal/public/static-games/[nome-app]
   cp -r public/assets /Users/mattiapetrucciani/CascadeProjects/Onde/apps/onde-portal/public/static-games/[nome-app]/
   ```

3. **Crea Next.js page per routing (se non esiste):**
   ```bash
   mkdir -p apps/onde-portal/src/app/games/[nome-app]
   ```

   Crea `page.tsx` che fa embed via iframe:
   ```tsx
   'use client'
   export default function GamePage() {
     return (
       <div className="min-h-screen">
         <iframe
           src="/static-games/[nome-app]/index.html"
           className="w-full h-screen border-0"
           title="[Nome App]"
         />
       </div>
     )
   }
   ```

4. **Build Next.js e Deploy su Cloudflare:**
   ```bash
   cd /Users/mattiapetrucciani/CascadeProjects/Onde/apps/onde-portal
   npm run build
   npx wrangler pages deploy out --project-name=onde-surf --branch=main
   ```

5. **Commit e push (per storico git):**
   ```bash
   git add -A
   git commit -m "Deploy [nome-app] to onde.surf/games/[nome-app]"
   git push
   ```

6. **Verifica deploy (Cloudflare impiega ~30-60 sec):**
   - onde.surf/games/[nome-app]/

### Checklist Deploy

- [ ] Logo Onde (NO vite.svg o altri loghi)
- [ ] Base path corretto in vite.config.ts
- [ ] Assets copiati (backgrounds, images, etc.)
- [ ] Next.js page creata per routing
- [ ] Aggiunto a /giochi page se è un game
- [ ] Commit con messaggio descrittivo
- [ ] Verifica su browser dopo deploy

### Struttura Files

```
apps/onde-portal/
├── public/
│   └── static-games/
│       └── [nome-app]/
│           ├── index.html
│           ├── onde-logo.jpg       # MAI vite.svg!
│           └── assets/
│               ├── index-xxx.js
│               ├── index-xxx.css
│               └── backgrounds/
└── src/app/
    └── games/
        └── [nome-app]/
            └── page.tsx           # Next.js page con iframe
```

---

---

## 🚨 LEZIONE IMPARATA - BASE_URL per Asset Paths (2026-01-17)

**PROBLEMA:** Quando un'app Vite viene hostata in un subpath (es. `/static-games/app-name/`), i path assoluti delle immagini non funzionano.

**ESEMPIO ERRORE:**
```
❌ src="/assets/backgrounds/image.jpg"
   → Richiede: https://onde.surf/assets/backgrounds/image.jpg
   → 404 NOT FOUND!

✅ src={`${BASE_URL}assets/backgrounds/image.jpg`}
   → Richiede: https://onde.surf/static-games/app-name/assets/backgrounds/image.jpg
   → FUNZIONA!
```

**FIX OBBLIGATORIO in App.tsx:**
```tsx
// All'inizio del file, PRIMA di qualsiasi uso di asset path:
const BASE_URL = import.meta.env.BASE_URL || '/';

// Poi TUTTI i path immagini devono usare BASE_URL:
<img src={`${BASE_URL}assets/backgrounds/house-map.jpg`} />

// Anche negli oggetti dati:
const rooms = [
  { bg: `${BASE_URL}assets/backgrounds/room-bedroom.jpg` },
  { bg: `${BASE_URL}assets/backgrounds/room-kitchen.jpg` },
];
```

**RICORDA:**
- `import.meta.env.BASE_URL` viene dal `base` in vite.config.ts
- In dev (`/`) e in prod (`/static-games/app-name/`) funziona automaticamente
- MAI hardcodare path assoluti come `/assets/...` per immagini

---

## 🧪 TEST AUTOMATICI POST-DEPLOY (OBBLIGATORIO)

**Un deploy NON è completo finché non passa TUTTI questi test.**

### Checklist Test Post-Deploy

| # | Test | Come Verificare | Criterio |
|---|------|-----------------|----------|
| 1 | Pagina carica | Naviga a URL | No errori, contenuto visibile |
| 2 | Network 200 | DevTools → Network | Tutte risorse 200, no 404 |
| 3 | Immagini visibili | Screenshot | Tutte le immagini renderizzate |
| 4 | Console pulita | DevTools → Console | No errori rossi |
| 5 | Interazioni | Click bottoni/link | Funzionano come atteso |

### Procedura Test con Claude for Chrome

```bash
# 1. Naviga alla pagina deployata
mcp__claude-in-chrome__navigate → https://onde.surf/games/[app-name]/

# 2. Screenshot iniziale
mcp__claude-in-chrome__computer → action: screenshot

# 3. Verifica network requests (CRITICO!)
mcp__claude-in-chrome__read_network_requests → tabId, urlPattern: "assets"
# Controllare: TUTTE le richieste devono essere 200, NO 404!

# 4. Leggi console per errori
mcp__claude-in-chrome__read_console_messages → tabId, onlyErrors: true
# Controllare: deve essere vuoto o solo warning non critici

# 5. Test interazioni principali
mcp__claude-in-chrome__computer → click su elementi chiave
mcp__claude-in-chrome__computer → screenshot dopo ogni azione
```

### Errori Comuni e Fix

| Errore | Causa | Fix |
|--------|-------|-----|
| Immagini 404 | Path assoluti hardcodati | Usa `${BASE_URL}assets/...` |
| JS bundle 404 | Base path sbagliato | Verifica `base` in vite.config.ts |
| CSS non caricato | Build non copiato | Rifai `cp -r dist/...` |
| Assets mancanti | public/ non copiato | Copia anche `public/assets/` |

---

## 🌐 AMBIENTI DEPLOY

| Ambiente | URL | Cloudflare Project | Uso |
|----------|-----|-------------------|-----|
| **PREPROD** | onde.surf | `onde-surf` | Test prima di prod |
| **PROD** | onde.la | `onde-portal` | Produzione |

**REGOLA:** Deployare SEMPRE prima su onde.surf (preprod), testare, poi promuovere a prod.

**Comandi Deploy:**
```bash
# PREPROD (onde.surf)
npx wrangler pages deploy out --project-name=onde-surf --branch=main

# PROD (onde.la) - solo dopo test su preprod!
npx wrangler pages deploy out --project-name=onde-portal --branch=main
```

---

*Ultimo aggiornamento: Gennaio 2026*
*Procedura Engineering Department - Onde*

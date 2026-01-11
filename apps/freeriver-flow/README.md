# FreeRiver Flow

> **"Mattia on Steroids"** - Sviluppa app mentre corri, cammini, vivi.

FreeRiver Flow e' l'app voice-first che ti permette di costruire software parlando. E' Claude Code, ma a VOCE. Immagina di dare istruzioni ai tuoi agenti AI mentre corri con le AirPods, guidi in macchina, o ti godi un aperitivo.

---

## Cos'e' FreeRiver Flow

FreeRiver Flow e' un'applicazione React Native/Expo che trasforma la tua voce in comandi per Claude AI. Parli, Claude capisce, e il tuo team virtuale esegue.

### La Visione

```
FREERIVER FLOW
|
+-- 1. VOCE (Core - PRIORITA' ASSOLUTA)
|   +-- iPhone + AirPods -> Claude API
|   +-- Funziona OVUNQUE: corsa, macchina, aperitivo
|   +-- "Raddoppia le ore produttive"
|
+-- 2. VR (Quest 2 - Futuro)
|   +-- Sei DENTRO la tua azienda
|   +-- Personaggi 3D: Editore Capo, Pina Pennello, Emilio
|   +-- E' SIM CITY ma costruisci app/libri
|
+-- 3. 2D (Desktop/Mobile)
|   +-- Versione con personaggini
|   +-- Per chi non ha Quest
|
+-- 4. AR GLASSES (Futuro lontano)
    +-- OndeVision quando il resto funziona
```

### Perche' Voice-First?

- **Liberta'**: Sviluppa mentre fai altro
- **Velocita'**: Parlare e' 3x piu' veloce che scrivere
- **Accessibilita'**: Niente schermo, niente tastiera
- **Produttivita'**: Trasforma tempo morto in tempo produttivo

---

## Installazione

### Prerequisiti

- Node.js >= 18
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)
- Account Expo (gratuito)

### Quick Start

```bash
# 1. Clona il repository (se non l'hai gia')
git clone https://github.com/FreeRiverHouse/Onde.git
cd Onde/apps/freeriver-flow

# 2. Installa le dipendenze
npm install

# 3. Copia il file di configurazione
cp .env.example .env

# 4. Configura le API keys (vedi sezione successiva)
nano .env

# 5. Avvia l'app
npm start
# oppure
expo start
```

### Comandi Disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm start` | Avvia Expo dev server |
| `npm run ios` | Avvia su simulatore iOS |
| `npm run android` | Avvia su emulatore Android |
| `npm run web` | Avvia versione web |

---

## Configurazione API Keys

FreeRiver Flow richiede alcune API keys per funzionare. Crea un file `.env` nella root del progetto:

### API Keys Obbligatorie

```bash
# Anthropic API Key (OBBLIGATORIA)
# Usata per le conversazioni con Claude
# Ottieni la tua: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-xxxxxx

# OpenAI API Key (OBBLIGATORIA)
# Usata per Whisper (speech-to-text)
# Ottieni la tua: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-xxxxxx
```

### API Keys Opzionali

```bash
# ElevenLabs API Key (OPZIONALE)
# Per sintesi vocale di alta qualita'
# Se non configurata, usa la voce di sistema
# Ottieni la tua: https://elevenlabs.io/
ELEVENLABS_API_KEY=

# ElevenLabs Voice ID (OPZIONALE)
# ID della voce da usare per TTS
# Trova le voci: https://elevenlabs.io/voice-library
ELEVENLABS_VOICE_ID=
```

### Verifica Configurazione

Le API keys vengono validate all'avvio:

- **Anthropic**: deve iniziare con `sk-ant-`
- **OpenAI**: deve iniziare con `sk-`

Se una key obbligatoria manca, l'app mostra un errore chiaro.

---

## Come Usare l'App

### 1. Avvia l'App

```bash
npm start
```

Scansiona il QR code con l'app Expo Go sul tuo iPhone.

### 2. Parla con Claude

1. **Premi il bottone microfono** per iniziare a registrare
2. **Parla** la tua richiesta
3. **Rilascia** per inviare
4. **Claude risponde** con voce e testo

### 3. Esempi di Comandi

| Cosa Dici | Cosa Succede |
|-----------|--------------|
| "Crea una nuova funzione per calcolare il totale" | Claude genera il codice |
| "Qual e' lo stato dei task?" | Claude legge la task queue |
| "Manda un messaggio su Telegram a Mattia" | Claude usa il bot Telegram |
| "Genera un'illustrazione per il libro" | Claude coordina con Grok |

### 4. Modalita' d'Uso

- **Corsa/Camminata**: AirPods + iPhone in tasca
- **Macchina**: iPhone sul supporto, comandi vocali
- **Casa**: Mentre cucini, pulisci, ti rilassi
- **Lavoro**: Meeting "hands-free" con il tuo team AI

---

## Architettura del Codice

### Struttura Cartelle

```
freeriver-flow/
|-- app.json           # Configurazione Expo
|-- package.json       # Dipendenze e script
|-- tsconfig.json      # Configurazione TypeScript
|-- .env.example       # Template variabili ambiente
|-- .env               # Variabili ambiente (NON committare!)
|
|-- services/
|   +-- config.ts      # Gestione configurazione e API keys
|
+-- app/               # (Da creare) Route Expo Router
+-- components/        # (Da creare) Componenti React
+-- hooks/             # (Da creare) Custom hooks
+-- utils/             # (Da creare) Utility functions
```

### Stack Tecnologico

| Tecnologia | Uso |
|------------|-----|
| **React Native** | Framework mobile cross-platform |
| **Expo** | Toolchain e servizi per React Native |
| **Expo Router** | Navigazione file-based |
| **expo-av** | Registrazione audio |
| **expo-speech** | Text-to-speech di sistema |
| **TypeScript** | Type safety |
| **Anthropic SDK** | Comunicazione con Claude API |

### Flusso Dati

```
[Microfono] --> [expo-av] --> [Audio Buffer]
                                  |
                                  v
[OpenAI Whisper API] <-- [Audio Upload]
                                  |
                                  v
                        [Testo Trascritto]
                                  |
                                  v
               [Claude API] <-- [Prompt + Context]
                                  |
                                  v
                         [Risposta Claude]
                                  |
                                  v
[expo-speech] o [ElevenLabs] <-- [Testo Risposta]
                                  |
                                  v
                            [Audio Output]
```

### Servizi Principali

#### `services/config.ts`

Gestisce il caricamento e la validazione delle API keys:

- Supporta sia variabili Expo (EAS builds) che process.env (development)
- Valida il formato delle API keys
- Fornisce un singleton per la configurazione

```typescript
import { getConfig, isElevenLabsAvailable } from '@/services/config';

const config = getConfig();
console.log('Anthropic ready:', !!config.anthropicApiKey);
console.log('ElevenLabs enabled:', isElevenLabsAvailable());
```

---

## Roadmap Features Future

### Fase 1 - MVP Voice (Q1 2026)

- [ ] **Core Voice Loop**: Registra -> Trascrivi -> Claude -> Parla
- [ ] **Gestione Conversazione**: Contesto persistente tra messaggi
- [ ] **UI Minimale**: Bottone grande per parlare, feedback visivo
- [ ] **Error Handling**: Gestione errori di rete, API, audio

### Fase 2 - Integrazione Factory (Q1-Q2 2026)

- [ ] **Task Manager**: Visualizza e gestisci task dalla voce
- [ ] **Telegram Integration**: Manda messaggi tramite bot
- [ ] **GitHub Integration**: Crea commit, issue, PR vocalmente
- [ ] **Worker Status**: "Quali agenti stanno lavorando?"

### Fase 3 - Personaggi 2D (Q2 2026)

- [ ] **Avatar Animati**: Gianni, Pina, Emilio come personaggi
- [ ] **Conversazioni Contestuali**: Ogni personaggio ha il suo ruolo
- [ ] **Dashboard Visiva**: Stato della "fabbrica" in tempo reale

### Fase 4 - VR Quest 2 (Q3 2026)

- [ ] **Ambiente 3D**: Ufficio virtuale FreeRiverHouse
- [ ] **Personaggi 3D**: Interagisci con il team virtuale
- [ ] **Gesture Control**: Approva, rifiuta, naviga con le mani
- [ ] **Voice Spatial**: Audio 3D per immersione totale

### Fase 5 - OndeVision (Q4 2026+)

- [ ] **AR Glasses Support**: Overlay su mondo reale
- [ ] **Always-On Mode**: Assistente sempre disponibile
- [ ] **Notifiche Visive**: Task completati, errori, alert

---

## Contribuire

FreeRiver Flow e' parte del progetto Onde. Per contribuire:

1. Leggi `CLAUDE.md` nella root del repo per le regole
2. Leggi `ROADMAP.md` per i task disponibili
3. Usa il sistema worker: `node scripts/worker/worker-manager.js available`
4. Crea un branch, fai le modifiche, apri una PR

---

## Link Utili

- **Onde Repository**: https://github.com/FreeRiverHouse/Onde
- **Expo Documentation**: https://docs.expo.dev/
- **Claude API Docs**: https://docs.anthropic.com/
- **OpenAI Whisper**: https://platform.openai.com/docs/guides/speech-to-text
- **ElevenLabs**: https://elevenlabs.io/docs

---

## Licenza

Proprietary - FreeRiverHouse / Onde

---

*"Gli occhiali sono commodity, il CODICE e' tutto."* - Magmatic

*Documento generato: 2026-01-10*

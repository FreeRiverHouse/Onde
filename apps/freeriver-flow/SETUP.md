# FreeRiver Flow - Setup Guide

Guida passo-passo per configurare e testare FreeRiver Flow sul tuo iPhone.

---

## Requisiti di Sistema

### Hardware

| Dispositivo | Requisiti |
|-------------|-----------|
| **Mac** | macOS 12+ (per development) |
| **iPhone** | iOS 13+ (per testing) |
| **Cuffie** | AirPods o simili (consigliato) |

### Software

| Componente | Versione Minima | Come Verificare |
|------------|-----------------|-----------------|
| **Node.js** | 18.x o superiore | `node --version` |
| **npm** | 9.x o superiore | `npm --version` |
| **Expo CLI** | Ultima versione | `expo --version` |
| **Git** | 2.x | `git --version` |
| **Xcode** | 14+ (solo per simulatore) | App Store |

### Account Necessari

| Servizio | Tipo | Costo | Link |
|----------|------|-------|------|
| **Expo** | Account gratuito | Gratis | https://expo.dev/signup |
| **Anthropic** | API access | Pay-per-use | https://console.anthropic.com/ |
| **OpenAI** | API access | Pay-per-use | https://platform.openai.com/ |
| **ElevenLabs** | API access (opzionale) | Gratis/Pay | https://elevenlabs.io/ |

---

## Step by Step Setup

### Step 1: Installa Node.js

Se non hai Node.js installato:

```bash
# Opzione A: Con Homebrew (consigliato)
brew install node

# Opzione B: Con nvm (per gestire piu' versioni)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Verifica installazione
node --version  # Dovrebbe mostrare v18.x.x o superiore
npm --version   # Dovrebbe mostrare 9.x.x o superiore
```

### Step 2: Installa Expo CLI

```bash
# Installa Expo CLI globalmente
npm install -g expo-cli

# Verifica installazione
expo --version
```

### Step 3: Clona il Repository

```bash
# Clona Onde (se non l'hai gia')
git clone https://github.com/FreeRiverHouse/Onde.git

# Entra nella cartella FreeRiver Flow
cd Onde/apps/freeriver-flow
```

### Step 4: Installa le Dipendenze

```bash
# Installa tutte le dipendenze npm
npm install

# Se hai problemi, prova con cache clean
npm cache clean --force
npm install
```

### Step 5: Configura le API Keys

```bash
# Copia il template
cp .env.example .env

# Apri con il tuo editor preferito
nano .env
# oppure
code .env
# oppure
open -a TextEdit .env
```

Inserisci le tue API keys:

```bash
# OBBLIGATORIE
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# OPZIONALI (lascia vuote se non le hai)
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
```

### Step 6: Verifica la Configurazione

```bash
# Avvia il dev server
npm start

# Se tutto e' ok, vedrai il QR code
# Se mancano API keys, vedrai un errore chiaro
```

---

## Come Testare su iPhone

### Metodo 1: Expo Go (Consigliato per Development)

1. **Scarica Expo Go** dall'App Store sul tuo iPhone

2. **Avvia il dev server** sul Mac:
   ```bash
   cd Onde/apps/freeriver-flow
   npm start
   ```

3. **Scansiona il QR code**:
   - Apri la fotocamera dell'iPhone
   - Inquadra il QR code nel terminale
   - Tap sulla notifica per aprire Expo Go

4. **Connessione**:
   - Assicurati che iPhone e Mac siano sulla stessa rete WiFi
   - Se non funziona, prova: `npm start --tunnel`

### Metodo 2: Simulatore iOS (Senza iPhone)

```bash
# Richiede Xcode installato
npm run ios

# Questo avvia il simulatore iPhone automaticamente
```

### Metodo 3: Build di Development

Per installare un'app dedicata (non serve Expo Go):

```bash
# Login a Expo
expo login

# Crea development build
eas build --profile development --platform ios

# Segui le istruzioni per installare sul device
```

---

## Permessi iPhone Necessari

L'app richiede questi permessi:

| Permesso | Motivo | Quando Richiesto |
|----------|--------|------------------|
| **Microfono** | Registrazione vocale | Primo uso del microfono |
| **Audio Background** | Ascoltare risposte con schermo spento | Automatico |

### Come Concedere i Permessi

1. Quando l'app chiede il permesso, tap **Consenti**
2. Se hai negato per errore:
   - Vai in **Impostazioni** > **Privacy** > **Microfono**
   - Trova **Expo Go** o **FreeRiver Flow**
   - Attiva il toggle

---

## Troubleshooting Comune

### Problema: "Module not found"

**Sintomo**: Errore di import quando avvii l'app

**Soluzione**:
```bash
# Pulisci la cache e reinstalla
rm -rf node_modules
rm package-lock.json
npm install

# Pulisci anche la cache Expo
expo start -c
```

### Problema: "Missing API key"

**Sintomo**: L'app non si avvia, errore su API key

**Soluzione**:
1. Verifica che `.env` esista: `ls -la .env`
2. Verifica il contenuto: `cat .env`
3. Assicurati che le key siano senza spazi:
   ```bash
   # CORRETTO
   ANTHROPIC_API_KEY=sk-ant-xxx

   # SBAGLIATO (spazio dopo =)
   ANTHROPIC_API_KEY= sk-ant-xxx
   ```

### Problema: "Network request failed"

**Sintomo**: L'app non comunica con le API

**Soluzioni**:
1. **Verifica connessione**: Il telefono ha internet?
2. **Verifica le API keys**: Sono valide e attive?
3. **Verifica credito**: Hai credito sufficiente su Anthropic/OpenAI?
4. **Prova tunnel mode**: `npm start --tunnel`

### Problema: iPhone non trova l'app

**Sintomo**: QR code scansionato ma niente succede

**Soluzioni**:
1. **Stessa rete WiFi**: Mac e iPhone devono essere sulla stessa rete
2. **Firewall**: Disabilita temporaneamente il firewall Mac
3. **Tunnel mode**: `npm start --tunnel` bypassa i problemi di rete
4. **Reinstalla Expo Go**: A volte serve una reinstallazione

### Problema: Audio non funziona

**Sintomo**: Non registra o non riproduce audio

**Soluzioni**:
1. **Permessi**: Verifica che il permesso microfono sia concesso
2. **Volume**: Alza il volume del dispositivo
3. **Silent mode**: Disattiva la modalita' silenziosa
4. **Cuffie**: Prova con e senza cuffie
5. **Restart**: Chiudi e riapri l'app

### Problema: Build fallisce

**Sintomo**: Errori durante `npm install` o `expo start`

**Soluzioni**:
```bash
# Reset completo
rm -rf node_modules
rm -rf .expo
rm package-lock.json
npm cache clean --force
npm install
expo start -c
```

### Problema: "Expo Go version mismatch"

**Sintomo**: L'app richiede una versione diversa di Expo Go

**Soluzione**:
1. Aggiorna Expo Go dall'App Store
2. Oppure fai downgrade del progetto:
   ```bash
   expo upgrade
   ```

---

## Configurazione Avanzata

### Usare ElevenLabs per TTS Premium

Per voci di alta qualita':

1. **Crea account** su https://elevenlabs.io/
2. **Ottieni API key** dal dashboard
3. **Scegli una voce** dalla Voice Library
4. **Configura .env**:
   ```bash
   ELEVENLABS_API_KEY=xi-xxxxxxxxxxxxxx
   ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
   ```

### Build di Produzione

Per creare una build per App Store:

```bash
# Login Expo
expo login

# Setup EAS Build
eas build:configure

# Build per iOS
eas build --platform ios

# Submit all'App Store
eas submit --platform ios
```

### Variabili Ambiente per EAS

Per build EAS, configura le secrets:

```bash
# Aggiungi le variabili come secrets
eas secret:create --name ANTHROPIC_API_KEY --value sk-ant-xxx
eas secret:create --name OPENAI_API_KEY --value sk-xxx
```

Poi in `app.json`:

```json
{
  "expo": {
    "extra": {
      "ANTHROPIC_API_KEY": "process.env.ANTHROPIC_API_KEY",
      "OPENAI_API_KEY": "process.env.OPENAI_API_KEY"
    }
  }
}
```

---

## Verifica Finale

Usa questa checklist per verificare che tutto funzioni:

- [ ] `node --version` mostra v18+
- [ ] `npm --version` mostra v9+
- [ ] `expo --version` mostra la versione
- [ ] `.env` esiste con le API keys
- [ ] `npm start` mostra il QR code senza errori
- [ ] iPhone scansiona e apre l'app
- [ ] Il permesso microfono e' concesso
- [ ] Riesci a registrare audio
- [ ] Claude risponde ai tuoi messaggi

---

## Supporto

Se hai problemi non risolti da questa guida:

1. **Controlla i log**: `expo start` mostra errori utili
2. **GitHub Issues**: Apri una issue sul repo Onde
3. **Telegram**: Contatta via @OndePR_bot

---

*Documento generato: 2026-01-10*
*Versione: 1.0.0*

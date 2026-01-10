# Freeriver Flow iOS

App iOS voice-first con integrazione Claude AI.

## Funzionalita

- **Voice Input**: Registrazione vocale con microfono
- **Speech-to-Text**: Conversione voce in testo con Apple Speech Recognition
- **Claude AI**: Integrazione API Anthropic per risposte intelligenti
- **Text-to-Speech**: Lettura vocale delle risposte con AVSpeechSynthesizer
- **Conversazione**: Storico della chat mantenuto durante la sessione

## Requisiti

- macOS 14.0+ con Xcode 15.0+
- iOS 17.0+
- iPhone o iPad (fisico per test microfono)
- Account Anthropic con API key

## Setup

### 1. Apri il progetto

```bash
cd /Users/mattia/Projects/Onde/apps/freeriver-flow-ios
open FreeriverFlow.xcodeproj
```

### 2. Configura API Key

Ci sono due modi per configurare l'API key:

**Opzione A - Environment Variable (sviluppo)**

In Xcode:
1. Vai su Product > Scheme > Edit Scheme
2. Seleziona "Run" nella sidebar
3. Tab "Arguments"
4. In "Environment Variables" aggiungi:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-api03-xxx...` (la tua API key)

**Opzione B - Hardcoded (solo per test)**

Modifica `ClaudeAPIService.swift`:
```swift
private var apiKey: String {
    "sk-ant-api03-xxx..." // La tua API key
}
```

> **Nota**: Per produzione, usa Keychain o un sistema sicuro per le credenziali.

### 3. Configura Signing

1. In Xcode, seleziona il progetto nel navigator
2. Seleziona il target "FreeriverFlow"
3. Tab "Signing & Capabilities"
4. Seleziona il tuo Team

### 4. Build & Run

1. Seleziona un dispositivo fisico (il simulatore non supporta microfono reale)
2. Premi Cmd+R per buildare e lanciare

## Utilizzo

1. **Tocca il pulsante microfono** per iniziare a parlare
2. **Parla la tua domanda** in italiano (o altra lingua)
3. **Tocca di nuovo** per fermare la registrazione
4. **Attendi** l'elaborazione e la risposta vocale
5. Oppure usa il **campo di testo** per input scritto

## Architettura

```
FreeriverFlow/
├── FreeriverFlowApp.swift      # Entry point
├── ContentView.swift           # UI principale
├── Models/
│   └── Message.swift           # Modello messaggio
├── ViewModels/
│   └── VoiceAssistantViewModel.swift  # Logica principale
└── Services/
    ├── AudioRecorder.swift     # Registrazione audio
    ├── SpeechRecognizer.swift  # Speech-to-text
    ├── ClaudeAPIService.swift  # Claude API
    └── TextToSpeech.swift      # TTS
```

## Permessi Richiesti

L'app richiede questi permessi (configurati in Info.plist):

- **NSMicrophoneUsageDescription**: Accesso al microfono
- **NSSpeechRecognitionUsageDescription**: Riconoscimento vocale

## API Claude

L'app usa:
- **Modello**: `claude-sonnet-4-20250514`
- **Max tokens**: 1024
- **System prompt**: Assistente vocale conciso in italiano

## Troubleshooting

### "API key mancante"
Verifica di aver configurato `ANTHROPIC_API_KEY` nelle environment variables.

### "Permesso microfono negato"
Vai in Impostazioni > Privacy > Microfono e abilita l'app.

### "Riconoscimento vocale non disponibile"
- Verifica connessione internet
- Controlla Impostazioni > Privacy > Riconoscimento vocale

### Build fallisce
- Verifica Xcode 15+
- Verifica iOS Deployment Target 17.0

## Prossimi Sviluppi

- [ ] Supporto Whisper API (alternativa a Apple Speech)
- [ ] Persistenza conversazioni
- [ ] Voci TTS premium
- [ ] Modalita offline parziale
- [ ] Widget/Shortcut Siri

## License

Onde - Internal Use

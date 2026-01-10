# FreeRiver Flow - iPhone Voice-First App Research

**Data ricerca:** Gennaio 2026
**Obiettivo:** Sviluppare un'app iPhone voice-first con Whisper (STT), Claude API (elaborazione), e TTS per risposte vocali

---

## Indice

1. [Executive Summary](#executive-summary)
2. [Architettura Voice-First](#architettura-voice-first)
3. [Speech-to-Text con Whisper](#speech-to-text-con-whisper)
4. [Audio Recording con Expo](#audio-recording-con-expo)
5. [Integrazione Claude API](#integrazione-claude-api)
6. [Text-to-Speech Options](#text-to-speech-options)
7. [Architettura Consigliata](#architettura-consigliata)
8. [Dipendenze e Setup](#dipendenze-e-setup)
9. [Considerazioni Performance](#considerazioni-performance)
10. [Fonti](#fonti)

---

## Executive Summary

La costruzione di un'app voice-first per iPhone nel 2026 richiede l'integrazione di tre componenti principali:

| Componente | Soluzione Consigliata | Alternative |
|------------|----------------------|-------------|
| **STT** | whisper.rn (on-device) | expo-speech-recognition, OpenAI Whisper API |
| **LLM** | Claude API via backend proxy | Direct API (non supportato in RN) |
| **TTS** | ElevenLabs SDK / OpenAI TTS | react-native-tts, expo-speech |

**Nota critica:** L'SDK ufficiale di Anthropic (@anthropic-ai/sdk) non supporta React Native nativamente. Si consiglia un backend proxy per gestire le chiamate API e lo streaming.

---

## Architettura Voice-First

### Principi di Design

Le app voice-first nel 2026 non sono piu sperimentali ma essenziali. Gli utenti preferiscono parlare invece di digitare, specialmente in contesti come guida, cucina, o camminata.

**Best Practices:**

1. **Voice-First, Visual-Second**: L'app deve funzionare completamente tramite voce prima di aggiungere elementi visivi
2. **Dialogo Naturale**: Supportare sinonimi, accenti, e velocita diverse
3. **Risposte Concise**: Brevi, chiare, e actionable. Offrire riassunti con possibilita di richiedere dettagli
4. **Tolleranza Errori**: Gestire input incompleti o ambigui con grazia
5. **Latency < 200ms**: Cruciale per mantenere un flusso conversazionale naturale

### Apple iOS 26 e Voice-First

Apple sta trasformando la propria architettura verso voice-first con un sistema App Intents aggiornato che potenzia Siri. La transizione completa e prevista per primavera 2026.

---

## Speech-to-Text con Whisper

### Opzione 1: whisper.rn (Consigliata per On-Device)

**Repository:** [mybigday/whisper.rn](https://github.com/mybigday/whisper.rn)

Binding React Native di whisper.cpp per inferenza ad alte prestazioni del modello Whisper.

**Installazione:**
```bash
npm install whisper.rn
# oppure
yarn add whisper.rn
```

**Configurazione iOS (Podfile):**
```ruby
# Usa pre-built framework (default, piu veloce)
# oppure per build from source:
ENV['RNWHISPER_BUILD_FROM_SOURCE'] = '1'
```

**Info.plist (permessi microfono):**
```xml
<key>NSMicrophoneUsageDescription</key>
<string>L'app necessita accesso al microfono per la trascrizione vocale</string>
```

**Utilizzo base:**
```javascript
import { initWhisper } from 'whisper.rn';

// Inizializzazione
const whisperContext = await initWhisper({
  filePath: 'path/to/ggml-base.bin', // modello Whisper
});

// Trascrizione file audio
const { promise } = whisperContext.transcribe(audioFilePath, {
  language: 'it', // italiano
});
const result = await promise;
console.log(result.text);
```

**Trascrizione Realtime (nuovo RealtimeTranscriber):**
```javascript
import { initWhisper } from 'whisper.rn';

const whisperContext = await initWhisper({
  filePath: modelPath,
});

// Nota: transcribeRealtime e deprecato, usare RealtimeTranscriber
const transcriber = whisperContext.createRealtimeTranscriber({
  language: 'it',
  // Voice Activity Detection integrato
  // Auto-slicing per gestione memoria
});

transcriber.onTranscription((text) => {
  console.log('Trascrizione:', text);
});

await transcriber.start();
// ... dopo
await transcriber.stop();
```

**Performance Tips per iOS:**

1. **Modelli consigliati**: base o small per velocita, medium/large per accuratezza
2. **Extended Virtual Addressing**: Abilitare per modelli medium/large
3. **Audio Session**: Configurare correttamente per coesistenza con altre fonti audio

```javascript
import { AudioSessionIos } from 'whisper.rn';

// Configurare audio session per registrazione
AudioSessionIos.setCategory('PlayAndRecord', ['DefaultToSpeaker']);
```

### Opzione 2: expo-speech-recognition

**Repository:** [jamsch/expo-speech-recognition](https://github.com/jamsch/expo-speech-recognition)

Usa i motori nativi del device (Siri su iOS).

**Compatibilita (Luglio 2025):**
- iOS 17+: Basic, Continuous, On-Device
- Android 13+: Tutte le feature
- Android 12-: Solo Basic

```javascript
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

ExpoSpeechRecognitionModule.start({
  lang: 'it-IT',
  interimResults: true,
  recordingOptions: {
    persist: true, // Salva audio per uso successivo
  },
});
```

### Opzione 3: OpenAI Whisper API (Cloud)

Per trascrizione cloud-based con massima accuratezza.

```javascript
// Via backend proxy
const transcribe = async (audioBlob) => {
  const formData = new FormData();
  formData.append('file', audioBlob);
  formData.append('model', 'whisper-1');
  formData.append('language', 'it');

  const response = await fetch('https://your-backend.com/transcribe', {
    method: 'POST',
    body: formData,
  });

  return response.json();
};
```

### Confronto Opzioni STT

| Aspetto | whisper.rn | expo-speech-recognition | OpenAI Whisper API |
|---------|-----------|------------------------|-------------------|
| **Offline** | Si | Si (iOS 17+) | No |
| **Accuratezza** | Alta | Media-Alta | Molto Alta |
| **Latenza** | Bassa | Molto Bassa | Media (network) |
| **Multilingua** | Si | Si | Si |
| **Dimensione app** | +50-200MB | Minima | Minima |
| **Costo** | Gratuito | Gratuito | Pay-per-use |

---

## Audio Recording con Expo

### Requisiti Whisper

Whisper accetta audio a qualsiasi sample rate ma esegue resampling interno a 16kHz. Registrare direttamente a 16kHz e marginalmente piu veloce e risparmia spazio.

### Opzione 1: expo-audio (Nuovo SDK)

**Documentazione:** [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/)

expo-av e ora deprecato in favore di expo-audio.

```javascript
import { useAudioRecorder } from 'expo-audio';

function VoiceRecorder() {
  const audioRecorder = useAudioRecorder({
    audioSource: 'voice_recognition', // Ottimizzato per voce
  });

  const startRecording = async () => {
    await audioRecorder.record();
  };

  const stopRecording = async () => {
    await audioRecorder.stop();
    const uri = audioRecorder.uri;
    // Invia a Whisper per trascrizione
  };
}
```

### Opzione 2: expo-audio-stream (Consigliata per Whisper)

**Repository:** [mykin-ai/expo-audio-stream](https://github.com/mykin-ai/expo-audio-stream)

Progettato specificamente per speech recognition con output dual-stream (originale + 16kHz).

```bash
npm install @mykin-ai/expo-audio-stream
# oppure
npm install @siteed/expo-audio-stream
```

**Configurazione 16kHz:**
```javascript
import { useAudioStream } from '@mykin-ai/expo-audio-stream';

const { startRecording, stopRecording } = useAudioStream({
  sampleRate: 16000,  // Nativo Whisper
  channels: 1,        // Mono
  encoding: 'pcm_16bit',
  onAudioData: (audioBuffer) => {
    // Stream diretto a Whisper
  },
});
```

### Opzione 3: expo-two-way-audio

**Repository:** [speechmatics/expo-two-way-audio](https://github.com/speechmatics/expo-two-way-audio)

Audio bidirezionale con Echo Cancellation integrato.

- Input: PCM 16-bit, 1 canale, 16kHz
- Output: PCM 16-bit, 1 canale, 16kHz
- AEC (Acoustic Echo Cancelling) integrato

### Configurazione WAV per Whisper

Se si usa expo-av legacy:

```javascript
const recordingOptions = {
  android: {
    extension: '.wav',
    outputFormat: Audio.AndroidOutputFormat.DEFAULT,
    audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
  },
  ios: {
    extension: '.wav',
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};
```

---

## Integrazione Claude API

### Limitazione Critica

> **L'SDK ufficiale Anthropic (@anthropic-ai/sdk) non supporta React Native.**

Dalla documentazione npm: "React Native is not supported at this time."

### Soluzione: Backend Proxy

L'approccio consigliato e usare un backend (Node.js, Python, etc.) come proxy.

**Architettura:**
```
[React Native App] <--> [Backend Proxy] <--> [Claude API]
```

**Backend Node.js (esempio):**
```javascript
// server.js
import Anthropic from '@anthropic-ai/sdk';
import express from 'express';

const app = express();
const anthropic = new Anthropic();

app.post('/chat', async (req, res) => {
  const { messages } = req.body;

  // Streaming response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: messages,
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta') {
      res.write(`data: ${JSON.stringify(chunk.delta)}\n\n`);
    }
  }

  res.end();
});

app.listen(3000);
```

**Client React Native:**
```javascript
// hooks/useClaude.js
import { useState, useCallback } from 'react';

export function useClaude() {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (userMessage) => {
    setIsLoading(true);
    setResponse('');

    try {
      const res = await fetch('https://your-backend.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          const data = JSON.parse(line.slice(6));
          if (data.text) {
            setResponse(prev => prev + data.text);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { response, isLoading, sendMessage };
}
```

### Streaming con EventSource (SSE)

Per React Native, potrebbe essere necessario un polyfill per EventSource:

```bash
npm install react-native-sse
```

```javascript
import EventSource from 'react-native-sse';

const streamChat = (message) => {
  const es = new EventSource('https://your-backend.com/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  es.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    // Aggiorna UI con risposta incrementale
  });

  es.addEventListener('error', (error) => {
    console.error('SSE error:', error);
    es.close();
  });
};
```

### Alternativa: WebSocket

Per comunicazione bidirezionale continua:

```javascript
// React Native
const ws = new WebSocket('wss://your-backend.com/chat');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Aggiorna UI
};

ws.send(JSON.stringify({ message: transcribedText }));
```

---

## Text-to-Speech Options

### Opzione 1: ElevenLabs SDK (Consigliata per Qualita)

**Documentazione:** [ElevenLabs React Native SDK](https://elevenlabs.io/docs/agents-platform/libraries/react-native)

Voci AI di alta qualita con supporto multilingua.

**Installazione:**
```bash
npm install @elevenlabs/react-native @livekit/react-native @livekit/react-native-webrtc livekit-client
```

**Nota:** Richiede development build, non funziona con Expo Go.

**Setup base:**
```javascript
// App.js
import { ElevenLabsProvider } from '@elevenlabs/react-native';

export default function App() {
  return (
    <ElevenLabsProvider apiKey="your-api-key">
      <YourApp />
    </ElevenLabsProvider>
  );
}
```

**Uso semplice (TTS diretto):**
```javascript
// Per TTS semplice senza Agents SDK
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';

const speak = async (text) => {
  const cacheKey = `tts_${hashString(text)}.mp3`;
  const cachePath = `${RNFS.CachesDirectoryPath}/${cacheKey}`;

  // Check cache
  if (await RNFS.exists(cachePath)) {
    playAudio(cachePath);
    return;
  }

  // Fetch da ElevenLabs
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/voice-id', {
    method: 'POST',
    headers: {
      'xi-api-key': 'your-api-key',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
    }),
  });

  const audioBuffer = await response.arrayBuffer();
  await RNFS.writeFile(cachePath, arrayBufferToBase64(audioBuffer), 'base64');
  playAudio(cachePath);
};
```

### Opzione 2: OpenAI TTS API

Voci di alta qualita con streaming support.

```javascript
const speakWithOpenAI = async (text) => {
  const response = await fetch('https://your-backend.com/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: text,
      voice: 'alloy', // alloy, echo, fable, onyx, nova, shimmer
    }),
  });

  const audioBlob = await response.blob();
  // Usa expo-av o react-native-sound per riprodurre
};
```

**Backend per OpenAI TTS:**
```javascript
// server.js
import OpenAI from 'openai';

app.post('/tts', async (req, res) => {
  const { text, voice = 'alloy' } = req.body;

  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: voice,
    input: text,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  res.set('Content-Type', 'audio/mpeg');
  res.send(buffer);
});
```

### Opzione 3: react-native-tts (Offline, Gratuito)

**Repository:** [ak1394/react-native-tts](https://github.com/ak1394/react-native-tts)

Usa i motori TTS nativi del device.

```bash
npm install react-native-tts
```

```javascript
import Tts from 'react-native-tts';

// Configurazione
Tts.setDefaultLanguage('it-IT');
Tts.setDefaultRate(0.5);
Tts.setDefaultPitch(1.0);

// Parla
Tts.speak('Ciao, come posso aiutarti oggi?');

// Eventi
Tts.addEventListener('tts-start', () => console.log('Iniziato'));
Tts.addEventListener('tts-finish', () => console.log('Finito'));
Tts.addEventListener('tts-cancel', () => console.log('Cancellato'));
```

**Voci disponibili:**
- iOS: 38 voci Apple
- Android: 281 voci Google

### Opzione 4: expo-speech (Per progetti Expo)

**Documentazione:** [Expo Speech](https://docs.expo.dev/versions/latest/sdk/speech/)

```javascript
import * as Speech from 'expo-speech';

const speak = (text) => {
  Speech.speak(text, {
    language: 'it-IT',
    pitch: 1.0,
    rate: 0.9,
    onDone: () => console.log('Finito di parlare'),
  });
};

// Ferma
Speech.stop();
```

### Confronto TTS

| Opzione | Qualita | Offline | Costo | Setup |
|---------|---------|---------|-------|-------|
| ElevenLabs | Eccellente | No | $$$ | Medio |
| OpenAI TTS | Ottima | No | $$ | Medio |
| react-native-tts | Buona | Si | Gratis | Facile |
| expo-speech | Buona | Si | Gratis | Facile |

---

## Architettura Consigliata

### Stack Completo

```
+------------------+     +------------------+     +------------------+
|   React Native   |     |   Backend API    |     |   External APIs  |
|     (Expo)       |     |   (Node.js)      |     |                  |
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
| [expo-audio-     |---->| /transcribe      |---->| OpenAI Whisper   |
|  stream 16kHz]   |     | (opzionale)      |     | (se cloud STT)   |
|                  |     |                  |     |                  |
| [whisper.rn]     |     | /chat            |---->| Claude API       |
| (on-device STT)  |     | (streaming SSE)  |     | (streaming)      |
|                  |     |                  |     |                  |
| [ElevenLabs SDK] |<----| /tts             |---->| ElevenLabs API   |
| o [react-native- |     |                  |     | o OpenAI TTS     |
|    tts]          |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
```

### Flusso Conversazionale

```
1. UTENTE parla
   |
   v
2. expo-audio-stream cattura audio (16kHz PCM)
   |
   v
3. whisper.rn trascrive on-device
   |
   v
4. Testo inviato a backend /chat
   |
   v
5. Backend chiama Claude API (streaming)
   |
   v
6. Risposta streamed a React Native via SSE
   |
   v
7. Testo passato a TTS (ElevenLabs/react-native-tts)
   |
   v
8. UTENTE ascolta risposta
```

### Componente React Principale

```javascript
// screens/VoiceChat.js
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAudioStream } from '@mykin-ai/expo-audio-stream';
import { initWhisper } from 'whisper.rn';
import Tts from 'react-native-tts';

export default function VoiceChat() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const whisperRef = useRef(null);

  // Inizializza Whisper
  useEffect(() => {
    (async () => {
      whisperRef.current = await initWhisper({
        filePath: require('../assets/models/ggml-base.bin'),
      });
    })();
  }, []);

  // Audio stream config
  const { startRecording, stopRecording } = useAudioStream({
    sampleRate: 16000,
    channels: 1,
  });

  const handlePress = async () => {
    if (isListening) {
      // Stop e trascrivi
      const audioUri = await stopRecording();
      setIsListening(false);

      // Trascrivi con Whisper
      const { promise } = whisperRef.current.transcribe(audioUri, {
        language: 'it',
      });
      const result = await promise;
      setTranscript(result.text);

      // Invia a Claude
      await sendToClaudeAndSpeak(result.text);
    } else {
      // Inizia registrazione
      await startRecording();
      setIsListening(true);
      setTranscript('');
      setResponse('');
    }
  };

  const sendToClaudeAndSpeak = async (text) => {
    // Chiama backend
    const res = await fetch('https://your-backend.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    setResponse(data.response);

    // TTS
    Tts.speak(data.response);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.transcript}>{transcript}</Text>
      <Text style={styles.response}>{response}</Text>

      <TouchableOpacity
        style={[styles.button, isListening && styles.buttonActive]}
        onPress={handlePress}
      >
        <Text style={styles.buttonText}>
          {isListening ? 'Fermati' : 'Parla'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  transcript: { fontSize: 18, marginBottom: 20 },
  response: { fontSize: 16, color: '#666', marginBottom: 40 },
  button: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 50,
    alignItems: 'center',
  },
  buttonActive: { backgroundColor: '#FF3B30' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
```

---

## Dipendenze e Setup

### package.json

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-audio": "~1.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0",

    "whisper.rn": "^0.4.0",
    "@mykin-ai/expo-audio-stream": "^1.0.0",

    "react-native-tts": "^4.1.0",

    "react-native-sse": "^1.2.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0"
  }
}
```

### app.json (Expo)

```json
{
  "expo": {
    "plugins": [
      [
        "expo-audio",
        {
          "microphonePermission": "L'app necessita accesso al microfono per la trascrizione vocale."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["audio"],
        "NSMicrophoneUsageDescription": "Necessario per registrazione vocale",
        "NSSpeechRecognitionUsageDescription": "Necessario per riconoscimento vocale"
      }
    }
  }
}
```

### Modelli Whisper

Scaricare modelli da [Hugging Face ggerganov/whisper.cpp](https://huggingface.co/ggerganov/whisper.cpp):

| Modello | Dimensione | Qualita | Velocita |
|---------|------------|---------|----------|
| tiny | ~75MB | Bassa | Molto veloce |
| base | ~142MB | Media | Veloce |
| small | ~466MB | Buona | Media |
| medium | ~1.5GB | Ottima | Lenta |

**Consiglio:** Usare `base` o `small` per bilanciare qualita/performance.

---

## Considerazioni Performance

### Latenza End-to-End

Target: < 2 secondi per ciclo completo (utente parla -> utente sente risposta)

| Fase | Target | Note |
|------|--------|------|
| Recording stop | < 100ms | - |
| Whisper transcription | < 500ms | Modello base, audio < 10s |
| Network to backend | < 100ms | Server geograficamente vicino |
| Claude API TTFB | < 300ms | Streaming |
| TTS generation | < 200ms | Con caching |
| Audio playback start | < 100ms | - |

### Ottimizzazioni

1. **Whisper on-device**: Elimina latenza network per STT
2. **Streaming Claude**: Inizia TTS appena arriva prima frase
3. **TTS caching**: Cache risposte comuni
4. **Sentence-level TTS**: Non aspettare risposta completa

```javascript
// Esempio: TTS incrementale per frase
const streamAndSpeak = async (claudeStream) => {
  let buffer = '';

  for await (const chunk of claudeStream) {
    buffer += chunk.text;

    // Cerca fine frase
    const sentenceEnd = buffer.match(/[.!?]\s/);
    if (sentenceEnd) {
      const sentence = buffer.slice(0, sentenceEnd.index + 1);
      buffer = buffer.slice(sentenceEnd.index + 2);

      // Parla frase mentre continua streaming
      await speakAsync(sentence);
    }
  }

  // Parla resto
  if (buffer.trim()) {
    await speakAsync(buffer);
  }
};
```

### Memory Management (iOS)

Per modelli Whisper large:
1. Abilitare Extended Virtual Addressing in Xcode
2. Rilasciare contesto Whisper quando non in uso
3. Monitorare memory warnings

```javascript
import { useEffect } from 'react';
import { AppState } from 'react-native';

useEffect(() => {
  const subscription = AppState.addEventListener('memoryWarning', () => {
    // Rilascia risorse non critiche
    whisperContext?.release();
  });

  return () => subscription.remove();
}, []);
```

---

## Fonti

### Speech-to-Text (Whisper)
- [whisper.rn GitHub](https://github.com/mybigday/whisper.rn) - React Native binding di whisper.cpp
- [LogRocket - Using Whisper for speech recognition in React Native](https://blog.logrocket.com/using-whisper-speech-recognition-react-native/)
- [React Native ExecuTorch - useSpeechToText](https://docs.swmansion.com/react-native-executorch/docs/0.4.x/natural-language-processing/useSpeechToText)
- [Picovoice - React Native Speech Recognition 2025](https://picovoice.ai/blog/react-native-speech-recognition/)

### Audio Recording (Expo)
- [expo-speech-recognition GitHub](https://github.com/jamsch/expo-speech-recognition)
- [Expo Audio Documentation](https://docs.expo.dev/versions/latest/sdk/audio/)
- [expo-audio-stream GitHub](https://github.com/mykin-ai/expo-audio-stream)
- [expo-two-way-audio GitHub](https://github.com/speechmatics/expo-two-way-audio)

### Claude API
- [@anthropic-ai/sdk npm](https://www.npmjs.com/package/@anthropic-ai/sdk)
- [Claude API Integration Guide 2025](https://collabnix.com/claude-api-integration-guide-2025-complete-developer-tutorial-with-code-examples/)
- [Design+Code - Build a React Native app with Claude AI](https://designcode.io/react-native-ai/)

### Text-to-Speech
- [ElevenLabs React Native SDK](https://elevenlabs.io/docs/agents-platform/libraries/react-native)
- [react-native-tts npm](https://www.npmjs.com/package/react-native-tts)
- [Expo Speech Documentation](https://docs.expo.dev/versions/latest/sdk/speech/)
- [Callstack - On-Device TTS on Apple Devices](https://www.callstack.com/blog/on-device-text-to-speech-on-apple-devices-with-ai-sdk)

### Voice-First Architecture
- [ThinkDebug - Voice-First Apps Future 2025](https://thinkdebug.com/from-swiping-to-speaking-why-voice-first-apps-are-the-future-in-2025/)
- [Axius Software - Voice-First Mobile Apps](https://axiussoftware.com/blog-category/voice-first-mobile-apps-designing-beyond-touchscreens/)
- [Medium - Modern iOS Architecture 2025](https://medium.com/@csmax/the-ultimate-guide-to-modern-ios-architecture-in-2025-9f0d5fdc892f)

---

*Report generato per FreeRiver Flow - Gennaio 2026*

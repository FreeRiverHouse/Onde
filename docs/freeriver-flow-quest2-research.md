# FreeRiver Flow - Quest 2 VR App Research Report

**Data:** 10 Gennaio 2026
**Obiettivo:** Sviluppare un'app VR per Quest 2 con voice input, personaggi 3D parlanti e connessione a Claude API

---

## Indice

1. [Unity vs Godot per Quest 2](#1-unity-vs-godot-per-quest-2)
2. [Meta XR SDK Voice Features](#2-meta-xr-sdk-voice-features)
3. [Personaggi 3D Parlanti Low-Poly](#3-personaggi-3d-parlanti-low-poly)
4. [Network Requests da Quest 2](#4-network-requests-da-quest-2)
5. [Integrazione Claude API](#5-integrazione-claude-api)
6. [Architettura Consigliata](#6-architettura-consigliata)
7. [Risorse e Link Utili](#7-risorse-e-link-utili)

---

## 1. Unity vs Godot per Quest 2

### Raccomandazione: Unity

Per lo sviluppo di un'app VR Quest 2 con le caratteristiche richieste, **Unity e la scelta migliore** nel 2026.

### Unity - Vantaggi

| Aspetto | Dettaglio |
|---------|-----------|
| **Supporto VR Nativo** | Ottimizzato per Meta Quest con build size ridotte e performance mobile eccellenti |
| **Meta XR SDK** | Supporto day-one per tutti i nuovi headset Meta |
| **Asset Ecosystem** | Oltre 70,000 asset, tool e plugin disponibili |
| **Voice SDK** | Integrazione nativa con Wit.ai per voice recognition |
| **XR Interaction Toolkit** | Accelera lo sviluppo VR con componenti pronti all'uso |
| **Documentazione** | Ampia documentazione ufficiale e community attiva |

### Unity - Svantaggi

- Licenza a pagamento sopra i $100K di revenue annuali
- Maggiore complessita iniziale rispetto a Godot
- Editor piu pesante

### Godot - Stato Attuale (2026)

Godot ha fatto progressi significativi nel supporto XR:

- **Godot 4.5** (Settembre 2025): DirectX 12 + OpenXR, foveated rendering su Vulkan Android, Application SpaceWarp per Quest
- **Godot 4.6**: Supporto OpenXR 1.1, spatial anchors, plane tracking
- **Editor nativo Quest**: ~18,500 installazioni, ~2,000 utenti attivi mensili

**Limitazioni Godot:**
- Performance piu limitate su hardware mobile (XR2 chipset)
- VRM e avatar system meno maturi
- Nessun equivalente del Meta Voice SDK
- Export pipeline piu complessa (richiede JDK 17 specifico)
- Community e risorse per VR piu piccole

### Verdetto

**Unity** per questo progetto perche:
1. Meta Voice SDK integrato nativamente
2. Migliore supporto per lip-sync e avatar
3. Networking piu maturo per API calls
4. Piu risorse e tutorial disponibili

---

## 2. Meta XR SDK Voice Features

### Overview

Il **Meta Voice SDK** e alimentato da **Wit.ai** (NLU - Natural Language Understanding) ed e compatibile con:
- Meta Quest headsets
- Dispositivi mobile
- Piattaforme third-party

### Caratteristiche Principali

| Feature | Descrizione |
|---------|-------------|
| **Cross-platform** | Integra una volta, funziona su Quest e altri device AR/VR |
| **Low latency** | Trascrizione real-time di alta qualita |
| **Wake word detection** | Attivazione vocale personalizzabile |
| **Dynamic entities** | Richieste vocali personalizzabili basate su stato utente/app |
| **Multi-lingua** | Inglese + preview di 12 altre lingue |

### Setup in Unity

#### 1. Installazione SDK

```
Meta > Voice SDK (pacchetto separato)
oppure
Meta XR All-in-One SDK
```

#### 2. Configurazione Wit.ai

1. Vai su [wit.ai](https://wit.ai) e accedi con account Meta
2. Crea nuova app
3. Nella tab "Understanding" definisci Intent (es. `wake_word`)
4. Vai su Management > Settings per ottenere il Server Access Token

#### 3. Setup Unity

```
1. Meta > Voice SDK > Get Started
2. Incolla Server Access Token
3. Salva configuration file
4. Assets > Create > Voice SDK > add App Voice Experience to scene
```

#### 4. Configurazione Android (CRITICO)

```csharp
// Project Settings > Player > Other Settings
Application Entry Point: Activity (NON GameActivity!)

// Project Settings > Player > Publishing Settings
Custom Main Manifest: ENABLED
// File: Assets/Plugins/Android/AndroidManifest.xml
```

### Componente Principale: AppVoiceExperience

Il componente `AppVoiceExperience`:
- Contiene riferimento a Wit.ai App Config
- Invia dati audio a Wit.ai per elaborazione
- Risponde con Unity Events appropriati

### Text-to-Speech (TTS)

Dal Voice SDK v42, TTS e integrato:

```csharp
// Componenti principali
TTSService prefab   // Gestisce tutte le impostazioni TTS
TTSSpeaker script   // Per ogni location dove riprodurre TTS
```

**Opzioni caching per ridurre latenza:**
- **Streaming**: Audio in tempo reale (richiede connessione)
- **Disk Cache**: File pre-caricati (offline, bassa latenza)

### Progetto di Riferimento: Whisperer

Repository ufficiale Meta: [voicesdk-samples-whisperer](https://github.com/oculus-samples/voicesdk-samples-whisperer)

---

## 3. Personaggi 3D Parlanti Low-Poly

### Soluzioni Lip-Sync per Unity

#### Opzione 1: Oculus LipSync (Consigliato)

**15 Visemi supportati:**
```
sil, PP, FF, TH, DD, kk, CH, SS, nn, RR, aa, E, ih, oh, ou
```

**Caratteristiche:**
- Analisi audio input stream (microfono o file)
- Laughter detection (v1.30.0+)
- Ottimizzato per Quest

**Setup:**
```csharp
// Aggiungi OVRLipSyncContext al personaggio
// Configura SkinnedMeshRenderer con blendshapes per ogni visema
```

#### Opzione 2: uLipSync (Open Source)

Repository: [hecomi/uLipSync](https://github.com/hecomi/uLipSync)

**Vantaggi:**
- MFCC-based analysis
- Job System + Burst Compiler per performance
- Supporto VRM nativo
- Gratuito e open source

**Setup:**
```csharp
// Componenti
uLipSync              // Analisi audio
Profile               // Parametri fonemi
uLipSyncBlendShape    // Muove blendshapes

// Mapping fonemi
A, I, U, E, O, N, "-" (noise)
```

**Nota per Ready Player Me:**
```csharp
// I blendshapes RPM usano valori 0-1, non 0-100
// Necessario normalizzare i pesi
```

### Avatar Low-Poly per VR

#### Ready Player Me

**Configurazione ottimizzata Quest 2:**

| Parametro | Valore Consigliato |
|-----------|-------------------|
| Mesh LOD | Low (25%) o Medium (50%) |
| Texture Atlas | 512x512 o 1024x1024 |
| Max Triangles | < 20,000 (limite Quest) |
| Draw Calls | Max 2 (con texture atlas) |

**Blendshapes disponibili:**
- `base/visems_15`: Head 1.2 e Head 2.0
- `base/visems_17`: Animated Face

**Ottimizzazioni:**
```csharp
// Texture Atlas - merge meshes in max 2 draw calls
// Mesh Opt Compression - richiede com.unity.meshopt.decompress

// Player avatar - usa mesh-swap invece di ricreare
// Head meshes su layer separato (escludi da MainCamera per evitare clipping)
```

#### Alternative Low-Poly

- **Sail Character Pack**: 200-1400 poligoni, stile toon
- **Custom low-poly**: 500-2000 triangoli con 5-7 blendshapes base

### Pipeline Consigliata

```
1. Avatar Low-Poly (Ready Player Me LOD Low / Custom)
2. Blendshapes: 15 visemi standard
3. uLipSync o Oculus LipSync per analisi audio
4. TTS da Meta Voice SDK o cloud service
5. Lip-sync blendshapes driven da audio TTS
```

---

## 4. Network Requests da Quest 2

### Problema Noto

Le web request falliscono **solo su Quest 2** anche se funzionano:
- In Unity Editor
- Su Desktop builds
- Su Android builds non-VR

**Errore tipico:** `UnityWebRequest.Result.ConnectionError` - "connection failed"

### Causa

Il **Unity OpenXR plugin per Meta Quest** modifica le impostazioni e rimuove i permessi internet dal manifest.

### Soluzioni

#### Soluzione 1: Custom Android Manifest

```xml
<!-- Assets/Plugins/Android/AndroidManifest.xml -->
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- PERMESSI INTERNET - CRITICI -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application>
        <!-- ... resto configurazione ... -->
    </application>
</manifest>
```

#### Soluzione 2: Post-Gradle Callback Script

```csharp
// Editor/PostGradleCallback.cs
using UnityEditor.Android;

public class PostGradleCallback : IPostGenerateGradleAndroidProject
{
    public int callbackOrder => 999;

    public void OnPostGenerateGradleAndroidProject(string path)
    {
        // Modifica manifest per aggiungere permessi internet
        var manifestPath = Path.Combine(path, "src/main/AndroidManifest.xml");
        // ... logica per aggiungere permessi ...
    }
}
```

#### Soluzione 3: OpenXR Feature Settings

Nelle impostazioni OpenXR di Meta Quest, verificare che l'opzione per rimuovere permessi internet sia disabilitata.

### Best Practices Networking

```csharp
using UnityEngine.Networking;
using System.Collections;

public class ClaudeAPIClient : MonoBehaviour
{
    private const string API_URL = "https://api.anthropic.com/v1/messages";

    public IEnumerator SendMessage(string message, System.Action<string> callback)
    {
        var requestBody = new {
            model = "claude-sonnet-4-20250514",
            max_tokens = 1024,
            messages = new[] {
                new { role = "user", content = message }
            }
        };

        string jsonBody = JsonUtility.ToJson(requestBody);

        using (UnityWebRequest request = new UnityWebRequest(API_URL, "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonBody);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();

            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("x-api-key", "YOUR_API_KEY");
            request.SetRequestHeader("anthropic-version", "2023-06-01");

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                callback(request.downloadHandler.text);
            }
            else
            {
                Debug.LogError($"Error: {request.error}");
            }
        }
    }
}
```

### Libreria Alternativa: RestClient

Repository: [proyecto26/RestClient](https://github.com/proyecto26/RestClient)

**Vantaggi:**
- Promise-based (evita callback hell)
- Supporta GET, POST, PUT, DELETE, HEAD, PATCH
- Sintassi piu pulita delle coroutines

---

## 5. Integrazione Claude API

### Opzione 1: Claude-Unity Package

Repository: [yagizeraslan/Claude-Unity](https://github.com/yagizeraslan/Claude-Unity)

**Caratteristiche:**
- Integrazione diretta con Claude API
- Supporto streaming SSE con `stream: true`
- Usa `DownloadHandlerScript` per chunked responses
- Update UI per-token (no typewriter simulato)

**Limitazioni:**
- WebGL e iOS possono avere limitazioni per SSE live streams
- Funziona meglio su Standalone e Editor

### Opzione 2: LLM API Connector (Asset Store)

Disponibile su Unity Asset Store, supporta:
- Claude
- GPT
- Gemini

### Implementazione Streaming

```csharp
// Formato eventi SSE Claude
event: message_start
event: content_block_start
event: content_block_delta  // Token incrementali
event: content_block_stop
event: message_delta
event: message_stop
```

### Architettura API Call

```
[Voice Input] -> [Wit.ai STT] -> [Claude API] -> [Response Text]
                                                        |
                                                        v
                                        [TTS] -> [Audio] -> [Lip-Sync]
```

---

## 6. Architettura Consigliata

### Stack Tecnologico

```
Engine:         Unity 2022.3 LTS o 2023.x
XR SDK:         Meta XR All-in-One SDK
Voice:          Meta Voice SDK (Wit.ai)
Networking:     UnityWebRequest + Custom Manifest
Avatar:         Ready Player Me (LOD Low) o Custom Low-Poly
Lip-Sync:       Oculus LipSync o uLipSync
TTS:            Meta Voice SDK TTS o Azure/AWS
LLM:            Claude API (claude-sonnet-4-20250514)
```

### Componenti Principali

```
FreeRiverFlowQuest2/
├── Scripts/
│   ├── VoiceInput/
│   │   ├── VoiceRecognitionManager.cs
│   │   └── WitAiHandler.cs
│   ├── AI/
│   │   ├── ClaudeAPIClient.cs
│   │   ├── ConversationManager.cs
│   │   └── ResponseParser.cs
│   ├── Avatar/
│   │   ├── AvatarController.cs
│   │   ├── LipSyncController.cs
│   │   └── EmotionController.cs
│   └── Audio/
│       ├── TTSManager.cs
│       └── AudioPlaybackController.cs
├── Prefabs/
│   ├── TalkingCharacter.prefab
│   └── VoiceExperience.prefab
└── Plugins/
    └── Android/
        └── AndroidManifest.xml
```

### Flow Conversazionale

```
1. Utente parla (Voice Input)
           |
           v
2. Wit.ai processa audio -> Intent/Transcript
           |
           v
3. Transcript inviato a Claude API
           |
           v
4. Risposta Claude ricevuta
           |
           v
5. Testo inviato a TTS -> Audio generato
           |
           v
6. Audio riprodotto + Lip-Sync attivo
           |
           v
7. Avatar parla con movimenti labiali sincronizzati
```

### Performance Budget Quest 2

| Risorsa | Budget |
|---------|--------|
| Triangoli totali | < 100,000 |
| Triangoli avatar | < 20,000 |
| Draw calls | < 100 |
| Texture memory | < 256MB |
| Frame rate target | 72 FPS |

---

## 7. Risorse e Link Utili

### Documentazione Ufficiale

- [Meta Voice SDK Overview](https://developers.meta.com/horizon/documentation/unity/voice-sdk-overview/)
- [Oculus LipSync for Unity](https://developers.meta.com/horizon/documentation/unity/audio-ovrlipsync-unity/)
- [Meta Voice SDK TTS Overview](https://developers.meta.com/horizon/documentation/unity/voice-sdk-tts-overview/)
- [Ready Player Me Unity Docs](https://docs.readyplayer.me/ready-player-me/integration-guides/unity)
- [Claude API Streaming](https://platform.claude.com/docs/en/build-with-claude/streaming)

### Repository GitHub

- [voicesdk-samples-whisperer](https://github.com/oculus-samples/voicesdk-samples-whisperer) - Esempio ufficiale Meta
- [Claude-Unity](https://github.com/yagizeraslan/Claude-Unity) - Integrazione Claude non ufficiale
- [uLipSync](https://github.com/hecomi/uLipSync) - Lip-sync open source
- [RestClient Unity](https://github.com/proyecto26/RestClient) - HTTP client Promise-based

### Tutorial

- [Meta Voice SDK Setup Tutorial](https://blog.learnxr.io/extended-reality/unity-meta-voice-sdk)
- [Wake Word Detection & STT](https://blackwhale.dev/use-metas-voice-sdk-for-wake-word-detection-speech-to-text-stt/)
- [Ready Player Me Getting Started](https://readyplayer.me/blog/getting-started-with-ready-player-me-integration-in-unity)

### Asset Store

- [LLM API Connector](https://assetstore.unity.com/packages/tools/generative-ai/llm-api-connector-claude-gpt-gemini-313694) - Claude, GPT, Gemini

---

## Conclusioni

Per sviluppare FreeRiver Flow su Quest 2 con le caratteristiche richieste:

1. **Unity** e la scelta migliore per maturita VR e integrazione Voice SDK
2. **Meta Voice SDK** fornisce STT e TTS out-of-the-box con Wit.ai
3. **Ready Player Me LOD Low** o avatar custom low-poly con < 20K triangoli
4. **Oculus LipSync** o **uLipSync** per sincronizzazione labiale
5. **Custom Android Manifest** obbligatorio per networking su Quest
6. **Claude API** integrabile via UnityWebRequest o package dedicato

### Prossimi Passi

1. Setup progetto Unity con Meta XR SDK
2. Configurare Wit.ai app e Voice SDK
3. Implementare prototipo voice input
4. Integrare Claude API con manifest corretto
5. Creare/importare avatar low-poly con blendshapes
6. Implementare lip-sync con TTS
7. Testing su device Quest 2

---

*Report generato il 10 Gennaio 2026*

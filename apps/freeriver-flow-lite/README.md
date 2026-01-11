# FreeRiver Flow Lite

Ultra-minimal voice control for Claude Code on Mac.

## What is this?

Flow Lite is a super streamlined iPhone app that lets you control Claude Code (or Windsurf) running on your Mac using only your voice.

```
iPhone (this app) → WebSocket → Mac Server → Claude Code CLI
```

## Features

- **One button** - Hold to talk, release to send
- **Zero agents** - Just you and Claude Code
- **Voice in, voice out** - Full TTS support
- **Ultra minimal UI** - No distractions

## Setup

### 1. Start the Mac Server

```bash
cd /Users/mattia/Projects/Onde/apps/freeriver-flow/server
npm install
npm start
```

The server runs on `ws://localhost:3847`

### 2. Find your Mac's IP

```bash
ipconfig getifaddr en0
```

Example: `192.168.1.100`

### 3. Configure the app

Edit `services/config.ts`:

```typescript
export const CONFIG = {
  serverUrl: 'ws://192.168.1.100:3847', // Your Mac's IP
};
```

### 4. Run the app

```bash
npm install
npm start
```

Scan the QR code with Expo Go on your iPhone.

## Requirements

- Mac with Claude Code installed
- OpenAI API key (for Whisper transcription)
- iPhone on the same WiFi network

## Troubleshooting

### "Disconnected"

1. Make sure the Mac server is running
2. Check your Mac's IP is correct in config.ts
3. Both devices must be on the same WiFi

### "Permesso microfono negato"

Go to Settings → Privacy → Microphone and enable for Expo Go.

### No audio response

The Mac server uses `say` command for TTS. Make sure your Mac's speakers work.

## Architecture

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│                 │  ←────────────→    │                 │
│   iPhone App    │                    │   Mac Server    │
│   (Flow Lite)   │                    │  (Node.js)      │
│                 │                    │                 │
└─────────────────┘                    └────────┬────────┘
                                                │
                                                │ spawn
                                                ↓
                                       ┌─────────────────┐
                                       │                 │
                                       │  Claude Code    │
                                       │  (CLI)          │
                                       │                 │
                                       └─────────────────┘
```

## License

MIT - FreeRiver House

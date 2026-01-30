# TOOLS.md - Local Notes

## ⛔⛔⛔ REGOLA ASSOLUTA ⛔⛔⛔
## MAI USARE BROWSER PER POLYMARKET!!!
## POLYMARKET = SOLO PHONE MIRROR!!!
## ⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:
- Camera names and locations
- SSH hosts and aliases  
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras
- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH
- home-server → 192.168.1.100, user: admin

### TTS
- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## 🖥️ GPU Setup - Radeon 7090TX

**Hardware:** Radeon 7090TX su Mac M1 via driver TinyGrad
**VRAM:** 16GB
**Performance:** Più potente di M4 Pro, molto più di M1

### Capacità confermate:
- ✅ LLaMA 3 8B inference (~16GB, traduce benissimo)
- ✅ Batch processing immagini
- 🎯 Video processing (da sfruttare!)
- 🎯 Code generation locale
- 🎯 Traduzioni batch

### Come usare:
Backend TinyGrad per tutto ciò che richiede GPU pesante.
**DIMENSIONARE I TASK SU QUESTA SCHEDA** — non limitarsi a CPU/M1!

---

## 🌍 Traduzioni Locali

### ⚠️ REGOLA: MAI M1! Solo Radeon o M4

| Modello | Hardware | Funziona? | Note |
|---------|----------|-----------|------|
| GPT-2 | Radeon/TinyGrad | ❌ | Ripete invece di tradurre |
| ONNX opus-mt | Radeon/TinyGrad | ❌ | Problemi shape tensor |
| Helsinki-NLP opus-mt | CPU (M1) | ✅ | Lento ma funziona |
| **LLaMA 3 8B** | **Radeon/TinyGrad** | ✅ | **BEST** - ~16GB, traduce benissimo |

### Setup LLaMA 3 8B su Radeon
- Modello: `TriAiExperiments/SFR-Iterative-DPO-LLaMA-3-8B-R`
- Download: ~10 min (~16GB)
- Backend: TinyGrad

---

## 🎤 Voice Transcription
- **Script**: `scripts/transcribe-voice.sh <audio_file> [language]`
- **Default language**: Italian (it)
- **Engine**: OpenAI Whisper (local, via Homebrew)
- **Models**: tiny (fast), small (balanced), medium (accurate)

### Usage
```bash
# Transcribe Italian voice message
./scripts/transcribe-voice.sh /path/to/audio.ogg

# Transcribe English
./scripts/transcribe-voice.sh /path/to/audio.ogg en
```

**ALWAYS transcribe voice messages immediately** - don't ask user to repeat!

---

## 💰 Trading Wallet
- **Address**: `0x0e7c2d05BaD15CD2A27f8fB0FCdDF9f10Cf1d0C0`
- **Chain**: Arbitrum One
- **Private key**: `~/.clawdbot/.env.trading` (POLY_PRIVATE_KEY)

### GMX v2 Contracts (Arbitrum)
- Router: `0x7452c558d45f8afC8c83dAe62C3f8A5BE19c71f6`
- ExchangeRouter: `0x7C68C7866A64FA2160F78EEaE12217FFbf871fa8`
- OrderVault: `0x31eF83a530Fde1B38EE9A18093A333D8Bbbc40D5`
- USDC: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`
- BTC-USDC Market: `0x47c031236e19d024b42f8AE6780E44A573170703`

### Trading Scripts
- `scripts/gmx-trader.py` - Main trading bot
- `/tmp/gmx-direct-trade.js` - Direct contract interaction

### ⚠️ LEZIONI APPRESE
1. **Express vs Classic mode**: Classic usa ETH per gas, Express usa USDC
2. **Execution fee**: GMX richiede ~0.0001 ETH minimo per keeper
3. **Mai transfer diretto a vault** - usa sempre Router.sendTokens()
4. **Verifica gas PRIMA di operazioni multi-step!**

---

Add whatever helps you do your job. This is your cheat sheet.

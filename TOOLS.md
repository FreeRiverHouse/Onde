# TOOLS.md - Local Notes

## ⛔⛔⛔ REGOLA ASSOLUTA ⛔⛔⛔
## MAI USARE BROWSER PER POLYMARKET!!!
## POLYMARKET = SOLO PHONE MIRROR!!!
## ⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔

## 🤖 DIVISIONE HARDWARE AGENTI

| Agente | Hardware | GPU | Note |
|--------|----------|-----|------|
| **Clawdinho (me)** | M1 | Radeon 7900 XTX (✅ FUNZIONA!) | Via Razer Core X V2 eGPU |
| **Onde-bot/Ondinho** | M4 Pro | Nessuna esterna | Standalone, più potente |

**Stato:** Radeon 7900 XTX FUNZIONA con TinyGrad su macOS! Richiede TinyGPU.app + porta TB corretta.

---

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

## 🖥️ GPU Setup - Radeon 7900 XTX

**Hardware:** Radeon 7900 XTX su Mac M1 via Razer Core X V2 eGPU
**VRAM:** 24GB
**Status:** ✅ FUNZIONANTE CON TINYGRAD

### Requisiti per funzionare
1. **TinyGPU.app** deve essere aperta (crea device USB virtuale)
2. **eGPU** collegata alla **porta Thunderbolt corretta** (Port 2, Receptacle 2)
3. **Variabili**: `AMD=1 AMD_LLVM=1`

### Comandi che FUNZIONANO
```bash
cd ~/Projects/tinygrad-fix

# Test base
AMD=1 /opt/homebrew/bin/python3.11 -c "from tinygrad import Device; print(Device['AMD'])"

# GPT-2 (~3.6 tok/s)
PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 examples/gpt2.py --model_size gpt2 --prompt "Hello" --count 20

# GPT-2 XL (1.5B)
PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 examples/gpt2.py --model_size gpt2-xl --prompt "Hello" --count 30
```

### Capacità VERIFICATE
- ✅ GPT-2 inference (~3.6 tok/s)
- ✅ GPT-2 XL (1.5B)
- ✅ LLaMA 3.1 8B (su SSD esterno)

### ⚠️ PROCEDURE COMPLETE
**LEGGI SEMPRE:** `tools/RADEON-TINYGRAD-PROCEDURES.md`
**Modelli su SSD:** `/Volumes/DATI-SSD/llm-models/`
- `Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf` (4.9 GB)
- `tokenizer.model`

**NON reinventare la ruota!** Tutto è già documentato!

### ⚠️ PROCEDURA DI VERIFICA (PRIMA di dire "non funziona")
1. `system_profiler SPThunderboltDataType | grep -A5 "Device Name"` → deve mostrare Core X V2
2. `system_profiler SPDisplaysDataType | grep -i "vendor\|AMD"` → deve mostrare AMD
3. `ps aux | grep -i tinygpu | grep -v grep` → TinyGPU.app deve girare
4. Test finale con AMD=1

**Il 99% dei problemi = cavo nella porta sbagliata o TinyGPU.app non aperta!**

---

## 🌍 Traduzioni Locali

### Stato attuale (2026-01-30):
GPU Radeon FUNZIONANTE! Opzioni disponibili:

| Modello | Hardware | Funziona? | Note |
|---------|----------|-----------|------|
| LLaMA 3.1 8B | Radeon 7900 XTX | ✅ | Via TinyGrad, richiede TinyGPU.app |
| GPT-2/XL | Radeon 7900 XTX | ✅ | ~3.6 tok/s |
| Helsinki-NLP opus-mt | CPU (M1) | ✅ | Fallback se eGPU non disponibile |
| Claude API | Cloud | ✅ | Best quality, costs $ |
| M4 Pro (Ondinho) | Apple Silicon | ✅ | Via sessions_send |

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

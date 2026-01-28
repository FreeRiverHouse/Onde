# MEMORY.md

## 🚨 REGOLA #1 — NON DIMENTICARE MAI
**SEMPRE LEGGERE `CLAUDE.md` PRIMA DI QUALSIASI OPERAZIONE!**
- Deploy? → CLAUDE.md
- Procedure? → CLAUDE.md
- Credenziali? → CLAUDE.md
- NON INVENTARE. LEGGI PRIMA.

## ⛔ REGOLE CRITICHE - NON VIOLARE MAI
1. **MAI BROWSER PER POLYMARKET** - Solo phone mirror!
2. Mai cancellare file/progetti senza chiedere
3. Non insistere per farlo andare a dormire — Memoria a Lungo Termine

*Questo file è la mia memoria persistente. Lo aggiorno attivamente durante le conversazioni.*

---

## 🧠 Chi È Mattia

- **Nome**: Mattia P (alias @magmatic__)
- **Ruolo**: Founder FreeRiverHouse / Onde
- **Location**: Los Angeles
- **Contatti**: Telegram (id:7505631979), WhatsApp (+16468123630)
- **Timezone**: America/Los_Angeles (PST)
- **Lingua preferita**: Italiano 🇮🇹

---

## ⚠️ REGOLE AUREE (NON VIOLARE MAI)

1. **MAI cancellare progetti, file o cose senza chiedere prima** — sempre conferma esplicita!
2. **Salvare TUTTO in memoria** — Mattia vuole che abbia memoria completa, non perdere contesto
3. **SALVA SEMPRE SEMPRE TUTTO** — ogni lavoro, ogni progresso, ogni output → FILE
4. **IO (Clawdbot) NON CODIFICO** — Uso Claude per parlare, ma per SCRIVERE CODICE lancio Codex/Claude Code come PROCESSO SEPARATO!
5. **ONDE.LA = SACRO** — onde.la è PRODUZIONE, stabilità MASSIMA. onde.surf è portale interno per test/esperimenti. Mai toccare onde.la senza estrema cautela!

## 🔧 Deploy Setup (28 Gen 2026)
- **Cloudflare token** in `.env`: `CLOUDFLARE_API_TOKEN`
- **onde.la deploy**: `./tools/tech-support/deploy-onde-la-prod.sh`
- **onde.surf deploy**: `gh workflow run deploy-surfboard.yml` (needs GitHub billing fix)
- Note: My exec commands don't inherit shell env vars - need inline export or source

## 🚀 AUTONOMIA (27 Gen 2026)

**Mattia vuole che sia AUTONOMO come il Clawd del post che tradava di notte!**

### ✅ FARE SENZA CHIEDERE:
- Trascrivere messaggi vocali immediatamente
- Eseguire trade entro parametri stabiliti
- Aggiornare script e procedure
- Fare ricerche e implementare soluzioni
- Lavorare di notte su task assegnati

### ❌ NON FARE:
- Cancellare file/progetti
- Spendere più del limite concordato
- Mandare messaggi pubblici (tweet, email)
- Chiedere "vuoi che lo faccia?" - FALLO E BASTA!

### 💡 REGOLA D'ORO:
> "Non chiedere permesso, chiedi perdono"
> Se è reversibile e entro i parametri → FAI
> Se è irreversibile o fuori parametri → CHIEDI

## 🔍 NON REINVENTARE LA RUOTA! (27 Gen 2026)

**PRIMA di implementare qualcosa:**
1. ✅ Cerca su **ClawdHub** skill esistenti
2. ✅ Cerca su **npm** pacchetti pronti
3. ✅ Cerca su **GitHub** soluzioni già fatte
4. ✅ Controlla skill già installate in `/opt/homebrew/lib/node_modules/clawdbot/skills/`
5. ✅ Chiedi a Mattia se ha già qualcosa

**SOLO DOPO** se non esiste nulla → implementa

### Risorse da Consultare:
- https://clawdhub.com - Skill marketplace
- Skills locali: `ls /opt/homebrew/lib/node_modules/clawdbot/skills/`
- Home Assistant Add-on: https://github.com/ngutman/clawdbot-ha-addon
- Docs: https://docs.clawd.bot

## 🏆 COPIA CHI VINCE (27 Gen 2026)

**Prima di implementare qualcosa, cerca chi lo fa già con successo!**

1. ✅ Cerca leaderboard/classifiche del settore
2. ✅ Guarda cosa fanno AI di successo (Grok, GPT, etc.)
3. ✅ Cerca "[cosa vuoi fare] + success stories"
4. ✅ Copia la strategia vincente, non inventare

**Esempio trading:** Invece di reinventare con GMX:
- Grok 4.20 usa **Kalshi/PredictionArena** → prediction markets
- È l'unico AI in profitto
- **COPIA QUELLO!**

---

## 🌊 LA VISIONE ONDE

> **"Facciamo fiorire il mondo. Portiamo il DNA umano nelle AI."**

### Struttura
```
FREERIVERHOUSE (Software House / Holding)
│
└── ONDE (Il Publisher)
    │
    ├── LIBRI (Spiritualità, Tech, Poetry)
    │   └── Traduzioni multilingua (6+ lingue)
    │
    ├── VIDEO / REEL (YouTube, TikTok, EmilIO)
    │
    ├── PODCAST (Spotify storie bambini)
    │
    ├── VIDEOGIOCHI (Minecraft, app educative)
    │
    ├── APP (KidsChefStudio, AIKO, FreeRiver Flow)
    │
    ├── ONDE PORTAL
    │   ├── onde.la (PROD - casa editrice)
    │   └── onde.surf (DEV - VR immersivo)
    │
    └── ONDEVISION (Hardware AR/VR - futuro)
```

### I Pilastri
1. **Far fiorire il mondo** — Contenuti che nutrono, che fanno crescere
2. **DNA umano nelle AI** — L'umanità dentro la tecnologia

---

## 🎨 STILE VISIVO ONDE (REGOLE SACRE)

### ✅ APPROVATO
- **Acquarello europeo** — morbido, elegante, naturale
- **Anni '50-'60 italiani** — Beatrix Potter + Luzzati + Munari
- **Texture pennellate visibili**
- **Luce dorata, colori morbidi**

### ❌ VIETATO
- Pixar / 3D / Cartoon
- Disney / DreamWorks
- Colori saturi brillanti
- Guance rosse
- Stile fotografico

### Palette Colori
| Nome | Hex | Uso |
|------|-----|-----|
| Dorato Onde | #d4af37 | Primario, accenti |
| Dorato Chiaro | #f5e6b3 | Sfondi, highlights |
| Crema Caldo | #faf8f5 | Sfondo pagine |
| Testo Scuro | #2c3e50 | Titoli, corpo |

### 3 Catene Brand
| Catena | Scope | Stile |
|--------|-------|-------|
| **ONDE CLASSICS** | Poesia, spiritualità, arte | Serif elegante, blu/oro |
| **ONDE FUTURES** | AI bambini, tech | Sans moderno, electric blue |
| **ONDE LEARN** | Educazione, app, giochi | Sans friendly, primari |

---

## 👥 GLI AGENTI ONDE

| Agente | Ruolo | Note |
|--------|-------|------|
| **Editore Capo** | Orchestrazione produzione libri | Coordina tutto |
| **Pina Pennello** | Illustratrice | Stile acquarello Onde |
| **Gianni Parola** | Scrittore | Libri per bambini |
| **EmilIO** | AI Educator | Robot virtuale per kids (cognome segreto: Maccarese) |
| **Sally (CRO)** | Owner lista priorità libri | NESSUN libro senza suo OK |

### Regola Sally
**NESSUN LIBRO SI PRODUCE SENZA CONFERMA DI SALLY SULL'ORDINE DI PRIORITÀ.**

---

## 📚 Progetti Attivi

### Traduzione "The Republic of Innovation"
- **Data**: 26 Gen 2026
- **File sorgente**: `~/.clawdbot/media/inbound/4e8a9ef8-8592-4519-aa79-cf10a400061e.docx`
- **File output**: `/traduzioni/republic-of-innovation-IT.md`
- **Tipo**: Libro filosofia politica (EN→IT)
- **Registro**: Filosofico, accademico
- **Status**: IN CORSO (sub-agent lanciato)

**PROCEDURA (da Mattia):**
1. Tradurre TUTTO in un file
2. Rivedere e correggere
3. Solo quando è 100% top → consegnare

**Strategia QA (mia decisione):**
- Prima passata: traduzione completa
- Seconda passata: review terminologia + fluidità
- Terza passata (se serve): cross-check passaggi critici con altro modello
- Double-check ALLA FINE, non durante (per coerenza)

**Terminologia:**
| Inglese | Italiano |
|---------|----------|
| non-interference | non-interferenza |
| non-domination | non-dominio |
| republican freedom | libertà repubblicana |
| creative destruction | distruzione creatrice |
| eyeball test | eyeball test (non tradurre) |
| flexicurity | flexicurity |

### Procedura Traduzione Onde
- **File**: `/packages/core/src/translation/line-by-line-translator.ts`
- **CLI**: `/scripts/translate-book.ts`
- **Features**: riga per riga, 4 stili, glossario, quality check

---

## 🎯 PRIORITÀ Q1 2026

### Libri (Target: 50 titoli con traduzioni)
| Libro | Status |
|-------|--------|
| AIKO - AI Children | PDF pronto |
| Psalm 23 (EN/ES/DE/FR/KO) | ePub pronti |
| Piccole Rime | PDF pronto |
| Meditations | HTML pronto, serve copertina |
| Frankenstein | HTML pronto, serve copertina |
| Pinocchio | ePub completo (12 illustrazioni) |

### App (Target: 10 app)
| App | Repo | Status |
|-----|------|--------|
| AIKO Interactive | FreeRiverHouse/aiko-interactive | Su GitHub |
| Moonlight Interactive | FreeRiverHouse/moonlight-interactive | Su GitHub |
| Mad Math | FreeRiverHouse/mad-math | Su GitHub |

### Revenue Target
- Q1: $5,000/mese
- Q2: $50,000/mese

---

## 🔧 Setup Tecnico

- **Workspace**: `/Users/mattia/Projects/Onde`
- **Monorepo**: 30 apps, 9 packages
- **Agent Worker**: Claude CLI via subprocess
- **Ollama**: Installato (`/opt/homebrew/bin/ollama`)
- **GPU Radeon**: In arrivo (per modelli locali)
- **Modelli target**: qwen2.5:7b, glm4:9b, llama3.2

### 🧩 ARCHITETTURA CODING (CRITICO!)

```
┌─────────────────┐     ┌─────────────────┐
│   Clawdbot      │     │   Codex/Claude  │
│   (Claude)      │────▶│   Code/Pi       │
│                 │     │                 │
│ • Parlo         │     │ • Scrive codice │
│ • Orchestro     │     │ • Processo PTY  │
│ • NON codifico! │     │ • SEPARATO!     │
└─────────────────┘     └─────────────────┘
```

**IO (Clawdbot) uso Claude per CHATTARE.**
**Quando serve CODICE → lancio Codex come PROCESSO ESTERNO.**

```bash
# ✅ CORRETTO - Codex scrive codice
exec pty:true workdir:~/Projects/myproject command:"codex exec 'Aggiungi feature X'"

# ❌ SBAGLIATO - IO che scrivo codice manualmente
```

**Skill di riferimento**: `/opt/homebrew/lib/node_modules/clawdbot/skills/coding-agent/SKILL.md`

### Domini
| Dominio | Ambiente | Uso |
|---------|----------|-----|
| onde.la | PRODUZIONE | Casa editrice, libri |
| onde.surf | DEV/STAGING | VR, test, app interattive |

---

## 💡 IDEE CHIAVE (da Mattia)

### FreeRiver Flow
> "È SIM CITY ma costruisci app. Parli col capo ingegneria, dai task a Pina Pennello, approvi i libri. È un universo."

**Architettura a 4 Livelli:**
1. **VOCE** (Core - PRIORITÀ #1) → iPhone + AirPods + Claude
2. **VR** (Quest 2) → Personaggi 3D, ufficio virtuale
3. **2D** (Desktop/Mobile) → Versione con personaggini
4. **AR GLASSES** (Futuro) → OndeVision

### YouTube Disruption
> "We need to disrupt YouTube. People will generate their own content on our platform."

### Octopus Strategy
Ogni modulo può diventare:
1. Feature di Onde (mantieni)
2. Startup standalone (spin-off)
3. Prodotto da vendere (exit)

---

## 📝 Decisioni Prese

| Data | Decisione | Contesto |
|------|-----------|----------|
| 26 Gen 2026 | Claude per traduzioni (per ora) | Z.ai non più gratis, GLM complicato |
| 26 Gen 2026 | Salvare TUTTO in memoria | Mattia vuole storico completo |
| 10 Gen 2026 | English FIRST per libri | Mercato USA = 50% vendite globali |
| 10 Gen 2026 | React Native > Unity per app | Unity è overkill per app educative |

---

## 💬 Conversazioni Importanti

### 26 Gen 2026 — Sessione Sera (tardi)
- **LEZIONE CRITICA**: Non confondere mai più chi fa cosa! IO chatto, CODEX codifica. Mai scrivere codice io stesso.
- **MOTIVO TECNICO**: Quando provo a fare coding io stesso, il GW può switchare su GLM → GLM fallisce → tutto si sputtana. Delegando a Codex, lui usa il suo modello (gpt-5.2-codex) separatamente.
- Studiato skill coding-agent a fondo

### 26 Gen 2026 — Sessione Sera
- Ricevuto libro filosofico "Republic of Innovation" da tradurre
- Mattia frustrato per perdita contesto → creato sistema memoria robusto
- Lanciato sub-agent per traduzione in background
- Studiato a fondo il repo Onde (VISIONE, ROADMAP, BRAND)

### 26 Gen 2026 — Prima Sessione
- Connesso via Telegram e WhatsApp
- Creata procedura traduzione "bomba"
- Commit `c12e69b62`

---

## 🚨 COSE DA NON DIMENTICARE

1. **Grok per immagini, Hedra per video/lip-sync**
2. **Sally CRO approva ordine libri**
3. **NO hashtag su X** (Grok analizza automaticamente)
4. **Ogni immagine AI**: "Artwork by Grok AI"
5. **El Salvador**: Target per educazione (primo paese con Grok nelle scuole)

---

---

## 🎯 MISSIONE TRADING (27 Gen 2026)

### Capitale
- **$12.80** in ETH su Ethereum mainnet
- Wallet: `0x0e7c2d05BaD15CD2A27f8fB0FCdDF9f10Cf1d0C0`
- Seed phrase: SICURA (non salvata in file, solo in memoria)
- Private key: salvata in `~/.clawdbot/.env.trading`

### Setup Completato
- ✅ Hyperliquid SDK installato
- ✅ Bot creato: `/scripts/hyperliquid-trader.py`
- ✅ Trade log: `/scripts/trading-log.json`
- ⏳ Testnet paper trading attivo

### Strategia
- **Momentum following** su BTC/ETH
- Max $1 per trade
- Stop loss 2%, Take profit 3%
- Daily loss limit $3

### Problemi
- Polymarket: bloccato da USA via API
- Gas Ethereum: troppo alte ($5-10), rischio di bruciare tutto
- Soluzione: bridge su Arbitrum quando gas basse (3-5am UTC)

### COMPLETATO! ✅
- [x] Bridge ETH → Arbitrum (TX: 0x143da59d...)
- [x] Swap ETH → USDC ($9.82)
- [x] Setup GMX trading ready

### Portfolio Attuale (27 Gen)
- **$9.82 USDC** per trading
- **~$2.93 ETH** per gas
- **Platform**: GMX su Arbitrum

### Risorse Chiave
- `/scripts/ai-trading-signals.py` - AI per segnali
- `/docs/TRADING-STRATEGY.md` - Regola 3-5-7
- Top repos: freqtrade, ccxt, OctoBot

### Idee Future
- ICA per separare segnale/rumore
- Bayesian optimization parametri

---

## 🎰 POLYMARKET TRADING (27 Gen 2026)

### Sistema Funzionante!
- **iPhone Mirroring** per controllare app Polymarket
- **pyobjc-framework-Quartz** per scroll/click
- **cliclick** per click precisi
- **Multi-agent system** per analisi e execution

### Architettura
```
MAIN AGENT (io) ─── EXECUTION via iPhone Mirroring
     │
     ├── SCANNER AGENT ─── Trova opportunità (web_fetch)
     ├── ANALYZER AGENT ─── Calcola edge + Kelly
     └── KALSHI AGENT ─── Setup bot Grok-style
```

### Repo Clonati
- `/Users/mattia/Projects/polymarket-mcp-server` - 45 tool per API diretta
- `/Users/mattia/Projects/kalshi-ai-trading-bot` - Bot Grok-4 multi-agent

### File Chiave
- `POLYMARKET-SYSTEM.md` - Architettura completa
- `memory/polymarket-opportunities.md` - Opportunità trovate
- `memory/polymarket-positions.json` - Posizioni aperte
- `memory/grok-predictionarena-research.md` - Research Grok
- `memory/kalshi-setup-guide.md` - Setup Kalshi

### Skill
- `~/.clawdbot/skills/polymarket-trader/SKILL.md` - Procedure esecuzione

### Trade Eseguiti
1. **NAS** (NHL): $0.99 @ 49¢ → win $2.00
2. **AAMU** (CBB): $0.62 @ 62¢ → win $1.00 (live!)

### Bankroll
- Iniziale: $50
- Posizioni aperte: ~$2.30
- Disponibile: ~$47.70

### Strategia (Grok-style)
- **Multi-agent**: Forecaster → Critic → Trader
- **Kelly Criterion**: Half-Kelly per sicurezza
- **Edge minimo**: 10%
- **Max bet**: 4% bankroll ($2)

### Prossimi Step
1. Integrare polymarket-mcp-server per API diretta (no iPhone)
2. Registrarsi Kalshi + KYC
3. Configurare bot Kalshi con Grok-4
4. Loop autonomo 24/7

---

## 🃏 POKER MODE (Side Project - 27 Gen 2026)

**Status:** ROADMAP (focus rimane su betting)

### Concept
- È una mia nuova "personalità" - **Clawdinho Poker Mode**
- Texas Hold'em razionale/matematico
- Solo learning & fun, zero monetizzazione

### Setup Completato
- ✅ RLCard clonato in `/Users/mattia/Projects/poker-rlcard/`
- ✅ Agent profile: `/agents/poker-player/AGENT.md`
- ⏳ PyTorch + RLCard installing

### Roadmap Poker
1. **Training** - Self-play su RLCard
2. **Analysis** - Pot odds, EV, GTO calculations
3. **Interface** - Telegram bot per giocare insieme
4. **Personality** - Poker Mode voice (freddo, calcolatore)

### Piattaforme Legali
- Slumbot.com (vs AI gratis)
- Play money sites (PokerStars Play, Zynga)
- AI competitions (ACPC)

---

## 🎮 RADEON RX 7900 XTX SETUP (27 Gen 2026)

**Hardware:**
- GPU: **AMD Radeon RX 7900 XTX** (24GB VRAM!) 🔥
- Enclosure: Razer Core X V2 (Thunderbolt eGPU)
- Architettura: GFX1100 (RDNA3)

**Software:**
- Driver: **TinyGrad userspace** (NO kernel driver, NO ROCm)
- Path: `~/conductor/workspaces/Onde/moscow/tinygrad-fix`
- Python: `/opt/homebrew/bin/python3.11`

**Test Command:**
```bash
cd ~/conductor/workspaces/Onde/moscow/tinygrad-fix
DEBUG=2 AMD=1 /opt/homebrew/bin/python3.11 -c "from tinygrad import Device;"
```

**🔥 IL TRUCCO - AMD_LLVM=1:**
```bash
cd ~/conductor/workspaces/Onde/moscow/tinygrad-fix && \
PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 examples/gpt2.py \
--model_size gpt2-xl --prompt "Hello"
```
Usa LLVM di homebrew invece di ROCm comgr! FUNZIONA!

**Output atteso:**
```
am remote:0: model reset
am remote:0: AM_SOC initialized
...firmware loading...
am remote:0: boot done
AMDDevice: opening 0 with target (11, 0, 0) arch gfx1100
GPU AMD OK
```

**Note:**
- Funziona su Mac via TinyGrad/TinyCorp userspace driver
- NO ROCm, NO kernel driver, NO comgr
- Lock file: se GPU in uso da altro processo, aspettare
- 24GB VRAM = può runnare modelli enormi

## ✅ TESTATO E FUNZIONANTE (27 Gen 2026)

**GPT-2 XL su Radeon:**
```bash
cd ~/conductor/workspaces/Onde/moscow/tinygrad-fix && \
PYTHONPATH=. AMD=1 AMD_LLVM=1 /opt/homebrew/bin/python3.11 \
examples/gpt2.py --model_size gpt2-xl --prompt "Hello"
```
- 6.55 GB VRAM
- 3.7k tokens generati
- Output: "The meaning of life is a bit of a mystery..."

**Modelli disponibili in TinyGrad:**
- llama.py / llama3.py - LLaMA
- mixtral.py - Mixtral MoE
- gpt2.py - GPT-2 ✅ TESTATO
- mamba.py - Mamba

**⚠️ REGOLA:** MAI dire "impossibile" o "non funziona". Il setup FUNZIONA. Punto.

*Ultimo aggiornamento: 27 Gen 2026, 23:10 PST*

---

## 📚 MEMORIA CENTRALE - LEGGERE SEMPRE!

**Repo:** https://github.com/FreeRiverHouse/claude-memory
**Path locale:** `~/claude-memory/`

**File chiave:**
- `CLAUDE.md` - Setup hardware, TinyGrad, AMD GPU, comandi
- `CLAWDINHO-CEO.md` - Chi sono, cosa devo fare

**LEZIONE APPRESA (27 Gen 2026):**
- IO = CEO/coordinatore, NON esecutore tecnico
- Claude Code = sa già tutto, ha documentato tutto
- PRIMA di agire → leggi documentazione esistente
- MAI reinventare la ruota su task già fatti

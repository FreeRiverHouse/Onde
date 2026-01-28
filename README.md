# Onde

**Casa Editrice Digitale & Agenzia PR**

Onde è una piattaforma completa per la pubblicazione digitale di musica e libri, con un'agenzia PR integrata (Onde PR) per dominare branding, marketing e go-to-market.

## Roadmap

### PR Agency (Onde PR)
- [x] Integrazione X/Twitter API per 3 account (@FreeRiverHouse, @Onde_FRH, @magmatic__)
- [x] Telegram bot per posting (@OndePR_bot)
- [x] Comandi /frh, /onde, /magmatic per postare
- [x] Report automatico giornaliero (17:40)
- [x] Daily Tech Post automatico per @FreeRiverHouse (21:30)
- [x] Content bank con 40 post pre-scritti
- [x] Style guide per ogni account
- [ ] Instagram integration
- [ ] Analytics dashboard web

### Casa Editrice (Publishing)
- [x] Sistema agenti AI (Editore Capo, Gianni Parola, Pina Pennello)
- [x] Workflow produzione libri documentato
- [x] Generazione PDF con Puppeteer
- [x] Primo libro in produzione: "Il Salmo 23 per Bambini"
- [x] Testo completo (6 capitoli + intro)
- [x] Stile illustrazioni approvato (watercolor)
- [ ] Illustrazioni finali generate
- [ ] Layout PDF finale
- [ ] Pubblicazione su KDP

### Infrastructure
- [x] Monorepo TypeScript con Turbo
- [x] LaunchAgents per automazione macOS
- [x] GitHub repo privato
- [ ] CI/CD pipeline
- [ ] Dashboard web

## Architettura

```
onde/
├── packages/
│   ├── core/                 # Libreria condivisa (tipi, utility, config)
│   ├── publishing/           # Onde Casa Editrice (musica + libri)
│   ├── pr-agency/            # Onde PR (marketing, posting su X)
│   └── agents/               # Sistema multi-agent AI
│       ├── editor/           # Editing e revisione contenuti
│       ├── marketer/         # Creazione campagne marketing
│       ├── branding/         # Strategia brand e identita
│       ├── gtm/              # Go-to-market strategy
│       └── social/           # Posting su X/Twitter
├── apps/
│   ├── api/                  # API REST/GraphQL
│   └── dashboard/            # Dashboard web
├── config/                   # Configurazioni condivise
├── docs/                     # Documentazione
└── scripts/                  # Script di utility
```

## Componenti Principali

### Onde Casa Editrice (`@onde/publishing`)
- Gestione catalogo libri e musica
- Workflow editoriale (draft -> editing -> review -> published)
- Distribuzione multi-formato (epub, pdf, mp3, audiobook)
- Gestione autori e contenuti

### Onde PR (`@onde/pr-agency`)
- Creazione e gestione campagne marketing
- Integrazione X/Twitter per posting automatico
- Press release e media kit
- Analytics e reportistica

### Sistema Agent AI
- **Editor Agent**: Revisione e editing automatico dei contenuti
- **Marketer Agent**: Generazione strategie marketing e campagne
- **Branding Agent**: Creazione e gestione identita brand
- **GTM Agent**: Pianificazione go-to-market
- **Social Agent**: Creazione contenuti social e posting su X

## Stack Tecnologico

- **Runtime**: Node.js 18+
- **Linguaggio**: TypeScript 5.3
- **Build System**: Turbo (monorepo)
- **AI**: OpenAI GPT-4, Anthropic Claude
- **Social API**: Twitter API v2

## Setup

```bash
# Installa dipendenze
npm install

# Build di tutti i pacchetti
npm run build

# Avvia in development
npm run dev

# Esegui test
npm run test

# Lint
npm run lint
```

## Configurazione

Crea un file `.env` nella root:

```env
# General
NODE_ENV=development
LOG_LEVEL=info

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Twitter/X API
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...
TWITTER_BEARER_TOKEN=...

# Database
DATABASE_URL=...

# Storage
STORAGE_BUCKET=...
```

## Pacchetti

| Pacchetto | Descrizione |
|-----------|-------------|
| `@onde/core` | Tipi condivisi, utility, configurazione |
| `@onde/publishing` | Casa editrice digitale |
| `@onde/pr-agency` | Agenzia PR e marketing |
| `@onde/agent-editor` | Agent AI per editing |
| `@onde/agent-marketer` | Agent AI per marketing |
| `@onde/agent-branding` | Agent AI per branding |
| `@onde/agent-gtm` | Agent AI per GTM |
| `@onde/agent-social` | Agent AI per social media |

## Recent Updates (Jan 2026)

### 🌐 Web Properties
- **onde.la** - Main portal with book catalog, reader, health status
- **onde.surf** - Surfboard theme selector

### 🌙 Moonlight Magic House
Interactive Tamagotchi-style game featuring:
- Glassmorphism UI with glow effects
- Particle system (stars, sparkles)
- Framer Motion room transitions
- Fully responsive (mobile-first, tested 360px-1920px)
- Located at `/games/moonlight-magic-house/`

### 📊 System Health
- `/health` page with real-time service status monitoring
- Auto-refreshes every 60 seconds
- Tracks onde.la, onde.surf, GitHub

### 📈 Trading Automation
- Kalshi autotrader for BTC hourly markets
- PnL analysis script: `scripts/analyze-trades-pnl.py`
- Watchdog cron for auto-restart

### 🔧 Developer Tools
- Open Graph metadata for social sharing
- Responsive CSS breakpoints (768px, 480px, 360px, 600px-height)
- Static export for Cloudflare Pages

## Licenza

Proprietary - Tutti i diritti riservati.

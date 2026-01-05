# Onde

**Casa Editrice Digitale & Agenzia PR**

Onde e una piattaforma completa per la pubblicazione digitale di musica e libri, con un'agenzia PR integrata (Onde PR) per dominare branding, marketing e go-to-market.

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

## Licenza

Proprietary - Tutti i diritti riservati.

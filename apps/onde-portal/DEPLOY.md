# Deploy Onde Portal

## Cloudflare Pages (Produzione)

### Configurazione

Il sito viene esportato come **sito statico** (output: 'export' in next.config.mjs).

**IMPORTANTE**: Le API routes NON sono incluse nel build statico. La pagina `/libro/[id]` fetcha direttamente da Project Gutenberg client-side.

### Deploy Manuale

```bash
cd /Users/mattia/Projects/Onde/apps/onde-portal

# Build del sito statico
npm run build

# Deploy su Cloudflare Pages
npx wrangler pages deploy out --project-name=onde-portal
```

### Deploy Automatico (GitHub)

Cloudflare Pages puo' essere configurato per deployare automaticamente su push a GitHub:

1. Vai su Cloudflare Dashboard > Pages
2. Crea nuovo progetto o seleziona "onde-portal"
3. Collega il repository GitHub (FreeRiverHouse/Onde)
4. Configura:
   - **Build command**: `cd apps/onde-portal && npm install && npm run build`
   - **Build output directory**: `apps/onde-portal/out`
   - **Root directory**: `/` (root del repo)

### Domini

- **Produzione**: onde.la (da configurare in Cloudflare)
- **Staging**: onde.surf (da configurare)
- **Preview**: onde-portal.pages.dev (automatico)

---

## Sviluppo Locale

### Modalita Sviluppo

```bash
cd /Users/mattia/Projects/Onde/apps/onde-portal
npm install
npm run dev
```

URL: http://localhost:3000

### Build di Produzione Locale

```bash
npm run build
npm run start
```

---

## Note Tecniche

### Stack
- **Framework**: Next.js 15.5.2 (App Router)
- **Styling**: Tailwind CSS
- **Animazioni**: Framer Motion
- **Deploy**: Static export su Cloudflare Pages

### Limitazioni Static Export

Con `output: 'export'`:
- Le API routes NON sono disponibili in produzione
- Ogni pagina dinamica richiede `generateStaticParams()`
- Il fetch dei dati avviene client-side

### Pagine

| Pagina | Tipo | Note |
|--------|------|------|
| `/` | Statica | Homepage |
| `/catalogo` | Statica | Lista libri |
| `/libro/[id]` | SSG | Pre-generata per ogni libro |
| `/about`, `/app`, `/vr`, etc. | Statiche | Pagine informative |
| `/account`, `/famiglia`, `/libreria` | Statiche | UI senza backend |

### Futuro: API Routes

Se servono API routes funzionanti:
1. Usare Cloudflare Workers separati
2. Oppure migrare su Vercel (supporta API routes native)
3. Oppure usare OpenNext per Cloudflare (piu' complesso)

---

*Ultimo aggiornamento: 2026-01-10*

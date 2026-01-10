# Deploy Onde Portal

## Status Attuale (10 Gen 2026)

- **Build**: Funzionante (npm run build)
- **Deploy**: onde-portal.pages.dev (attivo)
- **onde.la**: In attesa configurazione DNS
- **onde.surf**: Zona da creare su Cloudflare

---

## Cloudflare Pages

### Configurazione

Il sito viene esportato come **sito statico** (output: 'export' in next.config.mjs).

**IMPORTANTE**: Le API routes sono state rimosse (incompatibili con static export).

### Deploy Manuale

```bash
cd /Users/mattia/Projects/Onde/apps/onde-portal

# Build del sito statico
npm run build

# Deploy su Cloudflare Pages
npx wrangler pages deploy out --project-name=onde-portal
```

### Autenticazione Wrangler

Prima del deploy, assicurati di essere autenticato:

```bash
wrangler login
wrangler whoami
```

---

## Domini Personalizzati

### onde.la (PROD)

**Status**: Custom domain aggiunto, in attesa DNS

**Per completare la configurazione:**

1. Vai su Cloudflare Dashboard: https://dash.cloudflare.com/91ddd4ffd23fb9da94bb8c2a99225a3f/onde.la/dns/records

2. Aggiungi un record CNAME:
   - **Type**: CNAME
   - **Name**: @ (root domain)
   - **Target**: onde-portal.pages.dev
   - **Proxy status**: Proxied (arancione)

3. Verifica su Pages: https://dash.cloudflare.com/91ddd4ffd23fb9da94bb8c2a99225a3f/pages/view/onde-portal/settings/custom-domains

### onde.surf (DEV/TEST)

**Status**: Zona DNS da creare

**Per configurare:**

1. Acquista/trasferisci dominio onde.surf
2. Aggiungi zona su Cloudflare: https://dash.cloudflare.com/?to=/:account/add-site
3. Aggiorna nameservers:
   - aarav.ns.cloudflare.com
   - janet.ns.cloudflare.com
4. Aggiungi custom domain al progetto Pages

### Preview Deployments

Ogni deploy crea un URL preview:
- Formato: `[commit-hash].onde-portal.pages.dev`
- Esempio: `a44b7648.onde-portal.pages.dev`

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
npx serve out
```

---

## Ambienti

| Ambiente | Dominio | Uso |
|----------|---------|-----|
| **PROD** | onde.la | Produzione stabile |
| **DEV** | onde.surf | Test e sviluppo |
| **Preview** | *.onde-portal.pages.dev | Deploy automatici |

### Workflow

1. Sviluppa in locale (localhost:3000)
2. Push su branch feature -> Preview deploy
3. Test su onde.surf (quando configurato)
4. Merge su main -> Deploy su onde.la

---

## Note Tecniche

### Stack
- **Framework**: Next.js 15.5.2 (App Router)
- **Styling**: Tailwind CSS
- **Animazioni**: Framer Motion
- **Deploy**: Static export su Cloudflare Pages

### Limitazioni Static Export

Con `output: 'export'`:
- Le API routes NON sono disponibili
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

---

## Cloudflare Info

- **Account ID**: 91ddd4ffd23fb9da94bb8c2a99225a3f
- **Zone ID (onde.la)**: 5f1b2fe544f1a925765305fefcf36fe1
- **Pages Project**: onde-portal
- **Nameservers**: aarav.ns.cloudflare.com, janet.ns.cloudflare.com

---

*Ultimo aggiornamento: 2026-01-10*

# PR Dashboard - Trasformazione SaaS Multi-tenant

## Visione Prodotto

**Nome**: Onde PR (o OndeFlow, WavePost, etc.)
**Target**: Agenzie PR, creator, piccole aziende che gestiscono social

**Value Proposition**:
- Approvazione contenuti social con UI elegante
- Multi-account (X, IG, TikTok)
- Collaborazione team/cliente
- AI-powered content suggestions

---

## Architettura Attuale

```
Singolo utente, file JSON, localhost
├── Express server
├── Static HTML frontend
├── JSON file storage
└── No auth
```

## Architettura Target

```
Multi-tenant SaaS
├── Next.js App (frontend + API)
├── PostgreSQL (dati)
├── Auth (Clerk/NextAuth)
├── Stripe (pagamenti)
├── Vercel (hosting)
└── Redis (cache)
```

---

## Fasi di Trasformazione

### FASE 1: Migrazione a Next.js (1-2 giorni)
- [ ] Creare progetto Next.js
- [ ] Portare UI React components
- [ ] API routes invece di Express
- [ ] Prisma per ORM

### FASE 2: Auth Multi-tenant (1 giorno)
- [ ] Integrare Clerk o NextAuth
- [ ] Modello User → Organization → Posts
- [ ] Inviti team via email
- [ ] Ruoli: Admin, Editor, Viewer

### FASE 3: Database (1 giorno)
- [ ] PostgreSQL su Railway/Supabase
- [ ] Schema Prisma multi-tenant
- [ ] Migrazione dati esistenti

### FASE 4: Pagamenti (1 giorno)
- [ ] Stripe Checkout
- [ ] Piani: Free, Pro, Agency
- [ ] Billing portal
- [ ] Usage limits

### FASE 5: Features SaaS (2-3 giorni)
- [ ] Onboarding wizard
- [ ] Settings tenant
- [ ] Export/Report
- [ ] API pubblica per integrazioni

### FASE 6: Deploy e Launch (1 giorno)
- [ ] Vercel deploy
- [ ] Dominio custom
- [ ] Analytics (Plausible/Posthog)
- [ ] Error tracking (Sentry)

---

## Schema Database (Prisma)

```prisma
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  plan      Plan     @default(FREE)
  stripeId  String?
  createdAt DateTime @default(now())

  users     OrganizationUser[]
  posts     Post[]
  accounts  SocialAccount[]
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  avatar    String?
  createdAt DateTime @default(now())

  organizations OrganizationUser[]
}

model OrganizationUser {
  organization   Organization @relation(fields: [organizationId], references: [id])
  organizationId String
  user           User         @relation(fields: [userId], references: [id])
  userId         String
  role           Role         @default(EDITOR)

  @@id([organizationId, userId])
}

model Post {
  id             String       @id @default(cuid())
  organization   Organization @relation(fields: [organizationId], references: [id])
  organizationId String

  content        String
  mediaUrls      String[]
  platform       Platform
  status         PostStatus   @default(PENDING)

  scheduledFor   DateTime?
  publishedAt    DateTime?

  createdBy      String
  approvedBy     String?

  feedback       Feedback[]

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

model SocialAccount {
  id             String       @id @default(cuid())
  organization   Organization @relation(fields: [organizationId], references: [id])
  organizationId String

  platform       Platform
  username       String
  accessToken    String
  refreshToken   String?
  expiresAt      DateTime?

  createdAt      DateTime     @default(now())
}

enum Plan {
  FREE
  PRO
  AGENCY
}

enum Role {
  ADMIN
  EDITOR
  VIEWER
}

enum Platform {
  X
  INSTAGRAM
  TIKTOK
  LINKEDIN
}

enum PostStatus {
  DRAFT
  PENDING
  APPROVED
  REJECTED
  PUBLISHED
}
```

---

## Pricing Tiers

| Piano | Prezzo | Limite Post | Utenti | Accounts |
|-------|--------|-------------|--------|----------|
| Free | $0/mo | 10/mo | 1 | 1 |
| Pro | $19/mo | 100/mo | 3 | 5 |
| Agency | $49/mo | Unlimited | 10 | 20 |

---

## Stack Tecnico

| Componente | Scelta | Alternativa |
|------------|--------|-------------|
| Frontend | Next.js 14 | - |
| Database | PostgreSQL | Supabase |
| ORM | Prisma | Drizzle |
| Auth | Clerk | NextAuth |
| Pagamenti | Stripe | Lemon Squeezy |
| Hosting | Vercel | Railway |
| Storage | Uploadthing | Cloudflare R2 |
| Email | Resend | Postmark |
| Analytics | Posthog | Plausible |

---

## Competitors

1. **Hootsuite** - Enterprise, caro
2. **Buffer** - Semplice, $99+/mo per team
3. **Sprout Social** - Enterprise, $250+/mo
4. **Later** - Focus IG, $45+/mo

**Nostra nicchia**: PR agencies piccole, creator, indie brands
**Differenziatore**: UI elegante "museum-style", AI content, prezzo accessibile

---

## Go-to-Market

1. **Launch ProductHunt** - Prima visibility
2. **X/Twitter** - Building in public
3. **Indie Hackers** - Community
4. **Cold outreach** - Agenzie PR italiane

---

## Timeline Stimata

- Settimana 1: FASE 1-3 (base funzionante)
- Settimana 2: FASE 4-5 (pagamenti + features)
- Settimana 3: FASE 6 + beta testers
- Settimana 4: Launch

---

## Prossimi Step Immediati

1. `npx create-next-app pr-dashboard-saas`
2. Setup Prisma + schema
3. Setup Clerk auth
4. Migrare UI esistente
5. Deploy test su Vercel

---

*Creato: 2026-01-09*
*Task: saas-001*
*Status: Pianificazione completata*

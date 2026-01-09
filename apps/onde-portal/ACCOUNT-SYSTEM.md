# Sistema Account Utenti - Onde Portal

## Panoramica

Sistema di autenticazione basato su Magic Link (email senza password).

## Architettura

```
┌─────────────────────────────────────────────────────────────┐
│                     ONDE PORTAL                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  /account   │    │  /libreria  │    │  /libro/:id │     │
│  │   (login)   │◄──►│  (my books) │◄──►│   (reader)  │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                  ▲                  ▲              │
│         ▼                  │                  │              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    API Routes                        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  POST /api/auth/magic-link  → Invia link email      │   │
│  │  GET  /api/auth/verify      → Verifica token        │   │
│  │  POST /api/auth/logout      → Distrugge sessione    │   │
│  │  GET  /api/auth/me          → Utente corrente       │   │
│  │  GET  /api/user/purchases   → Cronologia acquisti   │   │
│  └─────────────────────────────────────────────────────┘   │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   lib/auth.ts                        │   │
│  │  - generateMagicLinkToken()                          │   │
│  │  - verifyMagicLink()                                 │   │
│  │  - createSession() / getSession()                    │   │
│  │  - getCurrentUser() / getUserById()                  │   │
│  │  - addPurchase() / getUserPurchases()               │   │
│  └─────────────────────────────────────────────────────┘   │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              In-Memory Store (MVP)                   │   │
│  │  users: Map<id, User>                                │   │
│  │  sessions: Map<sessionId, Session>                   │   │
│  │  magicLinks: Map<token, { email, expiresAt }>       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Flusso Autenticazione

### 1. Login con Magic Link

```
1. Utente inserisce email su /account
2. Frontend chiama POST /api/auth/magic-link
3. Backend genera token crittografico (32 bytes hex)
4. Token salvato con email + expiration (15 min)
5. Email inviata con link: /api/auth/verify?token=xxx
6. (DEV: link stampato in console)
```

### 2. Verifica Magic Link

```
1. Utente clicca link nell'email
2. GET /api/auth/verify?token=xxx
3. Backend verifica token valido e non scaduto
4. Se valido: crea/trova utente, crea sessione
5. Sessione salvata in cookie httpOnly (30 giorni)
6. Redirect a /account con success=true
```

### 3. Sessione Attiva

```
1. Ogni request legge cookie 'onde_session'
2. getCurrentUser() verifica sessione valida
3. Se valida: ritorna dati utente
4. Se scaduta/invalida: ritorna null → redirect login
```

## File Structure

```
apps/onde-portal/
├── src/
│   ├── lib/
│   │   └── auth.ts              # Core auth logic
│   ├── app/
│   │   ├── account/
│   │   │   └── page.tsx         # Login/Profile page
│   │   ├── libreria/
│   │   │   └── page.tsx         # My books page
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── magic-link/
│   │       │   │   └── route.ts # Generate magic link
│   │       │   ├── verify/
│   │       │   │   └── route.ts # Verify token
│   │       │   ├── logout/
│   │       │   │   └── route.ts # Logout
│   │       │   └── me/
│   │       │       └── route.ts # Current user
│   │       └── user/
│   │           └── purchases/
│   │               └── route.ts # Purchase history
```

## Tipi

```typescript
interface User {
  id: string          // UUID
  email: string       // lowercase
  name?: string       // opzionale
  createdAt: Date
  purchases: Purchase[]
}

interface Purchase {
  id: string
  bookId: string
  bookTitle: string
  purchasedAt: Date
  price: number
}

interface Session {
  userId: string
  email: string
  expiresAt: Date     // +30 giorni
}
```

## Sicurezza

- **Token crittografici**: 32 bytes random via crypto.randomBytes
- **Cookie httpOnly**: non accessibile da JavaScript
- **Cookie secure**: solo HTTPS in produzione
- **Cookie sameSite**: lax (protezione CSRF)
- **Token expiration**: 15 minuti per magic link
- **Session expiration**: 30 giorni

## TODO per Produzione

1. **Database persistente**
   - Sostituire Map in-memory con SQLite/PostgreSQL
   - Aggiungere migration per users/sessions/purchases

2. **Email reale**
   - Integrare Resend o SendGrid
   - Template email HTML branded

3. **Rate limiting**
   - Max 5 magic link/ora per email
   - Max 10 tentativi login/IP/ora

4. **Logging**
   - Log tentativi login
   - Log sessioni create/distrutte

5. **Integrazione Stripe**
   - Collegare purchases a transazioni Stripe
   - Webhook per conferma pagamento

## Test Locale

```bash
# Start dev server
cd apps/onde-portal
npm run dev

# 1. Vai su http://localhost:3000/account
# 2. Inserisci email
# 3. Copia magic link dalla console
# 4. Incolla nel browser
# 5. Sei loggato!
```

---

*Creato: 2026-01-09*
*Task: onde-books-004*

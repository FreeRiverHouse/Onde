# Bitcoin Payments Setup - Onde Publishing

**Data**: 2026-01-12
**Status**: TEST (solo onde.surf)
**Prodotto pilota**: Meditations by Marcus Aurelius

---

## Panoramica

Implementazione pagamenti Bitcoin/Lightning Network per Onde Publishing, come parte della strategia El Salvador.

### Soluzione scelta: OpenNode

**Motivazioni:**
1. **API semplice** - RESTful, facile integrazione con Next.js
2. **Lightning + On-chain** - Supporta entrambi automaticamente
3. **Hosted checkout** - Opzione checkout ospitato (come Stripe) o QR custom
4. **Nessun server** - A differenza di BTCPay che richiede VPS
5. **Testnet** - Ambiente test gratuito per sviluppo
6. **Commissioni** - 1% (vs 2.9% carte tradizionali)

### Alternative considerate:
- **BTCPay Server**: Più controllo ma richiede server dedicato
- **Strike API**: Ottimo per Lightning ma meno flessibile

---

## File Implementati

### Struttura (Static Site Compatible)

```
apps/onde-portal/src/
├── lib/
│   └── bitcoin.ts                    # Utility Bitcoin (riferimento)
├── components/
│   └── BitcoinPayButton.tsx          # Bottone pagamento (hosted checkout)
└── app/libro/meditations-btc/
    └── page.tsx                      # Pagina test Meditations
```

**NOTA**: Il sito usa `output: 'export'` (static site generation).
Le API routes dinamiche NON funzionano. Usiamo OpenNode Hosted Checkout.

---

## Configurazione (Hosted Checkout)

### Passo 1: Crea Account OpenNode

1. Vai a https://app.opennode.com/signup
2. Verifica email e completa KYC (se richiesto)

### Passo 2: Crea Checkout per Meditations

1. Dashboard > **Checkout** > **Create Checkout**
2. Configura:
   - **Amount**: 4.99
   - **Currency**: EUR
   - **Description**: Meditations - Onde Publishing
   - **Success URL**: `https://onde.surf/success?book=meditations&payment=bitcoin`
   - **Cancel URL**: `https://onde.surf/libro/meditations-btc`
3. Salva e copia il **Checkout ID**

### Passo 3: Aggiungi Checkout ID al Codice

Modifica `src/components/BitcoinPayButton.tsx`:

```typescript
function getCheckoutIdForBook(bookId: string): string | null {
  const checkoutIds: Record<string, string> = {
    'meditations': 'YOUR_CHECKOUT_ID_HERE',  // <-- Aggiungi qui
  }
  return checkoutIds[bookId] || null
}
```

### Testnet (Sviluppo)

Per testare senza Bitcoin reali:
1. Usa OpenNode Sandbox: https://dev.opennode.com
2. Crea checkout in ambiente sandbox
3. Paga con wallet testnet (es. https://htlc.me)

---

## Come Testare

### 1. Avvia in locale

```bash
cd /Users/mattiapetrucciani/Onde/apps/onde-portal
npm run dev
```

### 2. Accedi alla pagina test

```
http://localhost:3000/libro/meditations-btc
```

### 3. Flow di pagamento (Hosted Checkout)

1. Click su "Pay with Bitcoin"
2. Redirect a OpenNode Hosted Checkout
3. Utente paga con Lightning o On-chain
4. OpenNode redirect a success page

### 4. Test senza Checkout ID

Se non hai ancora configurato un checkout ID:
1. Il bottone mostra un alert informativo
2. Crea checkout in OpenNode Dashboard
3. Aggiungi ID al codice
4. Rebuild e testa

---

## Pricing

Prezzi in `src/lib/bitcoin.ts`:

```typescript
export const BTC_PRICES = {
  free: 0,
  donation_small: 100,   // 1 EUR
  donation_medium: 300,  // 3 EUR
  donation_large: 500,   // 5 EUR
  ebook_small: 299,      // 2.99 EUR
  ebook_standard: 499,   // 4.99 EUR
  ebook_premium: 799,    // 7.99 EUR
  meditations_btc: 499,  // 4.99 EUR (test)
}
```

---

## Deploy su TEST (onde.surf)

### 1. Aggiungi variabili ambiente su Vercel/Cloudflare

```bash
OPENNODE_API_KEY=...
OPENNODE_WEBHOOK_SECRET=...
OPENNODE_ENV=development
NEXT_PUBLIC_URL=https://onde.surf
```

### 2. Deploy

```bash
cd apps/onde-portal
npm run deploy:test
```

### 3. Configura Webhook su OpenNode

1. Dashboard OpenNode > Webhooks
2. URL: `https://onde.surf/api/bitcoin/webhook`
3. Test con "Send Test Webhook"

---

## Prossimi Passi (NON FARE ORA)

- [ ] Test completo su onde.surf
- [ ] Approvazione Mattia
- [ ] Configurare OpenNode production
- [ ] Abilitare su onde.la
- [ ] Estendere ad altri libri
- [ ] Dashboard pagamenti BTC

---

## Troubleshooting

### Invoice non si crea

1. Verifica `OPENNODE_API_KEY` sia configurata
2. Controlla logs: `console.error` in `/api/bitcoin/create-invoice`
3. Verifica rate limits OpenNode

### Pagamento non rilevato

1. Poll interval è 3 secondi - aspetta
2. Verifica webhook sia configurato correttamente
3. Check status manualmente: `/api/bitcoin/check-status?id=...`

### QR Code non scansionabile

1. Verifica invoice sia valido (non scaduto)
2. Prova a copiare manualmente l'invoice string
3. Usa wallet compatibile BOLT11

---

## Riferimenti

- [OpenNode API Docs](https://developers.opennode.com/)
- [BOLT11 Invoice Spec](https://github.com/lightning/bolts/blob/master/11-payment-encoding.md)
- [Lightning Network](https://lightning.network/)
- Onde ROADMAP.md - Strategia El Salvador

---

*Documento creato: 2026-01-12*
*Autore: Tech Support Agent*

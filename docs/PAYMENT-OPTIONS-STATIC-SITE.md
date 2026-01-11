# Opzioni Pagamento per Siti Statici (Cloudflare Pages)

**Data**: 2026-01-10
**Contesto**: onde.surf è hostato su Cloudflare Pages (sito statico, no backend)

---

## Problema

Il sistema Stripe esistente in `apps/onde-portal/src/lib/stripe.ts` richiede backend per:
- Creare Checkout Sessions
- Gestire webhooks
- Verificare pagamenti

Su Cloudflare Pages (sito statico) questo NON funziona.

---

## Soluzioni

### 1. Stripe Payment Links (RACCOMANDATO)

**Come funziona:**
1. Vai su dashboard.stripe.com > Payment Links
2. Crea un nuovo Payment Link per ogni prodotto (es. "Salmo 23 ebook - €4.99")
3. Metti il link generato nel bottone "Acquista"
4. L'utente clicca -> va su Stripe Checkout
5. Dopo pagamento -> redirect a pagina success con link download

**Pro:**
- Facilissimo da implementare (solo cambiare URL)
- Nessun backend necessario
- Checkout hosted da Stripe (sicuro, già testato)
- Commissioni standard Stripe (2.9% + €0.25)

**Contro:**
- Meno controllo sul design checkout
- Devi creare un link per ogni prodotto manualmente

**Implementazione:**
```tsx
// Nel bottone "Acquista"
<a href="https://buy.stripe.com/xxx" target="_blank">
  Acquista su Stripe
</a>
```

---

### 2. Gumroad

**Come funziona:**
- Piattaforma all-in-one: pagamento + consegna file
- Carichi PDF su Gumroad, loro gestiscono tutto
- L'utente compra e riceve il file automaticamente

**Pro:**
- Tutto gestito (pagamento, consegna, analytics)
- Embed widget disponibile
- Già usato da molti creator

**Contro:**
- Commissione 10% + processing fee
- Brand Gumroad visibile nel checkout

---

### 3. LemonSqueezy

**Come funziona:**
- Simile a Gumroad ma con focus su software/ebook
- Gestisce EU VAT automaticamente (importante per vendite EU)

**Pro:**
- Gestione VAT EU inclusa
- Commissioni competitive (5% + processing)
- Buona UX

**Contro:**
- Meno conosciuto di Gumroad
- Setup un po' più lungo

---

### 4. Amazon KDP (già usato)

**Come funziona:**
- Vendi su Amazon come già fate
- Link diretto al prodotto Amazon

**Pro:**
- Già configurato
- Credibilità Amazon
- Formato Kindle ottimizzato

**Contro:**
- Margini bassi (35-70% royalty)
- Solo formato Kindle/paperback

---

## Raccomandazione

**Per vendita diretta PDF illustrati su onde.surf:**

1. **Stripe Payment Links** per il checkout
2. **Cloudflare R2** (o S3) per hosting PDF protetti
3. Pagina `/success?session_id=xxx` che verifica pagamento e mostra link download

**Workflow:**
1. Utente clicca "Acquista" -> Stripe Payment Link
2. Paga su Stripe Checkout
3. Redirect a `onde.surf/success?session_id=xxx`
4. Pagina success mostra link temporaneo al PDF

**Alternativa semplificata:**
- Usa Stripe Payment Link con "Dopo pagamento: redirect a URL"
- L'URL è una pagina statica con link al PDF
- Rischio: link PDF può essere condiviso (ma per ebook low-cost è accettabile)

---

## Prossimi Passi

1. Creare Payment Link su Stripe per "Salmo 23 - €4.99"
2. Aggiornare bottone in `BookReaderClient.tsx` con URL reale
3. Creare pagina `/download/salmo-23` con link al PDF
4. Testare il flusso completo

---

## Link Utili

- Stripe Payment Links: https://stripe.com/docs/payment-links
- Gumroad: https://gumroad.com
- LemonSqueezy: https://www.lemonsqueezy.com

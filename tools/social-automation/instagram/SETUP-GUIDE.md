# Instagram @onde_publishing - Setup Guide

## Account Details

| Campo | Valore |
|-------|--------|
| Username | @onde_publishing |
| Nome Display | Onde Publishing |
| Tipo | Business Account |
| Categoria | Publishing Company |
| Email | onde@freeriverhouse.com |

---

## Setup Steps (Manuale via Browser)

### 1. Crea Account Instagram

1. Vai su https://www.instagram.com/
2. Clicca "Sign Up"
3. Usa email: onde@freeriverhouse.com
4. Username: onde_publishing
5. Password: [usa password manager]

### 2. Converti in Business Account

1. Vai su Settings > Account > Switch to Professional Account
2. Scegli "Business"
3. Categoria: "Publishing Company" o "Media/News Company"
4. Conferma

### 3. Collega a Facebook Page (Opzionale)

Per usare la Meta Graph API per posting automatico:

1. Vai su Settings > Account > Linked Accounts
2. Collega la Facebook Page "Onde Publishing"
3. Questo abilita l'API per posting

### 4. Configura Profilo

**Bio:**
```
Casa Editrice Italiana
Libri per bambini che nutrono l'anima
www.onde.surf
```

**Profile Picture:**
- Usa logo Onde (da `/Users/mattia/Projects/Onde/assets/logo/`)

**Link in Bio:**
- https://onde.surf
- Oppure usa Linktree/Beacons per multi-link

### 5. Content Categories

| Tipo | Frequenza | Esempio |
|------|-----------|---------|
| Copertine libri | 2x/settimana | Nuove uscite |
| Citazioni | 3x/settimana | Quote dai libri |
| Behind the scenes | 1x/settimana | Processo creativo |
| Reels | 2x/settimana | Ninna nanne, poesie animate |
| Stories | Daily | Updates, sondaggi |

---

## Instagram Graph API Setup

### Requisiti

1. Account Instagram Business
2. Facebook Page collegata
3. App Facebook Developer

### Configurazione

1. Vai su https://developers.facebook.com/
2. Crea una nuova app (se non esiste)
3. Aggiungi il prodotto "Instagram Graph API"
4. Genera Access Token

### .env Variables

```env
# Instagram Graph API
INSTAGRAM_ACCESS_TOKEN=your_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_account_id
```

### Endpoint Base

```
https://graph.facebook.com/v18.0/{instagram-business-account-id}
```

### Posting Endpoint

```http
POST https://graph.facebook.com/v18.0/{instagram-business-account-id}/media
Content-Type: application/json

{
  "image_url": "https://...",
  "caption": "Testo del post #hashtag"
}
```

---

## Alternativa: Later/Hootsuite

Se l'API non e' pratica, usare:

- **Later** - https://later.com/
- **Hootsuite** - https://hootsuite.com/
- **Planoly** - https://planoly.com/

---

## Contenuti Pronti

### Da OndePRDB

```
/Users/mattia/Projects/OndePRDB/clients/onde/
├── posts/           # Post pronti
├── quotes/          # Citazioni per social
└── media/           # Immagini approvate
```

### Template Caption

```
[Emoji] [Titolo/Hook]

[Corpo del messaggio - 2-3 righe]

[Call to action - link in bio]

---
Illustrazione: Pina Pennello con @grok

#LibriPerBambini #OndePublishing #CasaEditrice
#ItalianBooks #Poesia #NinnaNanna
```

---

## Status

- [ ] Account creato
- [ ] Business account attivato
- [ ] Profile picture caricata
- [ ] Bio completata
- [ ] Prima post pubblicata
- [ ] Facebook Page collegata
- [ ] API configurata

---

*Task: social-ig-001*
*Ultimo aggiornamento: 2026-01-09*

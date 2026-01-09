# Setup Account Instagram Business - Onde Publishing

**Task:** social-ig-001
**Data:** 2026-01-09
**Account Target:** @onde_publishing
**Status:** GUIDA COMPLETA

---

## 1. OVERVIEW ACCOUNT

| Campo | Valore |
|-------|--------|
| **Username** | @onde_publishing (prima scelta) |
| **Alternative** | @ondebooks, @onde.books, @ondepublishing |
| **Nome Display** | Onde Publishing |
| **Tipo Account** | Business (NON Creator) |
| **Categoria** | Book Publisher / Publishing Company |
| **Email** | [email business Onde] |
| **Phone** | [numero aziendale se disponibile] |
| **Collegato a** | Meta Business Suite + Pagina Facebook Onde |

---

## 2. BIO INSTAGRAM

### Bio Principale (max 150 caratteri)

```
Onde Publishing
Libri per bambini e famiglie
AI-powered Italian publisher

onde-books.com
```

**Caratteri:** ~85 (spazio per crescere)

### Variante Alternativa

```
Onde Publishing
Italian children's books with soul
Tech | Poetry | Spirituality

linktr.ee/ondepublishing
```

### Elementi Bio
- **Nome display**: Onde Publishing (include parola chiave "Publishing")
- **Bio**: Descrive cosa facciamo in 3 righe
- **Link**: Linktree o sito diretto
- **Categoria**: Book Publisher

---

## 3. IMMAGINE PROFILO

### Specifiche Tecniche
- **Dimensione**: 320x320 px minimo (consigliato 1080x1080)
- **Formato**: PNG o JPG
- **Forma**: Circolare (verra' ritagliata)
- **Sfondo**: Colore solido o trasparente

### Design Logo
Usare il logo Onde (onde/fiore) con questi accorgimenti:
1. Verificare che sia leggibile a 110x110px (thumbnail)
2. Sfondo tinta unita se il logo e' trasparente
3. Bordo morbido, niente elementi tagliati dal crop circolare

**Path logo suggerito:** Da verificare in `assets/` o generare con Grok

### Prompt per generare logo Instagram-ready

```
Minimalist publishing house logo, abstract wave symbol that also suggests
a blooming flower, elegant gradient blue to teal, circular composition
suitable for social media profile picture, clean modern design,
professional but warm, Italian aesthetic, 4k
```

---

## 4. PROCEDURA CREAZIONE ACCOUNT

### PREREQUISITI
- [ ] Email business dedicata (non personale)
- [ ] Numero telefono per verifica
- [ ] Pagina Facebook Onde (per collegamento Business)
- [ ] Logo/foto profilo pronta
- [ ] Bio scritta e approvata

### STEP 1: Creazione Account Base

1. Vai su **instagram.com/accounts/emailsignup/** (desktop) oppure app Instagram
2. Inserisci:
   - Email: [email business Onde]
   - Nome completo: Onde Publishing
   - Username: onde_publishing
   - Password: [generare password sicura, minimo 16 caratteri]
3. Verifica email
4. Completa captcha se richiesto
5. **SALVA CREDENZIALI IN PASSWORD MANAGER IMMEDIATAMENTE**

### STEP 2: Conversione in Account Business

1. Vai su **Impostazioni** (icona hamburger > Impostazioni e privacy)
2. **Account** > **Passa a un account professionale**
3. Seleziona **Business** (NON Creator)
4. Categoria: cerca "Publisher" o "Book Publisher"
5. **Collegamento Facebook:**
   - Se esiste Pagina Facebook Onde: collegala
   - Se non esiste: creala prima o salta (puoi collegare dopo)
6. Aggiungi info contatto (email, telefono - opzionale)
7. Conferma

### STEP 3: Completare Profilo

1. **Foto profilo**: Carica logo Onde
2. **Bio**: Copia/incolla bio approvata
3. **Link in bio**: Aggiungi linktr.ee o sito
4. **Pulsanti azione**: Configura "Email" o "Contatta"
5. **Orari di attivita**: Opzionale per publisher

### STEP 4: Sicurezza

1. **Autenticazione a due fattori (2FA)**: OBBLIGATORIA
   - Impostazioni > Sicurezza > Autenticazione a due fattori
   - Usa app authenticator (Google Auth, Authy)
   - Salva codici di backup in luogo sicuro
2. **Email di sicurezza**: Verifica email corretta
3. **Dispositivi collegati**: Controlla periodicamente
4. **Password**: Unica, non usata altrove

---

## 5. META BUSINESS SUITE SETUP

### Cos'e' Meta Business Suite
Centro di controllo unificato per:
- Account Instagram Business
- Pagina Facebook
- Messenger/DM
- Analytics
- Pubblicita' (se necessario)
- Pianificazione post

### Accesso
- **URL**: business.facebook.com
- **Requisiti**: Account Facebook personale (admin)

### STEP 1: Creare Business Portfolio (ex Business Manager)

1. Vai su **business.facebook.com/create**
2. Clicca "Crea account"
3. Inserisci:
   - Nome azienda: Onde Publishing
   - Il tuo nome (admin)
   - Email aziendale
4. Conferma email
5. Accedi alla dashboard

### STEP 2: Collegare Account Instagram

1. In Meta Business Suite, vai a **Impostazioni**
2. **Account** > **Account Instagram**
3. Clicca **Aggiungi**
4. Login con credenziali Instagram @onde_publishing
5. Conferma collegamento
6. Assegna permessi agli admin se necessario

### STEP 3: Collegare Pagina Facebook

1. **Impostazioni** > **Pagine**
2. Se non esiste, crea Pagina Facebook "Onde Publishing"
   - Categoria: Book Publisher
   - Stesse info di Instagram
3. Collega Pagina a Instagram:
   - Su Instagram: Impostazioni > Account > Account collegati > Facebook
   - Seleziona Pagina Onde Publishing

### STEP 4: Configurare Ruoli e Permessi

1. **Impostazioni** > **Persone**
2. Aggiungi membri team:
   - Admin: Mattia (controllo totale)
   - Editor: altri se necessario
3. Definisci permessi per ogni ruolo

### STEP 5: Inbox Unificata

1. Dalla dashboard, vai a **Inbox**
2. Qui vedrai DM Instagram + Messenger Facebook unificati
3. Configura risposte automatiche se desiderato:
   - Messaggio di benvenuto
   - Risposta fuori orario
   - FAQ automatiche

---

## 6. META GRAPH API - COLLEGAMENTO

### Perche' serve la Graph API
- Postare programmaticamente (via bot/script)
- Analytics avanzati
- Automazione contenuti
- Integrazione con sistema PR Onde

### PREREQUISITI API
- Account Instagram Business (NON personale)
- Account collegato a Pagina Facebook
- App registrata su Meta for Developers

### STEP 1: Creare App su Meta for Developers

1. Vai su **developers.facebook.com**
2. Login con account Facebook admin
3. Clicca **Le mie app** > **Crea app**
4. Tipo app: **Business** (consigliato per publishing)
5. Nome app: "Onde Publishing App"
6. Email contatto: [email business]
7. Crea app

### STEP 2: Aggiungere Prodotti Instagram

1. Nella dashboard app, vai a **Aggiungi prodotti**
2. Trova **Instagram** e clicca **Configura**
3. Vai su **API con l'accesso di Instagram**
4. Attiva:
   - Instagram Graph API
   - Instagram Basic Display API (opzionale)

### STEP 3: Generare Token di Accesso

**Per sviluppo/test:**
1. Vai su **Strumenti** > **Esplora API Graph**
2. Seleziona la tua app
3. Aggiungi permessi:
   - `instagram_basic`
   - `instagram_content_publish`
   - `instagram_manage_comments`
   - `instagram_manage_insights`
   - `pages_show_list`
   - `pages_read_engagement`
4. Genera token di accesso utente
5. **ATTENZIONE**: Token scade dopo ~60 giorni, rinnovare

**Per produzione:**
1. Implementa OAuth flow nella tua app
2. Salva token in modo sicuro (env variables)
3. Implementa refresh automatico token

### STEP 4: Ottenere Instagram Business Account ID

```bash
# Con curl
curl -X GET \
  "https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_TOKEN"

# Risposta contiene page_id

curl -X GET \
  "https://graph.facebook.com/v18.0/{page_id}?fields=instagram_business_account&access_token=YOUR_TOKEN"

# Risposta contiene instagram_business_account.id
```

Salvare questo ID - serve per tutte le chiamate API Instagram.

### STEP 5: Test Posting via API

```bash
# 1. Prima carica immagine (creation_id)
curl -X POST \
  "https://graph.facebook.com/v18.0/{ig-user-id}/media" \
  -d "image_url=https://example.com/image.jpg" \
  -d "caption=Test post from API" \
  -d "access_token=YOUR_TOKEN"

# 2. Pubblica il contenitore
curl -X POST \
  "https://graph.facebook.com/v18.0/{ig-user-id}/media_publish" \
  -d "creation_id={creation-id-from-step-1}" \
  -d "access_token=YOUR_TOKEN"
```

### STEP 6: Salvare Credenziali in .env

```bash
# Aggiungi a /Users/mattia/Projects/Onde/.env

# Instagram Graph API
INSTAGRAM_ONDE_BUSINESS_ID=<instagram_business_account_id>
INSTAGRAM_ONDE_ACCESS_TOKEN=<long_lived_access_token>
INSTAGRAM_ONDE_PAGE_ID=<facebook_page_id>

# Meta App
META_APP_ID=<app_id>
META_APP_SECRET=<app_secret>
```

---

## 7. CONTENT STRATEGY

### Pillar Content

| Pillar | % | Contenuto | Esempi |
|--------|---|-----------|--------|
| **Libri** | 40% | Copertine, preview, annunci | Nuove uscite, behind the scenes |
| **Dietro le quinte** | 25% | Processo creativo, team | Gianni scrive, Pina illustra |
| **Poesia visiva** | 20% | Poesie illustrate, citazioni | Da catalogo Onde |
| **Educativo** | 15% | Tips lettura, consigli genitori | Come leggere ai bambini |

### Formati per Piattaforma

| Formato | Uso | Frequenza |
|---------|-----|-----------|
| **Post singoli** | Copertine, citazioni | 3-4/settimana |
| **Carousel** | Preview capitoli, tutorial | 1-2/settimana |
| **Reels** | Animazioni, behind the scenes | 2-3/settimana |
| **Stories** | Daily updates, polls, countdown | Quotidiano |
| **Live** | Q&A, letture live | 1/mese |

### Hashtag Policy (Instagram vs X)

**Instagram**: Usare hashtag strategicamente
- Max 5-10 per post (non 30)
- Mix di:
  - Brand: #OndePablishing #OndeBooks
  - Categoria: #ChildrensBooks #LibriPerBambini
  - Community: #Bookstagram #InstaBooks

**X (@Onde_FRH)**: ZERO hashtag (politica Onde)

### Orari Posting (Fuso Italia)

| Giorno | Orario Ottimale |
|--------|-----------------|
| Lun-Ven | 08:00, 12:30, 18:00, 21:00 |
| Sabato | 10:00, 15:00, 20:00 |
| Domenica | 10:00, 18:00 |

---

## 8. PRIMO POST - TEMPLATE

### Post di Lancio

**Immagine**: Logo Onde o illustrazione "welcome" stile Onde

**Caption**:
```
Benvenuti nella biblioteca di Onde

Siamo una casa editrice italiana che crea libri
per bambini e famiglie con un tocco di magia.

Poesia, tecnologia, spiritualita - tutto illustrato
con lo stile acquarello che ci caratterizza.

Seguiteci per:
- Nuove uscite
- Preview esclusive
- Dietro le quinte della creazione
- Storie della buonanotte

Onde Publishing - dove le storie prendono vita

#OndePablishing #LibriPerBambini #CasaEditrice
```

**Programmazione**:
- Giorno: Lunedi mattina (inizio settimana)
- Orario: 09:00 IT

### Post 2 - Team

**Immagine**: Gianni Parola e Pina Pennello

**Caption**:
```
Il cuore di Onde

Gianni Parola - il nostro scrittore,
custode delle parole che danzano.

Pina Pennello - la nostra illustratrice,
che trasforma storie in colori.

Insieme creano libri che parlano ai cuori
dei bambini e degli adulti che li leggono.

Chi volete conoscere meglio?

#TeamOnde #BehindTheScenes
```

### Post 3 - Libro

**Immagine**: Copertina ultimo libro (es. AIKO)

**Caption**:
```
[TITOLO LIBRO]

[Breve descrizione 2-3 righe]

Disponibile su Amazon in formato:
- Kindle
- Paperback
- Hardcover

Link in bio

#NuovaUscita #OndeBooks
```

---

## 9. PIANO PRIMA SETTIMANA

| Giorno | Tipo | Contenuto | Orario |
|--------|------|-----------|--------|
| **Lun** | Post | Lancio account "Benvenuti" | 09:00 |
| **Lun** | Story | Chi siamo (3-5 slides) | 14:00 |
| **Mar** | Carousel | 3 copertine libri | 12:30 |
| **Mar** | Story | Poll "Quale libro vi incuriosisce?" | 18:00 |
| **Mer** | Reel | Animazione poesia Stella Stellina | 18:00 |
| **Gio** | Post | Citazione illustrata | 12:30 |
| **Gio** | Story | Behind the scenes Pina | 21:00 |
| **Ven** | Post | Annuncio prossimo libro | 09:00 |
| **Ven** | Story | Countdown al weekend | 18:00 |
| **Sab** | Carousel | Preview illustrazioni | 10:00 |
| **Dom** | Story | Domanda "Cosa leggete oggi?" | 10:00 |

---

## 10. LINKING & CROSS-POSTING

### Link da Configurare

- [ ] Linktree (linktr.ee/ondepublishing)
  - Link Amazon store
  - Link sito onde-books.com
  - Link Spotify podcast
  - Link YouTube
  - Link altri social

- [ ] Sito web onde-books.com (quando pronto)
- [ ] Amazon Author Page
- [ ] Spotify for Podcasters

### Cross-Posting Setup

| Piattaforma | Collegamento | Note |
|-------------|--------------|------|
| X (@Onde_FRH) | Manuale | Adattare caption, no hashtag |
| Facebook | Automatico via Meta Suite | Stesso post |
| Pinterest | Manuale | Focus su immagini |
| TikTok | Manuale | Solo Reels verticali |

### Regole Cross-Posting

1. **Instagram-first**: Crea contenuto ottimizzato per IG
2. **Adatta per X**: Rimuovi hashtag, accorcia caption
3. **Non duplicare**: Ogni piattaforma ha la sua voce
4. **Stories IG-only**: Non crosspostare stories

---

## 11. ANALYTICS & REPORTING

### Metriche da Monitorare

**Weekly:**
- Reach totale
- Engagement rate
- Follower growth
- Best performing posts

**Monthly:**
- Audience demographics
- Best posting times
- Content type performance
- Competitor analysis

### Tool Analytics

1. **Instagram Insights** (nativo, gratuito)
   - Dashboard in-app
   - Dati ultimi 90 giorni

2. **Meta Business Suite** (gratuito)
   - Analytics cross-platform
   - Scheduling
   - Inbox unificata

3. **Creator Studio** (gratuito)
   - Alternativa a Business Suite
   - Focus su contenuti

### Report Template

```markdown
## Onde Instagram Weekly Report - [SETTIMANA]

### Overview
- Follower: [X] (+/- Y dalla scorsa settimana)
- Reach: [X] accounts
- Engagement rate: [X]%

### Top Posts
1. [Descrizione] - [X] like, [Y] commenti
2. [Descrizione] - [X] like, [Y] commenti
3. [Descrizione] - [X] like, [Y] commenti

### Insights
- [Osservazione 1]
- [Osservazione 2]

### Next Week Focus
- [Azione 1]
- [Azione 2]
```

---

## 12. CHECKLIST FINALE

### Pre-Lancio
- [ ] Email business pronta
- [ ] Password manager configurato
- [ ] Logo/immagine profilo pronta
- [ ] Bio scritta e approvata da Mattia
- [ ] Primi 5 post pronti
- [ ] Linktree configurato

### Creazione Account
- [ ] Account creato su Instagram
- [ ] Username @onde_publishing confermato
- [ ] Convertito in Business Account
- [ ] Bio e foto profilo caricati
- [ ] 2FA attivata
- [ ] Credenziali salvate in password manager

### Meta Business Suite
- [ ] Business Portfolio creato
- [ ] Account Instagram collegato
- [ ] Pagina Facebook collegata (opzionale)
- [ ] Ruoli assegnati
- [ ] Inbox configurata

### API (se necessaria)
- [ ] App creata su Meta for Developers
- [ ] Instagram Graph API attivata
- [ ] Token generato e salvato
- [ ] Business Account ID ottenuto
- [ ] Test posting riuscito
- [ ] Credenziali in .env

### Post-Lancio
- [ ] Primo post pubblicato
- [ ] Stories attive
- [ ] Risposta ai primi commenti
- [ ] Cross-link con altri social

---

## 13. NOTE IMPORTANTI

### Sicurezza
- **MAI condividere password** via chat/email
- **2FA obbligatoria** - usa app authenticator
- **Codici backup** salvati offline
- **Review dispositivi** collegati mensilmente
- **Email sicura** - verifica periodicamente

### Best Practices
- Rispondi ai commenti entro 24h
- Non comprare follower (mai)
- Contenuto originale > repost
- Qualita > quantita
- Coerenza di stile sempre

### Da NON Fare
- Non postare senza immagine/video
- Non usare solo stock photos
- Non ignorare DM per giorni
- Non crosspostare identico ovunque
- Non abusare di hashtag

---

## 14. SUPPORTO & RISORSE

### Link Utili
- [Instagram Help Center](https://help.instagram.com/)
- [Meta Business Help](https://www.facebook.com/business/help)
- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api/)
- [Creator Studio](https://business.facebook.com/creatorstudio/)

### Contatti Interni
- **Problemi tecnici**: Mattia
- **Contenuti**: Gianni Parola (testi), Pina Pennello (visual)
- **Approvazioni**: Telegram @OndePR_bot

---

## 15. CHANGELOG

| Data | Modifica | Autore |
|------|----------|--------|
| 2026-01-09 | Creazione documento completo | Code Worker |
| | Aggiunta sezione Meta Business Suite | |
| | Aggiunta sezione Graph API | |
| | Content strategy e piano prima settimana | |

---

## STATUS TASK

- [x] Strategia definita
- [x] Bio preparata
- [x] Content plan prima settimana
- [x] Guida Meta Business Suite
- [x] Guida Graph API
- [x] Checklist complete
- [ ] Account creato (richiede Mattia)
- [ ] Logo caricato
- [ ] Primi post pubblicati
- [ ] API configurata

---

## AZIONI PER MATTIA

1. **Decidere username finale**: @onde_publishing vs @ondebooks
2. **Confermare email business** da usare
3. **Creare account** (seguendo guida sopra)
4. **Approvare bio** proposta
5. **Generare/approvare logo** per profilo
6. **Creare Pagina Facebook** Onde (se non esiste)
7. **Configurare API** (opzionale, per automazione)

---

*Documentazione generata da Code Worker - Task social-ig-001 - 2026-01-09*

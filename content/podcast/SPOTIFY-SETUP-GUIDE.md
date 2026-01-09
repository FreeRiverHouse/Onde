# Guida Setup Spotify for Podcasters - Onde

## Panoramica

Spotify for Podcasters (ex Anchor) e' la piattaforma gratuita di Spotify per pubblicare e distribuire podcast. Permette distribuzione automatica su tutte le principali piattaforme.

---

## Requisiti Prima di Iniziare

### 1. Account e Email
- [ ] Email dedicata per il podcast (consigliato: `podcast@onde.surf` o simile)
- [ ] Account Spotify esistente (o crearne uno nuovo)
- [ ] Account Google/Apple per login alternativo

### 2. Artwork del Podcast (OBBLIGATORIO)
- **Dimensioni**: 3000x3000 pixel (quadrato)
- **Formato**: JPG o PNG
- **Dimensione file**: Max 512KB
- **Colori**: RGB (no CMYK)
- **Contenuto**: NO testo piccolo illeggibile, NO immagini sgranate

**Per Onde**: Usare lo stile acquarello Onde con il logo
- Path reference: `content/branding/podcast-cover.jpg`

### 3. Descrizione del Podcast
- Titolo: max 50 caratteri (consigliato)
- Descrizione: 150-200 parole
- Lingua: Italiana (o multilingua)
- Categoria: selezionare da lista Spotify

### 4. Primo Episodio Pronto
- Audio MP3 (320kbps consigliato)
- Durata minima: 1 minuto
- Titolo episodio
- Descrizione episodio

---

## Step-by-Step: Creare Account Spotify for Podcasters

### Step 1: Accedi alla Piattaforma
1. Vai su **podcasters.spotify.com**
2. Clicca "Get Started"
3. Accedi con account Spotify esistente (consigliato) o crea nuovo account

### Step 2: Crea Nuovo Podcast
1. Clicca "Create a podcast"
2. Seleziona "I want to make a new podcast"
3. NON selezionare "I have an existing podcast" (a meno che tu non stia migrando)

### Step 3: Informazioni Base
1. **Nome podcast**: "Piccole Rime - Storie e Poesie per Bambini"
2. **Descrizione**: (vedi template sotto)
3. **Lingua**: Italiano
4. **Categoria primaria**: Kids & Family > Stories for Kids
5. **Categoria secondaria**: Arts > Books (opzionale)

### Step 4: Upload Artwork
1. Carica immagine 3000x3000px
2. Verifica anteprima su mobile
3. Conferma

### Step 5: Impostazioni Avanzate
1. **Explicit content**: No (siamo per bambini!)
2. **Episode schedule**: Settimanale (consigliato)
3. **Monetization**: Disabilita per ora

### Step 6: Primo Episodio
1. Clicca "New Episode"
2. Upload file audio
3. Aggiungi titolo e descrizione
4. Seleziona data pubblicazione (o pubblica subito)
5. Clicca "Publish"

### Step 7: Distribuzione
Spotify distribuisce automaticamente su:
- Apple Podcasts
- Google Podcasts
- Amazon Music
- iHeartRadio
- E altri 10+ servizi

Potrebbero volerci 24-48 ore per apparire su tutte le piattaforme.

---

## Template Descrizione Podcast Onde

### Podcast: Piccole Rime - Storie e Poesie per Bambini

```
Piccole Rime e' il podcast di Onde che porta le piu' belle poesie italiane nelle orecchie dei bambini.

Ogni settimana, Gianni Parola legge una poesia classica della tradizione italiana - da Lina Schwarz a Guido Gozzano, da Trilussa ad Angiolo Silvio Novaro - raccontandola con voce calda e spiegazioni adatte ai piu' piccoli.

Perfetto per:
- La buonanotte
- Il viaggio in macchina
- I momenti di calma

Eta' consigliata: 4-8 anni (ma piace anche ai grandi!)

Un podcast di Onde Publishing.
```

**Caratteri**: ~530 (sotto il limite di 600)

---

## Best Practices Metadata

### Titolo Episodio
- Inizia con numero episodio: "Ep. 01 - Stella Stellina"
- Includi autore se famoso: "Ep. 02 - Che Dice la Pioggerellina (Novaro)"
- Max 60 caratteri per visibilita' completa

### Descrizione Episodio
Struttura consigliata:

```
In questo episodio, Gianni Parola legge "Titolo Poesia" di Nome Autore.

Una poesia su [tema] perfetta per [momento].

[1-2 frasi sulla poesia o l'autore]

---
Voce: Gianni Parola
Testo: [Autore] (dominio pubblico)
Produzione: Onde Publishing

#poesiaperbambini #filastrocche #buonanotte
```

**Nota**: Gli hashtag funzionano ancora su Spotify (diverso da X!)

### Tags/Keywords
Usare sempre:
- poesia bambini
- filastrocche
- storie della buonanotte
- audiolibri bambini
- italiano per bambini

---

## Categorie Consigliate per Podcast Onde

### Per contenuti bambini
- **Primaria**: Kids & Family > Stories for Kids
- **Secondaria**: Arts > Books

### Per contenuti educativi
- **Primaria**: Kids & Family > Education for Kids
- **Secondaria**: Education > Language Learning

### Per contenuti spirituali/meditativi
- **Primaria**: Religion & Spirituality > Spirituality
- **Secondaria**: Health & Fitness > Mental Health

---

## Checklist Pre-Pubblicazione Episodio

- [ ] Audio quality check (no rumori, volume uniforme)
- [ ] Intro Onde presente (jingle 3 sec)
- [ ] Outro Onde presente (jingle 3 sec)
- [ ] Titolo segue naming convention
- [ ] Descrizione completa con credits
- [ ] Artwork episodio (opzionale ma consigliato)
- [ ] Data pubblicazione impostata
- [ ] Preview ascoltata per intero

---

## Integrazione con Workflow Onde

### Path Audio Finali
`/content/podcast-episodes/[nome-episodio]/final.mp3`

### Naming Convention File
`onde-podcast-ep[XX]-[titolo-breve].mp3`

Esempio: `onde-podcast-ep01-stella-stellina.mp3`

### Script Episodi
`/content/podcast/ep[XX]-[titolo]-script.md`

### Workflow Automatico (futuro)
1. Script approvato in `/content/podcast/`
2. ElevenLabs genera audio
3. Audio editato con intro/outro
4. Upload automatico su Spotify via API
5. Notifica Telegram quando live

---

## Note Tecniche

### Formato Audio Consigliato
- **Codec**: MP3
- **Bitrate**: 128-320 kbps (192 consigliato)
- **Sample rate**: 44.1 kHz
- **Canali**: Mono (per parlato) o Stereo (con musica)
- **Loudness**: -16 LUFS (standard podcast)

### Durata Episodi
- **Minimum**: 1 minuto
- **Consigliato Onde**: 4-8 minuti per episodio
- **Maximum**: Nessun limite

---

## Risorse

- **Dashboard**: podcasters.spotify.com
- **Supporto**: support.spotify.com/podcasters
- **Analytics**: Disponibili in dashboard dopo 24h

---

*Documento creato: 9 Gennaio 2026*
*Ultimo aggiornamento: 9 Gennaio 2026*
*Autore: Code Worker Onde*

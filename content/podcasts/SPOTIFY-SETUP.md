# Spotify for Creators - Setup Podcast Onde

**Documento preparato per Mattia Petrucciani**
**Data: 10 Gennaio 2026**

---

## CHECKLIST RAPIDA - Cosa Serve per Creare l'Account

### Prima di iniziare
- [ ] Email: usare `freeriverhouse@gmail.com` o email dedicata `podcast@onde.la`
- [ ] Account Spotify esistente (consigliato usare uno gia' loggato)
- [ ] Artwork 3000x3000px pronto (vedi sotto)
- [ ] Primo episodio MP3 pronto (Stella Stellina - DONE!)

### Durante la creazione
- [ ] Nome podcast scelto
- [ ] Descrizione scritta
- [ ] Categoria selezionata
- [ ] Artwork uploadato
- [ ] Primo episodio caricato

---

## 1. NOME PODCAST - Opzioni

| Opzione | Pro | Contro |
|---------|-----|--------|
| **Onde Stories** | Breve, brand-centered, internazionale | Generico |
| **Storie della Buonanotte by Onde** | Descrittivo, SEO italiano | Lungo |
| **Piccole Rime** | Specifico, poetico | Limita a poesie |
| **Onde Podcast** | Semplice, brand | Molto generico |

**Consiglio**: "Onde Stories - Storie e Poesie per Bambini"
- Internazionale ma con sottotitolo italiano
- Flessibile per contenuti futuri (non solo rime)

---

## 2. DESCRIZIONE PODCAST

### Versione Italiana (principale)
```
Onde Stories porta le piu' belle storie e poesie nelle orecchie dei tuoi bambini.

Ogni settimana, nuove letture dalla tradizione italiana e internazionale, narrate con voce calda per accompagnare i momenti speciali della giornata: la buonanotte, il viaggio in macchina, i momenti di calma.

Con le voci della redazione Onde, tra cui Gianni Parola e i nostri narratori, riscopriamo insieme i classici che hanno fatto sognare generazioni di bambini.

Eta' consigliata: 3-10 anni (ma piace anche ai grandi!)

Un podcast di Onde Publishing - onde.la
```

### Versione Breve (per limiti caratteri)
```
Storie e poesie per bambini lette con voce calda. Perfette per la buonanotte, il viaggio in macchina, i momenti di calma. Dalla tradizione italiana e internazionale. Eta' 3-10 anni. Un podcast di Onde Publishing.
```

---

## 3. ARTWORK - SPECIFICHE TECNICHE

### Requisiti Obbligatori Spotify
| Requisito | Valore |
|-----------|--------|
| **Dimensioni** | 3000 x 3000 pixel (minimo 1400x1400) |
| **Aspect Ratio** | 1:1 (quadrato) |
| **Formato** | JPEG o PNG |
| **File Size** | Max 512KB (consigliato sotto 200KB) |
| **Color Space** | sRGB, 24bit |
| **Risoluzione** | 72 DPI minimo |

### Cosa DEVE Avere
- Nome podcast leggibile anche in thumbnail piccola (150px)
- Logo o branding Onde riconoscibile
- Stile acquarello europeo (coerente con brand Onde)
- Colori caldi, accoglienti

### Cosa EVITARE
- Testo troppo piccolo (illeggibile su mobile)
- Immagini sgranate o pixelate
- Troppi elementi (confusionario in piccolo)
- Scritte su sfondi che non contrastano

### Prompt Suggerito per Pina Pennello/Grok
```
Square podcast cover art 3000x3000, European watercolor children's book illustration style, magical nighttime scene with stars and moon, cozy warm atmosphere, gentle river or wave motif (onde), soft golden light, text area at top for podcast name, elegant simple composition, Beatrix Potter meets Luzzati aesthetic, warm amber and deep blue colors, NOT Pixar NOT 3D, professional podcast artwork, 4k
```

### Path Consigliato Output
`/Users/mattia/Projects/Onde/content/branding/podcast/onde-stories-cover-3000x3000.jpg`

---

## 4. CATEGORIA E IMPOSTAZIONI

### Categoria Spotify
- **Primaria**: Kids & Family > Stories for Kids
- **Secondaria**: Arts > Books

### Impostazioni
| Setting | Valore |
|---------|--------|
| Explicit Content | NO |
| Language | Italian |
| Country | United States (o Italy) |
| Episode Order | Serial (episodi numerati) |

---

## 5. PRIMO EPISODIO: STELLA STELLINA

### File Pronti
| File | Path | Durata |
|------|------|--------|
| Audio ElevenLabs | `/packages/onde-multimedia/podcast/episodes/ep01-stella-stellina-elevenlabs.mp3` | ~4 min |
| Audio alternativo | `/packages/onde-multimedia/podcast/episodes/onde-podcast-ep01-stella-stellina.mp3` | ~2.5 min |
| Script | `/packages/onde-multimedia/scripts/episode-01-stella-stellina.md` | - |

### Metadata Episodio 1
```
Titolo: Ep. 01 - Stella Stellina
Stagione: 1
Numero: 1
Tipo: Full Episode

Descrizione:
La prima puntata di Onde Stories! Gianni Parola legge "Stella Stellina",
la ninna nanna piu' amata della tradizione italiana, scritta da Lina Schwarz.

Una poesia dolcissima che racconta come ogni creatura, dalla mucca al pulcino,
ha qualcuno che la protegge durante la notte.

Perfetta per la buonanotte.

---
Voce: Gianni Parola (ElevenLabs)
Testo: Lina Schwarz (1876-1947, dominio pubblico)
Produzione: Onde Publishing

#poesiaperbambini #ninnananna #stellastellina #buonanotte
```

---

## 6. COME UPLOADARE EPISODI

### Step-by-Step Upload
1. Vai su **creators.spotify.com** e login
2. Seleziona il tuo podcast
3. Clicca **"New Episode"** in alto a destra
4. **Upload audio**: trascina il file MP3
5. **Titolo**: inserisci titolo episodio
6. **Descrizione**: copia/incolla la descrizione preparata
7. **Stagione/Numero**: imposta se usi serie numerata
8. **Artwork episodio** (opzionale): upload immagine dedicata
9. **Explicit**: seleziona NO
10. **Pubblica**: scegli "Pubblica ora" o imposta data futura
11. **Conferma** e attendi elaborazione (1-5 minuti)

### Formato Audio Raccomandato
| Parametro | Valore |
|-----------|--------|
| Codec | MP3 |
| Bitrate | 128-192 kbps (192 consigliato) |
| Sample Rate | 44.1 kHz |
| Canali | Mono (parlato) o Stereo (con musica) |
| Loudness | -16 LUFS (standard podcast) |
| Max File Size | 200 MB per episodio |

---

## 7. DISTRIBUZIONE AUTOMATICA

Una volta pubblicato su Spotify for Creators, il podcast viene distribuito automaticamente su:

- Apple Podcasts
- Amazon Music / Audible
- Google Podcasts
- iHeartRadio
- Podcast Index
- Overcast
- Pocket Casts
- E 10+ altre piattaforme

**Tempo**: 24-72 ore per apparire su tutte le piattaforme.

### Per RSS Feed Esterno
Se vuoi il feed RSS per distribuire manualmente:
1. Vai in Settings > Distribution
2. Abilita "RSS feed"
3. Copia l'URL del feed
4. NOTA: La tua email sara' visibile nel feed RSS

---

## 8. MONETIZZAZIONE (Futuro)

### Spotify Partner Program - Requisiti 2026
| Requisito | Valore |
|-----------|--------|
| Episodi pubblicati | Minimo 3 |
| Audience 30 giorni | 1,000 ascoltatori |
| Ore consumate 30 giorni | 2,000 ore |
| Hosting | Su Spotify for Creators |

### Opzioni Monetizzazione
- **Ads automatici**: Spotify inserisce ads, 50% revenue share
- **Subscriptions**: Contenuti premium a pagamento (dopo 60 giorni + 100 ascoltatori)
- **Sponsorship tools**: In arrivo Aprile 2026

**Consiglio**: Non attivare monetizzazione subito. Prima costruire audience.

---

## 9. PROSSIMI EPISODI PRONTI

| Ep. | Titolo | Autore | Status |
|-----|--------|--------|--------|
| 01 | Stella Stellina | Lina Schwarz | PRONTO |
| 02 | Pioggerellina | A.S. Novaro | Script pronto |
| 03 | La Befana | Guido Gozzano | Script pronto |
| 04 | Il Pulcino | - | Script pronto |
| 05 | Il Pesciolino | - | Script pronto |

Path scripts: `/Users/mattia/Projects/Onde/content/podcast/`

---

## 10. LINK UTILI

- **Dashboard**: https://creators.spotify.com
- **Supporto**: https://support.spotify.com/us/creators/
- **Specifiche tecniche**: https://support.spotify.com/us/creators/article/podcast-specification-doc/
- **Cover art guide**: https://creators.spotify.com/resources/create/dos-donts-showart

---

## AZIONI PER MATTIA

1. [ ] Decidere nome podcast finale
2. [ ] Generare artwork 3000x3000 (con Pina/Grok o designer)
3. [ ] Andare su creators.spotify.com
4. [ ] Login con account Spotify
5. [ ] Creare nuovo podcast con info sopra
6. [ ] Uploadare artwork
7. [ ] Uploadare ep01-stella-stellina-elevenlabs.mp3
8. [ ] Pubblicare!
9. [ ] Condividere link su @Onde_FRH

---

*Documento creato: 10 Gennaio 2026*
*Fonti: Spotify for Creators documentation, The Podcast Consultant, Riverside*

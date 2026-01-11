# Hedra AI - Guida Completa per Lip Sync Emotivo

**Ultimo aggiornamento**: 2026-01-10
**Account**: freeriverhouse@gmail.com
**Crediti disponibili**: 17805
**Piano**: Basic Web Yearly ($144/anno - scadenza 8 Gen 2027)

---

## Cos'e Hedra

Hedra e un servizio AI specializzato in video lip sync. Permette di creare video con personaggi parlanti a partire da:
- Una singola immagine statica (ritratto)
- Un file audio (voce registrata o generata)

Il modello **Character-3** e il piu avanzato e produce animazioni facciali emotive, non solo movimenti labiali.

---

## Accesso

### Web Interface
- **URL**: https://www.hedra.com/
- **Login**: Google account (freeriverhouse@gmail.com)
- **Dashboard**: Dopo login, clicca "Try Beta" per accedere alla generazione

### API (per automazione)
- **Documentazione**: https://www.hedra.com/docs
- **API Profile**: https://www.hedra.com/api-profile
- **Requisiti**: Piano Creator o superiore + API key
- **Node.js SDK**: https://github.com/hedra-labs/hedra-node
- **Python Starter**: https://github.com/hedra-labs/hedra-api-starter

---

## Come Usare la Web Interface

### Pannello 1 - Audio (sinistra)

**Opzioni disponibili:**
1. **Text-to-Speech**: Scrivi il testo e Hedra genera l'audio con voci AI
2. **Import Audio**: Carica un file audio esistente (MP3, WAV)
3. **Start Recording**: Registra la tua voce con il microfono

**Limiti audio:**
- Account free: 30-60 secondi max
- Account pagato: fino a 5 minuti

**Best practices audio:**
- Rimuovi rumori di fondo
- Evita compressione eccessiva
- Velocita naturale del parlato (non troppo veloce)
- Evita urla o toni estremi

### Pannello 2 - Character (centro)

**Opzioni disponibili:**
1. **Upload immagine**: Drag & drop di JPG, PNG, WebP
2. **Incolla da clipboard**: Ctrl/Cmd + V
3. **Genera da testo**: Descrivi il personaggio e Hedra crea l'immagine

**Requisiti immagine per risultati ottimali:**
- **Angolo**: Frontale o 3/4 (NO profili laterali!)
- **Risoluzione**: Almeno 512x512 px
- **Viso**: Chiaramente visibile, ben illuminato
- **Sfondo**: Preferibilmente uniforme o semplice

### Pannello 3 - Output (destra)

**Aspect Ratio disponibili:**
- 1:1 (quadrato) - default
- 16:9 (orizzontale/widescreen)
- 9:16 (verticale/stories)

**Dopo la generazione:**
- Download video MP4
- Rigenerazione con parametri diversi
- Condivisione diretta

---

## Workflow per Gianni Parola

### Immagine di Riferimento
**Path**: `/Users/mattia/Projects/Onde/assets/characters/GianniA-Scrittore.jpg`

Caratteristiche:
- Uomo italiano ~40 anni
- Capelli ricci scuri
- Occhiali tondi dorati
- Giacca tweed marrone
- Aspetto caldo e intellettuale
- Angolo 3/4 frontale (perfetto per lip sync)

### Step-by-Step

1. **Vai su** https://www.hedra.com/ e fai login
2. **Clicca** "Try Beta" per accedere alla generazione
3. **Nel pannello Audio**:
   - Se hai audio pre-registrato: clicca "Import Audio" e carica il file
   - Se vuoi usare TTS: scrivi il testo e scegli una voce italiana/neutra
4. **Nel pannello Character**:
   - Drag & drop `GianniA-Scrittore.jpg`
   - Verifica che il viso sia riconosciuto correttamente
5. **Seleziona aspect ratio**:
   - 9:16 per social stories/reels
   - 16:9 per YouTube
   - 1:1 per post
6. **Clicca "Generate Video"**
7. **Attendi** la generazione (1-3 minuti)
8. **Scarica** il video generato

---

## Esempi Gia Generati

| File | Descrizione | Path |
|------|-------------|------|
| gianni-parola-lipsync-test.mp4 | Test iniziale | `~/Downloads/gianni-parola-lipsync-test.mp4` |
| gianni-stella-stellina-lipsync.mp4 | Poesia Stella Stellina | `~/Downloads/gianni-stella-stellina-lipsync.mp4` |

---

## Best Practices per Lip Sync Emotivo

### Per risultati espressivi:
1. **Audio con emozione**: L'AI rispecchia il tono dell'audio
2. **Pause naturali**: Lascia respiri tra le frasi
3. **Variazione tono**: Evita voce monotona
4. **Qualita audio alta**: Riduci rumore, usa microfono decente

### Errori comuni da evitare:
- Immagini di profilo laterale (risultati pessimi)
- Audio con troppo rumore di fondo
- Parlato troppo veloce
- Immagini con viso parzialmente coperto
- Occhiali da sole o elementi che coprono il viso

---

## API - Per Automazione Futura

### Installazione Node.js SDK
```bash
npm install hedra
```

### Uso base
```javascript
import Hedra from 'hedra';

const client = new Hedra({
  apiKey: process.env.HEDRA_API_KEY,
});

// Genera video da audio + immagine
const result = await client.characters.generate({
  audio_url: 'https://...',
  image_url: 'https://...',
  aspect_ratio: '9:16'
});

// Polling per status
const status = await client.characters.getStatus(result.job_id);
```

### Workflow API
1. Upload audio su storage (S3, Cloudflare R2, etc.)
2. Upload immagine su storage
3. Chiama API con URL di audio e immagine
4. Poll per stato completamento
5. Scarica video generato

---

## Pricing e Crediti

### Sistema crediti
- Ogni generazione consuma crediti
- Durata video e risoluzione influenzano costo
- Crediti attuali: **17805**

### Piani disponibili
| Piano | Prezzo | Caratteristiche |
|-------|--------|-----------------|
| Free | $0 | Crediti limitati, watermark |
| Basic | $8/mese | Piu crediti, no watermark |
| Creator | $24/mese | API access, HD output |
| Pro | $96/mese | Volume alto, priorita |

### Limitazioni geografiche
**NON disponibile** per utenti in: Illinois, Texas, Washington (USA)

---

## Integrazione con Onde

### Casi d'uso
1. **Video promozionali**: Gianni presenta i libri
2. **Storie della buonanotte**: Gianni legge poesie
3. **Contenuti social**: Clip brevi per TikTok/Reels
4. **Podcast video**: Versione video dei podcast audio

### Workflow consigliato
1. **Audio**: Genera con ElevenLabs (voce Gianni)
2. **Immagine**: Usa sempre `GianniA-Scrittore.jpg`
3. **Genera**: Hedra web interface o API
4. **Post-produzione**: Aggiungi titoli/sottotitoli se necessario

---

## Risorse

- [Documentazione ufficiale](https://www.hedra.com/docs)
- [Blog - Guida AI Lip Sync](https://www.hedra.com/blog/ai-lip-sync-video-guide)
- [API Profile](https://www.hedra.com/api-profile)
- [GitHub Node.js SDK](https://github.com/hedra-labs/hedra-node)
- [GitHub Python Starter](https://github.com/hedra-labs/hedra-api-starter)

---

## Note

- **NON spendere crediti** senza approvazione di Mattia
- **Usa SEMPRE** l'immagine ufficiale di Gianni per coerenza
- **Verifica ElevenLabs** voice ID prima di generare audio
- **Salva tutti i video** generati in `/Volumes/DATI-SSD/onde-youtube/` o Downloads

---

*Documentazione creata per task video-factory-001*

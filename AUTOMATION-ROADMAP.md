# Automazione Factory Notturna - Piano Implementazione
# Creato: 2026-01-08 notte
# Obiettivo: La factory continua a produrre mentre Mattia dorme

---

## Il Problema Attuale

Quando Mattia va a dormire, la produzione si ferma perché:
1. Claude Code richiede una sessione attiva con un umano
2. Non ci sono script automatici che girano di notte
3. I task che potrebbero essere automatizzati non lo sono

---

## Soluzione: Multi-Layer Automation

### Layer 1: GitHub Actions (Cron Jobs)
**Cosa può fare**: Eseguire script Node.js/Python a orari programmati

**Workflow possibili:**
```yaml
# .github/workflows/nightly-content.yml
name: Nightly Content Generation
on:
  schedule:
    - cron: '0 2 * * *'  # Ogni notte alle 2:00 AM

jobs:
  generate-content:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
      - name: Generate content
        run: node scripts/generate-content.js
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          ELEVENLABS_API_KEY: ${{ secrets.ELEVENLABS_API_KEY }}
```

**Task automatizzabili:**
- [ ] Generare audio con ElevenLabs API
- [ ] Tradurre testi in altre lingue (Claude API)
- [ ] Creare sottotitoli per video
- [ ] Preparare metadata per upload
- [ ] Generare draft post per social

### Layer 2: Script Locali su Mac Server
**Cosa può fare**: Task più pesanti che richiedono GPU o storage locale

**Script da creare:**
- `scripts/generate-audio.js` - ElevenLabs batch audio
- `scripts/translate-content.js` - Traduzioni multilingua
- `scripts/prepare-video-assets.js` - Assembla asset video
- `scripts/lip-sync-local.py` - Wav2Lip/SadTalker locale

**Scheduling con launchd (macOS):**
```xml
<!-- ~/Library/LaunchAgents/com.onde.nightly.plist -->
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.onde.nightly</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/Users/mattia/Projects/Onde/scripts/nightly-factory.js</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>2</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
</dict>
</plist>
```

### Layer 3: Claude API per Generazione Contenuti
**Differenza da Claude Code:**
- Claude Code = interattivo, richiede umano
- Claude API = programmabile, può girare in script

**Uso consigliato:**
```javascript
// scripts/generate-content.js
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

async function generatePodcastScript(poem) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `Genera uno script per video podcast per questa poesia:\n\n${poem}`
    }]
  });
  return response.content[0].text;
}
```

---

## Task Automatizzabili SENZA Approvazione

| Task | Tool | Automazione |
|------|------|-------------|
| Generare audio da testo | ElevenLabs API | ✅ Possibile |
| Tradurre testi | Claude API | ✅ Possibile |
| Creare sottotitoli | Whisper/Claude | ✅ Possibile |
| Preparare prompt Grok | Claude API | ✅ Possibile |
| Organizzare file | Script Node | ✅ Possibile |
| Backup su GitHub | Git Actions | ✅ Possibile |

## Task che RICHIEDONO Approvazione

| Task | Motivo |
|------|--------|
| Pubblicare video YouTube | Contenuto pubblico |
| Postare su X | Contenuto pubblico |
| Generare illustrazioni finali | Scelta stilistica |
| Upload KDP | Pubblicazione ufficiale |

---

## Piano Implementazione

### Fase 1: Setup Base (Questa settimana)
- [ ] Creare `scripts/` folder con script base
- [ ] Setup ElevenLabs API in .env
- [ ] Creare primo GitHub Action per test
- [ ] Documentare tutti gli script

### Fase 2: Audio Pipeline (Settimana 2)
- [ ] Script batch per generare audio episodi
- [ ] Cron job notturno per nuovi episodi
- [ ] Notifica Telegram quando audio pronti

### Fase 3: Translation Pipeline (Settimana 3)
- [ ] Script traduzione multilingua
- [ ] 6 lingue: IT, EN, ES, FR, DE, PT
- [ ] Output in cartelle organizzate

### Fase 4: Full Factory (Settimana 4)
- [ ] Pipeline completa: testo → audio → assets
- [ ] Queue di task pendenti
- [ ] Dashboard status (opzionale)

---

## Secrets Necessari

Aggiungere a GitHub Secrets:
- `ANTHROPIC_API_KEY` - Per Claude API
- `ELEVENLABS_API_KEY` - Per audio
- `TELEGRAM_BOT_TOKEN` - Per notifiche
- `TELEGRAM_CHAT_ID` - Per notifiche

---

## Notifiche

Quando la factory notturna completa task:
1. Manda messaggio Telegram con riepilogo
2. Crea issue GitHub con materiale pronto
3. Mattia al risveglio sa cosa approvare

---

## Costi Stimati

| Servizio | Costo/mese | Note |
|----------|------------|------|
| GitHub Actions | $0 | Free tier sufficiente |
| Claude API | ~$10-20 | Dipende dal volume |
| ElevenLabs | ~$5-22 | Dipende dal piano |
| **Totale** | ~$15-40/mese | |

vs. Tempo risparmiato: 2-4 ore/giorno di lavoro manuale

---

*Prossimo step: Creare primo script e testare*

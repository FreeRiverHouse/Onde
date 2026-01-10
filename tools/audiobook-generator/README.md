# Onde Audiobook Generator

Genera audiobook dai libri Onde usando ElevenLabs TTS.

Voce: **Gianni Parola** (narratore ufficiale Onde)

---

## Quick Start

```bash
# Installa dipendenze
npm install dotenv

# Configura .env
echo "ELEVENLABS_API_KEY=your_api_key" >> /Users/mattia/Projects/Onde/.env
echo "ELEVENLABS_VOICE_GIANNI=your_voice_id" >> /Users/mattia/Projects/Onde/.env

# Lista libri disponibili
node generate-audiobook.js --list

# Genera audiobook (dry run prima!)
node generate-audiobook.js --dry-run --book salmo-23-bambini

# Genera audiobook
node generate-audiobook.js --book salmo-23-bambini
```

---

## Uso

### Comandi

```bash
# Lista tutti i libri disponibili
node generate-audiobook.js --list

# Genera audiobook per un libro specifico
node generate-audiobook.js --book <nome-libro>

# Dry run (mostra cosa farebbe senza generare)
node generate-audiobook.js --dry-run --book <nome-libro>

# Genera tutti i libri
node generate-audiobook.js --all
```

### Opzioni

| Opzione | Alias | Descrizione |
|---------|-------|-------------|
| `--book` | `-b` | Nome del libro da processare |
| `--all` | `-a` | Processa tutti i libri |
| `--list` | `-l` | Lista libri disponibili |
| `--dry-run` | `-d` | Simula senza generare audio |
| `--help` | `-h` | Mostra aiuto |

---

## Configurazione

### Variabili d'ambiente (.env)

```bash
# API Key ElevenLabs
ELEVENLABS_API_KEY=your_api_key_here

# Voice ID per Gianni Parola
ELEVENLABS_VOICE_GIANNI=voice_id_here
```

### Come ottenere Voice ID

1. Vai su https://elevenlabs.io/app/voice-lab
2. Crea o seleziona una voce
3. Copia il Voice ID dal menu della voce

### Voce Gianni Parola

Per la voce di Gianni Parola, usa una di queste opzioni:

**Opzione A - Voice Cloning (consigliato)**
1. Registra 3-5 minuti di audio di riferimento
2. Voce maschile italiana, 35-45 anni
3. Tono caldo, ritmo pacato
4. Upload su ElevenLabs Voice Lab

**Opzione B - Voci Pre-fatte**
- **Brian** - Maschile, calmo, narrativo
- **Daniel** - Maschile, chiaro, professionale
- **Antoni** - Maschile, caldo, italiano-friendly

---

## Input/Output

### Directory libri cercate

Lo script cerca libri in:
- `/Users/mattia/Projects/Onde/content/books/`
- `/Users/mattia/Projects/Onde/books/`

### File di testo riconosciuti

- `libro.md` / `libro.txt`
- `text.md` / `text.txt`
- `book.md` / `book.txt`
- `testo.md` / `testo.txt`
- `audiobook-script.txt`

### Output

```
/Volumes/DATI-SSD/onde-audiobooks/<book-name>/
  chapter-01.mp3
  chapter-02.mp3
  chapter-03.mp3
  ...
  metadata.json
```

### Metadata.json

```json
{
  "book": "salmo-23-bambini",
  "source": "/Users/mattia/Projects/Onde/books/salmo-23-bambini/libro.md",
  "generatedAt": "2026-01-10T12:00:00.000Z",
  "chapters": [
    { "number": 1, "title": "Capitolo 1", "characters": 500 }
  ],
  "totalCharacters": 3000,
  "estimatedCost": "0.90",
  "voice": "Gianni Parola",
  "model": "eleven_multilingual_v2"
}
```

---

## Costi

ElevenLabs pricing: ~$0.30 per 1000 caratteri

| Libro | Caratteri stimati | Costo |
|-------|-------------------|-------|
| Salmo 23 Bambini | ~3,000 | ~$0.90 |
| AIKO AI Children | ~15,000 | ~$4.50 |
| Piccole Rime | ~5,000 | ~$1.50 |

**IMPORTANTE**: Usa sempre `--dry-run` prima per vedere i costi!

---

## Esempi

### 1. Preview prima di generare

```bash
node generate-audiobook.js --dry-run --book salmo-23-bambini
```

Output:
```
=== Processing: salmo-23-bambini ===
  Chapters found: 6
  Total characters: 2,850
  Estimated cost: $0.86

  Chapter 1: Capitolo 1: Il Signore e il mio pastore
    Characters: 420
    [DRY RUN] Would generate audio
  ...
```

### 2. Genera un singolo libro

```bash
node generate-audiobook.js --book salmo-23-bambini
```

### 3. Genera tutti i libri

```bash
node generate-audiobook.js --all
```

---

## Troubleshooting

### "ELEVENLABS_API_KEY not found"

Aggiungi la chiave API al file `.env`:
```bash
echo "ELEVENLABS_API_KEY=your_key" >> /Users/mattia/Projects/Onde/.env
```

### "Voice ID not provided"

Aggiungi il Voice ID per Gianni Parola:
```bash
echo "ELEVENLABS_VOICE_GIANNI=your_voice_id" >> /Users/mattia/Projects/Onde/.env
```

### "Rate limit exceeded"

Lo script include delay automatici. Se ricevi ancora errori:
1. Aspetta qualche minuto
2. Riprova con `--chapter` per un singolo capitolo

### "Book not found"

Usa `--list` per vedere i libri disponibili:
```bash
node generate-audiobook.js --list
```

---

## Integrazione con Pipeline

Questo script fa parte della pipeline audiobook di Onde:

```
Testo libro (.md)
    -> generate-audiobook.js (questo script)
    -> Audio capitoli (.mp3)
    -> add-background.js (musica opzionale)
    -> export-audiobook.js (M4B finale)
```

Vedi anche:
- `tools/audiobook-factory/` - Pipeline completa
- `tools/audiobook-factory/scripts/add-background.md` - Aggiungere musica
- `tools/audiobook-factory/voices/` - Configurazione voci

---

*Onde Audiobook Generator v1.0*
*Creato: 2026-01-10*

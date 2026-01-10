# Cross-Pollination Engine

**UN LIBRO = TUTTO**

Script che prende un libro come input e genera automaticamente 15+ output derivati.

## Output Generati

| Output | Descrizione | File |
|--------|-------------|------|
| **Audiobook Script** | Testo pronto per ElevenLabs | `audiobook-script.txt` |
| **Podcast Episode** | Script con intro/outro | `podcast-episode.txt` |
| **5 Video Shorts** | Script per TikTok/Shorts 30-60s | `video-shorts.json` |
| **1 Video Long** | Script per YouTube | `video-long.json` |
| **10 Social Posts** | Post per X/IG/FB | `social-posts.json` |
| **Character Prompts** | Prompt per illustrazioni Grok | `character-prompts.json` |
| **Theme Music** | Prompt per Suno AI | `music-prompt.json` |

## Usage

```bash
# Run on a book
node pollinate.js --book /path/to/book

# Example
node pollinate.js --book books/tech/aiko/
```

## Output Directory

Tutto viene salvato in:
```
content/pollinated/<book-slug>/
├── manifest.json
├── audiobook-script.txt
├── podcast-episode.txt
├── video-shorts.json
├── video-long.json
├── social-posts.json
├── character-prompts.json
└── music-prompt.json
```

## Integrazione con Pipeline

Dopo la generazione:

1. **Audiobook**: Usa script con ElevenLabs
2. **Podcast**: Upload su Spotify for Creators o RSS.com
3. **Video Shorts**: Genera con Hedra/Kling + upload TikTok
4. **Video Long**: Genera con Video Factory + upload YouTube
5. **Social Posts**: Programma con PR Dashboard
6. **Character Art**: Genera su Grok
7. **Music**: Genera su Suno AI

## Requirements

- Node.js 18+
- Libri in formato markdown con struttura standard

## TODO

- [ ] Integrazione diretta ElevenLabs API
- [ ] Auto-upload su piattaforme
- [ ] Generazione video automatica
- [ ] Queue per batch processing

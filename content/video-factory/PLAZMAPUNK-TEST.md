# Test Plazmapunk - Music Video Sync

**Task ID:** video-factory-003
**Data:** 2026-01-09
**Status:** Setup documentato, test manuale richiesto

---

## Cos'e' Plazmapunk

Plazmapunk e' un tool per creare music video sincronizzati automaticamente al beat della musica. Analizza la traccia audio e genera visual che seguono il ritmo.

**Sito:** https://www.plazmapunk.com/
**Categoria:** Music Sync Video Generation
**Alternativa a:** Neural Frames, Kaiber

---

## Tracce Audio Disponibili per Test

### Tracce Mattia / Onde

| File | Path | Tipo | Note |
|------|------|------|------|
| `I.mp3` | `/Users/mattia/Downloads/I.mp3` | Musica | Traccia Mattia |
| `I.mp3` | `/Users/mattia/Music/Music/Media.localized/Music/Unknown Artist/Unknown Album/I.mp3` | Musica | Copia in Music |
| `onde-podcast-ep01-stella-stellina.mp3` | `/Users/mattia/Downloads/` | Podcast | Ninna nanna |
| `onde-podcast-ep02-pioggerellina.mp3` | `/Users/mattia/Downloads/` | Podcast | Poesia |

### Tracce ElevenLabs

| File | Path | Tipo | Note |
|------|------|------|------|
| `ElevenLabs_2026-01-08T08_29_39_Marco...mp3` | `/Users/mattia/Downloads/` | Voce | Marco Deep |
| `ElevenLabs_2026-01-08T08_33_49_Marco...mp3` | `/Users/mattia/Downloads/` | Voce | Marco Deep |

---

## Procedura Test Manuale

### Step 1: Accedi a Plazmapunk
1. Vai su https://www.plazmapunk.com/
2. Crea account o accedi (potrebbe servire login)
3. Esplora l'interfaccia

### Step 2: Upload Traccia Test
1. Usa `/Users/mattia/Downloads/I.mp3` come traccia principale
2. Se richiede video input, usa un'immagine da `/Users/mattia/Projects/Onde/books/` (cover libro)

### Step 3: Configura Sync
1. Lascia Plazmapunk analizzare il beat
2. Scegli stile visual (se disponibile)
3. Configura durata output

### Step 4: Genera e Valuta
1. Genera il video
2. Scarica in `/Users/mattia/Downloads/plazmapunk-test-[data].mp4`
3. Valuta:
   - Qualita' sync con beat
   - Qualita' visual
   - Tempo di rendering
   - Costo (se applicable)

---

## Criteri di Valutazione

| Criterio | Peso | Note |
|----------|------|------|
| **Sync accuratezza** | 30% | Video cambia esattamente sul beat? |
| **Qualita' visual** | 25% | Estetica generale output |
| **Facilita' uso** | 20% | UX intuitiva? |
| **Costo** | 15% | Free tier? Costo per video? |
| **Velocita'** | 10% | Tempo rendering ragionevole? |

---

## Confronto con Alternative

| Tool | Beat Sync | Qualita' | Costo | Note |
|------|-----------|----------|-------|------|
| **Plazmapunk** | Da testare | Da testare | ? | Test in corso |
| **Neural Frames** | Eccellente | Alta | ~$20/mo | 8-track analysis |
| **Kaiber** | Buono | Alta | $15-30/mo | Stili artistici |
| **Runway** | Base | Alta | $15-35/mo | No focus music |

---

## Output Test

### Risultato: [PENDING]

**Data test:** [DA COMPILARE]
**Traccia usata:** [DA COMPILARE]
**Durata rendering:** [DA COMPILARE]
**Qualita' output:** [DA COMPILARE]
**Sync accuratezza:** [DA COMPILARE]
**Costo effettivo:** [DA COMPILARE]

### Screenshot/Video

Salvare output in:
```
/Users/mattia/Projects/Onde/content/video-factory/outputs/
├── plazmapunk-test-001.mp4
├── plazmapunk-test-001-screenshot.png
└── plazmapunk-settings.png
```

---

## Raccomandazione Finale

[DA COMPILARE DOPO TEST]

**Usare Plazmapunk per:** [...]
**Non usare per:** [...]
**Integrazione Video Factory:** [SI/NO]

---

## Note Aggiuntive

- Plazmapunk e' menzionato in VIDEO-FACTORY-MVP.md come alternativa piu' semplice a Neural Frames
- Il focus e' beat matching automatico
- Ideale per: music video, visual per Spotify, contenuti social musicali
- Use case Onde: video per @magmatic__ (musica), ambient video, ninna nanne animate

---

*Questo file va aggiornato dopo il test manuale*
*Worker: claude-90971-mk6ngqem*

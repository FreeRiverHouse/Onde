# Audio Assets per Onde Books VR

## Suoni Richiesti

### 1. Page Turn (page-turn.mp3)
**Tipo**: Sound effect
**Durata**: 0.5-1 secondo
**Uso**: Quando l'utente gira pagina

**Dove trovarlo**:
- Freesound.org: cerca "book page turn" (licenza CC0)
- Mixkit.co: sezione "Free Sound Effects"
- Zapsplat.com: sezione "Book sounds"

**Specifiche tecniche**:
- Formato: MP3 o OGG
- Bitrate: 128kbps min
- Sample rate: 44.1kHz
- Mono o Stereo

### 2. Fire Ambient (fire-ambient.mp3)
**Tipo**: Loop ambient
**Durata**: 30-60 secondi (loop seamless)
**Uso**: Suono di sottofondo del camino

**Dove trovarlo**:
- Freesound.org: cerca "fireplace crackling loop" (licenza CC0)
- Mixkit.co: sezione "Ambient"
- BBC Sound Effects: sezione "Fire" (uso non commerciale)

**Specifiche tecniche**:
- Formato: MP3 o OGG
- Bitrate: 128-192kbps
- Loop seamless (inizio e fine si fondono)
- Volume medio-basso (non invasivo)

### 3. Rain Ambient (rain-ambient.mp3) - OPZIONALE
**Tipo**: Loop ambient
**Durata**: 30-60 secondi (loop)
**Uso**: Ambiente alternativo "Notte piovosa"

### 4. Forest Ambient (forest-ambient.mp3) - OPZIONALE
**Tipo**: Loop ambient
**Durata**: 30-60 secondi (loop)
**Uso**: Ambiente alternativo "Bosco tranquillo"

### 5. Ocean Waves (ocean-ambient.mp3) - OPZIONALE
**Tipo**: Loop ambient
**Durata**: 30-60 secondi (loop)
**Uso**: Ambiente alternativo "Riva del mare"

---

## Fonti Gratuite Consigliate

### Licenza CC0 (dominio pubblico)
1. **Freesound.org** - Ricca libreria, cerca con filtro "CC0"
2. **Mixkit.co** - Sound effects gratuiti per uso commerciale
3. **Pixabay.com/sound-effects** - Royalty free

### Licenza Creative Commons
4. **BBC Sound Effects** - Uso non commerciale
5. **SoundBible.com** - Varie licenze

### Premium (se serve qualita migliore)
6. **Epidemic Sound** - Abbonamento
7. **Artlist** - Abbonamento

---

## Come Preparare i File

### 1. Scaricare e verificare licenza
Assicurarsi che la licenza permetta uso commerciale se necessario.

### 2. Editare se necessario
- Usare Audacity (gratuito) per tagliare/loopare
- Normalizzare volume a -3dB
- Per loop: usare "Crossfade Clips" per transizione seamless

### 3. Esportare nel formato corretto
- MP3: 128kbps, 44.1kHz
- OGG: q5, 44.1kHz (alternativa piu leggera)

### 4. Testare nell'app
- Verificare che il loop non abbia click/pop
- Verificare volume rispetto agli altri suoni

---

## Struttura File

```
assets/
├── audio/
│   ├── README.md (questo file)
│   ├── page-turn.mp3
│   ├── fire-ambient.mp3
│   ├── rain-ambient.mp3 (opzionale)
│   ├── forest-ambient.mp3 (opzionale)
│   └── ocean-ambient.mp3 (opzionale)
└── (altri asset...)
```

---

## Integrazione nel Codice

I file audio sono gia referenziati in `index.html`:

```html
<a-assets timeout="10000">
  <!-- Audio -->
  <audio id="page-turn-sound" src="assets/audio/page-turn.mp3" preload="auto"></audio>
  <audio id="fire-ambient" src="assets/audio/fire-ambient.mp3" preload="auto" loop></audio>
</a-assets>
```

Per aggiungere nuovi ambienti, duplicare il pattern e aggiungere un selettore nell'UI.

---

*Creato: 2026-01-09*
*Task: vr-004*

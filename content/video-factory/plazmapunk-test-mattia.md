# Plazmapunk Test - Music Video per Mattia @magmatic__

**Task:** video-factory-003
**Obiettivo:** Testare Plazmapunk AI per creare music video sincronizzati
**Data:** 2026-01-09

---

## Plazmapunk Overview

Plazmapunk e' un generatore video AI specializzato in **music sync**:
- **Beat Sync**: I visual si sincronizzano automaticamente con il ritmo
- **AI Music**: Puo' anche generare musica (non serve per questo test)
- **Modelli**: Stable Diffusion XL, Kandinsky 2.2
- **Scene Editor**: Prompts diversi per ogni scena (con GPT)

### Pricing
- **Free**: 20 secondi/giorno
- **Pioneer**: 100 sec/giorno
- **Punk**: 300 sec/giorno
- **Producer**: 3000 sec/giorno

### URL
- Web: https://www.plazmapunk.com/
- App: https://app.plazmapunk.com/

---

## Tracce Audio Disponibili

### Da OndePRDB/magmatic

| Contenuto | Note |
|-----------|------|
| "Excursus" | Traccia musicale @field.exe (da Instagram reel) |
| Video poetry content | Audio poetry performance |
| DJ sets | LA River, Frogtown |

### Da Onde Multimedia

| File | Path |
|------|------|
| Podcast Stella Stellina | `packages/onde-multimedia/podcast/episodes/ep01-stella-stellina-elevenlabs.mp3` |

---

## Concept Video Suggeriti

### Concept 1: "Giro di Vite" (Poesia + Visuals Astratti)

**Audio**: Lettura poesia con musica ambient
**Visual Prompt**:
```
Abstract cosmic visuals, a heart orbiting around a golden sun,
deep blue and purple space dust swirling,
hypnotic slow motion, melancholic European art film,
NOT commercial, NOT pop aesthetic
```

**Style**: Kandinsky / Abstract Expressionism

---

### Concept 2: "Excursus" (Beat-synced con LA River)

**Audio**: Traccia Excursus
**Visual Prompt**:
```
Golden hour on Los Angeles River, orange bridge silhouettes,
concrete channels with water reflections,
urban sunset, vintage 70s film grain,
warm orange and purple tones, nostalgic California
```

**Style**: Cinematic / 70s Film

---

### Concept 3: "Frogtown Vibes" (DJ Set Aesthetic)

**Audio**: DJ set recording
**Visual Prompt**:
```
Underground electronic music scene, retro CRT monitors,
neon glows in urban setting, vinyl records spinning,
lo-fi aesthetic, VHS quality, 80s synthwave colors,
night time urban environment
```

**Style**: Synthwave / Retro

---

## Workflow Test

### Step 1: Prepara Audio
1. Scegliere traccia (preferibilmente < 60 sec per free tier)
2. Convertire in formato compatibile se necessario

### Step 2: Accedi a Plazmapunk
1. Vai su https://app.plazmapunk.com/
2. Login/Registrazione
3. Free tier da' 20 sec/giorno

### Step 3: Upload e Config
1. Upload audio
2. Scegli visual model (SDXL o Kandinsky)
3. Scrivi content prompt
4. Scrivi style prompt
5. Scegli aspect ratio (9:16 per social, 16:9 per YouTube)

### Step 4: Genera e Valuta
- Genera video
- Valuta sync con beat
- Valuta qualita' visiva
- Scarica risultato

---

## Criteri Valutazione

| Criterio | Peso | Note |
|----------|------|------|
| Beat sync accuracy | 30% | I visual cambiano a tempo? |
| Qualita' visiva | 25% | Coerenza, risoluzione |
| Mood matching | 25% | Il visual cattura l'atmosfera? |
| Usabilita' social | 20% | Pronto per X/IG/TikTok? |

---

## Alternative

Se Plazmapunk non soddisfa:
- **RunwayML + manual sync**: Piu' controllo ma piu' lavoro
- **Kaiber**: Specializzato in music video AI
- **Pika Labs**: General purpose ma buono per music

---

## Status

- [x] Documentazione completa
- [x] Concept video definiti (3)
- [x] Workflow preparato
- [ ] Audio selezionato (richiede scelta Mattia)
- [ ] Account Plazmapunk (richiede browser)
- [ ] Test video generato (richiede browser)
- [ ] Valutazione finale

---

## Istruzioni per Esecuzione

**QUANDO BROWSER DISPONIBILE:**

1. Connetti Claude for Chrome
2. Naviga su https://app.plazmapunk.com/
3. Login/Registrazione
4. Testa prima con Podcast Stella Stellina (gia' pronto)
5. Usa prompt Concept 1
6. Valuta risultato
7. Se positivo, testa con contenuti Magmatic
8. Scarica in `~/Downloads/plazmapunk-test/`
9. Valuta e compila report

**NOTA**: Questo task richiede:
1. Browser per accesso a Plazmapunk
2. Scelta di Mattia su quale traccia usare
3. Eventuale upload audio originale

Il browser non e' attualmente connesso.
Riconnettere Claude for Chrome per procedere.

---

## Fonti

- [Plazmapunk Official](https://www.plazmapunk.com/)
- [Plazmapunk App](https://app.plazmapunk.com/)
- [Deepgram Review](https://deepgram.com/ai-apps/plazmapunk)

---

*Report generato da Code Worker - 2026-01-09*

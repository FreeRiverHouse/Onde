# CORDE - Content ORchestration & Digital Experience

**Data Creazione**: 19 Gennaio 2026
**Status**: In Sviluppo
**Owner**: Engineering Dept

---

## VISIONE

CORDE e' un'app per la creazione automatizzata di contenuti multimediali usando LLM open source.

**Fasi:**
1. **2D App** (MVP) - Desktop/Web interface per generazione video e immagini
2. **VR Experience** - Ambiente immersivo per content creation

---

## STACK TECNOLOGICO - OPEN SOURCE LLMs

### 1. GENERAZIONE IMMAGINI (Open Source)

| Modello | Tipo | Hardware | Qualita' | Note |
|---------|------|----------|----------|------|
| **Flux.1** | Local | 12GB+ VRAM | Top tier | Migliore qualita' 2024/2025 |
| **SDXL** | Local | 8GB+ VRAM | Alta | Stabile, ben documentato |
| **Stable Diffusion 3** | Local | 12GB+ VRAM | Alta | Testo in immagini eccellente |
| **Kandinsky 3** | Local/API | 8GB+ VRAM | Alta | Open source russo |
| **PixArt-Sigma** | Local | 8GB+ VRAM | Alta | Veloce, alta risoluzione |

**Raccomandazione per Milo 2:**
- **Flux.1-dev** - Migliore qualita' per illustrazioni
- Fallback: SDXL con LoRA custom per stile Onde

### 2. GENERAZIONE VIDEO (Open Source)

| Modello | Tipo | Hardware | Durata | Note |
|---------|------|----------|--------|------|
| **Open-Sora** | Local | 24GB+ VRAM | 16 sec | Fork open source di Sora |
| **Stable Video Diffusion** | Local | 12GB+ VRAM | 4 sec | Img2Video eccellente |
| **CogVideoX** | Local | 16GB+ VRAM | 6 sec | Text-to-Video |
| **AnimateDiff** | Local | 8GB+ VRAM | Infinite | Loop animation |
| **ModelScope T2V** | Local | 12GB+ VRAM | 4 sec | Veloce |
| **Mochi 1** | Local | 24GB+ VRAM | 10 sec | Genmo AI, alta qualita' |

**Raccomandazione per Video Poesia:**
- **Stable Video Diffusion** per image-to-video (dalle illustrazioni Onde)
- **AnimateDiff** per loop infiniti (ambient)
- **Open-Sora** per video complessi (quando avremo GPU potente)

### 3. LIP SYNC (Open Source)

| Modello | Tipo | Note |
|---------|------|------|
| **Easy-Wav2Lip** | Local | GIA' SETUP! Path: `/Volumes/DATI-SSD/onde-ai/lip-sync/` |
| **SadTalker** | Local | Qualita' superiore |
| **Video-Retalking** | Local | Migliore per parlato |

### 4. TEXT-TO-SPEECH (Open Source)

| Modello | Tipo | Note |
|---------|------|------|
| **Coqui TTS** | Local | Multi-speaker, clonazione |
| **Bark** | Local | Molto espressivo |
| **Tortoise TTS** | Local | Qualita' top |
| **WhisperSpeech** | Local | Veloce |

---

## ARCHITETTURA CORDE

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CORDE 2D MVP                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│   │   INPUT     │    │  PIPELINE   │    │   OUTPUT    │            │
│   │             │    │             │    │             │            │
│   │ - Testo     │───▶│ - Flux.1    │───▶│ - MP4       │            │
│   │ - Audio     │    │ - SVD       │    │ - PNG/JPG   │            │
│   │ - Immagini  │    │ - Wav2Lip   │    │ - GIF       │            │
│   │ - Prompt    │    │ - FFmpeg    │    │ - Sprite    │            │
│   └─────────────┘    └─────────────┘    └─────────────┘            │
│                                                                     │
│   ┌─────────────────────────────────────────────────────┐          │
│   │                 REUSED FROM ONDE                     │          │
│   │                                                      │          │
│   │  - factory-controller.js (resource management)      │          │
│   │  - video-factory-overnight.js (pipeline structure)  │          │
│   │  - generate-audio.js (ElevenLabs → Coqui TTS)       │          │
│   │  - BOOK_FACTORY workflow (image + text assembly)    │          │
│   └─────────────────────────────────────────────────────┘          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        CORDE VR (FASE 2)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│   │  VR UI      │    │  CORDE 2D   │    │  3D OUTPUT  │            │
│   │             │    │  (backend)  │    │             │            │
│   │ - Gallery   │───▶│             │───▶│ - 3D scene  │            │
│   │ - Studio    │    │ (unchanged) │    │ - Hologram  │            │
│   │ - Preview   │    │             │    │ - Texture   │            │
│   └─────────────┘    └─────────────┘    └─────────────┘            │
│                                                                     │
│   Stack: Quest 3 / Apple Vision Pro + WebXR / Unity               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PROGETTI PRIORITARI

### 1. VIDEO POESIA (Prima Milestone)

**Obiettivo**: Generare video poetici animati dalle illustrazioni Onde

**Input:**
- Illustrazioni esistenti (stile acquarello Onde)
- Testo poesia (es. Piccole Rime)
- Audio narrazione (TTS o ElevenLabs)

**Pipeline:**
1. Flux.1 o SDXL genera varianti dell'illustrazione base
2. Stable Video Diffusion anima le varianti
3. AnimateDiff crea transizioni fluide
4. FFmpeg assembla con audio

**Output:** Video 16:9 e 9:16 per YouTube/TikTok

### 2. MILO 2 (Seconda Milestone)

**Obiettivo**: Evoluzione del personaggio Milo con generazione immagini OS

**Input:**
- Character sheet Milo esistente
- Prompt per nuove scene
- Style guide Onde

**Pipeline:**
1. Flux.1-dev con LoRA custom per stile Onde
2. Generazione coerente del personaggio
3. Varianti per libro illustrato

**Output:** Serie di illustrazioni coerenti per libro

---

## CODICE DA RIUSARE

### Da `/scripts/factory/`

| File | Riuso | Modifiche Necessarie |
|------|-------|---------------------|
| `factory-controller.js` | 100% | Aggiungere metriche GPU |
| `video-factory-overnight.js` | 80% | Sostituire Hedra → SVD |
| `auto-content-factory.js` | 60% | Adattare per CORDE queue |
| `generate-audio.js` | 70% | Aggiungere Coqui TTS |
| `generate-epub.js` | 50% | Per output libri |

### Da `/content/agents/`

| File | Riuso | Note |
|------|-------|------|
| `pina-pennello.md` | Prompt style | Base per LoRA training |
| `VISUAL-IDENTITY-GUIDE.md` | Style reference | Guidelines per Flux |

---

## REQUISITI HARDWARE

### Minimo (Mac M1/M2/M3)
- RAM: 16GB
- Storage: 100GB liberi
- Modelli: SDXL, AnimateDiff, Easy-Wav2Lip

### Consigliato (Mac M2/M3 Pro/Max o Linux con GPU)
- RAM: 32GB+ o VRAM 16GB+
- Storage: 200GB liberi
- Modelli: Flux.1, SVD, CogVideoX

### Ottimale (Linux con RTX 4090/A100)
- VRAM: 24GB+
- Storage: 500GB liberi
- Modelli: Tutti incluso Open-Sora

---

## TASK ENGINEERING

### Sprint 1: Setup (Settimana 1)
- [ ] Setup ComfyUI con Flux.1-dev
- [ ] Setup Stable Video Diffusion
- [ ] Test pipeline base: immagine → video
- [ ] Adattare factory-controller.js per GPU

### Sprint 2: Video Poesia MVP (Settimana 2-3)
- [ ] Pipeline completa: testo → immagini → video
- [ ] Integrazione audio (Coqui TTS o ElevenLabs)
- [ ] Output multi-formato (16:9, 9:16, 1:1)
- [ ] Test con poesie Piccole Rime

### Sprint 3: Milo 2 (Settimana 4-5)
- [ ] LoRA training su stile Onde
- [ ] Character consistency con IP-Adapter
- [ ] Pipeline generazione serie illustrazioni
- [ ] Test coerenza personaggio

### Sprint 4: VR Prototype (Settimana 6-8)
- [ ] WebXR interface base
- [ ] Gallery view per contenuti generati
- [ ] Studio mode per prompt editing
- [ ] Preview in VR dei video generati

---

## INSTALLAZIONE MODELLI OPEN SOURCE

### ComfyUI + Flux.1

```bash
# Setup ComfyUI
cd /Volumes/DATI-SSD/onde-ai/
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI

# Conda environment
conda create -n comfyui python=3.11
conda activate comfyui
pip install -r requirements.txt

# Download Flux.1-dev
cd models/checkpoints/
# Download da Hugging Face: black-forest-labs/FLUX.1-dev
```

### Stable Video Diffusion

```bash
# Via ComfyUI (consigliato)
cd ComfyUI/models/checkpoints/
# Download da Hugging Face: stabilityai/stable-video-diffusion-img2vid-xt
```

### AnimateDiff

```bash
# Plugin ComfyUI
cd ComfyUI/custom_nodes/
git clone https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved.git
# Download motion modules
```

---

## METRICHE SUCCESS

### Video Poesia
- [ ] Tempo generazione: < 5 min per video 30 sec
- [ ] Qualita' visiva: Approvato da Mattia
- [ ] Coerenza stile: 100% stile Onde

### Milo 2
- [ ] Coerenza personaggio: > 90% similarity
- [ ] Velocita': 10+ illustrazioni/ora
- [ ] Stile: Acquarello Onde verificato

### VR
- [ ] FPS: > 72 fps su Quest 3
- [ ] Latency: < 100ms per preview
- [ ] UX: Workflow intuitivo

---

## CONTATTI

- **Engineering Lead**: Claude (questa sessione)
- **Product Owner**: Mattia (@magmatic__)
- **Repo**: `/Users/mattia/Projects/Onde/apps/corde/`

---

*Documento creato: 2026-01-19*
*Prossimo review: Post Sprint 1*

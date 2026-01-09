# Gianni Parola - Voce Narratore Onde

Configurazione ElevenLabs per la voce di Gianni Parola, il narratore ufficiale di Onde.

---

## Profilo Personaggio

**Nome**: Gianni Parola
**Ruolo**: Scrittore e narratore principale
**Eta**: ~40 anni
**Caratteristiche**: Voce calda, rassicurante, intellettuale

---

## ElevenLabs Configuration

### Voice ID
```
ELEVENLABS_VOICE_GIANNI=<DA_CONFIGURARE>
```

### Opzioni Voce ElevenLabs

**Opzione A - Voice Cloning** (consigliato)
1. Registra 3-5 minuti di audio di riferimento
2. Voce maschile italiana, 35-45 anni
3. Tono caldo, ritmo pacato
4. Upload su ElevenLabs Voice Lab

**Opzione B - Pre-made Voices**
| Voce | Caratteristiche | Uso |
|------|-----------------|-----|
| **Brian** | Maschile, calmo, narrativo | Audiobook adulti |
| **Daniel** | Maschile, chiaro, professionale | Guide tecniche |
| **Antoni** | Maschile, caldo, italiano-friendly | Storie bambini |

### Impostazioni Suggerite

```json
{
  "voice_id": "GIANNI_VOICE_ID",
  "stability": 0.55,
  "similarity_boost": 0.75,
  "style": 0.25,
  "use_speaker_boost": true,
  "model_id": "eleven_multilingual_v2"
}
```

**Spiegazione parametri:**
- **Stability 0.55**: Leggermente espressivo ma consistente
- **Similarity 0.75**: Fedele alla voce originale
- **Style 0.25**: Poco drammatico, narrativo naturale
- **Speaker Boost ON**: Migliora chiarezza

---

## Stile Narrazione

### Tono
- Caldo e accogliente
- Mai freddo o robotico
- Paziente, come chi racconta a un bambino
- Leggera inflessione italiana

### Ritmo
- Moderato (130-150 parole/minuto)
- Pause naturali tra le frasi
- Rallenta per momenti emotivi
- Accelera leggermente per azione

### Enfasi
- Sottolinea parole chiave
- Varia intonazione per domande
- Abbassa tono per parti intime/sussurrate
- Alza per sorpresa/eccitazione

---

## Esempi di Test

### Frasi per testare la voce

**Narrazione standard:**
```
Era un sabato mattina di sole quando Sofia ricevette il regalo piu' speciale della sua vita.
```

**Momento emotivo:**
```
"Grazie, AIKO," sussurro' Sofia, abbracciando il suo nuovo amico robot. "Sei il miglior regalo di sempre."
```

**Spiegazione didattica:**
```
L'intelligenza artificiale e' come un cervello fatto di numeri e calcoli, che impara guardando milioni di esempi.
```

**Domanda retorica:**
```
Ma come fa un robot a "vedere" il mondo? Ve lo spieghero' in questo capitolo.
```

---

## Workflow Voice Cloning

### Step 1: Registrazione Audio Riferimento

Requisiti:
- **Durata**: 3-5 minuti totali
- **Qualita**: Almeno 44.1kHz, 16-bit
- **Ambiente**: Silenzioso, no eco
- **Contenuto**: Mix di narrazione e dialogo

Script consigliato per registrazione:
```
[Inizio con tono caldo]
Buongiorno a tutti. Mi chiamo Gianni Parola e sono il narratore di Onde.

[Narrazione normale]
In questa storia vi raccontero' di Sofia, una bambina curiosa di sette anni,
e del suo amico robot AIKO. Insieme scopriranno i segreti dell'intelligenza artificiale.

[Momento emotivo, voce piu' bassa]
Era una notte stellata quando Sofia guardo' fuori dalla finestra e penso'
a tutte le meraviglie che l'aspettavano.

[Tono didattico]
L'intelligenza artificiale funziona come una grande biblioteca che
impara dai libri che legge. Piu' legge, piu' diventa brava.

[Domanda]
Siete pronti a partire per questa avventura?

[Conclusione calda]
Allora sistematevi comodi, chiudete gli occhi, e lasciatevi trasportare
dalle onde di questa storia.
```

### Step 2: Upload su ElevenLabs

1. Vai su https://elevenlabs.io/app/voice-lab
2. Clicca "Add Generative or Cloned Voice"
3. Seleziona "Instant Voice Cloning"
4. Upload audio di riferimento
5. Dai nome: "Gianni Parola - Onde"
6. Copia Voice ID

### Step 3: Test e Validazione

Genera test con frasi diverse:
- Narrazione lunga
- Dialogo breve
- Momento emotivo
- Spiegazione tecnica

Verifica:
- [ ] Pronuncia italiana corretta
- [ ] Tono coerente
- [ ] Nessun artefatto audio
- [ ] Ritmo naturale

---

## Costi

| Piano ElevenLabs | Caratteri/mese | Costo | Note |
|------------------|----------------|-------|------|
| Free | 10,000 | $0 | Solo per test |
| Starter | 30,000 | $5 | 1 audiobook corto |
| Creator | 100,000 | $22 | 2-3 audiobook |
| Pro | 500,000 | $99 | Produzione mensile |

**Stima per Onde:**
- 5 audiobook/mese x 20,000 char = 100,000 char
- Piano Creator ($22/mese) sufficiente

---

## Alternative Locali

Se preferisci TTS gratuito locale:

### XTTS-v2 (Coqui)
```python
from TTS.api import TTS

tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
tts.tts_to_file(
    text="Testo da narrare",
    language="it",
    speaker_wav="gianni_reference.wav",  # 6-30 sec
    file_path="output.wav"
)
```

### Piper TTS
```bash
echo "Testo da narrare" | piper \
  --model it_IT-riccardo-medium.onnx \
  --output_file output.wav
```

Vedi `tools/audio-gen/LOCAL-TTS-SETUP.md` per setup completo.

---

## Reference Files

- **Immagine Gianni**: `content/authors/gianni-parola-ref.jpg`
- **Agent Gianni**: `content/agents/gianni-parola.md`
- **TTS Guide**: `tools/audio-gen/LOCAL-TTS-SETUP.md`

---

*Documento creato: 2026-01-09*
*Onde Audiobook Factory*

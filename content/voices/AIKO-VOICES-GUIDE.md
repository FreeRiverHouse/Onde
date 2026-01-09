# Voci AIKO Series - ElevenLabs Setup

Guida per configurare le voci dei personaggi della serie AIKO.

---

## Personaggi Principali

### 1. Sofia (Protagonista)

**Descrizione voce:**
- Bambina italiana di 7 anni
- Voce dolce, curiosa, vivace
- Tono entusiasta ma non esagerato
- Leggermente acuto ma non stridulo

**ElevenLabs - Voce consigliata:**
- **Opzione A**: "Lily" (giovane, curiosa)
- **Opzione B**: "Charlotte" (dolce, espressiva)
- **Opzione C**: Creare voce custom con Voice Lab

**Impostazioni suggerite:**
```
Stability: 0.45 (più espressiva)
Clarity + Similarity: 0.80
Style: 0.35 (moderatamente espressiva)
Speaker Boost: ON
```

**Caratteristiche da cercare:**
- Naturalezza infantile
- NON robotica
- NON troppo americana
- Preferibilmente con lieve accento europeo

---

### 2. AIKO (Robot Amico)

**Descrizione voce:**
- Robot amichevole con occhi LED blu
- Voce leggermente sintetica ma calda
- Tono didattico ma non noioso
- Paziente e rassicurante

**ElevenLabs - Voce consigliata:**
- **Opzione A**: "Daniel" (maschile, calmo) + leggera modifica
- **Opzione B**: "Adam" (neutro, chiaro)
- **Opzione C**: "Freya" (neutro, morbido)

**Impostazioni suggerite:**
```
Stability: 0.65 (più consistente, robotico)
Clarity + Similarity: 0.85
Style: 0.20 (meno emotivo)
Speaker Boost: OFF (suono più neutro)
```

**Caratteristiche da cercare:**
- Leggermente "digitale" ma non freddo
- Voce chiara per spiegazioni
- Gentile e paziente
- NON spaventoso
- NON troppo robotico (deve essere amichevole)

---

### 3. Personaggi Secondari

#### Mom (Mamma di Sofia)
- **Voce**: "Rachel" o "Dorothy"
- Calda, rassicurante, paziente
- Stability: 0.55, Style: 0.30

#### Dad (Papà di Sofia)
- **Voce**: "Antoni" o "Josh"
- Affettuoso, protettivo
- Stability: 0.50, Style: 0.25

#### Grandma (Nonna)
- **Voce**: "Dorothy" (più anziana)
- Affettuosa, saggia
- Stability: 0.60, Style: 0.35

#### Narratore
- **Voce**: "Rachel" o "Nicole"
- Caldo, coinvolgente
- Stability: 0.50, Style: 0.30

---

## Configurazione Voice IDs

### Come Ottenere Voice IDs

1. Vai su https://elevenlabs.io/app/voice-library
2. Seleziona una voce
3. Clicca "Add to My Voices"
4. Vai su "My Voices"
5. Clicca sulla voce → copia il Voice ID

### Voice IDs da Salvare

Dopo aver selezionato le voci, salvare qui:

```env
# .env - Voice IDs AIKO Series
ELEVENLABS_VOICE_SOFIA=<voice_id>
ELEVENLABS_VOICE_AIKO=<voice_id>
ELEVENLABS_VOICE_MOM=<voice_id>
ELEVENLABS_VOICE_DAD=<voice_id>
ELEVENLABS_VOICE_GRANDMA=<voice_id>
ELEVENLABS_VOICE_NARRATOR=<voice_id>
```

---

## Workflow Generazione Audio

### Script Node.js

```javascript
const ElevenLabs = require('elevenlabs-api');

const VOICES = {
  sofia: process.env.ELEVENLABS_VOICE_SOFIA,
  aiko: process.env.ELEVENLABS_VOICE_AIKO,
  mom: process.env.ELEVENLABS_VOICE_MOM,
  narrator: process.env.ELEVENLABS_VOICE_NARRATOR
};

const VOICE_SETTINGS = {
  sofia: { stability: 0.45, similarity_boost: 0.80, style: 0.35 },
  aiko: { stability: 0.65, similarity_boost: 0.85, style: 0.20 },
  mom: { stability: 0.55, similarity_boost: 0.75, style: 0.30 },
  narrator: { stability: 0.50, similarity_boost: 0.75, style: 0.30 }
};

async function generateDialogue(character, text) {
  const voiceId = VOICES[character];
  const settings = VOICE_SETTINGS[character];

  // Chiamata API ElevenLabs
  // ...
}
```

### Formato Script Dialoghi

Per generare audio multi-voce, usare questo formato:

```
[NARRATOR]: It was a sunny Saturday morning.
[MOM]: "Today, we're going to Grandma's house."
[SOFIA]: "Really? How will we get there?"
[AIKO]: "Sofia, this is a ROBOTAXI. A car that drives itself!"
```

---

## Test Voci

### Frasi di Test per Sofia
1. "Wow, that's amazing!"
2. "But how does it work, AIKO?"
3. "I want to help build the future!"
4. "Mom, there's no one driving!"

### Frasi di Test per AIKO
1. "Let me explain how this works, Sofia."
2. "The most important rule is: never hurt anyone."
3. "Humans and AI, working together."
4. "That's a great question!"

---

## Costi Stimati

ElevenLabs pricing (Creator plan):
- ~$0.30 per 1000 caratteri
- AIKO 2 Audiobook (~20,000 caratteri) = ~$6
- Serie completa (5 episodi) = ~$30

---

## Status Setup

| Personaggio | Voce Scelta | Voice ID | Status |
|-------------|-------------|----------|--------|
| Sofia | TBD | - | DA FARE |
| AIKO | TBD | - | DA FARE |
| Mom | TBD | - | DA FARE |
| Narrator | TBD | - | DA FARE |
| Grandma | TBD | - | DA FARE |

---

## Prossimi Passi

1. [ ] Accedere a ElevenLabs
2. [ ] Testare voci candidate per Sofia
3. [ ] Testare voci candidate per AIKO
4. [ ] Selezionare e salvare Voice IDs
5. [ ] Aggiornare .env con i Voice IDs
6. [ ] Testare generazione audio con script di esempio

---

*Documento creato: 2026-01-09*
*Per uso con ElevenLabs API*

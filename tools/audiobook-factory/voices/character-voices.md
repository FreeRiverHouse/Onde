# Voci Personaggi - Audiobook Factory

Configurazione ElevenLabs per tutti i personaggi della serie AIKO e altri libri Onde.

---

## Quick Reference

| Personaggio | Tipo | ElevenLabs Voice | Settings |
|-------------|------|------------------|----------|
| **Sofia** | Bambina 7 anni | Lily/Charlotte | Stability 0.45, Style 0.35 |
| **AIKO** | Robot amichevole | Daniel/Freya | Stability 0.65, Style 0.20 |
| **Mom** | Mamma di Sofia | Rachel/Dorothy | Stability 0.55, Style 0.30 |
| **Dad** | Papa' di Sofia | Antoni/Josh | Stability 0.50, Style 0.25 |
| **Grandma** | Nonna | Dorothy (aged) | Stability 0.60, Style 0.35 |
| **Narrator** | Voce fuori campo | Brian/Nicole | Stability 0.50, Style 0.30 |

---

## Personaggi Principali

### Sofia (Protagonista)

**Descrizione voce:**
- Bambina italiana di 7 anni
- Voce dolce, curiosa, vivace
- Tono entusiasta ma non esagerato
- Leggermente acuto ma non stridulo

**ElevenLabs - Voci consigliate:**
| Opzione | Voce | Perche' |
|---------|------|---------|
| A | **Lily** | Giovane, curiosa, naturale |
| B | **Charlotte** | Dolce, espressiva |
| C | Voice Lab Custom | Massima personalizzazione |

**Impostazioni:**
```json
{
  "voice_id": "SOFIA_VOICE_ID",
  "stability": 0.45,
  "similarity_boost": 0.80,
  "style": 0.35,
  "use_speaker_boost": true,
  "model_id": "eleven_multilingual_v2"
}
```

**Caratteristiche da cercare:**
- Naturalezza infantile
- NON robotica
- NON troppo americana
- Preferibilmente con lieve accento europeo

**Frasi di test:**
```
"Wow, that's amazing!"
"But how does it work, AIKO?"
"I want to help build the future!"
"Mom, there's no one driving!"
```

---

### AIKO (Robot Amico)

**Descrizione voce:**
- Robot amichevole con occhi LED blu
- Voce leggermente sintetica ma calda
- Tono didattico ma non noioso
- Paziente e rassicurante

**ElevenLabs - Voci consigliate:**
| Opzione | Voce | Perche' |
|---------|------|---------|
| A | **Daniel** | Maschile, calmo, chiaro |
| B | **Adam** | Neutro, professionale |
| C | **Freya** | Neutro, morbido |

**Impostazioni:**
```json
{
  "voice_id": "AIKO_VOICE_ID",
  "stability": 0.65,
  "similarity_boost": 0.85,
  "style": 0.20,
  "use_speaker_boost": false,
  "model_id": "eleven_multilingual_v2"
}
```

**Caratteristiche da cercare:**
- Leggermente "digitale" ma non freddo
- Voce chiara per spiegazioni
- Gentile e paziente
- NON spaventoso
- NON troppo robotico (deve essere amichevole)

**Frasi di test:**
```
"Let me explain how this works, Sofia."
"The most important rule is: never hurt anyone."
"Humans and AI, working together."
"That's a great question!"
```

---

## Personaggi Secondari

### Mom (Mamma di Sofia)

**Descrizione:**
- Donna italiana ~35 anni
- Calda, rassicurante, paziente
- Voce materna ma moderna

**Impostazioni:**
```json
{
  "voice_id": "MOM_VOICE_ID",
  "stability": 0.55,
  "similarity_boost": 0.75,
  "style": 0.30,
  "use_speaker_boost": true
}
```

**Voci suggerite:** Rachel, Dorothy

---

### Dad (Papa' di Sofia)

**Descrizione:**
- Uomo italiano ~38 anni
- Affettuoso, protettivo
- Voce calda, leggermente profonda

**Impostazioni:**
```json
{
  "voice_id": "DAD_VOICE_ID",
  "stability": 0.50,
  "similarity_boost": 0.75,
  "style": 0.25,
  "use_speaker_boost": true
}
```

**Voci suggerite:** Antoni, Josh

---

### Grandma (Nonna)

**Descrizione:**
- Donna anziana ~65-70 anni
- Affettuosa, saggia
- Voce calda con tono piu' maturo

**Impostazioni:**
```json
{
  "voice_id": "GRANDMA_VOICE_ID",
  "stability": 0.60,
  "similarity_boost": 0.70,
  "style": 0.35,
  "use_speaker_boost": true
}
```

**Voci suggerite:** Dorothy (parametri aged)

---

### Narrator (Voce Narrante)

**Descrizione:**
- Voce neutrale, coinvolgente
- Per parti non dialogate
- Professionale ma caldo

**Impostazioni:**
```json
{
  "voice_id": "NARRATOR_VOICE_ID",
  "stability": 0.50,
  "similarity_boost": 0.75,
  "style": 0.30,
  "use_speaker_boost": true
}
```

**Voci suggerite:** Brian, Nicole, Rachel

---

## Voice IDs - Template .env

```bash
# .env - Audiobook Factory Voice IDs

# Personaggi AIKO
ELEVENLABS_VOICE_SOFIA=<voice_id>
ELEVENLABS_VOICE_AIKO=<voice_id>
ELEVENLABS_VOICE_MOM=<voice_id>
ELEVENLABS_VOICE_DAD=<voice_id>
ELEVENLABS_VOICE_GRANDMA=<voice_id>

# Narratori
ELEVENLABS_VOICE_NARRATOR=<voice_id>
ELEVENLABS_VOICE_GIANNI=<voice_id>

# API Key
ELEVENLABS_API_KEY=<your_api_key>
```

---

## Come Ottenere Voice IDs

1. Vai su https://elevenlabs.io/app/voice-library
2. Seleziona una voce dalla libreria
3. Clicca "Add to My Voices"
4. Vai su "My Voices" nella sidebar
5. Clicca sulla voce
6. Copia il Voice ID dal pannello

---

## Script Node.js per Multi-Voice

```javascript
const voices = {
  sofia: {
    id: process.env.ELEVENLABS_VOICE_SOFIA,
    settings: { stability: 0.45, similarity_boost: 0.80, style: 0.35 }
  },
  aiko: {
    id: process.env.ELEVENLABS_VOICE_AIKO,
    settings: { stability: 0.65, similarity_boost: 0.85, style: 0.20 }
  },
  mom: {
    id: process.env.ELEVENLABS_VOICE_MOM,
    settings: { stability: 0.55, similarity_boost: 0.75, style: 0.30 }
  },
  narrator: {
    id: process.env.ELEVENLABS_VOICE_NARRATOR,
    settings: { stability: 0.50, similarity_boost: 0.75, style: 0.30 }
  }
};

async function generateDialogue(character, text) {
  const voice = voices[character.toLowerCase()];
  if (!voice) throw new Error(`Unknown character: ${character}`);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: voice.settings
      })
    }
  );

  return response.arrayBuffer();
}
```

---

## Format Script Dialoghi

Per processare automaticamente il dialogo, usa questo formato:

```
[NARRATOR]: It was a sunny Saturday morning.
[MOM]: "Today, we're going to Grandma's house."
[SOFIA]: "Really? How will we get there?"
[AIKO]: "Sofia, this is a ROBOTAXI. A car that drives itself!"
[PAUSE 2s]
[SFX: car_engine]
```

---

## Status Setup Voci

| Personaggio | Voce Scelta | Voice ID | Status |
|-------------|-------------|----------|--------|
| Sofia | TBD | - | DA FARE |
| AIKO | TBD | - | DA FARE |
| Mom | TBD | - | DA FARE |
| Dad | TBD | - | DA FARE |
| Grandma | TBD | - | DA FARE |
| Narrator | TBD | - | DA FARE |
| Gianni | TBD | - | DA FARE |

---

## Prossimi Passi

1. [ ] Accedere a ElevenLabs con account Onde
2. [ ] Testare voci candidate per Sofia
3. [ ] Testare voci candidate per AIKO
4. [ ] Selezionare e salvare Voice IDs
5. [ ] Aggiornare .env con i Voice IDs
6. [ ] Testare generazione audio multi-voice
7. [ ] Generare primo audiobook completo (AIKO 2)

---

## Costi Stimati

ElevenLabs pricing (Creator plan - $22/mese):
- ~$0.22 per 1000 caratteri
- AIKO 2 Audiobook (~20,000 caratteri) = ~$4.40
- Serie completa (5 episodi) = ~$22

---

## Reference

- **AIKO Voices Guide completa**: `content/voices/AIKO-VOICES-GUIDE.md`
- **Gianni Voice**: `tools/audiobook-factory/voices/gianni-voice.md`
- **ElevenLabs Docs**: https://docs.elevenlabs.io/

---

*Documento creato: 2026-01-09*
*Onde Audiobook Factory*

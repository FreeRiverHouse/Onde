# Procedura Generazione Immagini Consistenti

**Per Editore Capo e Pina Pennello**
**Ultima modifica:** 2026-01-19

---

## Principio Base

**CONSISTENZA = STESSO PERSONAGGIO SU TUTTE LE PAGINE**

Il problema principale dell'AI image generation per libri e' che il personaggio "Sofia" a pagina 1 diventa un'altra persona a pagina 2.

**Soluzione:** Usare tool che mantengono il contesto visivo e frasi specifiche per "bloccare" il personaggio.

---

## METODO 1: Nano Banana / Gemini (RACCOMANDATO)

Nano Banana e' il nome del modello di generazione immagini di Google Gemini. Ha la **migliore consistenza dei personaggi** disponibile.

### Accesso
- **Gemini Advanced**: gemini.google.com (abbonamento Google One)
- **AI Studio**: aistudio.google.com (API gratuita con limiti)
- **Gemini App**: App mobile

### Step 1: Crea il Personaggio Master

Vai su Gemini e descrivi il personaggio in dettaglio:

```
Create a 3D Pixar-style character:
- MILO: A small friendly robot, orange color, round base (no legs),
  warm glowing LED eyes, smooth pebble-like body
- Show on white background, full body visible
```

**IMPORTANTE:** Scegli la variante migliore prima di continuare.

### Step 2: LA FRASE MAGICA

Una volta che hai il personaggio che ti piace, usa questa formula:

```
Keep this character exactly the same.
Now show [him/her/them] [nuova scena].
```

**Esempi:**

```
Keep this character exactly the same.
Now show him in a cozy living room, being discovered in a cardboard box
by a 7-year-old girl with brown hair and pink bow.
```

```
Keep this character exactly the same.
Now show him surrounded by floating photographs of cats, dogs, and birds.
The girl is holding a photo of her cat named Whiskers.
```

Il modello manterra':
- Faccia identica
- Colore identico
- Stile identico
- Vestiti/accessori identici

Cambiera' SOLO:
- Ambiente
- Posa
- Azione
- Altri personaggi nella scena

### Step 3: Aggiungi Altri Personaggi

Quando devi aggiungere un nuovo personaggio:

```
Keep MILO exactly the same.
Add a new character to the scene:
- SOFIA: 7-year-old girl, brown hair with pink bow, curious expression
Show them together in [scena].
```

Una volta che hai entrambi:

```
Keep both characters (MILO and SOFIA) exactly the same.
Now show them [nuova scena].
```

### Step 4: Workflow Completo per un Libro

1. **Genera MILO** da solo (master)
2. **Genera SOFIA** da sola (master)
3. **Genera LUCA** da solo (master)
4. **Genera scena con tutti e 3** - "Keep all characters exactly..."
5. **Da li' in poi**, usa sempre "Keep all characters exactly the same"
6. Per scene con meno personaggi: "Keep MILO and SOFIA exactly the same. Luca is not in this scene."

---

## METODO 2: Grok (Alternativa Gratuita)

Se non hai Gemini Advanced, Grok funziona bene ma richiede piu' attenzione.

### Principio
Grok mantiene il contesto visivo **all'interno di una singola chat**.
NON aprire tab multipli - usa UN SOLO tab per tutto il libro.

### Step 1: Analizza il Libro

Ordina i capitoli per numero di personaggi (decrescente):
```
CH4, CH5, CH8 → Sofia + Luca + MILO (3 personaggi) ← INIZIA QUI
CH1, CH2, CH3, CH6 → Sofia + MILO (2 personaggi)
CH7 → MILO solo (1 personaggio)
```

### Step 2: Genera il Master

Apri x.com/i/grok → Create Images

```
Children's book illustration, watercolor style.
Three characters in a cozy living room:
- MILO: small orange robot with round base (no legs), warm glowing LED eyes
- SOFIA: 7-year-old girl with brown hair and pink bow
- LUCA: 5-year-old boy with messy blonde hair

Warm afternoon light, soft colors. 4k
```

### Step 3: Cascata "Same Characters"

NELLA STESSA CHAT:

```
Same characters, same style. Sofia and MILO only (no Luca).
Sofia sits on floor with cardboard box, discovering MILO inside.
Morning light through window.
```

```
Same characters, same style. Sofia and MILO only.
MILO surrounded by floating photos of cats, dogs, birds.
Sofia holds photo of her cat Whiskers.
```

### Note Grok
- **Pro**: Gratuito con X Premium, veloce
- **Contro**: Meno consistente di Gemini, richiede piu' tentativi
- **Importante**: Mai chiudere la chat fino a fine libro

---

## METODO 3: Grok Tasks (Sperimentale)

Grok ha una funzione "Tasks" per operazioni batch.

```
Create a task to generate 8 children's book illustrations.

CHARACTER SHEET (maintain across all images):
- MILO: Orange robot, round base, no legs, warm LED eyes
- SOFIA: 7yo girl, brown hair, pink bow
- LUCA: 5yo boy, blonde messy hair

SCENES:
1. Sofia finds MILO in box
2. Brain vs circuits explanation
3. Cat photo recognition
...

Style: Soft watercolor, warm lighting, 4k
```

**Status:** Beta, risultati variabili.

---

## Checklist Pre-Generazione

- [ ] Ho il testo completo del libro?
- [ ] Ho elencato TUTTI i personaggi con descrizioni dettagliate?
- [ ] Ho ordinato i capitoli per numero di personaggi?
- [ ] Ho scelto il metodo (Gemini o Grok)?
- [ ] Ho preparato i prompt per ogni scena?

---

## Template Prompt Gemini

**Creazione personaggio:**
```
Create a [STYLE] character:
- [NOME]: [descrizione fisica completa, vestiti, colori, espressione]
- Show on [sfondo], [posa]
- 4k quality
```

**Nuova scena (stesso personaggio):**
```
Keep this character exactly the same.
Now show [him/her/them] [descrizione scena].
[Ambiente, luce, mood]
```

**Aggiunta personaggio:**
```
Keep [NOME] exactly the same.
Add a new character:
- [NUOVO NOME]: [descrizione]
Show them together [scena].
```

---

## Template Prompt Grok

**Master (tutti i personaggi):**
```
Children's book illustration, [STYLE] style.
[N] characters in [AMBIENTE]:
- [NOME]: [descrizione]
- [NOME]: [descrizione]
[Luce, colori]. 4k
```

**Scena successiva:**
```
Same characters, same style.
[Chi e' presente] only.
[Descrizione scena].
```

---

## Errori da Evitare

1. **NON cambiare le descrizioni fisiche** - Usa sempre "same character" / "exactly the same"
2. **NON aprire chat/tab multipli** - Perdi il contesto
3. **NON rigenerare se va bene** - Salva e vai avanti
4. **NON dimenticare UPSCALE** - Sempre prima di scaricare
5. **NON cambiare stile a meta'** - Definiscilo all'inizio e mantienilo

---

## Post-Produzione

### Layout (Canva o HTML)
1. Importa tutte le immagini
2. Disponi pagina per pagina
3. Aggiungi testo (gia' scritto da Gianni Parola)
4. Esporta come PDF

### Nomenclatura File
```
[libro]/images/
├── master-all-characters.jpg  ← Riferimento
├── master-milo.jpg            ← Singolo personaggio
├── master-sofia.jpg
├── cover.jpg
├── 1.jpg
├── 2.jpg
└── ...
```

---

## Per Pina Pennello - Workflow Completo

1. **Ricevi assegnazione** da Editore Capo
2. **Leggi il testo** completo
3. **Identifica personaggi** e crea descrizioni dettagliate
4. **Scegli metodo**: Gemini (preferito) o Grok
5. **Genera master** per ogni personaggio
6. **Genera scena con tutti** i personaggi
7. **Cascata "same characters"** per ogni capitolo
8. **Upscale e scarica** ogni immagine
9. **Nomina correttamente** i file
10. **Comunica completamento** a Editore Capo

---

## Risorse

- **Gemini**: gemini.google.com
- **Grok**: x.com/i/grok
- **Canva**: canva.com
- **Tweet di riferimento**: https://x.com/girisimcihisler/status/2012978302131274236

---

*Procedura creata per Casa Editrice Onde*
*Basata su workflow @girisimcihisler*
*Aggiornare quando si trova un metodo migliore*

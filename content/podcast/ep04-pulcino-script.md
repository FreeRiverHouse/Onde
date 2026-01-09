# Podcast Onde - Episodio 04
## "Il Pulcino Bagnato" - Filastrocca Tradizionale Italiana

**Serie:** Piccole Rime - Poesie per bambini
**Voce:** Gianni Parola
**Target:** Bambini 3-6 anni
**Durata stimata:** 3-4 minuti

---

## SCRIPT COMPLETO

### INTRO (20 secondi)

**[MUSICA: Suono delicato di pioggia, poi cinguettio di uccellini, sfuma sotto la voce]**

**GIANNI PAROLA:**
Ciao bambini, bentornati! Sono Gianni Parola.

Oggi vi racconto la storia di un pulcino molto coraggioso. Era piccino piccino, e un giorno... si e' trovato sotto la pioggia!

Ma come finisce? Ascoltate...

---

### LETTURA FILASTROCCA (45 secondi)

**[MUSICA: Pioggia leggera, poi sole - musica che segue la storia]**

**GIANNI PAROLA:** *(voce calda, ritmo lento e cantilenato)*

C'era una volta un pulcino
che andava per il mondo piccino piccino.

*(pausa breve)*

Un giorno piovve forte forte
e il pulcino si bagno' fino alla morte.

*(voce che diventa piu' allegra, musica cambia - arriva il sole)*

Ma poi usci' il sole bello
e il pulcino si asciugo' tutto il mantello.

*(voce gioiosa)*

E da quel giorno in poi
canto' per tutti noi:

*(cantando allegro, come il pulcino)*

"Pio pio pio, son tutto asciutto io!"

---

### COMMENTO PER BAMBINI (60 secondi)

**[MUSICA: Melodia allegra con pigolii in sottofondo]**

**GIANNI PAROLA:**
Vi e' piaciuta? E' una filastrocca che le nonne italiane raccontano da tantissimo tempo.

Sapete, il nostro pulcino ha avuto un po' di paura sotto la pioggia. Era tutto bagnato, povero piccino!

Ma poi cosa e' successo? **(pausa)**

E' uscito il sole! E il pulcino si e' asciugato tutto.

E sapete qual e' la cosa piu' bella? Che alla fine era cosi' contento che ha cominciato a cantare!

*(imitando il pulcino, allegro)*

"Pio pio pio, son tutto asciutto io!"

Vedete bambini? A volte ci capitano cose brutte... come bagnarsi sotto la pioggia. Ma poi torna sempre il sole! E possiamo cantare anche noi, come il pulcino.

---

### OUTRO (30 secondi)

**[MUSICA: Melodia allegra con pigolii]**

**GIANNI PAROLA:**
E cosi' finisce la storia del nostro pulcino.

La prossima volta che vi bagnate sotto la pioggia, non preoccupatevi! Aspettate il sole... e poi potete cantare:

*(allegro, invitando i bambini)*

"Pio pio pio, son tutto asciutto io!"

Provate anche voi a dirlo con me...

*(pausa per far ripetere ai bambini)*

Bravi! Grazie per avermi ascoltato. Ci vediamo alla prossima storia!

Ciao ciao, pulcini!

**[MUSICA: Sale con pigolii allegri e sfuma in uscita]**

---

## NOTE DI REGIA

### Musica di sottofondo suggerita

| Sezione | Tipo musica | Note |
|---------|-------------|------|
| INTRO | Pioggia + cinguettii | Atmosfera campagna italiana |
| LETTURA (pioggia) | Pioggia + tonalita' minore | Creare tensione leggera |
| LETTURA (sole) | Melodia maggiore, allegra | Cambio netto - arriva il sole! |
| COMMENTO | Allegra con pigolii | Giocosa, per bambini piccoli |
| OUTRO | Allegra crescendo | Invito a cantare insieme |

### Effetti sonori

- **00:00** - Suono pioggia leggera
- **00:05** - Cinguettii di uccellini
- **00:45** - Pioggia piu' forte (durante "piovve forte forte")
- **01:00** - Suono sole/arpa glissando (quando esce il sole)
- **01:30** - Pigolii allegri (pio pio pio)
- **02:30** - Pigolii continuano in sottofondo
- **03:00** - Pigolii in uscita

### Indicazioni per la voce (ElevenLabs / Edge TTS)

- **Voice ID:** Gianni Parola (it-IT-DiegoNeural per Edge TTS)
- **Stability:** 0.5 (variato, espressivo)
- **Clarity:** 0.75 (chiaro ma non robotico)
- **Style:** Warm, playful, storytelling per bambini piccoli
- **Pacing:** Lento e cantilenato nella filastrocca, vivace nel commento
- **Rate:** -15% (piu' lento del normale, per bambini piccoli)

### Note speciali

- **"Pio pio pio"**: Cantare allegro, come un pulcino!
- **Cambio tono**: Dal triste (pioggia) all'allegro (sole) - deve essere NETTO
- **Interazione**: Nell'outro, lasciare una pausa vera per far ripetere ai bambini
- **Target**: Bambini 3-6 anni, quindi linguaggio semplice e ritmo lento

### Formato finale

- **Audio:** MP3 320kbps
- **Durata target:** 3:00 - 4:00
- **Intro jingle Onde:** 3 secondi (onde sonore)
- **Outro jingle Onde:** 3 secondi

---

## SCRIPT EDGE TTS (Python)

```python
#!/usr/bin/env python3
import asyncio
import edge_tts

TEXT = """
Ciao bambini, bentornati! Sono Gianni Parola.

Oggi vi racconto la storia di un pulcino molto coraggioso. Era piccino piccino, e un giorno... si e' trovato sotto la pioggia!

Ma come finisce? Ascoltate...

C'era una volta un pulcino
che andava per il mondo piccino piccino.

Un giorno piovve forte forte
e il pulcino si bagno' fino alla morte.

Ma poi usci' il sole bello
e il pulcino si asciugo' tutto il mantello.

E da quel giorno in poi
canto' per tutti noi:

Pio pio pio, son tutto asciutto io!

Vi e' piaciuta? E' una filastrocca che le nonne italiane raccontano da tantissimo tempo.

Sapete, il nostro pulcino ha avuto un po' di paura sotto la pioggia. Era tutto bagnato, povero piccino!

Ma poi cosa e' successo?

E' uscito il sole! E il pulcino si e' asciugato tutto.

E sapete qual e' la cosa piu' bella? Che alla fine era cosi' contento che ha cominciato a cantare!

Pio pio pio, son tutto asciutto io!

Vedete bambini? A volte ci capitano cose brutte... come bagnarsi sotto la pioggia. Ma poi torna sempre il sole! E possiamo cantare anche noi, come il pulcino.

E cosi' finisce la storia del nostro pulcino.

La prossima volta che vi bagnate sotto la pioggia, non preoccupatevi! Aspettate il sole... e poi potete cantare:

Pio pio pio, son tutto asciutto io!

Provate anche voi a dirlo con me...

Bravi! Grazie per avermi ascoltato. Ci vediamo alla prossima storia!

Ciao ciao, pulcini!
"""

VOICE = "it-IT-DiegoNeural"
OUTPUT_FILE = "/Users/mattia/Downloads/onde-podcast-ep04-pulcino-bagnato.mp3"

async def main():
    communicate = edge_tts.Communicate(TEXT, VOICE, rate="-15%", pitch="-5Hz")
    await communicate.save(OUTPUT_FILE)
    print(f"Audio generato: {OUTPUT_FILE}")

if __name__ == "__main__":
    asyncio.run(main())
```

---

## PROMPT GROK PER ILLUSTRAZIONE

```
Watercolor children's book illustration, soft Italian style,
adorable fluffy yellow chick in the rain then sunshine,
split scene: left side gentle rain with sad wet chick,
right side golden warm sunshine with happy dry chick singing,
cozy Italian countryside with puddles reflecting sky,
Luzzati/Beatrix Potter aesthetic, sweet and heartwarming,
NOT Pixar NOT 3D, natural colors, soft brushstrokes, 4k
```

---

## CREDITS

**Testo originale:** Filastrocca tradizionale italiana - Dominio pubblico
**Adattamento e script:** Onde Publishing
**Voce:** Gianni Parola
**Produzione:** Onde Studio

---

## CHECKLIST PRE-PRODUZIONE

- [ ] Voice ID Gianni Parola definito (Edge TTS: it-IT-DiegoNeural)
- [ ] Musica royalty-free selezionata (pioggia -> sole)
- [ ] Effetti sonori pronti (pioggia, sole, pigolii)
- [ ] Jingle Onde registrato
- [ ] Script approvato da Mattia
- [ ] Audio generato
- [ ] Illustrazione generata su Grok
- [ ] Video lip sync creato
- [ ] Upload YouTube completato
- [ ] Post X pubblicato

---

*Script creato: 2026-01-09*
*Status: Pronto per produzione*

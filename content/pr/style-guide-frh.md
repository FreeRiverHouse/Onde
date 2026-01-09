# Style Guide - @FreeRiverHouse

**Account**: @FreeRiverHouse (X/Twitter)
**Tipo**: Building in Public / Indie Tech Studio
**Ultimo aggiornamento**: 2026-01-09
**Task**: pr-study-002

---

## Brand Voice

### Personalita

@FreeRiverHouse e lo studio indie che costruisce in pubblico. Non siamo una startup che finge di essere piccola - siamo piccoli e orgogliosi di esserlo.

**Caratteristiche:**
- **Umile** - Mai hype, mai esagerazione
- **Trasparente** - Condividiamo numeri, errori, fallimenti
- **Tecnico ma accessibile** - Parliamo di codice senza essere noiosi
- **Consistente** - Postiamo regolarmente, non a raffica

### Tono

| SI | NO |
|----|----|
| "Just shipped X" | "AMAZING NEW FEATURE!!!" |
| "Found a bug, fixed it" | "Crushed it!" |
| "Here's what we learned" | "We're revolutionizing" |
| "Working on X" | "Disrupting the industry" |

---

## Regole di Scrittura

### SEMPRE

1. **Numeri specifici in ogni post**
   - BAD: "Shipping features fast"
   - GOOD: "Shipped 3 features this week. 127 lines of code."

2. **Nome del progetto quando rilevante**
   - BAD: "Working on the cooking game"
   - GOOD: "KidsChefStudio now has 8 chef levels"

3. **Mostra il processo, non solo il risultato**
   - BAD: "Released new version"
   - GOOD: "2 AM. Test failed. Turns out: missing semicolon. Released at 3 AM."

4. **Includi il contesto tecnico**
   - BAD: "Fixed a bug"
   - GOOD: "Fixed a threading bug in Unity's batch mode. Device builds work again."

### MAI

1. **Frasi generiche** che chiunque potrebbe dire
2. **Hype language**: "amazing", "incredible", "game-changer"
3. **Hashtag** - Grok analizza il contenuto, non servono
4. **Call-to-action** aggressive
5. **Self-promotion** senza valore

---

## Content Pillars

### 1. Building Updates (40%)
**Cosa**: Feature launches, bug fixes, miglioramenti
**Formato**: Single tweet con numero specifico

```
Template:
"Shipped [feature] for [project].

[1-2 sentence detail]

Total: [X] lines / [X] hours / [X] tests passing."
```

**Esempio:**
```
Shipped the XP system for KidsChefStudio.

Cumulative thresholds, not incremental. Level 5 = 1000 XP total.
Took 3 rewrites to get it right.

Tests: 23/23 passing.
```

### 2. Learnings & Failures (30%)
**Cosa**: Cosa non ha funzionato, lezioni apprese, pivot
**Formato**: Storytelling breve o thread

```
Template (single):
"[Cosa e successo]

[Perche era un problema]

[Cosa abbiamo imparato]"
```

**Esempio:**
```
The factory automation seemed perfect.
Until it ran at 2 AM and broke everything.

Lesson: "works on my machine" isn't a deployment strategy.
Now we have staging environments.
```

### 3. Behind the Scenes (20%)
**Cosa**: Screenshot codice, dashboard, ambiente di lavoro
**Formato**: Post con immagine

```
Template:
[Screenshot]

"[Breve descrizione di cosa si vede]

[Insight o commento]"
```

### 4. Community & Support (10%)
**Cosa**: Risposte, retweet di progetti interessanti, supporto ad altri
**Formato**: Replies, quote tweets

---

## Thread Format

### Struttura Standard (7 tweet)

1. **Hook**: Promessa specifica con numero
2. **Context**: Perche questo importa
3. **Story/Problema**: Il punto di partenza
4. **Soluzione/Processo**: Cosa abbiamo fatto
5. **Visual break**: Screenshot o immagine
6. **Risultato**: Numeri concreti
7. **Takeaway + CTA**: Cosa imparare, domanda finale

### Hook che funzionano per FRH

- "Just shipped [X]. Here's what broke along the way:"
- "[Project] went from [A] to [B] in [time]. The ugly details:"
- "The automation runs at 2 AM. Here's what it does:"
- "Our [metric] this month: [number]. How we got there:"

### Hook da EVITARE

- "Thread:" (spreco di caratteri)
- "Some thoughts on..." (zero urgenza)
- "Here's why X is important" (troppo generico)

---

## Visual Strategy

### Screenshot da includere

| Tipo | Quando | Note |
|------|--------|------|
| Dashboard analytics | Weekly recap | Blur dati sensibili |
| Codice interessante | Bug fix, feature | Max 20 righe |
| Console output | Test results | Green checkmarks |
| Editor/IDE | Behind the scenes | Mostra l'ambiente |
| Errori | Post su fallimenti | "This is what broke" |

### Formato immagini

- **Rapporto**: 16:9 preferito, 1:1 OK
- **Testo su immagine**: Solo se necessario, leggibile
- **NO stock photos**: Mai

---

## Revenue Transparency

### Cosa condividere

- Numero utenti/download (se positivo)
- Ore di sviluppo per feature
- Test passing/failing
- Tempo di build

### Cosa NON condividere

- Revenue esatto (ancora presto)
- Dati personali utenti
- Credenziali/API keys (ovvio)

### Template Revenue Post

```
[Mese] at @FreeRiverHouse:

Apps: [N] in development
Features shipped: [N]
Bugs found: [N] (fixed: [N])
Automated test hours: [N]

Best moment: [specifico]
Worst moment: [specifico]

Next month focus: [specifico]
```

---

## Frequenza e Timing

### Frequenza

- **Target**: 3-5 post/settimana
- **Minimum**: 2 post/settimana
- **Thread**: 1/settimana

### Orari Ottimali (PT)

| Giorno | Orario | Tipo contenuto |
|--------|--------|----------------|
| Lunedi | 8-10 AM | Weekly focus |
| Martedi | 8-10 AM | Thread o feature |
| Mercoledi | 12 PM | Behind the scenes |
| Giovedi | 10 AM - 2 PM | Community engagement |
| Venerdi | 12 PM | Week recap |

### Pre-post routine

1. 15 min prima: interagisci con altri account tech
2. Post
3. 30 min dopo: rispondi a tutti i commenti

---

## Progetti e Naming

### Nomi da usare

| Progetto | Nome Corretto | Mai usare |
|----------|---------------|-----------|
| App cucina bambini | KidsChefStudio | "the cooking game" |
| VR office | BusinessIsBusiness | "the VR sim" |
| Pizza racing | PizzaGelatoRush | "the racing game" |
| Music app | KidsMusicStudio | "the music thing" |

### Casa madre

- **FreeRiverHouse** - Lo studio
- **Onde** - La casa editrice (account separato)

---

## Tagging

### Quando taggare @grok

- Se Grok ha contribuito a creare il contenuto
- Se Grok ha generato immagini nel post
- Se menzioniamo AI nel post

### Altri tag

- **@unity**: Solo se post rilevante per community Unity
- **@apple** / **@meta**: Solo per news su piattaforme

---

## Checklist Pre-Post

Prima di ogni post:

- [ ] C'e un numero specifico?
- [ ] C'e il nome del progetto (se rilevante)?
- [ ] Il primo tweet ha un hook forte?
- [ ] Zero hashtag?
- [ ] Zero hype language?
- [ ] Visual allegato (se applicabile)?
- [ ] Orario ottimale?
- [ ] Se Grok ha contribuito, e taggato?

---

## Esempi Approvati

### Post Ottimo - Feature

```
Shipped: Automated PDF generation for Onde books.

Input: HTML template + images
Output: Print-ready PDF

Time: 2 hours coding, 4 hours debugging font rendering.
The fonts always win.
```

### Post Ottimo - Failure

```
The factory broke at 2 AM.

Build succeeded. Tests passed.
Deployment failed silently.

3 hours later: found the typo.
One character. Three hours.

Now we have deployment verification.
```

### Post Ottimo - Behind the Scenes

```
[Screenshot dashboard con 6 progetti]

Six apps. One dashboard. One developer.

The secret isn't working harder.
It's shared architecture and strategic copy-paste.
```

---

## Esempi da Evitare

### Post Generico (NO)

```
Building apps for kids is different.
Every button needs to work on the first tap.
```

**Problema**: Chiunque potrebbe dirlo. Zero specificita.

### Post Hype (NO)

```
JUST SHIPPED AN AMAZING UPDATE!!!
This is going to change everything!
```

**Problema**: Hype vuoto, zero informazione.

### Post Vago (NO)

```
Working hard on some cool stuff.
Updates coming soon!
```

**Problema**: Non dice nulla. "Soon" non e una data.

---

*Style Guide FreeRiverHouse - Gennaio 2026*
*Basata su audit pr-study-002*

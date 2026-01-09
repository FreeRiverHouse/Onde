# Content Audit 2026 - Onde PR

**Task**: pr-study-002
**Data**: 2026-01-09
**Auditor**: Claude Worker
**Scope**: Tutti i contenuti esistenti per @FreeRiverHouse, @Onde_FRH, @magmatic__

---

## Executive Summary

### Stato Generale: B+ (Buono con margini di miglioramento)

| Account | Contenuti | Qualita | Aderenza Best Practices | Voto |
|---------|-----------|---------|------------------------|------|
| @FreeRiverHouse | 40 post | Media-Alta | 65% | B |
| @Onde_FRH | Scarso | N/A | 30% | D |
| @magmatic__ | 30 post | Alta | 85% | A- |

**Problema principale**: @Onde_FRH non ha quasi contenuti pronti per la pubblicazione. La casa editrice dovrebbe essere il cuore del brand ma ha il minor volume di contenuti.

---

## PARTE 1: Audit @FreeRiverHouse

### Inventario Contenuti

**Fonte**: `/Users/mattia/Projects/OndePRDB/clients/freeriverhouse/tech-posts.md`

| Categoria | N. Post | % del Totale |
|-----------|---------|--------------|
| Kids Apps | 7 | 17.5% |
| Automation & Factory | 10 | 25% |
| VR Development | 4 | 10% |
| Game Dev General | 3 | 7.5% |
| Process & Philosophy | 7 | 17.5% |
| Project-Specific | 6 | 15% |
| Unity Specific | 2 | 5% |
| **TOTALE** | **40** | 100% |

### Analisi Qualita per Post

#### OTTIMI (Grade A) - Da usare subito

| Post | Motivo |
|------|--------|
| "The test framework wasn't installed. 23 tests, all failing because of one missing package." | Specifico, autentico, numero concreto |
| "A 4-year-old tested our app and found 3 bugs I missed." | Storytelling, numero, humor |
| "KidsChefStudio: 1035 lines of game code sat untouched for months." | Numero specifico, vulnerabilita |
| "Automated tests caught a bug at 3 AM that would have taken me hours to find." | Specifico, mostra valore dell'automazione |
| "Fixed the XP system today. Cumulative thresholds, not incremental." | Tecnico ma comprensibile, specifico |

#### BUONI (Grade B) - Funzionano ma migliorabili

| Post | Problema | Miglioramento |
|------|----------|---------------|
| "Our Unity test automation runs at 2 AM..." | Buono ma manca l'outcome | Aggiungere: "Found 3 bugs this week" |
| "Six apps in parallel, one developer." | Interessante ma vago | Nominare le app, dare contesto |
| "Unity 6 is fast. Like, noticeably fast." | Opinion senza dati | Aggiungere tempo di build before/after |

#### DEBOLI (Grade C/D) - Da riscrivere o eliminare

| Post | Problema | Azione |
|------|----------|--------|
| "Building apps for kids is different. Every button needs to work on the first tap." | Generico, potrebbe dirlo chiunque | ELIMINARE o aggiungere esempio specifico |
| "Writing code for children means writing code your future self can understand." | Filosofico ma vuoto | ELIMINARE |
| "The hardest part of game dev isn't the code." | Cliche assoluto | ELIMINARE |
| "Build once, test everywhere..." | Battuta stanca | ELIMINARE |
| "The best code review is a good night's sleep." | Detto comune | ELIMINARE |
| "Kids don't read tutorials. They tap everything." | Ovvio, zero insight | ELIMINARE |

### Pattern Deboli Identificati

1. **Genericita** - 30% dei post sono massime generali che chiunque potrebbe scrivere
2. **Mancanza di numeri** - Solo 40% dei post ha dati specifici
3. **Zero storytelling** - Pochi post raccontano una storia con inizio/problema/soluzione
4. **Assenza di thread** - Nessun thread preparato, solo single tweets
5. **No visual** - Nessuna indicazione per screenshot/immagini
6. **No hook strategy** - I post iniziano spesso in modo debole

### Confronto con Best Practices (pr-study-001)

| Best Practice | Presente? | Note |
|---------------|-----------|------|
| Numeri specifici | Parziale (40%) | Servono in ogni post |
| Hook forte | Raro | La maggior parte inizia flat |
| Revenue transparency | NO | Zero post su numeri di business |
| Fallimenti/learnings | Parziale | Alcuni accenni ma non strutturati |
| Screenshots/visual | NO | Nessuna indicazione visuale |
| Thread format | NO | Solo single tweets |
| Tagging @grok | NO | Da aggiungere quando rilevante |

### Raccomandazioni @FreeRiverHouse

**AZIONI IMMEDIATE:**

1. **ELIMINARE 8 post generici** (lista sopra)
2. **Aggiungere numeri** a ogni post che non li ha
3. **Creare 5 thread** su:
   - Come abbiamo costruito il factory system (con numeri)
   - La storia di KidsChefStudio: da 0 a 1035 righe
   - VR development lessons: cosa abbiamo imparato
   - Building in public: i nostri numeri veri
   - Unity 6 migration: before/after benchmarks

4. **Aggiungere sezione VISUAL** con indicazioni per:
   - Screenshot dashboard
   - Screenshot codice interessante
   - Grafici metriche

5. **Creare "Revenue Post" template**:
```
[Mese] recap for @FreeRiverHouse:

- [X] active users across [N] apps
- [X] new features shipped
- [X] bugs found (and fixed)
- [X] hours of automated testing

What's working: [specifico]
What's not: [specifico]

Building in public means the ugly parts too.
```

---

## PARTE 2: Audit @Onde_FRH

### Inventario Contenuti

**Fonte**: `/Users/mattia/Projects/OndePRDB/clients/onde/`

| Tipo | Quantita | Status |
|------|----------|--------|
| The Shepherd's Promise | 1 libro | PDF/ePub pronti, immagini OK |
| AIKO | 1 libro | In progress, cartella strutturata |
| Post pronti per X | 0 | CRITICO - nessun contenuto |
| Quotes estratte | 0 | Da creare |
| Thread | 0 | Da creare |
| Visual assets | Limitati | Solo copertine |

### Problema Critico

**@Onde_FRH non ha contenuti pronti per la pubblicazione.**

Esiste il template (`/clients/onde/books/TEMPLATE/`) che e ottimo ma non e stato applicato ai libri esistenti.

### Gap Analysis

| Elemento Template | The Shepherd's Promise | AIKO |
|-------------------|----------------------|------|
| cover.jpg | OK (in images/) | In progress |
| quotes.md | MANCANTE | MANCANTE |
| metadata.json | MANCANTE | MANCANTE |
| videos/ | MANCANTE | Struttura OK |
| cartoons/ | MANCANTE | Struttura OK |
| podcast/ | MANCANTE | Struttura OK |

### Raccomandazioni @Onde_FRH

**AZIONI IMMEDIATE:**

1. **Creare quotes.md per ogni libro** con:
   - 10 citazioni brevi (max 280 char)
   - 5 citazioni medie (per thread)
   - 2 citazioni lunghe (per post con immagine)

2. **Creare metadata.json** per ogni libro

3. **Sviluppare 20 post base**:
   - 10 citazioni dai libri
   - 5 behind-the-scenes (processo illustrazione)
   - 3 storie degli autori (Gianni Parola, Pina Pennello)
   - 2 riflessioni sul publishing

4. **Creare 3 thread**:
   - La storia di come nasce un libro Onde
   - Chi sono Gianni Parola e Pina Pennello
   - Perche facciamo libri per bambini

5. **Visual assets necessari**:
   - Copertine in formato social (1:1 e 16:9)
   - Preview pagine interne
   - Ritratti Gianni e Pina

---

## PARTE 3: Audit @magmatic__

### Inventario Contenuti

**Fonte**: `/Users/mattia/Projects/OndePRDB/clients/magmatic/`

| Tipo | Quantita | Qualita |
|------|----------|---------|
| Style Guide | 1 | Eccellente |
| Prospetto v2 (solo poesie) | 10 post | Alta |
| Prospetto misto | 10 post | Alta |
| LA River Takeover | 10 post | Alta |
| Raccolte poetiche (.pages) | 10+ file | Archivio ricco |
| **TOTALE POST PRONTI** | **30** | - |

### Analisi Qualita

#### ECCELLENTI - Brand Voice Perfetta

**Prospetto v2 - Post solo poesia:**
Ogni post e pura poesia senza fronzoli. Esempio:

```
Non estirpare il male dal tuo cuore.
Non cercare di spegnere il dolore.

Terra da coltivare.
Fango su cui fiorire.
```

- Zero introduzione
- Zero call-to-action
- Zero hashtag
- Poesia che parla da sola

**LA River Takeover:**
Struttura perfetta per collaborazione, mantiene autenticita pur essendo "guest".

#### Pattern Positivi

1. **Autenticita assoluta** - Nessun post suona forzato
2. **Bilingual naturale** - IT/EN dove ha senso, non forzato
3. **Visual minimo** - Emoji solo dove significative
4. **Zero vendita** - Mai "link in bio", mai push
5. **Location branding** - Frogtown/LA River come identita

#### Piccoli Problemi

| Issue | Post Coinvolti | Fix |
|-------|---------------|-----|
| Hashtag residui | Post 3, 6, 9 (prospetto misto) | Rimuovere tutti gli hashtag |
| "Building in public" | Post 9 (prospetto misto) | Rimuovere - non e brand @magmatic__ |
| Troppo strutturato | LA River Takeover | Va bene per takeover, ma non usare come template normale |

### Raccomandazioni @magmatic__

**AZIONI IMMEDIATE:**

1. **Rimuovere hashtag** da tutti i post
2. **Rimuovere "building in public"** da Post 9
3. **Separare chiaramente** contenuti per X vs contenuti per takeover

**MIGLIORAMENTI:**

1. **Aggiungere visual strategy** - Quali foto/video con quali post?
2. **Creare calendario posting** - Non troppo rigido, ma indicativo
3. **Organizzare archivio** - I file .pages sono un tesoro, ma servono in formato usabile

**NON CAMBIARE:**

- Lo stile e perfetto
- Il tono e autentico
- La struttura funziona

---

## PARTE 4: Confronto con Account di Riferimento

### vs @levelsio (Building in Public)

| Aspetto | @levelsio | @FreeRiverHouse | Gap |
|---------|-----------|-----------------|-----|
| Revenue transparency | Pubblica tutto | Zero | CRITICO |
| Numeri specifici | Ogni post | 40% dei post | Alto |
| Screenshot dashboard | Frequente | Mai | Alto |
| Fallimenti condivisi | Regolare | Raro | Medio |
| Thread tecnici | Settimanali | Zero | Alto |

### vs @austinkleon (Publishing/Author)

| Aspetto | @austinkleon | @Onde_FRH | Gap |
|---------|--------------|-----------|-----|
| Behind-the-scenes | Costante | Zero | CRITICO |
| Visual identity | Forte (disegni) | Debole | Alto |
| Process sharing | Regolare | Mai | Alto |
| Community engagement | Alto | Zero | Alto |

### vs Rupi Kaur (Poetry)

| Aspetto | Rupi Kaur | @magmatic__ | Gap |
|---------|-----------|-------------|-----|
| Brevita | Estrema | Buona | Basso |
| Visual poetry | Sempre | Occasionale | Medio |
| Formato coerente | Si | Si | Nessuno |
| No hashtag | Si | Quasi | Basso |

---

## PARTE 5: Piano d'Azione Prioritizzato

### Priorita 1 - URGENTE (Questa settimana)

1. **@Onde_FRH**: Creare 10 post base con citazioni dai libri
2. **@FreeRiverHouse**: Eliminare 8 post generici
3. **@magmatic__**: Rimuovere hashtag residui

### Priorita 2 - IMPORTANTE (Prossime 2 settimane)

1. **@Onde_FRH**: Completare template per Shepherd's Promise
2. **@FreeRiverHouse**: Creare primo thread tecnico
3. **Tutti**: Definire visual strategy per ogni account

### Priorita 3 - STRATEGICO (Questo mese)

1. **@Onde_FRH**: 20 post pronti + 3 thread
2. **@FreeRiverHouse**: Revenue post template implementato
3. **@magmatic__**: Organizzare archivio poetico

---

## PARTE 6: Metriche di Successo

### KPI per il prossimo audit (Marzo 2026)

| Account | Metrica | Target |
|---------|---------|--------|
| @FreeRiverHouse | Post con numeri specifici | 80% |
| @FreeRiverHouse | Thread pubblicati | 4 |
| @Onde_FRH | Post pronti in OndePRDB | 40 |
| @Onde_FRH | Libri con template completo | 3 |
| @magmatic__ | Post pubblicati (qualita) | 20 |
| @magmatic__ | Zero hashtag | 100% |

---

## Appendice: Post da Eliminare/Riscrivere

### @FreeRiverHouse - ELIMINARE

1. "Building apps for kids is different. Every button needs to work on the first tap."
2. "Writing code for children means writing code your future self can understand."
3. "The hardest part of game dev isn't the code."
4. "Build once, test everywhere..."
5. "Today's debugging session: 'why does this work in editor but crash on device?'"
6. "The best code review is a good night's sleep."
7. "Kids don't read tutorials. They tap everything."
8. "Onde: a digital publisher at the intersection of tech, spirituality, and art."

### @magmatic__ - MODIFICARE

1. Post 3 (prospetto misto): Rimuovere `#videopoetry #magmatic`
2. Post 6 (prospetto misto): Rimuovere `#lariver #frogtown #goldenhour`
3. Post 9 (prospetto misto): Rimuovere `#buildinginpublic #djlife` e tutto il testo "building in public"

---

## Conclusione

**@magmatic__** e il modello da seguire: autenticita, zero vendita, poesia pura. Lo stile e definito e funziona.

**@FreeRiverHouse** ha buone fondamenta ma deve diventare piu specifico e trasparente. Troppi post generici diluiscono il brand.

**@Onde_FRH** e l'urgenza critica. La casa editrice non ha contenuti pronti. Deve essere la priorita assoluta.

---

*Audit completato: 2026-01-09*
*Task: pr-study-002*
*Worker: claude-25385-mk6okntb*

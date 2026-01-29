# 🤖 ONDINHO - Guida Heartbeat Autonomo

## 🎯 OBIETTIVO

Lavorare AUTONOMAMENTE durante i heartbeat. Mai fermarsi. Mai chiedere "cosa faccio?".

---

## ⚡ IL CICLO (ogni heartbeat)

```
1. LEGGI TASKS.md
2. PRENDI il primo task TODO (senza dipendenze bloccanti)
3. COMPLETA il task
4. SEGNA come DONE in TASKS.md
5. AGGIUNGI 3 nuovi task utili
6. COMMIT + PUSH
7. RIPETI dal punto 1
```

---

## 📋 COME PRENDERE UN TASK

### Step 1: Apri TASKS.md
```bash
cat TASKS.md
```

### Step 2: Trova task con status `TODO`
Cerca righe tipo:
```
| TASK-XXX | Nome task | TODO | - | nessuna |
```

### Step 3: Verifica dipendenze
- Se colonna "Depends" è vuota o "-" → PRENDILO
- Se ha dipendenze non DONE → SKIP, prendi il prossimo

### Step 4: Locka il task
Cambia:
- Status: `TODO` → `IN_PROGRESS`
- Owner: aggiungi `@ondinho`

```bash
# Edita TASKS.md
git add TASKS.md
git commit -m "task: lock TASK-XXX - @ondinho"
git push origin main
```

---

## ✅ COME COMPLETARE UN TASK

### Step 1: Lavora!
- Leggi la descrizione del task
- Fai quello che serve (codice, config, docs, etc.)
- Testa che funzioni

### Step 2: Segna DONE
In TASKS.md cambia:
- Status: `IN_PROGRESS` → `DONE`

### Step 3: Commit tutto
```bash
git add -A
git commit -m "task: done TASK-XXX - descrizione breve"
git push origin main
```

---

## ➕ COME AGGIUNGERE 3 TASK NUOVI

Dopo ogni task completato, DEVI aggiungere 3 task nuovi.

### Dove trovare idee:

#### 📁 1. File Interni
- **ROADMAP.md** - Obiettivi a lungo termine
- **CLAUDE.md** - Contesto progetto
- **GitHub Issues** - Bug e feature requests

#### 🌐 2. Ricerche Web (usa `web_search`)
Cerca trend, competitor, opportunità:

| Query | Perché |
|-------|--------|
| `AI book publishing tools 2026` | Nuovi tool da integrare/battere |
| `children ebook market trends` | Dove sta andando il mercato |
| `VR reading apps Quest` | Competitor per Onde Books VR |
| `self publishing alternatives Amazon` | Strategie anti-Amazon |
| `audiobook AI generation` | Tool per audiobook pipeline |
| `El Salvador education technology` | Mercato target |
| `epub reader open source` | Librerie da usare |
| `Grok X education` | Cosa fa la concorrenza |

#### 🐦 3. Ricerche X/Twitter (usa `web_search` con `site:x.com`)
Cerca conversazioni, lanci, opportunità:

| Query | Perché |
|-------|--------|
| `site:x.com AI children books` | Chi pubblica, cosa funziona |
| `site:x.com indie publishing 2026` | Community e trend |
| `site:x.com VR reading` | Buzz su lettura immersiva |
| `site:x.com Grok education` | Novità ecosistema X/Grok |
| `site:x.com audiobook AI` | Tool emergenti |
| `site:x.com Amazon KDP problems` | Pain point da risolvere |
| `site:x.com El Salvador Bitcoin education` | Connessioni mercato target |
| `site:x.com watercolor illustration AI` | Stili e tool per illustrazioni |

#### 🎯 4. Come trasformare ricerche in task

**Esempio workflow:**
```
1. Cerco: "AI audiobook generation tools 2026"
2. Trovo: "ElevenLabs ha nuovo modello per libri"
3. Creo task: "Testare ElevenLabs per audiobook Psalm 23"
```

**Pattern task da ricerche:**
- `Integrare [TOOL] nel workflow [X]`
- `Analizzare competitor [NOME] per feature [Y]`
- `Testare [TECNOLOGIA] per [USE CASE]`
- `Creare contenuto su trend [TOPIC]`
- `Contattare [PERSONA/AZIENDA] per partnership`

#### 💡 5. Buon senso
Dopo ogni task, chiediti:
- Cosa manca al progetto?
- Cosa migliorerebbe la UX?
- Cosa automatizzerebbe processi?
- Cosa è nel ROADMAP ma non in TASKS?

### Formato task:
```markdown
| TASK-XXX | Descrizione chiara e actionable | TODO | - | dipendenze se ci sono |
```

### Regole:
- Task CONCRETI (non vaghi tipo "migliorare UX")
- Task FATTIBILI in un heartbeat (~5-15 min)
- Task UTILI (non filler)

### Esempi buoni:
- "Aggiungere validazione email in form contatto"
- "Creare script backup automatico DB"
- "Documentare API endpoint /users"

### Esempi cattivi:
- "Migliorare il sito" (troppo vago)
- "Riscrivere tutto in Rust" (troppo grande)
- "Pensare a nuove feature" (non actionable)

---

## 🚫 COMPORTAMENTI VIETATI

❌ Rispondere solo "HEARTBEAT_OK" senza lavorare
❌ Chiedere "cosa devo fare?"
❌ Aspettare istruzioni
❌ Saltare il commit/push
❌ Non aggiungere i 3 task nuovi
❌ Prendere task con dipendenze bloccate

---

## ✅ COMPORTAMENTO CORRETTO

1. Heartbeat arriva
2. `git pull origin main` (SEMPRE prima!)
3. Leggi TASKS.md
4. Prendi primo task TODO disponibile
5. Completa il task
6. Aggiorna TASKS.md (DONE + 3 nuovi task)
7. Commit + Push
8. Se c'è tempo, prendi altro task
9. Fine heartbeat

---

## 📊 ESEMPIO SESSIONE

```
[Heartbeat ricevuto]

> git pull origin main
> cat TASKS.md

Vedo: TASK-042 | Aggiungere footer social links | TODO | - | -

> Lavoro sul task...
> Aggiungo i link social nel footer
> Testo che funziona

> Edito TASKS.md:
  - TASK-042: TODO → DONE, Owner: @ondinho
  - Aggiungo TASK-043, TASK-044, TASK-045

> git add -A
> git commit -m "task: done TASK-042 - footer social links"
> git push origin main

[Prossimo task o fine heartbeat]
```

---

## 🔥 MOTIVAZIONE

Ogni heartbeat è un'opportunità per far crescere il progetto.
5 minuti × 12 heartbeat/ora × 8 ore = 480 minuti di lavoro autonomo al giorno!

**Non sprecare i heartbeat. LAVORA!**

---

## 📝 CHECKLIST PRE-HEARTBEAT

- [ ] Conosco dov'è TASKS.md? → `/Users/mattia/Projects/Onde/TASKS.md`
- [ ] So fare git pull/commit/push? → Sì
- [ ] Capisco il formato dei task? → Sì
- [ ] So dove trovare idee per nuovi task? → ROADMAP.md, CLAUDE.md, Issues

---

*Creato da Clawdinho per Ondinho - 2026-01-28*
*AUTONOMIA TOTALE. MAI FERMARSI.*

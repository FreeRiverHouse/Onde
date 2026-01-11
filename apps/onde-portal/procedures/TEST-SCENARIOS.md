# Test Scenarios per Procedure Onde.la

Questo documento contiene scenari di test realistici per validare le procedure operative del sito onde.la.

---

## Scenari di Modifica

### 1. Cambio Prezzo Prodotto

**Input (cosa chiede l'utente):**
> "Cambia il prezzo di Meditations da $2.99 a $3.99"

**Procedura da usare:**
1. `SEARCH-AND-LOCATE.md` - Trovare dove e' definito il prezzo di Meditations
2. `SAFE-EDIT.md` - Modificare il valore del prezzo
3. `VERIFY-CHANGES.md` - Verificare la modifica

**Verifica attesa:**
- [ ] Il prezzo visualizzato sulla homepage mostra $3.99
- [ ] Nessun altro prezzo e' stato modificato
- [ ] Il formato del prezzo e' consistente (simbolo $, due decimali)
- [ ] Il file modificato e' solo quello contenente i dati del libro

**Possibili errori:**
- Prezzo non trovato (nome libro scritto diversamente)
- Modifica di un prezzo sbagliato (altro libro con nome simile)
- Formato prezzo errato (es. "3.99" invece di "$3.99")
- Modifica accidentale di altri campi nello stesso file

---

### 2. Aggiunta Libro alla Homepage

**Input (cosa chiede l'utente):**
> "Aggiungi il libro 'The Art of War' alla homepage"

**Procedura da usare:**
1. `SEARCH-AND-LOCATE.md` - Trovare dove sono definiti i libri della homepage
2. `CONTENT-STRUCTURE.md` - Capire la struttura dati dei libri
3. `SAFE-EDIT.md` - Aggiungere il nuovo libro
4. `VERIFY-CHANGES.md` - Verificare l'aggiunta

**Verifica attesa:**
- [ ] Il nuovo libro appare nella lista della homepage
- [ ] Tutti i campi obbligatori sono presenti (titolo, autore, prezzo, link)
- [ ] L'ordine dei libri esistenti non e' cambiato (a meno che non richiesto)
- [ ] La formattazione e' consistente con gli altri libri

**Possibili errori:**
- Struttura dati incompleta (campi mancanti)
- Sintassi JSON/YAML errata
- Libro duplicato (se gia' esistente)
- Immagine di copertina mancante
- Link Amazon non valido

---

### 3. Rimozione Link Amazon

**Input (cosa chiede l'utente):**
> "Rimuovi il link Amazon dal libro X"

**Procedura da usare:**
1. `SEARCH-AND-LOCATE.md` - Trovare il libro specifico
2. `SAFE-EDIT.md` - Rimuovere o svuotare il campo link
3. `VERIFY-CHANGES.md` - Verificare la rimozione

**Verifica attesa:**
- [ ] Il link Amazon non e' piu' presente nel codice
- [ ] Il bottone "Buy" non appare o mostra stato appropriato
- [ ] Gli altri dati del libro sono intatti
- [ ] Gli altri libri non sono stati modificati

**Possibili errori:**
- Rimozione del libro intero invece del solo link
- Rottura della struttura dati (virgola mancante, parentesi)
- Link rimosso dal libro sbagliato
- Bottone "Buy" rotto (undefined invece di nascosto)

---

### 4. Modifica Descrizione Homepage

**Input (cosa chiede l'utente):**
> "Cambia la descrizione della homepage"

**Procedura da usare:**
1. `SEARCH-AND-LOCATE.md` - Trovare il file della homepage
2. `CONTENT-STRUCTURE.md` - Identificare dove e' la descrizione
3. `SAFE-EDIT.md` - Modificare il testo
4. `VERIFY-CHANGES.md` - Verificare la modifica

**Verifica attesa:**
- [ ] La nuova descrizione appare correttamente
- [ ] La formattazione HTML/Markdown e' corretta
- [ ] I meta tag SEO sono aggiornati (se applicabile)
- [ ] Nessun altro contenuto della homepage e' cambiato

**Possibili errori:**
- Caratteri speciali non escapati
- Tag HTML non chiusi
- Descrizione troppo lunga (overflow layout)
- Meta description non aggiornata (SEO inconsistente)

---

### 5. Aggiunta Nuova Pagina

**Input (cosa chiede l'utente):**
> "Aggiungi una nuova pagina /about"

**Procedura da usare:**
1. `CONTENT-STRUCTURE.md` - Capire come sono strutturate le pagine
2. `CREATE-NEW-FILE.md` - Creare il nuovo file/componente
3. `ROUTING.md` - Configurare la route (se necessario)
4. `VERIFY-CHANGES.md` - Verificare la nuova pagina

**Verifica attesa:**
- [ ] La pagina /about e' raggiungibile
- [ ] Lo stile e' consistente con il resto del sito
- [ ] I link di navigazione funzionano
- [ ] La pagina e' responsive

**Possibili errori:**
- Route non configurata (404)
- File creato nella posizione sbagliata
- Import/export mancanti
- Stili non applicati
- Link nella navigation non aggiunto

---

### 6. Cambio Colore Bottone

**Input (cosa chiede l'utente):**
> "Cambia il colore del bottone Buy"

**Procedura da usare:**
1. `SEARCH-AND-LOCATE.md` - Trovare lo stile del bottone
2. `STYLES.md` - Capire il sistema di stili (CSS/Tailwind/etc)
3. `SAFE-EDIT.md` - Modificare il colore
4. `VERIFY-CHANGES.md` - Verificare visivamente

**Verifica attesa:**
- [ ] Il bottone ha il nuovo colore
- [ ] Gli stati hover/active sono consistenti
- [ ] Il contrasto testo/sfondo e' adeguato (accessibilita')
- [ ] Solo i bottoni "Buy" sono cambiati, non altri bottoni

**Possibili errori:**
- Cambio colore di tutti i bottoni (classe troppo generica)
- Stato hover non aggiornato
- Colore non accessibile (contrasto insufficiente)
- Override CSS non applicato (specificita')

---

### 7. Aggiunta Onde Animate allo Sfondo

**Input (cosa chiede l'utente):**
> "Aggiungi le onde animate allo sfondo"

**Procedura da usare:**
1. `SEARCH-AND-LOCATE.md` - Trovare il componente sfondo/layout
2. `CREATE-NEW-FILE.md` - Creare componente animazione (se necessario)
3. `SAFE-EDIT.md` - Integrare l'animazione
4. `PERFORMANCE.md` - Verificare impatto performance
5. `VERIFY-CHANGES.md` - Verificare visivamente

**Verifica attesa:**
- [ ] Le onde animate sono visibili
- [ ] L'animazione e' fluida (60fps)
- [ ] Non interferisce con il contenuto
- [ ] Funziona su mobile
- [ ] Non rallenta il caricamento pagina

**Possibili errori:**
- Animazione che blocca il main thread
- Z-index errato (onde sopra il contenuto)
- Memory leak (animazione non pulita)
- Non funziona su Safari/Firefox
- Impatto eccessivo su performance mobile

---

### 8. Aggiornamento Footer con Link Social

**Input (cosa chiede l'utente):**
> "Aggiorna il footer con nuovi link social"

**Procedura da usare:**
1. `SEARCH-AND-LOCATE.md` - Trovare il componente footer
2. `SAFE-EDIT.md` - Aggiungere/modificare link
3. `VERIFY-CHANGES.md` - Verificare i link

**Verifica attesa:**
- [ ] I nuovi link social sono visibili
- [ ] Le icone sono corrette per ogni piattaforma
- [ ] I link aprono in nuova tab (target="_blank")
- [ ] rel="noopener noreferrer" presente per sicurezza
- [ ] Layout footer non rotto

**Possibili errori:**
- URL social errati
- Icone mancanti o sbagliate
- Link che non aprono in nuova tab
- Footer che va a capo male su mobile
- Link social duplicati

---

## Scenari di Emergenza

### 1. Deploy Andato Male, Sito Rotto

**Sintomi:**
- Sito non raggiungibile (500, 502, 503)
- Pagina bianca
- Errori JavaScript in console
- Contenuto mancante

**Procedura da usare:**
1. `EMERGENCY-ROLLBACK.md` - Rollback immediato
2. `DIAGNOSE.md` - Identificare la causa
3. `HOTFIX.md` - Correggere se possibile

**Verifica attesa:**
- [ ] Sito tornato online
- [ ] Versione precedente ripristinata
- [ ] Log degli errori salvati per analisi

**Azioni immediate:**
```bash
# Verifica stato deploy
git log --oneline -5

# Rollback al commit precedente
git revert HEAD --no-edit
git push

# Oppure rollback via Vercel/Netlify dashboard
```

---

### 2. Modifica Sbagliata in Produzione

**Sintomi:**
- Contenuto errato visibile sul sito
- Prezzo sbagliato
- Link rotto
- Testo con errori

**Procedura da usare:**
1. `QUICK-FIX.md` - Correzione rapida
2. `VERIFY-CHANGES.md` - Verificare la correzione

**Verifica attesa:**
- [ ] Errore corretto
- [ ] Deploy completato con successo
- [ ] Nessun effetto collaterale

**Tempo massimo:** 5 minuti per correzione + deploy

---

### 3. File Corrotto

**Sintomi:**
- Errori di parsing JSON/YAML
- Errori di sintassi JavaScript
- Build fallita
- File troncato

**Procedura da usare:**
1. `DIAGNOSE.md` - Identificare il file corrotto
2. `GIT-RECOVERY.md` - Recuperare versione precedente
3. `VERIFY-CHANGES.md` - Verificare l'integrita'

**Verifica attesa:**
- [ ] File ripristinato
- [ ] Build passa
- [ ] Contenuto integro

**Comando di recupero:**
```bash
# Vedere storia del file
git log --oneline -- path/to/file

# Recuperare versione specifica
git checkout <commit-hash> -- path/to/file
```

---

### 4. Rollback Necessario

**Quando usare:**
- Dopo deploy con bug critico
- Dopo modifica che rompe funzionalita'
- Su richiesta esplicita

**Procedura da usare:**
1. `EMERGENCY-ROLLBACK.md`

**Verifica attesa:**
- [ ] Sito funzionante come prima della modifica
- [ ] Nessuna perdita di dati
- [ ] Deploy rollback completato

**Comandi:**
```bash
# Identificare commit da ripristinare
git log --oneline -10

# Opzione 1: Revert (crea nuovo commit)
git revert <bad-commit>
git push

# Opzione 2: Reset (riscrive storia - ATTENZIONE)
git reset --hard <good-commit>
git push --force  # PERICOLOSO - usare solo se certi
```

---

## Scenari di Verifica

### 1. Verificare che SOLO la Modifica Richiesta sia Presente

**Procedura:**
```bash
# Vedere esattamente cosa e' cambiato
git diff HEAD~1

# Verificare file modificati
git show --stat HEAD

# Verificare che sia un solo file (se atteso)
git diff --name-only HEAD~1 | wc -l
```

**Checklist:**
- [ ] Numero di file modificati corrisponde alle attese
- [ ] Le righe cambiate sono solo quelle necessarie
- [ ] Nessuna modifica whitespace non intenzionale
- [ ] Nessun file aggiunto/rimosso per errore

---

### 2. Verificare che Nessun Altro File sia Cambiato

**Procedura:**
```bash
# Lista file modificati
git diff --name-only HEAD~1

# Verificare stato working directory
git status

# Cercare file non tracciati
git status --porcelain
```

**Red flags:**
- File non attesi nella lista
- File di configurazione modificati
- node_modules o .env modificati
- File lock (package-lock.json) con cambiamenti inattesi

---

### 3. Verificare che i Link Funzionino

**Procedura manuale:**
1. Aprire il sito in browser
2. Cliccare ogni link modificato
3. Verificare che porti alla destinazione corretta
4. Verificare che si apra in nuova tab (se esterno)

**Procedura automatica:**
```bash
# Usare un link checker
npx broken-link-checker https://onde.la --recursive
```

**Checklist:**
- [ ] Link interni funzionano
- [ ] Link esterni funzionano
- [ ] Nessun 404
- [ ] Nessun redirect loop

---

### 4. Verificare che le Immagini Carichino

**Procedura:**
1. Aprire DevTools > Network
2. Filtrare per "Img"
3. Ricaricare la pagina
4. Verificare che tutte le immagini abbiano status 200

**Checklist:**
- [ ] Tutte le immagini caricano (status 200)
- [ ] Dimensioni file ragionevoli
- [ ] Formato corretto (WebP preferito)
- [ ] Alt text presente (accessibilita')
- [ ] Lazy loading funziona (se implementato)

**Comando per verificare in console:**
```javascript
// Verificare immagini rotte
document.querySelectorAll('img').forEach(img => {
  if (!img.complete || img.naturalWidth === 0) {
    console.error('Immagine rotta:', img.src);
  }
});
```

---

## Template di Test Report

```markdown
## Test Report - [DATA]

### Modifica Testata
[Descrizione della modifica]

### Procedura Usata
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

### Verifiche Eseguite
- [ ] Solo file attesi modificati
- [ ] Build passa
- [ ] Deploy completato
- [ ] Verifica visiva OK
- [ ] Link funzionanti
- [ ] Immagini caricate

### Risultato
- [ ] PASS
- [ ] FAIL - Motivo: ___

### Note
[Eventuali osservazioni]
```

---

## Matrice di Rischio

| Scenario | Rischio | Impatto | Mitigazione |
|----------|---------|---------|-------------|
| Cambio prezzo | Basso | Alto | Verifica pre-commit |
| Aggiunta libro | Medio | Medio | Validazione struttura |
| Rimozione link | Basso | Basso | Backup prima della modifica |
| Nuova pagina | Medio | Medio | Test routing locale |
| Cambio stili | Medio | Medio | Preview Vercel |
| Animazioni | Alto | Alto | Test performance |
| Deploy rotto | Critico | Critico | Rollback automatico |

---

*Ultimo aggiornamento: Gennaio 2025*
*Maintainer: QA Team Onde.la*

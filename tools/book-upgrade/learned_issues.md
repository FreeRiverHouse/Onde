# Book Upgrade - Learned Issues Database

## 🔍 **PROBLEMI IDENTIFICATI DA FEEDBACK MATTIA**

Questo documento raccoglie tutti i problemi trovati durante la produzione libri per integrare in `book.upgrade` e `anti-slop`.

---

## **CATEGORIA: WORKFLOW**

### Issue #1: Bypassare Editore Capo
- **Problema**: Creare contenuti senza passare da Editore Capo
- **Impatto**: Qualità inconsistente, mancanza QC
- **Fix**: SEMPRE usare Editore Capo (che ha incorporato Pina e Gianni)
- **Priorità**: CRITICA
- **Check anti-slop**: Verificare che ogni libro abbia passato workflow Editore Capo
- **Nota**: Pina e Gianni sono ora personalità incorporate in Editore Capo

### Issue #2: Mancanza Commit Frequenti
- **Problema**: Non fare commit durante lavoro, rischio perdita dati
- **Impatto**: Idee perse, lavoro non salvato
- **Fix**: Commit ogni 30 minuti o dopo ogni milestone
- **Priorità**: ALTA
- **Check book.upgrade**: Auto-commit dopo ogni fase completata

### Issue #3: Non Leggere ROADMAP
- **Problema**: Iniziare lavoro senza leggere ROADMAP.md
- **Impatto**: Priorità sbagliate, task non allineati
- **Fix**: SEMPRE leggere ROADMAP.md all'inizio sessione
- **Priorità**: CRITICA
- **Check book.upgrade**: Verificare priorità libro in ROADMAP prima di iniziare

---

## **CATEGORIA: QUALITÀ CONTENUTI**

### Issue #4: Anatomia Errata
- **Problema**: Mani con dita sbagliate, visi deformati, proporzioni errate
- **Impatto**: Immagini non pubblicabili, perdita tempo
- **Fix**: Checklist anatomia obbligatoria: 5 dita/mano, 2 occhi, proporzioni corrette
- **Priorità**: CRITICA
- **Check anti-slop**: Analisi automatica anatomia con AI

### Issue #5: Stile Visivo Sbagliato
- **Problema**: Stile Pixar/3D, guance rosse esagerate, colori plasticosi
- **Impatto**: Non fit brand ONDE, da rigenerare
- **Fix**: Sempre specificare "European watercolor, NO Pixar, NO red cheeks"
- **Priorità**: ALTA
- **Check anti-slop**: Verificare stile contro linee guida ONDE

### Issue #6: Riferimenti Editori Esterni
- **Problema**: Menzioni Penguin, Random House, etc. nei testi
- **Impatto**: Problemi legali, non professionale
- **Fix**: Scan automatico per nomi editori, rimozione
- **Priorità**: ALTA
- **Check anti-slop**: Grep per lista editori esterni

---

## **CATEGORIA: TECNICA**

### Issue #7: Caratteri Corrotti
- **Problema**: â€™ invece di ', â€œ invece di "
- **Impatto**: Testo illeggibile, non professionale
- **Fix**: Scan e replace automatico caratteri UTF-8 corrotti
- **Priorità**: MEDIA
- **Check anti-slop**: Regex per caratteri corrotti comuni

### Issue #8: Formattazione Inconsistente
- **Problema**: Layout diverso tra capitoli, spacing irregolare
- **Impatto**: Aspetto non professionale
- **Fix**: Template standardizzati, validazione layout
- **Priorità**: MEDIA
- **Check book.upgrade**: Applicare template standard

---

## **CATEGORIA: PROCESSO**

### Issue #9: Mancanza Doppio Check
- **Problema**: Immagini mandate senza QC interno Editore Capo
- **Impatto**: Errori non catturati, qualità bassa
- **Fix**: SEMPRE doppio check interno: Editore Capo verifica con personalità Pina incorporata
- **Priorità**: CRITICA
- **Check anti-slop**: Verificare log doppio check
- **Nota**: Pina è ora personalità incorporata in Editore Capo

### Issue #10: Subscription Non Autorizzate
- **Problema**: Quasi sottoscritto servizi a pagamento senza permesso
- **Impatto**: Costi non autorizzati, violazione regole
- **Fix**: STOP immediato su qualsiasi pagamento, avvisare Mattia
- **Priorità**: CRITICA
- **Check book.upgrade**: Nessun servizio esterno a pagamento

---

## **CATEGORIA: CONTENUTO**

### Issue #11: Testi Inventati
- **Problema**: Inventare o modificare testi di autori reali
- **Impatto**: Problemi legali gravissimi, licenziamento
- **Fix**: SEMPRE verificare testo originale al 100%, usare Grok/web per verifica
- **Priorità**: CRITICA
- **Check anti-slop**: Confronto con fonte originale (Project Gutenberg)

### Issue #12: Catena Non Identificata
- **Problema**: Iniziare produzione senza identificare catena (CLASSICS/FUTURES/LEARN)
- **Impatto**: Stile visivo sbagliato, typography errata
- **Fix**: SEMPRE identificare catena prima di iniziare
- **Priorità**: ALTA
- **Check book.upgrade**: Verificare catena assegnata

---

## **INTEGRAZIONE IN PROCEDURE:**

### **book.upgrade deve:**
1. ✅ Verificare workflow completo (Issue #1)
2. ✅ Auto-commit frequente (Issue #2)
3. ✅ Check priorità ROADMAP (Issue #3)
4. ✅ Applicare template standard (Issue #8)
5. ✅ Identificare catena (Issue #12)

### **anti-slop deve:**
1. ✅ Check anatomia AI (Issue #4)
2. ✅ Verificare stile visivo (Issue #5)
3. ✅ Scan editori esterni (Issue #6)
4. ✅ Fix caratteri corrotti (Issue #7)
5. ✅ Verificare doppio check (Issue #9)
6. ✅ Confrontare con fonte originale (Issue #11)

---

## **PROSSIMI PASSI:**

1. [ ] Integrare questi check in `book.upgrade.py`
2. [ ] Aggiungere scan automatici in `anti_slop_checker.py`
3. [ ] Creare checklist anatomia automatica
4. [ ] Testare su libro esistente
5. [ ] Documentare risultati

---

*Ultimo aggiornamento: 2026-01-11*
*Fonte: Chat history, CLAUDE.md, feedback Mattia*

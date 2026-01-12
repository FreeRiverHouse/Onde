# Meditations - Marcus Aurelius - Changelog

## Versione Attuale: v1.3

### Stato Elementi
- **Cover**: images/cover.jpg (approvata)
- **Immagini Capitoli**: book1-12.jpg
  - book10.jpg e book11.jpg: DA CONFERMARE ordine swap
- **Forward**: Gianni Parola (approvata)
  - "You found this. Or maybe it found you..."
  - "The rest is between you and Marcus."
  - Rimosso @magmatic__ e prezzo
- **Testo**: George Long translation (1862) da Project Gutenberg
- **Layout**: HTML con CSS Onde Classics
- **Note Biografiche**: Pagina 159 - "About Marcus Aurelius"

### Modifiche Approvate da Mattia
- [11 Gen 2026] Forward di Gianni Parola aggiunta
- [11 Gen 2026] Rimosso riferimento @magmatic__ dalla forward
- [11 Gen 2026] Rimosso prezzo dalla forward
- [11 Gen 2026] Invertite immagini book10 e book11 ✅ CONFERMATO
- [11 Gen 2026] Aggiunte note biografiche alla penultima pagina (159)

---

## Storico Versioni

### v1.3 (11 Gen 2026)
- Aggiunte note biografiche su Marcus Aurelius (pagina 160)
- Posizionate prima della pagina FINIS
- ⚠️ ERRORE PRECEDENTE: usato generate-complete-pdf.js che ha sovrascritto HTML
- ✅ CORRETTO: modificato meditations-george-long.html (file corretto con forward)
- ✅ Usato html-to-pdf.js per generare PDF senza sovrascrivere

### v1.2 (11 Gen 2026)
- FIXED: Contenuto corrotto (MIT 404) → Gutenberg source
- Forward completa con firma Gianni Parola
- Testo verificato al 100%

### v1.1 (11 Gen 2026)
- Swap immagini book10/book11
- Rimozione @magmatic__ e prezzo dalla forward

### v1.0 (10 Gen 2026)
- Prima versione
- Problema: contenuto MIT 404 invece di testo reale

---

## Checklist Pre-Modifica

Prima di modificare QUALSIASI cosa:

- [ ] Leggi questo CHANGELOG
- [ ] Identifica SOLO cosa deve cambiare
- [ ] Fai backup (git commit)
- [ ] Modifica SOLO quello richiesto
- [ ] Verifica che tutto il resto sia IDENTICO
- [ ] Aggiorna questo CHANGELOG

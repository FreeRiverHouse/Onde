# Sessione 11 Gennaio 2026 - Upgrade Chirurgico Psalm 23

## Obiettivo
Testare procedura `book.upgrade` con parametri su Psalm 23 inglese:
- **Parametro**: Solo testo (immagini invariate)
- **Modifica**: Aggiungere credito autore Re Davide
- **Tipo**: Upgrade chirurgico (minimal change)

---

## Ricerca Storica: Autore Salmo 23

### Attribuzione Tradizionale
- **Header biblico**: "A Psalm of David" (מזמור לדוד - Mizmor le-David)
- **Tradizione**: Universalmente attribuito a **Re Davide**
- **Contesto storico**: Davide era pastore da giovane, poi divenne Re d'Israele (c. 1040-970 BCE)
- **Consenso**: Maggioranza della tradizione ebraica e cristiana attribuisce a Davide
- **73 salmi su 150** hanno l'intestazione "le-David"

### Dibattito Accademico
- Alcuni studiosi moderni ipotizzano datazione post-esilica
- Tuttavia, l'attribuzione tradizionale a Davide rimane dominante
- Per scopi editoriali ONDE: attribuzione a Re Davide è appropriata e rispettosa

### Fonti Consultate
- Wikipedia: Psalm 23
- Bible Odyssey: Scholarly analysis
- Enduring Word Bible Commentary

---

## Formato Credito Scelto

**Formato finale implementato:**
```
Attributed to King David
Shepherd, Psalmist, King of Israel
```

**Rationale:**
- "Attributed to" riconosce dibattito accademico mantenendo rispetto tradizione
- "King David" è il titolo formale appropriato
- "Shepherd, Psalmist, King of Israel" cattura le tre identità chiave di Davide
- Stile coerente con tono ONDE (elegante, rispettoso, educativo)

---

## Modifiche Implementate

### File: `books/psalm-23-abundance/book.html`

#### 1. Aggiunto CSS per attribuzione autore
```css
.psalm-attribution {
    font-family: 'Libre Baskerville', serif;
    font-size: 11pt;
    font-style: italic;
    color: #888;
    margin-top: 15mm;
    text-align: center;
}

.psalm-attribution .author-name {
    font-weight: 600;
    color: #7a6030;
    font-style: normal;
}
```

#### 2. Aggiunto credito nella pagina Psalm 23
```html
<div class="psalm-attribution">
    Attributed to <span class="author-name">King David</span><br>
    Shepherd, Psalmist, King of Israel
</div>
```

**Posizione**: Dopo il testo completo del Salmo 23, prima del page number

---

## Risultati

### ✅ Completato
- Ricerca storica su autore Salmo 23
- Definizione formato credito appropriato
- Modifica HTML con stile coerente
- Rigenerazione PDF (3.3M, identico size = solo testo modificato)
- Immagini completamente invariate (come richiesto)

### 📊 Metriche Upgrade
- **Tipo**: Chirurgico (minimal change)
- **Scope**: Solo testo
- **Immagini**: 0 modificate (tutte preservate)
- **Linee codice modificate**: 19 linee (CSS + HTML)
- **Tempo esecuzione**: ~5 minuti
- **Ricerca richiesta**: Sì (verifica storica attribuzione)

---

## Parametri book.upgrade Identificati

Dalla richiesta Mattia, la procedura `book.upgrade` deve supportare:

### Parametri Principali
1. **`--scope`**: 
   - `text` = solo testo
   - `images` = solo immagini
   - `both` = testo + immagini (default)

2. **`--type`**:
   - `surgical` = modifiche chirurgiche minimal
   - `enhancement` = miglioramenti generali
   - `full` = upgrade completo V1→V2

3. **`--preserve-images`**: Flag per mantenere immagini esistenti

### Esempio Uso
```bash
python book.upgrade.py \
  --book "Psalm 23" \
  --scope text \
  --type surgical \
  --preserve-images \
  --change "Add author attribution to King David"
```

---

## Lezioni per Procedura book.upgrade

### ✅ Best Practices
1. **Ricerca prima di modificare**: Verificare fatti storici/culturali
2. **Stile coerente**: Mantenere typography e colori esistenti
3. **Minimal change**: Solo ciò che è richiesto, niente di più
4. **Preservare assets**: Immagini non toccate quando non necessario
5. **Rigenerazione pulita**: PDF identico size = solo testo modificato

### 🎯 Parametri da Implementare
- Scope control (text/images/both)
- Type control (surgical/enhancement/full)
- Preserve flags per assets specifici
- Change description obbligatoria per audit trail

---

## File Modificati
- `books/psalm-23-abundance/book.html` - Aggiunto credito Re Davide
- `books/psalm-23-abundance/psalm-23-abundance.pdf` - Rigenerato con credito

## Commit
- Prossimo: "Surgical upgrade Psalm 23: Add King David attribution"

---

*Upgrade chirurgico completato con successo - 2026-01-11 15:15*
*Primo test procedura book.upgrade con parametri*

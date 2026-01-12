# SCRIPTS - Automazione Procedure ONDE

## ⚠️ REGOLA: Esegui SEMPRE gli script di verifica prima e dopo ogni operazione!

---

## Script Disponibili

### 1. `verify-all.sh`
**Master script - verifica TUTTO il progetto**

```bash
./scripts/verify-all.sh
```

Controlla:
- ✅ Tutti i libri (HTML, PDF, CHANGELOG, immagini)
- ✅ Contenuti social (hashtag, post, duplicati)
- ✅ Procedure (file esistenti, registry)
- ✅ Backup (directory, file recenti)
- ✅ Git (file non committati)

**Quando usare:** Prima di qualsiasi deploy importante

---

### 2. `verify-book.sh`
**Verifica singolo libro**

```bash
./scripts/verify-book.sh [book_directory] [html_file] [pdf_file]

# Esempio:
./scripts/verify-book.sh books/meditations
```

Controlla:
- ✅ Pagine PDF
- ✅ Forward presente
- ✅ Note biografiche
- ✅ Immagini (esistenza file)
- ✅ Cover
- ✅ Pagina FINIS
- ✅ CHANGELOG

**Quando usare:** Prima e dopo OGNI upgrade/correzione libro

---

### 3. `verify-social-content.sh`
**Verifica contenuti social**

```bash
./scripts/verify-social-content.sh [file.html]

# Esempio:
./scripts/verify-social-content.sh CONTENUTI-SOCIAL-CURRENT.html
```

Controlla:
- ✅ ZERO hashtag (OBBLIGATORIO!)
- ✅ Conteggio post
- ✅ Duplicati citazioni
- ✅ Immagini
- ✅ Organizzazione per libro
- ✅ CTA (onde.la)

**Quando usare:** Prima e dopo OGNI modifica contenuti social

---

### 4. `backup-manager.sh`
**Gestione backup automatica**

```bash
# Crea backup libro
./scripts/backup-manager.sh create book books/meditations

# Crea backup social
./scripts/backup-manager.sh create social CONTENUTI-SOCIAL-CURRENT.html

# Lista backup
./scripts/backup-manager.sh list book
./scripts/backup-manager.sh list social

# Ripristina backup
./scripts/backup-manager.sh restore backups/book/meditations-BACKUP-2026-01-11.tar.gz

# Pulisci backup vecchi (>30 giorni)
./scripts/backup-manager.sh clean 30
```

**Quando usare:** SEMPRE prima di modifiche importanti

---

## Workflow Standard

### Per UPGRADE LIBRO:

```bash
# 1. BACKUP
./scripts/backup-manager.sh create book books/[libro]

# 2. SNAPSHOT PRE
./scripts/verify-book.sh books/[libro]

# 3. FAI LE MODIFICHE
# ... modifica solo HTML esistente ...
# ... usa html-to-pdf.js (MAI generate-*.js!) ...

# 4. VERIFICA POST
./scripts/verify-book.sh books/[libro]

# 5. SE ERRORI → STOP! Ripristina backup
# 6. SE OK → Invia su Telegram
```

### Per CONTENUTI SOCIAL:

```bash
# 1. BACKUP
./scripts/backup-manager.sh create social [file.html]

# 2. VERIFICA PRE
./scripts/verify-social-content.sh [file.html]

# 3. FAI LE MODIFICHE

# 4. VERIFICA POST
./scripts/verify-social-content.sh [file.html]

# 5. SE ERRORI (es. hashtag trovati) → STOP! Correggi!
# 6. SE OK → Invia su Telegram
```

---

## Exit Codes

| Codice | Significato |
|--------|-------------|
| 0 | ✅ Tutti i check passati |
| 1 | ⛔ Errori critici trovati - NON PROCEDERE! |

---

## Posizione Backup

```
/Users/mattia/Projects/Onde/backups/
├── book/           # Backup libri (.tar.gz)
├── social/         # Backup contenuti social (.html)
└── ...
```

---

## FAIL-SAFE

Se uno script esce con codice 1:

1. ⛔ **NON INVIARE SU TELEGRAM**
2. 🔍 Analizza l'errore
3. 🔄 Ripristina da backup se necessario
4. 🔧 Correggi il problema
5. ✅ Ri-esegui verifica
6. Solo se passa → procedi

---

## Aggiungere Nuovi Script

1. Crea script in `/scripts/`
2. Rendi eseguibile: `chmod +x scripts/nuovo-script.sh`
3. Documenta in questo README
4. Aggiorna `PROCEDURE-MASTER-REGISTRY.md`

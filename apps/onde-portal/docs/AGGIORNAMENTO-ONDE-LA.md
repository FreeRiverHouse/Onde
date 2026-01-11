# Procedura Aggiornamento onde.la

## Regola d'Oro
**MAI modificare direttamente la produzione. SEMPRE testare prima in locale.**

---

## Setup Iniziale (una volta sola)

```bash
# Il server locale gira su:
# - http://localhost:3333 (da questo Mac)
# - http://192.168.1.243:3333 (da qualsiasi device sulla LAN)
```

---

## Workflow Aggiornamento

### 1. AVVIA SERVER LOCALE
```bash
cd /Users/mattia/Projects/Onde/apps/onde-portal
./scripts/local-server.sh
```

### 2. FAI LA MODIFICA
- Modifica i file in `out/` (modifiche chirurgiche)
- OPPURE modifica `src/` e rebuilda (modifiche strutturali)

### 3. TESTA IN LOCALE
Apri due finestre browser affiancate:
- **Sinistra**: http://localhost:3333 (versione modificata)
- **Destra**: https://onde.la (versione produzione)

Verifica che:
- [ ] L'unica differenza è quella richiesta
- [ ] Nient'altro è cambiato
- [ ] Il sito funziona (navigazione, download, link)

### 4. CONFRONTO VISIVO
```bash
# Screenshot locale
curl -o /tmp/local.html http://localhost:3333

# Screenshot produzione
curl -o /tmp/prod.html https://onde.la

# Diff dei contenuti (opzionale)
diff /tmp/local.html /tmp/prod.html | head -50
```

### 5. APPROVAZIONE
- Mostra a Mattia la differenza
- Aspetta OK esplicito

### 6. DEPLOY
```bash
cd /Users/mattia/Projects/Onde/apps/onde-portal
npx wrangler pages deploy out --project-name=onde-portal
```

### 7. VERIFICA POST-DEPLOY
```bash
# Aspetta propagazione
sleep 30

# Verifica
./scripts/verify-site.sh https://onde.la
```

### 8. SNAPSHOT (se tutto OK)
```bash
SNAPSHOT_NAME="snapshot-XXX-descrizione-$(date +%Y%m%d)"
cp -r out "snapshots/$SNAPSHOT_NAME"
echo "Descrizione della modifica" > "snapshots/$SNAPSHOT_NAME/SNAPSHOT-INFO.md"
```

---

## Rollback di Emergenza

Se qualcosa va storto dopo il deploy:

```bash
./scripts/rollback.sh snapshot-001-2books-free-20260111
```

---

## Checklist Pre-Deploy

- [ ] Server locale avviato
- [ ] Modifica testata in locale
- [ ] Confronto visivo fatto (locale vs produzione)
- [ ] Solo la modifica richiesta è presente
- [ ] Mattia ha approvato
- [ ] Snapshot corrente salvato (in caso di rollback)

---

## Comandi Rapidi

| Azione | Comando |
|--------|---------|
| Avvia server locale | `./scripts/local-server.sh` |
| Deploy produzione | `npx wrangler pages deploy out --project-name=onde-portal` |
| Verifica produzione | `./scripts/verify-site.sh` |
| Rollback | `./scripts/rollback.sh <snapshot-name>` |
| Lista snapshot | `ls snapshots/` |

---

## URL di Riferimento

| Ambiente | URL |
|----------|-----|
| **LOCALE** | http://localhost:3333 |
| **LAN** | http://192.168.1.243:3333 |
| **TEST** | https://onde.surf |
| **PROD** | https://onde.la |

---

*Ultimo aggiornamento: 2026-01-11*

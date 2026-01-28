# HEARTBEAT.md — Checklist Periodica

## 🔥 TASK NOTTURNO (23:30 PST - ATTIVO!)

### PRIORITÀ ASSOLUTA: Traduzione "Republic of Innovation"
1. **INSTALLARE MODELLO TRADUZIONE** su Radeon (NLLB-200 o simile, NON GPT-2!)
2. **TROVARE ORIGINALE INGLESE** - capitoli 5+ mancanti
3. **TRADURRE** riga per riga, stile perfetto e coerente
4. **CREARE PROCEDURA DEFINITIVA** per traduzioni future

**File traduzione:** `traduzioni/republic-of-innovation-IT.md` (cap 1-4 completati)
**Setup Radeon:** `~/conductor/workspaces/Onde/moscow/tinygrad-fix`

### Modelli da valutare per traduzione EN→IT:
- NLLB-200 (Meta) - 54 lingue, ottimizzato per traduzione
- mBART-50 - multilingue
- Helsinki-NLP/opus-mt-en-it - specifico EN→IT
- Seamless M4T - nuovo Meta model

### ⚠️ REGOLE TRADUZIONE
- Riga per riga, fedele all'originale
- Stile coerente con cap 1-4 già tradotti
- Qualità editoriale (non Google Translate!)
- La procedura deve essere DEFINITIVA e replicabile

## 📋 TASK PENDENTI
- [ ] Leggi TASKS.md per altri task
- [ ] Se Mattia non scrive → lavora autonomamente

## 💰 TRADING WATCHDOG (PRIORITÀ!)
- [ ] **AUTOTRADER DEVE ESSERE SEMPRE ATTIVO!**
- [ ] Check: `ps aux | grep kalshi-autotrader`
- [ ] Se morto → riavvia: `cd ~/Projects/Onde && nohup python3 -u scripts/kalshi-autotrader.py --live > /tmp/kalshi-autotrader.log 2>&1 &`
- [ ] Check ultimo trade in `/tmp/kalshi-autotrader.log`
- [ ] Se ultimo trade > 10 min fa → ALLARME!
- [ ] Portfolio balance e P&L

### Win Rate da migliorare
- Portfolio partito $30, ora ~$24 (-19%)
- Verificare se edge calcolato è corretto
- Forse Kelly troppo aggressivo?

## 🧠 Memoria
- [ ] Aggiorna `memory/YYYY-MM-DD.md` con progressi traduzione

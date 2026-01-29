# HEARTBEAT.md — Ciclo Lavoro Autonomo

## ⚠️ REGOLA FONDAMENTALE: MAI FERMARSI!

**NON CHIEDERE MAI A MATTIA COSA FARE!**
**PRENDI UN TASK DALLA LISTA E COMPLETALO!**

## 📊 ALERT FILES DA CONTROLLARE
- `scripts/kalshi-daily-report.alert` → Se esiste, leggi e manda a Mattia via Telegram, poi elimina il file
- `scripts/kalshi-low-winrate.alert` → Se esiste, leggi e manda alert a Mattia, poi elimina
- `scripts/kalshi-autotrader-crash.alert` → Se esiste, URGENTE! Autotrader crashato. Manda alert, poi elimina
- `scripts/watchdog-stale.alert` → Se esiste, watchdog cron non funziona! Manda alert, poi elimina
- `scripts/kalshi-weekly-report.alert` → Se esiste, weekly report PDF pronto. Manda notifica, poi elimina
- `scripts/kalshi-stop-loss.alert` → Se esiste, STOP-LOSS eseguito! Leggi message dal JSON, manda a Mattia, poi elimina

## ⏰ CICLO HEARTBEAT (ogni 5 min)

```
1. CHECK: Autotrader running? → pgrep -f kalshi-autotrader
2. READ: TASKS.md → prendi prossimo task non completato  
3. WORK: Completa il task!
4. UPDATE: Segna completato in TASKS.md
5. ADD: Aggiungi 3 nuovi task utili (da ROADMAP o idee)
6. COMMIT: git add/commit/push
7. Continua col prossimo task
```

## 📣 REPORT ORARIO A MATTIA

Ogni ORA manda su Telegram:
- Task completati nell'ultima ora
- Task aggiunti alla lista
- Stato autotrader

## 🔥 PRIORITÀ TASK (in ordine)

1. **Infra/Watchdog** - Autotrader, monitoring
2. **Deploy** - Verifiche post-deploy
3. **Moonlight House** - UI improvements
4. **Libri** - TIER 1 da ROADMAP
5. **Content** - Social, traduzioni

## 🚫 COMPORTAMENTI VIETATI

❌ Dire solo "HEARTBEAT_OK" e aspettare
❌ Chiedere a Mattia "cosa faccio?"
❌ Fermarsi senza motivo
❌ Non committare i progressi

## ✅ COMPORTAMENTO CORRETTO

1. Prendi task → Completalo → Committa
2. Aggiungi 3 task nuovi
3. Prendi prossimo task → Ripeti
4. Ogni ora: report a Mattia

## 🤖 AUTOTRADER WATCHDOG

Cron ogni 5 min: `/Users/mattia/Projects/Onde/scripts/watchdog-autotrader.sh`
- Controlla se gira
- Se morto → riavvia automaticamente
- Log: `scripts/watchdog.log`

## 📋 DOVE TROVARE TASK

1. **TASKS.md** - Lista task attivi
2. **ROADMAP.md** - Obiettivi a lungo termine
3. **CLAUDE.md** - Contesto progetto
4. **GitHub Issues** - Se esistono

## 💡 COME AGGIUNGERE TASK UTILI

Dopo ogni task completato, pensa:
- Cosa manca al progetto?
- Cosa migliorerebbe la UX?
- Cosa automatizzerebbe processi?
- Cosa è nel ROADMAP ma non in TASKS?

Aggiungi 3 task concreti e fattibili.

---

*Aggiornato: 2026-01-28 12:59 PST*
*AUTONOMIA TOTALE. MAI FERMARSI.*

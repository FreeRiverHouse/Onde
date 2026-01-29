# HEARTBEAT.md — Ciclo Lavoro Autonomo

## ⚠️ REGOLA FONDAMENTALE: MAI FERMARSI!

**NON CHIEDERE MAI A MATTIA COSA FARE!**
**PRENDI UN TASK DALLA LISTA E COMPLETALO!**

## 📊 ALERT FILES DA CONTROLLARE

### 🚨 ALERT CRITICI → Manda a Mattia su Telegram
- `scripts/kalshi-autotrader-crash.alert` → URGENTE! Autotrader crashato. Manda alert, poi elimina
- `scripts/kalshi-circuit-breaker.alert` → CIRCUIT BREAKER! Trading pausato. Manda alert urgente, poi elimina
- `scripts/kalshi-stop-loss.alert` → STOP-LOSS eseguito! Leggi message, manda a Mattia, poi elimina
- `scripts/kalshi-health.alert` → Autotrader down >30min o win rate <30%! Manda alert, poi elimina
- `scripts/onde-surf-auth-broken.alert` → AUTH BROKEN! Dashboard esposta! Manda alert URGENTE, poi elimina
- `scripts/onde-la-down.alert` → ONDE.LA DOWN! Manda alert URGENTE, poi elimina
- `scripts/ssl-critical.alert` → SSL CRITICO (<7 giorni)! Manda alert URGENTE, poi elimina
- `scripts/watchdog-stale.alert` → Watchdog cron non funziona! Manda alert, poi elimina

### 📈 ALERT OPERATIVI → Manda a Mattia su Telegram
- `scripts/kalshi-daily-report.alert` → Daily report pronto. Manda a Mattia, poi elimina
- `scripts/kalshi-weekly-report.alert` → Weekly report PDF pronto. Manda notifica, poi elimina
- `scripts/kalshi-low-winrate.alert` → Win rate basso. Manda alert, poi elimina
- `scripts/kalshi-streak-record.alert` → Record streak! Celebra/avvisa, poi elimina
- `scripts/kalshi-latency.alert` → Latenza ordini alta (>2s)! Manda alert, poi elimina
- `scripts/kalshi-rate-limit.alert` → API rate limit alto (>80%)! Manda alert, poi elimina
- `scripts/kalshi-api-error.alert` → HIGH API ERROR RATE (>10%)! Manda alert, poi elimina
- `scripts/kalshi-api-error-weekly.alert` → Weekly API error report. Manda report, poi elimina
- `scripts/ohlc-cache-stale.alert` → OHLC cache stale >24h! Manda alert, poi elimina
- `scripts/memory-stale.alert` → Memory files stale >7 giorni! Manda alert, poi elimina
- `scripts/test-failure.alert` → Test suite failed! Manda alert, poi elimina
- `scripts/alerts-upload-stale.alert` → Alerts upload cron stale >2h! Manda alert, poi elimina
- `scripts/ssl-expiring.alert` → SSL in scadenza (<30 giorni)! Manda alert, poi elimina
- `scripts/broken-links.alert` → Link rotti su onde.la! Manda alert, poi elimina

### 🤖 ALERT TECNICI → NON mandare a Mattia! Salva in data/finetuning/
Questi alert sono per l'agente di fine-tuning degli algoritmi, NON per Mattia:
- `scripts/kalshi-momentum-divergence.alert` → Salva in `data/finetuning/momentum-divergence.jsonl`, poi elimina
- `scripts/kalshi-momentum-change.alert` → Salva in `data/finetuning/momentum-change.jsonl`, poi elimina
- `scripts/kalshi-momentum-aligned.alert` → Salva in `data/finetuning/momentum-aligned.jsonl`, poi elimina
- `scripts/kalshi-momentum-reversion.alert` → Salva in `data/finetuning/momentum-reversion.jsonl`, poi elimina
- `scripts/kalshi-regime-change.alert` → Salva in `data/finetuning/regime-change.jsonl`, poi elimina
- `scripts/kalshi-whipsaw.alert` → Salva in `data/finetuning/whipsaw.jsonl`, poi elimina
- `scripts/kalshi-vol-calibration.alert` → Salva in `data/finetuning/vol-calibration.jsonl`, poi elimina
- `scripts/kalshi-vol-recalibration.alert` → Salva in `data/finetuning/vol-recalibration.jsonl`, poi elimina
- `scripts/kalshi-extreme-vol.alert` → Salva in `data/finetuning/extreme-vol.jsonl`, poi elimina
- `scripts/kalshi-price-spread.alert` → Salva in `data/finetuning/price-spread.jsonl`, poi elimina

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

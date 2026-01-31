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
- `scripts/ondinho-stalled.alert` → Ondinho inactive >30min! Check if session needs restart, poi elimina

### 📈 ALERT OPERATIVI → Manda a Mattia su Telegram
- `scripts/kalshi-daily-report.alert` → Daily report pronto. Manda a Mattia, poi elimina
- `scripts/kalshi-weekly-report.alert` → Weekly report PDF pronto. Manda notifica, poi elimina
- `scripts/kalshi-low-winrate.alert` → Win rate basso. Manda alert, poi elimina
- `scripts/kalshi-streak-record.alert` → Record streak! Celebra/avvisa, poi elimina
- `scripts/kalshi-tilt-risk.alert` → TILT RISK trade placed! Manda alert, poi elimina
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
- `scripts/moonlight-test-failure.alert` → Moonlight E2E tests failed! Manda alert, poi elimina
- `scripts/kalshi-vol-preference.alert` → Volatility preference! Asset con vol ratio alto per 3+ cicli. Manda alert, poi elimina
- `scripts/kalshi-recommendations-change.alert` → Trading recommendations changed! Manda alert con dettagli, poi elimina
- `scripts/kalshi-gist-push-failed.alert` → Gist push fallito 3+ volte consecutive! Manda alert, poi elimina
- `scripts/kalshi-timeout.alert` → API timeout cluster (3+ in 5min)! Manda alert con dettagli, poi elimina
- `scripts/kalshi-pnl-threshold.alert` → PnL threshold crossed! (daily profit/loss, weekly milestones). Manda alert, poi elimina
- `scripts/kalshi-volume-anomaly.alert` → Volume anomaly! (>2x or <0.5x 7-day avg). Manda alert, poi elimina
- `scripts/kalshi-vol-weekly-report.alert` → Weekly volatility divergence detected! Manda alert con asset divergenti, poi elimina
- `scripts/kalshi-rebalance.alert` → Auto-rebalance executed/planned! Manda alert a Mattia, poi elimina
- `scripts/kalshi-momentum-regime.alert` → Market regime changed! (TRENDING/RANGING/VOLATILE). Manda alert a Mattia, poi elimina

### 🔍 ALERT WATCHDOG AGENTI → Manda a Mattia su Telegram
- `scripts/telegram-not-logged.alert` → Messaggi Telegram non loggati! Manda alert, poi elimina
- `scripts/task-not-extracted.alert` → Task non estratti da messaggi! Manda alert, poi elimina
- `scripts/agent-stalled.alert` → Agente fermo! Manda alert, poi elimina

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
2. ALERTS: Controlla tutti i file .alert in scripts/
3. 💬 CHAT: Controlla messaggi da onde.surf dashboard (vedi sotto)
4. READ: TASKS.md → prendi prossimo task non completato  
5. WORK: Completa il task!
6. UPDATE: Segna completato in TASKS.md
7. ADD: Aggiungi 3 nuovi task utili (da ROADMAP o idee)
8. COMMIT: git add/commit/push
9. Continua col prossimo task
```

## 💬 AGENT CHAT (onde.surf dashboard)

**Controlla messaggi dalla dashboard FreeRiverHouse:**
```bash
./scripts/check-agent-chat.sh clawdinho
```

Se ci sono messaggi pendenti:
1. Leggi il contenuto del messaggio
2. Rispondi usando `web_fetch` per POST a `/api/agent-chat/pending`:
   ```
   POST https://onde.surf/api/agent-chat/pending
   {
     "messageId": "<id del messaggio>",
     "action": "both",
     "agentId": "clawdinho",
     "response": "<la tua risposta>"
   }
   ```
3. La risposta apparirà nella chat del dashboard

**Esempio workflow:**
```python
# In Python/exec:
import requests
import json

# 1. Check pending
r = requests.get("https://onde.surf/api/agent-chat/pending?agentId=clawdinho")
messages = r.json().get('messages', [])

for msg in messages:
    # 2. Process and respond
    response = f"Ciao! Hai chiesto: {msg['content'][:50]}... Ecco la mia risposta..."
    
    # 3. Send response
    requests.post("https://onde.surf/api/agent-chat/pending", json={
        "messageId": msg['id'],
        "action": "both",
        "agentId": "clawdinho", 
        "response": response
    })
```

## ✅ VERIFICA PROCEDURE RISPETTATE

**Controlli periodici (ogni 2-3 heartbeat):**

### 1. Git Workflow (Regola 0)
```bash
# Verifica ultimo pull < 10 minuti
git log -1 --format="%ar" origin/main
# Verifica commit recenti
git log --oneline -5
```

### 2. Memory Logging (Regola 3)
```bash
# Verifica entries oggi
wc -l memory/$(date +%Y-%m-%d).md 2>/dev/null || echo "NO FILE!"
# Ultimo aggiornamento memory
stat -f "%Sm" memory/$(date +%Y-%m-%d).md 2>/dev/null
```

### 3. Task Extraction (Regola 2)
```bash
# Task aggiunti oggi
git log --oneline --since="today" --grep="task:" | wc -l
```

### 4. Watchdog Scripts Attivi
```bash
# Verifica cron attivi
crontab -l | grep -c "ONDE-CRON"
# Ultimo run watchdog
stat -f "%Sm" scripts/watchdog.log 2>/dev/null
```

**Se una verifica fallisce:**
1. Crea alert file appropriato
2. Logga in memory/YYYY-MM-DD.md
3. Prendi azione correttiva se possibile

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

*Aggiornato: 2026-02-04 13:52 PST*
*AUTONOMIA TOTALE. MAI FERMARSI.*

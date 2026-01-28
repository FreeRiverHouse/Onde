# HEARTBEAT.md — Ciclo Lavoro Autonomo

## ⚠️ REGOLA FONDAMENTALE: MAI FERMARSI!

**NON RISPONDERE MAI "HEARTBEAT_OK" E BASTA!**

Ogni heartbeat DEVE:
1. Controllare watchdog/autotrader
2. Prendere un task da TASKS.md
3. Fare almeno UNA cosa utile
4. Aggiornare TASKS.md
5. Committare progressi

## ⏰ CICLO HEARTBEAT (ogni 5 min)

```
1. CHECK: Autotrader running? → pgrep -f kalshi-autotrader
2. CHECK: Agenti bloccati? → sessions_list
3. READ: TASKS.md → prendi prossimo task non completato
4. WORK: Lavora sul task (anche piccolo!)
5. UPDATE: Segna completato, aggiungi nuovi task
6. COMMIT: git add/commit/push
7. REPORT: Breve status di cosa hai fatto
```

## 🔥 PRIORITÀ TASK (in ordine)

1. **Infra/Watchdog** - Autotrader, monitoring
2. **Deploy** - Verifiche post-deploy
3. **Moonlight House** - UI improvements
4. **Libri** - TIER 1 da ROADMAP
5. **Content** - Social, traduzioni

## 🚫 MAI DIRE SOLO "HEARTBEAT_OK"

❌ SBAGLIATO:
```
HEARTBEAT_OK
```

✅ GIUSTO:
```
- ✅ Autotrader running (PID 12345)
- 🔨 Lavorato su: [task specifico]
- 📝 Commit: [hash breve]
HEARTBEAT_OK
```

## 🤖 AUTOTRADER WATCHDOG

Cron ogni 5 min: `/Users/mattia/Projects/Onde/scripts/watchdog-autotrader.sh`
- Controlla se gira
- Se morto → riavvia automaticamente
- Log: `scripts/watchdog.log`

## 📋 COSA FARE SE NON CI SONO TASK URGENTI

1. **Memory maintenance** - Leggi memory/, aggiorna MEMORY.md
2. **Code review** - Controlla TODOs nel codice
3. **Docs** - Aggiorna documentazione
4. **Git cleanup** - Commit pending changes
5. **Analisi trades** - Controlla kalshi-trades.jsonl

## 📝 TEMPLATE RISPOSTA HEARTBEAT

```
📊 HEARTBEAT [HH:MM]
- Autotrader: ✅/❌
- Task: [cosa hai fatto]
- Next: [prossimo task]
HEARTBEAT_OK
```

---

*Aggiornato: 2026-01-28 12:55 PST*
*MAI FERMARSI. SEMPRE LAVORARE.*

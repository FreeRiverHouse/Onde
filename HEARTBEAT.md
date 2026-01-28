# HEARTBEAT.md — Ciclo Lavoro Autonomo

## ⏰ REGOLE HEARTBEAT (ogni 5 min)

1. **Leggi TASKS.md** — prendi il prossimo task non completato
2. **Lavora sul task** — usa agenti Claude Code se serve
3. **Aggiorna TASKS.md** — segna completato, aggiungi nuovi
4. **Committa progressi** — git add/commit/push
5. **Se tutto fatto** → HEARTBEAT_OK

## 🔍 CHECK RAPIDI (ogni heartbeat)

- [ ] Autotrader running? `pgrep -f kalshi-autotrader`
- [ ] Agenti bloccati? Respawna o fai direttamente
- [ ] Deploy in corso? Verifica status

## 📋 PRIORITÀ TASK

1. **Traduzioni** — Republic of Innovation cap 5-6
2. **Deploy** — Verificare onde.surf
3. **Trading** — Monitorare autotrader
4. **Libri** — TIER 1 da ROADMAP (Frankenstein, Meditations, etc.)

## 🤖 QUANDO USARE AGENTI

- Task lunghi (>5 min) → spawna agente
- Task paralleli → spawna più agenti
- Task semplici → fai direttamente

## 📝 REGOLA #1

**SEMPRE LEGGERE `CLAUDE.md` PRIMA DI PROCEDURE!**

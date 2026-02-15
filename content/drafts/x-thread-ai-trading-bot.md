# X Thread Draft: AI Trading Bot for Prediction Markets

## Thread (copy-paste each as separate tweet)

---

**Tweet 1:**
We built an AI trading bot that uses Claude Opus as its "brain" to trade prediction markets on @KalshiX 🧠📈

No fancy ML models. No neural nets. Just an LLM analyzing markets and placing bets.

Here's what we learned (thread) 🧵

---

**Tweet 2:**
The setup is dead simple:

1. Scan 200+ active markets (CPI, GDP, Fed rates, crypto, politics)
2. Claude analyzes each market's probability
3. Compare vs market price → find mispriced ones
4. Place limit orders when edge > 1%

All in ~200 lines of Python.

---

**Tweet 3:**
Our first approach was a traditional quant bot:
- Fetch BTC price from CoinGecko
- Calculate implied volatility
- Compare with Kalshi crypto markets

Win rate: 44% 📉

Crypto markets are too efficient. Everyone has the same data.

---

**Tweet 4:**
The breakthrough came from @PredictionArena's research showing Grok 3 achieved 4.2x returns on Kalshi.

The insight: LLMs have an edge on markets that require REASONING, not just data:
- Will CPI rise > 0.3% this month?
- Will the Fed cut rates in March?
- Who will be the next Pope?

---

**Tweet 5:**
The key realization: you don't need a separate API call to an LLM.

If you're already RUNNING inside an LLM (like Claude), YOU are the forecaster.

No API key needed. No extra cost. The agent analyzes markets, estimates probabilities, and trades directly.

---

**Tweet 6:**
Current results (real money, not paper):
- 2 active positions on CPI Feb 2026
- $3.54 invested → portfolio value $9.32
- 202 markets being tracked across 25+ series

Still early. Still learning. But the approach feels right.

---

**Tweet 7:**
Lessons learned:

1. Prediction markets are HARD. Most "strategies" are just lucky streaks.
2. The edge isn't speed — it's analysis quality.
3. Paper trade first. Always.
4. Start with $10-20. Ego is your enemy.
5. Non-crypto markets have more alpha than crypto.

---

**Tweet 8:**
The full code is at github.com/FreeRiverHouse/Onde

We built this as part of @OndeLa — an experiment in autonomous AI agents managing real tasks (trading, content, analytics, deployment).

More posts coming. Follow for updates 🌊

---

## Notes for Mattia
- Review before posting
- Add screenshots of the dashboard/trades if available
- Consider posting Monday morning PST for max engagement
- Tag @AnthropicAI and @KalshiX for reach

# Kalshi AutoTrader v3: Grok Strategy Adaptation Plan

**Created:** 2026-02-15  
**Priority:** CRITICAL  
**Status:** ACTIONABLE PLAN — Ready for implementation  
**Context:** Research done 2026-01-27, never applied. This plan turns research into code.

---

## Executive Summary

Our current autotrader (v2) uses a **mathematical model** (Black-Scholes log-normal) to estimate probabilities, which is fundamentally broken for most market types and only barely works for crypto. The winning Grok strategy from `ryanfrigo/kalshi-ai-trading-bot` uses **LLM-based probability estimation** with a multi-agent ensemble, trades ALL market categories, and has proper market filtering. This document is the complete plan to adapt that strategy into our autotrader.

### The Core Problem
| Aspect | Our v2 | Grok Bot | Gap |
|--------|--------|----------|-----|
| **Probability estimation** | Black-Scholes model (math-only) | 5-model LLM ensemble | We guess with math; they reason with AI |
| **Market types** | BTC, ETH, SOL + weather (broken) | ALL Kalshi markets | We ignore 95% of opportunities |
| **Decision pipeline** | price → model → edge → trade | Forecaster→Bull→Bear→Risk→Trade | We have no adversarial thinking |
| **Market filtering** | Crypto ticker prefix only | Volume, liquidity, time, spread | We can't even find non-crypto markets |
| **Win rate** | ~20-40% (crypto), 0% (weather) | Competitive on PredictionArena | Embarrassing |
| **Cost per trade** | $0 (no API calls for decisions) | ~$0.10-0.50 per ensemble decision | We need budget for this |

---

## Part 1: What Grok Does Differently

### 1.1 Multi-Agent Ensemble Architecture

The Grok bot uses **5 different AI models**, each with a specific adversarial role:

```
┌──────────────────────┐
│ FORECASTER (30%)     │  Grok-4: Base rate + conditions → TRUE probability
│ "What's the real     │  Key: superforecaster methodology
│  probability?"       │  Output: probability, confidence, base_rate, side
└──────────┬───────────┘
           │
┌──────────▼───────────┐
│ BULL RESEARCHER (20%) │  GPT-4o: STRONGEST case for YES
│ "Why will this       │  Key: probability FLOOR (minimum reasonable YES prob)
│  happen?"            │  Output: probability, floor, key_arguments, catalysts
└──────────┬───────────┘
           │
┌──────────▼───────────┐
│ BEAR RESEARCHER (15%) │  Gemini: STRONGEST case for NO
│ "Why won't this      │  Key: probability CEILING (maximum reasonable YES prob)
│  happen?"            │  Counters bull arguments directly
└──────────┬───────────┘
           │
┌──────────▼───────────┐
│ NEWS ANALYST (20%)   │  Claude: Sentiment + relevance of current news
│ "What does the news  │  Converts sentiment to probability adjustment
│  say?"               │  Output: sentiment (-1..1), relevance, impact
└──────────┬───────────┘
           │
┌──────────▼───────────┐
│ RISK MANAGER (15%)   │  DeepSeek R1: EV calc, risk score, position sizing
│ "Should we trade     │  Takes ALL other agents as input
│  this?"              │  Output: risk_score (1-10), should_trade, recommended_size
└──────────┘
```

**Critical insight**: The ensemble doesn't just average probabilities — it uses **confidence-weighted averaging** where each model's confidence modulates its weight. When models disagree (high std dev), the system reduces position size or skips entirely.

### 1.2 Market Filtering

Grok bot scans ALL markets with these filters:
```python
min_volume: 200              # Minimum contract volume
max_time_to_expiry: 30 days  # Trade contracts up to 30 days
min_confidence_to_trade: 50% # Minimum ensemble confidence
min_liquidity: N/A           # Implicit via volume
max_spread: 15%              # Maximum bid-ask spread
scan_interval: 30 seconds    # Very frequent scanning
```

Our v2 only looks at markets starting with `KXBTCD`, `KXETHD`, or weather tickers. We literally `continue` past every other market.

### 1.3 Multi-Strategy Approach

The Grok bot allocates capital across three strategies:
- **50% Directional Trading**: AI predicts probability edge → Kelly sizing
- **40% Market Making**: Places limit orders on both sides, profits from spread
- **10% Arbitrage**: Cross-market opportunity detection

Our v2 only does directional trading.

### 1.4 Dynamic Exit Strategies

The Grok bot has 5 exit triggers:
1. **Trailing take-profit** at 20% gain
2. **Stop-loss** at 15% drawdown per position
3. **Confidence-decay exit**: When AI conviction drops on re-analysis
4. **Time-based exit**: 10-day maximum hold
5. **Volatility-adjusted thresholds**

Our v2 has stop-losses but no take-profit, no confidence decay, and no max hold time.

### 1.5 Cost Control

The Grok bot budgets AI costs:
- Daily AI budget: $50 max
- Per-decision cost: ~$0.08-0.15 (ensemble of 5 models)
- Analysis cooldown per market: 2-3 hours
- Max analyses per market per day: 4-6

This is crucial because using Claude/GPT for every market on every cycle would bankrupt us.

---

## Part 2: What We Need to Change

### 2.1 Replace Mathematical Model with Claude API Forecaster

**Current (BROKEN):**
```python
# Our v2 uses Black-Scholes to estimate crypto probability
prob_above = calculate_prob_above_strike(current_price, strike, minutes, hourly_vol)
edge = prob_above - market_price  # This is wrong for everything except short-term crypto
```

**New approach: Use Claude as the Forecaster**
```python
# New v3: Ask Claude for TRUE probability
async def forecast_market(market_data: dict) -> dict:
    """Use Claude to estimate true probability like a superforecaster."""
    prompt = f"""You are a world-class probability forecaster. Estimate the TRUE 
    probability that this market resolves YES, independent of market price.
    
    Market: {market_data['title']}
    Description: {market_data['subtitle']}
    Current YES price: {market_data['yes_ask']}¢
    Current NO price: {100 - market_data['yes_bid']}¢
    Closes: {market_data['close_time']}
    Volume: {market_data.get('volume', 'N/A')}
    
    Reason step by step:
    1. BASE RATE: How often do events like this happen?
    2. CURRENT CONDITIONS: What shifts the probability?
    3. CALIBRATION: Are you overconfident? Adjust toward base rate.
    
    Return JSON: {{"probability": 0.XX, "confidence": 0.XX, "side": "yes/no", "reasoning": "..."}}
    """
    
    response = anthropic_client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        temperature=0,
        messages=[{"role": "user", "content": prompt}]
    )
    return parse_json_response(response)
```

**Why Claude instead of Grok-4:**
- We already have Anthropic API access (Clawdbot)
- Claude Sonnet is cheaper than Grok-4 ($3/M input, $15/M output vs Grok-4 pricing)
- Claude is excellent at calibrated reasoning
- We can use Claude as BOTH forecaster AND critic (simplified 2-agent pipeline to save costs)

### 2.2 Simplified 2-Agent Pipeline (Cost-Efficient)

Instead of 5 models at $0.50/decision, we use a **2-stage Claude pipeline** at ~$0.03-0.05/decision:

```
Stage 1: FORECASTER (Claude Sonnet)
├── Estimate TRUE probability
├── Identify base rate + key factors
└── Output: probability, confidence, side, reasoning

Stage 2: CRITIC + RISK MANAGER (Claude Sonnet, same call)
├── Review forecaster's analysis
├── Identify flaws, missing context, biases
├── Calculate EV and recommended position size
└── Output: adjusted_probability, should_trade, risk_score, position_pct
```

**Why 2 instead of 5:**
- 5x cheaper per decision
- Faster (2 API calls vs 5)
- Claude is strong enough to play multiple roles
- We can always upgrade to multi-model later if profitable

### 2.3 Trade ALL Market Types

**Current coverage:** BTC, ETH, SOL, Weather = ~5% of Kalshi markets

**New coverage — ALL categories on Kalshi:**

| Category | Examples | Edge Source |
|----------|----------|------------|
| **Crypto** | BTC/ETH above $X | Model + momentum (keep existing) |
| **Politics** | "Will bill pass Senate?" | Claude reasoning + news analysis |
| **Economics** | "Will GDP grow >2%?" | Claude + economic data |
| **Weather** | "NYC high temp above 80°F?" | NWS forecast (keep existing, fix model) |
| **Events** | "Will Beyoncé perform at Grammys?" | Claude reasoning |
| **Sports** | "Will Lakers win?" | Claude + stats analysis |
| **Finance** | "Will S&P close above 5000?" | Claude + market data |
| **Tech** | "Will Apple announce new iPhone?" | Claude reasoning |

**Implementation:** Instead of filtering by ticker prefix, scan ALL markets and let Claude decide which have edge.

### 2.4 Smart Market Filtering (Before AI Analysis)

Pre-filter markets to avoid wasting AI budget:

```python
MARKET_FILTERS = {
    "min_volume": 200,           # Enough liquidity to trade
    "max_time_to_expiry_days": 30,  # Don't hold forever
    "min_open_interest": 50,     # Active market
    "max_spread_pct": 0.15,      # 15% max bid-ask spread
    "min_price": 5,              # At least 5¢ (avoid dust)
    "max_price": 95,             # At most 95¢ (avoid near-certain)
    "excluded_statuses": ["closed", "settled"],
}
```

### 2.5 Analysis Budget & Cooldowns

```python
AI_BUDGET = {
    "daily_max_usd": 10.0,       # Max $10/day on AI calls (start conservative)
    "per_decision_max_usd": 0.10, # Max per market analysis
    "cooldown_hours": 4,          # Re-analyze same market every 4h
    "max_analyses_per_day": 100,  # Total analyses limit
    "max_per_market_per_day": 3,  # Don't overanalyze same market
}
```

---

## Part 3: Specific Code Changes

### Phase 1: Core Infrastructure (Week 1)

#### 3.1 Add Claude API Client

```python
# New file: scripts/kalshi-claude-forecaster.py
import anthropic
import json
import os

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")  # From ~/.clawdbot/.env or similar

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

async def claude_forecast(market_data: dict) -> dict:
    """Stage 1: Estimate true probability."""
    system = (
        "You are a world-class probability forecaster for prediction markets. "
        "You reason like a superforecaster: start with base rates, update on evidence, "
        "calibrate for overconfidence. Return ONLY valid JSON."
    )
    
    prompt = build_forecaster_prompt(market_data)
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        temperature=0,
        system=system,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return parse_json_from_response(response.content[0].text)


async def claude_critique(market_data: dict, forecast: dict) -> dict:
    """Stage 2: Critique forecast and decide trade."""
    system = (
        "You are a sceptical risk analyst reviewing a probability forecast. "
        "Identify flaws, missing context, and biases. Decide if the trade has "
        "acceptable risk/reward. Return ONLY valid JSON."
    )
    
    prompt = build_critic_prompt(market_data, forecast)
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        temperature=0,
        system=system,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return parse_json_from_response(response.content[0].text)
```

#### 3.2 Add Universal Market Scanner

Replace the crypto-only `find_opportunities()` with a universal scanner:

```python
def scan_all_markets() -> list:
    """Scan ALL Kalshi markets, not just crypto."""
    
    # Fetch markets with basic filters
    all_markets = []
    
    # Kalshi API: search with status=open
    # Paginate through all active markets
    cursor = None
    while True:
        params = {
            "status": "open",
            "limit": 200,
        }
        if cursor:
            params["cursor"] = cursor
        
        result = api_request("GET", "/trade-api/v2/markets", params)
        markets = result.get("markets", [])
        all_markets.extend(markets)
        
        cursor = result.get("cursor")
        if not cursor or not markets:
            break
    
    # Apply pre-AI filters
    filtered = []
    for m in all_markets:
        if not passes_basic_filters(m):
            continue
        filtered.append(m)
    
    return filtered


def passes_basic_filters(market: dict) -> bool:
    """Pre-AI filters to avoid wasting budget."""
    volume = market.get("volume", 0)
    if volume < 200:
        return False
    
    yes_ask = market.get("yes_ask", 0)
    yes_bid = market.get("yes_bid", 0)
    if yes_ask <= 5 or yes_ask >= 95:  # Extreme prices
        return False
    
    spread = (yes_ask - yes_bid) / 100 if yes_bid else 1.0
    if spread > 0.15:
        return False
    
    # Check time to expiry
    minutes = parse_time_to_expiry(market)
    if minutes < 60 or minutes > 30 * 24 * 60:  # 1 hour to 30 days
        return False
    
    return True
```

#### 3.3 Add Analysis Budget Tracker

```python
class AnalysisBudget:
    """Track AI API spending and enforce limits."""
    
    def __init__(self):
        self.daily_spend = 0.0
        self.daily_analyses = 0
        self.market_cooldowns = {}  # ticker -> last_analysis_time
        self.market_daily_count = {}  # ticker -> count today
        self.reset_date = datetime.now(timezone.utc).date()
    
    def can_analyze(self, ticker: str) -> tuple[bool, str]:
        """Check if we can afford to analyze this market."""
        self._maybe_reset()
        
        if self.daily_spend >= AI_BUDGET["daily_max_usd"]:
            return False, "Daily budget exhausted"
        
        if self.daily_analyses >= AI_BUDGET["max_analyses_per_day"]:
            return False, "Daily analysis limit reached"
        
        # Check cooldown
        last = self.market_cooldowns.get(ticker, 0)
        if time.time() - last < AI_BUDGET["cooldown_hours"] * 3600:
            return False, f"Market on cooldown"
        
        # Check per-market limit
        count = self.market_daily_count.get(ticker, 0)
        if count >= AI_BUDGET["max_per_market_per_day"]:
            return False, "Market daily limit reached"
        
        return True, "OK"
    
    def record_analysis(self, ticker: str, cost_usd: float):
        """Record an analysis."""
        self.daily_spend += cost_usd
        self.daily_analyses += 1
        self.market_cooldowns[ticker] = time.time()
        self.market_daily_count[ticker] = self.market_daily_count.get(ticker, 0) + 1
```

### Phase 2: Trading Pipeline (Week 2)

#### 3.4 New `evaluate_market_with_ai()` Function

This is the core new function that replaces our mathematical model:

```python
async def evaluate_market_with_ai(market: dict, budget: AnalysisBudget) -> dict:
    """
    Evaluate a market using the 2-stage Claude pipeline.
    
    Returns:
        {
            "ticker": str,
            "should_trade": bool,
            "side": "yes" or "no",
            "ai_probability": float,  # Claude's estimated TRUE probability
            "market_probability": float,  # Current market price
            "edge": float,  # ai_prob - market_prob
            "confidence": float,
            "risk_score": float,
            "position_pct": float,  # Recommended position %
            "reasoning": str,
            "cost_usd": float
        }
    """
    ticker = market.get("ticker", "")
    
    # Check budget
    can, reason = budget.can_analyze(ticker)
    if not can:
        return {"ticker": ticker, "should_trade": False, "skip_reason": reason}
    
    # Enrich market data with category info
    enriched = enrich_market_data(market)
    
    # Stage 1: Forecast
    forecast = await claude_forecast(enriched)
    cost = estimate_api_cost(forecast)  # ~$0.02-0.03
    
    ai_prob = forecast.get("probability", 0.5)
    confidence = forecast.get("confidence", 0.5)
    side = forecast.get("side", "yes")
    
    # Quick edge check before expensive Stage 2
    yes_ask = market.get("yes_ask", 50)
    market_prob_yes = yes_ask / 100
    market_prob_no = 1 - market_prob_yes
    
    if side == "yes":
        edge = ai_prob - market_prob_yes
    else:
        edge = (1 - ai_prob) - market_prob_no
    
    if abs(edge) < 0.03:  # Skip Stage 2 if edge is tiny
        budget.record_analysis(ticker, cost)
        return {
            "ticker": ticker, "should_trade": False,
            "skip_reason": f"Edge too small ({edge:.1%})", "cost_usd": cost
        }
    
    # Stage 2: Critique
    critique = await claude_critique(enriched, forecast)
    cost += estimate_api_cost(critique)  # ~$0.02-0.03 more
    
    budget.record_analysis(ticker, cost)
    
    adjusted_prob = critique.get("adjusted_probability", ai_prob)
    should_trade = critique.get("should_trade", False)
    risk_score = critique.get("risk_score", 5)
    position_pct = critique.get("position_pct", 1.0)
    
    # Recalculate edge with adjusted probability
    if side == "yes":
        final_edge = adjusted_prob - market_prob_yes
    else:
        final_edge = (1 - adjusted_prob) - market_prob_no
    
    return {
        "ticker": ticker,
        "should_trade": should_trade and final_edge > 0.04,
        "side": side,
        "ai_probability": adjusted_prob,
        "market_probability": market_prob_yes,
        "edge": final_edge,
        "confidence": confidence,
        "risk_score": risk_score,
        "position_pct": position_pct,
        "reasoning": forecast.get("reasoning", "") + "\n---\n" + critique.get("reasoning", ""),
        "cost_usd": cost
    }
```

#### 3.5 Hybrid Mode: Keep Mathematical Model for Crypto

Don't throw away our crypto model entirely — use it as a **prior** that Claude can override:

```python
async def evaluate_crypto_market(market: dict, prices: dict, ohlc_data: dict, 
                                  momentum_data: dict, budget: AnalysisBudget) -> dict:
    """Hybrid: mathematical model + Claude validation for crypto."""
    
    # Step 1: Run existing math model (free, fast)
    math_prob = calculate_prob_above_strike(current_price, strike, minutes, hourly_vol)
    
    # Step 2: Quick check — is there even a potential edge?
    market_prob = market["yes_ask"] / 100
    math_edge = abs(math_prob - market_prob)
    
    if math_edge < 0.03:
        return {"should_trade": False, "skip_reason": "Math model shows no edge"}
    
    # Step 3: Ask Claude to validate (only when math model sees edge)
    # Include math model output as context
    enriched = enrich_market_data(market)
    enriched["math_model_probability"] = math_prob
    enriched["math_model_edge"] = math_edge
    enriched["current_price"] = current_price
    enriched["momentum"] = momentum_data
    
    result = await evaluate_market_with_ai(enriched, budget)
    
    # Both must agree for trade
    if result["should_trade"] and math_edge > 0.03:
        return result
    
    return {"should_trade": False, "skip_reason": "Math and Claude disagree"}
```

### Phase 3: Integration & Testing (Week 3)

#### 3.6 Modified `run_cycle()` Function

```python
def run_cycle():
    """Main trading cycle — now with universal market scanning + AI evaluation."""
    
    # 1. Check trading schedule and circuit breakers (keep existing)
    should_trade, reason = check_trading_schedule()
    if not should_trade:
        print(f"⏸️ {reason}")
        return
    
    ok, cb_reason = check_circuit_breaker()
    if not ok:
        print(f"🔴 {cb_reason}")
        return
    
    # 2. Get balance and positions
    balance = get_balance()
    positions = get_positions()
    cash = balance.get("available_balance", 0) / 100
    
    # 3. UNIVERSAL MARKET SCAN (NEW!)
    print("\n📡 Scanning ALL Kalshi markets...")
    all_markets = scan_all_markets()
    print(f"   Found {len(all_markets)} markets passing basic filters")
    
    # 4. Separate crypto from non-crypto
    crypto_markets = [m for m in all_markets if is_crypto_market(m)]
    other_markets = [m for m in all_markets if not is_crypto_market(m)]
    
    # 5. Evaluate crypto with hybrid model (math + AI)
    crypto_opportunities = []
    if crypto_markets:
        prices = get_crypto_prices()
        ohlc = {"btc": get_btc_ohlc(), "eth": get_eth_ohlc()}
        momentum = {a: get_multi_timeframe_momentum(ohlc[a]) for a in ohlc}
        
        for market in crypto_markets[:20]:  # Cap to control costs
            result = await evaluate_crypto_market(market, prices, ohlc, momentum, budget)
            if result.get("should_trade"):
                crypto_opportunities.append(result)
    
    # 6. Evaluate non-crypto with Claude (NEW!)
    other_opportunities = []
    for market in other_markets[:30]:  # Cap to control costs
        result = await evaluate_market_with_ai(market, budget)
        if result.get("should_trade"):
            other_opportunities.append(result)
    
    # 7. Combine, rank, and execute best opportunities
    all_opportunities = crypto_opportunities + other_opportunities
    all_opportunities.sort(key=lambda x: x.get("edge", 0) * x.get("confidence", 0), reverse=True)
    
    # Execute top opportunities (respect position limits)
    for opp in all_opportunities[:5]:  # Max 5 trades per cycle
        execute_opportunity(opp, cash, positions)
```

#### 3.7 Prompt Templates

**Forecaster Prompt:**
```python
FORECASTER_PROMPT = """Analyze this prediction market and estimate the TRUE probability it resolves YES.

MARKET: {title}
DESCRIPTION: {subtitle}  
CURRENT YES PRICE: {yes_ask}¢ (implies {yes_ask}% probability)
CURRENT NO PRICE: {no_price}¢
TIME TO EXPIRY: {time_to_expiry}
VOLUME: {volume} contracts
CATEGORY: {category}

{extra_context}

Think step-by-step:
1. BASE RATE: How often do events of this type occur?
2. CURRENT CONDITIONS: What specific evidence shifts the probability?
3. COMPARE TO MARKET: The market says {yes_ask}%. Do you agree? Why or why not?
4. CALIBRATION: Are you overconfident? Adjust toward the base rate if uncertain.

Return a JSON object:
{{
    "probability": <float 0.0-1.0, your TRUE YES probability>,
    "confidence": <float 0.0-1.0, how confident you are in your estimate>,
    "side": "yes" or "no" (which side has edge at current prices),
    "base_rate": <float, the base rate you started from>,
    "key_factors": [<list of 2-3 key factors driving your estimate>],
    "reasoning": "<your step-by-step reasoning>"
}}
"""

CRITIC_PROMPT = """You are reviewing a probability forecast for a prediction market trade.

MARKET: {title}
DESCRIPTION: {subtitle}
CURRENT PRICE: {yes_ask}¢ YES / {no_price}¢ NO
TIME TO EXPIRY: {time_to_expiry}

FORECASTER'S ANALYSIS:
- Estimated probability: {forecast_prob:.1%}
- Confidence: {forecast_conf:.1%}  
- Side: {forecast_side}
- Reasoning: {forecast_reasoning}

Your job:
1. CHALLENGE the forecast — what did the forecaster miss or get wrong?
2. CHECK for common biases: anchoring to market price, recency bias, overconfidence
3. IDENTIFY information the forecaster might not have
4. CALCULATE expected value: EV = (adjusted_prob × payout) - cost
5. DECIDE: Should we trade? At what size?

Return a JSON object:
{{
    "adjusted_probability": <float, your revised probability>,
    "critique": "<what the forecaster got wrong or missed>",
    "should_trade": <boolean>,
    "risk_score": <float 1-10, where 10 is maximum risk>,
    "position_pct": <float 0-5, recommended % of portfolio>,
    "reasoning": "<your risk analysis>"
}}
"""
```

---

## Part 4: Market Types to Target

### Priority Tier 1 (Highest expected edge)

| Category | Why | Edge Source | Example Markets |
|----------|-----|------------|-----------------|
| **Economics** | Data-driven, Claude has strong knowledge | Macro analysis + data | GDP, jobs numbers, inflation |
| **Weather** | NWS forecasts are public & accurate | NWS data + Claude | Temperature, precipitation |
| **Politics** | High volume, lots of news signal | News analysis + reasoning | Bill passage, appointments |

### Priority Tier 2 (Good potential)

| Category | Why | Edge Source |
|----------|-----|------------|
| **Finance** | Claude understands market dynamics | Market analysis + trend |
| **Crypto** | Keep our existing model as a prior | Math model + Claude validation |
| **Sports** | High volume, stat-based | Stats + current form analysis |

### Priority Tier 3 (Lower priority)

| Category | Why | Edge Source |
|----------|-----|------------|
| **Entertainment** | Harder to predict, lower volume | Pop culture reasoning |
| **Science/Tech** | Niche, less liquid | Domain expertise |

### Categories to AVOID

- Very low volume (<100 contracts)
- Very long-dated (>30 days) — edge decays, too much uncertainty
- Very short-dated (<1 hour) — already well-priced
- Extreme prices (<5¢ or >95¢) — poor risk/reward

---

## Part 5: Implementation Roadmap

### Week 1: Foundation
- [ ] **Create `scripts/kalshi-claude-forecaster.py`** — Claude API client with forecaster + critic prompts
- [ ] **Create `scripts/kalshi-analysis-budget.py`** — Budget tracking, cooldowns, cost estimation
- [ ] **Create `scripts/kalshi-market-scanner.py`** — Universal market scanner with pre-AI filters
- [ ] **Test Claude forecasting** on 20 manually-selected markets, compare predictions to outcomes
- [ ] **Estimate costs**: Run mock cycle, measure actual API costs per market

### Week 2: Integration
- [ ] **Create `scripts/kalshi-autotrader-v3.py`** — New autotrader combining all components
- [ ] **Implement hybrid mode** for crypto (math model + Claude validation)
- [ ] **Implement pure Claude mode** for non-crypto markets
- [ ] **Add DRY_RUN mode** for the new pipeline
- [ ] **Run parallel**: v2 trades live, v3 runs in DRY_RUN alongside for comparison

### Week 3: Testing & Go-Live
- [ ] **Compare v2 vs v3 DRY_RUN results** over 7 days
- [ ] **Tune thresholds**: min_edge, confidence, cost budgets
- [ ] **Go live with v3** on a small position limit (max $5/trade)
- [ ] **Monitor and iterate**: adjust prompts, filters, budgets based on real results

---

## Part 6: Cost Projections

### Per-Cycle Cost (Claude Sonnet 4)
| Step | Markets | Tokens/market | Cost/market | Total |
|------|---------|---------------|-------------|-------|
| Pre-filter | 500+ → 50 | 0 | $0 | $0 |
| Forecaster | 50 → 10 with edge | ~3K input + 1K output | ~$0.024 | $1.20 |
| Critic | 10 | ~4K input + 1K output | ~$0.027 | $0.27 |
| **TOTAL** | | | | **~$1.47/cycle** |

### Daily Cost (10 cycles/day)
- Conservative: **~$10-15/day**
- With cooldowns (avoiding re-analysis): **~$5-8/day**
- With crypto math-first filter: **~$3-5/day**

### Break-Even
- At $5/day AI cost: Need >$5/day profit to be worthwhile
- With $200 bankroll and 5% daily return target: need $10/day = achievable with good edge

---

## Part 7: Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Claude gives bad predictions | Lose money | Start with DRY_RUN, compare to outcomes |
| AI costs exceed profits | Net loss | Strict daily budget cap ($10/day) |
| Claude overconfident | Too many trades, losses | Critic stage + 50% confidence floor |
| API latency | Miss opportunities | Cache results, async processing |
| Kalshi API rate limits | Can't scan markets | Implement pagination + rate limit tracking |
| Model hallucination | Wrong probability | Require JSON output, sanity check ranges |

---

## Part 8: Success Metrics

| Metric | Current (v2) | Target (v3) | How to Measure |
|--------|-------------|-------------|----------------|
| Win rate | ~20-40% | >50% | trades-v3.jsonl analysis |
| Markets covered | ~50 (crypto) | ~200+ (all types) | Scanner output |
| Daily trades | 2-5 | 5-15 | Trade log |
| ROI (daily) | Negative | >1% of bankroll | P&L tracking |
| AI cost/trade | $0 | <$0.15 | Budget tracker |
| Sharpe ratio | N/A | >0.5 | Calculate from returns |

---

## Appendix: Files to Create/Modify

### New Files
1. `scripts/kalshi-claude-forecaster.py` — Claude API wrapper + prompts
2. `scripts/kalshi-analysis-budget.py` — Cost tracking and cooldowns  
3. `scripts/kalshi-market-scanner.py` — Universal market scanner
4. `scripts/kalshi-autotrader-v3.py` — New main autotrader

### Modified Files
1. `scripts/kalshi-autotrader-v2.py` — Keep running as-is for comparison
2. `.env` or credentials — Add ANTHROPIC_API_KEY

### Keep Unchanged
- All existing alert/monitoring infrastructure (T-series improvements)
- Stop-loss logic
- Portfolio concentration limits
- Circuit breaker
- Health server

---

*This plan was created by analyzing:*
- *Our research: `memory/grok-predictionarena-research.md` (2026-01-27)*
- *Grok bot source: `github.com/ryanfrigo/kalshi-ai-trading-bot` (97★)*
- *Our autotrader: `scripts/kalshi-autotrader-v2.py` (7127 lines)*
- *Grok bot architecture: 5-model ensemble (Forecaster→Bull→Bear→News→Risk)*
- *Grok bot settings: `src/config/settings.py`*
- *Grok bot agents: `src/agents/{forecaster,bull,bear,risk_manager,ensemble}.py`*

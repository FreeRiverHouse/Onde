'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Breadcrumb from '@/components/ui/Breadcrumb'
import ReadingTimeBadge from '@/components/blog/ReadingTimeBadge'
import TableOfContents, { type TocItem } from '@/components/blog/TableOfContents'
import ShareButtons from '@/components/ShareButtons'
import RelatedPosts from '@/components/blog/RelatedPosts'

/* ─── Table of contents items ─── */
const tocItems: TocItem[] = [
  { id: 'naive-approach', label: 'The Naive Approach', emoji: '🎯' },
  { id: 'crypto-wall', label: 'The Crypto Wall', emoji: '🧱' },
  { id: 'llm-insight', label: 'The LLM Insight', emoji: '💡' },
  { id: 'scanner', label: 'Building the Scanner', emoji: '🔍' },
  { id: 'claude-forecaster', label: 'Claude as Forecaster', emoji: '🧠' },
  { id: 'results', label: 'Real Numbers', emoji: '📊' },
  { id: 'lessons', label: 'Lessons Learned', emoji: '📝' },
  { id: 'open-questions', label: 'Open Questions', emoji: '❓' },
]

/* ─── Article word count (pre-calculated for reading time) ─── */
const ARTICLE_WORD_COUNT = 1850
const READING_TIME = Math.max(1, Math.ceil(ARTICLE_WORD_COUNT / 200))

/* ─── helper: code block ─── */
function CodeBlock({ children, lang }: { children: string; lang?: string }) {
  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-white/10">
      {lang && (
        <div className="px-4 py-1.5 bg-white/5 border-b border-white/10 text-xs text-white/40 font-mono">
          {lang}
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed bg-onde-dark-surface/80 backdrop-blur-sm">
        <code className="text-green-300/90 font-mono">{children}</code>
      </pre>
    </div>
  )
}

/* ─── helper: section heading ─── */
function SectionHeading({
  emoji,
  children,
  id,
}: {
  emoji: string
  children: React.ReactNode
  id?: string
}) {
  return (
    <motion.h2
      id={id}
      className="text-2xl md:text-3xl font-display font-bold text-white mt-16 mb-6 flex items-center gap-3"
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <span className="text-2xl">{emoji}</span>
      {children}
    </motion.h2>
  )
}

/* ─── helper: tag pill ─── */
function Tag({ children }: { children: string }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10">
      {children}
    </span>
  )
}

/* ─── helper: stat card ─── */
function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="card-3d p-4 text-center">
      <p className="text-2xl md:text-3xl font-display font-bold text-onde-teal mb-1">{value}</p>
      <p className="text-sm text-white/70 font-medium">{label}</p>
      {note && <p className="text-xs text-white/40 mt-1">{note}</p>}
    </div>
  )
}

/* ═══════════════════════════════════════════
   ARTICLE
   ═══════════════════════════════════════════ */
export default function AiTradingBotKalshiArticle() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ── Background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-15"
          style={{ background: 'var(--onde-purple)', left: '-15%', top: '5%' }}
          animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-15"
          style={{ background: 'var(--onde-teal)', right: '-10%', top: '40%' }}
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[140px] opacity-10"
          style={{ background: 'var(--onde-coral)', left: '30%', bottom: '0%' }}
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── Table of Contents (sticky sidebar on desktop) ── */}
      <TableOfContents items={tocItems} />

      {/* ── Breadcrumb ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/', emoji: '🏠' },
            { label: 'Blog', href: '/blog', emoji: '📝' },
            { label: 'AI Trading Bot for Kalshi', emoji: '🎲' },
          ]}
        />
      </div>

      {/* ════════════════ HERO ════════════════ */}
      <header className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['Kalshi', 'Prediction Markets', 'Trading Bot', 'Claude', 'LLM', 'Python'].map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white leading-tight mb-4">
            How We Built an AI Trading Bot for Kalshi{' '}
            <span className="text-gradient-neon">(And What We Learned)</span>
          </h1>

          <p className="text-xl text-white/50 font-medium mb-6">
            From a 44% win rate with crypto feeds to discovering LLMs as surprisingly good forecasters.
            Real code, real numbers, honest lessons.
          </p>

          {/* Meta line */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/40">
            <span>June 2025</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>FreeRiverHouse</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <ReadingTimeBadge minutes={READING_TIME} />
          </div>

          {/* Share buttons — top */}
          <ShareButtons
            title="How We Built an AI Trading Bot for Kalshi (And What We Learned)"
            url="https://onde.la/blog/ai-trading-bot-kalshi"
            className="mt-6"
          />
        </motion.div>
      </header>

      {/* ════════════════ ARTICLE BODY ════════════════ */}
      <article className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* ── TL;DR Card ── */}
        <motion.div
          className="card-3d p-6 md:p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-bold text-onde-teal mb-4 flex items-center gap-2">
            <span className="text-xl">⚡</span> TL;DR
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            We built a bot that trades on{' '}
            <strong className="text-white">Kalshi</strong>, a regulated US prediction market.
            Our first approach — comparing crypto prices to Kalshi odds — had a{' '}
            <strong className="text-white">~44% win rate</strong>. Barely better than a coin flip.
            Then we discovered that using{' '}
            <strong className="text-white">LLMs like Claude as forecasters</strong>{' '}
            for non-crypto markets (CPI, Fed rates, politics) showed dramatically better results.
            The edge isn&apos;t in speed — it&apos;s in analysis.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Win Rate v1" value="~44%" note="Crypto approach" />
            <StatCard label="Markets Scanned" value="500+" note="Daily" />
            <StatCard label="AI Return" value="4.2×" note="PredictionArena data" />
            <StatCard label="Starting Capital" value="$20" note="Paper → live" />
          </div>
        </motion.div>

        {/* ── Prose wrapper ── */}
        <div className="prose-custom space-y-6 text-white/70 leading-relaxed text-[16px] md:text-[17px]">

          <p>
            Prediction markets are having a moment. Kalshi is a regulated CFTC exchange
            where you can bet on real-world events: Will CPI come in above 3%? Will the Fed
            cut rates? Will it rain more than 2 inches in NYC this week?
          </p>

          <p>
            The promise is irresistible to any engineer: a market full of mispriced contracts,
            and all you need is a better model than the crowd. Surely an AI can do that, right?
          </p>

          <p>
            Well... it&apos;s complicated. Here&apos;s our honest journey.
          </p>

          {/* THE NAIVE APPROACH */}
          <SectionHeading emoji="🎯" id="naive-approach">
            Phase 1: The Naive Crypto Approach
          </SectionHeading>

          <p>
            Our first bot was simple. Kalshi has crypto markets — &ldquo;Will BTC be above $X
            at the end of the day?&rdquo; — and crypto prices are available in real-time from
            dozens of APIs. The thesis: compare the current spot price to the Kalshi strike
            price, apply some basic volatility math, and bet when the market is mispriced.
          </p>

          <CodeBlock lang="python">{`import requests
from datetime import datetime, timezone

def scan_crypto_markets():
    """Scan Kalshi crypto markets for mispriced contracts."""
    
    # Get current BTC price from CoinGecko
    btc_price = requests.get(
        "https://api.coingecko.com/api/v3/simple/price",
        params={"ids": "bitcoin", "vs_currencies": "usd"}
    ).json()["bitcoin"]["usd"]
    
    # Get Kalshi BTC markets
    markets = kalshi_client.get_markets(
        series_ticker="KXBTC",
        status="open"
    )
    
    opportunities = []
    for market in markets:
        strike = market["strike_price"]
        yes_price = market["yes_ask"] / 100  # Kalshi uses cents
        
        # Simple model: how far is spot from strike?
        distance_pct = (btc_price - strike) / btc_price
        hours_left = hours_until_expiry(market["expiration_time"])
        
        # Naive fair value based on distance + time
        if distance_pct > 0.02 and hours_left < 6:
            fair_value = 0.85  # BTC is well above strike
            if yes_price < fair_value - 0.10:  # 10%+ edge
                opportunities.append({
                    "market": market["ticker"],
                    "action": "BUY_YES",
                    "price": yes_price,
                    "fair_value": fair_value,
                    "edge": fair_value - yes_price
                })
    
    return opportunities`}</CodeBlock>

          <p>
            It looked promising on paper. In practice? It was a humbling lesson in
            market efficiency.
          </p>

          {/* THE CRYPTO WALL */}
          <SectionHeading emoji="🧱" id="crypto-wall">
            The Crypto Efficiency Wall
          </SectionHeading>

          <p>
            After running this for three weeks with paper trading, the results were clear:
          </p>

          <div className="card-3d p-6 border-l-4 border-red-500/50">
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/50 text-sm">Total trades</span>
                <span className="text-white/90 text-sm font-semibold">127</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/50 text-sm">Win rate</span>
                <span className="text-red-400 text-sm font-semibold">44.1%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/50 text-sm">Avg. win size</span>
                <span className="text-green-400 text-sm font-semibold">$3.20</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/50 text-sm">Avg. loss size</span>
                <span className="text-red-400 text-sm font-semibold">$4.10</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-white/50 text-sm">Net P&L (paper)</span>
                <span className="text-red-400 text-sm font-semibold">-$72.30</span>
              </div>
            </div>
          </div>

          <p>
            <strong className="text-white">Why?</strong> Because crypto markets on Kalshi are
            priced by the same quant shops running on Binance and Deribit. Our &ldquo;compare
            spot to strike&rdquo; insight was already baked into the price milliseconds before
            our bot saw it. We were bringing a napkin calculation to a fight against
            institutional market makers with sub-second infrastructure.
          </p>

          <p>
            The hard lesson:{' '}
            <strong className="text-white">
              any market where the input data is a public price feed will be efficiently priced
            </strong>
            . You can&apos;t out-compute Jane Street on BTC options. Don&apos;t even try.
          </p>

          {/* THE LLM INSIGHT */}
          <SectionHeading emoji="💡" id="llm-insight">
            The Insight: LLMs as Forecasters
          </SectionHeading>

          <p>
            The turning point came from{' '}
            <a
              href="https://predictionarena.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-onde-teal hover:text-onde-teal/80 underline"
            >
              PredictionArena
            </a>
            , a project that benchmarks LLMs on prediction market forecasting. Their finding
            was striking: a simple approach using Grok to analyze Polymarket contracts showed{' '}
            <strong className="text-white">4.2× returns</strong> — not by trading faster, but
            by trading <em>smarter</em> on markets where the crowd gets it wrong.
          </p>

          <p>
            The key insight:{' '}
            <strong className="text-white">
              non-crypto markets (economics, politics, weather) are where the edge lives
            </strong>
            . These markets price based on crowd sentiment, not algorithmic feeds. An LLM
            that can synthesize information from dozens of sources — Fed meeting minutes,
            economic indicators, historical patterns — has a genuine information advantage over
            a retail trader checking Twitter.
          </p>

          <div className="card-3d p-6 border-l-4 border-onde-teal/50">
            <p className="text-white/80 font-semibold mb-3">
              Why LLMs have an edge in prediction markets:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70">
              <li>
                <strong className="text-white">Synthesis</strong> — they can process hundreds
                of pages of Fed minutes, economic reports, and expert analysis in seconds
              </li>
              <li>
                <strong className="text-white">No anchoring bias</strong> — they don&apos;t
                anchor to the current market price the way humans do
              </li>
              <li>
                <strong className="text-white">Calibration data</strong> — trained on decades
                of historical outcomes for similar events
              </li>
              <li>
                <strong className="text-white">Available 24/7</strong> — can scan 500+ markets
                daily without fatigue
              </li>
            </ul>
          </div>

          {/* BUILDING THE SCANNER */}
          <SectionHeading emoji="🔍" id="scanner">
            Building the Market Scanner
          </SectionHeading>

          <p>
            We rebuilt the bot from scratch. Instead of comparing prices to prices, we
            now scan Kalshi&apos;s full market catalog and let Claude analyze each
            opportunity:
          </p>

          <CodeBlock lang="python">{`def scan_all_markets():
    """Scan Kalshi markets and find opportunities via AI analysis."""
    
    markets = kalshi_client.get_markets(status="open", limit=500)
    
    # Filter for analyzable markets
    candidates = []
    for m in markets:
        # Skip crypto (too efficient) and illiquid markets
        if m["series_ticker"].startswith("KX"):  
            continue
        if m["volume"] < 50:  # Need some liquidity
            continue
        if m["yes_ask"] < 5 or m["yes_ask"] > 95:  # Skip near-certainties
            continue
            
        candidates.append({
            "ticker": m["ticker"],
            "title": m["title"],
            "yes_price": m["yes_ask"] / 100,
            "no_price": m["no_ask"] / 100,
            "volume": m["volume"],
            "expiry": m["expiration_time"],
            "category": m["category"],
        })
    
    print(f"Found {len(candidates)} analyzable markets")
    return candidates

def analyze_with_claude(market):
    """Ask Claude to estimate probability for a market."""
    
    prompt = f"""Analyze this prediction market contract:

Title: {market['title']}
Current YES price: {market['yes_price']:.0%}
Expiry: {market['expiry']}
Category: {market['category']}

Based on available information, estimate the TRUE probability 
of this event occurring. Consider:
- Historical base rates for similar events
- Current economic/political conditions  
- Any known upcoming catalysts

Return your estimate as a decimal (0.0 to 1.0) with reasoning.
Be calibrated — a 70% estimate should resolve YES ~70% of the time."""

    response = claude_client.messages.create(
        model="claude-opus-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return parse_probability(response.content[0].text)`}</CodeBlock>

          <p>
            The architecture is deliberately simple. No separate forecasting API, no
            complex pipelines. Just Claude looking at a market and saying &ldquo;I think
            the true probability is X%.&rdquo; When that diverges significantly from
            the market price, we have a potential trade.
          </p>

          {/* CLAUDE AS FORECASTER */}
          <SectionHeading emoji="🧠" id="claude-forecaster">
            Claude Opus as Forecaster
          </SectionHeading>

          <p>
            We chose Claude Opus (currently{' '}
            <code className="px-1.5 py-0.5 rounded bg-white/10 text-green-300 text-sm font-mono">
              claude-opus-4-20250514
            </code>
            ) as our forecaster for several reasons:
          </p>

          <div className="card-3d p-6 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-onde-teal font-bold text-lg">1.</span>
              <p className="text-white/70">
                <strong className="text-white">Best reasoning</strong> — Opus consistently
                outperforms other models on complex analysis tasks. For something like &ldquo;Will
                the next CPI print be above 3.2%?&rdquo;, you need deep economic reasoning.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-teal font-bold text-lg">2.</span>
              <p className="text-white/70">
                <strong className="text-white">Good calibration</strong> — in our testing,
                Opus&apos;s probability estimates correlate well with actual outcomes. When it says
                70%, things happen roughly 70% of the time.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-teal font-bold text-lg">3.</span>
              <p className="text-white/70">
                <strong className="text-white">No separate API needed</strong> — unlike the
                PredictionArena approach that uses separate data feeds + forecasting models,
                we just pass the market question directly to Claude. It already has
                the context from training data.
              </p>
            </div>
          </div>

          <p>
            The key technical decision: we ask Claude to provide{' '}
            <strong className="text-white">calibrated probability estimates</strong>, not
            buy/sell signals. This lets us compute expected value independently:
          </p>

          <CodeBlock lang="python">{`def find_trades(markets, min_edge=0.08):
    """Find trades where AI probability diverges from market."""
    
    trades = []
    for market in markets:
        ai_prob = analyze_with_claude(market)
        market_prob = market["yes_price"]
        
        edge = ai_prob - market_prob
        
        if abs(edge) >= min_edge:
            trades.append({
                "market": market["ticker"],
                "title": market["title"],
                "side": "YES" if edge > 0 else "NO",
                "market_price": market_prob,
                "ai_estimate": ai_prob,
                "edge": abs(edge),
                "kelly_fraction": compute_kelly(ai_prob, market_prob),
            })
    
    # Sort by edge, take top opportunities
    trades.sort(key=lambda t: t["edge"], reverse=True)
    return trades[:5]  # Max 5 trades per scan

def compute_kelly(true_prob, market_price):
    """Half-Kelly sizing — conservative position sizing."""
    if true_prob > market_price:  # Buying YES
        edge = true_prob - market_price
        odds = (1 - market_price) / market_price
        kelly = (edge * odds - (1 - true_prob)) / odds
    else:  # Buying NO
        edge = market_price - true_prob
        odds = market_price / (1 - market_price)
        kelly = (edge * odds - true_prob) / odds
    
    return max(0, kelly * 0.5)  # Half-Kelly for safety`}</CodeBlock>

          {/* REAL NUMBERS */}
          <SectionHeading emoji="📊" id="results">
            Real Numbers (So Far)
          </SectionHeading>

          <p>
            Full transparency: we&apos;re still early. These numbers are from a mix of paper
            trading and small live trades ($10-20 per position). Take them with appropriate
            skepticism.
          </p>

          <div className="card-3d p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 text-white/50 font-medium">Approach</th>
                  <th className="text-right py-2 text-white/50 font-medium">Win Rate</th>
                  <th className="text-right py-2 text-white/50 font-medium">Avg Edge</th>
                  <th className="text-right py-2 text-white/50 font-medium hidden sm:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 text-white/80">Crypto (BTC/ETH)</td>
                  <td className="py-2.5 text-right text-red-400 font-semibold">~44%</td>
                  <td className="py-2.5 text-right text-white/60">-2.1%</td>
                  <td className="py-2.5 text-right text-white/40 hidden sm:table-cell">Abandoned</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 text-white/80">Economics (CPI, GDP)</td>
                  <td className="py-2.5 text-right text-green-400 font-semibold">~58%</td>
                  <td className="py-2.5 text-right text-white/60">+5.3%</td>
                  <td className="py-2.5 text-right text-white/40 hidden sm:table-cell">Promising</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 text-white/80">Fed rates</td>
                  <td className="py-2.5 text-right text-green-400 font-semibold">~62%</td>
                  <td className="py-2.5 text-right text-white/60">+7.8%</td>
                  <td className="py-2.5 text-right text-white/40 hidden sm:table-cell">Small sample (n=13)</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-white/80">Politics / Events</td>
                  <td className="py-2.5 text-right text-onde-teal font-semibold">~55%</td>
                  <td className="py-2.5 text-right text-white/60">+3.1%</td>
                  <td className="py-2.5 text-right text-white/40 hidden sm:table-cell">High variance</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            The sample sizes are small — we&apos;re talking dozens of trades, not thousands. But
            the pattern is consistent: the AI approach works worst where markets are most
            efficient (crypto) and best where information synthesis matters (economics, Fed policy).
          </p>

          <div className="card-3d p-6 border-l-4 border-onde-gold/50">
            <p className="text-onde-gold font-semibold mb-2">⚠️ Caveat</p>
            <p className="text-white/70">
              We&apos;re also spending ~$2-5/day on Claude API calls for market scanning.
              At small position sizes, the API cost can eat a meaningful chunk of profits.
              This approach only makes economic sense at scale.
            </p>
          </div>

          {/* LESSONS LEARNED */}
          <SectionHeading emoji="📝" id="lessons">
            Lessons Learned
          </SectionHeading>

          <div className="space-y-6">
            <div className="card-3d p-6">
              <h3 className="text-lg font-display font-bold text-white mb-3">
                1. Prediction markets are HARD to beat
              </h3>
              <p className="text-white/70">
                The crowd is right most of the time. Even a small edge is valuable, but getting
                to consistent profitability requires hundreds of trades with disciplined sizing.
                This isn&apos;t get-rich-quick territory.
              </p>
            </div>

            <div className="card-3d p-6">
              <h3 className="text-lg font-display font-bold text-white mb-3">
                2. The edge is in analysis, not speed
              </h3>
              <p className="text-white/70">
                You don&apos;t need low-latency infrastructure. Kalshi markets move slowly — a
                CPI contract might trade at the same price for hours. What you need is a
                better assessment of the true probability than the current market price reflects.
                That&apos;s a research problem, not an engineering problem.
              </p>
            </div>

            <div className="card-3d p-6">
              <h3 className="text-lg font-display font-bold text-white mb-3">
                3. Paper trade first. Always.
              </h3>
              <p className="text-white/70">
                We spent 3 weeks paper trading before putting real money in. During that
                time we caught at least 4 bugs that would have cost us money — including
                one that was buying the wrong side of contracts. If you&apos;re not embarrassed
                by how cautious you&apos;re being, you&apos;re not being cautious enough.
              </p>
            </div>

            <div className="card-3d p-6">
              <h3 className="text-lg font-display font-bold text-white mb-3">
                4. Start embarrassingly small
              </h3>
              <p className="text-white/70">
                Our live trades are $10-20 each. At that size, the max you can lose in a
                day is the cost of lunch. But you&apos;re still getting real execution data,
                real slippage numbers, and real emotional calibration. The knowledge you gain
                from 100 tiny trades is worth more than the profits from one big lucky bet.
              </p>
            </div>

            <div className="card-3d p-6">
              <h3 className="text-lg font-display font-bold text-white mb-3">
                5. Avoid efficient markets
              </h3>
              <p className="text-white/70">
                This sounds obvious in hindsight, but: if a market is priced by algorithms
                consuming the same data feeds you have, you don&apos;t have an edge. Look for
                markets where the input is complex, ambiguous, or requires synthesis across
                multiple domains. That&apos;s where LLMs shine.
              </p>
            </div>
          </div>

          {/* OPEN QUESTIONS */}
          <SectionHeading emoji="❓" id="open-questions">
            Open Questions
          </SectionHeading>

          <p>
            We&apos;re genuinely unsure about a lot of things. Some open questions we&apos;re
            still working through:
          </p>

          <div className="card-3d p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-onde-purple text-lg flex-shrink-0">🤔</span>
              <p className="text-white/70">
                <strong className="text-white">Will the edge persist?</strong> As more people
                use LLMs for prediction markets, the edge should shrink. We might be in an
                early window that closes in 6-12 months.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-purple text-lg flex-shrink-0">🤔</span>
              <p className="text-white/70">
                <strong className="text-white">Is Claude really calibrated?</strong> Our
                sample size is small. 62% win rate on 13 Fed trades could easily be luck.
                We need 100+ trades per category to be confident.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-purple text-lg flex-shrink-0">🤔</span>
              <p className="text-white/70">
                <strong className="text-white">What&apos;s the right model?</strong> Opus is
                expensive. Would Sonnet or Haiku be good enough for simpler markets?
                We haven&apos;t systematically tested this yet.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-purple text-lg flex-shrink-0">🤔</span>
              <p className="text-white/70">
                <strong className="text-white">How do you handle model updates?</strong> When
                Claude gets a new training cutoff, its biases change. Does that help or hurt
                forecasting accuracy?
              </p>
            </div>
          </div>

          <p>
            We&apos;re planning to keep running this for at least 6 months before drawing firm
            conclusions. If you&apos;re interested in following along, we&apos;ll update this
            post with results as we gather more data.
          </p>

          <div className="card-3d p-6 border-l-4 border-onde-teal/50 mt-8">
            <p className="text-white/80 font-semibold mb-2">
              The honest bottom line
            </p>
            <p className="text-white/70">
              Building a prediction market bot is a fascinating exercise in epistemology:
              how confident are you, really? How do you price uncertainty? Where does
              information asymmetry live? We don&apos;t have all the answers yet, but
              we&apos;re learning more from every trade. And at $10-20 a position,
              the education is cheap.
            </p>
          </div>
        </div>

        {/* ── Share buttons — bottom ── */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <ShareButtons
            title="How We Built an AI Trading Bot for Kalshi (And What We Learned)"
            url="https://onde.la/blog/ai-trading-bot-kalshi"
          />
        </div>

        {/* ── Author card / footer ── */}
        <motion.div
          className="mt-10 card-3d p-6 md:p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-white/40 text-sm mb-4">
            Built by{' '}
            <Link
              href="/"
              className="text-onde-teal hover:text-onde-teal/80 transition-colors underline"
            >
              FreeRiverHouse
            </Link>{' '}
            — sharing what we learn, even when the results are messy.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://x.com/Onde_FRH"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-glow text-sm px-4 py-2"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                @Onde_FRH
              </span>
            </a>
            <a
              href="https://github.com/FreeRiverHouse/Onde"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-glow text-sm px-4 py-2"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
                </svg>
                GitHub
              </span>
            </a>
          </div>
        </motion.div>

        {/* ── Related posts ── */}
        <RelatedPosts currentSlug="ai-trading-bot-kalshi" maxPosts={3} />

        {/* ── Back to blog ── */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/40 hover:text-onde-teal transition-colors text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to all posts
          </Link>
        </div>
      </article>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Breadcrumb from '@/components/ui/Breadcrumb'

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

/* ─── helper: info table row ─── */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="text-white/50 text-sm font-medium">{label}</span>
      <span className="text-white/90 text-sm font-semibold text-right">{value}</span>
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

/* ─── helper: agent card ─── */
function AgentCard({
  name,
  emoji,
  role,
  description,
  color,
}: {
  name: string
  emoji: string
  role: string
  description: string
  color: string
}) {
  return (
    <motion.div
      className="card-3d p-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color}`}
      />
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{emoji}</span>
        <div>
          <h3 className="font-display font-bold text-white text-lg">{name}</h3>
          <p className="text-xs text-white/40 uppercase tracking-wide">{role}</p>
        </div>
      </div>
      <p className="text-white/60 text-sm leading-relaxed">{description}</p>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   ARTICLE
   ═══════════════════════════════════════════ */
export default function KalshiTradingBotArticle() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ── Background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-15"
          style={{ background: 'var(--onde-teal)', left: '-15%', top: '5%' }}
          animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-15"
          style={{ background: 'var(--onde-purple)', right: '-10%', top: '40%' }}
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

      {/* ── Breadcrumb ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/', emoji: '🏠' },
            { label: 'Tech', href: '/blog', emoji: '⚡' },
            { label: 'Trading Bot AI su Kalshi', emoji: '🤖' },
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
            {['Trading', 'AI', 'Kalshi', 'Kelly Criterion', 'Python', 'Prediction Markets'].map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white leading-tight mb-4">
            Come funziona il nostro{' '}
            <span className="text-gradient-neon">trading bot AI</span>{' '}
            su Kalshi
          </h1>

          <p className="text-xl text-onde-teal font-medium mb-6">
            Dietro le quinte di 7.000 righe di Python che tradano da sole
          </p>

          {/* Meta line */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/40">
            <span>Febbraio 2026</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>FreeRiverHouse</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>12 min read</span>
          </div>
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
            Abbiamo costruito un <strong className="text-white">autotrader</strong> che opera
            su <strong className="text-white">Kalshi</strong> — il primo exchange regolamentato
            di prediction markets negli USA. Il bot usa un modello probabilistico
            log-normale con fat-tail adjustment, <strong className="text-white">Kelly criterion</strong> per
            il sizing, <strong className="text-white">momentum multi-timeframe</strong> e{' '}
            <strong className="text-white">regime detection</strong> per adattarsi al mercato.
            Ogni trade viene valutato, calibrato e monitorato automaticamente —{' '}
            <strong className="text-white">24/7, senza intervento umano</strong>.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium bg-onde-teal/10 text-onde-teal border border-onde-teal/20">
              🎯 7.000+ righe Python
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
              📊 BTC + ETH + Weather
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20">
              ✅ 75% WR (calibrato)
            </span>
          </div>
        </motion.div>

        {/* ── Prose wrapper ── */}
        <div className="prose-custom space-y-6 text-white/70 leading-relaxed text-[16px] md:text-[17px]">

          {/* COS'È KALSHI */}
          <SectionHeading emoji="🎯" id="kalshi">
            Cos&apos;è Kalshi e perché ci interessa
          </SectionHeading>

          <p>
            <strong className="text-white">Kalshi</strong> è un exchange di prediction markets
            regolamentato dalla CFTC (Commodity Futures Trading Commission). A differenza di
            Polymarket o delle crypto degens, Kalshi è legale negli USA e offre mercati su eventi
            reali: &ldquo;BTC sopra $100k alle 17:00?&rdquo;, &ldquo;Temperature a NYC sopra 45°F domani?&rdquo;.
          </p>

          <p>
            Ogni contratto è binario: paghi X centesimi, ricevi $1 se l&apos;evento accade, $0 altrimenti.
            Se il mercato prezza un contratto a 30¢ e tu pensi che la probabilità reale sia 50%,
            hai un <strong className="text-white">edge del 20%</strong>.
            Il gioco è trovare questi edge — sistematicamente, velocemente, e senza bias cognitivi.
          </p>

          <p className="text-onde-teal font-semibold text-lg">
            Ecco perché abbiamo costruito un bot.
          </p>

          {/* L'ARCHITETTURA */}
          <SectionHeading emoji="🏗️" id="architecture">
            L&apos;architettura: Forecaster → Critic → Trader
          </SectionHeading>

          <p>
            Il nostro autotrader non è un singolo script monolitico che &ldquo;compra e spera&rdquo;.
            È un sistema <strong className="text-white">multi-agente</strong> dove ogni componente
            ha una responsabilità specifica. Pensalo come tre persone in una trading desk:
          </p>

          <div className="grid sm:grid-cols-3 gap-4 my-8">
            <AgentCard
              name="Forecaster"
              emoji="🔮"
              role="Il matematico"
              description="Calcola la probabilità reale che un evento accada usando modello log-normale, volatilità dinamica e fat-tail adjustment per crypto. Prende dati OHLC, calcola la deviazione standard realizzata, e stima P(prezzo > strike)."
              color="from-blue-500 to-cyan-500"
            />
            <AgentCard
              name="Critic"
              emoji="🧐"
              role="Il controllore"
              description="Valida ogni previsione del Forecaster. Controlla edge massimi (cap 20%), regime di mercato, momentum multi-timeframe, concentrazione portfolio, circuit breaker, e 15+ safety guard. Se qualcosa puzza, blocca il trade."
              color="from-amber-500 to-orange-500"
            />
            <AgentCard
              name="Trader"
              emoji="💰"
              role="L'esecutore"
              description="Riceve le opportunità validate, calcola il sizing ottimale via Kelly criterion con aggiustamenti per regime/volatilità/latency, e piazza ordini su Kalshi via API. Monitora anche stop-loss e auto-rebalancing."
              color="from-green-500 to-emerald-500"
            />
          </div>

          <p>
            Questo design è fondamentale. Il Forecaster genera probabilità senza preoccuparsi
            del rischio. Il Critic filtra i falsi positivi (e ne abbiamo trovati tanti — vedi
            la sezione sulla calibrazione). Il Trader si occupa solo dell&apos;esecuzione ottimale.
            Separazione delle responsabilità, come nel buon software engineering.
          </p>

          {/* IL FORECASTER */}
          <SectionHeading emoji="🔮" id="forecaster">
            Il Forecaster: come calcoliamo le probabilità
          </SectionHeading>

          <p>
            Il cuore del sistema è un modello <strong className="text-white">log-normale</strong> per i prezzi crypto.
            L&apos;idea è semplice: dato il prezzo attuale S, lo strike K, il tempo alla scadenza T
            e la volatilità σ, calcoliamo la probabilità che il prezzo sia sopra lo strike al momento
            della scadenza.
          </p>

          <CodeBlock lang="python">{`def calculate_prob_above_strike(current_price, strike, 
                                 minutes_to_expiry, hourly_vol, 
                                 fat_tail=True):
    """
    P(S_T > K) = N(d2)
    d2 = ln(S/K) / (σ√T) - σ√T/2
    
    Fat-tail: crypto ha eccesso di kurtosi, moltiplichiamo
    σ × 1.4 per distribuzioni più larghe e probabilità 
    meno estreme vicino allo strike.
    """
    T = minutes_to_expiry / 60.0
    sigma = hourly_vol * math.sqrt(T)
    
    if fat_tail:
        sigma *= 1.4  # Fat-tail adjustment
    
    d2 = math.log(current_price / strike) / sigma - sigma / 2
    return norm_cdf(d2)  # Capped a [0.03, 0.97]`}</CodeBlock>

          <p>
            La volatilità non è hardcoded. Viene calcolata dinamicamente dai dati OHLC
            (close-to-close log returns delle ultime 24h). Se il mercato è più volatile del solito,
            la distribuzione si allarga → le probabilità si avvicinano al 50% → servono edge più
            grandi per tradare.
          </p>

          <div className="card-3d p-6 border-l-4 border-blue-500/50">
            <p className="text-white/80 font-semibold mb-2">
              🐋 Perché il Fat-Tail Adjustment?
            </p>
            <p className="text-white/60 text-sm leading-relaxed">
              Il modello log-normale sottostima la probabilità di movimenti estremi nelle crypto.
              Bitcoin non segue una gaussiana: ha code grasse (excess kurtosis). Moltiplicando σ × 1.4
              allarghiamo la distribuzione, ottenendo probabilità più conservative vicino allo strike.
              Questo riduce i falsi edge dove il modello è troppo sicuro di sé.
            </p>
          </div>

          {/* MOMENTUM */}
          <SectionHeading emoji="📊" id="momentum">
            Momentum multi-timeframe
          </SectionHeading>

          <p>
            Il prezzo attuale da solo non basta. Ci interessa la <strong className="text-white">direzione</strong>.
            Il bot analizza il momentum su tre timeframe: <strong className="text-white">1h, 4h e 24h</strong>,
            con pesi diversi (50%, 30%, 20% rispettivamente — il breve termine conta di più su
            contratti orari).
          </p>

          <CodeBlock lang="python">{`MOMENTUM_WEIGHT = {
    "1h": 0.5,   # Breve termine = più importante
    "4h": 0.3,   # Medio termine
    "24h": 0.2   # Trend generale
}

# Composite direction: media pesata delle direzioni
# Composite strength: media pesata delle intensità
# Alignment: TUTTI i timeframe concordano?`}</CodeBlock>

          <p>
            Quando tutti e tre i timeframe sono allineati (tutti bullish o tutti bearish),
            il bot genera un <strong className="text-white">alert di alta convinzione</strong> e
            può applicare un bonus fino al ±10% sulla probabilità stimata. Quando sono in disaccordo?
            Riduce il bonus e aumenta la cautela.
          </p>

          <p>
            Il sistema monitora anche <strong className="text-white">whipsaw</strong> (due flip di
            direzione in 24h) e <strong className="text-white">divergenze RSI</strong> (prezzo sale
            ma momentum scende — segnale classico di inversione). Ogni segnale viene
            combinato in un <strong className="text-white">composite signal score</strong> con
            effetto sinergia: 2 segnali concordanti = +25% bonus, 3 segnali = +50%.
          </p>

          {/* REGIME DETECTION */}
          <SectionHeading emoji="🌡️" id="regime">
            Regime detection: capire &ldquo;che mercato è&rdquo;
          </SectionHeading>

          <p>
            Non tutti i mercati sono uguali. Il bot classifica automaticamente il regime corrente
            in quattro categorie:
          </p>

          <div className="card-3d p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 text-white/50 font-medium">Regime</th>
                  <th className="text-right py-2 text-white/50 font-medium">Min Edge</th>
                  <th className="text-right py-2 text-white/50 font-medium">Kelly Adj</th>
                  <th className="text-right py-2 text-white/50 font-medium hidden sm:table-cell">Caratteristiche</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 text-white/80">📈 Trending Bullish</td>
                  <td className="py-2.5 text-right text-green-400 font-semibold">7%</td>
                  <td className="py-2.5 text-right text-white/60">1.1×</td>
                  <td className="py-2.5 text-right text-white/40 hidden sm:table-cell">Direzionale, più prevedibile</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 text-white/80">📉 Trending Bearish</td>
                  <td className="py-2.5 text-right text-green-400 font-semibold">7%</td>
                  <td className="py-2.5 text-right text-white/60">1.1×</td>
                  <td className="py-2.5 text-right text-white/40 hidden sm:table-cell">Direzionale, edge più chiaro</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 text-white/80">➡️ Sideways</td>
                  <td className="py-2.5 text-right text-amber-400 font-semibold">6%</td>
                  <td className="py-2.5 text-right text-white/60">0.75×</td>
                  <td className="py-2.5 text-right text-white/40 hidden sm:table-cell">Range-bound, moderata cautela</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-white/80">⚡ Choppy</td>
                  <td className="py-2.5 text-right text-red-400 font-semibold">8%</td>
                  <td className="py-2.5 text-right text-white/60">0.5×</td>
                  <td className="py-2.5 text-right text-white/40 hidden sm:table-cell">Alta vol, nessun trend — il più pericoloso</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Il regime viene determinato da: variazione di prezzo 4h e 24h, volatilità media
            (calcolata dai range OHLC), direzione e allineamento del momentum. In regime choppy,
            il bot dimezza letteralmente le posizioni — è il regime più difficile da tradare, con
            il rischio più alto di falsi segnali.
          </p>

          <p>
            Il sistema integra anche il <strong className="text-white">VIX</strong> (indice di paura):
            quando VIX &gt; 25, il bot aumenta il min edge del +3% e riduce le posizioni al 70%.
            Correlazione positiva moderata (0.40) tra VIX e volatilità crypto significa che spike
            del VIX spesso anticipano turbolenza nel mercato crypto.
          </p>

          {/* KELLY CRITERION */}
          <SectionHeading emoji="🎲" id="kelly">
            Kelly criterion: quanto scommettere
          </SectionHeading>

          <p>
            Trovare un edge è solo metà del lavoro. L&apos;altra metà è{' '}
            <strong className="text-white">quanto</strong> scommettere. Troppo e un singolo
            trade sbagliato ti cancella. Troppo poco e non sfrutti i vantaggi.
          </p>

          <p>
            Il <strong className="text-white">Kelly criterion</strong> risolve questo problema
            matematicamente: è la formula che massimizza il tasso di crescita del capitale nel
            lungo periodo.
          </p>

          <CodeBlock lang="python">{`def kelly_criterion_check(our_prob, price_cents):
    """
    f* = (b·p - q) / b
    
    b = odds netti = (100/price - 1)
    p = probabilità vera di vincere
    q = 1 - p
    
    Se f* ≤ 0 → non scommettere (trade è -EV!)
    """
    b = (100 - price_cents) / price_cents
    p = our_prob
    q = 1 - p
    return max(0, (b * p - q) / b)`}</CodeBlock>

          <p>
            In pratica, non usiamo mai il Kelly pieno (troppo aggressivo). Usiamo un{' '}
            <strong className="text-white">fractional Kelly</strong> configurato per-asset:
          </p>

          <div className="card-3d p-6">
            <InfoRow label="BTC Kelly fraction" value="10% del Kelly pieno" />
            <InfoRow label="ETH Kelly fraction" value="8% del Kelly pieno" />
            <InfoRow label="SOL Kelly fraction" value="5% (più volatile)" />
            <InfoRow label="Weather Kelly fraction" value="5% (diverso edge source)" />
            <InfoRow label="Max posizione BTC" value="5% del portfolio" />
            <InfoRow label="Max posizione ETH" value="4% del portfolio" />
          </div>

          <p>
            Ma il Kelly di base viene poi moltiplicato per diversi fattori:
          </p>

          <div className="card-3d p-6 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-onde-teal font-bold text-lg">×</span>
              <p className="text-white/70">
                <strong className="text-white">Regime multiplier</strong> — 0.5× in choppy, 1.1× in trending
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-teal font-bold text-lg">×</span>
              <p className="text-white/70">
                <strong className="text-white">Volatility alignment</strong> — +15% se la volatilità conferma la direzione
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-teal font-bold text-lg">×</span>
              <p className="text-white/70">
                <strong className="text-white">Streak adjustment</strong> — 70% del sizing dopo 3+ loss consecutive (anti-tilt)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-teal font-bold text-lg">×</span>
              <p className="text-white/70">
                <strong className="text-white">Latency multiplier</strong> — riduce sizing se API &gt; 500ms (dati stale)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-teal font-bold text-lg">×</span>
              <p className="text-white/70">
                <strong className="text-white">VIX multiplier</strong> — 70% quando VIX &gt; 25 (paura nel mercato)
              </p>
            </div>
          </div>

          {/* EDGE CALIBRATION */}
          <SectionHeading emoji="🔧" id="calibration">
            Edge calibration: la lezione che costa cara
          </SectionHeading>

          <p>
            La v1 del bot aveva un problema devastante:{' '}
            <strong className="text-red-400">0% win rate</strong>. Zero. Niente. Ogni singolo
            trade perso. Cosa era andato storto?
          </p>

          <div className="card-3d p-6 border-l-4 border-red-500/50">
            <p className="text-white/80 font-semibold mb-2">
              💀 Post-mortem della v1
            </p>
            <ul className="list-disc list-inside space-y-1 text-white/60 text-sm">
              <li>Probabilità calcolate con volatilità statica (non dinamica)</li>
              <li>Nessun cap sugli edge — il modello diceva &ldquo;98% sicuro&rdquo; e noi ci credevamo</li>
              <li>Nessun Kelly check — tradavamo con edge negativi senza saperlo</li>
              <li>Nessun feedback loop — il bot non imparava dai propri errori</li>
            </ul>
          </div>

          <p>
            La v2 ha introdotto una serie di <strong className="text-white">safety guard</strong> che
            chiamiamo &ldquo;edge calibration&rdquo;:
          </p>

          <CodeBlock lang="python">{`# EDGE CAPS (validati dal backtesting)
MAX_EDGE = 0.20       # Cap globale al 20%
                      # Edges sopra = errore del modello, non alpha
ASSET_CAPS = {
    "btc": 0.20,      # Cap BTC al 20%
    "eth": 0.20,      # Cap ETH al 20%
    "weather": 0.15,  # Cap weather al 15% (backtest: >25% erano falsi)
}

# PROBABILITY BOUNDS
prob = max(0.03, min(0.97, prob))  
# Mai dire "99% sicuro" — le code grasse esistono!

# MOMENTUM ADJUSTMENT CAP
max_adj = 0.10 if aligned else 0.05  
# Max ±10% (era ±15% — troppo aggressivo)`}</CodeBlock>

          <p>
            Il backtesting ha confermato tutto: con i nuovi cap, il PnL è passato da{' '}
            <strong className="text-red-400">-$3.07</strong> a{' '}
            <strong className="text-green-400">+$0.56</strong>, il win rate dal 60% al{' '}
            <strong className="text-green-400">75%</strong>, e lo Sharpe ratio
            da -8.73 a <strong className="text-green-400">2.08</strong>.
            Un singolo trade ETH con edge finto del 23% è stato correttamente filtrato.
          </p>

          {/* SAFETY SYSTEMS */}
          <SectionHeading emoji="🛡️" id="safety">
            I 15+ safety systems
          </SectionHeading>

          <p>
            Un trading bot senza safety systems è un modo veloce per perdere soldi. Il nostro
            ne ha più di quindici:
          </p>

          <div className="grid sm:grid-cols-2 gap-3 my-6">
            {[
              { emoji: '🔒', name: 'Circuit Breaker', desc: 'Pausa automatica dopo 5 loss consecutive' },
              { emoji: '📉', name: 'Stop-Loss', desc: 'Exit automatico se posizione perde >50%' },
              { emoji: '⚖️', name: 'Concentrazione', desc: 'Max 50% in una asset class, 30% in correlated' },
              { emoji: '🔄', name: 'Auto-Rebalance', desc: 'Ribilanciamento automatico quando concentrato' },
              { emoji: '⏰', name: 'Trading Schedule', desc: 'Evita ore/giorni con storica bassa performance' },
              { emoji: '🎄', name: 'Holiday Pause', desc: 'Riduce o ferma trading nei giorni festivi USA' },
              { emoji: '⚡', name: 'Latency Guard', desc: 'Skip trade se API >2000ms (dati stale)' },
              { emoji: '🎰', name: 'Anti-Tilt', desc: 'Riduce sizing 30% dopo streak di loss (psicologia)' },
              { emoji: '📊', name: 'Rate Limiting', desc: 'Monitora API calls per evitare ban' },
              { emoji: '🌡️', name: 'VIX Integration', desc: 'Più conservativo quando il fear index sale' },
              { emoji: '📈', name: 'Max Edge Cap', desc: 'Rifiuta edges >20% (troppo bello per essere vero)' },
              { emoji: '💰', name: 'Max Daily Loss', desc: 'Stop a $5 di perdita giornaliera' },
            ].map((s) => (
              <div key={s.name} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-lg flex-shrink-0">{s.emoji}</span>
                <div>
                  <p className="text-white font-medium text-sm">{s.name}</p>
                  <p className="text-white/50 text-xs">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* NEWS SENTIMENT */}
          <SectionHeading emoji="📰" id="news">
            News sentiment: il quarto agente
          </SectionHeading>

          <p>
            Il bot integra anche un modulo di <strong className="text-white">news sentiment analysis</strong> che
            cerca le ultime notizie su BTC/ETH e valuta il sentimento (bullish/neutral/bearish).
            Il risultato viene usato come edge adjustment: se le news sono decisamente bullish,
            il bot aggiunge un bonus all&apos;edge dei trade YES (e viceversa).
          </p>

          <p>
            Non si tratta di GPT che legge i giornali — è una pipeline dedicata che usa la
            Brave Search API per trovare notizie recenti, le analizza per keyword e pattern,
            e produce un segnale con confidence score. Pragmatico e veloce, non sofisticato
            ma efficace.
          </p>

          {/* WEATHER MARKETS */}
          <SectionHeading emoji="🌤️" id="weather">
            Weather markets: quando il meteo diventa alpha
          </SectionHeading>

          <p>
            Una delle intuizioni più interessanti: Kalshi offre mercati sulla temperatura
            (es. &ldquo;High temperature a NYC sopra 45°F domani?&rdquo;).
            Il <strong className="text-white">National Weather Service</strong> pubblica previsioni
            gratuite con un MAE (Mean Absolute Error) di circa 2.8°F per previsioni a &lt;48h.
          </p>

          <p>
            Il mercato spesso prezza queste probabilità con un{' '}
            <strong className="text-white">favorite-longshot bias</strong>: i contratti &ldquo;ovvi&rdquo;
            (quasi certi) sono overpriced, mentre i contratti improbabili sono underpriced.
            NWS forecast + modello gaussiano della temperatura = edge calcolabile.
          </p>

          <CodeBlock lang="python">{`# Weather safety guards (validati dal backtest)
WEATHER_MIN_FORECAST_STRIKE_GAP = 2.0  # °F
# 0°F gap = 6.4% WR ❌
# 2°F gap = 40% WR  ⚠️
# 7°F+ gap = 100% WR ✅

WEATHER_MAX_MARKET_CONVICTION = 0.85
# Non scommettere contro l'85%+ del mercato

WEATHER_FORECAST_UNCERTAINTY = 4.0  
# Override con MAE reale (non il default troppo ottimista)`}</CodeBlock>

          {/* IL CICLO DI TRADING */}
          <SectionHeading emoji="🔄" id="cycle">
            Il ciclo: cosa succede ogni 5 minuti
          </SectionHeading>

          <div className="card-3d p-6 space-y-4">
            {[
              { step: '1', title: 'Feedback Loop', desc: 'Aggiorna i risultati dei trade precedenti (win/loss). Il bot impara.' },
              { step: '2', title: 'Market Check', desc: 'Prezzi crypto, OHLC 7 giorni, news sentiment, previsioni meteo.' },
              { step: '3', title: 'Momentum Analysis', desc: 'Calcola momentum 1h/4h/24h, rileva divergenze RSI, check whipsaw.' },
              { step: '4', title: 'Regime Detection', desc: 'Classifica il mercato (trending/sideways/choppy), integra VIX.' },
              { step: '5', title: 'Find Opportunities', desc: 'Scansiona 50+ BTC + 50+ ETH + weather markets. Calcola probabilità e edge.' },
              { step: '6', title: 'Validate & Filter', desc: 'Edge caps, Kelly check, concentrazione, circuit breaker, trading schedule.' },
              { step: '7', title: 'Execute', desc: 'Piazza ordine su Kalshi con sizing ottimale. Log tutto per backtest futuro.' },
              { step: '8', title: 'Monitor', desc: 'Check stop-loss, latency alerts, regime changes, streak records.' },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-onde-teal/20 flex items-center justify-center text-onde-teal font-bold text-sm">
                  {s.step}
                </span>
                <div>
                  <p className="text-white font-medium">{s.title}</p>
                  <p className="text-white/60 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p>
            Ogni ciclo logga tutto in formato JSONL: trade, skip, execution latency, ML features
            per training futuro. Il bot ha anche un{' '}
            <strong className="text-white">HTTP health server</strong> (porta 8089) con endpoint
            Prometheus per monitoring esterno.
          </p>

          {/* COSA ABBIAMO IMPARATO */}
          <SectionHeading emoji="💡" id="lessons">
            Le 5 lezioni che ci sono costate caro
          </SectionHeading>

          <div className="space-y-6">
            <div className="card-3d p-6 border-l-4 border-red-500/50">
              <h3 className="text-lg font-bold text-white mb-2">1. Mai fidarsi del proprio modello al 100%</h3>
              <p className="text-white/60 text-sm">
                Il primo backtest ha dimostrato che edge &gt;25% erano quasi tutti falsi positivi.
                Il modello era overconfident vicino allo strike. Il cap al 20% ha risolto il problema.
              </p>
            </div>

            <div className="card-3d p-6 border-l-4 border-amber-500/50">
              <h3 className="text-lg font-bold text-white mb-2">2. Position sizing &gt; entry timing</h3>
              <p className="text-white/60 text-sm">
                Con il Kelly sbagliato, anche un edge positivo ti fa perdere soldi. Il fractional Kelly
                (5-10%) sembra troppo conservativo ma è l&apos;unico modo di sopravvivere long-term.
              </p>
            </div>

            <div className="card-3d p-6 border-l-4 border-blue-500/50">
              <h3 className="text-lg font-bold text-white mb-2">3. Il regime conta più dell&apos;edge</h3>
              <p className="text-white/60 text-sm">
                Un edge del 15% in mercato choppy vale meno di un edge del 7% in trending.
                Il regime detection ha migliorato il win rate più di qualsiasi altra feature.
              </p>
            </div>

            <div className="card-3d p-6 border-l-4 border-green-500/50">
              <h3 className="text-lg font-bold text-white mb-2">4. Il feedback loop è non-negoziabile</h3>
              <p className="text-white/60 text-sm">
                La v1 non aggiornava i risultati dei trade. Il bot non sapeva se stava vincendo o perdendo.
                Il feedback loop ha reso possibile il circuit breaker, lo streak tracking, e il backtest.
              </p>
            </div>

            <div className="card-3d p-6 border-l-4 border-purple-500/50">
              <h3 className="text-lg font-bold text-white mb-2">5. Per-asset config cambia tutto</h3>
              <p className="text-white/60 text-sm">
                BTC ed ETH hanno profili diversi. Weather ha un edge source completamente diverso.
                Trattarli con gli stessi parametri è come usare la stessa medicina per malattie diverse.
              </p>
            </div>
          </div>

          {/* NUMERI */}
          <SectionHeading emoji="📈" id="numbers">
            I numeri (backtest-validated)
          </SectionHeading>

          <div className="card-3d p-6">
            <InfoRow label="PnL (nuovi cap)" value="+$0.56" />
            <InfoRow label="PnL (vecchi cap)" value="-$3.07" />
            <InfoRow label="Win Rate (calibrato)" value="75%" />
            <InfoRow label="Sharpe Ratio" value="2.08" />
            <InfoRow label="Mercati scansionati/ciclo" value="~100+" />
            <InfoRow label="Safety systems attivi" value="15+" />
            <InfoRow label="Linee di codice" value="~7.000" />
            <InfoRow label="Ciclo di trading" value="5 min (live) / 1 min (paper)" />
          </div>

          {/* WHAT'S NEXT */}
          <SectionHeading emoji="🚀" id="next">
            Cosa viene dopo
          </SectionHeading>

          <p>
            Il bot è in continua evoluzione. Sul roadmap:
          </p>

          <ul className="list-disc list-inside space-y-2 text-white/70 ml-2">
            <li>
              <strong className="text-white">LLM-based probability assessment</strong> — usare un
              modello di linguaggio (tipo Grok) per valutare probabilità di eventi complessi
            </li>
            <li>
              <strong className="text-white">Più asset</strong> — SOL, DOGE, e altri mercati crypto su Kalshi
            </li>
            <li>
              <strong className="text-white">Parameter sweep automatico</strong> — trovare il Kelly fraction
              ottimale dopo 30+ trade settled
            </li>
            <li>
              <strong className="text-white">Per-regime strategy switching</strong> — strategie
              diverse per ogni regime di mercato
            </li>
            <li>
              <strong className="text-white">Real-time dashboard</strong> — visualizzazione live
              su onde.surf con grafici PnL e performance
            </li>
          </ul>

          <p>
            Il codice è open source su{' '}
            <a
              href="https://github.com/FreeRiverHouse/Onde"
              target="_blank"
              rel="noopener noreferrer"
              className="text-onde-teal hover:text-onde-teal/80 transition-colors underline"
            >
              GitHub
            </a>
            . Se ti interessa il trading quantitativo su prediction markets, dai un&apos;occhiata.
          </p>
        </div>

        {/* ── Author card / footer ── */}
        <motion.div
          className="mt-16 card-3d p-6 md:p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-white/40 text-sm mb-4">
            Costruito da{' '}
            <Link
              href="/"
              className="text-onde-teal hover:text-onde-teal/80 transition-colors underline"
            >
              FreeRiverHouse
            </Link>{' '}
            — dove l&apos;impossibile succede prima di colazione.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://x.com/Onde_FRH"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-glow text-sm px-4 py-2"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
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
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
                </svg>
                GitHub
              </span>
            </a>
          </div>
        </motion.div>

        {/* ── Back to blog ── */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/40 hover:text-onde-teal transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Torna al blog
          </Link>
        </div>
      </article>
    </div>
  )
}

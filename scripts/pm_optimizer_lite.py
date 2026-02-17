#!/usr/bin/env python3
"""
Prediction Market Optimizer (Lite Version - No NumPy)
=====================================================
Optimizes betting strategy using signal analysis and Kelly Criterion.
"""

import math
from dataclasses import dataclass
from typing import List, Dict, Optional, Tuple
from enum import Enum
from datetime import datetime

# =============================================================================
# DATA STRUCTURES
# =============================================================================

class SignalType(Enum):
    NEWS_SENTIMENT = "news"
    ODDS_MOVEMENT = "odds"
    VOLUME_SPIKE = "volume"
    TIME_DECAY = "time"
    CROSS_PLATFORM = "arbitrage"
    LIVE_SCORE = "live"

@dataclass
class Signal:
    type: SignalType
    value: float  # -1 to +1
    confidence: float  # 0 to 1
    source: str

@dataclass
class Market:
    id: str
    platform: str
    question: str
    yes_price: float
    no_price: float
    volume: float
    news: Optional[str] = None
    cross_price: Optional[float] = None
    live_status: Optional[str] = None

@dataclass
class Recommendation:
    market_id: str
    side: str
    edge: float
    kelly: float
    confidence: float
    bet_amount: float
    expected_value: float
    reasoning: str

# =============================================================================
# SIGNAL EXTRACTION
# =============================================================================

BULLISH = {
    'confirmed': 0.8, 'announced': 0.6, 'approved': 0.9,
    'winning': 0.8, 'ahead': 0.6, 'leading': 0.7,
    'will step down': 0.8, 'resign': 0.7, 'leaving': 0.6,
    'fired': 0.8, 'removed': 0.7, 'out': 0.5,
    'down to one': 0.7, 'nearly over': 0.5, 'praised': 0.6
}

BEARISH = {
    'denied': -0.8, 'rejected': -0.9, 'failed': -0.7, 'unlikely': -0.6,
    'doubt': -0.5, 'criticized': -0.5, 'losing': -0.8, 'behind': -0.6,
    'not step down': -0.9, 'will not': -0.7, 'blunt no': -0.8,
    'backed': -0.5, 'supported': -0.5, 'very good job': -0.6,
    'staying': -0.7, 'remains': -0.6
}

def extract_news_signal(news: str, question: str) -> Signal:
    """Extract sentiment from news text"""
    text = news.lower()
    question_lower = question.lower()
    
    score = 0.0
    matches = 0
    
    for kw, weight in BULLISH.items():
        if kw in text:
            # Context boost if keyword relates to question
            boost = 1.5 if any(w in question_lower for w in kw.split()) else 1.0
            score += weight * boost
            matches += 1
            
    for kw, weight in BEARISH.items():
        if kw in text:
            boost = 1.5 if any(w in question_lower for w in kw.split()) else 1.0
            score += weight * boost
            matches += 1
    
    if matches > 0:
        normalized = math.tanh(score / max(matches, 1))
    else:
        normalized = 0.0
        
    confidence = min(matches / 4, 1.0)
    
    return Signal(
        type=SignalType.NEWS_SENTIMENT,
        value=normalized,
        confidence=confidence,
        source="news"
    )

def extract_arbitrage_signal(price1: float, price2: float) -> Signal:
    """Detect cross-platform price differences"""
    diff = price1 - price2
    
    if abs(diff) > 0.05:
        value = -math.copysign(1, diff) * min(abs(diff) * 5, 1)
        confidence = 0.9
    elif abs(diff) > 0.02:
        value = -math.copysign(1, diff) * 0.3
        confidence = 0.5
    else:
        value = 0.0
        confidence = 0.1
        
    return Signal(
        type=SignalType.CROSS_PLATFORM,
        value=value,
        confidence=confidence,
        source="arbitrage"
    )

def extract_live_signal(live_status: str, yes_price: float) -> Signal:
    """Extract signal from live game status"""
    status = live_status.lower()
    
    # Detect winning/leading patterns
    if 'winning' in status or 'leading' in status or 'ahead' in status:
        if yes_price < 0.7:  # Underpriced given winning
            value = 0.6
            confidence = 0.8
        else:
            value = 0.2
            confidence = 0.5
    elif '1-0' in status or '2-0' in status or '2-1' in status:
        value = 0.5
        confidence = 0.7
    else:
        value = 0.0
        confidence = 0.2
        
    return Signal(
        type=SignalType.LIVE_SCORE,
        value=value,
        confidence=confidence,
        source="live"
    )

# =============================================================================
# KELLY CRITERION
# =============================================================================

def calculate_kelly(
    estimated_prob: float,
    market_price: float,
    kelly_fraction: float = 0.25,
    max_bet: float = 0.15
) -> float:
    """
    Kelly Criterion for binary bets.
    
    For YES at price p: Kelly = (prob - price) / (1 - price)
    """
    if market_price >= 0.99 or market_price <= 0.01:
        return 0.0
        
    edge = estimated_prob - market_price
    
    if edge <= 0:
        return 0.0
        
    kelly = edge / (1 - market_price)
    adjusted = kelly * kelly_fraction
    
    return min(adjusted, max_bet)

# =============================================================================
# OPTIMIZER
# =============================================================================

class Optimizer:
    def __init__(self, bankroll: float = 15.0, kelly_frac: float = 0.25):
        self.bankroll = bankroll
        self.kelly_frac = kelly_frac
        
    def analyze(self, market: Market) -> Recommendation:
        signals = []
        reasoning_parts = []
        
        # News signal
        if market.news:
            sig = extract_news_signal(market.news, market.question)
            if sig.confidence > 0.2:
                signals.append(sig)
                reasoning_parts.append(f"News signal: {sig.value:+.2f} (conf: {sig.confidence:.0%})")
        
        # Arbitrage signal
        if market.cross_price is not None:
            sig = extract_arbitrage_signal(market.yes_price, market.cross_price)
            if sig.confidence > 0.2:
                signals.append(sig)
                reasoning_parts.append(f"Arb signal: {sig.value:+.2f}")
        
        # Live signal
        if market.live_status:
            sig = extract_live_signal(market.live_status, market.yes_price)
            if sig.confidence > 0.2:
                signals.append(sig)
                reasoning_parts.append(f"Live signal: {sig.value:+.2f}")
        
        if not signals:
            return Recommendation(
                market_id=market.id,
                side="NONE",
                edge=0.0,
                kelly=0.0,
                confidence=0.0,
                bet_amount=0.0,
                expected_value=0.0,
                reasoning="No actionable signals"
            )
        
        # Combine signals (weighted by confidence)
        total_weight = sum(s.confidence for s in signals)
        combined = sum(s.value * s.confidence for s in signals) / total_weight
        avg_confidence = total_weight / len(signals)
        
        # Convert to probability adjustment
        # Positive signal = YES underpriced, Negative = NO underpriced
        adjustment = combined * 0.15 * avg_confidence
        
        est_yes_prob = max(0.01, min(0.99, market.yes_price + adjustment))
        
        # Determine best side
        yes_edge = est_yes_prob - market.yes_price
        no_edge = (1 - est_yes_prob) - market.no_price
        
        if yes_edge > no_edge and yes_edge > 0.02:
            side = "YES"
            edge = yes_edge
            price = market.yes_price
            kelly = calculate_kelly(est_yes_prob, price, self.kelly_frac)
        elif no_edge > 0.02:
            side = "NO"
            edge = no_edge
            price = market.no_price
            kelly = calculate_kelly(1 - est_yes_prob, price, self.kelly_frac)
        else:
            return Recommendation(
                market_id=market.id,
                side="NONE",
                edge=0.0,
                kelly=0.0,
                confidence=0.0,
                bet_amount=0.0,
                expected_value=0.0,
                reasoning="Edge too small (<2%)"
            )
        
        bet_amount = kelly * self.bankroll
        ev = edge * bet_amount
        
        reasoning = " | ".join(reasoning_parts)
        
        return Recommendation(
            market_id=market.id,
            side=side,
            edge=edge,
            kelly=kelly,
            confidence=avg_confidence,
            bet_amount=bet_amount,
            expected_value=ev,
            reasoning=reasoning
        )

# =============================================================================
# RUN ANALYSIS
# =============================================================================

def main():
    print("=" * 70)
    print("🎯 PREDICTION MARKET OPTIMIZER")
    print("=" * 70)
    
    opt = Optimizer(bankroll=15.0, kelly_frac=0.25)
    
    markets = [
        Market(
            id="NOEM-NO-JUL",
            platform="Kalshi",
            question="Kristi Noem out as DHS Secretary before Jul 1?",
            yes_price=0.46,
            no_price=0.57,
            volume=83000,
            news="Trump said Homeland Security Secretary Kristi Noem will not step down, answering with a blunt No and praising her very good job"
        ),
        Market(
            id="FED-RIEDER",
            platform="Kalshi",
            question="Rick Rieder nominated as Fed Chair?",
            yes_price=0.48,
            no_price=0.52,
            volume=61000000,
            news="Trump said he is down to maybe one candidate and praised BlackRock executive Rick Rieder"
        ),
        Market(
            id="SHUTDOWN",
            platform="Kalshi",
            question="Government shutdown on Jan 31?",
            yes_price=0.78,
            no_price=0.22,
            volume=10200000,
            news="Democrats block DHS funding bill, Jan 30 deadline looming with chaos in negotiations",
            cross_price=0.80
        ),
        Market(
            id="FIORENTINA",
            platform="Kalshi",
            question="Fiorentina wins vs Como?",
            yes_price=0.47,
            no_price=0.53,
            volume=50000,
            live_status="Fiorentina leading 1-0"
        )
    ]
    
    results = []
    
    for m in markets:
        rec = opt.analyze(m)
        results.append((m, rec))
    
    # Sort by EV
    results.sort(key=lambda x: x[1].expected_value, reverse=True)
    
    print(f"\n💰 Bankroll: ${opt.bankroll:.2f}")
    print(f"📊 Kelly Fraction: {opt.kelly_frac}")
    print("\n" + "=" * 70)
    print("RECOMMENDATIONS (sorted by Expected Value)")
    print("=" * 70)
    
    total_bet = 0
    total_ev = 0
    
    for i, (m, rec) in enumerate(results, 1):
        if rec.side == "NONE":
            print(f"\n{i}. {m.question[:50]}...")
            print(f"   ❌ No bet: {rec.reasoning}")
            continue
            
        total_bet += rec.bet_amount
        total_ev += rec.expected_value
        
        price = m.yes_price if rec.side == "YES" else m.no_price
        
        print(f"\n{i}. {m.question[:50]}...")
        print(f"   📍 Platform: {m.platform}")
        print(f"   ✅ BET: {rec.side} @ {price:.2f}")
        print(f"   📈 Edge: {rec.edge*100:.1f}%")
        print(f"   🎯 Confidence: {rec.confidence*100:.0f}%")
        print(f"   💵 Bet Amount: ${rec.bet_amount:.2f} ({rec.kelly*100:.1f}% Kelly)")
        print(f"   💎 Expected Value: ${rec.expected_value:.3f}")
        print(f"   💡 Reasoning: {rec.reasoning}")
    
    print("\n" + "=" * 70)
    print("PORTFOLIO SUMMARY")
    print("=" * 70)
    print(f"📊 Total Bets: ${total_bet:.2f} ({total_bet/opt.bankroll*100:.0f}% of bankroll)")
    print(f"💎 Total Expected Value: ${total_ev:.3f}")
    if total_bet > 0:
        print(f"📈 Expected ROI: {total_ev/total_bet*100:.1f}%")
    print("=" * 70)
    
    # Output actionable commands
    print("\n🚀 ACTIONABLE BETS:")
    for m, rec in results:
        if rec.side != "NONE" and rec.bet_amount >= 0.50:
            price = m.yes_price if rec.side == "YES" else m.no_price
            print(f"   → {m.platform}: {rec.side} on '{m.id}' @ {price:.0%} for ${rec.bet_amount:.2f}")

if __name__ == "__main__":
    main()

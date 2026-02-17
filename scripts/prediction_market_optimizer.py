#!/usr/bin/env python3
"""
Prediction Market Optimizer
===========================
Uses Independent Component Analysis (ICA) to extract orthogonal signals
and optimize betting strategy via Kelly Criterion maximization.

Components:
1. Signal Extraction (News, Odds, Volume, Time Decay)
2. ICA Decomposition for independent edge factors
3. Kelly Criterion for optimal bet sizing
4. Cross-platform arbitrage detection
"""

import numpy as np
import math
from dataclasses import dataclass
from typing import List, Dict, Optional, Tuple
from enum import Enum
import json
from datetime import datetime, timedelta

# =============================================================================
# DATA STRUCTURES
# =============================================================================

class SignalType(Enum):
    NEWS_SENTIMENT = "news"
    ODDS_MOVEMENT = "odds"
    VOLUME_SPIKE = "volume"
    TIME_DECAY = "time"
    CROSS_PLATFORM = "arbitrage"
    EXPERT_CONSENSUS = "expert"

@dataclass
class Signal:
    """Individual signal component"""
    type: SignalType
    value: float  # -1 to +1 (bearish to bullish)
    confidence: float  # 0 to 1
    timestamp: datetime
    source: str
    
@dataclass
class Market:
    """Prediction market representation"""
    id: str
    platform: str  # kalshi, polymarket
    question: str
    yes_price: float
    no_price: float
    volume: float
    expiry: Optional[datetime]
    signals: List[Signal]

@dataclass 
class BetRecommendation:
    """Optimized bet recommendation"""
    market_id: str
    side: str  # YES or NO
    edge: float  # estimated edge
    kelly_fraction: float  # optimal bet size as fraction of bankroll
    confidence: float
    expected_value: float
    signals_used: List[SignalType]

# =============================================================================
# INDEPENDENT COMPONENT ANALYSIS (Simplified FastICA)
# =============================================================================

class SignalICA:
    """
    Extract independent components from mixed market signals.
    
    The idea: Market prices are influenced by multiple independent factors
    (news, sentiment, smart money, noise). ICA separates these to find
    the "true" signal underneath.
    """
    
    def __init__(self, n_components: int = 4):
        self.n_components = n_components
        self.mixing_matrix = None
        self.unmixing_matrix = None
        
    def _center(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Center the data"""
        mean = np.mean(X, axis=0)
        return X - mean, mean
    
    def _whiten(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Whiten data using eigendecomposition"""
        cov = np.cov(X, rowvar=False)
        eigenvalues, eigenvectors = np.linalg.eigh(cov)
        
        # Regularize to avoid division by zero
        eigenvalues = np.maximum(eigenvalues, 1e-10)
        
        D = np.diag(1.0 / np.sqrt(eigenvalues))
        whitening_matrix = eigenvectors @ D @ eigenvectors.T
        return X @ whitening_matrix, whitening_matrix
    
    def _g(self, u: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Non-linearity function (tanh) and its derivative"""
        return math.tanh(u), 1 - math.tanh(u)**2
    
    def fit_transform(self, X: np.ndarray, max_iter: int = 200, tol: float = 1e-4) -> np.ndarray:
        """
        Fit ICA model and transform data.
        
        Args:
            X: Input signals matrix (n_samples, n_features)
        Returns:
            Independent components (n_samples, n_components)
        """
        n_samples, n_features = X.shape
        n_components = min(self.n_components, n_features)
        
        # Center and whiten
        X_centered, _ = self._center(X)
        X_whitened, self.whitening_matrix = self._whiten(X_centered)
        
        # Initialize unmixing matrix randomly
        W = np.random.randn(n_components, n_features)
        W = W / np.linalg.norm(W, axis=1, keepdims=True)
        
        # FastICA iteration
        for _ in range(max_iter):
            W_old = W.copy()
            
            for i in range(n_components):
                # Compute w'*x for all samples
                wx = X_whitened @ W[i]
                
                # Apply non-linearity
                g_wx, g_prime_wx = self._g(wx)
                
                # Update rule
                W[i] = np.mean(X_whitened.T * g_wx, axis=1) - np.mean(g_prime_wx) * W[i]
                
                # Decorrelate from previous components
                for j in range(i):
                    W[i] -= np.dot(W[i], W[j]) * W[j]
                
                # Normalize
                W[i] /= np.linalg.norm(W[i]) + 1e-10
            
            # Check convergence
            if np.max(np.abs(np.abs(np.diag(W @ W_old.T)) - 1)) < tol:
                break
        
        self.unmixing_matrix = W
        return X_whitened @ W.T

# =============================================================================
# SIGNAL EXTRACTION
# =============================================================================

class SignalExtractor:
    """Extract trading signals from various sources"""
    
    # News sentiment keywords and weights
    BULLISH_KEYWORDS = {
        'confirmed': 0.8, 'announced': 0.6, 'approved': 0.9,
        'will': 0.5, 'plans to': 0.4, 'agreed': 0.7,
        'winning': 0.8, 'ahead': 0.6, 'leading': 0.7,
        'backed': 0.6, 'supported': 0.5, 'praised': 0.5
    }
    
    BEARISH_KEYWORDS = {
        'denied': -0.8, 'rejected': -0.9, 'failed': -0.7,
        'unlikely': -0.6, 'doubt': -0.5, 'criticized': -0.4,
        'losing': -0.8, 'behind': -0.6, 'trailing': -0.7,
        'removed': -0.7, 'fired': -0.8, 'resigned': -0.6
    }
    
    @staticmethod
    def extract_news_signal(news_text: str, market_context: str) -> Signal:
        """
        Extract sentiment signal from news text.
        Uses keyword matching with context weighting.
        """
        text_lower = news_text.lower()
        context_lower = market_context.lower()
        
        score = 0.0
        matches = 0
        
        for keyword, weight in SignalExtractor.BULLISH_KEYWORDS.items():
            if keyword in text_lower:
                # Boost if keyword also relates to market context
                context_boost = 1.5 if keyword in context_lower else 1.0
                score += weight * context_boost
                matches += 1
                
        for keyword, weight in SignalExtractor.BEARISH_KEYWORDS.items():
            if keyword in text_lower:
                context_boost = 1.5 if keyword in context_lower else 1.0
                score += weight * context_boost
                matches += 1
        
        # Normalize to [-1, 1]
        if matches > 0:
            normalized_score = math.tanh(score / max(matches, 1))
        else:
            normalized_score = 0.0
            
        confidence = min(matches / 5, 1.0)  # More matches = more confidence
        
        return Signal(
            type=SignalType.NEWS_SENTIMENT,
            value=normalized_score,
            confidence=confidence,
            timestamp=datetime.now(),
            source="news_analysis"
        )
    
    @staticmethod
    def extract_odds_movement_signal(
        current_price: float,
        historical_prices: List[float],
        window: int = 10
    ) -> Signal:
        """
        Detect momentum and mean reversion signals from price history.
        """
        if len(historical_prices) < 2:
            return Signal(
                type=SignalType.ODDS_MOVEMENT,
                value=0.0,
                confidence=0.0,
                timestamp=datetime.now(),
                source="odds_analysis"
            )
        
        prices = np.array(historical_prices[-window:] + [current_price])
        
        # Calculate momentum (recent trend)
        returns = np.diff(prices) / (prices[:-1] + 1e-10)
        momentum = np.mean(returns[-3:]) if len(returns) >= 3 else np.mean(returns)
        
        # Calculate mean reversion signal
        mean_price = np.mean(prices)
        std_price = np.std(prices) + 1e-10
        z_score = (current_price - mean_price) / std_price
        
        # Combine: momentum for short-term, mean-reversion for extremes
        if abs(z_score) > 2:
            # Strong mean reversion signal when price is extreme
            signal_value = -np.sign(z_score) * min(abs(z_score) / 3, 1)
        else:
            # Follow momentum otherwise
            signal_value = math.tanh(momentum * 10)
        
        confidence = min(len(prices) / window, 1.0)
        
        return Signal(
            type=SignalType.ODDS_MOVEMENT,
            value=signal_value,
            confidence=confidence,
            timestamp=datetime.now(),
            source="odds_analysis"
        )
    
    @staticmethod
    def extract_volume_signal(
        current_volume: float,
        avg_volume: float,
        price_direction: float  # +1 if price going up, -1 if down
    ) -> Signal:
        """
        Volume confirms or denies price movements.
        High volume + price move = strong signal
        Low volume + price move = weak/fake signal
        """
        if avg_volume <= 0:
            return Signal(
                type=SignalType.VOLUME_SPIKE,
                value=0.0,
                confidence=0.0,
                timestamp=datetime.now(),
                source="volume_analysis"
            )
        
        volume_ratio = current_volume / avg_volume
        
        if volume_ratio > 2:
            # High volume confirms the move
            signal_value = price_direction * min(volume_ratio / 3, 1)
            confidence = 0.8
        elif volume_ratio < 0.5:
            # Low volume suggests reversal
            signal_value = -price_direction * 0.5
            confidence = 0.4
        else:
            # Normal volume, weak signal
            signal_value = price_direction * 0.2
            confidence = 0.3
            
        return Signal(
            type=SignalType.VOLUME_SPIKE,
            value=signal_value,
            confidence=confidence,
            timestamp=datetime.now(),
            source="volume_analysis"
        )
    
    @staticmethod
    def extract_time_decay_signal(
        current_price: float,
        expiry: datetime,
        is_yes_side: bool = True
    ) -> Signal:
        """
        Model time decay effects on binary options.
        As expiry approaches, prices should move toward 0 or 1.
        """
        time_to_expiry = (expiry - datetime.now()).total_seconds() / 86400  # days
        
        if time_to_expiry <= 0:
            return Signal(
                type=SignalType.TIME_DECAY,
                value=0.0,
                confidence=0.0,
                timestamp=datetime.now(),
                source="time_analysis"
            )
        
        # Calculate expected drift based on current price and time
        # Prices far from 0.5 should accelerate toward extremes
        distance_from_center = abs(current_price - 0.5)
        
        if time_to_expiry < 1:  # Less than 1 day
            # Strong drift expected
            if current_price > 0.5:
                signal_value = 0.5 + distance_from_center if is_yes_side else -0.5 - distance_from_center
            else:
                signal_value = -0.5 - distance_from_center if is_yes_side else 0.5 + distance_from_center
            confidence = 0.7
        elif time_to_expiry < 7:  # Less than 1 week
            # Moderate drift
            signal_value = np.sign(current_price - 0.5) * distance_from_center * 0.5
            if not is_yes_side:
                signal_value = -signal_value
            confidence = 0.5
        else:
            # Weak time decay effect
            signal_value = 0.0
            confidence = 0.2
            
        return Signal(
            type=SignalType.TIME_DECAY,
            value=np.clip(signal_value, -1, 1),
            confidence=confidence,
            timestamp=datetime.now(),
            source="time_analysis"
        )
    
    @staticmethod
    def extract_arbitrage_signal(
        platform1_price: float,
        platform2_price: float,
        platform1_name: str = "kalshi",
        platform2_name: str = "polymarket"
    ) -> Signal:
        """
        Detect cross-platform arbitrage opportunities.
        """
        price_diff = platform1_price - platform2_price
        
        if abs(price_diff) > 0.05:  # 5% difference threshold
            # Significant arbitrage opportunity
            # Positive = platform1 overpriced, negative = platform1 underpriced
            signal_value = -np.sign(price_diff) * min(abs(price_diff) * 5, 1)
            confidence = 0.9
        elif abs(price_diff) > 0.02:
            # Minor opportunity
            signal_value = -np.sign(price_diff) * 0.3
            confidence = 0.5
        else:
            # Prices aligned
            signal_value = 0.0
            confidence = 0.1
            
        return Signal(
            type=SignalType.CROSS_PLATFORM,
            value=signal_value,
            confidence=confidence,
            timestamp=datetime.now(),
            source=f"{platform1_name}_vs_{platform2_name}"
        )

# =============================================================================
# KELLY CRITERION OPTIMIZER
# =============================================================================

class KellyOptimizer:
    """
    Optimize bet sizes using Kelly Criterion.
    
    Kelly formula: f* = (p*b - q) / b
    where:
        f* = fraction of bankroll to bet
        p = probability of winning
        q = probability of losing (1-p)
        b = odds received on the bet (net odds)
    
    We use fractional Kelly (typically 0.25-0.5) for safety.
    """
    
    def __init__(self, kelly_fraction: float = 0.25, max_bet_fraction: float = 0.1):
        """
        Args:
            kelly_fraction: Fraction of full Kelly to use (0.25 = quarter Kelly)
            max_bet_fraction: Maximum bet as fraction of bankroll
        """
        self.kelly_fraction = kelly_fraction
        self.max_bet_fraction = max_bet_fraction
        
    def calculate_edge(self, estimated_prob: float, market_price: float) -> float:
        """
        Calculate edge: difference between estimated probability and market price.
        """
        return estimated_prob - market_price
    
    def calculate_kelly(
        self,
        estimated_prob: float,
        market_price: float,
        side: str = "YES"
    ) -> float:
        """
        Calculate optimal Kelly bet fraction.
        
        For YES bet at price p:
            - Win probability = estimated_prob
            - Win amount = (1 - price) per dollar bet
            - Lose amount = price per dollar bet
            
        Kelly = (p * (1-price) - (1-p) * price) / (1-price)
              = (p - price) / (1 - price)
        """
        if side == "YES":
            price = market_price
            prob = estimated_prob
        else:
            price = 1 - market_price
            prob = 1 - estimated_prob
            
        if price >= 1 or price <= 0:
            return 0.0
            
        edge = prob - price
        
        if edge <= 0:
            return 0.0
            
        # Kelly formula for binary bet
        kelly = edge / (1 - price)
        
        # Apply fractional Kelly and cap
        adjusted_kelly = kelly * self.kelly_fraction
        return min(adjusted_kelly, self.max_bet_fraction)
    
    def optimize_portfolio(
        self,
        opportunities: List[Dict],
        bankroll: float,
        correlation_matrix: Optional[np.ndarray] = None
    ) -> List[Dict]:
        """
        Optimize bet allocation across multiple opportunities.
        
        Uses mean-variance optimization if correlations provided.
        """
        n = len(opportunities)
        if n == 0:
            return []
            
        # Extract edges and kelly fractions
        edges = np.array([o['edge'] for o in opportunities])
        kellys = np.array([o['kelly'] for o in opportunities])
        
        if correlation_matrix is None:
            # Assume independence, just scale kellys
            total_kelly = np.sum(kellys)
            if total_kelly > self.max_bet_fraction * 2:
                # Scale down if too much total exposure
                scale = (self.max_bet_fraction * 2) / total_kelly
                kellys = kellys * scale
        else:
            # Mean-variance optimization
            # Maximize: w'*edges - lambda * w' * Sigma * w
            # Subject to: w >= 0, sum(w) <= max_allocation
            
            lambda_risk = 0.5  # Risk aversion parameter
            
            # Simplified: reduce correlated bets
            for i in range(n):
                for j in range(i+1, n):
                    if correlation_matrix[i,j] > 0.5:
                        # Highly correlated, reduce both
                        reduction = correlation_matrix[i,j] * 0.5
                        kellys[i] *= (1 - reduction)
                        kellys[j] *= (1 - reduction)
        
        # Calculate bet amounts
        results = []
        for i, opp in enumerate(opportunities):
            bet_amount = kellys[i] * bankroll
            results.append({
                **opp,
                'kelly_adjusted': kellys[i],
                'bet_amount': bet_amount,
                'expected_profit': bet_amount * edges[i]
            })
            
        return sorted(results, key=lambda x: x['expected_profit'], reverse=True)

# =============================================================================
# MAIN OPTIMIZER
# =============================================================================

class PredictionMarketOptimizer:
    """
    Main optimizer that combines all components.
    """
    
    def __init__(self, bankroll: float = 15.0):
        self.bankroll = bankroll
        self.signal_extractor = SignalExtractor()
        self.ica = SignalICA(n_components=4)
        self.kelly = KellyOptimizer(kelly_fraction=0.25, max_bet_fraction=0.15)
        
    def analyze_market(
        self,
        market: Market,
        news: Optional[str] = None,
        cross_platform_price: Optional[float] = None
    ) -> BetRecommendation:
        """
        Analyze a market and generate bet recommendation.
        """
        signals = []
        
        # Extract news signal if available
        if news:
            news_signal = self.signal_extractor.extract_news_signal(
                news, market.question
            )
            signals.append(news_signal)
            
        # Extract cross-platform signal if available
        if cross_platform_price is not None:
            arb_signal = self.signal_extractor.extract_arbitrage_signal(
                market.yes_price,
                cross_platform_price
            )
            signals.append(arb_signal)
            
        # Extract time decay signal if expiry known
        if market.expiry:
            time_signal = self.signal_extractor.extract_time_decay_signal(
                market.yes_price,
                market.expiry
            )
            signals.append(time_signal)
            
        # Combine signals using weighted average
        if not signals:
            return BetRecommendation(
                market_id=market.id,
                side="NONE",
                edge=0.0,
                kelly_fraction=0.0,
                confidence=0.0,
                expected_value=0.0,
                signals_used=[]
            )
            
        # Weight by confidence
        total_weight = sum(s.confidence for s in signals)
        if total_weight > 0:
            combined_signal = sum(s.value * s.confidence for s in signals) / total_weight
            combined_confidence = total_weight / len(signals)
        else:
            combined_signal = 0.0
            combined_confidence = 0.0
            
        # Convert signal to probability adjustment
        # Signal of +1 means we think YES is underpriced
        # Signal of -1 means we think NO is underpriced
        prob_adjustment = combined_signal * 0.15 * combined_confidence
        
        estimated_yes_prob = market.yes_price + prob_adjustment
        estimated_yes_prob = np.clip(estimated_yes_prob, 0.01, 0.99)
        
        # Determine side and calculate edge
        yes_edge = estimated_yes_prob - market.yes_price
        no_edge = (1 - estimated_yes_prob) - market.no_price
        
        if yes_edge > no_edge and yes_edge > 0.02:
            side = "YES"
            edge = yes_edge
            kelly = self.kelly.calculate_kelly(estimated_yes_prob, market.yes_price, "YES")
        elif no_edge > 0.02:
            side = "NO"
            edge = no_edge
            kelly = self.kelly.calculate_kelly(1 - estimated_yes_prob, market.no_price, "NO")
        else:
            side = "NONE"
            edge = 0.0
            kelly = 0.0
            
        expected_value = edge * kelly * self.bankroll
        
        return BetRecommendation(
            market_id=market.id,
            side=side,
            edge=edge,
            kelly_fraction=kelly,
            confidence=combined_confidence,
            expected_value=expected_value,
            signals_used=[s.type for s in signals]
        )
    
    def run_ica_analysis(self, signal_matrix: np.ndarray) -> np.ndarray:
        """
        Run ICA to extract independent components from signal matrix.
        
        Args:
            signal_matrix: (n_markets, n_signal_types) matrix
        Returns:
            Independent components
        """
        if signal_matrix.shape[0] < 2 or signal_matrix.shape[1] < 2:
            return signal_matrix
            
        try:
            return self.ica.fit_transform(signal_matrix)
        except Exception as e:
            print(f"ICA failed: {e}, using raw signals")
            return signal_matrix


# =============================================================================
# LIVE MARKET ANALYSIS
# =============================================================================

def analyze_current_opportunities():
    """
    Analyze current market opportunities based on known data.
    """
    optimizer = PredictionMarketOptimizer(bankroll=15.0)
    
    # Define markets with known data
    markets = [
        {
            'id': 'KXNOEMOUT-26JUL01',
            'platform': 'kalshi',
            'question': 'Kristi Noem out as DHS Secretary before Jul 1?',
            'yes_price': 0.46,
            'no_price': 0.57,
            'volume': 83000,
            'news': 'Trump said Homeland Security Secretary Kristi Noem will not step down, answering with a blunt No and praising her performance',
            'polymarket_price': None
        },
        {
            'id': 'KXFEDCHAIRNOM-29-RREI',
            'platform': 'kalshi',
            'question': 'Rick Rieder nominated as Fed Chair?',
            'yes_price': 0.48,
            'no_price': 0.52,
            'volume': 61000000,
            'news': 'Trump said he is down to maybe one candidate and praised BlackRock executive Rick Rieder',
            'polymarket_price': None
        },
        {
            'id': 'KXGOVSHUT-26JAN31',
            'platform': 'kalshi',
            'question': 'Government shutdown on Jan 31?',
            'yes_price': 0.78,
            'no_price': 0.22,
            'volume': 10200000,
            'news': 'Democrats block DHS funding bill, Jan 30 deadline looming, House out on recess',
            'polymarket_price': 0.80
        },
        {
            'id': 'fiorentina-como',
            'platform': 'kalshi',
            'question': 'Fiorentina wins vs Como (Coppa Italia)?',
            'yes_price': 0.47,
            'no_price': 0.53,
            'volume': 50000,
            'news': 'Fiorentina leading 1-0 in first half',
            'polymarket_price': None
        }
    ]
    
    print("=" * 70)
    print("PREDICTION MARKET OPTIMIZER - ANALYSIS RESULTS")
    print("=" * 70)
    print(f"Bankroll: ${optimizer.bankroll:.2f}")
    print(f"Kelly Fraction: {optimizer.kelly.kelly_fraction}")
    print(f"Max Bet: {optimizer.kelly.max_bet_fraction * 100}% of bankroll")
    print("=" * 70)
    
    recommendations = []
    
    for m in markets:
        market = Market(
            id=m['id'],
            platform=m['platform'],
            question=m['question'],
            yes_price=m['yes_price'],
            no_price=m['no_price'],
            volume=m['volume'],
            expiry=None,
            signals=[]
        )
        
        rec = optimizer.analyze_market(
            market,
            news=m.get('news'),
            cross_platform_price=m.get('polymarket_price')
        )
        
        recommendations.append((m, rec))
        
    # Sort by expected value
    recommendations.sort(key=lambda x: x[1].expected_value, reverse=True)
    
    print("\n📊 RANKED OPPORTUNITIES:\n")
    
    for i, (market, rec) in enumerate(recommendations, 1):
        if rec.side == "NONE":
            continue
            
        bet_amount = rec.kelly_fraction * optimizer.bankroll
        
        print(f"{i}. {market['question'][:50]}...")
        print(f"   Platform: {market['platform'].upper()}")
        print(f"   Recommendation: {rec.side} @ {market['yes_price' if rec.side == 'YES' else 'no_price']:.2f}")
        print(f"   Edge: {rec.edge*100:.1f}%")
        print(f"   Confidence: {rec.confidence*100:.0f}%")
        print(f"   Kelly Bet: ${bet_amount:.2f} ({rec.kelly_fraction*100:.1f}% of bankroll)")
        print(f"   Expected Value: ${rec.expected_value:.3f}")
        print(f"   Signals: {[s.value for s in rec.signals_used]}")
        print()
    
    # Summary
    total_ev = sum(r[1].expected_value for r in recommendations if r[1].side != "NONE")
    total_bet = sum(r[1].kelly_fraction * optimizer.bankroll for r in recommendations if r[1].side != "NONE")
    
    print("=" * 70)
    print("PORTFOLIO SUMMARY")
    print("=" * 70)
    print(f"Total Recommended Bets: ${total_bet:.2f}")
    print(f"Total Expected Value: ${total_ev:.3f}")
    print(f"Expected ROI: {(total_ev/total_bet*100) if total_bet > 0 else 0:.1f}%")
    print("=" * 70)
    
    return recommendations


if __name__ == "__main__":
    analyze_current_opportunities()

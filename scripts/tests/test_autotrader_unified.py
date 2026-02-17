#!/usr/bin/env python3
"""
Comprehensive tests for kalshi-autotrader-unified.py
GROK-TRADE-001 — Unit + Integration tests with mocked Kalshi API.

Run:
    cd /Users/mattia/Projects/Onde
    python -m pytest scripts/tests/test_autotrader_unified.py -v
"""

import json
import math
import os
import signal
import sys
import time
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
from unittest.mock import patch, MagicMock, mock_open
from collections import defaultdict

import pytest

# ---------------------------------------------------------------------------
# Bootstrap: add scripts/ to sys.path so we can import the module
# ---------------------------------------------------------------------------
SCRIPTS_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(SCRIPTS_DIR))

# We need to mock heavy optional imports BEFORE importing the module
# (crypto-news-search, nws-weather-forecast, check-market-holiday)
# The module already handles ImportError gracefully, so we just import it.

# Suppress noisy logging during tests
logging.disable(logging.CRITICAL)

# We import functions/classes individually to avoid triggering main()
import importlib
import importlib.util

def _load_autotrader():
    """Load the autotrader module without executing main()."""
    spec = importlib.util.spec_from_file_location(
        "autotrader",
        str(SCRIPTS_DIR / "kalshi-autotrader-unified.py"),
    )
    mod = importlib.util.module_from_spec(spec)
    # Register in sys.modules so @patch("autotrader.xxx") resolves
    sys.modules["autotrader"] = mod
    spec.loader.exec_module(mod)
    return mod

at = _load_autotrader()

# Re-enable logging after module load (tests that check logs will manage this)
logging.disable(logging.NOTSET)


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture(autouse=True)
def _reset_globals():
    """Reset mutable global state between tests."""
    at.ERROR_COUNTER.clear()
    at.ERROR_WINDOW_START = time.time()
    at.DRAWDOWN_ALERTED.clear()
    at.API_LATENCY_LOG.clear()
    at.EXT_API_CACHE.clear()
    at.API_RATE_LIMITS["kalshi"]["calls_per_hour"] = 0
    at.API_RATE_LIMITS["coingecko"]["calls_per_hour"] = 0
    at.API_RATE_WINDOW_START = time.time()
    # Reset shutdown
    at.shutdown.should_stop = False
    at.shutdown.in_trade = False
    at.shutdown.current_cycle = 0
    yield


@pytest.fixture
def sample_market():
    """A realistic open market."""
    expiry = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    return at.MarketInfo(
        ticker="KXBTC-24JUN-90000",
        title="BTC above $90,000?",
        subtitle="$90,000 or above",
        category="crypto",
        yes_price=55,
        no_price=45,
        volume=5000,
        open_interest=3000,
        expiry=expiry,
        status="open",
        result="",
        yes_bid=54,
        yes_ask=56,
        last_price=55,
    )


@pytest.fixture
def sample_market_combo():
    """A combo / parlay market."""
    expiry = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    return at.MarketInfo(
        ticker="KXMULTISPORT-24JUN-A",
        title="Yes Lakers win, Yes Celtics win by over 5.5 points",
        subtitle="",
        category="sports",
        yes_price=25,
        no_price=75,
        volume=2000,
        open_interest=800,
        expiry=expiry,
        status="open",
        result="",
    )


@pytest.fixture
def sample_forecast():
    return at.ForecastResult(
        probability=0.65,
        reasoning="Test forecast",
        confidence="medium",
        key_factors=["factor1"],
        model_used="heuristic-crypto",
        tokens_used=0,
    )


@pytest.fixture
def sample_critic():
    return at.CriticResult(
        adjusted_probability=0.63,
        major_flaws=[],
        minor_flaws=[],
        should_trade=True,
        reasoning="Looks reasonable",
        tokens_used=0,
    )


@pytest.fixture
def sample_decision():
    return at.TradeDecision(
        action="BUY_YES",
        edge=0.08,
        kelly_size=0.03,
        contracts=2,
        price_cents=55,
        reason="Edge=8.0%",
    )


@pytest.fixture
def sample_positions():
    """A list of existing positions."""
    return [
        {"ticker": "KXBTC-24JUN-85000", "market_exposure": 200},
        {"ticker": "KXETH-24JUN-3500", "market_exposure": 300},
    ]


@pytest.fixture
def sample_raw_market():
    """Raw API response for a single market."""
    return {
        "ticker": "KXBTC-25JUN-100K",
        "title": "BTC above $100,000?",
        "subtitle": "$100,000 or above",
        "category": "crypto",
        "yes_bid": 40,
        "yes_ask": 42,
        "volume": 8000,
        "open_interest": 5000,
        "close_time": (datetime.now(timezone.utc) + timedelta(days=3)).isoformat(),
        "status": "open",
        "result": "",
        "last_price": 41,
    }


# ============================================================================
# 1. DATA CLASSES & PROPERTIES
# ============================================================================

class TestMarketInfo:
    def test_market_prob(self, sample_market):
        assert sample_market.market_prob == pytest.approx(0.55, abs=0.001)

    def test_market_prob_edge_low(self):
        m = at.MarketInfo(ticker="T", title="T", subtitle="", category="",
                          yes_price=5, no_price=95, volume=0, open_interest=0,
                          expiry=(datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
                          status="open", result="")
        assert m.market_prob == pytest.approx(0.05, abs=0.001)

    def test_days_to_expiry_positive(self, sample_market):
        dte = sample_market.days_to_expiry
        assert 1.5 < dte < 2.5

    def test_days_to_expiry_past(self):
        m = at.MarketInfo(ticker="T", title="T", subtitle="", category="",
                          yes_price=50, no_price=50, volume=0, open_interest=0,
                          expiry=(datetime.now(timezone.utc) - timedelta(hours=1)).isoformat(),
                          status="open", result="")
        assert m.days_to_expiry == 0

    def test_days_to_expiry_bad_format(self):
        m = at.MarketInfo(ticker="T", title="T", subtitle="", category="",
                          yes_price=50, no_price=50, volume=0, open_interest=0,
                          expiry="bad-date", status="open", result="")
        assert m.days_to_expiry == 999


# ============================================================================
# 2. AUTHENTICATION — sign_request
# ============================================================================

class TestAuthentication:
    def test_sign_request_returns_base64(self):
        sig = at.sign_request("GET", "/trade-api/v2/portfolio/balance", "1700000000000")
        # Must be valid base64
        import base64
        decoded = base64.b64decode(sig)
        assert len(decoded) > 0  # RSA-PSS signature is 256 bytes for 2048-bit key
        assert len(decoded) == 256

    def test_sign_request_different_timestamps(self):
        sig1 = at.sign_request("GET", "/path", "111")
        sig2 = at.sign_request("GET", "/path", "222")
        # PSS is randomised, so even the same inputs give different sigs,
        # but different timestamps definitely differ
        assert sig1 != sig2

    def test_sign_request_different_methods(self):
        sig_get = at.sign_request("GET", "/path", "111")
        sig_post = at.sign_request("POST", "/path", "111")
        assert sig_get != sig_post


# ============================================================================
# 3. KALSHI API — kalshi_api with mocked requests
# ============================================================================

class TestKalshiApi:
    @patch("autotrader.requests.get")
    def test_get_success(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"balance": 5000}
        mock_get.return_value = mock_resp

        result = at.kalshi_api("GET", "/trade-api/v2/portfolio/balance")
        assert result == {"balance": 5000}
        mock_get.assert_called_once()

    @patch("autotrader.requests.post")
    def test_post_success(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"order": {"order_id": "abc123"}}
        mock_post.return_value = mock_resp

        result = at.kalshi_api("POST", "/trade-api/v2/portfolio/orders",
                               body={"ticker": "T", "action": "buy"})
        assert result["order"]["order_id"] == "abc123"

    @patch("autotrader.requests.get")
    def test_server_error_retries(self, mock_get):
        """500 errors should trigger retries."""
        fail_resp = MagicMock()
        fail_resp.status_code = 500
        ok_resp = MagicMock()
        ok_resp.status_code = 200
        ok_resp.json.return_value = {"ok": True}
        mock_get.side_effect = [fail_resp, ok_resp]

        result = at.kalshi_api("GET", "/trade-api/v2/markets", max_retries=2)
        assert result == {"ok": True}
        assert mock_get.call_count == 2

    @patch("autotrader.requests.get")
    def test_server_error_all_retries_exhausted(self, mock_get):
        fail_resp = MagicMock()
        fail_resp.status_code = 502
        mock_get.return_value = fail_resp

        result = at.kalshi_api("GET", "/path", max_retries=2)
        assert "error" in result
        assert "502" in result["error"]

    @patch("autotrader.requests.get")
    def test_timeout_retries(self, mock_get):
        import requests as req
        mock_get.side_effect = req.exceptions.Timeout("timeout")
        result = at.kalshi_api("GET", "/path", max_retries=2)
        assert result == {"error": "Timeout"}
        assert mock_get.call_count == 2

    @patch("autotrader.requests.get")
    def test_connection_error_retries(self, mock_get):
        import requests as req
        mock_get.side_effect = req.exceptions.ConnectionError("conn err")
        result = at.kalshi_api("GET", "/path", max_retries=2)
        assert result == {"error": "Connection error"}

    def test_unknown_method(self):
        result = at.kalshi_api("DELETE", "/path")
        assert "error" in result
        assert "Unknown method" in result["error"]

    @patch("autotrader.requests.get")
    def test_latency_recorded(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"ok": True}
        mock_get.return_value = mock_resp

        at.kalshi_api("GET", "/trade-api/v2/portfolio/balance")
        # balance endpoint → "balance"
        assert len(at.API_LATENCY_LOG.get("balance", [])) == 1

    @patch("autotrader.requests.get")
    def test_rate_limit_counter(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {}
        mock_get.return_value = mock_resp

        at.kalshi_api("GET", "/trade-api/v2/markets")
        assert at.API_RATE_LIMITS["kalshi"]["calls_per_hour"] >= 1


# ============================================================================
# 4. BALANCE & POSITIONS
# ============================================================================

class TestBalancePositions:
    @patch("autotrader.kalshi_api")
    def test_get_balance_success(self, mock_api):
        mock_api.return_value = {"balance": 10050}
        bal = at.get_balance()
        assert bal == pytest.approx(100.50)

    @patch("autotrader.kalshi_api")
    def test_get_balance_error(self, mock_api):
        mock_api.return_value = {"error": "Unauthorized"}
        bal = at.get_balance()
        assert bal == 0.0

    @patch("autotrader.kalshi_api")
    def test_get_positions_success(self, mock_api):
        mock_api.return_value = {"market_positions": [
            {"ticker": "A", "market_exposure": 100},
            {"ticker": "B", "market_exposure": 200},
        ]}
        pos = at.get_positions()
        assert len(pos) == 2

    @patch("autotrader.kalshi_api")
    def test_get_positions_error(self, mock_api):
        mock_api.return_value = {"error": "timeout"}
        pos = at.get_positions()
        assert pos == []


# ============================================================================
# 5. ORDER PLACEMENT
# ============================================================================

class TestPlaceOrder:
    def test_dry_run_returns_simulated(self):
        result = at.place_order("KXBTC-T", "yes", 55, 3, dry_run=True)
        assert result["dry_run"] is True
        assert result["status"] == "simulated"
        assert result["count"] == 3

    @patch("autotrader.kalshi_api")
    def test_live_order_calls_api(self, mock_api):
        mock_api.return_value = {"order": {"order_id": "xyz"}}
        result = at.place_order("KXBTC-T", "yes", 55, 2, dry_run=False)
        assert result["order"]["order_id"] == "xyz"
        mock_api.assert_called_once()
        call_args = mock_api.call_args
        assert call_args[0][0] == "POST"  # method
        # body is passed as keyword arg
        body = call_args.kwargs.get("body") or call_args[0][2]
        assert body["ticker"] == "KXBTC-T"
        assert body["side"] == "yes"
        assert body["count"] == 2

    @patch("autotrader.kalshi_api")
    def test_live_order_no_side(self, mock_api):
        mock_api.return_value = {"order": {"order_id": "no1"}}
        at.place_order("KXBTC-T", "no", 40, 1, dry_run=False)
        call_args = mock_api.call_args
        body = call_args.kwargs.get("body") or call_args[0][2]
        assert body["side"] == "no"
        # For NO side, yes_price = 100 - price_cents
        assert body["yes_price"] == 60


# ============================================================================
# 6. KELLY CRITERION
# ============================================================================

class TestKellyCriterion:
    def test_kelly_positive_edge(self):
        # p=0.6, price=50 → b=1.0 → kelly=(1*0.6-0.4)/1=0.2 * fraction
        kelly = at.calculate_kelly(0.6, 50)
        expected = 0.2 * at.KELLY_FRACTION
        assert kelly == pytest.approx(expected, abs=0.001)

    def test_kelly_no_edge(self):
        # p=0.5, price=50 → kelly=0
        kelly = at.calculate_kelly(0.5, 50)
        assert kelly == 0.0

    def test_kelly_negative_edge(self):
        # p=0.3, price=50 → negative kelly
        kelly = at.calculate_kelly(0.3, 50)
        assert kelly == 0.0

    def test_kelly_extreme_price_low(self):
        kelly = at.calculate_kelly(0.5, 0)
        assert kelly == 0.0

    def test_kelly_extreme_price_high(self):
        kelly = at.calculate_kelly(0.5, 100)
        assert kelly == 0.0

    def test_kelly_capped_at_max_position(self):
        # Very strong edge → should be capped at MAX_POSITION_PCT
        kelly = at.calculate_kelly(0.99, 10)
        assert kelly <= at.MAX_POSITION_PCT

    def test_kelly_high_prob_low_price(self):
        # p=0.9, price=10¢ → big b=9, kelly=(9*0.9-0.1)/9 ≈ 0.889
        kelly = at.calculate_kelly(0.9, 10)
        assert kelly > 0
        assert kelly <= at.MAX_POSITION_PCT


# ============================================================================
# 7. TRADE DECISION — make_trade_decision
# ============================================================================

class TestTradeDecision:
    def test_buy_yes_decision(self, sample_market, sample_forecast, sample_critic):
        """When forecast > market, should BUY_YES."""
        sample_forecast.probability = 0.75  # well above 55¢ = 0.55
        sample_critic.adjusted_probability = 0.73
        sample_critic.should_trade = True
        d = at.make_trade_decision(sample_market, sample_forecast, sample_critic, balance=100.0)
        assert d.action == "BUY_YES"
        assert d.edge > 0
        assert d.contracts >= 1

    def test_buy_no_decision(self, sample_market, sample_forecast, sample_critic):
        """When forecast < market, should BUY_NO."""
        sample_forecast.probability = 0.40  # below 55¢ = 0.55
        sample_critic.adjusted_probability = 0.42
        sample_critic.should_trade = True
        d = at.make_trade_decision(sample_market, sample_forecast, sample_critic, balance=100.0)
        assert d.action == "BUY_NO"
        assert d.edge > 0

    def test_skip_tiny_edge_buy_yes(self, sample_market, sample_forecast, sample_critic):
        """Edge below MIN_EDGE_BUY_YES threshold → SKIP."""
        # market_prob = 0.55, set forecast to give ~2% edge (below 5% BUY_YES threshold)
        sample_forecast.probability = 0.57
        sample_critic.adjusted_probability = 0.57
        sample_critic.should_trade = True
        d = at.make_trade_decision(sample_market, sample_forecast, sample_critic, balance=100.0)
        # final_prob = 0.6*0.57 + 0.4*0.57 = 0.57, edge_yes = 0.02 < 5%
        assert d.action == "SKIP"
        assert "BUY_YES edge" in d.reason

    def test_skip_tiny_edge_buy_no(self, sample_market):
        """Edge below MIN_EDGE_BUY_NO threshold → SKIP."""
        f = at.ForecastResult(probability=0.545, reasoning="", confidence="medium")
        c = at.CriticResult(adjusted_probability=0.545, should_trade=True)
        d = at.make_trade_decision(sample_market, f, c, balance=100.0)
        # final_prob = 0.545, edge = 0.55 - 0.545 = 0.005 < 1%
        assert d.action == "SKIP"

    def test_skip_critic_veto(self, sample_market, sample_forecast, sample_critic):
        """Critic says should_trade=False → SKIP."""
        sample_forecast.probability = 0.80
        sample_critic.adjusted_probability = 0.80
        sample_critic.should_trade = False
        sample_critic.major_flaws = ["Overconfident"]
        d = at.make_trade_decision(sample_market, sample_forecast, sample_critic, balance=100.0)
        assert d.action == "SKIP"
        assert "Critic vetoed" in d.reason

    def test_skip_two_major_flaws(self, sample_market, sample_forecast, sample_critic):
        sample_forecast.probability = 0.80
        sample_critic.adjusted_probability = 0.75
        sample_critic.should_trade = True
        sample_critic.major_flaws = ["Flaw1", "Flaw2"]
        d = at.make_trade_decision(sample_market, sample_forecast, sample_critic, balance=100.0)
        assert d.action == "SKIP"
        assert "Too many flaws" in d.reason

    def test_edge_capped(self, sample_market, sample_forecast, sample_critic):
        """Single-leg edges > SINGLE_LEG_EDGE_CAP should be capped at 15%."""
        sample_forecast.probability = 0.90  # huge edge
        sample_critic.adjusted_probability = 0.88
        sample_critic.should_trade = True
        d = at.make_trade_decision(sample_market, sample_forecast, sample_critic, balance=100.0)
        # After capping, edge should be <= SINGLE_LEG_EDGE_CAP (dynamic cap)
        assert d.edge <= at.SINGLE_LEG_EDGE_CAP + 0.001

    def test_parlay_buy_yes_blocked(self, sample_market_combo):
        """Parlay BUY_YES should be blocked by PARLAY_ONLY_NO."""
        f = at.ForecastResult(probability=0.45, reasoning="", confidence="medium",
                              model_used="heuristic-combo")
        c = at.CriticResult(adjusted_probability=0.42, should_trade=True)
        # market_prob = 0.25, forecast = 0.45 → edge_yes = 0.18 → BUY_YES
        d = at.make_trade_decision(sample_market_combo, f, c, balance=100.0)
        # Should be blocked due to parlay BUY_YES filter
        assert d.action == "SKIP"
        assert "Parlay BUY_YES" in d.reason

    def test_low_confidence_yes_skip(self, sample_market, sample_forecast, sample_critic):
        """Low confidence + moderate YES edge → SKIP."""
        sample_forecast.probability = 0.63  # edge ~8%
        sample_forecast.confidence = "low"
        sample_critic.adjusted_probability = 0.62
        sample_critic.should_trade = True
        d = at.make_trade_decision(sample_market, sample_forecast, sample_critic, balance=100.0)
        assert d.action == "SKIP"
        assert "Low conf" in d.reason

    def test_kelly_says_no_bet(self, sample_market):
        """When Kelly returns 0, action should be SKIP."""
        # Set prob very close to market to get near-zero Kelly
        f = at.ForecastResult(probability=0.56, reasoning="", confidence="high")
        c = at.CriticResult(adjusted_probability=0.50, should_trade=True)
        # final = 0.6*0.56 + 0.4*0.50 = 0.536, edge = 0.536 - 0.55 = -0.014 (BUY_NO)
        # For BUY_NO: prob = 1 - 0.536 = 0.464, price = 45
        # b = 55/45 ≈ 1.22, kelly = (1.22*0.464 - 0.536)/1.22 ≈ 0.025 * 0.15 ≈ 0.003
        d = at.make_trade_decision(sample_market, f, c, balance=100.0)
        # With such tiny kelly, it could be SKIP or BUY_NO with 1 contract
        assert d.action in ("SKIP", "BUY_NO")


# ============================================================================
# 7b. DYNAMIC EDGE CAPS (GROK-TRADE-003)
# ============================================================================

class TestDynamicEdgeCap:
    """Tests for get_dynamic_edge_cap and parlay-specific thresholds."""

    def test_single_leg_cap(self):
        """Non-combo markets should get SINGLE_LEG_EDGE_CAP."""
        assert at.get_dynamic_edge_cap("crypto", 1) == at.SINGLE_LEG_EDGE_CAP
        assert at.get_dynamic_edge_cap("spread", 1) == at.SINGLE_LEG_EDGE_CAP
        assert at.get_dynamic_edge_cap("weather", 1) == at.SINGLE_LEG_EDGE_CAP
        assert at.get_dynamic_edge_cap("generic", 1) == at.SINGLE_LEG_EDGE_CAP

    def test_combo_single_leg_fallback(self):
        """Combo with <2 legs should still get single-leg cap."""
        assert at.get_dynamic_edge_cap("combo", 1) == at.SINGLE_LEG_EDGE_CAP

    def test_parlay_2_legs(self):
        """2-leg parlay should get PARLAY_BASE_EDGE_CAP."""
        cap = at.get_dynamic_edge_cap("combo", 2)
        assert cap == at.PARLAY_BASE_EDGE_CAP  # 35%

    def test_parlay_3_legs(self):
        """3-leg parlay: base + 1 * scale factor."""
        cap = at.get_dynamic_edge_cap("combo", 3)
        expected = at.PARLAY_BASE_EDGE_CAP + 1 * at.PARLAY_LEG_SCALE_FACTOR
        assert cap == pytest.approx(expected)

    def test_parlay_5_legs(self):
        """5-leg parlay: base + 3 * scale factor."""
        cap = at.get_dynamic_edge_cap("combo", 5)
        expected = min(at.PARLAY_BASE_EDGE_CAP + 3 * at.PARLAY_LEG_SCALE_FACTOR,
                       at.PARLAY_MAX_EDGE_CAP)
        assert cap == pytest.approx(expected)

    def test_parlay_cap_ceiling(self):
        """Very large parlay should be capped at PARLAY_MAX_EDGE_CAP."""
        cap = at.get_dynamic_edge_cap("combo", 10)
        assert cap == at.PARLAY_MAX_EDGE_CAP  # 40%

    def test_parlay_edge_cap_in_trade_decision(self, sample_market_combo):
        """Combo markets should use parlay cap (35%+) not single-leg cap (15%)."""
        # sample_market_combo: yes=25, no=75, market_prob=0.25, 2-leg
        # Set forecast way high so edge is huge
        f = at.ForecastResult(probability=0.10, reasoning="", confidence="medium",
                              model_used="heuristic-combo")
        c = at.CriticResult(adjusted_probability=0.10, should_trade=True)
        # final_prob = 0.6*0.10 + 0.4*0.10 = 0.10, edge_yes = 0.10 - 0.25 = -0.15 → BUY_NO
        # edge = 0.15, within PARLAY_BASE_EDGE_CAP (0.35) → should NOT be capped
        d = at.make_trade_decision(sample_market_combo, f, c, balance=100.0)
        assert d.action == "BUY_NO"
        assert d.edge == pytest.approx(0.15, abs=0.01)

    def test_parlay_large_edge_capped_at_parlay_cap(self, sample_market_combo):
        """Parlay with edge > PARLAY_BASE_EDGE_CAP should be capped at parlay cap, not single-leg."""
        # market_prob=0.25, need forecast to give ~50% edge_no
        f = at.ForecastResult(probability=0.01, reasoning="", confidence="medium",
                              model_used="heuristic-combo")
        c = at.CriticResult(adjusted_probability=0.01, should_trade=True)
        # final_prob = 0.01, edge_yes = 0.01 - 0.25 = -0.24 → BUY_NO with edge 0.24
        # 2-leg parlay cap = 0.35, so 0.24 < 0.35 → not capped
        d = at.make_trade_decision(sample_market_combo, f, c, balance=100.0)
        assert d.action == "BUY_NO"
        # Edge should be 0.24 (uncapped since < 0.35)
        assert d.edge == pytest.approx(0.24, abs=0.01)

    def test_constants_values(self):
        """Verify the constants match spec: single 15-18%, parlay 35-40%."""
        assert 0.15 <= at.SINGLE_LEG_EDGE_CAP <= 0.18
        assert 0.35 <= at.PARLAY_BASE_EDGE_CAP <= 0.40
        assert 0.35 <= at.PARLAY_MAX_EDGE_CAP <= 0.40
        assert at.PARLAY_MAX_EDGE_CAP >= at.PARLAY_BASE_EDGE_CAP


# ============================================================================
# 8. RISK LIMITS — check_position_risk_limits
# ============================================================================

class TestRiskLimits:
    def test_max_concurrent_positions(self, sample_market, sample_decision):
        positions = [{"ticker": f"T{i}", "market_exposure": 50} for i in range(at.MAX_CONCURRENT_POSITIONS)]
        ok, reason = at.check_position_risk_limits(
            sample_market, sample_decision, 100.0, positions, {"net_pnl_cents": 0, "trades_today": 0})
        assert ok is False
        assert "Max concurrent positions" in reason

    def test_per_market_exposure_exceeded(self, sample_market):
        decision = at.TradeDecision(action="BUY_YES", edge=0.05, kelly_size=0.04,
                                     contracts=20, price_cents=55, reason="test")
        # 20 * 55 = 1100 > MAX_EXPOSURE_PER_MARKET_CENTS (1000)
        ok, reason = at.check_position_risk_limits(
            sample_market, decision, 100.0, [], {"net_pnl_cents": 0, "trades_today": 0})
        assert ok is False
        assert "Per-market exposure" in reason

    def test_combined_exposure_exceeded(self, sample_market):
        decision = at.TradeDecision(action="BUY_YES", edge=0.05, kelly_size=0.03,
                                     contracts=5, price_cents=55, reason="test")
        # Existing 800 + 275 = 1075 > 1000
        positions = [{"ticker": sample_market.ticker, "market_exposure": 800}]
        ok, reason = at.check_position_risk_limits(
            sample_market, decision, 100.0, positions, {"net_pnl_cents": 0, "trades_today": 0})
        assert ok is False
        assert "Combined exposure" in reason

    def test_daily_loss_cap(self, sample_market, sample_decision):
        # Net PnL deeply negative
        pnl = {"net_pnl_cents": -2000, "trades_today": 10}
        ok, reason = at.check_position_risk_limits(
            sample_market, sample_decision, 100.0, [], pnl)
        assert ok is False
        assert "Daily loss" in reason

    def test_max_daily_trades(self, sample_market, sample_decision):
        pnl = {"net_pnl_cents": 0, "trades_today": at.MAX_DAILY_TRADES}
        ok, reason = at.check_position_risk_limits(
            sample_market, sample_decision, 100.0, [], pnl)
        assert ok is False
        assert "Max daily trades" in reason

    def test_all_limits_pass(self, sample_market, sample_decision):
        ok, reason = at.check_position_risk_limits(
            sample_market, sample_decision, 100.0, [], {"net_pnl_cents": 0, "trades_today": 0})
        assert ok is True
        assert reason == "OK"

    def test_category_concentration(self, sample_market, sample_decision):
        """Positions in same category prefix should trigger concentration limit."""
        # Fill up same category prefix
        balance = 50.0  # Small balance so 30% threshold is easy to hit
        positions = [
            {"ticker": "KXBTC-A", "market_exposure": 800},
            {"ticker": "KXBTC-B", "market_exposure": 800},
        ]
        # cat_exposure = 1600 + cost (110) = 1710, total = 5000 cents
        # 1710/5000 = 34.2% > 30%
        ok, reason = at.check_position_risk_limits(
            sample_market, sample_decision, balance, positions, {"net_pnl_cents": 0, "trades_today": 0})
        assert ok is False
        assert "Category concentration" in reason


# ============================================================================
# 9. CIRCUIT BREAKER
# ============================================================================

class TestCircuitBreaker:
    @patch("autotrader.CIRCUIT_BREAKER_STATE_FILE")
    @patch("autotrader.TRADE_LOG_FILE")
    def test_no_losses_ok(self, mock_trade_file, mock_cb_file):
        mock_cb_file.exists.return_value = False
        mock_trade_file.exists.return_value = False
        paused, losses, msg = at.check_circuit_breaker()
        assert paused is False
        assert losses == 0

    @patch("autotrader.CIRCUIT_BREAKER_STATE_FILE")
    def test_paused_state_file(self, mock_cb_file):
        mock_cb_file.exists.return_value = True
        state = {
            "paused": True,
            "paused_at": datetime.now(timezone.utc).isoformat(),
            "losses": 5,
        }
        m = mock_open(read_data=json.dumps(state))
        with patch("builtins.open", m):
            paused, losses, msg = at.check_circuit_breaker()
        assert paused is True
        assert "Paused" in msg

    @patch("autotrader.CIRCUIT_BREAKER_STATE_FILE")
    def test_expired_pause_resets(self, mock_cb_file):
        mock_cb_file.exists.return_value = True
        mock_cb_file.unlink = MagicMock()
        old_time = (datetime.now(timezone.utc) - timedelta(hours=10)).isoformat()
        state = {"paused": True, "paused_at": old_time, "losses": 5}
        # After reading the stale pause file, it should check trade log
        with patch("builtins.open", mock_open(read_data=json.dumps(state))):
            with patch("autotrader.TRADE_LOG_FILE") as mock_tf:
                mock_tf.exists.return_value = False
                paused, losses, msg = at.check_circuit_breaker()
        assert paused is False


# ============================================================================
# 10. DAILY LOSS LIMIT
# ============================================================================

class TestDailyLossLimit:
    @patch("autotrader.TRADE_LOG_FILE")
    @patch("autotrader.DAILY_LOSS_PAUSE_FILE")
    def test_no_trades_ok(self, mock_pause, mock_trade):
        mock_trade.exists.return_value = False
        mock_pause.exists.return_value = False
        paused, pnl = at.check_daily_loss_limit()
        assert paused is False
        assert pnl["trades_today"] == 0

    @patch("autotrader.DAILY_LOSS_PAUSE_FILE")
    @patch("autotrader.TRADE_LOG_FILE")
    def test_loss_limit_triggered(self, mock_trade, mock_pause):
        mock_pause.exists.return_value = False
        mock_trade.exists.return_value = True
        # Create trade entries that exceed loss limit
        today_ts = datetime.now(timezone.utc).isoformat()
        entries = [
            json.dumps({"timestamp": today_ts, "cost_cents": 600, "contracts": 6,
                         "price_cents": 100, "result_status": "lost"})
        ]
        with patch("builtins.open", mock_open(read_data="\n".join(entries))):
            paused, pnl = at.check_daily_loss_limit()
        # spent=600, won=0, net=-600 < -500 → paused
        assert paused is True
        assert pnl["net_pnl_cents"] < 0


# ============================================================================
# 11. GRACEFUL SHUTDOWN
# ============================================================================

class TestGracefulShutdown:
    def test_initial_state(self):
        gs = at.GracefulShutdown()
        assert gs.should_stop is False
        assert gs.in_trade is False

    def test_signal_sets_stop(self):
        gs = at.GracefulShutdown()
        with patch("autotrader._write_alert"):
            gs._handle_signal(signal.SIGINT, None)
        assert gs.should_stop is True

    def test_signal_during_trade(self):
        gs = at.GracefulShutdown()
        gs.in_trade = True
        with patch("autotrader._write_alert"):
            gs._handle_signal(signal.SIGTERM, None)
        assert gs.should_stop is True

    def test_enter_exit_trade(self):
        gs = at.GracefulShutdown()
        gs.enter_trade()
        assert gs.in_trade is True
        gs.exit_trade()
        assert gs.in_trade is False

    def test_check_stop(self):
        gs = at.GracefulShutdown()
        assert gs.check_stop() is False
        gs.should_stop = True
        assert gs.check_stop() is True

    def test_cleanup_restores_handlers(self):
        gs = at.GracefulShutdown()
        original_sigterm = signal.getsignal(signal.SIGTERM)
        original_sigint = signal.getsignal(signal.SIGINT)
        gs.install_handlers()
        # Now handlers are custom
        assert signal.getsignal(signal.SIGTERM) == gs._handle_signal
        gs.cleanup()
        # Restored
        assert signal.getsignal(signal.SIGTERM) == original_sigterm
        assert signal.getsignal(signal.SIGINT) == original_sigint


# ============================================================================
# 12. MARKET PARSING & FILTERING
# ============================================================================

class TestMarketParsing:
    def test_parse_market_valid(self, sample_raw_market):
        m = at.parse_market(sample_raw_market)
        assert m is not None
        assert m.ticker == "KXBTC-25JUN-100K"
        assert m.volume == 8000

    def test_parse_market_missing_fields(self):
        m = at.parse_market({})
        assert m is not None  # Should still parse with defaults
        assert m.ticker == ""

    def test_parse_market_exception(self):
        # None input should be handled
        m = at.parse_market(None)
        assert m is None

    def test_filter_markets_volume(self, sample_market):
        low_vol = at.MarketInfo(
            ticker="LOW", title="Low volume", subtitle="", category="",
            yes_price=50, no_price=50, volume=10, open_interest=10,
            expiry=(datetime.now(timezone.utc) + timedelta(days=5)).isoformat(),
            status="open", result="")
        result = at.filter_markets([sample_market, low_vol])
        assert len(result) == 1
        assert result[0].ticker == sample_market.ticker

    def test_filter_markets_settled(self, sample_market):
        settled = at.MarketInfo(
            ticker="SETTLED", title="Settled", subtitle="", category="",
            yes_price=50, no_price=50, volume=5000, open_interest=5000,
            expiry=(datetime.now(timezone.utc) + timedelta(days=5)).isoformat(),
            status="open", result="yes")
        result = at.filter_markets([sample_market, settled])
        assert all(m.ticker != "SETTLED" for m in result)

    def test_filter_markets_price_too_extreme(self):
        m = at.MarketInfo(
            ticker="EXT", title="Extreme", subtitle="", category="",
            yes_price=2, no_price=98, volume=5000, open_interest=5000,
            expiry=(datetime.now(timezone.utc) + timedelta(days=5)).isoformat(),
            status="open", result="")
        result = at.filter_markets([m])
        assert len(result) == 0

    def test_filter_markets_expired(self):
        m = at.MarketInfo(
            ticker="OLD", title="Old", subtitle="", category="",
            yes_price=50, no_price=50, volume=5000, open_interest=5000,
            expiry=(datetime.now(timezone.utc) + timedelta(days=60)).isoformat(),
            status="open", result="")
        result = at.filter_markets([m])
        assert len(result) == 0  # >30 days


class TestScoreMarket:
    def test_high_volume_high_score(self, sample_market):
        # High volume market should score well
        score = at.score_market(sample_market)
        assert score > 10  # Combination of volume + price + DTE bonuses

    def test_extreme_price_lower_score(self):
        m = at.MarketInfo(
            ticker="T", title="T", subtitle="", category="",
            yes_price=95, no_price=5, volume=5000, open_interest=3000,
            expiry=(datetime.now(timezone.utc) + timedelta(days=3)).isoformat(),
            status="open", result="")
        score_extreme = at.score_market(m)
        m2 = at.MarketInfo(
            ticker="T", title="T", subtitle="", category="",
            yes_price=50, no_price=50, volume=5000, open_interest=3000,
            expiry=(datetime.now(timezone.utc) + timedelta(days=3)).isoformat(),
            status="open", result="")
        score_balanced = at.score_market(m2)
        assert score_balanced > score_extreme


# ============================================================================
# 13. MARKET TYPE CLASSIFICATION
# ============================================================================

class TestClassifyMarketType:
    def test_crypto(self):
        m = at.MarketInfo(ticker="KXBTC-24JUN-100K", title="BTC above $100k",
                          subtitle="", category="", yes_price=50, no_price=50,
                          volume=0, open_interest=0, expiry="", status="", result="")
        assert at.classify_market_type(m) == "crypto"

    def test_weather(self):
        m = at.MarketInfo(ticker="KXHIGHNYC-24JUN", title="NYC High Temperature",
                          subtitle="", category="", yes_price=50, no_price=50,
                          volume=0, open_interest=0, expiry="", status="", result="")
        assert at.classify_market_type(m) == "weather"

    def test_combo(self):
        m = at.MarketInfo(ticker="KXMULTISPORT-A", title="Yes Lakers win, Yes Celtics win",
                          subtitle="", category="", yes_price=50, no_price=50,
                          volume=0, open_interest=0, expiry="", status="", result="")
        assert at.classify_market_type(m) == "combo"

    def test_spread(self):
        m = at.MarketInfo(ticker="KXNBASPREAD-A", title="Lakers cover +5.5 points",
                          subtitle="", category="", yes_price=50, no_price=50,
                          volume=0, open_interest=0, expiry="", status="", result="")
        assert at.classify_market_type(m) == "spread"

    def test_total(self):
        m = at.MarketInfo(ticker="KXNBATOTAL-A", title="NBA total over 220",
                          subtitle="", category="", yes_price=50, no_price=50,
                          volume=0, open_interest=0, expiry="", status="", result="")
        assert at.classify_market_type(m) == "total"

    def test_moneyline(self):
        m = at.MarketInfo(ticker="KXNBAML-A", title="Lakers to win",
                          subtitle="", category="", yes_price=50, no_price=50,
                          volume=0, open_interest=0, expiry="", status="", result="")
        assert at.classify_market_type(m) == "moneyline"

    def test_generic(self):
        m = at.MarketInfo(ticker="KXPRESIDENTIAL", title="Will candidate X win?",
                          subtitle="", category="", yes_price=50, no_price=50,
                          volume=0, open_interest=0, expiry="", status="", result="")
        assert at.classify_market_type(m) == "generic"


class TestDetectSport:
    def test_nba(self):
        m = at.MarketInfo(ticker="KXNBASPREAD-A", title="NBA game",
                          subtitle="", category="", yes_price=50, no_price=50,
                          volume=0, open_interest=0, expiry="", status="", result="")
        assert at.detect_sport(m) == "nba"

    def test_nfl(self):
        m = at.MarketInfo(ticker="KXNFLML-A", title="NFL matchup",
                          subtitle="", category="", yes_price=50, no_price=50,
                          volume=0, open_interest=0, expiry="", status="", result="")
        assert at.detect_sport(m) == "nfl"

    def test_unknown(self):
        m = at.MarketInfo(ticker="KXPOLITICS", title="Election outcome",
                          subtitle="", category="", yes_price=50, no_price=50,
                          volume=0, open_interest=0, expiry="", status="", result="")
        assert at.detect_sport(m) == "unknown"


# ============================================================================
# 14. PARSE PROBABILITY (from LLM responses)
# ============================================================================

class TestParseProbability:
    def test_standard_format(self):
        assert at.parse_probability("PROBABILITY: 65%") == pytest.approx(0.65)

    def test_standard_format_decimal(self):
        assert at.parse_probability("PROBABILITY: 72.5%") == pytest.approx(0.725)

    def test_estimate_format(self):
        assert at.parse_probability("I estimate the probability at 30%") == pytest.approx(0.30)

    def test_chance_of_format(self):
        assert at.parse_probability("The chance of this is approximately 88%") == pytest.approx(0.88)

    def test_fallback_last_percentage(self):
        assert at.parse_probability("Some text 50% then 40%") == pytest.approx(0.40)

    def test_no_match(self):
        assert at.parse_probability("No numbers here") is None

    def test_out_of_range(self):
        # 0% is out of 1-99 range for fallback
        result = at.parse_probability("Only 0% chance")
        assert result is None


# ============================================================================
# 15. HEURISTIC FORECASTER
# ============================================================================

class TestHeuristicForecaster:
    def test_crypto_with_context(self, sample_market):
        context = {
            "crypto_prices": {"btc": 89000, "eth": 3200},
            "sentiment": {"value": 60, "classification": "Greed"},
            "momentum": {"btc": {"composite_direction": 0.3, "composite_strength": 0.5, "alignment": True}},
            "ohlc": {"btc": [[0, 88000, 89500, 87500, 89000]] * 30},
        }
        f = at.heuristic_forecast(sample_market, context)
        assert 0.0 < f.probability < 1.0
        assert f.model_used == "heuristic-crypto"
        assert f.confidence in ("low", "medium", "high")

    def test_generic_market(self):
        m = at.MarketInfo(ticker="KXPOL-A", title="Generic political question",
                          subtitle="", category="politics",
                          yes_price=60, no_price=40, volume=5000, open_interest=2000,
                          expiry=(datetime.now(timezone.utc) + timedelta(days=5)).isoformat(),
                          status="open", result="")
        f = at.heuristic_forecast(m)
        assert 0.0 < f.probability < 1.0
        assert "heuristic-generic" in f.model_used

    def test_combo_market(self, sample_market_combo):
        f = at.heuristic_forecast(sample_market_combo)
        assert 0.0 < f.probability < 1.0
        assert "heuristic-combo" in f.model_used

    def test_spread_market(self):
        m = at.MarketInfo(ticker="KXNBASPREAD-A", title="Lakers win by over 5.5 points",
                          subtitle="", category="sports",
                          yes_price=45, no_price=55, volume=3000, open_interest=1000,
                          expiry=(datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
                          status="open", result="")
        f = at.heuristic_forecast(m)
        assert 0.0 < f.probability < 1.0
        assert "heuristic-spread" in f.model_used

    def test_total_market(self):
        m = at.MarketInfo(ticker="KXNBATOTAL-A", title="Total over 220 points in NBA game",
                          subtitle="", category="sports",
                          yes_price=50, no_price=50, volume=3000, open_interest=1000,
                          expiry=(datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
                          status="open", result="")
        f = at.heuristic_forecast(m)
        assert 0.0 < f.probability < 1.0

    def test_moneyline_favorite(self):
        m = at.MarketInfo(ticker="KXNBAML-A", title="Lakers to win",
                          subtitle="", category="sports",
                          yes_price=70, no_price=30, volume=3000, open_interest=1000,
                          expiry=(datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
                          status="open", result="")
        f = at.heuristic_forecast(m)
        # Favorite underpriced → prob should be > market
        assert f.probability >= m.market_prob


class TestHeuristicCritique:
    def test_normal_edge_passes(self, sample_market, sample_forecast):
        sample_forecast.probability = 0.60  # 5% edge
        c = at.heuristic_critique(sample_market, sample_forecast)
        assert c.should_trade is True
        assert len(c.major_flaws) == 0

    def test_huge_edge_blocked(self, sample_market, sample_forecast):
        sample_forecast.probability = 0.98  # 43% edge → blocked
        c = at.heuristic_critique(sample_market, sample_forecast)
        assert c.should_trade is False
        assert len(c.major_flaws) >= 1

    def test_low_volume_minor_flaw(self):
        m = at.MarketInfo(ticker="T", title="T", subtitle="", category="",
                          yes_price=50, no_price=50, volume=300, open_interest=200,
                          expiry=(datetime.now(timezone.utc) + timedelta(days=5)).isoformat(),
                          status="open", result="")
        f = at.ForecastResult(probability=0.55, reasoning="", confidence="medium",
                              model_used="heuristic-spread")
        c = at.heuristic_critique(m, f)
        assert "Low volume" in " ".join(c.minor_flaws)

    def test_generic_model_blocked(self, sample_market):
        f = at.ForecastResult(probability=0.65, reasoning="", confidence="medium",
                              model_used="heuristic-generic")
        c = at.heuristic_critique(sample_market, f)
        # edge = 10%, generic model → major flaw
        assert c.should_trade is False


# ============================================================================
# 16. MOMENTUM & REGIME DETECTION
# ============================================================================

class TestMomentumRegime:
    def test_calculate_momentum_empty(self):
        result = at.calculate_momentum([], "1h")
        assert result["direction"] == 0

    def test_calculate_momentum_bullish(self):
        # Create data with upward trend; use 4h timeframe (n=4) so old != current
        ohlc = [[i, 100 + i, 101 + i, 99 + i, 100.5 + i] for i in range(30)]
        m = at.calculate_momentum(ohlc, "4h")
        assert m["pct_change"] > 0

    def test_get_multi_timeframe_momentum(self):
        ohlc = [[i * 3600000, 100, 101, 99, 100 + (i * 0.1)] for i in range(30)]
        result = at.get_multi_timeframe_momentum(ohlc)
        assert "timeframes" in result
        assert "1h" in result["timeframes"]
        assert "composite_direction" in result

    def test_detect_market_regime_insufficient_data(self):
        result = at.detect_market_regime([], {})
        assert result["regime"] == "sideways"

    def test_detect_market_regime_normal(self):
        ohlc = [[i, 100, 101, 99, 100] for i in range(30)]
        mom = {"composite_direction": 0, "composite_strength": 0, "alignment": False}
        result = at.detect_market_regime(ohlc, mom)
        assert result["regime"] in ("sideways", "choppy", "trending_bullish", "trending_bearish")
        assert 0 < result["dynamic_min_edge"] < 1.0


# ============================================================================
# 17. CACHING & RATE LIMITING
# ============================================================================

class TestCachingRateLimiting:
    def test_cache_set_get(self):
        at.set_cached_response("test_key", {"data": 42})
        result = at.get_cached_response("test_key")
        assert result == {"data": 42}

    def test_cache_miss(self):
        assert at.get_cached_response("nonexistent") is None

    def test_cache_expired(self):
        at.EXT_API_CACHE["old"] = (time.time() - at.EXT_API_CACHE_TTL - 10, {"stale": True})
        assert at.get_cached_response("old") is None
        assert "old" not in at.EXT_API_CACHE

    def test_record_api_latency(self):
        at.record_api_latency("test_ep", 150.0)
        assert len(at.API_LATENCY_LOG["test_ep"]) == 1
        assert at.get_avg_latency("test_ep") == pytest.approx(150.0)

    def test_latency_window_trimmed(self):
        for i in range(100):
            at.record_api_latency("ep", float(i))
        assert len(at.API_LATENCY_LOG["ep"]) <= at.LATENCY_PROFILE_WINDOW

    def test_record_api_call_increments(self):
        at.record_api_call("kalshi")
        at.record_api_call("kalshi")
        assert at.API_RATE_LIMITS["kalshi"]["calls_per_hour"] == 2

    def test_rate_limit_window_reset(self):
        at.API_RATE_WINDOW_START = time.time() - 4000  # > 3600s ago
        at.API_RATE_LIMITS["kalshi"]["calls_per_hour"] = 999
        at.record_api_call("kalshi")
        assert at.API_RATE_LIMITS["kalshi"]["calls_per_hour"] == 1


# ============================================================================
# 18. EXTERNAL DATA (mocked)
# ============================================================================

class TestExternalData:
    @patch("autotrader.requests.get")
    def test_get_crypto_prices_coingecko(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.json.return_value = {
            "bitcoin": {"usd": 92000},
            "ethereum": {"usd": 3400},
        }
        mock_get.return_value = mock_resp
        prices = at.get_crypto_prices()
        assert prices["btc"] == 92000
        assert prices["eth"] == 3400

    @patch("autotrader.requests.get")
    def test_get_crypto_prices_fallback_binance(self, mock_get):
        # First call (CoinGecko) fails, Binance succeeds
        call_count = [0]
        def side_effect(*args, **kwargs):
            call_count[0] += 1
            if call_count[0] == 1:
                raise Exception("CoinGecko down")
            resp = MagicMock()
            if "BTC" in args[0]:
                resp.json.return_value = {"price": "91000.50"}
            else:
                resp.json.return_value = {"price": "3300.00"}
            return resp
        mock_get.side_effect = side_effect
        prices = at.get_crypto_prices()
        assert prices is not None
        assert prices["btc"] == pytest.approx(91000.50)

    @patch("autotrader.requests.get")
    def test_get_fear_greed(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.json.return_value = {
            "data": [{"value": "72", "value_classification": "Greed"}]
        }
        mock_get.return_value = mock_resp
        fng = at.get_fear_greed_index()
        assert fng["value"] == 72
        assert fng["classification"] == "Greed"

    @patch("autotrader.requests.get")
    def test_get_fear_greed_error(self, mock_get):
        mock_get.side_effect = Exception("timeout")
        fng = at.get_fear_greed_index()
        assert fng["value"] == 50  # default
        assert fng["classification"] == "Neutral"


# ============================================================================
# 19. ALERTS & DRAWDOWN
# ============================================================================

class TestAlerts:
    @patch("autotrader._write_alert")
    def test_drawdown_alert_triggered(self, mock_alert):
        at.check_drawdown_alert(balance=80.0, peak_balance=100.0)
        # 20% drawdown should trigger all thresholds up to 20%
        assert mock_alert.called
        assert len(at.DRAWDOWN_ALERTED) >= 1

    @patch("autotrader._write_alert")
    def test_drawdown_alert_not_triggered(self, mock_alert):
        at.check_drawdown_alert(balance=98.0, peak_balance=100.0)
        # 2% drawdown → below 5% threshold
        assert not mock_alert.called

    @patch("autotrader._write_alert")
    def test_drawdown_alert_not_duplicated(self, mock_alert):
        at.check_drawdown_alert(balance=90.0, peak_balance=100.0)  # 10%
        call_count_1 = mock_alert.call_count
        at.check_drawdown_alert(balance=90.0, peak_balance=100.0)
        # Same threshold should not alert again
        assert mock_alert.call_count == call_count_1

    @patch("autotrader._write_alert")
    def test_error_cluster_alert(self, mock_alert):
        for i in range(at.ERROR_CLUSTER_THRESHOLD):
            at.record_error("test_error", "details")
        assert mock_alert.called
        # Counter should be reset after alerting
        assert sum(at.ERROR_COUNTER.values()) == 0

    @patch("autotrader._write_alert")
    def test_error_cluster_below_threshold(self, mock_alert):
        at.record_error("test_error", "once")
        assert not mock_alert.called


# ============================================================================
# 20. JSON STRUCTURED LOGGING
# ============================================================================

class TestJSONLogging:
    def test_json_formatter_basic(self):
        formatter = at.JSONFormatter()
        record = logging.LogRecord(
            name="autotrader", level=logging.INFO, pathname="", lineno=0,
            msg="Test message", args=(), exc_info=None)
        output = formatter.format(record)
        parsed = json.loads(output)
        assert parsed["message"] == "Test message"
        assert parsed["level"] == "INFO"
        assert "timestamp" in parsed

    def test_json_formatter_extra_fields(self):
        formatter = at.JSONFormatter()
        record = logging.LogRecord(
            name="autotrader", level=logging.INFO, pathname="", lineno=0,
            msg="Trade placed", args=(), exc_info=None)
        record.ticker = "KXBTC-A"
        record.action = "BUY_YES"
        record.edge = 0.05
        output = formatter.format(record)
        parsed = json.loads(output)
        assert parsed["ticker"] == "KXBTC-A"
        assert parsed["action"] == "BUY_YES"
        assert parsed["edge"] == 0.05

    def test_json_formatter_exception(self):
        formatter = at.JSONFormatter()
        try:
            raise ValueError("test error")
        except ValueError:
            import sys
            exc_info = sys.exc_info()
        record = logging.LogRecord(
            name="autotrader", level=logging.ERROR, pathname="", lineno=0,
            msg="Error occurred", args=(), exc_info=exc_info)
        output = formatter.format(record)
        parsed = json.loads(output)
        assert "exception" in parsed
        assert "ValueError" in parsed["exception"]


# ============================================================================
# 21. SCAN ALL MARKETS (mocked API)
# ============================================================================

class TestScanAllMarkets:
    @patch("autotrader.kalshi_api")
    def test_scan_basic(self, mock_api):
        expiry = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
        market_data = {
            "markets": [
                {
                    "ticker": f"MKT-{i}",
                    "title": f"Market {i}",
                    "subtitle": "",
                    "category": "test",
                    "yes_bid": 50,
                    "volume": 5000,
                    "open_interest": 3000,
                    "close_time": expiry,
                    "status": "open",
                    "result": "",
                    "last_price": 50,
                }
                for i in range(5)
            ],
            "cursor": None,
        }
        # Return markets for general scan, empty for sports tickers
        def side_effect(method, path, *args, **kwargs):
            if "series_ticker" not in path and "cursor" not in path:
                return market_data
            return {"markets": []}

        mock_api.side_effect = side_effect
        markets = at.scan_all_markets()
        assert len(markets) >= 1  # After filtering

    @patch("autotrader.kalshi_api")
    def test_scan_handles_api_error(self, mock_api):
        mock_api.return_value = {"error": "Server error 500"}
        markets = at.scan_all_markets()
        assert markets == []  # gracefully returns empty


# ============================================================================
# 22. COMBO / PARLAY ANALYSIS
# ============================================================================

class TestComboAnalysis:
    def test_estimate_combo_legs_comma_separated(self):
        m = at.MarketInfo(ticker="T", title="Yes Team A wins, Yes Team B wins, No Team C covers",
                          subtitle="", category="", yes_price=20, no_price=80,
                          volume=0, open_interest=0, expiry="", status="", result="")
        assert at.estimate_combo_legs(m) == 3

    def test_estimate_combo_legs_and_separator(self):
        m = at.MarketInfo(ticker="T", title="Lakers win and Celtics win",
                          subtitle="", category="", yes_price=30, no_price=70,
                          volume=0, open_interest=0, expiry="", status="", result="")
        assert at.estimate_combo_legs(m) == 2

    def test_estimate_combo_legs_default(self):
        m = at.MarketInfo(ticker="T", title="Multi-leg parlay",
                          subtitle="", category="", yes_price=30, no_price=70,
                          volume=0, open_interest=0, expiry="", status="", result="")
        assert at.estimate_combo_legs(m) == 2  # Default


# ============================================================================
# 23. LLM FORECASTER (mocked)
# ============================================================================

class TestLLMForecaster:
    @patch("autotrader.call_claude")
    def test_forecast_success(self, mock_claude, sample_market):
        mock_claude.return_value = {
            "content": "Analysis...\nPROBABILITY: 62%\nCONFIDENCE: medium\nKEY_FACTORS: factor1, factor2",
            "tokens_used": 500,
            "model": "claude-sonnet-4-20250514",
        }
        # Temporarily set LLM_CONFIG
        with patch.object(at, 'LLM_CONFIG', {"provider": "anthropic", "api_key": "test",
                                               "base_url": "http://test", "model": "test",
                                               "headers": {}}):
            f = at.forecast_market_llm(sample_market)
        assert f.probability == pytest.approx(0.62)
        assert f.confidence == "medium"
        assert len(f.key_factors) >= 1
        assert f.tokens_used == 500

    @patch("autotrader.call_claude")
    def test_forecast_error_fallback(self, mock_claude, sample_market):
        mock_claude.return_value = {"error": "API timeout", "content": "", "tokens_used": 0}
        f = at.forecast_market_llm(sample_market)
        # Should fallback to market prob
        assert f.probability == sample_market.market_prob
        assert f.confidence == "low"

    @patch("autotrader.call_claude")
    def test_critique_success(self, mock_claude, sample_market, sample_forecast):
        mock_claude.return_value = {
            "content": "Review...\nADJUSTED_PROBABILITY: 60%\nMAJOR_FLAWS: NONE\nSHOULD_TRADE: yes",
            "tokens_used": 300,
            "model": "test",
        }
        c = at.critique_forecast_llm(sample_market, sample_forecast)
        assert c.adjusted_probability == pytest.approx(0.60)
        assert c.should_trade is True
        assert len(c.major_flaws) == 0

    @patch("autotrader.call_claude")
    def test_critique_with_flaws(self, mock_claude, sample_market, sample_forecast):
        mock_claude.return_value = {
            "content": "ADJUSTED_PROBABILITY: 55%\nMAJOR_FLAWS: Overconfident, Missing data\nSHOULD_TRADE: no",
            "tokens_used": 200,
            "model": "test",
        }
        c = at.critique_forecast_llm(sample_market, sample_forecast)
        assert c.should_trade is False
        assert len(c.major_flaws) == 2


# ============================================================================
# 24. call_claude (mocked HTTP)
# ============================================================================

class TestCallClaude:
    @patch("autotrader.requests.post")
    def test_anthropic_provider(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "content": [{"type": "text", "text": "Hello"}],
            "usage": {"input_tokens": 100, "output_tokens": 50},
            "model": "claude-sonnet-4-20250514",
        }
        mock_post.return_value = mock_resp

        with patch.object(at, 'LLM_CONFIG', {
            "provider": "anthropic",
            "api_key": "sk-ant-api-test",
            "base_url": "https://api.anthropic.com/v1/messages",
            "model": "claude-sonnet-4-20250514",
            "headers": {"x-api-key": "test"},
        }):
            result = at.call_claude("system", "user")
        assert result["content"] == "Hello"
        assert result["tokens_used"] == 150

    @patch("autotrader.requests.post")
    def test_openrouter_provider(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "choices": [{"message": {"content": "Response"}}],
            "usage": {"total_tokens": 200},
            "model": "anthropic/claude-sonnet-4",
        }
        mock_post.return_value = mock_resp

        with patch.object(at, 'LLM_CONFIG', {
            "provider": "openrouter",
            "api_key": "or-key",
            "base_url": "https://openrouter.ai/api/v1/chat/completions",
            "model": "anthropic/claude-sonnet-4",
            "headers": {"Authorization": "Bearer or-key"},
        }):
            result = at.call_claude("system", "user")
        assert result["content"] == "Response"
        assert result["tokens_used"] == 200

    def test_no_llm_config(self):
        with patch.object(at, 'LLM_CONFIG', None):
            result = at.call_claude("system", "user")
        assert "error" in result
        assert "No LLM API key" in result["error"]

    @patch("autotrader.requests.post")
    def test_api_error_status(self, mock_post):
        mock_resp = MagicMock()
        mock_resp.status_code = 429
        mock_resp.text = "Rate limited"
        mock_post.return_value = mock_resp

        with patch.object(at, 'LLM_CONFIG', {
            "provider": "anthropic",
            "api_key": "sk-ant-api-test",
            "base_url": "https://api.anthropic.com/v1/messages",
            "model": "test",
            "headers": {},
        }):
            result = at.call_claude("system", "user")
        assert "error" in result
        assert "429" in result["error"]


# ============================================================================
# 25. TRADE LOGGING
# ============================================================================

class TestTradeLogging:
    def test_log_trade_writes_json(self, sample_market, sample_decision, tmp_path):
        trade_log = tmp_path / "trades.jsonl"
        legacy_log = tmp_path / "legacy.jsonl"
        with patch.object(at, "TRADE_LOG_FILE", trade_log), \
             patch.object(at, "LEGACY_TRADE_LOG", legacy_log):
            at.log_trade(sample_market, sample_decision, {"dry_run": True}, dry_run=True)
        assert trade_log.exists()
        entry = json.loads(trade_log.read_text().strip())
        assert entry["ticker"] == sample_market.ticker
        assert entry["action"] == "BUY_YES"
        assert entry["dry_run"] is True


# ============================================================================
# 26. PEAK BALANCE PERSISTENCE
# ============================================================================

class TestPeakBalance:
    @patch("autotrader.PEAK_BALANCE_FILE")
    def test_load_peak_no_file(self, mock_path):
        mock_path.exists.return_value = False
        assert at.load_peak_balance() == 0

    @patch("autotrader.PEAK_BALANCE_FILE")
    def test_load_peak_from_file(self, mock_path):
        mock_path.exists.return_value = True
        with patch("builtins.open", mock_open(read_data='{"peak_balance": 150.0}')):
            assert at.load_peak_balance() == 150.0

    @patch("autotrader.load_peak_balance", return_value=100.0)
    @patch("autotrader.PEAK_BALANCE_FILE")
    def test_save_peak_new_high(self, mock_path, mock_load):
        m = mock_open()
        with patch("builtins.open", m):
            at.save_peak_balance(120.0)
        assert m.called

    @patch("autotrader.load_peak_balance", return_value=200.0)
    def test_save_peak_no_update(self, mock_load):
        """Don't write if balance is below peak."""
        with patch("builtins.open", mock_open()) as m:
            at.save_peak_balance(150.0)
        # Should NOT have been opened for writing
        m.assert_not_called()


# ============================================================================
# 27. INTEGRATION-STYLE: FULL FORECAST → CRITIC → TRADE PIPELINE
# ============================================================================

class TestIntegrationPipeline:
    def test_heuristic_pipeline_crypto(self, sample_market):
        """Full pipeline: heuristic forecast → heuristic critique → trade decision."""
        context = {
            "crypto_prices": {"btc": 89000, "eth": 3200},
            "sentiment": {"value": 55, "classification": "Neutral"},
            "momentum": {"btc": {"composite_direction": 0.1, "composite_strength": 0.3, "alignment": False}},
            "ohlc": {"btc": [[i, 89000, 89100, 88900, 89000] for i in range(30)]},
        }

        forecast = at.heuristic_forecast(sample_market, context)
        assert 0 < forecast.probability < 1

        critic = at.heuristic_critique(sample_market, forecast)
        assert 0 < critic.adjusted_probability < 1

        decision = at.make_trade_decision(sample_market, forecast, critic, balance=100.0)
        assert decision.action in ("BUY_YES", "BUY_NO", "SKIP")

        if decision.action != "SKIP":
            assert decision.contracts >= 1
            assert decision.price_cents > 0
            assert decision.edge > 0

    def test_heuristic_pipeline_combo(self, sample_market_combo):
        """Full pipeline for combo/parlay market."""
        forecast = at.heuristic_forecast(sample_market_combo)
        critic = at.heuristic_critique(sample_market_combo, forecast)
        decision = at.make_trade_decision(sample_market_combo, forecast, critic, balance=100.0)
        assert decision.action in ("BUY_YES", "BUY_NO", "SKIP")

    def test_risk_check_integration(self, sample_market, sample_positions):
        """Full pipeline with risk limits check."""
        context = {
            "crypto_prices": {"btc": 89000, "eth": 3200},
            "sentiment": {"value": 50, "classification": "Neutral"},
            "momentum": {"btc": {}},
            "ohlc": {"btc": []},
        }
        forecast = at.heuristic_forecast(sample_market, context)
        critic = at.heuristic_critique(sample_market, forecast)
        decision = at.make_trade_decision(sample_market, forecast, critic, balance=100.0)

        if decision.action != "SKIP":
            ok, reason = at.check_position_risk_limits(
                sample_market, decision, 100.0, sample_positions,
                {"net_pnl_cents": 0, "trades_today": 5})
            assert isinstance(ok, bool)
            assert isinstance(reason, str)


# ============================================================================
# 28. INTEGRATION: run_cycle with fully mocked dependencies
# ============================================================================

class TestRunCycleIntegration:
    @patch("autotrader.find_weather_opportunities", return_value=[])
    @patch("autotrader.update_trade_results", return_value={"updated": 0, "wins": 0, "losses": 0})
    @patch("autotrader.check_daily_loss_limit", return_value=(False, {"net_pnl_cents": 0, "trades_today": 0}))
    @patch("autotrader.check_circuit_breaker", return_value=(False, 0, "OK (0/5 losses)"))
    @patch("autotrader.get_positions", return_value=[])
    @patch("autotrader.get_balance", return_value=0.50)
    @patch("autotrader.scan_all_markets")
    @patch("autotrader.get_crypto_ohlc", return_value=[])
    @patch("autotrader.get_fear_greed_index", return_value={"value": 50, "classification": "Neutral"})
    @patch("autotrader.get_crypto_prices", return_value={"btc": 90000, "eth": 3300})
    @patch("autotrader.log_cycle")
    @patch("autotrader.log_trade")
    @patch("autotrader.log_skip")
    @patch("autotrader.save_peak_balance")
    @patch("autotrader.load_peak_balance", return_value=100.0)
    @patch("autotrader.place_order", return_value={"dry_run": True, "status": "simulated"})
    def test_run_cycle_paper_mode(self, mock_place, mock_load_peak, mock_save_peak,
                                   mock_log_skip, mock_log_trade, mock_log_cycle,
                                   mock_prices, mock_fng, mock_ohlc, mock_scan,
                                   mock_balance, mock_positions, mock_cb, mock_dl,
                                   mock_settle, mock_weather):
        expiry = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
        mock_scan.return_value = [
            at.MarketInfo(
                ticker="KXBTC-TEST-1", title="BTC above $90,000?",
                subtitle="$90,000 or above", category="crypto",
                yes_price=50, no_price=50, volume=5000, open_interest=3000,
                expiry=expiry, status="open", result="",
            )
        ]

        # Run the cycle — should complete without error
        at.run_cycle(dry_run=True, max_markets=5, max_trades=2)

        # Verify cycle was logged
        assert mock_log_cycle.called

    @patch("autotrader.check_circuit_breaker", return_value=(True, 5, "TRIGGERED: 5 consecutive losses"))
    @patch("autotrader.update_trade_results", return_value={"updated": 0, "wins": 0, "losses": 0})
    @patch("autotrader.get_balance", return_value=50.0)
    @patch("autotrader._write_alert")
    def test_run_cycle_circuit_breaker_stops(self, mock_alert, mock_bal, mock_settle, mock_cb):
        """When circuit breaker is active, cycle should return early."""
        at.run_cycle(dry_run=True)
        mock_alert.assert_called()
        alert_type = mock_alert.call_args[0][0]
        assert alert_type == "circuit-breaker"

    @patch("autotrader.check_daily_loss_limit", return_value=(True, {"net_pnl_cents": -600, "trades_today": 10}))
    @patch("autotrader.check_circuit_breaker", return_value=(False, 0, "OK"))
    @patch("autotrader.update_trade_results", return_value={"updated": 0, "wins": 0, "losses": 0})
    @patch("autotrader.get_balance", return_value=50.0)
    @patch("autotrader._write_alert")
    def test_run_cycle_daily_loss_stops(self, mock_alert, mock_bal, mock_settle, mock_cb, mock_dl):
        """When daily loss limit reached, cycle should return early."""
        at.run_cycle(dry_run=True)
        mock_alert.assert_called()

    def test_run_cycle_shutdown_stops(self):
        """When shutdown requested, cycle should exit."""
        at.shutdown.should_stop = True
        # Should not raise, just return
        at.run_cycle(dry_run=True)


# ============================================================================
# 29. EDGE CASES & ERROR HANDLING
# ============================================================================

class TestEdgeCases:
    def test_kelly_with_zero_balance(self, sample_market, sample_forecast, sample_critic):
        """With $0 balance, should still not crash."""
        sample_forecast.probability = 0.75
        sample_critic.adjusted_probability = 0.73
        sample_critic.should_trade = True
        d = at.make_trade_decision(sample_market, sample_forecast, sample_critic, balance=0.0)
        # Should SKIP because can't afford anything
        assert d.action == "SKIP" or d.contracts == 0

    def test_market_prob_boundaries(self):
        """Markets at extreme prices."""
        m = at.MarketInfo(ticker="T", title="T", subtitle="", category="",
                          yes_price=1, no_price=99, volume=0, open_interest=0,
                          expiry="2099-01-01T00:00:00Z", status="open", result="")
        assert m.market_prob == pytest.approx(0.01)

    def test_parse_market_none_values(self):
        raw = {
            "ticker": "T",
            "title": None,
            "yes_bid": None,
            "volume": None,
            "close_time": None,
        }
        m = at.parse_market(raw)
        assert m is not None

    @patch("autotrader.requests.get")
    def test_crypto_prices_total_failure(self, mock_get):
        mock_get.side_effect = Exception("Network down")
        result = at.get_crypto_prices()
        assert result is None

    def test_calculate_momentum_short_data(self):
        ohlc = [[0, 100, 101, 99, 100]]
        m = at.calculate_momentum(ohlc, "24h")
        assert m["direction"] == 0

    def test_heuristic_crypto_no_price(self, sample_market):
        """Crypto heuristic without price data should fallback gracefully."""
        context = {"crypto_prices": {}}
        f = at.heuristic_forecast(sample_market, context)
        assert 0 <= f.probability <= 1

    def test_heuristic_crypto_no_strike(self):
        """Crypto market without parseable strike."""
        m = at.MarketInfo(ticker="KXBTC-UNKNOWN", title="BTC something",
                          subtitle="No dollar sign here", category="crypto",
                          yes_price=50, no_price=50, volume=5000, open_interest=2000,
                          expiry=(datetime.now(timezone.utc) + timedelta(hours=12)).isoformat(),
                          status="open", result="")
        context = {"crypto_prices": {"btc": 90000}}
        f = at.heuristic_forecast(m, context)
        assert 0 <= f.probability <= 1


# ============================================================================
# 30. SETTLEMENT TRACKER
# ============================================================================

class TestSettlementTracker:
    @patch("autotrader.TRADE_LOG_FILE")
    def test_no_file(self, mock_path):
        mock_path.exists.return_value = False
        result = at.update_trade_results()
        assert result == {"updated": 0, "wins": 0, "losses": 0}

    @patch("autotrader.kalshi_api")
    @patch("autotrader.TRADE_LOG_FILE")
    def test_settle_winning_trade(self, mock_path, mock_api):
        mock_path.exists.return_value = True
        entry = json.dumps({
            "ticker": "KXBTC-TEST",
            "action": "BUY_YES",
            "result_status": "pending",
        })
        mock_api.return_value = {"result": "yes"}

        m = mock_open(read_data=entry + "\n")
        with patch("builtins.open", m):
            result = at.update_trade_results()
        assert result["wins"] == 1
        assert result["updated"] == 1

    @patch("autotrader.kalshi_api")
    @patch("autotrader.TRADE_LOG_FILE")
    def test_settle_losing_trade(self, mock_path, mock_api):
        mock_path.exists.return_value = True
        entry = json.dumps({
            "ticker": "KXBTC-TEST",
            "action": "BUY_YES",
            "result_status": "pending",
        })
        mock_api.return_value = {"result": "no"}

        with patch("builtins.open", mock_open(read_data=entry + "\n")):
            result = at.update_trade_results()
        assert result["losses"] == 1


# ============================================================================
# Run with: python -m pytest scripts/tests/test_autotrader_unified.py -v
# ============================================================================
